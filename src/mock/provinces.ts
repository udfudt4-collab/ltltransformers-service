import type { Province } from "@/types";

/** EDL provincial / divisional offices that hold portal accounts. */
export const PROVINCES: Province[] = [
  { code: "EDL-NCP", name: "North Central Province" },
  { code: "EDL-NP", name: "Northern Province" },
  { code: "EDL-NWP-1", name: "North Western Province 1" },
  { code: "EDL-NWP-2", name: "North Western Province 2" },
  { code: "EDL-CC", name: "Colombo City" },
  { code: "EDL-CP-1", name: "Central Province 1" },
  { code: "EDL-CP-2", name: "Central Province 2" },
  { code: "EDL-WPN", name: "Western Province North" },
  { code: "EDL-EP", name: "Eastern Province" },
  { code: "EDL-WPS-2", name: "Western Province South 2" },
  { code: "EDL-UVA", name: "Uva Province" },
  { code: "EDL-SABARAGAMUWA", name: "Sabaragamuwa Province" },
  { code: "EDL-WPS-1", name: "Western Province South 1" },
  { code: "EDL-SP-1", name: "Southern Province 1" },
  { code: "EDL-SP-2", name: "Southern Province 2" },
];

export const provinceName = (code: string | null) =>
  PROVINCES.find((p) => p.code === code)?.name ?? code ?? "All Provinces";

export const TRANSFORMER_RATINGS = [
  "25 kVA",
  "50 kVA",
  "100 kVA",
  "160 kVA",
  "250 kVA",
  "400 kVA",
  "630 kVA",
  "1000 kVA",
];

export const FAILURE_CAUSES = [
  "Lightning Surge",
  "Overloading",
  "Insulation Failure",
  "Oil Leakage",
  "Bushing Damage",
  "Winding Short Circuit",
  "Vandalism",
  "Ageing",
];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const CURRENT_PERIOD = { month: 7, year: 2026 };
