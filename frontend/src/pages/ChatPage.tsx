import { useState } from "react";
import { Box, Grid } from "@mui/material";
import ChatInterface from "../components/chat/ChatInterface";
import ChatHistory from "../components/chat/ChatHistory";

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewChat = () => {
    setSelectedChatId(null);
  };

  const handleChatCreated = (chatId: string) => {
    setSelectedChatId(chatId);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Box sx={{ height: "calc(100vh - 100px)" }}>
      <Grid container spacing={2} sx={{ height: "100%" }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <ChatHistory
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
            onNewChat={handleNewChat}
            refreshTrigger={refreshTrigger}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <ChatInterface
            chatId={selectedChatId}
            onChatCreated={handleChatCreated}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
