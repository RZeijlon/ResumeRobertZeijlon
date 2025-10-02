"""
Transcription service using Groq's Whisper API
"""

import os
import aiohttp
from typing import BinaryIO

from app.core.logging import get_logger

logger = get_logger(__name__)


class TranscriptionService:
    """Service for transcribing audio using Groq's Whisper API"""

    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.model = "whisper-large-v3-turbo"
        self.api_url = "https://api.groq.com/openai/v1/audio/transcriptions"

    async def transcribe_audio(
        self,
        audio_file: BinaryIO,
        filename: str,
        language: str = "en"
    ) -> str:
        """
        Transcribe audio file using Groq's Whisper API

        Args:
            audio_file: Audio file binary stream
            filename: Original filename
            language: ISO-639-1 language code (default: "en")

        Returns:
            Transcribed text
        """
        if not self.groq_api_key:
            logger.error("Groq API key not configured")
            raise ValueError("Transcription service is not configured. Please check the API key settings.")

        try:
            # Prepare multipart form data
            form_data = aiohttp.FormData()
            form_data.add_field('file', audio_file, filename=filename)
            form_data.add_field('model', self.model)
            form_data.add_field('language', language)
            form_data.add_field('response_format', 'json')

            headers = {
                "Authorization": f"Bearer {self.groq_api_key}"
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_url,
                    headers=headers,
                    data=form_data
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        transcribed_text = data.get("text", "")
                        logger.info(f"Successfully transcribed audio: {len(transcribed_text)} characters")
                        return transcribed_text
                    else:
                        error_text = await response.text()
                        logger.error(f"Groq transcription API error {response.status}: {error_text}")
                        raise Exception(f"Transcription failed with status {response.status}: {error_text}")

        except aiohttp.ClientError as e:
            logger.error(f"HTTP error during transcription: {e}")
            raise Exception(f"Failed to connect to transcription service: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during transcription: {e}")
            raise


# Global instance
transcription_service = TranscriptionService()
