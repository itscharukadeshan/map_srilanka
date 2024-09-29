/** @format */
import Fuse from "fuse.js";
import gnd_data from "../data/search/gn_divisions_norm_compact.json";

function Search() {
  const fuse = new Fuse(gnd_data, { keys: ["gnd_name"] });
  const output = fuse.search("sinhapura lunugam");

  console.log(output);

  return <div>Search</div>;
}

export default Search;
