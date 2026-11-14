-- Make Student Voice account-link revocation terminal and identity fields immutable.
-- Feature-branch migration only; do not apply to hosted production yet.

create or replace function public.guard_student_voice_link_updates()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.school_id is distinct from old.school_id
       or new.student_id is distinct from old.student_id
       or new.student_user_id is distinct from old.student_user_id
       or new.linked_by is distinct from old.linked_by
       or new.created_at is distinct from old.created_at then
        raise exception 'Student Voice account-link identity fields are immutable'
            using errcode = '42501';
    end if;

    if new.status is distinct from old.status then
        if old.status <> 'active' or new.status <> 'revoked' then
            raise exception 'Student Voice account-link revocation is terminal'
                using errcode = '23514';
        end if;

        if not exists (
            select 1
            from public.school_memberships m
            where m.school_id = old.school_id
              and m.user_id = (select auth.uid())
              and m.role = 'admin'::public.membership_role
              and m.status = 'active'::public.membership_status
        ) then
            raise exception 'Only an active school admin may revoke a student account link'
                using errcode = '42501';
        end if;
    end if;

    return new;
end;
$$;

drop trigger if exists student_voice_link_update_guard on public.student_voice_student_links;
create trigger student_voice_link_update_guard
before update on public.student_voice_student_links
for each row execute function public.guard_student_voice_link_updates();

revoke all on function public.guard_student_voice_link_updates() from public, anon, authenticated;
