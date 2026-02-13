# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RAG (Retrieval-Augmented Generation) chatbot using Google Cloud Vertex AI. Monorepo with a FastAPI backend and React frontend. Users upload documents (PDF/DOCX/TXT/MD), which are chunked, embedded, and stored in Firestore with vector search. Chat queries embed the user's question, retrieve relevant chunks via cosine similarity, and stream an LLM response via SSE.

## Commands

### Backend (run from `backend/`)

```bash
# Dev server
uvicorn app.main:app --reload --port 8080

# Lint & format
ruff check .
ruff format --check .

# Type check
mypy app/

# Tests
pytest tests/ -v --tb=short
pytest tests/test_text_processing.py -v    # single test file
pytest tests/ -v --cov=app                 # with coverage
```

### Frontend (run from `frontend/`)

```bash
npm run dev       # Vite dev server on :5173
npm run build     # TypeScript compile + Vite build
npm run lint      # ESLint
npx tsc --noEmit  # Type check only
```

## Architecture

### Backend (`backend/app/`)

- **FastAPI** (Python 3.12) deployed to **Cloud Run**
- `api/routes/` — HTTP endpoints: `health.py`, `documents.py`, `chat.py`
- `api/dependencies.py` — Firebase Auth JWT verification (Bearer token)
- `core/` — Singleton clients: Firebase Admin, Firestore, GCS, Vertex AI
- `services/` — Business logic layer:
  - `ingestion_service.py` — Upload → parse → chunk (1000 chars, 200 overlap) → batch embed (20 chunks/batch) → store in Firestore
  - `retrieval_service.py` — Embed query → Firestore vector search → top-5 chunks
  - `generation_service.py` — Build prompt with retrieved context → Gemini 2.0 Flash streaming
  - `chat_service.py` — Chat session CRUD, message persistence
  - `document_service.py` — Document metadata CRUD
- `utils/` — Document parsers (PyMuPDF, python-docx) and text chunking (langchain splitter)

### Frontend (`frontend/src/`)

- **React 19 + TypeScript** with **Vite**, deployed to **Firebase Hosting**
- `api/client.ts` — Axios instance with Firebase Auth token interceptor
- `api/chat.ts` — SSE event stream parsing for streamed chat responses
- `contexts/AuthContext.tsx` — Firebase Auth state via React Context
- `pages/` — Route-level components: Login, Dashboard, Chat, Documents, Settings
- `components/` — UI components organized by feature (auth, chat, documents, layout, common)
- State management: **TanStack React Query** for server state, **Context API** for auth

### Data Model (Firestore)

All data is scoped per user: `users/{userId}/...`
- `documents/{docId}` — File metadata and processing status
- `chunks/{chunkId}` — Text chunks with 768-dimension embedding vectors
- `chats/{chatId}` — Chat sessions
- `chats/{chatId}/messages/{msgId}` — Individual messages with source citations

### Key Flows

**Document ingestion**: Upload → GCS → parse → chunk → batch embed → Firestore (status transitions: uploading → processing → ready/failed)

**Chat**: Embed query → vector search → build context prompt → Gemini streaming → SSE to frontend → persist messages

## CI/CD

GitHub Actions triggered on changes to respective directories or `workflow_dispatch`:
- **Backend** (`backend-ci.yml`): Ruff + mypy + pytest → Docker build → push to Artifact Registry → deploy to Cloud Run
- **Frontend** (`frontend-ci.yml`): ESLint + tsc + build → deploy to Firebase Hosting

Deployment happens only on push to `main`.

## Environment Setup

- Backend: Copy `backend/.env.example` to `backend/.env` — requires GCP project ID, region, GCS bucket, Firebase credentials path
- Frontend: Copy `frontend/.env.example` to `frontend/.env.local` — requires API URL and Firebase config values
- Backend uses `pydantic-settings` to load config from env vars (`backend/app/config.py`)
