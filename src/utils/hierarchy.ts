/** Hierarchy helpers: Province → District → DS → GN, built from the search index. */

export interface AdminEntry {
  filename: string;
  gnd_name?: string;
  type: string;
  ds_division_name?: string;
  province_name?: string;
  district_name?: string;
  search_query: string;
  /** data-repo index v1: exact upstream path (URL-encoded, from the v1 root) */
  url?: string;
  /** DS entries: single-file rollup of all its GN divisions */
  combined_url?: string | null;
  bbox?: [number, number, number, number] | null;
}

export interface DsNode {
  name: string;
  entry: AdminEntry | null;
  gns: AdminEntry[];
}

export interface DistrictNode {
  name: string;
  entry: AdminEntry | null;
  ds: DsNode[];
  gnCount: number;
}

export interface ProvinceNode {
  name: string;
  entry: AdminEntry | null;
  districts: DistrictNode[];
  dsCount: number;
  gnCount: number;
}

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

export function entryKey(e: Pick<AdminEntry, "type" | "filename" | "url">): string {
  return `${e.type}|${e.url ?? e.filename}`;
}

export function displayName(e: AdminEntry): string {
  return (
    e.gnd_name ||
    e.ds_division_name ||
    e.district_name ||
    e.province_name ||
    e.search_query
  );
}

export function buildHierarchy(entries: AdminEntry[]): ProvinceNode[] {
  const provinces = new Map<string, { entry: AdminEntry | null; districts: Map<string, { entry: AdminEntry | null; ds: Map<string, { entry: AdminEntry | null; gns: AdminEntry[] }> }> }>();

  for (const e of entries) {
    const p = e.province_name;
    if (!p) continue;
    let prov = provinces.get(p);
    if (!prov) {
      prov = { entry: null, districts: new Map() };
      provinces.set(p, prov);
    }
    if (e.type === "province") {
      prov.entry = e;
      continue;
    }
    const d = e.district_name;
    if (!d) continue;
    let dist = prov.districts.get(d);
    if (!dist) {
      dist = { entry: null, ds: new Map() };
      prov.districts.set(d, dist);
    }
    if (e.type === "district") {
      dist.entry = e;
      continue;
    }
    const dsName = e.ds_division_name;
    if (!dsName) continue;
    let ds = dist.ds.get(dsName);
    if (!ds) {
      ds = { entry: null, gns: [] };
      dist.ds.set(dsName, ds);
    }
    if (e.type === "ds_divisions") ds.entry = e;
    else if (e.type === "gn_divisions") ds.gns.push(e);
  }

  return [...provinces.entries()]
    .map(([name, prov]) => {
      const districts: DistrictNode[] = [...prov.districts.entries()].map(([dname, dist]) => {
        const ds: DsNode[] = [...dist.ds.entries()]
          .map(([dsName, node]) => ({
            name: dsName,
            entry: node.entry,
            gns: [...node.gns].sort((a, b) =>
              (a.gnd_name ?? "").localeCompare(b.gnd_name ?? "")
            ),
          }))
          .sort(byName);
        return {
          name: dname,
          entry: dist.entry,
          ds,
          gnCount: ds.reduce((n, x) => n + x.gns.length, 0),
        };
      }).sort(byName);
      return {
        name,
        entry: prov.entry,
        districts,
        dsCount: districts.reduce((n, d) => n + d.ds.length, 0),
        gnCount: districts.reduce((n, d) => n + d.gnCount, 0),
      };
    })
    .sort(byName);
}
