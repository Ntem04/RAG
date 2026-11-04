import sys
import os
import random
from datetime import datetime, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import engine, Base, SessionLocal
from app.db.models import (
    UserAdmin,
    KnowledgeSheet,
    Conversation,
    ChatMessage,
    Feedback,
    UnansweredQuestion,
    CallbackRequest,
    SystemSetting
)
from app.core.security import hash_password
from app.db.seed_data import seed_database, OFFICIAL_ENSPD_SHEETS

def reinit_and_seed():
    print("[1/3] Purging and recreating database schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("[2/3] Seeding base data, admin users, official sheets...")
        seed_database(db)
        
        # Add rich timeline data across the last 365 days for the diagram
        print("Generating timeline history across 365 days for analytics diagram...")
        now = datetime.utcnow()
        conversations = []
        messages = []
        feedbacks = []
        
        # Generate 180 realistic conversations distributed across the year
        # with higher density recently (growth curve)
        for i in range(180):
            # Days ago: exponential towards recent days
            days_ago = int((random.random() ** 1.8) * 360)
            conv_time = now - timedelta(days=days_ago, hours=random.randint(1, 23), minutes=random.randint(0, 59))
            
            c = Conversation(
                session_id=f"poly-hist-{i}-{random.randint(1000, 9999)}",
                declared_profile=random.choice(["eleve", "etudiant", "parent"]),
                channel=random.choice(["kiosk", "pwa", "pwa"]),
                language=random.choice(["fr", "fr", "fr", "en"]),
                created_at=conv_time,
                last_active_at=conv_time + timedelta(minutes=random.randint(3, 15))
            )
            conversations.append(c)
            db.add(c)
            db.flush()
            
            # User message
            m_user = ChatMessage(
                conversation_id=c.id,
                role="user",
                content=f"Question d'orientation {i}",
                created_at=conv_time
            )
            # Assistant message
            m_asst = ChatMessage(
                conversation_id=c.id,
                role="assistant",
                content=f"Réponse détaillée officielle ENSPD {i}",
                relevance_score=random.uniform(0.91, 0.99),
                latency_ms=random.randint(80, 240),
                created_at=conv_time + timedelta(seconds=2)
            )
            db.add_all([m_user, m_asst])
            db.flush()
            
            if random.random() < 0.35:
                fb = Feedback(
                    message_id=m_asst.id,
                    rating="up" if random.random() < 0.94 else "down",
                    comment="Très clair et rapide" if random.random() < 0.5 else None,
                    created_at=conv_time + timedelta(seconds=10)
                )
                db.add(fb)
        
        # Add a few unanswered questions
        unanswered = [
            UnansweredQuestion(
                user_text="Quels sont les aménagements spécifiques pour les étudiants sportifs de haut niveau ?",
                reason="missing_sheet",
                suggested_action="Créer une fiche sport-études",
                status="pending",
                created_at=now - timedelta(days=2)
            ),
            UnansweredQuestion(
                user_text="Existe-t-il un partenariat de double-diplôme avec Polytechnique Montréal ?",
                reason="missing_sheet",
                suggested_action="Vérifier conventions internationales",
                status="reviewed",
                created_at=now - timedelta(days=5)
            )
        ]
        db.add_all(unanswered)
        
        # Add sample callback requests
        callbacks = [
            CallbackRequest(
                visitor_name="Jean-Marc Biya",
                contact_info="+237 699 00 11 22",
                consent_given=True,
                profile="parent",
                interested_field="Admission & Frais UBA",
                notes="Demande d'éclaircissements sur le paiement bancaire UBA pour le concours.",
                status="pending",
                created_at=now - timedelta(days=1)
            ),
            CallbackRequest(
                visitor_name="Sarah Ngo Mandeng",
                contact_info="+237 677 33 44 55",
                consent_given=True,
                profile="eleve",
                interested_field="Génie Maritime et Portuaire (GMP)",
                notes="Intéressée par le département Génie Maritime et Portuaire.",
                status="pending",
                created_at=now - timedelta(days=3)
            )
        ]
        db.add_all(callbacks)
        
        db.commit()
        print("[OK] Database reinitialization complete.")
    finally:
        db.close()

if __name__ == "__main__":
    reinit_and_seed()
