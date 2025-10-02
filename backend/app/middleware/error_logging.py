"""
Error logging middleware
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from typing import Callable
import time

from app.core.logging import get_logger

logger = get_logger(__name__)


class ErrorLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all requests and their responses
    """

    async def dispatch(
        self,
        request: Request,
        call_next: Callable
    ) -> Response:
        """
        Process the request and log details

        Args:
            request: The incoming request
            call_next: The next middleware or route handler

        Returns:
            The response
        """
        start_time = time.time()

        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path}",
            extra={
                "method": request.method,
                "path": request.url.path,
                "query_params": dict(request.query_params),
                "client": request.client.host if request.client else None
            }
        )

        try:
            # Process request
            response = await call_next(request)

            # Calculate duration
            duration = time.time() - start_time

            # Log response
            log_level = "info" if response.status_code < 400 else "warning"
            log_message = (
                f"Response: {request.method} {request.url.path} "
                f"- {response.status_code} ({duration:.3f}s)"
            )

            getattr(logger, log_level)(
                log_message,
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration": duration
                }
            )

            return response

        except Exception as exc:
            # Log exception
            duration = time.time() - start_time
            logger.error(
                f"Request failed: {request.method} {request.url.path} ({duration:.3f}s)",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "duration": duration,
                    "exception": str(exc)
                },
                exc_info=True
            )
            raise
