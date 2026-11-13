-- Re-check active student account links at every student-facing access boundary.
-- Revoking a link immediately suspends access to existing Student Voice data.
-- Feature-branch migration only; do not apply to hosted production yet.

-- These SECURITY DEFINER predicates return booleans only. They keep internal
-- student_user_id columns inaccessible to authenticated clients while allowing
-- RLS to verify ownership, active links, counsellor membership and assignment.
-- No caller-supplied user id is accepted; every predicate binds to auth.uid().
create or replace function public.student_voice_owns_active_conversation(
    p_school_id uuid,
    p_conversation_id uuid
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
          and l.student_user_id = (select auth.uid())
          and not exists (
              select 1
              from public.school_memberships m
              where m.school_id = c.school_id
                and m.user_id = (select auth.uid())
                and m.role = 'counsellor'::public.membership_role
                and m.status = 'active'::public.membership_status
          )
    );
$$;

create or replace function public.student_voice_student_can_message_conversation(
    p_school_id uuid,
    p_conversation_id uuid
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
          and l.student_user_id = (select auth.uid())
          and c.status = 'open'
          and not exists (
              select 1
              from public.school_memberships m
              where m.school_id = c.school_id
                and m.user_id = (select auth.uid())
                and m.role = 'counsellor'::public.membership_role
                and m.status = 'active'::public.membership_status
          )
    );
$$;

create or replace function public.student_voice_counsellor_can_read_conversation(
    p_school_id uuid,
    p_conversation_id uuid
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
        join public.school_memberships m
          on m.school_id = c.school_id
         and m.user_id = (select auth.uid())
         and m.role = 'counsellor'::public.membership_role
         and m.status = 'active'::public.membership_status
        where c.school_id = p_school_id
          and c.id = p_conversation_id
          and (c.assigned_counsellor_id is null or c.assigned_counsellor_id = (select auth.uid()))
    );
$$;

create or replace function public.student_voice_counsellor_can_message_conversation(
    p_school_id uuid,
    p_conversation_id uuid
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
        join public.school_memberships m
          on m.school_id = c.school_id
         and m.user_id = (select auth.uid())
         and m.role = 'counsellor'::public.membership_role
         and m.status = 'active'::public.membership_status
        where c.school_id = p_school_id
          and c.id = p_conversation_id
          and c.status = 'open'
          and c.assigned_counsellor_id = (select auth.uid())
    );
$$;

revoke all on function public.student_voice_owns_active_conversation(uuid, uuid) from public, anon;
revoke all on function public.student_voice_student_can_message_conversation(uuid, uuid) from public, anon;
revoke all on function public.student_voice_counsellor_can_read_conversation(uuid, uuid) from public, anon;
revoke all on function public.student_voice_counsellor_can_message_conversation(uuid, uuid) from public, anon;
grant execute on function public.student_voice_owns_active_conversation(uuid, uuid) to authenticated;
grant execute on function public.student_voice_student_can_message_conversation(uuid, uuid) to authenticated;
grant execute on function public.student_voice_counsellor_can_read_conversation(uuid, uuid) to authenticated;
grant execute on function public.student_voice_counsellor_can_message_conversation(uuid, uuid) to authenticated;

drop policy if exists student_voice_conversations_student_select on public.student_voice_conversations;
create policy student_voice_conversations_student_select
on public.student_voice_conversations
for select to authenticated
using (
    public.student_voice_owns_active_conversation(school_id, id)
);

drop policy if exists student_voice_messages_student_read on public.student_voice_messages;
create policy student_voice_messages_student_read
on public.student_voice_messages
for select to authenticated
using (
    public.student_voice_owns_active_conversation(school_id, conversation_id)
);

drop policy if exists student_voice_messages_counsellor_read on public.student_voice_messages;
create policy student_voice_messages_counsellor_read
on public.student_voice_messages
for select to authenticated
using (
    public.student_voice_counsellor_can_read_conversation(school_id, conversation_id)
);

drop policy if exists student_voice_messages_participant_insert on public.student_voice_messages;
create policy student_voice_messages_participant_insert
on public.student_voice_messages
for insert to authenticated
with check (
    sender_user_id = (select auth.uid())
    and (
        (
            sender_kind = 'student'
            and public.student_voice_student_can_message_conversation(school_id, conversation_id)
        )
        or (
            sender_kind = 'counsellor'
            and public.student_voice_counsellor_can_message_conversation(school_id, conversation_id)
        )
    )
);

drop policy if exists student_voice_meetings_student_select on public.student_voice_meeting_requests;
create policy student_voice_meetings_student_select
on public.student_voice_meeting_requests
for select to authenticated
using (
    requested_by = (select auth.uid())
    and public.student_voice_owns_active_conversation(school_id, conversation_id)
);

drop policy if exists student_voice_meetings_counsellor_select on public.student_voice_meeting_requests;
create policy student_voice_meetings_counsellor_select
on public.student_voice_meeting_requests
for select to authenticated
using (
    public.student_voice_counsellor_can_read_conversation(school_id, conversation_id)
);

drop policy if exists student_voice_meetings_student_insert on public.student_voice_meeting_requests;
create policy student_voice_meetings_student_insert
on public.student_voice_meeting_requests
for insert to authenticated
with check (
    requested_by = (select auth.uid())
    and public.student_voice_student_can_message_conversation(school_id, conversation_id)
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
