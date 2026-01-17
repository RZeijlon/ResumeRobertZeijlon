# FastAPI Backend Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
# WeasyPrint requires: libpango, libcairo, libgdk-pixbuf, gobject for PDF generation
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libpangoft2-1.0-0 \
    libcairo2 \
    libgdk-pixbuf-2.0-0 \
    libgobject-2.0-0 \
    libglib2.0-0t64 \
    libffi-dev \
    shared-mime-info \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Create non-root user for security
RUN useradd -m -u 1001 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]