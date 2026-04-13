-- ═══════════════════════════════════════════════════════════════════════════
-- Seed: Recent content per target speaker + link speakers ↔ resources.
--
-- ★ HARD RULE — NO COMPETITOR-EVENT LINKS ★
--   We do NOT store or link resources that merely announce a speaker's
--   participation at a competing event. Specifically, URLs on the following
--   domains are BANNED from the resources table:
--
--     consensus.coindesk.com            (Consensus)
--     consensus2025.coindesk.com        (Consensus 2025)
--     consensus-hongkong.coindesk.com   (Consensus HK)
--     token2049.com                     (TOKEN2049 Singapore/Dubai)
--     parisblockchainweek.com           (Paris Blockchain Week)
--     nfcsummit.com                     (NFC Summit)
--     nonfungibleconference.com         (Non-Fungible Conference)
--     avantgarde.nonfungibleconference.com
--     art-magazine.ai  (any page promoting a competitor exhibition)
--
--   A YouTube video of the actual talk is OK — that's content, not a promo.
--   A speaker-profile page on a competitor's site is NOT ok — that drives
--   traffic and credibility to the competing event.
--
-- This file does three jobs, in order:
--   (1) DELETEs any previously-seeded resources whose URL matches the banned
--       domains (idempotent cleanup of the first speaker seed).
--   (2) Inserts fresh non-competitor resources with real URLs (2024-2025).
--   (3) Links every target speaker we have content for to their primary
--       resource via speakers.related_resource_id +
--       speakers.resource_relationship. Speakers with no non-competitor
--       content yet stay unlinked — those are the outreach priorities.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- Defensive: ensure link columns exist.
ALTER TABLE speakers ADD COLUMN IF NOT EXISTS related_resource_id UUID REFERENCES resources(id) ON DELETE SET NULL;
ALTER TABLE speakers ADD COLUMN IF NOT EXISTS resource_relationship TEXT
  CHECK (resource_relationship IN ('authored','mentioned','interviewed','quoted','topic_expert'));

-- ───────────────────────────────────────────────────────────────────────────
-- (1) Cleanup — remove any resources that point at competitor-event domains.
--     Speakers whose related_resource_id referenced these will be set NULL
--     automatically thanks to ON DELETE SET NULL.
-- ───────────────────────────────────────────────────────────────────────────

DELETE FROM resources
WHERE url ILIKE '%consensus.coindesk.com%'
   OR url ILIKE '%consensus-hongkong.coindesk.com%'
   OR url ILIKE '%consensus2025.coindesk.com%'
   OR url ILIKE '%token2049.com%'
   OR url ILIKE '%parisblockchainweek.com%'
   OR url ILIKE '%nfcsummit.com%'
   OR url ILIKE '%nonfungibleconference.com%'
   OR url ILIKE '%art-magazine.ai%';

-- Also clear any orphan speaker links so the admin sees a clean slate.
UPDATE speakers
SET    related_resource_id  = NULL,
       resource_relationship = NULL
WHERE  related_resource_id IS NOT NULL
  AND  NOT EXISTS (SELECT 1 FROM resources r WHERE r.id = speakers.related_resource_id);

-- ───────────────────────────────────────────────────────────────────────────
-- (2) Fresh resources — every URL is content, not a competitor promo.
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO resources (vertical_id, title, url, type, date, source, topic_tag, description, status, auto_found) VALUES

-- Infrastructure
('infra','Adam Back presents Blockstream''s Bitcoin-first infrastructure vision',
  'https://bitcoinmagazine.com/news/adam-back-presents-blockstreams-bitcoin-first-infrastructure-vision-at-bitcoin-2025',
  'news','2025-05-01','Bitcoin Magazine','Bitcoin Infrastructure',
  'Blockstream CEO lays out a bitcoin-first L2 / Liquid / Lightning vision.','approved',false),

