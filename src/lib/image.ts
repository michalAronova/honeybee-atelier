import { media } from "@wix/sdk";

/**
 * Resolve a Wix media value to a ready URL.
 * Handles wix:image:// identifiers, {url} objects, and already-absolute https URLs.
 * Returns "" when there is nothing to render (caller shows a themed placeholder).
 */
export function imgSrc(value: any, w = 800, h = 800): string {
  const v = value?.image ?? value?.url ?? value;
  if (!v) return "";
  if (typeof v === "string") {
    if (v.startsWith("wix:image://")) return media.getScaledToFillImageUrl(v, w, h, {});
    return v; // absolute https URL
  }
  return v?.url ?? "";
}
