/** @format */
import { useEffect, useRef, useState } from "react";
import { GeoJSON, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useOverlayStore } from "../../store/useOverlayStore";
import { getGeoJSON } from "../../services/geoCache";
import type { GeoJSONFeatureCollection } from "../../types/geoJsonTypes";

/** max parallel GeoJSON downloads — bulk DS loads stay friendly to the CDN */
const POOL_SIZE = 6;

function zoomToBounds(
  map: L.Map,
  fc: GeoJSONFeatureCollection,
  opts?: L.FitBoundsOptions
) {
  if (!fc?.features?.length) return false;
  try {
    const bounds = L.geoJSON(fc as unknown as GeoJSON.GeoJsonObject).getBounds();
    if (!bounds.isValid()) return false;
    map.fitBounds(bounds, { padding: [40, 40], ...opts });
    setTimeout(() => {
      try {
        map.invalidateSize();
        map.fitBounds(bounds, { padding: [40, 40], ...opts });
      } catch {
        /* noop */
      }
    }, 150);
    return true;
  } catch {
    return false;
  }
}

export default function MapOverlays() {
  const map = useMap();
  const overlays = useOverlayStore((s) => s.overlays);
  const focusedId = useOverlayStore((s) => s.focusedId);
  const focusSeq = useOverlayStore((s) => s.focusSeq);
  const retrySeq = useOverlayStore((s) => s.retrySeq);
  const setStatus = useOverlayStore((s) => s.setStatus);
  const [data, setData] = useState<Record<string, GeoJSONFeatureCollection>>({});
  const fetchedRef = useRef<Record<string, number>>({});
  const inflightRef = useRef<Set<string>>(new Set());
  const dataRef = useRef(data);
  dataRef.current = data;

  // pooled fetch for anything missing (single adds + bulk batches share it)
  useEffect(() => {
    let cancelled = false;
    const store = useOverlayStore.getState();
    const myBatchId = store.batch?.id ?? null;
    const myCancelSeq = store.batchCancelSeq;
    const batchIds = store.batch ? new Set(store.batch.ids) : null;

    const missing = overlays.filter((ov) => {
      const want = retrySeq[ov.id] ?? 0;
      const key = `${ov.id}#${want}`;
      return (
        (!dataRef.current[ov.id] || fetchedRef.current[ov.id] !== want) &&
        !inflightRef.current.has(key)
      );
    });
    if (missing.length === 0) return;

    missing.forEach((ov) => {
      const want = retrySeq[ov.id] ?? 0;
      fetchedRef.current[ov.id] = want;
      inflightRef.current.add(`${ov.id}#${want}`);
    });
    setStatusBatch(missing, "loading");

    const fetchOne = async (ov: (typeof overlays)[number]) => {
      const want = retrySeq[ov.id] ?? 0;
      const key = `${ov.id}#${want}`;
      try {
        // combined-split layers arrive with geometry; otherwise fetch by URL
        const fc = ov.inline ?? (await getGeoJSON(ov.url));
        if (cancelled) return;
        setData((p) => ({ ...p, [ov.id]: fc }));
        setStatus(ov.id, "ready");
        tickCurrent(ov.id, true);
        // single adds zoom on arrival; batch members wait for the union zoom
        if (!batchIds?.has(ov.id)) zoomToBounds(map, fc);
      } catch {
        if (cancelled) return;
        setStatus(ov.id, "error");
        tickCurrent(ov.id, false);
      } finally {
        inflightRef.current.delete(key);
      }
    };

    // tick whichever batch currently owns this overlay (batches can be
    // superseded while a runner is still in flight)
    const tickCurrent = (overlayId: string, ok: boolean) => {
      const cur = useOverlayStore.getState().batch;
      if (cur && cur.ids.includes(overlayId)) useOverlayStore.getState().tickBatch(cur.id, ok);
    };

    (async () => {
      let i = 0;
      const workers = Array.from(
        { length: Math.min(POOL_SIZE, missing.length) },
        async () => {
          while (!cancelled) {
            // stop queueing when the batch was cancelled mid-flight
            if (
              myBatchId &&
              useOverlayStore.getState().batchCancelSeq !== myCancelSeq
            ) {
              return;
            }
            const ov = missing[i++];
            if (!ov) return;
            await fetchOne(ov);
          }
        }
      );
      await Promise.all(workers);
      if (cancelled) return;
      // batch finished → one union zoom over everything that loaded
      const b = useOverlayStore.getState().batch;
      if (b && b.done >= b.total && b.total > 0) {
        const bounds: L.LatLngBounds[] = [];
        for (const id of b.ids) {
          const fc = dataRef.current[id];
          if (!fc?.features?.length) continue;
          try {
            const bb = L.geoJSON(fc as unknown as GeoJSON.GeoJsonObject).getBounds();
            if (bb.isValid()) bounds.push(bb);
          } catch {
            /* skip */
          }
        }
        if (bounds.length > 0) {
          const first = bounds[0];
          const union = bounds
            .slice(1)
            .reduce(
              (acc, bb) => acc.extend(bb),
              L.latLngBounds(first.getSouthWest(), first.getNorthEast())
            );
          try {
            map.fitBounds(union, { padding: [40, 40] });
          } catch {
            /* noop */
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlays, retrySeq]);

  function setStatusBatch(items: { id: string }[], s: "loading" | "ready" | "error") {
    const st = useOverlayStore.getState();
    items.forEach((ov) => st.setStatus(ov.id, s));
  }

  // Zoom on demand: fires for search picks and every crosshair click —
  // including repeats and clicks made while still loading.
  useEffect(() => {
    if (!focusedId) return;
    const fc = data[focusedId];
    if (!fc) return;
    const ov = overlays.find((o) => o.id === focusedId);
    if (ov && !ov.visible) return;
    zoomToBounds(map, fc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedId, focusSeq, data]);

  // prune cache for removed overlays
  useEffect(() => {
    const ids = new Set(overlays.map((o) => o.id));
    for (const k of Object.keys(fetchedRef.current)) {
      if (!ids.has(k)) delete fetchedRef.current[k];
    }
    setData((p) => {
      let changed = false;
      const next: typeof p = {};
      for (const k of Object.keys(p)) {
        if (ids.has(k)) next[k] = p[k];
        else changed = true;
      }
      return changed ? next : p;
    });
  }, [overlays]);

  return (
    <>
      {overlays.map((ov) => {
        if (!ov.visible) return null;
        const fc = data[ov.id];
        if (!fc) return null;
        return (
          <GeoJSON
            key={`${ov.id}-${ov.color}-${ov.stroke}-${ov.opacity}`}
            data={fc as unknown as GeoJSON.GeoJsonObject}
            style={{
              color: ov.color,
              weight: ov.stroke,
              fillColor: ov.color,
              fillOpacity: ov.opacity,
            }}>
            {ov.showLabel !== false && (
              <Tooltip permanent direction="center" className="mapsl-area-label" interactive={false}>
                {ov.name}
              </Tooltip>
            )}
          </GeoJSON>
        );
      })}
    </>
  );
}
