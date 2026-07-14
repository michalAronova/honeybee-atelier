import { productsV3 } from "@wix/stores";
import { items } from "@wix/data";
import { posts } from "@wix/blog";
import { media } from "@wix/sdk";
import { imgSrc } from "./image";
import type { Cake } from "../components/SignatureCakeGrid";
import postCovers from "../data/post-covers.json";

// Seeded form ids (structural handoff — the frontend binds by these).
export const FORM_IDS = {
  contact: "99f14293-75e7-4f4f-965b-b238882b026a",
  build: "49199c01-6a2a-43a2-ba70-7f744deafa29",
  catering: "0b3c31a9-f6fe-4195-9a48-7176d0c176ed",
};

async function cmsAll(collectionId: string, orderField = "order") {
  try {
    let q = items.query(collectionId).limit(100);
    // ascending is safe on a NUMBER order field; ignore if it errors
    try { q = q.ascending(orderField); } catch { /* no-op */ }
    const { items: rows } = await q.find();
    return rows ?? [];
  } catch (e) {
    console.error(`cms ${collectionId} query failed`, e);
    return [];
  }
}

export const TASTING_BOX_SLUG = "the-tasting-box";

/** The purchasable tasting box (a Stores product kept out of the signature grid). */
export async function getTastingBox() {
  try {
    const { items } = await productsV3.queryProducts().eq("slug", TASTING_BOX_SLUG).limit(1).find();
    const p = items?.[0];
    if (!p) return null;
    return {
      id: p._id,
      name: p.name,
      price: p.actualPriceRange?.minValue?.amount ?? "45",
      image: imgSrc(p.media?.main, 720, 720),
      description: p.plainDescription ?? "",
    };
  } catch (e) {
    console.error("tasting box query failed", e);
    return null;
  }
}

/** Signature cakes: Stores products joined to CMS layer/occasion/servings metadata by name. */
export async function getSignatureCakes(limit = 50): Promise<Cake[]> {
  // fetch the catalog and the CMS metadata in parallel
  const [res, meta] = await Promise.all([
    productsV3.queryProducts().limit(limit).find().catch((e: any) => { console.error("products query failed", e); return { items: [] } as any; }),
    cmsAll("SignatureCakes"),
  ]);
  const products = (res.items ?? []).filter((p: any) => p.slug !== TASTING_BOX_SLUG);
  const byName = new Map(meta.map((m: any) => [m.name, m]));
  return products.map((p: any) => {
    const m: any = byName.get(p.name) ?? {};
    return {
      id: p._id,
      name: p.name,
      slug: p.slug,
      price: p.actualPriceRange?.minValue?.amount ?? "0",
      image: imgSrc(p.media?.main, 640, 800),
      inStock: (p.inventory?.availabilityStatus ?? "IN_STOCK") !== "OUT_OF_STOCK",
      description: p.plainDescription ?? "",
      occasion: m.occasion ?? "",
      servings: m.servings ?? undefined,
      tagline: m.tagline ?? "",
      layers: Array.isArray(m.layers) ? m.layers : [],
      order: m.order ?? 999,
    } as Cake & { order: number };
  }).sort((a: any, b: any) => a.order - b.order);
}

export async function getReviews() {
  return cmsAll("Reviews");
}

/** A single signature cake by its product slug, joined to its CMS layer metadata. */
export async function getCakeBySlug(slug: string): Promise<(Cake & { order?: number }) | null> {
  let product: any = null;
  try {
    const res = await productsV3.queryProducts().eq("slug", slug).limit(1).find();
    product = res.items?.[0];
  } catch (e) {
    console.error("cake by slug failed", e);
  }
  if (!product || product.slug === TASTING_BOX_SLUG) return null;
  const meta = await cmsAll("SignatureCakes");
  const m: any = meta.find((x: any) => x.name === product.name) ?? {};
  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    price: product.actualPriceRange?.minValue?.amount ?? "0",
    image: imgSrc(product.media?.main, 1000, 1250),
    inStock: (product.inventory?.availabilityStatus ?? "IN_STOCK") !== "OUT_OF_STOCK",
    description: product.plainDescription ?? "",
    occasion: m.occasion ?? "",
    servings: m.servings ?? undefined,
    tagline: m.tagline ?? "",
    layers: Array.isArray(m.layers) ? m.layers : [],
  };
}
export async function getTastingFlavors() {
  return cmsAll("TastingFlavors");
}
export async function getFlavors() {
  return cmsAll("FlavorOptions");
}
export async function getCateringItems() {
  const rows = await cmsAll("CateringItems");
  return rows.map((r: any) => ({ ...r, imageUrl: r.image ? imgSrc(r.image, 720, 540) : "" }));
}
export async function getStory() {
  const rows = await cmsAll("StoryBlocks");
  return rows[0] ?? null;
}

export async function getPosts(limit = 20) {
  try {
    const { items: p } = await posts
      .queryPosts({ fieldsets: ["RICH_CONTENT", "URL"] as any })
      .descending("firstPublishedDate")
      .limit(limit)
      .find();
    return (p ?? []).map(decoratePost);
  } catch (e) {
    console.error("posts query failed", e);
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const { items: p } = await posts
      .queryPosts({ fieldsets: ["RICH_CONTENT", "URL"] as any })
      .eq("slug", slug)
      .find();
    return p?.[0] ? decoratePost(p[0]) : null;
  } catch (e) {
    console.error("post by slug failed", e);
    return null;
  }
}

const COVERS: Record<string, string> = postCovers as any;

function decoratePost(post: any) {
  let cover = "";
  const ref = post.media?.wixMedia?.image;
  if (ref) {
    try { cover = media.getScaledToFillImageUrl(ref, 800, 560, {}); } catch { cover = ""; }
  }
  // fallback to the seeded cover map (blog media API is set-only via the SDK runtime)
  if (!cover && post.slug && COVERS[post.slug]) cover = COVERS[post.slug];
  return {
    id: post._id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    minutesToRead: post.minutesToRead ?? null,
    firstPublishedDate: post.firstPublishedDate ?? null,
    richContent: post.richContent ?? null,
    cover,
  };
}

export function fmtDate(d: any): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}
