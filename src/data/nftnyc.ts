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
  { name: 'Nick Johnson', role: 'Founder & Lead Developer, ENS', eco: 'On-Chain Infrastructure', ecoColor: '#06B6D4', why: 'Former Google engineer. ENS names are NFTs - the original on-chain identity token.', handle: 'nicksdjohnson' },
  { name: 'Pindar Van Arman', role: 'AI Artist & Generative Art Pioneer', eco: 'Social NFTs', ecoColor: '#EC4899', why: '20+ years building painting robots. GangUp merges social collaboration with generative AI.', handle: 'PindarVanArman' },
  { name: 'Roham Gharegozlou', role: 'CEO & Co-Founder, Dapper Labs', eco: 'NFT Communities', ecoColor: '#EF4444', why: 'Created CryptoKitties and NBA Top Shot. Brought 2M+ non-crypto users onto blockchain.', handle: 'roham' },
  { name: 'Bearsnake', role: 'COO, Magic Machine (Forgotten Runes)', eco: 'Creator & IP Economy', ecoColor: '#F59E0B', why: 'Turned down a Hollywood buyout to keep IP community-owned. MMORPG on Nintendo/PlayStation/Xbox.', handle: 'BearSnake' },
  { name: 'Stephen Young', role: 'Founder & CEO, NFTfi', eco: 'DeFi & Capital Markets', ecoColor: '#10B981', why: 'Built the first NFT lending protocol. 60,000+ loans, zero security incidents.', handle: 'stephen_yo' },
  { name: 'Chris Lee', role: 'Co-Founder, IYK', eco: 'Brands & Engagement', ecoColor: '#F97316', why: 'Infrastructure connecting physical products to on-chain NFTs via NFC. Backed by a16z.', handle: 'clee681' },
  { name: 'Justin Blau (3LAU)', role: 'DJ/Producer & CEO, Royal', eco: 'Culture: Art & Music', ecoColor: '#D946EF', why: 'Sold the first tokenized album ($11.7M). Royal lets fans own streaming royalties.', handle: 'justinblau' },
  { name: 'Jacob Horne', role: 'Co-Founder & CEO, Zora', eco: 'NFT Marketplaces', ecoColor: '#38BDF8', why: 'Forbes 30 Under 30. $353M trading volume, $27M paid to creators.', handle: 'js_horne' }
];

export interface BrandQuote {
  name: string;
  title: string;
  company: string;
  quote: string;
}

export interface AttendeeTestimonial {
  name: string;
  quote: string;
}

export interface PressItem {
  outlet: string;
  quote: string;
  url: string;
  image: string;
  photo: string;
}

export const BRAND_QUOTES: BrandQuote[] = [
  { name: 'Raja Rajamannar', title: 'CMO', company: 'Mastercard', quote: 'This is an opportune time to discover and refine the most effective ways to engage consumers using innovative technology like NFTs.' },
  { name: 'Markus Schäfer', title: 'CTO', company: 'Mercedes-Benz', quote: 'We are consequently pursuing the digitalisation of our cars with software-driven innovations, integrating NFT art and collectibles for an innovative brand experience.' },
  { name: 'Dan Thygesen', title: 'SVP & GM Wholesale', company: 'T-Mobile', quote: 'NFTs present a unique opportunity for us to explore innovative offerings for our Wholesale customers.' },
  { name: 'Dave Torres', title: 'VP Interactive Marketing', company: "Macy's", quote: 'NFTs are redefining the marketing landscape by offering an innovative platform for storytelling and engagement.' },
  { name: 'Greg Reed', title: 'VP Technology Partnerships', company: 'Universal Pictures', quote: "Our vision with web3 is to build a foundational user-first digital universe, where a fan's relationship with entertainment is deepened and made more meaningful." },
  { name: 'Ron Friedman', title: 'VP Mattel Future Lab', company: 'Mattel', quote: 'Virtual Collectibles are an incredible new way for fans of all ages to engage with their favorite Mattel brands.' },
  { name: 'Dan Mitchell', title: 'Head of Web3', company: 'Oracle Red Bull Racing', quote: 'NFTs can create highly engaging, transparent, and ownable digital experiences that are more meaningful for fans and deliver ROI.' },
  { name: 'Jacqui Bransky', title: 'VP Web3 & Innovation', company: 'Warner Records', quote: 'We are focused on leveraging this technology to help our artists build and retain superfans.' },
  { name: 'Benjamin Blamoutier', title: 'VP Customer Experience', company: 'Lacoste', quote: 'Web3 allows us to reward other kinds of relationships with our audiences than transactional interactions.' },
  { name: 'Taha Ahmed', title: 'Chief Growth Officer', company: 'Forbes', quote: "We're continuously exploring new horizons of value creation and bringing in new experiences through NFTs and storytelling." },
  { name: 'Keith Soljacich', title: 'EVP, Head of Innovation', company: 'Publicis Media', quote: 'Web3 has a unique advantage to power the reinvention of the total brand experience and embed loyalty-driving behavior in marketing programs.' },
  { name: 'Sean Gormley', title: 'Global Concept Director', company: 'Wrangler', quote: 'Heritage brands like Wrangler have rich stories to tell and NFTs with blockchain technology unlock exciting and engaging ways to tell those stories.' },
];

