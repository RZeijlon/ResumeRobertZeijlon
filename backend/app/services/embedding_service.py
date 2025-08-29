"""
Embedding service for generating and managing content embeddings
"""

import os
import asyncio
import hashlib
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
import aiohttp
import json
from dataclasses import dataclass

from app.core.config import settings


@dataclass
class ContentChunk:
    """Represents a chunk of content with metadata"""
    content_id: str
    file_path: str
    content: str
    metadata: Dict[str, Any]
    chunk_index: int = 0


class EmbeddingService:
    """Service for generating and managing embeddings"""
    
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.embedding_model = "text-embedding-3-small"  # OpenAI's latest embedding model
        self.embedding_dimension = 1536
        
    def chunk_content(self, content: str, file_path: str, metadata: Dict[str, Any]) -> List[ContentChunk]:
        """
        Chunk content into smaller pieces for better embedding and retrieval
        """
        # Simple chunking by paragraphs and sections
        chunks = []
        
        # Split by double newlines (paragraphs)
        paragraphs = content.split('\n\n')
        
        current_chunk = ""
        chunk_index = 0
        max_chunk_size = 1000  # Characters
        
        for paragraph in paragraphs:
            # If adding this paragraph would exceed max size, create a new chunk
            if len(current_chunk) + len(paragraph) > max_chunk_size and current_chunk:
                chunk_id = f"{metadata.get('id', 'unknown')}_{chunk_index}"
                chunks.append(ContentChunk(
                    content_id=chunk_id,
                    file_path=file_path,
                    content=current_chunk.strip(),
                    metadata={**metadata, "chunk_index": chunk_index},
                    chunk_index=chunk_index
                ))
                current_chunk = paragraph
                chunk_index += 1
            else:
                current_chunk += "\n\n" + paragraph if current_chunk else paragraph
        
        # Add the last chunk
        if current_chunk.strip():
            chunk_id = f"{metadata.get('id', 'unknown')}_{chunk_index}"
            chunks.append(ContentChunk(
                content_id=chunk_id,
                file_path=file_path,
                content=current_chunk.strip(),
                metadata={**metadata, "chunk_index": chunk_index},
                chunk_index=chunk_index
            ))
        
        return chunks
    
    async def generate_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding using MiniLM or OpenAI API as fallback"""
        # Try MiniLM local model first
        minilm_embedding = await self._generate_minilm_embedding(text)
        if minilm_embedding is not None:
            return minilm_embedding
            
        # Fallback to OpenAI if MiniLM fails and API key is available
        if not self.openai_api_key:
            print("⚠️  No embedding method available (no MiniLM model and no OpenAI API key)")
            return None
        
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.openai_api_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "model": self.embedding_model,
                    "input": text.replace("\n", " "),
                    "encoding_format": "float"
                }
                
                async with session.post(
                    "https://api.openai.com/v1/embeddings",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["data"][0]["embedding"]
                    else:
                        error_text = await response.text()
                        print(f"❌ OpenAI API error {response.status}: {error_text}")
                        return None
                        
        except Exception as e:
            print(f"❌ Error generating embedding: {e}")
            return None
    
    async def _generate_minilm_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding using FastEmbed MiniLM model (local, CPU-friendly)"""
        try:
            # Try importing fastembed
            from fastembed import TextEmbedding
            
            # Initialize model if not already done
            if not hasattr(self, '_minilm_model'):
                print("🔄 Loading FastEmbed MiniLM model: BAAI/bge-small-en-v1.5")
                loop = asyncio.get_event_loop()
                
                # Use a lighter model available in FastEmbed
                self._minilm_model = await loop.run_in_executor(
                    None, 
                    lambda: TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
                )
                self.embedding_dimension = 384  # BGE-small dimension
                print("✅ FastEmbed model loaded successfully")
                print(f"   - Model: BAAI/bge-small-en-v1.5")
                print(f"   - Embedding dimension: {self.embedding_dimension}")
                print(f"   - CPU-optimized ONNX runtime")
            
            # Generate embedding
            clean_text = text.replace("\n", " ").strip()
            if not clean_text:
                return None
                
            print(f"🧮 Generating FastEmbed embedding for text: '{clean_text[:100]}{'...' if len(clean_text) > 100 else ''}'")
            
            loop = asyncio.get_event_loop()
            embeddings = await loop.run_in_executor(
                None,
                lambda: list(self._minilm_model.embed([clean_text]))
            )
            
            embedding_list = embeddings[0].tolist()
            print(f"✅ Generated FastEmbed embedding: dimension={len(embedding_list)}")
            
            return embedding_list
            
        except ImportError:
            print("⚠️  FastEmbed not available, will try OpenAI API")
            return None
        except Exception as e:
            print(f"⚠️  FastEmbed embedding failed: {e}, will try OpenAI API")
            import traceback
            print(f"🔥 Full traceback:\n{traceback.format_exc()}")
            return None
    
    async def generate_embeddings_batch(self, texts: List[str]) -> List[Optional[List[float]]]:
        """Generate embeddings for multiple texts"""
        tasks = [self.generate_embedding(text) for text in texts]
        return await asyncio.gather(*tasks)
    
    def generate_content_hash(self, content: str) -> str:
        """Generate a hash for content to detect changes"""
        return hashlib.md5(content.encode()).hexdigest()
    
    def extract_metadata_from_content(self, content: str, file_path: str) -> Dict[str, Any]:
        """Extract metadata from markdown content"""
        metadata = {
            "file_path": file_path,
            "content_hash": self.generate_content_hash(content)
        }
        
        # Extract frontmatter if present
        if content.startswith('---'):
            try:
                end_index = content.find('---', 3)
                if end_index != -1:
                    frontmatter = content[3:end_index].strip()
                    for line in frontmatter.split('\n'):
                        if ':' in line:
                            key, value = line.split(':', 1)
                            metadata[key.strip()] = value.strip().strip('"\'')
            except Exception as e:
                print(f"⚠️  Error parsing frontmatter in {file_path}: {e}")
        
        # Infer section type from file path
        if 'sections/' in file_path:
            metadata['type'] = 'section'
            metadata['section'] = Path(file_path).stem
        elif 'components/skills/' in file_path:
            metadata['type'] = 'skill'
            metadata['category'] = 'skills'
        elif 'components/projects/' in file_path:
            metadata['type'] = 'project'
            metadata['category'] = 'projects'
        elif 'rag-knowledge-base/' in file_path:
            metadata['type'] = 'knowledge'
            metadata['category'] = 'knowledge_base'
        else:
            metadata['type'] = 'content'
        
        return metadata


# Global instance
embedding_service = EmbeddingService()