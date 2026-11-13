from fastapi import APIRouter, Depends

from app.core.security import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/me")
async def read_current_user(current_user: dict = Depends(get_current_user)):
    """Return the identity associated with the verified Supabase access token."""
    return {
        "success": True,
        "user": current_user,
    }
