from datetime import datetime, timedelta, timezone
from unittest import TestCase

from pydantic import ValidationError

from app.schemas.counsellor import (
    CaseStatusUpdate,
    CounsellingNoticeCreate,
    CounsellingSessionCreate,
    ReferralCreate,
    StudentVoiceMeetingRequestCreate,
    StudentVoiceMessageCreate,
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
