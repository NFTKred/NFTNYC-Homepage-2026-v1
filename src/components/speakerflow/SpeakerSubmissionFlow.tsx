import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SpeakerPoSPreviewPanel } from './SpeakerPoSPreviewPanel';
import {
  SpeakerDerivativesSetupPanel,
  type SpeakerDerivativesDetails,
} from './SpeakerDerivativesSetupPanel';
import { KredentialsSetupPanel } from './KredentialsSetupPanel';
import { ImageUploadField } from './ImageUploadField';
import { getSessionizeData } from '@/lib/speakerflow/api';

/**
 * SpeakerSubmissionFlow — transferred speaker submission flow (OneHub EXP011).
 *
 * NOT ROUTED ON PURPOSE. There is no route or nav entry for this component;
 * it stays unreachable until we adapt it into the vibesprint registration.
 *
 * Differences from the source flow:
 *  - No token minting. The Proof-of-Submission mint step is replaced by a
 *    simple profile step + preview card.
 *  - Adds a Kredentials step that registers a .kred domain and shows the
 *    resulting page preview.
 */
type Step = 'info' | 'derivatives' | 'kredentials' | 'done';

interface SpeakerProfile {
  speakerName: string;
  sessionName: string;
  avatar: string;
  bio: string;
}

export function SpeakerSubmissionFlow({ channelName }: { channelName?: string }) {
  const [step, setStep] = useState<Step>('info');
  const [profile, setProfile] = useState<SpeakerProfile>({
    speakerName: '',
    sessionName: '',
    avatar: '',
    bio: '',
  });
  const [derivatives, setDerivatives] = useState<SpeakerDerivativesDetails>({});

  // Hydrate from Sessionize the same way the source flow's `info` step does.
  useEffect(() => {
    let cancelled = false;
    void getSessionizeData().then((data) => {
      if (cancelled || !data) return;
      setProfile((p) => ({
        speakerName: (data.speaker_name as string) || (data.name as string) || p.speakerName,
        sessionName: (data.session_name as string) || p.sessionName,
        avatar: (data.avatar as string) || (data.profile_picture as string) || p.avatar,
        bio: (data.bio as string) || p.bio,
      }));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setDerivativesDets = (
    key: keyof SpeakerDerivativesDetails,
    value: string | boolean | undefined,
  ) => setDerivatives((d) => ({ ...d, [key]: value }));

  return (
    <div className="mx-auto grid max-w-5xl gap-8 p-6 md:grid-cols-[300px_1fr]">
      <aside>
        <SpeakerPoSPreviewPanel speakerName={profile.speakerName} avatar={profile.avatar} />
      </aside>

      <main className="space-y-6">
        {step === 'info' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your details</h2>
            <div className="space-y-2">
              <Label htmlFor="speaker-name">Name</Label>
              <Input
                id="speaker-name"
                value={profile.speakerName}
                onChange={(e) => setProfile((p) => ({ ...p, speakerName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-name">Session / project</Label>
              <Input
                id="session-name"
                value={profile.sessionName}
                onChange={(e) => setProfile((p) => ({ ...p, sessionName: e.target.value }))}
              />
            </div>
            <ImageUploadField
              id="speaker-avatar"
              label="Avatar"
              value={profile.avatar}
              onChange={(url) => setProfile((p) => ({ ...p, avatar: url }))}
              aspectRatio={1}
            />
            <Button
              className="w-full"
              size="lg"
              disabled={!profile.speakerName.trim()}
              onClick={() => setStep('derivatives')}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 'derivatives' && (
          <SpeakerDerivativesSetupPanel
            channelName={channelName}
            profile={{
              speakerName: profile.speakerName,
              sessionName: profile.sessionName,
              avatar: profile.avatar,
            }}
            derivativesDetails={derivatives}
            setDerivativesDets={setDerivativesDets}
            goNext={() => setStep('kredentials')}
          />
        )}

        {step === 'kredentials' && (
          <KredentialsSetupPanel
            displayName={profile.speakerName}
            avatarUrl={profile.avatar}
            eyebrow={profile.sessionName}
            bio={profile.bio}
            onRegistered={() => setStep('done')}
          />
        )}

        {step === 'done' && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">All set</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your details, artwork and .Kred page have been saved.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default SpeakerSubmissionFlow;