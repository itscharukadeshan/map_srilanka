/** @format */
import { useEffect, useState } from "react";
import { Eye, MapPin } from "lucide-react";
import NavBar from "./component/layout/NavBar";
import Sidebar, { type ExplorerTab } from "./component/layout/SideBar";
import MapView from "./component/map/Map";
import { ZoomControls, LocateControl, FullscreenControl } from "./component/map/MapControls";
import ScreenshotButton from "./component/map/ScreenshotButton";
import { DEFAULT_BASE_KEY, findBaseLayer } from "./utils/baseLayerConfig";
import { useMapMeta } from "./store/mapMeta";
import { useSettings } from "./store/settings";
import { useAnnotations } from "./store/annotations";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tab, setTab] = useState<ExplorerTab>("search");
  const [baseKey, setBaseKey] = useState(DEFAULT_BASE_KEY);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const meta = useMapMeta();
  const stadiaKey = useSettings((s) => s.stadiaKey);
  // key-requiring layer without a key can never render — normalize to the free default
  const requested = findBaseLayer(baseKey);
  const base =
    requested.requiresKey === "stadia" && !stadiaKey
      ? findBaseLayer(DEFAULT_BASE_KEY)
      : requested;
  useEffect(() => {
    if (base.key !== baseKey) setBaseKey(DEFAULT_BASE_KEY);
  }, [base.key, baseKey]);
  const theme = useSettings((s) => s.theme);
  const uiHidden = useSettings((s) => s.uiHidden);
  const toggleUiHidden = useSettings((s) => s.toggleUiHidden);
  const annotateOn = useAnnotations((s) => s.annotateOn);
  const setAnnotateOn = useAnnotations((s) => s.setAnnotateOn);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSidebarOpen(true);
        setTab("search");
      } else if (e.key.toLowerCase() === "h") {
        toggleUiHidden();
      } else if (e.key === "Escape") {
        setAnnotateOn(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleUiHidden, setAnnotateOn]);

  return (
    <div className={`h-dvh w-full flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 ${uiHidden ? "ui-hidden" : ""}`}>
      {!uiHidden && (
        <NavBar
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          onExport={() => {
            setIsSidebarOpen(true);
            setTab("export");
          }}
        />
      )}

      <div className="flex flex-1 min-h-0 relative">
        {!uiHidden && (
          <Sidebar
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            tab={tab}
            setTab={setTab}
            baseKey={baseKey}
            setBaseKey={setBaseKey}
          />
        )}

        <main className="flex-1 relative min-w-0 bg-slate-200 dark:bg-slate-900">
          <MapView baseKey={baseKey} />

          {!uiHidden && (
            <>
              {/* right tool stack */}
              <div className="absolute z-[1000] right-3 top-3 flex flex-col gap-2">
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                  <ZoomControls />
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-1 flex flex-col gap-1">
                  <LocateControl />
                  <FullscreenControl />
                  <ScreenshotButton compact />
                  <button
                    className={`tool-btn ${annotateOn ? "!bg-slate-900 !text-white dark:!bg-slate-100 dark:!text-slate-900" : ""}`}
                    title={annotateOn ? "Stop adding badges (Esc)" : "Add map badges — click anywhere to drop a numbered pin"}
                    onClick={() => setAnnotateOn(!annotateOn)}>
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* status bar */}
              <div className="absolute z-[1000] left-2 bottom-2 right-2 flex items-end gap-2 pointer-events-none">
                <div className="pointer-events-auto bg-white/95 dark:bg-slate-950/95 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm px-2.5 py-1.5 flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300 tabular-nums">
                  <span>
                    {meta.lat.toFixed(4)}°, {meta.lng.toFixed(4)}°
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span>z{meta.zoom}</span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="max-w-[220px] truncate">{base.key}</span>
                  {annotateOn && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Click map to drop a badge — Esc to stop
                      </span>
                    </>
                  )}
                </div>
                <div className="flex-1" />
                <div className="pointer-events-auto hidden md:block bg-white/95 dark:bg-slate-950/95 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm px-2.5 py-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                  © OpenStreetMap · © CARTO · © Esri · Overlays NSDI Sri Lanka ·{" "}
                  <a
                    href="https://github.com/itscharukadeshan/map_srilanka_data"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2">
                    Data
                  </a>
                </div>
              </div>
            </>
          )}

          {uiHidden && (
            <button
              onClick={toggleUiHidden}
              title="Show UI (H)"
              className="absolute z-[1000] bottom-4 right-4 h-10 px-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-lg inline-flex items-center gap-2 text-[13px] font-medium text-slate-700 dark:text-slate-200 opacity-70 hover:opacity-100">
              <Eye className="w-4 h-4" /> Show UI
            </button>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
