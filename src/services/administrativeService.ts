/** @format */

import { useLocalStorage } from "@uidotdev/usehooks";
import { INDEX_ADMIN_URL } from "./dataHosts";

interface Administrative {
  filename: string;
  gnd_name?: string;
  type: string;
  ds_division_name?: string;
  province_name?: string;
  district_name?: string;
  search_query: string;
  /** new data-repo index fields (absent on legacy entries) */
  url?: string;
  combined_url?: string | null;
  bbox?: [number, number, number, number] | null;
}

/** Legacy index (app repo, stale names) — used only if the data-repo index is unreachable. */
const LEGACY_INDEX_URL =
  "https://cdn.jsdelivr.net/gh/itscharukadeshan/map_srilanka@main/src/data/search/administrative_updated_compact.json";
const INDEX_CACHE = "mapsl-meta-v2";

function unwrap(data: unknown): Administrative[] | null {
  if (Array.isArray(data)) return data as Administrative[];
  if (data && typeof data === "object" && Array.isArray((data as { entries?: unknown }).entries)) {
    return (data as { entries: Administrative[] }).entries;
  }
  return null;
}

/** Read the index copy in Cache Storage (used when localStorage is unavailable). */
export async function getIndexFromCache(): Promise<Administrative[] | null> {
  try {
    if (!("caches" in window)) return null;
    const store = await caches.open(INDEX_CACHE);
    for (const key of [INDEX_ADMIN_URL, LEGACY_INDEX_URL]) {
      try {
        const hit = await store.match(key);
        if (hit) {
          const parsed = unwrap(await hit.json());
          if (parsed && parsed.length > 0) return parsed;
        }
      } catch {
        /* try next key */
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchEntries(url: string): Promise<Administrative[]> {
  try {
    if ("caches" in window) {
      const store = await caches.open(INDEX_CACHE);
      const hit = await store.match(url);
      if (hit) {
        const parsed = unwrap(await hit.json());
        if (parsed && parsed.length > 0) return parsed;
      }
    }
  } catch {
    /* fall through to network */
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`index fetch failed: ${response.status}`);
  const parsed = unwrap(await response.json());
  if (!parsed || parsed.length === 0) throw new Error("index is empty");
  try {
    if ("caches" in window) {
      const store = await caches.open(INDEX_CACHE);
      await store.put(
        url,
        new Response(JSON.stringify(parsed), { headers: { "Content-Type": "application/json" } })
      );
    }
  } catch {
    /* cache full — index still works for this session */
  }
  return parsed;
}

export const useAdministrativeData = () => {
  const [administrativeData, setAdministrativeData] = useLocalStorage<
    Administrative[]
  >("administrativeData", []);

  const fetchAdministrativeData = async () => {
    if (administrativeData.length === 0) {
      try {
        // data-repo index first (fresh paths, combined rollups); legacy as fallback
        let data: Administrative[];
        try {
          data = await fetchEntries(INDEX_ADMIN_URL);
        } catch {
          data = await fetchEntries(LEGACY_INDEX_URL);
        }
        try {
          setAdministrativeData(data);
        } catch {
          // localStorage quota (~5MB) can reject the index — the
          // Cache Storage copy above still serves future visits
        }
      } catch (error) {
        console.error("Failed to fetch administrative data:", error);
      }
    }
  };

  return { administrativeData, fetchAdministrativeData };
};
