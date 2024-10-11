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
  const colors = chroma.brewer.Set3;

  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return chroma(randomColor).alpha(opacity).css();
};

export const saveSearchResult = (result: SearchResult) => {
  const existingResults = localStorage.getItem("searchResults");
  const resultsArray: SearchResult[] = existingResults
    ? JSON.parse(existingResults)
    : [];

  console.log(getRandomColor(1));

  const extendedResult: SearchResultUpdated = {
    ...result,
    color: getRandomColor(1),
    opacity: 0.5,
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
