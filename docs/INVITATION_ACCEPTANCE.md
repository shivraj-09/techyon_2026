# Invitation acceptance flow

## Admin invitation

An active school admin calls:

`POST /api/v1/schools/{school_id}/members/invite`

The invited membership is created with status `invited`.

## Invitee acceptance

1. The invitee receives the Supabase Auth invitation email.
2. They follow the invite link and complete the Supabase confirmation/password flow.
3. The frontend must complete the Supabase callback and establish a session.
4. With the invitee's own access token, call:

`POST /api/v1/schools/{school_id}/members/accept`

No request body is required. The backend checks that the access token belongs to an email-confirmed user, then calls the `accept_school_invitation` database function using that user's JWT.

The database function obtains the user ID from `auth.uid()`; callers cannot supply a different user ID or role. It changes only that user's matching `invited` membership to `active`. It cannot activate another user's membership or change roles.

After acceptance, the invitee can call:

`GET /api/v1/auth/memberships`

and should see the newly active membership.

## Current frontend dependency

The frontend has not yet been built. The invitation acceptance page/callback still needs to be implemented so the invite link can establish a browser session and call the acceptance endpoint. Until then, the backend endpoint can be tested with an access token belonging to the invited user after Supabase invite confirmation.
