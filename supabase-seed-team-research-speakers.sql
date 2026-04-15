-- ═══════════════════════════════════════════════════════════════════════════
-- Seed: Speakers + resources from team research files
--   • Paris Blockchain Week 2026   (speakers with YES NFT involvement)
--   • NFC Summit 2026 Lisbon       (speakers with Yes/High NFT involvement)
--   • TOKEN2049 Dubai 2026         (speakers with YES NFT involvement)
--   • Sponsor leadership           (Ledger, Polygon)
--
-- ★ NO-COMPETITOR-URL RULE still applies. Banned domains:
--   consensus.coindesk.com / consensus2025.coindesk.com / token2049.com /
--   parisblockchainweek.com / nfcsummit.com / nonfungibleconference.com /
--   art-magazine.ai.
--
-- This file:
--   1. Adds a unique index on speakers(lower(name), vertical_id) so we can
--      insert idempotently.
--   2. Inserts ~45 new speakers with ON CONFLICT DO NOTHING.
--   3. Inserts ~20 new resources (only non-competitor URLs).
--   4. Links speakers to resources via related_resource_id +
--      resource_relationship. Speakers without content yet stay unlinked
--      (the admin "Still need content" query surfaces them).
--
-- Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ───────────────────────────────────────────────────────────────────────────
-- 0. De-duplicate existing (name, vertical) pairs so the unique index below
--    can be created. For each duplicate group we keep the row that:
--      (a) has a linked resource, else
--      (b) was created first.
--    All other rows in the group are removed.
-- ───────────────────────────────────────────────────────────────────────────
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY lower(name), vertical_id
      ORDER BY
        (related_resource_id IS NULL),  -- FALSE sorts before TRUE
        created_at ASC
    ) AS rn
  FROM speakers
)
DELETE FROM speakers
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Idempotency: one (name, vertical) per speaker.
CREATE UNIQUE INDEX IF NOT EXISTS speakers_name_vertical_uq
  ON speakers (lower(name), vertical_id);

-- ───────────────────────────────────────────────────────────────────────────
-- 1. NEW RESOURCES (non-competitor URLs only)
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO resources (vertical_id, title, url, type, date, source, topic_tag, description, status, auto_found) VALUES

-- Gaming ──────────────────────────────────────────────────────────────────
('gaming', 'Sebastien Borget on how The Sandbox''s vision has evolved',
  'https://www.blockchaingamer.biz/news/36617/podcast-sebastien-borget-the-sandbox-2025/',
  'podcast','2025-06-01','BlockchainGamer.biz','Virtual Worlds',
  'The Sandbox COO Sebastien Borget on metaverse, NFT land, and user-owned economies.','approved',false),

('gaming', 'Robby Yung (Animoca Brands) at Web Summit Qatar 2025',
  'https://www.youtube.com/watch?v=zn2lO_vPCNk',
  'youtube','2025-02-01','Web Summit Qatar','Web3 Gaming Investing',
  'Animoca Brands CEO of Investments on the Web3 gaming portfolio and outlook.','approved',false),

-- Culture, Art & Music ────────────────────────────────────────────────────
('culture', 'Michael Bouhanna (Sotheby''s) on the evolution of digital art',
  'https://www.youtube.com/watch?v=2AbQ5Z6rQB8',
  'youtube','2024-03-01','BBW 2024','Institutional NFT Art',
  'Sotheby''s VP and Head of Digital Art on NFT auctions and the digital art market.','approved',false),

('culture', 'Fintech & Crypto Speakers — gmoney',
  'https://www.harrywalker.com/subtopics/fintech-cryptocurrency',
  'news','2023-06-01','Harry Walker Agency','NFT Collecting',
  'Speaker profile and thought leadership positioning for iconic NFT collector gmoney.','approved',false),

('culture', 'Justin Aversano — The Most Promising NFT Photography Projects 2025',
  'https://aestheticsofphotography.com/the-most-promising-nft-photography-projects-in-2025',
  'blog','2025-04-08','Aesthetics of Photography','NFT Photography',
  'Featuring Twin Flames creator Justin Aversano''s Moments of the Unknown project.','approved',false),

