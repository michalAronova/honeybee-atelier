import type { APIRoute } from "astro";
import { currentCart } from "@wix/ecom";
import { redirects } from "@wix/redirects";
import { json } from "./cart";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { origin } = await request.json();
    // origin comes from the client (window.location.origin) so it's the https published host,
    // never http:// derived from the proxied request (which would 403 the return redirect).
    const base = (origin || "").replace(/^http:\/\//, "https://") || "https://www.honeybeeatelier.com";
    const checkout = await currentCart.createCheckoutFromCurrentCart({
      channelType: currentCart.ChannelType.WEB,
    });
    const session = await redirects.createRedirectSession({
      ecomCheckout: { checkoutId: checkout.checkoutId },
      callbacks: { postFlowUrl: `${base}/`, thankYouPageUrl: `${base}/` },
    });
    return json({ ok: true, url: session.redirectSession?.fullUrl });
  } catch (e: any) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
};
