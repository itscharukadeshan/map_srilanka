/** @format */

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import baseLayerConfig from "../config/baseLayerConfig";

const { BaseLayer, Overlay } = LayersControl;

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const Map: React.FC = () => {
  const [mapLayers, setMapLayers] = useState<{ name: string; url: string }[]>(
    []
  );

  useEffect(() => {
    fetch("https://gisapps.nsdi.gov.lk/server/rest/services/?f=pjson")
      .then((response) => response.json())
      .then((data) => {
        const layers = data.services.map((service: { name: string }) => ({
          name: service.name,
          url: `https://gisapps.nsdi.gov.lk/server/rest/services/${service.name}/MapServer/tile/{z}/{y}/{x}`,
        }));
        setMapLayers(layers);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

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
        {mapLayers.map((layer) => (
          <Overlay key={layer.name} name={layer.name}>
            <TileLayer url={layer.url} attribution={`&copy; ${layer.name}`} />
          </Overlay>
        ))}
      </LayersControl>
    </MapContainer>
  );
};

export default Map;
