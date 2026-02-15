import { useState } from "react";
import {
  Box,
  Grid,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { History as HistoryIcon } from "@mui/icons-material";
import ChatInterface from "../components/chat/ChatInterface";
import ChatHistory from "../components/chat/ChatHistory";

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleNewChat = () => {
    setSelectedChatId(null);
    setHistoryOpen(false);
  };

  const handleChatCreated = (chatId: string) => {
    setSelectedChatId(chatId);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setHistoryOpen(false);
  };

  const chatHistoryPanel = (
    <ChatHistory
      selectedChatId={selectedChatId}
      onSelectChat={handleSelectChat}
      onNewChat={handleNewChat}
      refreshTrigger={refreshTrigger}
    />
  );

  return (
    <Box sx={{ height: "calc(100vh - 100px)" }}>
      {isMobile && (
        <>
          <IconButton
            onClick={() => setHistoryOpen(true)}
            sx={{ mb: 1 }}
            size="small"
          >
            <HistoryIcon />
          </IconButton>
          <Drawer
            anchor="left"
            open={historyOpen}
            onClose={() => setHistoryOpen(false)}
            PaperProps={{ sx: { width: 280, p: 0 } }}
          >
            {chatHistoryPanel}
          </Drawer>
        </>
      )}

      {isMobile ? (
        <Box sx={{ height: "calc(100% - 40px)" }}>
          <ChatInterface
            chatId={selectedChatId}
            onChatCreated={handleChatCreated}
          />
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ height: "100%" }}>
          <Grid size={{ xs: 12, md: 3 }}>{chatHistoryPanel}</Grid>
          <Grid size={{ xs: 12, md: 9 }}>
            <ChatInterface
              chatId={selectedChatId}
              onChatCreated={handleChatCreated}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
