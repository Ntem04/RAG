import os
from typing import List
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Poly - Tuteur ENSPD"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENV: str = os.getenv("ENV", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "poly-enspd-secret-key-2026-douala-rag-secure")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./poly.db")
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "mock")  # "mock" or "anthropic"
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    ANTHROPIC_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-3-haiku-20240307")
    DAILY_BUDGET_LIMIT_USD: float = float(os.getenv("DAILY_BUDGET_LIMIT_USD", "20.0"))
    
    # RAG Settings
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.45"))
    MAX_RETRIEVED_CHUNKS: int = 4
    
    # Emergency switch
    EMERGENCY_SHUTDOWN: bool = False
    MAINTENANCE_MESSAGE_FR: str = "Poly est temporairement en maintenance pour les Journées d'Orientation de l'ENSPD. Veuillez vous adresser directement au stand d'accueil."
    MAINTENANCE_MESSAGE_EN: str = "Poly is temporarily in maintenance mode for the ENSPD Orientation Days. Please visit the welcome desk."
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

settings = Settings()
