/**
 * SVG canvas rasterization utility — port of CK Mint/index.js `generatePoS`
 * pipeline (L1671-1880) and the equivalent flows in DerivativesSetup.js.
 *
 * The CK flow renders a hidden `<svg>` with a known DOM id (e.g.
 * `generated-render-pos`), serialises it to a base64 data URL, loads the
 * data URL into an Image, draws the image onto a canvas, and uploads the
 * canvas blob via `uploadFormBlob`. The server returns a hosted URL which
 * becomes the NFT face.
 *
 * We mirror that exactly here so the OH artistsubmission / derivatives
 * flows produce the same templated NFT artwork CK does.
 */

import { uploadFormBlob } from '@/lib/api';
import { updateImageURL } from '@/lib/media';

export interface RasterizeOptions {
  /** DOM id of the `<svg>` element to rasterize. */
  svgId: string;
  /** Output canvas width in pixels. Should match the SVG viewBox width. */
  width: number;
  /** Output canvas height in pixels. Should match the SVG viewBox height. */
  height: number;
  /** Filename hint for the uploaded blob. */
  filename: string;
  /** Image type — defaults to image/jpeg (matches CK PoS upload). */
  mimeType?: 'image/jpeg' | 'image/png';
  /**
   * JPEG quality (0..1). Ignored when mimeType is image/png. Defaults to
   * 0.92 (browser default).
   */
  quality?: number;
  /**
   * Extra ms to wait after SVG `<image>` assets load before serialising.
   * CK `generatePoS` uses ~1000ms so embedded artwork paints into the SVG.
   */
  settleMs?: number;
}

/**
 * Ensure the PoS artwork `<image>` has an embeddable href before serialising.
 * CK uses `croppedPos || base64face` on the hidden `#generated-render-pos` SVG.
 */
export function applyPoSArtworkToSvg(
  svgId: string,
  artwork?: string,
): void {
  if (!artwork) return;
  const svg = document.getElementById(svgId) as unknown as SVGSVGElement | null;
  if (!svg) return;
  const artEl =
    svg.querySelector('image[y="90"][width="1620"]') ||
    svg.querySelector('image[height="1620"]');
  if (!artEl) return;
  artEl.setAttribute('href', artwork);
  artEl.setAttributeNS('http://www.w3.org/1999/xlink', 'href', artwork);
}

/** CK generatePoS — wait for embedded `<image>` hrefs to load before rasterise. */
async function waitForSvgImages(svg: SVGSVGElement, timeoutMs = 5000): Promise<void> {
  const hrefs = Array.from(svg.querySelectorAll('image'))
    .map((el) => el.getAttribute('href') || el.getAttributeNS('http://www.w3.org/1999/xlink', 'href'))
    .filter((href): href is string => !!href);

  await Promise.all(
    hrefs.map(
      (href) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          const done = () => resolve();
          img.onload = done;
          img.onerror = done;
          setTimeout(done, timeoutMs);
          img.src = href;
        }),
    ),
  );
}

/**
 * Serialise a hidden `<svg>` to a Blob (PNG/JPEG) — used by `rasterizeSvgAndUpload`.
 * Exposed separately so callers that need the raw Blob (e.g. inline preview)
 * can use it without the upload step.
 */
export async function rasterizeSvgToBlob({
  svgId,
  width,
  height,
  mimeType = 'image/jpeg',
  quality = 0.92,
  settleMs = 0,
}: Omit<RasterizeOptions, 'filename'>): Promise<Blob> {
  const svg = document.getElementById(svgId) as unknown as SVGSVGElement | null;
  if (!svg) {
    throw new Error(`SVG element with id="${svgId}" not found in the DOM`);
  }

  // Hide any placeholder text that's only meant for the design-time UI
  // (CK Info.js line 1674: `$(svg).find('.placeholder-text').hide()`).
  const placeholders = svg.querySelectorAll<HTMLElement>('.placeholder-text');
  placeholders.forEach((el) => {
    el.dataset.prevDisplay = el.style.display;
    el.style.display = 'none';
  });

  try {
    await waitForSvgImages(svg);
    if (settleMs > 0) {
      await new Promise((r) => setTimeout(r, settleMs));
    }

    const serialized = new XMLSerializer().serializeToString(svg);
    // Browser-safe base64 of the UTF-8 SVG string — same trick CK uses
    // (`window.btoa(unescape(encodeURIComponent(s)))`).
    const base64 = window.btoa(unescape(encodeURIComponent(serialized)));
    const dataUrl = `data:image/svg+xml;base64,${base64}`;

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.width = width;
      i.height = height;
      i.crossOrigin = 'Anonymous';
      i.onload = () => resolve(i);
      i.onerror = (e) =>
        reject(new Error(`Failed to load serialized SVG into Image: ${String(e)}`));
      i.src = dataUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    // White background for JPEG (otherwise transparent pixels render black)
    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('canvas.toBlob returned null'))),
        mimeType,
        quality,
      );
    });
    return blob;
  } finally {
    // Restore placeholder visibility so the live preview is unchanged.
    placeholders.forEach((el) => {
      el.style.display = el.dataset.prevDisplay || '';
      delete el.dataset.prevDisplay;
    });
  }
}

/**
 * Rasterise a hidden SVG canvas and upload the resulting blob via
 * `uploadFormBlob`. Returns the hosted URL on success.
 *
 * Throws when the SVG can't be found, can't be serialised, or the upload
 * fails — callers should `try/catch` and surface a toast to the user.
 */
export async function rasterizeSvgAndUpload(
  opts: RasterizeOptions,
): Promise<string> {
  const blob = await rasterizeSvgToBlob(opts);
  return new Promise<string>((resolve, reject) => {
    uploadFormBlob(opts.filename, blob, (err, res, percentage) => {
      if (err) return reject(err instanceof Error ? err : new Error(String(err)));
      // CK Mint/index.js L1619-1628 — progress ticks pass `{}` with no url; wait for final response.
      const url = res?.url || (res as { file?: { url?: string } } | undefined)?.file?.url;
      if (percentage !== undefined && !url) return;
      if (!url) return reject(new Error('Upload succeeded but no URL returned'));
      resolve(updateImageURL(url));
    });
  });
}
