# RAG Application with Vertex AI Gemini

A production-level Retrieval-Augmented Generation application built with React.js and FastAPI, powered by Google Cloud Platform services.

## Architecture

- **Frontend**: React + TypeScript + Vite → Firebase Hosting
- **Backend**: FastAPI (Python 3.12) → Cloud Run
- **Vector DB**: Firestore with native vector search
- **LLM**: Vertex AI Gemini 2.0 Flash
- **Embeddings**: Vertex AI text-embedding-004 (768d)
- **Auth**: Firebase Authentication
- **Storage**: Cloud Storage
- **CI/CD**: GitHub Actions

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
pip install -r requirements.txt
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

## Deployment

Push to `main` branch triggers automatic deployment via GitHub Actions:
- Backend → Cloud Run
- Frontend → Firebase Hosting

## Cost

Optimized for 5 users: **~$1–7/month** (mostly Vertex AI API usage).
