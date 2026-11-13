from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.authorization import get_active_school_membership, require_school_roles
from app.core.config import settings
from app.core.security import bearer_scheme
from app.schemas.classes import ClassCreate, ClassUpdate

router = APIRouter(prefix="/schools/{school_id}/classes", tags=["Classes"])


def _user_headers(credentials: HTTPAuthorizationCredentials) -> dict[str, str]:
    return {
        "apikey": settings.SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {credentials.credentials}",
        "Content-Type": "application/json",
    }


async def _request_classes(
    method: str,
    school_id: UUID,
    credentials: HTTPAuthorizationCredentials,
    *,
    params: dict | None = None,
    payload: dict | None = None,
) -> httpx.Response:
    url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/classes"
    headers = _user_headers(credentials)
    if method in ("POST", "PATCH"):
        headers["Prefer"] = "return=representation"
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            return await client.request(
                method,
                url,
                headers=headers,
                params=params,
                json=payload,
            )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Class service temporarily unavailable",
        )


def _parse_rows(response: httpx.Response) -> list[dict]:
    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not retrieve classes",
        )
    try:
        rows = response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Invalid class service response")
    if not isinstance(rows, list):
        raise HTTPException(status_code=502, detail="Invalid class service response")
    return rows


@router.get("")
async def list_classes(
    school_id: UUID,
    academic_year: str | None = Query(default=None, max_length=20),
    membership: dict = Depends(get_active_school_membership),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """List classes for a school. Any active school member may view them."""
    params = {
        "select": "id,school_id,name,grade_level,section,academic_year,created_at,updated_at",
        "school_id": f"eq.{school_id}",
        "order": "academic_year.desc,name.asc,section.asc",
    }
    if academic_year:
        params["academic_year"] = f"eq.{academic_year.strip()}"
    response = await _request_classes("GET", school_id, credentials, params=params)
    return {"success": True, "classes": _parse_rows(response)}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_class(
    school_id: UUID,
    payload: ClassCreate,
    _admin: dict = Depends(require_school_roles("admin")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Create a class. Only an active school admin may do this."""
    response = await _request_classes(
        "POST",
        school_id,
        credentials,
        params={"select": "id,school_id,name,grade_level,section,academic_year,created_at,updated_at"},
        payload={"school_id": str(school_id), **payload.model_dump()},
    )
    if response.status_code == 409:
        raise HTTPException(status_code=409, detail="A class with this name already exists for that academic year")
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not create class")
    try:
        rows = response.json()
        created = rows[0] if isinstance(rows, list) and rows else None
    except (ValueError, IndexError):
        created = None
    if not created:
        raise HTTPException(status_code=502, detail="Class was created but the response was invalid")
    return {"success": True, "class": created}


@router.patch("/{class_id}")
async def update_class(
    school_id: UUID,
    class_id: UUID,
    payload: ClassUpdate,
    _admin: dict = Depends(require_school_roles("admin")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Update a class. Only an active school admin may do this."""
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="Provide at least one field to update")
    response = await _request_classes(
        "PATCH",
        school_id,
        credentials,
        params={
            "id": f"eq.{class_id}",
            "school_id": f"eq.{school_id}",
            "select": "id,school_id,name,grade_level,section,academic_year,created_at,updated_at",
        },
        payload=changes,
    )
    if response.status_code not in (200, 204):
        raise HTTPException(status_code=502, detail="Could not update class")
    try:
        rows = response.json()
    except ValueError:
        rows = []
    if not rows:
        raise HTTPException(status_code=404, detail="Class not found in this school")
    return {"success": True, "class": rows[0]}


@router.delete("/{class_id}")
async def delete_class(
    school_id: UUID,
    class_id: UUID,
    _admin: dict = Depends(require_school_roles("admin")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Delete a class. Foreign-key constraints protect classes with linked records."""
    response = await _request_classes(
        "DELETE",
        school_id,
        credentials,
        params={"id": f"eq.{class_id}", "school_id": f"eq.{school_id}"},
    )
    if response.status_code not in (200, 204):
        if response.status_code == 409:
            raise HTTPException(status_code=409, detail="This class has linked records and cannot be deleted")
        raise HTTPException(status_code=502, detail="Could not delete class")
    return {"success": True, "message": "Class deleted"}
