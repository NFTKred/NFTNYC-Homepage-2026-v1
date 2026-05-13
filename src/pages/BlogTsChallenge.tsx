import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageMeta from '@/components/PageMeta';

const ARTICLE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'What is the Times Square Billboard Challenge and how to participate',
  description: 'How collectors, artists, and fans worldwide engage with limited-edition NFT.NYC art on Times Square’s biggest screens. A complete guide to the TS Challenge, T-XP, gift NFTs, and the leaderboard.',
  url: 'https://www.nft.nyc/blog/ts-challenge',
  mainEntityOfPage: 'https://www.nft.nyc/blog/ts-challenge',
  image: 'https://www.nft.nyc/og/blog-ts-challenge.png',
  author: { '@type': 'Organization', name: 'NFT.NYC', url: 'https://www.nft.nyc' },
  publisher: {
    '@type': 'Organization',
    name: 'NFT.NYC',
    logo: { '@type': 'ImageObject', url: 'https://www.nft.nyc/favicon.jpg' },
  },
  datePublished: '2026-02-15',
  dateModified: '2026-05-11',
  inLanguage: 'en',
};

const heading: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  color: 'var(--color-text)',
  textTransform: 'uppercase',
  letterSpacing: '-0.02em',
};

const body: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-base)',
  color: 'var(--color-text-muted)',
  lineHeight: 1.7,
};

const sectionTitle: React.CSSProperties = {
  ...heading,
  fontSize: 'clamp(1.25rem, 0.8rem + 1.5vw, 1.75rem)',
  marginBottom: '1rem',
  marginTop: '3rem',
};

const subTitle: React.CSSProperties = {
  ...heading,
  fontSize: 'clamp(1rem, 0.7rem + 1vw, 1.25rem)',
  marginBottom: '0.75rem',
  marginTop: '2rem',
};

const tableCell: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderBottom: '1px solid var(--card-border)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-muted)',
  lineHeight: 1.5,
};

const tableHeader: React.CSSProperties = {
  ...tableCell,
  fontWeight: 700,
  color: 'var(--color-text)',
  fontSize: 'var(--text-sm)',
};

const listItem: React.CSSProperties = {
  ...body,
  marginBottom: '0.5rem',
  paddingLeft: '0.5rem',
};

const summaryBox: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-faint)',
  fontStyle: 'italic',
  lineHeight: 1.6,
  padding: '1rem 1.25rem',
  borderLeft: '3px solid var(--color-primary)',
  margin: '1.5rem 0',
};

