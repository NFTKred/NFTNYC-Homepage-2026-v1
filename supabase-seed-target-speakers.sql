-- ═══════════════════════════════════════════════════════════════════════════
-- Seed: Target speakers + supporting resources, researched from
-- competitor events (Consensus, TOKEN2049 Dubai, Paris Blockchain Week,
-- NFC Summit / Non-Fungible Conference).
--
-- Every speaker has outreach_status = 'not_started' so they show up in the
-- Admin outreach funnel. `why` captures the signal that made them a target.
-- `outreach_notes` carries the source event.
--
-- Run AFTER supabase-migration-verticals.sql so that the vertical_id check
-- constraint allows rwa / domains / desci.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Resources (content to feature on vertical pages).
-- Only the strongest URL-backed pieces are included here. Additional speakers
-- appear as pure outreach targets below without a linked resource.
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO resources (vertical_id, title, url, type, date, source, topic_tag, description, status, auto_found) VALUES

-- AI Identity Tokenization
('ai', 'Illia Polosukhin on AI + crypto at TOKEN2049 Dubai',
  'https://www.token2049.com/dubai/speakers',
  'news', '2025-05-01', 'TOKEN2049', 'AI Agents',
  'NEAR co-founder and Transformer co-author on AI agents using crypto rails for identity and payments.', 'approved', false),

('ai', 'Alex Blania: Tools for Humanity on proof of personhood',
  'https://www.token2049.com/dubai/speakers',
  'news', '2025-05-01', 'TOKEN2049', 'Proof of Personhood',
  'World Network CEO on why AI makes human verification the most important primitive of the next decade.', 'approved', false),

-- Game Tokenization
('gaming', 'Animoca''s Yat Siu on why 2025 is the year Web3 wins',
  'https://www.raptorgroup.com/news/animoca-brands-yat-siu-on-why-2025-is-the-year-web3-wins/',
  'news', '2025-04-08', 'Raptor Group / Coinage', 'Digital Property Rights',
  'Animoca chairman on tokenization, IP rights, and the creator economy in the age of AI.', 'approved', false),

('gaming', 'Yat Siu on digital ownership and the open metaverse',
  'https://www.youtube.com/watch?v=jQbnleES28s',
  'youtube', '2024-08-19', 'The Defined Podcast', 'Open Metaverse',
  'Long-form interview on true digital ownership, play-to-earn, and network effects in Web3 gaming.', 'approved', false),

-- On-Chain Infrastructure
('infra', 'Charles Hoskinson keynote at Paris Blockchain Week 2025',
  'https://www.youtube.com/watch?v=6W1h-ojqZ9E',
  'youtube', '2025-04-10', 'Paris Blockchain Week', 'Web3 Philosophy',
  'Cardano founder challenges Web3''s zero-sum mindset in his PBW 2025 keynote.', 'approved', false),

('infra', 'Anatoly Yakovenko on Solana''s roadmap',
  'https://consensus.coindesk.com/agenda/speaker/-anatoly-yakovenko',
  'news', '2025-05-14', 'Consensus', 'High-Performance Chains',
  'Solana co-founder headlining Consensus 2026 on the future of high-throughput L1s.', 'approved', false),

('infra', 'Jesse Pollak on Base as the onchain app platform',
  'https://ns.com/podcast',
  'podcast', '2025-07-07', 'The Network State Podcast', 'L2 Infrastructure',
  'Base founder with Balaji on turning Coinbase''s L2 into the place consumer apps live.', 'approved', false),

-- Social NFTs
('social', 'Pavel Durov headlines TOKEN2049 Dubai',
  'https://x.com/durov',
  'tweet', '2025-04-30', 'TOKEN2049', 'Social Platforms + Crypto',
  'Telegram CEO on wallets inside messengers and TON as social infrastructure.', 'approved', false),

('social', 'Chris Pavlovski: Rumble builds a sovereign media stack',
  'https://consensus.coindesk.com/agenda/speaker/-chris-pavlovski',
  'news', '2025-05-14', 'Consensus', 'Decentralized Social',
  'Rumble CEO on creator payouts, censorship resistance, and crypto-native media.', 'approved', false),

