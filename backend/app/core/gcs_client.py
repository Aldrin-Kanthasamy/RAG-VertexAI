from google.cloud import storage

from app.config import settings

_client: storage.Client | None = None


def get_gcs_client() -> storage.Client:
    global _client
    if _client is None:
        _client = storage.Client(project=settings.GCP_PROJECT_ID)
    return _client


def get_bucket() -> storage.Bucket:
    client = get_gcs_client()
    return client.bucket(settings.GCS_BUCKET_NAME)
