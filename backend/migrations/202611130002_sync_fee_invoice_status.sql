-- Keep invoice status synchronized with successful payment totals.
-- Applied to Supabase project edusync-techyon (Singapore).

create or replace function public.sync_fee_invoice_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    target_invoice_id uuid;
    target_school_id uuid;
    invoice_record public.fee_invoices%rowtype;
    total_paid numeric(12,2);
    next_status public.invoice_status;
begin
    if tg_op = 'DELETE' then
        target_invoice_id := old.invoice_id;
        target_school_id := old.school_id;
    else
        target_invoice_id := new.invoice_id;
        target_school_id := new.school_id;
    end if;

    select *
    into invoice_record
    from public.fee_invoices
    where id = target_invoice_id
      and school_id = target_school_id;

    if not found then
        if tg_op = 'DELETE' then return old; else return new; end if;
    end if;

    select coalesce(
        sum(amount) filter (where status = 'successful'::public.payment_status),
        0
    )::numeric(12,2)
    into total_paid
    from public.fee_payments
    where invoice_id = target_invoice_id
      and school_id = target_school_id;

    if invoice_record.status in ('draft'::public.invoice_status, 'cancelled'::public.invoice_status) then
        next_status := invoice_record.status;
    elsif total_paid >= invoice_record.amount_due then
        next_status := 'paid'::public.invoice_status;
    elsif total_paid > 0 then
        next_status := 'partially_paid'::public.invoice_status;
    elsif invoice_record.due_date < current_date then
        next_status := 'overdue'::public.invoice_status;
    else
        next_status := 'issued'::public.invoice_status;
    end if;

    update public.fee_invoices
    set status = next_status,
        updated_at = now()
    where id = target_invoice_id
      and school_id = target_school_id;

    if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

drop trigger if exists trg_sync_fee_invoice_status on public.fee_payments;

create trigger trg_sync_fee_invoice_status
after insert or update or delete on public.fee_payments
for each row
execute function public.sync_fee_invoice_status();

-- Reconcile existing invoice statuses with their current successful payments.
update public.fee_invoices i
set status = case
    when i.status in ('draft'::public.invoice_status, 'cancelled'::public.invoice_status) then i.status
    when coalesce(p.total_paid, 0) >= i.amount_due then 'paid'::public.invoice_status
    when coalesce(p.total_paid, 0) > 0 then 'partially_paid'::public.invoice_status
    when i.due_date < current_date then 'overdue'::public.invoice_status
    else 'issued'::public.invoice_status
end,
updated_at = now()
from (
    select i2.id, i2.school_id,
           coalesce(sum(fp.amount) filter (where fp.status = 'successful'::public.payment_status), 0)::numeric(12,2) as total_paid
    from public.fee_invoices i2
    left join public.fee_payments fp
      on fp.invoice_id = i2.id and fp.school_id = i2.school_id
    group by i2.id, i2.school_id
) p
where i.id = p.id and i.school_id = p.school_id;
