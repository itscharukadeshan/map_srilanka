/** @format */
import { Plus, Minus, Crosshair, Maximize, Loader2 } from "lucide-react";
import { useState } from "react";
import { getMapInstance } from "../../store/mapInstance";

export function ZoomControls() {
  return (
    <div className="flex flex-col">
      <button className="tool-btn rounded-b-none border-b-0" title="Zoom in" onClick={() => getMapInstance()?.zoomIn()}>
        <Plus className="w-4 h-4" />
      </button>
      <button className="tool-btn rounded-t-none" title="Zoom out" onClick={() => getMapInstance()?.zoomOut()}>
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
}

export function LocateControl() {
  const [busy, setBusy] = useState(false);
  const locate = () => {
    const map = getMapInstance();
    if (!map || !("geolocation" in navigator)) return;
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, { duration: 1 });
        setBusy(false);
      },
      () => setBusy(false),
      { timeout: 8000 }
    );
  };
  return (
    <button className="tool-btn" title="My location" onClick={locate} disabled={busy}>
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
    </button>
  );
}

export function FullscreenControl() {
  const toggle = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };
  return (
    <button className="tool-btn" title="Fullscreen" onClick={toggle}>
      <Maximize className="w-4 h-4" />
    </button>
  );
}
