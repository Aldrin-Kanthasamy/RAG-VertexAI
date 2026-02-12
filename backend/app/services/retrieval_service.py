from google.cloud.firestore_v1.base_vector_query import DistanceMeasure
from google.cloud.firestore_v1.vector import Vector
from vertexai.language_models import TextEmbeddingInput

from app.config import settings
from app.core.firestore_client import get_firestore_client
from app.core.vertex_client import get_embedding_model


def _embed_query(query: str) -> list[float]:
    model = get_embedding_model()
    inputs = [TextEmbeddingInput(text=query, task_type="RETRIEVAL_QUERY")]
    embeddings = model.get_embeddings(inputs)
    return list(embeddings[0].values)


async def retrieve_relevant_chunks(
    user_id: str,
    query: str,
    document_ids: list[str] | None = None,
    top_k: int | None = None,
) -> list[dict]:
    if top_k is None:
        top_k = settings.TOP_K_RESULTS

    # Embed the query
    query_embedding = _embed_query(query)

    # Vector search in Firestore
    db = get_firestore_client()
    chunks_ref = db.collection("users").document(user_id).collection("chunks")

    vector_query = chunks_ref.find_nearest(
        vector_field="embedding",
        query_vector=Vector(query_embedding),
        distance_measure=DistanceMeasure.COSINE,
        limit=top_k,
    )

    results = []
    for doc in vector_query.stream():
        chunk_data = doc.to_dict()

        # Filter by document_ids if specified
        if document_ids and chunk_data["document_id"] not in document_ids:
            continue

        results.append(
            {
                "chunk_id": doc.id,
                "document_id": chunk_data["document_id"],
                "document_name": chunk_data.get("document_name", "Unknown"),
                "content": chunk_data["content"],
                "chunk_index": chunk_data.get("chunk_index", 0),
            }
        )

    return results


def build_context(chunks: list[dict]) -> str:
    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        context_parts.append(f"[Source {i} - {chunk['document_name']}]\n{chunk['content']}")
    return "\n\n".join(context_parts)
