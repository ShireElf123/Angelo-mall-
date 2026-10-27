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
| 1 | `app-mark-master` | `app-icon-master.jpg` (1024², 78 kB) | Master app mark: paper bag + chat bubble | — (source master, no screen) | approved, not rendered |
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
| 12 | `state-offline` | `illustration-offline.jpg` | Offline state reserve, no screen today | — (reserve) | approved, unused |
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

## Batch 3 — 2026-10-27 (10 images requested, 10 generated, 10 reviewed, 10 retained)

Batch 3 is the shop-discovery set: an illustrated way into the directory, five
"need" shortcuts, wayfinding, the basket and delivery journeys, and a welcome
image. All ten were inspected for relevance, duplicates, corruption, accidental
lettering and watermarks: every one is word-free, brand-free and on-palette.
Originals (1536×1024 / 1774×887 / 1693×929) were cropped to their target aspect
and recompressed; nothing was upscaled.

| 1 | `discover-shops` | `discover-shops.jpg` (1000x667 (3:2), 67 kB) | One shopper with a phone in front of stylised mall shopfronts — finding a shop and starting a chat. | directory | approved |
| 2 | `need-food` | `category-food.jpg` (900x675 (4:3), 55 kB) | Food & dining need shortcut: café table with takeaway box, burger and cup. | home | approved |
| 3 | `need-fashion` | `category-fashion.jpg` (900x675 (4:3), 86 kB) | Fashion & accessories need shortcut: shirt, sneaker, sunglasses, bag, scarf. | home | approved |
| 4 | `need-electronics` | `category-electronics.jpg` (900x675 (4:3), 49 kB) | Electronics & mobile need shortcut: blank-screen phone, earbuds, cable, power bank. | home | approved |
| 5 | `need-beauty` | `category-beauty.jpg` (900x675 (4:3), 58 kB) | Beauty & personal care need shortcut: pump bottle, serum, cream tube, compact mirror. | home | approved |
| 6 | `need-home-hardware` | `category-home-hardware.jpg` (900x675 (4:3), 72 kB) | Home & hardware need shortcut: paint tin, brush, hammer and potted plant. | home | approved |
| 7 | `journey-navigation` | `journey-navigation.jpg` (1000x667 (3:2), 86 kB) | Isometric mall concourse with a blank signpost — browsing different shop categories. | directory | approved |
| 8 | `journey-basket` | `journey-basket.jpg` (1280x720 (16:9), 57 kB) | Three-step basket journey: chat, paper summary, bag. No prices or totals shown. | basket | approved |
| 9 | `journey-delivery` | `journey-delivery.jpg` (1280x720 (16:9), 68 kB) | Simulated delivery route: shop awning, scooter with plain box, house doorway. | order-detail | approved |
| 10 | `intro-mall-go` | `intro-mall-go.jpg` (1000x667 (3:2), 81 kB) | Welcoming mall archway — first-time visitor introduction, used with the install panel. | help | approved |

**Why these are not duplicates of the category covers.** The nine
`shop-*.jpg` files are photographic scene covers used on shop cards. The batch 3
`need-*.jpg` files are a separate illustrated layer used only by the Home
"Explore by need" row, which is a shortcut into the directory, not a shop image.
`discover-shops` (shopfront row) is the Directory prompt, while
`journey-navigation` (isometric concourse) illustrates browsing categories in
the directory's closing banner; `journey-basket` and `journey-delivery` are
process illustrations, not empty states (batch 2 already covers those).

**Honesty in the artwork.** No image shows a price, a discount, stock, a real
tenant's shopfront, or a real brand mark. The basket and delivery journeys
illustrate *simulated* steps and sit beside text that says so.

## Batch 4 — 2026-10-27 (10 images requested, 10 generated, 10 reviewed, 10 retained)

Batch 4 fills the states that were still text-only: the first-run welcome, a
no-match search, the shop-staff inbox, the shop page's listing provenance, a
shopper preparing a question, both ends of the order journey, demo reset help,
admin reporting and the shop's order-summary panel. All ten were inspected for
artifacts, lettering, brand marks, OS-dialog imitation and misleading claims;
none needed regeneration. Cropped to the display aspect (3:2, 16:9, 1:1 or 4:5)
from the generated original and recompressed.

| 1 | `welcome-mall` | `welcome-mall.jpg` (1000x667 (3:2), 69 kB) | Friendly adult and child entering a warmly lit mall archway — first-run welcome for new visitors. | home | approved |
| 2 | `search-guidance` | `search-guidance.jpg` (1000x563 (16:9), 32 kB) | Blank search field with magnifier in front of three simple awnings — guidance when a home search finds no shops. | home | approved |
| 3 | `shop-staff-inbox` | `shop-staff-inbox.jpg` (1000x563 (16:9), 52 kB) | Shop counter with tablet showing blank chat bubbles, apron and kraft bag — the shop-staff inbox before any customer writes. | retailer-inbox | approved |
| 4 | `shop-detail` | `shop-detail.jpg` (1000x667 (3:2), 71 kB) | Generic empty shopfront with blank signboard — illustrates that a listing is a directory entry, not this shop's own shopfront. | shop-page | approved |
| 5 | `contact-shop` | `contact-shop.jpg` (1000x563 (16:9), 73 kB) | Shopper writing a short list beside a phone with a blank message field — preparing a question for a shop. | shop-page | approved |
| 6 | `order-pending` | `order-pending.jpg` (1000x667 (3:2), 40 kB) | Taped kraft parcel beside a plain clock face — a simulated order waiting for the next update. | order-detail | approved |
| 7 | `order-complete` | `order-complete.jpg` (1000x667 (3:2), 68 kB) | Parcel on a doormat before a green door with a small gold tick — the end of the simulated journey, not proof of delivery. | order-detail | approved |
| 8 | `help-troubleshooting` | `help-troubleshooting.jpg` (720x900 (4:5), 29 kB) | Blank help card with a question bubble and a refresh arrow — resetting the demo and finding guidance. | help | approved |
| 9 | `admin-reporting` | `admin-reporting.jpg` (1000x667 (3:2), 42 kB) | Clipboard of blank bar shapes, plain cards and a magnifier — illustrative activity reporting, containing no real figures. | admin-reports | approved |
| 10 | `order-summary-building` | `order-summary-building.jpg` (700x700 (1:1), 31 kB) | Overhead clipboard with empty ruled rows, pencil and kraft bag — the shop building an order summary. | retailer-order-panel | approved |

**Proposed candidates that were replaced to avoid duplication.** Three of the
suggested concepts were already covered and were swapped for genuinely
unillustrated states:

