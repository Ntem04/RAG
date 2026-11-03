from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field

# Auth schemas
class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool

# Chat schemas
class ChatRequest(BaseModel):
    session_id: str = Field(..., description="Identifiant unique de session anonyme")
    message: str = Field(..., max_length=1000, description="Question du visiteur")
    language: Optional[str] = Field("fr", description="fr ou en")
    profile: Optional[str] = Field("visiteur", description="eleve, bachelier, parent, enseignant, visiteur")
    channel: Optional[str] = Field("pwa", description="pwa, kiosk, qr")

class SheetSource(BaseModel):
    code: str
    title: str
    official_source: str
    validated_at: Optional[str] = None
    sensitivity: str = "normal"

class ChatResponse(BaseModel):
    message_id: str
    reply: str
    sources: List[SheetSource] = []
    suggestions: List[str] = []
    relevance_score: float
    latency_ms: int
    intent: str
    language: str

# Feedback schema
class FeedbackCreate(BaseModel):
    message_id: str
    rating: str = Field(..., pattern="^(up|down)$")
    comment: Optional[str] = None

# Callback request schema
class CallbackCreate(BaseModel):
    visitor_name: str = Field(..., min_length=2, max_length=100)
    contact_info: str = Field(..., min_length=6, max_length=100)
    consent_given: bool = Field(..., description="Consentement explicite obligatoire")
    parental_consent_confirmed: Optional[bool] = False
    interested_field: Optional[str] = None
    profile: Optional[str] = "eleve"

class CallbackResponse(BaseModel):
    id: str
    visitor_name: str
    contact_info: str
    consent_given: bool
    parental_consent_confirmed: bool
    interested_field: Optional[str]
    profile: str
    status: str
    notes: Optional[str]
    created_at: datetime

# Knowledge Sheet schemas
class KnowledgeSheetBase(BaseModel):
    code: str
    title: str
    category: str
    language: str = "fr"
    content: str
    official_source: str
    sensitivity: str = "normal"
    expires_at: Optional[datetime] = None

class KnowledgeSheetCreate(KnowledgeSheetBase):
    pass

class KnowledgeSheetUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    language: Optional[str] = None
    content: Optional[str] = None
    official_source: Optional[str] = None
    sensitivity: Optional[str] = None
    expires_at: Optional[datetime] = None
    status: Optional[str] = None
    change_summary: Optional[str] = None

class KnowledgeSheetResponse(KnowledgeSheetBase):
    id: str
    version: int
    status: str
    validated_by: Optional[str] = None
    validated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

# Orientation wizard
class OrientationStepAnswer(BaseModel):
    question_id: int
    selected_option: str

class OrientationRequest(BaseModel):
    answers: List[OrientationStepAnswer]
    language: str = "fr"

class RecommendedTrack(BaseModel):
    field_code: str
    title: str
    match_score: int
    justification: str
    key_subjects: List[str]
    careers: List[str]

class OrientationResult(BaseModel):
    recommended_tracks: List[RecommendedTrack]
    summary_advice: str

# Emergency Switch
class EmergencyStatus(BaseModel):
    is_active: bool
    maintenance_message_fr: str
    maintenance_message_en: str

# Stats / Dashboard
class DashboardStats(BaseModel):
    total_conversations: int
    total_messages: int
    positive_ratings: int
    negative_ratings: int
    satisfaction_rate: float
    unanswered_count: int
    pending_callbacks_count: int
    top_categories: List[dict]
    emergency_active: bool

