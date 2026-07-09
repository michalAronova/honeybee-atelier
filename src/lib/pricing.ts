/**
 * Live indicative estimate for the Build Your Own configurator.
 * Clearly an ESTIMATE — a formal quote follows on submission.
 * Model: per-serving base by tier, plus a premium-finish/premium-filling uplift.
 */
export const SIZES = [
  { id: "single", label: "Single tier", servings: 12, tiers: 1, base: 8.5 },
  { id: "double", label: "Two tiers", servings: 30, tiers: 2, base: 9.5 },
  { id: "triple", label: "Three tiers", servings: 50, tiers: 3, base: 11 },
  { id: "grand", label: "Four tiers", servings: 90, tiers: 4, base: 12.5 },
];

export type EstimateInput = {
  sizeId: string;
  premiumFillings: number; // count of premium fillings selected
  premiumFinish: boolean;
};

export function estimateRange({ sizeId, premiumFillings, premiumFinish }: EstimateInput) {
  const size = SIZES.find((s) => s.id === sizeId) ?? SIZES[0];
  let low = size.servings * size.base;
  // premium fillings add ~ $1.2/serving each; premium finish adds a flat design fee scaled by tiers
  low += premiumFillings * size.servings * 1.2;
  if (premiumFinish) low += 45 * size.tiers;
  // custom hand-work spread: high end ~22% above low, rounded to tens
  const round = (n: number) => Math.round(n / 10) * 10;
  return { low: round(low), high: round(low * 1.22), servings: size.servings };
}

export function money(n: number): string {
  return "$" + n.toLocaleString("en-US");
}
