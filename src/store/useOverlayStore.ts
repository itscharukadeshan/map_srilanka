import { create } from "zustand";
import { persist } from "zustand/middleware";
import { pickDistinctColor } from "../utils/palette";
import { dropCached } from "../services/geoCache";
import { DATA_FALLBACK, DATA_PRIMARY } from "../services/dataHosts";

export interface OverlayItem {
  id: string;
  name: string;
  type: string;
  url: string;
  color: string;
  opacity: number;
  stroke: number;
  visible: boolean;
  /** map badge: permanent name label pinned at the polygon center */
  showLabel: boolean;
}

export interface SearchResultInput {
  name: string;
  type: string;
  url: string;
}

export type OverlayStatus = "loading" | "ready" | "error";

function migrateLegacy(): OverlayItem[] {
  try {
    const raw = localStorage.getItem("searchResults");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((r) => r && r.url && r.name)
      .map((r) => {
        // pre-CDN entries used raw.githubusercontent — normalize to the CDN host
        // so re-adding the same area doesn't duplicate the layer
        const u = String(r.url);
        const url = u.startsWith(DATA_FALLBACK) ? DATA_PRIMARY + u.slice(DATA_FALLBACK.length) : u;
        return {
          id: url,
          name: String(r.name),
          type: String(r.type ?? "unknown"),
          url,
          color: typeof r.color === "string" ? r.color : pickDistinctColor([]),
          opacity: typeof r.opacity === "number" ? r.opacity : 0.4,
          stroke: typeof r.stroke === "number" ? r.stroke : 1.5,
          visible: r.visibility !== false && r.visible !== false,
          showLabel: r.showLabel !== false,
        };
      });
  } catch {
    return [];
  }
}

interface OverlayState {
  overlays: OverlayItem[];
  /** id of overlay that should be zoomed to; consumed via focusSeq */
  focusedId: string | null;
  /** increments on every focus request so repeat clicks re-trigger zoom */
  focusSeq: number;
  status: Record<string, OverlayStatus>;
  /** bump to retry a failed fetch */
  retrySeq: Record<string, number>;
  /** active (or just finished) bulk-load batch */
  batch: { id: string; ids: string[]; total: number; done: number; failed: number } | null;
  /** bumps when a batch is cancelled so the fetch loop stops queueing */
  batchCancelSeq: number;
  addOverlay: (input: SearchResultInput) => string | null;
  /** bulk add in ONE state update (no per-item re-renders); returns fresh ids */
  addOverlays: (inputs: SearchResultInput[]) => string[];
  updateOverlay: (id: string, patch: Partial<OverlayItem>) => void;
  /** re-assign the perceptually farthest color from all other layers */
  shuffleColor: (id: string) => void;
  removeOverlay: (id: string) => void;
  toggleVisibility: (id: string) => void;
  focusOverlay: (id: string) => void;
  clearFocus: () => void;
  setStatus: (id: string, s: OverlayStatus) => void;
  retryOverlay: (id: string) => void;
  startBatch: (ids: string[]) => string;
  tickBatch: (batchId: string, ok: boolean) => void;
  cancelBatch: () => void;
  dismissBatch: () => void;
  clearAll: () => void;
}