export const ATTENDEE_TESTIMONIALS: AttendeeTestimonial[] = [
  { name: 'Charles Aubert', quote: 'I was blown away by the maturity of the use cases, stories and companies. Will be back next year!' },
  { name: 'Dave Carey', quote: 'Madison Square Garden is the Mecca of basketball, and NFT NYC is the Mecca of web3.' },
  { name: 'Ed Prado', quote: 'I made more valuable connections this year than any in the past.' },
  { name: 'Lauren deLisa Coleman', quote: 'NFT.NYC is becoming a more mature, power play for anyone interested in the Web3 space!' },
  { name: 'Rich Edmondson', quote: 'I had a blast at NFT.NYC. It was an honour to speak and to meet all the fine folks of Web3.' },
  { name: 'Kasin Inthaeasakul', quote: 'Once in a lifetime experiences, I flew across the world for this!' },
  { name: 'Ken Taylor', quote: 'NFT.NYC is great for networking and keeping in touch with the Web3 space.' },
  { name: 'Nate Hecker', quote: 'It was fantastic to learn where the industry maturity is currently at and the current challenges it is focused on.' },
  { name: 'Raul Salcedo', quote: 'Great conference! Creative projects, exclusive content and all the right people in the industry there!' },
  { name: 'Ty Henwood', quote: 'Fantastic venue this year, the NFTNYC team pulled off an even more well-polished event!' },
];

export const PRESS_COVERAGE: PressItem[] = [
  { outlet: 'Forbes', quote: 'The largest and most respected NFT conference in the world.', url: 'https://www.forbes.com/sites/falonfatemi/2022/06/23/how-nftnyc-grew-into-the-super-bowl-of-nfts-according-to-its-co-founder/', image: 'https://www.nft.nyc/hubfs/logo-forbes.jpeg', photo: 'https://www.nft.nyc/hubfs/forbes-testimonial.jpeg' },
  { outlet: 'New York Times', quote: 'Woodstock is actually a decent comparison to a gathering like NFT.NYC.', url: 'https://www.nytimes.com/2021/11/05/technology/nft-nyc-metaverse.html', image: 'https://www.nft.nyc/hubfs/logo-nytimes.png', photo: 'https://www.nft.nyc/hubfs/nyt-testimonial.jpg' },
  { outlet: 'Time', quote: 'The First Major NFT Conference.', url: 'https://time.com/6115274/nft-conference-parties-culture/', image: 'https://www.nft.nyc/hubfs/logo-time.jpeg', photo: 'https://www.nft.nyc/hubfs/time-testimonial.jpg' },
  { outlet: 'Fortune', quote: 'This is the fifth consecutive year NFT.NYC has attracted thousands.', url: 'https://fortune.com/crypto/2023/04/13/nft-nyc-books-bees-dna-web3-write3/', image: 'https://www.nft.nyc/hubfs/NFT.NYC%202023/Testimonials/FortuneMagazine.jpg', photo: 'https://www.nft.nyc/hubfs/fortune1.jpg' },
  { outlet: 'CoinDesk', quote: 'A momentous week for Non-Fungible Tokens.', url: 'https://www.coindesk.com/business/2021/11/05/nfts-take-over-nyc/', image: 'https://www.nft.nyc/hubfs/logo-coindesk.png', photo: 'https://www.nft.nyc/hubfs/coindesk-testimonial.jpg' },
  { outlet: 'ARTnews', quote: 'The premier Web3 conference that has served as a barometer for the crypto market since 2019.', url: 'https://www.artnews.com/art-news/market/2023-nft-nyc-conference-opening-day-1234663906/', image: 'https://www.nft.nyc/hubfs/NFT.NYC%202023/Testimonials/artnews.jpg', photo: 'https://www.nft.nyc/hubfs/ARTnews-nft100gala.jpg' },
  { outlet: 'CoinTelegraph', quote: 'A week of artistic inspiration, community networking and developer innovation.', url: 'https://cointelegraph.com/news/nft-nyc-how-the-web3-space-is-validating-the-work-of-digital-artists', image: 'https://www.nft.nyc/hubfs/logo-cointelegraph.jpeg', photo: 'https://www.nft.nyc/hubfs/cointelegraph-testimonial.jpg' },
  { outlet: 'Decrypt', quote: 'NFT NYC Again Showcased the Resilience of Web3 Culture.', url: 'https://decrypt.co/136810/nft-nyc-2023-gmoney-ordinals-bitcoin-2023', image: 'https://www.nft.nyc/hubfs/NFT.NYC%202023/Testimonials/decryptmedia.jpg', photo: 'https://www.nft.nyc/hubfs/decrypt.png' },
];

