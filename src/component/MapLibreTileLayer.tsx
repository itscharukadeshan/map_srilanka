/** @format */
import {
  createElementObject,
  createTileLayerComponent,
  updateGridLayer,
  withPane,
  LayerProps,
} from "@react-leaflet/core";
import L from "leaflet";
import "@maplibre/maplibre-gl-leaflet";

interface MapLibreTileLayerProps
  extends L.LeafletMaplibreGLOptions,
    LayerProps {
  url: string;
  attribution: string;
}

const MapLibreTileLayer = createTileLayerComponent<
  L.MaplibreGL,
  MapLibreTileLayerProps
>(
  function createTileLayer({ url, attribution, ...options }, context) {
    const layer = L.maplibreGL(
      { style: url, attribution },
      withPane(options, context)
    );
    return createElementObject(layer, context);
  },
  function updateTileLayer(layer, props, prevProps) {
    updateGridLayer(layer, props, prevProps);
    const { url, attribution } = props;
    if (url && url !== prevProps.url) {
      layer.getMaplibreMap().setStyle(url);
    }
    if (attribution && attribution !== prevProps.attribution) {
      layer.options.attribution = attribution;
    }
  }
);

export default MapLibreTileLayer;