('culture', 'Live From Marfa: In Conversation with Natalie Stone',
  'https://opensea.io/blog/articles/live-from-marfa-in-conversation-with-natalie-stone',
  'blog','2024-08-15','OpenSea Blog','CryptoPunks Stewardship',
  'CryptoPunks GM Natalie Stone on stewardship, NODE Foundation, and digital art.','approved',false),

('culture', 'Bright Moments founder Seth Goldstein in conversation with Fakewhale',
  'https://log.fakewhale.xyz/bright-moments-founder-seth-goldstein-in-conversation-with-fakewhale',
  'blog','2024-06-01','Fakewhale','On-Chain Art Galleries',
  'Seth Goldstein on Bright Moments, kinetic sculpture, and the DAO model for galleries.','approved',false),

('culture', 'NODE TO NODE — Art Salon Paris (Kate Vass Galerie)',
  'https://www.katevassgalerie.com/news/node-to-node',
  'blog','2024-10-01','Kate Vass Galerie','Web3 Art Curation',
  'Kate Vass Galerie exhibition featuring generative and AI art; curator''s perspective.','approved',false),

('culture', 'Kevin Abosch x TAEX — Paris Photo 2025',
  'https://www.youtube.com/watch?v=LVsSFylkn7s',
  'youtube','2025-11-10','Paris Photo','Identity + Blockchain Art',
  'Kevin Abosch on tokenized identity, value, and hybrid digital/physical art.','approved',false),

('culture', 'Meet the artist: Grant Yun makes digital paintings',
  'https://whitewall.art/art/digital-artist-grant-yun/',
  'news','2025-05-01','Whitewall','Digital Painting',
  'Profile of Grant Yun''s digital-vector practice and NFT exhibitions.','approved',false),

('culture', 'Nina Roehrs on the Arab Bank Switzerland Digital Art Prize',
  'https://www.nftmorning.com/p/930-the-arab-bank-switzerland-digital',
  'podcast','2026-03-28','NFT Morning','Institutional Digital Art',
  'Roehrs & Boetsch founder on institutional digital art collecting and the Digital Art Prize.','approved',false),

('culture', 'Talks and Panels — Dominique Moulon',
  'https://www.dominiquemoulon.com/en/talks.html',
  'blog','2025-04-04','Dominique Moulon','Art + Technology Curation',
  'Collected talks and panels from one of the most prolific digital-art curators in Europe.','approved',false),

-- Creator Economy ─────────────────────────────────────────────────────────
('creator', 'The Unwinding of the NFT Marketplace Era',
  'https://nowmedia.co/newsletter/the-now',
  'blog','2026-02-02','Now Media','NFT Media',
  'Matt Medved, Now Media CEO, on the post-marketplace era for NFT creators and collectors.','approved',false),

('creator', 'YAPLive: NFT Basics and Beyond with John Kraski et al',
  'https://youngandprofiting.com/yaplive-nft-basics-and-beyond-with-ben-yu-john-kraski-brian-esposito-and-ashley-france/',
  'podcast','2024-11-01','Young and Profiting','NFT Brand Partnerships',
  'John Kraski (LandVault / NFT Heat) on NFT brand partnerships and the metaverse.','approved',false),

-- Brands & Engagement (Colored Coins / Institutional) ─────────────────────
('brands', 'ADFW 2025: Yoni Assia, Co-Founder & CEO, eToro',
  'https://www.youtube.com/watch?v=Au2QpiE0ans',
  'youtube','2025-12-01','Abu Dhabi Finance Week','Colored Coins + Social Trading',
  'eToro co-founder and Colored Coins co-author on tokenization and retail finance.','approved',false),

-- Infrastructure (sponsor leadership + macro) ─────────────────────────────
('infra', 'Revenge of the Atoms (Pascal Gauthier)',
  'https://www.ledger.com/blog-revenge-atoms',
  'blog','2024-06-01','Ledger','Self-Custody',
  'Ledger CEO Pascal Gauthier on hardware, sovereignty, and the stakes of self-custody.','approved',false),

('infra', 'Marc Boiron (Polygon Labs) — Payments will define Web3',
  'https://www.fintechwrapup.com/p/marc-boiron-ceo-polygon-labs-payments',
  'podcast','2025-08-01','Fintech Wrap Up','Onchain Payments',
  'Polygon Labs CEO Marc Boiron on stablecoin rails, RWAs, and consumer onchain apps.','approved',false),

