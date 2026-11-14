# Recovered canonical schema snapshots

These three SQL files were recovered read-only from the project's hosted Supabase migration history table (`supabase_migrations.schema_migrations`). They are the original recorded statements for:

- `20261113075326_edusync_initial_schema`
- `20261113075340_edusync_schema_hardening`
- `20261113075415_edusync_api_privilege_hardening`

They contain schema and policy DDL only; no user or school rows were exported.

## Important: do not apply from this directory

These are source-of-truth recovery snapshots, not yet the active migration chain. The existing repository migrations use earlier, shorter timestamps (for example `202611130001_...`) than the recovered baseline timestamps. Supabase applies migrations in timestamp order, so moving these files into an active migration directory without reconciling and renumbering the repository history would cause feature migrations to run before their dependencies.

Before enabling `supabase db push` or preview-branch migrations:
1. Reconcile the repository's existing migration filenames with the four already-applied remote versions.
2. Confirm the local atomic-fee-payment migration matches the remote `20261113170644` entry (the function body and grants were reviewed; differences are formatting/comments).
3. Place the complete ordered migration chain in the standard `supabase/migrations` directory and test a fresh local reset.
4. Keep hosted production unchanged until the local migration chain and RLS tests pass.

The hosted project was queried read-only. No migrations or data changes were applied.
