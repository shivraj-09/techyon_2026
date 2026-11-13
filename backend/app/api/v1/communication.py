from datetime import datetime, timezone
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.authorization import get_active_school_membership, require_school_roles
from app.core.config import settings
from app.core.security import bearer_scheme, get_current_user
from app.schemas.communication import AnnouncementCreate, NotificationReadUpdate

router = APIRouter(prefix="/schools/{school_id}", tags=["Parent Communication"])

ANNOUNCEMENT_FIELDS = "id,school_id,title,body,audience,class_id,created_by,published_at,created_at,updated_at"
NOTIFICATION_FIELDS = "id,school_id,recipient_user_id,title,body,type,related_announcement_id,read_at,created_at"


def _headers(credentials: HTTPAuthorizationCredentials) -> dict[str, str]:
    return {
        "apikey": settings.SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {credentials.credentials}",
        "Content-Type": "application/json",
    }


async def _request(
    resource: str,
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
        async with httpx.AsyncClient(timeout=15.0) as client:
            return await client.request(
                method,
                f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/{resource}",
                headers=headers,
                params=params,
                json=payload,
            )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Communication service temporarily unavailable")


def _rows(response: httpx.Response, allowed=(200,)) -> list[dict]:
    if response.status_code not in allowed:
        raise HTTPException(status_code=502, detail="Communication database request failed")
    try:
        data = response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Invalid communication database response")
    if not isinstance(data, list):
        raise HTTPException(status_code=502, detail="Invalid communication database response")
    return data


@router.post("/announcements", status_code=status.HTTP_201_CREATED)
async def create_announcement(
    school_id: UUID,
    payload: AnnouncementCreate,
    current_user: dict = Depends(get_current_user),
    _admin: dict = Depends(require_school_roles("admin")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    if (payload.audience == "class") != (payload.class_id is not None):
        raise HTTPException(status_code=422, detail="class_id is required only when audience is 'class'")

    if payload.class_id:
        classes = _rows(await _request(
            "classes", "GET", credentials,
            params={"select": "id", "id": f"eq.{payload.class_id}", "school_id": f"eq.{school_id}"},
        ))
        if not classes:
            raise HTTPException(status_code=404, detail="Class not found in this school")

    response = await _request(
        "announcements", "POST", credentials,
        params={"select": ANNOUNCEMENT_FIELDS},
        payload={
            "school_id": str(school_id),
            **payload.model_dump(mode="json"),
            "created_by": current_user["id"],
            "published_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not publish announcement")
    rows = _rows(response, allowed=(200, 201))
    if not rows:
        raise HTTPException(status_code=502, detail="Announcement published but no record was returned")
    return {"success": True, "announcement": rows[0]}


@router.get("/announcements")
async def list_announcements(
    school_id: UUID,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _membership: dict = Depends(get_active_school_membership),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    response = await _request(
        "announcements", "GET", credentials,
        params={
            "select": ANNOUNCEMENT_FIELDS,
            "school_id": f"eq.{school_id}",
            "published_at": "not.is.null",
            "order": "published_at.desc",
            "limit": str(limit),
            "offset": str(offset),
        },
    )
    return {"success": True, "announcements": _rows(response), "limit": limit, "offset": offset}


@router.get("/notifications")
async def list_notifications(
    school_id: UUID,
    unread_only: bool = False,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _membership: dict = Depends(get_active_school_membership),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    params = {
        "select": NOTIFICATION_FIELDS,
        "school_id": f"eq.{school_id}",
        "order": "created_at.desc",
        "limit": str(limit),
        "offset": str(offset),
    }
    if unread_only:
        params["read_at"] = "is.null"
    response = await _request("notifications", "GET", credentials, params=params)
    return {"success": True, "notifications": _rows(response), "limit": limit, "offset": offset}


@router.patch("/notifications/{notification_id}/read")
async def update_notification_read(
    school_id: UUID,
    notification_id: UUID,
    payload: NotificationReadUpdate,
    _membership: dict = Depends(get_active_school_membership),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    response = await _request(
        "notifications", "PATCH", credentials,
        params={
            "select": NOTIFICATION_FIELDS,
            "id": f"eq.{notification_id}",
            "school_id": f"eq.{school_id}",
        },
        payload={"read_at": datetime.now(timezone.utc).isoformat() if payload.is_read else None},
    )
    if response.status_code not in (200, 204):
        raise HTTPException(status_code=502, detail="Could not update notification")
    rows = _rows(response, allowed=(200, 204))
    if not rows:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True, "notification": rows[0]}
