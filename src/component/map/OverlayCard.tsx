/** @format */
import { useState } from "react";
import { Eye, EyeOff, Trash2, Crosshair, Loader2, AlertTriangle, RotateCcw, Tag, Square, CheckSquare, Dices, Plus } from "lucide-react";
import { OverlayItem, useOverlayStore } from "../../store/useOverlayStore";
import { badgeClassFor, labelFor } from "../../utils/badges";
import { findNeighborEntries } from "../../utils/neighbors";
import { bulkAddEntries } from "../../utils/bulkAdd";

interface Selection {
  selected: boolean;
  onToggle: () => void;
}

export default function OverlayCard({ item, selection }: { item: OverlayItem; selection?: Selection }) {
  const update = useOverlayStore((s) => s.updateOverlay);
  const remove = useOverlayStore((s) => s.removeOverlay);
  const toggle = useOverlayStore((s) => s.toggleVisibility);
  const focus = useOverlayStore((s) => s.focusOverlay);
  const retry = useOverlayStore((s) => s.retryOverlay);
  const focusedId = useOverlayStore((s) => s.focusedId);
  const status = useOverlayStore((s) => s.status[item.id] ?? "loading");
  const shuffleColor = useOverlayStore((s) => s.shuffleColor);
  const isFocused = focusedId === item.id;
  const busy = status === "loading";
  const failed = status === "error";
  const [scanning, setScanning] = useState(false);
  const [scanNote, setScanNote] = useState<string | null>(null);

  const loadNeighbors = async () => {
    if (scanning) return;
    setScanning(true);
    setScanNote(null);
    try {
      const { entries, checked } = await findNeighborEntries(item);
      if (entries.length === 0) {
        setScanNote(checked === 0 ? "No same-level areas found" : `Checked ${checked} — none touch this area`);
        setTimeout(() => setScanNote(null), 4000);
      } else {
        bulkAddEntries(entries);
      }
    } catch {
      setScanNote("Neighbor scan failed");
      setTimeout(() => setScanNote(null), 4000);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div
      className={`rounded-xl border bg-white dark:bg-slate-950 p-2.5 ${
        isFocused ? "border-slate-900 dark:border-slate-100" : "border-slate-200 dark:border-slate-800"
      } ${item.visible ? "" : "opacity-60"}`}>
      <div className="flex items-start gap-2">
        {selection && (
          <button onClick={selection.onToggle} title="Mark layer" className="mini-btn shrink-0 -ml-1">
            {selection.selected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          </button>
        )}
        <span
          className="mt-1 w-3 h-3 rounded-full shrink-0 border border-black/20"
          style={{ background: item.color }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate" title={item.name}>
            {item.name}
          </p>
          <span className="flex items-center gap-1.5 mt-1">
            <span className={`chip ${badgeClassFor(item.type)}`}>{labelFor(item.type)}</span>
            {busy && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" /> loading
              </span>
            )}
            {failed && (
              <span className="inline-flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                <AlertTriangle className="w-3 h-3" /> failed
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            className="mini-btn"
            title={item.visible ? "Hide layer" : "Show layer"}
            onClick={() => toggle(item.id)}>
            {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            className="mini-btn"
            title={busy ? "Still loading — zooms when ready" : "Zoom to layer"}
            onClick={() => focus(item.id)}>
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
          </button>
          <button
            className="mini-btn"
            title="Load touching areas of the same level (neighbors)"
            onClick={loadNeighbors}
            disabled={scanning || failed}>
            {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
          <button
            className={`mini-btn ${item.showLabel !== false ? "!text-slate-900 dark:!text-white" : ""}`}
            title={item.showLabel !== false ? "Hide name badge on map" : "Show name badge on map"}
            onClick={() => update(item.id, { showLabel: !(item.showLabel !== false) })}>
            <Tag className="w-3.5 h-3.5" />
          </button>
          <button
            className="mini-btn hover:!text-red-600 dark:hover:!text-red-400"
            title="Remove layer"
            onClick={() => remove(item.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {failed && (
        <button
          onClick={() => retry(item.id)}
          className="mt-2 w-full inline-flex items-center justify-center gap-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg px-2 py-1.5">
          <RotateCcw className="w-3.5 h-3.5" /> Retry load
        </button>
      )}

      <div className="mt-2.5 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 items-center">
        <label className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
          Fill
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={item.opacity}
            onChange={(e) => update(item.id, { opacity: Number(e.target.value) })}
            className="flex-1 h-1"
          />
        </label>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums w-8 text-right">
          {Math.round(item.opacity * 100)}%
        </span>

        <label className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
          Line
          <input
            type="range"
            min={0.5}
            max={6}
            step={0.5}
            value={item.stroke}
            onChange={(e) => update(item.id, { stroke: Number(e.target.value) })}
            className="flex-1 h-1"
          />
        </label>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums w-8 text-right">
          {item.stroke.toFixed(1)}
        </span>

        <label className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 col-span-2">
          Color
          <input
            type="color"
            value={toHex(item.color)}
            onChange={(e) => update(item.id, { color: e.target.value })}
            className="w-8 h-6 rounded cursor-pointer bg-transparent border border-slate-200 dark:border-slate-700"
          />
          <span className="text-slate-400 truncate">{toHex(item.color)}</span>
          <button
            onClick={() => shuffleColor(item.id)}
            title="Auto-pick a color far from the other layers"
            className="mini-btn !w-6 !h-6 ml-auto">
            <Dices className="w-3.5 h-3.5" />
          </button>
        </label>
      </div>
      {scanNote && (
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{scanNote}</p>
      )}
    </div>
  );
}

function toHex(css: string): string {
  const m = css.match(/#([0-9a-f]{6})/i);
  if (m) return `#${m[1]}`;
  const rgb = css.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) {
    const h = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
    return `#${h(+rgb[1])}${h(+rgb[2])}${h(+rgb[3])}`;
  }
  return "#0ea5e9";
}
