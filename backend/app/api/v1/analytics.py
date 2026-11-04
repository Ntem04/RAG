from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.db.models import (
    Conversation,
    ChatMessage,
    Feedback,
    DailyMetric,
    UnansweredQuestion,
    CallbackRequest,
    KnowledgeSheet,
    SystemSetting
)
from app.core.security import require_roles
from app.schemas.schemas import DashboardStats, AnalyticsTimelineResponse, TimelineDataPoint

router = APIRouter(prefix="/analytics", tags=["Statistiques & Supervision"])

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    payload: dict = Depends(require_roles(["admin", "contributeur", "lecteur"])),
    db: Session = Depends(get_db)
):
    total_convs = db.query(Conversation).count()
    total_msgs = db.query(ChatMessage).count()
    total_questions = db.query(ChatMessage).filter(ChatMessage.role == "user").count()
    
    # Calcul dynamique du taux de satisfaction basé UNIQUEMENT sur les pouces up/down réels
    pos_ratings = db.query(Feedback).filter(Feedback.rating == "up").count()
    neg_ratings = db.query(Feedback).filter(Feedback.rating == "down").count()
    total_ratings = pos_ratings + neg_ratings
    satisfaction_rate = round((pos_ratings / total_ratings * 100), 1) if total_ratings > 0 else 0.0

    unanswered_count = db.query(UnansweredQuestion).filter(UnansweredQuestion.status == "pending").count()
    pending_callbacks = db.query(CallbackRequest).filter(CallbackRequest.status == "pending").count()

    # Répartition par catégorie de fiches validées
    categories = (
        db.query(KnowledgeSheet.category, func.count(KnowledgeSheet.id))
        .filter(KnowledgeSheet.status == "validated")
        .group_by(KnowledgeSheet.category)
        .all()
    )
    category_list = [{"category": c[0], "count": c[1]} for c in categories]

    # État du mode d'urgence
    em_setting = db.query(SystemSetting).filter(SystemSetting.key == "emergency_shutdown").first()
    em_active = (em_setting.value.lower() == "true") if em_setting else False

    return DashboardStats(
        total_conversations=total_convs,
        total_messages=total_msgs,
        total_questions=total_questions,
        positive_ratings=pos_ratings,
        negative_ratings=neg_ratings,
        total_ratings=total_ratings,
        satisfaction_rate=satisfaction_rate,
        unanswered_count=unanswered_count,
        pending_callbacks_count=pending_callbacks,
        top_categories=category_list,
        emergency_active=em_active
    )

