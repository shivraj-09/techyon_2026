from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.authorization import require_school_roles
from app.core.config import settings
from app.core.security import bearer_scheme, get_current_user
from app.schemas.membership import InviteMemberRequest
from app.services.invitations import invite_school_member

router = APIRouter(prefix="/schools", tags=["School Members"])


@router.post(
    "/{school_id}/members/invite",
    status_code=status.HTTP_201_CREATED,
)
async def invite_member(
    school_id: UUID,
    payload: InviteMemberRequest,
    _admin_membership: dict = Depends(require_school_roles("admin")),
):
    """Invite a teacher or parent. Only active school admins can do this."""
    result = await invite_school_member(
        school_id=str(school_id),
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
    )
    return {"success": True, "invitation": result}


@router.post("/{school_id}/members/accept")
async def accept_invitation(
    school_id: UUID,
    current_user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    """Activate only the signed-in, email-confirmed user's pending membership."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not current_user.get("email_confirmed_at"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accept the invitation and confirm your email before activating membership",
        )

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/rpc/accept_school_invitation",
                headers={
                    "apikey": settings.SUPABASE_PUBLISHABLE_KEY,
                    "Authorization": f"Bearer {credentials.credentials}",
                    "Content-Type": "application/json",
                },
                json={"p_school_id": str(school_id)},
            )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Membership service temporarily unavailable",
        )

    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending invitation found for this school",
        )

    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not activate school membership",
        )

    try:
        membership = response.json()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Invalid membership service response",
        )

    return {"success": True, "membership": membership}
