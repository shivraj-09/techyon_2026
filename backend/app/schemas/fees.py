from datetime import date
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class InvoiceCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    student_id: UUID
    invoice_number: str = Field(min_length=1, max_length=50)
    description: str = Field(min_length=1, max_length=300)
    amount_due: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    due_date: date

    @field_validator("invoice_number", "description")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        value = " ".join(value.split())
        if not value:
            raise ValueError("This field cannot be blank")
        return value


class PaymentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    payment_method: Literal["cash", "upi", "bank_transfer", "card", "cheque", "other"]
    reference_number: str | None = Field(default=None, max_length=100)

    @field_validator("reference_number")
    @classmethod
    def normalize_reference(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None
