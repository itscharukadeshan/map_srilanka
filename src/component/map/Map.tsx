/** @format */

import React from "react";
import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "esri-leaflet";
import L from "leaflet";

import baseLayerConfig from "../../utils/baseLayerConfig";
import MapLibreTileLayer from "./MapLibreTileLayer";
import Overlays from "./Overlay";

const { BaseLayer } = LayersControl;

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const geoJsonLayers = {
  amparaDistrict: {
    url: "https://corsproxy.io/?https://github.com/itscharukadeshan/map_srilanka_data/raw/refs/heads/main/v1/administrative/geo_json/district/dst_ampara_1.geojson",
    color: "#FF0000",
    opacity: 0.7,
  },
};

const Map: React.FC = () => {
  return (
    <MapContainer
      center={[7.8731, 80.7718]}
      zoom={8}
      style={{ height: "100%", width: "100%" }}>
      <LayersControl>
        {Object.values(baseLayerConfig).map(
          ({ url, attribution, key, type }) => (
            <BaseLayer key={key} name={key} checked={key === "OpenStreetMap"}>
              {type === "glStyle" ? (
                <MapLibreTileLayer url={url} attribution={attribution} />
              ) : (
                <TileLayer url={url} attribution={attribution} />
              )}
            </BaseLayer>
          )
        )}
        <Overlays layers={geoJsonLayers} />
      </LayersControl>
    </MapContainer>
  );
};

export default Map;
