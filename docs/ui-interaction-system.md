# Phase 12 — native-app feel, elevation and interaction design

Audit-first record of the interaction pass: what felt like a website, what was
changed at the source, and what could not be verified in this environment.

## 1. What the audit found

The app already had a coherent palette, a `:focus-visible` gold ring, a
`prefers-reduced-motion` guard, safe-area padding and skeleton loading states.
Three kinds of problem were real:

1. **Depth was ad hoc.** Two shadow variables (`--shadow`, `--shadow-lg`) were
   used 21 times with no relationship between them, so a filter chip and a
   floating dialog could carry the same weight, and cards had no press or hover
   response at all.
2. **Controls did not answer a press.** `.btn` had a 1px nudge and nothing else;
   chips, icon buttons, nav items, cards, list rows and the send button had no
   `:active` state at all. Hover styles were unguarded, so on Android a tap left
   a stuck hover behind. There was no `-webkit-tap-highlight-color` reset and no
   `touch-action: manipulation`, which is exactly what makes a web app feel like
   a web page on a phone.
3. **Two real layout defects on narrow screens**, found by measuring rather than
   looking: five bottom-nav labels (“Promotions” is 63.9px at 11.5px/600) needed
   ~368px and overflowed a 320–375px phone; and from 900–1080px the brand plus
   five top-nav labels plus the role switcher needed ~902px inside a 900px
   header, which would have produced a horizontal scrollbar on small laptops.

Nothing in the identity changed: forest green stays the core, warm neutrals stay
the surface palette, gold stays a selective accent (focus ring, active-tab
marker, badges). No control was turned green wholesale.

## 2. Elevation system

Defined once in `:root` and referenced everywhere; `--shadow` and `--shadow-lg`
now alias levels 2 and 3 so existing rules kept their intent.

| Token | Where it is used |
| --- | --- |
| `--elev-1` | chips, monogram plates, primary buttons at rest |
| `--elev-2` | shop cards, shop hero, conversation rows on hover |
| `--elev-3` | card hover lift, need/category tiles on hover |
| `--elev-4` | dialogs (`.modal`) and toasts only |
| `--elev-nav` | fixed bottom navigation |
| `--elev-press` | the shadow a control collapses to while pressed |

Tonal surfaces do the rest where a shadow would be noise: `--surface-raised`
(composer, cards), `--surface-sunken` (input wells), `--surface-tint`. The sticky
header uses a hairline (`0 1px 0 var(--border)`), not a drop shadow, so content
reads as passing underneath it.

## 3. Tactile states

- **Press.** Every control collapses towards the finger: buttons `scale(0.97)`
  and drop from `--elev-1` to `--elev-press`; icon buttons `scale(0.92)`; nav
  items `scale(0.94)`; the send button `scale(0.92)`; list rows tint to
  `--forest-100`; shop media dims with an inset wash. All within `--dur-fast`
  (110 ms) on `--ease-out`.
- **Hover**, gated behind `@media (hover: hover) and (pointer: fine)`: cards and
  tiles lift 2px to `--elev-3`, conversation rows 1px, buttons gain `--elev-2`.
  `@media (hover: none)` explicitly neutralises the image zoom and lift so a tap
  cannot leave a stuck state.
- **Focus.** The existing gold `:focus-visible` ring is unchanged and asserted by
  test, including on the dark chat header and bottom nav.
- **Selected.** The bottom-nav active tab gains an 18×3px gold marker instead of a
  weight change, so switching tabs never reflows the label.
- **Disabled.** Shadeless, 55% opacity, `transform: none` — inert, not just dim.
- **Loading.** Existing skeleton rows are unchanged; `[aria-busy='true']` now
  shows a progress cursor, and skeletons stay quieter than the loaded cards.
- **Reduced motion.** The global 0.01 ms guard remains; an explicit
  `prefers-reduced-motion` block also removes the press *transform*, leaving the
  colour and shadow change so feedback survives without movement.
- Only `transform`, `box-shadow`, `background-color` and `border-color` animate,
  so no press can trigger layout. A test fails if a layout property is added to
  that transition list.

## 4. Touch targets (Android floor)

| Control | Before | After |
| --- | --- | --- |
| Bottom nav item | 52px min-height | 54px, shares the row (`flex: 1 1 0`) |
| Bottom nav bar | content-sized | `min-height: 56px` |
| Icon button | 42×42 | 44×44 (36 for the dense `--sm` variant) |
| Chip / filter | 38px | 44px |
| Back button | text-height | `min-height: 44px` |
| Composer input | 46px | 48px |
| Composer send | 46×46 | 48×48 |
| Primary button | 44px `min-height` | unchanged, 44px + press feedback |

## 5. Responsive behaviour

Measured from the shipped CSS and real Inter metrics (no browser available — see
§7):

- **320–480px:** five bottom-nav items now share the width equally and ellipsise
  the label if it cannot fit; nothing pushes the bar wider than the screen.
  Page padding 16px leaves a 234–424px card plate, and the longest tenant word
  (“Photography”, 103px at 16px) still fits after the logo tile.