-- Creator Economy
('creator', 'Raoul Pal at Consensus 2026 on the everything code',
  'https://consensus.coindesk.com/agenda/speaker/-raoul-pal',
  'news', '2025-05-14', 'Consensus', 'Macro + Creator Economy',
  'Real Vision founder on the macro thesis driving creator-owned media and onchain equities.', 'approved', false),

('creator', 'Scott Melker: Wolf of All Streets podcast',
  'https://consensus.coindesk.com/agenda/speaker/-scott-melker',
  'news', '2025-05-14', 'Consensus', 'Creator-Led Media',
  'One of crypto''s most-watched independent hosts; community-owned media practitioner.', 'approved', false),

('creator', 'Ran Neuner: Crypto Banter speaker profile',
  'https://www.token2049.com/dubai/speakers',
  'news', '2025-05-01', 'TOKEN2049', 'Creator-Led Media',
  'Crypto Banter co-founder on running a tokenized media network with community ownership.', 'approved', false),

-- DeFi
('defi', 'Stani Kulechov on Aave + GHO + Lens at Consensus',
  'https://consensus.coindesk.com/agenda/speaker/-stani-kulechov',
  'news', '2025-05-14', 'Consensus', 'DeFi + SocialFi',
  'Aave Labs CEO on the convergence of lending, stablecoins, and decentralised social graphs.', 'approved', false),

('defi', 'Arthur Hayes: Maelstrom CIO at Consensus',
  'https://consensus.coindesk.com/agenda/speaker/-arthur-hayes-2',
  'news', '2025-05-14', 'Consensus', 'Crypto Macro',
  'BitMEX co-founder and one of the most-read macro writers in crypto.', 'approved', false),

('defi', 'Shayne Coplan on Polymarket prediction markets',
  'https://www.token2049.com/dubai/speakers',
  'news', '2025-05-01', 'TOKEN2049', 'Prediction Markets',
  'Polymarket founder on information markets as the next leg of DeFi.', 'approved', false),

-- RWA Tokenization
('rwa', 'Carlos Domingo: Securitize and the tokenization of everything',
  'https://www.token2049.com/dubai/speakers',
  'news', '2025-05-01', 'TOKEN2049', 'Tokenized Funds',
  'Securitize CEO, partner to BlackRock on BUIDL, on why regulated tokenization is eating TradFi.', 'approved', false),

('rwa', 'Robert Mitchnick: BlackRock''s head of digital assets',
  'https://www.token2049.com/dubai/speakers',
  'news', '2025-05-01', 'TOKEN2049', 'Institutional Adoption',
  'Architect of IBIT and BUIDL on how the world''s largest asset manager thinks about onchain.', 'approved', false),

('rwa', 'Michael Saylor at Consensus 2026',
  'https://consensus.coindesk.com/agenda/speaker/-michael-saylor',
  'news', '2025-05-14', 'Consensus', 'Bitcoin Treasury',
  'Strategy chairman on corporate digital asset treasuries and the bitcoin standard.', 'approved', false),

-- Brands & Engagement
('brands', 'David Yu: VeVe Digital Collectibles at NFC Lisbon',
  'https://www.youtube.com/watch?v=IR_4Tb_qx8A',
  'youtube', '2024-10-01', 'NFC Summit', 'Licensed Collectibles',
  'VeVe CEO on partnerships with Marvel, DC, Disney and where digital collectibles go next.', 'approved', false),

('brands', 'Raja Rajamannar: Mastercard brand-building in Web3',
  'https://consensus.coindesk.com/agenda/speaker/-raja-rajamannar',
  'news', '2025-05-14', 'Consensus', 'Payments + Loyalty',
  'Former Mastercard CMO on how legacy brands should enter the onchain consumer stack.', 'approved', false),

-- Culture, Art & Music
('culture', 'Snowfro on Art Blocks and generative art',
  'https://www.youtube.com/watch?v=Y00YDBbmdaQ',
  'youtube', '2025-11-03', 'The Meebits Podcast', 'Generative Art',
  'Art Blocks founder Erick Calderon on generative art, Meebits, and the future of digital ownership.', 'approved', false),

('culture', 'Snowfro & Art Blocks: The Generative Art Evolution',
  'https://www.ledger.com/the-ledger-podcast/snowfro-artblocks-the-generative-art-evolution',
  'podcast', '2022-07-20', 'The Ledger Podcast', 'Generative Art',
  'Classic interview on why Squiggles, Fidenzas and Ringers changed digital art forever.', 'approved', false),

