import axios from "axios";
import { swapDataHost } from "./dataHosts";
import type { GeoJSONFeatureCollection } from "../types/geoJsonTypes";

/**
 * Shared GeoJSON cache, three tiers:
 *  1. in-memory promises (dedupes concurrent requests within a session)
 *  2. Cache Storage (persistent on-device — repeat visits + back-nav are instant)
 *  3. network: CDN primary, origin fallback on failure
 *
 * After first load the dataset effectively "lives with the app".
 */
const CACHE_NAME = "mapsl-geo-v2";
const memory = new Map<string, Promise<GeoJSONFeatureCollection>>();

function openCache(): Promise<Cache | null> {
  try {
    if (!("caches" in window)) return Promise.resolve(null);
    return caches.open(CACHE_NAME).catch(() => null);
  } catch {
    return Promise.resolve(null);
  }
}

async function fetchNetwork(url: string): Promise<GeoJSONFeatureCollection> {
  try {
    const r = await axios.get<GeoJSONFeatureCollection>(url);
    return r.data;
  } catch (e) {
    const alt = swapDataHost(url);
    if (!alt) throw e;
    const r = await axios.get<GeoJSONFeatureCollection>(alt);
    return r.data;
  }
}

async function load(url: string): Promise<GeoJSONFeatureCollection> {
  const store = await openCache();
  if (store) {
    try {
      const hit = await store.match(url);
      if (hit) return (await hit.json()) as GeoJSONFeatureCollection;
    } catch {
      /* fall through to network */
    }
  }
  const data = await fetchNetwork(url);
  if (store) {
    try {
      await store.put(
        url,
        new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } })
      );
    } catch {
      /* quota/full — memory cache still serves this session */
    }
  }
  return data;
}

export function getGeoJSON(url: string): Promise<GeoJSONFeatureCollection> {
  let p = memory.get(url);
  if (!p) {
    p = load(url);
    // failed fetches must not poison the cache (retry has to re-hit network)
    p.catch(() => memory.delete(url));
    memory.set(url, p);
  }
  return p;
}

export function dropCached(url: string) {
  memory.delete(url);
}

/** Seed the memory cache with already-fetched data (e.g. GN features split
 *  from a DS combined rollup) so their layer URLs resolve without network. */
export function primeCache(url: string, data: GeoJSONFeatureCollection) {
  memory.set(url, Promise.resolve(data));
}

export function isCached(url: string): boolean {
  return memory.has(url);
}
