# Angelo Mall Go — Multi-Tenant Product Reality Audit

**Audited:** branch `arena/aeeb5cff-angelo-mall`, commit `4d2ec84c93e459415f30f20a8d8a066897629299`
**PR:** #2 (open) · **Worktree:** clean · **Remote HEAD verified:** `4d2ec84`
**Method:** source inspection + live Chromium rendering of the production build, including a two-profile test for cross-session behaviour.
**Changes made:** none to application code, data, auth or configuration.

---

## 1. Architecture overview

**Angelo Mall Go is a single-page React 19 application with no backend of any kind.**

| Layer | Reality |
|---|---|
| Runtime | React 19 + Vite 6, built to static `dist/` |
| Dependencies | `react`, `react-dom`, `lucide-react` — nothing else |
| Backend / API | **None.** Verified: no `server/`, `api/`, `functions/`, `supabase/`, `prisma/`, `migrations/`, `.env*` |
| Database | **None.** Single `localStorage` key: `angelo-mall-go-demo-v1` |
| Network calls | **Zero.** No `fetch`, `axios`, `WebSocket` or `EventSource` anywhere in `src/` |
| Auth | **None.** No accounts, no session, no token |
| Hosting | Static bundle on Vercel (preview only) |

### The load-bearing seam

`src/services/marketplaceService.ts` (117 lines) defines a `MarketplaceService` interface with 18 methods
(`sendMessage`, `confirmOrder`, `setOrderStatus`, `acceptDeliveryJob`, …), every one returning `Promise`.
Screens call *only* this interface. `createMockMarketplaceService()` implements it by dispatching
synchronously to a client-side reducer wrapped in a resolved Promise.

This is a genuinely good decision: the UI is already written as if against a network API, so a real backend
can be introduced behind this boundary without rewriting screens. The file's own header states exactly this
intent. **It is the single most valuable asset for the licensing goal** — and it is also the reason the app
*feels* more complete than it is: `await` on a resolved Promise is indistinguishable from `await` on a
fast API, so nothing in the UI signals that no server was involved.

### State model (already tenant-shaped)

`src/types.ts`: `Conversation { shopId, customerId, customerName, unreadForCustomer, unreadForShop }`,
`Order { shopId, customerId, conversationId, items[], status, history[] }`,
`DemoState { role, activeShopId, shops[], conversations[], messages[], orders[], deliveryJobs[], promotions[], seq }`.

Every conversation and order already carries a `shopId` and a `customerId`. Selectors in
`src/store/selectors.ts` correctly scope by them (`conversationsForShop`, `ordersForShop`). The data model
needs no redesign to become multi-tenant — **only enforcement is missing.**

---

## 2. Feature reality matrix

Status key: **Implemented** (logic genuinely exists and behaves correctly) · **Simulated** (correct-shaped
behaviour, fabricated data/actors) · **UI-only** (renders, does nothing real) · **Missing**.

### A. Tenant and shop management

| Capability | Status | Evidence | On refresh / new session | Cross-session |
|---|---|---|---|---|
| Shop records, unique IDs | **Implemented** (data) | `src/data/tenants.ts` — 29 tenants, stable `shop-NNN` ids | Persist in bundle | Same for all users |
| Tenant onboarding / approval | **Missing** | No signup, invite or approval flow. `docs/tenant-onboarding-template.md` is a *document*, not software | — | — |
| Owner/manager accounts | **Missing** | `Role = 'customer' \| 'shop' \| 'delivery' \| 'admin'` is a *view selector*, not an identity (`types.ts:10`) | — | — |
| Staff membership per shop | **Missing** | No user↔shop association exists anywhere | — | — |
| Shop-specific permissions | **Missing** | Zero authorization checks in `reducer.ts` (see §3) | — | — |
| Isolation between tenants | **Missing (UI-scoped only)** | Retailer filters by `state.activeShopId`, but `SET_ACTIVE_SHOP` is a free `<select>` of all 29 shops (`RetailerWorkspace.tsx:188`) | N/A | Single-device only |
| Shop details, hours | **Simulated** | `tradingNow`, `hoursLabel` are static demo fields, not computed from real hours | Static | Static |
| Approved specials | **Missing** | No "special/offer/price-list" entity. `Promotion` is an advertising placement, not a product special | — | — |

