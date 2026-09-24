/** @format */
import { useMemo, useRef, useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import Fuse from "fuse.js";
import { Search, X, MapPin, CornerDownLeft, Square, CheckSquare, Plus } from "lucide-react";
import createResultObject from "../../services/generateRawUrl";
import { useAdministrativeData } from "../../services/administrativeService";
import { useOverlayStore } from "../../store/useOverlayStore";
import { badgeClassFor, labelFor } from "../../utils/badges";
import { entryKey, type AdminEntry } from "../../utils/hierarchy";
import { bulkAddEntries } from "../../utils/bulkAdd";

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
  ignoreLocation: true,
};

function breadcrumb(item: Administrative): string {
  const parts = [item.province_name, item.district_name, item.ds_division_name].filter(
    Boolean
  ) as string[];
  return parts.join(" › ");
}

const SearchComponent = ({ onSelect }: { onSelect?: () => void }) => {
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const boxRef = useRef<HTMLDivElement>(null);
  const { administrativeData, fetchAdministrativeData } = useAdministrativeData();
  const addOverlay = useOverlayStore((s) => s.addOverlay);

  useEffect(() => {
    fetchAdministrativeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const fuse = useMemo(
    () => new Fuse(administrativeData as Administrative[], fuseOptions),
    [administrativeData]
  );

  const suggestions = useMemo<Administrative[]>(() => {
    if (!query.trim()) return [];
    return fuse.search(query.trim()).map((r) => r.item).slice(0, 7);
  }, [fuse, query]);

  const commit = (item: Administrative) => {
    const result = createResultObject(item);
    if (result) addOverlay(result); // store triggers zoom when the GeoJSON lands
    setQuery("");
    setHighlightedIndex(-1);
    setOpen(false);
    onSelect?.();
  };

  const toggleMark = (item: Administrative) => {
    const k = entryKey(item);
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const addMarked = () => {
    if (marked.size === 0) return;
    const byKey = new Map(suggestions.map((s) => [entryKey(s), s]));
    const entries = [...marked]
      .map((k) => byKey.get(k))
      .filter((e): e is Administrative => !!e);
    bulkAddEntries(entries as AdminEntry[]);
    setMarked(new Set());
    setQuery("");
    setOpen(false);
    onSelect?.();
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setHighlightedIndex(-1);
    setOpen(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((p) => Math.min(p + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((p) => Math.max(p - 1, 0));
    } else if (e.key === "Enter") {
      const item = highlightedIndex >= 0 ? suggestions[highlightedIndex] : suggestions[0];
      if (item) commit(item);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder="Search province, district, DS, GN…"
          className="input-light pl-9 pr-9"
          aria-label="Search administrative areas"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setHighlightedIndex(-1); }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 grid place-items-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1.5 overflow-hidden rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg p-1 max-h-80 overflow-y-auto nice-scroll">
          {suggestions.map((item, index) => {
            const k = entryKey(item);
            const isMarked = marked.has(k);
            return (
              <li key={`${item.filename}-${index}`}>
                <div
                  className={`w-full px-1.5 py-1.5 rounded-lg flex items-start gap-1 transition-colors ${
                    highlightedIndex === index ? "bg-slate-100 dark:bg-slate-800" : ""
                  }`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMark(item);
                    }}
                    title="Mark for bulk add"
                    className="mini-btn shrink-0 mt-1">
                    {isMarked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                  <button
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => commit(item)}
                    className="flex-1 min-w-0 flex items-start gap-2 text-left">
                    <span className="mt-0.5 w-7 h-7 shrink-0 grid place-items-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">
                        {item.search_query}
                      </span>
                      {breadcrumb(item) && (
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {breadcrumb(item)}
                        </span>
                      )}
                      <span className={`chip mt-1 ${badgeClassFor(item.type)}`}>
                        {labelFor(item.type)}
                      </span>
                    </span>
                    {highlightedIndex === index && (
                      <CornerDownLeft className="w-3.5 h-3.5 mt-1 text-slate-400 dark:text-slate-500 shrink-0" />
                    )}
                  </button>
                </div>
              </li>
            );
          })}
          {marked.size > 0 && (
            <li className="sticky bottom-0 bg-white dark:bg-slate-950 pt-1">
              <button
                onClick={addMarked}
                className="w-full h-9 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[13px] font-semibold inline-flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> Add {marked.size} marked
              </button>
            </li>
          )}
        </ul>
      )}

      {open && query.trim() && suggestions.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg p-4 text-center">
          <p className="text-[13px] text-slate-600 dark:text-slate-300">No matches for “{query.trim()}”</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Try a district or DS division name</p>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
