/** @format */
declare module "@maplibre/maplibre-gl-leaflet" {
  import * as L from "leaflet";

  export interface MaplibreGLOptions {
    style: string;
    attribution: string;
  }

  export function maplibreGL(options: MaplibreGLOptions): L.TileLayer;
}
