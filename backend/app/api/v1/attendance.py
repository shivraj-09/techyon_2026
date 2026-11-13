from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.authorization import get_active_school_membership, require_school_roles
from app.core.config import settings
from app.core.security import bearer_scheme, get_current_user
from app.schemas.attendance import AttendanceBatchCreate, AttendanceUpdate

router = APIRouter(prefix="/schools/{school_id}", tags=["Attendance"])

ATTENDANCE_FIELDS = "id,school_id,student_id,class_id,attendance_date,status,marked_by,remarks,created_at,updated_at"


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
    payload: dict | list | None = None,
) -> httpx.Response:
    headers = _headers(credentials)
    if method in ("POST", "PATCH"):
        headers["Prefer"] = "return=representation"
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            return await client.request(
                method,
                f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/{table}",
                headers=headers,
                params=params,
                json=payload,
            )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Attendance service temporarily unavailable")


def _parse_rows(response: httpx.Response, allowed=(200,)) -> list[dict]:
    if response.status_code not in allowed:
        raise HTTPException(status_code=502, detail="Attendance database request failed")
    try:
        data = response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Invalid attendance database response")
    if not isinstance(data, list):
        raise HTTPException(status_code=502, detail="Invalid attendance database response")
    return data


@router.post("/classes/{class_id}/attendance", status_code=status.HTTP_201_CREATED)
async def mark_class_attendance(
    school_id: UUID,
    class_id: UUID,
    payload: AttendanceBatchCreate,
    membership: dict = Depends(require_school_roles("admin", "teacher")),
    current_user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Submit attendance for multiple students in one class on one date."""
    class_rows = _parse_rows(await _request(
        "classes", "GET", credentials,
        params={"select": "id", "id": f"eq.{class_id}", "school_id": f"eq.{school_id}"},
    ))
    if not class_rows:
        raise HTTPException(status_code=404, detail="Class not found in this school")

    student_ids = [str(record.student_id) for record in payload.records]
    enrollments = _parse_rows(await _request(
        "student_enrollments", "GET", credentials,
        params={
            "select": "student_id",
            "school_id": f"eq.{school_id}",
            "class_id": f"eq.{class_id}",
            "status": "eq.active",
            "student_id": f"in.({','.join(student_ids)})",
        },
    ))
    enrolled_ids = {row["student_id"] for row in enrollments}
    missing = sorted(set(student_ids) - enrolled_ids)
    if missing:
        raise HTTPException(
            status_code=422,
            detail={"message": "Every student must have an active enrollment in this class", "student_ids": missing},
        )

    body = [
        {
            "school_id": str(school_id),
            "class_id": str(class_id),
            "student_id": str(record.student_id),
            "attendance_date": payload.attendance_date.isoformat(),
            "status": record.status,
            "marked_by": current_user["id"],
            "remarks": record.remarks,
        }
        for record in payload.records
    ]
    response = await _request(
        "attendance_records", "POST", credentials,
        params={"select": ATTENDANCE_FIELDS},
        payload=body,
    )
    if response.status_code == 409:
        raise HTTPException(status_code=409, detail="Attendance already exists for one or more students on this date")
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not save class attendance")
    rows = _parse_rows(response, allowed=(200, 201))
    return {"success": True, "attendance_date": payload.attendance_date, "count": len(rows), "records": rows}


@router.get("/classes/{class_id}/attendance")
async def get_class_attendance(
    school_id: UUID,
    class_id: UUID,
    attendance_date: str = Query(..., description="Date in YYYY-MM-DD format"),
    _membership: dict = Depends(get_active_school_membership),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    params = {
        "select": ATTENDANCE_FIELDS,
        "school_id": f"eq.{school_id}",
        "class_id": f"eq.{class_id}",
        "attendance_date": f"eq.{attendance_date}",
        "order": "created_at.asc",
    }
    response = await _request("attendance_records", "GET", credentials, params=params)
    return {"success": True, "records": _parse_rows(response)}


@router.patch("/attendance/{attendance_id}")
async def update_attendance(
    school_id: UUID,
    attendance_id: UUID,
    payload: AttendanceUpdate,
    _staff: dict = Depends(require_school_roles("admin", "teacher")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    response = await _request(
        "attendance_records", "PATCH", credentials,
        params={
            "select": ATTENDANCE_FIELDS,
            "id": f"eq.{attendance_id}",
            "school_id": f"eq.{school_id}",
        },
        payload=payload.model_dump(),
    )
    if response.status_code not in (200, 204):
        raise HTTPException(status_code=502, detail="Could not update attendance")
    rows = _parse_rows(response, allowed=(200, 204))
    if not rows:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return {"success": True, "record": rows[0]}
