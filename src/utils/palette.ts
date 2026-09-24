import chroma from "chroma-js";

/**
 * Vivid categorical fills (after Trubetskoy's max-contrast set, pastels and
 * near-black/white dropped — fills must pop on light AND dark basemaps).
 * Assignment is farthest-point sampled (see pickDistinctColor), so neighbors
 * in the layer list — and on the map — land far apart perceptually.
 */
export const VIVID_POOL = [
  "#e6194b", // vivid red
  "#f58231", // vivid orange
  "#ffe119", // vivid yellow
  "#3cb44b", // vivid green
  "#46f0f0", // cyan
  "#0082c8", // strong blue
  "#4363d8", // royal blue
  "#911eb4", // purple
  "#f032e6", // magenta
  "#d2f53c", // lime
  "#008080", // teal
  "#e6beff", // lavender
  "#aa6e28", // brown
  "#aaffc3", // mint
];

function labDistance(a: string, b: string): number {
  try {
    return chroma.distance(a, b, "lab");
  } catch {
    return 0;
  }
}

/**
 * Pick the pool color with the largest perceptual distance to its nearest
 * already-used color. First layer always gets vivid red (pops everywhere).
 */
export function pickDistinctColor(used: string[]): string {
  if (used.length === 0) return VIVID_POOL[0];
  let best = VIVID_POOL[0];
  let bestScore = -1;
  for (const c of VIVID_POOL) {
    let nearest = Infinity;
    for (const u of used) {
      const d = labDistance(c, u);
      if (d < nearest) nearest = d;
    }
    if (nearest > bestScore) {
      bestScore = nearest;
      best = c;
    }
  }
  return chroma(best).alpha(1).css();
}
