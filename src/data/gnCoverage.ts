/**
 * GN-file coverage of the upstream data repo (scanned 2026-09-24).
 * 5 whole districts + 38 DS folders have no GN division files at all —
 * the Browse tab uses this to mark them instead of failing silently.
 * DS/division names match the search-index spelling verbatim.
 */

/** [province, district] pairs with no gn_division folder whatsoever */
export const GN_MISSING_DISTRICTS: Array<[string, string]> = [
  ["central", "nuwara eliya"],
  ["north central", "anuradhapura"],
  ["north central", "polonnaruwa"],
  ["north western", "kurunegala"],
  ["north western", "puttalam"],
];

/** `${province}|${district}` -> DS names with no gn_division folder */
export const GN_MISSING_DS: Record<string, string[]> = {
  "central|kandy": ["ganga ihala korale", "gangawata korale"],
  "eastern|batticaloa": [
    "eravur pattu",
    "eravur town",
    "koralai pattu",
    "koralai pattu central",
    "koralai pattu north",
    "koralai pattu south",
    "koralai pattu west",
    "manmunai north",
    "manmunai pattu",
    "manmunai south & eruvil pattu",
    "manmunai south west",
    "manmunai west",
    "porativu pattu",
    "water area",
  ],
  "eastern|trincomalee": ["padavi sri pura", "town & gravets"],
  "northern|jaffna": [
    "islands north(kayts)",
    "islands south(velanai)",
    "vadamaradchchi east",
    "vadamaradchchi south-west(karaveddy)",
    "vadamaradchi north(point pedro)",
    "valikamam east(kopay)",
    "valikamam north(thllippalai)",
    "valikamam south west(sandilipay)",
    "valikamam south(uduvil)",
    "valikamam west(chankanai)",
  ],
  "northern|mannar": ["mannar town", "manthai west"],
  "northern|mullaitivu": ["manthai east"],
  "northern|vavuniya": ["vavuniya north", "vavuniya south"],
  "southern|matara": ["kirinda puhulwella", "matara four gravets"],
  "western|colombo": ["sri jayawardanapura kotte"],
  "western|gampaha": ["ja ela", "water area(lagoon)"],
};

export type GnCoverage = "ok" | "missing";

/** Whether GN files exist upstream for a given DS division. */
export function gnFolderStatus(
  provinceName: string | undefined,
  districtName: string | undefined,
  dsName: string
): GnCoverage {
  if (!provinceName || !districtName) return "ok";
  if (GN_MISSING_DISTRICTS.some(([p, d]) => p === provinceName && d === districtName)) {
    return "missing";
  }
  const miss = GN_MISSING_DS[`${provinceName}|${districtName}`];
  if (miss && miss.includes(dsName)) return "missing";
  return "ok";
}
