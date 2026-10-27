# Shop asset plan — Angelo Mall Go (Phase 4)

Status: **real tenants, concept app.** Every business in the directory is a
tenant of Angelo Mall, transcribed from the mall's own store directory
(<https://www.angelomall.co.za/>, checked 2026-10-26). **None of them is a Mall Go
partner**: no shop has approved this app, no shop receives chat messages, and no
ordering, payment or delivery is connected. Nothing here implies endorsement,
sponsorship or a trading relationship.

Data source of truth: `src/data/tenants.ts` (`TENANTS[]`, transcribed listings with
source, check date and confidence), projected into `Shop` records by
`src/data/seed.ts` (`SHOPS[]`). Images live in `public/images/`.

| Field | Purpose |
| --- | --- |
| `coverImage` | Shared, logo-free **category** illustration (see below). Not a shop photo. |
| `initials` + `colour` | Monogram for the text wordmark, rendered by `src/components/ShopLogo.tsx`, and the image-error fallback in `ShopCard` / `ShopPage`. |
| `shopNumber`, `phones`, `website` | Transcription of the mall directory entry, shown on the shop page as listing details. |
| `listingConfidence`, `listingCheckedOn`, `listingNote` | Provenance: `cross-verified` (directory + an independent source) or `directory-only`; the date checked; and any conflict or spelling note. |

## Phase 5 update — verified logo slots (currently unfilled)

Phase 5 replaced the ad-hoc wordmark with a proper two-layer system:

| Layer | File | Behaviour |
| --- | --- | --- |
| Verified logo registry | `src/data/shopLogos.ts` | One entry per tenant that has a **verified official** mark: file in `public/images/logos/`, intrinsic aspect ratio, source URL, retrieval date, `verified: true`. Empty today (see below). |
| `ShopLogo` component | `src/components/ShopLogo.tsx` | Renders the verified image when the registry has one, otherwise the monogram fallback. A failed image load silently degrades to the monogram, so a broken-image icon can never appear. |
| Fallback | `src/data/shopLogos.ts` `CATEGORY_MONOGRAM_GLYPH` | Initials plus a small original category glyph (basket, cutlery, hanger, device, cross, tools, scissors, parcel, bank) on the tenant's colour tile. |

**Status: 0 of 29 tenants have a verified logo.** Retrieving the remaining 29
required downloading from brand websites and official media kits, which this
build environment cannot reach (outbound network is limited to GitHub, npm and
PyPI). Substituting an image-search thumbnail, a logo-CDN file or a screenshot
would breach the verification rule, so the slots were left empty rather than
filled with unverified marks. No shop detail, id or participation status changed.

To add one later (no code change beyond the registry):

1. Download the mark from the brand's own site, official press kit, or the tenant
   (with written permission). Confirm it is that brand's current mark.
2. Save as `public/images/logos/<shop-id>.svg` (preferred) or `.png`
   (transparent, ≤ 24 kB).
3. Add `SHOP_LOGO_ASSETS['<shop-id>']` with `aspectRatio`, `sourceUrl`,
   `retrievedOn`, `sourceType` and `verified: true`.
4. Add a row to [`image-asset-manifest.md`](image-asset-manifest.md) and run
   `npm test` — `shopLogos.test.ts` checks the file exists, the aspect ratio is
   sane, the tenant id is real and the asset is verified before it is served.

Prioritised candidates (well-known brands with public brand pages), in the order
they should be attempted: KFC, SUPERSPAR/TOPS at SPAR, Clicks, Vodacom, MTN,
Nedbank, FNB, PEP, PostNet, Ocean Basket, The Crazy Store, Mica, Cash Crusaders,
Scooters Pizza, Golden Buffalo Spur. The remaining independents (Zillion Hair,
Ruiter Makelaars, Flesh Fashions, Neutell & Horowitz, Biltong Den, Maxi's, Aviya,
Nigel Cellular, Just-u-2, Angel Kiss, Best Buy, Crazy Plastics, Carwash) are
likely to have no official digital mark at all and should keep the wordmark.

## Logo and photography policy

* **No retailer logo is bundled or imitated.** The tenants are real, but we hold
  no licence to their brand marks and no written permission, so each shop renders
  a **text wordmark**: a solid monogram tile plus the business name in the app
  typeface. It is a label made by this app, not an official logo.
* The wordmark is real DOM text, so it is readable at 320 px, selectable,
  translatable and available to screen readers. `ShopCard` labels the media tile
  with the shop name and marks the cover `<img>` as decorative.
* Cover images are **generated category scenes** (grocery aisle, restaurant
  table, rail of clothes, electronics shelf, pharmacy shelving, hardware,
  hair-care, service counter, bank counter). They carry no signage, lettering,
  logos, prices or people, and are never presented as a photograph of the named
  shop.
* If a tenant supplies an official logo **and** written permission later, drop it
  in `public/images/logos/` and extend `ShopLogo` to render an `<img>` above the
  monogram; keep the `initials`/`colour` fallback so a missing asset never breaks
  a card. Record the permission in
  [`tenant-onboarding-template.md`](tenant-onboarding-template.md).

## Category imagery

One generated illustration per category, shared by every shop in that category:

| Category | Image | Used by |
| --- | --- | --- |
| groceries | `/images/shop-grocery.jpg` | supermarket, liquor, convenience stores |
| food | `/images/shop-food.jpg` | restaurants, fast food, biltong |
| fashion | `/images/shop-fashion.jpg` | clothing, jewellery, boutiques |
| electronics | `/images/shop-electronics.jpg` | networks, cellular, appliances |
| pharmacy | `/images/shop-pharmacy.jpg` | pharmacy and optometry |
| homeware | `/images/shop-homeware.jpg` | hardware, plastics, variety stores |
| beauty | `/images/shop-beauty.jpg` | hair and beauty supplies |
| services | `/images/shop-services.jpg` | courier, print, property, car wash |
| finance | `/images/shop-finance.jpg` (**new in Phase 4**, generated) | bank branches |

Shared assets:

| Purpose | Path | Notes |
| --- | --- | --- |
| Home hero | `/images/hero-mall.jpg` | Illustrative mall scene. |
| Promotion banners | `shop-grocery.jpg`, `shop-food.jpg`, `hero-mall.jpg` | Placeholder concept slots — no tenant offer is claimed. |
| App icon | `/icon.svg` | Header brand and `manifest.webmanifest`. |

## Inventory: listing → assets

| `shop_id` | Display name | Directory name | Shop no. | Category | Cover image | Monogram |
| --- | --- | --- | --- | --- | --- | --- |
| `shop-kfc` | KFC | KFC | 1 | food | /images/shop-food.jpg | `KFC` |
| `shop-golden-buffalo-spur` | Golden Buffalo Spur | Golden Buffalo Spur | 2 | food | /images/shop-food.jpg | `GBS` |
| `shop-cash-crusaders` | Cash Crusaders | Cash Crusaders | 4 | electronics | /images/shop-electronics.jpg | `CC` |
| `shop-mica` | Mica | Mica | 5 | homeware | /images/shop-homeware.jpg | `MC` |
| `shop-crazy-plastics` | Crazy Plastics Express | Crazy Plastics Express | 5b | homeware | /images/shop-homeware.jpg | `CPX` |
| `shop-zillion-hair` | Zillion Hair | Zillion Hair | 6 | beauty | /images/shop-beauty.jpg | `ZH` |
| `shop-ruiter-makelaars` | Ruiter Makelaars | Ruiter Makelaars FSP 13510 | 6 | services | /images/shop-services.jpg | `RM` |
| `shop-flesh-fashions` | Flesh Fashions | Flesh Fashions | 7 | fashion | /images/shop-fashion.jpg | `FF` |
| `shop-clicks` | Clicks | Clicks | 9a | pharmacy | /images/shop-pharmacy.jpg | `CL` |
| `shop-neutell-horowitz` | Neutell & Horowitz | Neutell & Horowitz | 9b | pharmacy | /images/shop-pharmacy.jpg | `NH` |
| `shop-vodacom` | Vodacom | Vodacom | 10 | electronics | /images/shop-electronics.jpg | `VD` |
| `shop-nedbank` | Nedbank | Nedbank | 11 | finance | /images/shop-finance.jpg | `NB` |
| `shop-tops` | Tops at Spar | Tops | 12 | groceries | /images/shop-grocery.jpg | `TP` |
| `shop-superspar` | The Angelo SUPERSPAR | Superspar | 13 | groceries | /images/shop-grocery.jpg | `SS` |
| `shop-biltong-den` | Biltong Den | Biltong Den | 14 | food | /images/shop-food.jpg | `BD` |
| `shop-maxis` | Maxi's | Maxis | 15 | groceries | /images/shop-grocery.jpg | `MX` |
| `shop-aviya` | Aviya Photography & Graphics | Aviya Photography & Graphics | 16b | services | /images/shop-services.jpg | `AV` |
| `shop-nigel-cellular` | Nigel Cellular | Nigel Cellular | 17 | electronics | /images/shop-electronics.jpg | `NC` |
| `shop-mtn` | MTN @ The Angelo Mall | MTN @ The Angelo Mall | 18a | electronics | /images/shop-electronics.jpg | `MTN` |
| `shop-just-u-2` | Just-u-2 Jewellers | Just-u-2 Jewellers | 19b | fashion | /images/shop-fashion.jpg | `J2` |
| `shop-postnet` | PostNet | Posnet | 22 | services | /images/shop-services.jpg | `PN` |
| `shop-pep` | PEP | Pep | 23 | fashion | /images/shop-fashion.jpg | `PEP` |
| `shop-scooters` | Scooters Pizza | Scooters | 24a | food | /images/shop-food.jpg | `SP` |
| `shop-ocean-basket` | Ocean Basket | Ocean Basket | 24b | food | /images/shop-food.jpg | `OB` |
| `shop-angel-kiss` | Angel Kiss Boutique | Angel Kiss Boutique | 25a | fashion | /images/shop-fashion.jpg | `AK` |
| `shop-crazy-store` | The Crazy Store | Crazy Store | 26 | homeware | /images/shop-homeware.jpg | `CS` |
| `shop-fnb` | FNB | FNB | 28 | finance | /images/shop-finance.jpg | `FNB` |
| `shop-best-buy` | Best Buy | Best Buy | 30 | electronics | /images/shop-electronics.jpg | `BB` |
| `shop-carwash` | Carwash @ Angelo Mall | Carwash @ Angelo Mall | — | services | /images/shop-services.jpg | `CW` |

## Image rules applied

* **Local only.** No remote image URLs anywhere in the app, so nothing breaks
  offline and no third-party hotlinking or licensing risk is introduced.
* **Generated supporting imagery** is an original category scene: no signage, no
  lettering, no invented logos, no watermarks, no people, no real shop interiors.
* **Framing.** `ShopCard` media uses a fixed `16 / 10` aspect ratio with
  `object-fit: cover`; the shop page hero uses `clamp(170px, 32vw, 250px)`, so
  cards never jump when an image loads.
* **Fallbacks.** `onError` hides the broken image and reveals the monogram tile
  behind it, so a deleted file degrades to a readable identity, not an empty box.
* **Weight.** The full-width hero and category covers are kept in the
  210–335 kB range (the later state and process art is much smaller, 26–103 kB);
  directory images are lazy-loaded and `decoding="async"`.

## Batch 6 visual audit — fixes that needed no new artwork

The batch 6 pass checked every shipped asset against the place it is actually
rendered, and every finding was fixable in code, CSS or metadata. No image was
generated, replaced or deleted.

* **Contrast.** `--muted` (#6d7c73) measured 3.84–4.11:1 on the warm surfaces it
  is used on, and `--gold-600` (#a8841c) measured 3.51:1 on white — both below
  the WCAG AA 4.5:1 text threshold. They are now `--muted: #5a6961`
  (4.73–5.83:1) and `--gold-600: #7f6212` (4.81–5.83:1). Same hue family, same
  brand feel, readable text.
* **Aspect ratios follow the source.** `help-troubleshooting` is 4:5 art whose
  subject bleeds to the right edge; the old 16:9 `panel__art--narrow` box sliced
  the accent off. It now uses a new `.panel__art--portrait` (4:5, max 300 px).
* **An unreadable thumbnail is not decoration.** The offline banner rendered
  `state-offline` at 34 px, where its 1672×941 detail became noise. The thumbnail
  is gone and the banner relies on its icon and text, which already say the same
  thing in words.
* **No browser, no claims.** Real-browser and small-Android screenshots were not
  available in this environment, so the audit relied on the files themselves
  (crops at display aspect and at true display sizes) and measured contrast
  rather than asserting how it looks.

## Remaining asset work

1. Per-tenant photography or logos — only with written permission from each
   tenant; until then the wordmark and category imagery stay.
2. Re-check the mall directory before any public launch: it carries no
   "last updated" date, so entries are recorded as "as listed" (see
   [`tenant-directory.md`](tenant-directory.md)).
3. Wide/short crop variants if the directory layout later widens beyond 3 columns.
4. Optional AVIF/WebP derivatives with `<picture>` for smaller payloads.
