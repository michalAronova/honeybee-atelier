# Honeybee Atelier — backend seed scripts

These scripts seeded the Wix backend. They are dev tooling (not part of the site build).

Run from the project root with a freshly minted site token:

```bash
SITE_ID="0b6e5e8c-8673-4e6c-a2fd-43bdcfde9d1b"
TOKEN=$(npx @wix/cli@latest token --site "$SITE_ID") SITE_ID="$SITE_ID" node scripts/seed-images.mjs
```

- **seed-content.mjs** — creates products, CMS collections, forms, and blog posts (already run).
- **seed-images.mjs** — generates AI images (Wix AI credits, ~1 each) and attaches them to
  products, catering items, and blog covers, and writes page-surface URLs to
  `src/data/page-images.json`. **Idempotent**: it skips entities that already have an image,
  so re-running only fills the gaps. Requires the Wix account to have AI image credits.
- **seed-summary.json** — the seeded ids/collection names/form ids the frontend binds to.

Note: entity images (products/catering/blog covers) appear on the live site immediately
(fetched at runtime). Page-surface images (hero, chef portrait, catering banner) are a
build-time import from `src/data/page-images.json`, so after re-running imagery, also run
`npm run build && npm run release` to publish those.
