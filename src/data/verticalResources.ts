export interface VerticalResource {
  title: string;
  url: string;
  type: 'blog' | 'youtube' | 'podcast' | 'tweet' | 'paper' | 'news';
  date: string;
  source: string;
  topicTag: string;
  description?: string;
  image?: string;
  displayOrder?: number | null;
}

// Last updated: 2026-03-31
export const VERTICAL_RESOURCES: Record<string, VerticalResource[]> = {

  /* ── AI Agent Identity ── */
  ai: [
    { title: 'AI Agents Gain Trust Via Ethereum: ERC-8004 On Mainnet', url: 'https://www.forbes.com/sites/digital-assets/2026/02/05/ai-agents-gain-trust-via-ethereum-erc-8004-on-mainnet/', type: 'news', date: '2026-02-05', source: 'Forbes', topicTag: 'ERC-8004 & Non-Fungible Agents', description: 'ERC-8004 is live on Ethereum mainnet, adding standard identity and reputation registries for AI agents — each agent identity is an NFT.', image: 'https://imageio.forbes.com/specials-images/imageserve/6984d1219027936a9450b3cd/0x0.jpg?format=jpg&height=900&width=1600&fit=bounds' },
    { title: 'ERC-8004: A Developer\'s Guide to Trustless AI Agent Identity', url: 'https://blog.quicknode.com/erc-8004-a-developers-guide-to-trustless-ai-agent-identity/', type: 'blog', date: '2026-03-04', source: 'QuickNode', topicTag: 'ERC-8004 & Non-Fungible Agents', description: 'Technical guide to ERC-8004 on-chain registries that enable AI agent discovery, reputation, and trust through NFT-based identity.', image: 'https://blog.quicknode.com/content/images/size/w1200/2026/03/March-Blog-2x1s--1-.png' },
    { title: 'ERC-8004 Gives AI Agents Identity. RedStone and Credora Power Them with Data', url: 'https://blog.redstone.finance/2026/02/12/erc-8004-gives-ai-agents-identity-redstone-and-credora-power-them-with-data-and-risk-intelligence/', type: 'blog', date: '2026-02-12', source: 'RedStone Finance', topicTag: 'ERC-8004 & Non-Fungible Agents', description: 'Every AI agent registers by minting an NFT — simple, elegant, tamper-proof. The token ID becomes the agent\'s unique identifier.' },
    { title: 'The Identity Problem in Agentic Commerce: How ENS Can Enable Trust for AI Agents', url: 'https://ens.domains/blog/post/ens-ai-agent-erc8004', type: 'blog', date: '2026-01-15', source: 'ENS Labs', topicTag: 'Agent Reputation & Credentials', description: 'How ENS naming integrates with ERC-8004 to give AI agents human-readable, verifiable on-chain identities.', image: 'https://ens.domains/_next/static/media/cover.3de06369.webp' },
    { title: 'Onchain AI Identity: What ERC-8004 Unlocks for Agent Infrastructure', url: 'https://allium.so/blog/onchain-ai-identity-what-erc-8004-unlocks-for-agent-infrastructure/', type: 'blog', date: '2026-02-01', source: 'Allium', topicTag: 'ERC-8004 & Non-Fungible Agents', description: 'How ERC-8004 creates a trust layer allowing AI agents to work together with NFT-based verifiable credentials.' },
    { title: 'Why "Trust the AI" Is Now Your Biggest Security Hole', url: 'https://www.youtube.com/watch?v=OMb5oTlC_q0', type: 'youtube', date: '2026-02-22', source: 'Nate B. Jones', topicTag: 'Agent Reputation & Credentials', description: 'AI strategist Nate Jones argues autonomous agents need structural trust architecture — authenticated identity, reputation systems, and behavioral monitoring.' },
    { title: 'The Compounding Gap That Makes 2026 the Last Chance to Catch Up', url: 'https://www.youtube.com/watch?v=pOb0pjXpn6Q', type: 'youtube', date: '2026-01-01', source: 'Nate B. Jones', topicTag: 'Autonomous Stablecoin Payments', description: 'Nate Jones on why autonomous agents will need identity layers, permissions, audit logs, and agent control panes — the case for on-chain agent infrastructure.' },
    { title: 'ERC-8004 + x402 AI Agent Registry Explained', url: 'https://www.youtube.com/watch?v=dIqt1T7XdUI', type: 'youtube', date: '2026-01-20', source: 'Ethereum AI', topicTag: 'ERC-8004 & Non-Fungible Agents', description: 'Video explainer of the world\'s first trustless AI agent economy — NFT-based identity paired with HTTP 402 payments.' },
  ],

  /* ── DeFi & Capital Markets ── */
  defi: [
    { title: 'NFT-Fi in 2025: The Rise of NFT Collateralization and Perpetual Rentals', url: 'https://www.codezeros.com/nftfi-in-2025-the-rise-of-nft-collateralization-and-perpetual-rentals', type: 'blog', date: '2025-01-01', source: 'Codezeros', topicTag: 'NFT-Collateralized Lending', description: 'Examines NFT lending platforms covering collateralization, peer-to-peer loans, and dynamic pricing models.' },
    { title: 'NFT-Backed Loans Market: Global Analysis Report 2025-2035', url: 'https://www.futuremarketinsights.com/reports/nft-backed-loans-market', type: 'paper', date: '2025-01-01', source: 'Future Market Insights', topicTag: 'Fractionalized NFT Securities', description: 'Analyzes the NFT-backed loans market, highlighting fractionalized NFT lending as a key growth pathway.' },
    { title: 'Real-World Assets on Ethereum: The Trillion-Dollar Opportunity', url: 'https://www.coindesk.com/consensus-magazine/2024/03/15/real-world-assets-tokenization/', type: 'news', date: '2024-03-15', source: 'CoinDesk', topicTag: 'Real-World Asset Tokenization', description: 'Institutional adoption of tokenized real estate, treasuries, and commodities.' },
    { title: 'State of DeFi 2025', url: 'https://www.dlnews.com/research/internal/state-of-defi-2025/', type: 'news', date: '2025-01-01', source: 'DL News', topicTag: 'Institutional DeFi & Stablecoin Rails', description: 'Details DeFi maturation into a layered system with credit and yield evolving toward stablecoin-native structures.' },
  ],

  /* ── On-Chain Infrastructure ── */
  infra: [
    { title: 'ENS Is Staying on Ethereum', url: 'https://ens.domains/blog/post/ens-staying-on-ethereum', type: 'blog', date: '2026-02-01', source: 'ENS Labs', topicTag: 'ENS & On-Chain Naming Systems', description: 'ENSv2 will deploy exclusively on Ethereum L1 rather than a planned Layer 2, citing massive gas fee reductions.' },
    { title: 'ENSv2: The Next Generation of ENS', url: 'https://ens.domains/blog/post/ensv2', type: 'blog', date: '2024-06-01', source: 'ENS Labs', topicTag: 'ENS & On-Chain Naming Systems', description: 'Proposes ENS expansion with architectural improvements to the Ethereum naming protocol.' },
    { title: 'Zero-Knowledge Proofs in Blockchain Finance: Opportunity vs. Reality', url: 'https://corporates.db.com/files/documents/publications/Zero-Knowledge-Proofs-in-Blockchain-Finance-Opportunity-vs-Reality.pdf', type: 'paper', date: '2024-01-01', source: 'Deutsche Bank', topicTag: 'ZK Identity & Verifiable Credentials', description: 'Examines zero-knowledge proofs in blockchain finance and their role in identity verification without revealing personal data.' },
    { title: 'Chainlink in 2025: The Final Stage of Blockchain Adoption', url: 'https://blog.chain.link/chainlink-2025/', type: 'blog', date: '2025-01-01', source: 'Chainlink', topicTag: 'Cross-Chain Interoperability', description: 'Outlines the Chainlink Runtime Environment as core on-chain infrastructure for data, identity, and connectivity.' },
  ],

  /* ── Gaming & Virtual Economies ── */
  gaming: [
    { title: 'Immutable Passport Hits 5 Million Signups', url: 'https://www.immutable.com/blog/passport-milestone', type: 'news', date: '2025-02-10', source: 'Immutable', topicTag: 'Player-Owned Asset Economies', description: 'The growth of web3 gaming infrastructure and what it means for player-owned assets.' },
    { title: 'Gaming NFT Market Size & Growth Forecasts 2025-2034', url: 'https://www.gminsights.com/industry-analysis/gaming-nft-market', type: 'paper', date: '2024-06-01', source: 'Global Market Insights', topicTag: 'Player-Owned Asset Economies', description: 'Details the gaming NFT sector growth from $4.8B in 2024 at 24.8% CAGR, driven by true ownership of in-game assets.' },
    { title: 'State of Blockchain Gaming in 2025', url: 'https://games.gg/news/state-of-blockchain-gaming-in-2025/', type: 'news', date: '2025-01-01', source: 'games.gg', topicTag: 'Sustainable Play-and-Earn', description: 'Comprehensive overview of live and upcoming crypto games, examining Web3, NFT, and token economy integrations.' },
  ],

  /* ── Social NFTs ── */
  social: [
    { title: 'Farcaster vs Lens: SocialFi Web3 Social Graph', url: 'https://blockeden.xyz/blog/2026/01/13/farcaster-vs-lens-socialfi-web3-social-graph/', type: 'blog', date: '2026-01-13', source: 'BlockEden', topicTag: 'Dynamic Social Tokens', description: 'Compares Farcaster and Lens Protocol as competing platforms for Web3 social media and decentralized social graphs.' },
    { title: 'Farcaster in 2025: The Protocol Paradox', url: 'https://blockeden.xyz/blog/2025/10/28/farcaster-in-2025-the-protocol-paradox/', type: 'blog', date: '2025-10-28', source: 'BlockEden', topicTag: 'Community Co-Creation & Remixing', description: 'Analyzes Farcaster challenges and evolution as a decentralized social protocol in the SocialFi space.' },
  ],

  /* ── Creator Economy ── */
  creator: [
    { title: 'NFTs for Content Creators: Monetize Digital Art in 2025', url: 'https://www.cypherock.com/blogs/nfts-and-the-empowerment-of-content-creators', type: 'blog', date: '2025-01-21', source: 'Cypherock', topicTag: 'On-Chain Royalty Enforcement', description: 'Details how content creators set royalty percentages when minting NFTs, enabling ongoing earnings from resales.' },
    { title: 'The Comprehensive Guide to NFT Royalties', url: 'https://www.platinumcryptoacademy.com/cryptocurrency-investment/the-comprehensive-guide-to-nft-royalties-in-2024-understanding-the-future-of-digital-ownership/', type: 'blog', date: '2024-01-01', source: 'Platinum Crypto Academy', topicTag: 'On-Chain Royalty Enforcement', description: 'Explains how creators embed royalties into NFT smart contracts during minting, ensuring automatic payments on resales.' },
  ],

  /* ── Brands & Engagement ── */
  brands: [
    { title: 'Best Web3 Loyalty Programs for eCommerce (2025)', url: 'https://blog.mintology.app/best-web3-loyalty-programs-ecommerce/', type: 'blog', date: '2025-01-01', source: 'Mintology', topicTag: 'NFT Loyalty Programs', description: 'Details top NFT-based loyalty programs including Starbucks Odyssey stamps, Nike SNKRS tokens, and Alo Yoga digital twins.' },
    { title: 'NFT Marketing Trends to Watch in 2025: AI, Consumer Behavior', url: 'https://www.blockchainappfactory.com/blog/nft-marketing-trends-2025/', type: 'blog', date: '2025-01-01', source: 'Blockchain App Factory', topicTag: 'Token-Gated Commerce', description: 'Explores 2025 NFT marketing trends including loyalty rewards and phygital goods with brand case studies.' },
    { title: 'IYK: Bridging Physical Products to On-Chain', url: 'https://www.iyk.app/', type: 'blog', date: '2024-11-05', source: 'IYK', topicTag: 'Phygital Products & Authentication', description: 'NFC-to-blockchain infrastructure connecting physical goods with digital ownership.' },
  ],

  /* ── Culture, Art & Music (incl. Communities) ── */
  culture: [
    { title: 'Art Blocks and the Generative Art Movement', url: 'https://www.artblocks.io/', type: 'blog', date: '2024-06-15', source: 'Art Blocks', topicTag: 'On-Chain Generative Art', description: 'The platform that turned code-based art into a legitimate artistic medium with on-chain generative collections.' },
    { title: 'Royal: Fans Can Now Own Music Royalties', url: 'https://royal.io/', type: 'blog', date: '2024-10-20', source: 'Royal', topicTag: 'Music Royalty NFTs', description: 'How Royal lets fans invest in songs and earn alongside their favorite artists through tokenized royalty shares.' },
    { title: 'Digital Art Isn\'t Dead — But It Is at a Crossroads', url: 'https://nftnow.com/newsletter/now-newsletter-digital-art-isnt-dead-but-it-is-at-a-crossroads/', type: 'news', date: '2024-10-01', source: 'nft now', topicTag: 'On-Chain Generative Art', description: 'Covers Q4 2024 digital art NFT market trends, trading volumes, and the state of the art NFT ecosystem.' },
    { title: 'DAO Models to Watch: From Protocol DAOs to Community DAOs', url: 'https://digitap.app/news/guide/dao-models-to-watch-in-2025', type: 'news', date: '2025-01-01', source: 'Digitap', topicTag: 'DAO-Governed Collections', description: 'Highlights community DAOs where membership NFTs grant voting rights, exclusive access, and transparent governance.' },
    { title: 'DAO-Enabled NFT Platforms: Ultimate Guide', url: 'https://www.rapidinnovation.io/post/all-about-dao-enabled-nft-platform', type: 'blog', date: '2024-01-01', source: 'Rapid Innovation', topicTag: 'DAO-Governed Collections', description: 'Explains how DAO-enabled NFT platforms use community governance via tokens for voting on NFT minting and collective ownership.' },
  ],

  /* ── RWA Tokenization ── */
  rwa: [
    { title: 'BlackRock Brings Its Tokenized Money Market Fund to Multiple Chains', url: 'https://www.coindesk.com/business/2024/11/13/blackrock-buidl-fund-tokenized', type: 'news', date: '2024-11-13', source: 'CoinDesk', topicTag: 'Tokenized Treasuries', description: 'BlackRock BUIDL fund expands cross-chain, signaling institutional demand for onchain treasury exposure.' },
    { title: 'Real-World Assets on Ethereum: The Trillion-Dollar Opportunity', url: 'https://www.coindesk.com/consensus-magazine/2024/03/15/real-world-assets-tokenization/', type: 'news', date: '2024-03-15', source: 'CoinDesk', topicTag: 'Real Estate Tokenization', description: 'Institutional adoption of tokenized real estate, treasuries, and commodities reshapes capital markets.' },
    { title: 'Ondo Finance: Tokenized Treasuries for the World', url: 'https://ondo.finance/', type: 'blog', date: '2024-09-01', source: 'Ondo Finance', topicTag: 'Tokenized Treasuries', description: 'Leading platform for tokenized US Treasuries with permissionless access and 24/7 settlement.' },
  ],

  /* ── DNS ENS Domain Tokens ── */
  domains: [
    { title: 'ENS Is Staying on Ethereum', url: 'https://ens.domains/blog/post/ens-staying-on-ethereum', type: 'blog', date: '2026-02-01', source: 'ENS Labs', topicTag: 'ENS as the Identity Layer', description: 'ENSv2 deploys exclusively on Ethereum L1, citing massive gas fee reductions and identity layer commitments.' },
    { title: 'ENSv2: The Next Generation of ENS', url: 'https://ens.domains/blog/post/ensv2', type: 'blog', date: '2024-06-01', source: 'ENS Labs', topicTag: 'ENS as the Identity Layer', description: 'Architectural improvements to the Ethereum naming protocol designed to scale onchain identity.' },
    { title: 'The Identity Problem in Agentic Commerce: How ENS Can Enable Trust for AI Agents', url: 'https://ens.domains/blog/post/ens-ai-agent-erc8004', type: 'blog', date: '2026-01-15', source: 'ENS Labs', topicTag: 'AI Agent Naming', description: 'How ENS naming integrates with ERC-8004 to give AI agents human-readable, verifiable on-chain identities.' },
  ],

  /* ── DeSci · Longevity Tokenization ── */
  desci: [
    { title: 'VitaDAO: Decentralized Funding for Longevity Research', url: 'https://www.vitadao.com/', type: 'blog', date: '2024-09-01', source: 'VitaDAO', topicTag: 'Tokenized Longevity IP', description: 'The leading DeSci DAO funding longevity research with IP-NFTs representing ownership of breakthrough science.' },
    { title: 'IP-NFTs: A Primer on Tokenized Intellectual Property', url: 'https://medium.com/molecule-blog/ip-nfts-a-primer-on-tokenized-intellectual-property', type: 'blog', date: '2024-06-15', source: 'Molecule', topicTag: 'IP-NFT Licensing', description: 'How IP-NFTs let researchers tokenize patents, data, and discoveries while encoding programmable licensing terms.' },
    { title: 'The DeSci Movement: Decentralizing Science Funding', url: 'https://www.coindesk.com/web3/desci-decentralized-science-funding', type: 'news', date: '2025-02-15', source: 'CoinDesk', topicTag: 'Research DAOs', description: 'How research DAOs are challenging traditional grant models for biotech and longevity research.' },
  ],

  /* ── NFT Marketplaces ── */
  marketplaces: [
    { title: 'OpenSea Investment Analysis 2025: OS2 Platform, SEA Token', url: 'https://regolith.com/news/opensea-investment-analysis-2025-58', type: 'news', date: '2025-08-01', source: 'Regolith', topicTag: 'Marketplace Aggregation', description: 'Analyzes OpenSea market position, the OS2 platform supporting 19 blockchains, and the SEA token launch.' },
    { title: 'Top 10 NFT Marketplaces by Trading Volume in 2025', url: 'https://blocksurvey.io/web3-guides/top-nft-marketplaces', type: 'blog', date: '2025-04-01', source: 'BlockSurvey', topicTag: 'Marketplace Aggregation', description: 'Ranks NFT marketplaces by 2025 trading volume, highlighting gamified rewards and competition from Blur and Magic Eden.' },
  ],
};
