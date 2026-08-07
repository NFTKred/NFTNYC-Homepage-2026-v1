import { useState } from 'react';
import { Loader2, Ticket, Mic, Layers as CardIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ImageUploadField } from './ImageUploadField';
import { setSpeakerSubmissionData } from '@/lib/speakerflow/api';

/**
 * SpeakerDerivativesSetupPanel — ported from OneHub (CK
 * Mint/SpeakersDerivativesSetup.js). Collects cropped artwork for the three
 * derivative products and persists the URLs via `setSpeakerSubmissionData`.
 *
 * No tokens are minted here — the batch/pos fields are optional metadata.
 */
export interface SpeakerDerivativesDetails {
  flyers?: string;
  noFlyers?: boolean;
  tickets?: string;
  noTickets?: boolean;
  ticketArtname?: string;
  speakercards?: string;
  noSpeakerCards?: boolean;
}

interface SpeakerProfileSnapshot {
  speakerName?: string;
  sessionName?: string;
  avatar?: string;
}

interface SpeakerDerivativesSetupPanelProps {
  channelName?: string;
  profile?: SpeakerProfileSnapshot;
  derivativesDetails: SpeakerDerivativesDetails;
  setDerivativesDets: (
    key: keyof SpeakerDerivativesDetails,
    value: string | boolean | undefined,
  ) => void;
  goNext: () => void;
}

export function SpeakerDerivativesSetupPanel({
  channelName,
  profile,
  derivativesDetails,
  setDerivativesDets,
  goNext,
}: SpeakerDerivativesSetupPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState('');

  const fallbackArt = profile?.avatar || '';

  const submit = async () => {
    setIsSubmitting(true);
    setProgress('Saving your artwork...');

    try {
      await setSpeakerSubmissionData({
        channel: channelName || '',
        flyer_image: derivativesDetails.noFlyers ? '' : derivativesDetails.flyers || '',
        flyer_cropped_image: derivativesDetails.noFlyers
          ? ''
          : derivativesDetails.flyers || profile?.avatar || '',
        ticket_image: derivativesDetails.noTickets ? '' : derivativesDetails.tickets || '',
        ticket_cropped_image: derivativesDetails.noTickets
          ? ''
          : derivativesDetails.tickets || profile?.avatar || '',
        ticket_artname: derivativesDetails.ticketArtname || '',
        speakercard_image: derivativesDetails.noSpeakerCards
          ? ''
          : derivativesDetails.speakercards || '',
        speakercard_cropped_image: derivativesDetails.noSpeakerCards
          ? ''
          : derivativesDetails.speakercards || profile?.avatar || '',
      });

      toast.success('Your submission is complete!');
      goNext();
    } catch (err) {
      console.error('SpeakerDerivatives submit failed:', err);
      toast.error(
        err instanceof Error ? err.message : 'Failed to save your submission. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
      setProgress('');
    }
  };

  return (
    <div className="speaker-derivatives-setup-panel space-y-5">
      <SpeakerDerivativeCard
        Icon={Mic}
        label="Session Flyer"
        hint="Feature your session details on a collectible flyer."
        optedOut={!!derivativesDetails.noFlyers}
        onOptOutChange={(v) => setDerivativesDets('noFlyers', v)}
        previewArt={derivativesDetails.flyers || fallbackArt}
        previewOverlay={
          profile?.speakerName || profile?.sessionName ? (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
              {profile?.speakerName && (
                <p className="truncate text-sm font-semibold">{profile.speakerName}</p>
              )}
              {profile?.sessionName && (
                <p className="truncate text-xs opacity-80">{profile.sessionName}</p>
              )}
            </div>
          ) : null
        }
      >
        <ImageUploadField
          id="speaker-flyer"
          label="Flyer Artwork"
          hint="Recommended portrait (1000 × 1500)."
          value={derivativesDetails.flyers || ''}
          onChange={(url) => setDerivativesDets('flyers', url)}
          aspectRatio={2 / 3}
        />
      </SpeakerDerivativeCard>

      <SpeakerDerivativeCard
        Icon={Ticket}
        label="Referral Tickets"
        hint="Feature your avatar on a ticket the community can collect."
        optedOut={!!derivativesDetails.noTickets}
        onOptOutChange={(v) => setDerivativesDets('noTickets', v)}
        previewArt={derivativesDetails.tickets || fallbackArt}
      >
        <ImageUploadField
          id="speaker-ticket"
          label="Ticket Artwork"
          value={derivativesDetails.tickets || ''}
          onChange={(url) => setDerivativesDets('tickets', url)}
        />
      </SpeakerDerivativeCard>

      <SpeakerDerivativeCard
        Icon={CardIcon}
        label="Collector Cards"
        hint="A limited-edition collector card for attendees."
        optedOut={!!derivativesDetails.noSpeakerCards}
        onOptOutChange={(v) => setDerivativesDets('noSpeakerCards', v)}
        previewArt={derivativesDetails.speakercards || fallbackArt}
      >
        <ImageUploadField
          id="speaker-card"
          label="Card Artwork"
          value={derivativesDetails.speakercards || ''}
          onChange={(url) => setDerivativesDets('speakercards', url)}
        />
      </SpeakerDerivativeCard>

      <Button className="w-full" size="lg" onClick={submit} disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {progress || 'Submitting...'}
          </>
        ) : (
          'Save and continue'
        )}
      </Button>
    </div>
  );
}

interface SpeakerDerivativeCardProps {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  optedOut: boolean;
  onOptOutChange: (v: boolean) => void;
  previewArt?: string;
  previewOverlay?: React.ReactNode;
  children: React.ReactNode;
}

function SpeakerDerivativeCard({
  Icon,
  label,
  hint,
  optedOut,
  onOptOutChange,
  previewArt,
  previewOverlay,
  children,
}: SpeakerDerivativeCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        optedOut ? 'border-border bg-muted/20 opacity-60' : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{label}</p>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <span>{optedOut ? 'Opted out' : 'Include'}</span>
              <Switch checked={!optedOut} onCheckedChange={(v) => onOptOutChange(!v)} />
            </label>
          </div>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>

      {!optedOut && (
        <div className="mt-3 space-y-3">
          {previewArt && (
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[240px] overflow-hidden rounded-md border border-border bg-muted/30">
              <img src={previewArt} alt={`${label} preview`} className="h-full w-full object-cover" />
              {previewOverlay}
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}