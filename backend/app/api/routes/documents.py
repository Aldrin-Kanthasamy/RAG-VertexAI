import asyncio

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from app.api.dependencies import get_current_user
from app.config import settings
from app.models.schemas import DocumentListResponse, DocumentResponse
from app.services.document_service import (
    delete_document,
    get_document,
    list_documents,
    upload_document,
)
from app.services.ingestion_service import ingest_document

router = APIRouter()


@router.post("/documents/upload", response_model=DocumentResponse, status_code=201)
async def upload(
    file: UploadFile,
    user_id: str = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    file_bytes = await file.read()
    file_size = len(file_bytes)

    max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE_MB}MB",
        )

    try:
        doc = await upload_document(user_id, file.filename, file_bytes, file_size)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Trigger ingestion in background
    asyncio.create_task(ingest_document(user_id, doc["id"]))

    return DocumentResponse(
        id=doc["id"],
        filename=doc["filename"],
        file_type=doc["file_type"],
        file_size=doc["file_size"],
        status=doc["status"],
        chunk_count=0,
        created_at=doc["created_at"],
    )


@router.get("/documents", response_model=DocumentListResponse)
async def list_docs(user_id: str = Depends(get_current_user)):
    docs = await list_documents(user_id)
    return DocumentListResponse(
        documents=[
            DocumentResponse(
                id=d["id"],
                filename=d["filename"],
                file_type=d["file_type"],
                file_size=d["file_size"],
                status=d["status"],
                chunk_count=d.get("chunk_count", 0),
                created_at=d["created_at"],
            )
            for d in docs
        ]
    )


@router.get("/documents/{doc_id}", response_model=DocumentResponse)
async def get_doc(doc_id: str, user_id: str = Depends(get_current_user)):
    doc = await get_document(user_id, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse(
        id=doc["id"],
        filename=doc["filename"],
        file_type=doc["file_type"],
        file_size=doc["file_size"],
        status=doc["status"],
        chunk_count=doc.get("chunk_count", 0),
        created_at=doc["created_at"],
    )


@router.delete("/documents/{doc_id}", status_code=204)
async def delete_doc(doc_id: str, user_id: str = Depends(get_current_user)):
    deleted = await delete_document(user_id, doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found")
