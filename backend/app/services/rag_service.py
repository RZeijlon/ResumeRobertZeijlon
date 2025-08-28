"""
RAG (Retrieval Augmented Generation) service for context-aware chat responses
"""

import asyncio
import asyncpg
from typing import List, Dict, Any, Optional, Tuple
import json
import os
from pathlib import Path

from app.core.config import settings
from app.services.embedding_service import embedding_service, ContentChunk
from app.services.content_service import content_service
from app.utils.markdown import parse_frontmatter


class VectorStore:
    """Vector database operations for embeddings"""
    
    def __init__(self):
        self.connection_pool: Optional[asyncpg.Pool] = None
    
    async def initialize(self):
        """Initialize database connection pool"""
        try:
            self.connection_pool = await asyncpg.create_pool(
                settings.VECTOR_DB_URL,
                min_size=1,
                max_size=10,
                command_timeout=60
            )
            print("✅ Vector store initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize vector store: {e}")
    
    async def close(self):
        """Close database connections"""
        if self.connection_pool:
            await self.connection_pool.close()
    
    async def store_embedding(self, chunk: ContentChunk, embedding: List[float]) -> bool:
        """Store content chunk and its embedding in the database"""
        if not self.connection_pool:
            await self.initialize()
        
        try:
            async with self.connection_pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO content_embeddings 
                    (content_id, file_path, content, metadata, embedding)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (content_id) DO UPDATE SET
                        content = EXCLUDED.content,
                        metadata = EXCLUDED.metadata,
                        embedding = EXCLUDED.embedding,
                        updated_at = NOW()
                """, chunk.content_id, chunk.file_path, chunk.content, 
                    json.dumps(chunk.metadata), embedding)
            return True
        except Exception as e:
            print(f"❌ Error storing embedding: {e}")
            return False
    
    async def similarity_search(self, query_embedding: List[float], limit: int = 5, threshold: float = 0.7) -> List[Dict[str, Any]]:
        """Perform similarity search for relevant content"""
        if not self.connection_pool:
            await self.initialize()
        
        try:
            async with self.connection_pool.acquire() as conn:
                results = await conn.fetch("""
                    SELECT content_id, file_path, content, metadata,
                           1 - (embedding <=> $1::vector) as similarity
                    FROM content_embeddings
                    WHERE 1 - (embedding <=> $1::vector) > $3
                    ORDER BY embedding <=> $1::vector
                    LIMIT $2
                """, query_embedding, limit, threshold)
                
                return [
                    {
                        "content_id": row["content_id"],
                        "file_path": row["file_path"],
                        "content": row["content"],
                        "metadata": row["metadata"],
                        "similarity": float(row["similarity"])
                    }
                    for row in results
                ]
        except Exception as e:
            print(f"❌ Error in similarity search: {e}")
            return []
    
    async def get_content_by_type(self, content_type: str) -> List[Dict[str, Any]]:
        """Get content by type (section, skill, project, etc.)"""
        if not self.connection_pool:
            await self.initialize()
        
        try:
            async with self.connection_pool.acquire() as conn:
                results = await conn.fetch("""
                    SELECT content_id, file_path, content, metadata
                    FROM content_embeddings
                    WHERE metadata->>'type' = $1
                    ORDER BY content_id
                """, content_type)
                
                return [
                    {
                        "content_id": row["content_id"],
                        "file_path": row["file_path"],
                        "content": row["content"],
                        "metadata": row["metadata"]
                    }
                    for row in results
                ]
        except Exception as e:
            print(f"❌ Error fetching content by type: {e}")
            return []


class RAGService:
    """Main RAG service for content-aware chat responses"""
    
    def __init__(self):
        self.vector_store = VectorStore()
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.system_prompt = self._create_system_prompt()
    
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

    async def initialize(self):
        """Initialize the RAG service"""
        await self.vector_store.initialize()
        print("✅ RAG service initialized")
    
    async def process_content_directory(self, force_refresh: bool = False) -> Dict[str, Any]:
        """Process all content files and generate embeddings"""
        print("🔄 Processing content directory for embeddings...")
        
        content_path = Path(settings.CONTENT_PATH)
        if not content_path.exists():
            return {"error": "Content directory not found"}
        
        stats = {
            "processed_files": 0,
            "generated_embeddings": 0,
            "errors": 0,
            "skipped": 0
        }
        
        # Process all markdown files
        markdown_files = list(content_path.rglob("*.md"))
        
        for file_path in markdown_files:
            try:
                relative_path = file_path.relative_to(content_path)
                
                # Read file content
                content = file_path.read_text(encoding='utf-8')
                
                # Extract metadata
                metadata = embedding_service.extract_metadata_from_content(content, str(relative_path))
                metadata['id'] = str(relative_path).replace('/', '_').replace('.md', '')
                
                # Chunk content
                chunks = embedding_service.chunk_content(content, str(relative_path), metadata)
                
                # Generate embeddings for each chunk
                for chunk in chunks:
                    embedding = await embedding_service.generate_embedding(chunk.content)
                    if embedding:
                        success = await self.vector_store.store_embedding(chunk, embedding)
                        if success:
                            stats["generated_embeddings"] += 1
                        else:
                            stats["errors"] += 1
                    else:
                        stats["skipped"] += 1
                
                stats["processed_files"] += 1
                print(f"✅ Processed {relative_path} ({len(chunks)} chunks)")
                
            except Exception as e:
                print(f"❌ Error processing {file_path}: {e}")
                stats["errors"] += 1
        
        print(f"📊 Content processing complete: {stats}")
        return stats
    
    async def retrieve_context(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Retrieve relevant context for a query"""
        # Generate embedding for the query
        query_embedding = await embedding_service.generate_embedding(query)
        if not query_embedding:
            print("⚠️  Could not generate embedding for query")
            return []
        
        # Search for similar content
        results = await self.vector_store.similarity_search(
            query_embedding, 
            limit=max_results,
            threshold=0.3  # Lower threshold for more results
        )
        
        return results
    
    def format_context(self, context_results: List[Dict[str, Any]]) -> str:
        """Format retrieved context for the LLM"""
        if not context_results:
            return "No specific context available."
        
        formatted_context = "Relevant information about Robert Zeijlon:\n\n"
        
        for i, result in enumerate(context_results, 1):
            metadata = result.get("metadata", {})
            content_type = metadata.get("type", "content")
            section = metadata.get("section", "")
            similarity = result.get("similarity", 0)
            
            formatted_context += f"{i}. [{content_type.title()}] "
            if section:
                formatted_context += f"({section}) "
            formatted_context += f"(relevance: {similarity:.2f})\n"
            formatted_context += f"{result['content']}\n\n"
        
        return formatted_context
    
    async def generate_response(self, query: str, context: str) -> str:
        """Generate AI response using Groq API"""
        if not self.groq_api_key:
            return "I'm sorry, but the AI service is not configured. Please check the API key settings."
        
        try:
            import aiohttp
            
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
                    "model": "llama-3.3-70b-versatile",  # Groq's best model
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 1000
                }
                
                async with session.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["choices"][0]["message"]["content"]
                    else:
                        error_text = await response.text()
                        print(f"❌ Groq API error {response.status}: {error_text}")
                        return "I'm experiencing technical difficulties. Please try again later."
                        
        except Exception as e:
            print(f"❌ Error generating response: {e}")
            return "I'm sorry, I encountered an error. Please try again."
    
    async def chat(self, query: str) -> Dict[str, Any]:
        """Main chat method with RAG"""
        # Retrieve relevant context
        context_results = await self.retrieve_context(query)
        
        # Format context for LLM
        context = self.format_context(context_results)
        
        # Generate response
        response = await self.generate_response(query, context)
        
        return {
            "response": response,
            "sources": [
                {
                    "content_id": result["content_id"],
                    "file_path": result["file_path"],
                    "similarity": result["similarity"],
                    "type": result.get("metadata", {}).get("type", "content")
                }
                for result in context_results
            ],
            "context_used": len(context_results) > 0
        }


# Global instance
rag_service = RAGService()