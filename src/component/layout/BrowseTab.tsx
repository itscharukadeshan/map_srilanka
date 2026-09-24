/** @format */
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Layers,
  MapPin,
  AlertTriangle,
  Square,
  CheckSquare,
  MinusSquare,
} from "lucide-react";
import { useAdministrativeData, getIndexFromCache } from "../../services/administrativeService";
import { useOverlayStore } from "../../store/useOverlayStore";
import createResultObject from "../../services/generateRawUrl";
import { gnFolderStatus, loadCoverage } from "../../data/gnCoverage";
import {
  buildHierarchy,
  entryKey,
  type AdminEntry,
  type DistrictNode,
  type DsNode,
  type ProvinceNode,
} from "../../utils/hierarchy";
import { bulkAddEntries, bulkAddDs } from "../../utils/bulkAdd";
import { badgeClassFor, labelFor } from "../../utils/badges";
import BatchProgress from "../map/BatchProgress";

interface Nav {
  prov?: string;
  dist?: string;
  ds?: string;
}

export default function BrowseTab() {
  const { administrativeData, fetchAdministrativeData } = useAdministrativeData();
  const [nav, setNav] = useState<Nav>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cachedIndex, setCachedIndex] = useState<AdminEntry[] | null>(null);
  const addOverlay = useOverlayStore((s) => s.addOverlay);
  const overlays = useOverlayStore((s) => s.overlays);
  const onMap = useMemo(() => new Set(overlays.map((o) => o.id)), [overlays]);

  useEffect(() => {
    fetchAdministrativeData();
    // coverage truth lives in the data repo; defaults assume full coverage
    loadCoverage();
    // localStorage quota can reject the index — fall back to Cache Storage copy
    if (administrativeData.length === 0) {
      getIndexFromCache().then((d) => {
        if (d && d.length > 0) setCachedIndex(d as AdminEntry[]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tree = useMemo(
    () =>
      buildHierarchy(
        (administrativeData.length > 0 ? administrativeData : cachedIndex ?? []) as AdminEntry[]
      ),
    [administrativeData, cachedIndex]
  );

  const prov: ProvinceNode | undefined = nav.prov
    ? tree.find((p) => p.name === nav.prov)
    : undefined;
  const dist: DistrictNode | undefined =
    prov && nav.dist ? prov.districts.find((d) => d.name === nav.dist) : undefined;
  const ds: DsNode | undefined =
    dist && nav.ds ? dist.ds.find((x) => x.name === nav.ds) : undefined;

  const toggleKeys = (keys: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const all = keys.every((k) => next.has(k));
      if (all) keys.forEach((k) => next.delete(k));
      else keys.forEach((k) => next.add(k));
      return next;
    });
  };

  const addSelected = () => {
    if (selected.size === 0) return;
    const byKey = new Map<string, AdminEntry>();
    for (const p of tree)
      for (const d of p.districts) {
        if (d.entry) byKey.set(entryKey(d.entry), d.entry);
        for (const x of d.ds) {
          if (x.entry) byKey.set(entryKey(x.entry), x.entry);
          for (const g of x.gns) byKey.set(entryKey(g), g);
        }
      }
    const entries = [...selected].map((k) => byKey.get(k)).filter((e): e is AdminEntry => !!e);
    bulkAddEntries(entries);
    setSelected(new Set());
  };

  const crumbs: { label: string; go: () => void }[] = [
    { label: "Sri Lanka", go: () => setNav({}) },
  ];
  if (prov) crumbs.push({ label: cap(prov.name), go: () => setNav({ prov: prov.name }) });
  if (dist) crumbs.push({ label: cap(dist.name), go: () => setNav({ prov: prov!.name, dist: dist.name }) });
  if (ds) crumbs.push({ label: cap(ds.name), go: () => {} });

  return (
    <div className="p-3 space-y-2">
      <BatchProgress />

      {/* breadcrumb */}
      <nav className="flex items-center gap-1 text-[12px] flex-wrap">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />}
            <button
              onClick={c.go}
              className={
                i === crumbs.length - 1
                  ? "font-semibold text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }>
              {c.label}
            </button>
          </span>
        ))}
      </nav>

      {!prov && (
        <LevelList
          rows={tree.map((p) => ({
            key: p.name,
            title: cap(p.name),
            meta: `${p.districts.length} districts · ${p.dsCount} DS · ${p.gnCount.toLocaleString()} GN`,
            entry: p.entry,
          }))}
          onOpen={(name) => setNav({ prov: name })}
          onAddBoundary={(e) => {
            const r = createResultObject(e);
            if (r) addOverlay(r);
          }}
        />
      )}

      {prov && !dist && (
        <LevelList
          rows={prov.districts.map((d) => ({
            key: d.name,
            title: cap(d.name),
            meta: `${d.ds.length} DS divisions · ${d.gnCount.toLocaleString()} GN`,
            entry: d.entry,
          }))}
          onOpen={(name) => setNav({ prov: prov.name, dist: name })}
          onAddBoundary={(e) => {
            const r = createResultObject(e);
            if (r) addOverlay(r);
          }}
        />
      )}

      {prov && dist && !ds && (
        <DsLevel
          prov={prov.name}
          dist={dist}
          selected={selected}
          onToggleDs={(node) => toggleKeys(node.gns.map(entryKey))}
          onOpen={(name) => setNav({ prov: prov.name, dist: dist.name, ds: name })}
          onMap={onMap}
        />
      )}

      {prov && dist && ds && (
        <GnLevel
          prov={prov.name}
          dist={dist.name}
          ds={ds}
          selected={selected}
          onToggle={(keys) => toggleKeys(keys)}
          onBack={() => setNav({ prov: prov.name, dist: dist.name })}
        />
      )}

      {selected.size > 0 && (
        <div className="sticky bottom-0 pt-1">
          <div className="rounded-xl border border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-2 flex items-center gap-2 shadow-lg">
            <span className="text-[12px] font-semibold pl-1">{selected.size} marked</span>
            <button
              onClick={addSelected}
              className="ml-auto h-8 px-3 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[13px] font-semibold inline-flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add to map
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="h-8 px-2.5 rounded-lg text-[13px] opacity-80 hover:opacity-100">
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function cap(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ---------- province / district level ---------- */

function LevelList({
  rows,
  onOpen,
  onAddBoundary,
}: {
  rows: { key: string; title: string; meta: string; entry: AdminEntry | null }[];
  onOpen: (key: string) => void;
  onAddBoundary: (e: AdminEntry) => void;
}) {
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div
          key={r.key}
          className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-1.5 pl-2.5">
          <button onClick={() => onOpen(r.key)} className="flex-1 min-w-0 text-left">
            <span className="block text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">
              {r.title}
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">{r.meta}</span>
          </button>
          {r.entry && (
            <button
              onClick={() => onAddBoundary(r.entry!)}
              title={`Add ${r.title} boundary`}
              className="mini-btn shrink-0">
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onOpen(r.key)} className="mini-btn shrink-0" title="Open">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------- DS level ---------- */

function DsLevel({
  prov,
  dist,
  selected,
  onToggleDs,
  onOpen,
  onMap,
}: {
  prov: string;
  dist: DistrictNode;
  selected: Set<string>;
  onToggleDs: (node: DsNode) => void;
  onOpen: (name: string) => void;
  onMap: Set<string>;
}) {
  const addOverlay = useOverlayStore((s) => s.addOverlay);

  const addAllBoundaries = () => {
    const entries = dist.ds.map((x) => x.entry).filter((e): e is AdminEntry => !!e);
    bulkAddEntries(entries);
  };

  return (
    <div className="space-y-1.5">
      <button
        onClick={addAllBoundaries}
        className="w-full rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-2 text-[12px] font-medium text-slate-600 dark:text-slate-300 hover:border-slate-500 inline-flex items-center justify-center gap-1.5">
        <Layers className="w-3.5 h-3.5" /> Add all {dist.ds.length} DS boundaries
      </button>

      {dist.ds.map((x) => {
        const keys = x.gns.map(entryKey);
        const selCount = keys.filter((k) => selected.has(k)).length;
        const coverage = gnFolderStatus(prov, dist.name, x.name);
        const loadedCount = keys.filter((k) => {
          const e = x.gns.find((g) => entryKey(g) === k);
          if (!e) return false;
          const r = createResultObject(e);
          return r ? onMap.has(r.url) : false;
        }).length;
        return (
          <div
            key={x.name}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-1.5 pl-2.5">
            <div className="flex items-center gap-1">
              <button
                onClick={() => coverage === "ok" && onToggleDs(x)}
                disabled={coverage !== "ok"}
                title={coverage === "ok" ? "Mark all GNDs" : "No GN files upstream"}
                className="mini-btn shrink-0 disabled:opacity-30">
                {selCount === 0 ? (
                  <Square className="w-4 h-4" />
                ) : selCount === keys.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <MinusSquare className="w-4 h-4" />
                )}
              </button>
              <button onClick={() => onOpen(x.name)} className="flex-1 min-w-0 text-left">
                <span className="block text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">
                  {cap(x.name)}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {x.gns.length} GND
                  {loadedCount > 0 && <span>· {loadedCount} on map</span>}
                  {coverage === "missing" && (
                    <span className="inline-flex items-center gap-0.5 text-amber-700 dark:text-amber-400 font-medium">
                      <AlertTriangle className="w-3 h-3" /> no GN files
                    </span>
                  )}
                </span>
              </button>
              {x.entry && (
                <button
                  onClick={() => {
                    const r = createResultObject(x.entry!);
                    if (r) addOverlay(r);
                  }}
                  title="Add DS boundary"
                  className="mini-btn shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => {
                  if (coverage !== "ok") return;
                  // one combined download, split locally; falls back to per-file
                  if (x.entry) void bulkAddDs(x.entry, x.gns);
                  else bulkAddEntries(x.gns);
                }}
                disabled={coverage !== "ok"}
                title={coverage === "ok" ? `Load all ${x.gns.length} GNDs` : "No GN files upstream"}
                className="h-7 px-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[12px] font-semibold shrink-0 disabled:opacity-30">
                Load {x.gns.length}
              </button>
              <button onClick={() => onOpen(x.name)} className="mini-btn shrink-0" title="Open GNDs">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- GN level ---------- */

function GnLevel({
  prov,
  dist,
  ds,
  selected,
  onToggle,
  onBack,
}: {
  prov: string;
  dist: string;
  ds: DsNode;
  selected: Set<string>;
  onToggle: (keys: string[]) => void;
  onBack: () => void;
}) {
  const addOverlay = useOverlayStore((s) => s.addOverlay);
  const coverage = gnFolderStatus(prov, dist, ds.name);
  const keys = ds.gns.map(entryKey);
  const selCount = keys.filter((k) => selected.has(k)).length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <button onClick={onBack} className="mini-btn" title="Back to DS list">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[12px] text-slate-500 dark:text-slate-400">
          {ds.gns.length} GNDs in {cap(ds.name)}
        </span>
        <button
          onClick={() => onToggle(keys)}
          className="ml-auto text-[12px] font-medium text-slate-600 dark:text-slate-300 hover:underline">
          {selCount === keys.length ? "Unmark all" : "Mark all"}
        </button>
        <button
          onClick={() => {
            if (ds.entry) void bulkAddDs(ds.entry, ds.gns);
            else bulkAddEntries(ds.gns);
          }}
          disabled={coverage !== "ok"}
          className="h-7 px-2.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[12px] font-semibold disabled:opacity-30 inline-flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Load all
        </button>
      </div>

      {coverage === "missing" && (
        <p className="flex items-start gap-1.5 text-[12px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl px-2.5 py-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          No GN files for this division in the upstream data repo. The DS boundary itself can
          still be added from the DS list.
        </p>
      )}

      {ds.gns.map((g) => {
        const k = entryKey(g);
        const isSel = selected.has(k);
        return (
          <div
            key={k}
            className={`flex items-center gap-1 rounded-xl border p-1.5 pl-2 ${
              isSel
                ? "border-slate-900 dark:border-slate-100 bg-slate-900/[0.04] dark:bg-slate-100/[0.06]"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            }`}>
            <button onClick={() => onToggle([k])} className="mini-btn shrink-0" title="Mark">
              {isSel ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                const r = createResultObject(g);
                if (r) addOverlay(r);
              }}
              className="flex-1 min-w-0 text-left">
              <span className="block text-[13px] text-slate-900 dark:text-slate-100 truncate">
                {g.gnd_name}
              </span>
              <span className={`chip mt-0.5 ${badgeClassFor(g.type)}`}>{labelFor(g.type)}</span>
            </button>
            <button
              onClick={() => {
                const r = createResultObject(g);
                if (r) addOverlay(r);
              }}
              className="mini-btn shrink-0"
              title="Add to map">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