export const EVENT_STATS = [
  { value: '70,000+', label: 'Alumni' },
  { value: '3,900+', label: 'Speakers to Date' },
  { value: '9th', label: 'Annual Event' },
  { value: '100+', label: 'Countries Represented' },
];

export interface PastEvent {
  name: string;
  year: string;
  dates: string;
  venue: string;
  tagline: string;
  description: string;
  attendees: string;
  speakers: string;
  tracks: string;
  highlights: string[];
  url: string;
  image: string;
}

export const PAST_EVENTS: PastEvent[] = [
  {
    name: 'NFT.NYC 2025',
    year: '2025',
    dates: 'June 25–26, 2025',
    venue: 'Marriott Marquis, Times Square',
    tagline: 'NFT Art on Times Square Billboards',
    description: 'NFT.NYC returned to the heart of Times Square at the Marriott Marquis.',
    attendees: '1,000+',
    speakers: '350+',
    tracks: '9',
    highlights: [
      '2,000+ Community Artists selected for the Artist Showcase',
      '400+ Artists featured across 2 major Times Square Billboards',
      '50+ Artists shown on the Monument curated by Superchief Gallery',
    ],
    url: 'https://www.nft.nyc/nftnyc2025',
    image: 'https://www.nft.nyc/hubfs/TS%20Group.png',
  },
  {
    name: 'NFT.NYC 2024',
    year: '2024',
    dates: 'April 3–5, 2024',
    venue: 'Javits Center, Times Square',
    tagline: 'Art Comes to Life in the Artists Village',
    description: 'NFT.NYC was back at the state-of-the-art facilities of the Javits Center.',
    attendees: '5,000+',
    speakers: '1,000+',
    tracks: '8',
    highlights: [
      '5,000+ Community Artists applied for the Artist Showcase',
      '2,500+ selected Artists featured in the showcase',
      '100+ Artists featured across major Times Square Billboards',
    ],
    url: 'https://www.nft.nyc/nftnyc2024',
    image: 'https://www.nft.nyc/hubfs/artist%20showcase%20pic.png',
  },
  {
    name: 'NFT.NYC 2023',
    year: '2023',
    dates: 'April 12–14, 2023',
    venue: 'Javits Center, Times Square',
    tagline: 'Brands in the Spotlight',
    description: 'NFT.NYC moves the entire event under one roof in the state-of-the-art Javits Center. NFT.NYC launches Eventbrite integration powering NFT Digital Twin Tickets.',
    attendees: '6,000+',
    speakers: '1,200+',
    tracks: '7',
    highlights: [
      '4,000+ Community Artists applied for the Artist Showcase',
      '2,000+ Artists shown in the Rooftop Artists Village',
      '100+ Artists across 3 major Times Square Billboards',
    ],
    url: 'https://www.nft.nyc/nftnyc2023',
    image: 'https://www.nft.nyc/hubfs/nftnyc-artistsvillage-cropped.jpg',
  },
  {
    name: 'NFT.London 2022',
    year: '2022',
    dates: 'November 3–4, 2022',
    venue: 'QEII Centre, Westminster',
    tagline: 'The First Major NFT Event in the UK',
    description: 'Speakers from more than 160 countries. Commemorative NFT Ticket Stubs featuring local UK-based artists delivered to every attendee, powered by NFT.Kred.',
    attendees: '2,200+',
    speakers: '856',
    tracks: '16',
    highlights: [
      'First major NFT event in the United Kingdom',
      '34 Sponsors and 76 Satellite Events',
    ],
    url: 'https://www.nft.nyc/nftlondon2022',
    image: 'https://www.nft.nyc/hubfs/pastevents-london2022.png',
  },
  {
    name: 'NFT.NYC 2022',
    year: '2022',
    dates: 'June 21–23, 2022',
    venue: 'Radio City Music Hall & More',
    tagline: 'The Diversity of NFTs',
    description: 'Coinbase premieres Bored Ape themed \'Degen Trilogy\' movie at Radio City Music Hall. Celebrity announcements by Logan Paul, Kimbal Musk, and Spike Lee.',
    attendees: '18,000+',
    speakers: '1,400+',
    tracks: '16',
    highlights: [
      '50+ major Brands announce NFT projects including Coach and Ticketmaster',
      '200+ NFT Artists across 14 major Times Square Billboards',
      '450+ Satellite Events across New York City',
    ],
    url: 'https://www.nft.nyc/nftnyc2022',
    image: 'https://www.nft.nyc/hubfs/pastevents-2022.jpeg',
  },
  {
    name: 'NFT.NYC 2021',
    year: '2021',
    dates: 'November 3–4, 2021',
    venue: 'Multiple Times Square Venues',
    tagline: 'The World Has Woken Up to NFTs',
    description: 'Coinbase dubs NFT.NYC "The Super Bowl of NFTs". Introduction of NFT Speaker Cards, creating shareable, verifiable NFT credentials for every speaker.',
    attendees: '5,600+',
    speakers: '579',
    tracks: '6',
    highlights: [
      'Celebrity appearances by Busta Rhymes, Gary Vee, Alexis Ohanian and Quentin Tarantino',
      'Times Square Takeover across 14 major Billboards',
      '125 Sponsors and 67 Satellite Events',
    ],
    url: 'https://www.nft.nyc/nftnyc2021',
    image: 'https://www.nft.nyc/hubfs/pastevents-2021.jpeg',
  },
  {
    name: 'NFT.NYC 2020',
    year: '2020',
    dates: 'February 20, 2020',
    venue: 'Edison Ballroom, Times Square',
    tagline: 'Real-World NFT Use Cases',
    description: 'NFT.NYC returns to Times Square for its second year. Introduction of NFT Speaker Profiles, powered by NFT.Kred. NFT Ticketing powered by Mintbase.',
    attendees: '514',
    speakers: '110',
    tracks: '1',
    highlights: [
      '34 Sponsors supporting the growing NFT ecosystem',
      '12 Satellite Events',
    ],
    url: 'https://www.nft.nyc/nftnyc2020',
    image: 'https://www.nft.nyc/hubfs/pastevents-2020.jpg',
  },
  {
    name: 'NFT.NYC 2019',
    year: '2019',
    dates: 'February 20, 2019',
    venue: 'PlayStation Theater, Times Square',
    tagline: 'Exploring the NFT Ecosystem',
    description: 'Brought the NFT Community together for the first major NFT event. Launched the first ever NFT Swag Bag and introduced NFT tickets in a pilot with OpenSea.',
    attendees: '462',
    speakers: '85',
    tracks: '1',
    highlights: [
      'The first major NFT industry event',
      'Pioneered NFT Swag Bags and NFT Ticketing',
    ],
    url: 'https://www.nft.nyc/nftnyc2019',
    image: 'https://www.nft.nyc/hubfs/pastevents-2019.jpg',
  },
  {
    name: 'Pre-NFT.NYC 2018',
    year: '2018',
    dates: 'March 21, 22 & 27, 2018',
    venue: 'Twitter HQ, SF, NYC and London',
    tagline: 'What Is an NFT?',
    description: 'Prior to the launch of its first major event, the NFT.NYC team hosted introductory events in San Francisco, New York and London. Each featured a panel discussing "What is an NFT?" from the perspectives of a developer, a lawyer and a CEO.',
    attendees: '446',
    speakers: '7',
    tracks: '1',
    highlights: [
      'Introductory events across 3 cities in 1 week',
      'Where it all began',
    ],
    url: 'https://www.nft.nyc/pre-nftnyc',
    image: 'https://www.nft.nyc/hubfs/pastevents-2018.jpg',
  },
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
