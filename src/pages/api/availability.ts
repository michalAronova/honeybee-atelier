import type { APIRoute } from "astro";
import { auth } from "@wix/essentials";
import { orders } from "@wix/ecom";
import { items } from "@wix/data";
import { json } from "./cart";

export const prerender = false;

export const MIN_DAYS = 7;
export const MAX_PER_DAY = 3;
export const CLOSED_WEEKDAYS = [0, 1]; // Sunday, Monday (atelier is Tue–Sat)
const DATE_FIELD = "Requested date";

function isoFrom(v: unknown): string | null {
  const m = String(v ?? "").match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : null;
}

function lineItemDate(li: any): string | null {
  for (const dl of li?.descriptionLines ?? []) {
    if ((dl?.name?.original ?? dl?.name ?? "") === DATE_FIELD) {
      const iso = isoFrom(dl?.plainText?.original ?? dl?.plainText ?? dl?.colorInfo?.original);
      if (iso) return iso;
    }
  }
  const ctf = li?.catalogReference?.options?.customTextFields;
  if (ctf && typeof ctf === "object") return isoFrom(ctf[DATE_FIELD]);
  return null;
}

export const GET: APIRoute = async () => {
  // count cakes already ordered per requested date (needs order-read permission → elevate)
  const counts: Record<string, number> = {};
  try {
    const searchOrders = auth.elevate(orders.searchOrders);
    let cursor: string | undefined;
    for (let page = 0; page < 6; page++) {
      const res: any = await searchOrders({
        cursorPaging: { limit: 100, ...(cursor ? { cursor } : {}) },
      } as any);
      const list = res?.orders ?? [];
      for (const o of list) {
        for (const li of o?.lineItems ?? []) {
          const d = lineItemDate(li);
          if (d) counts[d] = (counts[d] ?? 0) + (li?.quantity ?? 1);
        }
      }
      cursor = res?.metadata?.cursors?.next || res?.pagingMetadata?.cursors?.next;
      if (!cursor || list.length === 0) break;
    }
  } catch (e) {
    console.error("availability: order search failed (capacity not enforced)", e);
  }
  const fullDates = Object.entries(counts)
    .filter(([, n]) => n >= MAX_PER_DAY)
    .map(([d]) => d);

  // owner-managed closures / holidays (optional collection)
  let closedDates: string[] = [];
  try {
    const { items: rows } = await items.query("ClosedDates").limit(200).find();
    closedDates = (rows ?? []).map((r: any) => isoFrom(r.date)).filter(Boolean) as string[];
  } catch { /* collection optional */ }

  return json({
    minDays: MIN_DAYS,
    maxPerDay: MAX_PER_DAY,
    closedWeekdays: CLOSED_WEEKDAYS,
    unavailable: Array.from(new Set([...fullDates, ...closedDates])),
  });
};
