-- Preserve audited identity access after an approved meeting is completed.
-- Completion is a later lifecycle state, not revocation of the prior approval.
-- The active link, assigned counsellor and active school membership checks remain mandatory.
-- Feature-branch migration only; do not apply to hosted production yet.

create or replace function public.reveal_student_voice_identity(
    p_school_id uuid,
    p_meeting_request_id uuid
)
returns table (
    student_id uuid,
    meeting_request_id uuid,
    conversation_id uuid,
    revealed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_student_id uuid;
    v_conversation_id uuid;
    v_revealed_at timestamptz;
begin
    if auth.uid() is null then
        raise exception 'Authentication required' using errcode = '42501';
    end if;

    select l.student_id, c.id
      into v_student_id, v_conversation_id
      from public.student_voice_meeting_requests mr
      join public.student_voice_conversations c
        on c.school_id = mr.school_id
       and c.id = mr.conversation_id
      join public.student_voice_student_links l
        on l.school_id = c.school_id
       and l.student_user_id = c.student_user_id
       and l.status = 'active'
      join public.school_memberships m
        on m.school_id = c.school_id
       and m.user_id = (select auth.uid())
       and m.role = 'counsellor'::public.membership_role
       and m.status = 'active'::public.membership_status
     where mr.id = p_meeting_request_id
       and mr.school_id = p_school_id
       and mr.status in ('approved', 'completed')
       and c.assigned_counsellor_id = (select auth.uid())
     limit 1;

    if v_student_id is null then
        raise exception 'Approved meeting request not found or access denied' using errcode = '42501';
    end if;

    -- Log every successful reveal; audit table has no client-facing grants or policies.
    v_revealed_at := now();
    insert into public.student_voice_identity_reveal_audit (
        school_id, meeting_request_id, counsellor_user_id, student_id, revealed_at
    ) values (
        p_school_id, p_meeting_request_id, (select auth.uid()), v_student_id, v_revealed_at
    );

    return query
    select v_student_id, p_meeting_request_id, v_conversation_id, v_revealed_at;
end;
$$;

revoke all on function public.reveal_student_voice_identity(uuid, uuid) from public, anon, authenticated;
grant execute on function public.reveal_student_voice_identity(uuid, uuid) to authenticated;
