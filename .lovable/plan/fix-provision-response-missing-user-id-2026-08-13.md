# Fix "Provision response missing user_id"

## What the probe found

`POST https://claim.peoplebrowsr.com/provision_user/dotceo` (form-encoded, as the edge function already sends) responds with **HTTP 200 in all cases**, including failures, and a JSON body:

```text
bad secret : {"error": "invalid_request", "message": "Invalid secret"}
no fields  : {"error": "invalid_request", "message": "Missing required fields"}
```

So the request format is correct. Because the endpoint never returns a non-200 status, the current code skips its `!res.ok` branch, finds no `user_id` in the error JSON, and reports the generic "Provision response missing user_id" — hiding the real reason. The most likely underlying cause is the stored `PB_PROVISION_SECRET` value being wrong or not deployed to the edge function environment, but the recorded error can't distinguish that from any other endpoint-side failure.

The success-shape key name is still unconfirmed (a valid secret is needed to see a success body), so the parser should stay tolerant of several shapes.

## Changes

1. `supabase/functions/submit-vibesprint-registration/index.ts` — in `provisionUserId`:
   - Parse JSON first, then if the body carries `error`/`message`, return that message verbatim as the error (e.g. `Provision user failed: Invalid secret`) instead of the generic missing-user_id text.
   - Keep the existing multi-shape id lookup, and when no id and no error field is present, include a truncated snippet of the raw body in the error so the DB row records what actually came back.
   - Continue to never block registration on provisioning failure.

2. Re-verify `PB_PROVISION_SECRET` is set as a Supabase edge function secret for this project (Vercel env vars do not apply), and re-run one registration to read the new, specific error.

## Notes

- No frontend or schema changes; `kred_user_id` column and the `X-On-Behalf-Of` header logic stay as is.
- Deploy needed after the edit: `npx supabase functions deploy submit-vibesprint-registration`.
