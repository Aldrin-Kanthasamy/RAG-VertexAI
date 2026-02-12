import { useState, useEffect, useRef } from "react";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { sendMessage, getChatMessages } from "../../api/chat";
import type { ChatMessage, SourceChunk, SSEEvent } from "../../types";

interface ChatInterfaceProps {
  chatId: string | null;
  onChatCreated: (chatId: string) => void;
}

export default function ChatInterface({
  chatId,
  onChatCreated,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingSources, setStreamingSources] = useState<SourceChunk[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      loadMessages(chatId);
    } else {
      setMessages([]);
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const loadMessages = async (id: string) => {
    setLoading(true);
    try {
      const data = await getChatMessages(id);
      setMessages(data);
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (message: string) => {
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: message,
      sources: [],
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setStreamingContent("");
    setStreamingSources([]);

    try {
      await sendMessage(message, chatId, undefined, (event: SSEEvent) => {
        switch (event.type) {
          case "content":
            setStreamingContent((prev) => prev + (event.content || ""));
            break;
          case "sources":
            setStreamingSources(event.sources || []);
            break;
          case "done": {
            const assistantMessage: ChatMessage = {
              id: `temp-${Date.now()}-response`,
              role: "assistant",
              content: event.full_response || "",
              sources: [],
              created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setStreamingContent("");
            break;
          }
          case "metadata":
            if (event.chat_id && !chatId) {
              onChatCreated(event.chat_id);
            }
            break;
        }
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, an error occurred. Please try again.",
          sources: [],
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      setStreamingSources([]);
    }
  };

  return (
    <Paper
      sx={{
        height: "calc(100vh - 140px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 && !isStreaming ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Typography color="text.secondary" variant="h6">
              Ask a question about your documents
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {isStreaming && streamingContent && (
              <MessageBubble
                message={{
                  id: "streaming",
                  role: "assistant",
                  content: streamingContent,
                  sources: streamingSources,
                  created_at: new Date().toISOString(),
                }}
              />
            )}

            {isStreaming && !streamingContent && (
              <Box display="flex" gap={1} alignItems="center" ml={5}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Thinking...
                </Typography>
              </Box>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <MessageInput onSend={handleSend} disabled={isStreaming} />
    </Paper>
  );
}
