#!/bin/bash

set -e

echo "=========================================================="
echo "🎓 CSJMU RAG System Setup Script"
echo "=========================================================="

# Step 1: Create Virtual Environment
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment (venv)..."
    python3 -m venv venv
else
    echo "✓ Virtual environment 'venv' already exists."
fi

echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Step 2: Install Dependencies
echo "📥 Installing required packages from requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

# Step 3: Check Ollama Installation
echo "🔍 Checking Ollama installation..."
if ! command -v ollama &> /dev/null; then
    echo "⚠️ Ollama is not installed or not found in PATH."
    echo "   Please install Ollama from https://ollama.com or via 'brew install ollama'."
else
    echo "✓ Ollama is installed."
    
    # Check if Ollama server is running
    if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
        echo "⚠️ Ollama server is not currently running at http://localhost:11434."
        echo "   Starting Ollama server in background..."
        ollama serve &
        sleep 3
    else
        echo "✓ Ollama server is running."
    fi

    # Step 4: Pull Models if missing
    echo "📥 Checking and pulling embedding model ('nomic-embed-text')..."
    ollama pull nomic-embed-text

    echo "📥 Checking and pulling LLM model ('llama3.2:3b')..."
    ollama pull llama3.2:3b
fi

chmod +x run.sh 2>/dev/null || true

echo "=========================================================="
echo "✅ Setup Complete!"
echo "   Run './run.sh' or 'python main.py' to launch."
echo "=========================================================="
