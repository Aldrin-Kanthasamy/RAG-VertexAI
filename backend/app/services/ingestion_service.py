import logging
import uuid
from datetime import datetime, timezone

from google.cloud.firestore_v1.vector import Vector
from vertexai.language_models import TextEmbeddingInput

from app.core.firestore_client import get_firestore_client
from app.core.gcs_client import get_bucket
from app.core.vertex_client import get_embedding_model
from app.services.document_service import update_document_status
from app.utils.document_parsers import parse_document
from app.utils.text_processing import chunk_text

logger = logging.getLogger(__name__)

EMBEDDING_BATCH_SIZE = 250


def _batch_embed(texts: list[str]) -> list[list[float]]:
    model = get_embedding_model()
    all_embeddings = []

    for i in range(0, len(texts), EMBEDDING_BATCH_SIZE):
        batch = texts[i : i + EMBEDDING_BATCH_SIZE]
        inputs = [TextEmbeddingInput(text=text, task_type="RETRIEVAL_DOCUMENT") for text in batch]
        embeddings = model.get_embeddings(inputs)
        all_embeddings.extend([e.values for e in embeddings])

    return all_embeddings


async def ingest_document(user_id: str, doc_id: str) -> None:
    try:
        db = get_firestore_client()
        doc_ref = db.collection("users").document(user_id).collection("documents").document(doc_id)
        doc_snapshot = doc_ref.get()

        if not doc_snapshot.exists:
            logger.error(f"Document {doc_id} not found for user {user_id}")
            return

        doc_data = doc_snapshot.to_dict()

        # Download file from GCS
        bucket = get_bucket()
        blob = bucket.blob(doc_data["gcs_path"])
        file_bytes = blob.download_as_bytes()

        # Parse document to text
        text = parse_document(file_bytes, doc_data["content_type"])

        if not text.strip():
            await update_document_status(user_id, doc_id, "error")
            logger.error(f"No text extracted from document {doc_id}")
            return

        # Chunk text
        chunks = chunk_text(text)

        if not chunks:
            await update_document_status(user_id, doc_id, "error")
            logger.error(f"No chunks generated from document {doc_id}")
            return

        # Generate embeddings
        embeddings = _batch_embed(chunks)

        # Store chunks with embeddings in Firestore
        chunks_ref = db.collection("users").document(user_id).collection("chunks")
        batch = db.batch()

        for idx, (chunk_text_content, embedding) in enumerate(zip(chunks, embeddings)):
            chunk_id = str(uuid.uuid4())
            chunk_ref = chunks_ref.document(chunk_id)
            batch.set(
                chunk_ref,
                {
                    "document_id": doc_id,
                    "document_name": doc_data["filename"],
                    "content": chunk_text_content,
                    "embedding": Vector(embedding),
                    "chunk_index": idx,
                    "created_at": datetime.now(timezone.utc),
                },
            )

            # Firestore batch limit is 500 writes
            if (idx + 1) % 499 == 0:
                batch.commit()
                batch = db.batch()

        batch.commit()

        # Update document status
        await update_document_status(user_id, doc_id, "ready", chunk_count=len(chunks))
        logger.info(f"Ingested document {doc_id}: {len(chunks)} chunks")

    except Exception as e:
        logger.error(f"Ingestion failed for document {doc_id}: {e}")
        await update_document_status(user_id, doc_id, "error")
        raise
