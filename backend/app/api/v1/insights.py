from datetime import date, timedelta
from decimal import Decimal
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials

from app.core.authorization import require_school_roles
from app.core.config import settings
from app.core.security import bearer_scheme, get_current_user
from app.schemas.insights import InsightGenerateRequest

router = APIRouter(prefix="/schools/{school_id}/ai-insights", tags=["AI Insights"])

INSIGHT_FIELDS = "id,school_id,insight_type,summary,severity,period_start,period_end,generated_by,generated_at"


def _headers(credentials: HTTPAuthorizationCredentials) -> dict[str, str]:
    return {
        "apikey": settings.SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {credentials.credentials}",
        "Content-Type": "application/json",
    }


async def _request(resource: str, method: str, credentials: HTTPAuthorizationCredentials, *, params: dict | None = None, payload: dict | None = None) -> httpx.Response:
    headers = _headers(credentials)
    if method in ("POST", "PATCH"):
        headers["Prefer"] = "return=representation"
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            return await client.request(
                method,
                f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/{resource}",
                headers=headers,
                params=params,
                json=payload,
            )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Insights service temporarily unavailable")


def _rows(response: httpx.Response, allowed=(200,)) -> list[dict]:
    if response.status_code not in allowed:
        raise HTTPException(status_code=502, detail="Insights database request failed")
    try:
        data = response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Invalid insights database response")
    if not isinstance(data, list):
        raise HTTPException(status_code=502, detail="Invalid insights database response")
    return data


