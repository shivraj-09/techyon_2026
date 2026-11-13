-- Student Voice: pseudonymous conversations with a separately protected identity map.
-- This migration is committed to the feature branch only; it is NOT applied to hosted Supabase.

create table if not exists public.student_voice_student_links (
    id uuid primary key default gen_random_uuid(),
    school_id uuid not null,
    student_id uuid not null,
    student_user_id uuid not null references auth.users(id) on delete restrict,
    status text not null default 'active' check (status in ('active', 'revoked')),
    linked_by uuid not null references auth.users(id) on delete restrict,
    created_at timestamptz not null default now(),
    constraint student_voice_links_school_student_fk
        foreign key (school_id, student_id) references public.students(school_id, id),
    constraint student_voice_links_one_student unique (school_id, student_id),
    constraint student_voice_links_one_user unique (school_id, student_user_id)
);

create table if not exists public.student_voice_conversations (
    id uuid primary key default gen_random_uuid(),
    school_id uuid not null,
    student_user_id uuid not null references auth.users(id) on delete restrict,
    public_ref text not null unique default ('SV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
    status text not null default 'open' check (status in ('open', 'closed')),
    assigned_counsellor_id uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    last_message_at timestamptz,
    constraint student_voice_conversations_school_id_id_key unique (school_id, id)
);

create table if not exists public.student_voice_messages (
    id uuid primary key default gen_random_uuid(),
    school_id uuid not null,
    conversation_id uuid not null,
    sender_kind text not null check (sender_kind in ('student', 'counsellor')),
    sender_user_id uuid not null references auth.users(id) on delete restrict,
    body text not null check (char_length(btrim(body)) between 1 and 5000),
    created_at timestamptz not null default now(),
    read_at timestamptz,
    constraint student_voice_messages_conversation_fk
        foreign key (school_id, conversation_id)
        references public.student_voice_conversations(school_id, id)
        on delete restrict
);

create table if not exists public.student_voice_meeting_requests (
    id uuid primary key default gen_random_uuid(),
    school_id uuid not null,
    conversation_id uuid not null,
    requested_by uuid not null references auth.users(id) on delete restrict,
    preferred_times text not null check (char_length(btrim(preferred_times)) between 1 and 2000),
    student_message text check (student_message is null or char_length(student_message) <= 2000),
    status text not null default 'pending' check (status in ('pending', 'approved', 'declined', 'completed', 'cancelled')),
    handled_by uuid references auth.users(id) on delete restrict,
    handled_at timestamptz,
    created_at timestamptz not null default now(),
    constraint student_voice_meeting_conversation_fk
        foreign key (school_id, conversation_id)
        references public.student_voice_conversations(school_id, id)
        on delete restrict
);

create index if not exists student_voice_conversations_school_created_idx
    on public.student_voice_conversations (school_id, status, last_message_at desc);
create index if not exists student_voice_conversations_student_idx
    on public.student_voice_conversations (school_id, student_user_id, created_at desc);
create index if not exists student_voice_messages_conversation_idx
    on public.student_voice_messages (school_id, conversation_id, created_at asc);
create index if not exists student_voice_meetings_conversation_idx
    on public.student_voice_meeting_requests (school_id, conversation_id, created_at desc);

alter table public.student_voice_student_links enable row level security;
alter table public.student_voice_conversations enable row level security;
alter table public.student_voice_messages enable row level security;
alter table public.student_voice_meeting_requests enable row level security;

revoke all on public.student_voice_student_links from anon;
revoke all on public.student_voice_conversations from anon;
revoke all on public.student_voice_messages from anon;
revoke all on public.student_voice_meeting_requests from anon;

grant select (id, school_id, student_id, student_user_id, status, linked_by, created_at),
      insert (school_id, student_id, student_user_id, linked_by),
      update (status) on public.student_voice_student_links to authenticated;
grant select (id, school_id, public_ref, status, assigned_counsellor_id, created_at, last_message_at),
      insert (school_id, student_user_id),
      update (status, assigned_counsellor_id) on public.student_voice_conversations to authenticated;
grant select (id, school_id, conversation_id, sender_kind, body, created_at, read_at),
      insert (school_id, conversation_id, sender_kind, sender_user_id, body)
      on public.student_voice_messages to authenticated;
grant select (id, school_id, conversation_id, preferred_times, student_message, status, handled_by, handled_at, created_at),
      insert (school_id, conversation_id, requested_by, preferred_times, student_message),
      update (status, handled_by, handled_at) on public.student_voice_meeting_requests to authenticated;

-- A school admin may create/revoke account links; the linked student account can read its own link.
drop policy if exists student_voice_links_admin_manage on public.student_voice_student_links;
create policy student_voice_links_admin_manage on public.student_voice_student_links
for all to authenticated
using (
    exists (
        select 1 from public.school_memberships m
        where m.school_id = student_voice_student_links.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'admin'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
)
with check (
    linked_by = (select auth.uid())
    and exists (
        select 1 from public.school_memberships m
        where m.school_id = student_voice_student_links.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'admin'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
);

drop policy if exists student_voice_links_student_read on public.student_voice_student_links;
create policy student_voice_links_student_read on public.student_voice_student_links
for select to authenticated
using (student_user_id = (select auth.uid()) and status = 'active');

-- The student sees their own pseudonymous conversation. Counsellors see conversations in their school.
drop policy if exists student_voice_conversations_student_select on public.student_voice_conversations;
create policy student_voice_conversations_student_select on public.student_voice_conversations
for select to authenticated
using (student_user_id = (select auth.uid()));

drop policy if exists student_voice_conversations_student_insert on public.student_voice_conversations;
create policy student_voice_conversations_student_insert on public.student_voice_conversations
for insert to authenticated
with check (
    student_user_id = (select auth.uid())
    and exists (
        select 1 from public.student_voice_student_links l
        where l.school_id = student_voice_conversations.school_id
          and l.student_user_id = (select auth.uid())
          and l.status = 'active'
    )
);

drop policy if exists student_voice_conversations_counsellor_select on public.student_voice_conversations;
create policy student_voice_conversations_counsellor_select on public.student_voice_conversations
for select to authenticated
using (
    exists (
        select 1 from public.school_memberships m
        where m.school_id = student_voice_conversations.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
);

drop policy if exists student_voice_conversations_counsellor_update on public.student_voice_conversations;
create policy student_voice_conversations_counsellor_update on public.student_voice_conversations
for update to authenticated
using (
    exists (
        select 1 from public.school_memberships m
        where m.school_id = student_voice_conversations.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
)
with check (
    exists (
        select 1 from public.school_memberships m
        where m.school_id = student_voice_conversations.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
);

drop policy if exists student_voice_messages_student_read on public.student_voice_messages;
create policy student_voice_messages_student_read on public.student_voice_messages
for select to authenticated
using (
    exists (
        select 1 from public.student_voice_conversations c
        where c.id = student_voice_messages.conversation_id
          and c.school_id = student_voice_messages.school_id
          and c.student_user_id = (select auth.uid())
    )
);

drop policy if exists student_voice_messages_counsellor_read on public.student_voice_messages;
create policy student_voice_messages_counsellor_read on public.student_voice_messages
for select to authenticated
using (
    exists (
        select 1 from public.student_voice_conversations c
        join public.school_memberships m
          on m.school_id = c.school_id
         and m.user_id = (select auth.uid())
         and m.role = 'counsellor'::public.membership_role
         and m.status = 'active'::public.membership_status
        where c.id = student_voice_messages.conversation_id
          and c.school_id = student_voice_messages.school_id
    )
);

drop policy if exists student_voice_messages_participant_insert on public.student_voice_messages;
create policy student_voice_messages_participant_insert on public.student_voice_messages
for insert to authenticated
with check (
    sender_user_id = (select auth.uid())
    and exists (
        select 1 from public.student_voice_conversations c
        where c.id = student_voice_messages.conversation_id
          and c.school_id = student_voice_messages.school_id
          and c.status = 'open'
          and (
              (student_voice_messages.sender_kind = 'student' and c.student_user_id = (select auth.uid()))
              or (
                  student_voice_messages.sender_kind = 'counsellor'
                  and exists (
                      select 1 from public.school_memberships m
                      where m.school_id = c.school_id
                        and m.user_id = (select auth.uid())
                        and m.role = 'counsellor'::public.membership_role
                        and m.status = 'active'::public.membership_status
                  )
              )
          )
    )
);

-- Meeting requests are visible to the student who requested them and counsellors in that school.
drop policy if exists student_voice_meetings_student_select on public.student_voice_meeting_requests;
create policy student_voice_meetings_student_select on public.student_voice_meeting_requests
for select to authenticated
using (requested_by = (select auth.uid()));

drop policy if exists student_voice_meetings_counsellor_select on public.student_voice_meeting_requests;
create policy student_voice_meetings_counsellor_select on public.student_voice_meeting_requests
for select to authenticated
using (
    exists (
        select 1 from public.school_memberships m
        where m.school_id = student_voice_meeting_requests.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
);

drop policy if exists student_voice_meetings_student_insert on public.student_voice_meeting_requests;
create policy student_voice_meetings_student_insert on public.student_voice_meeting_requests
for insert to authenticated
with check (
    requested_by = (select auth.uid())
    and exists (
        select 1 from public.student_voice_conversations c
        where c.id = student_voice_meeting_requests.conversation_id
          and c.school_id = student_voice_meeting_requests.school_id
          and c.student_user_id = (select auth.uid())
          and c.status = 'open'
    )
);

drop policy if exists student_voice_meetings_counsellor_update on public.student_voice_meeting_requests;
create policy student_voice_meetings_counsellor_update on public.student_voice_meeting_requests
for update to authenticated
using (
    exists (
        select 1 from public.school_memberships m
        where m.school_id = student_voice_meeting_requests.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
)
with check (
    handled_by = (select auth.uid())
    and status in ('approved', 'declined', 'completed')
    and exists (
        select 1 from public.school_memberships m
        where m.school_id = student_voice_meeting_requests.school_id
          and m.user_id = (select auth.uid())
          and m.role = 'counsellor'::public.membership_role
          and m.status = 'active'::public.membership_status
    )
);

-- Identity map is separate and hidden from counsellors until a meeting request is approved.
drop policy if exists student_voice_links_identity_student_read on public.student_voice_student_links;
create policy student_voice_links_identity_student_read on public.student_voice_student_links
for select to authenticated
using (student_user_id = (select auth.uid()) and status = 'active');

drop policy if exists student_voice_links_counsellor_reveal on public.student_voice_student_links;
create policy student_voice_links_counsellor_reveal on public.student_voice_student_links
for select to authenticated
using (
    status = 'active'
    and exists (
        select 1
        from public.student_voice_conversations c
        join public.student_voice_meeting_requests mr
          on mr.school_id = c.school_id
         and mr.conversation_id = c.id
         and mr.status = 'approved'
        join public.school_memberships m
          on m.school_id = c.school_id
         and m.user_id = (select auth.uid())
         and m.role = 'counsellor'::public.membership_role
         and m.status = 'active'::public.membership_status
        where c.school_id = student_voice_student_links.school_id
          and c.student_user_id = student_voice_student_links.student_user_id
    )
);

create or replace function public.set_student_voice_last_message_at()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
    update public.student_voice_conversations
       set last_message_at = new.created_at
     where id = new.conversation_id and school_id = new.school_id;
    return new;
end;
$$;

drop trigger if exists student_voice_message_last_message on public.student_voice_messages;
create trigger student_voice_message_last_message after insert on public.student_voice_messages
for each row execute function public.set_student_voice_last_message_at();

revoke all on function public.set_student_voice_last_message_at() from public, anon, authenticated;
