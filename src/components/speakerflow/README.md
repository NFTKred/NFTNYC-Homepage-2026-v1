# Speaker submission flow (transferred, unrouted)

Ported from OneHub / Collect.NFT.NYC (`15dbaae1-b109-4174-9fac-75a539e826d9`)
per `docs/speaker-flow-transfer-manifest.md`.

**Deliberately unreachable:** no route in `src/App.tsx`, no nav entry. Entry
point is `SpeakerSubmissionFlow.tsx`; we'll adapt it into the vibesprint
registration next.

## What was carried across

| File | Origin |
|---|---|
| `SpeakerDerivativesSetupPanel.tsx` | `minting/SpeakerDerivativesSetupPanel.tsx` (mint refs removed) |
| `SpeakerPoSPreviewPanel.tsx` | `minting/previews/SpeakerPoSPreviewPanel.tsx` (verbatim) |
| `ImageCropModal.tsx` | `minting/ImageCropModal.tsx` (verbatim, needs `react-easy-crop`) |
| `canvases/*` + `canvases/assets/*` | `minting/canvases/*` (verbatim) |
| `kredentials/PagePreview.tsx` | `components/kredentials/PagePreview.tsx` (verbatim) |
| `src/lib/speakerflow/*` | trimmed port of `src/lib/api/core.ts`, `profile.ts`, `hubSettings.ts`, `kredentials.ts`, `pyntw.ts`, `lib/media.ts` |

## Deliberate omissions

- **No token minting.** `mintCoin` / `extractMintedCoin` / `postMintActions`
  and the `MintingFlow` step machine were not carried across. The PoS step is
  a plain profile form plus the preview card.
- `ImageUploadField.tsx` is a local replacement for OneHub's hub-settings
  field (crop → `uploadFormBlob` → hosted URL).

## Added for this project

- `KredentialsSetupPanel.tsx` — checks `.kred` availability
  (`/domain/find`), registers via `/quick_kred/dotceo`, and renders
  `PagePreview` for the resulting Kredentials page.

## Backend

Everything talks to the legacy platform API (`api.nftplatform.tech`,
`claim.peoplebrowsr.com`). No Supabase tables or edge functions are involved.
Authenticated calls need a platform token on `window.token`; otherwise the
guest token is used.