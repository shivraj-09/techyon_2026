from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.authorization import require_school_roles
from app.core.config import settings
from app.core.security import bearer_scheme, get_current_user
from app.schemas.counsellor import ReferralCreate, ReferralReviewUpdate

router = APIRouter(prefix="/schools/{school_id}/counsellor/referrals", tags=["Counsellor"])


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
    headers = _headers(credentials)
    if method in ("POST", "PATCH"):
        headers["Prefer"] = "return=representation"
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            return await client.request(
                method,
                f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/{table}",
                headers=headers,
                params=params,
                json=payload,
            )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Counsellor service temporarily unavailable")


def _rows(response: httpx.Response, allowed=(200,)) -> list[dict]:
    if response.status_code not in allowed:
        raise HTTPException(status_code=502, detail="Counsellor database request failed")
    try:
        rows = response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Invalid counsellor database response")
    if not isinstance(rows, list):
        raise HTTPException(status_code=502, detail="Invalid counsellor database response")
    return rows


@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_referral(
    school_id: UUID,
    payload: ReferralCreate,
    membership: dict = Depends(require_school_roles("teacher")),
    current_user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """A teacher may refer only a student actively enrolled in a class they teach."""
    if membership.get("school_id") != str(school_id):
        raise HTTPException(status_code=403, detail="Invalid school membership")

    enrollment_rows = _rows(await _request(
        "student_enrollments",
        "GET",
        credentials,
        params={
            "select": "id",
            "school_id": f"eq.{school_id}",
            "student_id": f"eq.{payload.student_id}",
            "class_id": f"eq.{payload.class_id}",
            "status": "eq.active",
            "limit": "1",
        },
    ))
    if not enrollment_rows:
        raise HTTPException(status_code=422, detail="Student does not have an active enrollment in this class")

    assignment_rows = _rows(await _request(
        "class_teacher_assignments",
        "GET",
        credentials,
        params={
            "select": "id",
            "school_id": f"eq.{school_id}",
            "class_id": f"eq.{payload.class_id}",
            "teacher_user_id": f"eq.{current_user['id']}",
            "limit": "1",
        },
    ))
    if not assignment_rows:
        raise HTTPException(status_code=403, detail="You are not assigned to this class")

    response = await _request(
        "counsellor_referrals",
        "POST",
        credentials,
        params={
            "select": "id,school_id,student_id,class_id,submitted_by,category,summary,urgency,status,created_at,updated_at"
        },
        payload={
            "school_id": str(school_id),
            "student_id": str(payload.student_id),
            "class_id": str(payload.class_id),
            "submitted_by": current_user["id"],
            "category": payload.category,
            "summary": payload.summary,
            "urgency": payload.urgency,
        },
    )
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not submit referral")
    rows = _rows(response, allowed=(200, 201))
    if not rows:
        raise HTTPException(status_code=502, detail="Referral was submitted but no record was returned")
    return {"success": True, "referral": rows[0]}


@router.get("")
async def list_referrals(
    school_id: UUID,
    referral_status: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    membership: dict = Depends(require_school_roles("teacher", "counsellor")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Counsellors see their school inbox; teachers see only referrals they submitted."""
    if membership.get("school_id") != str(school_id):
        raise HTTPException(status_code=403, detail="Invalid school membership")
    if referral_status and referral_status not in {
        "submitted", "under_review", "clarification_requested", "accepted", "declined", "closed"
    }:
        raise HTTPException(status_code=422, detail="Invalid referral status")

    params = {
        "select": "id,school_id,student_id,class_id,submitted_by,category,summary,urgency,status,counsellor_response,assigned_counsellor_id,created_at,updated_at",
        "school_id": f"eq.{school_id}",
        "order": "created_at.desc",
        "limit": str(limit),
        "offset": str(offset),
    }
    if referral_status:
        params["status"] = f"eq.{referral_status}"
    response = await _request("counsellor_referrals", "GET", credentials, params=params)
    return {"success": True, "referrals": _rows(response), "limit": limit, "offset": offset}


@router.patch("/{referral_id}")
async def review_referral(
    school_id: UUID,
    referral_id: UUID,
    payload: ReferralReviewUpdate,
    current_user: dict = Depends(get_current_user),
    _counsellor: dict = Depends(require_school_roles("counsellor")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Counsellors can review referrals; notes remain separate from future case records."""
    existing_rows = _rows(await _request(
        "counsellor_referrals",
        "GET",
        credentials,
        params={
            "select": "id,status,assigned_counsellor_id",
            "id": f"eq.{referral_id}",
            "school_id": f"eq.{school_id}",
            "limit": "1",
        },
    ))
    if not existing_rows:
        raise HTTPException(status_code=404, detail="Referral not found")
    existing = existing_rows[0]
    if existing["status"] == "closed":
        raise HTTPException(status_code=409, detail="Closed referrals cannot be changed")
    if existing.get("assigned_counsellor_id") not in (None, current_user["id"]):
        raise HTTPException(status_code=409, detail="This referral is assigned to another counsellor")

    changes = {
        "status": payload.status,
        "assigned_counsellor_id": current_user["id"],
    }
    if payload.counsellor_response is not None:
        changes["counsellor_response"] = payload.counsellor_response

    response = await _request(
        "counsellor_referrals",
        "PATCH",
        credentials,
        params={
            "select": "id,school_id,student_id,class_id,submitted_by,category,summary,urgency,status,counsellor_response,assigned_counsellor_id,created_at,updated_at",
            "id": f"eq.{referral_id}",
            "school_id": f"eq.{school_id}",
        },
        payload=changes,
    )
    if response.status_code not in (200, 204):
        raise HTTPException(status_code=502, detail="Could not update referral")
    rows = _rows(response, allowed=(200, 204))
    if not rows:
        raise HTTPException(status_code=404, detail="Referral not found")
    return {"success": True, "referral": rows[0]}
