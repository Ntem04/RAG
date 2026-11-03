import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Float, DateTime, ForeignKey, Enum, JSON
)
from sqlalchemy.orm import relationship
from app.db.database import Base

class UserAdmin(Base):
    __tablename__ = "users_admin"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="lecteur")  # admin, contributeur, lecteur
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class KnowledgeSheet(Base):
    __tablename__ = "knowledge_sheets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique=True, nullable=False, index=True) # e.g. FIL-GI-001
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False, index=True) # filiere, admission, vie_etudiante, jour_j, faq, frais
    language = Column(String(5), nullable=False, default="fr", index=True) # fr, en
    content = Column(Text, nullable=False)
    official_source = Column(String(200), nullable=False)
    sensitivity = Column(String(20), nullable=False, default="normal") # normal, critical
    validated_by = Column(String(100), nullable=True)
    validated_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    version = Column(Integer, default=1)
    status = Column(String(20), default="draft", index=True) # draft, validated, archived
    embedding_json = Column(Text, nullable=True) # serialized vector for cross-db compatibility
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    versions = relationship("SheetVersion", back_populates="sheet", cascade="all, delete-orphan")

class SheetVersion(Base):
    __tablename__ = "sheet_versions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sheet_id = Column(String, ForeignKey("knowledge_sheets.id", ondelete="CASCADE"), nullable=False)
    version_num = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    changed_by = Column(String(100), nullable=False)
    change_summary = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sheet = relationship("KnowledgeSheet", back_populates="versions")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(100), index=True, nullable=False)
    language = Column(String(5), default="fr")
    declared_profile = Column(String(50), default="visiteur") # eleve, bachelier, parent, enseignant, visiteur
    channel = Column(String(20), default="pwa") # pwa, kiosk, qr
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False) # user, assistant, system
    content = Column(Text, nullable=False)
    sheets_used = Column(JSON, nullable=True) # List of {code, title, source, validated_at}
    relevance_score = Column(Float, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
    feedback = relationship("Feedback", uselist=False, back_populates="message")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    message_id = Column(String, ForeignKey("chat_messages.id", ondelete="CASCADE"), nullable=False, unique=True)
    rating = Column(String(10), nullable=False) # up, down
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    message = relationship("ChatMessage", back_populates="feedback")

class UnansweredQuestion(Base):
    __tablename__ = "unanswered_questions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    message_id = Column(String, nullable=True)
    user_text = Column(Text, nullable=False)
    reason = Column(String(50), nullable=False) # below_threshold, injection_refused, negative_feedback, missing_sheet
    suggested_action = Column(String(255), nullable=True)
    status = Column(String(20), default="pending") # pending, reviewed, sheet_created
    created_at = Column(DateTime, default=datetime.utcnow)

class CallbackRequest(Base):
    __tablename__ = "callback_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    visitor_name = Column(String(100), nullable=False)
    contact_info = Column(String(100), nullable=False)
    consent_given = Column(Boolean, nullable=False, default=False)
    parental_consent_confirmed = Column(Boolean, default=False)
    interested_field = Column(String(100), nullable=True)
    profile = Column(String(50), default="eleve")
    status = Column(String(20), default="pending") # pending, in_progress, resolved
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(50), primary_key=True)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

