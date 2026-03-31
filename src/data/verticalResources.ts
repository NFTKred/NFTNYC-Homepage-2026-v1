export interface VerticalResource {
  title: string;
  url: string;
  type: 'blog' | 'youtube' | 'podcast' | 'tweet' | 'paper' | 'news';
  date: string;
  source: string;
  topicTag: string;
  description?: string;
}

// Last updated: 2026-03-31
export const VERTICAL_RESOURCES: Record<string, VerticalResource[]> = {

  /* ── AI Agent Identity ── */
  ai: [
    { title: 'New Whitepaper Tackles AI Agent Identity Challenges', url: 'https://openid.net/new-whitepaper-tackles-ai-agent-identity-challenges/', type: 'news', date: '2025-10-07', source: 'OpenID Foundation', topicTag: 'Agent Reputation & Credentials', description: 'Whitepaper on securely authenticating and authorizing autonomous AI agents operating across decentralized systems.' },
    { title: 'ERC-8004: A New Standard for AI Agent Identity', url: 'https://eips.ethereum.org/EIPS/eip-8004', type: 'paper', date: '2024-11-15', source: 'Ethereum EIPs', topicTag: 'ERC-8004 & Non-Fungible Agents', description: 'The formal EIP proposal for on-chain AI agent reputation and identity tokens.' },
    { title: 'The Rise of AI Agents in Web3', url: 'https://www.coindesk.com/tech/2025/01/14/the-rise-of-ai-agents-in-web3/', type: 'news', date: '2025-01-14', source: 'CoinDesk', topicTag: 'Open Wallet Standard for Agents', description: 'How autonomous AI agents with crypto wallets are creating a new paradigm for on-chain activity.' },
    { title: 'The Future of Autonomous Trading — Crypto AI Agents', url: 'https://www.codezeros.com/what-are-crypto-ai-agents-the-future-of-autonomous-trading-in-2025', type: 'blog', date: '2025-01-01', source: 'Codezeros', topicTag: 'Open Wallet Standard for Agents', description: 'Explores crypto AI agents blockchain interaction layers for autonomous trading and DeFi.' },
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

  /* ── NFT Communities ── */
  communities: [
    { title: 'DAO Models to Watch in 2025: From Protocol DAOs to Community DAOs', url: 'https://digitap.app/news/guide/dao-models-to-watch-in-2025', type: 'news', date: '2025-01-01', source: 'Digitap', topicTag: 'DAO-Governed Collections', description: 'Highlights community DAOs where membership NFTs grant voting rights, exclusive access, and transparent governance.' },
    { title: 'DAO-Enabled NFT Platforms: Ultimate Guide', url: 'https://www.rapidinnovation.io/post/all-about-dao-enabled-nft-platform', type: 'blog', date: '2024-01-01', source: 'Rapid Innovation', topicTag: 'DAO-Governed Collections', description: 'Explains how DAO-enabled NFT platforms use community governance via tokens for voting on NFT minting and collective ownership.' },
  ],

  /* ── Creator & IP Economy ── */
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

  /* ── Culture: Art & Music ── */
  culture: [
    { title: 'Digital Art Isn\'t Dead — But It Is at a Crossroads', url: 'https://nftnow.com/newsletter/now-newsletter-digital-art-isnt-dead-but-it-is-at-a-crossroads/', type: 'news', date: '2024-10-01', source: 'nft now', topicTag: 'Digital Art Market Infrastructure', description: 'Covers Q4 2024 digital art NFT market trends, trading volumes, and the state of the art NFT ecosystem.' },
    { title: 'Art Blocks and the Generative Art Movement', url: 'https://www.artblocks.io/', type: 'blog', date: '2024-06-15', source: 'Art Blocks', topicTag: 'On-Chain Generative Art', description: 'The platform that turned code-based art into a legitimate artistic medium with on-chain generative collections.' },
    { title: 'Royal: Fans Can Now Own Music Royalties', url: 'https://royal.io/', type: 'blog', date: '2024-10-20', source: 'Royal', topicTag: 'Music Royalty NFTs', description: 'How Royal lets fans invest in songs and earn alongside their favorite artists through tokenized royalty shares.' },
  ],

  /* ── NFT Marketplaces ── */
  marketplaces: [
    { title: 'OpenSea Investment Analysis 2025: OS2 Platform, SEA Token', url: 'https://regolith.com/news/opensea-investment-analysis-2025-58', type: 'news', date: '2025-08-01', source: 'Regolith', topicTag: 'Marketplace Aggregation', description: 'Analyzes OpenSea market position, the OS2 platform supporting 19 blockchains, and the SEA token launch.' },
    { title: 'Top 10 NFT Marketplaces by Trading Volume in 2025', url: 'https://blocksurvey.io/web3-guides/top-nft-marketplaces', type: 'blog', date: '2025-04-01', source: 'BlockSurvey', topicTag: 'Marketplace Aggregation', description: 'Ranks NFT marketplaces by 2025 trading volume, highlighting gamified rewards and competition from Blur and Magic Eden.' },
  ],
};
