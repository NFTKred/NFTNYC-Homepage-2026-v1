# Accept the `user` key from the provisioning response

## Problem

The provisioning endpoint returns the ID under a `user` key:

```text
{"user": "6a7e518b506166b5f4f2f589"}
```

The edge function only looks for `user_id` / `id` (and nested `data.*` variants), so it treats a successful response as a failure and records "Provision response missing user_id", skipping the `X-On-Behalf-Of` header.

## Change

In `supabase/functions/submit-vibesprint-registration/index.ts`, extend the ID extraction in `provisionUserId` to also accept `user` (and `data.user`), only when the value is a string. Order: `user_id`, `id`, `user`, then the same three under `data`.

Everything else stays as is: the ID is saved to `kred_user_id`, passed as `X-On-Behalf-Of` on contact creation and domain registration, and failures still never block registration.

## Note

The function must be redeployed for the fix to take effect.
