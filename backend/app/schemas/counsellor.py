from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


ReferralCategory = Literal[
    "academic",
    "attendance",
    "behaviour",
    "wellbeing",
    "peer_relationships",
    "family_or_social",
    "other",
]
ReferralUrgency = Literal["low", "normal", "high"]
ReferralStatus = Literal[
    "submitted",
    "under_review",
    "clarification_requested",
    "accepted",
    "declined",
    "closed",
]


class ReferralCreate(BaseModel):
    student_id: UUID
    class_id: UUID
    category: ReferralCategory
    summary: str = Field(min_length=10, max_length=3000)
    urgency: ReferralUrgency = "normal"

    @field_validator("summary")
    @classmethod
    def normalize_summary(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 10:
            raise ValueError("Please provide at least 10 characters of context")
        return value


class ReferralReviewUpdate(BaseModel):
    status: Literal[
        "under_review",
        "clarification_requested",
        "accepted",
        "declined",
        "closed",
    ]
    counsellor_response: str | None = Field(default=None, max_length=2000)

    @field_validator("counsellor_response")
    @classmethod
    def normalize_response(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None
