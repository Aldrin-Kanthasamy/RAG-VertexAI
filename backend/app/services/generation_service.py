import json
from collections.abc import AsyncGenerator

from vertexai.generative_models import GenerationConfig

from app.config import settings

SYSTEM_PROMPT = """You are a helpful assistant that answers questions based on the provided context.
Use ONLY the information from the context below to answer the question.
If the context doesn't contain enough information to fully answer the question, say so clearly.
Always cite which source(s) you used by referencing [Source N].
Provide clear, concise, and well-structured answers."""

RAG_PROMPT_TEMPLATE = """Context:
{context}

Question: {query}

Answer based on the context above, citing sources with [Source N]:"""


async def generate_stream(
    query: str, context: str, chat_history: list[dict] | None = None
) -> AsyncGenerator[str, None]:
    from vertexai.generative_models import GenerativeModel

    model = GenerativeModel(
        settings.GENERATION_MODEL,
        system_instruction=SYSTEM_PROMPT,
    )

    prompt = RAG_PROMPT_TEMPLATE.format(context=context, query=query)

    # Build conversation history
    contents = []
    if chat_history:
        for msg in chat_history[-6:]:  # Last 3 exchanges for context
            contents.append({"role": msg["role"], "parts": [{"text": msg["content"]}]})
    contents.append({"role": "user", "parts": [{"text": prompt}]})

    generation_config = GenerationConfig(
        temperature=settings.GENERATION_TEMPERATURE,
        max_output_tokens=settings.MAX_OUTPUT_TOKENS,
    )

    response = model.generate_content(
        contents,
        generation_config=generation_config,
        stream=True,
    )

    for chunk in response:
        if chunk.text:
            yield chunk.text


async def generate_sse_stream(
    query: str, context: str, sources: list[dict], chat_history: list[dict] | None = None
) -> AsyncGenerator[str, None]:
    full_response = ""
    async for text_chunk in generate_stream(query, context, chat_history):
        full_response += text_chunk
        yield f"data: {json.dumps({'type': 'content', 'content': text_chunk})}\n\n"

    # Send sources at the end
    yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"
    yield f"data: {json.dumps({'type': 'done', 'full_response': full_response})}\n\n"
