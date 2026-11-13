-- Behavioural RLS regression tests for the counsellor and Student Voice migrations.
-- Runs only against the disposable PostgreSQL CI database. All rows roll back.
BEGIN;

INSERT INTO auth.users (id) VALUES
 ('20000000-0000-4000-8000-000000000001'),
 ('20000000-0000-4000-8000-000000000002'),
 ('20000000-0000-4000-8000-000000000003'),
 ('20000000-0000-4000-8000-000000000004'),
 ('20000000-0000-4000-8000-000000000005'),
 ('20000000-0000-4000-8000-000000000006'),
 ('20000000-0000-4000-8000-000000000007'),
 ('20000000-0000-4000-8000-000000000008');

INSERT INTO public.profiles (id, full_name, email) VALUES
 ('20000000-0000-4000-8000-000000000001', 'Teacher One', 'teacher1@example.test'),
 ('20000000-0000-4000-8000-000000000002', 'Teacher Two', 'teacher2@example.test'),
 ('20000000-0000-4000-8000-000000000003', 'Counsellor One', 'counsellor1@example.test'),
 ('20000000-0000-4000-8000-000000000004', 'Counsellor Two', 'counsellor2@example.test'),
 ('20000000-0000-4000-8000-000000000005', 'School Admin', 'admin@example.test'),
 ('20000000-0000-4000-8000-000000000006', 'Linked Student', 'student@example.test'),
 ('20000000-0000-4000-8000-000000000007', 'Teacher Other', 'teacher-other@example.test'),
 ('20000000-0000-4000-8000-000000000008', 'Counsellor Three', 'counsellor3@example.test');

INSERT INTO public.schools (id, name, code) VALUES
 ('10000000-0000-4000-8000-000000000001', 'School One', 'RLS-SCHOOL-ONE'),
 ('10000000-0000-4000-8000-000000000002', 'School Two', 'RLS-SCHOOL-TWO');

INSERT INTO public.school_memberships (school_id, user_id, role, status) VALUES
 ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'teacher', 'active'),
 ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000007', 'teacher', 'active'),
 ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003', 'counsellor', 'active'),
 ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000005', 'admin', 'active'),
 ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000008', 'counsellor', 'active'),
 ('10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'teacher', 'active'),
 ('10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000004', 'counsellor', 'active');

INSERT INTO public.classes (id, school_id, name, academic_year) VALUES
 ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Class A', '2026-27'),
 ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Class B', '2026-27'),
 ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'Class C', '2026-27');

