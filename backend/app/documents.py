from fastapi import APIRouter
from app.document_store import load_documents
from app.document_store import delete_document
from app.vector_store import vector_store

router = APIRouter()


@router.get("/documents")
def get_documents():

    documents = load_documents()

    return {
        "total_documents": len(documents),
        "documents": documents
    }



@router.delete("/documents/{document_id}")
def remove_document(document_id:int):

    documents = load_documents()

    target = None

    for doc in documents:
        if doc["document_id"] == document_id:
            target = doc
            break


    if target is None:
        return {
            "message":"Document not found"
        }


    vector_store.delete_document(
        target["filename"]
    )


    delete_document(document_id)


    return {
        "message":"Document deleted successfully",
        "filename":target["filename"]
    }