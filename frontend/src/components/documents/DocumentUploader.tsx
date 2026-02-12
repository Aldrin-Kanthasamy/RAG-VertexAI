import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Typography,
  LinearProgress,
  Alert,
  Paper,
} from "@mui/material";
import { CloudUpload as UploadIcon } from "@mui/icons-material";
import { uploadDocument } from "../../api/documents";
import { MAX_FILE_SIZE_MB, ALLOWED_FILE_TYPES } from "../../utils/constants";

interface DocumentUploaderProps {
  onUploadComplete: () => void;
}

export default function DocumentUploader({
  onUploadComplete,
}: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);

      for (const file of acceptedFiles) {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          setError(`File "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit`);
          continue;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
          await uploadDocument(file);
          setUploadProgress(100);
          onUploadComplete();
        } catch (err: any) {
          setError(
            err.response?.data?.detail || `Failed to upload "${file.name}"`
          );
        } finally {
          setUploading(false);
        }
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    disabled: uploading,
  });

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          border: "2px dashed",
          borderColor: isDragActive ? "primary.main" : "grey.300",
          backgroundColor: isDragActive ? "action.hover" : "background.paper",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "action.hover",
          },
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive
            ? "Drop files here..."
            : "Drag & drop files, or click to select"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supported: {ALLOWED_FILE_TYPES.join(", ")} (max {MAX_FILE_SIZE_MB}MB)
        </Typography>
      </Paper>

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Uploading...
          </Typography>
        </Box>
      )}
    </Box>
  );
}
