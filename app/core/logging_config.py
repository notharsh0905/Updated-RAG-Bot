"""
Logging configuration for CSJMU RAG System.
Provides structured and colorized log formatting across all modules.
"""

import logging
import sys
from typing import Optional


def setup_logger(name: str = "csjmu_rag", level: int = logging.INFO) -> logging.Logger:
    """
    Configures and returns a logger instance with standardized formatting.

    Args:
        name (str): Module logger name.
        level (int): Logging severity level.

    Returns:
        logging.Logger: Configured logger.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(level)
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(level)
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
    return logger
