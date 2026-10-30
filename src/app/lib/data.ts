// Sensilance mock data + helpers. ALL NUMBERS ARE ILLUSTRATIVE, not real telemetry.
import { Footprints, HardHat, Shirt } from "lucide-react";

/* ---------- tokens & types ---------- */
export const C = { red: "#D92D20", amber: "#C77700", green: "#168A4A", gray: "#667085" };
export const TARGET = 95; // configurable site target (not a universal safety standard)
export const ZONE_RULES = { goodAtLeast: 90, criticalBelow: 75, criticalAlerts: 3 }; // configurable
export type Status = "Good" | "Warning" | "Critical" | "Unknown";
export type Cls = "Fully compliant" | "Partially compliant" | "Non-compliant";
export const STATUS_STYLE: Record<Status, string> = {
  Good: "bg-green-50 text-green-700 border-green-200",
  Warning: "bg-amber-50 text-amber-700 border-amber-200",
  Critical: "bg-red-50 text-red-700 border-red-200",
  Unknown: "bg-gray-100 text-gray-600 border-gray-200",
};
export const CLS_STYLE: Record<Cls, string> = {
  "Fully compliant": STATUS_STYLE.Good,
  "Partially compliant": STATUS_STYLE.Warning,
  "Non-compliant": STATUS_STYLE.Critical,
};

/* ---------- mock data (reconciled: zone sums = site totals) ---------- */
export const ZONES = [
  { id: "Main Entrance", assess: 312, full: 294, viol: 12, crit: 0, on: 3, total: 3, last: "14:52", hazard: "Low" },
  { id: "Excavation Area", assess: 214, full: 150, viol: 38, crit: 4, on: 4, total: 4, last: "15:06", hazard: "High" },
  { id: "Heavy Machinery", assess: 268, full: 170, viol: 41, crit: 5, on: 4, total: 4, last: "15:09", hazard: "High" },
  { id: "Material Storage", assess: 96, full: 82, viol: 6, crit: 0, on: 1, total: 3, last: "13:41", hazard: "Medium" },
  { id: "Elevated Work Area", assess: 148, full: 121, viol: 17, crit: 1, on: 3, total: 3, last: "14:58", hazard: "High" },
  { id: "Loading Bay", assess: 246, full: 190, viol: 32, crit: 2, on: 3, total: 3, last: "15:04", hazard: "Medium" },
];
export function zoneStatus(z: (typeof ZONES)[number]): Status {
  if (z.on / z.total < 0.5) return "Unknown"; // monitoring gap, never "safe"
  const rate = (z.full / z.assess) * 100;
  if (rate < ZONE_RULES.criticalBelow || z.crit >= ZONE_RULES.criticalAlerts) return "Critical";
  if (rate < ZONE_RULES.goodAtLeast || z.crit > 0) return "Warning";
  return "Good";
}
// Site-wide: 1007 full + 195 partial + 82 non = 1284 valid assessments
export const DIST = { full: 1007, partial: 195, non: 82 };
export const ITEMS = [
  { id: "boots", name: "Safety boots", icon: Footprints, assessable: 1198, missing: 192, delta: -2.1 },
  { id: "suit", name: "Reflector suit", icon: Shirt, assessable: 1251, missing: 113, delta: +0.8 },
  { id: "helmet", name: "Helmet", icon: HardHat, assessable: 1270, missing: 51, delta: +0.3 },
].map((i) => ({ ...i, pct: Math.round((1 - i.missing / i.assessable) * 100) })).sort((a, b) => a.pct - b.pct);

