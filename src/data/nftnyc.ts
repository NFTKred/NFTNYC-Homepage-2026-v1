export interface Ecosystem {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  desc: string;
  examples: string[];
  subs: string[];
}

export interface Speaker {
  name: string;
  role: string;
  eco: string;
  ecoColor: string;
  why: string;
  handle: string;
}

export const ECOSYSTEMS: Ecosystem[] = [
  { id: 'ai', name: 'AI Agent Identity', subtitle: 'ERC-8004 Reputation', icon: '🤖', color: '#3B82F6',
    desc: 'NFTs provide authenticity, ownership, and monetization rails for AI-generated and agent-driven systems. Autonomous agents with wallets use ERC-8004 for on-chain identity and portable reputation.',
    examples: ['AIcred.ai', 'ERC-8004', 'Autonomous Wallets'],
    subs: ['AIcred.ai', 'Autonomous Wallets'] },
  { id: 'gaming', name: 'Gaming & Virtual Economies', subtitle: 'Player-Owned Assets', icon: '🎮', color: '#8B5CF6',
    desc: 'Web3 gaming studios, fully on-chain games, virtual assets, digital fashion, interoperable items, and player-owned economies.',
    examples: ['Empire.Kred', 'HotGarage.Kred', 'Immutable'],
    subs: ['Empire.Kred', 'HotGarage.Kred'] },
  { id: 'infra', name: 'On-Chain Infrastructure', subtitle: 'ENS, L1/L2, ZK Identity', icon: '⛓️', color: '#06B6D4',
    desc: 'Layer 1 and Layer 2 blockchains, rollups, wallets, ZK identity, NFT liquidity layers, and fully on-chain systems.',
    examples: ['ENS', 'NFT Developer Apps'],
    subs: ['ENS', 'NFT Dev Apps'] },
  { id: 'social', name: 'Social NFTs', subtitle: 'Collaborative Art & Moots', icon: '🎨', color: '#EC4899',
    desc: 'Collaborative and community-driven digital art projects merging social interaction with generative AI and on-chain provenance.',
    examples: ['GangUp Project', 'Artist Moots'],
    subs: ['GangUp Project', 'Artist Moots'] },
  { id: 'communities', name: 'NFT Communities', subtitle: 'Identity & Belonging', icon: '👥', color: '#EF4444',
    desc: 'Internet-native communities, NFT-native media platforms, creator-led ecosystems, and meme culture.',
    examples: ['Hot Wheels NFT', 'Meme Culture'],
    subs: ['Hot Wheels NFT', 'Meme Culture'] },
  { id: 'creator', name: 'Creator & IP Economy', subtitle: 'Community-Owned IP', icon: '💡', color: '#F59E0B',
    desc: 'Community-owned IP, NFT membership models, music and film ownership, token-gated media, and revitalized brands.',
    examples: ['Token-Gated Media', 'Brand Revival'],
    subs: ['Token-Gated Media', 'Brand Revival'] },
  { id: 'defi', name: 'DeFi & Capital Markets', subtitle: 'NFT Lending & RWA', icon: '💰', color: '#10B981',
    desc: 'NFT lending, fractionalization, real-world assets via NFTs, DeFi infrastructure, and meme coins as community capital.',
    examples: ['NFT Lending', 'Fractionalization'],
    subs: ['NFT Lending', 'Fractionalization'] },
  { id: 'brands', name: 'Brands & Engagement', subtitle: 'Loyalty, Phygital, Ticketing', icon: '🏷️', color: '#F97316',
    desc: 'NFT-based loyalty programs, phygital authentication, NFT ticketing, digital collectibles, and retail integrations.',
    examples: ['Phygital Auth', 'NFT Ticketing'],
    subs: ['Phygital Auth', 'NFT Ticketing'] },
  { id: 'culture', name: 'Culture: Art & Music', subtitle: 'On-Chain Attribution', icon: '🎵', color: '#D946EF',
    desc: 'Digital art, generative art, AI-generated art with on-chain attribution, music royalty ownership.',
    examples: ['Generative Art', 'Music Ownership'],
    subs: ['Generative Art', 'Music Ownership'] },
  { id: 'marketplaces', name: 'NFT Marketplaces', subtitle: 'Royalty Infrastructure', icon: '🏪', color: '#38BDF8',
    desc: 'Marketplace infrastructure, royalty systems, creator coin models, and new distribution mechanisms.',
    examples: ['Royalties', 'Creator Coins'],
    subs: ['Royalties', 'Creator Coins'] }
];

