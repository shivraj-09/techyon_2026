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
    async def test_role_dependency_finds_allowed_role_when_another_role_is_older(self):
        from unittest.mock import AsyncMock, patch
        from uuid import UUID
        from fastapi.security import HTTPAuthorizationCredentials
        from app.core.authorization import require_school_roles

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        memberships = [
            {"school_id": str(school_id), "role": "teacher", "status": "active"},
            {"school_id": str(school_id), "role": "counsellor", "status": "active"},
        ]
        dependency = require_school_roles("counsellor")
        with patch("app.core.authorization.fetch_active_memberships", new=AsyncMock(return_value=memberships)):
            result = await dependency(school_id, {"id": "user-1"}, credentials)
        self.assertEqual(result["role"], "counsellor")

    async def test_role_dependency_respects_declared_role_precedence(self):
        from unittest.mock import AsyncMock, patch
        from uuid import UUID
        from fastapi.security import HTTPAuthorizationCredentials
        from app.core.authorization import require_school_roles

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        memberships = [
            {"school_id": str(school_id), "role": "counsellor", "status": "active"},
            {"school_id": str(school_id), "role": "teacher", "status": "active"},
        ]
        dependency = require_school_roles("teacher", "counsellor")
        with patch("app.core.authorization.fetch_active_memberships", new=AsyncMock(return_value=memberships)):
            result = await dependency(school_id, {"id": "user-1"}, credentials)
        self.assertEqual(result["role"], "teacher")

    async def test_role_dependency_rejects_membership_from_another_school(self):
        from unittest.mock import AsyncMock, patch
        from uuid import UUID
        from fastapi import HTTPException
        from fastapi.security import HTTPAuthorizationCredentials
        from app.core.authorization import require_school_roles

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        dependency = require_school_roles("counsellor")
        with patch("app.core.authorization.fetch_active_memberships", new=AsyncMock(return_value=[
            {"school_id": "another-school", "role": "counsellor", "status": "active"}
        ])):
            with self.assertRaises(HTTPException) as raised:
                await dependency(school_id, {"id": "user-1"}, credentials)
        self.assertEqual(raised.exception.status_code, 403)

    async def test_admin_is_not_implicitly_a_counsellor(self):
        from unittest.mock import AsyncMock, patch
        from uuid import UUID
        from fastapi import HTTPException
        from fastapi.security import HTTPAuthorizationCredentials
        from app.core.authorization import require_school_roles

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        dependency = require_school_roles("counsellor")
        with patch("app.core.authorization.fetch_active_memberships", new=AsyncMock(return_value=[
            {"school_id": str(school_id), "role": "admin", "status": "active"}
        ])):
            with self.assertRaises(HTTPException) as raised:
                await dependency(school_id, {"id": "user-1"}, credentials)
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


class StudentVoiceStudentAccessTests(IsolatedAsyncioTestCase):
    async def test_student_access_requires_active_link(self):
        from unittest.mock import AsyncMock, patch
        import httpx
        from fastapi import HTTPException
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1 import counsellor

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        with patch.object(counsellor, "_request", new=AsyncMock(return_value=httpx.Response(200, json=[]))) as request:
            with self.assertRaises(HTTPException) as raised:
                await counsellor._require_student_voice_student(
                    school_id, {"id": "student-user"}, credentials
                )

        self.assertEqual(raised.exception.status_code, 403)
        request.assert_awaited_once()

    async def test_student_access_rejects_dual_role_account(self):
        from unittest.mock import AsyncMock, patch
        import httpx
        from fastapi import HTTPException
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1 import counsellor

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        active_link = httpx.Response(200, json=[{"id": "link-1"}])
        memberships = [{"school_id": str(school_id), "role": "counsellor", "status": "active"}]

        with patch.object(counsellor, "_request", new=AsyncMock(return_value=active_link)) as request, patch.object(
            counsellor, "fetch_active_memberships", new=AsyncMock(return_value=memberships)
        ):
            with self.assertRaises(HTTPException) as raised:
                await counsellor._require_student_voice_student(
                    school_id, {"id": "dual-user"}, credentials
                )

        self.assertEqual(raised.exception.status_code, 403)
        request.assert_awaited_once()