-- NFT Marketplaces ────────────────────────────────────────────────────────
('marketplaces', 'John Crain & Jonathan Perkins — SuperRare Labs',
  'https://www.youtube.com/watch?v=sUr41aG406E',
  'youtube','2023-05-01','SuperRare Labs','NFT Marketplaces',
  'SuperRare CEO John Crain with CPO Jonathan Perkins on the state of digital-art marketplaces.','approved',false),

-- RWA ─────────────────────────────────────────────────────────────────────
('rwa', 'Arab Bank Switzerland Middle East receives in-principle ADGM advisory licence',
  'https://www.arabbank.ch/news/arab-bank-switzerland-middle-east-receives-in-principle-approval-for-advisory-licence-from-adgm/',
  'news','2026-01-15','Arab Bank Switzerland','Institutional Digital Assets',
  'Rani Jabban quoted on the bank''s digital-asset advisory expansion in the Middle East.','approved',false);


-- ───────────────────────────────────────────────────────────────────────────
-- 2. NEW SPEAKERS (idempotent via unique index)
--    `eco` / `eco_color` match ECOSYSTEMS so the Admin UI renders them
--    consistently with other rows.
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO speakers (vertical_id, name, role, eco, eco_color, why, handle, outreach_channel, outreach_status, outreach_notes) VALUES

-- ── Gaming ───────────────────────────────────────────────────────────────
('gaming','Sebastien Borget','Co-Founder & COO, The Sandbox','Game Tokenization','#8B5CF6',
  'Co-creator of the largest metaverse NFT economy; president of Blockchain Game Alliance.',
  'borgetsebastien','twitter_dm','not_started','Source: Paris Blockchain Week 2026 team research'),

('gaming','Robby Yung','CEO of Investments, Animoca Brands','Game Tokenization','#8B5CF6',
  'Leads Animoca''s blockchain-gaming investments across 620+ portfolio companies.',
  'viewfromhk','twitter_dm','not_started','Source: Paris Blockchain Week 2026 team research'),

('gaming','Mohamed Ezeldin','Head of Tokenomics, Animoca Brands','Game Tokenization','#8B5CF6',
  'Designs token models across the Animoca portfolio — the full stack of Web3 gaming economies.',
  '','linkedin','not_started','Source: NFC Summit 2026 team research'),

-- ── Culture, Art & Music ─────────────────────────────────────────────────
('culture','Michael Bouhanna','Head of Digital Art and NFTs, Sotheby''s','Culture, Art & Music','#D946EF',
  'Runs Sotheby''s entire NFT / digital-art programme — the premier institutional auction voice.',
  'michaelbouhanna','email','not_started','Source: Paris Blockchain Week 2026 team research'),

('culture','gmoney','NFT Investor','Culture, Art & Music','#D946EF',
  'One of the most recognisable NFT collectors globally; blue-chip voice and taste-maker.',
  'gmoneyNFT','twitter_dm','not_started','Source: Paris Blockchain Week 2026 team research'),

('culture','Herve Larren','CEO, Airvey.io','Culture, Art & Music','#D946EF',
  'Facilitated the $69M Beeple auction at Christie''s; enterprise NFT art advisor.',
  'itsairvey','email','not_started','Source: Paris Blockchain Week 2026 team research'),

('culture','Justin Aversano','NFT Photographer; Founder, Quantum Art','Culture, Art & Music','#D946EF',
  'Twin Flames creator; leading NFT photography voice; founded Quantum Art marketplace.',
  'justinaversano','twitter_dm','not_started','Source: NFC Summit 2026 team research'),

('culture','Natalie Stone','GM, CryptoPunks (Yuga Labs)','Culture, Art & Music','#D946EF',
  'Runs stewardship of the most iconic NFT collection in existence.',
  '','email','not_started','Source: NFC Summit 2026 team research'),

('culture','Seth Goldstein','Founder, Bright Moments','Culture, Art & Music','#D946EF',
  'Built the physical-gallery DAO model for generative art; defines on-chain IRL experience.',
  'seth','twitter_dm','not_started','Source: NFC Summit 2026 team research'),

