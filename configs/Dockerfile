# Production Dockerfile for CSJMU RAG System FastAPI Backend
FROM python:3.10-slim

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source application modules
COPY app/ ./app/
COPY data/ ./data/
COPY main.py ./
COPY .env.example .env

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.api.api:app", "--host", "0.0.0.0", "--port", "8000"]
