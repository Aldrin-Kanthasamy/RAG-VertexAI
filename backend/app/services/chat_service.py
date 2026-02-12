import uuid
from datetime import datetime, timezone

from app.core.firestore_client import get_firestore_client


def _get_chats_ref(user_id: str):
    db = get_firestore_client()
    return db.collection("users").document(user_id).collection("chats")


async def create_chat_session(user_id: str, title: str) -> str:
    chat_id = str(uuid.uuid4())
    chats_ref = _get_chats_ref(user_id)
    now = datetime.now(timezone.utc)
    chats_ref.document(chat_id).set(
        {
            "title": title,
            "created_at": now,
            "updated_at": now,
        }
    )
    return chat_id


async def list_chat_sessions(user_id: str) -> list[dict]:
    chats_ref = _get_chats_ref(user_id)
    docs = chats_ref.order_by("updated_at", direction="DESCENDING").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]


async def save_message(
    user_id: str,
    chat_id: str,
    role: str,
    content: str,
    sources: list[dict] | None = None,
) -> str:
    db = get_firestore_client()
    messages_ref = (
        db.collection("users")
        .document(user_id)
        .collection("chats")
        .document(chat_id)
        .collection("messages")
    )

    msg_id = str(uuid.uuid4())
    msg_data = {
        "role": role,
        "content": content,
        "sources": sources or [],
        "created_at": datetime.now(timezone.utc),
    }
    messages_ref.document(msg_id).set(msg_data)

    # Update chat session timestamp
    chats_ref = _get_chats_ref(user_id)
    chats_ref.document(chat_id).update({"updated_at": datetime.now(timezone.utc)})

    return msg_id


async def get_chat_messages(user_id: str, chat_id: str) -> list[dict]:
    db = get_firestore_client()
    messages_ref = (
        db.collection("users")
        .document(user_id)
        .collection("chats")
        .document(chat_id)
        .collection("messages")
    )
    docs = messages_ref.order_by("created_at").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]


async def delete_chat_session(user_id: str, chat_id: str) -> bool:
    chats_ref = _get_chats_ref(user_id)
    chat_doc = chats_ref.document(chat_id).get()

    if not chat_doc.exists:
        return False

    # Delete all messages
    messages_ref = chats_ref.document(chat_id).collection("messages")
    for msg in messages_ref.stream():
        msg.reference.delete()

    # Delete chat session
    chats_ref.document(chat_id).delete()
    return True