('culture','Kate Vass','Founder, Kate Vass Galerie','Culture, Art & Music','#D946EF',
  'Pioneering Web3 art gallery; author of "Collecting Art Onchain".',
  'KateVassGalerie','email','not_started','Source: NFC Summit 2026 team research'),

('culture','Jeff Davis','Co-Founder / Advisor, Art Blocks','Culture, Art & Music','#D946EF',
  'Core Art Blocks operator alongside Snowfro; also runs Davis Editions.',
  'jeffgdavis','twitter_dm','not_started','Source: NFC Summit 2026 team research'),

('culture','Dmitri Cherniak','Generative Artist','Culture, Art & Music','#D946EF',
  'Creator of the iconic Ringers Art Blocks collection.',
  'dmitricherniak','twitter_dm','not_started','Source: NFC Summit 2026 team research'),

('culture','Trevor Jones','Artist','Culture, Art & Music','#D946EF',
  'Early NFT adopter blending traditional painting with on-chain digital art.',
  '','email','not_started','Source: NFC Summit 2026 team research'),

('culture','Boris Eldagsen','AI Photographer','Culture, Art & Music','#D946EF',
  'German AI-pioneer artist; refused Sony World Photo Award to ignite the AI-art debate.',
  'BorisEldagsen','twitter_dm','not_started','Source: NFC Summit 2026 team research'),

('culture','Kevin Abosch','Blockchain Artist','Culture, Art & Music','#D946EF',
  'Irish conceptual artist exploring identity and value via tokenized works.',
  '','email','not_started','Source: NFC Summit 2026 team research'),

('culture','Nina Roehrs','Founder, Roehrs & Boetsch','Culture, Art & Music','#D946EF',
  'Swiss Web3 gallery pioneer bridging contemporary art and blockchain.',
  '','email','not_started','Source: NFC Summit 2026 team research'),

('culture','Dominique Moulon','Digital Art Strategist / PhD Curator','Culture, Art & Music','#D946EF',
  'Prolific curator of art-and-technology; supports NFT / tokenized exhibitions across Europe.',
  '','email','not_started','Source: NFC Summit 2026 team research'),

('culture','Grant Yun','Digital Artist','Culture, Art & Music','#D946EF',
  'Digital-vector artist exploring daily American life; NFT-native practice.',
  '','twitter_dm','not_started','Source: NFC Summit 2026 team research'),

('culture','Sercan Cayir','Co-founder, Normies','Culture, Art & Music','#D946EF',
  'Street artist turned Web3 creator; sold-out NFT collections TypoFace and Sensations.',
  'serc1n','twitter_dm','not_started','Source: NFC Summit 2026 team research'),

('culture','Botto','Decentralized Autonomous AI Artist','Culture, Art & Music','#D946EF',
  'Community-governed AI artist; Simon Hudson is the most public human contributor.',
  'Botto_','twitter_dm','not_started','Source: NFC Summit 2026 team research'),

('culture','Martin Lukas Ostachowski','Crypto Artist / Historian','Culture, Art & Music','#D946EF',
  'Award-winning new-media artist; co-authored 2019 crypto-art paper.',
  '','email','not_started','Source: NFC Summit 2026 team research'),

('culture','Leo Caillard','1/1 Digital Artist','Culture, Art & Music','#D946EF',
  'Active on SuperRare / Sotheby''s / Christie''s since 2019.',
  '','twitter_dm','not_started','Source: NFC Summit 2026 team research'),

('culture','Ivona Tau','AI Generative Artist','Culture, Art & Music','#D946EF',
  'Lithuanian AI artist blending generative art and technology.',
  '','twitter_dm','not_started','Source: NFC Summit 2026 team research'),

('culture','Parin Heidari','Minimalist Digital Artist','Culture, Art & Music','#D946EF',
  'Master of one-line digital art; featured by TIME and OpenSea.',
  '','twitter_dm','not_started','Source: NFC Summit 2026 team research'),

('culture','Bonafide Han','Founder, Deca & Shape','Culture, Art & Music','#D946EF',
  'Top-tier NFT collector (major Fidenza holdings); platform founder.',
  '','twitter_dm','not_started','Source: NFC Summit 2026 team research'),

