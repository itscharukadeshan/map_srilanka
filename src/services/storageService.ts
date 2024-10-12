/** @format */

import chroma from "chroma-js";

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
}

const getRandomColor = (opacity: number = 1): string => {
  const colors = chroma.scale(["#ef8a62", "#67a9cf"]).mode("lch").colors(12);

  const existingResults = localStorage.getItem("searchResults");
  const usedColors: string[] = existingResults
    ? JSON.parse(existingResults).map((res: SearchResultUpdated) =>
        chroma(res.color).hex()
      )
    : [];

  const availableColors = colors.filter(
    (color) => !usedColors.includes(chroma(color).hex())
  );

  if (availableColors.length === 0) {
    usedColors.length = 0;
  }

  const randomColor =
    availableColors[Math.floor(Math.random() * availableColors.length)];

  return chroma(randomColor).alpha(opacity).css();
};

export const saveSearchResult = (result: SearchResult) => {
  const existingResults = localStorage.getItem("searchResults");
  const resultsArray: SearchResult[] = existingResults
    ? JSON.parse(existingResults)
    : [];

  const extendedResult: SearchResultUpdated = {
    ...result,
    color: getRandomColor(1),
    opacity: 0.4,
    stroke: 1,
    visibility: true,
  };

  resultsArray.push(extendedResult);

  localStorage.setItem("searchResults", JSON.stringify(resultsArray));
};

export const getSearchResults = (): SearchResultUpdated[] => {
  const existingResults = localStorage.getItem("searchResults");
  return existingResults ? JSON.parse(existingResults) : [];
};

export const clearSearchResults = () => {
  localStorage.removeItem("searchResults");
  window.location.reload();
};

export const removeSearchResultByName = (name: string) => {
  const existingResults = localStorage.getItem("searchResults");
  const resultsArray: SearchResultUpdated[] = existingResults
    ? JSON.parse(existingResults)
    : [];

  const updatedResults = resultsArray.filter((result) => result.name !== name);

  localStorage.setItem("searchResults", JSON.stringify(updatedResults));
};
