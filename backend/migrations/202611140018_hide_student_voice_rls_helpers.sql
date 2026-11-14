-- Keep Student Voice RLS helper functions out of the exposed public API schema.
-- Policies retain EXECUTE through the private schema, but PostgREST cannot expose
-- these helpers as public RPC endpoints when the private schema is not exposed.

create schema if not exists private authorization postgres;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter function public.student_voice_counsellor_can_handle_meeting(uuid, uuid) set schema private;
alter function public.student_voice_counsellor_can_message_conversation(uuid, uuid) set schema private;
alter function public.student_voice_counsellor_can_read_conversation(uuid, uuid) set schema private;
alter function public.student_voice_is_active_linked_student(uuid, uuid, boolean) set schema private;
alter function public.student_voice_owns_active_conversation(uuid, uuid) set schema private;
alter function public.student_voice_student_can_message_conversation(uuid, uuid) set schema private;

revoke all privileges on function private.student_voice_counsellor_can_handle_meeting(uuid, uuid) from public, anon;
revoke all privileges on function private.student_voice_counsellor_can_message_conversation(uuid, uuid) from public, anon;
revoke all privileges on function private.student_voice_counsellor_can_read_conversation(uuid, uuid) from public, anon;
revoke all privileges on function private.student_voice_is_active_linked_student(uuid, uuid, boolean) from public, anon;
revoke all privileges on function private.student_voice_owns_active_conversation(uuid, uuid) from public, anon;
revoke all privileges on function private.student_voice_student_can_message_conversation(uuid, uuid) from public, anon;

grant execute on function private.student_voice_counsellor_can_handle_meeting(uuid, uuid) to authenticated;
grant execute on function private.student_voice_counsellor_can_message_conversation(uuid, uuid) to authenticated;
grant execute on function private.student_voice_counsellor_can_read_conversation(uuid, uuid) to authenticated;
grant execute on function private.student_voice_is_active_linked_student(uuid, uuid, boolean) to authenticated;
grant execute on function private.student_voice_owns_active_conversation(uuid, uuid) to authenticated;
grant execute on function private.student_voice_student_can_message_conversation(uuid, uuid) to authenticated;

-- Defense in depth: the identity reveal audit is never directly readable or writable by clients.
create policy student_voice_identity_audit_deny_client
on public.student_voice_identity_reveal_audit
for all to anon, authenticated
using (false)
with check (false);
