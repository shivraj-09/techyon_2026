-- Enforce publication lifecycle transitions for counselling sessions and notices.
-- Feature-branch migration only; do not apply to hosted production yet.

create or replace function public.enforce_counselling_session_lifecycle()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    v_allowed boolean := false;
begin
    if new.school_id is distinct from old.school_id
       or new.created_by is distinct from old.created_by
       or new.created_at is distinct from old.created_at then
        raise exception 'Counselling session ownership and identity fields are immutable'
            using errcode = '42501';
    end if;

    if new.status is distinct from old.status then
        v_allowed := case old.status
            when 'draft' then new.status in ('published', 'cancelled')
            when 'published' then new.status in ('cancelled', 'completed')
            else false
        end;

        if not v_allowed then
            raise exception 'Invalid counselling session status transition: % -> %', old.status, new.status
                using errcode = '23514';
        end if;

        if new.created_by is distinct from (select auth.uid())
           or not exists (
               select 1
               from public.school_memberships m
               where m.school_id = old.school_id
                 and m.user_id = (select auth.uid())
                 and m.role = 'counsellor'::public.membership_role
                 and m.status = 'active'::public.membership_status
           ) then
            raise exception 'Only the creating active school counsellor may change session status'
                using errcode = '42501';
        end if;
    end if;

    if new.status = 'published' and old.status <> 'published' then
        new.published_at = now();
    elsif new.published_at is distinct from old.published_at then
        raise exception 'Session publication timestamp is database-controlled'
            using errcode = '42501';
    end if;

    return new;
end;
$$;

drop trigger if exists counselling_sessions_lifecycle_guard on public.counselling_sessions;
create trigger counselling_sessions_lifecycle_guard
before update on public.counselling_sessions
for each row execute function public.enforce_counselling_session_lifecycle();


create or replace function public.enforce_counselling_notice_lifecycle()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    v_allowed boolean := false;
begin
    if new.school_id is distinct from old.school_id
       or new.created_by is distinct from old.created_by
       or new.created_at is distinct from old.created_at then
        raise exception 'Counselling notice ownership and identity fields are immutable'
            using errcode = '42501';
    end if;

    if new.status is distinct from old.status then
        v_allowed := case old.status
            when 'draft' then new.status in ('published', 'cancelled')
            when 'published' then new.status = 'cancelled'
            else false
        end;

        if not v_allowed then
            raise exception 'Invalid counselling notice status transition: % -> %', old.status, new.status
                using errcode = '23514';
        end if;

        if new.created_by is distinct from (select auth.uid())
           or not exists (
               select 1
               from public.school_memberships m
               where m.school_id = old.school_id
                 and m.user_id = (select auth.uid())
                 and m.role = 'counsellor'::public.membership_role
                 and m.status = 'active'::public.membership_status
           ) then
            raise exception 'Only the creating active school counsellor may change notice status'
                using errcode = '42501';
        end if;
    end if;

    return new;
end;
$$;

drop trigger if exists counselling_notices_lifecycle_guard on public.counselling_notices;
create trigger counselling_notices_lifecycle_guard
before update on public.counselling_notices
for each row execute function public.enforce_counselling_notice_lifecycle();

revoke all on function public.enforce_counselling_session_lifecycle() from public, anon, authenticated;
revoke all on function public.enforce_counselling_notice_lifecycle() from public, anon, authenticated;
