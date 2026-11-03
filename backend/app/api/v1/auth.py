from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import UserAdmin
from app.core.security import verify_password, create_access_token, get_current_user_payload
from app.schemas.schemas import UserLogin, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentification"])

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(UserAdmin).filter(UserAdmin.username == credentials.username).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiant ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Compte d'accès désactivé")

    token = create_access_token(subject=user.id, role=user.role)
    return Token(access_token=token, role=user.role, username=user.username)

@router.get("/me", response_model=UserResponse)
def get_me(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user_id = payload.get("sub")
    user = db.query(UserAdmin).filter(UserAdmin.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active
    )