INSERT INTO public.students (id, school_id, admission_no, first_name, last_name) VALUES
 ('40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'RLS-001', 'Student One', 'Nair'),
 ('40000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'RLS-002', 'Student Two', 'Test'),
 ('40000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'RLS-003', 'Student Three', 'Test');
INSERT INTO public.students (id, school_id, admission_no, first_name, last_name) VALUES
 ('40000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'RLS-004', 'Dual Role', 'Account');

INSERT INTO public.class_teacher_assignments (school_id, class_id, teacher_user_id) VALUES
 ('10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001'),
 ('10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000007'),
 ('10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002');

INSERT INTO public.student_enrollments (school_id, student_id, class_id, academic_year, status) VALUES
 ('10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '2026-27', 'active'),
 ('10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '2026-27', 'active'),
 ('10000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', '2026-27', 'active');

INSERT INTO public.counsellor_referrals
 (id, school_id, student_id, class_id, submitted_by, category, summary)
VALUES
 ('50000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'academic', 'Student needs support with study planning.'),
 ('50000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000007', 'attendance', 'Student has repeated unexplained absences.'),
 ('50000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', 'wellbeing', 'Student requested a confidential support meeting.');

INSERT INTO public.student_voice_student_links
 (id, school_id, student_id, student_user_id, linked_by)
VALUES
 ('60000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000005');
INSERT INTO public.student_voice_student_links
 (id, school_id, student_id, student_user_id, linked_by)
VALUES
 ('60000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000005');

INSERT INTO public.student_voice_conversations
 (id, school_id, student_user_id, public_ref)
VALUES
 ('70000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000006', 'SV-RLS-0001');
INSERT INTO public.student_voice_conversations
 (id, school_id, student_user_id, assigned_counsellor_id, public_ref)
VALUES
 ('70000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000004', 'SV-RLS-DUAL');

INSERT INTO public.student_voice_messages
 (school_id, conversation_id, sender_kind, sender_user_id, body)
VALUES
 ('10000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000001', 'student', '20000000-0000-4000-8000-000000000006', 'I would like to speak privately.');

INSERT INTO public.student_voice_meeting_requests
 (school_id, conversation_id, requested_by, preferred_times, student_message)
VALUES
 ('10000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000006',
  'Weekdays after 3 PM',
  'Please arrange a private meeting.');

-- Teacher can see only their own referral, not another teacher's referral.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', true);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.counsellor_referrals) <> 1 THEN
    RAISE EXCEPTION 'Teacher RLS should expose exactly the submitting teacher own referral';
  END IF;
END $$;
RESET ROLE;

-- A school counsellor sees referrals from their school, never another school.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000003', true);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.counsellor_referrals) <> 2 THEN
    RAISE EXCEPTION 'Counsellor should see both referrals in their own school';
  END IF;
  UPDATE public.counsellor_referrals
     SET assigned_counsellor_id = auth.uid(), status = 'under_review'
   WHERE id = '50000000-0000-4000-8000-000000000001';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Counsellor could not claim an unassigned referral';
  END IF;
END $$;
RESET ROLE;

-- A counsellor in a different school cannot discover another school's referrals.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000004', true);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.counsellor_referrals) <> 1 THEN
    RAISE EXCEPTION 'Cross-school counsellor isolation failed';
  END IF;
END $$;
RESET ROLE;

-- A counsellor account that also has a student link must not fall back to student access.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000003', true);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.student_voice_conversations
      WHERE id = '70000000-0000-4000-8000-000000000002') <> 0 THEN
    RAISE EXCEPTION 'Dual-role counsellor account must not access Student Voice as a student';
  END IF;
END $$;
RESET ROLE;

-- Linked student can read their own conversation and message while the link is active.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000006', true);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.student_voice_conversations) <> 1
     OR (SELECT count(*) FROM public.student_voice_messages) <> 1 THEN
    RAISE EXCEPTION 'Active linked student cannot read their own Student Voice data';
  END IF;
END $$;
RESET ROLE;

-- Identity reveal is denied while the meeting request is pending.
-- After approval, only the assigned counsellor receives minimal identity fields,
-- and the reveal is audited in the same transaction.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000008', true);
DO $$
DECLARE
  v_request_id uuid;
  v_identity record;
  v_audit_count integer;
BEGIN
  SELECT id INTO v_request_id
  FROM public.student_voice_meeting_requests
  WHERE conversation_id = '70000000-0000-4000-8000-000000000001';

  BEGIN
    PERFORM 1 FROM public.reveal_student_voice_identity(
      '10000000-0000-4000-8000-000000000001', v_request_id
    );
    RAISE EXCEPTION 'Pending meeting request unexpectedly revealed identity';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  UPDATE public.student_voice_conversations
     SET assigned_counsellor_id = auth.uid()
   WHERE id = '70000000-0000-4000-8000-000000000001'
     AND school_id = '10000000-0000-4000-8000-000000000001';

  UPDATE public.student_voice_meeting_requests
     SET status = 'approved', handled_by = auth.uid(), handled_at = now()
   WHERE id = v_request_id
     AND school_id = '10000000-0000-4000-8000-000000000001';

  SELECT * INTO v_identity
  FROM public.reveal_student_voice_identity(
    '10000000-0000-4000-8000-000000000001', v_request_id
  );

  IF v_identity.student_name <> 'Student One Nair'
     OR v_identity.admission_no <> 'RLS-001'
     OR v_identity.class_name <> 'Class A'
     OR v_identity.academic_year <> '2026-27' THEN
    RAISE EXCEPTION 'Audited identity reveal returned incomplete or incorrect student details';
  END IF;
END $$;
RESET ROLE;

DO $$
DECLARE
  v_audit_count integer;
BEGIN
  SELECT count(*) INTO v_audit_count
  FROM public.student_voice_identity_reveal_audit
  WHERE meeting_request_id = (
    SELECT id FROM public.student_voice_meeting_requests
    WHERE conversation_id = '70000000-0000-4000-8000-000000000001'
  );
  IF v_audit_count <> 1 THEN
    RAISE EXCEPTION 'Successful identity reveal did not create exactly one audit event';
  END IF;
END $$;

-- A counsellor from another school cannot reveal the identity.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000004', true);
DO $$
DECLARE
  v_request_id uuid;
BEGIN
  SELECT id INTO v_request_id
  FROM public.student_voice_meeting_requests
  WHERE conversation_id = '70000000-0000-4000-8000-000000000001';
  BEGIN
    PERFORM 1 FROM public.reveal_student_voice_identity(
      '10000000-0000-4000-8000-000000000001', v_request_id
    );
    RAISE EXCEPTION 'Cross-school counsellor unexpectedly revealed identity';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END $$;
RESET ROLE;

-- A linked student who also has an active counsellor membership must not
-- use either participant path. The account must be denied as both student
-- and counsellor until its identity ambiguity is resolved.
INSERT INTO public.school_memberships (school_id, user_id, role, status)
VALUES (
 '10000000-0000-4000-8000-000000000001',
 '20000000-0000-4000-8000-000000000006',
 'counsellor',
 'active'
);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000006', true);
DO $$
BEGIN
  IF public.student_voice_owns_active_conversation(
       '10000000-0000-4000-8000-000000000001',
       '70000000-0000-4000-8000-000000000001'
     ) THEN
    RAISE EXCEPTION 'Dual-role account passed student conversation ownership check';
  END IF;
  IF public.student_voice_is_active_linked_student(
       '10000000-0000-4000-8000-000000000001',
       '70000000-0000-4000-8000-000000000001',
       false
     ) THEN
    RAISE EXCEPTION 'Dual-role account passed private student identity check';
  END IF;
  IF public.student_voice_student_can_message_conversation(
       '10000000-0000-4000-8000-000000000001',
       '70000000-0000-4000-8000-000000000001'
     ) THEN
    RAISE EXCEPTION 'Dual-role account passed student message authorization';
  END IF;
  IF public.student_voice_counsellor_can_read_conversation(
       '10000000-0000-4000-8000-000000000001',
       '70000000-0000-4000-8000-000000000001'
     ) OR public.student_voice_counsellor_can_message_conversation(
       '10000000-0000-4000-8000-000000000001',
       '70000000-0000-4000-8000-000000000001'
     ) OR public.student_voice_counsellor_can_handle_meeting(
       '10000000-0000-4000-8000-000000000001',
       '70000000-0000-4000-8000-000000000001'
     ) THEN
    RAISE EXCEPTION 'Dual-role account passed counsellor participant authorization';
  END IF;
  BEGIN
    INSERT INTO public.student_voice_messages
      (school_id, conversation_id, sender_kind, sender_user_id, body)
    VALUES
      ('10000000-0000-4000-8000-000000000001',
       '70000000-0000-4000-8000-000000000001',
       'student',
       auth.uid(),
       'Student-role message must be rejected for a dual-role account.');
    RAISE EXCEPTION 'Dual-role account sent a Student Voice message as a student';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
  -- The counsellor path must reject the same dual-role identity as the student path.
  BEGIN
    INSERT INTO public.student_voice_messages
      (school_id, conversation_id, sender_kind, sender_user_id, body)
    VALUES
      ('10000000-0000-4000-8000-000000000001',
       '70000000-0000-4000-8000-000000000002',
       'counsellor',
       auth.uid(),
       'Counsellor-role message must be rejected for a dual-role account.');
    RAISE EXCEPTION 'Dual-role account sent a Student Voice message as a counsellor';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END $$;
RESET ROLE;
DELETE FROM public.school_memberships
WHERE school_id = '10000000-0000-4000-8000-000000000001'
  AND user_id = '20000000-0000-4000-8000-000000000006'
  AND role = 'counsellor';

-- Only the active school admin can revoke the link; revocation is terminal.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000005', true);
UPDATE public.student_voice_student_links
   SET status = 'revoked'
 WHERE id = '60000000-0000-4000-8000-000000000001';
RESET ROLE;

-- Revocation immediately removes access to existing conversations and messages.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000006', true);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.student_voice_conversations) <> 0
     OR (SELECT count(*) FROM public.student_voice_messages) <> 0 THEN
    RAISE EXCEPTION 'Revoked student link still exposes existing Student Voice data';
  END IF;
  BEGIN
    INSERT INTO public.student_voice_messages
      (school_id, conversation_id, sender_kind, sender_user_id, body)
    VALUES
      ('10000000-0000-4000-8000-000000000001',
       '70000000-0000-4000-8000-000000000001',
       'student',
       auth.uid(),
       'This message must be rejected after revocation.');
    RAISE EXCEPTION 'Revoked student was able to send a Student Voice message';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END $$;
RESET ROLE;


-- Revocation also blocks a previously approved identity reveal.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000008', true);
DO $$
DECLARE
  v_request_id uuid;
BEGIN
  SELECT id INTO v_request_id
  FROM public.student_voice_meeting_requests
  WHERE conversation_id = '70000000-0000-4000-8000-000000000001';
  BEGIN
    PERFORM 1 FROM public.reveal_student_voice_identity(
      '10000000-0000-4000-8000-000000000001', v_request_id
    );
    RAISE EXCEPTION 'Revoked student link unexpectedly permitted identity reveal';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END $$;
RESET ROLE;

-- Trigger functions must not be callable as public RPCs after hardening.
DO $$
BEGIN
  IF has_function_privilege('anon', 'public.create_announcement_notifications()', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.create_announcement_notifications()', 'EXECUTE')
     OR has_function_privilege('anon', 'public.sync_fee_invoice_status()', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.sync_fee_invoice_status()', 'EXECUTE') THEN
    RAISE EXCEPTION 'Trigger-only SECURITY DEFINER functions remain directly executable by client roles';
  END IF;
END $$;

-- Revoking direct EXECUTE must not break trigger invocation by the database.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000005', true);
INSERT INTO public.announcements
  (school_id, title, body, audience, created_by)
VALUES
  ('10000000-0000-4000-8000-000000000001',
   'Trigger permission regression',
   'This announcement verifies the notification trigger still runs.',
   'school',
   auth.uid());
RESET ROLE;
DO $$
DECLARE
  v_announcement_id uuid;
  v_notification_count integer;
BEGIN
  SELECT id INTO v_announcement_id
  FROM public.announcements
  WHERE title = 'Trigger permission regression';

  SELECT count(*) INTO v_notification_count
  FROM public.notifications
  WHERE related_announcement_id = v_announcement_id;

  IF v_notification_count <> 3 THEN
    RAISE EXCEPTION 'Announcement notification trigger did not fan out to all expected active members (got %)', v_notification_count;
  END IF;
END $$;

ROLLBACK;
