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
        <BaseLayer checked name='OpenStreetMap'>
          <TileLayer
            url={baseLayerConfig.openStreetMap.url}
            attribution={baseLayerConfig.openStreetMap.attribution}
          />
        </BaseLayer>
        <BaseLayer name='OSMB Bright'>
          <MapLibreTileLayer
            url={baseLayerConfig.OSMBright.url}
            attribution={baseLayerConfig.OSMBright.attribution}
          />
        </BaseLayer>
        <BaseLayer name='Stadia Satellite'>
          <MapLibreTileLayer
            url={baseLayerConfig.StadiaSatellite.url}
            attribution={baseLayerConfig.StadiaSatellite.attribution}
          />
        </BaseLayer>
        <BaseLayer name='Stamen Toner'>
          <MapLibreTileLayer
            url={baseLayerConfig.StadiaStamenToner.url}
            attribution={baseLayerConfig.StadiaStamenToner.attribution}
          />
        </BaseLayer>
        <BaseLayer name='Stamen Terrain'>
          <MapLibreTileLayer
            url={baseLayerConfig.StamenTerrain.url}
            attribution={baseLayerConfig.StamenTerrain.attribution}
          />
        </BaseLayer>
        <BaseLayer name='Stamen Terrain Background'>
          <MapLibreTileLayer
            url={baseLayerConfig.StamenTerrainBackground.url}
            attribution={baseLayerConfig.StamenTerrainBackground.attribution}
          />
        </BaseLayer>

        <BaseLayer name='Stamen Watercolor'>
          <MapLibreTileLayer
            url={baseLayerConfig.StamenWatercolor.url}
            attribution={baseLayerConfig.StamenWatercolor.attribution}
          />
        </BaseLayer>

        <BaseLayer name='Alidade Smooth'>
          <MapLibreTileLayer
            url={baseLayerConfig.StadiaAlidadeSmooth.url}
            attribution={baseLayerConfig.StadiaAlidadeSmooth.attribution}
          />
        </BaseLayer>

        <BaseLayer name='Alidade Smooth Dark'>
          <MapLibreTileLayer
            url={baseLayerConfig.StadiaAlidadeSmoothDark.url}
            attribution={baseLayerConfig.StadiaAlidadeSmoothDark.attribution}
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
      </LayersControl>
    </MapContainer>
  );
};

export default Map;
