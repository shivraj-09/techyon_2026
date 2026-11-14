from pydantic import BaseModel, ConfigDict, Field, field_validator


class ClassCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    grade_level: str | None = Field(default=None, max_length=40)
    section: str | None = Field(default=None, max_length=40)
    academic_year: str = Field(min_length=4, max_length=20)

    @field_validator("name", "academic_year")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        value = " ".join(value.split())
        if not value:
            raise ValueError("This field cannot be blank")
        return value

    @field_validator("grade_level", "section")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = " ".join(value.split())
        return value or None


class ClassUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=100)
    grade_level: str | None = Field(default=None, max_length=40)
    section: str | None = Field(default=None, max_length=40)
    academic_year: str | None = Field(default=None, min_length=4, max_length=20)

    @field_validator("name", "academic_year")
    @classmethod
    def normalize_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = " ".join(value.split())
        if not value:
            raise ValueError("This field cannot be blank")
        return value
