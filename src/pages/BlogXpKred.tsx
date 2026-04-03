import { useState, useMemo } from 'react';
import Header from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

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

export default function BlogXpKred() {
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
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      <article style={{ padding: 'calc(4rem + 56px) 1.5rem 4rem' }}>
        <div className="max-w-[720px] mx-auto">

          {/* Back link */}
          <a href="/blogs" style={{
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
            What are T-XP and T-Kr? How hub-branded points and Kredits work on PeopleBrowsr
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-faint)',
            fontStyle: 'italic',
            marginBottom: '2rem',
          }}>Last updated: April 2026 | Reading time: 8 minutes</p>

          {/* Intro */}
          <p style={body}>
            T-XP and T-Kr are hub-branded versions of XP (experience points) and Kredits on the PeopleBrowsr platform. T-XP tracks your engagement within a specific OneHub. T-Kr represents Kredits earned or allocated within that same hub. Together, they form the two stages of the platform economy: XP is for play, and Kredits are for earning collectible NFTs.
          </p>
          <p style={{ ...body, marginTop: '1rem' }}>
            This guide explains what each asset is, how they differ, how you earn and use them, and what happens when you graduate from the play stage to the earn stage.
          </p>

          {/* Key Takeaways Table */}
          <h2 style={sectionTitle}>Key takeaways</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--card-border)' }}>
              <thead>
                <tr>
                  <th style={{ ...tableHeader, width: '25%' }}>Topic</th>
                  <th style={tableHeader}>Summary</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...tableCell, fontWeight: 700, color: 'var(--color-text)' }}>T-XP</td>
                  <td style={tableCell}>Hub-branded experience points. Off-chain. Tracks engagement. Expires after 60 days (earned) or 12 months (purchased). No KYC required.</td>
                </tr>
                <tr>
                  <td style={{ ...tableCell, fontWeight: 700, color: 'var(--color-text)' }}>T-Kr</td>
                  <td style={tableCell}>Hub-branded Kredits. On-chain ERC-1155 tokens. Permanently transfer-locked. Used to redeem collectible NFTs within the platform. No KYC required to earn or spend.</td>
                </tr>
                <tr>
                  <td style={{ ...tableCell, fontWeight: 700, color: 'var(--color-text)' }}>Graduation</td>
                  <td style={tableCell}>Reaching the required XP threshold qualifies you for Kredits redemption. This is a user status, meaning it applies to your account rather than to any specific NFT.</td>
                </tr>
                <tr>
                  <td style={{ ...tableCell, fontWeight: 700, color: 'var(--color-text)' }}>KYC</td>
                  <td style={tableCell}>Required only for receiving USDC payouts, withdrawing funds, or connecting external wallets. Earning and spending XP and Kredits requires no identity verification.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* What is T-XP */}
          <h2 style={sectionTitle}>What is T-XP?</h2>
          <p style={body}>
            T-XP stands for hub-branded experience points on the PeopleBrowsr platform. The "T" prefix identifies which OneHub the points belong to. Other hubs may use different prefixes (such as E-XP), though they all follow the same mechanics.
          </p>

          <h3 style={subTitle}>How T-XP works</h3>
          <p style={body}>
            XP is an off-chain game mechanic with no monetary value. It measures how actively you participate within a given OneHub. The platform records your XP score internally rather than on a blockchain.
          </p>
          <p style={{ ...body, fontWeight: 600, color: 'var(--color-text)', marginTop: '1rem' }}>Characteristics of T-XP:</p>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li style={listItem}>Off-chain engagement points tracked by the platform</li>
            <li style={listItem}>Earned through participating, collecting, and sharing within the OneHub</li>
            <li style={listItem}>Expires after 60 days from the end of the calendar month in which it was earned</li>
            <li style={listItem}>Purchased XP expires after 12 months from the date of issuance</li>
            <li style={listItem}>No KYC or identity verification is required to earn or use XP</li>
            <li style={listItem}>The platform has no obligation to notify you before XP expires</li>
          </ol>

          <h3 style={subTitle}>What you can do with T-XP</h3>
          <p style={body}>XP unlocks several features within the platform:</p>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li style={listItem}>Claim locked NFTs (collectible NFTs that require a minimum XP level)</li>
            <li style={listItem}>Send gifts to other platform users</li>
            <li style={listItem}>Climb OneHub leaderboards</li>
            <li style={listItem}>Demonstrate that you are earn-stage ready (Kredits Qualified)</li>
          </ol>
          <div style={summaryBox}>
            Section summary: T-XP is your activity score within a specific OneHub. It is off-chain, expires on a set schedule, and serves as the gateway to the earn stage of the platform.
          </div>

          {/* What is T-Kr */}
          <h2 style={sectionTitle}>What is T-Kr?</h2>
          <p style={body}>
            T-Kr stands for hub-branded Kredits. Kredits are non-transferable platform reward points recorded as ERC-1155 tokens on the blockchain. The "T" prefix ties them to a specific OneHub, just as it does with T-XP.
          </p>

          <h3 style={subTitle}>How Kredits work</h3>
          <p style={body}>
            Kredits are permanently transfer-locked. They cannot be traded on external exchanges, converted to cash, or moved to any wallet outside the platform. Their sole function is to acquire collectible NFTs within PeopleBrowsr.
          </p>
          <p style={{ ...body, fontWeight: 600, color: 'var(--color-text)', marginTop: '1rem' }}>Characteristics of T-Kr:</p>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li style={listItem}>On-chain ERC-1155 tokens recorded on the blockchain for transparency</li>
            <li style={listItem}>Permanently transfer-locked to your platform account</li>
            <li style={listItem}>Classified as unregulated digital assets under Empire.Kred Pty Ltd</li>
            <li style={listItem}>Used exclusively to redeem unlocked collectible NFTs</li>
            <li style={listItem}>Cannot be sold, sent to other users, or cashed out</li>
            <li style={listItem}>No KYC required to earn or spend Kredits</li>
          </ol>

          <h3 style={subTitle}>How to get Kredits</h3>
          <p style={body}>There are three ways to accumulate Kredits:</p>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Earn through milestones</strong> — reach engagement thresholds within your OneHub</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Purchase directly</strong> — buy Kredits using USD or supported digital payment methods</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Receive as platform gifts</strong> — other users or hub administrators can gift Kredits to you (no KYC needed)</li>
          </ol>
          <div style={summaryBox}>
            Section summary: T-Kr (Kredits) are on-chain, transfer-locked reward points. They exist solely to redeem collectible NFTs within PeopleBrowsr. They carry no monetary value and cannot leave the platform.
          </div>

          {/* Difference table */}
          <h2 style={sectionTitle}>Difference between T-XP and T-Kr</h2>
          <p style={body}>T-XP and T-Kr serve different roles in the platform economy. The table below compares them side by side.</p>
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--card-border)' }}>
              <thead>
                <tr>
                  <th style={{ ...tableHeader, width: '25%' }}>Feature</th>
                  <th style={tableHeader}>T-XP (experience points)</th>
                  <th style={tableHeader}>T-Kr (Kredits)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Purpose', 'Tracks engagement and activity', 'Redeems collectible NFTs'],
                  ['On-chain or off-chain', 'Off-chain (platform-tracked)', 'On-chain (ERC-1155, permanently locked)'],
                  ['Expiry', 'Earned: 60 days. Purchased: 12 months.', 'No expiry while account is active'],
                  ['Transferable', 'No', 'No (permanently transfer-locked)'],
                  ['Monetary value', 'None. XP is an off-chain game mechanic.', 'None. Kredits function as platform reward points.'],
                  ['KYC required', 'No', 'No (KYC is required only for USDC payouts)'],
                  ['Regulatory entity', 'Empire.Kred Pty Ltd (unregulated digital asset)', 'Empire.Kred Pty Ltd (unregulated digital asset)'],
                ].map(([feature, xp, kr]) => (
                  <tr key={feature}>
                    <td style={{ ...tableCell, fontWeight: 700, color: 'var(--color-text)' }}>{feature}</td>
                    <td style={tableCell}>{xp}</td>
                    <td style={tableCell}>{kr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={summaryBox}>
            Section summary: T-XP is the activity metric, and T-Kr is the redemption mechanism. XP is off-chain and expires. Kredits are on-chain and persist. Neither carries monetary value, and neither requires KYC for standard use.
          </div>

          {/* Graduation */}
          <h2 style={sectionTitle}>How the XP to Kredits graduation works</h2>
          <p style={body}>
            The platform economy has two stages. The play stage is where you earn XP through engagement. The earn stage is where you use Kredits to redeem collectible NFTs. Graduation is the transition between them.
          </p>

          <h3 style={subTitle}>What is Kredits Qualified status?</h3>
          <p style={body}>
            Kredits Qualified is a user status, not an NFT status. It applies to your account. When you reach Kredits Qualified status, you can redeem Kredits for eligible unlocked NFTs within your OneHub.
          </p>
          <p style={{ ...body, fontWeight: 600, color: 'var(--color-text)', marginTop: '1rem' }}>You qualify by:</p>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li style={listItem}>Hitting the required XP threshold for your OneHub</li>
            <li style={listItem}>Staying active on the platform</li>
            <li style={listItem}>Passing any required checks set by the OneHub administrator</li>
          </ol>
          <p style={{ ...body, marginTop: '1rem' }}>
            Once you achieve Kredits Qualified status, it remains linked to your account. You can then begin using Kredits to redeem collectible NFTs.
          </p>

          <h3 style={subTitle}>Step-by-step graduation process</h3>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Join a OneHub</strong> — register on the PeopleBrowsr platform and enter a OneHub community</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Earn T-XP</strong> — participate, collect, and share content to accumulate experience points</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Reach the XP threshold</strong> — each OneHub sets its own minimum XP requirement</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Achieve Kredits Qualified status</strong> — the platform recognises that your account meets the earn-stage criteria</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Redeem T-Kr for NFTs</strong> — use your Kredits to acquire collectible NFTs within the OneHub</li>
          </ol>
          <div style={summaryBox}>
            Section summary: Graduation means reaching the XP threshold that unlocks Kredits Qualified status on your account. From that point forward, you can use Kredits to redeem collectible NFTs.
          </div>

          {/* KYC */}
          <h2 style={sectionTitle}>When is KYC required?</h2>
          <p style={body}>
            KYC (know your customer) identity verification is required only for specific activities that involve regulated virtual assets. Standard platform activity — earning XP, spending Kredits, collecting NFTs — requires no identity verification.
          </p>
          <p style={{ ...body, fontWeight: 600, color: 'var(--color-text)', marginTop: '1rem' }}>KYC is required for:</p>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li style={listItem}>Receiving USDC payouts as a creator</li>
            <li style={listItem}>Withdrawing funds from the platform</li>
            <li style={listItem}>Connecting external wallets</li>
          </ol>
          <p style={{ ...body, marginTop: '1rem' }}>
            These activities fall under the regulated virtual asset classification managed by KYC Kred Pty Ltd. KYC requirements are jurisdiction-specific, meaning they vary depending on your location.
          </p>
          <p style={{ ...body, fontWeight: 600, color: 'var(--color-text)', marginTop: '1rem' }}>KYC is not required for:</p>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li style={listItem}>Earning or spending XP</li>
            <li style={listItem}>Earning or spending Kredits</li>
            <li style={listItem}>Collecting NFTs valued under USD $100</li>
            <li style={listItem}>Sending or receiving platform gifts</li>
          </ol>
          <p style={{ ...body, marginTop: '1rem' }}>
            When a creator's Kredits are redeemed against their NFT, the creator may elect to receive USDC. This election requires the creator to complete KYC with KYC Kred Pty Ltd and to hold an RVA-enabled OneHub. Creators who have not completed KYC receive Kredits instead of USDC.
          </p>
          <div style={summaryBox}>
            Section summary: Most users will never need KYC. It applies only when you want to receive USDC, withdraw funds, or connect external wallets. All standard play-and-earn activity remains verification-free.
          </div>

          {/* Important things */}
          <h2 style={sectionTitle}>Important things to know</h2>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Collectible NFTs are not investments.</strong> They are collectibles with no inherent commercial value. They are not financial products, securities, or investment instruments. Do not acquire them expecting a financial return.</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Kredits and Gen 2 Shares cannot leave the platform.</strong> They are permanently transfer-locked. They cannot be traded on external exchanges, converted to cash, or moved to any external wallet.</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>XP has no monetary value.</strong> It is an off-chain game mechanic. It expires on a fixed schedule, and the platform has no obligation to notify you before expiry.</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>PeopleBrowsr is not a custodian of your assets.</strong> Wallets created on the platform are digital non-custodial wallets. The platform does not hold custody, possession, or control of any assets in your wallet.</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Accounts can be terminated.</strong> The platform may terminate or suspend your account at any time, without cause or notice. On termination, off-chain assets (XP, Gifts) may be deleted, and transfer-locked tokens (Kredits, Gen 2 Shares) may be burned via smart contract.</li>
            <li style={listItem}><strong style={{ color: 'var(--color-text)' }}>Two contracting entities operate the platform.</strong> Empire.Kred Pty Ltd manages unregulated digital assets (XP, Kredits, collectible NFTs under $100). KYC Kred Pty Ltd manages regulated virtual assets (USDC, high-value NFTs) and handles all KYC and AML obligations.</li>
          </ol>

          {/* FAQ */}
          <h2 style={sectionTitle}>Frequently asked questions</h2>
          {[
            { q: 'What does the "T" in T-XP and T-Kr stand for?', a: 'The "T" is a hub prefix identifying which OneHub issued the points or Kredits. Different OneHubs use different prefixes (T, E, and others). The mechanics remain the same across all hubs.' },
            { q: 'Can I transfer Kredits to another user?', a: 'No. Kredits are permanently transfer-locked ERC-1155 tokens. They are bound to your account and cannot be sent to other users, traded externally, or converted to cash.' },
            { q: 'What happens when my XP expires?', a: 'Expired XP is removed from your account at the end of the calendar month in which the expiry period falls. Earned XP expires after 60 days. Purchased XP expires after 12 months. The platform is not required to send an expiry notification.' },
            { q: 'Do I need KYC to earn Kredits?', a: 'No. KYC is required only for USDC payouts, fund withdrawals, and external wallet connections. Earning and spending Kredits requires no identity verification.' },
            { q: 'What is the difference between a digital asset and a regulated virtual asset?', a: 'Digital assets (such as XP, Kredits, and collectible NFTs under $100) are classified as unregulated and managed by Empire.Kred Pty Ltd. Regulated virtual assets (such as USDC and high-value NFTs) require KYC and are managed by KYC Kred Pty Ltd.' },
            { q: 'Are collectible NFTs financial investments?', a: 'No. Collectible NFTs on PeopleBrowsr are collectibles with no inherent commercial value. They are not financial products, securities, or investment instruments of any kind.' },
            { q: 'What happens to my Kredits if my account is terminated?', a: 'On account termination, transfer-locked tokens (including Kredits and Gen 2 Shares) may be burned via smart contract. Off-chain assets such as XP and Gifts may be deleted. Transferable on-chain assets (collectible NFTs) remain in your self-custodial wallet, though platform access and licence rights are revoked.' },
            { q: 'Can I use T-XP from one OneHub in a different OneHub?', a: 'XP is hub-branded, meaning T-XP earned in one OneHub belongs to that specific hub. Each OneHub tracks its own XP balances and thresholds independently.' },
          ].map(({ q, a }) => (
            <div key={q} style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ ...body, fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>{q}</h3>
              <p style={body}>{a}</p>
            </div>
          ))}

          {/* Glossary */}
          <h2 style={sectionTitle}>Glossary</h2>
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--card-border)' }}>
              <thead>
                <tr>
                  <th style={{ ...tableHeader, width: '30%' }}>Term</th>
                  <th style={tableHeader}>Definition</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['XP (experience points)', 'Off-chain engagement points that track platform activity. No monetary value. Expires on a fixed schedule.'],
                  ['T-XP', 'Hub-branded XP issued by a specific OneHub. The "T" prefix identifies the issuing hub.'],
                  ['Kredits', 'On-chain, permanently transfer-locked ERC-1155 platform reward points. Used solely to redeem collectible NFTs within PeopleBrowsr.'],
                  ['T-Kr', 'Hub-branded Kredits issued by a specific OneHub. Functions identically to Kredits, with hub-level tracking.'],
                  ['Kredits Qualified', 'A user account status achieved by reaching the required XP threshold. Unlocks the ability to redeem Kredits for eligible collectible NFTs.'],
                  ['OneHub', 'A branded community within the PeopleBrowsr platform. Each OneHub has its own XP thresholds, leaderboards, and collectible NFTs.'],
                  ['Collectible NFT', 'A digital collectible on the blockchain. Not a financial product or investment. May be locked (requires XP) or unlocked (requires Kredits).'],
                  ['Digital asset (DA)', 'An unregulated asset managed by Empire.Kred Pty Ltd. Includes XP, Kredits, Gifts, and collectible NFTs under USD $100.'],
                  ['Regulated virtual asset (RVA)', 'An asset managed by KYC Kred Pty Ltd that requires KYC and AML compliance. Includes USDC, stablecoins, and potentially high-value NFTs ($100 and above).'],
                  ['ERC-1155', 'A multi-token standard on the Ethereum blockchain. Kredits use this standard and are permanently transfer-locked.'],
                ].map(([term, def]) => (
                  <tr key={term}>
                    <td style={{ ...tableCell, fontWeight: 700, color: 'var(--color-text)' }}>{term}</td>
                    <td style={tableCell}>{def}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </article>

      <SiteFooter stage={stage} />
    </div>
  );
}
