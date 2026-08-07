import { POS_TEMPLATE_FRAME_DATA_URI } from './assets/posTemplateFrameBase64';
import { HELVETICA_FONT_BASE64 } from './assets/helveticaFontBase64';

/**
 * PoSCanvas — port of CK Mint/template/PoSPreview.js.
 *
 * Hidden 2000×2000 SVG (+ optional background video) that renders the Proof
 * of Submission NFT artwork the back-office mint pipeline expects:
 *
 *   - Template frame background  (embedded PNG — full 2000×2000)
 *   - Artwork                    (1620×1620 centred at x=300 y=90, skipped for video)
 *   - Creator name overlay       (Helvetica 72px white text, y≈1835)
 *
 * The canvas id matches CK exactly (`generated-render-pos`) so the
 * `rasterizeSvgAndUpload` utility can serialise it the same way.
 *
 * Rendered hidden off-screen while the user is on the design step so it's
 * always in the DOM and ready to rasterise when the user clicks Upload Artwork.
 */
interface PoSCanvasProps {
  creatorName?: string;
  canvasDetails?: {
    isVideo?: boolean;
    bg?: string;
    [key: string]: unknown;
  };
  /** Face artwork as base64 data URI (CK `base64face`). */
  base64face?: string;
  /** Cropped PoS artwork (CK `croppedPos`). Takes precedence over base64face. */
  croppedPos?: string;
  /** Render visibly (used for preview screens) instead of hidden off-screen. */
  visible?: boolean;
  /** Override SVG element id. Defaults to `generated-render-pos`. */
  id?: string;
}

const POS_SVG_STYLES = `.cls-1 {
  filter: url(#filter);
}

.cls-2 {
  fill: #fff;
  fill-rule: evenodd;
}

@font-face {
  font-family: "Helvetica";
  /* Add other properties here, as needed. For example: */
  /*
  font-weight: 100 900;
  font-style: normal italic;
  */
  src: url(data:application/octet-stream;base64,${HELVETICA_FONT_BASE64});
}`;

export function PoSCanvas({
  creatorName,
  canvasDetails = {},
  base64face,
  croppedPos,
  visible = false,
  id = 'generated-render-pos',
}: PoSCanvasProps) {
  const hiddenWrapStyle: React.CSSProperties = visible
    ? { width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }
    : {
        position: 'absolute',
        left: -99999,
        top: -99999,
        width: 1,
        height: 1,
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
      };

  return (
    <div style={hiddenWrapStyle} aria-hidden={!visible}>
      {canvasDetails.isVideo ? (
        <video
          id="generated-video-pos"
          style={{
            objectFit: 'cover',
            height: 'calc(100% - 1px)',
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: -2,
          }}
          autoPlay
          controls={false}
          loop
          muted
          role="video"
          src={canvasDetails?.bg}
          crossOrigin="anonymous"
        >
          <source src={canvasDetails?.bg} type="video/mp4" />
        </video>
      ) : null}

      <svg
        id={id}
        width={visible ? '100%' : '90px'}
        height={visible ? '100%' : '90px'}
        viewBox="0 0 2000 2000"
      >
        <defs>
          <style>{POS_SVG_STYLES}</style>
        </defs>

        <image width="2000" height="2000" href={POS_TEMPLATE_FRAME_DATA_URI} />

        {!canvasDetails?.isVideo ? (
          <image x="300" y="90" height="1620" width="1620" href={croppedPos || base64face} />
        ) : null}

        <foreignObject y="1835" x="313" width="1200" height="120" fontFamily="Helvetica" color="#fff">
          <div
            style={{
              fontFamily: 'Helvetica',
              textAlign: 'left',
              fontSize: '72px',
              letterSpacing: '2px',
            }}
          >
            {creatorName}
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
