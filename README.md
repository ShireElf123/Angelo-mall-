# Angelo Mall Go — Phase 1 Frontend Prototype

**Your mall. Your shops. One easy way to shop.**

A mobile-first, chat-oriented, multi-vendor shopping and local-delivery **PWA concept** for Angelo Mall, Nigel, Gauteng — built as a production-quality, interactive frontend with a backend-ready architecture.

> ⚠️ **Demonstration only.** Every tenant, price, trading hour, distance and metric in this app is sample data. No shop has confirmed participation, no endorsement by Angelo Mall is implied, and no real orders, payments or deliveries take place. There are no user accounts: a clearly labelled **Demo Mode** switcher changes between the four workspaces.

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

1. **Customer:** open the **Mzansi Fresh Grocers** chat — a basket (`AMG-1001`, bread/milk/eggs/mince) is already waiting. Send a message and you'll get a clearly labelled *simulated* reply.
2. Review the basket and **confirm the demo order** (choose delivery).
3. Switch **Demo Mode → Shop staff**: open Thandi's conversation, reply as the shop, then **Accept → Start preparing → Ready — request delivery partner**.
4. Switch to **Delivery partner**: accept the Mzansi Fresh job, then **Confirm collection → Start delivery → Confirm delivered**.
5. Back to **Customer → Orders**: `AMG-1001` shows **Delivered** with a complete timeline.
6. Bonus: in Shop staff, open Sipho's unread chat and build an order from scratch — no catalogue, just agreed items. Then visit **Mall admin** to see the numbers move.

---

## What's inside

### Customer experience
- Home with shop search, categories, featured shops, promotions, recent chats and active-order strip.
- Searchable/filterable shop directory (category, delivery/collection, open-now demo state) with honest participation labels ("Demo tenant" vs "Directory example — not a confirmed partner").
- Shop pages with sample hours, fulfilment options, "popular things to ask" shortcuts and a prominent **Start chatting** action. **No product-catalogue grid.**
- WhatsApp-style conversation (original UI, no WhatsApp branding): text + photo attach (downscaled in-browser, stored on-device only, labelled as demo), day separators, timestamps, typing indicator, and **structured order cards** embedded in the thread.
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

## Tests (19, all passing)

- `orderWorkflow.test.ts` — ZAR totals (delivery vs collection), formatting, item validation, transition guards, fulfilment-specific timelines.
- `reducer.test.ts` — the full acceptance journey on shared state (chat → draft → change request → confirm → prepare → driver → delivered), failed-delivery re-publish, demo reset.
- `ChatThread.test.tsx` — message rendering, order-card CTA, simulated-reply label, composer send + Enter/Shift+Enter behaviour.
- `router.test.ts` — hash round-trips incl. directory search/category deep links and role mapping.

Verified: `tsc --noEmit` clean, production build clean, dev preview served and smoke-checked (home, manifest, service worker, images).

## Known limitations (by design, Phase 1)

- Mock data persists only in the browser (`localStorage`); photo attachments are downscaled data URLs kept on-device and may stop persisting if storage fills — the demo keeps running in memory.
- Simulated shop replies are canned and keyword-based, and always labelled simulated.
- Distances, payouts and the commission model are supplied demo values — no routing engine, no pricing engine.
- The PWA service worker caches the app shell only; there is no offline ordering, background sync or push notifications.
- Demo Mode role switching is a presentation tool, **not** authentication.

## Recommended Phase 2 (backend)

1. Persistent database + API implementing `MarketplaceService`; real accounts for customers, shop staff, drivers and admins, with **server-side** role authorisation and per-shop data isolation.
2. Real-time messaging (WebSockets) with delivery/read receipts; secure image uploads with file validation.
3. Server-side order/price validation, status-transition enforcement and audit logging of order changes.
4. Delivery assignment rules, driver onboarding/KYC, and privacy-preserving address reveal after acceptance.
5. Payments decision (in-store/on-delivery/online) with a PCI-compliant provider; refunds on cancellation.
6. Notifications (push/SMS/WhatsApp Business API — evaluated separately), rate limiting, POPIA-aligned retention and privacy controls.
7. Tenant onboarding workflow with mall-management verification before a shop can trade; promotion billing and attribution instrumentation.
