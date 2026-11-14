from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator


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


class CaseCreateFromReferral(BaseModel):
    referral_id: UUID


class CaseStatusUpdate(BaseModel):
    status: Literal["in_progress", "closed"]


class CaseNoteCreate(BaseModel):
    note_body: str = Field(min_length=1, max_length=10000)

    @field_validator("note_body")
    @classmethod
    def normalize_note(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Note cannot be empty")
        return value




CounsellingAudience = Literal["students", "parents", "teachers"]
CounsellingMeetingMode = Literal["in_person", "online", "hybrid"]
CounsellingPublishStatus = Literal["draft", "published", "cancelled"]


class CounsellingSessionCreate(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    description: str = Field(min_length=1, max_length=5000)
    audience: CounsellingAudience
    class_id: UUID | None = None
    starts_at: datetime
    ends_at: datetime
    capacity: int | None = Field(default=None, ge=1, le=10000)
    location: str | None = Field(default=None, max_length=300)
    meeting_mode: CounsellingMeetingMode = "in_person"
    status: CounsellingPublishStatus = "draft"

    @model_validator(mode="after")
    def validate_schedule(self):
        if self.starts_at.tzinfo is None or self.starts_at.utcoffset() is None:
            raise ValueError("starts_at must include a timezone")
        if self.ends_at.tzinfo is None or self.ends_at.utcoffset() is None:
            raise ValueError("ends_at must include a timezone")
        if self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be later than starts_at")
        if self.class_id is not None and self.audience != "students":
            raise ValueError("class-specific sessions must target students")
        return self


class CounsellingNoticeCreate(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    body: str = Field(min_length=1, max_length=5000)
    audience: CounsellingAudience
    class_id: UUID | None = None
    publish_at: datetime
    expires_at: datetime | None = None
    status: CounsellingPublishStatus = "draft"

    @model_validator(mode="after")
    def validate_notice(self):
        if self.publish_at.tzinfo is None or self.publish_at.utcoffset() is None:
            raise ValueError("publish_at must include a timezone")
        if self.expires_at is not None and (self.expires_at.tzinfo is None or self.expires_at.utcoffset() is None):
            raise ValueError("expires_at must include a timezone")
        if self.expires_at is not None and self.expires_at <= self.publish_at:
            raise ValueError("expires_at must be later than publish_at")
        if self.class_id is not None and self.audience != "students":
            raise ValueError("class-specific notices must target students")
        return self


class StudentVoiceLinkCreate(BaseModel):
    student_id: UUID
    student_user_id: UUID


class StudentVoiceMessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=5000)

    @field_validator("body")
    @classmethod
    def normalize_message(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Message cannot be empty")
        return value


class StudentVoiceMeetingRequestCreate(BaseModel):
    preferred_times: str = Field(min_length=1, max_length=2000)
    student_message: str | None = Field(default=None, max_length=2000)

    @field_validator("preferred_times")
    @classmethod
    def normalize_preferred_times(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Please provide preferred meeting times")
        return value


class StudentVoiceMeetingReview(BaseModel):
    status: Literal["approved", "declined", "completed"]


class CounsellingSessionStatusUpdate(BaseModel):
    status: Literal["published", "cancelled", "completed"]


class CounsellingNoticeStatusUpdate(BaseModel):
    status: Literal["published", "cancelled"]
