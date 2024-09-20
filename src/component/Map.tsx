/** @format */
import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import baseLayerConfig from "../config/baseLayerConfig";

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
        <BaseLayer checked name='OpenStreetMap'>
          <TileLayer
            url={baseLayerConfig.openStreetMap.url}
            attribution={baseLayerConfig.openStreetMap.attribution}
          />
        </BaseLayer>
        <BaseLayer name='OpenTopoMap'>
          <TileLayer
            url={baseLayerConfig.openTopoMap.url}
            attribution={baseLayerConfig.openTopoMap.attribution}
          />
        </BaseLayer>
        <BaseLayer name='Humanitarian'>
          <TileLayer
            url={baseLayerConfig.humanitarian.url}
            attribution={baseLayerConfig.humanitarian.attribution}
          />
        </BaseLayer>
        <BaseLayer name='Satellite'>
          <TileLayer
            url={baseLayerConfig.StadiaSatellite.url}
            attribution={baseLayerConfig.StadiaSatellite.attribution}
          />
        </BaseLayer>
        <BaseLayer name='Grey'>
          <TileLayer
            url={baseLayerConfig.Grey.url}
            attribution={baseLayerConfig.Grey.attribution}
          />
        </BaseLayer>
      </LayersControl>
    </MapContainer>
  );
};

export default Map;
