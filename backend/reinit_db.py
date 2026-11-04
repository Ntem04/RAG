import sys
import os
from datetime import datetime

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import engine, Base, SessionLocal
from app.db.models import (
    UserAdmin,
    KnowledgeSheet,
    Conversation,
    ChatMessage,
    Feedback,
    DailyMetric,
    UnansweredQuestion,
    CallbackRequest,
    SystemSetting
)
from app.db.seed_data import seed_database

def reinit_and_seed():
    """
    Réinitialise complètement la base de données.
    Recrée le schéma relationnel normalisé et la table dénormalisée DailyMetric.
    Charge uniquement les fiches officielles certifiées de l'ENSPD et les comptes administrateurs.
    Zéro donnée fictive : les conversations, questions et avis débutent à 0 pour vos tests réels.
    """
    print("[1/3] Purge et recréation intégrale du schéma de base de données...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("[2/3] Chargement des données officielles (Comptes admin, 35 fiches validées ENSPD PK17)...")
        seed_database(db)

        # Initialiser l'agrégat dénormalisé pour aujourd'hui à zéro
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        metric_today = DailyMetric(
            date=today_str,
            conversations_count=0,
            messages_count=0,
            questions_count=0,
            positive_ratings=0,
            negative_ratings=0,
            satisfaction_rate=0.0
        )
        db.add(metric_today)
        db.commit()

        print("[3/3] Base de données réinitialisée avec succès !")
        print("-> 0 conversation fictive (le diagramme démarrera à partir de vos premiers tests)")
        print("-> 0 avis fictif (le % de satisfaction sera calculé en temps réel selon les pouces cliqués)")
        print("[OK] Prêt pour vos tests réels.")
    except Exception as e:
        db.rollback()
        print(f"[ERREUR] Échec de la réinitialisation : {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    reinit_and_seed()
