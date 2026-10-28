# Pre-Approval Presentation Readiness

**Date:** 28 October 2026
**Branch:** `arena/aeeb5cff-angelo-mall`
**Reviewed at:** `f3dbb21` (docs: multi-tenant product reality audit)
**Fixes committed as:** `644f33f`
**Prerequisite reading:** [`product-reality-audit.md`](./product-reality-audit.md) — what is real vs. simulated, per feature.

**Scope of this pass:** presentation and prototype polish only. No backend, no real
shops, no real payments, no accounts. Nothing here should be read as a claim that
the product is live or production-ready. It is not.

---

## 1. How this was checked

The audit was done against the **production build**, not the dev server, so that
what was measured is what the owner will actually see.

- Build rendered in headless Chromium at **320, 360, 390, 430, 560, 768, 899,
  900 and 1280 px** wide.
- **22 routes** walked: home, directory, two shop profiles, chat list, chat,
  basket, orders, order detail, help, promotion, three staff views, three
  delivery views, six admin views.
- **0 JavaScript page errors** across the whole sweep.
- Dead-button scan: every `<button>` and link clicked, resulting route or state
  diffed. **16 apparent no-ops were investigated and all are correct** — they are
  already-active tabs or the brand home link.
- Zero-width element scan: any element that collapses to no width was listed and
  justified. Only two do, both deliberately (icon-only reset label, screen-reader
  text).
- Layout measured numerically (element widths and `scrollWidth`) rather than
  judged from screenshots.
- The full demo journey was driven end to end from a cleared `localStorage`, and
  the demo reset was tested.

Existing suite at the start of this pass: **441 tests in 44 files**, `tsc` clean,
build clean. That is the baseline every finding below is measured against.

---

## 2. Priority findings

### Critical

**C1 — The order list was unreadable on every phone.** *Fixed.*

`.order-list-card` laid out the whole card on one non-wrapping row. A status pill
("Awaiting your confirmation", 187 px) plus the avatar and the Chat button used up
the row, leaving the text column **exactly 0 px wide** at 320, 360, 390 and
430 px. The order reference was ellipsised to `AM…`, the summary broke to one
word per line, and the price was clipped. The owner's own orders screen — the
screen that answers "did my order go through?" — was the worst-looking screen in
the product.

*Why it mattered for the presentation:* this is the screen an owner opens to
check that yesterday's demo order is still there. It looked broken, and it looked
broken on a phone, which is how most owners will first see it.

*Fix:* below 560 px the card stacks — identity and summary on one line, status
beneath, Chat button on its own full-width row. The text column now measures
**206–308 px** at every phone width.

### High

**H1 — First-screen search placeholder was cut mid-word.** *Fixed.*

The home search field is ~125 px wide at 320 px and ~171 px at 390 px. The
placeholder ran to 51 characters and was clipped behind the Search button, so the
first interactive element on the first screen of the walkthrough read as a broken
field. Now `"Search shops or a need…"`.

**H2 — Duplicate navigation on the admin dashboard.** *Fixed.*

All three workspaces (admin, staff, delivery) render an in-page tab row listing
the same five destinations as the header nav. At ≥900 px both rows were shown, so
the dashboard opened with two stacked, identical
Overview / Shops / Promotions / Deliveries / Reports rows. That reads as unfinished
work, and it was the first thing visible on the mall-management screen.

*Fix:* from 900 px the header nav carries navigation alone. **Below 900 px the tab
row stays deliberately** — the phone nav is icon-led, while the tabs give full
labels and larger tap targets. Verified: exactly one navigation at 900 and
1280 px, and the tabs still navigate at 390 px.

### Medium

**M1 — Two grid rows could not shrink.** *Fixed.*

Both are the same CSS mistake, found by the overflow sweep:

- `.item-editor__row` used bare `1fr` tracks. A date input has an intrinsic
  minimum width, so the admin promotions form (Starts / Ends) pushed the page to
  **358 px on a 320 px screen**.
- `.orders-board` relied on implicit grid tracks, and grid items default to
  `min-width:auto`, so an order row forced each staff bucket to **327 px on a
  320 px screen**.

Both now use `minmax(0, 1fr)`. Overflow sweep after the fix: **0 of 132
route × width combinations** overflow (was 3).

**M2 — Admin tab row is horizontally scrolled at narrow widths.** *Reported, not changed.*