- **900–1080px:** the nav tightens (`padding 10px`, `0.84rem`) and the header is
  allowed to wrap as a fallback, so no horizontal scrollbar at 900px.
- **1024–1920px:** page content stays capped at 1120px (1240 for wide screens) and
  centred; hover and keyboard focus carry the desktop interaction language rather
  than the layout becoming an admin grid.

## 6. PWA foundation

| Item | State |
| --- | --- |
| `id`, `start_url`, `scope` | `/` |
| `name` / `short_name` | “Angelo Mall Go (Demo)” / “Mall Go” |
| `display` + `display_override` | `standalone`, falling back to `minimal-ui` |
| `theme_color` / `background_color` | `#0c3b2e` / `#faf7f2`, matching the page meta |
| Icons | 192 and 512 PNG (+512 maskable), SVG any-size — pixel sizes verified by test |
| Launch | `viewport-fit=cover`, safe-area padding, standalone status bar colour |

Play Store readiness is **not** claimed: there is no APK/AAB, no signing, no Play
listing, no Digital Asset Links and no TWA wrapper. The manifest is simply
internally consistent and the icons are the sizes they advertise.

## 7. Verification and its limits

- `npx tsc --noEmit` clean.
- `npx vitest run` — 294 tests across 32 files, all passing. New: 16 interaction
  contract tests (`src/styles.interaction.test.ts`) and 6 manifest/icon tests
  (`src/pwa.installability.test.ts`), which read the PNG IHDR headers to confirm
  the icons really are 192×192 and 512×512.
- `npm run build` — succeeds; CSS 62.57 kB (gzip 12.05), JS 495.68 kB (gzip 132.67),
  29 tenant images in `dist`.
- **No screenshots.** No browser binary can be installed in this environment
  (`npx playwright install chromium` is blocked, no system Chromium), and the
  Vercel preview is SSO-protected. Every viewport claim above is computed from the
  shipped CSS and font metrics, which reliably catches starvation, overflow and
  cropping, but cannot catch a browser-specific rendering quirk. Real-device
  review at 320/360/390/430/480 and 1024/1280/1440/1920 is still required.
- `@types/node` was added as a dev dependency so the icon test can read PNG
  headers; no runtime dependency changed.

## Phase 13 — why Phase 12 did not look different, and what changed

Phase 12 was audited after the fact and the honest finding is that it was
mostly invisible. The elevation "system" renamed values that already existed:

| surface | before | after |
| --- | --- | --- |
| cards, hero | `--shadow` = `0 1px 2px …, 0 8px 24px -12px …` | `--elev-2`, **identical value** |
| hover lift | `--shadow-lg` = `0 2px 4px …, 0 20px 44px -16px …` | `--elev-3`, **identical value** |
| bottom bar | `0 -6px 20px -12px rgba(12,59,46,.25)` | `--elev-nav`, **identical value** |

Everything else was additive and small: a gold 3px tab marker, +2px nav
height, 2–6px larger touch targets, press transforms that only exist while a
finger is down, and two real overflow bug fixes (320–375px nav, 900–1080px
header). On a phone at rest the only perceptible delta was a slightly taller
white bar. That is not an app feel, and saying otherwise would have been a
false claim.

Phase 13 changes what a person actually perceives:

1. **Only the header is pinned.** The demo banner used to share
   `.shell-chrome`'s sticky box, costing ~110px of every scroll on a phone.
   The wrapper is now `position: static`; `.app-header` alone is sticky, with
   `saturate(180%) blur(16px)` so content slides under it.
2. **The tab bar is frosted glass**, 64px + safe-area, over
   `rgba(255,255,255,0.82)` with `blur(20px)`. `@supports not (backdrop-filter)`
   falls back to the opaque surface rather than a washed-out 82% white.
3. **Selected tab**: soft `--forest-50` pill behind the icon, `stroke-width:
   2.4` glyph, and the gold marker moved to the bar's top edge. The pill's
   padding is declared on *every* icon wrapper, so switching tabs changes only
   the background — no label shift, no reflow.
4. **Cards** reach `border-radius: 20px` and press to `scale(0.985)` while the
   shadow collapses to `--elev-1`: pushed into the page, not tinted.
5. **Primary buttons** gain a one-step vertical gradient plus the existing
   1px top highlight, so they read as a raised key rather than a coloured link.
6. **Route changes** play a 240ms rise-and-fade (`page-in`). No `fill-mode`,
   because a lingering `transform` would make `.page` a containing block for
   the fixed toast/modal layers.

Reduced motion turns the page animation off, drops the card press transform
and the icon-pill transition, while keeping colour and shadow feedback.

### Verification for Phase 13

- `npx tsc --noEmit` clean.
- 300/300 tests across 32 files, including 6 new assertions in
  `src/styles.interaction.test.ts` (`native-app shell`) that pin the sticky
  header, the frosted bar, the no-reflow pill, the card press, the gradient CTA
  and the reduced-motion opt-out.
