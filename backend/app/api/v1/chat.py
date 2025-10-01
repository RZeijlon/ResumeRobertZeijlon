"""
Chat and RAG API endpoints
"""

from fastapi import APIRouter
import uuid
from datetime import datetime
import os
import traceback

from app.schemas import ChatRequest, ChatResponse
from app.services.rag_service import rag_service
from app.core.logging import get_logger
from app.core.exceptions import RAGServiceError, ConfigurationError

logger = get_logger(__name__)
router = APIRouter()


@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    """
    Process chat message with RAG support
    """
    logger.info(f"Chat request received: message='{request.message[:50]}...'")

    try:
        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or str(uuid.uuid4())
        logger.debug(f"Conversation ID: {conversation_id}")

        # Check if RAG is enabled and API keys are available
        rag_enabled = (
            request.use_rag and
            os.getenv("RAG_ENABLED", "false").lower() == "true" and
            (os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY"))
        )

        logger.debug(f"RAG enabled: {rag_enabled} (request.use_rag={request.use_rag}, "
                    f"GROQ={bool(os.getenv('GROQ_API_KEY'))}, "
                    f"OpenAI={bool(os.getenv('OPENAI_API_KEY'))})")

        if rag_enabled:
            try:
                logger.info("Initializing RAG service...")
                await rag_service.initialize()

                logger.info(f"Processing RAG query: '{request.message[:100]}...'")
                rag_result = await rag_service.chat(request.message)

                logger.info(f"RAG response generated: {len(rag_result.get('response', ''))} chars, "
                           f"{len(rag_result.get('sources', []))} sources")

                response = ChatResponse(
                    message=rag_result["response"],
                    conversation_id=conversation_id,
                    sources=rag_result.get("sources", []),
                    timestamp=datetime.now()
                )
                return response

            except Exception as e:
                logger.error(f"RAG error: {e.__class__.__name__}: {str(e)}")
                logger.debug(f"RAG traceback: {traceback.format_exc()}")
                # Raise RAG error instead of falling back
                raise RAGServiceError(
                    message=f"Failed to process RAG query: {str(e)}",
                    details={"original_error": str(e), "error_type": e.__class__.__name__}
                )
        else:
            logger.info("Using basic response (RAG disabled)")
            response_text = generate_basic_response(request.message)

        response = ChatResponse(
            message=response_text,
            conversation_id=conversation_id,
            sources=[],
            timestamp=datetime.now()
        )
        logger.info("Chat request completed successfully")
        return response

    except RAGServiceError:
        # Re-raise RAG errors (already handled)
        raise
    except Exception as e:
        logger.error(f"Chat request failed: {e.__class__.__name__}: {str(e)}")
        logger.debug(f"Full traceback: {traceback.format_exc()}")
        # Wrap unexpected errors
        raise RAGServiceError(
            message="Chat processing failed",
            details={"error": str(e), "error_type": e.__class__.__name__}
        )


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


@router.post("/initialize-rag")
async def initialize_rag_system():
    """Initialize the RAG system by processing all content and generating embeddings"""
    try:
        # Initialize the RAG service
        await rag_service.initialize()

        # Process all content and generate embeddings
        stats = await rag_service.process_content_directory(force_refresh=True)

        return {
            "status": "success",
            "message": "RAG system initialized successfully",
            "stats": stats
        }

    except Exception as e:
        raise RAGServiceError(
            message="RAG initialization failed",
            details={"error": str(e), "error_type": e.__class__.__name__}
        )


@router.get("/rag-status")
async def get_rag_status():
    """Get the current status of the RAG system"""
    try:
        # Check if environment variables are set
        groq_key = bool(os.getenv("GROQ_API_KEY"))
        openai_key = bool(os.getenv("OPENAI_API_KEY"))
        rag_enabled = os.getenv("RAG_ENABLED", "false").lower() == "true"
        
        # Count embeddings in database
        await rag_service.initialize()
        vector_store = rag_service.vector_store
        
        embedding_count = 0
        if vector_store.connection_pool:
            async with vector_store.connection_pool.acquire() as conn:
                result = await conn.fetchrow("SELECT COUNT(*) as count FROM content_embeddings")
                embedding_count = result["count"]
        
        return {
            "rag_enabled": rag_enabled,
            "groq_api_key": groq_key,
            "openai_api_key": openai_key,
            "embedding_count": embedding_count,
            "status": "ready" if (rag_enabled and (groq_key or openai_key) and embedding_count > 0) else "not_ready"
        }
    
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
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