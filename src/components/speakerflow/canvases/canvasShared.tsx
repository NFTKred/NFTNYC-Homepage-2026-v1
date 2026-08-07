import { MONUMENT_FONT_DATA_URI } from './assets/monumentFontBase64';

export interface CanvasDetails {
  isVideo?: boolean;
  bg?: string;
  creator_name?: string;
  artwork_name?: string;
}

/** Hidden off-screen wrapper used by rasterization canvases (matches CK pattern). */
export function canvasWrapStyle(visible: boolean): React.CSSProperties {
  return visible
    ? { width: '100%', height: '100%', position: 'relative' as const }
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
}

/** CK PostcardPreview / PosterPreview embedded Monument @font-face. */
export const MONUMENT_FONT_FACE_STYLE = `@font-face {
  font-family: "Monument";
  src: url('${MONUMENT_FONT_DATA_URI}');
}`;

interface CanvasVideoBackgroundProps {
  id: string;
  src?: string;
}

/** CK video background — absolute cover behind the SVG (z-index -2). */
export function CanvasVideoBackground({ id, src }: CanvasVideoBackgroundProps) {
  if (!src) return null;
  return (
    <video
      id={id}
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
      loop
      muted
      playsInline
      crossOrigin="anonymous"
      src={src}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
