
alter function public.set_updated_at() set search_path = pg_catalog, public;

create index if not exists idx_class_teacher_class_school
  on public.class_teacher_assignments(class_id, school_id);
create index if not exists idx_enrollments_student_school
  on public.student_enrollments(student_id, school_id);
create index if not exists idx_enrollments_class_school
  on public.student_enrollments(class_id, school_id);
create index if not exists idx_guardians_student_school
  on public.student_guardians(student_id, school_id);
create index if not exists idx_attendance_student_school
  on public.attendance_records(student_id, school_id);
create index if not exists idx_attendance_class_school
  on public.attendance_records(class_id, school_id);
create index if not exists idx_attendance_marker_school
  on public.attendance_records(marked_by, school_id);
create index if not exists idx_invoices_student_school
  on public.fee_invoices(student_id, school_id);
create index if not exists idx_invoices_creator_school
  on public.fee_invoices(created_by, school_id);
create index if not exists idx_payments_invoice_school
  on public.fee_payments(invoice_id, school_id);
create index if not exists idx_payments_recorder_school
  on public.fee_payments(recorded_by, school_id);
create index if not exists idx_announcements_class_school
  on public.announcements(class_id, school_id);
create index if not exists idx_announcements_creator_school
  on public.announcements(created_by, school_id);
create index if not exists idx_notifications_recipient_school
  on public.notifications(recipient_user_id, school_id);
create index if not exists idx_notifications_announcement
  on public.notifications(related_announcement_id);
create index if not exists idx_ai_insights_generator_school
  on public.ai_insights(generated_by, school_id);
