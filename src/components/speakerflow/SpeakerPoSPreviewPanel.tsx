import { Mic, User as UserIcon } from 'lucide-react';

/**
 * SpeakerPoSPreviewPanel — port of CK Mint/SpeakerPoSPreview.js.
 *
 * Shown in the left column during the `info` step of EXP011
 * SpeakerSubmission. CK's original embeds a 3 MB SVG NFT.NYC speaker
 * card template; the simplified port composes the same imagery using
 * the user's avatar + speaker name over an NFT.NYC-branded card so the
 * speaker sees what the Proof-of-Submission NFT will look like.
 */
interface SpeakerPoSPreviewPanelProps {
  speakerName?: string;
  avatar?: string;
}

export function SpeakerPoSPreviewPanel({ speakerName, avatar }: SpeakerPoSPreviewPanelProps) {
  return (
    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-border shadow-lg bg-gradient-to-br from-fuchsia-600 via-purple-700 to-indigo-900">
      <div className="absolute inset-0 flex flex-col items-center justify-between p-6 text-white">
        {/* Top — event branding */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest opacity-80">NFT.NYC 2025</p>
          <p className="mt-1 text-sm font-semibold flex items-center justify-center gap-1.5">
            <Mic className="h-3.5 w-3.5" /> Speaker
          </p>
        </div>

        {/* Middle — avatar */}
        <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white/30 bg-white/10 flex items-center justify-center">
          {avatar ? (
            <img src={avatar} alt={speakerName || 'Speaker avatar'} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="h-12 w-12 text-white/70" />
          )}
        </div>

        {/* Bottom — name */}
        <div className="text-center">
          <p className="text-lg font-bold leading-tight">
            {speakerName?.trim() || 'Your Name'}
          </p>
          <p className="text-xs opacity-70 mt-1">Proof of Submission</p>
        </div>
      </div>
    </div>
  );
}
