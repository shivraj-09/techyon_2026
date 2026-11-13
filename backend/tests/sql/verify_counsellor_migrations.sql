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


-- Functional RLS regression fixtures. These are inserted only into the disposable CI database.
INSERT INTO auth.users (id) VALUES
  ('10000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000005'),
  ('10000000-0000-0000-0000-000000000006');

INSERT INTO public.schools (id, name, code)
VALUES ('10000000-0000-0000-0000-000000000001', 'RLS Test School', 'RLS-CI');

INSERT INTO public.profiles (id, full_name, email) VALUES
  ('10000000-0000-0000-0000-000000000002', 'CI Admin', 'admin-ci@example.invalid'),
  ('10000000-0000-0000-0000-000000000003', 'Counsellor A', 'counsellor-a@example.invalid'),
  ('10000000-0000-0000-0000-000000000004', 'Counsellor B', 'counsellor-b@example.invalid');

INSERT INTO public.school_memberships (school_id, user_id, role, status) VALUES
  ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'admin', 'active'),
  ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'counsellor', 'active'),
  ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'counsellor', 'active');

INSERT INTO public.students (id, school_id, admission_no, first_name) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'CI-001', 'Student One'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'CI-002', 'Student Two');

INSERT INTO public.student_voice_student_links
  (id, school_id, student_id, student_user_id, linked_by, status) VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'active'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'active');

INSERT INTO public.student_voice_conversations
  (id, school_id, student_user_id, assigned_counsellor_id) VALUES
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', NULL),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004');

INSERT INTO public.student_voice_messages
  (school_id, conversation_id, sender_kind, sender_user_id, body) VALUES
  ('10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'student', '10000000-0000-0000-0000-000000000005', 'Message for counsellor A'),
  ('10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'student', '10000000-0000-0000-0000-000000000005', 'Unassigned message'),
  ('10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 'student', '10000000-0000-0000-0000-000000000006', 'Message for counsellor B');

INSERT INTO public.student_voice_meeting_requests
  (id, school_id, conversation_id, requested_by, preferred_times, status, handled_by, handled_at)
VALUES
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005',
   'Weekday afternoons', 'approved', '10000000-0000-0000-0000-000000000003', now());

-- Counsellor A may read only their assigned conversation and unassigned inbox items.
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', false);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.student_voice_conversations) <> 2 THEN
    RAISE EXCEPTION 'Counsellor A must see exactly their assigned and unassigned conversations';
  END IF;
  IF (SELECT count(*) FROM public.student_voice_messages) <> 2 THEN
    RAISE EXCEPTION 'Counsellor A must see messages only for their assigned and unassigned conversations';
  END IF;
  IF (SELECT count(*) FROM public.student_voice_meeting_requests) <> 1 THEN
    RAISE EXCEPTION 'Counsellor A must see meeting requests only for their assigned and unassigned conversations';
  END IF;
END $$;
RESET ROLE;

-- A linked student sees only their own conversations and requests.
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000005', false);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.student_voice_conversations) <> 2 THEN
    RAISE EXCEPTION 'Student One must see only their two conversations';
  END IF;
  IF (SELECT count(*) FROM public.student_voice_messages) <> 2 THEN
    RAISE EXCEPTION 'Student One must see only their own messages';
  END IF;
  IF (SELECT count(*) FROM public.student_voice_meeting_requests) <> 1 THEN
    RAISE EXCEPTION 'Student One must see only their own meeting request';
  END IF;
END $$;
RESET ROLE;

-- Revoking the active account link suspends student reads without deleting history.
SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', false);
UPDATE public.student_voice_student_links
SET status = 'revoked'
WHERE id = '30000000-0000-0000-0000-000000000001';

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000005', false);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.student_voice_conversations) <> 0 THEN
    RAISE EXCEPTION 'Revoked student must no longer read Student Voice conversations';
  END IF;
  IF (SELECT count(*) FROM public.student_voice_messages) <> 0 THEN
    RAISE EXCEPTION 'Revoked student must no longer read Student Voice messages';
  END IF;
  IF (SELECT count(*) FROM public.student_voice_meeting_requests) <> 0 THEN
    RAISE EXCEPTION 'Revoked student must no longer read Student Voice meeting requests';
  END IF;
END $$;
RESET ROLE;

-- A revoked link is terminal and cannot be reactivated.
SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', false);
DO $$
BEGIN
  BEGIN
    UPDATE public.student_voice_student_links
    SET status = 'active'
    WHERE id = '30000000-0000-0000-0000-000000000001';
    RAISE EXCEPTION 'Revoked Student Voice link was unexpectedly reactivated';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END $$;
