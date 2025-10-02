"""
Chat service for generating AI responses using Groq API
"""

import os
from typing import Optional
import aiohttp

from app.core.logging import get_logger

logger = get_logger(__name__)


class ChatService:
    """Service for generating chat responses using LLM"""

    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.system_prompt = self._create_system_prompt()
        self.model = "llama-3.3-70b-versatile"
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"

    def _create_system_prompt(self) -> str:
        """Create the system prompt for the AI assistant"""
        return """You are an AI assistant representing Robert Zeijlon's professional portfolio. You are knowledgeable about his:

- Technical skills in AI/ML, software development, and infrastructure
- Professional projects and achievements
- Career background and experience
- Personal philosophy and approach to technology
- Contact information and availability

Guidelines:
1. Provide helpful, accurate information based on the context provided
2. If asked about something not in the context, politely say you don't have that specific information
3. Be professional but friendly and conversational
4. Focus on Robert's technical capabilities and professional experience
5. Encourage visitors to reach out if they're interested in collaboration

Always base your responses on the provided context about Robert's background and experience."""

    async def generate_response(
        self,
        query: str,
        context: str,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> str:
        """
        Generate AI response using Groq API

        Args:
            query: User query
            context: Formatted context for the LLM
            temperature: Sampling temperature (0.0-1.0)
            max_tokens: Maximum response length

        Returns:
            AI-generated response
        """
        if not self.groq_api_key:
            logger.error("Groq API key not configured")
            return "I'm sorry, but the AI service is not configured. Please check the API key settings."

        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.groq_api_key}",
                    "Content-Type": "application/json"
                }

                messages = [
                    {"role": "system", "content": self.system_prompt},
                    {"role": "system", "content": f"Context:\n{context}"},
                    {"role": "user", "content": query}
                ]

                payload = {
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }

                async with session.post(
                    self.api_url,
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        response_text = data["choices"][0]["message"]["content"]
                        logger.info("Successfully generated chat response")
                        return response_text
                    else:
                        error_text = await response.text()
                        logger.error(f"Groq API error {response.status}: {error_text}")
                        return "I'm experiencing technical difficulties. Please try again later."

        except aiohttp.ClientError as e:
            logger.error(f"HTTP error generating response: {e}")
            return "I'm sorry, I couldn't connect to the AI service. Please try again."
        except Exception as e:
            logger.error(f"Unexpected error generating response: {e}")
            return "I'm sorry, I encountered an error. Please try again."


# Global instance
chat_service = ChatService()
