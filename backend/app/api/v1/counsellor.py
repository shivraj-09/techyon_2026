from datetime import datetime, timezone
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.authorization import get_active_school_membership, require_school_roles
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
    StudentVoiceLinkCreate,
    StudentVoiceMeetingRequestCreate,
    StudentVoiceMeetingReview,
    StudentVoiceMessageCreate,
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
    allowed_transitions = {
        "submitted": {"under_review", "clarification_requested", "accepted", "declined", "closed"},
        "under_review": {"clarification_requested", "accepted", "declined", "closed"},
        "clarification_requested": {"under_review", "accepted", "declined", "closed"},
        "accepted": {"closed"},
        "declined": {"closed"},
        "closed": set(),
    }
    if payload.status not in allowed_transitions.get(existing["status"], set()):
        raise HTTPException(status_code=409, detail="Invalid referral status transition")
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
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Could not update referral")
    rows = _rows(response)
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
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Could not update case")
    rows = _rows(response)
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


student_voice_router = APIRouter(prefix="/schools/{school_id}/student-voice", tags=["Student Voice"])


@student_voice_router.post("/links", status_code=status.HTTP_201_CREATED)
async def link_student_account(
    school_id: UUID,
    payload: StudentVoiceLinkCreate,
    current_user: dict = Depends(get_current_user),
    _admin: dict = Depends(require_school_roles("admin")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """An admin links an existing student record to its authenticated student account."""
    student_rows = _rows(await _request(
        "students", "GET", credentials,
        params={"select": "id", "id": f"eq.{payload.student_id}", "school_id": f"eq.{school_id}", "limit": "1"},
    ))
    if not student_rows:
        raise HTTPException(status_code=404, detail="Student not found in this school")
    response = await _request(
        "student_voice_student_links", "POST", credentials,
        params={"select": "id,school_id,student_id,student_user_id,status,linked_by,created_at"},
        payload={
            "school_id": str(school_id),
            "student_id": str(payload.student_id),
            "student_user_id": str(payload.student_user_id),
            "linked_by": current_user["id"],
        },
    )
    if response.status_code == 409:
        raise HTTPException(status_code=409, detail="Student or account is already linked")
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not link student account")
    rows = _rows(response, allowed=(200, 201))
    if not rows:
        raise HTTPException(status_code=502, detail="Link created but no record was returned")
    return {"success": True, "link": rows[0]}


@student_voice_router.post("/conversations", status_code=status.HTTP_201_CREATED)
async def create_student_voice_conversation(
    school_id: UUID,
    current_user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Create a pseudonymous conversation for the signed-in, linked student."""
    link_rows = _rows(await _request(
        "student_voice_student_links", "GET", credentials,
        params={"select": "id", "school_id": f"eq.{school_id}", "student_user_id": f"eq.{current_user['id']}", "status": "eq.active", "limit": "1"},
    ))
    if not link_rows:
        raise HTTPException(status_code=403, detail="Student Voice is not enabled for this account")
    response = await _request(
        "student_voice_conversations", "POST", credentials,
        params={"select": "id,school_id,public_ref,status,created_at,last_message_at"},
        payload={"school_id": str(school_id), "student_user_id": current_user["id"]},
    )
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not start Student Voice conversation")
    rows = _rows(response, allowed=(200, 201))
    if not rows:
        raise HTTPException(status_code=502, detail="Conversation created but no record was returned")
    return {"success": True, "conversation": rows[0]}


@student_voice_router.get("/conversations/mine")
async def list_my_student_voice_conversations(
    school_id: UUID,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Student view: only the caller's pseudonymous conversation references."""
    response = await _request(
        "student_voice_conversations", "GET", credentials,
        params={
            "select": "id,school_id,public_ref,status,created_at,last_message_at",
            "school_id": f"eq.{school_id}",
            "order": "created_at.desc",
            "limit": str(limit),
            "offset": str(offset),
        },
    )
    return {"success": True, "conversations": _rows(response), "limit": limit, "offset": offset}


@student_voice_router.get("/conversations/inbox")
async def list_student_voice_inbox(
    school_id: UUID,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _counsellor: dict = Depends(require_school_roles("counsellor")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Counsellor inbox deliberately omits student account IDs and identity-map fields."""
    response = await _request(
        "student_voice_conversations", "GET", credentials,
        params={
            "select": "id,school_id,public_ref,status,assigned_counsellor_id,created_at,last_message_at",
            "school_id": f"eq.{school_id}",
            "order": "last_message_at.desc.nullslast,created_at.desc",
            "limit": str(limit),
            "offset": str(offset),
        },
    )
    return {"success": True, "conversations": _rows(response), "limit": limit, "offset": offset}


@student_voice_router.get("/conversations/{conversation_id}/messages")
async def list_student_voice_messages(
    school_id: UUID,
    conversation_id: UUID,
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """RLS limits message reads to the student owner or an active school counsellor."""
    response = await _request(
        "student_voice_messages", "GET", credentials,
        params={
            "select": "id,school_id,conversation_id,sender_kind,body,created_at,read_at",
            "school_id": f"eq.{school_id}",
            "conversation_id": f"eq.{conversation_id}",
            "order": "created_at.asc",
            "limit": str(limit),
            "offset": str(offset),
        },
    )
    return {"success": True, "messages": _rows(response), "limit": limit, "offset": offset}


@student_voice_router.post("/conversations/{conversation_id}/messages", status_code=status.HTTP_201_CREATED)
async def send_student_voice_message(
    school_id: UUID,
    conversation_id: UUID,
    payload: StudentVoiceMessageCreate,
    current_user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Determine sender type from verified account linkage or active counsellor membership."""
    link_rows = _rows(await _request(
        "student_voice_student_links", "GET", credentials,
        params={"select": "id", "school_id": f"eq.{school_id}", "student_user_id": f"eq.{current_user['id']}", "status": "eq.active", "limit": "1"},
    ))
    if link_rows:
        sender_kind = "student"
    else:
        membership = await get_active_school_membership(school_id, current_user, credentials)
        if membership.get("role") != "counsellor":
            raise HTTPException(status_code=403, detail="Only the student or a school counsellor can send messages")
        conversation_rows = _rows(await _request(
            "student_voice_conversations", "GET", credentials,
            params={
                "select": "id,status,assigned_counsellor_id",
                "id": f"eq.{conversation_id}",
                "school_id": f"eq.{school_id}",
                "limit": "1",
            },
        ))
        if not conversation_rows:
            raise HTTPException(status_code=404, detail="Conversation not found")
        conversation = conversation_rows[0]
        if conversation.get("assigned_counsellor_id") not in (None, current_user["id"]):
            raise HTTPException(status_code=409, detail="Conversation is assigned to another counsellor")
        if conversation.get("status") != "open":
            raise HTTPException(status_code=409, detail="Conversation is closed")
        if conversation.get("assigned_counsellor_id") is None:
            assignment = await _request(
                "student_voice_conversations", "PATCH", credentials,
                params={
                    "id": f"eq.{conversation_id}",
                    "school_id": f"eq.{school_id}",
                    "assigned_counsellor_id": "is.null",
                },
                payload={"assigned_counsellor_id": current_user["id"]},
            )
            if assignment.status_code != 200:
                raise HTTPException(status_code=409, detail="Could not assign conversation to this counsellor")
        sender_kind = "counsellor"

    response = await _request(
        "student_voice_messages", "POST", credentials,
        params={"select": "id,school_id,conversation_id,sender_kind,body,created_at,read_at"},
        payload={
            "school_id": str(school_id),
            "conversation_id": str(conversation_id),
            "sender_kind": sender_kind,
            "sender_user_id": current_user["id"],
            "body": payload.body,
        },
    )
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not send message")
    rows = _rows(response, allowed=(200, 201))
    if not rows:
        raise HTTPException(status_code=502, detail="Message sent but no record was returned")
    return {"success": True, "message": rows[0]}


@student_voice_router.post("/conversations/{conversation_id}/meeting-requests", status_code=status.HTTP_201_CREATED)
async def create_student_voice_meeting_request(
    school_id: UUID,
    conversation_id: UUID,
    payload: StudentVoiceMeetingRequestCreate,
    current_user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Student may request an in-person meeting without identity being shown in chat."""
    link_rows = _rows(await _request(
        "student_voice_student_links", "GET", credentials,
        params={"select": "id", "school_id": f"eq.{school_id}", "student_user_id": f"eq.{current_user['id']}", "status": "eq.active", "limit": "1"},
    ))
    if not link_rows:
        raise HTTPException(status_code=403, detail="Student Voice is not enabled for this account")
    response = await _request(
        "student_voice_meeting_requests", "POST", credentials,
        params={"select": "id,school_id,conversation_id,preferred_times,student_message,status,created_at"},
        payload={
            "school_id": str(school_id),
            "conversation_id": str(conversation_id),
            "requested_by": current_user["id"],
            **payload.model_dump(mode="json"),
        },
    )
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not submit meeting request")
    rows = _rows(response, allowed=(200, 201))
    if not rows:
        raise HTTPException(status_code=502, detail="Meeting request submitted but no record was returned")
    return {"success": True, "meeting_request": rows[0]}


@student_voice_router.get("/meeting-requests")
async def list_student_voice_meeting_requests(
    school_id: UUID,
    _counsellor: dict = Depends(require_school_roles("counsellor")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    response = await _request(
        "student_voice_meeting_requests", "GET", credentials,
        params={
            "select": "id,school_id,conversation_id,preferred_times,student_message,status,handled_by,handled_at,created_at",
            "school_id": f"eq.{school_id}",
            "order": "created_at.desc",
        },
    )
    return {"success": True, "meeting_requests": _rows(response)}


@student_voice_router.patch("/meeting-requests/{request_id}")
async def review_student_voice_meeting_request(
    school_id: UUID,
    request_id: UUID,
    payload: StudentVoiceMeetingReview,
    current_user: dict = Depends(get_current_user),
    _counsellor: dict = Depends(require_school_roles("counsellor")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    existing_rows = _rows(await _request(
        "student_voice_meeting_requests", "GET", credentials,
        params={
            "select": "id,status,conversation_id",
            "id": f"eq.{request_id}",
            "school_id": f"eq.{school_id}",
            "limit": "1",
        },
    ))
    if not existing_rows:
        raise HTTPException(status_code=404, detail="Meeting request not found")
    current_status = existing_rows[0]["status"]
    allowed_transitions = {
        "pending": {"approved", "declined"},
        "approved": {"completed"},
    }
    if payload.status not in allowed_transitions.get(current_status, set()):
        raise HTTPException(status_code=409, detail="Invalid meeting request status transition")
    conversation_rows = _rows(await _request(
        "student_voice_conversations", "GET", credentials,
        params={
            "select": "id,status,assigned_counsellor_id",
            "id": f"eq.{existing_rows[0]['conversation_id']}",
            "school_id": f"eq.{school_id}",
            "limit": "1",
        },
    ))
    if not conversation_rows:
        raise HTTPException(status_code=404, detail="Student Voice conversation not found")
    conversation = conversation_rows[0]
    if conversation.get("assigned_counsellor_id") not in (None, current_user["id"]):
        raise HTTPException(status_code=409, detail="Conversation is assigned to another counsellor")
    if conversation.get("assigned_counsellor_id") is None:
        assignment = await _request(
            "student_voice_conversations", "PATCH", credentials,
            params={
                "id": f"eq.{existing_rows[0]['conversation_id']}",
                "school_id": f"eq.{school_id}",
                "assigned_counsellor_id": "is.null",
            },
            payload={"assigned_counsellor_id": current_user["id"]},
        )
        if assignment.status_code != 200:
            raise HTTPException(status_code=409, detail="Could not assign conversation to this counsellor")
    response = await _request(
        "student_voice_meeting_requests", "PATCH", credentials,
        params={
            "select": "id,school_id,conversation_id,preferred_times,student_message,status,handled_by,handled_at,created_at",
            "id": f"eq.{request_id}",
            "school_id": f"eq.{school_id}",
            "status": f"eq.{current_status}",
        },
        payload={
            "status": payload.status,
            "handled_by": current_user["id"],
            "handled_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Could not update meeting request")
    rows = _rows(response)
    if not rows:
        raise HTTPException(status_code=404, detail="Pending meeting request not found")
    return {"success": True, "meeting_request": rows[0]}


@student_voice_router.get("/meeting-requests/{request_id}/student-identity")
async def reveal_meeting_request_student_identity(
    school_id: UUID,
    request_id: UUID,
    current_user: dict = Depends(get_current_user),
    _counsellor: dict = Depends(require_school_roles("counsellor")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Explicit reveal endpoint: identity is returned only after this meeting request is approved."""
    request_rows = _rows(await _request(
        "student_voice_meeting_requests", "GET", credentials,
        params={
            "select": "id,conversation_id,requested_by,status",
            "id": f"eq.{request_id}",
            "school_id": f"eq.{school_id}",
            "status": "eq.approved",
            "limit": "1",
        },
    ))
    if not request_rows:
        raise HTTPException(status_code=404, detail="Approved meeting request not found")
    meeting = request_rows[0]
    identity_rows = _rows(await _request(
        "student_voice_student_links", "GET", credentials,
        params={
            "select": "student_id",
            "school_id": f"eq.{school_id}",
            "student_user_id": f"eq.{meeting['requested_by']}",
            "status": "eq.active",
            "limit": "1",
        },
    ))
    if not identity_rows:
        raise HTTPException(status_code=404, detail="Student identity is unavailable")
    audit_response = await _request(
        "student_voice_identity_reveal_audit", "POST", credentials,
        params={"select": "id,revealed_at"},
        payload={
            "school_id": str(school_id),
            "meeting_request_id": str(request_id),
            "counsellor_user_id": current_user["id"],
            "student_id": identity_rows[0]["student_id"],
        },
    )
    if audit_response.status_code not in (200, 201):
        raise HTTPException(status_code=503, detail="Identity reveal could not be audited; identity was not disclosed")
    _rows(audit_response, allowed=(200, 201))
    return {
        "success": True,
        "identity": {
            "student_id": identity_rows[0]["student_id"],
            "meeting_request_id": str(request_id),
            "conversation_id": meeting["conversation_id"],
        },
    }


@student_voice_router.get("/meeting-requests/mine")
async def list_my_student_voice_meeting_requests(
    school_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Student view of their own meeting requests; RLS filters by requester."""
    response = await _request(
        "student_voice_meeting_requests", "GET", credentials,
        params={
            "select": "id,school_id,conversation_id,preferred_times,student_message,status,handled_at,created_at",
            "school_id": f"eq.{school_id}",
            "order": "created_at.desc",
        },
    )
    return {"success": True, "meeting_requests": _rows(response)}