The admin tab row needs 666 px of content at 358 px of viewport, so the last tabs
sit off-screen and must be scrolled to. Every tab remains reachable by scrolling,
and no content is lost. Changing this means restructuring the admin information
hierarchy, which is an owner decision, not a polish fix. See §9.

### Low

**L1 — The demo journey only completes on 4 of 29 shops.** *Reported, not changed.*

This is the biggest honesty issue in the product and it is **not** a bug to patch.

Only `shop-superspar`, `shop-kfc`, `shop-clicks` and `shop-mtn` have seeded order
history, which is what a chat needs in order to produce a basket and a checkout.
There is **no customer-facing product catalogue at all** — items enter a basket
only from seeded data or from a staff member's item editor.

Consequence, verified from a cleared browser: the directory's first card is KFC.
Open it, "Continue the sample chat", send a message — it sends, and a scripted
reply arrives — but there is **no basket bar and no way to order**, because KFC's
seed order is already `completed`. A presenter who starts at the top of the
directory hits a dead end within about 40 seconds.

Do not paper over this by inventing a KFC basket. Instead, present from the
walkthrough entry point, which is wired to SUPERSPAR and is verified end to end:

> Home → "Open the walkthrough" → SUPERSPAR chat → basket → "Confirm demo order" →
> order `awaiting-shop` → the staff inbox receives it.

**L2 — 212 blocked external resources.** *Reported, not changed.*

Every one of them is a third-party fetch: Google Fonts and 13 hotlinked retailer
logos. There were **zero** real JavaScript errors. Both degrade gracefully — Inter
falls back to the system font and unloaded logos fall back to a monogram tile
(verified: 19 of 29 cards use the monogram at narrow widths and it renders
cleanly, by design). Risk is limited to a venue with poor Wi-Fi: the page will
look slightly different, not broken.

**L3 — Cover images.** *Investigated, no defect.*

An early sweep reported all 29 cover images at `naturalWidth 0`. That was a
measurement artifact — the images are `loading="lazy"` and had not entered the
viewport. Forcing eager loading and re-measuring with `networkidle`:
**29 of 29 load**, served from the local `-480.webp` variants. Nothing to fix.

---

## 3. What was verified as already correct

These were checked specifically because they are the things most likely to
mislead an owner, and all of them hold up:

- **Simulated chat is labelled as simulated.** A scripted reply is visibly marked
  *"Simulated reply (demo) — no staff member has responded"*. It does not pretend
  to be an AI assistant or a real employee.
- **Role switching does not imply separate users.** The staff banner states that
  the switcher is *"not security"*. Nothing in the UI suggests a second device or
  a second person.
- **Admin figures are labelled as sample data.** Panels carry *"Sample figures —
  not mall performance"*. No revenue, customer count, participation rate or order
  volume is fabricated as fact.
- **Demo reset is safe.** It confirms before acting (naming what will be
  discarded), resets only the demo dataset, never touches auth or production, and
  the seed is restored correctly — verified by sending a probe message (28
  messages) and observing the count return to 26 after reset, surviving a reload.
- **The SUPERSPAR journey is complete**: chat → basket `ord-demo-1001` → confirm
  dialog (`Not yet` / `Yes — confirm demo order`) → `#/order/ord-demo-1001` at
  `awaiting-shop` → visible in the staff inbox.
- **Empty and loading states** exist on every list screen checked.

---

## 4. Changes made

All four are CSS/JSX only. No data, no routes, no store, no auth, no
configuration.

| File | Change | Why it helps the presentation |
|---|---|---|
| `src/index.css` | `@media (max-width: 560px)` block stacking `.order-list-card` | The orders screen — the one an owner checks to see if an order went through — no longer looks broken on a phone (C1) |
| `src/index.css` | `.workspace-tabs { display: none }` inside `@media (min-width: 900px)` | Removes the duplicate nav row from the admin/staff/delivery screens, which read as unfinished (H2) |
| `src/index.css` | `minmax(0,1fr)` on `.item-editor__row` and `.orders-board` | Kills the last sideways-scroll cases on small phones (M1) |
| `src/screens/customer/Home.tsx` | Search placeholder shortened to `"Search shops or a need…"` | The first field on the first screen no longer clips mid-word (H1) |
| `src/styles.presentation.test.ts` | **New.** 4 tests pinning the above | Stops these four regressions coming back; jsdom cannot see layout, so these assert the source contract, and the measurements live in the commit message |

**Untouched, on purpose:** the ~175 demo/simulated disclosures stay exactly as
they are, because they are still true. Nothing was removed to make the demo look
more "live".

