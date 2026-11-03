from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Conversation, ChatMessage, Feedback, SystemSetting
from app.core.rate_limit import rate_limiter
from app.schemas.schemas import ChatRequest, ChatResponse, FeedbackCreate
from app.rag.engine import rag_engine

router = APIRouter(prefix="/chat", tags=["Chat Conversationnel"])

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
    message = db.query(ChatMessage).filter(ChatMessage.id == fb_data.message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message introuvable")

    existing_fb = db.query(Feedback).filter(Feedback.message_id == fb_data.message_id).first()
    if existing_fb:
        existing_fb.rating = fb_data.rating
        existing_fb.comment = fb_data.comment
    else:
        new_fb = Feedback(
            message_id=fb_data.message_id,
            rating=fb_data.rating,
            comment=fb_data.comment
        )
        db.add(new_fb)
    
    db.commit()
    return {"status": "success", "message": "Avis enregistré avec succès"}
