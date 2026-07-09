import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const TOKEN = process.env.TOKEN, SITE_ID = process.env.SITE_ID;
const H = { Authorization: 'Bearer ' + TOKEN, 'wix-site-id': SITE_ID, 'Content-Type': 'application/json' };
const summary = JSON.parse(readFileSync(new URL('./seed-summary.json', import.meta.url)));
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const STYLE = 'warm natural daylight, soft shadows, ivory and blush and champagne-gold tones, linen and marble surfaces, editorial bridal-magazine styling, handcrafted and unhurried, no hard flash, no text, no watermarks';

// -------- prompt sets --------
const productPrompts = {
  'The Golden Hour': 'A three-tier ivory Italian buttercream wedding cake with fresh blush roses and hand-applied gold leaf, shot at 45 degrees on an ivory linen backdrop',
  'Midnight Ganache': 'A dark chocolate celebration cake with glossy chocolate ganache drip and a gilded chocolate shard on top, on a marble surface',
  'Citrus & Cream': 'A semi-naked lemon layer cake with candied lemon slices and small edible blooms, sponge showing through pale buttercream',
  'Blush Peony': 'A romantic single-tier cake smoothed in blush buttercream and crowned with delicate sugar peonies, soft and elegant',
  'Wild Berry Naked': 'A rustic naked vanilla layer cake tumbling with fresh mixed berries and mint, minimal buttercream, sponge visible',
  'Pistachio Rose': 'A pale-green pistachio buttercream cake topped with crushed pistachio and dried rose petals, delicate and luxurious',
  'Salted Honey': 'A honey-toned buttercream cake with a burnt-honey drizzle and a golden honeycomb shard on top, warm amber tones',
  'Earl Grey & Fig': 'A warm ivory buttercream cake topped with fresh halved figs, an afternoon-tea aesthetic',
  'Champagne Celebration': 'An elegant pearl-buttercream cake with edible gold accents, celebratory and refined, on ivory linen',
  'Little Lemon': 'A petite two-layer lemon cake in sunny pale-yellow buttercream with candied lemon peel, small and charming',
};
const cateringPrompts = {
  'Iced Celebration Cookies': 'A neat arrangement of hand-iced vanilla shortbread cookies with delicate blush and gold royal-icing detail on a marble board',
  'Signature Cupcakes': 'A cluster of beautifully piped cupcakes in blush and cream buttercream swirls, on an ivory cake stand',
  'Dessert Table': 'A styled event dessert table with tiered cupcakes, iced cookies and a small centerpiece cake, blush and gold styling',
  'Macaron Tower': 'A tall cascading tower of French macarons in blush, cream and gold tones as an event centerpiece',
  'Mini Fruit Tartlets': 'A row of mini fruit tartlets with vanilla custard and glazed seasonal fruit on a marble surface',
  'Celebration Cake Pops': 'A bouquet of decorated cake pops in blush and gold, elegantly displayed for a celebration',
};
const coverPrompts = [
  'Overhead shot of a boxed buttercream cake being placed onto a fridge shelf, hands gently guiding the box, soft daylight kitchen', // storage
  'A baker inserting food-safe dowels into a stacked cake tier on a turntable, structural cake-building in progress, hands in focus', // structure
  'A flat-lay of cake flavour swatches, small bowls of fillings and a finished slice, styled for pairing, overhead', // flavours
  'Several cakes of different sizes side by side on marble cake stands, showing scale, soft daylight', // sizes
  'A baker scraping a bench scraper around a semi-naked cake on a turntable, sponge showing through thin buttercream, hands in focus', // semi-naked
  'An overhead flat-lay of a cake design sketch beside fresh flowers and a baker’s notebook, calm and considered', // lead time
];
const surfacePrompts = {
  hero: { p: 'A large softly-lit three-tier semi-naked buttercream celebration cake with fresh blush roses and a whisper of gold leaf, on an ivory linen backdrop with side window light, generous negative space', w: 1376, h: 768 },
  chef: { p: 'A certified pastry chef smoothing ivory buttercream on a cake with a palette knife in a sunlit atelier, hands in focus, warm and unstaged, apron and linen', w: 1200, h: 896 },
  process: { p: 'An overhead flat-lay showing a cake design sketch, small swatches of flavour and finish, and a finished cake beside them, the journey of a bespoke cake', w: 1200, h: 896 },
  catering: { p: 'A styled event dessert table with tiered cupcakes, iced cookies, macarons and a small centerpiece cake, blush and gold styling, luminous daylight', w: 1376, h: 768 },
};

