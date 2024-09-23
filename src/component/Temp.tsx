/** @format */

import { GeoJSON } from "react-leaflet";
import central from "../data/PROV_BOUN_GEOJSON/PROV_CENTRAL_1.geojsons.json";

type CustomGeoJSONFeature = {
  type: "Feature";
  properties: {
    fid: number;
    objectid: number;
    province_name: string;
    province_code: string | null;
    iso_alpha_2_code: string | null;
    area_true: number | null;
    area_adjust: number;
    description: string;
    "st_area(shape)": number;
    "st_length(shape)": number;
    PROV: string;
  };
  geometry: {
    type: "MultiPolygon";
    coordinates: number[][][];
  };
};

const central_type: CustomGeoJSONFeature = central;

export default function MapComponent() {
  return <GeoJSON data={central_type} />;
}
