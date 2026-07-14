import { media } from "@wix/sdk";

/** Rewrite a raw Wix static image URL into a resized, auto-format (WebP/AVIF) render URL. */
function wixFill(u: string, w: number, h: number): string {
  const m = u.match(/^(https:\/\/static\.wixstatic\.com\/media\/)([^/]+)/);
  if (!m) return u;
  const id = m[2];
  return `${m[1]}${id}/v1/fill/w_${Math.round(w)},h_${Math.round(h)},al_c,q_80,enc_auto/${id}`;
}

/**
 * Resolve any Wix media value to a ready, SIZED URL.
 * - wix:image:// identifiers → SDK scaled URL
 * - raw static.wixstatic.com URLs → resized + enc_auto (WebP/AVIF)
 * - already-absolute non-Wix URLs → unchanged
 * Returns "" when there is nothing to render (caller shows a themed placeholder).
 */
export function imgSrc(value: any, w = 800, h = 800): string {
  let v = value?.image ?? value?.url ?? value;
  if (v && typeof v !== "string") v = v?.url ?? "";
  if (!v || typeof v !== "string") return "";
  if (v.startsWith("wix:image://")) return media.getScaledToFillImageUrl(v, Math.round(w), Math.round(h), {});
  if (v.includes("static.wixstatic.com/media/")) return wixFill(v, w, h);
  return v;
}

/** Build a responsive srcset from a Wix media value at several widths (aspect = w/h). */
export function srcSet(value: any, widths: number[], aspect = 1): string {
  return widths
    .map((w) => `${imgSrc(value, w, Math.round(w / aspect))} ${w}w`)
    .filter((s) => s && !s.startsWith(" "))
    .join(", ");
}
