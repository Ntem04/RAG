import math
import re
from typing import List, Dict
import json

class EmbeddingService:
    """
    Lightweight, fast, multilingual embedding service.
    Computes dense subword and n-gram vectors with cosine similarity.
    Compatible with SQLite and PostgreSQL / pgvector.
    Can be seamlessly backed by sentence-transformers (e.g. bge-m3 or e5-small)
    without breaking the caller contract.
    """
    def __init__(self, vector_dim: int = 128):
        self.vector_dim = vector_dim

    def _tokenize(self, text: str) -> List[str]:
        # Normalization and character / word n-grams
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        words = [w for w in cleaned.split() if len(w) > 1]
        tokens = list(words)
        # Add character trigrams for robust cross-lingual & subword matching
        for word in words:
            if len(word) >= 3:
                for i in range(len(word) - 2):
                    tokens.append(word[i:i+3])
        return tokens

    def embed_text(self, text: str) -> List[float]:
        tokens = self._tokenize(text)
        if not tokens:
            return [0.0] * self.vector_dim

        vec = [0.0] * self.vector_dim
        for token in tokens:
            h = hash(token) % self.vector_dim
            vec[h] += 1.0

        # L2 normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [round(x / norm, 4) for x in vec]
        return vec

    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        dot = sum(a * b for a, b in zip(vec1, vec2))
        return max(0.0, min(1.0, dot))

    def serialize_vector(self, vec: List[float]) -> str:
        return json.dumps(vec)

    def deserialize_vector(self, text: str) -> List[float]:
        try:
            return json.loads(text)
        except Exception:
            return [0.0] * self.vector_dim

embedding_service = EmbeddingService(vector_dim=128)