('infra','What''s Next for Ethereum: Consensys & Chainlink at SmartCon',
  'https://www.youtube.com/watch?v=wgpFiM9Qdc4',
  'youtube','2025-10-01','Chainlink SmartCon','Ethereum Roadmap',
  'Joseph Lubin with Chainlink on Ethereum''s next phase and institutional adoption.','approved',false),

('infra','Eli Ben-Sasson: enterprise blockchains will fail if they don''t embrace decentralization',
  'https://en.bloomingbit.io/feed/news/99243',
  'news','2025-06-01','Bloomingbit','ZK + Decentralization',
  'StarkWare CEO on why permissioned chains lose and ZK rollups win.','approved',false),

('infra','Trust in Cryptography with Silvio Micali (Algorand)',
  'https://www.youtube.com/watch?v=5rdJnh3hD18',
  'youtube','2025-06-21','Proof of Talk','Cryptography + Consensus',
  'Turing Award winner on why cryptographic trust underpins onchain finance.','approved',false),

('infra','Charles Hoskinson on Web3''s zero-sum mindset',
  'https://www.youtube.com/watch?v=6W1h-ojqZ9E',
  'youtube','2025-04-10','YouTube','Web3 Philosophy',
  'Cardano founder challenges Web3''s zero-sum culture in his 2025 keynote.','approved',false),

('infra','Jesse Pollak on Base as the onchain app platform',
  'https://ns.com/podcast',
  'podcast','2025-07-07','The Network State Podcast','L2 Infrastructure',
  'Base founder on turning Coinbase''s L2 into the place consumer apps live.','approved',false),

-- DeFi
('defi','After an Incredible 2024 for USDe, Ethena Plans to Scale (Guy Young)',
  'https://www.youtube.com/watch?v=S42SRcxfQ9w',
  'youtube','2025-02-01','Empire / Blockworks','Synthetic Dollars',
  'Ethena founder on growth of USDe and the stablecoin landscape.','approved',false),

('defi','Kain Warwick: Why Crypto Is BROKEN in 2025',
  'https://www.youtube.com/watch?v=3nEpMrxQRko',
  'youtube','2025-03-01','Bankless','DeFi Critique',
  'Infinex / Synthetix founder on what has to change for consumer DeFi.','approved',false),

('defi','Multicoin founder Kyle Samani says he''s still mega-long Solana',
  'https://www.dlnews.com/articles/people-culture/multicoin-founder-kyle-samani-says-he-is-mega-long-solana-despite-resignation/',
  'news','2025-11-01','DL News','Solana Thesis',
  'Kyle Samani on Solana and the future of DeFi.','approved',false),

('defi','The Safest Dollar on the Internet | Circle CEO Jeremy Allaire',
  'https://www.youtube.com/watch?v=mL9aVwT3qEc',
  'youtube','2025-06-01','Circle / The Money Movement','Stablecoins',
  'Jeremy Allaire on USDC as the reserve stablecoin of onchain finance.','approved',false),

-- RWA Tokenization
('rwa','Breakpoint Keynote: Figure (Mike Cagney)',
  'https://www.youtube.com/watch?v=_UXD6sfhH9s',
  'youtube','2025-09-01','YouTube','Onchain Capital Markets',
  'Figure''s Mike Cagney on rebuilding capital markets on-chain.','approved',false),

('rwa','SharpLink welcomes BlackRock''s Joseph Chalom as Co-CEO',
  'https://www.globenewswire.com/news-release/2025/07/25/3121755/0/en/SharpLink-Welcomes-BlackRock-Digital-Assets-Pioneer-Joseph-Chalom-as-Newly-Appointed-Co-CEO.html',
  'news','2025-07-25','GlobeNewswire','ETH Treasury',
  'Ex-BlackRock Joseph Chalom takes co-CEO role to run Ethereum treasury strategy.','approved',false),

('rwa','Morgan Stanley plans to explore tokenization and tax solutions in crypto',
  'https://www.panewslab.com/en/articles/019d7f32-788e-761d-bd1a-373149f9a8b7',
  'news','2025-04-12','PANews','Tokenization at Morgan Stanley',
  'Amy Oldenburg on Morgan Stanley''s tokenization and tax tooling plans.','approved',false),

