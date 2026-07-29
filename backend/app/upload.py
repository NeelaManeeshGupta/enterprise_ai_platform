from fastapi import APIRouter, UploadFile, File
import shutil
import os
from app.chunker import chunk_text
from app.parser import extract_text
from app.vector_store import vector_store
from app.embeddings import get_embedding
from app.document_store import add_document
from app.classifier import classify_document

router = APIRouter()

ALLOWED_CONTENT_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # DOCX
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",  # PPTX
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # XLSX
    "text/csv",
    "image/png",
    "image/jpeg",
]

@router.post('/upload')
def upload_file(file: UploadFile=File(...)):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        return {
            'message':"File type not allowed"
        }
    
    file_path = f'uploads/{file.filename}'

    with open(file_path, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    text = extract_text(file_path)
    chunks = chunk_text(text)
    
    # Run Document Intelligence Classifier Pipeline
    classification = classify_document(file.filename, text)

    chunks_with_metadata = []
    for i, chunk in enumerate(chunks):
        chunks_with_metadata.append(
            {
                "text": chunk,
                "metadata": {
                    "filename": file.filename,
                    "chunk_id": i,
                    "category": classification["category"]
                }
            }
        )

    texts = [item["text"] for item in chunks_with_metadata]

    embeddings = get_embedding(texts)
    vector_store.create_index(embeddings, chunks_with_metadata)
    
    document = add_document(
        filename=file.filename,
        file_type=file.content_type,
        chunks=chunks,
        category=classification["category"],
        strategy=classification["processing_strategy"]
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