### B. Customer messaging

| Capability | Status | Evidence |
|---|---|---|
| Message creation | **Simulated** | `SEND_MESSAGE` in `reducer.ts:175` writes to client array |
| Persistence | **Simulated (device-local)** | `DemoStore.tsx` — one `localStorage` key, whole state per browser |
| Routing to correct shop | **Implemented (in-model)** | Messages carry `conversationId`; conversation carries `shopId` |
| Real retailer inbox | **UI-only** | `RetailerWorkspace.tsx:91` renders same local state; cannot receive a message from another device |
| Real retailer reply | **UI-only** | `service.sendMessage({sender:'shop'})` works locally only |
| Scripted replies | **Simulated, and mixed in** | `ChatScreen.tsx:191-205` — **every** customer message auto-injects a shop reply after 1700ms, `simulated: true` |
| Unread state | **Simulated** | `unreadForCustomer` / `unreadForShop` counters in local state |
| Timestamps, history | **Implemented** | Real `createdAt` ordering, turn grouping, day separators |
| Notifications / push | **Missing** | No service worker push, no notification permission |

**Critical interaction:** real and scripted replies are **not mutually exclusive**. A customer message
schedules a canned reply at +1.7s; a staff member replying in the retailer workspace writes a *real* message
into the same thread. Nothing suppresses the scripted reply when a human answers. In one live probe the
thread ended with a genuine shop message followed immediately by a `simulated: true` canned reply.

### C. Orders

| Capability | Status | Evidence |
|---|---|---|
| Item selection & quantities | **Implemented** | `ADD/UPDATE/REMOVE_ORDER_ITEM`, `validateLineItem()` (`utils/orderWorkflow.ts`) |
| Shop sets prices | **Implemented (in-model)** | `LineItem.unitPrice` documented "Customers cannot edit this"; customer UI has no price field |
| Customer approval | **Implemented** | `CONFIRM_ORDER` guards status, non-empty items, no pending change requests (`reducer.ts:399`) |
| Status transitions | **Implemented — the strongest logic in the app** | `DELIVERY_FLOW` / `COLLECTION_FLOW` tables + `canTransition()` (`orderWorkflow.ts:26-69`) |
| Duplicate submission | **Handled** | `CONFIRM_ORDER` requires `status === 'awaiting-customer'`, so a second call is a no-op |
| Cancellation | **Implemented** | `CANCEL_ORDER` by customer or shop; blocked after delivery/completion |
| Persistence | **Simulated (device-local)** | — |

The order state machine is real software with real guards. It would survive being lifted to a server.

### D. Fulfilment

| Capability | Status | Evidence |
|---|---|---|
| Collection vs delivery choice | **Implemented** | `FulfilmentMethod`, chosen at confirm |
| Delivery fee | **Simulated** | Static `shop.deliveryFee`, snapshotted at confirm (`reducer.ts:411`) |
| Job creation | **Implemented** | `createDeliveryJob()` on transition to `awaiting-driver` |
| Assignment | **Simulated** | `ACCEPT_JOB` — no driver identity, no roster, any session can accept |
| Driver status updates | **Implemented (in-model)** | `ADVANCE_JOB` → collected / out-for-delivery / delivered / failed |
| Customer tracking | **Implemented** | `timelineSteps()` renders real order history |
| Real courier / GPS / dispatch | **Missing** | No integration, no location, no distance calculation (distance is a stored demo number) |

### E. Mall management

| Capability | Status | Evidence |
|---|---|---|
| Tenant administration | **Simulated** | Admin sets `participation`, `featured`, `tradingNow` (`AdminWorkspace.tsx:174-198`) — local only |
| Specials approval | **Missing** (promo approval exists) | `ADMIN_UPSERT_PROMOTION`, `ADMIN_SET_PROMO_ACTIVE`, `ADMIN_DELETE_PROMOTION` |
| Reporting | **Simulated** | GMV, funnel, orders-by-status all computed from local demo state (`AdminWorkspace.tsx:478-516`) |
| Admin permissions | **Missing** | Admin reachable by URL alone — confirmed live, no login encountered |
| Audit trail | **Partial, order-level only** | `Order.history[]` records status + timestamp + note. **No admin action log** — who changed a shop's participation is not recorded |

