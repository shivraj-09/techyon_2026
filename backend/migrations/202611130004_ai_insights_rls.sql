-- AI insights are school-level aggregates and visible to active admins only.
alter table public.ai_insights enable row level security;

drop policy if exists ai_insights_admin_select on public.ai_insights;
create policy ai_insights_admin_select on public.ai_insights
for select to authenticated
using (
  exists (
    select 1 from public.school_memberships m
    where m.school_id = ai_insights.school_id
      and m.user_id = (select auth.uid())
      and m.role = 'admin'::public.membership_role
      and m.status = 'active'::public.membership_status
  )
);

drop policy if exists ai_insights_admin_insert on public.ai_insights;
create policy ai_insights_admin_insert on public.ai_insights
for insert to authenticated
with check (
  generated_by = (select auth.uid())
  and exists (
    select 1 from public.school_memberships m
    where m.school_id = ai_insights.school_id
      and m.user_id = (select auth.uid())
      and m.role = 'admin'::public.membership_role
      and m.status = 'active'::public.membership_status
  )
);
