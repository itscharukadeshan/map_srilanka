import type { FeatureGroup } from "leaflet";

/** Lets the Layers tab clear drawn measurements without reaching into the map. */
let group: FeatureGroup | null = null;

export function registerMeasureGroup(g: FeatureGroup | null) {
  group = g;
}

export function clearMeasureLayers() {
  group?.clearLayers();
}
