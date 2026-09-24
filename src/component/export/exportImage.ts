/** @format */
import * as htmlToImage from "html-to-image";

export interface ExportSettings {
  format: "png" | "jpeg";
  /** pixel ratio multiplier — 2x/3x give true high-resolution output */
  scale: 1 | 2 | 3;
  jpegQuality: number; // 0..1
  title: string;
  includeAttribution: boolean;
  includeLegend: boolean;
  filename: string;
}

export const DEFAULT_EXPORT: ExportSettings = {
  format: "png",
  scale: 2,
  jpegQuality: 0.92,
  title: "",
  includeAttribution: true,
  includeLegend: true,
  filename: "map-srilanka",
};

export interface LegendEntry {
  name: string;
  color: string;
}

function buildDecorations(opts: ExportSettings, legend: LegendEntry[]): HTMLElement[] {
  const nodes: HTMLElement[] = [];

  if (opts.title.trim()) {
    const title = document.createElement("div");
    title.className = "mapsl-export-deco";
    title.textContent = opts.title.trim();
    Object.assign(title.style, {
      position: "absolute",
      top: "16px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "1000",
      background: "rgba(255,255,255,0.95)",
      color: "#0f172a",
      fontSize: "18px",
      fontWeight: "700",
      padding: "8px 20px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      fontFamily: "Inter, system-ui, sans-serif",
      whiteSpace: "nowrap",
      maxWidth: "90%",
      overflow: "hidden",
      textOverflow: "ellipsis",
    });
    nodes.push(title);
  }

  if (opts.includeLegend && legend.length > 0) {
    const box = document.createElement("div");
    box.className = "mapsl-export-deco";
    const rows = legend
      .map(
        (l) =>
          `<div style="display:flex;align-items:center;gap:8px;margin:3px 0;">` +
          `<span style="width:12px;height:12px;border-radius:3px;background:${l.color};border:1px solid rgba(0,0,0,.4);flex:none;"></span>` +
          `<span style="font-size:12px;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;">${escapeHtml(l.name)}</span></div>`
      )
      .join("");
    box.innerHTML = `<div style="font-size:11px;font-weight:700;color:#475569;letter-spacing:.06em;margin-bottom:4px;">LAYERS</div>${rows}`;
    Object.assign(box.style, {
      position: "absolute",
      left: "16px",
      bottom: "36px",
      zIndex: "1000",
      background: "rgba(255,255,255,0.95)",
      padding: "10px 12px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      fontFamily: "Inter, system-ui, sans-serif",
      maxWidth: "280px",
    });
    nodes.push(box);
  }

  if (opts.includeAttribution) {
    const attr = document.createElement("div");
    attr.className = "mapsl-export-deco";
    const date = new Date().toISOString().slice(0, 10);
    attr.textContent = `Map Sri Lanka · © OpenStreetMap contributors · © CARTO · © Esri · Overlays: NSDI Sri Lanka · ${date} · z?`;
    Object.assign(attr.style, {
      position: "absolute",
      right: "12px",
      bottom: "10px",
      zIndex: "1000",
      background: "rgba(255,255,255,0.92)",
      color: "#475569",
      fontSize: "10px",
      padding: "3px 8px",
      borderRadius: "4px",
      fontFamily: "Inter, system-ui, sans-serif",
      maxWidth: "70%",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    });
    nodes.push(attr);
  }

  return nodes;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function estimateExportSize(): { w: number; h: number } {
  const el = document.querySelector(".leaflet-container") as HTMLElement | null;
  return { w: el?.clientWidth ?? 0, h: el?.clientHeight ?? 0 };
}

export async function exportMapImage(
  opts: ExportSettings,
  legend: LegendEntry[]
): Promise<{ dataUrl: string; width: number; height: number }> {
  const mapEl = document.querySelector(".leaflet-container") as HTMLElement | null;
  if (!mapEl) throw new Error("Map is not ready yet.");

  const decos = buildDecorations(opts, legend);
  decos.forEach((d) => mapEl.appendChild(d));

  try {
    await document.fonts?.ready;
    // let tiles settle, especially right after a zoom
    await new Promise((r) => setTimeout(r, 350));

    const common = {
      cacheBust: true,
      pixelRatio: opts.scale,
      // useCORS is property of html-to-image options; keep typed loosely
    } as Parameters<typeof htmlToImage.toPng>[1];

    const name = (opts.filename.trim() || "map-srilanka").replace(/[^\w-]+/g, "-");
    const w = mapEl.clientWidth * opts.scale;
    const h = mapEl.clientHeight * opts.scale;

    if (opts.format === "jpeg") {
      const dataUrl = await htmlToImage.toJpeg(mapEl, {
        ...common,
        quality: opts.jpegQuality,
      });
      download(dataUrl, `${name}@${opts.scale}x.jpg`);
      return { dataUrl, width: w, height: h };
    }
    const dataUrl = await htmlToImage.toPng(mapEl, common);
    download(dataUrl, `${name}@${opts.scale}x.png`);
    return { dataUrl, width: w, height: h };
  } finally {
    decos.forEach((d) => d.remove());
  }
}

function download(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function copyMapToClipboard(
  opts: ExportSettings,
  legend: LegendEntry[]
): Promise<void> {
  const { dataUrl } = await (async () => {
    // reuse capture without double-download: temporarily stub download by capturing directly
    const mapEl = document.querySelector(".leaflet-container") as HTMLElement | null;
    if (!mapEl) throw new Error("Map is not ready yet.");
    const decos = buildDecorations(opts, legend);
    decos.forEach((d) => mapEl.appendChild(d));
    try {
      await document.fonts?.ready;
      await new Promise((r) => setTimeout(r, 350));
      const dataUrl = await htmlToImage.toPng(mapEl, {
        cacheBust: true,
        pixelRatio: opts.scale,
      } as Parameters<typeof htmlToImage.toPng>[1]);
      return { dataUrl };
    } finally {
      decos.forEach((d) => d.remove());
    }
  })();
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
}
