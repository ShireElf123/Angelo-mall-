# Tenant onboarding data template — Angelo Mall Go

Purpose: the record that turns a **listed** mall tenant into a **consenting**
one. Today every shop in the app is a listed tenant only — real business, real
shop number, but no relationship with Mall Go.

> **Current status: every listing is a directory transcription, not a partner.**
> All 29 shops in `src/data/tenants.ts` are real businesses taken from the
> mall's own store directory (<https://www.angelomall.co.za/>, checked
> 2026-10-26). None has agreed to anything, none receives messages or orders, and
> no official logo is used. Keep the "Sample walkthrough · simulated" /
> "Listed from mall directory · no ordering" labels until a row reaches **Verified**.

## 1. How to use

1. Get written confirmation from the mall/tenant (see §3 for the minimum).
2. Copy one row, fill it in, and keep `confirmation` at `directory-listing`
   until the tenant has signed off.
3. Supply the approved logo as `public/images/logos/<shop-slug>.<svg|png>` — never
   a screenshot or an AI-generated redraw of a brand mark.
4. Update the listing in `src/data/tenants.ts` (name, category, summary, hours,
   phones, website, `confidence`, `listingNote`) and the demo behaviour in
   `src/data/seed.ts` (`DEMO_OPS`, `participation`).
5. If an approved logo exists, point `ShopLogo` at it; otherwise the generated
   text wordmark stays. The monogram fallback must stay.
6. Re-run `npm test` — `seedAssets.test.ts` fails if any referenced asset is
   missing, `tenants.test.ts` fails on an unsourced or duplicated listing, and
   the template-sync test fails if a shop is missing a row here.

## 2. Onboarding rows (one per shop, generated order = mall directory order)

Values: `confidence` = `cross-verified` (mall directory plus an independent
source) | `directory-only` (mall directory only, currency unconfirmed);
`logo_source` = `official-supplied` | `official-downloaded` | `wordmark-only`;
`image_permission` = `granted` | `pending` | `declined` | `n/a`;
`confirmation` = `directory-listing` (today) | `in-review` | `verified` | `declined`.

