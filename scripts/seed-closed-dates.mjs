const TOKEN = process.env.TOKEN, SITE_ID = process.env.SITE_ID;
const H = { Authorization: 'Bearer ' + TOKEN, 'wix-site-id': SITE_ID, 'Content-Type': 'application/json' };
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function createCollection() {
  const body = { collection: { id: 'ClosedDates', displayName: 'Closed / Fully-Booked Dates', fields: [
    { key: 'date', displayName: 'Date (YYYY-MM-DD)', type: 'TEXT' },
    { key: 'reason', displayName: 'Reason', type: 'TEXT' },
  ], permissions: { insert: 'ADMIN', update: 'ADMIN', remove: 'ADMIN', read: 'ANYONE' } } };
  let r = await fetch('https://www.wixapis.com/wix-data/v2/collections', { method: 'POST', headers: H, body: JSON.stringify(body) });
  if (!r.ok && r.status === 403) { await sleep(4000); r = await fetch('https://www.wixapis.com/wix-data/v2/collections', { method: 'POST', headers: H, body: JSON.stringify(body) }); }
  console.log('collection:', r.status);
  return r.ok || r.status === 409;
}

const iso = (d) => d.toISOString().slice(0, 10);
function nextWeekday(base, targetDow) { // 0..6
  const d = new Date(base);
  while (d.getDay() !== targetDow) d.setDate(d.getDate() + 1);
  return d;
}

await createCollection();
const q = await j(await fetch('https://www.wixapis.com/wix-data/v2/items/query', { method: 'POST', headers: H, body: JSON.stringify({ dataCollectionId: 'ClosedDates' }) }));
if ((q.dataItems || []).length > 0) {
  console.log('already has', q.dataItems.length, 'closed dates — leaving as is');
} else {
  // seed one example "fully booked" date ~2 weeks out, on a Saturday (a popular day)
  const twoWeeks = new Date(); twoWeeks.setDate(twoWeeks.getDate() + 14);
  const sat = nextWeekday(twoWeeks, 6);
  const items = [{ data: { date: iso(sat), reason: 'Fully booked' } }];
  const ins = await j(await fetch('https://www.wixapis.com/wix-data/v2/bulk/items/insert', { method: 'POST', headers: H, body: JSON.stringify({ dataCollectionId: 'ClosedDates', dataItems: items, returnEntity: false }) }));
  console.log('seeded closed dates:', JSON.stringify(items.map((i) => i.data)), 'ok:', ins.bulkActionMetadata?.totalSuccesses);
}
