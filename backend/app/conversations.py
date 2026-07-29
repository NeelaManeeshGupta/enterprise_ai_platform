import json
import os
from datetime import datetime
import uuid

CONVERSATIONS_PATH = "storage/conversations.json"

def load_sessions():
    if not os.path.exists(CONVERSATIONS_PATH) or os.path.getsize(CONVERSATIONS_PATH) == 0:
        return []
    try:
        with open(CONVERSATIONS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_sessions(sessions):
    with open(CONVERSATIONS_PATH, "w", encoding="utf-8") as f:
        json.dump(sessions, f, indent=2)

def list_sessions():
    sessions = load_sessions()
    # Return metadata without heavy message body for fast listing
    return [
        {
            "session_id": s["session_id"],
            "title": s["title"],
            "created_at": s.get("created_at", ""),
            "updated_at": s.get("updated_at", ""),
            "message_count": len(s.get("messages", []))
        }
        for s in sessions
    ]

def get_session(session_id: str):
    sessions = load_sessions()
    for s in sessions:
        if s["session_id"] == session_id:
            return s
    return None

def create_session(title: str = "New Conversation"):
    sessions = load_sessions()
    session_id = str(uuid.uuid4())
    now = str(datetime.now())
    
    new_session = {
        "session_id": session_id,
        "title": title,
        "created_at": now,
        "updated_at": now,
        "messages": []
    }
    
    sessions.insert(0, new_session)
    save_sessions(sessions)
    return new_session

def save_or_update_session(session_id: str, title: str, messages: list):
    sessions = load_sessions()
    now = str(datetime.now())
    found = False

    for s in sessions:
        if s["session_id"] == session_id:
            s["title"] = title
            s["updated_at"] = now
            s["messages"] = messages
            found = True
            break

    if not found:
        sessions.insert(0, {
            "session_id": session_id,
            "title": title,
            "created_at": now,
            "updated_at": now,
            "messages": messages
        })

    save_sessions(sessions)
    return True

def delete_session(session_id: str):
    sessions = load_sessions()
    remaining = [s for s in sessions if s["session_id"] != session_id]
    if len(remaining) == len(sessions):
        return False
    save_sessions(remaining)
    return True