---

## 5. Checks actually run

| Check | Result |
|---|---|
| `tsc --noEmit` | **0 errors** |
| `vitest run` | **445 passed / 45 files** (baseline 441 / 44; +4 new, none altered) |
| `npm run build` | **OK** — CSS 79.00 kB (gzip 15.01), JS 500.12 kB (gzip 133.89) |
| Browser sweep, 22 routes × 6 widths | **0 / 132 horizontal overflow** (was 3), **0 JavaScript page errors** |
| Duplicate-nav check at 1280 px | **0 of 3** workspaces (was 3 of 3) |
| Full demo journey from cleared storage | **PASS** — all 8 steps |
| Demo reset | **PASS** — confirms, restores seed, survives reload |
| CI on `644f33f` | **success** (run `40751157711`) |

Existing tests were not weakened, skipped or deleted. No assertion was removed.

---

## 6. Remaining bugs and limitations

1. **No customer product catalogue.** Browsing a shop shows no products to add;
   ordering only works off seeded baskets or a staff-built one. This is the single
   largest gap between how the demo behaves and how a mall marketplace is expected
   to behave. It is a feature, not a defect — see §9.
2. **4 of 29 shops can complete the journey** (L1). Start the demo at the
   walkthrough entry point, not at the top of the directory.
3. **Admin tab row scrolls sideways** at narrow widths (M2).
4. **Demo state lives in one browser's `localStorage`.** Clearing site data, or
   opening a different browser, resets to the seed. Two devices cannot see each
   other's orders — expected, but do not demo it as cross-device.
5. **Externally hosted fonts and logos** (L2) will look slightly different on a
   restricted network.

## 7. Still simulated / local only

Everything. There is no production backend, no database, no real shop, no real
payment, no real message delivery and no real customer. All state is seeded demo
data held in the browser. The "shop", "staff", "delivery partner" and "mall admin"
views are switches over the same local dataset, not separate accounts.

---

## 8. Suggested owner walkthrough (about 6 minutes)

1. **Home.** Point out the search field and the walkthrough entry point. Say
   plainly: "the shops and products you see are sample data."
2. Tap **"Open the walkthrough"** → lands on **The Angelo SUPERSPAR**.
3. Open the sample chat. Send a message. Read the *"Simulated reply (demo) — no
   staff member has responded"* label out loud — this is the honesty moment.
4. Tap the **basket bar** → review the basket → **"Confirm demo order"** → the
   dialog explains it is a demo.
5. Land on the **order screen**: `awaiting-shop` timeline.
6. Switch to **Shop staff** → the new order is in the inbox. Move it forward.
7. Switch back to **Customer** → the timeline reflects the change.
8. Open **Mall admin** → state clearly that the figures are labelled sample data
   and are not mall performance.
9. Finish with **"what would be real, and what it would take"** — see the next
   section.

Do not open KFC or other directory cards to order during the walkthrough.

## 9. Needs owner approval before anything is built

1. **A real product catalogue** — the decision that unblocks real ordering. Until
   it exists, no shop can genuinely sell.
2. **The 25 shops without order history** — whether they get seeded demo menus
   (so any card in the directory can demo), or whether the walkthrough stays a
   four-shop path.
3. **Admin information architecture** — whether the admin tab row should become a
   sidebar (fixes M2, but is a layout decision).
4. **Real shops, real accounts, payments** — all out of scope until approval.

## 10. Confirmations

- **Production unchanged.** No deployment to production was made or requested.
  The most recent production-target deployment in the Vercel project is a
  `CANCELED` build of the base commit `65f48b2`; nothing has been promoted.
- **No real shops connected.** No shop owner was contacted, no external shop
  integration was added, no real order, payment, message or customer record
  exists.
- **No settings, domains, env vars, secrets, authentication, permissions or access
  controls were changed.** No new dependencies; the audit tooling was installed
  without saving and removed again, leaving `package.json` and
  `package-lock.json` byte-identical.
- **PR #2 remains open and unmerged.**

## 11. Honest note on the preview deployment

The branch commit `644f33f` produced a Vercel **preview** deployment
(`state: READY`, target preview). I could not open it myself: this sandbox's
network egress is restricted to GitHub, npm and PyPI, so the `.vercel.app` URL is
unreachable from here. Everything above was verified against a local production
build (`vite preview`) instead. Please open the preview link yourself before the
meeting rather than taking my word for it.
