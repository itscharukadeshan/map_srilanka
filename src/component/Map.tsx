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

const Map: React.FC = () => {
  const [geoJsonUrl, setGeoJsonUrl] = useState<string>("");
  const [geoJsonData, setGeoJsonData] = useState<GeoJSONResponse | null>(null);
  const [color, setColor] = useState<string>("#3388ff");
  const [opacity, setOpacity] = useState<number>(0.5);

  type GeoJSONResponse = {
    type: "FeatureCollection";
    features: GeoJSON.Feature<GeoJSON.Geometry, unknown>[];
  };

  const transformGitHubUrl = (url: string) => {
    const baseRepoUrl =
      "https://github.com/itscharukadeshan/map_srilanka_data/blob/";

    if (url.startsWith(baseRepoUrl)) {
      return url
        .replace(
          "https://github.com/itscharukadeshan/map_srilanka_data/blob/",
          "https://raw.githubusercontent.com/itscharukadeshan/map_srilanka_data/"
        )
        .replace("github.com", "raw.githubusercontent.com");
    }

    return url;
  };

  const rawGeoJsonUrl = transformGitHubUrl(geoJsonUrl);
  console.log(rawGeoJsonUrl);
  const fetchGeoJson = async () => {
    if (!geoJsonUrl) return;

    try {
      const response = await axios.get<GeoJSONResponse>(
        `https://corsproxy.io/?${rawGeoJsonUrl}`
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
      <div className='p-4 bg-gray-100 space-y-4 '>
        <label className='block'>
          <span className='text-gray-700 '>GeoJSON URL:</span>
          <input
            type='text'
            className='mt-1 block w-full px-4 py-2 input input-bordered input-infoc max-w-xs'
            value={geoJsonUrl}
            onChange={(e) => setGeoJsonUrl(e.target.value)}
            placeholder='Enter GeoJSON URL'
          />
        </label>
        <label className='block w-fit'>
          <span className='text-gray-700'>Example url : </span>
          <a
            href='https://github.com/itscharukadeshan/map_srilanka_data/blob/main/v1/administrative/geo_json/ds_divisions/ds_colombo_92.geojson'
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-500 underline ml-2'>
            https://github.com/itscharukadeshan/map_srilanka_data/blob/main/v1/administrative/geo_json/ds_divisions/ds_colombo_92.geojson
          </a>
        </label>
        <label className='block w-fit'>
          <span className='text-gray-700 font-mono font-bold'>Repo url :</span>
          <a
            href='https://github.com/itscharukadeshan/map_srilanka_data/tree/main/v1'
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-500 underline ml-2 font-mono font-bold '>
            https://github.com/itscharukadeshan/map_srilanka_data/tree/main/v1
          </a>
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
