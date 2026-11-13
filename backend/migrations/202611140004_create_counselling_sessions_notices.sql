-- Counselling sessions and audience-scoped notices.
-- Feature-branch migration only; not applied to hosted Supabase.
create table if not exists public.counselling_sessions (
    id uuid primary key default gen_random_uuid(),
    school_id uuid not null,
    created_by uuid not null references auth.users(id) on delete restrict,
    title text not null check (char_length(btrim(title)) between 3 and 160),
    description text not null check (char_length(btrim(description)) between 1 and 5000),
    audience text not null check (audience in ('students', 'parents', 'teachers')),
    class_id uuid,
    starts_at timestamptz not null,
    ends_at timestamptz not null,
    capacity integer check (capacity is null or capacity between 1 and 10000),
    location text check (location is null or char_length(location) <= 300),
    meeting_mode text not null default 'in_person' check (meeting_mode in ('in_person', 'online', 'hybrid')),
    status text not null default 'draft' check (status in ('draft', 'published', 'cancelled', 'completed')),
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint counselling_sessions_school_class_fk
        foreign key (school_id, class_id) references public.classes(school_id, id),
    constraint counselling_sessions_time_check check (ends_at > starts_at),
    constraint counselling_sessions_class_audience_check check (class_id is null or audience = 'students')
);

create table if not exists public.counselling_notices (
    id uuid primary key default gen_random_uuid(),
    school_id uuid not null,
    created_by uuid not null references auth.users(id) on delete restrict,
    title text not null check (char_length(btrim(title)) between 3 and 160),
    body text not null check (char_length(btrim(body)) between 1 and 5000),
    audience text not null check (audience in ('students', 'parents', 'teachers')),
    class_id uuid,
    publish_at timestamptz not null default now(),
    expires_at timestamptz,
    status text not null default 'draft' check (status in ('draft', 'published', 'cancelled')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint counselling_notices_school_class_fk
        foreign key (school_id, class_id) references public.classes(school_id, id),
    constraint counselling_notices_expiry_check check (expires_at is null or expires_at > publish_at),
    constraint counselling_notices_class_audience_check check (class_id is null or audience = 'students')
);

create index if not exists counselling_sessions_school_start_idx
    on public.counselling_sessions (school_id, status, starts_at);
create index if not exists counselling_notices_school_publish_idx
    on public.counselling_notices (school_id, status, publish_at desc);

alter table public.counselling_sessions enable row level security;
alter table public.counselling_notices enable row level security;

revoke all on public.counselling_sessions from anon;
revoke all on public.counselling_notices from anon;
grant select on public.counselling_sessions to authenticated;
grant insert (school_id, created_by, title, description, audience, class_id, starts_at, ends_at, capacity, location, meeting_mode, status, published_at) on public.counselling_sessions to authenticated;
grant update (title, description, audience, class_id, starts_at, ends_at, capacity, location, meeting_mode, status, published_at) on public.counselling_sessions to authenticated;
grant select on public.counselling_notices to authenticated;
grant insert (school_id, created_by, title, body, audience, class_id, publish_at, expires_at, status) on public.counselling_notices to authenticated;
grant update (title, body, audience, class_id, publish_at, expires_at, status) on public.counselling_notices to authenticated;

drop policy if exists counselling_sessions_counsellor_manage on public.counselling_sessions;
create policy counselling_sessions_counsellor_manage
on public.counselling_sessions for all to authenticated
using (
    exists (
        select 1 from public.school_memberships m
        where m.school_id = counselling_sessions.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
)
with check (
    created_by = (select auth.uid())
    and exists (
        select 1 from public.school_memberships m
        where m.school_id = counselling_sessions.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
);

drop policy if exists counselling_sessions_audience_read on public.counselling_sessions;
create policy counselling_sessions_audience_read
on public.counselling_sessions for select to authenticated
using (
    status = 'published'
    and published_at is not null
    and starts_at > now() - interval '365 days'
    and exists (
        select 1 from public.school_memberships m
        where m.school_id = counselling_sessions.school_id
          and m.user_id = (select auth.uid())
          and m.status = 'active'::public.membership_status
          and (
              (counselling_sessions.audience = 'parents' and m.role = 'parent'::public.membership_role)
              or (counselling_sessions.audience = 'teachers' and m.role = 'teacher'::public.membership_role)
          )
    )
);

drop policy if exists counselling_notices_counsellor_manage on public.counselling_notices;
create policy counselling_notices_counsellor_manage
on public.counselling_notices for all to authenticated
using (
    exists (
        select 1 from public.school_memberships m
        where m.school_id = counselling_notices.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
)
with check (
    created_by = (select auth.uid())
    and exists (
        select 1 from public.school_memberships m
        where m.school_id = counselling_notices.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
);

drop policy if exists counselling_notices_audience_read on public.counselling_notices;
create policy counselling_notices_audience_read
on public.counselling_notices for select to authenticated
using (
    status = 'published'
    and publish_at <= now()
    and (expires_at is null or expires_at > now())
    and exists (
        select 1 from public.school_memberships m
        where m.school_id = counselling_notices.school_id
          and m.user_id = (select auth.uid())
          and m.status = 'active'::public.membership_status
          and (
              (counselling_notices.audience = 'parents' and m.role = 'parent'::public.membership_role)
              or (counselling_notices.audience = 'teachers' and m.role = 'teacher'::public.membership_role)
          )
    )
);

create or replace function public.set_counselling_session_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists counselling_sessions_updated_at on public.counselling_sessions;
create trigger counselling_sessions_updated_at before update on public.counselling_sessions
for each row execute function public.set_counselling_session_updated_at();

drop trigger if exists counselling_notices_updated_at on public.counselling_notices;
create trigger counselling_notices_updated_at before update on public.counselling_notices
for each row execute function public.set_counselling_session_updated_at();
