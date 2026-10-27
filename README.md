# Angelo Mall Go — Phase 5 Frontend Prototype (real tenant directory + brand-ready UI)

**Your mall. Your shops. One easy way to shop.**

A mobile-first, chat-oriented, multi-vendor shopping and local-delivery **PWA concept** for Angelo Mall, Nigel, Gauteng — built as a production-quality, interactive frontend with a backend-ready architecture.

> ⚠️ **Demonstration only.** The shops are **real Angelo Mall tenants**, transcribed from the mall's own store directory (shop numbers, telephone numbers and trading hours as listed). **No shop is a Mall Go partner**: no business has agreed to take part, has been contacted on this project's behalf, or receives messages, orders, payments or delivery requests from this app. All chat replies, prices, stock levels, order acceptance, collection and delivery are simulated in the browser, and no official logo or shop photograph is used. No endorsement by Angelo Mall or any tenant is implied. There are no user accounts: a clearly labelled **Demo Mode** switcher changes between the four workspaces.

This app lives in its own folder (`angelo-mall-go/`) inside the Student Portal repository and is completely independent of that product — its own `package.json`, build, tests and PWA manifest.

---

## Quick start

```bash
cd angelo-mall-go
npm install
npm run dev        # http://localhost:5180
```

From the repository root you can also use `npm run dev:mall-go`, `npm run build:mall-go`, `npm run test:mall-go`.

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Vite dev server (0.0.0.0:5180)                 |
| `npm run build`   | `tsc --noEmit` + production build to `dist/`   |
| `npm run preview` | Serve the production build                     |
| `npm test`        | Vitest suite (workflow, shared state, chat UI) |
| `npm run typecheck` | Strict TypeScript check                      |

No environment variables, API keys or accounts are needed — demo state is seeded locally and persisted in `localStorage` on the device. **Reset demo** (top bar or Help screen) restores the original sample scenario.

---

## The 3-minute guided demo

1. **Customer:** open the **The Angelo SUPERSPAR** sample chat — a basket (`AMG-1001`, bread/milk/eggs/mince) is already waiting. Send a message and you'll get a clearly labelled *simulated* reply; the real store receives nothing.
2. Review the basket and **confirm the demo order** (choose delivery).
3. Switch **Demo Mode → Shop staff**: open Thandi's conversation, reply as the shop, then **Accept → Start preparing → Ready — request delivery partner**.
4. Switch to **Delivery partner**: accept the SUPERSPAR job, then **Confirm collection → Start delivery → Confirm delivered**.
5. Back to **Customer → Orders**: `AMG-1001` shows **Delivered** with a complete timeline.
6. Bonus: in Shop staff, open Sipho's unread chat and build an order from scratch — no catalogue, just agreed items. Then visit **Mall admin** to see the numbers move.

---

## What's inside

### Customer experience
- Home with shop search, categories, featured shops, promotions, recent chats and active-order strip.
- Searchable/filterable shop directory of 29 real Angelo Mall tenants across nine categories, with a permanent disclosure block ("Real shops, concept app"), per-shop provenance (directory source, check date, cross-verified vs directory-only) and honest labels ("Sample walkthrough · simulated" vs "Listed from mall directory · no ordering").
- Shop pages with the directory's shop number, telephone and website (only where the source lists one), sample hours, a listing-confidence note, "popular things to ask" shortcuts and a **sample chat** action. **No product-catalogue grid.**
- WhatsApp-style conversation (original UI, no WhatsApp branding): text + photo attach (downscaled in-browser, stored on-device only, labelled as demo), day separators, timestamps, typing indicator, and **structured order cards** embedded in the thread.
- **Expandable chat:** an Expand / Minimise control in the chat header opens the same conversation as a full-screen panel on phones (safe-area padding for the status bar and home indicator, background scroll locked, Esc to close, focus kept inside the panel) or as a large centred overlay on desktop. Compact mode is unchanged, and the conversation, draft, attachment preview, basket and order state carry across because the panel is never unmounted.
- Basket with shop-confirmed prices (locked), quantity/removal **change requests** that the shop must approve, transparent totals incl. delivery fee, delivery-vs-collection choice, and explicit confirmation. A chat message is never silently a purchase.
- Fulfilment-aware order tracking timeline + order history, always linked back to the conversation.

### Shop-staff workspace
- Inbox with unread badges, search and filters (Unread / With orders / Needs action).
- The same conversation thread from the shop's side, plus quick replies (availability, substitution…).
- Order panel: start a summary from the chat, add agreed items (description, qty, price, substitution note) with validation, edit before confirmation, approve/decline customer change requests, accept → prepare → ready, cancel with reason flow.
- Orders board (Needs action / In progress / Finished) and a "Today" operational summary.

### Delivery-partner workspace
- Phone-first job board independent of any single shop.
- Privacy-safe open job cards: pickup shop, **general area only**, demo distance and payout — never a customer's phone number or exact address.
- Accept → collected → out for delivery → delivered, plus a "can't complete" flow that re-publishes the job.
- Completed-jobs earnings view (demo payouts).

