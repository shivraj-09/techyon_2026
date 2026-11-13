import httpx
from fastapi import HTTPException, status

from app.core.config import settings


def _admin_headers() -> dict[str, str]:
    if not settings.SUPABASE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Invitation service is not configured",
        )
    # Supabase's new sb_secret_* keys belong in apikey, not Authorization.
    return {
        "apikey": settings.SUPABASE_SECRET_KEY,
        "Content-Type": "application/json",
    }


async def invite_school_member(
    *,
    school_id: str,
    email: str,
    full_name: str,
    role: str,
) -> dict:
    """Invite a teacher/parent and provision their profile + invited membership."""
    base_url = settings.SUPABASE_URL.rstrip("/")
    headers = _admin_headers()
    timeout = httpx.Timeout(15.0)

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            invite_response = await client.post(
                f"{base_url}/auth/v1/invite",
                headers=headers,
                params={"redirect_to": settings.SUPABASE_INVITE_REDIRECT_URL},
                json={"email": email, "data": {"full_name": full_name}},
            )
        except httpx.RequestError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supabase Auth is temporarily unavailable",
            )

        if invite_response.status_code not in (200, 201):
            if invite_response.status_code == 429:
                raise HTTPException(status_code=429, detail="Too many invitations. Try again later.")
            if invite_response.status_code in (400, 422):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Could not invite this email. It may already have an account or an outstanding invite.",
                )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Supabase could not create the invitation",
            )

        try:
            invited_user = invite_response.json()
            user_id = invited_user["id"]
        except (ValueError, KeyError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Supabase returned an invalid invitation response",
            )

        # Auth invitation has created the user. Provision the app records with
        # the server-only secret key; these writes intentionally bypass RLS.
        # If either write fails, attempt compensating cleanup to avoid orphans.
        profile_response = await client.post(
            f"{base_url}/rest/v1/profiles",
            headers={**headers, "Prefer": "return=minimal"},
            json={"id": user_id, "full_name": full_name, "email": email},
        )

        if profile_response.status_code not in (200, 201, 204):
            await _delete_auth_user(client, base_url, headers, user_id)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Invitation was created but profile provisioning failed; cleanup was attempted",
            )

        membership_response = await client.post(
            f"{base_url}/rest/v1/school_memberships",
            headers={**headers, "Prefer": "return=minimal"},
            json={
                "school_id": school_id,
                "user_id": user_id,
                "role": role,
                "status": "invited",
            },
        )

        if membership_response.status_code not in (200, 201, 204):
            await client.delete(
                f"{base_url}/rest/v1/profiles",
                headers=headers,
                params={"id": f"eq.{user_id}"},
            )
            await _delete_auth_user(client, base_url, headers, user_id)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Invitation was created but membership provisioning failed; cleanup was attempted",
            )

    return {
        "user_id": user_id,
        "email": email,
        "role": role,
        "membership_status": "invited",
    }


async def _delete_auth_user(
    client: httpx.AsyncClient,
    base_url: str,
    headers: dict[str, str],
    user_id: str,
) -> None:
    try:
        await client.delete(
            f"{base_url}/auth/v1/admin/users/{user_id}",
            headers=headers,
        )
    except httpx.RequestError:
        # The original provisioning error is more useful to the caller.
        pass
