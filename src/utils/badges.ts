/** @format */
export function badgeClassFor(type: string): string {
  switch (type) {
    case "province":
      return "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30";
    case "district":
      return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30";
    case "ds_divisions":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30";
    case "gn_divisions":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30";
  }
}

export function labelFor(type: string): string {
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
      return type;
  }
}
