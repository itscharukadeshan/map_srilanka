/** @format */

import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import Fuse from "fuse.js";
import { SearchX } from "lucide-react";
import createResultObject from "../../services/generateRawUrl";
import { useAdministrativeData } from "../../services/administrativeService";
import { saveSearchResult } from "../../services/storageService";

interface Administrative {
  filename: string;
  gnd_name?: string;
  type: string;
  ds_division_name?: string;
  province_name?: string;
  district_name?: string;
  search_query: string;
}

const fuseOptions = {
  keys: ["search_query"],
  threshold: 0.3,
};

const SearchComponent = () => {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Administrative[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const { administrativeData, fetchAdministrativeData } =
    useAdministrativeData();

  useEffect(() => {
    fetchAdministrativeData();
  }, [fetchAdministrativeData]);

  const fuse = new Fuse(administrativeData as Administrative[], fuseOptions);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setQuery(searchTerm);

    if (searchTerm) {
      const result = fuse.search(searchTerm);
      const filteredSuggestions = result.map((res) => res.item).slice(0, 5);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0) {
        const selectedItem = suggestions[highlightedIndex];
        if (selectedItem) {
          const result = createResultObject(selectedItem);
          if (result) {
            saveSearchResult(result);
          }
        }
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  const clearInput = () => {
    setQuery("");
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  let label = "badge badge-outline";

  const getLabel = (type: string) => {
    switch (type) {
      case "province":
        label = "badge badge-primary badge-outline";
        return "Province";
      case "district":
        label = "badge badge-secondary badge-outline";
        return "District";
      case "ds_divisions":
        label = "badge badge-accent badge-outline";
        return "DS Division";
      case "gn_divisions":
        label = "badge badge-warning badge-outline";
        return "GN Division";
      default:
        return "Unknown Type";
    }
  };

  return (
    <div className='search-container w-56 p-2'>
      <div className='flex'>
        <input
          type='text'
          value={query}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          placeholder='Search...'
          className='border p-2 rounded w-full'
          aria-label='Search Input'
        />
        <button
          onClick={clearInput}
          aria-label='Clear Search Input'
          className='btn btn-warning mx-2 '>
          <SearchX />
        </button>
      </div>
      <ul className='suggestions-list mt-2 p-2'>
        {suggestions.map((item, index) => (
          <li
            key={index}
            className={`py-2 cursor-pointer ${
              highlightedIndex === index ? "bg-slate-600 bg-opacity-50" : ""
            }`}
            onMouseEnter={() => setHighlightedIndex(index)}
            onClick={() => {
              const result = createResultObject(item);
              if (result) {
                saveSearchResult(result);
                window.location.reload();
              }
            }}>
            <strong>{item.search_query}</strong> <br />
            <span className={label}>{getLabel(item.type)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchComponent;
