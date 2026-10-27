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
* The offline illustration (`state-offline`, documented since batch 1 but never
  wired) is now used as a small decorative thumbnail in the offline banner.
* The chat "conversation not found" screen now uses the documented
  `state-not-found` art instead of an icon-only empty state.
* The admin promotions tab gained a real empty state (it previously rendered an
  empty list with no explanation).

**Still deliberately unillustrated:** the promotions admin form, admin overview
figures, the directory skeleton loader and toast messages — these are better
served by text, controls and existing CSS. `promo-services` remains
`approved-but-unused` on purpose: nothing on a screen needs a third banner.

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
