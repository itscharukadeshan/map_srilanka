/** @format */
import { useState } from "react";
import { FileDown, Check } from "lucide-react";
import { DEFAULT_EXPORT, exportMapImage } from "../export/exportImage";
import { useOverlayStore } from "../../store/useOverlayStore";

/** One-click PNG @2x with attribution. Full controls live in the Export tab. */
export default function ScreenshotButton({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const overlays = useOverlayStore((s) => s.overlays);

  const quick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await exportMapImage(
        { ...DEFAULT_EXPORT, scale: 2 },
        overlays.filter((o) => o.visible).map((o) => ({ name: o.name, color: o.color }))
      );
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button className="tool-btn" title="Quick export PNG @2x" onClick={quick} disabled={loading}>
        {loading ? (
          <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        ) : done ? (
          <Check className="w-4 h-4 text-emerald-600" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={quick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-slate-900 text-white text-[13px] font-medium hover:bg-slate-700 disabled:opacity-50">
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : done ? (
        <Check className="w-4 h-4" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      {done ? "Saved" : "Export"}
    </button>
  );
}
