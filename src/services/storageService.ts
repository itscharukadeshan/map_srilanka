/** @format */

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
}

const getRandomColor = (): string => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const saveSearchResult = (result: SearchResult) => {
  const existingResults = localStorage.getItem("searchResults");
  const resultsArray: SearchResult[] = existingResults
    ? JSON.parse(existingResults)
    : [];

  const extendedResult: SearchResultUpdated = {
    ...result,
    color: getRandomColor(),
    opacity: 0.5,
    stroke: 1,
  };

  resultsArray.push(extendedResult);

  localStorage.setItem("searchResults", JSON.stringify(resultsArray));
};

export const getSearchResults = (): SearchResult[] => {
  const existingResults = localStorage.getItem("searchResults");
  return existingResults ? JSON.parse(existingResults) : [];
};

export const clearSearchResults = () => {
  localStorage.removeItem("searchResults");
};
