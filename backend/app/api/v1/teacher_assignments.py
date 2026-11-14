from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.authorization import require_school_roles
from app.core.config import settings
from app.core.security import bearer_scheme
from app.schemas.teacher_assignments import TeacherAssignmentCreate

router = APIRouter(
    prefix="/schools/{school_id}/classes/{class_id}/teachers",
    tags=["Class Teacher Assignments"],
)


def _user_headers(credentials: HTTPAuthorizationCredentials) -> dict[str, str]:
    return {
        "apikey": settings.SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {credentials.credentials}",
        "Content-Type": "application/json",
    }


def _admin_headers() -> dict[str, str]:
    if not settings.SUPABASE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Teacher directory is not configured on the server",
        )
    return {
        "apikey": settings.SUPABASE_SECRET_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SECRET_KEY}",
        "Content-Type": "application/json",
    }


async def _verify_active_teacher(school_id: UUID, teacher_user_id: UUID) -> dict:
    """Use server-only credentials to verify the target is an active teacher in this school."""
    url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/school_memberships"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                url,
                headers=_admin_headers(),
                params={
                    "select": "user_id,role,status,profiles(full_name,email)",
                    "school_id": f"eq.{school_id}",
                    "user_id": f"eq.{teacher_user_id}",
                    "role": "eq.teacher",
                    "status": "eq.active",
                },
            )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Teacher directory temporarily unavailable")

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Could not verify teacher membership")
    try:
        rows = response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Invalid teacher directory response")
    if not rows:
        raise HTTPException(
            status_code=422,
            detail="The selected user is not an active teacher in this school",
        )
    return rows[0]


async def _get_class(school_id: UUID, class_id: UUID, credentials: HTTPAuthorizationCredentials) -> dict:
    url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/classes"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                url,
                headers=_user_headers(credentials),
                params={
                    "select": "id,name,grade_level,section,academic_year",
                    "id": f"eq.{class_id}",
                    "school_id": f"eq.{school_id}",
                },
            )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Class service temporarily unavailable")
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Could not verify class")
    try:
        rows = response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Invalid class service response")
    if not rows:
        raise HTTPException(status_code=404, detail="Class not found in this school")
    return rows[0]


@router.get("")
async def list_class_teachers(
    school_id: UUID,
    class_id: UUID,
    _admin: dict = Depends(require_school_roles("admin")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """List assigned teachers. Admin-only directory details are returned."""
    await _get_class(school_id, class_id, credentials)
    url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/class_teacher_assignments"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                url,
                headers=_user_headers(credentials),
                params={
                    "select": "id,school_id,class_id,teacher_user_id,assigned_at",
                    "school_id": f"eq.{school_id}",
                    "class_id": f"eq.{class_id}",
                    "order": "assigned_at.asc",
                },
            )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Assignment service temporarily unavailable")
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Could not retrieve teacher assignments")
    try:
        assignments = response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Invalid assignment service response")

    # Resolve names only after the caller has passed the admin role check.
    if assignments:
        ids = [item["teacher_user_id"] for item in assignments]
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                profiles_response = await client.get(
                    f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/profiles",
                    headers=_admin_headers(),
                    params={"select": "id,full_name,email", "id": f"in.({','.join(ids)})"},
                )
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Teacher directory temporarily unavailable")
        if profiles_response.status_code != 200:
            raise HTTPException(status_code=502, detail="Could not retrieve teacher profiles")
        profiles = {p["id"]: p for p in profiles_response.json()}
        for item in assignments:
            item["teacher"] = profiles.get(item["teacher_user_id"])
    return {"success": True, "assignments": assignments}


@router.post("", status_code=status.HTTP_201_CREATED)
async def assign_teacher_to_class(
    school_id: UUID,
    class_id: UUID,
    payload: TeacherAssignmentCreate,
    _admin: dict = Depends(require_school_roles("admin")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Assign an active teacher from this school to a class."""
    await _get_class(school_id, class_id, credentials)
    await _verify_active_teacher(school_id, payload.teacher_user_id)

    url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/class_teacher_assignments"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                url,
                headers={**_user_headers(credentials), "Prefer": "return=representation"},
                params={"select": "id,school_id,class_id,teacher_user_id,assigned_at"},
                json={
                    "school_id": str(school_id),
                    "class_id": str(class_id),
                    "teacher_user_id": str(payload.teacher_user_id),
                },
            )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Assignment service temporarily unavailable")
    if response.status_code == 409:
        raise HTTPException(status_code=409, detail="This teacher is already assigned to this class")
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not assign teacher")
    try:
        rows = response.json()
        assignment = rows[0] if rows else None
    except (ValueError, IndexError, TypeError):
        assignment = None
    if not assignment:
        raise HTTPException(status_code=502, detail="Assignment was created but response was invalid")
    return {"success": True, "assignment": assignment}


@router.delete("/{teacher_user_id}", status_code=status.HTTP_200_OK)
async def remove_teacher_from_class(
    school_id: UUID,
    class_id: UUID,
    teacher_user_id: UUID,
    _admin: dict = Depends(require_school_roles("admin")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Remove a teacher assignment without deleting the teacher's school membership."""
    await _get_class(school_id, class_id, credentials)
    url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/class_teacher_assignments"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.delete(
                url,
                headers=_user_headers(credentials),
                params={
                    "school_id": f"eq.{school_id}",
                    "class_id": f"eq.{class_id}",
                    "teacher_user_id": f"eq.{teacher_user_id}",
                },
            )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Assignment service temporarily unavailable")
    if response.status_code not in (200, 204):
        raise HTTPException(status_code=502, detail="Could not remove teacher assignment")
    return {"success": True, "message": "Teacher removed from class"}
