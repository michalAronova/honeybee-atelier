const TOKEN = process.env.TOKEN, SITE_ID = process.env.SITE_ID;
const H = { Authorization: 'Bearer ' + TOKEN, 'wix-site-id': SITE_ID, 'Content-Type': 'application/json' };
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FLAVORS = [
  { name: 'Vanilla Bean & Raspberry', description: 'Tender vanilla sponge, fresh raspberry.', isDefault: true, order: 1 },
  { name: 'Dark Chocolate & Salted Caramel', description: 'Deep cocoa, slow-cooked caramel.', isDefault: true, order: 2 },
  { name: 'Lemon & Elderflower', description: 'Zesty lemon, floral elderflower.', isDefault: true, order: 3 },
  { name: 'Pistachio & Rose', description: 'Nutty pistachio, delicate rose.', isDefault: true, order: 4 },
  { name: 'Salted Honey', description: 'Brown-butter honey, a pinch of salt.', isDefault: true, order: 5 },
  { name: 'Earl Grey & Fig', description: 'Bergamot tea, jammy fig.', isDefault: true, order: 6 },
  { name: 'Champagne & White Chocolate', description: 'Celebratory and light.', isDefault: true, order: 7 },
  { name: 'Strawberries & Cream', description: 'A summer classic.', isDefault: true, order: 8 },
  { name: 'Almond & Cherry', description: 'Marzipan warmth, tart cherry.', isDefault: true, order: 9 },
  { name: 'Chai Spice', description: 'Warm cardamom and cinnamon.', isDefault: false, order: 10 },
  { name: 'Coffee & Walnut', description: 'Rich espresso, toasted walnut.', isDefault: false, order: 11 },
  { name: 'Coconut & Passionfruit', description: 'Tropical and bright.', isDefault: false, order: 12 },
  { name: 'Red Velvet', description: 'Cocoa-kissed, cream-cheese finish.', isDefault: false, order: 13 },
  { name: 'Hazelnut Praline', description: 'Toasted hazelnut, caramelised sugar.', isDefault: false, order: 14 },
];

// create collection (retry once on provisioning race)
async function createCollection() {
  const body = { collection: { id: 'TastingFlavors', displayName: 'Tasting Flavors', fields: [
    { key: 'name', displayName: 'Name', type: 'TEXT' },
    { key: 'description', displayName: 'Description', type: 'TEXT' },
    { key: 'isDefault', displayName: 'Default in box', type: 'BOOLEAN' },
    { key: 'order', displayName: 'Order', type: 'NUMBER' },
  ], permissions: { insert: 'ADMIN', update: 'ADMIN', remove: 'ADMIN', read: 'ANYONE' } } };
  let r = await fetch('https://www.wixapis.com/wix-data/v2/collections', { method: 'POST', headers: H, body: JSON.stringify(body) });
  if (!r.ok && r.status === 403) { await sleep(4000); r = await fetch('https://www.wixapis.com/wix-data/v2/collections', { method: 'POST', headers: H, body: JSON.stringify(body) }); }
  const d = await j(r);
  console.log('collection:', r.status, r.ok ? 'ok' : JSON.stringify(d).slice(0, 200));
  return r.ok || r.status === 409; // 409 = already exists
}

// idempotent: skip if already populated
const exists = await createCollection();
const q = await j(await fetch('https://www.wixapis.com/wix-data/v2/items/query', { method: 'POST', headers: H, body: JSON.stringify({ dataCollectionId: 'TastingFlavors' }) }));
if ((q.dataItems || []).length >= FLAVORS.length) {
  console.log('already seeded:', q.dataItems.length, 'items');
} else {
  const ins = await j(await fetch('https://www.wixapis.com/wix-data/v2/bulk/items/insert', { method: 'POST', headers: H, body: JSON.stringify({
    dataCollectionId: 'TastingFlavors', dataItems: FLAVORS.map((f) => ({ data: f })), returnEntity: false }) }));
  console.log('inserted:', ins.bulkActionMetadata?.totalSuccesses, 'failures:', ins.bulkActionMetadata?.totalFailures);
}
