/** @format */
import {
  createElementObject,
  createTileLayerComponent,
  LayerProps,
} from "@react-leaflet/core";
import L from "leaflet";
import "@maplibre/maplibre-gl-leaflet";

interface MapLibreTileLayerProps extends LayerProps {
  url: string;
  attribution: string;
}

const MapLibreTileLayer = createTileLayerComponent<
  L.MaplibreGL,
  MapLibreTileLayerProps
>(
  ({ url, ...options }, context) => {
    const layer = L.maplibreGL({
      style: url,
      ...options,
    });
    return createElementObject(layer, context);
  },
  (layer, props, prevProps) => {
    if (props.url !== prevProps.url) {
      layer.getMaplibreMap().setStyle(props.url);
    }
    if (props.attribution !== prevProps.attribution) {
      layer.options.attribution = props.attribution;
    }
  }
);

export default MapLibreTileLayer;
