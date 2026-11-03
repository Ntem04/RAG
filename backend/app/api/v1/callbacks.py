from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import CallbackRequest
from app.core.security import require_roles
from app.schemas.schemas import CallbackCreate, CallbackResponse

router = APIRouter(prefix="/callbacks", tags=["Demandes de Rappel"])

@router.post("/", response_model=CallbackResponse)
def submit_callback(cb_in: CallbackCreate, db: Session = Depends(get_db)):
    # Mandatory consent verification ENF-08
    if not cb_in.consent_given:
        raise HTTPException(
            status_code=400,
            detail="Le consentement explicite est requis pour enregistrer une demande de rappel."
        )

    callback = CallbackRequest(
        visitor_name=cb_in.visitor_name,
        contact_info=cb_in.contact_info,
        consent_given=cb_in.consent_given,
        parental_consent_confirmed=cb_in.parental_consent_confirmed or False,
        interested_field=cb_in.interested_field,
        profile=cb_in.profile or "eleve",
        status="pending"
    )
    db.add(callback)
    db.commit()
    db.refresh(callback)
    return callback

@router.get("/", response_model=List[CallbackResponse])
def list_callbacks(
    status: Optional[str] = Query(None, description="pending, in_progress, resolved"),
    payload: dict = Depends(require_roles(["admin", "contributeur", "lecteur"])),
    db: Session = Depends(get_db)
):
    query = db.query(CallbackRequest)
    if status:
        query = query.filter(CallbackRequest.status == status)
    return query.order_by(CallbackRequest.created_at.desc()).all()

@router.patch("/{callback_id}/status")
def update_callback_status(
    callback_id: str,
    new_status: str = Query(..., pattern="^(pending|in_progress|resolved)$"),
    notes: Optional[str] = None,
    payload: dict = Depends(require_roles(["admin", "contributeur"])),
    db: Session = Depends(get_db)
):
    cb = db.query(CallbackRequest).filter(CallbackRequest.id == callback_id).first()
    if not cb:
        raise HTTPException(status_code=404, detail="Demande introuvable")

    cb.status = new_status
    if notes is not None:
        cb.notes = notes
    db.commit()
    return {"status": "success", "message": f"Statut mis à jour vers {new_status}"}

