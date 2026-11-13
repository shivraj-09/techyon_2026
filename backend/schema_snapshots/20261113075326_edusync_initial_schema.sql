-- EduSync MVP schema for Supabase PostgreSQL
-- Version: 1.0-draft
-- Apply to a NEW Supabase project only after reviewing with the team.
-- This script creates tables, indexes, triggers and baseline RLS policies.
-- It does not create users, schools, demo data, or deploy application code.

begin;

create extension if not exists pgcrypto;

-- ---------- ENUM TYPES ----------
do $$ begin
  create type public.membership_role as enum ('admin', 'teacher', 'parent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.membership_status as enum ('active', 'invited', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.student_status as enum ('active', 'inactive', 'graduated', 'transferred');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.attendance_status as enum ('present', 'absent', 'late', 'excused');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.invoice_status as enum ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'successful', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.announcement_audience as enum ('school', 'class', 'parents', 'teachers');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notification_type as enum ('announcement', 'attendance', 'fee', 'system');
exception when duplicate_object then null; end $$;

-- ---------- COMMON UPDATED_AT TRIGGER ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- INSTITUTION & IDENTITY ----------
create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  address text,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.school_memberships (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.membership_role not null,
  status public.membership_status not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, user_id),
  unique (id, school_id),
  unique (user_id, school_id)
);

-- ---------- ACADEMIC STRUCTURE ----------
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  grade_level text,
  section text,
  academic_year text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, school_id),
  unique (school_id, name, academic_year)
);

create table if not exists public.class_teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null,
  teacher_user_id uuid not null,
  assigned_at timestamptz not null default now(),
  foreign key (class_id, school_id) references public.classes(id, school_id) on delete cascade,
  foreign key (teacher_user_id, school_id) references public.school_memberships(user_id, school_id) on delete cascade,
  unique (class_id, teacher_user_id)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  admission_no text not null,
  first_name text not null,
  last_name text,
  date_of_birth date,
  status public.student_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, school_id),
  unique (school_id, admission_no)
);

-- Enrolment history allows a student to move classes over academic years.
create table if not exists public.student_enrollments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null,
  class_id uuid not null,
  roll_number text,
  academic_year text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'withdrawn')),
  enrolled_at date not null default current_date,
  created_at timestamptz not null default now(),
  foreign key (student_id, school_id) references public.students(id, school_id) on delete cascade,
  foreign key (class_id, school_id) references public.classes(id, school_id) on delete restrict,
  unique (id, school_id)
);

create unique index if not exists uq_active_student_enrollment
  on public.student_enrollments(student_id)
  where status = 'active';

create table if not exists public.student_guardians (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null,
  guardian_user_id uuid not null,
  relationship text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  foreign key (student_id, school_id) references public.students(id, school_id) on delete cascade,
  foreign key (guardian_user_id, school_id) references public.school_memberships(user_id, school_id) on delete cascade,
  unique (student_id, guardian_user_id)
);

-- ---------- ATTENDANCE ----------
create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null,
  class_id uuid not null,
  attendance_date date not null,
  status public.attendance_status not null,
  marked_by uuid not null,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (student_id, school_id) references public.students(id, school_id) on delete cascade,
  foreign key (class_id, school_id) references public.classes(id, school_id) on delete restrict,
  foreign key (marked_by, school_id) references public.school_memberships(user_id, school_id) on delete restrict,
  unique (student_id, attendance_date)
);

-- ---------- FEES ----------
create table if not exists public.fee_invoices (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null,
  invoice_number text not null,
  description text not null,
  amount_due numeric(12,2) not null check (amount_due > 0),
  due_date date not null,
  status public.invoice_status not null default 'issued',
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (student_id, school_id) references public.students(id, school_id) on delete restrict,
  foreign key (created_by, school_id) references public.school_memberships(user_id, school_id) on delete restrict,
  unique (id, school_id),
  unique (school_id, invoice_number)
);

create table if not exists public.fee_payments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  invoice_id uuid not null,
  amount numeric(12,2) not null check (amount > 0),
  payment_method text not null check (payment_method in ('cash', 'bank_transfer', 'upi', 'card', 'other')),
  reference_number text,
  status public.payment_status not null default 'successful',
  recorded_by uuid,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key (invoice_id, school_id) references public.fee_invoices(id, school_id) on delete restrict,
  foreign key (recorded_by, school_id) references public.school_memberships(user_id, school_id) on delete restrict
);

