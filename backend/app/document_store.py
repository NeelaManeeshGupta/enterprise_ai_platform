import json
import os
from datetime import datetime
from app.classifier import classify_document

DOCUMENT_PATH = "storage/documents.json"
CHUNKS_PATH = "storage/chunks.json"


def sync_missing_documents(documents):
    """Ensure all documents present in chunks.json exist in documents.json."""
    if not os.path.exists(CHUNKS_PATH) or os.path.getsize(CHUNKS_PATH) == 0:
        return documents

    try:
        with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
            chunks = json.load(f)

        existing_filenames = {doc["filename"] for doc in documents}
        chunks_by_file = {}

        for chunk in chunks:
            filename = chunk.get("metadata", {}).get("filename")
            if filename:
                chunks_by_file[filename] = chunks_by_file.get(filename, 0) + 1

        updated = False
        for filename, count in chunks_by_file.items():
            if filename not in existing_filenames:
                file_ext = filename.split(".")[-1].lower() if "." in filename else "doc"
                mime = "application/pdf" if file_ext == "pdf" else "application/octet-stream"
                classification = classify_document(filename)
                
                documents.append({
                    "document_id": len(documents) + 1,
                    "filename": filename,
                    "file_type": mime,
                    "chunk_count": count,
                    "category": classification["category"],
                    "processing_strategy": classification["processing_strategy"],
                    "uploaded_at": str(datetime.now())
                })
                updated = True

        if updated:
            save_documents(documents)
    except Exception as e:
        print("Error syncing documents with chunks:", e)

    return documents


def load_documents():
    documents = []
    if os.path.exists(DOCUMENT_PATH) and os.path.getsize(DOCUMENT_PATH) > 0:
        try:
            with open(DOCUMENT_PATH, "r", encoding="utf-8") as f:
                documents = json.load(f)
        except Exception:
            documents = []

    return sync_missing_documents(documents)


def save_documents(documents):
    with open(DOCUMENT_PATH, "w", encoding="utf-8") as f:
        json.dump(documents, f, indent=2)


def add_document(filename, file_type, chunks, category: str = None, strategy: str = None):
    documents = load_documents()

    if not category:
        classification = classify_document(filename)
        category = classification["category"]
        strategy = classification["processing_strategy"]

    # Prevent duplicate entries for the same file name
    documents = [d for d in documents if d["filename"] != filename]

    document = {
        "document_id": len(documents) + 1,
        "filename": filename,
        "file_type": file_type,
        "chunk_count": len(chunks),
        "category": category,
        "processing_strategy": strategy,
        "uploaded_at": str(datetime.now())
    }

    documents.append(document)
    save_documents(documents)

    return document


def delete_document(document_id):
    documents = load_documents()

    remaining = [
        doc
        for doc in documents
        if doc["document_id"] != document_id
    ]

    if len(remaining) == len(documents):
        return False

    save_documents(remaining)
    return True