| shop_id | display_name | shop_no | category | confidence | logo_source | image_permission | confirmation | verified_by | date | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `shop-kfc` | KFC | 1 | food | cross-verified | wordmark-only | n/a | directory-listing | — | — | Cross-check: KFC "Nigel 2" listed at Shop 1, The Angelo Mall by TripAdvisor and Opendi listings. |
| `shop-golden-buffalo-spur` | Golden Buffalo Spur | 2 | food | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. |
| `shop-cash-crusaders` | Cash Crusaders | 4 | electronics | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. |
| `shop-mica` | Mica | 5 | homeware | cross-verified | wordmark-only | n/a | directory-listing | — | — | Cross-check: Mica Nigel (Angelo Mall, Rhodes Avenue) also appears in an independent business store-listing site (checked 2026-10-26). |
| `shop-crazy-plastics` | Crazy Plastics Express | 5b | homeware | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. Note: One third-party listing shows a PEP Home store at Shop 5B. The mall directory lists Crazy Plastics Express there, so this entry cannot be confirmed as current. |
| `shop-zillion-hair` | Zillion Hair | 6 | beauty | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. Note: Shares shop number 6 with Ruiter Makelaars in the mall directory. |
| `shop-ruiter-makelaars` | Ruiter Makelaars | 6 | services | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. Note: Shares shop number 6 with Zillion Hair in the mall directory. |
| `shop-flesh-fashions` | Flesh Fashions | 7 | fashion | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. |
| `shop-clicks` | Clicks | 9a | pharmacy | cross-verified | wordmark-only | n/a | directory-listing | — | — | Cross-check: Clicks’ own store page "The Angelo" (#1568) lists The Angelo Mall, Heidelberg Rd, Nigel with the same phone number and pharmacy facility (checked 2026-10-26). |
| `shop-neutell-horowitz` | Neutell & Horowitz | 9b | pharmacy | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. |
| `shop-vodacom` | Vodacom | 10 | electronics | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. |
| `shop-nedbank` | Nedbank | 11 | finance | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. |
| `shop-tops` | Tops at Spar | 12 | groceries | cross-verified | wordmark-only | n/a | directory-listing | — | — | Cross-check: The store’s own site angelotops.co.za lists Corner Heidelberg Road and Station Road, Nigel with the same telephone number (checked 2026-10-26). Note: Directory prints the name as "Tops"; the store’s own site uses "Angelo Tops". |
| `shop-superspar` | The Angelo SUPERSPAR | 13 | groceries | cross-verified | wordmark-only | n/a | directory-listing | — | — | Cross-check: The store’s own site (angelosuperspar.co.za) lists Corner Heidelberg Road and Station Road, Nigel with the same telephone number (checked 2026-10-26). |
| `shop-biltong-den` | Biltong Den | 14 | food | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. |
| `shop-maxis` | Maxi's | 15 | groceries | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. Note: Directory prints "Maxis"; the app uses the common spelling "Maxi’s". |
| `shop-aviya` | Aviya Photography & Graphics | 16b | services | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. |
| `shop-nigel-cellular` | Nigel Cellular | 17 | electronics | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. |
| `shop-mtn` | MTN @ The Angelo Mall | 18a | electronics | cross-verified | wordmark-only | n/a | directory-listing | — | — | Cross-check: MTN Store – Angelo Mall appears in an independent Nigel business directory. |
| `shop-just-u-2` | Just-u-2 Jewellers | 19b | fashion | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. |
| `shop-postnet` | PostNet | 22 | services | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. Note: Directory prints the name as "Posnet"; the brand trades as "PostNet". |
| `shop-pep` | PEP | 23 | fashion | cross-verified | wordmark-only | n/a | directory-listing | — | — | Cross-check: PEP Nigel The Angelo is listed at Shop 21 & 23, The Angelo Mall by PEP’s own social page and third-party store directories. Note: Township-numbered shop listings show "Shop 21 & 23"; the mall directory prints 23. |
| `shop-scooters` | Scooters Pizza | 24a | food | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. |
| `shop-ocean-basket` | Ocean Basket | 24b | food | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. Note: The website is the one printed in the mall directory; it did not load when checked on 2026-10-26, so treat it as unconfirmed. |
| `shop-angel-kiss` | Angel Kiss Boutique | 25a | fashion | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. Note: The mall directory prints no telephone number for this shop. |
| `shop-crazy-store` | The Crazy Store | 26 | homeware | cross-verified | wordmark-only | n/a | directory-listing | — | — | Cross-check: The Crazy Store’s own store listing places a branch at The Angelo Mall, Nigel with the same telephone number (checked 2026-10-26). |
| `shop-fnb` | FNB | 28 | finance | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. Note: A Standard Bank ATM is also listed next to FNB at Shop 28. |
| `shop-best-buy` | Best Buy | 30 | electronics | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. |
| `shop-carwash` | Carwash @ Angelo Mall | — | services | directory-only | wordmark-only | n/a | directory-listing | — | — | Mall directory only. Note: The mall directory gives no shop number for the car wash. |

## 3. Minimum information required from the mall

Per tenant, before anything becomes a "verified" listing or a partner:

1. **Trading name** exactly as it must appear, plus any required legal suffix.
2. **Category** (one of: groceries, food, fashion, electronics, pharmacy,
   homeware, beauty, services, finance — or a new value we add deliberately).
3. **Written permission** to use the shop's name and a short description in the app.
4. **Approved logo file** in vector (SVG/PDF) or transparent PNG, with the
   brand's own minimum-size and clear-space rules, plus the colour way to use on
   light and dark backgrounds.
5. **Image permission**: may we use the tenant's own storefront/interior photo?
   If not, we keep the generated category illustration.
6. **Contact channel** for chat enquiries (who answers, in what hours) — demo
   replies must be replaced by that process, not by a claimed integration.
7. **Confirmed shop number, telephone and trading hours** — the directory values
   used today carry no "last updated" date.
8. **Sign-off name, role, date** for the record above.

Optional but useful: delivery/collection availability, average prep time,
whether they want promotions, and their preferred display colour.

## 4. What must NOT happen during onboarding

- No logo traced, redrawn, upscaled or AI-generated "in the style of" a brand.
- No "Official partner" / "Partnered with Angelo Mall" badges or claims — the app
  must never imply a shop signed up when it has not.
- No real tenant name attached to generated photography that looks like their
  actual store, unless they approved that specific image.
- No inventing hours, phone numbers, products, promotions or delivery promises
  for a real business: copy the directory, or leave the field out.
- No swapping a listed tenant for a partner without updating `participation` and
  the labels the UI derives from it.
