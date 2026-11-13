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

All routes are scoped to a school and require a Supabase access token.

- `GET /api/v1/schools/{school_id}/classes` — any active school member
- `POST /api/v1/schools/{school_id}/classes` — active school admin
- `PATCH /api/v1/schools/{school_id}/classes/{class_id}` — active school admin
- `DELETE /api/v1/schools/{school_id}/classes/{class_id}` — active school admin

The API forwards the caller's JWT to Supabase PostgREST. Database RLS remains the final data-access boundary; the service-role/secret key is not used for ordinary class operations.

Class names are unique within a school and academic year. Deletion is subject to database foreign-key constraints.