class StudentVoiceMigrationContractTests(TestCase):
    """Static SQL guardrails; these do not replace PostgreSQL/RLS integration tests."""

    @classmethod
    def setUpClass(cls):
        from pathlib import Path

        migrations = Path(__file__).resolve().parents[1] / "migrations"
        cls.student_voice_base = (migrations / "202611140005_create_student_voice.sql").read_text()
        cls.workflow_transitions = (migrations / "202611140006_enforce_counsellor_workflow_transitions.sql").read_text()
        cls.student_access = (migrations / "202611140011_revoke_student_voice_access_with_link.sql").read_text()
        cls.identity_private_rls = (migrations / "202611140014_keep_student_voice_identity_private_in_rls.sql").read_text()
        cls.identity_reveal = (migrations / "202611140012_preserve_identity_reveal_after_completion.sql").read_text()
        cls.terminal_revoke = (migrations / "202611140013_make_student_voice_revocation_terminal.sql").read_text()

    def test_student_access_policies_recheck_active_link(self):
        sql = self.student_access.lower()
        self.assertIn("student_voice_owns_active_conversation", sql)
        self.assertGreaterEqual(sql.count("student_voice_owns_active_conversation("), 4)
        self.assertIn("security definer", sql)
        self.assertIn("set search_path = ''", sql)
        for helper in (
            "student_voice_student_can_message_conversation",
            "student_voice_counsellor_can_read_conversation",
            "student_voice_counsellor_can_message_conversation",
        ):
            self.assertIn(f"create or replace function public.{helper}", sql)
            self.assertIn(f"grant execute on function public.{helper}(uuid, uuid) to authenticated", sql)
        self.assertIn("student_voice_conversations_student_select", sql)
        self.assertIn("student_voice_messages_student_read", sql)
        self.assertIn("student_voice_messages_participant_insert", sql)
        self.assertIn("student_voice_meetings_student_select", sql)
        self.assertIn("student_voice_meetings_student_insert", sql)

    def test_student_rls_helpers_reject_dual_role_counsellor_accounts(self):
        sql = self.student_access.lower()
        self.assertGreaterEqual(sql.count("and not exists ("), 2)
        self.assertIn("m.role = 'counsellor'::public.membership_role", sql)
        self.assertIn("m.status = 'active'::public.membership_status", sql)
        self.assertIn("student_voice_student_can_message_conversation", sql)

    def test_identity_private_rls_helper_rejects_dual_role_accounts(self):
        sql = self.identity_private_rls.lower()
        self.assertIn("security definer", sql)
        self.assertIn("set search_path = ''", sql)
        self.assertIn("and not exists (", sql)
        self.assertIn("m.role = 'counsellor'::public.membership_role", sql)
        self.assertIn("m.status = 'active'::public.membership_status", sql)

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

    def test_counsellor_message_reads_require_active_membership_and_assignment(self):
        sql = self.student_voice_base.lower()
        start = sql.index("create policy student_voice_messages_counsellor_read")
        end = sql.index("drop policy if exists student_voice_messages_participant_insert", start)
        policy = sql[start:end]
        self.assertIn("m.role = 'counsellor'::public.membership_role", policy)
        self.assertIn("m.status = 'active'::public.membership_status", policy)
        self.assertIn("c.assigned_counsellor_id is null or c.assigned_counsellor_id = (select auth.uid())", policy)

    def test_counsellor_meeting_reads_require_active_membership_and_assignment(self):
        sql = self.student_voice_base.lower()
        start = sql.index("create policy student_voice_meetings_counsellor_select")
        end = sql.index("drop policy if exists student_voice_meetings_student_insert", start)
        policy = sql[start:end]
        self.assertIn("m.role = 'counsellor'::public.membership_role", policy)
        self.assertIn("m.status = 'active'::public.membership_status", policy)
        self.assertIn("c.assigned_counsellor_id is null or c.assigned_counsellor_id = (select auth.uid())", policy)

    def test_student_meeting_request_reads_and_inserts_require_active_link(self):
        sql = self.student_access.lower()
        select_start = sql.index("create policy student_voice_meetings_student_select")
        select_end = sql.index("drop policy if exists student_voice_meetings_student_insert", select_start)
        select_policy = sql[select_start:select_end]
        self.assertIn("requested_by = (select auth.uid())", select_policy)
        self.assertIn("student_voice_owns_active_conversation(school_id, conversation_id)", select_policy)
        insert_start = sql.index("create policy student_voice_meetings_student_insert")
        insert_policy = sql[insert_start:]
        self.assertIn("requested_by = (select auth.uid())", insert_policy)
        self.assertIn("student_voice_student_can_message_conversation(school_id, conversation_id)", insert_policy)

    def test_referral_trigger_restricts_status_transitions_and_assignment(self):
        sql = self.workflow_transitions.lower()
        start = sql.index("create or replace function public.enforce_counsellor_referral_transition")
        end = sql.index("drop trigger if exists counsellor_referral_transition_guard", start)
        function = sql[start:end]
        expected_transitions = (
            "when 'submitted' then new.status in ('under_review', 'clarification_requested', 'accepted', 'declined', 'closed')",
            "when 'under_review' then new.status in ('clarification_requested', 'accepted', 'declined', 'closed')",
            "when 'clarification_requested' then new.status in ('under_review', 'accepted', 'declined', 'closed')",
            "when 'accepted' then new.status = 'closed'",
            "when 'declined' then new.status = 'closed'",
            "when 'closed' then false",
        )
        for transition in expected_transitions:
            self.assertIn(transition, function)
        self.assertIn("new.assigned_counsellor_id is distinct from (select auth.uid())", function)
        self.assertIn("old.assigned_counsellor_id is not null", function)
        self.assertIn("cannot be reassigned", function)

    def test_meeting_trigger_allows_only_pending_review_and_approved_completion(self):
        sql = self.workflow_transitions.lower()
        start = sql.index("create or replace function public.enforce_student_voice_meeting_transition")
        end = sql.index("drop trigger if exists student_voice_meeting_transition_guard", start)
        function = sql[start:end]
        self.assertIn("when 'pending' then new.status in ('approved', 'declined')", function)
        self.assertIn("when 'approved' then new.status = 'completed'", function)
        self.assertIn("else false", function)
        self.assertIn("new.handled_by is distinct from (select auth.uid())", function)
        self.assertIn("new.handled_at is null", function)

    def test_meeting_request_trigger_freezes_request_content(self):
        sql = self.workflow_transitions.lower()
        start = sql.index("create or replace function public.enforce_student_voice_meeting_transition")
        end = sql.index("drop trigger if exists student_voice_meeting_transition_guard", start)
        function = sql[start:end]
        for field in ("school_id", "conversation_id", "requested_by", "preferred_times", "student_message"):
            self.assertIn(f"new.{field} is distinct from old.{field}", function)
        self.assertIn("new.handled_by is distinct from (select auth.uid())", function)
        self.assertIn("new.handled_at is null", function)

    def test_counsellor_inbox_does_not_expose_student_identity_fields(self):
        from pathlib import Path
        api = (Path(__file__).resolve().parents[1] / "app" / "api" / "v1" / "counsellor.py").read_text()
        start = api.index("async def list_student_voice_inbox")
        end = api.index("@student_voice_router.get", start)
        handler = api[start:end]
        self.assertIn("public_ref", handler)
        self.assertNotIn("student_user_id", handler)
        self.assertNotIn("student_id", handler)

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
            counsellor, "fetch_active_memberships",
            new=AsyncMock(return_value=[{
                "school_id": str(school_id), "role": "counsellor", "status": "active"
            }])
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