('culture', 'FVCKRENDER at NFC 2025 Lisbon',
  'https://www.art-magazine.ai/what-is-on/non-fungible-conference-nfc-2025',
  'news', '2025-05-01', 'Art Magazine', 'Digital + AI Art',
  'Hyper-realistic 3D artist featured exhibition at NFC 2025.', 'approved', false),

-- DNS ENS Domain Tokens
('domains', 'Nick Johnson: ENS - multichain domains and decentralised identities',
  'https://podscripts.co/podcasts/epicenter-learn-about-crypto-blockchain-ethereum-bitcoin-and-distributed-technologies/nick-johnson-ens-multichain-ens-domains-and-decentralised-identities',
  'podcast', '2023-11-04', 'Epicenter', 'ENS + Identity',
  'ENS founder on multichain ENS, L2 compatibility, and ENS as the identity layer.', 'approved', false),

('domains', 'The Future of Decentralized Identity | Nick from ENS',
  'https://podcasts.apple.com/my/podcast/the-future-of-decentralized-identity-nick-from-ens/id1745601953?i=1000702513991',
  'podcast', '2025-04-07', 'Building Web3 Podcast', 'ENS + Identity',
  'Nick Johnson on ENS as DNS for Web3 and the future of on-chain identity.', 'approved', false),

('domains', 'Money, Ownership And Identity With Nick Johnson Of ENS',
  'https://yapglobal.com/yap-cast-podcast/money-ownership-and-identity-with-nick-johnson-of-ens-s3e7/',
  'podcast', '2025-07-24', 'Yap Cast', 'Sovereign Identity',
  'ENS lead developer on decentralised and sovereign identity systems.', 'approved', false),

-- DeSci / Longevity Tokenization
('desci', 'NFC Longevity Day: The Science of Living Longer',
  'https://avantgarde.nonfungibleconference.com/p/longevity-day-the-science-of-living',
  'news', '2025-05-01', 'NFC Summit', 'Longevity Funding',
  'NFC''s Longevity Day featuring Anthony Schwartz (Artan Bio), Marvin Amberg (naturalX) and Sebastian Brunemeier (LongGame Ventures).', 'approved', false),

-- NFT Marketplaces
('marketplaces', 'Fredrik Haga on Dune and the rise of on-chain analytics',
  'https://www.token2049.com/dubai/speakers',
  'news', '2025-05-01', 'TOKEN2049', 'On-Chain Analytics',
  'Dune CEO on how transparent marketplaces remake the data layer of crypto.', 'approved', false),

('marketplaces', 'Alex Svanevik: Nansen and wallet-labelled markets',
  'https://www.token2049.com/dubai/speakers',
  'news', '2025-05-01', 'TOKEN2049', 'Wallet Analytics',
  'Nansen CEO on smart-money tracking and the future of marketplace data.', 'approved', false);

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Speakers / target-outreach list.
-- `outreach_notes` stores the source event so the admin can filter later.
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO speakers (vertical_id, name, role, eco, eco_color, why, handle, outreach_channel, outreach_status, outreach_notes) VALUES

