-- Confidential counselling cases and append-only case notes.
-- Committed to feature/counsellor-backend only; not applied to hosted Supabase.
alter table public.counsellor_referrals
    add constraint counsellor_referrals_id_school_id_key unique (id, school_id);

create table if not exists public.counselling_cases (
    id uuid primary key default gen_random_uuid(),
    school_id uuid not null,
    student_id uuid not null,
    referral_id uuid not null,
    assigned_counsellor_id uuid not null references auth.users(id) on delete restrict,
    status text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
    opened_at timestamptz not null default now(),
    closed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint counselling_cases_school_student_fk
        foreign key (student_id, school_id) references public.students(id, school_id),
    constraint counselling_cases_referral_fk
        foreign key (referral_id, school_id) references public.counsellor_referrals(id, school_id),
    constraint counselling_cases_closed_at_check
        check ((status = 'closed' and closed_at is not null) or (status <> 'closed' and closed_at is null)),
    constraint counselling_cases_one_per_referral unique (referral_id)
);

create index if not exists counselling_cases_school_assignee_idx
    on public.counselling_cases (school_id, assigned_counsellor_id, status, opened_at desc);
create index if not exists counselling_cases_school_student_idx
    on public.counselling_cases (school_id, student_id, opened_at desc);

create table if not exists public.counselling_case_notes (
    id uuid primary key default gen_random_uuid(),
    case_id uuid not null references public.counselling_cases(id) on delete restrict,
    author_user_id uuid not null references auth.users(id) on delete restrict,
    note_body text not null check (char_length(btrim(note_body)) between 1 and 10000),
    created_at timestamptz not null default now()
);

create index if not exists counselling_case_notes_case_created_idx
    on public.counselling_case_notes (case_id, created_at asc);

alter table public.counselling_cases enable row level security;
alter table public.counselling_case_notes enable row level security;

revoke all on public.counselling_cases from anon;
revoke all on public.counselling_case_notes from anon;
grant select on public.counselling_cases to authenticated;
grant insert (school_id, student_id, referral_id, assigned_counsellor_id) on public.counselling_cases to authenticated;
grant update (status) on public.counselling_cases to authenticated;
grant select, insert on public.counselling_case_notes to authenticated;

drop policy if exists counselling_cases_counsellor_select on public.counselling_cases;
create policy counselling_cases_counsellor_select
on public.counselling_cases for select to authenticated
using (
    assigned_counsellor_id = (select auth.uid())
    and exists (
        select 1 from public.school_memberships m
        where m.school_id = counselling_cases.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
);

drop policy if exists counselling_cases_counsellor_insert on public.counselling_cases;
create policy counselling_cases_counsellor_insert
on public.counselling_cases for insert to authenticated
with check (
    assigned_counsellor_id = (select auth.uid())
    and exists (
        select 1 from public.school_memberships m
        where m.school_id = counselling_cases.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
    and exists (
        select 1 from public.counsellor_referrals r
        where r.id = counselling_cases.referral_id
          and r.school_id = counselling_cases.school_id
          and r.student_id = counselling_cases.student_id
          and r.status = 'accepted'
          and r.assigned_counsellor_id = (select auth.uid())
    )
);

drop policy if exists counselling_cases_counsellor_update on public.counselling_cases;
create policy counselling_cases_counsellor_update
on public.counselling_cases for update to authenticated
using (
    assigned_counsellor_id = (select auth.uid())
    and exists (
        select 1 from public.school_memberships m
        where m.school_id = counselling_cases.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
)
with check (
    assigned_counsellor_id = (select auth.uid())
    and exists (
        select 1 from public.school_memberships m
        where m.school_id = counselling_cases.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
);

drop policy if exists counselling_case_notes_counsellor_select on public.counselling_case_notes;
create policy counselling_case_notes_counsellor_select
on public.counselling_case_notes for select to authenticated
using (
    exists (
        select 1 from public.counselling_cases c
        join public.school_memberships m
          on m.school_id = c.school_id
         and m.user_id = (select auth.uid())
         and m.role = 'counsellor'::public.membership_role
         and m.status = 'active'::public.membership_status
        where c.id = counselling_case_notes.case_id
          and c.assigned_counsellor_id = (select auth.uid())
    )
);

drop policy if exists counselling_case_notes_counsellor_insert on public.counselling_case_notes;
create policy counselling_case_notes_counsellor_insert
on public.counselling_case_notes for insert to authenticated
with check (
    author_user_id = (select auth.uid())
    and exists (
        select 1 from public.counselling_cases c
        join public.school_memberships m
          on m.school_id = c.school_id
         and m.user_id = (select auth.uid())
         and m.role = 'counsellor'::public.membership_role
         and m.status = 'active'::public.membership_status
        where c.id = counselling_case_notes.case_id
          and c.assigned_counsellor_id = (select auth.uid())
          and c.status <> 'closed'
    )
);

create or replace function public.set_counselling_case_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    if new.status = 'closed' and old.status <> 'closed' then
        new.closed_at = now();
    elsif new.status <> 'closed' then
        new.closed_at = null;
    end if;
    return new;
end;
$$;

drop trigger if exists counselling_cases_updated_at on public.counselling_cases;
create trigger counselling_cases_updated_at
before update on public.counselling_cases
for each row execute function public.set_counselling_case_updated_at();
