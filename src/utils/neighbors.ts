import { buffer } from "@turf/buffer";
import { booleanIntersects } from "@turf/boolean-intersects";
import type { Feature, Geometry } from "geojson";
import createResultObject from "../services/generateRawUrl";
import { getGeoJSON } from "../services/geoCache";
import type { OverlayItem } from "../store/useOverlayStore";
import type { AdminEntry } from "./hierarchy";

/** max parallel geometry downloads while scanning for neighbors */
const SCAN_POOL = 6;

async function poolMap<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      out[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return out;
}

import { INDEX_ADMIN_URL } from "../services/dataHosts";

async function readIndex(): Promise<AdminEntry[]> {
  try {
    const raw = localStorage.getItem("administrativeData");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* fall through to Cache Storage */
  }
  // localStorage quota can reject the 3.9MB index — same copy lives in Cache Storage
  try {
    if ("caches" in window) {
      const store = await caches.open("mapsl-meta-v1");
      const hit = await store.match(INDEX_ADMIN_URL);
      if (hit) {
        const parsed = await hit.json();
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch {
    /* no index available */
  }
  return [];
}

function sameParent(a: AdminEntry, b: AdminEntry): boolean {
  if (a.type !== b.type) return false;
  switch (a.type) {
    case "gn_divisions":
      return (
        a.province_name === b.province_name &&
        a.district_name === b.district_name &&
        a.ds_division_name === b.ds_division_name
      );
    case "ds_divisions":
      return a.province_name === b.province_name && a.district_name === b.district_name;
    case "district":
      return a.province_name === b.province_name;
    case "province":
      return true;
    default:
      return false;
  }
}

export interface NeighborScan {
  /** index entries touching the target (excluding itself) */
  entries: AdminEntry[];
  /** how many same-level areas were geometry-checked */
  checked: number;
}

/**
 * Find same-level areas whose boundaries touch the target layer, discovered
 * from map geometry (buffered-intersects, tolerant of slivers/gaps).
 * Sibling geometries are fetched through the shared cache, so loading the
 * results afterwards is instant.
 */
export async function findNeighborEntries(target: OverlayItem): Promise<NeighborScan> {
  const index = await readIndex();
  // reverse-lookup the target's index entry via its URL
  const urlOf = new Map<string, AdminEntry>();
  for (const e of index) {
    const r = createResultObject(e);
    if (r && !urlOf.has(r.url)) urlOf.set(r.url, e);
  }
  const targetEntry = urlOf.get(target.url) ?? null;
  if (!targetEntry) throw new Error("Source area is not in the search index.");

  const siblings = index.filter((e) => e !== targetEntry && sameParent(e, targetEntry as AdminEntry));
  const withUrls = siblings
    .map((e) => ({ entry: e, result: createResultObject(e) }))
    .filter((x): x is { entry: AdminEntry; result: NonNullable<ReturnType<typeof createResultObject>> } => x.result !== null);

  const targetFc = await getGeoJSON(target.url);
  const targetFeatures = (targetFc.features ?? []) as unknown as Feature<Geometry>[];
  // 100 m tolerance so near-misses from digitizing slivers still count;
  // buffer each target feature once, reuse across all candidates
  const paddedTargets = targetFeatures
    .map((f) => {
      try {
        return buffer(f, 0.1, { units: "kilometers" });
      } catch {
        return null;
      }
    })
    .filter((b): b is NonNullable<typeof b> => b !== null);
  if (paddedTargets.length === 0) return { entries: [], checked: 0 };

  const hits = await poolMap(withUrls, SCAN_POOL, async ({ entry, result }) => {
    try {
      const fc = await getGeoJSON(result.url);
      const ok = ((fc.features ?? []) as unknown as Feature<Geometry>[]).some((cf) =>
        paddedTargets.some((p) => booleanIntersects(p, cf))
      );
      return ok ? entry : null;
    } catch {
      return null; // missing upstream file — skip silently
    }
  });

  return {
    entries: hits.filter((e): e is AdminEntry => e !== null),
    checked: withUrls.length,
  };
}
