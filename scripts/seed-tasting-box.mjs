import { randomUUID } from 'node:crypto';
const TOKEN = process.env.TOKEN, SITE_ID = process.env.SITE_ID;
const H = { Authorization: 'Bearer ' + TOKEN, 'wix-site-id': SITE_ID, 'Content-Type': 'application/json' };
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };

const descText = "Nine mini tastings in your choice of flavours — the loveliest way to find your favourite before you commit. Each box holds nine bite-size cakes, freshly baked to order. The full price is credited toward your signature or bespoke cake when you order within 30 days.";
const desc = {
  nodes: [{ type: 'PARAGRAPH', id: 'tb1', nodes: [{ type: 'TEXT', textData: { text: descText } }], paragraphData: { textStyle: { textAlignment: 'AUTO' } } }],
  metadata: { version: 1, id: randomUUID() },
};

// avoid duplicates on re-run
const q = await j(await fetch('https://www.wixapis.com/stores/v3/products/query', { method: 'POST', headers: H, body: JSON.stringify({ query: { paging: { limit: 100 } } }) }));
const existing = (q.products || []).find((p) => p.name === 'The Tasting Box');
let product = existing;
if (!existing) {
  const cr = await j(await fetch('https://www.wixapis.com/stores/v3/bulk/products-with-inventory/create', {
    method: 'POST', headers: H, body: JSON.stringify({
      products: [{
        name: 'The Tasting Box', productType: 'PHYSICAL', physicalProperties: {}, visible: true, visibleInPos: true,
        description: desc,
        variantsInfo: { variants: [{ price: { actualPrice: { amount: '45.00' } }, visible: true, inventoryItem: { quantity: 200, preorderInfo: { enabled: false } }, physicalProperties: {} }] },
      }], returnEntity: true,
    }),
  }));
  product = cr.productResults?.results?.[0]?.item;
  console.log('created:', product?.id, product?.slug);
} else {
  console.log('exists:', existing.id, existing.slug);
}

// attach image if missing
if (product && !product.media?.main) {
  const gen = await j(await fetch('https://www.wixapis.com/runwareschemaless/v1/request', { method: 'POST', headers: H, body: JSON.stringify([
    { taskType: 'imageInference', taskUUID: randomUUID(), outputType: 'URL', outputFormat: 'PNG',
      positivePrompt: 'A gift box holding nine bite-size mini cakes in assorted pastel flavours, arranged in a neat 3x3 grid, blush and cream and gold tones, ivory linen, warm natural daylight, editorial styling, no text, no watermarks',
      width: 1024, height: 1024, model: 'google:4@2', numberResults: 1 }]) }));
  const url = gen?.data?.[0]?.imageURL;
  if (url) {
    const imp = await j(await fetch('https://www.wixapis.com/site-media/v1/files/import', { method: 'POST', headers: H, body: JSON.stringify({ url, mimeType: 'image/png', displayName: 'tasting-box.png' }) }));
    const media = imp.file?.url;
    if (media) {
      const cur = await j(await fetch(`https://www.wixapis.com/stores/v3/products/${product.id}`, { headers: H }));
      const p = cur.product;
      const r = await fetch(`https://www.wixapis.com/stores/v3/products/${product.id}`, { method: 'PATCH', headers: H, body: JSON.stringify({
        product: { revision: p.revision, options: p.options, variantsInfo: p.variantsInfo, media: { itemsInfo: { items: [{ url: media, altText: 'Honeybee Atelier tasting box — nine mini cakes' }] } } } }) });
      console.log('image attach:', r.status);
    }
  } else console.log('image gen failed (no credits?)');
} else console.log('image already present or no product');

// print final id/slug
const q2 = await j(await fetch('https://www.wixapis.com/stores/v3/products/query', { method: 'POST', headers: H, body: JSON.stringify({ query: { paging: { limit: 100 } } }) }));
const tb = (q2.products || []).find((p) => p.name === 'The Tasting Box');
console.log('TASTING_BOX', JSON.stringify({ id: tb?.id, slug: tb?.slug, hasImage: !!tb?.media?.main }));
