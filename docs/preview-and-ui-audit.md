# Preview delivery & tenant-name/logo audit (2026-10-27)

Investigation-first record of why the owner demo looked unchanged after batches
10 and 11, and of the layout defect behind the oversized / overflowing tenant
names. Every claim below was produced by a command or an API response recorded
here; nothing is inferred from "the build succeeded".

## 1. Which URL serves the demo

| URL | Project | Deployment | Commit | State |
| --- | --- | --- | --- | --- |
| `https://angelo-mall-go.vercel.app` | `angelo-mall-go` (`prj_mpPJGHcdFa78ooJNibmfn5NOSdM6`) | `dpl_2xA4xhopfot69hu5ykKUCE1FFFaT` | `17923d1` | READY, alias assigned |
| `https://angelo-mall.vercel.app` | `angelo-mall` (`prj_PtigAGDE20XpCd8LMMwk6YTuosfk`) — **different project** | `dpl_DyVM4y6LNkdE8FBKeS8xNEYdAXnm` | `0a403be4` (2026-10-26, Phase 4) | READY, *production* alias |

`angelo-mall-go.vercel.app` is a branch-scoped domain pinned to
`arena/aeeb5cff-angelo-mall`, which is why it follows every push. The
`angelo-mall` project is the older Phase-1 project: its production alias still
points at commit `0a403be4`, and `git ls-tree 0a403be4` contains **zero** files
under `public/images/tenants` — the tenant concept art did not exist yet. Opening
that link shows a build with no tenant imagery at all, for every batch.

**Share `https://angelo-mall-go.vercel.app` only.** The stale production alias is
deliberately left alone: correcting it would mean a production deployment, which
is out of scope for this branch.

## 2. Are the batch 10/11 images in the served build?

The deployment's file listing (`GET /v6/deployments/{id}/files`) returns the SHA-1
of each deployed file. Comparing those against `sha1sum` of the working tree is a
byte-level check, not a version-tag check:

| Tenant | Deployed uid | Local `sha1sum` | Match |
| --- | --- | --- | --- |
| `shop-mtn` | `25f98e3e…a6302` | `25f98e3e…a6302` | yes |
| `shop-vodacom` | `5a695e43…79807` | `5a695e43…79807` | yes |
| `shop-nedbank` | `71ce5b2c…1ef` | `71ce5b2c…1ef` | yes |
| `shop-tops` | `85d7031b…b270` | `85d7031b…b270` | yes |
| `shop-superspar` | `1031444c…06b` | `1031444c…06b` | yes |
| `shop-maxis` | `731f6533…58a` | `731f6533…58a` | yes |
| `shop-aviya` | `14d969499…827` | `14d969499…827` | yes |
| `shop-nigel-cellular` | `494573ca…602` | `494573ca…602` | yes |
| `shop-scooters` | `3d61e0e2…281` | `3d61e0e2…281` | yes |
| `shop-ocean-basket` | `d9519616…218` | `d9519616…218` | yes |

All 29 `public/images/tenants/*.jpg` are present in the deployment, and the
deployed bundle names (`index-ncQvKWYW.js`, `index-qb3dfyY6.css`) matched a local
`npm run build` of `17923d1` byte-for-byte. **The preview was not stale.** So the
"images did not update" symptom had to be in the application, and it was:

> **The directory cards never rendered tenant concept art.** `ShopCard` used
> `shop.coverImage`, and `coverImage` is the *category* illustration
> (`/images/shop-food.jpg`, `/images/shop-groceries.jpg`, …) shared by every shop
> in a category. Browsing the directory therefore showed the same eight pictures
> before and after every batch; the researched interiors were only visible on a
> shop's own page.

Fixed in `src/components/ShopCard.tsx`: cards now use
`shop.conceptImage ?? shop.coverImage` and carry the same "Concept art" chip the
shop page already showed, so an AI scene on a card is still labelled as one.

