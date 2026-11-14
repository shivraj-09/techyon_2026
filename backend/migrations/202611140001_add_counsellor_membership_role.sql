-- Add counsellor as a first-class school membership role.
-- Keep this migration isolated: PostgreSQL enum additions must commit
-- before later migrations or transactions use the new enum value.
ALTER TYPE public.membership_role ADD VALUE IF NOT EXISTS 'counsellor';
