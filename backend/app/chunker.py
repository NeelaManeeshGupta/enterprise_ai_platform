try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    _splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    def chunk_text(text: str):
        return _splitter.split_text(text)
except ImportError:
    def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200):
        """Pure Python fallback recursive character text splitter."""
        if not text:
            return []
        chunks = []
        start = 0
        text_len = len(text)
        while start < text_len:
            end = min(start + chunk_size, text_len)
            chunks.append(text[start:end])
            start += chunk_size - chunk_overlap
        return chunks