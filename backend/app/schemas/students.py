from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class StudentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    admission_no: str = Field(min_length=1, max_length=50)
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str | None = Field(default=None, max_length=80)
    date_of_birth: date | None = None

    @field_validator("admission_no", "first_name", "last_name")
    @classmethod
    def normalize_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = " ".join(value.split())
        if not value:
            raise ValueError("This field cannot be blank")
        return value


class StudentUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    admission_no: str | None = Field(default=None, min_length=1, max_length=50)
    first_name: str | None = Field(default=None, min_length=1, max_length=80)
    last_name: str | None = Field(default=None, max_length=80)
    date_of_birth: date | None = None
    status: Literal["active", "inactive", "graduated", "transferred"] | None = None

    @field_validator("admission_no", "first_name", "last_name")
    @classmethod
    def normalize_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = " ".join(value.split())
        if not value:
            raise ValueError("This field cannot be blank")
        return value


class EnrollmentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    class_id: str
    academic_year: str = Field(min_length=4, max_length=20)
    roll_number: str | None = Field(default=None, max_length=30)

    @field_validator("academic_year", "roll_number")
    @classmethod
    def normalize_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = " ".join(value.split())
        if not value:
            raise ValueError("This field cannot be blank")
        return value
