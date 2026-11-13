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


    def test_session_rejects_timezone_naive_datetimes(self):
        start = datetime(2026, 11, 20, 10, 0)
        with self.assertRaises(ValidationError):
            CounsellingSessionCreate(
                title="Exam support",
                description="A group session about exam preparation.",
                audience="students",
                starts_at=start,
                ends_at=start + timedelta(hours=1),
            )

    def test_notice_rejects_timezone_naive_publication_time(self):
        publish_at = datetime(2026, 11, 20, 10, 0)
        with self.assertRaises(ValidationError):
            CounsellingNoticeCreate(
                title="Wellbeing notice",
                body="Information about available student support.",
                audience="teachers",
                publish_at=publish_at,
            )

    def test_notice_rejects_timezone_naive_expiry_time(self):
        publish_at = datetime(2026, 11, 20, 10, 0, tzinfo=timezone.utc)
        with self.assertRaises(ValidationError):
            CounsellingNoticeCreate(
                title="Wellbeing notice",
                body="Information about available student support.",
                audience="teachers",
                publish_at=publish_at,
                expires_at=datetime(2026, 11, 21, 10, 0),
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



    async def test_concurrent_revocation_returns_conflict(self):
        from unittest.mock import AsyncMock, patch

        import httpx
        from fastapi import HTTPException
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1 import counsellor

        link_id = UUID("00000000-0000-0000-0000-000000000010")
        school_id = UUID("00000000-0000-0000-0000-000000000020")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        lookup = httpx.Response(200, json=[{"id": str(link_id), "status": "active"}])
        # A concurrent request revoked it after the initial read; the conditional PATCH returns no rows.
        update = httpx.Response(200, json=[])

        with patch.object(counsellor, "_request", new=AsyncMock(side_effect=[lookup, update])) as request:
            with self.assertRaises(HTTPException) as raised:
                await counsellor.revoke_student_voice_link(
                    school_id=school_id,
                    link_id=link_id,
                    _admin={"role": "admin"},
                    credentials=credentials,
                )

        self.assertEqual(raised.exception.status_code, 409)
        self.assertEqual(request.await_count, 2)


    async def test_dual_student_counsellor_identity_is_rejected(self):
        from unittest.mock import AsyncMock, patch

        import httpx
        from fastapi import HTTPException
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1 import counsellor

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        conversation_id = UUID("00000000-0000-0000-0000-000000000030")
        user = {"id": "00000000-0000-0000-0000-000000000040"}
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        active_link = httpx.Response(200, json=[{"id": "link-id"}])
        memberships = [{
            "school_id": str(school_id), "role": "counsellor", "status": "active"
        }]

        with patch.object(counsellor, "_request", new=AsyncMock(return_value=active_link)) as request, patch.object(
            counsellor, "fetch_active_memberships", new=AsyncMock(return_value=memberships)
        ):
            with self.assertRaises(HTTPException) as raised:
                await counsellor.send_student_voice_message(
                    school_id=school_id,
                    conversation_id=conversation_id,
                    payload=StudentVoiceMessageCreate(body="Hello"),
                    current_user=user,
                    credentials=credentials,
                )

        self.assertEqual(raised.exception.status_code, 403)
        request.assert_awaited_once()


class StudentVoiceMigrationContractTests(TestCase):
    """Static SQL guardrails; these do not replace PostgreSQL/RLS integration tests."""

    @classmethod
    def setUpClass(cls):
        from pathlib import Path

        migrations = Path(__file__).resolve().parents[1] / "migrations"
        cls.student_access = (migrations / "202611140011_revoke_student_voice_access_with_link.sql").read_text()
        cls.identity_reveal = (migrations / "202611140012_preserve_identity_reveal_after_completion.sql").read_text()
        cls.terminal_revoke = (migrations / "202611140013_make_student_voice_revocation_terminal.sql").read_text()

    def test_student_access_policies_recheck_active_link(self):
        sql = self.student_access.lower()
        self.assertGreaterEqual(sql.count("l.status = 'active'"), 4)
        self.assertIn("student_voice_conversations_student_select", sql)
        self.assertIn("student_voice_messages_student_read", sql)
        self.assertIn("student_voice_messages_participant_insert", sql)
        self.assertIn("student_voice_meetings_student_select", sql)
        self.assertIn("student_voice_meetings_student_insert", sql)

    def test_identity_reveal_requires_assigned_counsellor_and_active_link(self):
        sql = self.identity_reveal.lower()
        self.assertIn("l.status = 'active'", sql)
        self.assertIn("c.assigned_counsellor_id = (select auth.uid())", sql)
        self.assertIn("mr.status in ('approved', 'completed')", sql)
        self.assertIn("for share of l", sql)

    def test_identity_reveal_audits_before_returning_identity(self):
        sql = self.identity_reveal.lower()
        audit = sql.index("insert into public.student_voice_identity_reveal_audit")
        returned = sql.index("return query")
        self.assertLess(audit, returned)
        self.assertIn("security definer", sql)
        self.assertIn("set search_path = ''", sql)

    def test_link_revocation_is_terminal_and_identity_fields_are_immutable(self):
        sql = self.terminal_revoke.lower()
        self.assertIn("new.student_user_id is distinct from old.student_user_id", sql)
        self.assertIn("old.status <> 'active' or new.status <> 'revoked'", sql)
        self.assertIn("only an active school admin may revoke", sql)
        self.assertIn("before update on public.student_voice_student_links", sql)


class StudentVoiceAssignmentRaceRouteTests(IsolatedAsyncioTestCase):
    async def test_first_message_stops_when_another_counsellor_wins_assignment(self):
        from unittest.mock import AsyncMock, patch

        import httpx
        from fastapi import HTTPException
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1 import counsellor

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        conversation_id = UUID("00000000-0000-0000-0000-000000000030")
        user = {"id": "00000000-0000-0000-0000-000000000040"}
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        no_student_link = httpx.Response(200, json=[])
        conversation = httpx.Response(200, json=[{
            "id": str(conversation_id), "status": "open", "assigned_counsellor_id": None
        }])
        assignment_lost = httpx.Response(200, json=[])

        with patch.object(counsellor, "_request", new=AsyncMock(
            side_effect=[no_student_link, conversation, assignment_lost]
        )) as request, patch.object(
            counsellor, "get_active_school_membership",
            new=AsyncMock(return_value={"role": "counsellor", "status": "active"})
        ):
            with self.assertRaises(HTTPException) as raised:
                await counsellor.send_student_voice_message(
                    school_id=school_id,
                    conversation_id=conversation_id,
                    payload=StudentVoiceMessageCreate(body="Hello, I can help."),
                    current_user=user,
                    credentials=credentials,
                )

        self.assertEqual(raised.exception.status_code, 409)
        self.assertEqual(request.await_count, 3)
        self.assertEqual(request.await_args_list[2].args[:2], ("student_voice_conversations", "PATCH"))

    async def test_meeting_review_stops_when_another_counsellor_wins_assignment(self):
        from unittest.mock import AsyncMock, patch

        import httpx
        from fastapi import HTTPException
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1 import counsellor

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        request_id = UUID("00000000-0000-0000-0000-000000000050")
        conversation_id = UUID("00000000-0000-0000-0000-000000000030")
        user = {"id": "00000000-0000-0000-0000-000000000040"}
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        meeting = httpx.Response(200, json=[{
            "id": str(request_id), "status": "pending", "conversation_id": str(conversation_id)
        }])
        conversation = httpx.Response(200, json=[{
            "id": str(conversation_id), "status": "open", "assigned_counsellor_id": None
        }])
        assignment_lost = httpx.Response(200, json=[])

        with patch.object(counsellor, "_request", new=AsyncMock(
            side_effect=[meeting, conversation, assignment_lost]
        )) as request:
            with self.assertRaises(HTTPException) as raised:
                await counsellor.review_student_voice_meeting_request(
                    school_id=school_id,
                    request_id=request_id,
                    payload=StudentVoiceMeetingReview(status="approved"),
                    current_user=user,
                    _counsellor={"role": "counsellor"},
                    credentials=credentials,
                )

        self.assertEqual(raised.exception.status_code, 409)
        self.assertEqual(request.await_count, 3)
        self.assertEqual(request.await_args_list[2].args[:2], ("student_voice_conversations", "PATCH"))

