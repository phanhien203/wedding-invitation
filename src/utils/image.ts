/**
 * Map a slider/thumbnail album image to its high-quality version used in the
 * full-screen view mode. Album images live in /album (resized for fast slides)
 * with a matching high-res copy in /album-full. Non-album paths are unchanged.
 */
export function fullResSrc(src: string): string {
  return src.startsWith("/album/")
    ? src.replace("/album/", "/album-full/")
    : src;
}