('rwa','Morgan Stanley''s wallet push will accelerate RWAs and TradFi intersection',
  'https://www.tekedia.com/morgan-stanleys-wallet-push-will-accelerate-rwas-and-tradfi-intersection-with-blockchain/',
  'news','2025-11-01','Tekedia','TradFi Onchain',
  'Jed Finn quoted on Morgan Stanley''s wallet push and RWA implications.','approved',false),

-- Creator Economy
('creator','Bitcoin to hit all-time high in 2025, predicts Anthony Pompliano',
  'https://www.investing.com/news/cryptocurrency-news/bitcoin-to-hit-alltime-high-in-2025-predicts-anthony-pompliano-3968986',
  'news','2025-01-15','Investing.com','Bitcoin Thesis',
  'Pomp''s 2025 thesis and macro call on bitcoin.','approved',false),

('creator','The modular blockchain thesis with Andy from The Rollup',
  'https://www.youtube.com/watch?v=xZ5qNnPY13c',
  'youtube','2025-05-01','The Rollup','Modular Blockchains',
  'Andy C on why modular stacks will host the next wave of apps.','approved',false),

('creator','From Adoption to Annexation (Meltem Demirors)',
  'https://cruciblecapital.substack.com/p/from-adoption-to-annexation',
  'blog','2025-03-01','Crucible Capital / Substack','Institutional Crypto',
  'Essay on institutions moving from adopting crypto to absorbing it.','approved',false),

-- Culture, Art & Music
('culture','Snowfro on Art Blocks and generative art (Meebits Podcast)',
  'https://www.youtube.com/watch?v=Y00YDBbmdaQ',
  'youtube','2025-11-03','The Meebits Podcast','Generative Art',
  'Art Blocks founder Erick Calderon on generative art and digital ownership.','approved',false),

('culture','Snowfro & Art Blocks: The Generative Art Evolution',
  'https://www.ledger.com/the-ledger-podcast/snowfro-artblocks-the-generative-art-evolution',
  'podcast','2022-07-20','The Ledger Podcast','Generative Art',
  'Classic interview on why Squiggles, Fidenzas and Ringers changed digital art.','approved',false),

('culture','Interview with AI artist and poet Sasha Stiles',
  'https://aifutures.substack.com/p/interview-with-ai-artist-and-poet',
  'podcast','2023-05-01','AI Futures (Substack)','AI + Poetry + NFTs',
  'Deep dive into Sasha Stiles''s AI-poetry practice.','approved',false),

('culture','Bryan Brinkman — live from Marfa, in conversation',
  'https://opensea.io/blog/articles/live-from-marfa-in-conversation-with-bryan-brinkman',
  'blog','2024-08-01','OpenSea Blog','Generative Art',
  'Long-form conversation with NFT artist Bryan Brinkman.','approved',false),

-- Domains
('domains','Nick Johnson: ENS — multichain domains and decentralised identities',
  'https://podscripts.co/podcasts/epicenter-learn-about-crypto-blockchain-ethereum-bitcoin-and-distributed-technologies/nick-johnson-ens-multichain-ens-domains-and-decentralised-identities',
  'podcast','2023-11-04','Epicenter','ENS + Identity',
  'ENS founder on multichain ENS, L2 compatibility, and ENS as identity layer.','approved',false),

('domains','The Future of Decentralized Identity | Nick from ENS',
  'https://podcasts.apple.com/my/podcast/the-future-of-decentralized-identity-nick-from-ens/id1745601953?i=1000702513991',
  'podcast','2025-04-07','Building Web3 Podcast','ENS + Identity',
  'Nick Johnson on ENS as DNS for Web3 and the future of on-chain identity.','approved',false),

