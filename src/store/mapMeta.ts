import { create } from "zustand";

interface MapMeta {
  lat: number;
  lng: number;
  zoom: number;
  setMeta: (lat: number, lng: number, zoom: number) => void;
}

export const useMapMeta = create<MapMeta>((set) => ({
  lat: 7.8731,
  lng: 80.7718,
  zoom: 8,
  setMeta: (lat, lng, zoom) => set({ lat, lng, zoom }),
}));
