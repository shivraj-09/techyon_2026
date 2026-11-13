from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.core.authorization import require_school_roles
from app.schemas.membership import InviteMemberRequest
from app.services.invitations import invite_school_member

router = APIRouter(prefix="/schools", tags=["School Members"])


@router.post(
    "/{school_id}/members/invite",
    status_code=status.HTTP_201_CREATED,
)
async def invite_member(
    school_id: UUID,
    payload: InviteMemberRequest,
    _admin_membership: dict = Depends(require_school_roles("admin")),
):
    """Invite a teacher or parent into the school. Only active admins can do this."""
    result = await invite_school_member(
        school_id=str(school_id),
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
    )
    return {"success": True, "invitation": result}
