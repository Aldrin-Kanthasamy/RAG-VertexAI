import os
import uuid
from datetime import datetime, timezone

from google.cloud.firestore_v1 import FieldFilter

from app.core.firestore_client import get_firestore_client
from app.core.gcs_client import get_bucket
from app.utils.document_parsers import ALLOWED_EXTENSIONS, EXTENSION_TO_CONTENT_TYPE


def _get_docs_ref(user_id: str):
    db = get_firestore_client()
    return db.collection("users").document(user_id).collection("documents")


async def upload_document(
    user_id: str, filename: str, file_bytes: bytes, file_size: int
) -> dict:
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {ext}. Allowed: {ALLOWED_EXTENSIONS}")

    content_type = EXTENSION_TO_CONTENT_TYPE[ext]
    doc_id = str(uuid.uuid4())
    gcs_path = f"users/{user_id}/documents/{doc_id}/{filename}"

    # Upload to Cloud Storage
    bucket = get_bucket()
    blob = bucket.blob(gcs_path)
    blob.upload_from_string(file_bytes, content_type=content_type)

    # Create Firestore document record
    doc_data = {
        "filename": filename,
        "file_type": ext,
        "content_type": content_type,
        "file_size": file_size,
        "gcs_uri": f"gs://{bucket.name}/{gcs_path}",
        "gcs_path": gcs_path,
        "status": "processing",
        "chunk_count": 0,
        "created_at": datetime.now(timezone.utc),
    }

    docs_ref = _get_docs_ref(user_id)
    docs_ref.document(doc_id).set(doc_data)

    return {"id": doc_id, **doc_data}


async def list_documents(user_id: str) -> list[dict]:
    docs_ref = _get_docs_ref(user_id)
    docs = docs_ref.order_by("created_at", direction="DESCENDING").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]


async def get_document(user_id: str, doc_id: str) -> dict | None:
    docs_ref = _get_docs_ref(user_id)
    doc = docs_ref.document(doc_id).get()
    if not doc.exists:
        return None
    return {"id": doc.id, **doc.to_dict()}


async def delete_document(user_id: str, doc_id: str) -> bool:
    db = get_firestore_client()
    docs_ref = _get_docs_ref(user_id)
    doc = docs_ref.document(doc_id).get()

    if not doc.exists:
        return False

    doc_data = doc.to_dict()

    # Delete from Cloud Storage
    bucket = get_bucket()
    blob = bucket.blob(doc_data["gcs_path"])
    if blob.exists():
        blob.delete()

    # Delete associated chunks
    chunks_ref = db.collection("users").document(user_id).collection("chunks")
    chunk_docs = chunks_ref.where(
        filter=FieldFilter("document_id", "==", doc_id)
    ).stream()
    for chunk_doc in chunk_docs:
        chunk_doc.reference.delete()

    # Delete document record
    docs_ref.document(doc_id).delete()
    return True


async def update_document_status(
    user_id: str, doc_id: str, status: str, chunk_count: int = 0
) -> None:
    docs_ref = _get_docs_ref(user_id)
    update_data = {"status": status}
    if chunk_count > 0:
        update_data["chunk_count"] = chunk_count
    docs_ref.document(doc_id).update(update_data)
