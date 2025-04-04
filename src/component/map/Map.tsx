/** @format */

import React from "react";
import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "esri-leaflet";
import L from "leaflet";

import baseLayerConfig from "../../utils/baseLayerConfig";
import MapLibreTileLayer from "./MapLibreTileLayer";
import MapOverlays from "./MapOverlays";

const { BaseLayer } = LayersControl;

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const Map: React.FC = () => {
  return (
    <MapContainer
      center={[7.8731, 80.7718]}
      zoom={8}
      style={{ height: "100%", width: "100%" }}>
      <LayersControl>
        {Object.values(baseLayerConfig).map(
          ({ url, attribution, key, type }) => (
            <BaseLayer key={key} name={key} checked={key === "OFM Liberty"}>
              {type === "glStyle" ? (
                <MapLibreTileLayer url={url} attribution={attribution} />
              ) : (
                <TileLayer url={url} attribution={attribution} />
              )}
            </BaseLayer>
          )
        )}

        <MapOverlays />
      </LayersControl>
    </MapContainer>
  );
};

export default Map;