### F. Customer-facing copy

Full inventory in §6.

---

## 3. Security and data isolation

**Verdict: there is no isolation boundary to breach, because there is no server, no identity and no
authorization — in the entire codebase.**

Verified by source inspection and by live browser probes:

1. **Zero authorization checks.** A repo-wide search for `role ===`, `canAccess`, `permission`,
   `authorize`, `forbidden` in non-test source returns only two *marketing sentences* in `MiscScreens.tsx`.
   The reducer accepts every action from every screen. `SET_ROLE` and `SET_ACTIVE_SHOP` are ordinary
   unauthenticated actions.

2. **Every tenant's data is in one object.** `DemoState` holds all conversations, messages, orders and jobs.
   The "isolation" is a `.filter()` in a selector — correct in intent, trivially bypassed by editing
   `localStorage` or by calling `SET_ACTIVE_SHOP`.

3. **Confirmed live:** from the retailer inbox, changing the shop `<select>` to `shop-kfc` made KFC's
   customer threads render immediately for the same unauthenticated session. Switching again exposed
   SUPERSPAR's `conv-superspar-thandi` with **6 readable message bodies** belonging to the other tenant.

4. **Admin is open.** Navigating directly to `#/admin/overview` renders the full management workspace.
   No login, no role check, no redirect.

5. **Delivery sees across shops.** `#/delivery/available` listed jobs from two different shops
   (`shop-kfc`, `shop-clicks`).

6. **The app says so itself.** `RetailerWorkspace.tsx:203-206` renders a banner: *"Demo convenience only:
   this shop switcher is **not** security. In production, staff sign in and the server limits them to their
   own shop's data."* This is honest, and it is an accurate description of the gap.

7. **The one real cross-device test.** Two isolated browser profiles (customer on A, staff on B):
   A sent `TENANT-ISOLATION-PROBE-9137`, which persisted locally on A. **B never received it** — B's
   `localStorage` did not contain the probe, and the staff inbox never showed it. A third fresh profile
   started from seed. Conclusion: **there is no shared data plane at all.** Two people cannot talk to each
   other through this app, in any configuration.

> Note on framing: this is not a defect to be patched. It is the correct, deliberate design for a Phase-1
> demo, and it is comprehensively disclosed. It becomes a defect the moment anyone describes the product as
> "multi-shop" or licenses it, because nothing about it is actually multi-tenant beyond the data shape.

---

## 4. Highest-risk gaps

Ordered by risk to the licensing and pilot goal.

| # | Risk | Why it matters | Severity |
|---|---|---|---|
| 1 | **No server, so no cross-device messaging** | The product's central promise — a customer chats with a shop — cannot be demonstrated between two devices. Every "conversation" is one browser talking to itself. | Critical |
| 2 | **No identity, so no tenant boundary** | Any user can become any tenant and read any tenant's data. Unfixable in the client; must be server-enforced. | Critical |
| 3 | **Scripted replies are mixed into real threads** | Once real messaging exists, the two paths collide and the app would fabricate shop replies alongside a human's. Must be disabled server-side per environment, not by UI flag. | High |
| 4 | **No admin audit trail** | Reporting is derived from demo state; no record of who changed a tenant's status. Unacceptable for a mall operator. | High |
| 5 | **No tenant onboarding or staff accounts** | "Licensed to other malls" implies a mall can add tenants and staff. There is no mechanism at all. | High |
| 6 | **Data loss on cache clear** | All state is one `localStorage` key; clearing site data destroys every message and order. | Medium |
| 7 | **No approved specials / price list** | The owner-facing promise of "specials" has no entity. `Promotion` is advertising, not offers. | Medium |
| 8 | **~175 "demo/simulated" strings in rendered UI** | Blocks any credible production presentation (§6). | Medium |
| 9 | **External logo URLs** | 13 retailer logos load from brandfetch / companieslogo / thespargroup; fall back to monograms. Third-party hotlinking is fragile and an IP risk. | Low-Medium |
| 10 | **No isolation or messaging tests** | 441 tests pass, but **none** assert tenant isolation, because there is nothing to test. The suite cannot catch a regression in a boundary that does not exist. | — |

