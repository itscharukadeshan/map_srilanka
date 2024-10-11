/** @format */

import { useState, ChangeEvent } from "react";
import Fuse from "fuse.js";
import administrativeData from "../../data/search/administrative_update.json";
import createResultObject from "../../services/generateRawUrl";

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

  const getLabel = (type: string) => {
    switch (type) {
      case "province":
        return "Province";
      case "district":
        return "District";
      case "ds_divisions":
        return "DS Division";
      case "gn_divisions":
        return "GN Division";
      default:
        return "Unknown Type";
    }
  };

  return (
    <div className='search-container w-56'>
      <input
        type='text'
        value={query}
        onChange={handleSearch}
        placeholder='Search...'
        className='border p-2 rounded w-full'
      />
      <ul className='suggestions-list mt-2'>
        {suggestions.map((item, index) => (
          <li
            key={index}
            className='p-2 border-b cursor-pointer'
            onClick={() => {
              const result = createResultObject(item);
              if (result) {
                console.log(result);
              }
            }}>
            <strong>{item.search_query}</strong> <br />
            <span className='text-sm text-gray-600'>{getLabel(item.type)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchComponent;
