# Production release checklist — Counsellor + Student Voice

This checklist is specific to the existing hosted Supabase project `edusync-techyon` (`iguvhpxsogvkkpfguhsk`). It does not authorize a production change by itself.

## 1. Pre-deployment gate

- [ ] Confirm the exact production frontend and backend hosting projects/domains.
- [ ] Confirm who owns the release window and has authority to approve database changes.
- [ ] Take/verify a recoverable database backup and document the rollback contact.
- [ ] Record the exact Git commit being released.
- [ ] Confirm PR #5 is reviewed, merged into `dev`, and the tested `dev` state is promoted to `main`.
- [ ] Confirm CI is green on the exact production candidate commit.

## 2. Supabase migration reconciliation

Read-only inspection confirmed:
- Foundational school schema is already present.
- Four migration-ledger entries are present.
- Existing backend effects (invitation acceptance, fee status sync, parent communication and AI-insights policies) are already present in the live schema even though their original short-named repository migration files are not represented as separate entries in the current ledger.
- Counsellor and Student Voice tables are not present.
- Hosted Supabase has not been modified by this feature branch.

Before applying anything:
- [ ] Compare all live objects against the recovered schema snapshots and existing backend migration files.
- [ ] Do not replay the baseline snapshots or the already-applied backend DDL blindly.
- [ ] Confirm the 15 `20261114*.sql` feature migrations are the only DDL being applied.
- [ ] Apply the counsellor role enum addition in its own committed migration before later migrations use the new enum value.
- [ ] Preserve migration order from `docs/counsellor-security-verification.md`.
- [ ] Confirm the new trigger-function EXECUTE revokes in migration 015 are included.
- [ ] Record each successful migration in the Supabase migration ledger.
- [ ] Re-run Supabase Security Advisor after migration 015; the two trigger-function warnings should clear if the live ACLs match the migration.

## 3. Backend environment

Set these on the backend hosting service only:

- `APP_ENV=production`
- `SUPABASE_URL=https://iguvhpxsogvkkpfguhsk.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY` — publishable key for the same project.
- `SUPABASE_SECRET_KEY` — server-only secret key; never expose to browser or commit.
- `SUPABASE_INVITE_REDIRECT_URL=https://<production-frontend-domain>/auth/accept-invite`
- `CORS_ORIGINS=https://<production-frontend-domain>` (plus any explicitly approved additional origins, comma-separated).

The backend health endpoint is `/health`. Confirm it is reachable before connecting the frontend.

## 4. Frontend environment

Set these on the frontend hosting service:

- `NEXT_PUBLIC_SUPABASE_URL=https://iguvhpxsogvkkpfguhsk.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — publishable key for the same project.
- `NEXT_PUBLIC_API_BASE_URL=https://<production-backend-domain>`

Never put `SUPABASE_SECRET_KEY` or any service-role/secret key in a `NEXT_PUBLIC_*` variable.

## 5. Supabase Auth configuration

- [ ] Add the production frontend origin to the Supabase Auth site URL / allowed redirect URLs.
- [ ] Allow the exact `/auth/accept-invite` redirect URL.
- [ ] Verify password reset redirects use the production frontend origin.
- [ ] Verify invitation emails arrive and the invite link returns to the correct environment.

## 6. Authenticated smoke-test matrix

Use dedicated test accounts and non-sensitive test records. Do not use real student wellbeing content for deployment verification.

- [ ] Admin signs in and invites a counsellor.
- [ ] Invitee confirms email and accepts invitation.
- [ ] Counsellor signs in and sees only their school-scoped referrals/cases/conversations.
- [ ] Teacher signs in and sees only assigned classes and actively enrolled students in the referral form.
- [ ] Teacher submits a referral; counsellor can review it.
- [ ] Counsellor accepts a referral, creates a case and appends a private note.
- [ ] Teacher/admin cannot read confidential case notes.
- [ ] Admin links a student Auth account to a roster student.
- [ ] Linked student signs in and creates a pseudonymous Student Voice conversation.
- [ ] Student and assigned counsellor exchange messages.
- [ ] Student requests a meeting; counsellor approves it.
- [ ] Identity reveal is audited and denied for unapproved requests or the wrong counsellor.
- [ ] Admin revokes the student link; student access to existing content and future identity reveal are denied.
- [ ] Dual-role student/counsellor account is denied from Student Voice participant messaging.
- [ ] Logout invalidates the Supabase session.
- [ ] Browser network requests show no CORS failures; no secret key is present in frontend assets.

## 7. Release / rollback

- [ ] Deploy backend first and verify `/health`.
- [ ] Apply the reviewed database migrations only after the backup and approval gate.
- [ ] Deploy frontend with the matching backend URL.
- [ ] Run the authenticated smoke-test matrix.
- [ ] Monitor backend errors and Supabase logs during the release window.
- [ ] If smoke tests fail, roll back frontend/backend to the last known-good commit. Database rollback must follow the separately reviewed rollback plan; do not blindly drop feature tables or reverse identity/audit history.

## Known scope exclusions

- Student-facing delivery of counselling sessions/notices is not implemented.
- Session registration and attendance are not implemented.
- The latest preview-only pages must not be enabled until their mock in-memory store has been replaced with authenticated API integration.
