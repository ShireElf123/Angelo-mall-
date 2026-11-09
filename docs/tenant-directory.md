# Tenant directory record — Angelo Mall Go (Phase 4)

What the app's shop directory is based on, when it was checked, what could not be
confirmed, and which directory entries were left out and why. Keep this file
current whenever a listing changes.

## Source

| Item | Value |
| --- | --- |
| Primary source | The Angelo Mall store directory — <https://www.angelomall.co.za/> |
| Page heading | "THE ANGELO MALL STORE DIRECTORY" |
| Page date context | The site's footer reads "copyright 2009/26" and the page rendered "Monday, 26 October 2026". **The directory publishes no "last updated" date**, so every entry below is recorded as *as listed* rather than *current*. |
| Checked on | 2026-10-26 |
| Mall address | Cnr Heidelberg Rd & Station Rd, Nigel 1491, Gauteng |
| Centre Management | 011 814 7005 / 011 814 2222 (excluded from the app — see below) |

The directory supplies, per entry: shop number, tenant name, opening hours and
(sometimes) telephone numbers, e-mail addresses or a website. Those fields are
transcribed verbatim into `src/data/tenants.ts`; nothing is invented.

## Confidence levels

| Level | Meaning | Count |
| --- | --- | --- |
| `cross-verified` | Mall directory plus at least one independent source (the business's own site, store page, locator or a business directory) that places the business at this mall. | 8 |
| `directory-only` | Mall directory only. Currency cannot be independently confirmed, so the listing is marked as such on the shop page. | 21 |

Cross-checks performed (2026-10-26):

* **Clicks, Shop 9A** — Clicks' own store page "The Angelo" (#1568) lists The
  Angelo Mall, Heidelberg Rd, Nigel with the same shop telephone (011 739 3870)
  and an in-store pharmacy. <https://clicks.co.za/store/The-Angelo/1568>
* **SUPERSPAR The Angelo, Shop 13** — The store's own site lists Corner
  Heidelberg Road and Station Road, Nigel with the same telephone
  (011 814 2222). <https://www.angelosuperspar.co.za/>
* **KFC, Shop 1** — third-party store listings ("KFC Nigel 2") place it at Shop 1,
  The Angelo Mall with the directory's telephone number.
* **PEP, Shop 23** — PEP's own social/listing pages give "Shop 21 & 23, The Angelo
  Mall", which corroborates the mall directory's 23 but adds extra units — see the
  conflicts below.
* **MTN @ The Angelo Mall, Shop 18A** — an independent Nigel business directory
  lists "MTN Store – Angelo Mall" on Station Road.
* **Mica, Shop 5** — an independent store-listing site places "Mica Nigel" at the
  Angelo Mall on Rhodes Avenue.
* **The Crazy Store, Shop 26** — The Crazy Store's own store listing places a
  branch at The Angelo Mall, Nigel with the directory's telephone number.
* **Tops, Shop 12** — the store's own site
  (<https://www.angelotops.co.za/>) lists Corner Heidelberg Road and Station Road,
  Nigel with the directory's telephone number. It trades as "Angelo Tops".
* **Ocean Basket, Shop 24B — not confirmed.** The directory prints a dedicated
  site (angelooceanbasket.co.za) but it did not load on 2026-10-26, so the listing
  stays `directory-only` and the shop page says the website is unconfirmed.

## Conflicts and discrepancies in the source (flagged, not "fixed")

The directory is internally inconsistent in places. The app keeps the directory's
wording and shows a note on the affected shop pages rather than guessing:

* **Duplicated shop numbers** — 6 is used by both Zillion Hair and Ruiter
  Makelaars; the car wash has no shop number at all.
* **Split units** — 5/5b, 9a/9b, 16a/16b, 18a, 19a/19b, 24a/24b, 25a.
* **PEP** — the mall directory says Shop 23; PEP's own listing says "Shop 21 & 23".
* **Crazy Plastics Express (5b)** — a third-party listing shows a PEP Home store at
  Shop 5B, so the directory entry may be out of date.
* **Spelling** — the directory prints "Posnet" (the brand is PostNet) and "Maxis"
  (commonly "Maxi's"). The app shows the brand spelling and records the
  difference in the shop page note.
* **FNB (28)** — the same entry also mentions a Standard Bank ATM.

## Entries deliberately excluded from the app

| Directory entry | Reason |
| --- | --- |
| Centre Management (19a) | The mall's management office, not a retail tenant. Kept out of the shopper directory; its number is still quoted in this record. |
| ABSA ATM (Shop 2), Standard Bank ATM (Shop 28) | Cash machines, not shops — no staff, stock or chat journey. |
| Tobacco Land (16a) | Tobacco retail is out of scope for a shopping demo pending a product-owner decision. |
| Betting World (27) | Gambling operator is out of scope for a shopping demo pending a product-owner decision. |

The exclusion list is also encoded as `EXCLUDED_LISTINGS` in
`src/data/tenants.ts` so the decision stays visible in code, and
`src/data/tenants.test.ts` checks that no excluded tenant leaks into the app.

## What the app does *not* claim

* No shop is a Mall Go partner, pilot participant or endorser. The shops are
  listed because the mall publishes them.
* No shop receives chat messages, orders, payments or delivery requests. Chat
  replies, prices, stock, order acceptance, collection and delivery are
  simulated in the browser and labelled as such.
* Hours, phone numbers and websites are the directory's, shown as listing
  information. They are not live "open now" states and are not a Mall Go contact
  channel.
* Promotions in the app are concept placeholders and do not attribute an offer to
  any tenant.