class CounsellingPublicationRouteTests(IsolatedAsyncioTestCase):
    async def test_session_publish_is_creator_scoped_and_uses_compare_and_set(self):
        from unittest.mock import AsyncMock, patch
        import httpx
        from uuid import UUID
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1 import counsellor
        from app.schemas.counsellor import CounsellingSessionStatusUpdate

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        session_id = UUID("00000000-0000-0000-0000-000000000060")
        user = {"id": "00000000-0000-0000-0000-000000000040"}
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        existing = httpx.Response(200, json=[{"id": str(session_id), "status": "draft", "created_by": user["id"]}])
        updated = httpx.Response(200, json=[{"id": str(session_id), "status": "published"}])

        with patch.object(counsellor, "_request", new=AsyncMock(side_effect=[existing, updated])) as request:
            result = await counsellor.update_counselling_session_status(
                school_id, session_id, CounsellingSessionStatusUpdate(status="published"),
                current_user=user, _counsellor={"role": "counsellor"}, credentials=credentials,
            )

        self.assertEqual(result["session"]["status"], "published")
        self.assertEqual(request.await_count, 2)
        self.assertEqual(request.await_args_list[1].kwargs["params"]["status"], "eq.draft")
        self.assertEqual(request.await_args_list[1].kwargs["payload"], {"status": "published"})

    async def test_session_publish_rejects_non_creator(self):
        from unittest.mock import AsyncMock, patch
        import httpx
        from uuid import UUID
        from fastapi import HTTPException
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1 import counsellor
        from app.schemas.counsellor import CounsellingSessionStatusUpdate

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        session_id = UUID("00000000-0000-0000-0000-000000000060")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        existing = httpx.Response(200, json=[{"id": str(session_id), "status": "draft", "created_by": "other-user"}])

        with patch.object(counsellor, "_request", new=AsyncMock(return_value=existing)) as request:
            with self.assertRaises(HTTPException) as raised:
                await counsellor.update_counselling_session_status(
                    school_id, session_id, CounsellingSessionStatusUpdate(status="published"),
                    current_user={"id": "current-user"}, _counsellor={"role": "counsellor"}, credentials=credentials,
                )

        self.assertEqual(raised.exception.status_code, 403)
        request.assert_awaited_once()

    async def test_notice_publish_uses_conditional_status_update(self):
        from unittest.mock import AsyncMock, patch
        import httpx
        from uuid import UUID
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1 import counsellor
        from app.schemas.counsellor import CounsellingNoticeStatusUpdate

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        notice_id = UUID("00000000-0000-0000-0000-000000000070")
        user = {"id": "00000000-0000-0000-0000-000000000040"}
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        existing = httpx.Response(200, json=[{"id": str(notice_id), "status": "draft", "created_by": user["id"]}])
        updated = httpx.Response(200, json=[{"id": str(notice_id), "status": "published"}])

        with patch.object(counsellor, "_request", new=AsyncMock(side_effect=[existing, updated])) as request:
            result = await counsellor.update_counselling_notice_status(
                school_id, notice_id, CounsellingNoticeStatusUpdate(status="published"),
                current_user=user, _counsellor={"role": "counsellor"}, credentials=credentials,
            )

        self.assertEqual(result["notice"]["status"], "published")
        self.assertEqual(request.await_args_list[1].kwargs["params"]["status"], "eq.draft")