-- Outstanding balances are derived from successful payments; do not store a second balance.
create or replace view public.fee_invoice_balances
with (security_invoker = true)
as
select
  i.id as invoice_id,
  i.school_id,
  i.student_id,
  i.invoice_number,
  i.amount_due,
  coalesce(sum(p.amount) filter (where p.status = 'successful'), 0)::numeric(12,2) as amount_paid,
  (i.amount_due - coalesce(sum(p.amount) filter (where p.status = 'successful'), 0))::numeric(12,2) as outstanding_amount,
  i.due_date,
  i.status
from public.fee_invoices i
left join public.fee_payments p on p.invoice_id = i.id and p.school_id = i.school_id
group by i.id;

-- ---------- COMMUNICATION ----------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null,
  body text not null,
  audience public.announcement_audience not null default 'school',
  class_id uuid,
  created_by uuid not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (class_id, school_id) references public.classes(id, school_id) on delete cascade,
  foreign key (created_by, school_id) references public.school_memberships(user_id, school_id) on delete restrict,
  check ((audience = 'class' and class_id is not null) or (audience <> 'class' and class_id is null))
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  recipient_user_id uuid not null,
  title text not null,
  body text not null,
  type public.notification_type not null default 'system',
  related_announcement_id uuid references public.announcements(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (recipient_user_id, school_id) references public.school_memberships(user_id, school_id) on delete cascade
);

-- ---------- AI INSIGHTS ----------
create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  insight_type text not null,
  summary text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  period_start date,
  period_end date,
  generated_by uuid,
  generated_at timestamptz not null default now(),
  foreign key (generated_by, school_id) references public.school_memberships(user_id, school_id) on delete restrict,
  check (period_end is null or period_start is null or period_end >= period_start)
);

-- ---------- INDEXES ----------
create index if not exists idx_memberships_user_status on public.school_memberships(user_id, status);
create index if not exists idx_classes_school_year on public.classes(school_id, academic_year);
create index if not exists idx_teacher_assignments_teacher on public.class_teacher_assignments(teacher_user_id, school_id);
create index if not exists idx_students_school_status on public.students(school_id, status);
create index if not exists idx_enrollments_class_year on public.student_enrollments(class_id, academic_year);
create index if not exists idx_guardians_user on public.student_guardians(guardian_user_id, school_id);
create index if not exists idx_attendance_class_date on public.attendance_records(class_id, attendance_date);
create index if not exists idx_attendance_student_date on public.attendance_records(student_id, attendance_date desc);
create index if not exists idx_invoices_student_due on public.fee_invoices(student_id, due_date);
create index if not exists idx_payments_invoice on public.fee_payments(invoice_id, paid_at desc);
create index if not exists idx_announcements_school_published on public.announcements(school_id, published_at desc);
create index if not exists idx_notifications_recipient_unread on public.notifications(recipient_user_id, created_at desc) where read_at is null;
create index if not exists idx_ai_insights_school_generated on public.ai_insights(school_id, generated_at desc);

-- ---------- UPDATED_AT TRIGGERS ----------
do $$ declare t text; begin
  foreach t in array array['schools','profiles','school_memberships','classes','students','attendance_records','fee_invoices','announcements'] loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I', t, t);
    execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ---------- RLS ----------
-- Enable RLS on every public table and the view's underlying tables.
alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.school_memberships enable row level security;
alter table public.classes enable row level security;
alter table public.class_teacher_assignments enable row level security;
alter table public.students enable row level security;
alter table public.student_enrollments enable row level security;
alter table public.student_guardians enable row level security;
alter table public.attendance_records enable row level security;
alter table public.fee_invoices enable row level security;
alter table public.fee_payments enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.ai_insights enable row level security;

-- Profiles: users can read/update their own profile. Administrative provisioning is done server-side.
create policy "profiles_select_self" on public.profiles
for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_self" on public.profiles
for update to authenticated using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Memberships: users can see their own school memberships. Backend service manages invitations/roles.
create policy "memberships_select_self" on public.school_memberships
for select to authenticated using (user_id = (select auth.uid()));

