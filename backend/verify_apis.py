import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_all_apis():
    print("========================================")
    print("ENSPD POLY - COMPREHENSIVE API AUDIT")
    print("========================================")
    
    # 1. AUTH API
    print("\n[1/7] Testing Authentication (/api/v1/auth/login)...")
    res_auth = client.post("/api/v1/auth/login", data={"username": "admin", "password": "AdminPassword2026!"})
    assert res_auth.status_code == 200, f"Auth failed: {res_auth.text}"
    token_data = res_auth.json()
    admin_token = token_data["access_token"]
    assert token_data["role"] == "admin"
    print(f"  -> Admin auth SUCCESS (role: {token_data['role']}, token: {admin_token[:15]}...)")
    
    auth_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 2. CHAT API
    print("\n[2/7] Testing Chat Engine (/api/v1/chat/message)...")
    chat_payload = {
        "session_id": "test-session-verify-001",
        "message": "Qui est le directeur de l'ENSPD ?",
        "language": "fr",
        "channel": "pwa",
        "declared_profile": "visiteur"
    }
    res_chat = client.post("/api/v1/chat/message", json=chat_payload)
    assert res_chat.status_code == 200, f"Chat failed: {res_chat.text}"
    chat_data = res_chat.json()
    print(f"  -> Chat response received (latency: {chat_data['latency_ms']}ms, score: {chat_data['relevance_score']})")
    print(f"  -> Answer snippet: {chat_data['reply'][:120]}...")
    assert "MOUANGUE" in chat_data["reply"], "Director name not found in reply!"
    assert chat_data["relevance_score"] >= 0.90, f"Relevance score {chat_data['relevance_score']} < 0.90"
    
    # 3. FEEDBACK API
    print("\n[3/7] Testing Message Feedback (/api/v1/chat/feedback)...")
    fb_payload = {
        "message_id": chat_data["message_id"],
        "rating": "up",
        "comment": "Réponse précise et sans superflu."
    }
    res_fb = client.post("/api/v1/chat/feedback", json=fb_payload)
    assert res_fb.status_code == 200, f"Feedback failed: {res_fb.text}"
    print(f"  -> Feedback recorded: {res_fb.json()}")

    # 4. ORIENTATION API
    print("\n[4/7] Testing Orientation Engine (/api/v1/orientation/evaluate)...")
    eval_payload = {
        "responses": [
            {"question_id": 1, "selected_option": "B"}, # Bac E/TI Informatique
            {"question_id": 2, "selected_option": "A"}, # GIT
            {"question_id": 3, "selected_option": "A"}, # Datacenter studio
            {"question_id": 4, "selected_option": "A"}, # IA
            {"question_id": 5, "selected_option": "A"}  # CTO
        ],
        "language": "fr"
    }
    res_orient = client.post("/api/v1/orientation/evaluate", json=eval_payload)
    assert res_orient.status_code == 200, f"Orientation failed: {res_orient.text}"
    orient_data = res_orient.json()
    top_track = orient_data["recommended_tracks"][0]
    print(f"  -> Orientation SUCCESS: Top recommendation is {top_track['field_code']} ({top_track['title']}) with {top_track['compatibility_score']}% affinity")
    assert "GI" in top_track["field_code"] or "GIT" in top_track["field_code"]

    # 5. ANALYTICS API & TIMELINE PERIODS
    print("\n[5/7] Testing Analytics Dashboard & Multi-Month Timeline Diagram...")
    res_dash = client.get("/api/v1/analytics/dashboard", headers=auth_headers)
    assert res_dash.status_code == 200, f"Dashboard failed: {res_dash.text}"
    dash_data = res_dash.json()
    print(f"  -> Dashboard stats: {dash_data['total_conversations']} convs, {dash_data['total_messages']} msgs, {dash_data['satisfaction_rate']}% satisfaction")

    periods = ["7d", "30d", "90d", "180d", "365d"]
    for p in periods:
        res_time = client.get(f"/api/v1/analytics/timeline?period={p}", headers=auth_headers)
        assert res_time.status_code == 200, f"Timeline period {p} failed: {res_time.text}"
        time_data = res_time.json()
        print(f"  -> Timeline period '{p}': {len(time_data['data'])} points returned, total: {time_data['total_in_period']}, growth: +{time_data['growth_rate']}%")

    # 6. KNOWLEDGE SHEETS API
    print("\n[6/7] Testing Knowledge Sheets Management (/api/v1/sheets/)...")
    res_sheets = client.get("/api/v1/sheets/", headers=auth_headers)
    assert res_sheets.status_code == 200, f"Sheets failed: {res_sheets.text}"
    sheets = res_sheets.json()
    print(f"  -> Retrieved {len(sheets)} official ENSPD knowledge sheets.")
    assert len(sheets) >= 20, f"Expected at least 20 sheets, got {len(sheets)}"

    # 7. EMERGENCY SWITCH & CALLBACKS
    print("\n[7/7] Testing Emergency Switch & Callbacks...")
    res_call = client.get("/api/v1/callbacks/", headers=auth_headers)
    assert res_call.status_code == 200
    print(f"  -> Callbacks count: {len(res_call.json())}")

    res_em_status = client.get("/api/v1/emergency/status")
    assert res_em_status.status_code == 200
    print(f"  -> Emergency active: {res_em_status.json()['is_active']}")

    print("\n========================================")
    print("ALL APIS VERIFIED AND 100% OPERATIONAL!")
    print("========================================")

if __name__ == "__main__":
    test_all_apis()
