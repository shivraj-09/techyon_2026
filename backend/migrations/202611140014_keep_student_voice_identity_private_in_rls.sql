-- Keep Student Voice identity columns private while allowing RLS to verify
-- that a caller is the linked student for a conversation.
-- The helper returns only a boolean; it never returns student identity data.
create or replace function public.student_voice_is_active_linked_student(
    p_school_id uuid,
    p_conversation_id uuid,
    p_require_open boolean default false
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.student_voice_conversations c
        join public.student_voice_student_links l
          on l.school_id = c.school_id
         and l.student_user_id = c.student_user_id
         and l.status = 'active'
        where c.school_id = p_school_id
          and c.id = p_conversation_id
          and c.student_user_id = (select auth.uid())
          and (not p_require_open or c.status = 'open')
    );
$$;

revoke all on function public.student_voice_is_active_linked_student(uuid, uuid, boolean)
    from public, anon, authenticated;
grant execute on function public.student_voice_is_active_linked_student(uuid, uuid, boolean)
    to authenticated;

-- Message reads must not require direct SELECT on the private identity column.
drop policy if exists student_voice_messages_student_read
    on public.student_voice_messages;
create policy student_voice_messages_student_read
on public.student_voice_messages
for select to authenticated
using (
    public.student_voice_is_active_linked_student(school_id, conversation_id, false)
);

-- Student message creation requires an active link and an open conversation.
-- Counsellor message creation remains restricted to the assigned counsellor.
drop policy if exists student_voice_messages_participant_insert
    on public.student_voice_messages;
create policy student_voice_messages_participant_insert
on public.student_voice_messages
for insert to authenticated
with check (
    sender_user_id = (select auth.uid())
    and (
        (
            sender_kind = 'student'
            and public.student_voice_is_active_linked_student(
                school_id, conversation_id, true
            )
        )
        or (
            sender_kind = 'counsellor'
            and exists (
                select 1
                from public.student_voice_conversations c
                join public.school_memberships m
                  on m.school_id = c.school_id
                 and m.user_id = (select auth.uid())
                 and m.role = 'counsellor'::public.membership_role
                 and m.status = 'active'::public.membership_status
                where c.id = student_voice_messages.conversation_id
                  and c.school_id = student_voice_messages.school_id
                  and c.assigned_counsellor_id = (select auth.uid())
                  and c.status = 'open'
            )
        )
    )
);

-- Meeting request reads and creation use the same identity-safe ownership check.
drop policy if exists student_voice_meetings_student_select
    on public.student_voice_meeting_requests;
create policy student_voice_meetings_student_select
on public.student_voice_meeting_requests
for select to authenticated
using (
    requested_by = (select auth.uid())
    and public.student_voice_is_active_linked_student(
        school_id, conversation_id, false
    )
);

drop policy if exists student_voice_meetings_student_insert
    on public.student_voice_meeting_requests;
create policy student_voice_meetings_student_insert
on public.student_voice_meeting_requests
for insert to authenticated
with check (
    requested_by = (select auth.uid())
    and public.student_voice_is_active_linked_student(
        school_id, conversation_id, true
    )
);
