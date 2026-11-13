-- Trigger functions are invoked by their attached triggers, not through the Data API.
-- Remove direct RPC execution from untrusted/public client roles while preserving
-- the existing triggers and owner/service-role privileges.
REVOKE EXECUTE ON FUNCTION public.create_announcement_notifications()
    FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.sync_fee_invoice_status()
    FROM PUBLIC, anon, authenticated;
