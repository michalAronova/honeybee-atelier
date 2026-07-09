const TOKEN = process.env.TOKEN, SITE_ID = process.env.SITE_ID;
const H = { Authorization: 'Bearer ' + TOKEN, 'wix-site-id': SITE_ID, 'Content-Type': 'application/json' };
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };

const ID = '3056aad0-b36d-44fb-9f11-a7b9457790f4'; // The Tasting Box

const cur = await j(await fetch(`https://www.wixapis.com/stores/v3/products/${ID}`, { headers: H }));
const p = cur.product;
const existing = (p.modifiers || []).find((m) => m.name === 'Tasting flavours');
if (existing) {
  console.log('modifier exists. key:', existing.freeTextSettings?.key, 'modifier.key:', existing.key);
} else {
  const body = { product: {
    revision: p.revision,
    options: p.options,
    variantsInfo: p.variantsInfo,
    modifiers: [{
      name: 'Tasting flavours',
      modifierRenderType: 'FREE_TEXT',
      mandatory: false,
      freeTextSettings: { title: 'Your nine flavours', minCharCount: 0, maxCharCount: 500 },
    }],
  } };
  const r = await fetch(`https://www.wixapis.com/stores/v3/products/${ID}`, { method: 'PATCH', headers: H, body: JSON.stringify(body) });
  const d = await j(r);
  console.log('PATCH', r.status);
  if (!r.ok) { console.log(JSON.stringify(d).slice(0, 500)); process.exit(1); }
  const m = (d.product?.modifiers || [])[0];
  console.log('modifier.key:', m?.key, 'freeTextSettings.key:', m?.freeTextSettings?.key);
}
// re-read to confirm
const after = await j(await fetch(`https://www.wixapis.com/stores/v3/products/${ID}`, { headers: H }));
const m = (after.product?.modifiers || []).find((x) => x.name === 'Tasting flavours');
console.log('CONFIRM freeTextSettings.key =', m?.freeTextSettings?.key);
