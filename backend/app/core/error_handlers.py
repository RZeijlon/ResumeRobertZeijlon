"""
Global exception handlers for FastAPI
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError as PydanticValidationError
from datetime import datetime
import traceback

from app.core.exceptions import PortfolioException
from app.core.logging import get_logger

logger = get_logger(__name__)


async def portfolio_exception_handler(request: Request, exc: PortfolioException) -> JSONResponse:
    """
    Handle custom portfolio exceptions

    Args:
        request: The incoming request
        exc: The portfolio exception

    Returns:
        JSON response with error details
    """
    logger.error(
        f"Portfolio exception: {exc.message}",
        extra={
            "status_code": exc.status_code,
            "path": request.url.path,
            "method": request.method,
            "details": exc.details
        }
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.__class__.__name__,
            "message": exc.message,
            "details": exc.details,
            "path": request.url.path,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
) -> JSONResponse:
    """
    Handle Pydantic validation errors

    Args:
        request: The incoming request
        exc: The validation error

    Returns:
        JSON response with validation error details
    """
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })

    logger.warning(
        "Validation error",
        extra={
            "path": request.url.path,
            "method": request.method,
            "errors": errors
        }
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "ValidationError",
            "message": "Input validation failed",
            "details": {"errors": errors},
            "path": request.url.path,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle all other uncaught exceptions

    Args:
        request: The incoming request
        exc: The exception

    Returns:
        JSON response with generic error message
    """
    # Log full exception details
    logger.error(
        f"Unhandled exception: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "exception_type": exc.__class__.__name__,
            "traceback": traceback.format_exc()
        }
    )

    # Don't expose internal error details to client in production
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred. Please try again later.",
            "path": request.url.path,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


def register_exception_handlers(app) -> None:
    """
    Register all exception handlers with the FastAPI app

    Args:
        app: The FastAPI application instance
    """
    app.add_exception_handler(PortfolioException, portfolio_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(PydanticValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)

    logger.info("Exception handlers registered")
