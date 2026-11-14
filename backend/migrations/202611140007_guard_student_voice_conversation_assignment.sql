-- Prevent Student Voice conversation reassignment through direct PostgREST updates.
-- Feature-branch migration only; not applied to hosted production.

create or replace function public.guard_student_voice_conversation_updates()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.school_id is distinct from old.school_id
       or new.student_user_id is distinct from old.student_user_id
       or new.public_ref is distinct from old.public_ref
       or new.created_at is distinct from old.created_at then
        raise exception 'Student Voice conversation identity fields are immutable'
            using errcode = '42501';
    end if;

    if old.assigned_counsellor_id is not null
       and new.assigned_counsellor_id is distinct from old.assigned_counsellor_id then
        raise exception 'Student Voice conversation is already assigned'
            using errcode = '42501';
    end if;

    if new.assigned_counsellor_id is distinct from old.assigned_counsellor_id
       and new.assigned_counsellor_id is not null then
        if new.assigned_counsellor_id is distinct from (select auth.uid())
           or not exists (
               select 1
               from public.school_memberships m
               where m.school_id = new.school_id
                 and m.user_id = (select auth.uid())
                 and m.role = 'counsellor'::public.membership_role
                 and m.status = 'active'::public.membership_status
           ) then
            raise exception 'Only an active school counsellor may claim this conversation'
                using errcode = '42501';
        end if;
    end if;

    if new.status is distinct from old.status then
        if old.status <> 'open' or new.status <> 'closed'
           or old.assigned_counsellor_id is distinct from (select auth.uid()) then
            raise exception 'Invalid Student Voice conversation status transition'
                using errcode = '42501';
        end if;
    end if;

    return new;
end;
$$;

drop trigger if exists student_voice_conversation_update_guard on public.student_voice_conversations;
create trigger student_voice_conversation_update_guard
before update on public.student_voice_conversations
for each row execute function public.guard_student_voice_conversation_updates();

revoke all on function public.guard_student_voice_conversation_updates() from public, anon, authenticated;
