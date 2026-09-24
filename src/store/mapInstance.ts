/** @format */
import type { Map as LeafletMap } from "leaflet";

let instance: LeafletMap | null = null;
const listeners = new Set<() => void>();

export function setMapInstance(map: LeafletMap | null) {
  instance = map;
  listeners.forEach((fn) => fn());
}

export function getMapInstance(): LeafletMap | null {
  return instance;
}