* *Directory filter guidance* — batch 3's `discover-shops` prompt and the
  category chips already carry this; replaced by `shop-staff-inbox` (the shop
  workspace's true empty inbox had no art).
* *Privacy and safe-use* — batch 2's `concept-privacy` covers this in Help;
  replaced by `order-summary-building` (the shop building a summary, the one
  step of the flow with no visual).
* *Install / share app* — batch 3's `intro-mall-go` already illustrates the
  install panel; no OS-chrome imitation was made. Replaced by `admin-reporting`
  (the management reports tab had no illustration).

**Honesty.** No image contains a price, a discount, stock, a real tenant's
shopfront or a brand mark. `order-complete` shows the end of a *simulated*
journey and sits beside text that says there is no live courier or map
tracking; the shop page labels `shop-detail` as "not this shop's shopfront";
`admin-reporting` contains blank bars with no figures.

## Batch 5 — 2026-10-27 (10 images requested, 10 generated, 10 reviewed, 10 retained)

Batch 5 was planned from a UI gap audit of the running app rather than a theme:
every asset below closes a state that had no artwork, or that had *wrong*
artwork. The audit also found work that needed code rather than images, and
that was fixed in the same pass (see "Code fixes chosen over new images").

| 1 | `order-cancelled` | `order-cancelled.jpg` (1280x720 (16:9), 62 kB) | Empty open kraft box set aside with a blank notice card — a cancelled demo order. | order-detail | approved |
| 2 | `order-collection` | `order-collection.jpg` (1280x720 (16:9), 62 kB) | Shop collection counter with a tied parcel, bell and a dotted gold path — collecting in store, no courier. | order-detail | approved |
| 3 | `state-basket-confirmed` | `state-basket-confirmed.jpg` (1280x720 (16:9), 66 kB) | Phone with a blank confirmed card beside a ribboned kraft bag — a basket that already became an order. | basket | approved |
| 4 | `shop-all-caught-up` | `shop-all-caught-up.jpg` (1280x720 (16:9), 66 kB) | Tidy end-of-shift counter with tied boxes and a mug under a gold arc — nothing waiting on the shop. | retailer-today | approved |
| 5 | `shop-orders-empty` | `shop-orders-empty.jpg` (1280x720 (16:9), 74 kB) | Wall order rail with empty brass clips and one blank kraft tag — no orders yet for this shop. | retailer-orders | approved |
| 6 | `shop-thread-empty` | `shop-thread-empty.jpg` (1280x720 (16:9), 45 kB) | Brass counter bell with a blank folded note — waiting for the customer's first message. | retailer-chat | approved |
| 7 | `delivery-mine-empty` | `delivery-mine-empty.jpg` (1280x720 (16:9), 73 kB) | Parked forest green delivery scooter with an empty insulated box — no accepted jobs. | delivery-mine | approved |
| 8 | `delivery-done-empty` | `delivery-done-empty.jpg` (1280x720 (16:9), 103 kB) | End-of-shift bench with a folded high-vis vest, blank pay card, mug and plant — no completed jobs yet. | delivery-done | approved |
| 9 | `admin-promotions-empty` | `admin-promotions-empty.jpg` (1280x720 (16:9), 85 kB) | Plain pin-board with three blank pinned cards — no promotions created yet. | admin-promotions | approved |
| 10 | `admin-deliveries-empty` | `admin-deliveries-empty.jpg` (1280x720 (16:9), 69 kB) | Empty courier backpack with a blank route card on a bench — no delivery jobs in the marketplace. | admin-deliveries | approved |

**Code fixes chosen over new images (no asset added):**

* `orderTracing()` now selects art from status *and* fulfilment, so a cancelled
  order no longer shows a moving delivery route and a collection order no longer
  shows a courier scooter. The "Move this demo along" hint is hidden once an
  order is finished or cancelled.
* The offline illustration (`state-offline`) was tried as a small decorative
  thumbnail in the offline banner. A batch 6 review found it unreadable at that
  size, so the banner keeps its icon and text and the file stays unused (see
  batch 6 below).
* The chat "conversation not found" screen now uses the documented
  `state-not-found` art instead of an icon-only empty state.
* The admin promotions tab gained a real empty state (it previously rendered an
  empty list with no explanation).

**Still deliberately unillustrated:** the promotions admin form, admin overview
figures, the directory skeleton loader and toast messages — these are better
served by text, controls and existing CSS. `promo-services` remains
`approved-but-unused` on purpose: nothing on a screen needs a third banner.

## Batch 6 — 2026-10-27 (asset and UI audit, **zero images generated**)

This batch added no artwork by design: it audited the 63 existing files against
the code and fixed what was wrong in code, CSS or metadata. Every gap found was
solvable without a new image, so no generation was requested.

**Inventory.** Manifest 63 entries = 63 files in `public/images/` = 63 files in
`dist/images/`. No duplicate ids, no duplicate files, no undocumented file and
no phantom entry. Every file has a `dimensions` and `sizeKb` value (the batch
0–2 entries were backfilled during this audit).

**What the audit changed:**

* **Open Graph / Twitter image was a root-relative path.** Social crawlers do not
  resolve relative URLs, so `og:image`, `og:image:secure_url`, `og:image:url`,
  `og:url`, `og:site_name` and `twitter:image` in `index.html` are now absolute.
* **`manifest.webmanifest` listed a 1024×1024 JPEG logo as a "screenshot".** It
  is an app mark, not a UI screenshot, so the `screenshots` array was removed
  rather than advertising a misleading install-prompt preview.
* **`app-mark-master` is documented as `usage: "source-master"`** with no screen
  claim, and `imageAssets.test.ts` now enforces the stronger rule: a source
  master must claim no screen *and* at least one entry must record it in
  `derivedFrom`. The three PWA icons do, so the master's purpose is provable.
* **`state-offline` is `approved-but-unused`.** At 34 px in the alert bar the
  1672×941 scene was illegible noise, so the banner uses its icon and text only.
  The file is retained for a possible future full-screen offline page.
* **`help-troubleshooting` is 4:5, not 16:9.** The subject runs to the right edge
  of the source, so the old 16:9 `panel__art--narrow` box cropped the accent off.
  A new `.panel__art--portrait` (4:5, max 300 px) presents it intact.
* **`promo-services` stays unused** after re-checking every screen, seed
  promotion and test. Kept deliberately as a spare banner.

**Measured, not guessed.** No browser or screenshot tool exists in this
environment, so the audit used the actual files (ImageMagick crops at display
aspect and at real display sizes) plus arithmetic contrast checks, and reported
the absence of device-level visual QA rather than claiming it.

## Batch 7 — 2026-10-27 (superseded by batch 10; kept as a record)

> **Status: replaced.** All ten batch 7 images were flat still-life object
> illustrations with no shop interior in them, so they were replaced at the same
> file paths by batch 10. This section is kept because the batch log is a record,
> not a changelog that gets edited; the superseded files remain recoverable at
> commit `2adfb8687db9faa867b7965c5defb8bc4163bb6c`. Do not restore them.

Batch 7 starts the per-tenant concept set: until now all 29 listings shared nine
category covers, so every shop page opened with the same hero photograph. Each
tenant now gets **one original concept illustration** in its shop-page hero,
while directory cards keep the shared category covers (so the nine covers stay
in use and `tenants.test.ts`'s "card uses its category scene" rule is untouched).

These are **AI-generated concept illustrations**. They are never a tenant's
logo, never an official brand asset, never a photograph of that business's
shopfront, and they imply no partnership or endorsement. Every one is word-free
(no shop names, prices, product lettering or signage) and brand-free (no logos,
trade dress or mascots), and the hero carries a visible **"Concept art"** chip
next to the caption *"AI-generated concept illustration — not this shop's logo
or shopfront."* The shop name, category and description remain HTML text.

| # | Tenant | Asset id | File | Concept | Review |
| --- | --- | --- | --- | --- | --- |
| 1 | `shop-kfc` | `tenant-kfc` | `tenants/kfc.jpg` (1280×720, 68 kB) | Kraft box of fried chicken, folded paper, plain cup | approved |
| 2 | `shop-golden-buffalo-spur` | `tenant-golden-buffalo-spur` | `tenants/golden-buffalo-spur.jpg` (1280×720, 84 kB) | Cast-iron grill, sirloin and board in a booth | approved |
| 3 | `shop-cash-crusaders` | `tenant-cash-crusaders` | `tenants/cash-crusaders.jpg` (1280×720, 61 kB) | Guitar, camera, drill, blender, blank tags | approved |
| 4 | `shop-mica` | `tenant-mica` | `tenants/mica.jpg` (1280×720, 73 kB) | Paint tins with blank labels, brush, rope, toolbox | approved |
| 5 | `shop-crazy-plastics` | `tenant-crazy-plastics` | `tenants/crazy-plastics.jpg` (1280×720, 70 kB) | Stacked plastic crates, basins and buckets | approved |
| 6 | `shop-zillion-hair` | `tenant-zillion-hair` | `tenants/zillion-hair.jpg` (1280×720, 107 kB) | Headless wig blocks, hair bundles, combs | approved |
| 7 | `shop-ruiter-makelaars` | `tenant-ruiter-makelaars` | `tenants/ruiter-makelaars.jpg` (1280×720, 66 kB) | Keys, wooden house, blank clipboard, magnifier | approved |
| 8 | `shop-flesh-fashions` | `tenant-flesh-fashions` | `tenants/flesh-fashions.jpg` (1280×720, 103 kB) | Clothing rail, plain jacket, folded denim | approved |
| 9 | `shop-clicks` | `tenant-clicks` | `tenants/clicks.jpg` (1280×720, 84 kB) | Amber bottles with blank labels, plasters, sanitiser | approved |
| 10 | `shop-neutell-horowitz` | `tenant-neutell-horowitz` | `tenants/neutell-horowitz.jpg` (1280×720, 68 kB) | Trial frame, lens cases, abstract ring chart | approved |

**Inspection.** All ten were viewed after generation and again after resizing:
each is on-palette, distinct from the nine category covers and from every
earlier batch, free of lettering, logos, trade dress, price marks, people and
watermarks, and uncorrupted. A zoomed check of `tenant-cash-crusaders` (the only
image with fine detail on hardware) confirmed the guitar headstock and drill
label carry only unreadable decorative marks, not text or a brand name.

**Optimisation.** Generated at 1672×941, cropped to exactly 16:9, downscaled to
1280×720 and recompressed (q82, metadata stripped): 61–107 kB each, 816 kB for
the set. Resized/compressed copies are not counted as new images.

**Remaining.** Tenants 11–20 and 21–29 have no concept art yet and keep the
shared category cover in their hero until batch 8 and batch 9 are separately
approved.

## Batch 8 — 2026-10-27 (10 generated; 2 still current, 8 superseded by batch 11)

Batch 8 continues the per-tenant hero set for tenants 11–20 and deliberately
switches to a **photographic style**: realistic interiors, believable lighting
and ordinary retail environments, so the shop page reads like a shop rather than
a flat illustration. Batch 7's ten illustrations are untouched and keep their own
style — mixing them is intentional (illustration for 1–10, photograph-style for
11–20) and is recorded here so nobody later "fixes" the inconsistency.

**They are still AI-generated concept imagery.** None is a photograph of the real
branch, none is a logo or an official brand asset, and none implies that the
tenant endorses or partners with Mall Go. Every image is word-free and
brand-free: no signage, no lettering, no prices, no packaging text, no people.
The hero keeps the visible **"Concept art"** chip and the caption *"AI-generated
concept illustration — not this shop's logo or shopfront."*

| # | Tenant | Asset id | File (1280×720, 16:9) | Scene | Review |
| --- | --- | --- | --- | --- | --- |
| 1 | `shop-vodacom` | `tenant-vodacom` | `tenants/vodacom.jpg` (138 kB) | Mobile store: handset wall, glass SIM counter | approved |
| 2 | `shop-nedbank` | `tenant-nedbank` | `tenants/nedbank.jpg` (122 kB) | Bank branch: teller counters, queue posts | approved |
| 3 | `shop-tops` | `tenant-tops` | `tenants/tops.jpg` (155 kB) | Liquor aisle: wine racks, blank-labelled bottles | approved |
| 4 | `shop-superspar` | `tenant-superspar` | `tenants/superspar.jpg` (191 kB) | Fresh-produce aisle with misted crates | approved |
| 5 | `shop-biltong-den` | `tenant-biltong-den` | `tenants/biltong-den.jpg` (218 kB) | Biltong counter: hanging strips, spice jars | approved |
| 6 | `shop-maxis` | `tenant-maxis` | `tenants/maxis.jpg` (164 kB) | Convenience counter: sweets, bread, cold drinks | approved |
| 7 | `shop-aviya` | `tenant-aviya` | `tenants/aviya.jpg` (97 kB) | Photo studio: backdrop, softboxes, blank prints | approved |
| 8 | `shop-nigel-cellular` | `tenant-nigel-cellular` | `tenants/nigel-cellular.jpg` (146 kB) | Repair bench: opened handset, precision tools | approved |
| 9 | `shop-mtn` | `tenant-mtn` | `tenants/mtn.jpg` (111 kB) | Telecoms store: handset display wall | approved |
| 10 | `shop-just-u-2` | `tenant-just-u-2` | `tenants/just-u-2.jpg` (149 kB) | Jeweller: lit glass cases, gold on velvet | approved |

**Inspection.** Each image was viewed after generation and again after resizing.
Zoomed crops of the three densest scenes (`tenant-tops` bottle labels,
`tenant-maxis` shelf packaging, `tenant-mtn` SIM trays) confirmed there is no
legible lettering, no brand names and no readable prices — the packaging is
blurred colour blocks by design. No OS chrome, no watermarks, no corruption, and
no duplicate of the nine category covers or of batch 7.

**Optimisation.** Generated at 1672×941, cropped to exact 16:9, downscaled to
1280×720 and recompressed (q82, metadata stripped). Photographs compress worse
than the illustrated batches, so files land at 97–218 kB — in line with the
209–334 kB category covers already shipped and still lazy-loaded.

**Remaining at the time.** Tenants 21–29 kept their category cover for one more
turn; batch 9 below closed that gap.

## Batch 9 — 2026-10-27 (9 generated; 7 still current, 2 superseded by batch 11)

Batch 9 is the last remaining slice of the per-tenant set and therefore **nine
images, not ten**: only nine tenants (`shop-postnet` … `shop-carwash`) still had
no hero art. No ten-th image was invented to fill the batch — a duplicate or a
second scene for an already-covered tenant would have violated the no-near-
duplicate rule. Style continues the photographic interiors of batch 8; batch 7's
illustrations and batch 8's images are untouched.

**They are still AI-generated concept imagery.** None is a photograph of the real
branch, none is a logo or an official brand asset, and none implies that the
tenant endorses or partners with Mall Go. Every image is word-free and brand-free:
no signage, no lettering, no prices, no packaging text, no number plates, no
people. The hero keeps the visible **"Concept art"** chip and the caption
*"AI-generated concept illustration — not this shop's logo or shopfront."*

| # | Tenant | Asset id | File (1280×720, 16:9) | Scene | Review |
| --- | --- | --- | --- | --- | --- |
| 1 | `shop-postnet` | `tenant-postnet` | `tenants/postnet.jpg` (115 kB) | Print/courier counter: kraft cartons, copier, mailbox grid | approved |
| 2 | `shop-pep` | `tenant-pep` | `tenants/pep.jpg` (232 kB) | Value clothing: folded tees, kids' rails, wire basket | approved |
| 3 | `shop-scooters` | `tenant-scooters` | `tenants/scooters.jpg` (127 kB) | Pizza takeaway: floured bench, peel, glowing oven | approved |
| 4 | `shop-ocean-basket` | `tenant-ocean-basket` | `tenants/ocean-basket.jpg` (160 kB) | Seafood room: timber tables, blue banquettes | approved |
| 5 | `shop-angel-kiss` | `tenant-angel-kiss` | `tenants/angel-kiss.jpg` (184 kB) | Ladies' boutique: two rails, mannequin, blush curtain | approved |
| 6 | `shop-crazy-store` | `tenant-crazy-store` | `tenants/crazy-store.jpg` (232 kB) | Variety aisle: tubs, balloons, gift wrap, trolley | approved |
| 7 | `shop-fnb` | `tenant-fnb` | `tenants/fnb.jpg` (140 kB) | Bank branch: kiosk zone, oak tellers, glass room | approved |
| 8 | `shop-best-buy` | `tenant-best-buy` | `tenants/best-buy.jpg` (146 kB) | Family appliance store: kettles, fans, bedding, counter | approved |
| 9 | `shop-carwash` | `tenant-carwash` | `tenants/carwash.jpg` (229 kB) | Open wash bay: soaped car, hose, buckets, slick tiles | approved |

**Research notes.** Most scenes follow the documented South African format for
their category. Two tenants needed the real listing rather than the category
default, and both were checked: **Best Buy** at The Angelo Mall is a Nigel family
store stocking babycare, appliances, houseware, luggage, stationery and toys
(`nigel.co.za/bestbuy/`) — *not* the US big-box chain, so the brief asked for a
modest local shop, not a superstore. **Carwash @ Angelo Mall** is listed by the
mall as an on-site service with no shop number, so the brief is an open bay on the
centre's property, not a detailing studio. FNB's branch cues (self-service kiosks,
light-oak counters, a glass private room) follow the bank's recent SA branch
refits. Every prompt stayed brand-neutral: colour and material cues only, never a
logo or a wordmark.

**Inspection.** Each image was viewed at 1672×941 after generation and again after
resizing, with zoomed crops of the four densest scenes — `tenant-crazy-store`
shelf packaging, `tenant-best-buy` cartons, `tenant-fnb` kiosk screens and
`tenant-carwash` vehicle rear. Result: no legible words, no brand names, no prices,
no number plate; packaging reads as blurred colour blocks. No OS chrome, no
watermarks, no corruption, and no duplicate of the nine category covers or of
batches 7–8.

**Optimisation.** Generated at 1672×941, cropped to exact 16:9, downscaled to
1280×720 and recompressed (q82, metadata stripped) → 115–232 kB, the same range as
batch 8 and lazy-loaded like the category covers.

**Coverage after batch 9.** All 29 tenants now open their shop page with their own
concept image; the category-cover fallback remains in the hero code for any future
tenant or missing file, and `tenantConceptImages.test.ts` still exercises it (with
art deliberately removed from one seeded shop).

## Batch 10 — 2026-10-27 (10 replacements, 10 reviewed, 10 retained)

Batch 10 is the first **replacement** batch rather than an addition. Batch 7's ten
images were flat still-life illustrations — a chicken box, a steak on a plate, a
guitar, plastic crates — with no shop in them at all. They read as product art,
not as a recognisable South African retailer, and they were the weakest ten
heroes in the set. Each is now replaced **at the same file path**, so no tenant
record, route or component changed.

The previous artwork is not deleted from history: every batch 10 entry carries a
`revision` block naming the batch it superseded (`replacesBatch: 7`), the date,
why, and the commit where the old file still lives
(`2adfb8687db9faa867b7965c5defb8bc4163bb6c`). `tenantConceptImages.test.ts`
enforces that block, so a future replacement cannot be silent.

| # | Tenant | File (1280×720, 16:9) | Researched scene | Review |
| --- | --- | --- | --- | --- |
| 1 | `shop-kfc` | `tenants/kfc.jpg` (129 kB) | Mall outlet: two self-order kiosks, white counter with quartz top, stainless kitchen pass, blank menu monitors, red fascia, red moulded chairs | approved |
| 2 | `shop-golden-buffalo-spur` | `tenants/golden-buffalo-spur.jpg` (141 kB) | Family steakhouse: navy leather booths with red piping, timber tables, pattern-tile floor, woven pendants, coloured stained-glass wall panel | approved |
| 3 | `shop-cash-crusaders` | `tenants/cash-crusaders.jpg` (154 kB) | Second-hand shop: mixed pre-owned appliances, five unmatched TVs on plinths, glass case, pawn/buy counter behind mesh | approved |
| 4 | `shop-mica` | `tenants/mica.jpg` (220 kB) | Hardware aisle: paint tins and colour charts, pegboard tools, powertools, fastener bins, tinting counter, cement pallet, PVC rack | approved |
| 5 | `shop-crazy-plastics` | `tenants/crazy-plastics.jpg` (209 kB) | Plastics store: clip-lid storage boxes, nested baskets and buckets, wheeled trunk, catering trays, brooms, checkout | approved |
| 6 | `shop-zillion-hair` | `tenants/zillion-hair.jpg` (111 kB) | Small salon: four mirror stations on blush wall, black hydraulic chairs, product shelf, basin area, reception desk | approved |
| 7 | `shop-ruiter-makelaars` | `tenants/ruiter-makelaars.jpg` (134 kB) | Estate agency: oak reception counter, blank window listing grid, blank listing board on teal wall, consultation table, glass meeting room | approved |
| 8 | `shop-flesh-fashions` | `tenants/flesh-fashions.jpg` (199 kB) | Independent clothing shop: two dense chrome rails, folded stacks on a low table, handbag shelf, counter, open stock carton | approved |
| 9 | `shop-clicks` | `tenants/clicks.jpg` (172 kB) | Health & beauty: back-lit cosmetics bays, personal-care gondolas, supplements end-cap, raised dispensary with green cross panel | approved |
| 10 | `shop-neutell-horowitz` | `tenants/neutell-horowitz.jpg` (135 kB) | Optometry: full-height backlit frame wall, glass display counter with trial lens set, consultation desk, glazed exam room with phoropter | approved |

### Research actually performed

Three sources were reachable and used: web search results, company/fit-out pages,
and — importantly — an **image search whose results were downloaded and inspected
at full size** before any prompt was written. Inspection was real, not assumed:
contact sheets and 150–170 % crops were rendered and read.

| Tenant | Sources consulted | What the images actually showed |
| --- | --- | --- |
| KFC | savilerow.co.za flagship case study (arrivals/orders/collections zones, "longer Colonel's table", warm timber, custom pendants); branddna.co.za; global.kfc.com Pinelands 2022 ("dark grey vs white with strong pops of red and the warmth of wood"); fermag.com (self-service kiosks, digital menu boards); restaurantguru photo sets | Ordinary outlets have a *blank/dark* backlit menu band over a stainless pass, a pale counter, red accent banding and red bucket chairs; kiosks sit on slim pedestals in the queue lane. The flagship finishes are the exception, so the brief asks for an ordinary mall outlet. |
| Golden Buffalo Spur | dp-group.com "Spur – Vaal Mall" fit-out; crushmag-online.com refresh report (navy leather booths, red stitching, stained-glass chandeliers, geometric tiles); iol.co.za and capetownetc.com revamp pieces; academic UJ study of Spur décor (imitiation-leather booths, faux stained-glass, teepee-form light fittings) | Booths are built-in high-backed benches facing each other over dark timber tables; navy leather with red piping is the current palette; floors are patterned encaustic-look tile; a large geometric coloured-glass decorative panel is a signature wall feature. |
| Cash Crusaders | cashcrusaders.co.za (pre-owned category, store locator), gasta.co.za (what they buy: consoles, appliances, TVs, phones, tools, jewellery, gym equipment), pretoria.co.za branch pages, inverters.co.za photo sets, reddit user photo | Real stores are tightly packed with **unmatched** used appliances and older flat TVs, not a uniform electronics showroom; a locked glass case and a barred/mesh buy-and-pawn counter are the recognisable service fixtures; deep-blue banding and counter fronts. |
| Mica | mica.co.za Paint Centre and Millside/Oranje/Ladybrand store reports (deeper shelving, department counters, tinting and mixing machines, gondola ends, "build, paint, power tools, hardware, key-cutting, garden, pool"); LinkedIn revamp posts | Aisle format: paint tins + colour fan decks on one side, pegboard hand tools and boxed power tools on the other, fastener bins low, single tinting counter mid-floor, timber/PVC/cement yard glimpse at the back. Green banding. |
| Crazy Plastics | crazyplastics.co.za category pages (Salsa Mighty containers up to 150 L, clip-lid boxes, crates, shoe storage, party & catering), store pages, Bloemfontein store-opening post ("shelves jam packed"), magalieshillsshoppingcentre.co.za | Merchandise is *large-format* plastic: stacked clip-lid boxes, nested buckets/baskets, wheeled trunks, catering platters; bright yellow band above shelving, glossy floor, dense shelf-filling. |
| Zillion Hair | angelomall.co.za directory line "6 Zillion Hair"; nigel.infoisinfo.co.za and beauty-salon directories: **"Zillion Hair and Nails, Ferryvale, Nigel — Werner has 25 years experience in barbering"**, i.e. a small local hair/nail salon, not a wig retailer | Salon-reference photos show the mirror-station row, black hydraulic chairs, product shelf, basin area — which is what the brief specifies. Limitation: no photograph of the Angelo Mall branch exists online, so the interior is an approximation of a small SA salon. |
| Ruiter Makelaars | angelomall.co.za listing ("Ruiter Makelaars FSP 13510"); local estate-agency display references (window card grids, interior digital showcases) | Agency offices in small centres are mainly a window listing grid + reception counter + a board of listings; consultation table and a glass meeting room. Limitation: no interior photo of this agency exists publicly. |
| Flesh Fashions | brabys.com and infoisinfo Nigel directory entries (Shop 7 Angelo Mall, fleshnigel.co.za); a photographed *small independent fashion store in Johannesburg* used as the format reference | Independent SA clothing shops are crowded: dense mixed rails of men's and women's stock, folded stacks on a centre table, exposed brick, concrete floor, stock cartons. Not a boutique. |
| Clicks | clicksgroup.co.za profile; businessexplainer.co.za and shore.africa 1,000th-store reports (wider aisles, expanded Beauty Hall, fragrance counter, digital screens, pharmacy-led layout); bizcommunity beauty store-in-store pieces; retailcustomerexperience.com digital-signage breakdown (beauty first, then FMCG, dispensary deeper in) | Store sequence is beauty front-right (back-lit bays, colour-ordered cosmetics), personal care mid, dispensary at the back behind a raised counter, with Clicks blue banding. The green cross is the pharmacy cue. |
| Neutell & Horowitz | valuevisionneutel.co.za (Shop 9B Angelo Mall, "Value Vision" banner, established 2001, glaucoma screening/tonometry, drivers-licence exams); sayellow and valuevision.co.za listings | A working optometry practice, not a fashion eyewear shop: frame wall + display counter, a consulting desk, and an examination room with a phoropter. "Value Vision" affiliation informs the modest finish level. |

### What the generated images reproduce, and what remains unverified

Reproduced from evidence: the *format-defining* elements above — booth geometry and
navy/red palette for Spur, the blank dark menu band and kiosk queue for KFC,
unmatched used appliances and a barred pawn counter for Cash Crusaders, the paint
wall + pegboard + tinting counter for Mica, the large-format stacked plastic ranges
for Crazy Plastics, mirror-station rows for Zillion, a window listing grid for
Ruiter Makelaars, a crowded mixed-rail shop for Flesh Fashions, beauty-front /
dispensary-back for Clicks, and frame wall + exam room for Neutell & Horowitz.

**Not verified, and deliberately so:** none of these is a photograph of the Angelo
Mall branch; no branch interior photograph exists online for any of the ten. Brand
identity is withheld on purpose — every menu panel, lightbox, price strip, carton
and poster is blank, so the images cannot be mistaken for the chain's real
shopfront, its logo or an endorsement. Logos, signage and prices remain out of scope
by project rule.

### Review gate

Each candidate was compared side by side with the image it replaces, at the same
display size, and zoomed to 150–170 % on the four densest areas (KFC menu band,
Clicks cosmetics wall, Flesh Fashions rails, Cash Crusaders shelving). All ten
passed: correct business format, the defining fixtures present, no legible
lettering or logo, no malformed furniture, and a clear improvement over a flat
product illustration. Nothing was rejected, so no regeneration was needed.

Files are cropped to exact 16:9, downscaled to 1280×720 and recompressed at q82
with metadata stripped (111–220 kB).

## Batch 11 — 2026-10-27 (10 replacements, 10 reviewed, 10 retained)

Batch 11 audits the ten scenes still standing after batch 10 and replaces the
weakest of them. Five were not merely generic — they had the **wrong format**:

* `shop-maxis` showed a convenience counter with a drinks fridge and a bakery
  shelf. Maxi's is a sit-down family restaurant (breakfast, burgers, grills,
  shakes, ~30 years old, dine-in plus takeaway). The format was wrong.
* `shop-aviya` showed only a photo studio. The business is *photography and
  graphics*, so the print/design side was missing.
* `shop-nigel-cellular` was an extreme close-up of an opened handset on a bench:
  craft detail, no shop, no counter.
* `shop-scooters` foregrounded the oven and prep line; a customer sees the
  counter, menu band and seating.
* `shop-ocean-basket` was the blue-and-white seafood cliché. Documented Ocean
  Basket interiors use mixed painted fisherman's chairs, striped cotton bench
  seating, blue tile and mosaic, and stencilled fish/wave/anchor graphics.

The other five were readable but generic on the defining details: MTN had no
yellow and no service desk, Vodacom wore a green/oak palette instead of its red
identity and had no counter, Nedbank showed the glass teller line it is
deliberately removing, TOPS was a boutique timber cellar rather than a value
bottle store, and SUPERSPAR was a produce-only close-up rather than a full
supermarket.

| # | Tenant | File (1280×720, 16:9) | Researched scene | Review |
| --- | --- | --- | --- | --- |
| 1 | `shop-mtn` | `tenants/mtn.jpg` (106 kB) | Franchise outlet: backlit handset wall, yellow feature panel, demo tables, assist counter, repairs alcove | approved |
| 2 | `shop-vodacom` | `tenants/vodacom.jpg` (134 kB) | Mall shop: red feature wall, timber-and-white handset run, lit glass cabinet, service counter | approved |
| 3 | `shop-nedbank` | `tenants/nedbank.jpg` (148 kB) | Hybrid branch: self-service and card-dispensing kiosks, glassless assisted counter, advisory pod, lockers | approved |
| 4 | `shop-tops` | `tenants/tops.jpg` (216 kB) | Value bottle store: gondola wine shelving, glass-door fridges, crate stacks, till bulkhead | approved |
| 5 | `shop-superspar` | `tenants/superspar.jpg` (196 kB) | Full supermarket: grocery aisle, dairy fridges, produce, checkouts | approved |
| 6 | `shop-maxis` | `tenants/maxis.jpg` (155 kB) | Family restaurant: timber/red host counter with dessert case, booths, tables, kitchen pass | approved |
| 7 | `shop-aviya` | `tenants/aviya.jpg` (138 kB) | Photo studio *plus* print/graphics counter, wide-format printer, frame display | approved |
| 8 | `shop-nigel-cellular` | `tenants/nigel-cellular.jpg` (176 kB) | Independent dealer: glass cabinet, service counter, accessory pegboard, repair bench | approved |
| 9 | `shop-scooters` | `tenants/scooters.jpg` (107 kB) | Takeaway from the customer side: counter, glass screen, blank menu band, oven glow behind | approved |
| 10 | `shop-ocean-basket` | `tenants/ocean-basket.jpg` (222 kB) | Casual seafood: mixed painted chairs, striped bench, blue tile servery, stencilled murals | approved |

### Research actually performed

| Tenant | Sources consulted | Details extracted |
| --- | --- | --- |
| MTN | [Impact Display MTN retail design](https://impactdisplay.co.za/work/mtn/) (Help Me / Inspire Me / Engage Me zones, each with its own furniture), [invidis on MTN's Digital Experience Centre](https://invidis.com/news/2026/07/telco-mtn-turns-retail-into-experience/) (interactive phone tables, discreet queue management), [MyBroadband on the first digital store](https://mybroadband.co.za/news/cellular/165106-mtn-opens-its-first-cutting-edge-digital-store-in-south-africa.html) (quick-service desk, kiosks, in-store repairs) | Yellow is architecture (feature panels, bulkheads), handsets sit in backlit niches, demo tables are the comparison surface, and small outlets still have a queue/assist counter plus a repairs corner. |
| Vodacom | [BRAND DNA Vodacom retail concept](https://branddna.co.za/portfolio/vodacom-retail-concept/) (rollout from flagship to dealer kiosk; "red is introduced to reflect Vodafone's share"), [Design Clarity Vodafone store frames](https://designclarity.net/projects/vodafone/the-overall-view) (long light counter, light-wood ceiling, plan literature, red banners), [Vodacom "Store of Tomorrow"](https://www.vodacom.com/news-article.php?articleID=7724) (digital-first formats) | Red is a wall/accent, not a whole-shop flood; white-and-timber counters carry the handsets; a long front counter plus glass cabinets is the merchandising spine; kiosks are the small-footprint variant. |
| Nedbank | [BusinessTech on the new-concept rollout](https://businesstech.co.za/news/banking/587222/nedbank-rolling-out-new-concept-design-to-all-branches-in-south-africa/) (**three zones: self-service, staff-assisted, expert advice**; card-dispensing kiosks, appointment booking), [ITWeb Client Connect Zone](https://www.itweb.co.za/article/nedbank-tests-next-gen-self-service-branches/GxwQDq1DPg6MlPVu), [Nedbank self-service kiosks page](https://personal.nedbank.co.za/bank/digital-banking/channels/physical-channels/self-service-kiosks.html), [Enterprise Africa](https://enterprise-africa.net/nedbank/) (**protection glass phased out, screens and bilock doors removed** to open the teller conversation) | So: kiosks in front, an open glassless assisted counter, an advisory pod, card lockers. The old image's glass teller line with queue posts is the format being retired. |
| TOPS at SPAR | [TOPS at SPAR about](https://www.topsatspar.co.za/About) and [SPAR brand page](https://www.spar.co.za/Assets/Our-Brands/In-Store/TOPS) (value, owner-managed, spirits/wine/refreshments), [Regent Light TOPS Highlands and Langebaan lighting case studies](https://www.regentlight.co.za/applications/shop-lighting-applications/tops-at-spar-highlands/) (**4000K lighting on the trading floor, separately lit till points in the bulkhead, IP-rated luminaires for the walk-in fridges**), branch reviews mentioning walk-in fridges and specials-driven volume | Value bottle store: wine gondolas, lit fridges, crate stacks, tills under a bulkhead. Not a timber cellar. |
| SUPERSPAR | [SPAR SUPERSPAR format page](https://www.spar.co.za/superspar) (fresh produce, bakery, butchery, pantry staples, household, "spacious aisles"), [SPAR fact sheet](https://thespargroup.com/pdf/Our_brands_and_store_formats_2021.pdf) (≥700 m² large format, full grocery range), [SPAR International store formats](https://spar-international.com/aboutus/store-formats/), branch write-ups (service departments, checkouts) | A full supermarket needs grocery gondolas *and* fridges *and* produce *and* checkouts in one frame; produce alone reads as a greengrocer. |
| Maxi's | [maxisfood.com](https://maxisfood.com/) (breakfast, handcrafted burgers, grills, shakes, "welcoming sit-down dining experience", family restaurant), [FASA listing](https://fasa.co.za/directory-accredited_f/listing/maxis-restaurant-franchise/) ("quick service sit-down", established 1993), branch listings confirming mall sit-down sites | Sit-down tables and booths, host/till counter with a dessert or shake display, open kitchen pass, menu band above the counter. |
| Aviya Photography & Graphics | [iVote East Rand photography directory](https://www.ivote.co.za/@2?AsG_AssociationGroup=0&SearchCategoryCode=1598&SearchLocationID=13&wr=6) — "Aviya Photography & Graphics, Nigel" listed among photo/graphic studios whose services include film developing, digital printing, canvas prints, graphic design and a studio; Angelo Mall listing | Two-function shop: a shooting corner with backdrop and softboxes **and** a print/design counter with a wide-format printer and canvas samples. |
| Nigel Cellular | Angelo Mall directory (shop 17, own phone numbers, trading 7 days) plus the [MTN/telecom dealer formats](https://impactdisplay.co.za/work/mtn/) above | An independent dealer is a *shop*: glass handset cabinet, service counter with card machine and SIM trays, accessory pegboard, small repair bench at the back. |
| Scooters Pizza | [NEWS24 relaunch coverage](https://www.news24.com/business/companies/scooters-pizza-is-back-39-minute-promise-and-all-20251021-0823), [whichfranchise on the Newcastle revamp](https://whichfranchise.co.za/newcastleocos-scooters-pizza-gets-a-complete-brand-overhaul/) (**red and yellow walls, silver counters/chairs/lighting, clean white menu boards**), [grab-and-go concept note](https://whichfranchise.co.za/scooters-pizza-franchise-enhances-development-portfolio/) (**counter design and large graphics are the signature**) | Customer-facing counter and menu wall are the branded assets; the oven is support, not subject. |
| Ocean Basket | [Bizcommunity "Sharing" relaunch](https://www.bizcommunity.com/Article/196/82/164517.html) (**fisherman's chairs in different colours, bench seating for sharing, bold blue tiles, stencilled waves/fish/anchors, cotton tablecloths, long sushi bar, mosaic family tables**), [smaller-format strategy](https://www.bizcommunity.com/Article/196/785/200579.html), Wikipedia on the 2016 decor/menu rebrand | Mixed painted chairs + striped bench + blue tile + stencil graphics + a servery/sushi bar. The uniform blue-and-white restaurant is the cliché, not the brand. |

### What the images reproduce, and what stays unverified

Reproduced: the format-defining elements above. **Not verified:** these are not
photographs of the Angelo Mall branches — no branch interior photographs exist
publicly for any tenant — and no logo, wordmark, menu text or price appears in
any scene, so nothing implies the chain's real shopfront or an endorsement.

### Review gate

Each candidate was compared side by side with the file it replaces at equal
display size, and zoomed to 160–170 % on the four densest areas (SUPERSPAR shelf
labels, TOPS bottle labels, MTN display wall, Vodacom accessory hooks). All ten
passed: correct format, defining fixtures present, no legible lettering, no
malformed furniture, and a clear improvement. Nothing required regeneration.

### Image-retrieval limitation (batch 11)

Web *search* was available and used extensively, and the reference photographs
found for batch 10 were inspected directly. For this batch, image search returned
mostly stock-library or unrelated results (for MTN it returned South African
wall-art canvases; for Nedbank and SUPERSPAR, generic stock). Only the Vodacom
Getty frames and the liquor-store stock frames were real interiors, and neither
is brand-specific. **The ten briefs therefore rest on written fit-out case
studies, press coverage and branch evidence rather than on inspected photographs
of each retailer's interior.** That is a weaker evidence base than batch 10 and is
recorded here so the difference is not lost.

## Audit — 2026-10-27 (29 inventoried, 29 inspected, 0 regenerated)

A full pass over all 29 tenant scenes: every file was confirmed present on disk
(106–232 kB each, all 1280×720), mapped to the tenant that references it, and
inspected by eye in labelled contact sheets and at full size where the sheet was
too small to judge. The result was **zero replacements**.

**Why nothing was regenerated.** The one scene that looked wrong on the sheet was
`maxis.jpg`, which reads as a restaurant — booths, a kitchen pass, an espresso
machine and a cake display. That was treated as a possible regression until the
tenant record was checked. It was not a regression: batch 11 had already replaced
the old convenience counter for exactly this reason, and `tenants.ts` had never
been updated to match. The image was right; the *data* said `groceries`. The
record is now `food`, with restaurant copy and the `shop-food` category scene, so
the card, the filter and the illustration all agree with the artwork and with
`maxisfood.com`.

This is recorded because the failure mode matters: a wrong-business-type image
looks like an image problem and is usually a data problem. Checking the tenant
record before spending a generation is the cheaper order of operations.

The remaining 28 scenes were retained as-is. Two were examined closely and
deliberately kept:

* `mtn.jpg` — a bright white-and-yellow handset wall with a service counter. Not
  a stock "phone shop": it has the SIM/airtime counter and the wall of live
  devices a network store actually uses.
* `just-u-2.jpg` — a green-velvet-and-brass jewellery case with a loupe and
  cloth. Period jewellery retail, which is the shop's trade; no invented brand
  mark and no gibberish lettering.

Two similar scenes — `crazy-plastics.jpg` and `crazy-store.jpg` — were compared
directly. They depict the same retail family (plastics/housewares) from different
angles and both are used by their own tenant, so neither is a duplicate of the
other's *purpose* and neither is a shared tenant image.

**Shared-image rule still holds.** Category scenes under `/images/shop-<category>.jpg`
are shared by design (they are illustrations, never presented as a tenant
photograph — enforced by `src/data/tenants.test.ts`), while all 29
`/images/tenants/<id>.jpg` concept scenes are unique per tenant.

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
| Home → Explore by need | `need-food`, `need-fashion`, `need-electronics`, `need-beauty`, `need-home-hardware` |
| Directory prompt | `discover-shops` |
| Directory closing banner | `journey-navigation` |
| Basket explanation | `journey-basket` |
| Order tracking | `journey-delivery` |
| Help → install panel | `intro-mall-go` |
| Home → first-run welcome | `welcome-mall` |
| Home → search finds nothing | `search-guidance` |
| Shop page → listing provenance | `shop-detail` |
| Shop page → popular things to ask | `contact-shop` |
| Order tracking (pending / in flight / done) | `order-pending`, `journey-delivery`, `order-complete` |
| Help → reset demo panel | `help-troubleshooting` |
| Admin → reports banner | `admin-reporting` |
| Shop staff → inbox empty / filtered | `shop-staff-inbox`, `search-guidance` |
| Shop staff → order panel, no summary yet | `order-summary-building` |
| Order tracking → cancelled | `order-cancelled` |
| Order tracking → collection in progress | `order-collection` |
| Basket → already confirmed | `state-basket-confirmed` |
| Shop staff → Today, nothing waiting | `shop-all-caught-up` |
| Shop staff → Orders, none yet | `shop-orders-empty` |
| Shop staff → thread with no messages | `shop-thread-empty` |
| Delivery → My jobs empty | `delivery-mine-empty` |
| Delivery → Completed empty | `delivery-done-empty` |
| Admin → Promotions empty | `admin-promotions-empty` |
| Admin → Deliveries empty | `admin-deliveries-empty` |
| Shell → offline banner (thumbnail) | `state-offline` |
| Chat → conversation not found | `state-not-found` |
| Share preview (OG/Twitter) | `og-social-card` |
| Help — how chat ordering works | `help-chat`, `help-summary`, `help-delivery` |
| App header, PWA install | `icon.svg` (SVG) plus the three PNG icons |

## Delivery derivatives (Phase 14)

The featured shop cards appeared to load slowly. Nothing was missing: every
tenant image was a 1280x720 JPEG of roughly 170 kB, served at full size to a
card that paints at about 340 CSS px. Five featured cards plus the Home hero
meant a phone fetching well over a megabyte of pixels it could not display.

The originals are **not** replaced, renamed or rewritten — the convention that
the JPEG is the canonical asset still holds, and it remains the `<img>` fallback.

| file set | what it is |
| --- | --- |
| `/images/tenants/{slug}.jpg` | unchanged 1280x720 original, the fallback |
| `/images/tenants/{slug}-480.webp` | 480x270, quality 74 — what a phone card picks |
| `/images/tenants/{slug}-960.webp` | 960x540, quality 76 |
| `/images/tenants/{slug}-1280.webp` | 1280x720, quality 78 — large desktop hero |
| `/images/hero-mall-800.webp` | 800x436, quality 74 — Home hero on a phone |
| `/images/hero-mall-1408.webp` | 1408x768, quality 78 |

Encoded with ImageMagick 6.9.11 / libwebp 1.2.4, `-strip` (metadata removed),
progressive-free WebP. Verified by eye after generation: the 480w card
variant shows no blocking on the KFC interior, and the 800w hero keeps the
atrium detail.

Measured, not estimated:

| what a 390px phone loads | before | after |
| --- | --- | --- |
| 5 featured cards | 872 kB | 109 kB |
| Home hero | 333 kB | 78 kB |
| first Home paint (cards + hero) | 1205 kB | 187 kB |

Roughly **85% less image data** for the same visual result.

### How it is wired

- `src/utils/responsiveImages.ts` builds the `srcSet` and the `sizes` string,
  and returns `undefined` for art with no derivatives (the shared category
  covers) so a missing file is never advertised.
- `src/components/ResponsiveImage.tsx` wraps the image in `<picture>` with a
  `<source type="image/webp">`. The wrapper is `display: contents`, because the
  media images are absolutely positioned inside their frame and a real box
  would collapse the layout.
- `src/utils/responsiveImages.test.ts` reads the filesystem and asserts every
  derivative exists, is a genuine WebP (RIFF/WEBP header), and is smaller than
  its JPEG. `imageAssets.test.ts` keeps the new files documented here, so an
  undocumented image still fails the build.
