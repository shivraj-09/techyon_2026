-- Re-check active student account links at every student-facing access boundary.
-- Revoking a link immediately suspends access to existing Student Voice data.
-- Feature-branch migration only; do not apply to hosted production yet.

drop policy if exists student_voice_conversations_student_select on public.student_voice_conversations;
create policy student_voice_conversations_student_select
on public.student_voice_conversations
for select to authenticated
using (
    student_user_id = (select auth.uid())
    and exists (
        select 1
        from public.student_voice_student_links l
        where l.school_id = student_voice_conversations.school_id
          and l.student_user_id = (select auth.uid())
          and l.status = 'active'
    )
);

drop policy if exists student_voice_messages_student_read on public.student_voice_messages;
create policy student_voice_messages_student_read
on public.student_voice_messages
for select to authenticated
using (
    exists (
        select 1
        from public.student_voice_conversations c
        join public.student_voice_student_links l
          on l.school_id = c.school_id
         and l.student_user_id = c.student_user_id
         and l.status = 'active'
        where c.id = student_voice_messages.conversation_id
          and c.school_id = student_voice_messages.school_id
          and c.student_user_id = (select auth.uid())
    )
);

drop policy if exists student_voice_messages_participant_insert on public.student_voice_messages;
create policy student_voice_messages_participant_insert
on public.student_voice_messages
for insert to authenticated
with check (
    sender_user_id = (select auth.uid())
    and exists (
        select 1
        from public.student_voice_conversations c
        where c.id = student_voice_messages.conversation_id
          and c.school_id = student_voice_messages.school_id
          and c.status = 'open'
          and (
              (
                  student_voice_messages.sender_kind = 'student'
                  and c.student_user_id = (select auth.uid())
                  and exists (
                      select 1 from public.student_voice_student_links l
                      where l.school_id = c.school_id
                        and l.student_user_id = (select auth.uid())
                        and l.status = 'active'
                  )
              )
              or (
                  student_voice_messages.sender_kind = 'counsellor'
                  and c.assigned_counsellor_id = (select auth.uid())
                  and exists (
                      select 1 from public.school_memberships m
                      where m.school_id = c.school_id
                        and m.user_id = (select auth.uid())
                        and m.role = 'counsellor'::public.membership_role
                        and m.status = 'active'::public.membership_status
                  )
              )
          )
    )
);

drop policy if exists student_voice_meetings_student_select on public.student_voice_meeting_requests;
create policy student_voice_meetings_student_select
on public.student_voice_meeting_requests
for select to authenticated
using (
    requested_by = (select auth.uid())
    and exists (
        select 1
        from public.student_voice_conversations c
        join public.student_voice_student_links l
          on l.school_id = c.school_id
         and l.student_user_id = c.student_user_id
         and l.status = 'active'
        where c.id = student_voice_meeting_requests.conversation_id
          and c.school_id = student_voice_meeting_requests.school_id
          and c.student_user_id = (select auth.uid())
    )
);

drop policy if exists student_voice_meetings_student_insert on public.student_voice_meeting_requests;
create policy student_voice_meetings_student_insert
on public.student_voice_meeting_requests
for insert to authenticated
with check (
    requested_by = (select auth.uid())
    and exists (
        select 1
        from public.student_voice_conversations c
        join public.student_voice_student_links l
          on l.school_id = c.school_id
         and l.student_user_id = c.student_user_id
         and l.status = 'active'
        where c.id = student_voice_meeting_requests.conversation_id
          and c.school_id = student_voice_meeting_requests.school_id
          and c.student_user_id = (select auth.uid())
          and c.status = 'open'
    )
);

-- A student can read only their own currently active link; admins retain school-scoped
-- management access. Link identity columns remain immutable through column-level grants.
drop policy if exists student_voice_links_student_read on public.student_voice_student_links;
create policy student_voice_links_student_read
on public.student_voice_student_links
for select to authenticated
using (
    student_user_id = (select auth.uid())
    and status = 'active'
);

revoke all on public.student_voice_student_links from anon;
