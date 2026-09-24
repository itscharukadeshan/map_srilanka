import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Annotation {
  id: string;
  lat: number;
  lng: number;
  text: string;
  color: string;
}

export const ANNOTATION_COLORS = [
  "#dc2626",
  "#ea580c",
  "#d97706",
  "#16a34a",
  "#0d9488",
  "#0284c7",
  "#4f46e5",
  "#9333ea",
  "#db2777",
  "#0f172a",
];

interface AnnotationState {
  annotations: Annotation[];
  /** badge-drop mode: map clicks place a new numbered badge */
  annotateOn: boolean;
  addAnnotation: (lat: number, lng: number) => string;
  updateAnnotation: (id: string, patch: Partial<Annotation>) => void;
  moveAnnotation: (id: string, lat: number, lng: number) => void;
  removeAnnotation: (id: string) => void;
  clearAnnotations: () => void;
  setAnnotateOn: (v: boolean) => void;
}

let seq = 0;
const nid = () => `ann-${Date.now().toString(36)}-${seq++}`;

export const useAnnotations = create<AnnotationState>()(
  persist(
    (set, get) => ({
      annotations: [],
      annotateOn: false,

      addAnnotation: (lat, lng) => {
        const used = new Set(
          get()
            .annotations.map((a) => Number(a.text))
            .filter((n) => Number.isInteger(n) && n > 0)
        );
        let n = get().annotations.length + 1;
        while (used.has(n)) n++;
        const item: Annotation = {
          id: nid(),
          lat,
          lng,
          text: String(n),
          color: ANNOTATION_COLORS[(n - 1) % ANNOTATION_COLORS.length],
        };
        set({ annotations: [...get().annotations, item] });
        return item.id;
      },

      updateAnnotation: (id, patch) =>
        set({ annotations: get().annotations.map((a) => (a.id === id ? { ...a, ...patch } : a)) }),

      moveAnnotation: (id, lat, lng) =>
        set({ annotations: get().annotations.map((a) => (a.id === id ? { ...a, lat, lng } : a)) }),

      removeAnnotation: (id) =>
        set({ annotations: get().annotations.filter((a) => a.id !== id) }),

      clearAnnotations: () => set({ annotations: [] }),

      setAnnotateOn: (annotateOn) => set({ annotateOn }),
    }),
    {
      name: "mapsl-annotations-v1",
      partialize: (s) => ({ annotations: s.annotations }) as AnnotationState,
    }
  )
);