export const CONNECTIONS: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 5], [0, 6], [0, 7], [0, 9],
  [1, 2], [1, 4], [1, 6], [1, 9],
  [2, 6], [2, 9],
  [3, 4], [3, 5], [3, 8],
  [4, 5], [4, 7],
  [5, 8], [5, 9],
  [6, 7], [6, 9],
  [7, 8], [7, 9],
  [8, 9]
];

export const SPEAKERS: Speaker[] = [
  { name: 'Nate B. Jones', role: 'AI Strategist / AIcred.ai', eco: 'AI Agent Identity', ecoColor: '#3B82F6', why: 'Co-creator of AIcred.ai, former Amazon exec. Frames ERC-8004 as the "digital passport" for AI agents.', handle: 'NateBJones' },
  { name: 'Robbie Ferguson', role: 'Co-Founder & President, Immutable', eco: 'Gaming & Virtual Economies', ecoColor: '#8B5CF6', why: 'Built the largest Web3 gaming infrastructure: 700+ games, 5M+ Passport signups.', handle: '0xferg' },
  { name: 'Nick Johnson', role: 'Founder & Lead Developer, ENS', eco: 'On-Chain Infrastructure', ecoColor: '#06B6D4', why: 'Former Google engineer. ENS names are NFTs — the original on-chain identity token.', handle: 'nicksdjohnson' },
  { name: 'Pindar Van Arman', role: 'AI Artist & Generative Art Pioneer', eco: 'Social NFTs', ecoColor: '#EC4899', why: '20+ years building painting robots. GangUp merges social collaboration with generative AI.', handle: 'PindarVanArman' },
  { name: 'Roham Gharegozlou', role: 'CEO & Co-Founder, Dapper Labs', eco: 'NFT Communities', ecoColor: '#EF4444', why: 'Created CryptoKitties and NBA Top Shot. Brought 2M+ non-crypto users onto blockchain.', handle: 'roham' },
  { name: 'Bearsnake', role: 'COO, Magic Machine (Forgotten Runes)', eco: 'Creator & IP Economy', ecoColor: '#F59E0B', why: 'Turned down a Hollywood buyout to keep IP community-owned. MMORPG on Nintendo/PlayStation/Xbox.', handle: 'BearSnake' },
  { name: 'Stephen Young', role: 'Founder & CEO, NFTfi', eco: 'DeFi & Capital Markets', ecoColor: '#10B981', why: 'Built the first NFT lending protocol. 60,000+ loans, zero security incidents.', handle: 'stephen_yo' },
  { name: 'Chris Lee', role: 'Co-Founder, IYK', eco: 'Brands & Engagement', ecoColor: '#F97316', why: 'Infrastructure connecting physical products to on-chain NFTs via NFC. Backed by a16z.', handle: 'clee681' },
  { name: 'Justin Blau (3LAU)', role: 'DJ/Producer & CEO, Royal', eco: 'Culture: Art & Music', ecoColor: '#D946EF', why: 'Sold the first tokenized album ($11.7M). Royal lets fans own streaming royalties.', handle: '3LAU' },
  { name: 'Jacob Horne', role: 'Co-Founder & CEO, Zora', eco: 'NFT Marketplaces', ecoColor: '#38BDF8', why: 'Forbes 30 Under 30. $353M trading volume, $27M paid to creators.', handle: 'js_horne' }
];

export const FEED_POSTS = [
  { title: 'Relay the NFT Rat is alive in Times Square', color: '#3B82F6' },
  { title: 'Open call for 2026 NFT art on Collect.Kred', color: '#8B5CF6' },
  { title: 'Social art, Connects us all', color: '#EC4899' },
  { title: 'Tokenised agentic identity', color: '#06B6D4' },
  { title: 'Abandoned communities and NFTs rescued', color: '#EF4444' },
  { title: 'Featured artist hubs', color: '#F59E0B' },
  { title: 'Your journey to NFT.NYC 2026', color: '#10B981' }
];
