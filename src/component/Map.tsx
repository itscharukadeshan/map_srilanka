/** @format */

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, LayersControl, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "esri-leaflet";
import L from "leaflet";
import axios from "axios";
import baseLayerConfig from "../config/baseLayerConfig";
import MapLibreTileLayer from "./MapLibreTileLayer";

const { BaseLayer } = LayersControl;

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

interface GeoJSONResponse {
  type: string;
  features: any[];
}

const Map: React.FC = () => {
  const [geoJsonUrl, setGeoJsonUrl] = useState<string>("");
  const [geoJsonData, setGeoJsonData] = useState<GeoJSONResponse | null>(null);
  const [color, setColor] = useState<string>("#3388ff");
  const [opacity, setOpacity] = useState<number>(0.5);

  const extractPath = (url: string): string | null => {
    const match = url.match(/\/v1\/(.+)\.geojson$/);
    return match ? `/v1/${match[1]}` : null;
  };

  const fetchGeoJson = async () => {
    if (!geoJsonUrl) return;

    const extractedPath = extractPath(geoJsonUrl);
    if (!extractedPath) {
      console.error("Invalid URL format");
      return;
    }

    try {
      const response = await axios.get<GeoJSONResponse>(
        `https://mapsrilankaapi.vercel.app/api/fetchData?filePath=${extractedPath}`
      );
      setGeoJsonData(response.data);
    } catch (error) {
      console.error("Error fetching GeoJSON data:", error);
      setGeoJsonData(null);
    }
  };

  useEffect(() => {
    fetchGeoJson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoJsonUrl]);

  const geoJsonStyle = {
    color: color,
    fillColor: color,
    fillOpacity: opacity,
  };

  return (
    <div>
      <div className='p-4 bg-gray-100 space-y-4'>
        <label className='block'>
          <span className='text-gray-700'>GeoJSON URL:</span>
          <input
            type='text'
            className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500'
            value={geoJsonUrl}
            onChange={(e) => setGeoJsonUrl(e.target.value)}
            placeholder='Enter GeoJSON URL'
          />
        </label>

        <label className='block w-28'>
          <span className='text-gray-700'>Color:</span>
          <input
            type='color'
            className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg'
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>

        <label className='block w-28'>
          <span className='text-gray-700'>Opacity:</span>
          <input
            type='range'
            min='0.1'
            max='1'
            step='0.1'
            className='mt-1 block w-full'
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
          />
          <span className='text-gray-500'>{opacity}</span>
        </label>
      </div>

      <MapContainer
        center={[7.8731, 80.7718]}
        zoom={8}
        style={{ height: "80vh", width: "100%" }}>
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
        </LayersControl>

        {geoJsonData && <GeoJSON data={geoJsonData} style={geoJsonStyle} />}
      </MapContainer>
    </div>
  );
};

export default Map;