export const TREND: Record<string, { l: string; v: number; n: number }[]> = {
  live: ["15:05", "15:10", "15:15", "15:20", "15:25", "15:30"].map((l, i) => ({ l, v: [76, 79, 77, 80, 78, 79][i], n: [11, 14, 12, 15, 13, 12][i] })),
  hour: ["14:30", "14:40", "14:50", "15:00", "15:10", "15:20"].map((l, i) => ({ l, v: [80, 77, 75, 79, 78, 80][i], n: [24, 27, 22, 29, 26, 25][i] })),
  today: ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"].map((l, i) => ({ l, v: [88, 84, 81, 79, 76, 77, 74, 78, 80, 79][i], n: [96, 182, 214, 201, 188, 120, 74, 62, 78, 69][i] })),
  "7d": ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"].map((l, i) => ({ l, v: [82, 80, 83, 79, 85, 88, 78][i], n: [1210, 1302, 1255, 1190, 640, 410, 1284][i] })),
  custom: ["Wk 40", "Wk 41", "Wk 42", "Wk 43"].map((l, i) => ({ l, v: [80, 81, 79, 78][i], n: [6900, 7210, 7050, 6120][i] })),
};

export const ALERTS = [
  { id: "ALT-0312", sev: "Critical", zone: "Heavy Machinery", text: "Worker detected with only 1 of 3 PPE items", time: "15:09", state: "Unacknowledged" },
  { id: "ALT-0311", sev: "Critical", zone: "Excavation Area", text: "Worker detected without safety boots", time: "15:06", state: "Unacknowledged" },
  { id: "ALT-0309", sev: "High", zone: "Loading Bay", text: "Reflector suit missing", time: "15:04", state: "Acknowledged" },
  { id: "ALT-0306", sev: "High", zone: "Elevated Work Area", text: "Helmet not detected near edge", time: "14:58", state: "Assigned" },
  { id: "ALT-0301", sev: "Medium", zone: "Excavation Area", text: "Worker detected without safety boots", time: "14:41", state: "Acknowledged" },
];
export const SEV_STYLE: Record<string, string> = { Critical: STATUS_STYLE.Critical, High: STATUS_STYLE.Warning, Medium: "bg-sky-50 text-sky-700 border-sky-200" };

export const PPE = ["Reflector suit", "Boots", "Helmet"] as const;
export const mk = (id: number, t: string, zone: string, cam: string, have: string[], alert?: string) => ({ id: `EVT-${id}`, t, zone, cam, have, n: have.length, alert });
export const EVENTS = [
  mk(2048, "15:09:42", "Excavation Area", "CAM-04", ["Helmet", "Reflector suit"], "ALT-0311"),
  mk(2047, "15:08:15", "Main Entrance", "CAM-01", ["Reflector suit", "Boots", "Helmet"]),
  mk(2046, "15:07:51", "Heavy Machinery", "CAM-08", ["Helmet"], "ALT-0312"),
  mk(2045, "15:06:30", "Loading Bay", "CAM-11", ["Boots", "Helmet"], "ALT-0309"),
  mk(2044, "15:05:12", "Elevated Work Area", "CAM-16", ["Reflector suit", "Boots"], "ALT-0306"),
  mk(2043, "15:04:48", "Main Entrance", "CAM-02", ["Reflector suit", "Boots", "Helmet"]),
  mk(2042, "15:03:09", "Heavy Machinery", "CAM-07", [], "ALT-0312"),
  mk(2041, "15:01:55", "Excavation Area", "CAM-05", ["Reflector suit", "Boots", "Helmet"]),
  mk(2040, "15:00:21", "Loading Bay", "CAM-12", ["Reflector suit", "Helmet"]),
  mk(2039, "14:58:37", "Material Storage", "CAM-13", ["Reflector suit", "Boots", "Helmet"]),
];
export const clsOf = (n: number): Cls => (n === 3 ? "Fully compliant" : n === 2 ? "Partially compliant" : "Non-compliant");
export const pct = (a: number, b: number) => (b ? (a / b) * 100 : 0);
export const fmt = (n: number) => Math.round(n).toLocaleString("en-US");


export type EventRow = (typeof EVENTS)[number];
export type Zone = (typeof ZONES)[number];
export const rateColor = (v: number) => (v >= ZONE_RULES.goodAtLeast ? C.green : v >= ZONE_RULES.criticalBelow ? C.amber : C.red);
export const ITEM_FILTER: Record<string, string> = { suit: "Reflector suit", boots: "Boots", helmet: "Helmet" };