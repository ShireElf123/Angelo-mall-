# Image asset manifest — Angelo Mall Go (Phase 5)

The machine-readable list lives in [`image-asset-manifest.json`](image-asset-manifest.json);
`src/data/imageAssets.ts` projects it into typed lookups and
`src/data/imageAssets.test.ts` enforces that the manifest, `public/` and the code
agree. This page explains the rules and the current inventory in prose.

## Rules

1. **Manifest first.** An image may only be referenced by the app if it has an
   entry with an `id`, `file`, `purpose`, `screens`, `batch` and `review` status.
   The test suite fails if a file exists in `public/images/` without an entry, or
   if an entry points at a missing file.
2. **No unverified brand assets.** Official logos have their own registry
   (`src/data/shopLogos.ts`) and their own stricter tests: source URL, retrieval
   date, verification flag, file in `public/images/logos/`.
3. **Generated art is labelled as such.** Generated illustrations are app
   artwork. They never carry a shop's name, logo or signage, and they are never
   presented as a photograph of a real shopfront or interior.
4. **No text in generated images.** Generated artwork is deliberately word-free
   (generated lettering renders unreliably); all functional text stays HTML.
5. **Never overwrite a good asset without a reason** — add a new id instead, and
   mark the old one `approved-but-unused` until it is deleted deliberately.

## Batch 1 — 2026-10-27 (10 images requested, 10 generated, 10 reviewed, 10 retained)

All ten were inspected visually for relevance, duplicates, corruption, unwanted
text and watermarks. None contained lettering or brand marks. Sizes were then
optimised in place.

| # | Asset id | File | Purpose | Screens | Review |
| --- | --- | --- | --- | --- | --- |
| 1 | `app-mark-master` | `app-icon-master.jpg` (1024², 78 kB) | Master app mark: paper bag + chat bubble | manifest / social card | approved |
| 2 | `app-icon-512` | `app-icon-512.png` | PWA icon | manifest | approved |
| 3 | `app-icon-192` | `app-icon-192.png` | PWA + apple-touch icon | manifest, iOS home screen | approved |
| 4 | `app-icon-maskable-512` | `app-icon-maskable-512.png` | Maskable icon, 80% safe zone | manifest | approved |
| 5 | `promo-groceries` | `promo-illustration-groceries.jpg` | Placeholder sponsored banner | home, promotion detail | approved |
| 6 | `promo-takeaway` | `promo-illustration-takeaway.jpg` | Second placeholder banner | home, promotion detail | approved |
| 7 | `promo-services` | `promo-illustration-services.jpg` | Services/delivery banner reserve | promotion detail | approved, not yet wired |
| 8 | `help-chat` | `help-illustration-chat.jpg` | Help step 1 | help | approved |
| 9 | `help-summary` | `help-illustration-summary.jpg` | Help step 2 | help | approved |
| 10 | `help-delivery` | `help-illustration-delivery.jpg` | Help step 3 | help | approved |
| 11 | `state-empty-directory` | `illustration-empty-directory.jpg` | No-results empty state | directory | approved |
| 12 | `state-offline` | `illustration-offline.jpg` | Offline state reserve | (shell) | approved, not yet wired |
| 13 | `concept-map` | `illustration-concept-map.jpg` | Concept banner | directory, promotion detail | approved |

Batch 1 actually produced **13 files** because the single app-mark master was
derived into three PWA sizes and a 1024² JPEG (no extra generation calls: the
derivatives are resized copies, recorded with `derivedFrom`).

Carried over from earlier phases (audited, kept unchanged): `hero-mall.jpg` and
the nine category covers `shop-grocery.jpg`, `shop-food.jpg`, `shop-fashion.jpg`,
`shop-electronics.jpg`, `shop-pharmacy.jpg`, `shop-homeware.jpg`,
`shop-beauty.jpg`, `shop-services.jpg`, `shop-finance.jpg`.

## Batch 2 — 2026-10-27 (10 images requested, 10 generated, 10 reviewed, 10 retained)

Batch 1 used the tool's hard limit of 10 generations in that turn, so batch 2 was
specified in `plannedBatches` and generated in the following turn. All ten were
inspected for relevance, duplicates, corruption, lettering and watermarks: every
image was word-free, watermark-free and distinct. Off-palette or unusable output
would have been rejected and re-specified; none was needed.

| # | Asset id | File (final size) | Purpose | Screens | Review |
| --- | --- | --- | --- | --- | --- |
| 1 | `state-empty-basket` | `state-empty-basket.jpg` (1280×720, 31 kB) | Empty basket / basket not found | basket | approved |
| 2 | `state-empty-chats` | `state-empty-chats.jpg` (1280×720, 50 kB) | No conversations yet | chats | approved |
| 3 | `state-empty-orders` | `state-empty-orders.jpg` (1280×720, 36 kB) | Nothing confirmed yet | orders | approved |
| 4 | `state-empty-thread` | `state-empty-thread.jpg` (1280×720, 45 kB) | Conversation with no messages | chat | approved |
| 5 | `state-empty-delivery` | `state-empty-delivery.jpg` (1280×720, 52 kB) | No open delivery jobs | delivery | approved |
| 6 | `og-social-card` | `og-social-card.jpg` (1200×630, 63 kB) | Social preview, empty text zone | `index.html` OG tags | approved |
| 7 | `concept-four-views` | `concept-four-views.jpg` (1280×720, 44 kB) | The four demo workspaces | help | approved |
| 8 | `concept-tenant-onboarding` | `concept-tenant-onboarding.jpg` (1280×720, 54 kB) | What tenant onboarding needs | admin → shops | approved |
| 9 | `concept-privacy` | `concept-privacy.jpg` (1280×720, 26 kB) | Privacy / what is simulated | help | approved |
| 10 | `state-not-found` | `state-not-found.jpg` (1280×720, 49 kB) | Unknown order or promotion | orders, promotion detail | approved |

Generated at 1672×941 and downsized to 1280×720 (the social card cropped to
1200×630) and recompressed, which cut each file by roughly 45%. The Open Graph
and Twitter tags in `index.html` now point at `og-social-card.jpg` instead of
borrowing a promotion illustration.

## Logos — zero bundled, and why

No official retailer logo is in this repository. The environment used for Phase 5
has outbound network access restricted to GitHub, npm and PyPI, so brand websites
and official media kits could not be reached to retrieve and verify a logo file.
Downloading from an image-search thumbnail, a third-party logo CDN or a
screenshot would break the "verified official asset" rule, so nothing was added
and every shop keeps the generated wordmark.

This is a blocker, not a decision about the product: the registry, component,
fallbacks and tests are complete and waiting. See
[`shop-asset-plan.md`](shop-asset-plan.md) for the per-tenant status and the
exact steps to add a verified mark.

## Where the generated artwork is used

| Screen | Asset |
| --- | --- |
| Home promotion stack | `promo-groceries`, `promo-takeaway` |
| Directory banner | `concept-map` |
| Directory empty state | `state-empty-directory` |
| Orders list / order not found | `state-empty-orders`, `state-not-found` |
| Chats list / empty conversation | `state-empty-chats`, `state-empty-thread` |
| Basket not found | `state-empty-basket` |
| Delivery board (no open jobs) | `state-empty-delivery` |
| Help — four views, privacy | `concept-four-views`, `concept-privacy` |
| Admin → shops banner | `concept-tenant-onboarding` |
| Share preview (OG/Twitter) | `og-social-card` |
| Help — how chat ordering works | `help-chat`, `help-summary`, `help-delivery` |
| App header, PWA install | `icon.svg` (SVG) plus the three PNG icons |
