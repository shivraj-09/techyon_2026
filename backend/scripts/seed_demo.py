"""Create isolated, repeatable EduSync demo accounts and sample school data.

Run from the repository root:
    python backend/scripts/seed_demo.py

Safety: this script refuses to run unless SUPABASE_URL points to the
edusync-dev project and APP_ENV is development. It never targets production.
"""
from __future__ import annotations

import secrets
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")

try:
    from app.core.config import settings
except ImportError:
    sys.path.insert(0, str(BACKEND_DIR))
    from app.core.config import settings  # type: ignore[no-redef]


PROJECT_REF = "jndttmvvjghbxbvkaazj"
SCHOOL_CODE = "EDUSYNC-DEMO"
ACADEMIC_YEAR = "2026-2027"

DEMO_USERS = [
    {"key": "admin", "email": "admin@edusync.local", "name": "Aditi Mehta", "role": "admin"},
    {"key": "teacher", "email": "teacher@edusync.local", "name": "Rohan Desai", "role": "teacher"},
    {"key": "parent", "email": "parent@edusync.local", "name": "Neha Sharma", "role": "parent"},
    {"key": "counsellor", "email": "counsellor@edusync.local", "name": "Dr. Kavya Rao", "role": "counsellor"},
    {"key": "student", "email": "student@edusync.local", "name": "Aarav Sharma", "role": "student"},
]


