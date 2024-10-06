/** @format */

import { useState, ChangeEvent } from "react";
import Fuse from "fuse.js";
import administrativeData from "../../data/search/administrative.json";

// Type for the administrative data objects
interface Administrative {
  filename: string;
  gnd_name?: string;
  type: string;
  ds_division_name?: string;
  province_name?: string;
  district_name?: string;
  search_query: string;
}

// Type for Fuse.js options
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

  return (
    <div className='search-container'>
      <input
        type='text'
        value={query}
        onChange={handleSearch}
        placeholder='Search...'
        className='border p-2 rounded w-full'
      />
      <ul className='suggestions-list mt-2'>
        {suggestions.map((item, index) => (
          <li key={index} className='p-2 border-b'>
            <strong>{item.search_query}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchComponent;
