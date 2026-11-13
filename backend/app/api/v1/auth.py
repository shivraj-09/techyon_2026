from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials

from app.core.authorization import fetch_active_memberships
from app.core.security import bearer_scheme, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/me")
async def read_current_user(current_user: dict = Depends(get_current_user)):
    """Return the identity associated with the verified Supabase access token."""
    return {
        "success": True,
        "user": current_user,
    }


@router.get("/memberships")
async def read_my_memberships(
    current_user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Return active school memberships visible to the signed-in user under RLS."""
    memberships = await fetch_active_memberships(current_user, credentials)
    return {
        "success": True,
        "memberships": memberships,
    }
