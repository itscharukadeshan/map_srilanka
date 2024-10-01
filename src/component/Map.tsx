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
  const [geoJsonUrls, setGeoJsonUrls] = useState<string[]>([
    "https://github.com/itscharukadeshan/map_srilanka_data/blob/main/v1/administrative/geo_json/ds_divisions/ds_colombo_92.geojson",
  ]);
  const [geoJsonData, setGeoJsonData] = useState<GeoJSONResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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

  const fetchGeoJson = async () => {
    setLoading(true);
    setGeoJsonData(null);

    try {
      const fetchedData = await Promise.all(
        geoJsonUrls.map(async (url) => {
          if (!url) return null;
          const rawUrl = transformGitHubUrl(url);
          const response = await axios.get<GeoJSONResponse>(
            `https://corsproxy.io/?${rawUrl}`
          );
          return response.data;
        })
      );

      const combinedFeatures = fetchedData
        .filter((data): data is GeoJSONResponse => data !== null)
        .flatMap((data) => data.features);

      setGeoJsonData({ type: "FeatureCollection", features: combinedFeatures });
    } catch (error) {
      console.error("Error fetching GeoJSON data:", error);
      setGeoJsonData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (geoJsonUrls.length > 0) {
      fetchGeoJson();
    }
  }, [geoJsonUrls]);

  const geoJsonStyle = {
    color: color,
    fillColor: color,
    fillOpacity: opacity,
    weight: 1,
  };

  return (
    <div className='flex h-screen'>
      <div className='w-80 bg-gray-900 p-4 overflow-y-auto'>
        <h2 className='text-xl font-semibold'>GeoJSON Control Panel</h2>

        <div className='space-y-4 mt-4'>
          <label className='block'>
            <span className='text-gray-200 font-mono my-2'>GeoJSON URLs:</span>
            {geoJsonUrls.map((url, index) => (
              <div key={index} className='flex items-center space-x-2'>
                <input
                  type='text'
                  className='mt-1 block w-full px-4 py-2 input input-bordered'
                  value={url}
                  onChange={(e) => {
                    const newUrls = [...geoJsonUrls];
                    newUrls[index] = e.target.value;
                    setGeoJsonUrls(newUrls);
                  }}
                  placeholder='Enter GeoJSON URL'
                />
                {index === geoJsonUrls.length - 1 && (
                  <button
                    onClick={() => setGeoJsonUrls([...geoJsonUrls, ""])}
                    className='btn btn-primary'>
                    Add URL
                  </button>
                )}
              </div>
            ))}
          </label>

          <label className='block w-28'>
            <span className='text-gray-200'>Color :</span>
            <input
              type='color'
              className='mt-1 block w-full'
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </label>

          <label className='block w-28'>
            <span className='text-gray-200'>Opacity:</span>
            <input
              type='range'
              min='0.1'
              max='1'
              step='0.1'
              className='mt-1 block w-full'
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
            />
            <span className='text-gray-200'>{opacity}</span>
          </label>

          <label className='block'>
            <span className='text-gray-200 font-mono font-bold'>Repo URL:</span>
            <a
              href='https://github.com/itscharukadeshan/map_srilanka_data/tree/main/v1/administrative/geo_json'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-500 underline ml-2 font-mono font-bold'>
              Administrative
            </a>
          </label>
          <label className='block'>
            <span className='text-gray-200 font-mono font-bold'>Repo URL:</span>
            <a
              href='https://github.com/itscharukadeshan/map_srilanka_data/tree/main/v1/forest/geo_json'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-500 underline ml-2 font-mono font-bold'>
              Forest
            </a>
          </label>
        </div>

        {loading && (
          <div className='flex justify-center items-center mt-4'>
            <span className='loading loading-bars loading-md'></span>
          </div>
        )}
      </div>

      <div className='flex-1'>
        <MapContainer
          center={[7.8731, 80.7718]}
          zoom={8}
          style={{ height: "100%", width: "100%" }}>
          <LayersControl>
            {Object.values(baseLayerConfig).map(
              ({ url, attribution, key, type }) => (
                <BaseLayer
                  key={key}
                  name={key}
                  checked={key === "OpenStreetMap"}>
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
    </div>
  );
};

export default Map;
