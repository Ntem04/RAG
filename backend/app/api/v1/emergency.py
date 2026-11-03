from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import SystemSetting
from app.core.config import settings
from app.core.security import require_roles
from app.schemas.schemas import EmergencyStatus

router = APIRouter(prefix="/emergency", tags=["Interrupteur d'Urgence"])

@router.get("/status", response_model=EmergencyStatus)
def get_emergency_status(db: Session = Depends(get_db)):
    setting = db.query(SystemSetting).filter(SystemSetting.key == "emergency_shutdown").first()
    is_active = (setting.value.lower() == "true") if setting else False
    return EmergencyStatus(
        is_active=is_active,
        maintenance_message_fr=settings.MAINTENANCE_MESSAGE_FR,
        maintenance_message_en=settings.MAINTENANCE_MESSAGE_EN
    )

@router.post("/toggle", response_model=EmergencyStatus)
def toggle_emergency(
    active: bool = Query(..., description="Activer ou désactiver l'interrupteur d'urgence"),
    payload: dict = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    setting = db.query(SystemSetting).filter(SystemSetting.key == "emergency_shutdown").first()
    if not setting:
        setting = SystemSetting(
            key="emergency_shutdown",
            value=str(active).lower(),
            description="Interrupteur d'urgence EA-10"
        )
        db.add(setting)
    else:
        setting.value = str(active).lower()
    
    db.commit()
    return EmergencyStatus(
        is_active=active,
        maintenance_message_fr=settings.MAINTENANCE_MESSAGE_FR,
        maintenance_message_en=settings.MAINTENANCE_MESSAGE_EN
    )

