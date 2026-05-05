-- ═══════════════════════════════════════════════════════════════════════════
-- Seed: NFC Summit 2026 Lisbon — NFT-adjacent-industry speakers
--   Source: https://www.nonfungibleconference.com/line-up (pulled 2026-05-05)
--
-- Goal: expand the speaker pool with people whose PRIMARY career is in an
-- adjacent industry — traditional art, photography, film/TV, music,
-- design/architecture, traditional finance, journalism — not crypto/Web3
-- natives. The crypto-native NFC speakers (Botto, Sercan/Normies, Grant Yun,
-- Trevor Jones, Boris Eldagsen, Ivona Tau, Violetta Jones, Kate Vass, Nina
-- Roehrs, Dominique Moulon, Rani Jabban, etc.) are already covered by
-- supabase-seed-team-research-speakers.sql and are intentionally NOT
-- duplicated here.
--
-- This file:
--   1. Ensures the (lower(name), vertical_id) unique index exists.
--   2. Inserts 20 new speakers with ON CONFLICT DO NOTHING (idempotent).
--   3. Does NOT seed resources — each speaker will be linked via the admin
--      "Find Resource" button (or a future batch trigger of the
--      find-resource-for-speaker edge function), which enforces the
--      last-12-months / NFT-or-adjacent-crypto / authored-by-or-features
--      criteria automatically.
--
-- Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- Idempotency guard (no-op if team-research seed already created it).
CREATE UNIQUE INDEX IF NOT EXISTS speakers_name_vertical_uq
  ON speakers (lower(name), vertical_id);

INSERT INTO speakers (vertical_id, name, role, eco, eco_color, why, handle, outreach_channel, outreach_status, outreach_notes) VALUES

-- ── Culture, Art & Music (traditional art / film / design) ───────────────
('culture','Georg Bak','Co-Founder & Curator, NFT Art Day','Culture, Art & Music','#D946EF',
  '30-year art veteran; advisor to Hauser & Wirth and LGT — bridges blue-chip art world to Web3.',
  '','linkedin','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (traditional art world)'),

('culture','Viktor Mejzlik','Digital Artist (ex-Art Basel, Sotheby''s, Louis Vuitton)','Culture, Art & Music','#D946EF',
  'Career in luxury / fine-art institutions before moving into digital — strong adjacent-industry credibility.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (luxury / fine art)'),

('culture','Pauline Foessel','Founder & CEO, 100 Collectors','Culture, Art & Music','#D946EF',
  'Curator bridging traditional and digital art markets via the 100 Collectors platform.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (curatorial / art market)'),

('culture','Fanny Lakoubay','Co-Founder, 100 Collectors','Culture, Art & Music','#D946EF',
  '15+ years as a traditional art advisor before co-founding 100 Collectors.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (traditional art advisory)'),

('culture','Gregory Monfort','Pioneer, TV & Film Tokenization','Culture, Art & Music','#D946EF',
  'Movie & TV-series tokenization pioneer; speaker at Cannes & CES — entertainment-industry voice.',
  '','linkedin','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (film & TV)'),

('culture','Stéphane Benini','Head, Goro Studio','Culture, Art & Music','#D946EF',
  'Film director with 20+ years; runs Goro Studio — film-industry crossover into on-chain media.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (film direction)'),

('culture','Lars Ravn','Artist','Culture, Art & Music','#D946EF',
  'Speaker at 20+ digital-experience, art and crypto conferences — institutional artist crossover.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (contemporary art)'),

('culture','Stina Gustafsson','Founder, DoD Art Research','Culture, Art & Music','#D946EF',
  'Cultural-tech researcher and curator; bridges academic art research and Web3.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (art research)'),

('culture','Andrea Chiampo','Concept Designer (movie industry)','Culture, Art & Music','#D946EF',
  'Established concept designer for the movie industry now exhibiting as a contemporary digital artist.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (film concept design)'),

('culture','Samar Younes','Founder, SAMARITUAL','Culture, Art & Music','#D946EF',
  'Scenographer and "Ancestral Futurist" — design / cultural strategy crossover.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (scenography / design)'),

('culture','Micol Ap','Founder, VERTICAL','Culture, Art & Music','#D946EF',
  'Cultural strategist, curator, and creative technologist working across institutional contexts.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (cultural strategy)'),

('culture','HelenFemi Williams','Founder, Zinefy','Culture, Art & Music','#D946EF',
  'Bridges editorial design, journalism and AI; non-crypto-native publishing background.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (editorial / journalism)'),

-- ── Creator Economy (photographers / musicians / craft) ─────────────────
('creator','Gül Yıldız','Instructor, Fujifilm','Creator Economy','#F59E0B',
  'Turkish Fujifilm X-Photographer and instructor — direct line into pro-photography community.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (professional photography)'),

('creator','Aida Boldeanu','Photographer','Creator Economy','#F59E0B',
  'Romanian photographer known for emotional portraits — fine-art photography crossover.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (photography)'),

('creator','Tommy D','Founder, TokenTraxx','Creator Economy','#F59E0B',
  '9B+ stream artist and producer — major-label music industry entering Web3.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (music industry)'),

('creator','Maxime Boublil','Web3 Musical Theatre Creator','Creator Economy','#F59E0B',
  '20M+ streams; creative architect bringing musical theatre into Web3 distribution.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (theatre / music)'),

('creator','Edouard','Electronic Music Producer','Creator Economy','#F59E0B',
  'Electronic music producer; solo-exhibited at NFT Factory — music-industry crossover.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (music production)'),

('creator','Isma Tazi','Founder, Trame','Creator Economy','#F59E0B',
  'Bridges traditional craftsmanship with digital generative tech — adjacent-industry maker voice.',
  '','email','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (craft / generative design)'),

-- ── DeFi / Infra (traditional finance, compliance) ──────────────────────
('defi','Ramzi Amairi','Tech Banking Lead, Natixis','DeFi','#10B981',
  'Advises fintech and crypto innovators from inside a major French investment bank.',
  '','linkedin','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (traditional banking)'),

('infra','Michael Halepas','Founder, BlockAML','On-Chain Infrastructure','#06B6D4',
  'Barrister specialising in financial crime & crypto; advises governments on compliance frameworks.',
  '','linkedin','not_started','Source: NFC Summit 2026 Lisbon — adjacent industry (legal / compliance)')

ON CONFLICT (lower(name), vertical_id) DO NOTHING;

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- AFTER RUNNING:
--   1. Open /admin → Speakers and Outreach.
--   2. Filter / search by "Source: NFC Summit 2026 Lisbon — adjacent" to see
--      the new 20 rows.
--   3. Click "Find Resource" on each to auto-discover a Web3-relevant
--      resource via the find-resource-for-speaker edge function. Results
--      land in Pending Review for approval.
--
--   Or query who still needs content:
--     SELECT name, vertical_id, role, outreach_notes
--     FROM   speakers
--     WHERE  related_resource_id IS NULL
--       AND  outreach_notes LIKE 'Source: NFC Summit 2026 Lisbon — adjacent%'
--     ORDER  BY vertical_id, name;
-- ═══════════════════════════════════════════════════════════════════════════