export const useOverlayStore = create<OverlayState>()(
  persist(
    (set, get) => ({
      overlays: typeof window !== "undefined" ? migrateLegacy() : [],
      focusedId: null,
      focusSeq: 0,
      status: {},
      retrySeq: {},
      batch: null,
      batchCancelSeq: 0,

      addOverlay: (input) => {
        const { overlays, focusSeq } = get();
        const id = input.url;
        const existing = overlays.find((o) => o.id === id || o.url === input.url);
        if (existing) {
          set({ focusedId: existing.id, focusSeq: focusSeq + 1 });
          return existing.id;
        }
        const item: OverlayItem = {
          id,
          name: input.name,
          type: input.type,
          url: input.url,
          color: pickDistinctColor(overlays.map((o) => o.color)),
          opacity: 0.45,
          stroke: 1.5,
          visible: true,
          showLabel: true,
        };
        set({
          overlays: [...overlays, item],
          focusedId: id,
          focusSeq: focusSeq + 1,
        });
        return id;
      },

      addOverlays: (inputs) => {
        const { overlays } = get();
        const seen = new Set(overlays.map((o) => o.id));
        const fresh: OverlayItem[] = [];
        for (const input of inputs) {
          if (seen.has(input.url)) continue;
          seen.add(input.url);
          fresh.push({
            id: input.url,
            name: input.name,
            type: input.type,
            url: input.url,
            color: pickDistinctColor([
              ...overlays.map((o) => o.color),
              ...fresh.map((f) => f.color),
            ]),
            opacity: 0.45,
            stroke: 1.5,
            visible: true,
            showLabel: true,
          });
        }
        if (fresh.length > 0) set({ overlays: [...get().overlays, ...fresh] });
        return fresh.map((f) => f.id);
      },

      shuffleColor: (id) => {
        const others = get().overlays.filter((o) => o.id !== id).map((o) => o.color);
        get().updateOverlay(id, { color: pickDistinctColor(others) });
      },

      updateOverlay: (id, patch) =>
        set({
          overlays: get().overlays.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        }),

      removeOverlay: (id) => {
        const next = { ...get().status };
        delete next[id];
        set({
          overlays: get().overlays.filter((o) => o.id !== id),
          focusedId: get().focusedId === id ? null : get().focusedId,
          status: next,
        });
      },

      toggleVisibility: (id) =>
        set({
          overlays: get().overlays.map((o) =>
            o.id === id ? { ...o, visible: !o.visible } : o
          ),
        }),

      focusOverlay: (id) => set({ focusedId: id, focusSeq: get().focusSeq + 1 }),

      clearFocus: () => set({ focusedId: null }),

      setStatus: (id, s) => set({ status: { ...get().status, [id]: s } }),

      retryOverlay: (id) => {
        dropCached(id);
        const r = { ...get().retrySeq, [id]: (get().retrySeq[id] ?? 0) + 1 };
        const st = { ...get().status };
        delete st[id];
        set({ retrySeq: r, status: st });
      },

      startBatch: (ids) => {
        const id = `batch-${Date.now().toString(36)}`;
        set({ batch: { id, ids, total: ids.length, done: 0, failed: 0 } });
        return id;
      },

      tickBatch: (batchId, ok) => {
        const b = get().batch;
        if (!b || b.id !== batchId) return;
        set({ batch: { ...b, done: b.done + 1, failed: b.failed + (ok ? 0 : 1) } });
      },

      cancelBatch: () => {
        const { batch, overlays, status } = get();
        if (!batch) return;
        // drop batch members that never finished loading; keep the rest
        const gone = new Set(batch.ids.filter((id) => status[id] !== "ready"));
        const nextStatus = { ...status };
        gone.forEach((id) => delete nextStatus[id]);
        set({
          batch: null,
          batchCancelSeq: get().batchCancelSeq + 1,
          overlays: overlays.filter((o) => !gone.has(o.id)),
          status: nextStatus,
        });
      },

      dismissBatch: () => set({ batch: null }),

      clearAll: () => {
        try {
          localStorage.removeItem("searchResults");
        } catch {
          /* noop */
        }
        set({ overlays: [], focusedId: null, status: {}, batch: null });
      },
    }),
    {
      name: "mapsl-overlays-v1",
      version: 2,
      // v1→v2: normalize pre-CDN raw.githubusercontent URLs to the CDN host
      migrate: (persisted: unknown) => {
        const s = persisted as { overlays?: OverlayItem[] };
        if (s && Array.isArray(s.overlays)) {
          s.overlays = s.overlays.map((o) =>
            o.url.startsWith(DATA_FALLBACK)
              ? { ...o, id: DATA_PRIMARY + o.url.slice(DATA_FALLBACK.length), url: DATA_PRIMARY + o.url.slice(DATA_FALLBACK.length) }
              : o
          );
        }
        return persisted as OverlayState;
      },
      // focusedId/focusSeq are transient — never persist a stale zoom request
      partialize: (s) => ({ overlays: s.overlays }) as OverlayState,
    }
  )
);
