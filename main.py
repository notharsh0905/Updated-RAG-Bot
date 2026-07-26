"""
Primary CLI Entry Point for CSJMU RAG System.
Provides an interactive command-line interface and standalone query execution.
"""

import sys
import argparse
from typing import Optional

from app.rag.rag import RAGPipeline, ask
from app.core.config import config
from app.utils.utils import check_ollama_health, check_dataset_status
from app.core.logging_config import setup_logger

logger = setup_logger("main")


def parse_args():
    parser = argparse.ArgumentParser(description="CSJMU RAG System CLI Application")
    parser.add_argument(
        "-q", "--query", type=str, help="Single query to ask the RAG system."
    )
    parser.add_argument(
        "-k", type=int, default=config.DEFAULT_K, help="Number of context chunks to retrieve."
    )
    parser.add_argument(
        "--rebuild", action="store_true", help="Force rebuild Chroma vector store on startup."
    )
    parser.add_argument(
        "--flexible", action="store_true", help="Use flexible prompt mode instead of strict mode."
    )
    return parser.parse_args()


def interactive_cli(pipeline: RAGPipeline, k: int, strict_prompt: bool):
    """Launches interactive CLI chat loop."""
    print("\n" + "=" * 60)
    print("🎓 Welcome to CSJMU AI Campus Assistant (CLI Mode)")
    print("Type your questions below. Type 'exit', 'quit', or 'q' to end session.")
    print("=" * 60 + "\n")

    while True:
        try:
            user_input = input("\n💬 Enter question: ").strip()
            if not user_input:
                continue
            if user_input.lower() in ["exit", "quit", "q"]:
                print("Exiting CSJMU Assistant. Goodbye!")
                break

            print("\n🔍 Searching knowledge base and generating answer...")
            answer = pipeline.ask(user_input, k=k, strict_prompt=strict_prompt)
            print("\n🤖 Answer:\n" + "-" * 40)
            print(answer)
            print("-" * 40)
        except KeyboardInterrupt:
            print("\nSession interrupted. Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error processing query: {e}")


def main():
    args = parse_args()

    # Pre-flight health checks
    health = check_ollama_health(config.OLLAMA_BASE_URL)
    if not health.get("connected"):
        logger.warning(
            f"Could not connect to Ollama server at {config.OLLAMA_BASE_URL}. "
            "Please ensure 'ollama serve' is running."
        )

    ds_status = check_dataset_status()
    if not ds_status.get("exists"):
        logger.error(f"Dataset directory error: {ds_status.get('error')}")
        sys.exit(1)

    # Initialize Pipeline
    pipeline = RAGPipeline(force_rebuild=args.rebuild)
    strict_mode = not args.flexible

    if args.query:
        print(f"\n❓ Question: {args.query}\n")
        answer = pipeline.ask(args.query, k=args.k, strict_prompt=strict_mode)
        print("🤖 Answer:")
        print(answer)
    else:
        # Default sample run
        sample_q = "who is director of uiet"
        print(f"\n--- Running Initial Sample Verification Query ---")
        print(f"Sample Question: '{sample_q}'")
        try:
            sample_answer = pipeline.ask(sample_q, k=args.k, strict_prompt=strict_mode)
            print(f"\nSample Answer:\n{sample_answer}\n")
        except Exception as e:
            logger.error(f"Sample query failed: {e}")

        # Start interactive CLI session
        interactive_cli(pipeline, k=args.k, strict_prompt=strict_mode)


if __name__ == "__main__":
    main()
