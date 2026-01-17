"""
Resume generation endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from typing import Literal

from app.core.logging import get_logger
from app.services.pdf_generator import pdf_generator

logger = get_logger(__name__)

router = APIRouter()


@router.get("/generate", response_class=Response)
async def generate_resume(
    format: Literal["technical", "executive", "onepage"] = Query(
        default="technical",
        description="Resume template format"
    ),
    portfolio_url: str = Query(
        default="https://robert-zeijlon.com",
        description="Portfolio URL for QR code"
    )
):
    """
    Generate and download resume PDF

    - **format**: Choose template type (technical/executive/onepage)
    - **portfolio_url**: URL to encode in QR code

    Returns PDF file for download
    """
    try:
        logger.info(f"Generating {format} resume PDF")

        # Generate PDF
        pdf_bytes = pdf_generator.generate_resume_pdf(
            portfolio_url=portfolio_url,
            template_name=format
        )

        if not pdf_bytes:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate resume PDF"
            )

        # Prepare filename
        filename = f"Robert_Zeijlon_Resume_{format.capitalize()}.pdf"

        # Return PDF as downloadable file
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating resume: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Resume generation failed: {str(e)}"
        )


@router.get("/data")
async def get_resume_data():
    """
    Get structured resume data (for preview/debugging)

    Returns JSON representation of resume content
    """
    try:
        from app.services.resume_service import resume_aggregator

        data = resume_aggregator.get_complete_resume_data()
        return data

    except Exception as e:
        logger.error(f"Error fetching resume data: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch resume data: {str(e)}"
        )
