from typing import Callable
from uuid import UUID

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.config import settings
from app.core.security import bearer_scheme, get_current_user

VALID_ROLES = {"admin", "teacher", "parent", "counsellor"}


async def fetch_active_memberships(
    current_user: dict,
    credentials: HTTPAuthorizationCredentials,
) -> list[dict]:
    """Read the signed-in user's active memberships under their own JWT and RLS."""
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
                    "status": "eq.active",
                    "order": "created_at.asc",
                },
            )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Membership service temporarily unavailable",
        )

    if response.status_code != status.HTTP_200_OK:
        # Fail closed. Do not bypass RLS with a service-role key.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not verify school membership",
        )

    try:
        rows = response.json()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Invalid membership service response",
        )

    if not isinstance(rows, list):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Invalid membership service response",
        )

    return rows


async def get_active_school_membership(
    school_id: UUID,
    current_user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Resolve one active membership for this user in the requested school."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    memberships = await fetch_active_memberships(current_user, credentials)
    membership = next(
        (item for item in memberships if item.get("school_id") == str(school_id)),
        None,
    )

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active membership in this school",
        )

    return membership


def require_school_roles(*allowed_roles: str) -> Callable:
    """FastAPI dependency factory enforcing roles from the database."""
    if not allowed_roles or any(role not in VALID_ROLES for role in allowed_roles):
        raise ValueError("Provide one or more valid school roles")

    async def role_dependency(
        school_id: UUID,
        current_user: dict = Depends(get_current_user),
        credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    ) -> dict:
        if credentials is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )

        memberships = await fetch_active_memberships(current_user, credentials)
        school_memberships = [
            item for item in memberships
            if item.get("school_id") == str(school_id)
            and item.get("role") in allowed_roles
            and item.get("status") == "active"
        ]
        # Respect the endpoint's declared role order when an account has
        # multiple active roles in the same school.
        membership = next(
            (item for role in allowed_roles
             for item in school_memberships if item.get("role") == role),
            None,
        )
        if membership is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your school role does not permit this action",
            )
        return membership

    return role_dependency
