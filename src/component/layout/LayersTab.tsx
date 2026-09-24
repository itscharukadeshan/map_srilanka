/** @format */
import { useState } from "react";
import { Trash2, Eye, EyeOff, X, Ruler, MapPin } from "lucide-react";
import OverlayCard from "../map/OverlayCard";
import BatchProgress from "../map/BatchProgress";
import { useOverlayStore } from "../../store/useOverlayStore";
import { useAnnotations } from "../../store/annotations";
import { useMeasurements } from "../../store/measurements";
import { clearMeasureLayers } from "../map/measureRegistry";

export default function LayersTab({ onFind }: { onFind: () => void }) {
  const overlays = useOverlayStore((s) => s.overlays);
  const update = useOverlayStore((s) => s.updateOverlay);
  const remove = useOverlayStore((s) => s.removeOverlay);
  const clearAll = useOverlayStore((s) => s.clearAll);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // drop selection for layers that no longer exist
  const live = selected;
  if (live.size > 0) {
    const ids = new Set(overlays.map((o) => o.id));
    let changed = false;
    for (const id of live) {
      if (!ids.has(id)) {
        live.delete(id);
        changed = true;
      }
    }
    if (changed) setSelected(new Set(live));
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setVisibility = (visible: boolean) => {
    for (const id of selected) update(id, { visible });
  };

  const deleteSelected = () => {
    for (const id of selected) remove(id);
    setSelected(new Set());
  };

  return (
    <div className="p-3 space-y-2">
      <BatchProgress />

      <div className="flex items-center gap-2 pb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Active layers · {overlays.length}
        </span>
        {overlays.length > 0 && (
          <button
            onClick={clearAll}
            className="ml-auto inline-flex items-center gap-1 text-[12px] font-medium text-red-600 dark:text-red-400 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
            <Trash2 className="w-3.5 h-3.5" /> Clear all
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="rounded-xl border border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-2 flex items-center gap-1.5">
          <span className="text-[12px] font-semibold pl-1">{selected.size} marked</span>
          <button onClick={() => setVisibility(true)} title="Show marked" className="ml-auto mini-btn-dark">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setVisibility(false)} title="Hide marked" className="mini-btn-dark">
            <EyeOff className="w-3.5 h-3.5" />
          </button>
          <button onClick={deleteSelected} title="Delete marked" className="mini-btn-dark">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setSelected(new Set())} title="Clear marking" className="mini-btn-dark">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {overlays.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-center">
          <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200">No layers yet</p>
          <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
            Go to Search or Browse, mark areas and add them.
          </p>
          <button
            onClick={onFind}
            className="mt-3 h-8 px-3 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[13px] font-medium">
            Find an area
          </button>
        </div>
      )}
      {overlays.map((ov) => (
        <OverlayCard
          key={ov.id}
          item={ov}
          selection={{ selected: selected.has(ov.id), onToggle: () => toggle(ov.id) }}
        />
      ))}
      <ExtrasSections />
    </div>
  );
}

/** Measurements + badges inventory with clear actions. */
function ExtrasSections() {
  const annotations = useAnnotations((s) => s.annotations);
  const clearAnnotations = useAnnotations((s) => s.clearAnnotations);
  const measurementCount = useMeasurements((s) => {
    const g = s.geojson as unknown as { features?: unknown[] } | null;
    return g && Array.isArray(g.features) ? g.features.length : 0;
  });

  if (annotations.length === 0 && measurementCount === 0) return null;

  const clearMeasures = () => {
    clearMeasureLayers();
    useMeasurements.getState().setGeojson(null);
  };

  return (
    <div className="pt-1 space-y-1.5">
      {measurementCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300">
          <Ruler className="w-3.5 h-3.5 text-slate-400" />
          {measurementCount} measurement{measurementCount === 1 ? "" : "s"}
          <button onClick={clearMeasures} className="ml-auto text-red-600 dark:text-red-400 font-medium hover:underline">
            Clear
          </button>
        </div>
      )}
      {annotations.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {annotations.length} badge{annotations.length === 1 ? "" : "s"}
          <button onClick={clearAnnotations} className="ml-auto text-red-600 dark:text-red-400 font-medium hover:underline">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
