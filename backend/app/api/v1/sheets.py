from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import KnowledgeSheet, SheetVersion, UserAdmin
from app.core.security import get_current_user_payload, require_roles
from app.schemas.schemas import (
    KnowledgeSheetCreate, KnowledgeSheetUpdate, KnowledgeSheetResponse
)
from app.rag.embeddings import embedding_service

router = APIRouter(prefix="/sheets", tags=["Fiches de Connaissance (Back-office)"])

@router.get("/", response_model=List[KnowledgeSheetResponse])
def list_sheets(
    status: Optional[str] = Query(None, description="draft, validated, archived"),
    category: Optional[str] = None,
    language: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(KnowledgeSheet)
    if status:
        query = query.filter(KnowledgeSheet.status == status)
    if category:
        query = query.filter(KnowledgeSheet.category == category)
    if language:
        query = query.filter(KnowledgeSheet.language == language)
    return query.order_by(KnowledgeSheet.created_at.desc()).all()

@router.get("/{sheet_id}", response_model=KnowledgeSheetResponse)
def get_sheet(sheet_id: str, db: Session = Depends(get_db)):
    sheet = db.query(KnowledgeSheet).filter(KnowledgeSheet.id == sheet_id).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Fiche introuvable")
    return sheet

@router.post("/", response_model=KnowledgeSheetResponse)
def create_sheet(
    sheet_in: KnowledgeSheetCreate,
    payload: dict = Depends(require_roles(["admin", "contributeur"])),
    db: Session = Depends(get_db)
):
    # Check duplicate code
    if db.query(KnowledgeSheet).filter(KnowledgeSheet.code == sheet_in.code).first():
        raise HTTPException(status_code=400, detail="Une fiche avec ce code existe déjà")

    vec = embedding_service.embed_text(sheet_in.content + " " + sheet_in.title)
    vec_json = embedding_service.serialize_vector(vec)

    sheet = KnowledgeSheet(
        code=sheet_in.code,
        title=sheet_in.title,
        category=sheet_in.category,
        language=sheet_in.language,
        content=sheet_in.content,
        official_source=sheet_in.official_source,
        sensitivity=sheet_in.sensitivity,
        expires_at=sheet_in.expires_at,
        status="draft", # Newly created sheets start in draft (EA-03 workflow)
        version=1,
        embedding_json=vec_json
    )
    db.add(sheet)
    db.commit()
    db.refresh(sheet)

    # Record initial version
    version = SheetVersion(
        sheet_id=sheet.id,
        version_num=1,
        title=sheet.title,
        content=sheet.content,
        changed_by=payload.get("sub", "unknown"),
        change_summary="Création initiale de la fiche"
    )
    db.add(version)
    db.commit()

    return sheet

@router.put("/{sheet_id}", response_model=KnowledgeSheetResponse)
def update_sheet(
    sheet_id: str,
    sheet_in: KnowledgeSheetUpdate,
    payload: dict = Depends(require_roles(["admin", "contributeur"])),
    db: Session = Depends(get_db)
):
    sheet = db.query(KnowledgeSheet).filter(KnowledgeSheet.id == sheet_id).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Fiche introuvable")

    if sheet_in.title is not None:
        sheet.title = sheet_in.title
    if sheet_in.category is not None:
        sheet.category = sheet_in.category
    if sheet_in.language is not None:
        sheet.language = sheet_in.language
    if sheet_in.content is not None:
        sheet.content = sheet_in.content
        # Re-compute embedding
        vec = embedding_service.embed_text(sheet.content + " " + sheet.title)
        sheet.embedding_json = embedding_service.serialize_vector(vec)
    if sheet_in.official_source is not None:
        sheet.official_source = sheet_in.official_source
    if sheet_in.sensitivity is not None:
        sheet.sensitivity = sheet_in.sensitivity
    if sheet_in.expires_at is not None:
        sheet.expires_at = sheet_in.expires_at
    if sheet_in.status is not None:
        sheet.status = sheet_in.status

    sheet.version += 1
    sheet.updated_at = datetime.utcnow()

    # Log new version
    version = SheetVersion(
        sheet_id=sheet.id,
        version_num=sheet.version,
        title=sheet.title,
        content=sheet.content,
        changed_by=payload.get("sub", "unknown"),
        change_summary=sheet_in.change_summary or "Mise à jour des contenus"
    )
    db.add(version)
    db.commit()
    db.refresh(sheet)
    return sheet

@router.post("/{sheet_id}/validate", response_model=KnowledgeSheetResponse)
def validate_sheet(
    sheet_id: str,
    payload: dict = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    """Workflow de validation EA-03 : Seul un admin/référent peut valider une fiche."""
    sheet = db.query(KnowledgeSheet).filter(KnowledgeSheet.id == sheet_id).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Fiche introuvable")

    user_id = payload.get("sub")
    user = db.query(UserAdmin).filter(UserAdmin.id == user_id).first()
    validator_name = user.full_name if user else "Direction ENSPD"

    sheet.status = "validated"
    sheet.validated_by = validator_name
    sheet.validated_at = datetime.utcnow()
    db.commit()
    db.refresh(sheet)
    return sheet

@router.delete("/{sheet_id}")
def delete_sheet(
    sheet_id: str,
    payload: dict = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    sheet = db.query(KnowledgeSheet).filter(KnowledgeSheet.id == sheet_id).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Fiche introuvable")

    db.delete(sheet)
    db.commit()
    return {"status": "success", "message": "Fiche supprimée avec succès"}

