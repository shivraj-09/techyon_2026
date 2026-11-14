# Techyon 2026 — Hackathon Project

A collaborative repository for our 24-hour hackathon build.

## Structure
- `frontend/` — Next.js application
- `backend/` — FastAPI API and services
- `ai-module/` — AI/ML experiments, inference and model integration
- `docs/` — architecture, feature design and API contracts

## Local development

### Frontend
1. Copy `frontend/.env.example` to `frontend/.env.local`.
2. Set the Supabase project URL and publishable key, plus the FastAPI base URL.
3. Run:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Backend
1. Copy `backend/.env.example` to `backend/.env`.
2. Set the Supabase URL and publishable key. Set the Supabase secret key only in the backend environment; never expose it to the frontend.
3. Install dependencies and run:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

## Counsellor and Student Voice

- School admins invite counsellors from the Student Voice Access page.
- Invitees confirm their email and accept the invitation at `/auth/accept-invite`.
- Admins link an existing student record to an existing Supabase Auth user at `/dashboard/student-voice-links`.
- A linked student signs in with their existing Supabase Auth account. There is **no student school-membership role**; access is granted by the active student-to-account link.
- Counsellors use an active `counsellor` school membership.
- Teacher referral intake is at `/teacher/referrals`.
- The API-connected counsellor workspace is at `/counsellor/dashboard`; the student portal is at `/student-voice`.

The expanded counsellor/student route set from the frontend preview branch is not enabled as a production workflow until each screen is connected to the authenticated API. Mock data and mock identity maps must never be used for real student records.

## Database verification and deployment safety

- The 16 counsellor/Student Voice SQL migrations under `backend/migrations/20261114*.sql` are applied in order by GitHub Actions to a disposable PostgreSQL 17 service. The workflow checks schema/RLS assertions, multi-school behaviour, Student Voice access revocation, dual-role restrictions, and trigger permissions.
- CI uses a synthetic baseline fixture. It is not a complete clone of hosted Supabase and does not replace authenticated end-to-end tests.
- The hosted Supabase project was inspected read-only. Its foundational schema is present; counsellor and Student Voice tables have not been deployed.
- No hosted migration has been applied by this feature branch. Do not run `supabase db push` or manually execute feature migrations against production until the migration ledger, live schema, environment configuration and rollback plan have been reviewed and explicitly approved.

## Branch workflow
- `main` — stable production branch
- `dev` — shared integration branch
- Feature branches — scoped development and review before integration