class CounsellorReferralInboxRoleTests(IsolatedAsyncioTestCase):
    async def test_dual_role_account_gets_counsellor_school_inbox(self):
        from unittest.mock import AsyncMock, patch
        import httpx
        from uuid import UUID
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1 import counsellor

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        memberships = [
            {"school_id": str(school_id), "role": "teacher", "status": "active"},
            {"school_id": str(school_id), "role": "counsellor", "status": "active"},
        ]
        response = httpx.Response(200, json=[{"id": "referral-1"}])
        with patch.object(counsellor, "fetch_active_memberships", new=AsyncMock(return_value=memberships)), patch.object(
            counsellor, "_request", new=AsyncMock(return_value=response)
        ) as request:
            result = await counsellor.list_referrals(
                school_id=school_id, referral_status=None, limit=50, offset=0,
                current_user={"id": "user-1"}, credentials=credentials,
            )
        self.assertEqual(result["referrals"], [{"id": "referral-1"}])
        self.assertEqual(request.await_args.kwargs["params"]["school_id"], f"eq.{school_id}")

    async def test_referral_inbox_rejects_membership_without_teacher_or_counsellor_role(self):
        from unittest.mock import AsyncMock, patch
        from uuid import UUID
        from fastapi import HTTPException
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1 import counsellor

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        memberships = [{"school_id": str(school_id), "role": "parent", "status": "active"}]
        with patch.object(counsellor, "fetch_active_memberships", new=AsyncMock(return_value=memberships)), patch.object(
            counsellor, "_request", new=AsyncMock()
        ) as request:
            with self.assertRaises(HTTPException) as raised:
                await counsellor.list_referrals(
                    school_id=school_id, referral_status=None, limit=50, offset=0,
                    current_user={"id": "user-1"}, credentials=credentials,
                )
        self.assertEqual(raised.exception.status_code, 403)
        request.assert_not_awaited()


