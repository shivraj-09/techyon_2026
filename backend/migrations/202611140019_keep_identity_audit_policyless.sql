-- The identity reveal audit intentionally has no client-facing RLS policies.
-- RLS is enabled and all table privileges are revoked; only the audited
-- SECURITY DEFINER identity-reveal function writes to this table.
drop policy if exists student_voice_identity_audit_deny_client
on public.student_voice_identity_reveal_audit;
