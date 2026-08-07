/** Port of OneHub `src/lib/media.ts` — only the helper the canvases need. */
export function updateImageURL(image: string | null | undefined): string {
  if (!image) return '';
  if (
    image.match(
      /(api\.grab\.live)|(api\.nftplatform\.tech)|(imgcdn\.socialos\.io)|(cdn\.live-nfts\.com)/g,
    )
  ) {
    return image.replace(
      /^https:\/\/(api\.grab\.live|api\.nftplatform\.tech|imgcdn\.socialos\.io|cdn\.live-nfts\.com)/,
      'https://imgcdn2-bd3.kxcdn.com',
    );
  }
  return image;
}