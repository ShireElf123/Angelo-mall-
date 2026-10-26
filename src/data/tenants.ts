/**
 * Angelo Mall tenant dataset — source of truth for the shop directory.
 *
 * SOURCE
 * - Primary: the mall's own store directory, "THE ANGELO MALL STORE DIRECTORY",
 *   https://www.angelomall.co.za/ (checked 2026-10-26).
 * - Shop numbers, telephone numbers, trading hours and websites below are
 *   transcribed from that directory. Nothing here is invented.
 * - Cross-checks (recorded per tenant in `crossCheck`) only confirm that the
 *   business trades at The Angelo Mall; they are not evidence of any
 *   relationship with Mall Go.
 *
 * HONESTY RULES
 * - All of these are real businesses at Angelo Mall, Nigel. NONE of them is a
 *   Mall Go partner, and none receives messages, orders or payments from this
 *   demo. Chat replies, prices, basket totals, collection and delivery are all
 *   simulated in the browser.
 * - No official retailer logo is bundled. Each shop renders a generated text
 *   wordmark (monogram + name) — see docs/shop-asset-plan.md.
 * - Never add a tenant name, number, hours, website or offer that is not in the
 *   source directory; add a new row here and re-run the tests instead.
 */
import type { CategoryId, ListingConfidence } from '../types';

export const TENANT_SOURCE = {
  title: 'THE ANGELO MALL STORE DIRECTORY',
  url: 'https://www.angelomall.co.za/',
  checkedOn: '2026-10-26',
  context:
    'Directory published by The Angelo Mall (site copyright 2009/26). It carries no "last updated" date, so entries are recorded as "as listed"; trading state may have changed since the page was last edited.',
} as const;

export interface TenantRecord {
  /** Stable shop id used across routes, orders and delivery jobs. */
  id: string;
  /** Display name used in the app. */
  name: string;
  /** Name exactly as printed in the mall directory, where it differs. */
  directoryName: string;
  /** Shop number as printed ("5b", "9a"…). Omitted when the directory gives none. */
  shopNumber?: string;
  category: CategoryId;
  /** One factual sentence about the business type. No offers or prices. */
  summary: string;
  /** Short card line: business type only. */
  tagline: string;
  /** Trading hours exactly as printed in the directory, or "not published". */
  hoursLabel: string;
  phones?: string[];
  website?: string;
  confidence: ListingConfidence;
  /** Independent confirmation that the business trades at this mall. */
  crossCheck?: string;
  /** Caveat, conflict or spelling note shown with the listing. */
  listingNote?: string;
  initials: string;
  colour: string;
  coverImage: string;
  featured?: boolean;
  /** Carries the scripted sample conversation/order walkthrough (still simulated). */
  demoScenario?: boolean;
}

/** Category banner images are shared, generated, logo-free category scenes. */
const IMG = {
  groceries: '/images/shop-grocery.jpg',
  food: '/images/shop-food.jpg',
  fashion: '/images/shop-fashion.jpg',
  electronics: '/images/shop-electronics.jpg',
  pharmacy: '/images/shop-pharmacy.jpg',
  homeware: '/images/shop-homeware.jpg',
  beauty: '/images/shop-beauty.jpg',
  services: '/images/shop-services.jpg',
  finance: '/images/shop-finance.jpg',
} as const;

/** Tenants excluded from the app, with the reason. Surfaced for owner approval. */
export const EXCLUDED_LISTINGS = [
  {
    directoryEntry: 'Centre Management (Shop 19a)',
    reason: 'Mall management office, not a retail tenant.',
  },
  {
    directoryEntry: 'ABSA ATM (Shop 2) / Standard Bank ATM (Shop 28)',
    reason: 'Cash machines, not shops — no staff, stock or chat journey to demo.',
  },
  {
    directoryEntry: 'Tobacco Land (Shop 16a)',
    reason: 'Tobacco retail is out of scope for a shopping demo pending owner decision.',
  },
  {
    directoryEntry: 'Betting World (Shop 27)',
    reason: 'Gambling operator is out of scope for a shopping demo pending owner decision.',
  },
] as const;

