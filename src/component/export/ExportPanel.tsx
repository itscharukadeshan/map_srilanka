/** @format */
import { useState } from "react";
import { Download, ClipboardCopy, Check, AlertTriangle, ImageDown } from "lucide-react";
import {
  DEFAULT_EXPORT,
  copyMapToClipboard,
  estimateExportSize,
  exportMapImage,
  type ExportSettings,
} from "./exportImage";
import { useOverlayStore } from "../../store/useOverlayStore";

export default function ExportPanel() {
  const overlays = useOverlayStore((s) => s.overlays);
  const [opts, setOpts] = useState<ExportSettings>(DEFAULT_EXPORT);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const size = estimateExportSize();
  const legend = overlays.filter((o) => o.visible).map((o) => ({ name: o.name, color: o.color }));
  const set = <K extends keyof ExportSettings>(k: K, v: ExportSettings[K]) =>
    setOpts((p) => ({ ...p, [k]: v }));

  const runExport = async () => {
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const r = await exportMapImage(opts, legend);
      setDone(`Saved ${r.width}×${r.height}px ${opts.format.toUpperCase()}`);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Export failed. Try a raster basemap and 1x scale."
      );
    } finally {
      setBusy(false);
    }
  };

  const runCopy = async () => {
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      await copyMapToClipboard(opts, legend);
      setDone("Copied to clipboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Copy failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-3 space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 grid place-items-center rounded-lg bg-slate-900">
          <ImageDown className="w-4 h-4 text-white" />
        </span>
        <div>
          <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">Export map</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {size.w > 0 ? `${size.w}×${size.h} view → ${size.w * opts.scale}×${size.h * opts.scale}px @${opts.scale}x` : "Open the map to preview size"}
          </p>
        </div>
      </div>

      <section>
        <Label>Format</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {(["png", "jpeg"] as const).map((f) => (
            <button
              key={f}
              onClick={() => set("format", f)}
              className={`seg ${opts.format === f ? "seg-active" : ""}`}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="hint">PNG is lossless (bigger). JPEG is smaller — use quality below.</p>
      </section>

      <section>
        <Label>Resolution</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {([1, 2, 3] as const).map((s) => (
            <button key={s} onClick={() => set("scale", s)} className={`seg ${opts.scale === s ? "seg-active" : ""}`}>
              {s}x
              <span className="block text-[10px] font-normal opacity-70">
                {s === 1 ? "draft" : s === 2 ? "print" : "large print"}
              </span>
            </button>
          ))}
        </div>
      </section>

      {opts.format === "jpeg" && (
        <section>
          <Label>JPEG quality — {Math.round(opts.jpegQuality * 100)}%</Label>
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.01}
            value={opts.jpegQuality}
            onChange={(e) => set("jpegQuality", Number(e.target.value))}
            className="w-full"
          />
        </section>
      )}

      <section className="space-y-2">
        <Label>Decorations (burned into image)</Label>
        <input
          value={opts.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Title (optional), e.g. Colombo District — GN boundaries"
          className="input-light"
        />
        <Toggle
          label={`Legend (${legend.length} visible layer${legend.length === 1 ? "" : "s"})`}
          checked={opts.includeLegend}
          onChange={(v) => set("includeLegend", v)}
        />
        <Toggle
          label="Attribution + date footer"
          checked={opts.includeAttribution}
          onChange={(v) => set("includeAttribution", v)}
        />
      </section>

      <section>
        <Label>Filename</Label>
        <input
          value={opts.filename}
          onChange={(e) => set("filename", e.target.value)}
          placeholder="map-srilanka"
          className="input-light"
        />
      </section>

      {error && (
        <p className="flex items-start gap-1.5 text-[12px] text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg px-2.5 py-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {error}
        </p>
      )}
      {done && (
        <p className="flex items-center gap-1.5 text-[12px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg px-2.5 py-2">
          <Check className="w-3.5 h-3.5 shrink-0" /> {done}
        </p>
      )}

      <div className="flex gap-1.5">
        <button onClick={runExport} disabled={busy} className="btn-primary flex-1">
          <Download className="w-4 h-4" /> {busy ? "Rendering…" : "Download"}
        </button>
        <button onClick={runCopy} disabled={busy} title="Copy PNG to clipboard" className="btn-secondary">
          <ClipboardCopy className="w-4 h-4" />
        </button>
      </div>

      <p className="hint">
        Tip: zoom to the exact framing first — export captures the current view. If tiles look
        washed at 3x, wait a second after panning so tiles settle before exporting.
      </p>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
      {children}
    </p>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-slate-700 dark:text-slate-200 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-slate-900"
      />
      {label}
    </label>
  );
}
