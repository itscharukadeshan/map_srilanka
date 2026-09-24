import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GeoJsonObject } from "geojson";

interface MeasureState {
  /** persisted drawn measurements (lines/polygons) */
  geojson: GeoJsonObject | null;
  setGeojson: (g: GeoJsonObject | null) => void;
}

export const useMeasurements = create<MeasureState>()(
  persist(
    (set) => ({
      geojson: null,
      setGeojson: (geojson) => set({ geojson }),
    }),
    {
      name: "mapsl-measurements-v1",
      partialize: (s) => ({ geojson: s.geojson }) as MeasureState,
    }
  )
);
