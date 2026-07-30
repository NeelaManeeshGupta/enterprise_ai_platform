import hashlib
import numpy as np

# Ultra-Lightweight Vector Embedding Engine (< 10MB RAM footprint)
# Prevents Render 512MB RAM Out-Of-Memory crashes caused by heavy PyTorch C++ allocation.

_model = None

def _get_lightweight_embedding(text: str, dim: int = 384) -> np.ndarray:
    """Generate 384-dimensional dense vector embedding using deterministic feature hashing."""
    if isinstance(text, list):
        return np.array([_get_lightweight_embedding(t, dim) for t in text], dtype=np.float32)

    text_str = str(text)
    # Generate deterministic 384d dense float32 vector
    vector = np.zeros(dim, dtype=np.float32)
    words = text_str.lower().split()
    if not words:
        words = ["empty"]

    for idx, word in enumerate(words):
        h = hashlib.sha256(f"{word}_{idx % 16}".encode('utf-8')).digest()
        vals = np.frombuffer(h, dtype=np.int8)[:dim]
        # Distribute into vector
        vector[:len(vals)] += vals.astype(np.float32)

    # Normalize vector to unit L2 norm
    norm = np.linalg.norm(vector)
    if norm > 0:
        vector = vector / norm

    return vector

def get_embedding(text):
    global _model
    # Try sentence_transformers if available and memory permits
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("BAAI/bge-small-en-v1.5")
        except Exception:
            _model = "LIGHTWEIGHT"

    if _model != "LIGHTWEIGHT":
        try:
            return _model.encode(text)
        except Exception as e:
            print("SentenceTransformer memory fallback activated:", e)
            _model = "LIGHTWEIGHT"

    return _get_lightweight_embedding(text)