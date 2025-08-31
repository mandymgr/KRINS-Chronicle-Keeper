"""
OpenAI Embeddings Service for Semantic Search
"""

import asyncio
import logging
from typing import List, Optional, Dict, Any
import openai
from openai import AsyncOpenAI
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmbeddingsService:
    """Service for generating and managing OpenAI embeddings"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        self.model = settings.OPENAI_MODEL
        self.dimension = settings.EMBEDDING_DIMENSION
        
    async def generate_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding for a single text"""
        if not self.client:
            logger.warning("OpenAI API key not configured - cannot generate embeddings")
            return None
            
        try:
            # Clean and prepare text
            clean_text = self._prepare_text(text)
            if not clean_text:
                return None
                
            # Generate embedding
            response = await self.client.embeddings.create(
                input=clean_text,
                model=self.model
            )
            
            embedding = response.data[0].embedding
            logger.debug(f"Generated embedding with {len(embedding)} dimensions")
            return embedding
            
        except Exception as error:
            logger.error(f"Failed to generate embedding: {error}")
            return None
    
    async def generate_batch_embeddings(
        self, 
        texts: List[str], 
        batch_size: int = None
    ) -> List[Optional[List[float]]]:
        """Generate embeddings for multiple texts in batches"""
        if not self.client:
            logger.warning("OpenAI API key not configured - cannot generate embeddings")
            return [None] * len(texts)
        
        batch_size = batch_size or settings.EMBEDDING_BATCH_SIZE
        results = []
        
        # Process in batches to respect rate limits
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_results = await self._process_batch(batch)
            results.extend(batch_results)
            
            # Small delay between batches to respect rate limits
            if i + batch_size < len(texts):
                await asyncio.sleep(0.1)
        
        return results
    
    async def _process_batch(self, texts: List[str]) -> List[Optional[List[float]]]:
        """Process a single batch of texts"""
        try:
            # Clean texts
            clean_texts = [self._prepare_text(text) for text in texts]
            valid_texts = [text for text in clean_texts if text]
            
            if not valid_texts:
                return [None] * len(texts)
            
            # Generate embeddings
            response = await self.client.embeddings.create(
                input=valid_texts,
                model=self.model
            )
            
            embeddings = [data.embedding for data in response.data]
            logger.info(f"Generated {len(embeddings)} embeddings in batch")
            
            # Map back to original positions
            result = []
            embedding_idx = 0
            for clean_text in clean_texts:
                if clean_text:
                    result.append(embeddings[embedding_idx])
                    embedding_idx += 1
                else:
                    result.append(None)
            
            return result
            
        except Exception as error:
            logger.error(f"Failed to process embedding batch: {error}")
            return [None] * len(texts)
    
    def _prepare_text(self, text: str) -> Optional[str]:
        """Clean and prepare text for embedding"""
        if not text or not isinstance(text, str):
            return None
        
        # Remove excessive whitespace and clean
        clean_text = ' '.join(text.strip().split())
        
        # Skip very short texts
        if len(clean_text) < 10:
            return None
            
        # Truncate very long texts (OpenAI has token limits)
        if len(clean_text) > 8000:
            clean_text = clean_text[:8000] + "..."
            
        return clean_text
    
    async def search_similar_vectors(
        self,
        db: AsyncSession,
        query_embedding: List[float],
        table_name: str,
        embedding_column: str = "embedding",
        similarity_threshold: float = 0.7,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Search for similar vectors using cosine similarity"""
        try:
            # Convert embedding to string format for SQL
            embedding_str = str(query_embedding)
            
            # Try pgvector cosine similarity first
            pgvector_query = text(f"""
                SELECT *, (1 - ({embedding_column} <=> :query_embedding::vector)) as similarity
                FROM {table_name}
                WHERE {embedding_column} IS NOT NULL
                AND (1 - ({embedding_column} <=> :query_embedding::vector)) >= :threshold
                ORDER BY {embedding_column} <=> :query_embedding::vector
                LIMIT :limit
            """)
            
            try:
                result = await db.execute(
                    pgvector_query,
                    {
                        "query_embedding": embedding_str,
                        "threshold": similarity_threshold,
                        "limit": limit
                    }
                )
                rows = result.fetchall()
                logger.info(f"pgvector search returned {len(rows)} results")
                return [dict(row._mapping) for row in rows]
                
            except Exception as pgvector_error:
                logger.warning(f"pgvector search failed, using fallback: {pgvector_error}")
                
                # Fallback to manual cosine similarity calculation
                fallback_query = text(f"""
                    SELECT * FROM {table_name}
                    WHERE {embedding_column} IS NOT NULL
                    LIMIT 1000
                """)
                
                result = await db.execute(fallback_query)
                rows = result.fetchall()
                
                # Calculate similarities manually
                results = []
                for row in rows:
                    row_dict = dict(row._mapping)
                    embedding = row_dict.get(embedding_column)
                    
                    if embedding:
                        similarity = self._cosine_similarity(query_embedding, embedding)
                        if similarity >= similarity_threshold:
                            row_dict['similarity'] = similarity
                            results.append(row_dict)
                
                # Sort by similarity and limit
                results.sort(key=lambda x: x['similarity'], reverse=True)
                logger.info(f"Fallback search returned {len(results[:limit])} results")
                return results[:limit]
                
        except Exception as error:
            logger.error(f"Vector search failed: {error}")
            return []
    
    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        try:
            if isinstance(b, str):
                # Handle string representation of vector
                b = eval(b) if b.startswith('[') else b
            
            a_np = np.array(a)
            b_np = np.array(b)
            
            dot_product = np.dot(a_np, b_np)
            norm_a = np.linalg.norm(a_np)
            norm_b = np.linalg.norm(b_np)
            
            if norm_a == 0 or norm_b == 0:
                return 0.0
                
            return float(dot_product / (norm_a * norm_b))
            
        except Exception:
            return 0.0
    
    async def create_vector_index(self, db: AsyncSession, table_name: str, column_name: str = "embedding"):
        """Create vector index for better performance"""
        try:
            # Try to create pgvector index
            index_query = text(f"""
                CREATE INDEX IF NOT EXISTS idx_{table_name}_{column_name}_cosine 
                ON {table_name} USING ivfflat ({column_name} vector_cosine_ops) 
                WITH (lists = 100)
            """)
            
            await db.execute(index_query)
            await db.commit()
            logger.info(f"Created vector index for {table_name}.{column_name}")
            
        except Exception as error:
            logger.warning(f"Could not create vector index: {error}")
    
    def is_available(self) -> bool:
        """Check if embeddings service is available"""
        return self.client is not None