### Mall-admin workspace
- Overview with demo counts and **clearly separated money**: GMV (shops' goods value) vs delivery fees vs driver payouts vs illustrative platform commission (adjustable sample rate) vs estimated net — all labelled sample figures.
- Tenant participation management, featured placement and trading toggles (changes reflect in the customer directory immediately).
- Promotion management with demo impression/click/chat-start counters; sponsored placements are always labelled.
- Delivery-job oversight and simple activity reports (orders by status, GMV by shop, promotion funnel).

### Cross-cutting
- Tenant data has a single source of truth: [`src/data/tenants.ts`](src/data/tenants.ts) (with source URL, check date and confidence per listing), projected into `Shop` records by `src/data/seed.ts`. Provenance, conflicts and exclusions are written up in [`docs/tenant-directory.md`](docs/tenant-directory.md).
- Turning a **listing** into a **consenting partner** is a documented data task, not a redesign: see [`docs/tenant-onboarding-template.md`](docs/tenant-onboarding-template.md) for the per-shop record (approved logo file, image permission, confirmation status) and the minimum information required from the mall.
- Shop identity is a two-layer logo system: a **verified-official-logo slot** per tenant (`src/data/shopLogos.ts`, currently empty because no logo could be verified from this environment) over a **generated wordmark fallback** — monogram tile, original category glyph and the shop name. No real retailer mark is imitated, a failed logo load degrades to the wordmark, and directory cards stay on shared, logo-free category illustrations. A shop page *may* open with an AI-generated **concept illustration** (`conceptImage`), always labelled "Concept art — AI-generated concept illustration — not this shop's logo or shopfront"; shops without one fall back to their category cover. See [`docs/shop-asset-plan.md`](docs/shop-asset-plan.md) and [`docs/image-asset-manifest.md`](docs/image-asset-manifest.md).
- Phase 5 finish: refreshed app identity in the header (mark + "Demo" chip), a brand plate that separates each shop's mark from its category illustration, a documented image-asset manifest covering every file in `public/images/`, original illustrations for the promotion banners, the Help walkthrough, and the empty/offline states, plus a small-mobile pass on touch targets and density.
- Artwork batches: **83 documented image assets** across eight batches — batch 1 (app mark + icons, promotion banners, Help walkthrough, empty/offline states), batch 2 (remaining empty states, concept panels, social card) and batch 3 (shop-discovery set: the Home "Explore by need" row, the Directory discovery prompt and wayfinding banner, the basket and delivery journey strips, and the welcome art on the Help install panel) and batch 4 (the first-run welcome card, no-match search guidance, the shop page's "not this shop's shopfront" note, the shop-staff inbox and order panel, order status art for pending and completed orders, demo-reset help, admin reporting) and batch 5 (a UI gap audit: cancelled and collection order states, the confirmed-basket dead end, the shop's all-clear and empty order board, the shop-side empty thread, both empty delivery tabs and the two admin empty states). Batch 6 was an asset-and-visual **audit only**: it added no images and fixed contrast tokens, the Open Graph/Twitter URLs, a mislabelled install screenshot and the 4:5 help artwork instead (the offline illustration was tried as a 34 px thumbnail, judged unreadable, and left unused). Batch 7 starts per-tenant concept art: ten shop-page hero illustrations for the first ten listings (KFC to Neutell & Horowitz), labelled as AI-generated concept art, and batch 8 continues that set for tenants 11–20 in a photographic style (generated interiors, still logo-free and labelled "Concept art"). Tenants 21–29 keep their category cover until their batch runs. No generated image carries lettering, a price, a real tenant's shopfront, a logo or a brand mark.
- Installable **PWA shell** (manifest, icons, app-shell service worker for fast repeat loads). No offline ordering, push or background sync is claimed.
- Loading (skeleton), empty, error and offline states; accessible focus, labels, contrast and reduced-motion support; responsive from small Android phones to desktop.

---

## Architecture

```
src/
  types.ts                  API-shaped domain types (Shop, Conversation, Message, Order, DeliveryJob, Promotion…)
  router.ts                 Hash router (deep-linkable demo routes per role)
  data/seed.ts              Centralised sample tenants, conversations, orders, jobs, promotions
  store/
    reducer.ts              Pure demo-state reducer — ONE state shared by all workspaces
    selectors.ts            Read-side queries (future API GETs)
    DemoStore.tsx           React provider + localStorage persistence
  services/
    marketplaceService.ts   MarketplaceService interface + mock implementation (the Phase 2 seam)
  utils/
    format.ts               Single en-ZA ZAR formatter, times, money rounding
    orderWorkflow.ts        Status flows, transition guards, totals, line-item validation
  components/               Shell, ChatThread, ShopCard, OrderBits, PromotionBanner, UI primitives
  screens/
    customer/  retailer/  delivery/  admin/
```

**Key design decisions**

- **Conversations first, structured orders second.** An order is always created inside a conversation and remains linked to it. Shops never need to upload a catalogue; staff type agreed items.
- **One shared demo state.** Customer, shop, delivery and admin screens all read/write the same store, so the hand-off scenario works end-to-end. Order-status transitions live in one workflow module — never duplicated per screen.
- **Service boundary for Phase 2.** Screens only call `MarketplaceService`. Phase 1 binds it to the mock store with async signatures; Phase 2 implements the same interface against a secured API.
- **Money is explicit.** Totals are computed cent-safely; the delivery fee is snapshotted at confirmation; customers cannot edit shop-confirmed prices (only request changes).
- **Honesty is a feature.** Simulated replies, demo tenants, sample prices, sponsored placements and illustrative metrics are all labelled in the UI.

## Tests (76, all passing)

- `orderWorkflow.test.ts` — ZAR totals (delivery vs collection), formatting, item validation, transition guards, fulfilment-specific timelines.
- `reducer.test.ts` — the full acceptance journey on shared state (chat → draft → change request → confirm → prepare → driver → delivered), failed-delivery re-publish, demo reset.
- `ChatThread.test.tsx` — message rendering, order-card CTA, simulated-reply label, composer send + Enter/Shift+Enter behaviour.
- `router.test.ts` — hash round-trips incl. directory search/category deep links and role mapping.
- `ChatScreen.test.tsx` — expand/collapse, preserved draft + conversation with no duplicate messages, scroll lock and restore, Esc-to-close with focus return, sending and simulated-reply indicator while expanded.
- `ChatStatePreservation.test.tsx` — basket bar survives toggling, messages sent while expanded persist, shop switching shows the right shop, automated demo reply appears.
- `ChatOverlayKeyboard.test.tsx` — Tab stays inside the expanded panel; compact mode leaves Tab alone.
- `styles.responsive.test.ts` — the stylesheet contract for the expanded overlay (fixed 100dvh, safe-area padding, scroll lock, desktop centred panel) and the shared shop-card image ratio.
- `ShopCard.test.tsx` — wordmark, cover image, monogram fallback on image error, both open actions.
- `seedAssets.test.ts` — every shop/promo/hero asset referenced by demo data exists in `public/` and no two shops share an image.
- `ChatUxFixes.test.tsx` — Phase 3 regressions: hidden attachment input is not a tab stop, the page behind the expanded overlay is marked `inert`/`aria-hidden` and restored, the overlay follows `visualViewport` when the keyboard opens (with a dvh fallback), and messages survive leaving a chat and returning.
- `tenantTemplate.test.ts` — the onboarding doc keeps one row per demo shop and keeps every row marked fictional/wordmark-only.
- `App.smoke.test.tsx` — all 22 demo routes (customer, shop staff, delivery partner, mall admin) mount after the Phase 2 changes.

Verified: `tsc --noEmit` clean, production build clean, dev preview served and smoke-checked (home, manifest, service worker, images).

> Phase 2 note: no real browser could be launched in the build environment (no
> Chromium, and the sandbox blocks browser downloads), so the expanded chat was
> verified through the DOM/behaviour tests above plus stylesheet assertions, not
> by screenshotting a rendered device. A manual phone/desktop pass is still
> recommended.

## Deployment

Preview deployments are currently triggered manually — the Vercel project is not linked to
GitHub, so pushes do not deploy. See [`docs/deployment.md`](docs/deployment.md) for the
verified project configuration, the known-good Preview/rollback deployments, and the exact
dashboard steps to enable push-to-Preview. Preview only: nothing is promoted to Production.

## Known limitations (by design)

- Mock data persists only in the browser (`localStorage`); photo attachments are downscaled data URLs kept on-device and may stop persisting if storage fills — the demo keeps running in memory.
- Simulated shop replies are canned and keyword-based, and always labelled simulated.
- Distances, payouts and the commission model are supplied demo values — no routing engine, no pricing engine.
- The PWA service worker caches the app shell only; there is no offline ordering, background sync or push notifications.
- Demo Mode role switching is a presentation tool, **not** authentication.
- Tenant listings are transcribed from the mall's store directory, which publishes no "last updated" date: 23 of 29 entries are `directory-only` and marked on their shop page as not independently confirmed as current. Nothing here proves a shop is still trading today.
- No tenant has given permission for anything: names and shop numbers are used because the mall publishes them, and every chat/order/delivery is simulated. Real onboarding is a separate, consent-based step (see the onboarding template).
- Shop covers are shared category illustrations, not photographs of the named businesses.

## Recommended Phase 2 (backend)

1. Persistent database + API implementing `MarketplaceService`; real accounts for customers, shop staff, drivers and admins, with **server-side** role authorisation and per-shop data isolation.
2. Real-time messaging (WebSockets) with delivery/read receipts; secure image uploads with file validation.
3. Server-side order/price validation, status-transition enforcement and audit logging of order changes.
4. Delivery assignment rules, driver onboarding/KYC, and privacy-preserving address reveal after acceptance.
5. Payments decision (in-store/on-delivery/online) with a PCI-compliant provider; refunds on cancellation.
6. Notifications (push/SMS/WhatsApp Business API — evaluated separately), rate limiting, POPIA-aligned retention and privacy controls.
7. Tenant onboarding workflow with mall-management verification before a shop can trade; promotion billing and attribution instrumentation.
