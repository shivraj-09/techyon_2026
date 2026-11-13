
from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Backend API for EduSync"
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to EduSync API",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "edusync-backend"
    }
