/** @format */

import React, { useEffect, useState } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { LayersControl, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { fetchGeoJSONData } from "../../services/geojsonService";

interface Geometry {
  type: string;
  coordinates: number[][][] | number[][][][];
}

interface Feature {
  type: string;
  properties: Record<string, string>;
  geometry: Geometry;
}

interface FeatureCollection {
  type: "FeatureCollection";
  name?: string;
  crs?: {
    type: string;
    properties: { name: string };
  };
  features: Feature[];
}

interface OverlayLayer {
  url: string;
  color: string;
  opacity: number;
  strokeWidth?: number;
}

interface OverlaysProps {
  layers: { [key: string]: OverlayLayer };
}

const Overlays: React.FC<OverlaysProps> = ({ layers }) => {
  const [geoJSONData, setGeoJSONData] = useState<{
    [key: string]: FeatureCollection;
  }>({});

  const [storedData, setStoredData] = useLocalStorage<{
    [key: string]: FeatureCollection;
  }>("geoJSONData", {});

  useEffect(() => {
    const fetchData = async () => {
      const dataPromises = Object.entries(layers).map(
        async ([name, { url }]) => {
          if (storedData[name]) {
            return { name, data: storedData[name] };
          }

          const data: FeatureCollection = await fetchGeoJSONData(url);

          setStoredData((prev) => ({ ...prev, [name]: data }));
          return { name, data };
        }
      );

      const results = await Promise.all(dataPromises);
      const dataMap = results.reduce((acc, { name, data }) => {
        acc[name] = data;
        return acc;
      }, {} as { [key: string]: FeatureCollection });

      setGeoJSONData(dataMap);
    };

    fetchData();
  }, [layers, storedData, setStoredData]);

  return (
    <>
      {Object.entries(layers).map(([name, { color, opacity, strokeWidth }]) => (
        <LayersControl.Overlay key={name} name={name}>
          {geoJSONData[name] && (
            <GeoJSON
              data={geoJSONData[name]}
              style={{
                color,
                opacity,
                weight: strokeWidth || 1,
              }}
            />
          )}
        </LayersControl.Overlay>
      ))}
    </>
  );
};

export default Overlays;
