import type { APIRoute } from "astro";
import { currentCart } from "@wix/ecom";
import { json } from "./cart";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { lineItemId, quantity } = await request.json();
    if (!lineItemId) return json({ error: "missing lineItemId" }, 400);
    if (quantity <= 0) {
      await currentCart.removeLineItemsFromCurrentCart([lineItemId]);
    } else {
      await currentCart.updateCurrentCartLineItemQuantity([{ _id: lineItemId, quantity }]);
    }
    const cart = await currentCart.getCurrentCart();
    const count = (cart.lineItems ?? []).reduce((n: number, li: any) => n + (li.quantity ?? 0), 0);
    return json({ ok: true, count });
  } catch (e: any) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
};
