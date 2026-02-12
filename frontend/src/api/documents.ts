import apiClient from "./client";
import type { Document } from "../types";

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/api/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function listDocuments(): Promise<Document[]> {
  const response = await apiClient.get("/api/documents");
  return response.data.documents;
}

export async function getDocument(docId: string): Promise<Document> {
  const response = await apiClient.get(`/api/documents/${docId}`);
  return response.data;
}

export async function deleteDocument(docId: string): Promise<void> {
  await apiClient.delete(`/api/documents/${docId}`);
}
