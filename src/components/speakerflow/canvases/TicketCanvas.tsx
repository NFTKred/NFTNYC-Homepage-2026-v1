import { TICKET_TEMPLATE_FRAME_DATA_URI } from './assets/ticketTemplateFrameBase64';
import { SPEAKER_TICKET_BACKGROUND_DATA_URI } from './assets/speakerTicketBackgroundBase64';
import { canvasWrapStyle } from './canvasShared';

/**
 * TicketCanvas — dual-mode port of CK ticket previews:
 *
 * **Artist derivatives** (`TicketPreview2025` in DerivativesSetup.js):
 *   - `artwork` prop — cropped ticket art beneath NFT.NYC 2025 frame (761×1343)
 *
 * **Speaker referral tickets** (`TicketPreview` in SpeakersDerivativesSetup.js):
 *   - `avatar` + `speakerName` — circular avatar on speaker ticket frame (762×1340)
 *
 * Canvas id matches CK exactly (`generated-render-ticket`).
 */
interface TicketCanvasProps {
  /** Artist derivative: cropped ticket artwork (derivativesDetails.tickets). */
  artwork?: string;
  /** Speaker mode: avatar image URL or base64. */
  avatar?: string;
  /** Speaker mode: name rendered in Helvetica 40px centered. */
  speakerName?: string;
  visible?: boolean;
  id?: string;
}

export function TicketCanvas({
  artwork,
  avatar,
  speakerName,
  visible = false,
  id = 'generated-render-ticket',
}: TicketCanvasProps) {
  const isSpeakerMode = !!(avatar || speakerName);
  const avatarPatternId = `${id}-avatar-pattern`;

  if (isSpeakerMode) {
    return (
      <div style={canvasWrapStyle(visible)} aria-hidden={!visible}>
        <svg
          id={id}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 762 1340"
          width={visible ? '100%' : 'auto'}
          height={visible ? '100%' : '90px'}
        >
          <image
            id="Background"
            x="0"
            y="0"
            width="762"
            height="1340"
            href={SPEAKER_TICKET_BACKGROUND_DATA_URI}
          />

          <defs>
            <pattern
              id={avatarPatternId}
              x="0%"
              y="0%"
              height="100%"
              width="100%"
              viewBox="0 0 512 512"
            >
              {avatar && (
                <image
                  x="0%"
                  y="0%"
                  width="512"
                  height="512"
                  href={avatar}
                  preserveAspectRatio="xMidYMid slice"
                />
              )}
            </pattern>
          </defs>

          <circle
            id="sd"
            cx="381"
            cy="450"
            r="270"
            fill={`url(#${avatarPatternId})`}
          />

          <foreignObject y="760" x="0" width="762" height="120">
            <div
              style={{
                fontFamily: 'Helvetica, Arial, sans-serif',
                textAlign: 'center',
                fontSize: '40px',
                letterSpacing: '2px',
                color: '#fff',
              }}
            >
              {speakerName}
            </div>
          </foreignObject>
        </svg>
      </div>
    );
  }

  return (
    <div style={canvasWrapStyle(visible)} aria-hidden={!visible}>
      <svg
        id={id}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 761 1343"
        width={visible ? '100%' : '37%'}
        height={visible ? '100%' : 'auto'}
      >
        {artwork && (
          <image
            x="0"
            y="0"
            preserveAspectRatio="xMidYMid slice"
            height="100%"
            width="100%"
            href={artwork}
          />
        )}
        <image
          x="0"
          y="0"
          width="761"
          height="1343"
          href={TICKET_TEMPLATE_FRAME_DATA_URI}
        />
      </svg>
    </div>
  );
}
