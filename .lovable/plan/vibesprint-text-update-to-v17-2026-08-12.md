# /vibesprint text update to v17

Update the copy on `/vibesprint` to match the v17 master document, while keeping every prior editorial removal in place. No form fields, validation, submit handler, or edge-function behaviour changes.

## What changes

**Hero**
- Sub-heading rewritten to the "Kred is requesting our digital creators design the next generation of domain search" wording, with audience rounds opening Mondays 4:00pm ET starting 17 August.
- Badges: "Registration open now" and "Sprint 1 Round 1 · Mon 17 – Wed 19 Aug · Opens 4:00pm ET".
- CTA note keeps "Sprint 1 kit" naming (not "dev kit") and adds sponsored Lovable workspace credits.

**Why Now**
- Adds the identity line: every digital creator should have a .Kred name, and every .Kred domain becomes its owner's AI-optimized story.

**New section: The Prize**
- Two-year acknowledgment for the top three designs, three tiles (credit live / design deployed / name cited), the 180,000+ member promotion line, and the CC BY 4.0 open-licence note linking the Participation Terms.

**Meet Kred**
- "domain and identity APIs" now links to api.Domains.Kred/docs; the ask is reframed as "design the next generation of domain search".

**The Three Sprints**
- Intro line about audience rounds.
- Sprint 1: R1 Mon 17–Wed 19 Aug (NFT.NYC creators), R2 Mon 24–26 Aug (NamePros); chip "Registration open now".
- Sprint 2: R1 Mon 24–26 Aug; brief publishes Thu 20 Aug.
- Sprint 3: R1 Mon 31 Aug – Wed 2 Sep (Hugging Face + NFT.NYC creators); brief publishes Thu 27 Aug.
- Closing note updated for Sprint 3 running through the conference, minus the "every submission appears in the reel" line (kept removed per your earlier ruling).

**Features section**
- Stays **Five Features** — DNS ENS Tokenization is not reintroduced. Only wording refreshes within the existing five tiles.

**Example apps**
- New paragraph: Vibe Sprint Workspace invite with 100 free credits, 15 credits via referral link for building outside it.
- New paragraph: five-step zero-code remix with the shared Stripe account, linking kred-digitalcreator-demo.lovable.app/how-to-remix.
- Visual Domain Search caption updated to the v17 text (three Kredentials Lander previews, gallery link).
- "arrives with your Sprint 1 kit" wording retained.

**Kredentials section**
- Keeps the **Kredentials Add-On** framing you ruled for; tile copy refreshed from v17 (Ships at registration / Grows into Kredentials / Beyond the Lander / In your app), with "watches for changes" left out.
- Sketchlight dossier image from v17 added as a CDN asset and shown above the caption; caption updated to the Dossier-format wording.

**Who We're Inviting**
- "Who your app serves" line updated to lead with creators.

**Live Support**
- Sprint 1 sessions become Monday 17 and Tuesday 18 August; Andrew Horn stays unnamed here (v17 says "our lead engineer").

**API / Review sections**
- Register tile: "your Sprint 1 kit's API credits".
- Review section gains the About Pillar link line.

**Sprint 1 Week timeline**
- Rewritten to the v17 dates: brief publishes Thu 13 Aug; prep Tue 11 – Mon 17 Aug; opens Mon 17 Aug 4:00pm ET; support Mon 17 + Tue 18; closes Wed 19 Aug 4:00pm ET — **without** the MCP link and API evidence items.

**Register section intro + success card**
- Intro copy updated to Monday 17 August at 4:00pm ET.
- Success card bullet dates updated to the new schedule. Form markup itself untouched.
- Participation Terms / PeopleBrowsr ToS link line added below the form.

**Footer stamp**
- Updated to the v17 footer wording.

**Countdown and schema**
- Sprint 1 target moves to Mon 17 Aug 2026 4:00pm ET (20:00 UTC).
- Event JSON-LD start/end become 2026-08-17T16:00 to 2026-08-19T16:00 ET.

## Technical notes
- All edits in `src/pages/VibeSprint.tsx` (copy, `SPRINT1_UTC`, `EVENT_JSON_LD`).
- Sketchlight image extracted from the uploaded HTML's base64 and uploaded via `lovable-assets`, referenced through an `.asset.json` pointer.
- No changes to `RegistrantContactFields`, the submit handler, domain availability check, or `submit-vibesprint-registration`.
