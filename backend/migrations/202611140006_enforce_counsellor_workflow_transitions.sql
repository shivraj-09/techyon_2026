-- Enforce counsellor workflow transitions in PostgreSQL, not only in FastAPI.
-- Feature-branch migration; do not apply to the hosted production project yet.

create or replace function public.enforce_counsellor_referral_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    v_allowed boolean := false;
begin
    if new.status is distinct from old.status then
        v_allowed := case old.status
            when 'submitted' then new.status in ('under_review', 'clarification_requested', 'accepted', 'declined', 'closed')
            when 'under_review' then new.status in ('clarification_requested', 'accepted', 'declined', 'closed')
            when 'clarification_requested' then new.status in ('under_review', 'accepted', 'declined', 'closed')
            when 'accepted' then new.status = 'closed'
            when 'declined' then new.status = 'closed'
            when 'closed' then false
            else false
        end;

        if not v_allowed then
            raise exception 'Invalid referral status transition: % -> %', old.status, new.status
                using errcode = '23514';
        end if;

        if new.assigned_counsellor_id is distinct from (select auth.uid()) then
            raise exception 'A counsellor must claim a referral before changing its status'
                using errcode = '42501';
        end if;
    end if;

    -- A referral may be claimed once; another counsellor cannot take it over,
    -- and an authenticated counsellor cannot assign it to an arbitrary user.
    if old.assigned_counsellor_id is not null
       and new.assigned_counsellor_id is distinct from old.assigned_counsellor_id then
        raise exception 'Referral is already assigned and cannot be reassigned'
            using errcode = '42501';
    end if;

    if new.assigned_counsellor_id is not null
       and new.assigned_counsellor_id is distinct from (select auth.uid()) then
        raise exception 'A counsellor can only assign a referral to themselves'
            using errcode = '42501';
    end if;

    return new;
end;
$$;

drop trigger if exists counsellor_referral_transition_guard on public.counsellor_referrals;
create trigger counsellor_referral_transition_guard
before update on public.counsellor_referrals
for each row execute function public.enforce_counsellor_referral_transition();


create or replace function public.enforce_student_voice_meeting_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    v_allowed boolean := false;
begin
    if new.status is distinct from old.status then
        v_allowed := case old.status
            when 'pending' then new.status in ('approved', 'declined')
            when 'approved' then new.status = 'completed'
            else false
        end;

        if not v_allowed then
            raise exception 'Invalid meeting request status transition: % -> %', old.status, new.status
                using errcode = '23514';
        end if;

        if new.handled_by is distinct from (select auth.uid()) then
            raise exception 'Meeting request must be handled by the authenticated counsellor'
                using errcode = '42501';
        end if;

        if new.handled_at is null then
            raise exception 'Meeting request handling timestamp is required'
                using errcode = '23514';
        end if;
    end if;

    -- Do not permit changing the requester, conversation, school or request content.
    if new.school_id is distinct from old.school_id
       or new.conversation_id is distinct from old.conversation_id
       or new.requested_by is distinct from old.requested_by
       or new.preferred_times is distinct from old.preferred_times
       or new.student_message is distinct from old.student_message then
        raise exception 'Meeting request details are immutable'
            using errcode = '42501';
    end if;

    if new.status is not distinct from old.status
       and (
           new.handled_by is distinct from old.handled_by
           or new.handled_at is distinct from old.handled_at
       ) then
        raise exception 'Handling metadata can only change during a valid status transition'
            using errcode = '42501';
    end if;

    return new;
end;
$$;

drop trigger if exists student_voice_meeting_transition_guard on public.student_voice_meeting_requests;
create trigger student_voice_meeting_transition_guard
before update on public.student_voice_meeting_requests
for each row execute function public.enforce_student_voice_meeting_transition();

-- Trigger functions are invoked by PostgreSQL triggers only.
revoke all on function public.enforce_counsellor_referral_transition() from public, anon, authenticated;
revoke all on function public.enforce_student_voice_meeting_transition() from public, anon, authenticated;