// -------- generate + import helpers --------
async function generate(prompt, w = 1024, h = 1024, tries = 2) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch('https://www.wixapis.com/runwareschemaless/v1/request', { method: 'POST', headers: H, body: JSON.stringify([
        { taskType: 'imageInference', taskUUID: randomUUID(), outputType: 'URL', outputFormat: 'PNG', positivePrompt: `${prompt}, ${STYLE}`, width: w, height: h, model: 'google:4@2', numberResults: 1 }]) });
      const d = await j(r);
      const url = d?.data?.[0]?.imageURL;
      if (url) return url;
      console.error('gen no-url', r.status, JSON.stringify(d).slice(0, 200));
    } catch (e) { console.error('gen err', String(e)); }
    await sleep(1500);
  }
  return null;
}
async function importMedia(url, name) {
  if (!url) return null;
  const r = await fetch('https://www.wixapis.com/site-media/v1/files/import', { method: 'POST', headers: H, body: JSON.stringify({ url, mimeType: 'image/png', displayName: name }) });
  const d = await j(r);
  if (!r.ok || !d.file) { console.error('import fail', r.status, JSON.stringify(d).slice(0, 200)); return null; }
  return { url: d.file.url, id: d.file.id };
}
async function genImport(prompt, name, w, h) {
  const gen = await generate(prompt, w, h);
  const media = await importMedia(gen, name);
  if (media) console.log('  ok:', name);
  else console.log('  MISS:', name);
  return media;
}
// concurrency-limited map
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let idx = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) { const i = idx++; out[i] = await fn(items[i], i); }
  }));
  return out;
}

// ======== 1. PRODUCTS ========
console.log('\n=== product images ===');
await mapLimit(summary.products, 5, async (p) => {
  const cur0 = await j(await fetch(`https://www.wixapis.com/stores/v3/products/${p.id}`, { headers: H }));
  if (cur0.product?.media?.main) { console.log('  skip (has image):', p.name); return; }
  const prompt = productPrompts[p.name] || `A beautiful ${p.name} celebration cake`;
  const media = await genImport(prompt, `cake-${p.slug}.png`, 1024, 1024);
  if (!media) return;
  const cur = await j(await fetch(`https://www.wixapis.com/stores/v3/products/${p.id}`, { headers: H }));
  const prod = cur.product;
  const body = { product: { revision: prod.revision, options: prod.options, variantsInfo: prod.variantsInfo, media: { itemsInfo: { items: [{ url: media.url, altText: `${p.name} — handcrafted cake by Honeybee Atelier` }] } } } };
  const r = await fetch(`https://www.wixapis.com/stores/v3/products/${p.id}`, { method: 'PATCH', headers: H, body: JSON.stringify(body) });
  if (!r.ok) console.error('  product patch fail', p.name, r.status, (await r.text()).slice(0, 200));
});

// ======== 2. CATERING (CMS read-merge-PUT) ========
console.log('\n=== catering images ===');
const catQ = await j(await fetch('https://www.wixapis.com/wix-data/v2/items/query', { method: 'POST', headers: H, body: JSON.stringify({ dataCollectionId: 'CateringItems' }) }));
const catItems = catQ.dataItems || [];
await mapLimit(catItems, 5, async (it) => {
  const name = it.data.name;
  if (it.data.image) { console.log('  skip (has image):', name); return; }
  const prompt = cateringPrompts[name] || `A styled ${name} for events`;
  const media = await genImport(prompt, `catering-${it.data._id}.png`, 1024, 1024);
  if (!media) return;
  const data = { ...it.data, image: media.url };
  const r = await fetch(`https://www.wixapis.com/wix-data/v2/items/${it.data._id}`, { method: 'PUT', headers: H, body: JSON.stringify({ dataCollectionId: 'CateringItems', dataItem: { data } }) });
  if (!r.ok) console.error('  catering put fail', name, r.status, (await r.text()).slice(0, 200));
});

// ======== 3. BLOG COVERS ========
console.log('\n=== blog covers ===');
await mapLimit(summary.blogPosts, 3, async (post, i) => {
  const cur = await j(await fetch(`https://www.wixapis.com/blog/v3/draft-posts/${post.id}`, { headers: H }));
  if (cur.draftPost?.media?.wixMedia?.image) { console.log('  skip (has cover):', i); return; }
  const media = await genImport(coverPrompts[i] || 'A cake technique process shot', `cover-${i}.png`, 1200, 896);
  if (!media) return;
  const body = { draftPost: { id: post.id, media: { wixMedia: { image: { id: media.id } }, displayed: true, custom: false } }, fieldMask: { paths: ['media'] } };
  const u = await fetch(`https://www.wixapis.com/blog/v3/draft-posts/${post.id}`, { method: 'PATCH', headers: H, body: JSON.stringify(body) });
  if (!u.ok) { console.error('  cover update fail', i, u.status, (await u.text()).slice(0, 300)); return; }
  const pub = await fetch(`https://www.wixapis.com/blog/v3/draft-posts/${post.id}/publish`, { method: 'POST', headers: H, body: JSON.stringify({}) });
  if (!pub.ok) console.error('  publish fail', i, pub.status, (await pub.text()).slice(0, 200));
});

// ======== 4. PAGE SURFACES ========
console.log('\n=== page surface images ===');
const dataDir = '/Users/michalaro/wix-headless/honeybee-atelier/src/data';
mkdirSync(dataDir, { recursive: true });
let pageImages = {};
try { pageImages = JSON.parse(readFileSync(dataDir + '/page-images.json')); } catch { /* start fresh */ }
for (const [key, s] of Object.entries(surfacePrompts)) {
  if (pageImages[key]) { console.log('  skip (has image):', key); continue; }
  const media = await genImport(s.p, `surface-${key}.png`, s.w, s.h);
  if (media) pageImages[key] = media.url;
}
writeFileSync(dataDir + '/page-images.json', JSON.stringify(pageImages, null, 2));
console.log('\npage-images.json:', JSON.stringify(pageImages, null, 2));
console.log('\n=== IMAGES DONE ===');
