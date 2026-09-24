/** @format */
import { MapContainer, TileLayer, ScaleControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { findBaseLayer, resolveBaseUrl, DEFAULT_BASE_KEY } from "../../utils/baseLayerConfig";
import { useSettings } from "../../store/settings";
import { useAnnotations } from "../../store/annotations";
import MapOverlays from "./MapOverlays";
import MeasureControl from "./MeasureControl";
import AnnotationsLayer, { AnnotateClickHandler } from "./AnnotationsLayer";
import SyncMapInstance, { MapMetaReporter } from "./SyncMapInstance";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  baseKey: string;
}

const MapView: React.FC<Props> = ({ baseKey }) => {
  const stadiaKey = useSettings((s) => s.stadiaKey);
  const annotateOn = useAnnotations((s) => s.annotateOn);
  let layer = findBaseLayer(baseKey);
  // guard: premium layer without a key can never load — fall back silently
  if (layer.requiresKey === "stadia" && !stadiaKey) {
    layer = findBaseLayer(DEFAULT_BASE_KEY);
  }
  const url = resolveBaseUrl(layer, stadiaKey);

  return (
    <MapContainer
      center={[7.8731, 80.7718]}
      zoom={8}
      zoomControl={false}
      attributionControl={false}
      className={annotateOn ? "mapsl-annotating" : undefined}
      style={{ height: "100%", width: "100%" }}>
      <TileLayer key={layer.key} url={url} attribution={layer.attribution} maxZoom={19} />
      <ScaleControl position="bottomleft" imperial={false} />
      <SyncMapInstance />
      <MapMetaReporter />
      <MapOverlays />
      <MeasureControl />
      <AnnotationsLayer />
      <AnnotateClickHandler />
    </MapContainer>
  );
};

export default MapView;
