const BB = "https://f005.backblazeb2.com/file/PB-HubSpot/";

export interface Package {
  id: number | null;
  tier: "standard" | "standard";
  name: string;
  price: string;
  description: string;
  branding: string[];
  tickets: { vip: number; ga: number; staff: number };
  billboard: string;
  speaking: string;
  expoSpace: string;
  availability: string;
  image?: string;
}

export interface AlaCarteItem {
  id: number | null;
  name: string;
  price: string;
  description: string;
  availability: string;
}

export const defaultPackages: Package[] = [
  {
    id: 0,
    tier: "standard",
    name: 'Title Sponsor — "NFT.NYC 2026 presented by [Brand]"',
    price: "$500,000",
    description: "The defining partnership of NFT.NYC 2026. Your brand becomes synonymous with the event — from the main stage at the Edison Ballroom to every attendee touchpoint. Includes event naming rights, main stage ownership, and category exclusivity.",
    branding: [
      "**Pre-event visibility:**",
      '"NFT.NYC 2026 presented by [Brand]" naming rights across all marketing',
      "Logo on NFT.NYC website header and registration page",
      "Logo in all email communications to 50K+ community (persistent footer placement)",
      "Co-branded partnership announcement across social channels (175K+ followers)",
      "Inclusion in all press releases and media outreach",
      "First-position logo on Times Square billboard during kickoff roadblock",
      "**On-site branding (Sept 1-3):**",
      "Main stage backdrop, podium, and interstitial screen branding (Edison Ballroom)",
      "Registration area branding and welcome experience signage (Sept 1)",
      "Logo on all attendee badges and digital twin tickets",
      "Logo on event lanyards",
      "**Content and speaking:**",
      "Featured main stage session (20 min)",
      
      "Co-created long-form content piece published through NFT.NYC channels",
      "Logo in the digital program",
      "**Hospitality and experiences:**",
      "Private meeting room for the duration of the event",
      
      "Welcome remarks opportunity at VIP Opening Party",
    ],
    tickets: { vip: 30, ga: 50, staff: 15 },
    billboard: "Premier placement in Times Square Kickoff Roadblock",
    speaking: "Featured main stage session (20 min)",
    expoSpace: "20'x 20' premium position",
    availability: "1 remaining",
    image: BB + "stage-branding-edison.png"
  },
  {
    id: 2,
    tier: "standard",
    name: "Edison Ballroom South Stage Sponsor",
    price: "$200,000",
    description: "Own the secondary stage at NFT.NYC 2026. Full branding and programming collaboration across the Edison Ballroom South for both activation days (Sept 2-3). The highest-visibility speaking platform after the main stage.",
    branding: [
      "**Stage branding (Sept 2-3):**",
      "Stage backdrop and podium branding across both activation days",
      "Interstitial screen branding between all Edison Ballroom South sessions",
      "Session intro slides featuring sponsor logo",
      "Stage hanging banner (3' x 12')",
      "10x7 graphic walls (QTY 2)",
      "**Expo activation:**",
      "20'x 20' expo space in premium position",
      "Second-largest footprint after the Title Sponsor",
      "**Digital and content:**",
      "Standard AV logo 15 sec clips (QTY 2)",
      "Branding in digital program",
      "Social media post announcing partnership",
      "Opt-in media list",
      "**Hospitality:**",
      "500 branded NFT Giveaway to NFT.NYC community",
    ],
    tickets: { vip: 10, ga: 20, staff: 8 },
    billboard: "15 sec Times Square Billboard Ad",
    speaking: "15 min Talk or 25 min Panel",
    expoSpace: "20'x 20' expo activation",
    availability: "1 remaining",
    image: BB + "av-branding-xy-finance.png"
  },
  {
    id: 11,
    tier: "standard",
    name: "Edison Ballroom South — Single Day",
    price: "$120,000",
    description: "Brand the Edison Ballroom South stage for one activation day (Sept 2 or Sept 3). Available only if the full two-day stage sponsorship is unsold. Includes stage ownership, an expo activation, and a speaking slot.",
    branding: [
      "**Stage branding (one day):**",
      "Stage backdrop and podium branding for your selected day",
      "Interstitial screen branding between sessions on your day",
      "Session intro slides featuring sponsor logo",
      "Stage hanging banner (3' x 12')",
      "**Expo activation:**",
      "20'x 10' expo space",
      "**Digital and content:**",
      "Standard AV logo 15 sec clip (QTY 1)",
      "Branding in digital program",
      "Opt-in media list",
    ],
    tickets: { vip: 4, ga: 10, staff: 6 },
    billboard: "Purchase through a la carte options",
    speaking: "10 min Talk",
    expoSpace: "20'x 10' expo activation",
    availability: "2 remaining",
    image: BB + "coinbase-theater-entrance.png"
  },
  {
    id: 4,
    tier: "standard",
    name: "Branded Barista Coffee Cart (per day)",
    price: "$20,000",
    description: "Fuel the community with a branded barista coffee experience — one of the most visited spots at the event.",
    branding: [
      "Barista Coffee Cart",
      "Branded Coffee Cups or Sleeves",
      "AV Loop 15 sec clip",
      "500 NFT Giveaway",
      "Social Media post + Opt-in Media List"
    ],
    tickets: { vip: 1, ga: 2, staff: 2 },
    billboard: "15 sec Billboard Ad",
    speaking: "5 min Talk",
    expoSpace: "10' x 10'",
    availability: "2 remaining",
    image: BB + "barista-coffee-cart.jpg"
  },
  {
    id: 8,
    tier: "standard",
    name: "VIP Opening Party",
    price: "$62,500",
    description: "Co-brand the exclusive VIP Opening Party — the kickoff networking event for top-tier attendees.",
    branding: [
      "AV Co-branded during VIP Party",
      "AV Loop 15 sec clip",
      "500 NFT Giveaway"
    ],
    tickets: { vip: 2, ga: 6, staff: 4 },
    billboard: "Purchase through a la carte options",
    speaking: "5 min Talk",
    expoSpace: "10' x 10'",
    availability: "2 remaining",
    image: BB + "vip-opening-party.png"
  },
  {
    id: 9,
    tier: "standard",
    name: "Chandelier Room VIP Lounge Sponsor",
    price: "$75,000",
    description: "Brand the VIP lounge inside the Edison Ballroom's iconic Chandelier Room. This is where speakers, VIPs, and industry leaders connect between sessions — an intimate, high-value environment with direct access to the most influential attendees at NFT.NYC 2026.",
    branding: [
      "**Lounge branding (Sept 1-3):**",
      "Branded signage and welcome display at the Chandelier Room lounge entrance",
      "Branded furniture wraps, table displays, and lounge décor within the lounge area",
      "Digital screen with sponsor content loop in the lounge area",
      "Branded refreshment station within the lounge",
      "Note: speaker check-in area remains neutral and unbranded",
      "**Digital and content:**",
      "Standard AV logo 15 sec clip (QTY 1)",
      "Branding in digital program",
      
      "Opt-in media list",
      "**Hospitality:**",
      "Direct networking access to VIP attendees and speakers in an intimate setting",
      "10 min speaking slot on event stage"
    ],
    tickets: { vip: 2, ga: 10, staff: 6 },
    billboard: "Purchase through a la carte options",
    speaking: "10 min Talk",
    expoSpace: "Chandelier Room lounge area",
    availability: "1 remaining",
    image: BB + "chandelier-room-activation.png"
  },
  {
    id: 10,
    tier: "standard",
    name: "Live Screenprinting",
    price: "$50,000",
    description: "Staffed live screenprinting activation — attendees walk away wearing your brand.",
    branding: [
      "Staffed Live Screenprinting Installation: 4 Solid color T-shirt designs (QTY 1,500)",
      "AV Loop 15 sec clip",
      "500 NFT Giveaway",
      "Pre-event email + 1 social media post"
    ],
    tickets: { vip: 2, ga: 4, staff: 2 },
    billboard: "Purchase through a la carte options",
    speaking: "5 min Talk",
    expoSpace: "20' x 10'",
    availability: "1 remaining",
    image: BB + "live-screenprinting.jpg"
  },
  {
    id: 12,
    tier: "standard",
    name: "Large Expo Space",
    price: "$25,000",
    description: "Maximum activation footprint on the NFT.NYC expo floor. Prominent positioning, a speaking slot, and logo visibility across event AV screens throughout the event.",
    branding: [
      "20' x 20' expo space",
      "Logo in AV screen rotation (Sept 2-3)",
      "5 min speaking slot on event stage",
      "Logo in digital program",
      "Opt-in media list"
    ],
    tickets: { vip: 2, ga: 4, staff: 2 },
    billboard: "Logo on event AV loop",
    speaking: "5 min Talk",
    expoSpace: "20' x 20'",
    availability: "Limited",
    image: BB + "expo-floor-busy.png"
  },
  {
    id: 13,
    tier: "standard",
    name: "Medium Expo Space",
    price: "$15,000",
    description: "A strong expo presence with a speaking opportunity and AV screen visibility. Ideal for demos, product showcases, and community engagement.",
    branding: [
      "10' x 10' expo space",
      "Logo in AV screen rotation (Sept 2-3)",
      "5 min speaking slot on event stage",
      "Logo in digital program"
    ],
    tickets: { vip: 2, ga: 6, staff: 4 },
    billboard: "Logo on event AV loop",
    speaking: "5 min Talk",
    expoSpace: "10' x 10'",
    availability: "Limited",
    image: BB + "expo-space-branded.png"
  },
  {
    id: 14,
    tier: "standard",
    name: "Demo Table",
    price: "$5,000",
    description: "Entry-level expo presence at NFT.NYC 2026. A dedicated high-top demo table with logo visibility on the event AV screens.",
    branding: [
      "High-top table and two bar stools",
      "10' x 10' expo space",
      "Logo in AV screen rotation (Sept 2-3)",
      "Logo in digital program"
    ],
    tickets: { vip: 1, ga: 2, staff: 0 },
    billboard: "Logo on event AV loop",
    speaking: "—",
    expoSpace: "10' x 10'",
    availability: "Limited",
    image: BB + "demo-table-mintangible.jpg"
  }
];

