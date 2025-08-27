"""
Chat and RAG API endpoints
"""

from fastapi import APIRouter, HTTPException
import uuid
from datetime import datetime

from app.models.chat import ChatRequest, ChatResponse
from app.services.content_service import content_service
from app.core.config import settings

router = APIRouter()


@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    """
    Process chat message (basic implementation without RAG for now)
    """
    try:
        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # For now, return a simple response until RAG is implemented
        response_text = generate_basic_response(request.message)
        
        return ChatResponse(
            message=response_text,
            conversation_id=conversation_id,
            sources=None if not request.use_rag else [],
            timestamp=datetime.now()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")


@router.get("/context/{conversation_id}")
async def get_conversation_context(conversation_id: str):
    """Get conversation context (placeholder for now)"""
    return {
        "conversation_id": conversation_id,
        "message": "Conversation context endpoint - to be implemented with RAG"
    }


@router.delete("/context/{conversation_id}")
async def clear_conversation_context(conversation_id: str):
    """Clear conversation context (placeholder for now)"""
    return {
        "conversation_id": conversation_id,
        "message": "Conversation context cleared"
    }


def generate_basic_response(message: str) -> str:
    """
    Generate a basic response without LLM (temporary implementation)
    """
    message_lower = message.lower()
    
    # Simple keyword-based responses
    if any(word in message_lower for word in ['hello', 'hi', 'hey']):
        return "Hi! I'm Robert's AI assistant. I can help answer questions about his background, skills, and projects. What would you like to know?"
    
    elif any(word in message_lower for word in ['skills', 'technologies', 'tech stack']):
        return "Robert specializes in AI/ML technologies including TensorFlow, PyTorch, and scikit-learn. He also works with React, FastAPI, Kubernetes, and various cloud platforms. Would you like to know more about any specific area?"
    
    elif any(word in message_lower for word in ['projects', 'work', 'portfolio']):
        return "Robert's featured projects include Transcriptomatic (a speech-to-text evaluation platform) and a custom AI server build. Both showcase his skills in AI/ML, full-stack development, and infrastructure. Would you like details about either project?"
    
    elif any(word in message_lower for word in ['contact', 'email', 'linkedin', 'github']):
        return "You can reach Robert via email at robert.zeijlon.92@gmail.com, LinkedIn (robert-zeijlon-14015928b), or GitHub (@RZeijlon). He's also available by phone at 072-233 16 26."
    
    elif any(word in message_lower for word in ['experience', 'background', 'about']):
        return "Robert is a recent AI Developer graduate specializing in artificial intelligence and machine learning. He's passionate about local AI models and self-hosted solutions, with a focus on building robust AI solutions from research to production."
    
    else:
        return "I'd be happy to help! I can answer questions about Robert's background, skills, projects, and experience. Feel free to ask about his AI/ML expertise, development projects, or how to get in touch with him."