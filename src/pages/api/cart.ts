import type { APIRoute } from "astro";
import { currentCart } from "@wix/ecom";
import { productsV3 } from "@wix/stores";
import { imgSrc } from "../../lib/image";
import { prettyDate } from "../../lib/availability";

const NO_PAGE = new Set(["the-tasting-box"]); // products without a detail page

export const prerender = false;

function count(cart: any): number {
  return (cart?.lineItems ?? []).reduce((n: number, li: any) => n + (li.quantity ?? 0), 0);
}

export const GET: APIRoute = async () => {
  try {
    const cart = await currentCart.getCurrentCart();
    // map product id -> slug so cart lines can link to their product page
    const idToSlug: Record<string, string> = {};
    try {
      const { items: prods } = await productsV3.queryProducts().limit(100).find();
      for (const p of prods ?? []) if (p._id && p.slug) idToSlug[p._id] = p.slug;
    } catch { /* links optional */ }
    const items = (cart.lineItems ?? []).map((li: any) => {
      // surface any custom text the line item carries (e.g. tasting-box flavours),
      // whichever field the platform echoes it back on.
      const ctf = li.catalogReference?.options?.customTextFields;
      let custom: { title: string; value: string }[] = [];
      if (ctf && typeof ctf === "object" && !Array.isArray(ctf)) {
        custom = Object.entries(ctf).map(([title, value]) => ({
          title,
          value: title === "Requested date" ? prettyDate(String(value)) : String(value),
        }));
      } else if (Array.isArray(li.descriptionLines)) {
        custom = li.descriptionLines
          .map((d: any) => ({ title: d?.name?.original ?? "", value: d?.plainText?.original ?? d?.colorInfo?.original ?? "" }))
          .filter((c: any) => c.value);
      }
      const slug = idToSlug[li.catalogReference?.catalogItemId];
      return {
        id: li._id,
        name: li.productName?.original ?? li.productName ?? "Cake",
        price: li.price?.amount ?? "0",
        quantity: li.quantity ?? 1,
        image: imgSrc(li.image, 300, 300),
        custom: (custom as any[]).filter((c) => c.value),
        href: slug && !NO_PAGE.has(slug) ? `/cakes/${slug}` : null,
      };
    });
    return json({ count: count(cart), items, subtotal: cart?.subtotal?.amount ?? null });
  } catch (e: any) {
    // no cart yet is a normal empty state
    return json({ count: 0, items: [], subtotal: null });
  }
};

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
