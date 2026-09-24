/**
 * Data delivery hosts for map_srilanka_data.
 * Primary = jsDelivr CDN (cached edge delivery, no rate limits).
 * Fallback = raw.githubusercontent (origin).
 */
const GH_PATH = "itscharukadeshan/map_srilanka_data@main/v1/administrative";
const GH_V1 = "itscharukadeshan/map_srilanka_data@main/v1";

export const DATA_PRIMARY = `https://cdn.jsdelivr.net/gh/${GH_PATH}`;
export const DATA_FALLBACK = `https://raw.githubusercontent.com/itscharukadeshan/map_srilanka_data/refs/heads/main/v1/administrative`;

/** v1 root on the CDN — new index/coverage/VERSION live here (see data repo scripts/build_index.py) */
export const DATA_V1_ROOT = `https://cdn.jsdelivr.net/gh/${GH_V1}`;
export const INDEX_ADMIN_URL = `${DATA_V1_ROOT}/index_administrative.json`;
export const COVERAGE_URL = `${DATA_V1_ROOT}/coverage.json`;
export const DATA_VERSION_URL = `${DATA_V1_ROOT}/VERSION`;

/** Swap a data URL to the alternate host (used for fallback retries). */
export function swapDataHost(url: string): string | null {
  if (url.startsWith(DATA_PRIMARY)) return DATA_FALLBACK + url.slice(DATA_PRIMARY.length);
  if (url.startsWith(DATA_FALLBACK)) return DATA_PRIMARY + url.slice(DATA_FALLBACK.length);
  return null;
}
