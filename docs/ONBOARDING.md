# EduSync — first-school bootstrap and member invitations

## 1. Create the first school administrator (one-time project-owner setup)

The first administrator cannot be invited through the admin-only API because no active school administrator exists yet. Bootstrap this first account from the Supabase Dashboard.

1. In **Authentication → Users**, create the initial administrator account using an email you control. Confirm the email if the dashboard offers that option.
2. Open **SQL Editor** and run the script below after replacing the three marked values.
3. Keep the resulting school UUID. The admin will use it as the `school_id` in school-scoped API routes.

```sql
do $$
declare
  v_admin_email text := 'admin@example.com'; -- replace
  v_school_name text := 'Demo School';       -- replace
  v_school_code text := 'DEMO-001';          -- replace; must be unique
  v_user_id uuid;
  v_email text;
  v_school_id uuid;
  v_full_name text;
begin
  select id, email,
         coalesce(nullif(raw_user_meta_data->>'full_name', ''), email)
    into v_user_id, v_email, v_full_name
  from auth.users
  where lower(email) = lower(v_admin_email)
  limit 1;

  if v_user_id is null then
    raise exception 'Create the administrator in Authentication → Users first';
  end if;

  insert into public.schools (name, code)
  values (v_school_name, v_school_code)
  returning id into v_school_id;

  insert into public.profiles (id, full_name, email)
  values (v_user_id, v_full_name, v_email)
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email;

  insert into public.school_memberships (school_id, user_id, role, status)
  values (v_school_id, v_user_id, 'admin', 'active')
  on conflict (school_id, user_id) do update
    set role = 'admin',
        status = 'active';

  raise notice 'EduSync school_id: %', v_school_id;
end $$;
```

Run this only as the project owner in the Supabase SQL Editor. Do not expose a public endpoint that lets a visitor create the first admin role.

## 2. Configure the backend secret key

In **Supabase Dashboard → Settings → API Keys**, copy the project's **Secret key** (starts with `sb_secret_`).

Add it to `backend/.env`:

```env
SUPABASE_SECRET_KEY=sb_secret_YOUR_KEY
SUPABASE_INVITE_REDIRECT_URL=http://localhost:3000/auth/accept-invite
```

The secret key is server-only. Never add it to the frontend environment, commit it, or expose it through a `NEXT_PUBLIC_*` variable. The checked-in `.env.example` contains placeholders only.

## 3. Invite a teacher or parent

Sign in as the bootstrapped administrator and obtain a Supabase access token. Call:

`POST /api/v1/schools/{school_id}/members/invite`

Header:

`Authorization: Bearer <admin_access_token>`

JSON body:

```json
{
  "email": "teacher@example.com",
  "full_name": "A Teacher",
  "role": "teacher"
}
```

Allowed roles are `teacher` and `parent`. The endpoint checks the caller's active admin membership for that exact school. New memberships start as `invited`; they do not receive access to school data until an administrator-approved activation process marks them `active`.

## 4. Important current limitation

The invite endpoint provisions the Auth user, profile, and invited membership using the server-only secret key. If a later provisioning step fails, it attempts compensating cleanup. For a production system, replace this multi-request workflow with a transactional database function/outbox pattern and add invitation expiry, resend, audit logging, and rate limiting.
