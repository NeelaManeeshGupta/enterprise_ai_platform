import faiss
import numpy as np
import json
import os
from app.embeddings import get_embedding

INDEX_PATH="storage/index.faiss"
CHUNKS_PATH="storage/chunks.json"

class VectorStore:
    def __init__(self):
        self.index = None
        self.stored_chunks = []
        self.load()

    def create_index(self, embeddings, chunks):
        dimension = embeddings.shape[1]
        if self.index is None:
            self.index = faiss.IndexFlatL2(dimension)
        self.index.add(
            np.array(embeddings).astype("float32")
        )
        self.stored_chunks.extend(chunks)
        self.save()
        print("Index created and saved")  

    def save(self):
        faiss.write_index(
            self.index,
            INDEX_PATH
        )
        with open(CHUNKS_PATH, "w", encoding="utf-8") as f:
            json.dump(
                self.stored_chunks,
                f,
                ensure_ascii=False,
                indent=2
            )
    def load(self):

        if os.path.exists(INDEX_PATH):

            self.index = faiss.read_index(
                INDEX_PATH
            )

            with open(CHUNKS_PATH,"r",encoding="utf-8") as f:
                self.stored_chunks=json.load(f)

            print("Vector store loaded")

        else:
            print("No existing vector store") 

    def delete_document(self, filename):

            # remove chunks belonging to document
            remaining_chunks = [
                chunk
                for chunk in self.stored_chunks
                if chunk["metadata"]["filename"] != filename
            ]

            if len(remaining_chunks) == len(self.stored_chunks):
                return False


            self.stored_chunks = remaining_chunks


            # rebuild FAISS index
            if self.stored_chunks:

                texts = [
                    chunk["text"]
                    for chunk in self.stored_chunks
                ]

                embeddings = get_embedding(texts)

                dimension = embeddings.shape[1]

                self.index = faiss.IndexFlatL2(dimension)

                self.index.add(
                    np.array(embeddings).astype("float32")
                )

            else:
                self.index = None


            self.save()

            return True                   

vector_store = VectorStore()
 