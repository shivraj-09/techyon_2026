from uuid import UUID
from decimal import Decimal

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.authorization import get_active_school_membership, require_school_roles
from app.core.config import settings
from app.core.security import bearer_scheme, get_current_user
from app.schemas.fees import InvoiceCreate, PaymentCreate

router = APIRouter(prefix="/schools/{school_id}/fees", tags=["Fees"])

INVOICE_FIELDS = "id,school_id,student_id,invoice_number,description,amount_due,due_date,status,created_by,created_at,updated_at"
PAYMENT_FIELDS = "id,school_id,invoice_id,amount,payment_method,reference_number,status,recorded_by,paid_at,created_at"
BALANCE_FIELDS = "invoice_id,school_id,student_id,invoice_number,amount_due,amount_paid,outstanding_amount,due_date,status"


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
        raise HTTPException(status_code=503, detail="Fee service temporarily unavailable")


def _rows(response: httpx.Response, allowed=(200,)) -> list[dict]:
    if response.status_code not in allowed:
        raise HTTPException(status_code=502, detail="Fee database request failed")
    try:
        data = response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Invalid fee database response")
    if not isinstance(data, list):
        raise HTTPException(status_code=502, detail="Invalid fee database response")
    return data


@router.post("/invoices", status_code=status.HTTP_201_CREATED)
async def create_invoice(
    school_id: UUID,
    payload: InvoiceCreate,
    current_user: dict = Depends(get_current_user),
    _admin: dict = Depends(require_school_roles("admin")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    student_rows = _rows(await _request(
        "students", "GET", credentials,
        params={"select": "id,status", "id": f"eq.{payload.student_id}", "school_id": f"eq.{school_id}"},
    ))
    if not student_rows:
        raise HTTPException(status_code=404, detail="Student not found in this school")
    response = await _request(
        "fee_invoices", "POST", credentials,
        params={"select": INVOICE_FIELDS},
        payload={
            "school_id": str(school_id),
            **payload.model_dump(mode="json"),
            "created_by": current_user["id"],
        },
    )
    if response.status_code == 409:
        raise HTTPException(status_code=409, detail="Invoice number already exists")
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not create fee invoice")
    rows = _rows(response, allowed=(200, 201))
    if not rows:
        raise HTTPException(status_code=502, detail="Invoice created but no record was returned")
    return {"success": True, "invoice": rows[0]}


@router.get("/invoices")
async def list_invoices(
    school_id: UUID,
    student_id: UUID | None = None,
    invoice_status: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _membership: dict = Depends(get_active_school_membership),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    params = {
        "select": INVOICE_FIELDS,
        "school_id": f"eq.{school_id}",
        "order": "created_at.desc",
        "limit": str(limit),
        "offset": str(offset),
    }
    if student_id:
        params["student_id"] = f"eq.{student_id}"
    if invoice_status:
        allowed = {"draft", "issued", "partially_paid", "paid", "overdue", "cancelled"}
        if invoice_status not in allowed:
            raise HTTPException(status_code=422, detail="Invalid invoice status")
        params["status"] = f"eq.{invoice_status}"
    rows = _rows(await _request("fee_invoices", "GET", credentials, params=params))
    return {"success": True, "invoices": rows, "limit": limit, "offset": offset}


@router.get("/balances")
async def list_invoice_balances(
    school_id: UUID,
    student_id: UUID | None = None,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _membership: dict = Depends(get_active_school_membership),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    params = {
        "select": BALANCE_FIELDS,
        "school_id": f"eq.{school_id}",
        "order": "due_date.asc",
        "limit": str(limit),
        "offset": str(offset),
    }
    if student_id:
        params["student_id"] = f"eq.{student_id}"
    rows = _rows(await _request("fee_invoice_balances", "GET", credentials, params=params))
    return {"success": True, "balances": rows, "limit": limit, "offset": offset}


@router.post("/invoices/{invoice_id}/payments", status_code=status.HTTP_201_CREATED)
async def record_payment(
    school_id: UUID,
    invoice_id: UUID,
    payload: PaymentCreate,
    current_user: dict = Depends(get_current_user),
    _admin: dict = Depends(require_school_roles("admin")),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    balances = _rows(await _request(
        "fee_invoice_balances", "GET", credentials,
        params={
            "select": "invoice_id,outstanding_amount,status",
            "invoice_id": f"eq.{invoice_id}",
            "school_id": f"eq.{school_id}",
        },
    ))
    if not balances:
        raise HTTPException(status_code=404, detail="Invoice not found in this school")
    balance = Decimal(str(balances[0]["outstanding_amount"]))
    if balance <= 0:
        raise HTTPException(status_code=409, detail="Invoice has no outstanding balance")
    if payload.amount > balance:
        raise HTTPException(status_code=422, detail=f"Payment exceeds outstanding balance of {balance}")

    response = await _request(
        "fee_payments", "POST", credentials,
        params={"select": PAYMENT_FIELDS},
        payload={
            "school_id": str(school_id),
            "invoice_id": str(invoice_id),
            **payload.model_dump(mode="json"),
            "recorded_by": current_user["id"],
            "status": "successful",
        },
    )
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail="Could not record fee payment")
    rows = _rows(response, allowed=(200, 201))
    if not rows:
        raise HTTPException(status_code=502, detail="Payment recorded but no record was returned")
    return {"success": True, "payment": rows[0]}


@router.get("/invoices/{invoice_id}/payments")
async def list_invoice_payments(
    school_id: UUID,
    invoice_id: UUID,
    _membership: dict = Depends(get_active_school_membership),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    invoice_rows = _rows(await _request(
        "fee_invoices", "GET", credentials,
        params={"select": "id", "id": f"eq.{invoice_id}", "school_id": f"eq.{school_id}"},
    ))
    if not invoice_rows:
        raise HTTPException(status_code=404, detail="Invoice not found")
    rows = _rows(await _request(
        "fee_payments", "GET", credentials,
        params={
            "select": PAYMENT_FIELDS,
            "invoice_id": f"eq.{invoice_id}",
            "school_id": f"eq.{school_id}",
            "order": "paid_at.desc",
        },
    ))
    return {"success": True, "payments": rows}
