import { auth } from "../utils/firebase";
import { API_URL } from "../utils/constants";
import apiClient from "./client";
import type { ChatSession, ChatMessage, SSEEvent } from "../types";

export async function sendMessage(
  message: string,
  chatId?: string | null,
  documentIds?: string[],
  onEvent?: (event: SSEEvent) => void
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();

  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      chat_id: chatId || null,
      document_ids: documentIds || null,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6)) as SSEEvent;
          onEvent?.(data);
        } catch {
          // Skip malformed events
        }
      }
    }
  }
}

export async function getChatHistory(): Promise<ChatSession[]> {
  const response = await apiClient.get("/api/chat/history");
  return response.data.sessions;
}

export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  const response = await apiClient.get(`/api/chat/${chatId}/messages`);
  return response.data.messages;
}

export async function deleteChat(chatId: string): Promise<void> {
  await apiClient.delete(`/api/chat/${chatId}`);
}
