from fastapi import APIRouter

from app.api.v1 import auth, classes, memberships

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(memberships.router)
api_router.include_router(classes.router)
