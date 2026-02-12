import { useState } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage("");
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", gap: 1, p: 2, borderTop: 1, borderColor: "divider" }}
    >
      <TextField
        fullWidth
        placeholder="Ask a question about your documents..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
        size="small"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        multiline
        maxRows={4}
      />
      <IconButton
        type="submit"
        color="primary"
        disabled={disabled || !message.trim()}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}
