from datetime import date
from pydantic import BaseModel, ConfigDict, model_validator


class InsightGenerateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    period_start: date | None = None
    period_end: date | None = None

    @model_validator(mode="after")
    def validate_period(self):
        if self.period_start and self.period_end and self.period_end < self.period_start:
            raise ValueError("period_end must be on or after period_start")
        return self
