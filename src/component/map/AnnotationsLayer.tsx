/** @format */
import { useMemo } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Trash2 } from "lucide-react";
import { ANNOTATION_COLORS, useAnnotations, type Annotation } from "../../store/annotations";

function badgeIcon(a: Annotation): L.DivIcon {
  const long = a.text.length > 3;
  return L.divIcon({
    className: "mapsl-badge-wrap",
    html: `<div class="mapsl-badge${long ? " mapsl-badge-pill" : ""}" style="background:${a.color}">${escapeHtml(a.text)}</div>`,
    iconSize: undefined,
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** In badge-drop mode, map clicks place a new numbered badge. */
export function AnnotateClickHandler() {
  const annotateOn = useAnnotations((s) => s.annotateOn);
  const addAnnotation = useAnnotations((s) => s.addAnnotation);
  useMapEvents({
    click(e) {
      if (!useAnnotations.getState().annotateOn) return;
      addAnnotation(e.latlng.lat, e.latlng.lng);
    },
  });
  void annotateOn;
  return null;
}

export default function AnnotationsLayer() {
  const annotations = useAnnotations((s) => s.annotations);
  const moveAnnotation = useAnnotations((s) => s.moveAnnotation);

  const items = useMemo(() => annotations, [annotations]);

  return (
    <>
      {items.map((a) => (
        <Marker
          key={a.id}
          position={[a.lat, a.lng]}
          icon={badgeIcon(a)}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const m = e.target as L.Marker;
              const p = m.getLatLng();
              moveAnnotation(a.id, p.lat, p.lng);
            },
          }}>
          <Popup closeButton={false} className="mapsl-badge-popup">
            <BadgeEditor id={a.id} />
          </Popup>
        </Marker>
      ))}
    </>
  );
}

function BadgeEditor({ id }: { id: string }) {
  const ann = useAnnotations((s) => s.annotations.find((a) => a.id === id));
  const update = useAnnotations((s) => s.updateAnnotation);
  const remove = useAnnotations((s) => s.removeAnnotation);
  if (!ann) return null;
  return (
    <div className="w-44">
      <input
        value={ann.text}
        maxLength={12}
        onChange={(e) => update(id, { text: e.target.value })}
        placeholder="Label"
        className="w-full border border-slate-300 rounded-md px-2 py-1 text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
      />
      <div className="flex flex-wrap gap-1 mt-2">
        {ANNOTATION_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => update(id, { color: c })}
            title={c}
            className={`w-5 h-5 rounded-full border ${ann.color === c ? "border-slate-900 ring-2 ring-slate-900/20" : "border-black/20"}`}
            style={{ background: c }}
          />
        ))}
      </div>
      <button
        onClick={() => remove(id)}
        className="mt-2 w-full inline-flex items-center justify-center gap-1 text-[12px] font-medium text-red-600 hover:bg-red-50 rounded-md px-2 py-1.5">
        <Trash2 className="w-3.5 h-3.5" /> Delete badge
      </button>
      <p className="mt-1 text-[10px] text-slate-400">Drag the badge to reposition it.</p>
    </div>
  );
}
