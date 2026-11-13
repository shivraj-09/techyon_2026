-- Authenticated invitees can activate only their own pending membership.
-- Applied to the Supabase project before this migration was committed.
create or replace function public.accept_school_invitation(p_school_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
    v_user_id uuid;
    v_membership_id uuid;
    v_role text;
begin
    v_user_id := auth.uid();

    if v_user_id is null then
        raise exception 'Authentication required'
            using errcode = '28000';
    end if;

    update public.school_memberships
       set status = 'active'::public.membership_status,
           updated_at = now()
     where school_id = p_school_id
       and user_id = v_user_id
       and status = 'invited'::public.membership_status
    returning id, role::text
         into v_membership_id, v_role;

    if v_membership_id is null then
        raise exception 'No pending invitation found for this school'
            using errcode = 'P0002';
    end if;

    return jsonb_build_object(
        'membership_id', v_membership_id,
        'school_id', p_school_id,
        'role', v_role,
        'status', 'active'
    );
end;
$$;

revoke all on function public.accept_school_invitation(uuid) from public;
revoke all on function public.accept_school_invitation(uuid) from anon;
grant execute on function public.accept_school_invitation(uuid) to authenticated;
