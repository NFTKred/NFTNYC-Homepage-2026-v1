import { useEffect, useState } from 'react';
import { Check, ExternalLink, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PagePreview } from './kredentials/PagePreview';
import {
  getMyKredentialsDomain,
  isDomainAvailable,
  registerDomain,
  type KredentialsPageDomain,
} from '@/lib/speakerflow/api';

/**
 * KredentialsSetupPanel — registers a .kred domain for the participant and
 * previews the Kredentials page that gets created for it.
 *
 * Replaces the token-minting tail of the original speaker flow: no coins are
 * minted here, we only claim the name and show the resulting page.
 */
interface KredentialsSetupPanelProps {
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  eyebrow?: string;
  links?: string[];
  onRegistered?: (domain: string) => void;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '')
    .slice(0, 30);
}

export function KredentialsSetupPanel({
  displayName,
  avatarUrl = '',
  bio,
  eyebrow,
  links,
  onRegistered,
}: KredentialsSetupPanelProps) {
  const [subdomain, setSubdomain] = useState(() => slugify(displayName));
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [registering, setRegistering] = useState(false);
  const [existing, setExisting] = useState<KredentialsPageDomain | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getMyKredentialsDomain().then((d) => {
      if (!cancelled) setExisting(d);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const fullDomain = `${subdomain}.kred`;

  const check = async () => {
    if (!subdomain) return;
    setChecking(true);
    setAvailable(null);
    try {
      setAvailable(await isDomainAvailable(fullDomain));
    } finally {
      setChecking(false);
    }
  };

  const claim = async () => {
    if (!subdomain) return;
    setRegistering(true);
    try {
      await registerDomain(fullDomain);
      toast.success(`${fullDomain} is yours — your Kredentials page is live.`);
      onRegistered?.(fullDomain);
      setExisting({ id: fullDomain, name: fullDomain });
    } catch (err) {
      console.error('registerDomain failed:', err);
      toast.error(err instanceof Error ? err.message : 'Could not register that name.');
    } finally {
      setRegistering(false);
    }
  };

  if (existing) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Check className="h-4 w-4 text-green-500" /> Your Kredentials page is live
          </p>
          <a
            href={`https://${existing.name}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-sm text-primary underline"
          >
            {existing.name} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <PagePreview
          displayName={displayName}
          avatarUrl={avatarUrl}
          subdomain={existing.name.replace(/\.kred$/i, '')}
          eyebrow={eyebrow}
          bio={bio}
          links={links}
          variant="full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="kred-subdomain">Claim your .Kred name</Label>
        <div className="flex items-center gap-2">
          <Input
            id="kred-subdomain"
            value={subdomain}
            onChange={(e) => {
              setSubdomain(slugify(e.target.value));
              setAvailable(null);
            }}
            placeholder="yourname"
          />
          <span className="text-sm text-muted-foreground">.Kred</span>
          <Button type="button" variant="outline" onClick={check} disabled={checking || !subdomain}>
            {checking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        {available === true && (
          <p className="text-xs text-green-500">{fullDomain} is available.</p>
        )}
        {available === false && (
          <p className="text-xs text-destructive">{fullDomain} is already taken.</p>
        )}
      </div>

      <PagePreview
        displayName={displayName}
        avatarUrl={avatarUrl}
        subdomain={subdomain || 'yourname'}
        eyebrow={eyebrow}
        bio={bio}
        links={links}
        variant="full"
      />

      <Button
        className="w-full"
        size="lg"
        onClick={claim}
        disabled={registering || !subdomain || available === false}
      >
        {registering ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering…
          </>
        ) : (
          `Register ${fullDomain}`
        )}
      </Button>
    </div>
  );
}