('domains','Money, Ownership And Identity With Nick Johnson Of ENS',
  'https://yapglobal.com/yap-cast-podcast/money-ownership-and-identity-with-nick-johnson-of-ens-s3e7/',
  'podcast','2025-07-24','Yap Cast','Sovereign Identity',
  'ENS lead developer on decentralised and sovereign identity systems.','approved',false),

('domains','Sandy Carter — Beyond the Myths: Building Your AI-First Future',
  'https://www.youtube.com/watch?v=eW6bZq9Lt0w',
  'youtube','2025-04-01','YouTube','AI + Web3 Identity',
  'Unstoppable Domains COO Sandy Carter on the AI-first web.','approved',false),

('domains','Unstoppable focuses on proper domains, admits crypto was a "craze"',
  'https://domainincite.com/31583-unstoppable-focuses-on-proper-domains-admits-crypto-was-craze',
  'news','2026-03-16','Domain Incite','Domain Strategy',
  'CEO Matthew Gould on Unstoppable''s pivot back to DNS-grade domains.','approved',false),

-- Marketplaces
('marketplaces','Messari appoints new CEO Eric Turner amid staff reductions',
  'https://forklog.com/en/messari-appoints-new-ceo-amid-staff-reductions/',
  'news','2025-10-01','ForkLog','Crypto Data',
  'Messari CEO Eric Turner on the firm''s next chapter.','approved',false),

('marketplaces','What crypto exchanges are watching in 2026, per OKX''s Haider Rafique',
  'https://www.tradingview.com/news/cointelegraph:a5f0b7a82094b:0-what-crypto-exchanges-are-watching-in-2026-according-to-okx-s-rafique/',
  'news','2025-12-01','Cointelegraph','Exchange Strategy',
  'Haider Rafique on OKX''s 2026 playbook and marketplace themes.','approved',false),

('marketplaces','Zcash needs 2,600% to pass XRP — Helius CEO Mert Mumtaz',
  'https://www.tradingview.com/news/u_today:e268c0a1f094b:0-zcash-zec-needs-2-600-to-pass-xrp-easy-says-top-solana-contributor-mert-mumtaz/',
  'news','2025-11-01','U.Today','Solana Infra',
  'Mert Mumtaz, CEO of Helius, on valuations across the Solana stack.','approved',false),

('marketplaces','Ripple CEO warns against weaponization of crypto policy',
  'https://www.foxbusiness.com/video/6391845193112',
  'youtube','2025-04-01','Fox Business','Policy + Payments',
  'Brad Garlinghouse on US crypto policy and Ripple''s 2025 roadmap.','approved',false),

-- Gaming
('gaming','Animoca''s Yat Siu on why 2025 is the year Web3 wins',
  'https://www.raptorgroup.com/news/animoca-brands-yat-siu-on-why-2025-is-the-year-web3-wins/',
  'news','2025-04-08','Raptor Group / Coinage','Digital Property Rights',
  'Animoca chairman on tokenization, IP rights, and the creator economy in the age of AI.','approved',false),

('gaming','Yat Siu on digital ownership and the open metaverse',
  'https://www.youtube.com/watch?v=jQbnleES28s',
  'youtube','2024-08-19','The Defined Podcast','Open Metaverse',
  'Long-form interview on true digital ownership, play-to-earn, and network effects.','approved',false),

('gaming','Mythical Games CEO John Linden reveals what''s coming next',
  'https://www.youtube.com/watch?v=2G7PmPOCLRE',
  'podcast','2025-12-05','LeanScale Podcast','Blockchain Gaming',
  'John Linden on NFL Rivals, FIFA Rivals, and the future of blockchain gaming.','approved',false),

('gaming','NBA star Tristan Thompson on blending sports and crypto',
  'https://www.youtube.com/watch?v=dqPIqDnWCt4',
  'youtube','2025-06-12','CNBC','Sports + Crypto',
  'Tristan Thompson on merging pro-sports audiences with crypto.','approved',false),

