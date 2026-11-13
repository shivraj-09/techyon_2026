-- Make confidential counselling case closure terminal at the database layer.
-- Feature-branch migration only; do not apply to hosted production yet.

create or replace function public.enforce_counselling_case_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    v_allowed boolean := false;
begin
    if new.status is distinct from old.status then
        v_allowed := case old.status
            when 'open' then new.status in ('in_progress', 'closed')
            when 'in_progress' then new.status = 'closed'
            when 'closed' then false
            else false
        end;

        if not v_allowed then
            raise exception 'Invalid counselling case status transition: % -> %', old.status, new.status
                using errcode = '23514';
        end if;

        if new.assigned_counsellor_id is distinct from (select auth.uid())
           or not exists (
               select 1
               from public.school_memberships m
               where m.school_id = old.school_id
                 and m.user_id = (select auth.uid())
                 and m.role = 'counsellor'::public.membership_role
                 and m.status = 'active'::public.membership_status
           ) then
            raise exception 'Only the assigned active counsellor may change case status'
                using errcode = '42501';
        end if;
    end if;

    -- Keep closure metadata database-controlled and prevent caller-supplied timestamps.
    if new.status = 'closed' and old.status <> 'closed' then
        new.closed_at = now();
    elsif new.status <> 'closed' then
        new.closed_at = null;
    end if;

    return new;
end;
$$;

drop trigger if exists counselling_cases_status_transition_guard on public.counselling_cases;
create trigger counselling_cases_status_transition_guard
before update on public.counselling_cases
for each row execute function public.enforce_counselling_case_status_transition();

revoke all on function public.enforce_counselling_case_status_transition() from public, anon, authenticated;
