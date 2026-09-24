import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

interface SettingsState {
  theme: Theme;
  /** user-provided Stadia Maps API key (BYOK) — unlocks premium basemaps */
  stadiaKey: string;
  /** presentation mode: hide every UI chrome, keep only the map */
  uiHidden: boolean;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setStadiaKey: (k: string) => void;
  setUiHidden: (v: boolean) => void;
  toggleUiHidden: () => void;
}

function systemTheme(): Theme {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: typeof window !== "undefined" ? systemTheme() : "light",
      stadiaKey: "",
      uiHidden: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
      setStadiaKey: (stadiaKey) => set({ stadiaKey: stadiaKey.trim() }),
      setUiHidden: (uiHidden) => set({ uiHidden }),
      toggleUiHidden: () => set({ uiHidden: !get().uiHidden }),
    }),
    {
      name: "mapsl-settings-v1",
      partialize: (s) => ({ theme: s.theme, stadiaKey: s.stadiaKey }) as SettingsState,
    }
  )
);
