import json
import os
import uuid
from datetime import datetime
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
WORKSPACES_PATH = "storage/workspaces.json"

class CreateWorkspaceRequest(BaseModel):
    name: str
    user_id: str
    description: str = ""

def load_workspaces():
    if not os.path.exists(WORKSPACES_PATH) or os.path.getsize(WORKSPACES_PATH) == 0:
        # Default seed workspace
        return [
            {
                "workspace_id": "ws-default",
                "user_id": "default",
                "name": "General Knowledge Workspace",
                "description": "Default workspace for general documents and RAG queries.",
                "created_at": str(datetime.now())
            }
        ]
    try:
        with open(WORKSPACES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_workspaces(workspaces):
    with open(WORKSPACES_PATH, "w", encoding="utf-8") as f:
        json.dump(workspaces, f, indent=2)

@router.get("/workspaces")
def get_workspaces(user_id: str = "default"):
    workspaces = load_workspaces()
    # Filter workspaces owned by user or default
    user_workspaces = [
        w for w in workspaces
        if w.get("user_id") in [user_id, "default"]
    ]
    return {"workspaces": user_workspaces}

@router.post("/workspaces")
def create_workspace(req: CreateWorkspaceRequest):
    workspaces = load_workspaces()
    ws_id = f"ws-{uuid.uuid4().hex[:8]}"
    
    new_workspace = {
        "workspace_id": ws_id,
        "user_id": req.user_id,
        "name": req.name,
        "description": req.description or "Custom domain workspace.",
        "created_at": str(datetime.now())
    }

    workspaces.insert(0, new_workspace)
    save_workspaces(workspaces)
    return {
        "message": "Workspace created successfully",
        "workspace": new_workspace
    }

@router.delete("/workspaces/{workspace_id}")
def delete_workspace(workspace_id: str):
    if workspace_id == "ws-default":
        return {"message": "Cannot delete default workspace"}
    workspaces = load_workspaces()
    remaining = [w for w in workspaces if w["workspace_id"] != workspace_id]
    save_workspaces(remaining)
    return {"message": "Workspace deleted successfully"}
