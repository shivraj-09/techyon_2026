# Counsellor module security verification

## Safety boundary

The migrations in this feature branch are **not applied to the hosted Supabase project**. Do not run them against production for verification.

Use a disposable local Supabase stack. The local stack must contain the existing EduSync base schema (schools, memberships, students, classes, enrollments, class-teacher assignments) before the counsellor migrations are applied. The counsellor migrations are not a standalone schema.

## Local prerequisites

- Docker Desktop running
- Supabase CLI installed
- PostgreSQL client (`psql`) available
- A local copy of this repository on `feature/counsellor-backend`

Start the local stack from the repository's Supabase project directory (once the project config and base migrations are present):

```bash
supabase start
supabase db reset
```

If this repository does not yet have a complete `supabase/config.toml` and ordered base migrations, do not point the CLI at the hosted project. First assemble a local schema snapshot or restore a sanitized development database locally.

## Required verification matrix

Use separate test users for each role and at least two schools. Set the request JWT claims for each role/user; testing as the database owner bypasses RLS and is not a valid RLS test.

| Area | Actor | Expected result |
|---|---|---|
| Referral insert | Teacher assigned to class | Can submit for actively enrolled student |
| Referral insert | Teacher not assigned to class | Denied |
| Referral read | Teacher | Sees own referrals only |
| Referral read | Active counsellor | Sees referrals in own school |
| Referral read/update | User in another school | No cross-school rows or writes |
| Referral transition | Counsellor | Only documented transitions accepted |
| Referral assignment | Second counsellor | Cannot take over an already assigned referral |
| Case creation | Assigned counsellor, accepted referral | Can create one case |
| Case creation | Unassigned counsellor / unaccepted referral | Denied |
| Case and notes | Assigned counsellor | Can read and append notes while case is open |\n| Case status | Assigned counsellor | open -> in_progress/closed; in_progress -> closed |\n| Case status | Any actor | Cannot reopen a closed case or change status for another counsellor's case |
| Case and notes | Teacher, admin, other counsellor | Cannot read confidential notes |
| Session/notice | Counsellor | Can manage own school content |
| Session/notice | Parent/teacher | Can read only published content addressed to their role |
| Student Voice link | School admin | Can create and revoke links in own school |
| Student Voice conversation | Linked student | Can create and read own pseudonymous conversation |
| Student Voice conversation | Counsellor | Can see unassigned conversations and their own assigned conversations |
| Student Voice assignment | Another counsellor | Cannot take over an assigned conversation |
| Student Voice messages | Student/counsellor | Can read/send only as a participant under the conversation rules |
| Meeting request | Student | Can request a meeting only on own open conversation |
| Meeting request status | Assigned counsellor | pending -> approved/declined; approved -> completed |
| Identity reveal | Assigned counsellor, approved request | Returns student identity and inserts audit row |
| Identity reveal | Unassigned counsellor, pending/declined request, other school | Denied; no identity returned |

## Migration order

Apply the existing base migrations first, then the counsellor migrations in filename order:

1. `202611140001_add_counsellor_membership_role.sql`
2. `202611140002_create_counsellor_referrals.sql`
3. `202611140003_create_confidential_counselling_cases.sql`
4. `202611140004_create_counselling_sessions_notices.sql`
5. `202611140005_create_student_voice.sql`
6. `202611140006_enforce_counsellor_workflow_transitions.sql`
7. `202611140007_guard_student_voice_conversation_assignment.sql`\n8. `202611140008_enforce_counselling_case_status_transitions.sql`

The enum addition in migration 001 must commit before migrations that cast/use the new enum value. Apply migrations in separate transactions in the order shown.

## Acceptance criteria

- Every negative test is denied by the database, not merely by a FastAPI route.
- Cross-school access returns no rows and rejects writes.
- Identity reveal is denied unless the meeting request is approved and the conversation is assigned to the caller.
- The identity reveal audit row is written in the same transaction as the reveal.
- The local database is reset and the full migration sequence reapplied cleanly.
- Record the exact commit SHA and test output before calling the module database-verified.

## Current status

Static review and API schema/authorization unit tests exist. Database-backed RLS and trigger tests have **not** yet been run. No hosted production migrations have been applied.
