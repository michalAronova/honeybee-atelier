const TOKEN = process.env.TOKEN, SITE_ID = process.env.SITE_ID;
const H = { Authorization: 'Bearer ' + TOKEN, 'wix-site-id': SITE_ID, 'Content-Type': 'application/json' };
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DATE_MODIFIER = {
  name: 'Requested date',
  modifierRenderType: 'FREE_TEXT',
  mandatory: false,
  freeTextSettings: { title: 'Requested date', minCharCount: 0, maxCharCount: 200 },
};

const q = await j(await fetch('https://www.wixapis.com/stores/v3/products/query', { method: 'POST', headers: H, body: JSON.stringify({ query: { paging: { limit: 100 } } }) }));
const products = q.products || [];
console.log('products:', products.length);

for (const p of products) {
  const mods = p.modifiers || [];
  if (mods.some((m) => m.name === 'Requested date')) { console.log('skip (has date):', p.name); continue; }
  const cur = await j(await fetch(`https://www.wixapis.com/stores/v3/products/${p.id}`, { headers: H }));
  const full = cur.product;
  // keep existing modifiers (strip read-only key so it recreates cleanly) + add the date one
  const keepMods = (full.modifiers || []).map((m) => {
    const { key, ...rest } = m; return rest;
  });
  const body = { product: {
    revision: full.revision,
    options: full.options,
    variantsInfo: full.variantsInfo,
    modifiers: [...keepMods, DATE_MODIFIER],
  } };
  const r = await fetch(`https://www.wixapis.com/stores/v3/products/${p.id}`, { method: 'PATCH', headers: H, body: JSON.stringify(body) });
  if (!r.ok) { console.error('FAIL', p.name, r.status, (await r.text()).slice(0, 200)); }
  else { console.log('added date modifier:', p.name); }
  await sleep(300);
}

// confirm the key on one product
const check = await j(await fetch(`https://www.wixapis.com/stores/v3/products/${products[0].id}`, { headers: H }));
const dm = (check.product?.modifiers || []).find((m) => m.name === 'Requested date');
console.log('DATE freeTextSettings.key =', dm?.freeTextSettings?.key);
