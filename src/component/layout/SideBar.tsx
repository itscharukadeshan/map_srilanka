/** @format */
import { useState } from "react";
import { Search, Layers, ListTree, Map as MapIcon, ImageDown, X, Compass, KeyRound, Lock } from "lucide-react";
import SearchComponent from "../search/SearchComponent";
import LayersTab from "./LayersTab";
import BrowseTab from "./BrowseTab";
import BasemapGallery from "../map/BasemapSwitcher";
import ExportPanel from "../export/ExportPanel";
import { useOverlayStore } from "../../store/useOverlayStore";
import { useSettings } from "../../store/settings";

export type ExplorerTab = "search" | "browse" | "layers" | "basemaps" | "export";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  tab: ExplorerTab;
  setTab: (t: ExplorerTab) => void;
  baseKey: string;
  setBaseKey: (k: string) => void;
}

const TABS: { id: ExplorerTab; label: string; icon: typeof Search }[] = [
  { id: "search", label: "Search", icon: Search },
  { id: "browse", label: "Browse", icon: ListTree },
  { id: "layers", label: "Layers", icon: Layers },
  { id: "basemaps", label: "Base", icon: MapIcon },
  { id: "export", label: "Export", icon: ImageDown },
];

export default function Sidebar({ isOpen, toggleSidebar, tab, setTab, baseKey, setBaseKey }: SidebarProps) {
  const overlays = useOverlayStore((s) => s.overlays);

  return (
    <>
      {/* mobile scrim */}
      <div
        onClick={toggleSidebar}
        className={`fixed inset-0 z-[999] bg-slate-900/40 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex-col w-[340px] max-w-[88vw] shrink-0 z-[1000]
          fixed md:static inset-y-0 left-0 top-12 md:top-auto bottom-0 md:bottom-auto h-[calc(100%-48px)] md:h-auto flex transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:hidden"
        }`}>
        {/* tab bar */}
        <div className="grid grid-cols-5 border-b border-slate-200 dark:border-slate-800 p-1.5 gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100"
                }`}>
                <Icon className="w-4 h-4" />
                {t.label}
                {t.id === "layers" && overlays.length > 0 && (
                  <span className={`text-[10px] leading-none px-1.5 py-0.5 rounded-full tabular-nums ${active ? "bg-white/20 dark:bg-slate-900/10" : "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"}`}>
                    {overlays.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto nice-scroll">
          {tab === "search" && (
            <div className="p-3 space-y-3">
              <SearchComponent onSelect={() => setTab("layers")} />
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 flex gap-2.5">
                <Compass className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">
                  Pick a result to pin it. The map zooms to it automatically once loaded —
                  repeat the zoom anytime with the crosshair on its layer card.
                </p>
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 px-1">
                Sources: map_srilanka_data v1 (province → district → DS → GN), cached on CDN.
              </div>
            </div>
          )}

          {tab === "browse" && <BrowseTab />}

          {tab === "layers" && <LayersTab onFind={() => setTab("search")} />}

          {tab === "basemaps" && (
            <div>
              <ApiKeyManager />
              <BasemapGallery activeKey={baseKey} onChange={(k) => setBaseKey(k)} />
            </div>
          )}

          {tab === "export" && <ExportPanel />}
        </div>

        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 p-2">
          <button
            onClick={toggleSidebar}
            className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[13px] font-medium text-slate-600 dark:text-slate-300">
            <X className="w-4 h-4" /> Close panel
          </button>
        </div>
      </aside>
    </>
  );
}

/** BYOK: paste a Stadia key to unlock premium basemaps. Stored only in this browser. */
function ApiKeyManager() {
  const stadiaKey = useSettings((s) => s.stadiaKey);
  const setStadiaKey = useSettings((s) => s.setStadiaKey);
  const [draft, setDraft] = useState(stadiaKey);
  const [show, setShow] = useState(false);

  return (
    <div className="m-3 mb-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
      <p className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 dark:text-slate-200">
        {stadiaKey ? <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
        API key basemaps
        {stadiaKey && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">unlocked</span>
        )}
      </p>
      {!stadiaKey ? (
        <>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Paste your free Stadia Maps key to unlock Bright, Smooth, Dark, Watercolor and
            Toner styles. Get one at{" "}
            <a href="https://stadiamaps.com" target="_blank" rel="noreferrer" className="underline underline-offset-2">
              stadiamaps.com
            </a>
            . Key stays in this browser.
          </p>
          <div className="mt-2 flex gap-1.5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              type={show ? "text" : "password"}
              placeholder="Stadia API key"
              className="input-light !py-1.5 !text-[12px]"
            />
            <button
              onClick={() => draft.trim() && setStadiaKey(draft)}
              disabled={!draft.trim()}
              className="btn-primary !h-8 shrink-0 !text-[12px]">
              Save
            </button>
          </div>
          <button onClick={() => setShow((v) => !v)} className="mt-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            {show ? "Hide" : "Show"} key
          </button>
        </>
      ) : (
        <div className="mt-2 flex gap-1.5">
          <span className="flex-1 truncate text-[12px] text-slate-500 dark:text-slate-400 font-mono">
            ••••••••{stadiaKey.slice(-4)}
          </span>
          <button
            onClick={() => { setStadiaKey(""); setDraft(""); }}
            className="text-[12px] font-medium text-red-600 dark:text-red-400 hover:underline shrink-0">
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