- `npm run build` succeeds: CSS 64.66 kB (from 62.57 kB), JS unchanged at
  495.68 kB.
- The built stylesheet was grepped to confirm the rules survived minification
  and ordering: `.shell-chrome{position:static}`, `.app-header{position:sticky…}`,
  `min-height:64px`, `@keyframes page-in`.
- **No screenshots.** This environment has no browser (Chromium download fails,
  no system Chrome) and the Vercel preview is SSO-protected, so no rendered
  pixel was inspected. The changes are verified structurally, not visually —
  a real device check at 320/360/390/430/480px is still outstanding.

## Phase 15 — the measurements behind "it still looks flat"

After Phase 13 shipped, and with the live preview confirmed to be built from it,
the interface still had no depth. Rather than restructure the CSS a third time on
a guess, the palette was measured — and the measurement was the whole answer.

### What the preview was doing wrong

Nothing, as it turned out. The preview deployment was verified to be built from
the Phase 12/13 commit (`target: null`, `prebuilt: true`, matching sha), so a
stale deploy was ruled out. The cause was the palette:

| pair | ratio | verdict |
| --- | --- | --- |
| page `#faf7f2` ↔ white card | **1.07 : 1** | invisible |
| page ↔ border `#e6ddcd` | 1.26 : 1 | invisible |
| white card ↔ border `#e6ddcd` | 1.35 : 1 | invisible |
| primary gradient `#10503d` → `#0c3b2e` | 1.33 : 1 | invisible |

A white card on a near-white page leaves a shadow nothing to separate. Elevation
was being asked to create depth that the surface colours had already erased. The
negative `-12px`/`-16px` spreads on the old shadows made it worse: most of the
ink landed under the card instead of at its edge.

### What changed

1. **Surface separation raised.** Page background `#faf7f2` → `#f4eee2`
   (**1.16 : 1** against the card), `--surface-warm` `#f4efe6` → `#efe8d9`.
   Border `#e6ddcd` → `#d5c9ae` (**1.64 : 1**), `--border-strong` `#c2b193`
   (**2.10 : 1**). Text contrast was unaffected and `--muted` still clears AA at
   **5.01 : 1** on the new page colour.
2. **Shadows rebuilt tight.** Each step now pairs a 1–2px dark contact shadow
   with a wider soft one at higher alpha and much smaller negative spread, so the
   ink lands on the card edge where it is read as depth. `--elev-nav` likewise.
3. **Primary button gradient deepened** to `--forest-700` → `--forest-900`
   (**1.78 : 1**; hover `--forest-800` → `--forest-950`, 1.77 : 1) against the
   old 1.33 : 1, so the face curves instead of flat-filling.
4. **Duplication removed, not overridden.** The stylesheet had grown a second
   copy of itself, and later blocks silently won — the same disease that made
   Phase 12 invisible. Counting only *truly* shadowed rules (same selector *and*
   same at-rule context, so media queries are not miscounted), 31 rules were
   declared twice or more, five of them three times: `.btn`, `.chip`,
   `.app-header`, `.bottom-nav` and `.shop-card`. Each was folded into its base
   rule instead of being layered over.

   Two of these were not cosmetic. `.shop-card__media` set `height: 150px` and
   then `height: auto` + `aspect-ratio: 16/9` further down, so the first value
   was dead code that read as the real one. And `.btn--primary` was declared
   again after the primary rule, which **overwrote the new gradient with the old
   one** — the palette fix would have been silently undone had the check not
   run.

   After the pass: **31 → 8 shadowed rules, and 0 that declare a property in
   more than one block** (verified by a property-collision scan, not by eye); the
   8 remaining pairs are purely additive state rules. The built stylesheet got
   *smaller*, 64.74 → 63.60 kB (12.33 kB gzip), while gaining comments and a
   stronger palette. `.app-header`, `.bottom-nav`, `.shop-card`, `.shop-card__media`,
   `.modal`, `.composer` and `.page--chat` are now each declared exactly once.
5. **PWA splash colour** in `manifest.webmanifest` tracks the new `--bg`, so an
   installed launch no longer flashes a different page colour than the app.

### Verification — and what is *not* verified

- `npx tsc --noEmit` clean; **311/311 tests across 33 files**; production build
  succeeds (CSS 63.60 kB / 12.33 kB gzip, JS 496.64 kB / 133.11 kB gzip).
- The new values were read back out of the **built** bundle, not just the source,
  and the per-selector duplicate count was re-measured on the compiled CSS so a
  minifier artefact could not be mistaken for a fix.
- Contrast figures above are computed from the WCAG relative-luminance formula
  applied to the exact hex values in `src/index.css`, not eyeballed.
- **No browser screenshot was taken.** Playwright's Chromium is not in this
  sandbox's network allowlist and no browser binary is installed, so the four
  required widths (360 / 390 / 768 / 1280) could not be captured here. Computed
  colour separations are arithmetic; they are not a substitute for looking at the
  rendered page, and this document does not claim otherwise. Confirming the
  result visually remains open.
