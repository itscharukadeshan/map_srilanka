import createResultObject from "../services/generateRawUrl";
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
