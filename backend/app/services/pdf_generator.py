"""
PDF Generation service using WeasyPrint
"""

import io
import base64
from pathlib import Path
from typing import Optional
from datetime import datetime

from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML, CSS
import qrcode

from app.core.logging import get_logger
from app.services.resume_service import resume_aggregator

logger = get_logger(__name__)


class PDFGenerator:
    """Generates PDF resumes from HTML templates"""

    def __init__(self, templates_dir: str = "/app/app/templates"):
        self.templates_dir = Path(templates_dir)
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(self.templates_dir)),
            autoescape=True
        )

    def _generate_qr_code(self, url: str) -> str:
        """Generate QR code as base64 encoded image"""
        try:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(url)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")

            # Convert to base64
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            img_base64 = base64.b64encode(buffer.read()).decode()

            return img_base64
        except Exception as e:
            logger.error(f"Failed to generate QR code: {e}")
            return ""

    def _load_css(self) -> str:
        """Load the base CSS file"""
        try:
            css_file = self.templates_dir / "resume_base.css"
            with open(css_file, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Failed to load CSS: {e}")
            return ""

    def generate_resume_pdf(
        self,
        portfolio_url: str = "https://robert-zeijlon.com",
        template_name: str = "technical"
    ) -> Optional[bytes]:
        """
        Generate PDF resume

        Args:
            portfolio_url: URL to encode in QR code
            template_name: Template type ('technical', 'executive', 'onepage')

        Returns:
            PDF bytes or None if generation fails
        """
        try:
            # Get resume data
            resume_data = resume_aggregator.get_complete_resume_data()

            # Generate QR code
            qr_code = self._generate_qr_code(portfolio_url)

            # Load CSS
            css_content = self._load_css()

            # Prepare template context
            context = {
                **resume_data,
                'qr_code': qr_code,
                'css': css_content,
                'generated_date': datetime.now().strftime('%B %d, %Y')
            }

            # Render HTML template
            template = self.jinja_env.get_template(f'resume_{template_name}.html')
            html_content = template.render(context)

            # Generate PDF using WeasyPrint
            pdf_bytes = HTML(string=html_content).write_pdf()

            logger.info(f"Successfully generated {template_name} resume PDF")
            return pdf_bytes

        except Exception as e:
            logger.error(f"Failed to generate resume PDF: {e}", exc_info=True)
            return None


# Global instance
pdf_generator = PDFGenerator()
