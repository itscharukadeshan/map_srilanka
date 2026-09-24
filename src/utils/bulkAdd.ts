import createResultObject from "../services/generateRawUrl";
import { DATA_V1_ROOT } from "../services/dataHosts";
import { getGeoJSON, primeCache } from "../services/geoCache";
import { useOverlayStore } from "../store/useOverlayStore";
import type { AdminEntry } from "./hierarchy";

/**
 * Add many index entries at once: one store update, one fetch batch,
 * one union zoom when done. Returns fresh ids + batch id (null when
 * everything was already on the map — first duplicate gets focused).
 */
export function bulkAddEntries(entries: AdminEntry[]): {
  fresh: string[];
  batchId: string | null;
} {
  const results = entries
    .map((e) => createResultObject(e))
    .filter((r): r is NonNullable<typeof r> => r !== null);
  if (results.length === 0) return { fresh: [], batchId: null };
  const st = useOverlayStore.getState();
  const fresh = st.addOverlays(results);
  if (fresh.length === 0) {
    st.focusOverlay(results[0].url);
    return { fresh: [], batchId: null };
  }
  const batchId = st.startBatch(fresh);
  return { fresh, batchId };
}

/** trailing _<fid>.geojson → fid (matches feature properties.fid upstream) */
function fidOf(filename: string): string | null {
  const m = filename.replace(/\.geojson$/, "").match(/_(\d+)$/);
  return m ? m[1] : null;
}

/**
 * Load every GN in a DS division through its single combined rollup
 * (one download instead of N), then split into per-GN layers locally.
 * Per-GN URLs are primed with the split geometry so reloads/re-adds
 * resolve from cache. Falls back to per-file bulk load unless EVERY
 * feature matches a GN entry by fid.
 */
export async function bulkAddDs(dsEntry: AdminEntry, gns: AdminEntry[]): Promise<void> {
  if (!dsEntry.combined_url || gns.length === 0) {
    bulkAddEntries(gns);
    return;
  }
  try {
    const fc = await getGeoJSON(`${DATA_V1_ROOT}/${dsEntry.combined_url}`);
    const byFid = new Map<string, AdminEntry>();
    for (const g of gns) {
      const fid = fidOf(g.filename);
      if (fid) byFid.set(fid, g);
    }
    const feats = fc.features ?? [];
    if (feats.length === 0) throw new Error("empty combined file");
    const inputs: { name: string; type: string; url: string; inline: typeof fc }[] = [];
    for (const f of feats) {
      const fid = String((f.properties as { fid?: unknown } | null)?.fid ?? "");
      const entry = byFid.get(fid);
      const r = entry ? createResultObject(entry) : null;
      if (!entry || !r) throw new Error(`unmatched feature fid=${fid}`);
      inputs.push({ ...r, inline: { ...fc, features: [f] } as typeof fc });
    }
    if (inputs.length === 0) throw new Error("no features");
    for (const i of inputs) primeCache(i.url, i.inline);
    const st = useOverlayStore.getState();
    const fresh = st.addOverlays(inputs);
    if (fresh.length === 0) {
      st.focusOverlay(inputs[0].url);
      return;
    }
    st.startBatch(fresh);
  } catch {
    // combined missing/mismatched — classic per-file path (pooled + cached)
    bulkAddEntries(gns);
  }
}
