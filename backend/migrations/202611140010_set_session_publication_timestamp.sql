-- Ensure session publication timestamps are server-generated on direct inserts too.
-- Feature-branch migration only; do not apply to hosted production yet.

create or replace function public.set_counselling_session_publication_timestamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.status = 'published' then
        new.published_at = now();
    else
        new.published_at = null;
    end if;
    return new;
end;
$$;

drop trigger if exists counselling_sessions_publication_timestamp on public.counselling_sessions;
create trigger counselling_sessions_publication_timestamp
before insert on public.counselling_sessions
for each row execute function public.set_counselling_session_publication_timestamp();

revoke all on function public.set_counselling_session_publication_timestamp() from public, anon, authenticated;