class StudentVoiceAuthAccessTests(IsolatedAsyncioTestCase):
    async def test_access_lookup_is_scoped_to_authenticated_user_and_active_links(self):
        from unittest.mock import patch
        import httpx
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1.auth import read_my_student_voice_access

        captured = {}
        class FakeClient:
            async def __aenter__(self):
                return self
            async def __aexit__(self, *args):
                return False
            async def get(self, url, headers, params):
                captured.update({"url": url, "headers": headers, "params": params})
                return httpx.Response(200, json=[{"school_id": "school-1", "student_id": "student-1"}])

        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="student-token")
        with patch("app.api.v1.auth.httpx.AsyncClient", return_value=FakeClient()):
            result = await read_my_student_voice_access(
                current_user={"id": "auth-user-1"}, credentials=credentials
            )

        self.assertEqual(result["access"], [{"school_id": "school-1", "student_id": "student-1"}])
        self.assertEqual(captured["params"]["student_user_id"], "eq.auth-user-1")
        self.assertEqual(captured["params"]["status"], "eq.active")
        self.assertEqual(captured["headers"]["Authorization"], "Bearer student-token")

    async def test_access_lookup_requires_bearer_credentials(self):
        from fastapi import HTTPException
        from app.api.v1.auth import read_my_student_voice_access

        with self.assertRaises(HTTPException) as raised:
            await read_my_student_voice_access(current_user={"id": "auth-user-1"}, credentials=None)
        self.assertEqual(raised.exception.status_code, 401)


class CanonicalSchemaSnapshotTests(TestCase):
    """Guard the recovered, read-only baseline without treating it as an active migration."""

    @classmethod
    def setUpClass(cls):
        from pathlib import Path
        root = Path(__file__).resolve().parents[1] / "schema_snapshots"
        cls.initial = (root / "20261113075326_edusync_initial_schema.sql").read_text().lower()
        cls.hardening = (root / "20261113075340_edusync_schema_hardening.sql").read_text().lower()
        cls.privileges = (root / "20261113075415_edusync_api_privilege_hardening.sql").read_text().lower()

    def test_snapshot_contains_foundational_tables_and_rls(self):
        for table in ("schools", "school_memberships", "students", "classes", "student_enrollments", "class_teacher_assignments"):
            self.assertIn(f"create table if not exists public.{table}", self.initial)
            self.assertIn(f"alter table public.{table} enable row level security", self.initial)

    def test_snapshot_is_schema_only_and_contains_no_seed_rows(self):
        self.assertNotRegex(self.initial, r"\binsert\s+into\b")
        self.assertNotIn("copy ", self.initial)
        self.assertIn("create policy", self.initial)
        self.assertIn("with (security_invoker = true)", self.initial)

    def test_hardening_and_api_privileges_are_preserved(self):
        self.assertIn("set search_path = pg_catalog, public", self.hardening)
        self.assertIn("create index if not exists idx_class_teacher_class_school", self.hardening)
        self.assertIn("revoke all privileges on all tables in schema public from anon", self.privileges)
        self.assertIn("grant select, insert, update, delete on all tables in schema public to authenticated", self.privileges)


class ReferralListAuthorizationTests(IsolatedAsyncioTestCase):
    async def test_teacher_referral_list_is_scoped_to_submitter(self):
        from unittest.mock import AsyncMock, patch
        import httpx
        from uuid import UUID
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1 import counsellor

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        user = {"id": "teacher-user"}
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        memberships = [{"school_id": str(school_id), "role": "teacher", "status": "active"}]
        response = httpx.Response(200, json=[])

        with patch.object(counsellor, "fetch_active_memberships", new=AsyncMock(return_value=memberships)):
            with patch.object(counsellor, "_request", new=AsyncMock(return_value=response)) as request:
                result = await counsellor.list_referrals(
                    school_id=school_id,
                    referral_status=None,
                    limit=50,
                    offset=0,
                    current_user=user,
                    credentials=credentials,
                )

        self.assertEqual(result["referrals"], [])
        self.assertEqual(request.await_args.kwargs["params"]["submitted_by"], "eq.teacher-user")

    async def test_counsellor_referral_list_remains_school_wide(self):
        from unittest.mock import AsyncMock, patch
        import httpx
        from uuid import UUID
        from fastapi.security import HTTPAuthorizationCredentials
        from app.api.v1 import counsellor

        school_id = UUID("00000000-0000-0000-0000-000000000020")
        user = {"id": "counsellor-user"}
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test-token")
        memberships = [{"school_id": str(school_id), "role": "counsellor", "status": "active"}]
        response = httpx.Response(200, json=[])

        with patch.object(counsellor, "fetch_active_memberships", new=AsyncMock(return_value=memberships)):
            with patch.object(counsellor, "_request", new=AsyncMock(return_value=response)) as request:
                result = await counsellor.list_referrals(
                    school_id=school_id,
                    referral_status=None,
                    limit=50,
                    offset=0,
                    current_user=user,
                    credentials=credentials,
                )

        self.assertEqual(result["referrals"], [])
        self.assertNotIn("submitted_by", request.await_args.kwargs["params"])
