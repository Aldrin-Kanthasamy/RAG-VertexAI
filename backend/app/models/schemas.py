from datetime import datetime

from pydantic import BaseModel, Field


# Document schemas
class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    status: str
    chunk_count: int = 0
    created_at: datetime


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]


# Chat schemas
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    chat_id: str | None = None
    document_ids: list[str] | None = None


class SourceChunk(BaseModel):
    chunk_id: str
    document_id: str
    document_name: str
    content: str
    score: float


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    sources: list[SourceChunk] = []
    created_at: datetime


class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime


class ChatHistoryResponse(BaseModel):
    sessions: list[ChatSessionResponse]


class ChatMessagesResponse(BaseModel):
    messages: list[ChatMessageResponse]
