/** @format */
import { useEffect } from "react";
import { X, Check, Loader2, Ban } from "lucide-react";
import { useOverlayStore } from "../../store/useOverlayStore";

function bar(pct: number, done: boolean) {
  return (
    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${done ? "bg-emerald-500" : "bg-slate-900 dark:bg-slate-100"}`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

/** Bulk-load progress pill: loading bar, cancel, and done state. */
export default function BatchProgress({ compact = false }: { compact?: boolean }) {
  const batch = useOverlayStore((s) => s.batch);
  const cancelBatch = useOverlayStore((s) => s.cancelBatch);
  const dismissBatch = useOverlayStore((s) => s.dismissBatch);

  useEffect(() => {
    if (!batch || batch.done < batch.total) return;
    const t = setTimeout(() => useOverlayStore.getState().dismissBatch(), 8000);
    return () => clearTimeout(t);
  }, [batch]);

  if (!batch) return null;
  const done = batch.done >= batch.total;
  const pct = batch.total > 0 ? (batch.done / batch.total) * 100 : 0;

  return (
    <div className={`rounded-xl border ${done ? "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"} ${compact ? "p-2" : "p-2.5"}`}>
      <div className="flex items-center gap-2 text-[12px]">
        {done ? (
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500 shrink-0" />
        )}
        <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
          {done
            ? `${batch.total - batch.failed}/${batch.total} loaded${batch.failed > 0 ? `, ${batch.failed} failed` : ""}`
            : `Loading ${batch.done}/${batch.total}…`}
        </span>
        {!done ? (
          <button
            onClick={cancelBatch}
            title="Stop loading the rest"
            className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-red-600 dark:hover:text-red-400 shrink-0">
            <Ban className="w-3 h-3" /> Stop
          </button>
        ) : (
          <button
            onClick={dismissBatch}
            title="Dismiss"
            className="ml-auto text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="mt-1.5">{bar(pct, done)}</div>
    </div>
  );
}