@router.get("/timeline", response_model=AnalyticsTimelineResponse)
def get_analytics_timeline(
    period: str = Query("7d", pattern="^(7d|30d|90d|180d|365d)$"),
    payload: dict = Depends(require_roles(["admin", "contributeur", "lecteur"])),
    db: Session = Depends(get_db)
):
    """
    Génère les points d'activité du diagramme à partir des VRAIES données de tests réels.
    Zéro courbe fictive pré-remplie.
    """
    now = datetime.utcnow()
    points: List[TimelineDataPoint] = []
    
    days_map = {0: "Lun", 1: "Mar", 2: "Mer", 3: "Jeu", 4: "Ven", 5: "Sam", 6: "Dim"}
    months_fr = ["", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"]

    # Taux de satisfaction global basé sur les votes du chat
    pos_ratings = db.query(Feedback).filter(Feedback.rating == "up").count()
    neg_ratings = db.query(Feedback).filter(Feedback.rating == "down").count()
    total_ratings = pos_ratings + neg_ratings
    global_sat = round((pos_ratings / total_ratings * 100), 1) if total_ratings > 0 else 0.0

    if period == "7d":
        # 7 derniers jours : 1 point par jour
        for i in range(7):
            d = now - timedelta(days=6 - i)
            day_name = days_map[d.weekday()]
            start_d = datetime(d.year, d.month, d.day, 0, 0, 0)
            end_d = start_d + timedelta(days=1)

            # Optimisation via table dénormalisée daily_metrics si disponible, sinon requête DB indexée
            date_str = d.strftime("%Y-%m-%d")
            metric = db.query(DailyMetric).filter(DailyMetric.date == date_str).first()

            if metric:
                c_val = metric.conversations_count
                m_val = metric.messages_count
                sat_val = metric.satisfaction_rate if (metric.positive_ratings + metric.negative_ratings) > 0 else (global_sat if c_val > 0 else 0.0)
            else:
                c_val = db.query(Conversation).filter(Conversation.created_at >= start_d, Conversation.created_at < end_d).count()
                m_val = db.query(ChatMessage).filter(ChatMessage.created_at >= start_d, ChatMessage.created_at < end_d).count()
                pos_d = db.query(Feedback).filter(Feedback.rating == "up", Feedback.created_at >= start_d, Feedback.created_at < end_d).count()
                neg_d = db.query(Feedback).filter(Feedback.rating == "down", Feedback.created_at >= start_d, Feedback.created_at < end_d).count()
                tot_d = pos_d + neg_d
                sat_val = round((pos_d / tot_d * 100), 1) if tot_d > 0 else (global_sat if c_val > 0 else 0.0)

            points.append(TimelineDataPoint(
                date=f"{day_name}",
                label=f"{day_name} {d.day:02d}/{d.month:02d}",
                conversations=c_val,
                messages=m_val,
                satisfaction=sat_val
            ))

    elif period == "30d":
        # 30 jours : 10 intervalles de 3 jours
        for step in range(10):
            d = now - timedelta(days=27 - (step * 3))
            start_d = datetime(d.year, d.month, d.day, 0, 0, 0) - timedelta(days=3)
            end_d = start_d + timedelta(days=3)

            c_val = db.query(Conversation).filter(Conversation.created_at >= start_d, Conversation.created_at < end_d).count()
            m_val = db.query(ChatMessage).filter(ChatMessage.created_at >= start_d, ChatMessage.created_at < end_d).count()
            
            points.append(TimelineDataPoint(
                date=f"{d.day:02d} {months_fr[d.month]}",
                label=f"Période du {start_d.day:02d} au {d.day:02d} {months_fr[d.month]}",
                conversations=c_val,
                messages=m_val,
                satisfaction=global_sat if c_val > 0 else 0.0
            ))

    elif period == "90d":
        # 3 mois : 12 points hebdomadaires
        for w in range(12):
            d = now - timedelta(weeks=11 - w)
            start_d = d - timedelta(days=7)
            end_d = d
            c_val = db.query(Conversation).filter(Conversation.created_at >= start_d, Conversation.created_at < end_d).count()
            m_val = db.query(ChatMessage).filter(ChatMessage.created_at >= start_d, ChatMessage.created_at < end_d).count()

            points.append(TimelineDataPoint(
                date=f"S{w + 1}",
                label=f"Semaine {w + 1} ({d.day:02d} {months_fr[d.month]})",
                conversations=c_val,
                messages=m_val,
                satisfaction=global_sat if c_val > 0 else 0.0
            ))

    elif period == "180d":
        # 6 mois : 6 points mensuels
        for m in range(6):
            approx_d = now - timedelta(days=(5 - m) * 30)
            start_d = datetime(approx_d.year, approx_d.month, 1)
            end_d = datetime(approx_d.year + 1, 1, 1) if approx_d.month == 12 else datetime(approx_d.year, approx_d.month + 1, 1)
            
            c_val = db.query(Conversation).filter(Conversation.created_at >= start_d, Conversation.created_at < end_d).count()
            m_val = db.query(ChatMessage).filter(ChatMessage.created_at >= start_d, ChatMessage.created_at < end_d).count()

            points.append(TimelineDataPoint(
                date=f"{months_fr[approx_d.month]}",
                label=f"{months_fr[approx_d.month]} {approx_d.year}",
                conversations=c_val,
                messages=m_val,
                satisfaction=global_sat if c_val > 0 else 0.0
            ))

    else: # 365d (1 an)
        # 12 points mensuels réels
        for m in range(12):
            approx_d = now - timedelta(days=(11 - m) * 30)
            start_d = datetime(approx_d.year, approx_d.month, 1)
            end_d = datetime(approx_d.year + 1, 1, 1) if approx_d.month == 12 else datetime(approx_d.year, approx_d.month + 1, 1)
            
            c_val = db.query(Conversation).filter(Conversation.created_at >= start_d, Conversation.created_at < end_d).count()
            m_val = db.query(ChatMessage).filter(ChatMessage.created_at >= start_d, ChatMessage.created_at < end_d).count()

            points.append(TimelineDataPoint(
                date=f"{months_fr[approx_d.month]}",
                label=f"{months_fr[approx_d.month]} {approx_d.year}",
                conversations=c_val,
                messages=m_val,
                satisfaction=global_sat if c_val > 0 else 0.0
            ))

    total_in_period = sum(p.conversations for p in points)

    # Calcul réel du taux de croissance
    half = len(points) // 2
    first_half = sum(p.conversations for p in points[:half])
    second_half = sum(p.conversations for p in points[half:])
    if first_half == 0 and second_half > 0:
        growth = 100.0
    elif first_half > 0:
        growth = round(((second_half - first_half) / first_half) * 100, 1)
    else:
        growth = 0.0

    return AnalyticsTimelineResponse(
        period=period,
        total_in_period=total_in_period,
        growth_rate=growth,
        data=points
    )

@router.get("/unanswered")
def get_unanswered_questions(
    status: Optional[str] = Query(None, description="pending, reviewed, sheet_created"),
    payload: dict = Depends(require_roles(["admin", "contributeur", "lecteur"])),
    db: Session = Depends(get_db)
):
    query = db.query(UnansweredQuestion)
    if status:
        query = query.filter(UnansweredQuestion.status == status)
    return query.order_by(UnansweredQuestion.created_at.desc()).all()

@router.patch("/unanswered/{item_id}/status")
def update_unanswered_status(
    item_id: str,
    new_status: str = Query(..., pattern="^(pending|reviewed|sheet_created)$"),
    payload: dict = Depends(require_roles(["admin", "contributeur"])),
    db: Session = Depends(get_db)
):
    item = db.query(UnansweredQuestion).filter(UnansweredQuestion.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Question introuvable")
    item.status = new_status
    db.commit()
    return {"status": "success", "message": f"Statut mis à jour vers {new_status}"}
