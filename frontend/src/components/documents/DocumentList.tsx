import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Tooltip,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import type { Document } from "../../types";

interface DocumentListProps {
  documents: Document[];
  onDelete: (docId: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusColor(
  status: string
): "success" | "warning" | "error" | "default" {
  switch (status) {
    case "ready":
      return "success";
    case "processing":
      return "warning";
    case "error":
      return "error";
    default:
      return "default";
  }
}

export default function DocumentList({
  documents,
  onDelete,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          No documents uploaded yet. Upload your first document above.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Filename</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Chunks</TableCell>
            <TableCell>Uploaded</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {doc.filename}
                </Typography>
              </TableCell>
              <TableCell>{doc.file_type}</TableCell>
              <TableCell>{formatFileSize(doc.file_size)}</TableCell>
              <TableCell>
                <Chip
                  label={doc.status}
                  color={getStatusColor(doc.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>{doc.chunk_count}</TableCell>
              <TableCell>
                {new Date(doc.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Delete document">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(doc.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
