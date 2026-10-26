# Shop asset plan — Angelo Mall Go (Phase 2)

Status: **demo content only.** Every tenant below is an invented demonstration
tenant. No shop below is a confirmed Angelo Mall tenant or Mall Go partner, and
nothing here implies endorsement, sponsorship or a real trading relationship.

Data source of truth: `src/data/seed.ts` (`shops[]`, one `Shop` record each,
typed by `Shop` in `src/types.ts`). Images live in `public/images/`.
The plan deliberately reuses the existing `Shop` shape — no parallel data model
was introduced. Two fields carry the identity:

| Field | Purpose in the demo |
| --- | --- |
| `coverImage` | Local storefront/category image used by the directory card, shop page hero and category tiles. |
| `initials` + `colour` | Monogram wordmark background. Rendered by `src/components/ShopLogo.tsx` (text wordmark) and by the image-error fallback in `ShopCard` / `ShopPage`. |

## Logo policy

* **No shop has a verified official logo**, because none of these shops are real
  tenants. Inventing or AI-approximating a real retailer mark is explicitly out
  of scope, so every shop uses a **clean text wordmark**: a solid monogram tile in
  the shop's demo colour plus the shop name in the app typeface.
* The wordmark is real DOM text, so it is readable at 320 px, selectable,
  translatable and available to screen readers. `ShopCard` labels the media tile
  with the shop name and marks the cover `<img>` as decorative.
* If a genuine, licensed logo is supplied later, drop it in `public/images/logos/`
  and extend `ShopLogo` to render an `<img>` **above** the monogram; the
  `initials`/`colour` fallback must remain so a missing asset never breaks a card.

## Inventory and asset plan

| Shop (`id`) | Category | Wordmark | Storefront / banner image | Optional category image | Fallback |
| --- | --- | --- | --- | --- | --- |
| Mzansi Fresh Grocers (`shop-mzansi-fresh`) | groceries | `MF`, `#14532d` | `/images/shop-grocery.jpg` | — | monogram tile `MF` + hidden broken `<img>` |
| Flame & Co. Grill (`shop-flame-co`) | food | `FC`, `#9a3412` | `/images/shop-food.jpg` | — | monogram tile `FC` |
| Nigel Style Studio (`shop-style-studio`) | fashion | `NS`, `#7c2d12` | `/images/shop-fashion.jpg` | — | monogram tile `NS` |
| TechPoint Electronics (`shop-techpoint`) | electronics | `TP`, `#1e3a5f` | `/images/shop-electronics.jpg` (replaced in Phase 1 — the earlier image carried third-party branding) | — | monogram tile `TP` |
| CarePlus Pharmacy (`shop-careplus`) | pharmacy | `CP`, `#0f766e` | `/images/shop-pharmacy.jpg` | — | monogram tile `CP` |
| Home Comforts (`shop-home-comforts`) | homeware | `HC`, `#92400e` | `/images/shop-homeware.jpg` | — | monogram tile `HC` |
| Glow Beauty Bar (`shop-glow-beauty`) | beauty | `GB`, `#9d174d` | `/images/shop-beauty.jpg` **(new, generated in Phase 2)** | — | monogram tile `GB` |
| Fix & Print Services (`shop-fix-print`) | services | `FP`, `#374151` | `/images/shop-services.jpg` **(new, generated in Phase 2)** | — | monogram tile `FP` |

Shared assets:

| Purpose | Path | Notes |
| --- | --- | --- |
| Home hero | `/images/hero-mall.jpg` | Illustrative mall scene. |
| Category tiles (Home screen) | maps 1:1 to the shop images above (`CATEGORY_ICONS` in `src/screens/customer/Home.tsx`) | Beauty and services tiles previously reused the pharmacy and electronics photos; they now have their own images. |
| Promotion banners | `shop-food.jpg`, `shop-grocery.jpg`, `hero-mall.jpg` (see `promotions[]` in `seed.ts`) | Local only, no external URLs. |
| App icon | `/icon.svg` | Used by the header brand and `manifest.webmanifest`. |

## Image rules applied

* **Local only.** No remote image URLs anywhere in the app, so nothing breaks
  offline and no third-party hotlinking or licensing risk is introduced.
* **Generated supporting imagery** (Phase 2) is an original category scene:
  no signage, no lettering, no invented logos, no watermarks, no people.
  Beauty and services are category illustrations, not photos of a real shop.
* **Framing.** `ShopCard` media uses a fixed `16 / 10` aspect ratio with
  `object-fit: cover`; the shop page hero uses `clamp(170px, 32vw, 250px)`.
  Cards therefore never jump when an image loads.
* **Fallbacks.** `onError` hides the broken image and reveals the monogram tile
  behind it, so a deleted file degrades to a readable identity, not an empty box.
* **Weight.** JPEGs are kept in the 230–340 kB range; the largest single asset is
  `hero-mall.jpg` at ~340 kB and the directory images are lazy-loaded and
  `decoding="async"`.

## Remaining asset work (not blocking Phase 2)

1. Per-shop product photography (the app is chat-first and has no catalogue grid,
   so this is optional polish rather than a gap).
2. Wide/short crop variants for very wide desktop cards, if the design later
   widens beyond 3 columns.
3. Verified official logos + written tenant permission — only possible once a
   real tenant opts in; until then the wordmark stays.
4. Optional AVIF/WebP derivatives with `<picture>` for smaller payloads.
