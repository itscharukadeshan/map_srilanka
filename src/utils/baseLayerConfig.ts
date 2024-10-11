/** @format */
import STADIA_MAPS_API_KEY from "../config";

interface BaseLayer {
  url: string;
  attribution: string;
  key: string;
  type: "raster" | "glStyle" | "vector";
}
// var TopPlusOpen_Grey = L.tileLayer(
//   "http://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_grau/default/WEBMERCATOR/{z}/{y}/{x}.png",
//   {
//     maxZoom: 18,
//     attribution:
//       'Map data: &copy; <a href="http://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>',
//   }
// );
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
    key: "Open Topo Map",
    type: "raster",
  },
  TopPlusOpen_Grey: {
    url: "http://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_grau/default/WEBMERCATOR/{z}/{y}/{x}.png",
    attribution:
      'Map data: &copy; <a href="http://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>',
    key: "Top Plus Grey",
    type: "raster",
  },
  Carto_DB_Dark_NoLabels: {
    url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    key: "Carto Dark",
    type: "raster",
  },
  Carto_DB_Voyager_No_Labels: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    key: "Carto Voyager",
    type: "raster",
  },
  OSM_Bright: {
    url: `https://tiles.stadiamaps.com/styles/osm_bright.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "OSM Bright",
    type: "glStyle",
  },
  OSM_France: {
    url: "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    key: "OSM France",
    type: "raster",
  },

  StadiaSatellite: {
    url: `https://tiles.stadiamaps.com/styles/alidade_satellite.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "Stadia Satellite",
    type: "glStyle",
  },
  StadiaAlidadeSmoothDark: {
    url: `https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "Stadia Smooth Dark",
    type: "glStyle",
  },
  StadiaAlidadeSmooth: {
    url: `https://tiles.stadiamaps.com/styles/alidade_smooth.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "Stadia Smooth",
    type: "glStyle",
  },

  StadiaStamenToner: {
    url: `https://tiles.stadiamaps.com/styles/stamen_toner.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "Stadia Toner",
    type: "glStyle",
  },
  StamenTerrain: {
    url: `https://tiles.stadiamaps.com/styles/stamen_terrain.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "Stamen Terrain",
    type: "glStyle",
  },

  StamenWatercolor: {
    url: `https://tiles.stadiamaps.com/styles/stamen_watercolor.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "Stamen Watercolor",
    type: "glStyle",
  },
  StamenTerrainBackground: {
    url: `https://tiles.stadiamaps.com/styles/stamen_terrain_background.json?api_key=${STADIA_MAPS_API_KEY}`,
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
    key: "Stamen Terrain Background",
    type: "glStyle",
  },
};

export default baseLayerConfig;
