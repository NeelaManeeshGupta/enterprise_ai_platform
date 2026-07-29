import numpy as np
from app.embeddings import get_embedding
from app.vector_store import vector_store

def retrieve(question: str, history: list = None, k: int = 4):
    if not vector_store.stored_chunks:
        return []

    question_lower = question.lower()
    
    # Extract unique filenames in stored vector database
    all_filenames = list({chunk["metadata"]["filename"] for chunk in vector_store.stored_chunks})
    
    target_filename = None

    # 1. Check if a filename is mentioned in current question
    for filename in all_filenames:
        name_without_ext = filename.rsplit('.', 1)[0].lower()
        if filename.lower() in question_lower or name_without_ext in question_lower:
            target_filename = filename
            break

    # 2. If not in current question, check recent conversation history for active document context
    if not target_filename and history:
        for msg in reversed(history):
            content = str(msg.get("content", "")).lower()
            for filename in all_filenames:
                name_without_ext = filename.rsplit('.', 1)[0].lower()
                if filename.lower() in content or name_without_ext in content:
                    target_filename = filename
                    break
            if target_filename:
                break

    # If a specific target document is identified, return top 4 sequential chunks (fast context)
    if target_filename:
        doc_chunks = [
            chunk for chunk in vector_store.stored_chunks
            if chunk["metadata"]["filename"] == target_filename
        ]
        if doc_chunks:
            doc_chunks.sort(key=lambda c: c["metadata"]["chunk_id"])
            return doc_chunks[:4]  # Return top 4 most relevant chunks for fast CPU inference

    # Fallback to standard FAISS vector search across all stored chunks
    if vector_store.index is None:
        return vector_store.stored_chunks[:k]

    question_embedding = get_embedding([question]).astype('float32')
    distances, indices = vector_store.index.search(question_embedding, min(k, len(vector_store.stored_chunks)))
    
    results = []
    seen = set()

    for i in indices[0]:
        if i < 0 or i >= len(vector_store.stored_chunks):
            continue
        chunk = vector_store.stored_chunks[i]
        key = (
            chunk["metadata"]["filename"],
            chunk["metadata"]["chunk_id"]
        )
        if key not in seen:
            results.append(chunk)
            seen.add(key)

    return results