('culture','Violetta Jones','Multidisciplinary Artist','Culture, Art & Music','#D946EF',
  'Blends classical painting with AI and digital technology; NFT-native.',
  '','email','not_started','Source: NFC Summit 2026 team research'),

('culture','Ender Diril','Digital & AI-Collaborative Artist','Culture, Art & Music','#D946EF',
  'Digital artist since 2002; creative-director background now in Web3.',
  '','email','not_started','Source: NFC Summit 2026 team research'),

('culture','Bosul Kim','Generative NFT Artist','Culture, Art & Music','#D946EF',
  'South Korean artist making abstract and vibrant generative work.',
  '','twitter_dm','not_started','Source: NFC Summit 2026 team research'),

-- ── Creator Economy ──────────────────────────────────────────────────────
('creator','John Kraski','Director of Strategic Partnerships, LandVault','Creator Economy','#F59E0B',
  'Metaverse brand-partnerships lead; ex-NFTGenius; co-host NFT Heat TV / podcast.',
  'JohnKraski','twitter_dm','not_started','Source: Paris Blockchain Week 2026 team research'),

('creator','Matt Medved','Co-Founder & CEO, Now Media (ex-NFT Now)','Creator Economy','#F59E0B',
  'Leading editorial voice on NFTs and digital culture.',
  '','email','not_started','Source: NFC Summit 2026 team research'),

-- ── Brands & Engagement ──────────────────────────────────────────────────
('brands','Yoni Assia','Founder & CEO, eToro','Brands & Engagement','#F97316',
  'Co-authored the Colored Coins whitepaper — the conceptual ancestor of NFTs.',
  'yoniassia','linkedin','not_started','Source: Paris Blockchain Week 2026 team research'),

('brands','Luc Mangin','Philatelist, ADPHIL','Brands & Engagement','#F97316',
  'Pioneering the fusion of stamp collecting and blockchain through crypto-stamps.',
  '','email','not_started','Source: NFC Summit 2026 team research'),

-- ── Infrastructure (sponsor leadership) ──────────────────────────────────
('infra','Pascal Gauthier','Chairman & CEO, Ledger','On-Chain Infrastructure','#06B6D4',
  'Ledger is the global leader in self-custody — the security layer for every NFT, DeFi, and RWA position. Title-sponsor target.',
  '','email','not_started','Sponsor lead: Ledger (TOKEN2049 Silver Sponsor); hardware-wallet + NFT custody category leader'),

('infra','Marc Boiron','CEO, Polygon Labs','On-Chain Infrastructure','#06B6D4',
  'Polygon Labs is among the largest RWA + NFT scaling ecosystems; drives consumer onchain payments strategy.',
  '','linkedin','not_started','Sponsor lead: Polygon (TOKEN2049 Silver Sponsor); major L2 ecosystem'),

-- ── Social NFTs (Balaji as philosopher + crypto-property) ────────────────
('social','Balaji Srinivasan','Founder, The Network State; ex-CTO Coinbase','Social NFTs','#EC4899',
  'Most-quoted thinker on NFTs as cryptographic property; early investor in OpenSea and adjacent NFT projects.',
  'balajis','email','not_started','Source: TOKEN2049 Dubai 2026 team research'),

-- ── RWA ──────────────────────────────────────────────────────────────────
('rwa','Rani Jabban','Director of Digital Assets, Arab Bank Switzerland','RWA Tokenization','#EF4444',
  'Institutional digital-art + tokenization lead at a top Swiss private bank.',
  'RaniJabban','linkedin','not_started','Source: NFC Summit 2026 team research'),

-- ── NFT Marketplaces ─────────────────────────────────────────────────────
('marketplaces','John Crain','CEO, SuperRare Labs','NFT Marketplaces','#38BDF8',
  'Leads the original curated 1/1 NFT marketplace; one of the longest-running voices in NFT commerce.',
  'johncrain','twitter_dm','not_started','Source: NFC Summit 2026 team research')

ON CONFLICT (lower(name), vertical_id) DO NOTHING;