-- Schools: members can read the schools they belong to.
create policy "schools_select_member" on public.schools
for select to authenticated using (
  exists (
    select 1 from public.school_memberships m
    where m.school_id = schools.id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

-- Helper pattern for school-scoped tables: membership check plus role restriction.
create policy "classes_select_member" on public.classes
for select to authenticated using (
  exists (select 1 from public.school_memberships m where m.school_id = classes.school_id
    and m.user_id = (select auth.uid()) and m.status = 'active')
);
create policy "classes_admin_manage" on public.classes
for all to authenticated
using (exists (select 1 from public.school_memberships m where m.school_id = classes.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'))
with check (exists (select 1 from public.school_memberships m where m.school_id = classes.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'));

create policy "students_select_authorised" on public.students
for select to authenticated using (
  exists (select 1 from public.school_memberships m where m.school_id = students.school_id
    and m.user_id = (select auth.uid()) and m.status = 'active'
    and (m.role = 'admin'
      or (m.role = 'teacher' and exists (select 1 from public.class_teacher_assignments cta
        join public.student_enrollments e on e.class_id = cta.class_id and e.school_id = cta.school_id
        where cta.teacher_user_id = m.user_id and cta.school_id = students.school_id
          and e.student_id = students.id and e.status = 'active'))
      or (m.role = 'parent' and exists (select 1 from public.student_guardians sg
        where sg.student_id = students.id and sg.school_id = students.school_id
          and sg.guardian_user_id = m.user_id)))
));
create policy "students_admin_manage" on public.students
for all to authenticated
using (exists (select 1 from public.school_memberships m where m.school_id = students.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'))
with check (exists (select 1 from public.school_memberships m where m.school_id = students.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'));

create policy "enrollments_select_authorised" on public.student_enrollments
for select to authenticated using (
  exists (select 1 from public.school_memberships m where m.school_id = student_enrollments.school_id
    and m.user_id = (select auth.uid()) and m.status = 'active'
    and (m.role = 'admin'
      or (m.role = 'teacher' and exists (select 1 from public.class_teacher_assignments cta
        where cta.class_id = student_enrollments.class_id and cta.school_id = student_enrollments.school_id
          and cta.teacher_user_id = m.user_id))
      or (m.role = 'parent' and exists (select 1 from public.student_guardians sg
        where sg.student_id = student_enrollments.student_id and sg.school_id = student_enrollments.school_id
          and sg.guardian_user_id = m.user_id)))
));
create policy "enrollments_admin_manage" on public.student_enrollments
for all to authenticated
using (exists (select 1 from public.school_memberships m where m.school_id = student_enrollments.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'))
with check (exists (select 1 from public.school_memberships m where m.school_id = student_enrollments.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'));

create policy "guardians_select_related" on public.student_guardians
for select to authenticated using (
  guardian_user_id = (select auth.uid())
  or exists (select 1 from public.school_memberships m where m.school_id = student_guardians.school_id
    and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active')
);
create policy "guardians_admin_manage" on public.student_guardians
for all to authenticated
using (exists (select 1 from public.school_memberships m where m.school_id = student_guardians.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'))
with check (exists (select 1 from public.school_memberships m where m.school_id = student_guardians.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'));

create policy "teacher_assignments_select_related" on public.class_teacher_assignments
for select to authenticated using (
  teacher_user_id = (select auth.uid())
  or exists (select 1 from public.school_memberships m where m.school_id = class_teacher_assignments.school_id
    and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active')
);
create policy "teacher_assignments_admin_manage" on public.class_teacher_assignments
for all to authenticated
using (exists (select 1 from public.school_memberships m where m.school_id = class_teacher_assignments.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'))
with check (exists (select 1 from public.school_memberships m where m.school_id = class_teacher_assignments.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'));

create policy "attendance_select_authorised" on public.attendance_records
for select to authenticated using (
  exists (select 1 from public.school_memberships m where m.school_id = attendance_records.school_id
    and m.user_id = (select auth.uid()) and m.status = 'active'
    and (m.role = 'admin'
      or (m.role = 'teacher' and exists (select 1 from public.class_teacher_assignments cta
        where cta.class_id = attendance_records.class_id and cta.school_id = attendance_records.school_id
          and cta.teacher_user_id = m.user_id))
      or (m.role = 'parent' and exists (select 1 from public.student_guardians sg
        where sg.student_id = attendance_records.student_id and sg.school_id = attendance_records.school_id
          and sg.guardian_user_id = m.user_id)))
));
create policy "attendance_staff_manage" on public.attendance_records
for all to authenticated
using (exists (select 1 from public.school_memberships m where m.school_id = attendance_records.school_id
  and m.user_id = (select auth.uid()) and m.status = 'active'
  and (m.role = 'admin' or (m.role = 'teacher' and exists (
    select 1 from public.class_teacher_assignments cta where cta.class_id = attendance_records.class_id
      and cta.school_id = attendance_records.school_id and cta.teacher_user_id = m.user_id)))))
with check (exists (select 1 from public.school_memberships m where m.school_id = attendance_records.school_id
  and m.user_id = (select auth.uid()) and m.status = 'active'
  and (m.role = 'admin' or (m.role = 'teacher' and exists (
    select 1 from public.class_teacher_assignments cta where cta.class_id = attendance_records.class_id
      and cta.school_id = attendance_records.school_id and cta.teacher_user_id = m.user_id)))));

create policy "invoices_select_authorised" on public.fee_invoices
for select to authenticated using (
  exists (select 1 from public.school_memberships m where m.school_id = fee_invoices.school_id
    and m.user_id = (select auth.uid()) and m.status = 'active'
    and (m.role = 'admin' or (m.role = 'parent' and exists (
      select 1 from public.student_guardians sg where sg.student_id = fee_invoices.student_id
        and sg.school_id = fee_invoices.school_id and sg.guardian_user_id = m.user_id))))
);
create policy "invoices_admin_manage" on public.fee_invoices
for all to authenticated
using (exists (select 1 from public.school_memberships m where m.school_id = fee_invoices.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'))
with check (exists (select 1 from public.school_memberships m where m.school_id = fee_invoices.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'));

create policy "payments_select_authorised" on public.fee_payments
for select to authenticated using (
  exists (select 1 from public.school_memberships m where m.school_id = fee_payments.school_id
    and m.user_id = (select auth.uid()) and m.status = 'active'
    and (m.role = 'admin' or (m.role = 'parent' and exists (
      select 1 from public.fee_invoices i join public.student_guardians sg
        on sg.student_id = i.student_id and sg.school_id = i.school_id
      where i.id = fee_payments.invoice_id and i.school_id = fee_payments.school_id
        and sg.guardian_user_id = m.user_id))))
);
create policy "payments_admin_manage" on public.fee_payments
for all to authenticated
using (exists (select 1 from public.school_memberships m where m.school_id = fee_payments.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'))
with check (exists (select 1 from public.school_memberships m where m.school_id = fee_payments.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'));

create policy "announcements_select_audience" on public.announcements
for select to authenticated using (
  published_at is not null and exists (
    select 1 from public.school_memberships m
    where m.school_id = announcements.school_id and m.user_id = (select auth.uid())
      and m.status = 'active'
      and (
        m.role = 'admin'
        or announcements.audience = 'school'
        or (announcements.audience = 'parents' and m.role = 'parent')
        or (announcements.audience = 'teachers' and m.role = 'teacher')
        or (announcements.audience = 'class' and exists (
          select 1 from public.student_enrollments e
          join public.student_guardians sg on sg.student_id = e.student_id and sg.school_id = e.school_id
          where e.class_id = announcements.class_id and e.school_id = announcements.school_id
            and e.status = 'active' and sg.guardian_user_id = m.user_id
        ))
        or (announcements.audience = 'class' and exists (
          select 1 from public.class_teacher_assignments cta
          where cta.class_id = announcements.class_id and cta.school_id = announcements.school_id
            and cta.teacher_user_id = m.user_id
        ))
      )
  )
);
create policy "announcements_admin_manage" on public.announcements
for all to authenticated
using (exists (select 1 from public.school_memberships m where m.school_id = announcements.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'))
with check (exists (select 1 from public.school_memberships m where m.school_id = announcements.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'));

create policy "notifications_select_recipient" on public.notifications
for select to authenticated using (recipient_user_id = (select auth.uid()));
create policy "notifications_update_recipient" on public.notifications
for update to authenticated using (recipient_user_id = (select auth.uid()))
with check (recipient_user_id = (select auth.uid()));

create policy "ai_insights_select_staff" on public.ai_insights
for select to authenticated using (
  exists (select 1 from public.school_memberships m where m.school_id = ai_insights.school_id
    and m.user_id = (select auth.uid()) and m.status = 'active'
    and m.role in ('admin', 'teacher'))
);
create policy "ai_insights_admin_manage" on public.ai_insights
for all to authenticated
using (exists (select 1 from public.school_memberships m where m.school_id = ai_insights.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'))
with check (exists (select 1 from public.school_memberships m where m.school_id = ai_insights.school_id
  and m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'));

commit;

-- IMPORTANT IMPLEMENTATION NOTES:
-- 1) The FastAPI service must independently validate Supabase JWTs and enforce RBAC.
-- 2) Do not expose SUPABASE_SERVICE_ROLE_KEY to the browser. If FastAPI uses it, every
--    endpoint must perform its own authorization before querying or mutating records.
-- 3) Membership role assignment, invitations, profile provisioning and school onboarding
--    should be performed by trusted backend/admin workflows, not self-service client writes.
-- 4) Payment amount-vs-invoice balance enforcement should be implemented transactionally
--    in a backend service or database function before accepting payment records.
-- 5) The unique attendance constraint is student + date. If the product later supports
--    multiple sessions per day, add a session identifier and revise this constraint.
-- 6) Review RLS with test users for each role before real student data is entered.