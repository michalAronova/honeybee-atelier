export type Availability = {
  minDays: number;
  maxPerDay: number;
  closedWeekdays: number[];
  unavailable: string[];
};

const FALLBACK: Availability = { minDays: 7, maxPerDay: 3, closedWeekdays: [0, 1], unavailable: [] };

export async function fetchAvailability(): Promise<Availability> {
  try {
    const r = await fetch("/api/availability");
    if (!r.ok) return FALLBACK;
    return { ...FALLBACK, ...(await r.json()) };
  } catch {
    return FALLBACK;
  }
}

/** earliest allowed date (today + minDays), as YYYY-MM-DD in local time */
export function minDateISO(minDays: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + minDays);
  return toISO(d);
}

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** returns an error message if the date is invalid, or "" if it's bookable */
export function validateDate(dateStr: string, a: Availability): string {
  if (!dateStr) return "Please choose a date.";
  // parse as local date
  const [y, m, d] = dateStr.split("-").map(Number);
  const picked = new Date(y, (m || 1) - 1, d || 1);
  if (Number.isNaN(picked.getTime())) return "Please choose a valid date.";
  if (dateStr < minDateISO(a.minDays)) return `We bake to order — please allow at least ${a.minDays} days.`;
  if (a.closedWeekdays.includes(picked.getDay())) return "We're closed Sundays and Mondays — please pick a day Tue–Sat.";
  if (a.unavailable.includes(dateStr)) return "That date is fully booked — please choose another.";
  return "";
}

export function prettyDate(dateStr: string): string {
  const m = String(dateStr).match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}
