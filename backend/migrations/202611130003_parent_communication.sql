-- Parent communication RLS and announcement notification fan-out.
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;

drop policy if exists announcements_select_audience on public.announcements;
create policy announcements_select_audience on public.announcements
for select to authenticated using (
  exists (
    select 1 from public.school_memberships m
    where m.school_id = announcements.school_id and m.user_id = (select auth.uid())
      and m.status = 'active'::public.membership_status
      and (
        m.role = 'admin'::public.membership_role
        or announcements.audience = 'school'::public.announcement_audience
        or (announcements.audience = 'parents'::public.announcement_audience and m.role = 'parent'::public.membership_role)
        or (announcements.audience = 'teachers'::public.announcement_audience and m.role = 'teacher'::public.membership_role)
        or (announcements.audience = 'class'::public.announcement_audience and (
          exists (select 1 from public.class_teacher_assignments cta where cta.school_id=announcements.school_id and cta.class_id=announcements.class_id and cta.teacher_user_id=m.user_id)
          or exists (
            select 1 from public.student_guardians sg
            join public.student_enrollments se on se.student_id=sg.student_id and se.school_id=sg.school_id
            where sg.school_id=announcements.school_id and sg.guardian_user_id=m.user_id
              and se.class_id=announcements.class_id and se.status='active'
          )
        ))
      )
  )
);

drop policy if exists announcements_admin_insert on public.announcements;
create policy announcements_admin_insert on public.announcements
for insert to authenticated with check (
  created_by=(select auth.uid())
  and exists (select 1 from public.school_memberships m where m.school_id=announcements.school_id and m.user_id=(select auth.uid()) and m.role='admin'::public.membership_role and m.status='active'::public.membership_status)
  and (class_id is null or exists(select 1 from public.classes c where c.id=announcements.class_id and c.school_id=announcements.school_id))
);

drop policy if exists announcements_admin_update on public.announcements;
create policy announcements_admin_update on public.announcements
for update to authenticated
using (exists(select 1 from public.school_memberships m where m.school_id=announcements.school_id and m.user_id=(select auth.uid()) and m.role='admin'::public.membership_role and m.status='active'::public.membership_status))
with check (exists(select 1 from public.school_memberships m where m.school_id=announcements.school_id and m.user_id=(select auth.uid()) and m.role='admin'::public.membership_role and m.status='active'::public.membership_status));

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
for select to authenticated using (
  recipient_user_id=(select auth.uid())
  and exists(select 1 from public.school_memberships m where m.school_id=notifications.school_id and m.user_id=(select auth.uid()) and m.status='active'::public.membership_status)
);

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
for update to authenticated using (recipient_user_id=(select auth.uid()))
with check (recipient_user_id=(select auth.uid()));

create or replace function public.create_announcement_notifications()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.notifications(school_id,recipient_user_id,title,body,type,related_announcement_id)
  select new.school_id,m.user_id,new.title,new.body,'announcement'::public.notification_type,new.id
  from public.school_memberships m
  where m.school_id=new.school_id and m.status='active'::public.membership_status
    and m.user_id<>new.created_by
    and (
      new.audience='school'::public.announcement_audience
      or (new.audience='parents'::public.announcement_audience and m.role='parent'::public.membership_role)
      or (new.audience='teachers'::public.announcement_audience and m.role='teacher'::public.membership_role)
      or (new.audience='class'::public.announcement_audience and (
        exists(select 1 from public.class_teacher_assignments cta where cta.school_id=new.school_id and cta.class_id=new.class_id and cta.teacher_user_id=m.user_id)
        or exists(
          select 1 from public.student_guardians sg
          join public.student_enrollments se on se.student_id=sg.student_id and se.school_id=sg.school_id
          where sg.school_id=new.school_id and sg.guardian_user_id=m.user_id and se.class_id=new.class_id and se.status='active'
        )
      ))
    );
  return new;
end;
$$;

drop trigger if exists trg_announcement_notification_fanout on public.announcements;
create trigger trg_announcement_notification_fanout after insert on public.announcements
for each row execute function public.create_announcement_notifications();
