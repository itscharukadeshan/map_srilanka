/** @format */
import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import baseLayerConfig from "../config/baseLayerConfig";
import MapLibreTileLayer from "./MapLibreTileLayer";

const { BaseLayer } = LayersControl;

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
      style={{ height: "100vh", width: "100%" }}>
      <LayersControl>
        {Object.values(baseLayerConfig).map(
          ({ url, attribution, key, type }) => (
            <BaseLayer key={key} name={key} checked={key === `OpenStreetMap`}>
              {type === "glStyle" ? (
                <MapLibreTileLayer url={url} attribution={attribution} />
              ) : (
                <TileLayer url={url} attribution={attribution} />
              )}
            </BaseLayer>
          )
        )}
      </LayersControl>
    </MapContainer>
  );
};

export default Map;
