import { Box, Paper, Typography } from "@mui/material";
import {
  Person as PersonIcon,
  SmartToy as BotIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "../../types";
import SourceCard from "./SourceCard";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        mb: 2,
        flexDirection: isUser ? "row-reverse" : "row",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isUser ? "primary.main" : "secondary.main",
          color: "white",
          flexShrink: 0,
        }}
      >
        {isUser ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
      </Box>

      <Box sx={{ maxWidth: "75%" }}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            backgroundColor: isUser ? "primary.light" : "background.paper",
            color: isUser ? "primary.contrastText" : "text.primary",
          }}
        >
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <Typography variant="body1" sx={{ mb: 1, "&:last-child": { mb: 0 } }}>
                  {children}
                </Typography>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </Paper>

        {message.sources && message.sources.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
              Sources:
            </Typography>
            {message.sources.map((source, idx) => (
              <SourceCard key={idx} source={source} index={idx + 1} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
