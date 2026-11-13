-- Post-migration structural assertions for the disposable PostgreSQL CI database.
DO $$
DECLARE
  table_name text;
  policy_required_tables text[] := ARRAY[
    'counsellor_referrals',
    'counselling_cases',
    'counselling_case_notes',
    'counselling_sessions',
    'counselling_notices',
    'student_voice_student_links',
    'student_voice_conversations',
    'student_voice_messages',
    'student_voice_meeting_requests'
  ];
  all_feature_tables text[] := policy_required_tables || ARRAY[
    'student_voice_identity_reveal_audit'
  ];
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'membership_role'
      AND e.enumlabel = 'counsellor'
  ) THEN
    RAISE EXCEPTION 'membership_role.counsellor enum value was not installed';
  END IF;

  FOREACH table_name IN ARRAY all_feature_tables LOOP
    IF to_regclass(format('public.%I', table_name)) IS NULL THEN
      RAISE EXCEPTION 'Required feature table public.% is missing', table_name;
    END IF;
    IF NOT (
      SELECT relrowsecurity FROM pg_class
      WHERE oid = to_regclass(format('public.%I', table_name))
    ) THEN
      RAISE EXCEPTION 'RLS is not enabled on public.%', table_name;
    END IF;
  END LOOP;

  -- All participant-facing tables need explicit policies.
  FOREACH table_name IN ARRAY policy_required_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = table_name
    ) THEN
      RAISE EXCEPTION 'No RLS policy exists for public.%', table_name;
    END IF;
  END LOOP;

  -- Identity reveal audit is intentionally policy-less and inaccessible to
  -- authenticated users. Its only write path is the SECURITY DEFINER RPC.
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'student_voice_identity_reveal_audit'
  ) THEN
    RAISE EXCEPTION 'Identity reveal audit must not expose direct RLS policies';
  END IF;
  IF has_table_privilege('authenticated', 'public.student_voice_identity_reveal_audit', 'SELECT')
     OR has_table_privilege('authenticated', 'public.student_voice_identity_reveal_audit', 'INSERT')
     OR has_table_privilege('authenticated', 'public.student_voice_identity_reveal_audit', 'UPDATE')
     OR has_table_privilege('authenticated', 'public.student_voice_identity_reveal_audit', 'DELETE') THEN
    RAISE EXCEPTION 'Authenticated users have direct privileges on the identity reveal audit';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'student_voice_link_update_guard'
      AND NOT tgisinternal
  ) THEN
    RAISE EXCEPTION 'Student Voice terminal revocation guard trigger is missing';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'counselling_cases_status_transition_guard'
      AND NOT tgisinternal
  ) THEN
    RAISE EXCEPTION 'Counselling case lifecycle guard trigger is missing';
  END IF;
END $$;
