from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.db.models import Conversation, ChatMessage, Feedback, DailyMetric, SystemSetting
from app.core.rate_limit import rate_limiter
from app.schemas.schemas import ChatRequest, ChatResponse, FeedbackCreate
from app.rag.engine import rag_engine

router = APIRouter(prefix="/chat", tags=["Chat Conversationnel"])

def _update_daily_chat_metrics(db: Session):
    """Met à jour les agrégats dénormalisés pour la date du jour (OLAP)."""
    try:
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        daily = db.query(DailyMetric).filter(DailyMetric.date == today_str).first()
        if not daily:
            daily = DailyMetric(date=today_str)
            db.add(daily)
        
        # Compter les conversations et messages réels du jour
        daily.conversations_count = db.query(Conversation).count()
        daily.messages_count = db.query(ChatMessage).count()
        daily.questions_count = db.query(ChatMessage).filter(ChatMessage.role == "user").count()
        daily.updated_at = datetime.utcnow()
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Warning] Aggregation metric update skipped: {e}")

@router.post("/message", response_model=ChatResponse)
def send_chat_message(req: ChatRequest, request: Request, db: Session = Depends(get_db)):
    # Rate limit check
    rate_limiter.check_rate_limit(request, identifier=req.session_id)
    
    # Check emergency shutdown switch (EA-10)
    emergency_setting = db.query(SystemSetting).filter(SystemSetting.key == "emergency_shutdown").first()
    if emergency_setting and emergency_setting.value.lower() == "true":
        msg = (
            "Poly est actuellement en maintenance pour les Journées d'Orientation de l'ENSPD. "
            "Veuillez vous adresser au stand d'accueil situé au Bâtiment A pour toute information."
            if req.language != "en" else
            "Poly is currently in maintenance mode for the ENSPD Orientation Days. "
            "Please visit the welcome desk at Building A for all inquiries."
        )
        return ChatResponse(
            message_id="maintenance",
            reply=msg,
            sources=[],
            suggestions=[],
            relevance_score=1.0,
            latency_ms=10,
            intent="emergency_maintenance",
            language=req.language or "fr"
        )

    # Process question with strict 9-step RAG
    response = rag_engine.process_question(
        db=db,
        session_id=req.session_id,
        message=req.message,
        user_lang=req.language or "fr",
        profile=req.profile or "visiteur",
        channel=req.channel or "pwa"
    )

    # Met à jour la table analytique dénormalisée
    _update_daily_chat_metrics(db)

    return response

@router.get("/history/{session_id}")
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.session_id == session_id).first()
    if not conv:
        return {"session_id": session_id, "messages": []}
    
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conv.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    
    result = []
    for m in messages:
        fb = db.query(Feedback).filter(Feedback.message_id == m.id).first()
        result.append({
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "sources": m.sheets_used or [],
            "relevance_score": m.relevance_score,
            "latency_ms": m.latency_ms,
            "created_at": m.created_at.isoformat(),
            "rating": fb.rating if fb else None
        })
    return {"session_id": session_id, "messages": result}

@router.post("/feedback")
def submit_feedback(fb_data: FeedbackCreate, db: Session = Depends(get_db)):
    """
    Enregistre le vote de satisfaction (pouce 'up' ou 'down') soumis dans le chat.
    Met à jour instantanément la table normalisée 'feedbacks' et recalcule le % de satisfaction
    dans la table dénormalisée 'daily_metrics'.
    """
    message = db.query(ChatMessage).filter(ChatMessage.id == fb_data.message_id).first()
    target_msg_id = message.id if message else None

    # Vérifier si cet avis a déjà été soumis pour éviter les doublons
    existing_fb = db.query(Feedback).filter(Feedback.message_id == target_msg_id).first() if target_msg_id else None
    if existing_fb:
        existing_fb.rating = fb_data.rating
        existing_fb.comment = fb_data.comment
    else:
        new_fb = Feedback(
            message_id=target_msg_id,
            rating=fb_data.rating,
            comment=fb_data.comment
        )
        db.add(new_fb)
    
    db.commit()

    # Recalculer les métriques dénormalisées
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    daily = db.query(DailyMetric).filter(DailyMetric.date == today_str).first()
    if not daily:
        daily = DailyMetric(date=today_str)
        db.add(daily)

    pos = db.query(Feedback).filter(Feedback.rating == "up").count()
    neg = db.query(Feedback).filter(Feedback.rating == "down").count()
    total_ratings = pos + neg
    daily.positive_ratings = pos
    daily.negative_ratings = neg
    daily.satisfaction_rate = round((pos / total_ratings * 100), 1) if total_ratings > 0 else 0.0
    daily.updated_at = datetime.utcnow()
    db.commit()

    return {
        "status": "success",
        "message": "Avis enregistré avec succès",
        "satisfaction_rate": daily.satisfaction_rate,
        "positive_ratings": pos,
        "negative_ratings": neg,
        "total_ratings": total_ratings
    }
