import type { APIRoute } from "astro";
import { currentCart } from "@wix/ecom";
import { readOnlyVariantsV3 } from "@wix/stores";
import { json } from "./cart";

export const prerender = false;
const STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { productId, quantity = 1, customText } = await request.json();
    if (!productId) return json({ error: "missing productId" }, 400);

    // resolve the (single) variant — mandatory for the cart
    let variantId: string | undefined;
    try {
      const { items } = await readOnlyVariantsV3
        .queryVariants()
        .eq("productData.productId", productId)
        .find();
      const v = items?.[0];
      variantId = v?.variantId ?? v?._id;
    } catch { /* fall through */ }

    // customText: a map keyed by the product's FREE_TEXT modifier key
    // (e.g. { "Your nine flavours": "…" }) — carried on the line item so the
    // choice travels to the order.
    const options: Record<string, any> = {};
    if (variantId) options.variantId = variantId;
    if (customText && typeof customText === "object" && Object.keys(customText).length) {
      options.customTextFields = customText;
    }

    await currentCart.addToCurrentCart({
      lineItems: [
        {
          quantity,
          catalogReference: {
            catalogItemId: productId,
            appId: STORES_APP_ID,
            ...(Object.keys(options).length ? { options } : {}),
          },
        },
      ],
    });

    const cart = await currentCart.getCurrentCart();
    const count = (cart.lineItems ?? []).reduce((n: number, li: any) => n + (li.quantity ?? 0), 0);
    return json({ ok: true, count });
  } catch (e: any) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
};
