import { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import DocumentUploader from "../components/documents/DocumentUploader";
import DocumentList from "../components/documents/DocumentList";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { listDocuments, deleteDocument } from "../api/documents";
import type { Document } from "../types";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  // Poll for processing documents
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === "processing");
    if (!hasProcessing) return;

    const interval = setInterval(loadDocuments, 5000);
    return () => clearInterval(interval);
  }, [documents]);

  const loadDocuments = async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch {
      // Handle error
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Documents
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Upload and manage your documents for RAG queries.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <DocumentUploader onUploadComplete={loadDocuments} />
      </Box>

      {loading ? (
        <LoadingSpinner message="Loading documents..." />
      ) : (
        <DocumentList documents={documents} onDelete={handleDelete} />
      )}
    </Box>
  );
}
