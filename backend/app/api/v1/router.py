from fastapi import APIRouter

from app.api.v1 import attendance, auth, classes, communication, fees, insights, memberships, students, teacher_assignments

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(memberships.router)
api_router.include_router(classes.router)
api_router.include_router(students.router)
api_router.include_router(attendance.router)
api_router.include_router(fees.router)
api_router.include_router(communication.router)
api_router.include_router(insights.router)
api_router.include_router(teacher_assignments.router)
