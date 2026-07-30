from fastapi import APIRouter, UploadFile, File, Form
import shutil
import os
from app.chunker import chunk_text
from app.parser import extract_text
from app.vector_store import vector_store
from app.embeddings import get_embedding
from app.document_store import add_document
from app.classifier import classify_document

router = APIRouter()

ALLOWED_EXTENSIONS = {"pdf", "docx", "pptx", "xlsx", "csv", "png", "jpg", "jpeg", "txt", "md"}

@router.post('/upload')
def upload_file(
    file: UploadFile = File(...),
    workspace_id: str = Form("ws-default")
):
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("storage", exist_ok=True)

    filename = file.filename or "uploaded_document"
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ""

    if ext not in ALLOWED_EXTENSIONS and "pdf" not in (file.content_type or ""):
        return {'message': "File type not allowed"}

    file_path = os.path.join("uploads", filename)

    with open(file_path, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text(file_path)
    chunks = chunk_text(text)

    classification = classify_document(filename, text)

    chunks_with_metadata = []
    for i, chunk in enumerate(chunks):
        chunks_with_metadata.append({
            "text": chunk,
            "metadata": {
                "filename": filename,
                "chunk_id": i,
                "category": classification["category"],
                "workspace_id": workspace_id
            }
        })

    texts = [item["text"] for item in chunks_with_metadata]
    embeddings = get_embedding(texts)
    vector_store.create_index(embeddings, chunks_with_metadata)

    document = add_document(
        filename=filename,
        file_type=file.content_type or "application/octet-stream",
        chunks=chunks,
        category=classification["category"],
        strategy=classification["processing_strategy"],
        workspace_id=workspace_id
    )

    first_chunk = chunks_with_metadata[0] if chunks_with_metadata else {}

    return {
        'message': "File uploaded successfully",
        'document': document,
        'classification': classification,
        'contenttype': file.content_type,
        'size': os.path.getsize(file_path),
        'total chunks': len(chunks_with_metadata),
        'first_chunk': first_chunk
    }