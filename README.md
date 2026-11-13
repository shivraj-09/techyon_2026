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

### Counsellor and Student Voice
- Admins invite counsellors from the Student Voice Access page.
- Invitees confirm their email and accept the invitation at `/auth/accept-invite`.
- Admins link an existing student record to an existing Supabase Auth user from Student Voice Access.
- Linked students sign in using the Student role; counsellors use the Counsellor role.
- The counsellor workspace is at `/counsellor/dashboard`; the student portal is at `/student-voice`.

### Database safety
The counsellor feature migrations are not yet applied to the hosted Supabase project. The repository still needs the canonical foundational schema for schools, memberships, students, classes, enrollments and teacher assignments before the complete migration chain can be tested against a disposable local PostgreSQL/Supabase instance. Do not apply the feature migrations to the hosted project until that validation is complete.

## Branch workflow
- `main` — stable, demo-ready version
- `dev` — shared integration branch
- Feature branches — scoped development and review before integration
