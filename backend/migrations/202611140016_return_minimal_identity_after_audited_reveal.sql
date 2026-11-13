-- Return the minimum useful student identity after the existing audited reveal
-- checks succeed. No identity fields are added to counsellor inbox/message queries.
DROP FUNCTION IF EXISTS public.reveal_student_voice_identity(uuid, uuid);

CREATE FUNCTION public.reveal_student_voice_identity(
    p_school_id uuid,
    p_meeting_request_id uuid
)
RETURNS TABLE (
    student_id uuid,
    student_name text,
    admission_no text,
    class_name text,
    academic_year text,
    meeting_request_id uuid,
    conversation_id uuid,
    revealed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_student_id uuid;
    v_conversation_id uuid;
    v_revealed_at timestamptz;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required' USING errcode = '42501';
    END IF;

    SELECT l.student_id, c.id
      INTO v_student_id, v_conversation_id
      FROM public.student_voice_meeting_requests mr
      JOIN public.student_voice_conversations c
        ON c.school_id = mr.school_id
       AND c.id = mr.conversation_id
      JOIN public.student_voice_student_links l
        ON l.school_id = c.school_id
       AND l.student_user_id = c.student_user_id
       AND l.status = 'active'
      JOIN public.school_memberships m
        ON m.school_id = c.school_id
       AND m.user_id = (SELECT auth.uid())
       AND m.role = 'counsellor'::public.membership_role
       AND m.status = 'active'::public.membership_status
     WHERE mr.id = p_meeting_request_id
       AND mr.school_id = p_school_id
       AND mr.status IN ('approved', 'completed')
       AND c.assigned_counsellor_id = (SELECT auth.uid())
       AND c.student_user_id <> (SELECT auth.uid())
       AND NOT EXISTS (
           SELECT 1
           FROM public.student_voice_student_links own_link
           WHERE own_link.school_id = c.school_id
             AND own_link.student_user_id = (SELECT auth.uid())
             AND own_link.status = 'active'
       )
     LIMIT 1
     FOR SHARE OF l;

    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Approved meeting request not found or access denied' USING errcode = '42501';
    END IF;

    -- Audit before returning any identity fields.
    v_revealed_at := now();
    INSERT INTO public.student_voice_identity_reveal_audit (
        school_id, meeting_request_id, counsellor_user_id, student_id, revealed_at
    ) VALUES (
        p_school_id, p_meeting_request_id, (SELECT auth.uid()), v_student_id, v_revealed_at
    );

    RETURN QUERY
    SELECT
        s.id,
        concat_ws(' ', s.first_name, s.last_name),
        s.admission_no,
        enrollment.class_name,
        enrollment.academic_year,
        p_meeting_request_id,
        v_conversation_id,
        v_revealed_at
    FROM public.students s
    LEFT JOIN LATERAL (
        SELECT cl.name AS class_name, e.academic_year
        FROM public.student_enrollments e
        JOIN public.classes cl
          ON cl.id = e.class_id
         AND cl.school_id = e.school_id
        WHERE e.school_id = p_school_id
          AND e.student_id = s.id
          AND e.status = 'active'
        ORDER BY e.enrolled_at DESC NULLS LAST
        LIMIT 1
    ) enrollment ON TRUE
    WHERE s.id = v_student_id
      AND s.school_id = p_school_id;
END;
$$;

REVOKE ALL ON FUNCTION public.reveal_student_voice_identity(uuid, uuid)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reveal_student_voice_identity(uuid, uuid)
    TO authenticated;
