// Honeybee Atelier — content seed (stores, CMS, forms, blog). Text-only; images attached in a later pass.
import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const TOKEN = process.env.TOKEN;
const SITE_ID = process.env.SITE_ID;
const STORES_APP_ID = '215238eb-22a5-4c36-9e7b-e7c08025e04e';
if (!TOKEN || !SITE_ID) { console.error('missing TOKEN/SITE_ID'); process.exit(1); }

const base = 'https://www.wixapis.com';
async function api(method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers: {
      Authorization: 'Bearer ' + TOKEN,
      'wix-site-id': SITE_ID,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) {
    console.error(`\n!! ${method} ${path} -> ${res.status}\n${text.slice(0, 800)}`);
  }
  return { ok: res.ok, status: res.status, json };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// rich-text description node for a store product
const descNodes = (text) => ({
  nodes: [{
    type: 'PARAGRAPH', id: 'd' + randomUUID().slice(0, 8),
    nodes: [{ type: 'TEXT', textData: { text } }],
    paragraphData: { textStyle: { textAlignment: 'AUTO' } },
  }],
  metadata: { version: 1, id: randomUUID() },
});

// ---------------------------------------------------------------- data
const CAKES = [
  { name: 'The Golden Hour', occasion: 'Weddings', price: '420.00', servings: 40,
    tagline: 'Our most-requested celebration cake.',
    desc: 'Three tiers of vanilla-bean sponge with layers of raspberry compote and Madagascar vanilla mascarpone, finished in ivory Italian buttercream with fresh blush roses and hand-applied gold leaf.',
    layers: ['vanilla-bean sponge', 'raspberry compote', 'vanilla mascarpone', 'vanilla-bean sponge', 'gold-leaf ivory buttercream'] },
  { name: 'Midnight Ganache', occasion: 'Birthdays', price: '110.00', servings: 12,
    tagline: 'For the serious chocolate lover.',
    desc: 'Dark chocolate sponge layered with salted caramel and whipped dark ganache, coated in a glossy chocolate drip and finished with a gilded chocolate shard.',
    layers: ['chocolate sponge', 'salted caramel', 'dark ganache', 'chocolate sponge', 'ganache drip'] },
  { name: 'Citrus & Cream', occasion: 'Birthdays', price: '95.00', servings: 10,
    tagline: 'Bright, fresh, and just sweet enough.',
    desc: 'Lemon-olive-oil sponge with elderflower curd and vanilla cream, finished semi-naked with candied lemon and edible blooms.',
    layers: ['lemon sponge', 'elderflower curd', 'vanilla cream', 'lemon sponge', 'semi-naked buttercream'] },
  { name: 'Blush Peony', occasion: 'Weddings', price: '380.00', servings: 30,
    tagline: 'Soft, romantic, endlessly photographed.',
    desc: 'Almond sponge with rosewater cream and strawberry preserve, smoothed in blush Italian buttercream and crowned with sugar peonies.',
    layers: ['almond sponge', 'strawberry preserve', 'rosewater cream', 'almond sponge', 'blush buttercream'] },
  { name: 'Wild Berry Naked', occasion: 'Celebrations', price: '120.00', servings: 14,
    tagline: 'Summer on a cake stand.',
    desc: 'Vanilla sponge with mixed-berry compote and mascarpone cream, barely-there naked finish, tumbling with fresh berries and mint.',
    layers: ['vanilla sponge', 'mixed-berry compote', 'mascarpone cream', 'vanilla sponge', 'naked finish'] },
  { name: 'Pistachio Rose', occasion: 'Weddings', price: '340.00', servings: 30,
    tagline: 'Delicate, nutty, quietly luxurious.',
    desc: 'Pistachio sponge layered with rose-cardamom cream and raspberry, finished in pale-green buttercream with crushed pistachio and dried petals.',
    layers: ['pistachio sponge', 'raspberry', 'rose-cardamom cream', 'pistachio sponge', 'pistachio buttercream'] },
  { name: 'Salted Honey', occasion: 'Celebrations', price: '105.00', servings: 12,
    tagline: 'The honeybee’s own cake.',
    desc: 'Brown-butter honey sponge with salted honey buttercream and a burnt-honey drizzle, finished with a honeycomb shard.',
    layers: ['honey sponge', 'salted honey buttercream', 'honey drizzle', 'honey sponge', 'honeycomb shard'] },
  { name: 'Earl Grey & Fig', occasion: 'Celebrations', price: '115.00', servings: 12,
    tagline: 'An afternoon-tea cake, all grown up.',
    desc: 'Earl Grey-infused sponge with fig jam and vanilla-bean cream, finished in warm ivory buttercream with fresh figs.',
    layers: ['earl grey sponge', 'fig jam', 'vanilla-bean cream', 'earl grey sponge', 'ivory buttercream'] },
  { name: 'Champagne Celebration', occasion: 'Weddings', price: '360.00', servings: 30,
    tagline: 'For the moment worth toasting.',
    desc: 'Champagne-soaked vanilla sponge with white-chocolate mousse and raspberry, finished in pearl buttercream with edible gold.',
    layers: ['champagne sponge', 'raspberry', 'white-chocolate mousse', 'champagne sponge', 'pearl buttercream'] },
  { name: 'Little Lemon', occasion: 'Birthdays', price: '85.00', servings: 8,
    tagline: 'A small cake with a big personality.',
    desc: 'A petite two-layer lemon sponge with lemon curd and vanilla cream, finished in sunny buttercream with candied peel.',
    layers: ['lemon sponge', 'lemon curd', 'vanilla cream', 'sunny buttercream'] },
];

const FLAVOR_OPTIONS = [
  { type: 'Sponge', name: 'Vanilla Bean', description: 'Classic, tender, pairs with everything.', isPremium: false, order: 1 },
  { type: 'Sponge', name: 'Dark Chocolate', description: 'Deep cocoa, rich but never heavy.', isPremium: false, order: 2 },
  { type: 'Sponge', name: 'Lemon–Olive Oil', description: 'Bright, moist, subtly savoury.', isPremium: false, order: 3 },
  { type: 'Filling', name: 'Salted Caramel', description: 'Slow-cooked, balanced sweet-and-salt.', isPremium: false, order: 4 },
  { type: 'Filling', name: 'Raspberry Compote', description: 'Bright and tart, made from fresh berries.', isPremium: false, order: 5 },
  { type: 'Filling', name: 'Vanilla Mascarpone', description: 'Silky, light, delicately sweet.', isPremium: false, order: 6 },
  { type: 'Filling', name: 'Elderflower Curd', description: 'Floral and citrus — a seasonal favourite.', isPremium: true, order: 7 },
  { type: 'Finish', name: 'Italian Buttercream', description: 'Smooth and hand-finished to a clean edge.', isPremium: false, order: 8 },
  { type: 'Finish', name: 'Semi-Naked', description: 'A whisper of buttercream, sponge showing through.', isPremium: false, order: 9 },
  { type: 'Finish', name: 'Fresh Florals & Gold Leaf', description: 'Seasonal blooms and hand-applied 24k leaf.', isPremium: true, order: 10 },
];

const CATERING = [
  { name: 'Iced Celebration Cookies', category: 'Cookies', priceFrom: '$48/dozen', minQuantity: '2 dozen', order: 1,
    description: 'Hand-iced vanilla shortbread, custom colours and monograms to match your event palette.' },
  { name: 'Signature Cupcakes', category: 'Cupcakes', priceFrom: '$42/dozen', minQuantity: '3 dozen', order: 2,
    description: 'Rotating flavours piped to order — vanilla-raspberry, dark chocolate, lemon-elderflower.' },
  { name: 'Dessert Table', category: 'Dessert Tables', priceFrom: 'from $650', minQuantity: '—', order: 3,
    description: 'A styled spread of cupcakes, cookies, and a small centerpiece cake, arranged on site.' },
  { name: 'Macaron Tower', category: 'Dessert Tables', priceFrom: 'from $180', minQuantity: '1 tower', order: 4,
    description: 'A cascading tower of French macarons in your colours — a centrepiece and a favour in one.' },
  { name: 'Mini Fruit Tartlets', category: 'Cookies', priceFrom: '$54/dozen', minQuantity: '2 dozen', order: 5,
    description: 'Buttery pastry shells with vanilla-bean custard and glazed seasonal fruit.' },
  { name: 'Celebration Cake Pops', category: 'Cupcakes', priceFrom: '$36/dozen', minQuantity: '3 dozen', order: 6,
    description: 'Dipped and decorated to theme — a playful, poppable bite for any gathering.' },
];

const STORY = {
  heading: 'Made the slow way, only for you',
  body: '<p>Honeybee Atelier began at a home kitchen table, one birthday cake at a time. After earning her certification as a Pastry Chef and years in fine-dining kitchens, Lydia R. wanted to make cakes the slow way — every sponge baked to order, every filling made from scratch, every finish smoothed by hand.</p><p>The name is a small promise: like a honeybee, the work is patient, precise, and quietly devoted to something sweet. Today the atelier takes a limited number of commissions each week so that no cake is ever rushed.</p><p>Whether it’s a first birthday or a wedding, the philosophy is the same — your golden moment deserves something made with real care, and made only for you.</p>',
};

const REVIEWS = [
  { name: 'Maya R.', occasion: 'Wedding, June 2026', order: 1,
    quote: 'It was the most beautiful thing at our wedding, and somehow it tasted even better than it looked. Guests are still talking about it.' },
  { name: 'Daniel & Priya', occasion: '40th birthday', order: 2,
    quote: 'She took our vague idea and a Pinterest board and turned it into exactly what we pictured. The layer reveal on the site sold us instantly.' },
  { name: 'The Lark Events Co.', occasion: 'Corporate event catering', order: 3,
    quote: 'Our go-to for dessert tables. The cookies are edible art and always on brand.' },
];

// ---------------------------------------------------------------- Ricos helpers for blog
let nid = 0;
const uid = () => 'n' + (++nid);
const P = (text) => ({ type: 'PARAGRAPH', id: uid(), nodes: [{ type: 'TEXT', id: '', nodes: [], textData: { text, decorations: [] } }], paragraphData: {} });
const H = (text, level = 2) => ({ type: 'HEADING', id: uid(), nodes: [{ type: 'TEXT', id: '', nodes: [], textData: { text, decorations: [] } }], headingData: { level } });
const QUOTE = (text) => ({ type: 'BLOCKQUOTE', id: uid(), nodes: [P(text)], blockquoteData: { indentation: 1 } });
const OL = (items) => ({ type: 'ORDERED_LIST', id: uid(), nodes: items.map((t) => ({ type: 'LIST_ITEM', id: uid(), nodes: [P(t)] })) });
const UL = (items) => ({ type: 'BULLETED_LIST', id: uid(), nodes: items.map((t) => ({ type: 'LIST_ITEM', id: uid(), nodes: [P(t)] })) });

const POSTS = [
  { title: 'How to store a buttercream cake before the big day',
    excerpt: 'A hand-finished cake is happiest cool, covered, and unhurried. Here is exactly how to keep yours perfect until the moment it is cut.',
    nodes: [
      H('The short answer'),
      P('Keep your cake cold, boxed, and away from anything with a strong smell. Bring it back to a gentle room temperature before serving so the buttercream turns silky again.'),
      H('Step by step'),
      OL([
        'Leave the cake in its box. The box protects the finish and stops the fridge drying it out.',
        'Refrigerate on a flat, level shelf — never the door, where it will wobble every time the fridge opens.',
        'Keep it away from onions, cheese, and leftovers; buttercream absorbs odours quickly.',
        'On the day, take the cake out two to three hours before serving so it loses the fridge chill.',
      ]),
      QUOTE('A cake served straight from the fridge tastes half as good as the same cake given an hour to breathe.'),
      H('A few things to avoid'),
      UL(['Freezing a decorated cake — condensation ruins the finish as it thaws.', 'Sunlight and warm windowsills, which soften buttercream fast.', 'Stacking anything on top of the box.']),
      P('If you have picked up a tiered cake, keep the tiers boxed separately and assemble on site. When in doubt, ask us — we will send storage notes with every order.'),
    ] },
  { title: 'The secret to a level, structured tier',
    excerpt: 'Beautiful tiers are engineering as much as decoration. Here is how we build a cake that stands tall and cuts clean.',
    nodes: [
      H('Structure first, beauty second'),
      P('A tiered cake carries real weight. Before a single flower goes on, we build an internal structure that keeps every layer level and every tier safe.'),
      H('How we do it'),
      OL([
        'Bake and chill each sponge, then torte it into even layers with a leveller.',
        'Fill, stack, and crumb-coat each tier, then chill until firm.',
        'Insert food-safe dowels sized to each tier’s height, with a central rod through the whole cake.',
        'Add the final coat of buttercream and smooth to a clean, sharp edge.',
      ]),
      QUOTE('If the base is not level, nothing above it can be. We spend more time on the foundation than the flowers.'),
      H('Why it matters for you'),
      P('A well-structured cake travels safely, holds through a warm reception, and cuts into clean slices for every guest — no leaning, no surprises.'),
    ] },
  { title: 'Choosing flavours that taste as good as they look',
    excerpt: 'A stunning cake should be just as memorable on the fork. A short guide to pairing sponges, fillings, and finishes.',
    nodes: [
      H('Start with the sponge'),
      P('Your sponge sets the tone. Vanilla bean flatters everything; dark chocolate wants a contrast; lemon-olive-oil brings brightness that cuts richness.'),
      H('Then balance the filling'),
      UL(['Pair rich sponges with something sharp — chocolate with raspberry, or salted caramel for depth.', 'Pair light sponges with something creamy — vanilla mascarpone or elderflower curd.', 'Aim for one contrast: sweet against tart, or soft against a little crunch.']),
      H('Finish for the occasion'),
      P('A wedding leans classic — Italian buttercream, fresh florals, a touch of gold. A birthday can be playful. Tell us the moment and we will help you land the pairing.'),
      QUOTE('The best cake is the one your guests go back for a second slice of.'),
    ] },
  { title: 'A guide to cake sizes: how many does your cake serve?',
    excerpt: 'How many tiers, how many servings, and how to choose without over- or under-ordering.',
    nodes: [
      H('Servings, honestly'),
      P('Cake servings assume a standard dessert-sized slice. If cake is the main event, plan a little more; if it follows a full meal, our numbers are generous.'),
      H('A rough guide'),
      UL(['Single tier — serves 8 to 14, ideal for birthdays and small gatherings.', 'Two tiers — serves 20 to 40, a celebration centrepiece.', 'Three tiers — serves 40 and up, the classic wedding scale.']),
      H('When to size up'),
      OL(['You want slices to take home.', 'The cake is the only dessert.', 'You would rather have a little left over than run short.']),
      P('Not sure? Tell us your headcount in the Build Your Own form and we will recommend a size.'),
    ] },
  { title: 'Behind the semi-naked finish',
    excerpt: 'That barely-there buttercream look is deceptively technical. Here is how it is done — and how to keep it fresh.',
    nodes: [
      H('What "semi-naked" means'),
      P('A semi-naked cake wears the thinnest possible coat of buttercream, so the sponge shows through in soft patches. It feels effortless and rustic — and it is anything but.'),
      H('The technique'),
      OL(['Apply a firm crumb coat and chill until set.', 'Add a whisper-thin second coat and scrape back with a bench scraper.', 'Leave just enough buttercream to catch the light without hiding the crumb.']),
      QUOTE('A semi-naked cake has nowhere to hide — the sponge has to be as good as the finish.'),
      H('Keeping it fresh'),
      P('Because more sponge is exposed, a semi-naked cake is best served the day it is made. We time these bakes to your event, never in advance.'),
    ] },
  { title: 'Why we ask for 7 days (and 2–4 weeks for weddings)',
    excerpt: 'Lead time is not red tape — it is what lets us make everything by hand, only for you.',
    nodes: [
      H('The honest reason'),
      P('We take a limited number of commissions each week so nothing is ever rushed. Every sponge is baked to order and every finish is done by hand, which simply takes time.'),
      H('What the timeline buys you'),
      UL(['A tasting and a proper design conversation.', 'Time to source seasonal flowers and special ingredients.', 'A baking schedule that puts your cake at its freshest on the day.']),
      H('Our guidelines'),
      OL(['Standard cakes — at least 7 days’ notice.', 'Weddings and tiered cakes — 2 to 4 weeks.', 'Rush requests — always ask; we will do our best.']),
      QUOTE('The earlier you reach out, the better we can hold your date.'),
    ] },
];

const FORMS = [
  { name: 'Contact the Atelier', fields: [
    { target: 'first_name', label: 'Name', identifier: 'CONTACTS_FIRST_NAME', required: true, pii: true, format: 'UNKNOWN_FORMAT' },
    { target: 'email', label: 'Email', identifier: 'CONTACTS_EMAIL', required: true, pii: true, format: 'EMAIL' },
    { target: 'phone', label: 'Phone', identifier: 'CONTACTS_PHONE', required: false, pii: true, format: 'PHONE' },
    { target: 'subject', label: 'Subject', required: false, format: 'UNKNOWN_FORMAT' },
    { target: 'message', label: 'Message', required: true, format: 'UNKNOWN_FORMAT' },
  ] },
  { name: 'Build Your Own Estimate', fields: [
    { target: 'first_name', label: 'Name', identifier: 'CONTACTS_FIRST_NAME', required: true, pii: true, format: 'UNKNOWN_FORMAT' },
    { target: 'email', label: 'Email', identifier: 'CONTACTS_EMAIL', required: true, pii: true, format: 'EMAIL' },
    { target: 'phone', label: 'Phone', identifier: 'CONTACTS_PHONE', required: false, pii: true, format: 'PHONE' },
    { target: 'occasion', label: 'Occasion', required: true, format: 'UNKNOWN_FORMAT' },
    { target: 'event_date', label: 'Event date', required: true, format: 'UNKNOWN_FORMAT' },
    { target: 'servings', label: 'Approx. servings', required: true, format: 'UNKNOWN_FORMAT' },
    { target: 'size_or_tiers', label: 'Size or tiers', required: false, format: 'UNKNOWN_FORMAT' },
    { target: 'flavors', label: 'Flavours & fillings', required: false, format: 'UNKNOWN_FORMAT' },
    { target: 'finish', label: 'Finish', required: false, format: 'UNKNOWN_FORMAT' },
    { target: 'budget_range', label: 'Budget range', required: false, format: 'UNKNOWN_FORMAT' },
    { target: 'vision_text', label: 'Tell us your vision', required: false, format: 'UNKNOWN_FORMAT' },
  ] },
  { name: 'Catering Inquiry', fields: [
    { target: 'first_name', label: 'Name', identifier: 'CONTACTS_FIRST_NAME', required: true, pii: true, format: 'UNKNOWN_FORMAT' },
    { target: 'email', label: 'Email', identifier: 'CONTACTS_EMAIL', required: true, pii: true, format: 'EMAIL' },
    { target: 'phone', label: 'Phone', identifier: 'CONTACTS_PHONE', required: false, pii: true, format: 'PHONE' },
    { target: 'event_type', label: 'Event type', required: true, format: 'UNKNOWN_FORMAT' },
    { target: 'event_date', label: 'Event date', required: true, format: 'UNKNOWN_FORMAT' },
    { target: 'guest_count', label: 'Guest count', required: true, format: 'UNKNOWN_FORMAT' },
    { target: 'items', label: 'Items (cookies / cupcakes / dessert table)', required: false, format: 'UNKNOWN_FORMAT' },
    { target: 'message', label: 'Message', required: false, format: 'UNKNOWN_FORMAT' },
  ] },
];

const summary = { collections: {}, forms: [], products: [], categories: {}, blogPosts: [] };

// ---------------------------------------------------------------- STORES
async function seedStores() {
  console.log('\n=== STORES ===');
  // 1. clean samples
  const q = await api('POST', '/stores/v3/products/query', { query: { paging: { limit: 100 } } });
  const ids = (q.json?.products || []).map((p) => p.id);
  if (ids.length) {
    await api('POST', '/stores/v3/bulk/products/delete', { productIds: ids });
    console.log(`deleted ${ids.length} sample products`);
  }
  // 2. create products (text-only, single variant each)
  const products = CAKES.map((c) => ({
    name: c.name,
    productType: 'PHYSICAL',
    physicalProperties: {},
    visible: true,
    visibleInPos: true,
    description: descNodes(c.desc),
    variantsInfo: { variants: [{ price: { actualPrice: { amount: c.price } }, visible: true, inventoryItem: { quantity: 100, preorderInfo: { enabled: false } }, physicalProperties: {} }] },
  }));
  const cr = await api('POST', '/stores/v3/bulk/products-with-inventory/create', { products, returnEntity: true });
  const results = cr.json?.productResults?.results || [];
  for (const r of results) {
    if (r.itemMetadata?.success) summary.products.push({ id: r.item.id, slug: r.item.slug, name: r.item.name });
  }
  console.log(`created ${summary.products.length} products`);
  // 3. categories (by occasion)
  await sleep(2000);
  const occasions = ['Weddings', 'Birthdays', 'Celebrations'];
  for (const name of occasions) {
    const res = await api('POST', '/categories/v1/categories', {
      category: { name, description: `${name} cakes from Honeybee Atelier.`, visible: true },
      treeReference: { appNamespace: '@wix/stores', treeKey: null },
    });
    if (res.ok) summary.categories[name] = res.json.category.id;
    await sleep(800);
  }
  // 4. assign products to categories
  for (const name of occasions) {
    const catId = summary.categories[name];
    if (!catId) continue;
    const items = summary.products
      .filter((p) => CAKES.find((c) => c.name === p.name)?.occasion === name)
      .map((p) => ({ catalogItemId: p.id, appId: STORES_APP_ID }));
    if (!items.length) continue;
    await api('POST', `/categories/v1/bulk/categories/${catId}/add-items`, { items, treeReference: { appNamespace: '@wix/stores', treeKey: null } });
    await sleep(800);
  }
  console.log('categories:', summary.categories);
}

// ---------------------------------------------------------------- CMS
async function createCollection(id, displayName, fields) {
  const res = await api('POST', '/wix-data/v2/collections', {
    collection: { id, displayName, fields, permissions: { insert: 'ADMIN', update: 'ADMIN', remove: 'ADMIN', read: 'ANYONE' } },
  });
  if (!res.ok && res.status === 403) { await sleep(4000); return createCollection(id, displayName, fields); }
  return res;
}
async function insertItems(collectionId, dataItems) {
  let res = await api('POST', '/wix-data/v2/bulk/items/insert', { dataCollectionId: collectionId, dataItems, returnEntity: true });
  if (!res.ok && (res.status === 400 || res.status >= 500)) { await sleep(4000); res = await api('POST', '/wix-data/v2/bulk/items/insert', { dataCollectionId: collectionId, dataItems, returnEntity: true }); }
  return res;
}
async function seedCMS() {
  console.log('\n=== CMS ===');
  // SignatureCakes (companion metadata for the layer cutaway; keyed by name -> product)
  await createCollection('SignatureCakes', 'Signature Cakes', [
    { key: 'name', displayName: 'Name', type: 'TEXT' },
    { key: 'occasion', displayName: 'Occasion', type: 'TEXT' },
    { key: 'servings', displayName: 'Servings', type: 'NUMBER' },
    { key: 'tagline', displayName: 'Tagline', type: 'TEXT' },
    { key: 'layers', displayName: 'Layers', type: 'ARRAY_STRING' },
    { key: 'order', displayName: 'Order', type: 'NUMBER' },
  ]);
  summary.collections.SignatureCakes = { id: 'SignatureCakes', fields: ['name', 'occasion', 'servings', 'tagline', 'layers', 'order'] };

  await createCollection('FlavorOptions', 'Flavor Options', [
    { key: 'type', displayName: 'Type', type: 'TEXT' },
    { key: 'name', displayName: 'Name', type: 'TEXT' },
    { key: 'description', displayName: 'Description', type: 'TEXT' },
    { key: 'isPremium', displayName: 'Is Premium', type: 'BOOLEAN' },
    { key: 'order', displayName: 'Order', type: 'NUMBER' },
  ]);
  summary.collections.FlavorOptions = { id: 'FlavorOptions', fields: ['type', 'name', 'description', 'isPremium', 'order'] };

  await createCollection('CateringItems', 'Catering Items', [
    { key: 'name', displayName: 'Name', type: 'TEXT' },
    { key: 'category', displayName: 'Category', type: 'TEXT' },
    { key: 'priceFrom', displayName: 'Price From', type: 'TEXT' },
    { key: 'minQuantity', displayName: 'Minimum Quantity', type: 'TEXT' },
    { key: 'description', displayName: 'Description', type: 'TEXT' },
    { key: 'image', displayName: 'Image', type: 'IMAGE' },
    { key: 'order', displayName: 'Order', type: 'NUMBER' },
  ]);
  summary.collections.CateringItems = { id: 'CateringItems', fields: ['name', 'category', 'priceFrom', 'minQuantity', 'description', 'image', 'order'] };

  await createCollection('StoryBlocks', 'Story Blocks', [
    { key: 'heading', displayName: 'Heading', type: 'TEXT' },
    { key: 'body', displayName: 'Body', type: 'RICH_TEXT' },
  ]);
  summary.collections.StoryBlocks = { id: 'StoryBlocks', fields: ['heading', 'body'] };

  await createCollection('Reviews', 'Reviews', [
    { key: 'name', displayName: 'Name', type: 'TEXT' },
    { key: 'quote', displayName: 'Quote', type: 'TEXT' },
    { key: 'occasion', displayName: 'Occasion', type: 'TEXT' },
    { key: 'order', displayName: 'Order', type: 'NUMBER' },
  ]);
  summary.collections.Reviews = { id: 'Reviews', fields: ['name', 'quote', 'occasion', 'order'] };

  // insert items
  await insertItems('SignatureCakes', CAKES.map((c, i) => ({ data: { name: c.name, occasion: c.occasion, servings: c.servings, tagline: c.tagline, layers: c.layers, order: i + 1 } })));
  await insertItems('FlavorOptions', FLAVOR_OPTIONS.map((f) => ({ data: { type: f.type, name: f.name, description: f.description, isPremium: f.isPremium, order: f.order } })));
  await insertItems('CateringItems', CATERING.map((c) => ({ data: { name: c.name, category: c.category, priceFrom: c.priceFrom, minQuantity: c.minQuantity, description: c.description, order: c.order } })));
  await api('POST', '/wix-data/v2/items', { dataCollectionId: 'StoryBlocks', dataItem: { data: { heading: STORY.heading, body: STORY.body } } });
  await insertItems('Reviews', REVIEWS.map((r) => ({ data: { name: r.name, quote: r.quote, occasion: r.occasion, order: r.order } })));
  console.log('CMS collections seeded');
}

// ---------------------------------------------------------------- FORMS
async function seedForms() {
  console.log('\n=== FORMS ===');
  const list = await api('GET', '/form-schema-service/v4/forms?namespace=wix.form_app.form');
  for (const f of (list.json?.forms || [])) await api('DELETE', `/form-schema-service/v4/forms/${f.id}`);

  for (const form of FORMS) {
    const fieldIds = form.fields.map(() => randomUUID().toLowerCase());
    const submitId = randomUUID().toLowerCase();
    const stepId = randomUUID().toLowerCase();
    const formFields = [
      { id: submitId, hidden: false, identifier: 'SUBMIT_BUTTON', fieldType: 'DISPLAY',
        displayOptions: { displayFieldType: 'PAGE_NAVIGATION', pageNavigationOptions: { nextPageText: 'Next', previousPageText: 'Back', submitText: 'Submit' } } },
      ...form.fields.map((f, i) => {
        const field = { id: fieldIds[i], hidden: false, fieldType: 'INPUT',
          inputOptions: { target: f.target, pii: !!f.pii, required: !!f.required, inputType: 'STRING', readOnly: false,
            stringOptions: { validation: { format: f.format, enum: [] }, componentType: 'TEXT_INPUT', textInputOptions: { label: f.label, showLabel: true } } } };
        if (f.identifier) field.identifier = f.identifier;
        return field;
      }),
    ];
    const items = [
      ...form.fields.map((f, i) => ({ fieldId: fieldIds[i], row: i, column: 0, width: 12, height: 1 })),
      { fieldId: submitId, row: form.fields.length, column: 0, width: 12, height: 1 },
    ];
    const res = await api('POST', '/form-schema-service/v4/forms', {
      form: { name: form.name, namespace: 'wix.form_app.form', formFields, steps: [{ id: stepId, name: 'Page 1', layout: { large: { items, sections: [] } } }], enabled: true },
    });
    if (res.ok) {
      summary.forms.push({ name: form.name, id: res.json.form.id, targets: form.fields.map((f) => ({ target: f.target, label: f.label, required: !!f.required })) });
      console.log(`form "${form.name}" -> ${res.json.form.id}`);
    }
  }
}

// ---------------------------------------------------------------- BLOG
async function seedBlog() {
  console.log('\n=== BLOG ===');
  const m = await api('GET', '/members/v1/members?fieldsets=PUBLIC&paging.limit=1');
  const memberId = m.json?.members?.[0]?.id;
  if (!memberId) { console.error('no member id found'); return; }
  console.log('author memberId:', memberId);
  const draftPosts = POSTS.map((p) => ({ title: p.title, memberId, excerpt: p.excerpt, richContent: { nodes: p.nodes } }));
  let res = await api('POST', '/blog/v3/bulk/draft-posts/create', { draftPosts, publish: true });
  if (!res.ok && res.status === 401) { await sleep(3000); res = await api('POST', '/blog/v3/bulk/draft-posts/create', { draftPosts, publish: true }); }
  const rs = res.json?.results || [];
  for (const r of rs) if (r.itemMetadata?.success) summary.blogPosts.push({ id: r.itemMetadata.id });
  console.log(`created ${summary.blogPosts.length} blog posts`);
}

// ---------------------------------------------------------------- run
await seedStores();
await seedCMS();
await seedForms();
await seedBlog();

writeFileSync(new URL('./seed-summary.json', import.meta.url), JSON.stringify(summary, null, 2));
console.log('\n=== SUMMARY ===');
console.log(JSON.stringify(summary, null, 2));
