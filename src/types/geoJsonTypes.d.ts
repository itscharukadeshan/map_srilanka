/** @format */

// GeoJSON CRS type
interface GeoJSONCrs {
  type: string;
  properties: {
    name: string;
  };
}

interface FeatureProperties {
  fid: number;
  objectid: number;
  ds_division_name: string;
  ds_division_code: string | null;
  district_name: string;
  district_code: string | null;
  province_name: string;
  province_code: string | null;
  adjusted_area: number;
  description: string;
  "st_area(shape)": number;
  "st_length(shape)": number;
}

interface Geometry {
  type: "MultiPolygon";
  coordinates: number[][][];
}

interface GeoJSONFeature {
  type: "Feature";
  properties: FeatureProperties;
  geometry: Geometry;
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  name: string;
  crs: GeoJSONCrs;
  features: GeoJSONFeature[];
}
