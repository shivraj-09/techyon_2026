import httpx

from app.core.config import settings
from fastapi import APIRouter, Depends, HTTPException, status
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
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    """Return active school memberships visible to the signed-in user under RLS."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    memberships = await fetch_active_memberships(current_user, credentials)
    return {
        "success": True,
        "memberships": memberships,
    }

@router.get("/pending-invitations")
async def read_my_pending_invitations(
    current_user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    """Return only this signed-in user's pending school invitations under RLS."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/school_memberships",
                headers={
                    "apikey": settings.SUPABASE_PUBLISHABLE_KEY,
                    "Authorization": f"Bearer {credentials.credentials}",
                },
                params={
                    "select": "id,school_id,role,status",
                    "user_id": f"eq.{current_user['id']}",
                    "status": "eq.invited",
                    "order": "created_at.asc",
                },
            )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Invitation service temporarily unavailable",
        )

    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not verify pending invitations",
        )

    try:
        invitations = response.json()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Invalid invitation service response",
        )

    if not isinstance(invitations, list):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Invalid invitation service response",
        )

    return {"success": True, "invitations": invitations}
