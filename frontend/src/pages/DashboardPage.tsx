import { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Description as DocumentIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { listDocuments } from "../api/documents";
import { getChatHistory } from "../api/chat";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [docCount, setDocCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);

  useEffect(() => {
    listDocuments()
      .then((docs) => setDocCount(docs.length))
      .catch(() => {});
    getChatHistory()
      .then((sessions) => setChatCount(sessions.length))
      .catch(() => {});
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome to your RAG Assistant. Upload documents and ask questions.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardActionArea onClick={() => navigate("/documents")}>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <DocumentIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
                <Typography variant="h3">{docCount}</Typography>
                <Typography color="text.secondary">Documents</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardActionArea onClick={() => navigate("/chat")}>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <ChatIcon sx={{ fontSize: 48, color: "secondary.main", mb: 1 }} />
                <Typography variant="h3">{chatCount}</Typography>
                <Typography color="text.secondary">Conversations</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