export default function BlogTsChallenge() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  );
  const stage = useMemo(() => Number(localStorage.getItem('nftnyc-stage') ?? 0), []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <PageMeta page="blog-ts-challenge" />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(ARTICLE_JSON_LD)}</script>
      </Helmet>
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      <article style={{ padding: 'calc(4rem + 56px) 1.5rem 4rem' }}>
        <div className="max-w-[720px] mx-auto">

          {/* Back link */}
          <a href="/blog" style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontWeight: 500,
            display: 'inline-block',
            marginBottom: '2rem',
          }}>&larr; Back to Blog</a>

          {/* Title */}
          <h1 style={{ ...heading, fontSize: 'clamp(1.5rem, 1rem + 2vw, 2.5rem)', marginBottom: '0.75rem' }}>
            What is the Times Square Billboard Challenge and how to participate
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-faint)',
            fontStyle: 'italic',
            marginBottom: '2rem',
          }}>Published: April 2026 | Author: NFT.NYC and OneHub team | Last updated: April 3, 2026</p>

          {/* Hero image */}
          <img
            src="/blog-ts-challenge-hero.png"
            alt="Times Square at night with NFT billboards and XP coins"
            style={{
              width: '100%',
              borderRadius: '12px',
              marginBottom: '2rem',
              border: '1px solid var(--card-border)',
            }}
          />

          {/* Summary */}
          <p style={body}>
            The Times Square Billboard Challenge (TS Challenge) is a community engagement program on onehub.nft.nyc where collectors, artists, and fans worldwide collect limited-edition digital art from the NFT.NYC 2025 Community Artist Showcase. Participants send Gift NFTs, earn T-XP (Times Square Experience Points), and compete on a global leaderboard. The platform is powered by OneHub and organized by the NFT.NYC team.
          </p>

          {/* Summary table */}
          <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--card-border)' }}>
              <thead>
                <tr>
                  <th style={{ ...tableHeader, width: '30%' }}>Attribute</th>
                  <th style={tableHeader}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Platform', 'onehub.nft.nyc'],
                  ['Organizer', 'NFT.NYC team, powered by OneHub'],
                  ['Art categories', 'Times Square Billboard Art (curated by Superchief Gallery) and Times Square Treasures'],
                  ['Display venues', 'Times Square billboards, the Monument installation, and Superchief Gallery exhibition'],
                  ['Progression metric', 'T-XP (Times Square Experience Points)'],
                  ['Cost to join', 'Free. Gift NFTs cost T-XP. Billboard Art is available for collection.'],
                  ['Community size', '150,000+ members'],
                  ['Artists showcased', '1,500+ from the NFT.NYC 2025 Community Artist Showcase'],
                  ['Key features', 'Collect Art, Send Gifts, Gift Studio, Leaderboard, Dashboard, Daily Actions, Streak System'],
                ].map(([attr, detail]) => (
                  <tr key={attr}>
                    <td style={{ ...tableCell, fontWeight: 700, color: 'var(--color-text)' }}>{attr}</td>
                    <td style={tableCell}>{detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* What is the TS Challenge */}
          <h2 style={sectionTitle}>What is the Times Square Billboard Challenge?</h2>
          <p style={body}>
            The TS Challenge is an interactive, community-driven competition that connects digital collecting with physical display in Times Square, New York City. Participants collect exclusive digital art from the NFT.NYC 2025 Community Artist Showcase, exchange Gift NFTs with other community members, and accumulate T-XP to rise on a global leaderboard.
          </p>
          <p style={{ ...body, marginTop: '1rem' }}>
            Every piece of art in the challenge was displayed at physical scale across three venues: Times Square billboards, the Monument (a large-scale physical installation), and a Superchief Gallery exhibition. Collecting these works as NFTs on onehub.nft.nyc provides a direct connection to art that appeared in one of the most-visited locations on Earth.
          </p>
          <p style={{ ...body, marginTop: '1rem' }}>
            The challenge centers on three core actions: <strong style={{ color: 'var(--color-text)' }}>collect, earn, and compete</strong>. Every interaction on the platform generates T-XP, which determines leaderboard ranking. Top positions on the leaderboard may unlock future perks and recognition.
          </p>

          {/* Why it exists */}
          <h2 style={sectionTitle}>Why the TS Challenge exists</h2>
          <p style={body}>
            NFT.NYC has been the largest gathering of the NFT community since its inception. The Times Square Billboard Challenge extends that community beyond the conference dates and into a year-round engagement layer. The TS Challenge creates a persistent platform where collectors, artists, and fans can connect, exchange gifts, and compete continuously.
          </p>
          <p style={{ ...body, marginTop: '1rem' }}>
            The challenge also provides a mechanism for artists to reach audiences at unprecedented scale. The NFT.NYC 2025 Community Artist Showcase featured work from over 1,500 artists, and the TS Challenge makes every showcased piece collectible and tradeable through onehub.nft.nyc.
          </p>

          {/* How it works */}
          <h2 style={sectionTitle}>How the TS Challenge works</h2>
          <h3 style={subTitle}>Three steps to start competing</h3>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Collect NFTs.</strong> Connect your wallet and start collecting exclusive TS Art. Each NFT purchased helps support an artist and earns T-XP.</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Earn T-XP.</strong> Collect art and send Gift NFTs to earn T-XP. Completing a Daily Action increases your multiplier.</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Climb the ranks.</strong> The more you collect, the higher you climb. All of the T-XP you earn moves you up the leaderboard. Compete with collectors worldwide for the top spot.</li>
          </ol>

          <h3 style={subTitle}>Times Square Billboard Art</h3>
          <p style={body}>
            This category features limited-edition art from the NFT.NYC 2025 Community Artist Showcase, curated by Superchief Gallery. These are the same pieces that were displayed on Times Square billboards, on the Monument installation, and in a physical gallery exhibition. Billboard Art features subcategories based on display venue: Shown on Billboards, Shown on Monument, and Shown in Art Gallery.
          </p>

          <h3 style={subTitle}>Times Square Treasures</h3>
          <p style={body}>
            Times Square Treasures are themed Gift NFTs that can be sent to other community members. Examples include The Botanical Garden Bloom, The Coney Island Spinner, After-Hours Aviators, and The Hudson River Parka. These cost T-XP to send and are central to the social gifting mechanism that drives leaderboard competition.
          </p>

          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--card-border)' }}>
              <thead>
                <tr>
                  <th style={{ ...tableHeader, width: '30%' }}>Category</th>
                  <th style={tableHeader}>Description</th>
                  <th style={{ ...tableHeader, width: '20%' }}>T-XP cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...tableCell, fontWeight: 700, color: 'var(--color-text)' }}>Times Square Billboard Art</td>
                  <td style={tableCell}>Limited-edition curated art from the NFT.NYC Community Artist Showcase, displayed on billboards and the Monument</td>
                  <td style={tableCell}>Varies by edition</td>
                </tr>
                <tr>
                  <td style={{ ...tableCell, fontWeight: 700, color: 'var(--color-text)' }}>Times Square Treasures</td>
                  <td style={tableCell}>Themed Gift NFTs for social gifting and community engagement</td>
                  <td style={tableCell}>50 to 500 T-XP per gift</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Earning T-XP */}
          <h2 style={sectionTitle}>How to earn T-XP through engagement</h2>

          <h3 style={subTitle}>Send gifts</h3>
          <p style={body}>
            Sending Gift NFTs is one of the primary ways to earn T-XP. Every gift sent and received generates points for both the sender and the recipient. This creates a positive-sum dynamic where generosity directly translates to leaderboard progress.
          </p>

          <h3 style={subTitle}>Connect with friends</h3>
          <p style={body}>
            The Community Directory allows participants to discover other collectors. More connections create more opportunities to exchange gifts and accumulate T-XP.
          </p>

          <h3 style={subTitle}>Gift Studio</h3>
          <p style={body}>
            The Gift Studio is an AI-enabled creation tool where participants can design custom Gift NFTs to share with friends. Choose a base design and the AI generates a unique gift. The current base design is Relay, the TS Challenge mascot.
          </p>

          {/* T-XP system */}
          <h2 style={sectionTitle}>What is T-XP and how does the points system work?</h2>
          <p style={body}>
            T-XP (Times Square Experience Points) is the off-chain progression metric that powers the entire TS Challenge. It determines leaderboard ranking, unlocks the ability to purchase exclusive TS Art and Gift NFTs, and tracks overall community engagement. T-XP is earned through platform activity and is displayed in the navigation bar and on your Dashboard. T-XP is not a cryptocurrency or token and cannot be traded or transferred.
          </p>

          <h3 style={subTitle}>Daily actions (earn up to 500 T-XP each day)</h3>
          <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--card-border)' }}>
              <thead>
                <tr>
                  <th style={tableHeader}>Action</th>
                  <th style={{ ...tableHeader, width: '25%' }}>T-XP earned</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Send a gift', '+10'],
                  ['Share an NFT on social media', '+1'],
                  ['Invite friends to play', '+1'],
                  ['Receive a gift', '+10'],
                  ['Redeem a benefit', '+15'],
                  ['Rank number 1 on leaderboard', '+500'],
                  ['Rank number 2 on leaderboard', '+250'],
                  ['Rank number 3 on leaderboard', '+100'],
                  ['Rank 4 to 10 on leaderboard', '+10'],
                ].map(([action, xp]) => (
                  <tr key={action}>
                    <td style={tableCell}>{action}</td>
                    <td style={{ ...tableCell, fontWeight: 700, color: 'var(--color-text)' }}>{xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={subTitle}>Streak system and boost multiplier</h3>
          <p style={body}>
            The Dashboard tracks your daily streak: the number of consecutive days you have completed at least one Daily Action. Maintaining a streak builds your Boost Multiplier, which starts at 1.1x and can increase up to 4x. A higher multiplier means every action you take earns proportionally more T-XP.
          </p>
          <p style={{ ...body, marginTop: '1rem' }}>
            Breaking your streak resets the multiplier to 1.1x, making consistency a key strategic element for competitive collectors.
          </p>

          <h3 style={subTitle}>Progression levels</h3>
          <p style={body}>
            As you accumulate T-XP, you advance through a series of collector levels. Each level unlocks new capabilities and recognition on the platform. The current known level tier is Gift Animator, visible on the Dashboard.
          </p>

          {/* Leaderboard */}
          <h2 style={sectionTitle}>How the leaderboard works</h2>
          <p style={body}>
            The TS Challenge Leaderboard ranks all participants by their total T-XP score. The leaderboard serves as the central competitive element of the entire challenge, and top positions may unlock future perks.
          </p>

          <h3 style={subTitle}>Current standings (as of April 2026)</h3>
          <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--card-border)' }}>
              <thead>
                <tr>
                  <th style={{ ...tableHeader, width: '15%' }}>Rank</th>
                  <th style={tableHeader}>Collector</th>
                  <th style={{ ...tableHeader, width: '20%' }}>T-XP</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1', 'Cameron Bale', '11,900'],
                  ['2', 'LJ', '11,800'],
                  ['3', 'Ermac Kiyani', '7,200'],
                  ['4', 'Lukar', '4,300'],
                  ['5', 'Dexter Marlon Jebunan', '2,200'],
                  ['6', 'Ted', '1,600'],
                  ['7', 'Michael Battaglia', '1,500'],
                  ['8', 'LJJ', '1,200'],
                  ['9', 'Max Falsetta Spina', '1,100'],
                ].map(([rank, name, xp]) => (
                  <tr key={rank}>
                    <td style={{ ...tableCell, fontWeight: 700, color: 'var(--color-text)' }}>{rank}</td>
                    <td style={tableCell}>{name}</td>
                    <td style={{ ...tableCell, fontWeight: 700, color: 'var(--color-text)' }}>{xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...body, fontSize: 'var(--text-sm)', marginTop: '0.5rem', fontStyle: 'italic', color: 'var(--color-text-faint)' }}>
            The leaderboard is updated in real time. Top leaderboard positions may translate into future rewards; details are still being determined.
          </p>

          {/* Platform features */}
          <h2 style={sectionTitle}>Platform features on onehub.nft.nyc</h2>

          <h3 style={subTitle}>Dashboard</h3>
          <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--card-border)' }}>
              <thead>
                <tr>
                  <th style={{ ...tableHeader, width: '25%' }}>Feature</th>
                  <th style={tableHeader}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Overview', 'Personal hub showing total T-XP, T-XP earned today, current level, and streak status'],
                  ['Daily bonus', 'Claim once per day to extend your streak and earn bonus T-XP'],
                  ['Streak tracker', 'Displays consecutive-day streak count and current Boost Multiplier (1.1x to 4x)'],
                  ['Daily actions', 'Checklist of earning activities: send and receive gifts, share NFTs, invite friends, redeem benefits, leaderboard rank bonuses'],
                  ['Recent gifts', 'Feed of your latest sent and received gifts with a quick Send More action'],
                  ['T-XP transactions', 'Full transaction history with running balance'],
                ].map(([feature, detail]) => (
                  <tr key={feature}>
                    <td style={{ ...tableCell, fontWeight: 700, color: 'var(--color-text)' }}>{feature}</td>
                    <td style={tableCell}>{detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={subTitle}>Collect Art</h3>
          <p style={body}>
            The Collect Art page organizes all available NFTs into two primary categories: Times Square Billboard Art and Times Square Treasures. Billboard Art features subcategories based on display venue: Shown on Billboards, Shown on Monument, and Shown in Art Gallery. Each piece includes the artist name, edition details, and collection options.
          </p>

          <h3 style={subTitle}>Send Gifts</h3>
          <p style={body}>
            The Send Gifts page is the gateway to Times Square Treasures. Browse available Gift NFTs and send them to other community members. Gifting is reciprocal: both sender and recipient earn T-XP for each transaction.
          </p>

          <h3 style={subTitle}>Community directory</h3>
          <p style={body}>
            The Community Directory lists all participants, making it easy to discover new collectors, view their collections, and initiate gift exchanges.
          </p>

          <h3 style={subTitle}>Activity feed</h3>
          <p style={body}>
            The Activity feed shows a real-time stream of all platform activity: gifts sent, NFTs collected, leaderboard movements, and community interactions.
          </p>

          {/* Who is it for */}
          <h2 style={sectionTitle}>Who is the TS Challenge for?</h2>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>NFT.NYC attendees and alumni.</strong> If you have attended NFT.NYC before, the TS Challenge is a way to stay engaged with the community year-round.</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Digital art collectors.</strong> Collecting curated, limited-edition art from over 1,500 artists, with the added distinction that every piece was physically displayed in Times Square.</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>NFT enthusiasts and community builders.</strong> The social gifting and leaderboard mechanics make this a community-driven competition where participation is rewarded.</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Newcomers and curious explorers.</strong> The platform is free to join, and the Gift Studio and Daily Actions provide immediate ways to participate.</li>
          </ol>

          {/* Comparison table */}
          <h2 style={sectionTitle}>How the TS Challenge compares to other platforms</h2>
          <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--card-border)' }}>
              <thead>
                <tr>
                  <th style={tableHeader}>Feature</th>
                  <th style={tableHeader}>TS Challenge</th>
                  <th style={tableHeader}>Traditional NFT marketplace</th>
                  <th style={tableHeader}>Social media contest</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Curated artist showcase', 'Yes', 'No', 'No'],
                  ['Physical display in Times Square', 'Yes', 'No', 'No'],
                  ['Progression system (T-XP)', 'Yes', 'No', 'No'],
                  ['Global leaderboard', 'Yes', 'No', 'Limited'],
                  ['AI-enabled Gift Studio', 'Yes', 'No', 'No'],
                  ['Social gifting with XP rewards', 'Yes', 'No', 'No'],
                  ['Daily streak and multiplier', 'Yes', 'No', 'No'],
                  ['Community directory', 'Yes', 'Limited', 'No'],
                  ['Conference ticket discount', 'Yes', 'No', 'No'],
                  ['Free to join', 'Yes', 'Varies', 'Yes'],
                ].map(([feature, ts, nft, social]) => (
                  <tr key={feature}>
                    <td style={{ ...tableCell, fontWeight: 700, color: 'var(--color-text)' }}>{feature}</td>
                    <td style={tableCell}>{ts}</td>
                    <td style={tableCell}>{nft}</td>
                    <td style={tableCell}>{social}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How to get started */}
          <h2 style={sectionTitle}>How to get started with the TS Challenge</h2>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Visit onehub.nft.nyc.</strong> Go to onehub.nft.nyc and select Connect Wallet.</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Connect your wallet.</strong> Link your preferred wallet to the platform.</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Explore the collection.</strong> Browse Times Square Billboard Art and Times Square Treasures on the Collect Art page.</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Start earning T-XP.</strong> Claim your daily bonus on the Dashboard, send gifts, share NFTs on social media, and invite friends.</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Climb the leaderboard.</strong> Watch your rank rise as you accumulate T-XP. Compete for the top spot. Top leaderboard positions may unlock future perks.</li>
          </ol>

          {/* Numbers */}
          <h2 style={sectionTitle}>The numbers behind the TS Challenge</h2>
          <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--card-border)' }}>
              <thead>
                <tr>
                  <th style={{ ...tableHeader, width: '50%' }}>Metric</th>
                  <th style={tableHeader}>Value</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Community members', '150,000+'],
                  ['Artists showcased', '1,500+'],
                  ['Daily T-XP cap', '500'],
                  ['Max streak multiplier', '4x'],
                  ['Display venues', '3 (billboards, Monument, gallery)'],
                  ['Daily action types', '8'],
                  ['Current leader T-XP score', '11,900'],
                  ['Art categories', '2 (Billboard Art and Treasures)'],
                ].map(([metric, value]) => (
                  <tr key={metric}>
                    <td style={{ ...tableCell, fontWeight: 700, color: 'var(--color-text)' }}>{metric}</td>
                    <td style={tableCell}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FAQ */}
          <h2 style={sectionTitle}>Frequently asked questions</h2>
          {[
            { q: 'What is the Times Square Billboard Challenge?', a: 'The TS Challenge is a community-driven competition hosted on onehub.nft.nyc where participants collect digital art from the NFT.NYC 2025 Community Artist Showcase, send Gift NFTs, earn T-XP, and compete on a global leaderboard.' },
            { q: 'How do I get started?', a: 'Visit onehub.nft.nyc, connect your wallet, and start collecting art or sending gifts. You can also claim a daily bonus on the Dashboard to begin earning T-XP immediately.' },
            { q: 'What is T-XP?', a: 'T-XP (Times Square Experience Points) is the off-chain progression metric that determines your leaderboard ranking and unlocks the ability to purchase TS Art and Gift NFTs. It is earned through collecting, gifting, and daily engagement. T-XP is not a cryptocurrency or token. It cannot be traded or transferred.' },
            { q: 'Can I participate without buying anything?', a: 'Yes. Creating an account, connecting your wallet, using the Gift Studio, completing Daily Actions, and receiving gifts from others are all free ways to earn T-XP and climb the leaderboard.' },
            { q: 'What rewards do top collectors earn?', a: 'Top leaderboard positions may unlock perks for future NFT.NYC events. Details are still being determined. Leaderboard rank bonuses already provide ongoing daily T-XP advantages: +500 for rank 1, +250 for rank 2, +100 for rank 3, and +10 for ranks 4 through 10.' },
            { q: 'What is the Gift Studio?', a: 'The Gift Studio is an AI-enabled tool where you can create custom Gift NFTs using base designs. These gifts can be shared with other community members and earn both sender and recipient T-XP.' },
            { q: 'What is the streak system?', a: 'The streak system tracks consecutive days of engagement. Each day you complete at least one Daily Action, your streak grows and your Boost Multiplier increases from 1.1x up to 4x. A higher multiplier means every T-XP-generating action earns more points.' },
            { q: 'Who curated the Times Square Billboard Art?', a: 'The Times Square Billboard Art collection was curated by Superchief Gallery as part of the NFT.NYC 2025 Community Artist Showcase. Featured artwork was displayed on Times Square billboards, on the Monument, and in a physical gallery exhibition.' },
            { q: 'Who built the TS Challenge platform?', a: 'The TS Challenge runs on OneHub, built by the team behind NFT.NYC. The team has operated in the NFT ecosystem since 2018 and has organized annual NFT conferences attended by over 15,000 participants.' },
          ].map(({ q, a }) => (
            <div key={q} style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ ...body, fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>{q}</h3>
              <p style={body}>{a}</p>
            </div>
          ))}

          {/* Key takeaways */}
          <h2 style={sectionTitle}>Key takeaways</h2>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li style={listItem}>The TS Challenge is a free-to-join community competition on onehub.nft.nyc that combines digital art collecting with physical Times Square display.</li>
            <li style={listItem}>All art was curated by Superchief Gallery and physically displayed on Times Square billboards, the Monument, and in a gallery exhibition.</li>
            <li style={listItem}>T-XP is the off-chain progression metric driving leaderboard rankings. Earn up to 500 T-XP per day through Daily Actions.</li>
            <li style={listItem}>The streak system rewards consistency with a Boost Multiplier ranging from 1.1x to 4x.</li>
            <li style={listItem}>Social gifting is a core mechanic. Both sender and recipient earn T-XP for every Gift NFT exchanged.</li>
            <li style={listItem}>The platform includes a Gift Studio (AI-enabled custom gift creation), a Dashboard, a Community Directory, and an Activity feed.</li>
            <li style={listItem}>The community includes 150,000+ members and 1,500+ showcased artists.</li>
            <li style={listItem}>To start, visit onehub.nft.nyc, connect a wallet, and claim your daily bonus.</li>
          </ol>

          {/* Disclaimer */}
          <div style={{ ...summaryBox, marginTop: '3rem' }}>
            The TS Challenge features art from the NFT.NYC 2025 Community Artist Showcase. T-XP is an off-chain metric; it is not a cryptocurrency, token, or financial instrument. Leaderboard standings, T-XP values, and platform features described in this document are based on live platform data as of April 2026 and may change. Rewards for top leaderboard positions have not yet been determined.
          </div>

        </div>
      </article>

      <SiteFooter stage={stage} />
    </div>
  );
}
