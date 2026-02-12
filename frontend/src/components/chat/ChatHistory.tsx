import { useEffect, useState } from "react";
import {
  List,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  Box,
  Paper,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { getChatHistory, deleteChat } from "../../api/chat";
import type { ChatSession } from "../../types";

interface ChatHistoryProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  refreshTrigger: number;
}

export default function ChatHistory({
  selectedChatId,
  onSelectChat,
  onNewChat,
  refreshTrigger,
}: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const loadSessions = async () => {
    try {
      const data = await getChatHistory();
      setSessions(data);
    } catch {
      // Silently fail - user may not have any chats yet
    }
  };

  useEffect(() => {
    loadSessions();
  }, [refreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    try {
      await deleteChat(chatId);
      setSessions((prev) => prev.filter((s) => s.id !== chatId));
      if (selectedChatId === chatId) onNewChat();
    } catch {
      // Handle error silently
    }
  };

  return (
    <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          p: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle2">Chat History</Typography>
        <IconButton size="small" onClick={onNewChat} color="primary">
          <AddIcon />
        </IconButton>
      </Box>

      <List sx={{ overflow: "auto", flexGrow: 1 }} dense>
        {sessions.length === 0 ? (
          <Box p={2}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No conversations yet
            </Typography>
          </Box>
        ) : (
          sessions.map((session) => (
            <ListItemButton
              key={session.id}
              selected={selectedChatId === session.id}
              onClick={() => onSelectChat(session.id)}
            >
              <ListItemText
                primary={session.title}
                secondary={new Date(session.updated_at).toLocaleDateString()}
                primaryTypographyProps={{ noWrap: true, variant: "body2" }}
              />
              <IconButton
                size="small"
                onClick={(e) => handleDelete(e, session.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItemButton>
          ))
        )}
      </List>
    </Paper>
  );
}
