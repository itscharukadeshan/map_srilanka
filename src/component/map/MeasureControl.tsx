/** @format */
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { useMeasurements } from "../../store/measurements";
import { registerMeasureGroup } from "./measureRegistry";

const DRAW_STYLE = { color: "#0284c7", weight: 2.5, opacity: 1, fillOpacity: 0.15 };

function readableLength(map: L.Map, layer: L.Polyline): string {
  const latlngs = layer.getLatLngs() as L.LatLng[];
  let m = 0;
  for (let i = 1; i < latlngs.length; i++) m += map.distance(latlngs[i - 1], latlngs[i]);
  return L.GeometryUtil.readableDistance(m, true, false, false, { m: 1, km: 1 });
}

function readableShapeArea(layer: L.Polygon): string {
  const rings = layer.getLatLngs() as L.LatLng[][];
  const flat = Array.isArray(rings[0]) ? rings[0] : (rings as unknown as L.LatLng[]);
  return L.GeometryUtil.readableArea(L.GeometryUtil.geodesicArea(flat), true, { m: 1, ha: 1 });
}

/** Permanent infographic label: length for lines, area for shapes. */
function bindMeasureLabel(map: L.Map, layer: L.Layer) {
  let text: string | null = null;
  if (layer instanceof L.Polygon) text = readableShapeArea(layer);
  else if (layer instanceof L.Polyline) text = readableLength(map, layer);
  if (!text) return;
  layer.bindTooltip(text, {
    permanent: true,
    direction: "center",
    className: "mapsl-measure-label",
    interactive: false,
  });
}

/**
 * Leaflet-draw toolbar (distance + area) with persisted layers.
 * Drawn shapes live inside .leaflet-container so exports capture them.
 */
export default function MeasureControl() {
  const map = useMap();

  useEffect(() => {
    const drawn = new L.FeatureGroup();
    map.addLayer(drawn);
    registerMeasureGroup(drawn);

    // restore persisted measurements
    try {
      const saved = useMeasurements.getState().geojson;
      if (saved) {
        L.geoJSON(saved as GeoJSON.GeoJsonObject, {
          style: () => DRAW_STYLE,
          onEachFeature: (_f, l) => {
            bindMeasureLabel(map, l);
            drawn.addLayer(l);
          },
        });
      }
    } catch {
      /* corrupted cache — start empty */
    }

    const save = () => {
      const gj = drawn.toGeoJSON() as unknown as GeoJSON.GeoJsonObject;
      useMeasurements
        .getState()
        .setGeojson((gj as { features?: unknown[] }).features?.length ? gj : null);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const drawControl = new (L.Control as any).Draw({
      position: "topleft",
      draw: {
        polyline: {
          shapeOptions: DRAW_STYLE,
          showLength: true,
          metric: true,
          feet: false,
        },
        polygon: {
          shapeOptions: DRAW_STYLE,
          showArea: true,
          metric: true,
        },
        rectangle: {
          shapeOptions: DRAW_STYLE,
          showArea: true,
          metric: true,
        },
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: { featureGroup: drawn, remove: true },
    });
    map.addControl(drawControl);

    const onCreated = (e: L.LeafletEvent) => {
      const layer = (e as unknown as { layer: L.Layer }).layer;
      bindMeasureLabel(map, layer);
      drawn.addLayer(layer);
      save();
    };
    const onEditedOrDeleted = (e: L.LeafletEvent) => {
      const layers = (e as unknown as { layers: L.LayerGroup }).layers;
      layers.eachLayer((l) => {
        l.unbindTooltip();
        bindMeasureLabel(map, l);
      });
      save();
    };

    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.EDITED, onEditedOrDeleted);
    map.on(L.Draw.Event.DELETED, save);

    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.EDITED, onEditedOrDeleted);
      map.off(L.Draw.Event.DELETED, save);
      map.removeControl(drawControl);
      map.removeLayer(drawn);
      registerMeasureGroup(null);
    };
  }, [map]);

  return null;
}