class DemoSeeder:
    def __init__(self) -> None:
        self.base_url = settings.SUPABASE_URL.rstrip("/")
        self.secret = settings.SUPABASE_SECRET_KEY
        if settings.APP_ENV.lower() not in {"development", "dev", "local"}:
            raise RuntimeError("Refusing to seed: APP_ENV must be development.")
        if f"{PROJECT_REF}.supabase.co" not in self.base_url:
            raise RuntimeError(
                f"Refusing to seed non-demo project. Expected Supabase ref {PROJECT_REF}."
            )
        if not self.secret:
            raise RuntimeError("SUPABASE_SECRET_KEY is missing from backend/.env.")
        self.client = httpx.Client(
            timeout=25.0,
            headers={
                "apikey": self.secret,
                "Authorization": "Bearer " + self.secret,
                "Content-Type": "application/json",
            },
        )

    def request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        payload: dict[str, Any] | list[dict[str, Any]] | None = None,
        prefer: str | None = None,
    ) -> Any:
        headers = {}
        if prefer:
            headers["Prefer"] = prefer
        response = self.client.request(
            method,
            f"{self.base_url}{path}",
            params=params,
            json=payload,
            headers=headers,
        )
        if response.is_error:
            detail = response.text[:1200]
            raise RuntimeError(f"{method} {path} failed ({response.status_code}): {detail}")
        if not response.content:
            return None
        return response.json()

    def rows(self, table: str, **filters: str) -> list[dict[str, Any]]:
        params: dict[str, Any] = {"select": "*", **filters}
        result = self.request("GET", f"/rest/v1/{table}", params=params)
        if not isinstance(result, list):
            raise RuntimeError(f"Unexpected response while reading {table}.")
        return result

    def upsert(self, table: str, payload: dict[str, Any], conflict: str) -> dict[str, Any]:
        result = self.request(
            "POST",
            f"/rest/v1/{table}",
            params={"on_conflict": conflict},
            payload=payload,
            prefer="resolution=merge-duplicates,return=representation",
        )
        if not isinstance(result, list) or not result:
            raise RuntimeError(f"Supabase did not return the upserted {table} row.")
        return result[0]

    def auth_users(self) -> dict[str, str]:
        response = self.request(
            "GET",
            "/auth/v1/admin/users",
            params={"page": "1", "per_page": "1000"},
        )
        users = response.get("users", []) if isinstance(response, dict) else []
        return {
            str(user["email"]).lower(): str(user["id"])
            for user in users
            if user.get("email") and user.get("id")
        }

    def provision_auth_user(self, user: dict[str, str], password: str, known: dict[str, str]) -> str:
        email = user["email"].lower()
        existing_id = known.get(email)
        payload = {
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"full_name": user["name"]},
        }
        if existing_id:
            result = self.request(
                "PUT",
                f"/auth/v1/admin/users/{existing_id}",
                payload=payload,
            )
            return str(result.get("id", existing_id))
        result = self.request("POST", "/auth/v1/admin/users", payload=payload)
        if not isinstance(result, dict) or not result.get("id"):
            raise RuntimeError(f"Auth did not return an ID for {email}.")
        return str(result["id"])

    def seed(self) -> None:
        # This password is generated per run, shared by the five disposable demo users,
        # and printed once at the end. Rerunning resets only these named demo accounts.
        password = "Eds!" + secrets.token_urlsafe(20) + "9a"
        known_users = self.auth_users()
        user_ids: dict[str, str] = {}
        for user in DEMO_USERS:
            user_ids[user["key"]] = self.provision_auth_user(user, password, known_users)

        school = self.upsert(
            "schools",
            {"name": "EduSync Demo School", "code": SCHOOL_CODE, "timezone": "Asia/Kolkata"},
            "code",
        )
        school_id = str(school["id"])

        for user in DEMO_USERS:
            user_id = user_ids[user["key"]]
            self.upsert(
                "profiles",
                {"id": user_id, "full_name": user["name"], "email": user["email"]},
                "id",
            )
            if user["role"] != "student":
                self.upsert(
                    "school_memberships",
                    {
                        "school_id": school_id,
                        "user_id": user_id,
                        "role": user["role"],
                        "status": "active",
                    },
                    "school_id,user_id",
                )

        class_row = self.upsert(
            "classes",
            {
                "school_id": school_id,
                "name": "Grade 10 - A",
                "grade_level": "10",
                "section": "A",
                "academic_year": ACADEMIC_YEAR,
            },
            "school_id,name,academic_year",
        )
        class_id = str(class_row["id"])

        self.upsert(
            "class_teacher_assignments",
            {
                "school_id": school_id,
                "class_id": class_id,
                "teacher_user_id": user_ids["teacher"],
            },
            "class_id,teacher_user_id",
        )

        student = self.upsert(
            "students",
            {
                "school_id": school_id,
                "admission_no": "DEMO-001",
                "first_name": "Aarav",
                "last_name": "Sharma",
                "status": "active",
            },
            "school_id,admission_no",
        )
        student_id = str(student["id"])

        active_enrolments = self.rows(
            "student_enrollments",
            student_id=f"eq.{student_id}",
            status="eq.active",
        )
        if not active_enrolments:
            self.request(
                "POST",
                "/rest/v1/student_enrollments",
                payload={
                    "school_id": school_id,
                    "student_id": student_id,
                    "class_id": class_id,
                    "roll_number": "01",
                    "academic_year": ACADEMIC_YEAR,
                    "status": "active",
                },
                prefer="return=minimal",
            )

        self.upsert(
            "student_guardians",
            {
                "school_id": school_id,
                "student_id": student_id,
                "guardian_user_id": user_ids["parent"],
                "relationship": "mother",
                "is_primary": True,
            },
            "student_id,guardian_user_id",
        )

        links = self.rows(
            "student_voice_student_links",
            school_id=f"eq.{school_id}",
            student_id=f"eq.{student_id}",
        )
        if links:
            if links[0]["status"] != "active" or links[0]["student_user_id"] != user_ids["student"]:
                raise RuntimeError(
                    "Existing Student Voice link is not the expected active demo link; "
                    "refusing to bypass terminal revocation."
                )
        else:
            self.request(
                "POST",
                "/rest/v1/student_voice_student_links",
                payload={
                    "school_id": school_id,
                    "student_id": student_id,
                    "student_user_id": user_ids["student"],
                    "linked_by": user_ids["admin"],
                    "status": "active",
                },
                prefer="return=minimal",
            )

        today = date.today()
        self.upsert(
            "attendance_records",
            {
                "school_id": school_id,
                "student_id": student_id,
                "class_id": class_id,
                "attendance_date": today.isoformat(),
                "status": "present",
                "marked_by": user_ids["teacher"],
                "remarks": "Demo attendance record",
            },
            "student_id,attendance_date",
        )
        self.upsert(
            "fee_invoices",
            {
                "school_id": school_id,
                "student_id": student_id,
                "invoice_number": "DEMO-INV-001",
                "description": "Term 1 tuition fee",
                "amount_due": 25000,
                "due_date": (today + timedelta(days=14)).isoformat(),
                "status": "issued",
                "created_by": user_ids["admin"],
            },
            "school_id,invoice_number",
        )

        announcement_title = "Welcome to EduSync Demo"
        if not self.rows(
            "announcements",
            school_id=f"eq.{school_id}",
            title=f"eq.{announcement_title}",
        ):
            self.request(
                "POST",
                "/rest/v1/announcements",
                payload={
                    "school_id": school_id,
                    "title": announcement_title,
                    "body": "This is a sample school-wide announcement for the EduSync demo.",
                    "audience": "school",
                    "created_by": user_ids["admin"],
                    "published_at": datetime.now(timezone.utc).isoformat(),
                },
                prefer="return=minimal",
            )

        referrals = self.rows(
            "counsellor_referrals",
            school_id=f"eq.{school_id}",
            student_id=f"eq.{student_id}",
            submitted_by=f"eq.{user_ids['teacher']}",
        )
        if not referrals:
            self.request(
                "POST",
                "/rest/v1/counsellor_referrals",
                payload={
                    "school_id": school_id,
                    "student_id": student_id,
                    "class_id": class_id,
                    "submitted_by": user_ids["teacher"],
                    "category": "academic",
                    "summary": "Demo referral: student would benefit from a check-in about study routines and workload.",
                    "urgency": "normal",
                    "status": "submitted",
                },
                prefer="return=minimal",
            )

        conversations = self.rows(
            "student_voice_conversations",
            school_id=f"eq.{school_id}",
            student_user_id=f"eq.{user_ids['student']}",
            status="eq.open",
        )
        if conversations:
            conversation_id = str(conversations[0]["id"])
        else:
            conversation = self.request(
                "POST",
                "/rest/v1/student_voice_conversations",
                payload={
                    "school_id": school_id,
                    "student_user_id": user_ids["student"],
                    "status": "open",
                },
                prefer="return=representation",
            )
            conversation_id = str(conversation[0]["id"])

        message_body = "Hi, I would like to talk to the counsellor about managing exam stress."
        if not self.rows(
            "student_voice_messages",
            conversation_id=f"eq.{conversation_id}",
            body=f"eq.{message_body}",
        ):
            self.request(
                "POST",
                "/rest/v1/student_voice_messages",
                payload={
                    "school_id": school_id,
                    "conversation_id": conversation_id,
                    "sender_kind": "student",
                    "sender_user_id": user_ids["student"],
                    "body": message_body,
                },
                prefer="return=minimal",
            )

        pending_meetings = self.rows(
            "student_voice_meeting_requests",
            conversation_id=f"eq.{conversation_id}",
            requested_by=f"eq.{user_ids['student']}",
            status="eq.pending",
        )
        if not pending_meetings:
            self.request(
                "POST",
                "/rest/v1/student_voice_meeting_requests",
                payload={
                    "school_id": school_id,
                    "conversation_id": conversation_id,
                    "requested_by": user_ids["student"],
                    "preferred_times": "Weekdays after 2:30 PM",
                    "student_message": "I would appreciate a short meeting before the next exams.",
                    "status": "pending",
                },
                prefer="return=minimal",
            )

        print("\nEduSync demo environment seeded successfully.")
        print(f"School: EduSync Demo School ({SCHOOL_CODE})")
        print(f"School ID: {school_id}")
        print("\nDemo sign-in accounts (all share this generated password):")
        for user in DEMO_USERS:
            print(f"  {user['role']:10} {user['email']}")
        print(f"\nPassword: {password}")
        print("\nThis password is shown only once. Save it in your team's password manager.")
        print("All records were created only in the edusync-dev Supabase project.")

    def close(self) -> None:
        self.client.close()


if __name__ == "__main__":
    seeder = DemoSeeder()
    try:
        seeder.seed()
    finally:
        seeder.close()
