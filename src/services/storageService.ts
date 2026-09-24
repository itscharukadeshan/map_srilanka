/** @format */
// Legacy compatibility layer. New code should use `useOverlayStore` directly.
// Kept so old localStorage key "searchResults" keeps working and old imports don't break.

import { useOverlayStore } from "../store/useOverlayStore";

export interface SearchResult {
  name: string;
  type: string;
  url: string;
}
export interface SearchResultUpdated {
  name: string;
  type: string;
  url: string;
  color: string;
  opacity: number;
  stroke: number;
  visibility: boolean;
  showLabel: boolean;
}

export const saveSearchResult = (result: SearchResult) => {
  useOverlayStore.getState().addOverlay(result);
};

export const getSearchResults = (): SearchResultUpdated[] => {
  return useOverlayStore.getState().overlays.map((o) => ({
    name: o.name,
    type: o.type,
    url: o.url,
    color: o.color,
    opacity: o.opacity,
    stroke: o.stroke,
    visibility: o.visible,
    showLabel: o.showLabel !== false,
  }));
};

export const clearSearchResults = () => {
  useOverlayStore.getState().clearAll();
};

export const removeSearchResultByName = (name: string) => {
  const target = useOverlayStore.getState().overlays.find((o) => o.name === name);
  if (target) useOverlayStore.getState().removeOverlay(target.id);
};
