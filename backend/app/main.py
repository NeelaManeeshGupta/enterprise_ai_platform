from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.upload import router as upload_router
from app.chat import router as chat_router
from app.documents import router as documents_router
from app.auth import router as auth_router
from app.workspaces import router as workspaces_router

app = FastAPI(
    title="Enterprise AI Knowledge Platform",
    version="1.0.0"
)

# Cross-Origin Resource Sharing (CORS) Middleware configured for production web browsers
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(chat_router)
app.include_router(documents_router)
app.include_router(auth_router)
app.include_router(workspaces_router)

@app.get('/')
def root():
    return {'message': "Backend is running"}

@app.get('/health')
def health():
    return {'status': "healthy"}