/**
 * All tenants listed in the mall directory that are real shops, transcribed.
 * Ordered by shop number so the directory reads like the mall's own board.
 */
export const TENANTS: TenantRecord[] = [
  {
    id: 'shop-kfc',
    name: 'KFC',
    directoryName: 'KFC',
    shopNumber: '1',
    category: 'food',
    summary: 'Quick-service chicken restaurant at the corner of Rhodes and Nigel-Springs roads.',
    tagline: 'Quick-service chicken restaurant',
    hoursLabel: 'Mon–Sun 09:00–21:00 (as listed by the mall)',
    phones: ['011 739 5594'],
    confidence: 'cross-verified',
    crossCheck: 'KFC "Nigel 2" listed at Shop 1, The Angelo Mall by TripAdvisor and Opendi listings.',
    initials: 'KFC',
    colour: '#a1121b',
    coverImage: IMG.food,
    featured: true,
    demoScenario: true,
  },
  {
    id: 'shop-golden-buffalo-spur',
    name: 'Golden Buffalo Spur',
    directoryName: 'Golden Buffalo Spur',
    shopNumber: '2',
    category: 'food',
    summary: 'Spur Steak Ranches family restaurant trading as Golden Buffalo Spur.',
    tagline: 'Family steak ranch restaurant',
    hoursLabel: 'Mon–Sun 09:00 until late (as listed by the mall)',
    phones: ['011 739 4222', '011 739 3866'],
    confidence: 'directory-only',
    initials: 'GBS',
    colour: '#7a2e12',
    coverImage: IMG.food,
    featured: true,
  },
  {
    id: 'shop-cash-crusaders',
    name: 'Cash Crusaders',
    directoryName: 'Cash Crusaders',
    shopNumber: '4',
    category: 'electronics',
    summary: 'Second-hand and new goods retailer (electronics, tools and household items).',
    tagline: 'Second-hand, electronics & pawn services',
    hoursLabel: 'Mon–Fri 09:00–18:00 · Sat 08:30–15:00 (as listed by the mall)',
    phones: ['011 739 4265', '011 739 4278'],
    confidence: 'directory-only',
    initials: 'CC',
    colour: '#1f3b73',
    coverImage: IMG.electronics,
  },
  {
    id: 'shop-mica',
    name: 'Mica',
    directoryName: 'Mica',
    shopNumber: '5',
    category: 'homeware',
    summary: 'Hardware and home-improvement store (Mica hardware).',
    tagline: 'Hardware & home improvement',
    hoursLabel: 'Mon–Fri 08:00–18:00 · Sat 08:00–15:00 · Sun 09:00–14:00 (as listed by the mall)',
    phones: ['011 739 5642'],
    confidence: 'cross-verified',
    crossCheck:
      'Mica Nigel (Angelo Mall, Rhodes Avenue) also appears in an independent business store-listing site (checked 2026-10-26).',
    initials: 'MC',
    colour: '#8a3b12',
    coverImage: IMG.homeware,
  },
  {
    id: 'shop-crazy-plastics',
    name: 'Crazy Plastics Express',
    directoryName: 'Crazy Plastics Express',
    shopNumber: '5b',
    category: 'homeware',
    summary: 'Plastics, storage and household goods store.',
    tagline: 'Plastics, storage & household goods',
    hoursLabel: 'Mon–Fri 08:00–18:00 · Sat 09:00–18:00 · Sun & public holidays 09:00–15:00 (as listed by the mall)',
    phones: ['011 739 4456'],
    confidence: 'directory-only',
    listingNote:
      'One third-party listing shows a PEP Home store at Shop 5B. The mall directory lists Crazy Plastics Express there, so this entry cannot be confirmed as current.',
    initials: 'CPX',
    colour: '#0f5f66',
    coverImage: IMG.homeware,
  },
  {
    id: 'shop-zillion-hair',
    name: 'Zillion Hair',
    directoryName: 'Zillion Hair',
    shopNumber: '6',
    category: 'beauty',
    summary: 'Hair and beauty supply shop.',
    tagline: 'Hair & beauty supplies',
    hoursLabel: 'Mon–Sat 08:00–17:00 · first and last Sunday 09:00–13:00 (as listed by the mall)',
    phones: ['011 739 5628'],
    confidence: 'directory-only',
    listingNote: 'Shares shop number 6 with Ruiter Makelaars in the mall directory.',
    initials: 'ZH',
    colour: '#7c1d4f',
    coverImage: IMG.beauty,
  },
  {
    id: 'shop-ruiter-makelaars',
    name: 'Ruiter Makelaars',
    directoryName: 'Ruiter Makelaars FSP 13510',
    shopNumber: '6',
    category: 'services',
    summary: 'Estate agency (FSP 13510 as printed in the mall directory).',
    tagline: 'Estate agency',
    hoursLabel: 'Mon–Sat 07:30–18:00 · Sat by appointment (as listed by the mall)',
    phones: ['011 814 1132', '072 637 4423'],
    confidence: 'directory-only',
    listingNote: 'Shares shop number 6 with Zillion Hair in the mall directory.',
    initials: 'RM',
    colour: '#334155',
    coverImage: IMG.services,
  },
  {
    id: 'shop-flesh-fashions',
    name: 'Flesh Fashions',
    directoryName: 'Flesh Fashions',
    shopNumber: '7',
    category: 'fashion',
    summary: 'Clothing store (the mall directory lists fleshnigel.co.za as its website).',
    tagline: 'Clothing store',
    hoursLabel: 'Mon–Fri 09:00–18:00 · Sat 09:00–15:00 · Sun 09:00–13:00 (as listed by the mall)',
    phones: ['011 739 5660'],
    website: 'https://www.fleshnigel.co.za/',
    confidence: 'directory-only',
    initials: 'FF',
    colour: '#7c2d12',
    coverImage: IMG.fashion,
  },
  {
    id: 'shop-clicks',
    name: 'Clicks',
    directoryName: 'Clicks',
    shopNumber: '9a',
    category: 'pharmacy',
    summary: 'Health, beauty and pharmacy retailer with an in-store pharmacy.',
    tagline: 'Pharmacy, health & beauty',
    hoursLabel: 'Mon–Fri 09:00–18:00 · Sat 08:00–16:30 · Sun 09:00–15:00 (Clicks store page)',
    phones: ['011 739 3870'],
    website: 'https://clicks.co.za/store/The-Angelo/1568',
    confidence: 'cross-verified',
    crossCheck:
      'Clicks’ own store page "The Angelo" (#1568) lists The Angelo Mall, Heidelberg Rd, Nigel with the same phone number and pharmacy facility (checked 2026-10-26).',
    initials: 'CL',
    colour: '#0b5aa0',
    coverImage: IMG.pharmacy,
    featured: true,
    demoScenario: true,
  },
  {
    id: 'shop-neutell-horowitz',
    name: 'Neutell & Horowitz',
    directoryName: 'Neutell & Horowitz',
    shopNumber: '9b',
    category: 'pharmacy',
    summary: 'Optometrist practice (listed next to Clicks).',
    tagline: 'Optometrists',
    hoursLabel: 'Mon–Thu 09:00–17:00 · Fri 09:00–16:30 · Sat 09:00–12:30 (as listed by the mall)',
    phones: ['011 739 5605'],
    confidence: 'directory-only',
    initials: 'NH',
    colour: '#0f766e',
    coverImage: IMG.pharmacy,
  },
  {
    id: 'shop-vodacom',
    name: 'Vodacom',
    directoryName: 'Vodacom',
    shopNumber: '10',
    category: 'electronics',
    summary: 'Mobile network operator shop.',
    tagline: 'Mobile network shop',
    hoursLabel: 'Mon–Thu 09:00–17:00 · Fri 09:00–17:00 · Sat 09:00–13:00 (as listed by the mall)',
    phones: ['011 739 2082'],
    confidence: 'directory-only',
    initials: 'VD',
    colour: '#b31b1b',
    coverImage: IMG.electronics,
  },
  {
    id: 'shop-nedbank',
    name: 'Nedbank',
    directoryName: 'Nedbank',
    shopNumber: '11',
    category: 'finance',
    summary: 'Bank branch with tellers (branch details as listed by the mall).',
    tagline: 'Bank branch',
    hoursLabel: 'Mon & Fri 08:30–16:00 · Tue–Thu 09:00–16:00 · Sat 08:30–12:00 (as listed by the mall)',
    phones: ['011 812 6700'],
    confidence: 'directory-only',
    initials: 'NB',
    colour: '#0b6b3a',
    coverImage: IMG.finance,
  },
  {
    id: 'shop-tops',
    name: 'Tops at Spar',
    directoryName: 'Tops',
    shopNumber: '12',
    category: 'groceries',
    summary: 'Liquor store trading as part of the Angelo SPAR complex.',
    tagline: 'Liquor store',
    hoursLabel: 'Mon–Sat 08:00–20:00 · Sun 09:00–15:00 (as listed by the mall)',
    phones: ['011 814 2222'],
    website: 'https://www.angelotops.co.za/',
    confidence: 'cross-verified',
    crossCheck:
      'The store’s own site angelotops.co.za lists Corner Heidelberg Road and Station Road, Nigel with the same telephone number (checked 2026-10-26).',
    listingNote: 'Directory prints the name as "Tops"; the store’s own site uses "Angelo Tops".',
    initials: 'TP',
    colour: '#14532d',
    coverImage: IMG.groceries,
  },
  {
    id: 'shop-superspar',
    name: 'The Angelo SUPERSPAR',
    directoryName: 'Superspar',
    shopNumber: '13',
    category: 'groceries',
    summary: 'Full-range supermarket with butchery, bakery and fresh produce.',
    tagline: 'Supermarket with butchery & bakery',
    hoursLabel: 'Mon–Sun 07:00–20:30 (as listed by the mall)',
    phones: ['011 814 2222'],
    website: 'https://www.angelosuperspar.co.za/',
    confidence: 'cross-verified',
    crossCheck:
      'The store’s own site (angelosuperspar.co.za) lists Corner Heidelberg Road and Station Road, Nigel with the same telephone number (checked 2026-10-26).',
    initials: 'SS',
    colour: '#0f5132',
    coverImage: IMG.groceries,
    featured: true,
    demoScenario: true,
  },
  {
    id: 'shop-biltong-den',
    name: 'Biltong Den',
    directoryName: 'Biltong Den',
    shopNumber: '14',
    category: 'food',
    summary: 'Biltong and dried-meat shop.',
    tagline: 'Biltong & dried meat',
    hoursLabel: 'Mon–Fri 10:00–18:00 · Sat 09:00–15:00 (as listed by the mall)',
    phones: ['011 739 5589'],
    confidence: 'directory-only',
    initials: 'BD',
    colour: '#7a3b1d',
    coverImage: IMG.food,
  },
  {
    id: 'shop-maxis',
    name: "Maxi's",
    directoryName: 'Maxis',
    shopNumber: '15',
    category: 'groceries',
    summary: 'Convenience grocery and confectionery store.',
    tagline: 'Convenience groceries & sweets',
    hoursLabel: 'Mon–Sat 08:00–19:00 · Sun 08:00–15:00 (as listed by the mall)',
    phones: ['011 739 5650'],
    confidence: 'directory-only',
    listingNote: 'Directory prints "Maxis"; the app uses the common spelling "Maxi’s".',
    initials: 'MX',
    colour: '#8a5a00',
    coverImage: IMG.groceries,
  },
  {
    id: 'shop-aviya',
    name: 'Aviya Photography & Graphics',
    directoryName: 'Aviya Photography & Graphics',
    shopNumber: '16b',
    category: 'services',
    summary: 'Photography and graphics studio.',
    tagline: 'Photography & graphics',
    hoursLabel: 'Mon–Fri 09:00–17:00 · Sat 09:00–13:00 (as listed by the mall)',
    phones: ['073 070 5954'],
    confidence: 'directory-only',
    initials: 'AV',
    colour: '#4c1d95',
    coverImage: IMG.services,
  },
  {
    id: 'shop-nigel-cellular',
    name: 'Nigel Cellular',
    directoryName: 'Nigel Cellular',
    shopNumber: '17',
    category: 'electronics',
    summary: 'Independent cellular dealer.',
    tagline: 'Cellular dealer',
    hoursLabel: 'Mon–Fri 08:30–17:30 · Sat 08:30–15:00 · Sun 08:30–13:00 (as listed by the mall)',
    phones: ['011 814 4911'],
    confidence: 'directory-only',
    initials: 'NC',
    colour: '#1e3a5f',
    coverImage: IMG.electronics,
  },
  {
    id: 'shop-mtn',
    name: 'MTN @ The Angelo Mall',
    directoryName: 'MTN @ The Angelo Mall',
    shopNumber: '18a',
    category: 'electronics',
    summary: 'MTN-branded mobile store.',
    tagline: 'Mobile network store',
    hoursLabel: 'Mon–Fri 09:00–18:00 · Sat 09:00–13:00 · Sun & public holidays 10:00–13:00 (as listed by the mall)',
    phones: ['011 739 5924', '011 739 5923', '011 739 5894'],
    confidence: 'cross-verified',
    crossCheck: 'MTN Store – Angelo Mall appears in an independent Nigel business directory.',
    initials: 'MTN',
    colour: '#1a1a1a',
    coverImage: IMG.electronics,
    demoScenario: true,
  },
  {
    id: 'shop-just-u-2',
    name: 'Just-u-2 Jewellers',
    directoryName: 'Just-u-2 Jewellers',
    shopNumber: '19b',
    category: 'fashion',
    summary: 'Jewellery shop.',
    tagline: 'Jewellery',
    hoursLabel: 'Mon–Fri 09:00–16:45 · Sat 09:00–13:00 (as listed by the mall)',
    phones: ['011 814 3168'],
    confidence: 'directory-only',
    initials: 'J2',
    colour: '#92400e',
    coverImage: IMG.fashion,
  },
  {
    id: 'shop-postnet',
    name: 'PostNet',
    directoryName: 'Posnet',
    shopNumber: '22',
    category: 'services',
    summary: 'Courier, printing and business services outlet.',
    tagline: 'Courier, print & business services',
    hoursLabel: 'Mon–Fri 09:00–17:00 · Sat 09:00–13:00 (as listed by the mall)',
    phones: ['011 739 5638'],
    confidence: 'directory-only',
    listingNote: 'Directory prints the name as "Posnet"; the brand trades as "PostNet".',
    initials: 'PN',
    colour: '#0c3b2e',
    coverImage: IMG.services,
  },
  {
    id: 'shop-pep',
    name: 'PEP',
    directoryName: 'Pep',
    shopNumber: '23',
    category: 'fashion',
    summary: 'Value clothing and household-goods retailer.',
    tagline: 'Value clothing & household goods',
    hoursLabel: 'Mon–Thu 09:00–18:00 · Fri–Sat 09:00–15:00 · Sun 09:00–13:00 (as listed by the mall)',
    phones: ['011 739 5821'],
    confidence: 'cross-verified',
    crossCheck: 'PEP Nigel The Angelo is listed at Shop 21 & 23, The Angelo Mall by PEP’s own social page and third-party store directories.',
    listingNote: 'Township-numbered shop listings show "Shop 21 & 23"; the mall directory prints 23.',
    initials: 'PEP',
    colour: '#b3261e',
    coverImage: IMG.fashion,
    featured: true,
  },
  {
    id: 'shop-scooters',
    name: 'Scooters Pizza',
    directoryName: 'Scooters',
    shopNumber: '24a',
    category: 'food',
    summary: 'Pizza takeaway and delivery franchise.',
    tagline: 'Pizza takeaway',
    hoursLabel: 'Mon–Thu 10:00–21:00 · Fri–Sat 10:00–22:00 · Sun 10:00–21:00 (as listed by the mall)',
    phones: ['011 739 5700'],
    confidence: 'directory-only',
    initials: 'SP',
    colour: '#9a3412',
    coverImage: IMG.food,
  },
  {
    id: 'shop-ocean-basket',
    name: 'Ocean Basket',
    directoryName: 'Ocean Basket',
    shopNumber: '24b',
    category: 'food',
    summary: 'Seafood restaurant franchise.',
    tagline: 'Seafood restaurant',
    hoursLabel: 'Mon–Sun 10:30 until late (as listed by the mall)',
    phones: ['011 814 3311', '011 739 5553'],
    website: 'http://www.angelooceanbasket.co.za/',
    confidence: 'directory-only',
    listingNote:
      'The website is the one printed in the mall directory; it did not load when checked on 2026-10-26, so treat it as unconfirmed.',
    initials: 'OB',
    colour: '#0b4f6c',
    coverImage: IMG.food,
  },
  {
    id: 'shop-angel-kiss',
    name: 'Angel Kiss Boutique',
    directoryName: 'Angel Kiss Boutique',
    shopNumber: '25a',
    category: 'fashion',
    summary: 'Boutique clothing store.',
    tagline: 'Clothing boutique',
    hoursLabel: 'Mon–Fri 08:30–18:00 · Sat 08:30–16:00 · Sun 08:30–15:00 (as listed by the mall)',
    confidence: 'directory-only',
    listingNote: 'The mall directory prints no telephone number for this shop.',
    initials: 'AK',
    colour: '#9d174d',
    coverImage: IMG.fashion,
  },
  {
    id: 'shop-crazy-store',
    name: 'The Crazy Store',
    directoryName: 'Crazy Store',
    shopNumber: '26',
    category: 'homeware',
    summary: 'Variety store for household, party and seasonal goods.',
    tagline: 'Variety store',
    hoursLabel: 'Mon–Fri 09:00–18:00 · Sat 09:00–15:00 · Sun 09:00–13:00 (as listed by the mall)',
    phones: ['011 739 5593'],
    confidence: 'cross-verified',
    crossCheck:
      'The Crazy Store’s own store listing places a branch at The Angelo Mall, Nigel with the same telephone number (checked 2026-10-26).',
    initials: 'CS',
    colour: '#c2410c',
    coverImage: IMG.homeware,
  },
  {
    id: 'shop-fnb',
    name: 'FNB',
    directoryName: 'FNB',
    shopNumber: '28',
    category: 'finance',
    summary: 'Bank branch (sales and tellers).',
    tagline: 'Bank branch',
    hoursLabel:
      'Mon–Fri (excl Wed) sales 08:00–17:00, tellers 09:00–15:30 · Wed from 09:00 · Sat 08:30–12:30 (as listed by the mall)',
    phones: ['011 814 8266'],
    confidence: 'directory-only',
    listingNote: 'A Standard Bank ATM is also listed next to FNB at Shop 28.',
    initials: 'FNB',
    colour: '#0b5aa0',
    coverImage: IMG.finance,
  },
  {
    id: 'shop-best-buy',
    name: 'Best Buy',
    directoryName: 'Best Buy',
    shopNumber: '30',
    category: 'electronics',
    summary: 'Appliance and electronics retailer.',
    tagline: 'Appliances & electronics',
    hoursLabel: 'Mon–Sat 08:00–19:00 · Sun 08:00–18:00 (as listed by the mall)',
    website: 'http://www.bestbuyshop.co.za/',
    confidence: 'directory-only',
    initials: 'BB',
    colour: '#1f2937',
    coverImage: IMG.electronics,
  },
  {
    id: 'shop-carwash',
    name: 'Carwash @ Angelo Mall',
    directoryName: 'Carwash @ Angelo Mall',
    category: 'services',
    summary: 'Car wash operating on the mall property.',
    tagline: 'Car wash',
    hoursLabel: 'Mon–Fri 08:00–17:00 · Sat 08:00–15:00 · Sun 08:00–14:00 (as listed by the mall)',
    phones: ['082 468 0141'],
    confidence: 'directory-only',
    listingNote: 'The mall directory gives no shop number for the car wash.',
    initials: 'CW',
    colour: '#374151',
    coverImage: IMG.services,
  },
];

/** Tenants carrying the scripted demo walkthrough (chat → basket → delivery). */
export const DEMO_SCENARIO_TENANT_IDS = TENANTS.filter((t) => t.demoScenario).map((t) => t.id);

export function tenantById(id: string): TenantRecord | undefined {
  return TENANTS.find((tenant) => tenant.id === id);
}