@router.post("/generate")
async def generate_school_insights(
    school_id: UUID,
    payload: InsightGenerateRequest,
    current_user: dict = Depends(get_current_user),
    _admin: dict = Depends(require_school_roles("admin")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Generate transparent, aggregate rule-based school insights for the selected period."""
    period_end = payload.period_end or date.today()
    period_start = payload.period_start or (period_end - timedelta(days=29))
    if period_end < period_start:
        raise HTTPException(status_code=422, detail="period_end must be on or after period_start")
    if (period_end - period_start).days > 366:
        raise HTTPException(status_code=422, detail="Insight period cannot exceed 367 days")

    attendance = _rows(await _request(
        "attendance_records", "GET", credentials,
        params={
            "select": "status",
            "school_id": f"eq.{school_id}",
            "attendance_date": f"gte.{period_start.isoformat()}",
            "and": f"(attendance_date.lte.{period_end.isoformat()})",
            "limit": "10000",
        },
    ))
    invoices = _rows(await _request(
        "fee_invoice_balances", "GET", credentials,
        params={
            "select": "amount_due,amount_paid,outstanding_amount,status,due_date",
            "school_id": f"eq.{school_id}",
            "limit": "10000",
        },
    ))
    enrollments = _rows(await _request(
        "student_enrollments", "GET", credentials,
        params={
            "select": "id",
            "school_id": f"eq.{school_id}",
            "status": "eq.active",
            "limit": "10000",
        },
    ))

    insights: list[dict] = []
    total_attendance = len(attendance)
    present_like = sum(1 for row in attendance if row["status"] in ("present", "late"))
    absent = sum(1 for row in attendance if row["status"] == "absent")
    attendance_rate = (present_like / total_attendance * 100) if total_attendance else None

    if attendance_rate is not None:
        if attendance_rate < 75:
            severity = "critical"
            summary = f"Aggregate attendance was {attendance_rate:.1f}% across {total_attendance} recorded student-days. Review attendance patterns and follow up through the school's established process."
        elif attendance_rate < 90:
            severity = "warning"
            summary = f"Aggregate attendance was {attendance_rate:.1f}% across {total_attendance} recorded student-days. Monitor attendance trends and identify classes that may need support."
        else:
            severity = "info"
            summary = f"Aggregate attendance was {attendance_rate:.1f}% across {total_attendance} recorded student-days, indicating a healthy overall attendance pattern for this period."
        insights.append({
            "school_id": str(school_id),
            "insight_type": "attendance_overview",
            "summary": summary,
            "severity": severity,
            "period_start": period_start.isoformat(),
            "period_end": period_end.isoformat(),
            "generated_by": current_user["id"],
        })
    else:
        insights.append({
            "school_id": str(school_id),
            "insight_type": "attendance_data_gap",
            "summary": "No attendance records were found for the selected period. Start recording attendance to enable attendance trend insights.",
            "severity": "warning",
            "period_start": period_start.isoformat(),
            "period_end": period_end.isoformat(),
            "generated_by": current_user["id"],
        })

    total_due = sum((Decimal(str(row["amount_due"] or 0)) for row in invoices), Decimal("0"))
    total_paid = sum((Decimal(str(row["amount_paid"] or 0)) for row in invoices), Decimal("0"))
    total_outstanding = sum((Decimal(str(row["outstanding_amount"] or 0)) for row in invoices), Decimal("0"))
    overdue_count = sum(1 for row in invoices if row["status"] == "overdue" or (row["due_date"] and row["due_date"] < date.today().isoformat() and Decimal(str(row["outstanding_amount"] or 0)) > 0))
    collection_rate = (total_paid / total_due * 100) if total_due > 0 else None

    if invoices:
        if overdue_count:
            severity = "warning" if overdue_count < 5 else "critical"
            summary = f"{overdue_count} fee invoice(s) are overdue, with an aggregate outstanding balance of ₹{total_outstanding:,.2f}. Review follow-up processes; this is a school-level aggregate, not an individual assessment."
        elif collection_rate is not None and collection_rate < 70:
            severity = "warning"
            summary = f"Fee collection stands at {collection_rate:.1f}% of ₹{total_due:,.2f} invoiced, with ₹{total_outstanding:,.2f} outstanding. Review payment follow-ups."
        else:
            severity = "info"
            summary = f"Fee collection stands at {collection_rate:.1f}% of ₹{total_due:,.2f} invoiced, with ₹{total_outstanding:,.2f} outstanding."
        insights.append({
            "school_id": str(school_id),
            "insight_type": "fee_collection_overview",
            "summary": summary,
            "severity": severity,
            "period_start": period_start.isoformat(),
            "period_end": period_end.isoformat(),
            "generated_by": current_user["id"],
        })
    else:
        insights.append({
            "school_id": str(school_id),
            "insight_type": "fee_data_gap",
            "summary": "No fee invoices were found. Create invoices to enable fee collection insights.",
            "severity": "info",
            "period_start": period_start.isoformat(),
            "period_end": period_end.isoformat(),
            "generated_by": current_user["id"],
        })

    response = await _request(
        "ai_insights", "POST", credentials,
        params={"select": INSIGHT_FIELDS},
        payload=insights,
    )
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not save generated insights")
    saved = _rows(response, allowed=(200, 201))
    return {
        "success": True,
        "generation_mode": "rule_based_aggregate",
        "note": "These are transparent aggregate indicators, not predictions or individual student assessments.",
        "metrics": {
            "active_enrollments": len(enrollments),
            "attendance_records": total_attendance,
            "present_or_late_records": present_like,
            "absent_records": absent,
            "attendance_rate_percent": round(attendance_rate, 1) if attendance_rate is not None else None,
            "invoice_count": len(invoices),
            "total_invoiced": str(total_due),
            "total_paid": str(total_paid),
            "total_outstanding": str(total_outstanding),
            "overdue_invoice_count": overdue_count,
            "fee_collection_rate_percent": round(collection_rate, 1) if collection_rate is not None else None,
        },
        "insights": saved,
    }


@router.get("")
async def list_school_insights(
    school_id: UUID,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: dict = Depends(get_current_user),
    _admin: dict = Depends(require_school_roles("admin")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    response = await _request(
        "ai_insights", "GET", credentials,
        params={
            "select": INSIGHT_FIELDS,
            "school_id": f"eq.{school_id}",
            "order": "generated_at.desc",
            "limit": str(limit),
            "offset": str(offset),
        },
    )
    return {"success": True, "insights": _rows(response), "limit": limit, "offset": offset}
