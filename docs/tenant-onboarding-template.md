# Tenant onboarding data template — Angelo Mall Go

Purpose: a short, editable record for onboarding a **real** mall tenant to the
Mall Go demo/beta. It replaces one fictional demo shop at a time and records
exactly which branding is approved, so nobody has to re-verify permissions later.

> **Current status of every shop in the app: fictional demo tenant.**
> All eight shops in `src/data/seed.ts` are invented demonstration businesses.
> None is a real Angelo Mall tenant, partner or endorser, and no official
> retailer logo is used anywhere. Keep the "Demo tenant" / "Directory example"
> labels until a row below reaches **Verified**.

## 1. How to use

1. Get written confirmation from the mall/tenant (see §3 for the minimum).
2. Copy one row, fill it in, and keep the `participation` value at
   `directory-example` until the confirmation status is **Verified**.
3. Supply the approved logo as a file named
   `public/images/logos/<shop-slug>.<svg|png>` — never a screenshot or an
   AI-generated redraw of a brand mark.
4. Update the shop's `Shop` record in `src/data/seed.ts` (name, category,
   tagline, description, `initials`, `colour`, `unitLabel`, `participation`).
5. If the approved logo exists, point the record at it; otherwise leave the
   generated wordmark in place. The monogram/`initials` fallback must stay.
6. Re-run `npm test` — `seedAssets.test.ts` fails if any referenced asset is
   missing, and the template-sync test fails if a shop is missing a row here.

## 2. Onboarding rows (edit in place, one row per shop)

Values: `logo_source` = `official-supplied` | `official-downloaded` | `wordmark-only`;
`image_permission` = `granted` | `pending` | `declined` | `n/a`;
`confirmation` = `fictional` (today) | `in-review` | `verified` | `declined`.

| shop_id | display_name | category | logo_source | approved_logo_file | image_permission | confirmation | verified_by | date | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `shop-mzansi-fresh` | Mzansi Fresh Grocers *(fictional)* | groceries | wordmark-only | — | n/a | fictional | — | — | Generated category image `shop-grocery.jpg`; no signage or logos. |
| `shop-flame-co` | Flame & Co. Grill *(fictional)* | food | wordmark-only | — | n/a | fictional | — | — | `shop-food.jpg`; no readable text or brand marks. |
| `shop-style-studio` | Nigel Style Studio *(fictional)* | fashion | wordmark-only | — | n/a | fictional | — | — | `shop-fashion.jpg`; mannequins only. |
| `shop-techpoint` | TechPoint Electronics *(fictional)* | electronics | wordmark-only | — | n/a | fictional | — | — | `shop-electronics.jpg` — replaced in Phase 1 after third-party branding was spotted. |
| `shop-careplus` | CarePlus Pharmacy *(fictional)* | pharmacy | wordmark-only | — | n/a | fictional | — | — | `shop-pharmacy.jpg`; generic shelves. |
| `shop-home-comforts` | Home Comforts *(fictional)* | homeware | wordmark-only | — | n/a | fictional | — | — | `shop-homeware.jpg`; generic. |
| `shop-glow-beauty` | Glow Beauty Bar *(fictional)* | beauty | wordmark-only | — | n/a | fictional | — | — | `shop-beauty.jpg` generated in Phase 2; blank labels only. |
| `shop-fix-print` | Fix & Print Services *(fictional)* | services | wordmark-only | — | n/a | fictional | — | — | `shop-services.jpg` generated in Phase 2; blank paper, no signage. |

## 3. Minimum information required from the mall

Per tenant, before anything becomes a "verified" listing:

1. **Trading name** exactly as it must appear, plus any required legal suffix.
2. **Category** (one of: groceries, food, fashion, electronics, pharmacy,
   homeware, beauty, services — or a new value we add deliberately).
3. **Written permission** to use the shop's name and a short description in the app.
4. **Approved logo file** in vector (SVG/PDF) or transparent PNG, with the
   brand's own minimum-size and clear-space rules, plus confirmation of the
   colour way to use on light and dark backgrounds.
5. **Image permission**: may we use the tenant's own storefront/interior photo?
   If not, we keep the generated category illustration.
6. **Contact channel** for chat enquiries (who answers, in what hours) — demo
   replies must be replaced by that process, not by a claimed integration.
7. **Unit/shop number and trading hours** if they should appear in the app
   (currently everything is sample data).
8. **Sign-off name, role, date** for the record above.

Optional but useful: delivery/collection availability, average prep time,
whether they want promotions, and their preferred display colour.

## 4. What must NOT happen during onboarding

- No logo traced, redrawn, upscaled or AI-generated "in the style of" a brand.
- No "Official partner" / "Partnered with Angelo Mall" badges or claims.
- No real tenant name attached to generated photography that looks like their
  actual store, unless they approved that specific image.
- No swapping a fictional shop for a real one without updating
  `participation` and the labels the UI derives from it.
