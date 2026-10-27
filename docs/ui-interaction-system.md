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
