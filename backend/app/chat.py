from typing import Optional, List
from fastapi import APIRouter
from pydantic import BaseModel

from app.retreiver import retrieve
from app.llm import generate_answer
from app.planner import plan_and_route
from app.conversations import (
    list_sessions,
    get_session,
    create_session,
    save_or_update_session,
    delete_session
)

router = APIRouter()

class QuestionRequest(BaseModel):
    question: str
    history: Optional[List[dict]] = None
    session_id: Optional[str] = None

class SessionSaveRequest(BaseModel):
    session_id: str
    title: str
    messages: List[dict]

@router.post('/ask')
def ask(question: QuestionRequest):
    chunks = retrieve(question.question, history=question.history)
    
    # 1. Execute Planner Agent Strategy & Confidence Estimation
    plan = plan_and_route(question.question, chunks)
    
    # 2. Format Context Blocks with Document Citations
    context_blocks = []
    for chunk in chunks:
        filename = chunk["metadata"]["filename"]
        chunk_id = chunk["metadata"]["chunk_id"]
        context_blocks.append(f"--- Document: {filename} (Chunk #{chunk_id}) ---\n{chunk['text']}")
    
    context = "\n\n".join(context_blocks)
    
    # 3. Generate Multi-Turn AI Answer
    answer = generate_answer(question.question, context, history=question.history)
    
    sources = [
        {
            "document": chunk["metadata"]["filename"],
            "chunk_id": chunk["metadata"]["chunk_id"]
        }
        for chunk in chunks
    ]

    return {
        "question": question.question,
        "answer": answer,
        "sources": sources,
        "planner_agent": plan
    }

# --- Conversation Session Management Endpoints ---

@router.get("/conversations")
def get_conversations():
    return {
        "sessions": list_sessions()
    }

@router.get("/conversations/{session_id}")
def get_conversation_details(session_id: str):
    session = get_session(session_id)
    if not session:
        return {"message": "Session not found"}
    return session

@router.post("/conversations")
def save_conversation(req: SessionSaveRequest):
    save_or_update_session(req.session_id, req.title, req.messages)
    return {"message": "Conversation saved successfully"}

@router.delete("/conversations/{session_id}")
def remove_conversation(session_id: str):
    success = delete_session(session_id)
    return {"message": "Session deleted" if success else "Session not found"}