import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.api.dependencies import get_current_user
from app.models.schemas import (
    ChatHistoryResponse,
    ChatMessageResponse,
    ChatMessagesResponse,
    ChatRequest,
    ChatSessionResponse,
    SourceChunk,
)
from app.services.chat_service import (
    create_chat_session,
    delete_chat_session,
    get_chat_messages,
    list_chat_sessions,
    save_message,
)
from app.services.generation_service import generate_sse_stream
from app.services.retrieval_service import build_context, retrieve_relevant_chunks

router = APIRouter()


@router.post("/chat")
async def chat(request: ChatRequest, user_id: str = Depends(get_current_user)):
    # Retrieve relevant chunks
    chunks = await retrieve_relevant_chunks(
        user_id=user_id,
        query=request.message,
        document_ids=request.document_ids,
    )

    if not chunks:
        return StreamingResponse(
            _no_context_stream(),
            media_type="text/event-stream",
        )

    # Build context from retrieved chunks
    context = build_context(chunks)

    # Create or use existing chat session
    chat_id = request.chat_id
    if not chat_id:
        title = request.message[:50] + ("..." if len(request.message) > 50 else "")
        chat_id = await create_chat_session(user_id, title)

    # Save user message
    await save_message(user_id, chat_id, "user", request.message)

    # Get chat history for context
    history = await get_chat_messages(user_id, chat_id)
    chat_history = [{"role": m["role"], "content": m["content"]} for m in history[:-1]]

    # Prepare source data for SSE
    source_data = [
        {
            "chunk_id": c["chunk_id"],
            "document_id": c["document_id"],
            "document_name": c["document_name"],
            "content": c["content"][:200],
            "score": 0.0,
        }
        for c in chunks
    ]

    async def stream_and_save():
        full_response = ""
        async for event in generate_sse_stream(
            query=request.message,
            context=context,
            sources=source_data,
            chat_history=chat_history,
        ):
            if '"type": "done"' in event:
                data = json.loads(event.replace("data: ", "").strip())
                full_response = data.get("full_response", "")
            yield event

        # Save assistant response after streaming completes
        await save_message(user_id, chat_id, "assistant", full_response, source_data)

        # Send chat_id to frontend
        yield f"data: {json.dumps({'type': 'metadata', 'chat_id': chat_id})}\n\n"

    return StreamingResponse(stream_and_save(), media_type="text/event-stream")


async def _no_context_stream():
    msg = "I don't have any documents to reference. Please upload some documents first."
    yield f"data: {json.dumps({'type': 'content', 'content': msg})}\n\n"
    yield f"data: {json.dumps({'type': 'sources', 'sources': []})}\n\n"
    yield f"data: {json.dumps({'type': 'done', 'full_response': msg})}\n\n"


@router.get("/chat/history", response_model=ChatHistoryResponse)
async def chat_history(user_id: str = Depends(get_current_user)):
    sessions = await list_chat_sessions(user_id)
    return ChatHistoryResponse(
        sessions=[
            ChatSessionResponse(
                id=s["id"],
                title=s["title"],
                created_at=s["created_at"],
                updated_at=s["updated_at"],
            )
            for s in sessions
        ]
    )


@router.get("/chat/{chat_id}/messages", response_model=ChatMessagesResponse)
async def get_messages(chat_id: str, user_id: str = Depends(get_current_user)):
    messages = await get_chat_messages(user_id, chat_id)
    return ChatMessagesResponse(
        messages=[
            ChatMessageResponse(
                id=m["id"],
                role=m["role"],
                content=m["content"],
                sources=[SourceChunk(**s) for s in m.get("sources", [])],
                created_at=m["created_at"],
            )
            for m in messages
        ]
    )


@router.delete("/chat/{chat_id}", status_code=204)
async def delete_chat(chat_id: str, user_id: str = Depends(get_current_user)):
    deleted = await delete_chat_session(user_id, chat_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Chat session not found")
