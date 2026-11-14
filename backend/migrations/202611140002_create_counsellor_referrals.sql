-- Counsellor referral intake. This migration is committed to the feature branch only;
-- it is NOT applied to the connected Supabase project.
create table if not exists public.counsellor_referrals (
    id uuid primary key default gen_random_uuid(),
    school_id uuid not null,
    student_id uuid not null references public.students(id) on delete restrict,
    class_id uuid not null references public.classes(id) on delete restrict,
    submitted_by uuid not null references auth.users(id) on delete restrict,
    category text not null check (category in ('academic', 'attendance', 'behaviour', 'wellbeing', 'peer_relationships', 'family_or_social', 'other')),
    summary text not null check (char_length(btrim(summary)) between 10 and 3000),
    urgency text not null default 'normal' check (urgency in ('low', 'normal', 'high')),
    status text not null default 'submitted' check (status in ('submitted', 'under_review', 'clarification_requested', 'accepted', 'declined', 'closed')),
    assigned_counsellor_id uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint counsellor_referrals_school_student_fk
        foreign key (student_id, school_id) references public.students(id, school_id),
    constraint counsellor_referrals_school_class_fk
        foreign key (class_id, school_id) references public.classes(id, school_id)
);

create index if not exists counsellor_referrals_school_status_created_idx
    on public.counsellor_referrals (school_id, status, created_at desc);
create index if not exists counsellor_referrals_submitter_created_idx
    on public.counsellor_referrals (school_id, submitted_by, created_at desc);
create index if not exists counsellor_referrals_student_created_idx
    on public.counsellor_referrals (school_id, student_id, created_at desc);

alter table public.counsellor_referrals enable row level security;

revoke all on public.counsellor_referrals from anon;
grant select (id, school_id, student_id, class_id, submitted_by, category, summary, urgency, status, assigned_counsellor_id, created_at, updated_at) on public.counsellor_referrals to authenticated;
grant insert (school_id, student_id, class_id, submitted_by, category, summary, urgency) on public.counsellor_referrals to authenticated;
grant update (status, assigned_counsellor_id) on public.counsellor_referrals to authenticated;

drop policy if exists counsellor_referrals_teacher_insert on public.counsellor_referrals;
create policy counsellor_referrals_teacher_insert
on public.counsellor_referrals
for insert to authenticated
with check (
    submitted_by = (select auth.uid())
    and exists (
        select 1 from public.school_memberships m
        where m.school_id = counsellor_referrals.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'teacher'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
    and exists (
        select 1 from public.class_teacher_assignments cta
        where cta.school_id = counsellor_referrals.school_id
          and cta.class_id = counsellor_referrals.class_id
          and cta.teacher_user_id = (select auth.uid())
    )
    and exists (
        select 1 from public.student_enrollments e
        where e.school_id = counsellor_referrals.school_id
          and e.class_id = counsellor_referrals.class_id
          and e.student_id = counsellor_referrals.student_id
          and e.status = 'active'
    )
);

drop policy if exists counsellor_referrals_teacher_read_own on public.counsellor_referrals;
create policy counsellor_referrals_teacher_read_own
on public.counsellor_referrals
for select to authenticated
using (
    submitted_by = (select auth.uid())
    and exists (
        select 1 from public.school_memberships m
        where m.school_id = counsellor_referrals.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'teacher'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
);

drop policy if exists counsellor_referrals_counsellor_read on public.counsellor_referrals;
create policy counsellor_referrals_counsellor_read
on public.counsellor_referrals
for select to authenticated
using (
    exists (
        select 1 from public.school_memberships m
        where m.school_id = counsellor_referrals.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
);

drop policy if exists counsellor_referrals_counsellor_update on public.counsellor_referrals;
create policy counsellor_referrals_counsellor_update
on public.counsellor_referrals
for update to authenticated
using (
    exists (
        select 1 from public.school_memberships m
        where m.school_id = counsellor_referrals.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
)
with check (
    exists (
        select 1 from public.school_memberships m
        where m.school_id = counsellor_referrals.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
    and (assigned_counsellor_id is null or assigned_counsellor_id = (select auth.uid()))
);

create or replace function public.set_counsellor_referral_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists counsellor_referrals_updated_at on public.counsellor_referrals;
create trigger counsellor_referrals_updated_at
before update on public.counsellor_referrals
for each row execute function public.set_counsellor_referral_updated_at();
