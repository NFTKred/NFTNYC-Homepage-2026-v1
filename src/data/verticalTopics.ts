export interface VerticalTopic {
  label: string;
  description: string;
  status: 'key' | 'emerging';
}

export const VERTICAL_TOPICS: Record<string, VerticalTopic[]> = {
  /* ── AI Agent Identity ── */
  ai: [
    { label: 'ERC-8004 & Non-Fungible Agents', description: 'ERC-8004 establishes verifiable on-chain identities for AI agents, enabling Non-Fungible Agents that own wallets, hold funds, and execute tasks autonomously without per-transaction human approval.', status: 'emerging' },
    { label: 'Open Wallet Standard for Agents', description: 'Protocols like MoonPay OWS and Coinbase Agentic Wallets give AI agents unified encrypted vaults across blockchains, with policy controls like spending limits for autonomous agent-to-agent commerce.', status: 'emerging' },
    { label: 'Agent Reputation & Credentials', description: 'Tokenized identity layers allow AI agents to build verifiable on-chain reputation through transaction history and credential NFTs — critical as agents increasingly outnumber human identities in financial services.', status: 'emerging' },
    { label: 'AI Content Provenance', description: 'NFTs serve as authenticity certificates for AI-generated media, establishing origin and ownership in a world of synthetic content through tamper-proof on-chain attribution.', status: 'emerging' },
    { label: 'Autonomous Stablecoin Payments', description: 'AI agents are projected to drive measurable stablecoin transaction volume, using crypto wallets as the natural payment rail for non-human economic actors operating across chains.', status: 'emerging' },
  ],

  /* ── DeFi & Capital Markets ── */
  defi: [
    { label: 'Real-World Asset Tokenization', description: 'Tokenized bonds, commercial paper, and equities enable 24/7 on-chain trading and atomic settlement, with major institutional pilots driving billions in tokenized volume.', status: 'key' },
    { label: 'NFT-Collateralized Lending', description: 'Protocols like NFTfi allow holders to borrow against digital assets without selling, unlocking liquidity from illiquid collectibles and creating new yield opportunities for lenders.', status: 'key' },
    { label: 'Institutional DeFi & Stablecoin Rails', description: 'Stablecoin volumes have surged to trillions quarterly, with institutional players using tokenized treasuries, on-chain settlement, and DeFi lending as core financial infrastructure.', status: 'key' },
    { label: 'Fractionalized NFT Securities', description: 'High-value NFTs are fractionalized into tradable shares, democratizing access to premium assets while navigating securities classification under evolving regulatory guidance.', status: 'emerging' },
    { label: 'On-Chain Equity Perpetuals', description: 'Tokenized perpetual contracts for equities and indices trade 24/7 on decentralized platforms, bridging traditional finance assets into DeFi composability.', status: 'emerging' },
  ],

  /* ── On-Chain Infrastructure ── */
  infra: [
    { label: 'Smart Wallet Account Abstraction', description: 'ERC-4337 smart wallets serve as unified on-chain identities governed by programmable smart contracts, enabling gasless transactions, social recovery, and holding assets beyond currency.', status: 'key' },
    { label: 'ENS & On-Chain Naming Systems', description: 'Decentralized naming services integrate into tokenized ecosystems as human-readable wallet identifiers, supporting data marketplaces, governance, and cross-platform identity resolution.', status: 'key' },
    { label: 'ZK Identity & Verifiable Credentials', description: 'Zero-knowledge proofs enable privacy-preserving identity verification on-chain, allowing users to prove attributes without revealing underlying data across DeFi, governance, and compliance.', status: 'key' },
    { label: 'Cross-Chain Interoperability', description: 'Shared ledger architectures and cross-chain bridges extend NFT and token composability across L1/L2 networks, enabling atomic settlement and asset portability without fragmented liquidity.', status: 'key' },
    { label: 'On-Chain AI Inference Verification', description: 'Lightweight AI computations run on Layer 2 networks with cryptographic verification, enabling trustless and immutable AI outputs for high-stakes decisions like credit scoring and agent actions.', status: 'emerging' },
  ],

  /* ── Gaming & Virtual Economies ── */
  gaming: [
    { label: 'Player-Owned Asset Economies', description: 'NFTs grant players verifiable ownership of in-game items, characters, and land with free trading and resale rights, forming the basis of a multi-billion dollar market growing rapidly.', status: 'key' },
    { label: 'Sustainable Play-and-Earn', description: 'After early play-to-earn token failures, the industry pivots to skill-based reward systems with balanced token supply that maintain long-term asset value.', status: 'key' },
    { label: 'Cross-Game Interoperability', description: 'Cross-chain NFT standards allow player assets to port between game ecosystems, enabling persistent digital identities and inventories that retain utility across titles.', status: 'emerging' },
    { label: 'Dynamic Evolving NFTs', description: 'Game items represented as dynamic NFTs evolve based on player performance and achievements, creating unique provenance histories that increase asset value through gameplay.', status: 'emerging' },
    { label: 'AI-Native Game Development', description: 'AI-powered procedural generation, NPC intelligence, and asset creation pipelines reduce production costs while tokenized outputs give players ownership of AI-co-created content.', status: 'emerging' },
  ],

  /* ── Social NFTs ── */
  social: [
    { label: 'Collaborative On-Chain Art', description: 'Smart contract-based co-creation platforms let multiple artists and communities contribute to shared NFT artworks, with automated royalty splits and transparent attribution.', status: 'key' },
    { label: 'Generative Art as Social Identity', description: 'Algorithm-driven generative art NFTs serve as unique digital identities, with trait rarity and provenance fueling social signaling and community belonging across platforms.', status: 'key' },
    { label: 'Dynamic Social Tokens', description: 'Updatable NFTs grant holders evolving access rights and perks based on community participation, driving significantly higher retention than static collectibles.', status: 'emerging' },
    { label: 'Community Co-Creation & Remixing', description: 'Platforms enable token-holders to remix, extend, and build upon shared creative assets with on-chain provenance tracking, turning collectors into active contributors.', status: 'emerging' },
  ],

  /* ── Creator Economy ── */
  creator: [
    { label: 'Token-Gated Media & Memberships', description: 'Creators use NFTs to gate access to exclusive content, communities, and experiences, shifting from platform-dependent ad revenue to direct fan monetization with verifiable access rights.', status: 'key' },
    { label: 'On-Chain Royalty Enforcement', description: 'Smart contracts automate creator royalty payments on secondary sales, providing persistent revenue streams that follow the asset across marketplaces and ownership transfers.', status: 'key' },
    { label: 'Programmable IP Licensing', description: 'Protocols like Story Protocol enable on-chain IP registration and programmatic licensing, allowing creators to set machine-readable terms for how their work can be remixed and monetized.', status: 'emerging' },
    { label: 'AI Training Data as Tokenized IP', description: 'Human-created content is tokenized as IP assets that AI systems must license for training, creating a new revenue stream where creators are compensated when their work fuels AI models.', status: 'emerging' },
    { label: 'Community-Owned IP & Remixing', description: 'Platforms allow communities to collectively own and remix IP assets, with tokenized rights tracking contributions and distributing revenues programmatically.', status: 'emerging' },
  ],

  /* ── Brands & Engagement ── */
  brands: [
    { label: 'NFT Loyalty Programs', description: 'Brands deploy NFT-based loyalty systems offering dynamic rewards and exclusive access, achieving significantly higher customer retention than traditional point-based programs.', status: 'key' },
    { label: 'Phygital Products & Authentication', description: 'Physical products are linked to NFT twins via NFC chips for authenticity verification, reducing counterfeiting while creating secondary market value for branded goods.', status: 'key' },
    { label: 'NFT Ticketing & Event Access', description: 'Tokenized tickets prevent fraud, enable programmatic resale royalties back to organizers, and transform into collectible memorabilia that unlocks post-event perks.', status: 'key' },
    { label: 'Token-Gated Commerce', description: 'Brands gate exclusive product drops, content, and experiences behind NFT ownership, driving higher user engagement and creating scarcity-driven demand among digital-native consumers.', status: 'emerging' },
    { label: 'AI-Driven Brand Community Analytics', description: 'Brands use on-chain analytics and AI tools to monitor holder behavior, tailor NFT drops to collector preferences, and maintain authentic community engagement.', status: 'emerging' },
  ],

  /* ── Culture, Art & Music (incl. Communities) ── */
  culture: [
    { label: 'On-Chain Generative Art', description: 'Fully on-chain generative art creates unique algorithmic pieces at mint time with immutable provenance, establishing a category where the code itself is the collectible.', status: 'key' },
    { label: 'Music Royalty NFTs', description: 'Musicians tokenize royalty streams as NFTs, allowing fans to invest in songs and earn proportional revenue from streaming, sync licensing, and performance rights.', status: 'key' },
    { label: 'PFP Collections as Digital Identity', description: 'Profile-picture NFT collections serve as digital identity layers, enabling cross-platform recognition and token-gated access to internet-native communities.', status: 'key' },
    { label: 'DAO-Governed Collections', description: 'NFT holders use on-chain governance to vote on collection roadmaps, treasury allocation, and community initiatives, giving token-gated voting power to engaged members.', status: 'key' },
    { label: 'Meme Culture Meets NFTs', description: 'Meme-driven NFT projects bridge memecoin speculation with digital collectibles, using airdrops and community engagement to build internet-native cultural movements.', status: 'key' },
    { label: 'AI-Human Collaborative Art', description: 'Artists use AI as a co-creator to generate base assets for human refinement, with blockchain providing provenance and attribution for hybrid human-AI creative works.', status: 'emerging' },
    { label: 'Cultural Preservation Through Tokenization', description: 'Art institutions tokenize heritage works for verifiable digital preservation, enabling fractional ownership and global access while maintaining provenance records.', status: 'emerging' },
  ],

  /* ── RWA Tokenization ── */
  rwa: [
    { label: 'Tokenized Treasuries', description: 'Government bonds and money market funds are issued on-chain, offering 24/7 settlement, fractional access, and programmable yield distribution. Driven by BlackRock BUIDL, Franklin Templeton, and Ondo Finance.', status: 'key' },
    { label: 'Real Estate Tokenization', description: 'Fractional ownership of properties via NFTs and security tokens unlocks global liquidity for traditionally illiquid assets, with on-chain rent distribution and automated compliance.', status: 'key' },
    { label: 'Commodities On-Chain', description: 'Gold, silver, oil, and agricultural commodities are tokenized with verifiable physical backing, enabling 24/7 trading and use as DeFi collateral.', status: 'key' },
    { label: 'Tokenized Equities & Securities', description: 'Public and private company shares represented on-chain enable atomic settlement, programmable cap tables, and global access to traditionally restricted markets.', status: 'emerging' },
    { label: 'Programmable Compliance', description: 'Smart contracts encode regulatory requirements like KYC/AML and accreditation directly into RWA tokens, enabling permissioned trading at the asset level.', status: 'emerging' },
  ],

  /* ── DNS ENS Domain Tokens ── */
  domains: [
    { label: 'ENS as the Identity Layer', description: 'Ethereum Name Service transforms wallet addresses into human-readable names, becoming the universal identity primitive for wallets, dApps, and decentralized websites.', status: 'key' },
    { label: 'DNS to ENS Bridge', description: 'Traditional DNS domains can now be claimed and used as ENS names, bridging Web2 namespaces with onchain identity and creating universal addressing.', status: 'key' },
    { label: '.Kred Premium TLDs', description: 'Branded top-level domains issued as NFTs let projects, communities, and individuals own naming infrastructure with transferable, verifiable rights.', status: 'emerging' },
    { label: 'AI Agent Naming', description: 'As AI agents transact onchain, ENS names paired with ERC-8004 identity create human-readable, verifiable agent identifiers across the agentic economy.', status: 'emerging' },
    { label: 'Domain-Backed Reputation', description: 'Long-held, premium domain NFTs accumulate transferable reputation scores, creating a new class of digital prestige assets with measurable value.', status: 'emerging' },
  ],

  /* ── DeSci · Longevity Tokenization ── */
  desci: [
    { label: 'Tokenized Longevity IP', description: 'Anti-aging research, drug compounds, and clinical data are tokenized as IP-NFTs, enabling community ownership of breakthrough science. VitaDAO has funded over a dozen longevity studies.', status: 'key' },
    { label: 'Research DAOs', description: 'Decentralized autonomous organizations pool capital, govern research priorities, and own resulting IP — democratizing science funding outside grant bottlenecks.', status: 'key' },
    { label: 'Patient-Owned Health Data', description: 'NFTs grant patients true ownership of their genomic and medical data, letting them monetize contributions to research while preserving privacy via ZK proofs.', status: 'emerging' },
    { label: 'IP-NFT Licensing', description: 'Programmable licensing terms encoded in NFTs let researchers control how their work is commercialized, with automatic royalty splits to all contributors.', status: 'emerging' },
    { label: 'Onchain Clinical Trial Funding', description: 'Trial-specific tokens let participants and supporters fund early-stage longevity research, sharing in upside if discoveries reach commercialization.', status: 'emerging' },
  ],

  /* ── NFT Marketplaces ── */
  marketplaces: [
    { label: 'Royalty Enforcement Infrastructure', description: 'Marketplaces invest in smart contract standards for consistent creator royalty enforcement on secondary sales, addressing fragmentation where different platforms apply different rules.', status: 'key' },
    { label: 'Marketplace Aggregation', description: 'Aggregator platforms solve liquidity fragmentation by letting users compare prices and batch-purchase across OpenSea, Blur, Magic Eden, and others from a single interface.', status: 'key' },
    { label: 'Cross-Chain NFT Trading', description: 'Standards like ERC-1155 and zkEVM-based gas-free transactions enable seamless NFT trading across Ethereum, Solana, and L2 chains, reducing friction in multi-chain ecosystems.', status: 'emerging' },
    { label: 'Decentralized Marketplace Protocols', description: 'Open smart contract protocols for minting, bidding, auctions, and escrow enable permissionless marketplace creation, shifting from centralized platforms to composable trading infrastructure.', status: 'emerging' },
    { label: 'Compliance & Trust Infrastructure', description: 'KYC integration, wash trade detection, sanctions screening, and anti-bot systems become essential marketplace layers as regulatory frameworks reshape the NFT trading landscape.', status: 'emerging' },
  ],
};
