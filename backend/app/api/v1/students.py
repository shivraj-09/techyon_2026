from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.authorization import get_active_school_membership, require_school_roles
from app.core.config import settings
from app.core.security import bearer_scheme
from app.schemas.students import EnrollmentCreate, StudentCreate, StudentUpdate

router = APIRouter(prefix="/schools/{school_id}/students", tags=["Students"])

STUDENT_FIELDS = "id,school_id,admission_no,first_name,last_name,date_of_birth,status,created_at,updated_at"
ENROLLMENT_FIELDS = "id,school_id,student_id,class_id,roll_number,academic_year,status,enrolled_at,created_at"


def _headers(credentials: HTTPAuthorizationCredentials) -> dict[str, str]:
    return {
        "apikey": settings.SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {credentials.credentials}",
        "Content-Type": "application/json",
    }


async def _request(
    table: str,
    method: str,
    credentials: HTTPAuthorizationCredentials,
    *,
    params: dict | None = None,
    payload: dict | None = None,
) -> httpx.Response:
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            return await client.request(
                method,
                f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/{table}",
                headers={
                    **_headers(credentials),
                    **({"Prefer": "return=representation"} if method in ("POST", "PATCH") else {}),
                },
                params=params,
                json=payload,
            )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Student service temporarily unavailable")


def _rows(response: httpx.Response, *, allowed=(200,)) -> list[dict]:
    if response.status_code not in allowed:
        raise HTTPException(status_code=502, detail="Database request failed")
    try:
        data = response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Invalid database response")
    if not isinstance(data, list):
        raise HTTPException(status_code=502, detail="Invalid database response")
    return data


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_student(
    school_id: UUID,
    payload: StudentCreate,
    _admin: dict = Depends(require_school_roles("admin")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    response = await _request(
        "students",
        "POST",
        credentials,
        params={"select": STUDENT_FIELDS},
        payload={"school_id": str(school_id), **payload.model_dump(mode="json")},
    )
    if response.status_code == 409:
        raise HTTPException(status_code=409, detail="Admission number already exists in this school")
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not register student")
    rows = _rows(response, allowed=(200, 201))
    if not rows:
        raise HTTPException(status_code=502, detail="Student was created but no record was returned")
    return {"success": True, "student": rows[0]}


@router.get("")
async def list_students(
    school_id: UUID,
    admission_no: str | None = Query(default=None, max_length=50),
    student_status: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _membership: dict = Depends(get_active_school_membership),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    params = {
        "select": STUDENT_FIELDS,
        "school_id": f"eq.{school_id}",
        "order": "created_at.desc",
        "limit": str(limit),
        "offset": str(offset),
    }
    if admission_no:
        params["admission_no"] = f"eq.{admission_no.strip()}"
    if student_status:
        if student_status not in {"active", "inactive", "graduated", "transferred"}:
            raise HTTPException(status_code=422, detail="Invalid student status")
        params["status"] = f"eq.{student_status}"
    response = await _request("students", "GET", credentials, params=params)
    return {"success": True, "students": _rows(response), "limit": limit, "offset": offset}


@router.get("/{student_id}")
async def get_student(
    school_id: UUID,
    student_id: UUID,
    _membership: dict = Depends(get_active_school_membership),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    student_response = await _request(
        "students", "GET", credentials,
        params={"select": STUDENT_FIELDS, "id": f"eq.{student_id}", "school_id": f"eq.{school_id}"},
    )
    students = _rows(student_response)
    if not students:
        raise HTTPException(status_code=404, detail="Student not found")
    enrollment_response = await _request(
        "student_enrollments", "GET", credentials,
        params={"select": ENROLLMENT_FIELDS, "student_id": f"eq.{student_id}", "school_id": f"eq.{school_id}", "order": "enrolled_at.desc"},
    )
    return {"success": True, "student": students[0], "enrollments": _rows(enrollment_response)}


@router.patch("/{student_id}")
async def update_student(
    school_id: UUID,
    student_id: UUID,
    payload: StudentUpdate,
    _admin: dict = Depends(require_school_roles("admin")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    changes = payload.model_dump(exclude_unset=True, mode="json")
    if not changes:
        raise HTTPException(status_code=400, detail="Provide at least one field to update")
    response = await _request(
        "students", "PATCH", credentials,
        params={"select": STUDENT_FIELDS, "id": f"eq.{student_id}", "school_id": f"eq.{school_id}"},
        payload=changes,
    )
    if response.status_code == 409:
        raise HTTPException(status_code=409, detail="Admission number already exists in this school")
    if response.status_code not in (200, 204):
        raise HTTPException(status_code=502, detail="Could not update student")
    rows = _rows(response, allowed=(200, 204))
    if not rows:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"success": True, "student": rows[0]}


@router.post("/{student_id}/enrollments", status_code=status.HTTP_201_CREATED)
async def enroll_student(
    school_id: UUID,
    student_id: UUID,
    payload: EnrollmentCreate,
    _admin: dict = Depends(require_school_roles("admin")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    try:
        class_id = UUID(payload.class_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid class_id")

    student_rows = _rows(await _request(
        "students", "GET", credentials,
        params={"select": "id,status", "id": f"eq.{student_id}", "school_id": f"eq.{school_id}"},
    ))
    if not student_rows:
        raise HTTPException(status_code=404, detail="Student not found in this school")
    if student_rows[0]["status"] != "active":
        raise HTTPException(status_code=409, detail="Only active students can be enrolled")

    class_rows = _rows(await _request(
        "classes", "GET", credentials,
        params={"select": "id,academic_year", "id": f"eq.{class_id}", "school_id": f"eq.{school_id}"},
    ))
    if not class_rows:
        raise HTTPException(status_code=404, detail="Class not found in this school")
    if class_rows[0]["academic_year"] != payload.academic_year:
        raise HTTPException(status_code=422, detail="Enrollment academic year must match the class academic year")

    existing = _rows(await _request(
        "student_enrollments", "GET", credentials,
        params={"select": "id", "student_id": f"eq.{student_id}", "school_id": f"eq.{school_id}", "academic_year": f"eq.{payload.academic_year}", "status": "eq.active"},
    ))
    if existing:
        raise HTTPException(status_code=409, detail="Student already has an active enrollment for this academic year")

    response = await _request(
        "student_enrollments", "POST", credentials,
        params={"select": ENROLLMENT_FIELDS},
        payload={
            "school_id": str(school_id),
            "student_id": str(student_id),
            "class_id": str(class_id),
            "roll_number": payload.roll_number,
            "academic_year": payload.academic_year,
            "status": "active",
        },
    )
    if response.status_code == 409:
        raise HTTPException(status_code=409, detail="An enrollment with these details already exists")
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not enroll student")
    rows = _rows(response, allowed=(200, 201))
    if not rows:
        raise HTTPException(status_code=502, detail="Enrollment was created but no record was returned")
    return {"success": True, "enrollment": rows[0]}


@router.get("/{student_id}/guardians")
async def list_student_guardians(
    school_id: UUID,
    student_id: UUID,
    _membership: dict = Depends(get_active_school_membership),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    student_rows = _rows(await _request(
        "students", "GET", credentials,
        params={"select": "id", "id": f"eq.{student_id}", "school_id": f"eq.{school_id}"},
    ))
    if not student_rows:
        raise HTTPException(status_code=404, detail="Student not found")
    response = await _request(
        "student_guardians", "GET", credentials,
        params={"select": "id,student_id,guardian_user_id,relationship,is_primary,created_at", "student_id": f"eq.{student_id}", "school_id": f"eq.{school_id}"},
    )
    return {"success": True, "guardians": _rows(response)}
