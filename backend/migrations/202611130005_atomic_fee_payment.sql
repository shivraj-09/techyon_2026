-- Record a fee payment atomically to prevent concurrent overpayments.
-- The invoice row lock serializes payment attempts for the same invoice.
create or replace function public.record_fee_payment(
    p_school_id uuid,
    p_invoice_id uuid,
    p_amount numeric,
    p_payment_method text,
    p_reference_number text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
    v_user_id uuid;
    v_invoice public.fee_invoices%rowtype;
    v_payment public.fee_payments%rowtype;
    v_total_paid numeric(12,2);
    v_outstanding numeric(12,2);
    v_result jsonb;
begin
    v_user_id := auth.uid();

    if v_user_id is null then
        raise exception 'Authentication required' using errcode = '28000';
    end if;

    if not exists (
        select 1
        from public.school_memberships m
        where m.school_id = p_school_id
          and m.user_id = v_user_id
          and m.role = 'admin'::public.membership_role
          and m.status = 'active'::public.membership_status
    ) then
        raise exception 'Active school admin membership required' using errcode = '42501';
    end if;

    if p_amount is null or p_amount <= 0 then
        raise exception 'Payment amount must be greater than zero' using errcode = '22023';
    end if;

    if p_payment_method not in ('cash', 'upi', 'bank_transfer', 'card', 'cheque', 'other') then
        raise exception 'Invalid payment method' using errcode = '22023';
    end if;

    select *
      into v_invoice
      from public.fee_invoices
     where id = p_invoice_id
       and school_id = p_school_id
     for update;

    if not found then
        raise exception 'Invoice not found in this school' using errcode = 'P0002';
    end if;

    if v_invoice.status in ('draft'::public.invoice_status, 'cancelled'::public.invoice_status) then
        raise exception 'Payments cannot be recorded for this invoice' using errcode = '22023';
    end if;

    select coalesce(sum(fp.amount), 0)::numeric(12,2)
      into v_total_paid
      from public.fee_payments fp
     where fp.invoice_id = p_invoice_id
       and fp.school_id = p_school_id
       and fp.status = 'successful'::public.payment_status;

    v_outstanding := v_invoice.amount_due - v_total_paid;

    if v_outstanding <= 0 then
        raise exception 'Invoice has no outstanding balance' using errcode = '23514';
    end if;

    if p_amount > v_outstanding then
        raise exception 'Payment exceeds outstanding balance' using errcode = '23514';
    end if;

    v_payment := jsonb_populate_record(
        null::public.fee_payments,
        jsonb_build_object(
            'school_id', p_school_id,
            'invoice_id', p_invoice_id,
            'amount', p_amount,
            'payment_method', p_payment_method,
            'reference_number', nullif(btrim(p_reference_number), ''),
            'status', 'successful',
            'recorded_by', v_user_id
        )
    );

    insert into public.fee_payments (
        school_id, invoice_id, amount, payment_method,
        reference_number, status, recorded_by
    )
    values (
        v_payment.school_id, v_payment.invoice_id, v_payment.amount,
        v_payment.payment_method, v_payment.reference_number,
        'successful'::public.payment_status, v_user_id
    )
    returning * into v_payment;

    v_result := to_jsonb(v_payment);
    return v_result;
end;
$$;

revoke all on function public.record_fee_payment(uuid, uuid, numeric, text, text) from public;
revoke all on function public.record_fee_payment(uuid, uuid, numeric, text, text) from anon;
grant execute on function public.record_fee_payment(uuid, uuid, numeric, text, text) to authenticated;
