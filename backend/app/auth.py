import json
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()
USERS_PATH = "storage/users.json"

class SignupRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

def load_users():
    if not os.path.exists(USERS_PATH) or os.path.getsize(USERS_PATH) == 0:
        return []
    try:
        with open(USERS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_users(users):
    with open(USERS_PATH, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)

@router.post("/auth/signup")
def signup(req: SignupRequest):
    users = load_users()
    for u in users:
        if u["email"].lower() == req.email.lower():
            raise HTTPException(status_code=400, detail="User with this email already exists")

    user_id = str(uuid.uuid4())
    token = f"token_{user_id[:8]}"
    new_user = {
        "user_id": user_id,
        "username": req.username,
        "email": req.email.lower(),
        "password": req.password,  # In production, use bcrypt hash
        "created_at": str(datetime.now())
    }

    users.append(new_user)
    save_users(users)

    return {
        "message": "User registered successfully",
        "user": {
            "user_id": user_id,
            "username": req.username,
            "email": req.email
        },
        "token": token
    }

@router.post("/auth/login")
def login(req: LoginRequest):
    users = load_users()
    for u in users:
        if u["email"].lower() == req.email.lower() and u["password"] == req.password:
            token = f"token_{u['user_id'][:8]}"
            return {
                "message": "Login successful",
                "user": {
                    "user_id": u["user_id"],
                    "username": u["username"],
                    "email": u["email"]
                },
                "token": token
            }

    raise HTTPException(status_code=401, detail="Invalid email or password")