---

## 5. Recommended minimum viable live pilot

**Do not attempt a full multi-mall platform. Ship one real loop for one shop.**

The smallest honest "live" version that proves the concept to the owner:

> **One mall, one real shop, real messages, real conversations — orders still simulated.**

Scope:
- **1 mall** (Angelo), **1–3 consenting tenants**, **1 real customer** (the owner or a staff member).
- Real **customer ↔ shop chat** that works across devices.
- Real **tenant accounts with server-enforced shop scoping**.
- Real **unread counts and history**.
- Orders/basket **kept explicitly simulated** (the state machine already works; leave it local or
  server-simulated and keep the disclosure).
- **Scripted replies disabled** in the pilot environment.
- Admin sees real conversations and can suspend a tenant — with an audit record.

Explicitly **out of scope** for the pilot: payments, real delivery dispatch, catalogues, stock, promotions
billing, multi-mall tenancy, self-serve onboarding.

Why this shape: it makes the *one claim that matters* — "a shopper can really talk to the shop" — true and
demonstrable, while every remaining simulation stays honestly labelled. It also forces the isolation work,
which is the actual blocker to licensing.

---

## 6. Phased implementation plan (dependency-ordered)

**Phase 0 — Decisions (no code).** Choose hosting for the backend, identity provider, and database.
Confirm which tenants consent to participate. Agree the disclosure policy for the pilot. *Blocker for all
phases.*

**Phase 1 — Backend foundation.** Introduce an API + database (conversations, messages, orders mirroring
`src/types.ts`). Implement `MarketplaceService` against it — the interface already exists, so screens do not
change. Move `seq →` DB-generated IDs. **Depends on:** Phase 0.

**Phase 2 — Identity and tenant scoping.** Real sign-in for customers and shop staff. Staff records bound to
one `shopId`. **Server-side** authorization on every read and write: a staff token may only touch its own
shop's conversations, orders and jobs. Remove `SET_ROLE` / `SET_ACTIVE_SHOP` from the customer bundle.
**Depends on:** Phase 1. **This is the licensing blocker.**

**Phase 3 — Real messaging.** Persist messages server-side; deliver via polling or websockets. Move unread
counts to the server. **Disable scripted replies outside demo mode** — decide it server-side from
environment, never from a client flag. **Depends on:** Phase 2.

**Phase 4 — Tenant lifecycle.** Tenant onboarding, staff invitations, mall-admin approval, and an **audit
log** for every administrative action. **Depends on:** Phase 2.

**Phase 5 — Orders (optional for pilot).** Lift the existing state machine to the server. It is already
sound; it needs a transaction boundary and idempotency keys, not a redesign. **Depends on:** Phase 3.

**Phase 6 — Fulfilment / delivery.** Driver accounts, job assignment, real status feed. **Depends on:** Phase 5.

**Phase 7 — Multi-mall.** `mallId` scoping above `shopId`; per-mall admin. **Depends on:** Phases 2–4.

---

## 7. Copy-cleanup plan

The app is scrupulously honest — a real strength that must not be lost. The problem is **volume and
placement**: ~175 rendered occurrences of demo/simulated/sample across customer (80), staff (71) and shared
components (24). Disclosure is repeated at the point of *every* action, so it reads as apology rather
than design.

### Classification

