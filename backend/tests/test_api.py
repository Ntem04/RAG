import pytest
from unittest.mock import MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base
from app.db.seed_data import seed_database
from app.api.v1 import auth, chat, orientation, emergency, analytics, sheets, callbacks, enspd_site
from app.schemas.schemas import UserLogin, ChatRequest, OrientationRequest, OrientationStepAnswer

@pytest.fixture
def api_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    seed_database(db)
    yield db
    db.close()

def test_api_auth_login(api_db):
    res = auth.login(UserLogin(username="admin", password="AdminPassword2026!"), db=api_db)
    assert res.role == "admin"
    assert res.access_token is not None

def test_api_chat_message(api_db):
    mock_request = MagicMock()
    mock_request.client.host = "127.0.0.1"
    
    req = ChatRequest(
        session_id="test-session-api",
        message="Quelles sont les filières d'ingénieur proposées ?",
        language="fr",
        profile="eleve"
    )
    res = chat.send_chat_message(req, request=mock_request, db=api_db)
    assert len(res.sources) > 0
    assert any(term in res.reply.lower() for term in ["filière", "génie", "informatique", "enspd"])

def test_api_orientation_evaluate():
    req = OrientationRequest(
        answers=[
            OrientationStepAnswer(question_id=1, selected_option="A"),
            OrientationStepAnswer(question_id=2, selected_option="A"),
            OrientationStepAnswer(question_id=3, selected_option="A")
        ],
        language="fr"
    )
    res = orientation.evaluate_orientation(req)
    assert len(res.recommended_tracks) >= 2
    assert res.recommended_tracks[0].field_code == "FIL-GI"

def test_api_emergency_toggle(api_db):
    mock_payload = {"sub": "admin-id", "role": "admin"}
    res = emergency.toggle_emergency(active=True, payload=mock_payload, db=api_db)
    assert res.is_active is True

    res2 = emergency.toggle_emergency(active=False, payload=mock_payload, db=api_db)
    assert res2.is_active is False

def test_api_analytics_dashboard_and_timeline(api_db):
    mock_payload = {"sub": "admin-id", "role": "admin"}
    stats = analytics.get_dashboard_stats(payload=mock_payload, db=api_db)
    assert stats.total_conversations >= 0
    assert stats.satisfaction_rate >= 0.0

    for period in ["7d", "30d", "90d", "180d", "365d"]:
        tl = analytics.get_analytics_timeline(period=period, payload=mock_payload, db=api_db)
        assert len(tl.data) > 0
        assert tl.total_in_period >= 0

def test_api_sheets_list(api_db):
    sheets_list = sheets.list_sheets(status="validated", category=None, language=None, db=api_db)
    assert len(sheets_list) >= 10

def test_api_director_precision_guard(api_db):
    mock_request = MagicMock()
    mock_request.client.host = "127.0.0.1"

    req = ChatRequest(
        session_id="test-session-precision",
        message="Qui est le directeur de l'ENSPD ?",
        language="fr",
        profile="visiteur"
    )
    res = chat.send_chat_message(req, request=mock_request, db=api_db)
    reply = res.reply
    assert "MOUANGUE" in reply or "mouangue" in reply.lower()
    assert res.relevance_score >= 0.90

def test_api_enspd_site_status():
    status = enspd_site.get_enspd_site_status()
    assert status.site_url == "https://enspd-udo.cm"
    assert status.checked_at is not None
    assert isinstance(status.online, bool)

def test_api_enspd_site_live_search():
    req = enspd_site.LiveSearchRequest(query="filières concours admission", language="fr")
    res = enspd_site.live_search_enspd_site(req)
    assert res.query == "filières concours admission"
    assert isinstance(res.results, list)

