# Counsellor module security verification

## Safety boundary

The counsellor and Student Voice migrations are **not applied to the hosted Supabase project**. Do not run them against production for verification.

The hosted project was inspected read-only. Its foundational schema is present, but the counsellor and Student Voice tables are not deployed. The live migration ledger contains four entries; the existing baseline and pre-feature objects must be reconciled before deployment. No hosted DDL, data, permission, or migration-history changes have been made.

## Automated database verification

GitHub Actions starts a disposable PostgreSQL 17 service and:

1. Bootstraps Supabase auth scaffolding and a synthetic EduSync baseline.
2. Applies the recovered baseline snapshots and existing backend migrations.
3. Applies all 15 `backend/migrations/20261114*.sql` feature migrations in filename order, each in a separate `psql` invocation so the counsellor enum addition is committed before later migrations use it.
4. Runs structural/RLS/trigger assertions.
5. Runs multi-school behavioural tests covering referral access, Student Voice ownership, dual-role exclusion, message/meeting access, identity reveal, and terminal link revocation.
6. Verifies trigger-only SECURITY DEFINER functions are not directly executable by `anon` or `authenticated`, while the announcement notification trigger still fans out correctly.

The complete database job passed in GitHub Actions run #242:
https://github.com/shivraj-09/techyon_2026/actions/runs/43511296160

This fixture is synthetic. It validates the feature migration chain and selected RLS behaviours; it is not a full clone of the hosted Supabase project and does not replace authenticated browser/API tests against the intended environment.

## Required verification matrix

Use separate test users for each role and at least two schools. Set request JWT claims for each role/user; testing as the database owner bypasses RLS and is not a valid RLS test.

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
| Case and notes | Assigned counsellor | Can read and append notes while case is open |
| Case and notes | Teacher, admin, other counsellor | Cannot read confidential notes |
| Student Voice link | School admin | Can create and revoke links in own school |
| Student Voice conversation | Linked student | Can create and read own pseudonymous conversation |
| Student Voice conversation | Counsellor | Can see unassigned conversations and their own assigned conversations |
| Student Voice assignment | Another counsellor | Cannot take over an assigned conversation |
| Student Voice messages | Student/counsellor | Can read/send only as a participant under conversation rules |
| Dual-role account | Linked student who is also counsellor | Cannot send as either Student Voice participant role |
| Meeting request | Student | Can request a meeting only on own open conversation |
| Meeting request status | Assigned counsellor | pending -> approved/declined; approved -> completed |
| Identity reveal | Assigned counsellor, approved or completed request | Returns student identity and inserts audit row |
| Identity reveal | Unassigned counsellor, pending/declined request, other school, or revoked link | Denied; no identity returned |
| Trigger RPC | anon/authenticated | Cannot directly execute trigger-only SECURITY DEFINER functions |
| Notification trigger | Authenticated admin creates announcement | Trigger still creates expected recipient notifications |

## Feature migration order

Apply the existing baseline first, then the feature migrations in this order:

1. `202611140001_add_counsellor_membership_role.sql`
2. `202611140002_create_counsellor_referrals.sql`
3. `202611140003_create_confidential_counselling_cases.sql`
4. `202611140004_create_counselling_sessions_notices.sql`
5. `202611140005_create_student_voice.sql`
6. `202611140006_enforce_counsellor_workflow_transitions.sql`
7. `202611140007_guard_student_voice_conversation_assignment.sql`
8. `202611140008_enforce_counselling_case_status_transitions.sql`
9. `202611140009_enforce_counselling_publication_lifecycle.sql`
10. `202611140010_set_session_publication_timestamp.sql`
11. `202611140011_revoke_student_voice_access_with_link.sql`
12. `202611140012_preserve_identity_reveal_after_completion.sql`
13. `202611140013_make_student_voice_revocation_terminal.sql`
14. `202611140014_keep_student_voice_identity_private_in_rls.sql`
15. `202611140015_restrict_trigger_function_execution.sql`

The enum addition in migration 001 must commit before later migrations cast/use the new enum value. Apply migrations in separate transactions in the order shown.

## Identity and revocation guarantees

- Student Voice links are terminal: active -> revoked only. Identity columns cannot be changed after creation.
- Student-facing RLS revalidates the active link for existing conversations, messages and meeting requests. Revocation suspends access to existing Student Voice content and prevents new conversations.
- Identity reveal is permitted only for approved/completed meeting requests, and still requires the assigned active counsellor, active school membership and active student link.
- Every successful reveal is recorded as a separate audit event.
- Revoking a link blocks future identity reveals; it cannot reverse information already disclosed.
- The reveal function takes a shared row lock on the active link while validating and auditing, serializing disclosure against concurrent revocation.

## Known audience limitation

The schema accepts `students` as a counselling session/notice audience, but current RLS policies do not provide student-facing read access. Student-targeted sessions and notices must not be treated as delivered to students until a verified student identity/membership path and class-scoped audience policies are implemented and tested. Parent and teacher reads are role-scoped; class-specific content is currently valid only for the `students` audience.

## Remaining production checks

- Reconcile the four hosted migration-ledger entries with the recovered baseline and existing backend migration effects. Do not replay already-applied baseline DDL blindly.
- Review the exact 15-migration deployment plan against the live schema and role grants.
- Confirm production frontend/backend hosting, secrets, CORS, auth redirect URLs and invitation email delivery.
- Run authenticated end-to-end tests for invitation, teacher referral, counsellor review/case notes, Student Voice messaging, meeting requests, identity reveal and revocation.
- Apply hosted migrations only after explicit production approval and a backup/rollback plan.
- Deploy frontend/backend only after the migration and smoke-test gates pass.

## Current status

- Static API/schema tests and the PostgreSQL 17 migration/RLS behavioural CI suite pass.
- Latest frontend changes are being wired to real backend flows; preview-only mock routes are redirected to the API-connected pages.
- Hosted Supabase remains untouched. This feature branch is not a production deployment.