-- ─── AI Identity Tokenization ────────────────────────────────────────────
('ai','Illia Polosukhin','Co-Founder, NEAR Protocol','AI Identity Tokenization','#3B82F6','NEAR co-founder & Transformer paper co-author. Uniquely positioned on AI+crypto intersection.','ilblackdragon','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('ai','Alex Blania','Co-Founder & CEO, Tools for Humanity (World Network)','AI Identity Tokenization','#3B82F6','Building proof-of-personhood at global scale; defining identity for the AI era.','alexblania','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('ai','Sandeep Nailwal','Co-Founder, Polygon','AI Identity Tokenization','#3B82F6','Leading Polygon''s AI+crypto vision; strong builder voice.','sandeepnailwal','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('ai','Erik Reppel','Head of Engineering, Coinbase Developer Platform (x402 creator)','AI Identity Tokenization','#3B82F6','Inventor of x402 — the HTTP 402 payments standard every AI agent will use.','','twitter_dm','not_started','Source: Consensus 2026'),
('ai','Dan Tapiero','Founder & CEO, 50T','AI Identity Tokenization','#3B82F6','Vocal investor thesis on AI + tokenization convergence.','DTAPCAP','twitter_dm','not_started','Source: Consensus 2026'),

-- ─── Game Tokenization ───────────────────────────────────────────────────
('gaming','Yat Siu','Co-Founder & Chairman, Animoca Brands','Game Tokenization','#8B5CF6','One of the most influential voices on player-owned economies; 620+ portfolio companies.','ysiu','twitter_dm','not_started','Source: Paris Blockchain Week 2025'),
('gaming','John Linden','CEO, Mythical Games','Game Tokenization','#8B5CF6','NFL Rivals and FIFA Rivals leader; blockchain gaming at scale.','johnlinden','twitter_dm','not_started','Source: NFC Summit'),
('gaming','Tristan Thompson','NBA Champion','Game Tokenization','#8B5CF6','NBA Champion with crypto-native audience; bridge to sports IP.','RealTristan13','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('gaming','Alex Rodriguez','CEO, A-Rod Corp / Co-Chairman, Minnesota Timberwolves','Game Tokenization','#8B5CF6','Sports + media mogul exploring tokenized fan economies.','AROD','intro','not_started','Source: Consensus 2026'),

-- ─── On-Chain Infrastructure ─────────────────────────────────────────────
('infra','Anatoly Yakovenko','Co-Founder, Solana / CEO, Solana Labs','On-Chain Infrastructure','#06B6D4','Builder of the fastest growing consumer L1; frequent keynote draw.','aeyakovenko','twitter_dm','not_started','Source: Consensus 2026'),
('infra','Charles Hoskinson','CEO & Founder, Input Output (Cardano)','On-Chain Infrastructure','#06B6D4','Prolific content creator; massive YouTube and X following.','IOHK_Charles','twitter_dm','not_started','Source: Paris Blockchain Week 2025'),
('infra','Adam Back','Co-Founder & CEO, Blockstream','On-Chain Infrastructure','#06B6D4','Cypherpunk original; cited in the Bitcoin white paper.','adam3us','twitter_dm','not_started','Source: Paris Blockchain Week 2025'),
('infra','Joseph Lubin','Founder & CEO, Consensys','On-Chain Infrastructure','#06B6D4','Ethereum co-founder; MetaMask and Infura.','ethereumJoseph','email','not_started','Source: Consensus 2026'),
('infra','Eli Ben-Sasson','Co-Founder & CEO, StarkWare','On-Chain Infrastructure','#06B6D4','ZK pioneer; STARKs cited as the endgame for scaling.','EliBenSasson','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('infra','Silvio Micali','Founder, Algorand (Turing Award)','On-Chain Infrastructure','#06B6D4','Turing Award winner; huge academic and industry credibility.','SilvioMicali','email','not_started','Source: Paris Blockchain Week 2025'),
('infra','Jesse Pollak','Founder, Base (Coinbase L2)','On-Chain Infrastructure','#06B6D4','Base is the fastest-growing L2; builder of consumer onchain apps.','jessepollak','twitter_dm','not_started','Source: Consensus 2026'),
('infra','Keone Hon','Co-Founder & GM, Monad Foundation','On-Chain Infrastructure','#06B6D4','Monad''s parallel EVM thesis is among the most talked-about in 2025.','keoneHD','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('infra','Arthur Breitman','Co-Founder, Tezos','On-Chain Infrastructure','#06B6D4','Long-running L1; strong on-chain governance voice.','ArthurB','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('infra','Ryan Zarick','Co-Founder & CTO, LayerZero','On-Chain Infrastructure','#06B6D4','Omnichain messaging infrastructure; core interop primitive.','ryanzarick','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('infra','Kostas Chalkias','Co-Founder & Chief Cryptographer, Mysten Labs (Sui)','On-Chain Infrastructure','#06B6D4','Cryptographer behind Sui and zkLogin.','kostascrypto','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('infra','Benjamin Jones','Co-Founder, Optimism','On-Chain Infrastructure','#06B6D4','OP Stack powers Base, World Chain, and more.','ben_chain','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('infra','Illia Polosukhin (alt)','Co-Founder, NEAR Protocol','On-Chain Infrastructure','#06B6D4','Cross-list: infra credentials in addition to AI.','ilblackdragon','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),

-- ─── Social NFTs ─────────────────────────────────────────────────────────
('social','Pavel Durov','CEO, Telegram','Social NFTs','#EC4899','900M+ user messenger; owner of TON; unmatched social reach.','durov','other','not_started','Source: TOKEN2049 Dubai 2025'),
('social','Dan Romero','Founder, Tempo (ex-Farcaster)','Social NFTs','#EC4899','Farcaster built the on-chain social graph; Dan is the public face.','dwr.eth','twitter_dm','not_started','Source: Consensus 2026'),
('social','Chris Pavlovski','CEO, Rumble','Social NFTs','#EC4899','Challenger video platform; frequently integrates crypto.','chrispavlovski','twitter_dm','not_started','Source: Consensus 2026'),

-- ─── Creator Economy ─────────────────────────────────────────────────────
('creator','Raoul Pal','Co-Founder & CEO, Real Vision / EXPAAM','Creator Economy','#F59E0B','Macro investor turned creator-economy evangelist with 1.5M+ follower audience.','RaoulGMI','email','not_started','Source: Consensus 2026'),
('creator','Scott Melker','Host, The Wolf of All Streets','Creator Economy','#F59E0B','One of the biggest crypto podcast hosts; daily newsletter with deep engagement.','scottmelker','twitter_dm','not_started','Source: Consensus 2026'),
('creator','Anthony Pompliano','Chairman & CEO, ProCap Financial','Creator Economy','#F59E0B','3.5M+ X followers; built one of crypto''s biggest media brands.','APompliano','twitter_dm','not_started','Source: Consensus 2026'),
('creator','Ran Neuner','Co-Founder, Crypto Banter','Creator Economy','#F59E0B','Crypto Banter is one of the largest live-streamed crypto networks.','cryptomanran','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('creator','Andy C','Co-Founder, The Rollup','Creator Economy','#F59E0B','High-signal podcast host reaching builders directly.','andyyy','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('creator','Meltem Demirors','Investor (ex-CoinShares CSO)','Creator Economy','#F59E0B','Sharp independent voice on creator tools and onchain culture.','Melt_Dem','twitter_dm','not_started','Source: Paris Blockchain Week 2025'),
('creator','Ilan Hazan','Co-Founder & COO, DASTAN / Decrypt / RugRadio','Creator Economy','#F59E0B','Operator behind some of the biggest Web3 media brands.','punk9059','twitter_dm','not_started','Source: NFC Summit'),
('creator','Kevin O''Leary','Chairman, O''Leary Ventures','Creator Economy','#F59E0B','Mr. Wonderful — mainstream celebrity investor with crypto audience.','kevinolearytv','email','not_started','Source: Consensus 2026'),
('creator','Grant Cardone','Founder & CEO, Grant Cardone Enterprises','Creator Economy','#F59E0B','Real estate + media personality, 4M+ social following pushing BTC/ETH adoption.','GrantCardone','email','not_started','Source: Consensus 2026'),

-- ─── DeFi ────────────────────────────────────────────────────────────────
('defi','Stani Kulechov','Founder & CEO, Aave Labs','DeFi','#10B981','Aave is the flagship money market; now tying DeFi + SocialFi via Lens.','StaniKulechov','twitter_dm','not_started','Source: Consensus 2026 / TOKEN2049'),
('defi','Arthur Hayes','CIO, Maelstrom','DeFi','#10B981','Most-read macro writer in crypto; BitMEX co-founder.','CryptoHayes','twitter_dm','not_started','Source: Consensus 2026 / TOKEN2049'),
('defi','Shayne Coplan','Founder & CEO, Polymarket','DeFi','#10B981','Prediction markets went mainstream in 2024; Polymarket is the leader.','shayne_coplan','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('defi','Guy Young','Founder, Ethena','DeFi','#10B981','USDe is the fastest-growing stablecoin; Guy is the public face.','gdog97_','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('defi','Kain Warwick','Founder, Infinex / Synthetix','DeFi','#10B981','OG DeFi founder now building consumer trading at Infinex.','kaiynne','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('defi','Kyle Samani','Managing Partner, Multicoin Capital (Chairman, Forward Industries)','DeFi','#10B981','One of the most respected DeFi theses on crypto Twitter.','KyleSamani','twitter_dm','not_started','Source: Consensus 2026'),
('defi','Jeremy Allaire','Co-Founder, Chairman & CEO, Circle','DeFi','#10B981','USDC is the reserve stablecoin of onchain finance.','jerallaire','email','not_started','Source: TOKEN2049 Dubai 2025'),
('defi','Paolo Ardoino','CEO, Tether','DeFi','#10B981','Runs the largest stablecoin issuer in the world.','paoloardoino','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('defi','Tarun Chitra','Co-Founder & CEO, Gauntlet','DeFi','#10B981','DeFi risk management thought leader.','tarunchitra','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('defi','Nick van Eck','Co-Founder & CEO, Agora','DeFi','#10B981','Stablecoin infrastructure; Van Eck dynasty.','Nick_van_Eck','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('defi','Hayden Adams','Founder, Uniswap','DeFi','#10B981','Creator of the largest on-chain exchange (not on list but essential DeFi draw).','haydenzadams','twitter_dm','not_started','Source: Cross-reference'),
('defi','Justin Sun','Founder, TRON','DeFi','#10B981','Polarising but massive reach; influential in stablecoin markets.','justinsuntron','email','not_started','Source: Consensus 2026 / TOKEN2049'),

-- ─── RWA Tokenization ────────────────────────────────────────────────────
('rwa','Carlos Domingo','Founder & CEO, Securitize','RWA Tokenization','#EF4444','Partner of BlackRock on BUIDL — the flagship tokenized treasury fund.','CarlosDomingo','email','not_started','Source: Consensus 2026 / TOKEN2049'),
('rwa','Robert Mitchnick','Global Head of Digital Assets, BlackRock','RWA Tokenization','#EF4444','Runs the world''s largest asset manager''s crypto business.','robbiemitchnick','linkedin','not_started','Source: TOKEN2049 Dubai 2025'),
('rwa','Michael Saylor','Founder & Executive Chairman, Strategy','RWA Tokenization','#EF4444','Corporate bitcoin treasury pioneer; massive media footprint.','saylor','email','not_started','Source: Consensus 2026'),
('rwa','Charles Cascarilla','CEO & Co-Founder, Paxos','RWA Tokenization','#EF4444','Regulated issuer powering PayPal USD and more.','CharlesCascaril','email','not_started','Source: Consensus 2026 / TOKEN2049'),
('rwa','Mike Cagney','Co-Founder & Executive Chairman, Figure','RWA Tokenization','#EF4444','Figure is one of the largest private credit lenders on-chain.','MikeCagney','linkedin','not_started','Source: Consensus 2026'),
('rwa','Joseph Chalom','CEO, SharpLink','RWA Tokenization','#EF4444','ETH treasury strategy leader; ex-BlackRock digital assets.','joechalom','linkedin','not_started','Source: Consensus 2026 / TOKEN2049'),
('rwa','Amy Oldenburg','Head of Digital Asset Strategy, Morgan Stanley','RWA Tokenization','#EF4444','TradFi institutional adoption leader.','','linkedin','not_started','Source: Consensus 2026'),
('rwa','Jed Finn','Head of Wealth Management, Morgan Stanley','RWA Tokenization','#EF4444','Opening Morgan Stanley wealth to digital assets.','','linkedin','not_started','Source: Consensus 2026'),
('rwa','Tom Lee','Co-Founder, Fundstrat / Chairman, BitMine Immersion','RWA Tokenization','#EF4444','Most-booked crypto macro voice on CNBC.','fundstratTom','email','not_started','Source: Consensus 2026'),
('rwa','Bo Hines','CEO, Tether USA₮','RWA Tokenization','#EF4444','Ex-White House digital assets director; now runs Tether''s US business.','','email','not_started','Source: Consensus 2026'),
('rwa','Hunter Horsley','Co-Founder & CEO, Bitwise Asset Management','RWA Tokenization','#EF4444','One of the leading crypto ETF issuers.','HHorsley','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('rwa','Dan Tapiero','Founder & CEO, 50T','RWA Tokenization','#EF4444','Macro investor + digital asset allocator.','DTAPCAP','twitter_dm','not_started','Source: Consensus 2026'),
('rwa','Arthur Hayes (alt)','CIO, Maelstrom','RWA Tokenization','#EF4444','Cross-list: macro voice on RWA thesis.','CryptoHayes','twitter_dm','not_started','Source: Consensus 2026'),
('rwa','Coty de Monteverde','Head of Crypto & Blockchain CoE, Santander','RWA Tokenization','#EF4444','Leading bank crypto strategy in Europe.','','linkedin','not_started','Source: Paris Blockchain Week 2025'),

-- ─── Brands & Engagement ─────────────────────────────────────────────────
('brands','David Yu','CEO & Co-Founder, VeVe Digital Collectibles','Brands & Engagement','#F97316','Runs the largest licensed digital collectibles platform (Marvel / DC / Disney).','davideyu','twitter_dm','not_started','Source: NFC Summit'),
('brands','Yat Siu (alt)','Chairman, Animoca Brands','Brands & Engagement','#F97316','Cross-list: tokenized IP + licensing powerhouse.','ysiu','twitter_dm','not_started','Source: Paris Blockchain Week 2025'),
('brands','Raja Rajamannar','Senior Fellow; former CMO, Mastercard','Brands & Engagement','#F97316','Wrote the playbook for how legacy brands should adopt Web3.','','email','not_started','Source: Consensus 2026'),
('brands','Karina Fernandez','GM Emerging Digital Technologies, Shell','Brands & Engagement','#F97316','Enterprise energy sector blockchain lead.','','linkedin','not_started','Source: Paris Blockchain Week 2025'),
('brands','May Zabaneh','VP & GM of Crypto, PayPal','Brands & Engagement','#F97316','Running crypto at one of the biggest consumer payment brands.','','linkedin','not_started','Source: Consensus 2026 / TOKEN2049'),
('brands','Stephanie Cohen','Chief Strategy Officer, Cloudflare','Brands & Engagement','#F97316','Bringing Cloudflare''s 20%-of-the-web platform on-chain.','','linkedin','not_started','Source: Consensus 2026'),

-- ─── Culture, Art & Music ────────────────────────────────────────────────
('culture','Snowfro (Erick Calderon)','Founder, Art Blocks','Culture, Art & Music','#D946EF','Godfather of generative NFT art; ran Chromie Squiggle and now Meebits.','snowfro','twitter_dm','not_started','Source: NFC Summit'),
('culture','FVCKRENDER','Digital Artist','Culture, Art & Music','#D946EF','One of the biggest names in 3D / AI digital art.','fvckrender','twitter_dm','not_started','Source: NFC Summit'),
('culture','Mad Dog Jones (Michah Dowbak)','Digital Artist','Culture, Art & Music','#D946EF','Cyberpunk NFT pioneer with record-breaking auctions.','mad_dog_jones','twitter_dm','not_started','Source: NFC Summit'),
('culture','ThankYouX','Artist','Culture, Art & Music','#D946EF','Street-art origin; crossover into abstract + NFT markets.','thankyoux','twitter_dm','not_started','Source: NFC Summit'),
('culture','DeeKay (Kim)','Artist / Animator','Culture, Art & Music','#D946EF','Ex-Google/Apple motion designer; retro gaming-inspired NFTs.','deekaymotion','twitter_dm','not_started','Source: NFC Summit'),
('culture','Sasha Stiles','Poet and Digital Artist','Culture, Art & Music','#D946EF','Leading AI + poetry artist in the NFT space.','sashastiles','twitter_dm','not_started','Source: NFC Summit'),
('culture','Bryan Brinkman','Digital Artist','Culture, Art & Music','#D946EF','Prolific NFT artist; Emmy-winner collaborator.','bryanbrinkman','twitter_dm','not_started','Source: NFC Summit'),
('culture','Benny Redbeard','Digital Artist','Culture, Art & Music','#D946EF','Community-beloved NFT artist; strong collector following.','bennyredbeard','twitter_dm','not_started','Source: NFC Summit'),
('culture','Primavera De Filippi','Researcher / Artist','Culture, Art & Music','#D946EF','Blockchain governance researcher at CNRS + Harvard; artist and author.','yaoyaonyc','email','not_started','Source: NFC Summit'),

-- ─── DNS ENS Domain Tokens ───────────────────────────────────────────────
('domains','Nick Johnson','Founder & CEO, ENS Labs','DNS ENS Domain Tokens','#14B8A6','Creator of ENS; the original architect of Web3 naming.','nicksdjohnson','twitter_dm','not_started','Source: Cross-reference (essential for vertical)'),
('domains','Jeff Lau','CTO, ENS Labs','DNS ENS Domain Tokens','#14B8A6','Long-time ENS protocol engineer; key technical voice.','','twitter_dm','not_started','Source: ENS Labs'),
('domains','Sandy Carter','COO, Unstoppable Domains','DNS ENS Domain Tokens','#14B8A6','Leading digital-identity / Web3 domains at Unstoppable.','sandy_carter','linkedin','not_started','Source: Cross-reference'),
('domains','Matthew Gould','Co-Founder & CEO, Unstoppable Domains','DNS ENS Domain Tokens','#14B8A6','Pioneer of human-readable Web3 addresses.','sandymills','twitter_dm','not_started','Source: Cross-reference'),

-- ─── DeSci · Longevity Tokenization ──────────────────────────────────────
('desci','Anthony Schwartz','Founder, Artan Bio','DeSci · Longevity Tokenization','#84CC16','First tokenized biotech startup; NFC Longevity Day speaker.','','email','not_started','Source: NFC Summit Longevity Day'),
('desci','Marvin Amberg','Founder, naturalX Health Ventures (€100M fund)','DeSci · Longevity Tokenization','#84CC16','Running one of the biggest longevity venture funds.','marvinamberg','linkedin','not_started','Source: NFC Summit Longevity Day'),
('desci','Sebastian Brunemeier','Co-Founder & Partner, LongGame Ventures','DeSci · Longevity Tokenization','#84CC16','DeSci + longevity investor with technical depth.','sebastianbrunem','linkedin','not_started','Source: NFC Summit Longevity Day'),
('desci','Vincent Weisser','Co-Founder, Montelibero / VitaDAO contributor','DeSci · Longevity Tokenization','#84CC16','Longevity DAO pioneer; bridging DeSci and onchain funding.','vincentweisser','twitter_dm','not_started','Source: Cross-reference'),

-- ─── NFT Marketplaces ────────────────────────────────────────────────────
('marketplaces','Fredrik Haga','CEO, Dune','NFT Marketplaces','#38BDF8','Dune is the de-facto dashboarding layer for NFT + DeFi markets.','hagaetc','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('marketplaces','Alex Svanevik','CEO, Nansen','NFT Marketplaces','#38BDF8','Nansen labels wallets and tracks smart-money flows across marketplaces.','ASvanevik','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('marketplaces','Eric Turner','CEO, Messari','NFT Marketplaces','#38BDF8','Messari data powers most institutional market reports.','eric_turner','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('marketplaces','Haider Rafique','Global Managing Partner & CMO, OKX','NFT Marketplaces','#38BDF8','OKX marketplace/exchange lead; prolific in industry media.','Haider','twitter_dm','not_started','Source: Consensus 2026 / TOKEN2049'),
('marketplaces','Mert Mumtaz','CEO, Helius','NFT Marketplaces','#38BDF8','Solana infra that powers most NFT + memecoin tooling.','0xmert_','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025'),
('marketplaces','Brad Garlinghouse','CEO, Ripple','NFT Marketplaces','#38BDF8','Ripple operates crypto-payments rails + now NFT marketplaces.','bgarlinghouse','email','not_started','Source: Consensus 2026'),
('marketplaces','Arjun Sethi','Co-CEO, Kraken','NFT Marketplaces','#38BDF8','Kraken is expanding into NFT + prediction markets.','arjunsethi','email','not_started','Source: Consensus 2026'),
('marketplaces','Armani Ferrante','Founder, Backpack','NFT Marketplaces','#38BDF8','Backpack Exchange + xNFTs; active builder voice.','armaniferrante','twitter_dm','not_started','Source: TOKEN2049 Dubai 2025');

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- NOTES
-- ═══════════════════════════════════════════════════════════════════════════
-- • All speakers default to outreach_status = 'not_started' so they populate
--   the Admin Speakers & Outreach queue immediately.
-- • Resources link to the official speaker / event URL so admins can grab
--   a thumbnail and finalise copy from the Admin UI.
-- • Some speakers are cross-listed under more than one vertical (e.g. Yat
--   Siu appears under gaming + brands, Illia under ai + infra) because
--   their content genuinely serves both tracks. Deduplicate in the admin UI
--   if preferred.
-- • The ENS / Unstoppable entries are cross-references (no competitor-event
--   attribution) but are essential for the domains vertical — feel free to
--   reclassify outreach_notes.
-- ═══════════════════════════════════════════════════════════════════════════
