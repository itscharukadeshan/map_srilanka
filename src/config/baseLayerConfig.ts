/** @format */

const baseLayerConfig = {
  openStreetMap: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },

  humanitarian: {
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>',
  },

  openTopoMap: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  },
  StadiaSatellite: {
    url: "https://tiles.stadiamaps.com/styles/alidade_satellite.json",
    attribution:
      "copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
  },
  StadiaAlidadeSmoothDark: {
    url: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
  },
  StadiaAlidadeSmooth: {
    url: "https://tiles.stadiamaps.com/styles/alidade_smooth.json",
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
  },

  StadiaStamenToner: {
    url: "https://tiles.stadiamaps.com/styles/stamen_toner.json",
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
  },
  StamenTerrain: {
    url: "https://tiles.stadiamaps.com/styles/stamen_terrain.json",
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
  },
  StamenTerrainBackground: {
    url: "https://tiles.stadiamaps.com/styles/stamen_terrain_background.json",
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
  },

  StamenWatercolor: {
    url: "https://tiles.stadiamaps.com/styles/stamen_watercolor.json",
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
  },
  OSMBright: {
    url: "https://tiles.stadiamaps.com/styles/osm_bright.json",
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors",
  },
};

export default baseLayerConfig;
