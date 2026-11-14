from pydantic import BaseModel, Field
from uuid import UUID


class TeacherAssignmentCreate(BaseModel):
    teacher_user_id: UUID
