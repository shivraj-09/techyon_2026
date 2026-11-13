from datetime import date
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


AttendanceStatus = Literal["present", "absent", "late", "excused"]


class AttendanceEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")

    student_id: UUID
    status: AttendanceStatus
    remarks: str | None = Field(default=None, max_length=500)

    @field_validator("remarks")
    @classmethod
    def normalize_remarks(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class AttendanceBatchCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    attendance_date: date
    records: list[AttendanceEntry] = Field(min_length=1, max_length=200)

    @field_validator("records")
    @classmethod
    def unique_students(cls, value: list[AttendanceEntry]) -> list[AttendanceEntry]:
        ids = [entry.student_id for entry in value]
        if len(ids) != len(set(ids)):
            raise ValueError("A student can appear only once in an attendance submission")
        return value


class AttendanceUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: AttendanceStatus
    remarks: str | None = Field(default=None, max_length=500)

    @field_validator("remarks")
    @classmethod
    def normalize_remarks(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None
