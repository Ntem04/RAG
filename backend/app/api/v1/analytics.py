from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.db.models import Conversation, ChatMessage, Feedback, UnansweredQuestion, CallbackRequest, KnowledgeSheet, SystemSetting
from app.core.security import require_roles
from app.schemas.schemas import DashboardStats

router = APIRouter(prefix="/analytics", tags=["Statistiques & Supervision"])

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    payload: dict = Depends(require_roles(["admin", "contributeur", "lecteur"])),
    db: Session = Depends(get_db)
):
    total_convs = db.query(Conversation).count()
    total_msgs = db.query(ChatMessage).filter(ChatMessage.role == "assistant").count()
    
    pos_ratings = db.query(Feedback).filter(Feedback.rating == "up").count()
    neg_ratings = db.query(Feedback).filter(Feedback.rating == "down").count()
    total_ratings = pos_ratings + neg_ratings
    satisfaction_rate = round((pos_ratings / total_ratings * 100), 1) if total_ratings > 0 else 100.0

    unanswered_count = db.query(UnansweredQuestion).filter(UnansweredQuestion.status == "pending").count()
    pending_callbacks = db.query(CallbackRequest).filter(CallbackRequest.status == "pending").count()

    # Category distribution
    categories = (
        db.query(KnowledgeSheet.category, func.count(KnowledgeSheet.id))
        .group_by(KnowledgeSheet.category)
        .all()
    )
    category_list = [{"category": c[0], "count": c[1]} for c in categories]

    # Emergency state
    em_setting = db.query(SystemSetting).filter(SystemSetting.key == "emergency_shutdown").first()
    em_active = (em_setting.value.lower() == "true") if em_setting else False

    return DashboardStats(
        total_conversations=total_convs,
        total_messages=total_msgs,
        positive_ratings=pos_ratings,
        negative_ratings=neg_ratings,
        satisfaction_rate=satisfaction_rate,
        unanswered_count=unanswered_count,
        pending_callbacks_count=pending_callbacks,
        top_categories=category_list,
        emergency_active=em_active
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

