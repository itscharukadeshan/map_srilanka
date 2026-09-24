/** @format */
import { Check, Lock } from "lucide-react";
import { freeBaseLayers, premiumBaseLayers, type BaseCategory } from "../../utils/baseLayerConfig";
import { resolveThumb } from "../../utils/baseLayerConfig";
import { useSettings } from "../../store/settings";

interface Props {
  activeKey: string;
  onChange: (key: string) => void;
}

const FREE_GROUPS: BaseCategory[] = ["Streets", "Light", "Dark", "Satellite", "Terrain"];

export default function BasemapGallery({ activeKey, onChange }: Props) {
  const stadiaKey = useSettings((s) => s.stadiaKey);

  return (
    <div className="p-3 space-y-4">
      {FREE_GROUPS.map((cat) => {
        const items = freeBaseLayers.filter((l) => l.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              {cat}
            </p>
            <div className="space-y-1.5">
              {items.map((l) => {
                const active = l.key === activeKey;
                return (
                  <button
                    key={l.key}
                    onClick={() => onChange(l.key)}
                    className={`w-full flex items-center gap-2.5 rounded-xl border p-1.5 text-left transition-colors ${
                      active
                        ? "border-slate-900 dark:border-slate-100 bg-slate-900/[0.04] dark:bg-slate-100/[0.06]"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent hover:border-slate-400 dark:hover:border-slate-600"
                    }`}>
                    <img
                      src={resolveThumb(l, stadiaKey)}
                      alt={l.label}
                      loading="lazy"
                      className="w-14 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">
                          {l.key}
                        </span>
                        {active && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white shrink-0" />}
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {l.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      <section>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Premium · API key
        </p>
        {!stadiaKey ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center">
            <Lock className="w-4 h-4 mx-auto text-slate-400" />
            <p className="mt-1.5 text-[12px] text-slate-500 dark:text-slate-400">
              Add your Stadia API key above to unlock 5 extra styles.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {premiumBaseLayers.map((l) => {
              const active = l.key === activeKey;
              return (
                <button
                  key={l.key}
                  onClick={() => onChange(l.key)}
                  className={`w-full flex items-center gap-2.5 rounded-xl border p-1.5 text-left transition-colors ${
                    active
                      ? "border-slate-900 dark:border-slate-100 bg-slate-900/[0.04] dark:bg-slate-100/[0.06]"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent hover:border-slate-400 dark:hover:border-slate-600"
                  }`}>
                  <img
                    src={resolveThumb(l, stadiaKey)}
                    alt={l.label}
                    loading="lazy"
                    className="w-14 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">
                        {l.key}
                      </span>
                      {active && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white shrink-0" />}
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {l.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
        Free basemaps need no key. Imagery and terrain tiles can be slower on first load.
      </p>
    </div>
  );
}
