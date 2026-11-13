from datetime import datetime, timezone
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.authorization import require_school_roles
from app.core.config import settings
from app.core.security import bearer_scheme, get_current_user
from app.schemas.counsellor import (
    CaseCreateFromReferral,
    CaseNoteCreate,
    CaseStatusUpdate,
    CounsellingNoticeCreate,
    CounsellingSessionCreate,
    ReferralCreate,
    ReferralReviewUpdate,
)

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
        "select": "id,school_id,student_id,class_id,submitted_by,category,summary,urgency,status,assigned_counsellor_id,created_at,updated_at",
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
    response = await _request(
        "counsellor_referrals",
        "PATCH",
        credentials,
        params={
            "select": "id,school_id,student_id,class_id,submitted_by,category,summary,urgency,status,assigned_counsellor_id,created_at,updated_at",
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

cases_router = APIRouter(prefix="/schools/{school_id}/counselling/cases", tags=["Counselling Cases"])


@cases_router.post("", status_code=status.HTTP_201_CREATED)
async def create_case_from_referral(
    school_id: UUID,
    payload: CaseCreateFromReferral,
    current_user: dict = Depends(get_current_user),
    _counsellor: dict = Depends(require_school_roles("counsellor")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Convert an accepted referral assigned to this counsellor into a confidential case."""
    referral_rows = _rows(await _request(
        "counsellor_referrals",
        "GET",
        credentials,
        params={
            "select": "id,school_id,student_id,status,assigned_counsellor_id",
            "id": f"eq.{payload.referral_id}",
            "school_id": f"eq.{school_id}",
            "limit": "1",
        },
    ))
    if not referral_rows:
        raise HTTPException(status_code=404, detail="Referral not found")
    referral = referral_rows[0]
    if referral["status"] != "accepted":
        raise HTTPException(status_code=409, detail="Only accepted referrals can become counselling cases")
    if referral.get("assigned_counsellor_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only the assigned counsellor can open this case")

    response = await _request(
        "counselling_cases",
        "POST",
        credentials,
        params={"select": "id,school_id,student_id,referral_id,assigned_counsellor_id,status,opened_at,closed_at,created_at,updated_at"},
        payload={
            "school_id": str(school_id),
            "student_id": referral["student_id"],
            "referral_id": str(payload.referral_id),
            "assigned_counsellor_id": current_user["id"],
        },
    )
    if response.status_code == 409:
        raise HTTPException(status_code=409, detail="A counselling case already exists for this referral")
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not create counselling case")
    rows = _rows(response, allowed=(200, 201))
    if not rows:
        raise HTTPException(status_code=502, detail="Case was created but no record was returned")
    return {"success": True, "case": rows[0]}


@cases_router.get("")
async def list_counselling_cases(
    school_id: UUID,
    case_status: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _counsellor: dict = Depends(require_school_roles("counsellor")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Return only cases assigned to the authenticated counsellor (enforced again by RLS)."""
    if case_status and case_status not in {"open", "in_progress", "closed"}:
        raise HTTPException(status_code=422, detail="Invalid case status")
    params = {
        "select": "id,school_id,student_id,referral_id,assigned_counsellor_id,status,opened_at,closed_at,created_at,updated_at",
        "school_id": f"eq.{school_id}",
        "order": "opened_at.desc",
        "limit": str(limit),
        "offset": str(offset),
    }
    if case_status:
        params["status"] = f"eq.{case_status}"
    response = await _request("counselling_cases", "GET", credentials, params=params)
    return {"success": True, "cases": _rows(response), "limit": limit, "offset": offset}


@cases_router.patch("/{case_id}")
async def update_case_status(
    school_id: UUID,
    case_id: UUID,
    payload: CaseStatusUpdate,
    _counsellor: dict = Depends(require_school_roles("counsellor")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Counsellors may move their own cases in progress or close them."""
    existing = _rows(await _request(
        "counselling_cases",
        "GET",
        credentials,
        params={"select": "id,status", "id": f"eq.{case_id}", "school_id": f"eq.{school_id}", "limit": "1"},
    ))
    if not existing:
        raise HTTPException(status_code=404, detail="Case not found")
    if existing[0]["status"] == "closed":
        raise HTTPException(status_code=409, detail="Closed cases cannot be reopened")
    response = await _request(
        "counselling_cases",
        "PATCH",
        credentials,
        params={
            "select": "id,school_id,student_id,referral_id,assigned_counsellor_id,status,opened_at,closed_at,created_at,updated_at",
            "id": f"eq.{case_id}",
            "school_id": f"eq.{school_id}",
        },
        payload={"status": payload.status},
    )
    if response.status_code not in (200, 204):
        raise HTTPException(status_code=502, detail="Could not update case")
    rows = _rows(response, allowed=(200, 204))
    if not rows:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"success": True, "case": rows[0]}


@cases_router.get("/{case_id}/notes")
async def list_case_notes(
    school_id: UUID,
    case_id: UUID,
    _counsellor: dict = Depends(require_school_roles("counsellor")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Private note bodies are returned only when RLS confirms assigned-counsellor access."""
    case_rows = _rows(await _request(
        "counselling_cases",
        "GET",
        credentials,
        params={"select": "id", "id": f"eq.{case_id}", "school_id": f"eq.{school_id}", "limit": "1"},
    ))
    if not case_rows:
        raise HTTPException(status_code=404, detail="Case not found")
    response = await _request(
        "counselling_case_notes",
        "GET",
        credentials,
        params={"select": "id,case_id,author_user_id,note_body,created_at", "case_id": f"eq.{case_id}", "order": "created_at.asc"},
    )
    return {"success": True, "notes": _rows(response)}


@cases_router.post("/{case_id}/notes", status_code=status.HTTP_201_CREATED)
async def add_case_note(
    school_id: UUID,
    case_id: UUID,
    payload: CaseNoteCreate,
    current_user: dict = Depends(get_current_user),
    _counsellor: dict = Depends(require_school_roles("counsellor")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Append a private note; note author is always taken from the verified access token."""
    case_rows = _rows(await _request(
        "counselling_cases",
        "GET",
        credentials,
        params={"select": "id,status", "id": f"eq.{case_id}", "school_id": f"eq.{school_id}", "limit": "1"},
    ))
    if not case_rows:
        raise HTTPException(status_code=404, detail="Case not found")
    if case_rows[0]["status"] == "closed":
        raise HTTPException(status_code=409, detail="Cannot add notes to a closed case")
    response = await _request(
        "counselling_case_notes",
        "POST",
        credentials,
        params={"select": "id,case_id,author_user_id,note_body,created_at"},
        payload={
            "case_id": str(case_id),
            "author_user_id": current_user["id"],
            "note_body": payload.note_body,
        },
    )
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not save private case note")
    rows = _rows(response, allowed=(200, 201))
    if not rows:
        raise HTTPException(status_code=502, detail="Note was saved but no record was returned")
    return {"success": True, "note": rows[0]}


sessions_router = APIRouter(prefix="/schools/{school_id}/counselling", tags=["Counselling Sessions"])


@sessions_router.post("/sessions", status_code=status.HTTP_201_CREATED)
async def create_counselling_session(
    school_id: UUID,
    payload: CounsellingSessionCreate,
    current_user: dict = Depends(get_current_user),
    _counsellor: dict = Depends(require_school_roles("counsellor")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Create a session or publish it to its intended audience."""
    now = datetime.now(timezone.utc)
    response = await _request(
        "counselling_sessions",
        "POST",
        credentials,
        params={"select": "id,school_id,created_by,title,description,audience,class_id,starts_at,ends_at,capacity,location,meeting_mode,status,published_at,created_at,updated_at"},
        payload={
            "school_id": str(school_id),
            "created_by": current_user["id"],
            **payload.model_dump(mode="json", exclude={"status"}),
            "status": payload.status,
            "published_at": now.isoformat() if payload.status == "published" else None,
        },
    )
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not create counselling session")
    rows = _rows(response, allowed=(200, 201))
    if not rows:
        raise HTTPException(status_code=502, detail="Session created but no record was returned")
    return {"success": True, "session": rows[0]}


@sessions_router.get("/sessions")
async def list_counselling_sessions(
    school_id: UUID,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    membership: dict = Depends(require_school_roles("counsellor", "teacher", "parent")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Counsellors see their school sessions; parents/teachers see published sessions for their audience."""
    params = {
        "select": "id,school_id,created_by,title,description,audience,class_id,starts_at,ends_at,capacity,location,meeting_mode,status,published_at,created_at,updated_at",
        "school_id": f"eq.{school_id}",
        "order": "starts_at.asc",
        "limit": str(limit),
        "offset": str(offset),
    }
    if membership.get("role") != "counsellor":
        params["status"] = "eq.published"
    response = await _request("counselling_sessions", "GET", credentials, params=params)
    return {"success": True, "sessions": _rows(response), "limit": limit, "offset": offset}


@sessions_router.post("/notices", status_code=status.HTTP_201_CREATED)
async def create_counselling_notice(
    school_id: UUID,
    payload: CounsellingNoticeCreate,
    current_user: dict = Depends(get_current_user),
    _counsellor: dict = Depends(require_school_roles("counsellor")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Create an audience-scoped notice; publication time controls when recipients can read it."""
    response = await _request(
        "counselling_notices",
        "POST",
        credentials,
        params={"select": "id,school_id,created_by,title,body,audience,class_id,publish_at,expires_at,status,created_at,updated_at"},
        payload={
            "school_id": str(school_id),
            "created_by": current_user["id"],
            **payload.model_dump(mode="json"),
        },
    )
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not create counselling notice")
    rows = _rows(response, allowed=(200, 201))
    if not rows:
        raise HTTPException(status_code=502, detail="Notice created but no record was returned")
    return {"success": True, "notice": rows[0]}


@sessions_router.get("/notices")
async def list_counselling_notices(
    school_id: UUID,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    membership: dict = Depends(require_school_roles("counsellor", "teacher", "parent")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Return only notices allowed by audience RLS and publication windows."""
    params = {
        "select": "id,school_id,created_by,title,body,audience,class_id,publish_at,expires_at,status,created_at,updated_at",
        "school_id": f"eq.{school_id}",
        "order": "publish_at.desc",
        "limit": str(limit),
        "offset": str(offset),
    }
    if membership.get("role") != "counsellor":
        params["status"] = "eq.published"
    response = await _request("counselling_notices", "GET", credentials, params=params)
    return {"success": True, "notices": _rows(response), "limit": limit, "offset": offset}
