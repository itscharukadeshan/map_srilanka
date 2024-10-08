/** @format */

import axios from "axios";

export const fetchGeoJSONData = async (url: string) => {
  try {
    const response = await axios.get(url);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error loading GeoJSON data:", error);
    return null;
  }
};
