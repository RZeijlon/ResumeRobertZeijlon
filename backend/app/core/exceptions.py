"""
Custom exception classes for the application
"""

from typing import Optional, Dict, Any


class PortfolioException(Exception):
    """Base exception for all portfolio application errors"""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ContentNotFoundException(PortfolioException):
    """Exception raised when content is not found"""

    def __init__(self, content_path: str, details: Optional[Dict[str, Any]] = None):
        message = f"Content not found: {content_path}"
        super().__init__(message, status_code=404, details=details)


class EmbeddingGenerationError(PortfolioException):
    """Exception raised when embedding generation fails"""

    def __init__(self, message: str = "Failed to generate embedding", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=500, details=details)


class RAGServiceError(PortfolioException):
    """Exception raised when RAG service encounters an error"""

    def __init__(self, message: str = "RAG service error", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=500, details=details)


class VectorStoreError(PortfolioException):
    """Exception raised when vector store operations fail"""

    def __init__(self, message: str = "Vector store error", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=500, details=details)


class ValidationError(PortfolioException):
    """Exception raised when input validation fails"""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=422, details=details)


class ConfigurationError(PortfolioException):
    """Exception raised when configuration is invalid or missing"""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=500, details=details)


class ExternalAPIError(PortfolioException):
    """Exception raised when external API calls fail"""

    def __init__(
        self,
        service: str,
        message: str = "External API error",
        details: Optional[Dict[str, Any]] = None
    ):
        full_message = f"{service} API error: {message}"
        super().__init__(full_message, status_code=502, details=details)


class DatabaseError(PortfolioException):
    """Exception raised when database operations fail"""

    def __init__(self, message: str = "Database error", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=500, details=details)
