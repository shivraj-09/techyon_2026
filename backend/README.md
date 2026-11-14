# EduSync backend

FastAPI API for the EduSync school operating system.

## Run locally

```powershell
cd backend
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Classes API

- `GET /api/v1/schools/{school_id}/classes` — any active school member
- `POST /api/v1/schools/{school_id}/classes` — active school admin
- `PATCH /api/v1/schools/{school_id}/classes/{class_id}` — active school admin
- `DELETE /api/v1/schools/{school_id}/classes/{class_id}` — active school admin

## Class teacher assignments

- `GET /api/v1/schools/{school_id}/classes/{class_id}/teachers` — active school admin
- `POST /api/v1/schools/{school_id}/classes/{class_id}/teachers` — active school admin
- `DELETE /api/v1/schools/{school_id}/classes/{class_id}/teachers/{teacher_user_id}` — active school admin

Teacher assignments require the target user to have an active `teacher` membership in the same school. The server-only Supabase secret key is used only for this admin-authorized membership/profile lookup. Assignment reads and writes use the caller's JWT and database RLS. Never expose the secret key to the frontend.
