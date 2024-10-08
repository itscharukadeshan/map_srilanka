/** @format */

import React, { useEffect, useState } from "react";
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
}

interface OverlaysProps {
  layers: { [key: string]: OverlayLayer };
}

const Overlays: React.FC<OverlaysProps> = ({ layers }) => {
  const [geoJSONData, setGeoJSONData] = useState<{
    [key: string]: FeatureCollection;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      const dataPromises = Object.entries(layers).map(
        async ([name, { url }]) => {
          const data: FeatureCollection = await fetchGeoJSONData(url);
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
  }, [layers]);

  return (
    <>
      {Object.entries(layers).map(([name, { color, opacity }]) => (
        <LayersControl.Overlay key={name} name={name}>
          {geoJSONData[name] && (
            <GeoJSON
              data={geoJSONData[name]}
              style={{
                color,
                opacity,
              }}
            />
          )}
        </LayersControl.Overlay>
      ))}
    </>
  );
};

export default Overlays;
