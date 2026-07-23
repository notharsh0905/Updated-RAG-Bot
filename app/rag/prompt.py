"""
Prompt templates and formatting utilities.
Preserves the exact prompt structures used in the source notebook.
"""


class PromptBuilder:
    """Constructs strict and flexible RAG prompts."""

    @staticmethod
    def build_strict_prompt(context: str, question: str) -> str:
        """
        Builds the strict document assistant prompt as defined in the source notebook.

        Args:
            context (str): Retrieved passage context.
            question (str): User question.

        Returns:
            str: Formatted prompt string.
        """
        return f"""You are a document assistant. Your task is to extract information ONLY from the provided context.

Context:
{context}

Question: {question}

Response Guidelines:
1. Search the context for exact matches to the question
2. If the exact information exists, provide it
3. If the context mentions the topic but not the specific detail asked, say so
4. If the topic isn't in the context at all, state clearly: 
   "This information is not available in the provided documents."

Answer:"""

    @staticmethod
    def build_flexible_prompt(context: str, question: str) -> str:
        """
        Builds the flexible context prompt variant from the notebook.

        Args:
            context (str): Retrieved passage context.
            question (str): User question.

        Returns:
            str: Formatted prompt string.
        """
        return f"based on the context \n{context}\n tell me {question}"
