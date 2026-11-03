from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import SystemSetting
from app.core.security import require_roles

router = APIRouter(prefix="/settings", tags=["Paramètres Globaux"])

class WelcomeSettings(BaseModel):
    welcome_message_fr: str
    welcome_message_en: str
    tone: str

@router.get("/")
def get_settings(db: Session = Depends(get_db)):
    defaults = {
        "welcome_message_fr": "Bienvenue aux Journées d'Orientation de l'ENSPD ! Je suis Poly, ton tuteur d'orientation intelligent. Comment puis-je t'aider aujourd'hui ?",
        "welcome_message_en": "Welcome to ENSPD Orientation Days! I am Poly, your smart guidance tutor. How can I help you today?",
        "tone": "grand_frere"
    }
    settings_records = db.query(SystemSetting).all()
    for s in settings_records:
        if s.key in defaults:
            defaults[s.key] = s.value
    return defaults

@router.put("/")
def update_settings(
    settings_in: WelcomeSettings,
    payload: dict = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    updates = {
        "welcome_message_fr": settings_in.welcome_message_fr,
        "welcome_message_en": settings_in.welcome_message_en,
        "tone": settings_in.tone
    }
    for k, v in updates.items():
        record = db.query(SystemSetting).filter(SystemSetting.key == k).first()
        if record:
            record.value = v
        else:
            db.add(SystemSetting(key=k, value=v, description=f"Paramètre {k}"))
    db.commit()
    return {"status": "success", "message": "Paramètres mis à jour"}