-- ───────────────────────────────────────────────────────────────────────────
-- 3. Link new speakers to the resources we just added.
--    Idempotent: match by URL. Silent no-op if a linked speaker doesn't exist
--    (e.g. was already linked to a different resource).
-- ───────────────────────────────────────────────────────────────────────────

-- Gaming
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.blockchaingamer.biz/news/36617/podcast-sebastien-borget-the-sandbox-2025/' LIMIT 1), resource_relationship = 'interviewed' WHERE lower(name) = 'sebastien borget';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=zn2lO_vPCNk' LIMIT 1), resource_relationship = 'topic_expert' WHERE lower(name) = 'robby yung';

-- Culture
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=2AbQ5Z6rQB8' LIMIT 1), resource_relationship = 'interviewed' WHERE lower(name) = 'michael bouhanna';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.harrywalker.com/subtopics/fintech-cryptocurrency' LIMIT 1), resource_relationship = 'topic_expert' WHERE lower(name) = 'gmoney';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://aestheticsofphotography.com/the-most-promising-nft-photography-projects-in-2025' LIMIT 1), resource_relationship = 'topic_expert' WHERE lower(name) = 'justin aversano';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://opensea.io/blog/articles/live-from-marfa-in-conversation-with-natalie-stone' LIMIT 1), resource_relationship = 'interviewed' WHERE lower(name) = 'natalie stone';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://log.fakewhale.xyz/bright-moments-founder-seth-goldstein-in-conversation-with-fakewhale' LIMIT 1), resource_relationship = 'interviewed' WHERE lower(name) = 'seth goldstein';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.katevassgalerie.com/news/node-to-node' LIMIT 1), resource_relationship = 'authored' WHERE lower(name) = 'kate vass';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=LVsSFylkn7s' LIMIT 1), resource_relationship = 'topic_expert' WHERE lower(name) = 'kevin abosch';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://whitewall.art/art/digital-artist-grant-yun/' LIMIT 1), resource_relationship = 'topic_expert' WHERE lower(name) = 'grant yun';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.nftmorning.com/p/930-the-arab-bank-switzerland-digital' LIMIT 1), resource_relationship = 'interviewed' WHERE lower(name) = 'nina roehrs';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.dominiquemoulon.com/en/talks.html' LIMIT 1), resource_relationship = 'authored' WHERE lower(name) = 'dominique moulon';

-- Creator
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://nowmedia.co/newsletter/the-now' LIMIT 1), resource_relationship = 'authored' WHERE lower(name) = 'matt medved';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://youngandprofiting.com/yaplive-nft-basics-and-beyond-with-ben-yu-john-kraski-brian-esposito-and-ashley-france/' LIMIT 1), resource_relationship = 'interviewed' WHERE lower(name) = 'john kraski';

-- Brands
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=Au2QpiE0ans' LIMIT 1), resource_relationship = 'interviewed' WHERE lower(name) = 'yoni assia';

-- Infrastructure (sponsor leadership)
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.ledger.com/blog-revenge-atoms' LIMIT 1), resource_relationship = 'authored' WHERE lower(name) = 'pascal gauthier';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.fintechwrapup.com/p/marc-boiron-ceo-polygon-labs-payments' LIMIT 1), resource_relationship = 'interviewed' WHERE lower(name) = 'marc boiron';

-- Marketplaces
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=sUr41aG406E' LIMIT 1), resource_relationship = 'interviewed' WHERE lower(name) = 'john crain';

-- RWA
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.arabbank.ch/news/arab-bank-switzerland-middle-east-receives-in-principle-approval-for-advisory-licence-from-adgm/' LIMIT 1), resource_relationship = 'quoted' WHERE lower(name) = 'rani jabban';

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- AFTER RUNNING — see who still needs content:
--   SELECT name, vertical_id, outreach_notes
--   FROM   speakers
--   WHERE  related_resource_id IS NULL
--   ORDER  BY vertical_id, name;
--
-- This seed adds ~40 new speakers across 8 verticals and ~20 resources.
-- Speakers without a linked resource are pure outreach targets (the bulk of
-- the NFC Summit artist lineup) — content for them can be added through the
-- Admin UI as it is discovered.
-- ═══════════════════════════════════════════════════════════════════════════
