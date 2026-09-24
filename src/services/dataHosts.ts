/**
 * Data delivery hosts for map_srilanka_data.
 * Primary = jsDelivr CDN (cached edge delivery, no rate limits).
 * Fallback = raw.githubusercontent (origin).
 */
const GH_PATH = "itscharukadeshan/map_srilanka_data@main/v1/administrative";

export const DATA_PRIMARY = `https://cdn.jsdelivr.net/gh/${GH_PATH}`;
export const DATA_FALLBACK = `https://raw.githubusercontent.com/itscharukadeshan/map_srilanka_data/refs/heads/main/v1/administrative`;

/** Swap a data URL to the alternate host (used for fallback retries). */
export function swapDataHost(url: string): string | null {
  if (url.startsWith(DATA_PRIMARY)) return DATA_FALLBACK + url.slice(DATA_PRIMARY.length);
  if (url.startsWith(DATA_FALLBACK)) return DATA_PRIMARY + url.slice(DATA_FALLBACK.length);
  return null;
}
