export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: "processing" | "ready" | "error";
  chunk_count: number;
  created_at: string;
}

export interface SourceChunk {
  chunk_id: string;
  document_id: string;
  document_name: string;
  content: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: SourceChunk[];
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface SSEEvent {
  type: "content" | "sources" | "done" | "metadata";
  content?: string;
  sources?: SourceChunk[];
  full_response?: string;
  chat_id?: string;
}
