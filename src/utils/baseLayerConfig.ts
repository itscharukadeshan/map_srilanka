/** @format */
import STADIA_MAPS_API_KEY from "../config";

interface BaseLayer {
  url: string;
  attribution: string;
  key: string;
  type: "raster" | "glStyle" | "vector";
}

const baseLayerConfig: { [key: string]: BaseLayer } = {
  openStreetMap: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    key: "OpenStreetMap",
    type: "raster",
  },

  humanitarian: {
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    key: "Humanitarian",
    type: "raster",
  },

  openTopoMap: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    key: "OpenTopoMap",
    type: "raster",
  },
  StadiaSatellite: {
    url: `https://tiles.stadiamaps.com/styles/alidade_satellite.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "StadiaSatellite",
    type: "glStyle",
  },
  StadiaAlidadeSmoothDark: {
    url: `https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "StadiaAlidadeSmoothDark",
    type: "glStyle",
  },
  StadiaAlidadeSmooth: {
    url: `https://tiles.stadiamaps.com/styles/alidade_smooth.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "StadiaAlidadeSmooth",
    type: "glStyle",
  },

  StadiaStamenToner: {
    url: `https://tiles.stadiamaps.com/styles/stamen_toner.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "StadiaStamenToner",
    type: "glStyle",
  },
  StamenTerrain: {
    url: `https://tiles.stadiamaps.com/styles/stamen_terrain.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "StamenTerrain",
    type: "glStyle",
  },
  StamenTerrainBackground: {
    url: `https://tiles.stadiamaps.com/styles/stamen_terrain_background.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "StamenTerrainBackground",
    type: "glStyle",
  },

  StamenWatercolor: {
    url: `https://tiles.stadiamaps.com/styles/stamen_watercolor.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "StamenWatercolor",
    type: "glStyle",
  },
  OSMBright: {
    url: `https://tiles.stadiamaps.com/styles/osm_bright.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "OSMBright",
    type: "glStyle",
  },
};

export default baseLayerConfig;
