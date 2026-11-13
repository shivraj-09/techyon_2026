# EduSync Counsellor Module — Backend Design

## Status
Implementation in progress on `feature/counsellor-backend`. The referral schema migration is committed but has NOT been applied to the hosted Supabase database.

## Privacy default
Student Voice uses **pseudonymous conversations**: the student is represented in the conversation UI by a random public reference. The counsellor can respond without the student's name being shown in the conversation view. A separate, tightly controlled identity-reveal workflow is required for a student-requested in-person meeting or a documented safety escalation. The identity mapping must never be included in ordinary conversation list/message API responses.

This is the recommended default inferred from the project discussion; confirm before production release.

## Domain modules

### 1. Teacher referrals
- Teachers create referrals for students in their school and only in classes to which they are assigned.
- Referral fields: school, student, submitting teacher, category, concern summary, urgency, status, timestamps.
- Do not put sensitive counselling notes in the teacher-visible referral summary.
- Teachers may see only referrals they submitted and their workflow status; they cannot read counsellor case notes or private chat.
- Active counsellors in the school can review referrals, request clarification, accept, decline, or close a referral. The first implementation assigns a referral to the counsellor who first reviews it; conversion to a confidential case is a later step.
- Admins may manage counsellor membership but do not receive access to confidential case notes or Student Voice content by virtue of being admins.

### 2. Confidential counselling cases
- A case is created from an accepted referral assigned to the counsellor. Counsellor-initiated cases are deferred until a dedicated student lookup/meeting flow exists.
- Case records hold restricted notes, status, assigned counsellor, student, and timestamps.
- Case notes are separate, append-only records with author and timestamp metadata; note bodies are not returned by referral endpoints.
- Access is restricted to the assigned counsellor; collaborator access is deferred. No general school-admin or teacher access.
- Every read/write to highly sensitive case content should be auditable at the API layer. Avoid logging note bodies or message bodies.

### 3. Sessions and notices
- Counsellors create sessions with audience (students, parents, teachers), title, description, start/end, capacity, location/meeting mode, and publication status. Initial API and schema are committed. Active parent and teacher memberships can read published items addressed to their role. Student delivery is pending because the current schema has no authenticated student-to-user mapping.
- Notices support audience, optional class targeting for student notices, scheduled publication, expiry, and draft/published/cancelled status. Parent/teacher reads are filtered by RLS. Student-targeted delivery remains pending student authentication mapping.
- Registrations are scoped to the school and session. Attendance/registration visibility is limited to the counsellor and the registrant as appropriate.
- Parent-facing sessions must not expose student counselling case details.

### 4. Student Voice
- Conversation identity is a random opaque identifier, not a student name or admission number.
- Keep the student-to-conversation mapping in a separate table with stricter access policies than messages.
- Students can create a conversation, send messages, read their own conversation, and request an in-person meeting.
- Counsellors can list and respond to conversations in their school, subject to counsellor membership and assignment policy.
- Teachers, parents, and school admins cannot read messages or discover the mapping.
- A safety escalation must be an explicit, audited workflow with a documented policy; do not silently reveal identity.
- Do not promise absolute anonymity. Explain the limits clearly in the student UI, especially for imminent safety concerns.

## Proposed data model
- `counsellor_referrals`: school_id, student_id, submitted_by, category, summary, urgency, status, assigned_counsellor_id, timestamps.
- `counselling_cases`: school_id, student_id, required referral_id, assigned_counsellor_id, status, opened_at, closed_at.
- `counselling_case_notes`: case_id, author_user_id, note_body, created_at (append-only).
- `counselling_sessions`: school_id, created_by, title, description, audience, optional class_id for students, starts_at, ends_at, capacity, location, meeting_mode, status, published_at.
- `counselling_session_registrations`: planned; not yet implemented.
- `student_voice_conversations`: school_id, student_user_id (not exposed in API responses), public_ref, status, assigned_counsellor_id nullable, created_at, last_message_at.
- `student_voice_identity_map`: conversation_id, student_id, created_at; strict counsellor-only access and never joined into normal conversation/message list endpoints.
- `student_voice_messages`: conversation_id, sender_kind, sender_user_id nullable, body, created_at, read_at.
- `student_voice_meeting_requests`: conversation_id, student_id, preferred_times, status, handled_by, created_at.

## Authorization principles
1. All records carry and validate `school_id`; never trust a client-supplied school or role without checking the authenticated membership.
2. Add `counsellor` as a school membership role only after updating every role validator, invitation schema, membership query, and frontend role map that assumes the current three-value enum.
3. Enable RLS on every new public table and explicitly grant only required Data API privileges. The current Supabase project no longer auto-exposes newly created public tables by default.
4. Do not use user-editable JWT metadata for authorization.
5. Do not use broad admin policies on case notes, identity mappings, or Student Voice messages.
6. Prefer SECURITY INVOKER. Any exceptional privileged RPC must be narrowly scoped, validate `auth.uid()`, use a fixed search_path, and have EXECUTE revoked from PUBLIC/anon unless explicitly required.
7. Index school, student, counsellor, conversation, and foreign-key columns used in policies and lookups.
8. Keep sensitive bodies out of application logs, error messages, analytics, and notifications.

## API modules (planned)
- `/schools/{school_id}/counsellor/referrals`: teacher create/list-own; counsellor school inbox/list and review/status transitions. Implemented in `backend/app/api/v1/counsellor.py` with request models in `backend/app/schemas/counsellor.py`.
- `/schools/{school_id}/counselling/cases`: counsellor-only case creation from accepted referrals, case listing/status, and private append-only notes. Implemented in `backend/app/api/v1/counsellor.py`.
- `/schools/{school_id}/counselling/sessions`: counsellor create and audience-filtered list. `/schools/{school_id}/counselling/notices`: counsellor create and audience-filtered list. Implemented in `backend/app/api/v1/counsellor.py`; registration and cancellation workflows remain pending.
- `/schools/{school_id}/student-voice/links`: admin links an existing student record to a Supabase Auth user. `/schools/{school_id}/student-voice/conversations`: student create/list own; `/inbox`: counsellor pseudonymous inbox.
- `/schools/{school_id}/student-voice/conversations/{conversation_id}/messages`: read/send with strict conversation membership checks.
- `/schools/{school_id}/student-voice/conversations/{conversation_id}/messages`: student/counsellor read and send. `/meeting-requests`: student request, counsellor review, and explicit identity reveal after approval. Implemented in `backend/app/api/v1/counsellor.py`; runtime tests and live migration are pending.

## Delivery sequence
1. Audit existing authorization helpers, membership role parsing, guardian/student relationships, class enrollment, and invite flow.
2. Add the counsellor role safely and update backend role validation.
3. Add schema and RLS migrations; review with Supabase advisors before applying to the hosted project.
4. Implement referral intake/review API and test school/class isolation. (Initial code and migration are committed; runtime tests and live migration are pending.)
5. Implement confidential cases and private notes. (Schema, RLS, and API routes are committed; runtime tests and live migration are pending.)
6. Implement counselling sessions and notices. (Schema, RLS, and create/list APIs are committed; student audience delivery, registrations, runtime tests, and live migration are pending.)
7. Implement Student Voice pseudonymous conversations, messages, and meeting requests. (Initial schema, RLS and API routes are committed; student account linking requires an admin to verify and link the Auth user ID to the student record. Safety escalation is not implemented.)
8. Add API tests for role boundaries, cross-school isolation, and non-disclosure of student identity.

## Non-goals for initial release
- Automated mental-health diagnosis or risk scoring.
- AI-generated counselling advice.
- Claims of guaranteed anonymity or emergency monitoring.
