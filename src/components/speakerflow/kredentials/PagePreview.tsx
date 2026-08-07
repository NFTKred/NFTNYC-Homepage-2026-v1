/**
 * Visual preview of the live name.Kred page.
 * Used in stage 1 (Discovery) and stage 6 (Live).
 */
import {
  Award,
  Bot,
  ChevronDown,
  ChevronUp,
  Circle,
  ExternalLink,
  Eye,
  IdCard,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export type KredentialsPreviewView = 'tabsview' | 'linkinbio';

interface Props {
  displayName: string;
  avatarUrl: string;
  bannerImageUrl?: string;
  subdomain: string;
  eyebrow?: string;
  bio?: string;
  links?: string[];
  variant?: 'thumbnail' | 'full';
  view?: KredentialsPreviewView;
}

const TAB_LABELS = ['Story', 'Wallet', 'Passport', 'Links', 'About'] as const;

const PASSPORT_ROWS = [
  { icon: ShieldCheck, title: 'Gitcoin Passport', sub: 'Score 28.5 · refreshed weekly' },
  { icon: Award, title: 'Verification', sub: 'Issued by trusted source' },
  { icon: IdCard, title: 'Identity attestation', sub: 'Issued on Base · 2026' },
  { icon: Sparkles, title: '.Kred ownership', sub: 'Issued by Domains.Kred · indelible' },
] as const;

export function PagePreview({
  displayName,
  avatarUrl,
  bannerImageUrl,
  subdomain,
  eyebrow,
  bio,
  links = [],
  variant = 'thumbnail',
  view = 'tabsview',
}: Props) {
  return (
    <div className="relative">
      {view === 'linkinbio' ? (
        <LinkInBioPreview
          displayName={displayName}
          avatarUrl={avatarUrl}
          subdomain={subdomain}
          bio={bio}
          links={links}
          variant={variant}
        />
      ) : (
        <TabsPreview
          displayName={displayName}
          avatarUrl={avatarUrl}
          bannerImageUrl={bannerImageUrl}
          subdomain={subdomain}
          eyebrow={eyebrow}
          bio={bio}
          variant={variant}
        />
      )}

    </div>
  );
}

function TabsPreview({
  displayName,
  avatarUrl,
  bannerImageUrl,
  subdomain,
  eyebrow,
  bio,
  variant,
}: Required<Pick<Props, 'displayName' | 'avatarUrl' | 'subdomain' | 'variant'>> &
  Pick<Props, 'eyebrow' | 'bio' | 'bannerImageUrl'>) {
  const shortBio =
    bio ||
    'Making digital simple since 1995. NYT bestselling author, AI keynote speaker, and co-host of The Bad Crypto Podcast.';
  const firstName = displayName.split(' ')[0] || subdomain;
  const passportCount = PASSPORT_ROWS.length;

  return (
    <div className="rounded-2xl border border-gray-700/50 overflow-hidden shadow-sm bg-black text-white relative">
      <PreviewRibbon />

      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-black/50 border-b border-white/10 relative z-0">
        <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
        <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
        <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
        <div className="ml-3 text-xs text-foreground/60 font-mono truncate flex items-center gap-1.5">
          <Eye className="w-3 h-3" />
          {subdomain}.kred
        </div>
      </div>

      {/* Hero header — replaces the old avatar + name row */}
      <div className="relative overflow-hidden bg-black text-white">
        {bannerImageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bannerImageUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        <div className="relative z-10 p-5">
          <div className="inline-flex max-w-full items-center rounded-full border border-white/25 bg-black/25 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-white/80">
            <span className="truncate">{eyebrow || 'Author · Podcaster · Keynote'}</span>
          </div>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight leading-tight">{displayName}</h2>

          <p className="mt-2 text-xs leading-snug text-white/75 line-clamp-2">{shortBio}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-white/55">
            <span className="rounded bg-red-900/60 px-1.5 py-0.5 font-mono text-white/90">{subdomain}.Kred</span>
            <span className="inline-flex items-center gap-1">
              <Circle className="h-1.5 w-1.5 fill-white/50" />
              0xCODE..1995
            </span>
            <span className="inline-flex items-center gap-1">
              <Circle className="h-1.5 w-1.5" />
              Updated 7m ago
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="rounded-md bg-white px-3 py-1.5 text-[10px] font-medium text-black shadow-sm">
              Visit {firstName}.com <ExternalLink className="inline h-2.5 w-2.5" />
            </button>
            <button type="button" className="rounded-md border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-medium text-white">
              Book {firstName} to speak <ExternalLink className="inline h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 px-5 border-b border-border text-xs select-none bg-black">
        {TAB_LABELS.map((tab, i) => {
          const active = i === 2;
          const badge = tab === 'Passport' ? passportCount : null;
          return (
            <div
              key={tab}
              className={`pb-2 px-2 border-b-2 cursor-default ${
                active ? 'border-primary text-foreground font-medium' : 'border-transparent text-foreground/50'
              }`}
            >
              {tab}
              {badge != null && <span className="ml-1 text-foreground/40">({badge})</span>}
            </div>
          );
        })}
      </div>

      {/* Passport tab content */}
      <div className="p-5 space-y-2.5">
        {PASSPORT_ROWS.map((row) => (
          <div key={row.title} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
            <div className="flex-shrink-0 w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <row.icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">{row.title}</div>
              <div className="text-[10px] text-foreground/50 truncate">{row.sub}</div>
            </div>
            <span className="text-[10px] text-primary inline-flex items-center gap-0.5 flex-shrink-0 select-none cursor-default">
              verify <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </div>
        ))}
        <div className="pt-2 text-[10px] text-foreground/50 italic">
          Anchored to: ICANN DNS · ERC-721 on Base · indelible across both
        </div>
      </div>

      {variant === 'full' && bio && (
        <div className="px-5 pb-5 text-[11px] text-foreground/60 leading-relaxed border-t border-border pt-4">
          {bio}
        </div>
      )}
    </div>
  );
}

function LinkInBioPreview({
  displayName,
  avatarUrl,
  subdomain,
  bio,
  links,
  variant,
}: Required<Pick<Props, 'displayName' | 'avatarUrl' | 'subdomain' | 'links' | 'variant'>> &
  Pick<Props, 'bio'>) {
  const name = displayName || `${subdomain}.Kred`;
  const isFull = variant === 'full';

  return (
    <div className="mx-auto max-w-[320px]">
      <div className="relative overflow-hidden rounded-[1.9rem] border border-border bg-[#c7ff1f] text-black shadow-xl">
        <PreviewRibbon />

        <div className="h-28 bg-[linear-gradient(115deg,#f47461_0%,#f47461_45%,#79cbbb_46%,#79cbbb_100%)]">
          <div className="mx-auto flex h-full w-40 items-end justify-center">
            <img
              src={avatarUrl}
              alt=""
              className="h-24 w-24 translate-y-7 rounded-full border-4 border-[#c7ff1f] object-cover shadow-lg"
            />
          </div>
        </div>

        <div className="px-5 pb-24 pt-10 text-center">
          <h2 className="text-xl font-bold">{subdomain}.Kred</h2>
          <div className="mt-1 text-xs text-black/55">★ Kred Score 82</div>
          <p className="mx-auto mt-4 max-w-[240px] text-sm leading-snug">
            {bio || `${name} is building a verified profile with AI-ready links, facts, and citations.`}
          </p>

          <div className="mt-5 space-y-2.5">
            {previewLinks(links).slice(0, 3).map((link) => (
              <button
                key={link.url}
                className="w-full rounded-full bg-white px-4 py-3 text-sm font-semibold shadow-sm"
              >
                {link.title}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 rounded-t-[1.4rem] bg-[#10150d] px-4 py-3 text-left text-[#d6ff39] shadow-2xl">
          <div className="flex items-center gap-2 text-white">
            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#d6ff39] text-[#d6ff39]">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="text-sm font-bold">AI Wingman</div>
            <span className="ml-auto flex items-center gap-1 text-[10px] font-medium tracking-widest text-white/75">
              <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
              LIVE
            </span>
            {isFull ? <ChevronDown className="h-4 w-4 text-[#d6ff39]" /> : <ChevronUp className="h-4 w-4 text-[#d6ff39]" />}
          </div>

          {isFull && (
            <div className="mt-4 max-h-56 overflow-hidden font-mono text-[10px] leading-relaxed">
              <div className="font-bold text-[#d6ff39]">generated story</div>
              <p className="mt-1 text-white/70">
                "{name} brings verified links, public proof, and fresh citations into a single AI-readable
                profile. Stocked at {subdomain}.kred..."
              </p>

              <div className="mt-3 font-bold text-[#d6ff39]">generated facts · 3</div>
              <div className="mt-1 space-y-1 text-white/70">
                <p><span className="text-white">Q: Where are they located?</span><br />A: Verified from public profile data.</p>
                <p><span className="text-white">Q: What do they do?</span><br />A: Creator, speaker, and digital identity builder.</p>
              </div>

              <div className="mt-3 font-bold text-[#d6ff39]">suggested new links · 159</div>
              {previewLinks(links).slice(0, 4).map((link) => (
                <div key={link.url} className="truncate text-[#bfff2f]">
                  + {link.url.replace(/^https?:\/\//, '')}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewRibbon() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <div className="absolute top-4 right-[-2.5rem] rotate-45 bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider px-10 py-1">
        Preview
      </div>
    </div>
  );
}

function previewLinks(links: string[]) {
  const fallbacks = [
    { title: 'Order online', url: 'https://example.com/order' },
    { title: 'Our story', url: 'https://example.com/story' },
    { title: 'Visit the profile', url: 'https://example.com/profile' },
    { title: 'X / Twitter', url: 'https://x.com/example' },
  ];

  if (!links.length) return fallbacks;

  return links.map((url, i) => ({
    title: linkTitle(url, i),
    url,
  }));
}

function linkTitle(url: string, index: number): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host.includes('linktr.ee')) return 'Linktree';
    if (host.includes('twitter.com') || host.includes('x.com')) return 'X / Twitter';
    if (host.includes('linkedin.com')) return 'LinkedIn';
    if (host.includes('instagram.com')) return 'Instagram';
    return host.split('.')[0].replace(/-/g, ' ');
  } catch {
    return `Link ${index + 1}`;
  }
}