## 3. Why names looked oversized and spilled out of their boxes

Measured with the app's own webfont (Inter, `@fontsource/inter` metrics loaded
through `fontTools`); no browser was available, see §6.

Fixed geometry of a directory card: `.page` padding 16px, 16px grid gap, 15px card
body padding, 11px brand-plate padding, 34px monogram or a hosted logo up to
108px wide, and a `Open now (demo)` pill that is **141.7px** wide at 12.48px/600.

| Viewport | Brand plate | Text left for the name, before | after |
| --- | --- | --- | --- |
| 360 px | 274 px | **5.3 px** | 157 px |
| 390 px | 304 px | 35.3 px | 187 px |
| 430 px | 344 px | 75.3 px | 227 px |
| 768 px (2 cols) | 306 px | 37.3 px | 189 px |
| 1024 px (3 cols) | 266 px | **−2.7 px** | 149 px |
| 1280/1440 px (3 cols) | 298 px | 29.3 px | 181 px |

`ShopCard` has `overflow: hidden`, so a 5px text column does not scroll the page —
it silently clips. The wordmark also used `overflow-wrap: anywhere`, which splits
words mid-syllable, so "SUPERSPAR", "Crusaders" and "Photography" broke into
letter stacks. On the shop page the same thing happened at a larger size: the
`lg` wordmark was a flat 1.3rem sitting next to a 142px pill and a logo up to
134px wide, inside a 290px row at 360px.

Root causes, in the order they matter:

1. The trading-status pill shared a row with the name, taking ~48% of the plate.
2. `.shop-logo__image` was `flex: none` with `max-width: 108px`, so the logo could
   not give width back to the text.
3. `.shop-logo__word` had no `min-width: 0`, and relied on `overflow-wrap: anywhere`.
4. `.shop-hero__title` could not wrap, so the pill squeezed the `h1` at mobile width.
5. `.shop-hero__media` was `clamp(170px, 32vw, 250px)` tall for a 16:9 image, i.e.
   `object-fit: cover` discarded ~41% of the scene at 1440px (3.03:1 window).
   Cards were 16:10, cropping 10% off the same art.

## 4. What changed

- `src/components/ShopCard.tsx` — tenant concept image + "Concept art" chip,
  intrinsic 1280×720 attributes, unchanged fallback behaviour.
- `src/index.css` — brand plate stacks name above status; logo tile bounded to
  `min(108px, 45%)` / `min(140px, 45%)` with `contain` and `flex: 0 1 auto`;
  wordmark `min-width: 0` + `break-word`; hero title row wraps; hero and card
  media both 16:9 so the 1280×720 art is shown whole; `object-position: center`.
- `src/data/tenants.ts` — `shop-tops` display name `Tops at Spar` → `TOPS at SPAR`
  (the registry's own `alt` and the franchise styling already used that form).
  Tenant ids, routes, ordering and every other field are unchanged.
- Tests: `ShopCard.test.tsx` now asserts the concept image, the chip and the
  no-art fallback; `styles.responsive.test.ts` gains a name/logo layout contract
  (six assertions) alongside the existing ratio test, which now pins 16:9.

## 5. Result of the same measurement after the fix

At 360, 390, 430, 768, 1024, 1280 and 1440px, every one of the 29 tenants can now
render its longest word on a single line (before: 13 of 28 could not at 360px, and
at 1024px the widest logos left the text column negative). Nothing was truncated,
nothing was uppercased, and no card height is fixed.

## 6. Test limitations, stated plainly

No browser binary could be installed in this environment (`npx playwright install
chromium` → download blocked; no system Chromium), so **no screenshots or live
viewport measurements were taken**. The viewport figures above are computed from
the shipped CSS geometry and real font advance widths, which catches the class of
bug reported here (starvation, clipping, cropping) but cannot catch rendering
quirks of a specific browser. Real-device review is still required, and the
Preview is SSO-protected so it can only be checked in a signed-in browser.