export const defaultAlaCarte: AlaCarteItem[] = [
  {
    id: 101,
    name: "Times Square Billboard",
    price: "$12,000",
    description: "15 second video clip featured in Times Square, included in the NFT.NYC 1 Hour Kickoff Roadblock. Reach the NFT.NYC community AND the ~330,000 daily pedestrians in Times Square — ~1.5M daily impressions, part of 50M visitors per year (Times Square Alliance).",
    availability: "Limited"
  },
  {
    id: 102,
    name: "Official Partner Event",
    price: "$5,000",
    description: "Choice of available event spaces at the venue (or BYO venue). Featured listing on Events page, Official NFT.NYC Event badge and inclusion in community updates.",
    availability: "Limited"
  },
  {
    id: 103,
    name: "NFT Giveaway (2k or 10k NFTs)",
    price: "$2,000 or $10,000",
    description: "Create an NFT Giveaway for NFT.NYC Community members that share your unique branding and a call to action that benefits token holders.",
    availability: "Limited"
  },
  {
    id: 104,
    name: "Featured Profile or Banner Ad",
    price: "$2,500",
    description: "Featured profile or banner ad placement on the NFT.NYC Times Square Challenge site — put your brand in front of every visitor exploring the on-chain art collection. Featured for 3 months.",
    availability: "Limited"
  },
  {
    id: 105,
    name: "Social Media Post",
    price: "$2,500",
    description: "Provide us with a copy of your message and media asset for us to share with our actively engaged NFT community on one of our social platforms.",
    availability: "Limited"
  },
  {
    id: 107,
    name: "Community Email",
    price: "$3,500",
    description: "Email copy included in an NFT.NYC Community Email sent to 50K+ community members. Covers 1 newsworthy piece of content targeted to a segment of your choice.",
    availability: "Limited"
  },
  {
    id: 108,
    name: "Long Form Content",
    price: "$5,000",
    description: "Publish a co-created Blog Post or Digital Deep Dive pre-recorded 30-minute video session. Share your expertise and innovative ideas with the community.",
    availability: "Limited"
  },
  {
    id: 109,
    name: "Scholarships",
    price: "$5,000 or $25,000",
    description: "Benefactor supports either 2 attendees, developers or job seekers (selected by NFT.NYC) or 10 Artist scholarship recipients (selected by the benefactor).",
    availability: "Limited"
  }
];
