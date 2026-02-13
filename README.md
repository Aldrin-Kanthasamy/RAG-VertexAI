# RAG Application with Vertex AI Gemini

A production-level Retrieval-Augmented Generation application built with React.js and FastAPI, powered by Google Cloud Platform services. Upload documents, ask questions in natural language, and get accurate, context-aware answers streamed in real time.

## Features

- **Document Ingestion** — Upload PDF (with OCR for scanned documents), DOCX, TXT, and Markdown files (up to 20 MB)
- **RAG Chat** — Ask questions and get answers grounded in your uploaded documents with source citations
- **Real-time Streaming** — Responses streamed via Server-Sent Events (SSE)
- **Multi-user** — Per-user document and chat isolation with Firebase Authentication
- **Auto-scaling** — Serverless backend scales from 0 to N instances based on demand

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Material UI, Vite |
| **Backend** | FastAPI, Python 3.12, Uvicorn |
| **LLM** | Vertex AI Gemini 2.0 Flash |
| **Embeddings** | Vertex AI text-embedding-004 (768 dimensions) |
| **Vector DB** | Cloud Firestore with native vector search (cosine similarity) |
| **Auth** | Firebase Authentication (email/password) |
| **Storage** | Google Cloud Storage |
| **OCR** | Tesseract via pytesseract + Pillow (fallback for scanned PDFs) |
| **CI/CD** | GitHub Actions → Cloud Run (backend) + Firebase Hosting (frontend) |

## Architecture

```
User → Firebase Hosting (React SPA) → Cloud Run (FastAPI)
                                          ├── Cloud Storage (file uploads)
                                          ├── Firestore (metadata + vector search)
                                          └── Vertex AI (embeddings + generation)
```

### RAG Pipeline

**Document Ingestion:**
Upload → Cloud Storage → Parse (PyMuPDF / OCR / python-docx) → Chunk (1000 chars, 200 overlap) → Batch Embed → Store in Firestore

**Chat Query:**
Embed query → Vector search (top-5 chunks, cosine similarity) → Build context → Gemini 2.0 Flash streaming → SSE to frontend → Save to Firestore

### RAG Parameters

| Parameter | Value |
|---|---|
| Chunk size | 1,000 characters |
| Chunk overlap | 200 characters |
| Top-K retrieval | 5 chunks |
| Generation temperature | 0.3 |
| Max output tokens | 2,048 |
| Embedding dimensions | 768 |
| Max file size | 20 MB |

### Data Model (Firestore)

All data is scoped per user under `users/{userId}/`:

- `documents/{docId}` — File metadata and processing status
- `chunks/{chunkId}` — Text chunks with 768-dimension embedding vectors
- `chats/{chatId}` — Chat sessions
- `chats/{chatId}/messages/{msgId}` — Messages with source citations

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/routes/        # health, documents, chat endpoints
│   │   ├── core/              # Firebase, Firestore, GCS, Vertex AI clients
│   │   ├── services/          # ingestion, retrieval, generation, chat, auth
│   │   ├── utils/             # document parsers (PDF/OCR/DOCX), text chunking
│   │   ├── models/            # Pydantic schemas
│   │   └── config.py          # Settings via pydantic-settings
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios client, chat SSE, document API
│   │   ├── components/        # auth, chat, documents, layout, common
│   │   ├── contexts/          # AuthContext (Firebase Auth)
│   │   ├── pages/             # Login, Dashboard, Chat, Documents, Settings
│   │   └── types/
│   ├── firebase.json
│   └── package.json
└── infrastructure/
    ├── firestore.rules
    └── firestore.indexes.json  # Vector search index config
```

## Prerequisites

- Python 3.12+
- Node.js 20+
- Google Cloud SDK (`gcloud`)
- Firebase CLI (`firebase-tools`)
- Docker (for backend deployment)

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env      # Edit with your GCP project details
uvicorn app.main:app --reload --port 8080
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # Edit with your Firebase config
npm run dev
```

## Testing & Code Quality

### Backend

```bash
cd backend
ruff check .                # Lint
ruff format --check .       # Format check
mypy app/                   # Type check
pytest tests/ -v --tb=short # Run tests
```

### Frontend

```bash
cd frontend
npm run lint                # ESLint
npx tsc --noEmit            # Type check
npm run build               # Build
```

## Deployment

Push to `main` branch triggers automatic deployment via GitHub Actions:

- **Backend** → Docker build → Artifact Registry → Cloud Run (us-central1)
- **Frontend** → Vite build → Firebase Hosting

### Cloud Run Configuration

| Setting | Value |
|---|---|
| Min instances | 0 (scales to zero when idle) |
| Max instances | 2 |
| Memory | 1 GB |
| CPU | 1 vCPU |
| Concurrency | 80 requests per instance |
| Request timeout | 300 seconds |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/documents/upload` | Upload a document |
| `GET` | `/api/documents` | List user's documents |
| `GET` | `/api/documents/{id}` | Get document details |
| `DELETE` | `/api/documents/{id}` | Delete a document |
| `POST` | `/api/chat` | Send message (SSE streaming response) |
| `GET` | `/api/chat/history` | List chat sessions |
| `GET` | `/api/chat/{id}/messages` | Get chat messages |
| `DELETE` | `/api/chat/{id}` | Delete a chat session |

All endpoints (except health) require a Firebase Auth Bearer token.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `GCP_PROJECT_ID` | Google Cloud project ID |
| `GCP_REGION` | GCP region (default: `us-central1`) |
| `GCS_BUCKET_NAME` | Cloud Storage bucket name |
| `FIREBASE_CREDENTIALS_PATH` | Path to Firebase service account key |
| `FIRESTORE_DATABASE` | Firestore database name |
| `ALLOWED_ORIGINS` | CORS allowed origins |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL |
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
