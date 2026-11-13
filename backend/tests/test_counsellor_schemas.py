from datetime import datetime, timedelta, timezone
from unittest import IsolatedAsyncioTestCase, TestCase
from uuid import UUID

from pydantic import ValidationError

from app.schemas.counsellor import (
    CaseStatusUpdate,
    CounsellingNoticeCreate,
    CounsellingSessionCreate,
    ReferralCreate,
    StudentVoiceMeetingRequestCreate,
    StudentVoiceMessageCreate,
    StudentVoiceMeetingReview,
)


class ReferralSchemaTests(TestCase):
    def test_summary_is_trimmed(self):
        payload = ReferralCreate(
            student_id="00000000-0000-0000-0000-000000000001",
            class_id="00000000-0000-0000-0000-000000000002",
            category="academic",
            summary="  Student has missed several assignments.  ",
        )
        self.assertEqual(payload.summary, "Student has missed several assignments.")

    def test_short_summary_is_rejected(self):
        with self.assertRaises(ValidationError):
            ReferralCreate(
                student_id="00000000-0000-0000-0000-000000000001",
                class_id="00000000-0000-0000-0000-000000000002",
                category="academic",
                summary=" short ",
            )


class CounsellingSchedulingSchemaTests(TestCase):
    def test_session_requires_end_after_start(self):
        start = datetime.now(timezone.utc)
        with self.assertRaises(ValidationError):
            CounsellingSessionCreate(
                title="Exam support",
                description="A group session about exam preparation.",
                audience="students",
                starts_at=start,
                ends_at=start - timedelta(minutes=1),
            )

    def test_class_targeting_is_student_only(self):
        start = datetime.now(timezone.utc)
        with self.assertRaises(ValidationError):
            CounsellingSessionCreate(
                title="Parent support",
                description="A session for parents.",
                audience="parents",
                class_id="00000000-0000-0000-0000-000000000002",
                starts_at=start,
                ends_at=start + timedelta(hours=1),
            )

    def test_notice_expiry_must_follow_publication(self):
        publish_at = datetime.now(timezone.utc)
        with self.assertRaises(ValidationError):
            CounsellingNoticeCreate(
                title="Wellbeing notice",
                body="Information about available student support.",
                audience="teachers",
                publish_at=publish_at,
                expires_at=publish_at,
            )


class StudentVoiceSchemaTests(TestCase):
    def test_message_is_trimmed(self):
        payload = StudentVoiceMessageCreate(body="  Hello counsellor  ")
        self.assertEqual(payload.body, "Hello counsellor")

    def test_blank_message_is_rejected(self):
        with self.assertRaises(ValidationError):
            StudentVoiceMessageCreate(body="   ")

    def test_meeting_times_are_trimmed(self):
        payload = StudentVoiceMeetingRequestCreate(preferred_times="  Tuesday afternoon  ")
        self.assertEqual(payload.preferred_times, "Tuesday afternoon")

    def test_case_status_is_limited(self):
        with self.assertRaises(ValidationError):
            CaseStatusUpdate(status="reopened")

    def test_meeting_review_accepts_supported_actions(self):
        self.assertEqual(StudentVoiceMeetingReview(status="approved").status, "approved")
        self.assertEqual(StudentVoiceMeetingReview(status="completed").status, "completed")

    def test_meeting_review_rejects_unknown_action(self):
        with self.assertRaises(ValidationError):
            StudentVoiceMeetingReview(status="cancelled")


class CounsellorRoleDependencyTests(IsolatedAsyncioTestCase):
    async def test_teacher_is_allowed_when_role_is_explicitly_permitted(self):
        from app.core.authorization import require_school_roles

        dependency = require_school_roles("teacher", "counsellor")
        membership = {"school_id": "school-a", "role": "teacher", "status": "active"}
        self.assertEqual(await dependency(membership), membership)

    async def test_admin_is_not_implicitly_a_counsellor(self):
        from fastapi import HTTPException
        from app.core.authorization import require_school_roles

        dependency = require_school_roles("counsellor")
        membership = {"school_id": "school-a", "role": "admin", "status": "active"}
        with self.assertRaises(HTTPException) as raised:
            await dependency(membership)
        self.assertEqual(raised.exception.status_code, 403)

    async def test_teacher_is_not_allowed_by_counsellor_only_dependency(self):
        from fastapi import HTTPException
        from app.core.authorization import require_school_roles

        dependency = require_school_roles("counsellor")
        membership = {"school_id": "school-a", "role": "teacher", "status": "active"}
        with self.assertRaises(HTTPException) as raised:
            await dependency(membership)
        self.assertEqual(raised.exception.status_code, 403)



class StudentVoiceLinkRevocationRouteTests(IsolatedAsyncioTestCase):
    async def test_admin_revocation_is_conditional_and_school_scoped(self):
        from unittest.mock import AsyncMock, patch
        from uuid import UUID

        import httpx
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1 import counsellor

        link_id = UUID("00000000-0000-0000-0000-000000000010")
        school_id = UUID("00000000-0000-0000-0000-000000000020")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        lookup = httpx.Response(200, json=[{"id": str(link_id), "status": "active"}])
        update = httpx.Response(200, json=[{"id": str(link_id), "school_id": str(school_id), "status": "revoked"}])

        with patch.object(counsellor, "_request", new=AsyncMock(side_effect=[lookup, update])) as request:
            result = await counsellor.revoke_student_voice_link(
                school_id=school_id,
                link_id=link_id,
                _admin={"role": "admin"},
                credentials=credentials,
            )

        self.assertTrue(result["success"])
        self.assertEqual(result["link"]["status"], "revoked")
        self.assertEqual(request.await_count, 2)
        update_call = request.await_args_list[1]
        self.assertEqual(update_call.args[:2], ("student_voice_student_links", "PATCH"))
        self.assertEqual(update_call.kwargs["params"]["school_id"], f"eq.{school_id}")
        self.assertEqual(update_call.kwargs["params"]["status"], "eq.active")
        self.assertEqual(update_call.kwargs["payload"], {"status": "revoked"})

    async def test_already_revoked_link_is_not_updated_again(self):
        from unittest.mock import AsyncMock, patch

        import httpx
        from fastapi import HTTPException
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1 import counsellor

        link_id = UUID("00000000-0000-0000-0000-000000000010")
        school_id = UUID("00000000-0000-0000-0000-000000000020")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        lookup = httpx.Response(200, json=[{"id": str(link_id), "status": "revoked"}])

        with patch.object(counsellor, "_request", new=AsyncMock(return_value=lookup)) as request:
            with self.assertRaises(HTTPException) as raised:
                await counsellor.revoke_student_voice_link(
                    school_id=school_id,
                    link_id=link_id,
                    _admin={"role": "admin"},
                    credentials=credentials,
                )

        self.assertEqual(raised.exception.status_code, 409)
        request.assert_awaited_once()
