from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GCP_PROJECT_ID: str
    GCP_REGION: str = "us-central1"
    GCS_BUCKET_NAME: str
    FIREBASE_CREDENTIALS_PATH: str = ""
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    # RAG settings
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    TOP_K_RESULTS: int = 5
    GENERATION_TEMPERATURE: float = 0.3
    MAX_OUTPUT_TOKENS: int = 2048
    MAX_FILE_SIZE_MB: int = 20

    # Model settings
    GENERATION_MODEL: str = "gemini-2.0-flash"
    EMBEDDING_MODEL: str = "text-embedding-004"
    EMBEDDING_DIMENSION: int = 768

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
