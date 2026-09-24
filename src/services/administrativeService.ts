/** @format */

import { useLocalStorage } from "@uidotdev/usehooks";

interface Administrative {
  filename: string;
  gnd_name?: string;
  type: string;
  ds_division_name?: string;
  province_name?: string;
  district_name?: string;
  search_query: string;
}

export const INDEX_URL =
  "https://cdn.jsdelivr.net/gh/itscharukadeshan/map_srilanka@main/src/data/search/administrative_updated_compact.json";
const INDEX_CACHE = "mapsl-meta-v1";

/** Read the index copy in Cache Storage (used when localStorage is unavailable). */
export async function getIndexFromCache(): Promise<Administrative[] | null> {
  try {
    if (!("caches" in window)) return null;
    const store = await caches.open(INDEX_CACHE);
    const hit = await store.match(INDEX_URL);
    if (!hit) return null;
    const parsed = await hit.json();
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function fetchIndex(): Promise<Administrative[]> {
  try {
    if ("caches" in window) {
      const store = await caches.open(INDEX_CACHE);
      const hit = await store.match(INDEX_URL);
      if (hit) return (await hit.json()) as Administrative[];
    }
  } catch {
    /* fall through to network */
  }
  const response = await fetch(INDEX_URL);
  if (!response.ok) throw new Error("Network response was not ok");
  const data = (await response.json()) as Administrative[];
  try {
    if ("caches" in window) {
      const store = await caches.open(INDEX_CACHE);
      await store.put(
        INDEX_URL,
        new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } })
      );
    }
  } catch {
    /* cache full — index still works for this session */
  }
  return data;
}

export const useAdministrativeData = () => {
  const [administrativeData, setAdministrativeData] = useLocalStorage<
    Administrative[]
  >("administrativeData", []);

  const fetchAdministrativeData = async () => {
    if (administrativeData.length === 0) {
      try {
        const data = await fetchIndex();
        try {
          setAdministrativeData(data);
        } catch {
          // localStorage quota (~5MB) can reject the 3.9MB index — the
          // Cache Storage copy above still serves future visits
        }
      } catch (error) {
        console.error("Failed to fetch administrative data:", error);
      }
    }
  };

  return { administrativeData, fetchAdministrativeData };
};
