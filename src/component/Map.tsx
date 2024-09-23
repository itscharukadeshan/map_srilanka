/** @format */
import { MapContainer, TileLayer, LayersControl, GeoJSON } from "react-leaflet";
import "esri-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import baseLayerConfig from "../config/baseLayerConfig";
import MapLibreTileLayer from "./MapLibreTileLayer";
import { useEffect, useState } from "react";

const { BaseLayer, Overlay } = LayersControl;

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const Map: React.FC = () => {
  const [geojsonData, setGeojsonData] = useState(null);

  useEffect(() => {
    const fetchGeojson = async () => {
      const response = await fetch(
        "https://github.com/itscharukadeshan/map_srilanka_data/blob/main/v1/administrative/geo_json/district/DST_AMPARA_1.geojson"
      );
      const data = await response.json();
      setGeojsonData(data);
    };

    fetchGeojson();
  }, []);
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
        {geojsonData && (
          <Overlay name='Central Province' checked>
            <GeoJSON data={geojsonData} />
          </Overlay>
        )}
      </LayersControl>
    </MapContainer>
  );
};

export default Map;
