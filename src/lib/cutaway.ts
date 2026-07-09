/**
 * Layer cutaway — maps a layer/filling description to an on-palette tone and a flavour icon,
 * so the illustrated cross-section reads like the real cake.
 */
const TONES: Array<[RegExp, string]> = [
  [/chocolate|ganache|cocoa/i, "#4A2E28"],
  [/salted caramel|caramel|toffee/i, "#C9873F"],
  [/raspberry|berry|strawberry|preserve|compote/i, "#C56B7A"],
  [/lemon|citrus|elderflower curd/i, "#EBD98A"],
  [/pistachio/i, "#AFC290"],
  [/honey|honeycomb/i, "#D9A94E"],
  [/rose|blush|peony/i, "#E2B4AE"],
  [/champagne|pearl|gold|24k/i, "#E7D3A3"],
  [/fig/i, "#8E5D70"],
  [/mascarpone|vanilla cream|whipped|cream|mousse/i, "#F3E8D8"],
  [/elderflower|floral/i, "#E7E3CC"],
  [/buttercream|ivory|naked|semi-naked|finish|frosting/i, "#F1E4D2"],
  [/sponge|cake|almond|earl grey/i, "#E4CBA0"],
];

export function layerTone(label: string): string {
  for (const [re, tone] of TONES) if (re.test(label)) return tone;
  return "#E9D8C2";
}

/** decide readable text/icon color against a tone */
export function onTone(tone: string): string {
  const n = parseInt(tone.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#2A211F" : "#FDF6F3";
}

export type IconKind =
  | "berry" | "lemon" | "chocolate" | "caramel" | "cream" | "sponge"
  | "honey" | "pistachio" | "rose" | "elderflower" | "fig" | "champagne" | "buttercream";

// order matters — most specific first
const ICONS: Array<[RegExp, IconKind]> = [
  [/elderflower/i, "elderflower"],
  [/chocolate|ganache|cocoa/i, "chocolate"],
  [/caramel|toffee|honey/i, "caramel"],
  [/raspberry|berry|strawberry|preserve|compote/i, "berry"],
  [/lemon|citrus/i, "lemon"],
  [/pistachio/i, "pistachio"],
  [/honeycomb/i, "honey"],
  [/rose|peony|floral|bloom|petal/i, "rose"],
  [/champagne|pearl|gold|24k/i, "champagne"],
  [/fig/i, "fig"],
  [/mascarpone|cream|whipped|mousse/i, "cream"],
  [/buttercream|ivory|naked|semi-naked|finish|frosting|drip|shard/i, "buttercream"],
  [/sponge|cake|almond|earl grey/i, "sponge"],
];

export function layerIcon(label: string): IconKind {
  for (const [re, kind] of ICONS) if (re.test(label)) return kind;
  return "sponge";
}

// classify the role of a layer for a small type tag
export type LayerType = "Sponge" | "Filling" | "Finish" | "Topping";
const TYPES: Array<[RegExp, LayerType]> = [
  [/shard|honeycomb|drizzle|gold leaf|petal|candied|bloom/i, "Topping"],
  [/buttercream|naked|semi-naked|finish|frosting|icing|glaze|drip|coating|pearl/i, "Finish"],
  [/sponge|cake/i, "Sponge"],
  [/compote|curd|caramel|mascarpone|cream|mousse|jam|preserve|ganache|honey|elderflower|filling/i, "Filling"],
];
export function layerType(label: string): LayerType {
  for (const [re, t] of TYPES) if (re.test(label)) return t;
  return "Filling";
}
