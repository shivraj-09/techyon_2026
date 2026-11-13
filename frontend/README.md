# EduSync frontend prototype

A minimal Next.js App Router scaffold for backend integration and frontend-team handoff.

## Setup

- Install Node.js 20.9+ (Node 22 LTS recommended).
- Copy `.env.example` to `.env.local` and set the Supabase project URL, publishable key and FastAPI URL.
- From this directory run `npm install`, then `npm run dev`.
- Open http://localhost:3000.

## Included

- Landing page
- Supabase email/password login
- Invitation callback at `/auth/accept-invite` (supports PKCE `code` and invite `token_hash` links)
- Reads the signed-in user's pending memberships under RLS and calls FastAPI to accept them
- Minimal dashboard listing active memberships and sign-out

Only public Supabase URL and publishable key belong in this frontend. Never add the Supabase secret key here.

This is an integration scaffold, not final product UI. Frontend developers can replace the design while preserving Supabase session handling, invitation callback behavior and API contracts.
