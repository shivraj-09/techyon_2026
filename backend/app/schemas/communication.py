from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


AnnouncementAudience = Literal["school", "class", "parents", "teachers"]


class AnnouncementCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=180)
    body: str = Field(min_length=1, max_length=10000)
    audience: AnnouncementAudience = "school"
    class_id: UUID | None = None

    @field_validator("title", "body")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank")
        return value

    @classmethod
    def validate_audience_class(cls, values):
        return values


class NotificationReadUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_read: bool = True