('gaming','A-Rod Corp: what Alex Rodriguez''s investments teach about reinvention',
  'https://www.hustlefund.vc/post/angel-squad-alex-rodriguez-investments-what-a-rod-corp-teaches-about-building-a-second-career-from-scratch',
  'news','2025-06-01','Hustle Fund','Investor Profile',
  'Deep profile on A-Rod''s investment thesis and portfolio incl. digital assets.','approved',false),

-- AI Identity Tokenization
('ai','Crypto Corner with Polygon co-founder Sandeep Nailwal',
  'https://www.youtube.com/watch?v=FHScSNo93UE',
  'youtube','2025-10-17','YouTube','L2 + AI',
  'Sandeep Nailwal on Polygon''s next phase and AI integrations.','approved',false),

-- DeSci / Longevity
('desci','Anthony Schwartz (Artan Bio) on why he''s most excited about DeSci',
  'https://www.binance.com/en/square/post/19765420960498',
  'news','2025-06-01','Binance Square','DeSci + Biotech',
  'Artan Bio CEO on tokenized biotech and what DeSci enables.','approved',false);

-- ───────────────────────────────────────────────────────────────────────────
-- (3) Speaker ↔ resource links. Idempotent: match by URL.
-- ───────────────────────────────────────────────────────────────────────────

UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://bitcoinmagazine.com/news/adam-back-presents-blockstreams-bitcoin-first-infrastructure-vision-at-bitcoin-2025' LIMIT 1), resource_relationship = 'topic_expert' WHERE name = 'Adam Back';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=wgpFiM9Qdc4' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Joseph Lubin';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://en.bloomingbit.io/feed/news/99243' LIMIT 1), resource_relationship = 'quoted' WHERE name = 'Eli Ben-Sasson';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=5rdJnh3hD18' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Silvio Micali';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=6W1h-ojqZ9E' LIMIT 1), resource_relationship = 'authored' WHERE name = 'Charles Hoskinson';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://ns.com/podcast' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Jesse Pollak';

UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=S42SRcxfQ9w' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Guy Young';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=3nEpMrxQRko' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Kain Warwick';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.dlnews.com/articles/people-culture/multicoin-founder-kyle-samani-says-he-is-mega-long-solana-despite-resignation/' LIMIT 1), resource_relationship = 'topic_expert' WHERE name = 'Kyle Samani';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=mL9aVwT3qEc' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Jeremy Allaire';

UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=_UXD6sfhH9s' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Mike Cagney';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.globenewswire.com/news-release/2025/07/25/3121755/0/en/SharpLink-Welcomes-BlackRock-Digital-Assets-Pioneer-Joseph-Chalom-as-Newly-Appointed-Co-CEO.html' LIMIT 1), resource_relationship = 'topic_expert' WHERE name = 'Joseph Chalom';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.panewslab.com/en/articles/019d7f32-788e-761d-bd1a-373149f9a8b7' LIMIT 1), resource_relationship = 'quoted' WHERE name = 'Amy Oldenburg';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.tekedia.com/morgan-stanleys-wallet-push-will-accelerate-rwas-and-tradfi-intersection-with-blockchain/' LIMIT 1), resource_relationship = 'quoted' WHERE name = 'Jed Finn';

UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.investing.com/news/cryptocurrency-news/bitcoin-to-hit-alltime-high-in-2025-predicts-anthony-pompliano-3968986' LIMIT 1), resource_relationship = 'quoted' WHERE name = 'Anthony Pompliano';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=xZ5qNnPY13c' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Andy C';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://cruciblecapital.substack.com/p/from-adoption-to-annexation' LIMIT 1), resource_relationship = 'authored' WHERE name = 'Meltem Demirors';

UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=Y00YDBbmdaQ' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Snowfro (Erick Calderon)';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://aifutures.substack.com/p/interview-with-ai-artist-and-poet' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Sasha Stiles';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://opensea.io/blog/articles/live-from-marfa-in-conversation-with-bryan-brinkman' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Bryan Brinkman';

UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://podcasts.apple.com/my/podcast/the-future-of-decentralized-identity-nick-from-ens/id1745601953?i=1000702513991' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Nick Johnson';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=eW6bZq9Lt0w' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Sandy Carter';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://domainincite.com/31583-unstoppable-focuses-on-proper-domains-admits-crypto-was-craze' LIMIT 1), resource_relationship = 'authored' WHERE name = 'Matthew Gould';

UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://forklog.com/en/messari-appoints-new-ceo-amid-staff-reductions/' LIMIT 1), resource_relationship = 'topic_expert' WHERE name = 'Eric Turner';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.tradingview.com/news/cointelegraph:a5f0b7a82094b:0-what-crypto-exchanges-are-watching-in-2026-according-to-okx-s-rafique/' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Haider Rafique';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.tradingview.com/news/u_today:e268c0a1f094b:0-zcash-zec-needs-2-600-to-pass-xrp-easy-says-top-solana-contributor-mert-mumtaz/' LIMIT 1), resource_relationship = 'quoted' WHERE name = 'Mert Mumtaz';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.foxbusiness.com/video/6391845193112' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Brad Garlinghouse';

-- Yat Siu cross-listed in gaming + brands: pick the Raptor Group article (highest-signal content).
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.raptorgroup.com/news/animoca-brands-yat-siu-on-why-2025-is-the-year-web3-wins/' LIMIT 1), resource_relationship = 'quoted' WHERE name IN ('Yat Siu','Yat Siu (alt)');

UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=2G7PmPOCLRE' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'John Linden';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=dqPIqDnWCt4' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Tristan Thompson';
UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.hustlefund.vc/post/angel-squad-alex-rodriguez-investments-what-a-rod-corp-teaches-about-building-a-second-career-from-scratch' LIMIT 1), resource_relationship = 'topic_expert' WHERE name = 'Alex Rodriguez';

UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.youtube.com/watch?v=FHScSNo93UE' LIMIT 1), resource_relationship = 'interviewed' WHERE name = 'Sandeep Nailwal';

UPDATE speakers SET related_resource_id = (SELECT id FROM resources WHERE url = 'https://www.binance.com/en/square/post/19765420960498' LIMIT 1), resource_relationship = 'topic_expert' WHERE name = 'Anthony Schwartz';

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- STILL NEED CONTENT (unlinked target speakers after this run):
--   Illia Polosukhin, Alex Blania, Pavel Durov, Dan Romero, Anatoly Yakovenko,
--   Keone Hon, Arthur Breitman, Ryan Zarick, Kostas Chalkias, Benjamin Jones,
--   Erik Reppel, Dan Tapiero (ai+rwa), Sandeep (infra-listed duplicate),
--   Chris Pavlovski, Raoul Pal, Scott Melker, Ran Neuner, Ilan Hazan,
--   Kevin O'Leary, Grant Cardone, Stani Kulechov, Arthur Hayes (defi+rwa),
--   Shayne Coplan, Paolo Ardoino, Tarun Chitra, Nick van Eck, Hayden Adams,
--   Justin Sun, Carlos Domingo, Robert Mitchnick, Michael Saylor,
--   Charles Cascarilla, Tom Lee, Bo Hines, Hunter Horsley, Coty de Monteverde,
--   Raja Rajamannar, Karina Fernandez, May Zabaneh, Stephanie Cohen, David Yu,
--   FVCKRENDER, Mad Dog Jones, ThankYouX, DeeKay, Benny Redbeard,
--   Primavera De Filippi, Jeff Lau, Marvin Amberg, Sebastian Brunemeier,
--   Vincent Weisser, Fredrik Haga, Alex Svanevik, Arjun Sethi, Armani Ferrante.
--
-- RUN THIS to get the live unlinked list any time:
--   SELECT name, vertical_id, outreach_notes
--   FROM   speakers
--   WHERE  related_resource_id IS NULL
--   ORDER  BY vertical_id, name;
-- ═══════════════════════════════════════════════════════════════════════════
