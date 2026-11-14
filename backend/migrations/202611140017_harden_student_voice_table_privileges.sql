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
