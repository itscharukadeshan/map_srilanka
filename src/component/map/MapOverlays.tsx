/** @format */

import React, { useEffect, useState } from "react";
import { LayersControl, LayerGroup, GeoJSON, useMap } from "react-leaflet";
import axios from "axios";
import { getSearchResults } from "../../services/storageService";
import { GeoJSONFeatureCollection } from "../../types/geoJsonTypes";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const { Overlay } = LayersControl;

interface SearchResultUpdated {
  name: string;
  type: string;
  url: string;
  color: string;
  opacity: number;
  stroke: number;
  visibility: boolean;
}

const MapOverlays: React.FC = () => {
  const [overlays, setOverlays] = useState<SearchResultUpdated[]>([]);
  const [geoJsonData, setGeoJsonData] = useState<{
    [key: string]: GeoJSONFeatureCollection;
  }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<{ [key: string]: boolean }>({});

  const map = useMap();

  useEffect(() => {
    const results = getSearchResults();
    setOverlays(results);
  }, []);

  useEffect(() => {
    overlays.forEach((result) => {
      if (!geoJsonData[result.name]) {
        setLoading((prev) => ({ ...prev, [result.name]: true }));

        axios
          .get(result.url)
          .then((response) => {
            setGeoJsonData((prev) => ({
              ...prev,
              [result.name]: response.data,
            }));
            setLoading((prev) => ({ ...prev, [result.name]: false }));

            if (response.data.features.length > 0) {
              const bounds: L.LatLngExpression[] =
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                response.data.features.flatMap((feature: any) => {
                  if (feature.geometry.type === "MultiPolygon") {
                    return feature.geometry.coordinates.flatMap(
                      (polygon: number[][][]) => {
                        return polygon
                          .map((ring: number[][]) => {
                            return ring.map((coord: number[]) => [
                              coord[1],
                              coord[0],
                            ]);
                          })
                          .flat();
                      }
                    );
                  } else if (feature.geometry.type === "Polygon") {
                    return feature.geometry.coordinates.flatMap(
                      (ring: number[][]) => {
                        return ring.map((coord: number[]) => [
                          coord[1],
                          coord[0],
                        ]);
                      }
                    );
                  }
                  return [];
                });

              const latLngBounds = L.latLngBounds(bounds);
              map.fitBounds(latLngBounds);
            }
          })
          .catch((error) => {
            console.error(`Failed to load GeoJSON for ${result.name}:`, error);
            setError((prev) => ({ ...prev, [result.name]: true }));
            setLoading((prev) => ({ ...prev, [result.name]: false }));
          });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlays]);

  return (
    <>
      {overlays.map((result, index) => (
        <Overlay key={index} name={result.name} checked={result.visibility}>
          <LayerGroup>
            {loading[result.name] ? (
              <p>Loading {result.name}...</p>
            ) : error[result.name] ? (
              <p>Error loading {result.name}</p>
            ) : (
              geoJsonData[result.name] && (
                <GeoJSON
                  data={geoJsonData[result.name]}
                  style={{
                    color: result.color,
                    weight: result.stroke,
                    fillOpacity: result.opacity,
                  }}
                />
              )
            )}
          </LayerGroup>
        </Overlay>
      ))}
    </>
  );
};

export default MapOverlays;
