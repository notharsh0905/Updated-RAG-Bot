#!/bin/bash

set -e

source venv/bin/activate 2>/dev/null || true

MODE=${1:-"cli"}

echo "🚀 Launching CSJMU RAG System in mode: '$MODE'..."

case "$MODE" in
    api)
        echo "📡 Starting FastAPI Backend Server at http://localhost:8000..."
        uvicorn app.api.api:app --host 0.0.0.0 --port 8000 --reload
        ;;
    ui|frontend|streamlit)
        echo "🌐 Starting Streamlit Web Interface at http://localhost:8501..."
        streamlit run frontend/streamlit_app.py --server.port=8501
        ;;
    cli|main)
        python main.py
        ;;
    *)
        echo "Usage: ./run.sh [cli|api|ui]"
        echo "  cli : Run interactive command-line interface (default)"
        echo "  api : Launch FastAPI REST server"
        echo "  ui  : Launch Streamlit web chat UI"
        exit 1
        ;;
esac