| Class | Examples | Recommendation |
|---|---|---|
| **Necessary disclosure** — must stay | "The Angelo SUPERSPAR is a real tenant but has no Mall Go account"; "No payment has been taken"; "Concept art, not a photograph"; "nothing you send reaches a shop" | **Keep, in production wording**, while anything is simulated. Consolidate to one clear notice per screen instead of one per element. |
| **Customer-facing noise** — remove once real | "Open now (demo)", "Demo orders in progress", "Photo (demo)", "Review basket & confirm (demo)", "demo prices" on every line | Remove as each feature becomes real. Until then, keep **one** banner per screen. |
| **Internal / staff** — keep in demo, drop in pilot | "Shop staff workspace · demo", admin "Demo orders by status", "Demo convenience only: this shop switcher is not security" | Correct today. Delete as each becomes real. |
| **Test-only** | test fixtures and probes | No action. |
| **Word choice** | "sample" (50), "placeholder" (15), "prototype" (5) | Standardise on **"demo"** for the demo, and one precise term per disclosure. "Sample conversation" → "example conversation". |

### Specific production wording

| Now | Production |
|---|---|
| `Open now (demo)` | `Open now · hours from the mall directory` (only if real hours are sourced; otherwise remove the state) |
| `Total incl. demo delivery` | `Delivery` |
| `Demo image · stored on this device only` | `Image attached` (once uploads are real) |
| `Sent (demo)` | Remove — a checkmark must mean sent |
| `Simulated reply (demo) — no staff member has responded.` | `Automated reply` — and only while automation is intentional |
| `Demo orders in progress right now.` | `Orders in progress` |
| `Restrained demo placements` | `Promotions` (keep the Sponsored label, which is a legal requirement, not demo noise) |

**Rule:** never remove a disclosure that is still true. Remove only the ones that stop being true, and
never more than one notice per screen.

---

## 8. Tests required to prove isolation and real messaging

None of these can pass today; they define the acceptance criteria for Phases 1–3.

**Tenant isolation (must run server-side):**
1. A staff token for shop A `GET`s shop B's conversation by id → **403**, and the response body leaks nothing.
2. Staff A `POST`s a message into shop B's conversation → **403**, and no message row is created.
3. Staff A `GET`s the inbox → returns **only** shop A conversations, asserted by exhaustive id comparison.
4. Staff A attempts an order status transition on shop B's order → **403**, status unchanged.
5. Customer A `GET`s another customer's conversation → **403** (customers are tenants of their own data).
6. Delivery token can read destination area but **not** message bodies or customer identity.
7. Forged/expired/absent token on every protected route → **401**, verified as a table-driven test over routes.
8. Mall admin can read across shops; shop staff cannot. Two roles, same route, different result.
9. **Property test:** for a random sample of (actor, resource) pairs, access is granted iff
   `resource.shopId === actor.shopId`. This is the invariant that actually prevents regressions.

**Real cross-session messaging:**
10. Two independent clients (separate sessions): A sends, B receives within N seconds **without a reload**.
11. Message persists server-side; a **third** fresh session sees the full history.
12. Unread count increments for the recipient only, and clears on read for that recipient only.
13. Ordering is stable and monotonic under concurrent sends from both sides.
14. **Scripted replies are absent** in the pilot environment — assert no message with `simulated: true` can
    be created when the server environment is `production`, and that the client cannot request one.
15. A human reply cancels or supersedes any pending automated reply (no double-answer).
16. Reconnect after network loss delivers missed messages exactly once (no duplicates, no gaps).

**Data integrity:**
17. Clearing client storage does not lose server state.
18. Concurrent `CONFIRM_ORDER` from two devices produces exactly one confirmed order (idempotency).

---

## 9. Summary for the decision-maker

**What is genuinely built:** an unusually well-structured frontend with a real service boundary, a real
order state machine, tenant-shaped data, and an honest disclosure system. ~441 tests. It is a strong
prototype of the *experience*.

**What is not built:** the entire multi-user product. There is no server, no database, no identity and no
authorization. Two people cannot use it together, and any user can read any tenant's data because the
"tenant" is a dropdown.

**The decisive fact:** this is not a gap to be polished — it is Phase 2 of the product, not started. The
good news is that the frontend was built *as if* behind an API, so the work is mostly additive behind
`MarketplaceService` rather than a rewrite.

**Recommendation:** approve a narrow, honest pilot — one mall, one to three consenting shops, real chat,
simulated orders — and treat identity plus server-side tenant scoping (Phases 1–3) as the gate. Do not
describe the product as multi-tenant until test #9 passes.
