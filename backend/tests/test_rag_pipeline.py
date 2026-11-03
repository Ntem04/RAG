import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base
from app.db.models import KnowledgeSheet
from app.db.seed_data import seed_database
from app.rag.engine import RAGEngine

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    seed_database(db)
    yield db
    db.close()

def test_rag_exact_retrieval(test_db):
    engine = RAGEngine()
    response = engine.process_question(
        db=test_db,
        session_id="test-session-1",
        message="Quelles sont les compétences en Génie Informatique ?",
        user_lang="fr",
        profile="eleve"
    )
    assert response.relevance_score > 0.5
    assert len(response.sources) > 0
    assert any(code in [s.code for s in response.sources] for code in ["FIL-GIT-006", "FIL-GI-001", "CURSUS-FIL-004"])
    assert "informatique" in response.reply.lower()

def test_rag_unanswered_fallback_on_irrelevant(test_db):
    engine = RAGEngine()
    # Question on completely unrelated topic with no sheets
    response = engine.process_question(
        db=test_db,
        session_id="test-session-2",
        message="Quelle est la recette de la tarte aux pommes ?",
        user_lang="fr",
        profile="visiteur"
    )
    # Strict RAG rule: states lack of official knowledge, cites 0 fake sheets
    assert len(response.sources) == 0
    assert "ne dispose pas d'une fiche officielle" in response.reply
