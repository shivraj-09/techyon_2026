-- The recovered API privilege snapshot grants table-level CRUD to authenticated.
-- Remove those broad table grants from Student Voice tables while preserving
-- the explicit column-level grants established in 202611140005_create_student_voice.sql.
-- RLS policies continue to enforce row-level access.

revoke all privileges on table public.student_voice_student_links
  from public, anon, authenticated;
revoke all privileges on table public.student_voice_conversations
  from public, anon, authenticated;
revoke all privileges on table public.student_voice_messages
  from public, anon, authenticated;
revoke all privileges on table public.student_voice_meeting_requests
  from public, anon, authenticated;

-- REVOKE ALL also removes the column grants above, so restore only the
-- intended column-level surface after clearing inherited table privileges.
grant select (id, school_id, student_id, student_user_id, status, linked_by, created_at),
      insert (school_id, student_id, student_user_id, linked_by),
      update (status) on public.student_voice_student_links to authenticated;

grant select (id, school_id, public_ref, status, assigned_counsellor_id, created_at, last_message_at),
      insert (school_id, student_user_id),
      update (status, assigned_counsellor_id) on public.student_voice_conversations to authenticated;

grant select (id, school_id, conversation_id, sender_kind, body, created_at, read_at),
      insert (school_id, conversation_id, sender_kind, sender_user_id, body)
      on public.student_voice_messages to authenticated;

grant select (id, school_id, conversation_id, preferred_times, student_message, status, handled_by, handled_at, created_at),
      insert (school_id, conversation_id, requested_by, preferred_times, student_message),
      update (status, handled_by, handled_at) on public.student_voice_meeting_requests to authenticated;
