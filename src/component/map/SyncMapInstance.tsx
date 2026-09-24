/** @format */
import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { setMapInstance } from "../../store/mapInstance";
import { useMapMeta } from "../../store/mapMeta";

export function SyncMapInstance() {
  const map = useMap();
  useEffect(() => {
    setMapInstance(map);
    return () => setMapInstance(null);
  }, [map]);
  return null;
}

/** Pushes center/zoom into useMapMeta on move — feeds the status bar. */
export function MapMetaReporter() {
  const setMeta = useMapMeta((s) => s.setMeta);
  useMapEvents({
    moveend: (e) => {
      const m = e.target;
      const c = m.getCenter();
      setMeta(c.lat, c.lng, m.getZoom());
    },
    zoomend: (e) => {
      const m = e.target;
      const c = m.getCenter();
      setMeta(c.lat, c.lng, m.getZoom());
    },
  });
  return null;
}

export default SyncMapInstance;
