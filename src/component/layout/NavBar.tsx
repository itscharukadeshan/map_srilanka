/** @format */
import { PanelLeft, Map as MapIcon, Sun, Moon, EyeOff } from "lucide-react";
import ScreenshotButton from "../map/ScreenshotButton";
import { useSettings } from "../../store/settings";

interface NavBarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  onExport: () => void;
}

export default function NavBar({ toggleSidebar, isSidebarOpen, onExport }: NavBarProps) {
  const theme = useSettings((s) => s.theme);
  const toggleTheme = useSettings((s) => s.toggleTheme);
  const toggleUiHidden = useSettings((s) => s.toggleUiHidden);

  return (
    <header className="h-12 shrink-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 px-2 z-[1000]">
      <button
        onClick={toggleSidebar}
        title={isSidebarOpen ? "Hide explorer panel" : "Show explorer panel"}
        aria-label="Toggle sidebar"
        className={`w-8 h-8 grid place-items-center rounded-lg transition-colors ${
          isSidebarOpen
            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        }`}>
        <PanelLeft className="w-4 h-4" />
      </button>
      <span className="w-7 h-7 grid place-items-center rounded-lg bg-slate-900 dark:bg-slate-100 shrink-0">
        <MapIcon className="w-4 h-4 text-white dark:text-slate-900" />
      </span>
      <span className="leading-none min-w-0">
        <span className="block text-[13px] font-semibold tracking-tight text-slate-900 dark:text-white truncate">
          Map Sri Lanka
        </span>
        <span className="block text-[10px] text-slate-500 dark:text-slate-400">NSDI · OSM · Free basemaps</span>
      </span>

      <div className="flex-1" />

      <span className="hidden lg:block text-[11px] text-slate-400 dark:text-slate-500">
        Search GN / DS / District / Province — <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px]">↑↓ ↵</kbd> to add
      </span>

      <button
        onClick={toggleTheme}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="w-8 h-8 grid place-items-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
      <button
        onClick={toggleUiHidden}
        title="Hide all UI (presentation mode) — press H to restore"
        className="w-8 h-8 hidden sm:grid place-items-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
        <EyeOff className="w-4 h-4" />
      </button>
      <button
        onClick={onExport}
        className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:border-slate-400 hidden sm:block">
        Export options
      </button>
      <ScreenshotButton />
    </header>
  );
}
