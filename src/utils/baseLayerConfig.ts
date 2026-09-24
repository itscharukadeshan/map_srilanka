/** @format */
// Free XYZ raster tiles need NO api key. Stadia "premium" styles unlock when the
// user pastes their own key in Basemaps → API key (BYOK, stored locally).
// Vector (MapLibre) styles are intentionally not used: html-to-image cannot
// capture WebGL canvases, which produced blank exports.

export type BaseCategory = "Streets" | "Light" | "Dark" | "Satellite" | "Terrain" | "Premium";

export interface BaseLayer {
  url: string;
  attribution: string;
  key: string;
  label: string;
  category: BaseCategory;
  description: string;
  /** real tile thumbnail (z9 over Sri Lanka); {STADIA_KEY} for premium */
  thumb: string;
  /** set for layers that need a user-provided key */
  requiresKey?: "stadia";
}

export const STADIA_KEY_PLACEHOLDER = "{STADIA_KEY}";

const siteAttribution = ` | Overlays: <a href="https://gisapps.nsdi.gov.lk/server/rest/services">NSDI Sri Lanka</a> <a href="https://github.com/itscharukadeshan/map_srilanka_data">| Map Sri Lanka Data</a>`;

// Tile 370/244 @ z9 covers central Sri Lanka (7.87N, 80.77E)
function thumbFor(url: string): string {
  return url
    .replace("{s}", "a")
    .replace("{r}", "")
    .replace("{z}", "9")
    .replace("{x}", "370")
    .replace("{y}", "244");
}

function make(
  key: string,
  label: string,
  category: BaseCategory,
  description: string,
  url: string,
  attribution: string,
  requiresKey?: "stadia"
): BaseLayer {
  return { key, label, category, description, url, attribution, thumb: thumbFor(url), requiresKey };
}

const OSM_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';
const CARTO_ATTR = `${OSM_ATTR} &copy; <a href="https://carto.com/attributions">CARTO</a>`;
const ESRI_ATTR =
  "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";
const STADIA_ATTR = "&copy; <a href=\"https://stadiamaps.com/\" target=\"_blank\" rel=\"noopener noreferrer\">Stadia Maps</a> &copy; <a href=\"https://www.stamen.com/\" target=\"_blank\" rel=\"noopener noreferrer\">Stamen</a> &copy; OpenMapTiles &copy; OpenStreetMap contributors";

const free: BaseLayer[] = [
  make("Carto Light", "Light", "Light", "Clean light streets, best for overlays + export",
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", CARTO_ATTR),
  make("Carto Voyager", "Voyager", "Streets", "Detailed streets with labels",
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", CARTO_ATTR),
  make("OpenStreetMap", "OSM", "Streets", "Classic OSM standard style",
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png", OSM_ATTR),
  make("Humanitarian", "HOT", "Streets", "HOT style, place names + roads",
    "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", OSM_ATTR),
  make("Esri Streets", "Esri Streets", "Streets", "Esri world street map",
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", ESRI_ATTR),
  make("Carto Dark", "Dark", "Dark", "Dark streets for low-light work",
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", CARTO_ATTR),
  make("Esri Dark Gray", "Gray Dark", "Dark", "Muted dark reference map",
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", ESRI_ATTR),
  make("Esri Satellite", "Satellite", "Satellite", "High-res world imagery",
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", ESRI_ATTR),
  make("Esri Topo", "Topo (Esri)", "Terrain", "Topographic reference with relief",
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", ESRI_ATTR),
  make("Open Topo Map", "Topo (OTM)", "Terrain", "Contours + hillshade, great for terrain",
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", OSM_ATTR),
  make("CycloOSM", "Cycle", "Terrain", "Cycle + foot paths, detailed landcover",
    "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png", OSM_ATTR),
  make("Esri Gray", "Gray Light", "Light", "Neutral light reference map",
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", ESRI_ATTR),
];

const premium: BaseLayer[] = [
  make("Stadia Bright", "Bright", "Premium", "Stadia OSM Bright raster — crisp infographic base",
    `https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png?api_key=${STADIA_KEY_PLACEHOLDER}`, STADIA_ATTR, "stadia"),
  make("Stadia Smooth", "Smooth", "Premium", "Minimal light style, ideal under overlays",
    `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${STADIA_KEY_PLACEHOLDER}`, STADIA_ATTR, "stadia"),
  make("Stadia Dark", "Smooth Dark", "Premium", "Minimal dark style for presentations",
    `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${STADIA_KEY_PLACEHOLDER}`, STADIA_ATTR, "stadia"),
  make("Stamen Watercolor", "Watercolor", "Premium", "Artistic watercolor — poster-style visuals",
    `https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}{r}.jpg?api_key=${STADIA_KEY_PLACEHOLDER}`, STADIA_ATTR, "stadia"),
  make("Stamen Toner", "Toner", "Premium", "High-contrast B&W — print diagrams",
    `https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png?api_key=${STADIA_KEY_PLACEHOLDER}`, STADIA_ATTR, "stadia"),
];

const layers: BaseLayer[] = [...free, ...premium];

const baseLayerConfig: Record<string, BaseLayer> = Object.fromEntries(
  layers.map((l) => [l.key.replace(/\s+/g, "_"), l])
);

export const allBaseLayers = layers;
export const freeBaseLayers = free;
export const premiumBaseLayers = premium;
export const baseCategories: BaseCategory[] = ["Streets", "Light", "Dark", "Satellite", "Terrain", "Premium"];

/** Startup basemap — derived from the free list so a key-requiring layer can never become the default. */
export const DEFAULT_BASE_KEY = free.find((l) => l.key === "OpenStreetMap")?.key ?? free[0].key;

export function findBaseLayer(key: string): BaseLayer {
  return layers.find((l) => l.key === key) ?? layers[0];
}

/** Substitute the user's key into premium URLs. Empty key → unusable URL (guarded by UI). */
export function resolveBaseUrl(layer: BaseLayer, stadiaKey: string): string {
  return layer.url.split(STADIA_KEY_PLACEHOLDER).join(stadiaKey);
}

export function resolveThumb(layer: BaseLayer, stadiaKey: string): string {
  return layer.thumb.split(STADIA_KEY_PLACEHOLDER).join(stadiaKey);
}

export default baseLayerConfig;
export { siteAttribution };
