# Provision Kred user_id and pass X-On-Behalf-Of

## What changes

When someone registers on /vibesprint, before creating the Kred contact and registering the domain, the system will look up (or create) the sprinter's PeopleBrowsr user account and use that account's ID when talking to the domain registrar, so the domain is created on behalf of the sprinter rather than the platform account.

## Steps

1. **New secret** — store the shared secret for the provisioning endpoint as `PB_PROVISION_SECRET` (Supabase edge function secret). Requested via the secure secret form; never in code.

2. **Migration** `supabase/migrations/20260813_vibesprint_user_id.sql`
   - `ALTER TABLE public.vibesprint_registrations ADD COLUMN IF NOT EXISTS kred_user_id text;`
   - Applied manually via SQL as per project convention.

3. **Edge function** `supabase/functions/submit-vibesprint-registration/index.ts`
   - Add `provisionUser(email)`: POST to `https://claim.peoplebrowsr.com/provision_user/dotceo` with `email` and `secret`, parse the returned user id (accepting `user_id` / `id` / `data.user_id` shapes), log status and body with the secret redacted.
   - Call it after the registration row is inserted, before `registerKredDomain`.
   - Persist the value into `kred_user_id` on the row.
   - Pass the id into `registerKredDomain` and add `X-On-Behalf-Of: <user_id>` to the shared `headers` object used by both `POST /contacts` and `POST /domains/{fqdn}/register`.
   - If provisioning fails or returns no id: skip the header (calls proceed as today), record the reason in `registration_error`, and continue — registration is never blocked by the lookup.

4. **Notification email** — add a "Kred user ID" row so the value is visible per registration.

## Notes

- No frontend changes; the form payload is unchanged.
- DNS provisioning and the availability check path are untouched.
