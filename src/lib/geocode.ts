interface Coordinates {
  lat: number;
  lng: number;
}

const PATTERNS = [
  /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // exact place marker
  /@(-?\d+\.\d+),(-?\d+\.\d+)/, // map center
  /[?&](?:q|ll|daddr|destination)=(-?\d+\.\d+),(-?\d+\.\d+)/, // query params
];

function extractCoordinates(text: string): Coordinates | null {
  for (const pattern of PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
  }
  return null;
}

/**
 * Resolve a Google Maps share link (e.g. https://maps.app.goo.gl/xxx) to
 * latitude/longitude by following the redirect and parsing the final URL/body.
 * Returns null if it cannot be resolved.
 */
export async function resolveMapUrl(url: string): Promise<Coordinates | null> {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(trimmed, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(5000),
    });

    const fromUrl = extractCoordinates(res.url);
    if (fromUrl) return fromUrl;

    const body = await res.text();
    return extractCoordinates(body);
  } catch {
    return null;
  }
}
