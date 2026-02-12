import vertexai
from vertexai.generative_models import GenerativeModel
from vertexai.language_models import TextEmbeddingModel

from app.config import settings

_initialized = False
_generation_model: GenerativeModel | None = None
_embedding_model: TextEmbeddingModel | None = None


def _init_vertex() -> None:
    global _initialized
    if not _initialized:
        vertexai.init(project=settings.GCP_PROJECT_ID, location=settings.GCP_REGION)
        _initialized = True


def get_generation_model() -> GenerativeModel:
    global _generation_model
    _init_vertex()
    if _generation_model is None:
        _generation_model = GenerativeModel(settings.GENERATION_MODEL)
    return _generation_model


def get_embedding_model() -> TextEmbeddingModel:
    global _embedding_model
    _init_vertex()
    if _embedding_model is None:
        _embedding_model = TextEmbeddingModel.from_pretrained(settings.EMBEDDING_MODEL)
    return _embedding_model
