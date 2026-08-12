# Fix missing NFT images in the homepage activity feed

## What's happening

The "Start Collecting" live activity feed on the homepage falls back to a blank grey square for most rows instead of showing the artwork.

Confirmed by calling the live feed API: each message only sometimes carries a full `nft` object. In many rows `nft` is just a numeric ID, so the code's lookup of `nft.back / nft.front / nft.image` returns nothing and the empty placeholder renders. The artwork URL is still present on those rows — it lives under `data.batch.back` (and `data.batch.face`), which the current code never reads.

Contributor names have the same gap: they are read only from `nft.contributor_details.name`, which is missing on the numeric-`nft` rows.

## The fix

In `src/components/SeeWhatsOnTheMap.tsx`, in `normalizeMessages`:

- Only treat `nft` as an object when it actually is one (guard against the numeric-ID form).
- Resolve the image with a fallback chain: `nft.back -> nft.front -> nft.image -> data.batch.back -> data.batch.face`.
- Resolve the contributor from `nft.contributor_details.name`, falling back to the batch data when absent, then null.
- Extend the `RawMessage` type to describe `data.batch` and the numeric `nft` case.

No layout, styling, or copy changes; the existing `onError` hide-on-broken-image behaviour stays as the last line of defence.

## Verification

Load `/` and confirm feed rows show artwork thumbnails rather than blank squares.