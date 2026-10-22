export type MetricKey = "norm" | "planned" | "practical" | "unplanned" | "speakers" | "completed";

export interface OrgData {
  id: string;
  name: string;
  short: string;
  color: string;
  norm: number;
  planned: number;
  practical: number;
  unplanned: number;
  speakers: number;
  completed: number;
}

export const METRIC_META: { key: MetricKey; label: string; hint: string }[] = [
  { key: "norm", label: "Норматив", hint: "Нужное число мероприятий в год" },
  { key: "planned", label: "Плановые", hint: "Мероприятия по плану" },
  { key: "practical", label: "Практикалы", hint: "Из плановых — практические занятия" },
  { key: "unplanned", label: "Внеплановые", hint: "Добавлены сверх плана" },
  { key: "speakers", label: "Со спикерами", hint: "С приглашёнными спикерами" },
  { key: "completed", label: "Выполнено", hint: "Фактически проведено" },
];

export const CAT = {
  planned: "#5aa7f0",
  practical: "#35c9a3",
  unplanned: "#f0a83e",
  speakers: "#ef6f5e",
  muted: "#3a4a70",
  good: "#a4cf5a",
};

export const DEFAULT_DATA: OrgData[] = [
  { id: "org1", name: "KMU",    short: "KMU",    color: "#35c9a3", norm: 45, planned: 42, practical: 18, unplanned: 9,  speakers: 12, completed: 46 },
  { id: "org2", name: "KazNMU", short: "KazNMU", color: "#5aa7f0", norm: 50, planned: 35, practical: 12, unplanned: 14, speakers: 8,  completed: 41 },
  { id: "org3", name: "AMU",    short: "AMU",    color: "#f0a83e", norm: 30, planned: 28, practical: 10, unplanned: 6,  speakers: 15, completed: 30 },
  { id: "org4", name: "KRMU",   short: "KRMU",   color: "#ef6f5e", norm: 60, planned: 51, practical: 22, unplanned: 11, speakers: 19, completed: 55 },
  { id: "org5", name: "MKTU",   short: "MKTU",   color: "#9c8cf5", norm: 32, planned: 24, practical: 8,  unplanned: 5,  speakers: 6,  completed: 26 },
  { id: "org6", name: "SMU",    short: "SMU",    color: "#a4cf5a", norm: 36, planned: 33, practical: 15, unplanned: 7,  speakers: 10, completed: 28 },
  { id: "org7", name: "ZKMU",   short: "ZKMU",   color: "#e87fae", norm: 24, planned: 19, practical: 6,  unplanned: 4,  speakers: 5,  completed: 21 },
];

const STORAGE_KEY = "events-dashboard-v3";

export function loadData(): OrgData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA.map((d) => ({ ...d }));
    const parsed = JSON.parse(raw) as OrgData[];
    if (!Array.isArray(parsed) || parsed.length !== DEFAULT_DATA.length) {
      return DEFAULT_DATA.map((d) => ({ ...d }));
    }
    return DEFAULT_DATA.map((d) => {
      const saved = parsed.find((p) => p && p.id === d.id);
      return saved ? { ...d, ...pickNumbers(saved) } : { ...d };
    });
  } catch {
    return DEFAULT_DATA.map((d) => ({ ...d }));
  }
}

function pickNumbers(o: OrgData) {
  const keys: MetricKey[] = ["norm", "planned", "practical", "unplanned", "speakers", "completed"];
  const out: Record<MetricKey, number> = { norm: 0, planned: 0, practical: 0, unplanned: 0, speakers: 0, completed: 0 };
  keys.forEach((k) => {
    const n = Number(o[k]);
    out[k] = Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
  });
  return out;
}

export function saveData(rows: OrgData[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* noop */
  }
}

export const orgTotal = (o: OrgData) => o.planned + o.unplanned;

export interface Aggregate {
  norm: number;
  planned: number;
  practical: number;
  unplanned: number;
  speakers: number;
  completed: number;
  total: number;
}

export function aggregate(rows: OrgData[]): Aggregate {
  const a = rows.reduce(
    (s, r) => ({
      norm: s.norm + r.norm,
      planned: s.planned + r.planned,
      practical: s.practical + r.practical,
      unplanned: s.unplanned + r.unplanned,
      speakers: s.speakers + r.speakers,
      completed: s.completed + r.completed,
    }),
    { norm: 0, planned: 0, practical: 0, unplanned: 0, speakers: 0, completed: 0 }
  );
  return { ...a, total: a.planned + a.unplanned };
}

export const pct = (part: number, whole: number) => (whole <= 0 ? 0 : Math.round((part / whole) * 1000) / 10);

export const fmt = (n: number) => n.toLocaleString("ru-RU");

export interface Tier {
  label: string;
  color: string;
}

export function tierOf(p: number): Tier {
  if (p >= 85) return { label: "Отлично", color: "#a4cf5a" };
  if (p >= 65) return { label: "Хорошо", color: "#5aa7f0" };
  if (p >= 45) return { label: "Средне", color: "#f0a83e" };
  return { label: "Требует внимания", color: "#ef6f5e" };
}

export const normPct = (o: OrgData) => (o.norm <= 0 ? 0 : Math.round((orgTotal(o) / o.norm) * 100));
