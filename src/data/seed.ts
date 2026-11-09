/**
 * Centralised demo seed data.
 *
 * PHASE 4 — REAL TENANT DIRECTORY
 * - Shop listings now come from the mall's own store directory, transcribed in
 *   `./tenants.ts` (with source, check date and confidence per listing). The
 *   names, shop numbers, telephone numbers, hours and websites are the mall's,
 *   not invented.
 * - NO tenant is a Mall Go partner. Every conversation, price, basket, order,
 *   collection and delivery below is simulated in the browser: no real shop
 *   staff, stock system, payment or courier is connected. The UI says so on the
 *   directory, shop pages and inside every demo chat.
 * - Four well-corroborated tenants (SUPERSPAR, KFC, Clicks, MTN) carry the
 *   scripted sample walkthrough. The rest are listings for information only.
 * - Phase 2 replaces this module's consumers with API responses; the shapes in
 *   ../types stay the same.
 */
import type { CategoryId, DemoState, FulfilmentMethod, Shop } from '../types';
import { DEMO_CUSTOMER } from '../types';
import { TENANTS, TENANT_SOURCE, type TenantRecord } from './tenants';
import { imageSrc } from './imageAssets';

export const CATEGORIES: { id: CategoryId; label: string; tagline: string }[] = [
  { id: 'groceries', label: 'Groceries', tagline: 'Supermarkets, liquor & convenience' },
  { id: 'food', label: 'Restaurants & takeaway', tagline: 'Sit-down, fast food & biltong' },
  { id: 'fashion', label: 'Clothing & fashion', tagline: 'Clothing, jewellery & boutiques' },
  { id: 'electronics', label: 'Electronics & mobile', tagline: 'Phones, networks & appliances' },
  { id: 'pharmacy', label: 'Pharmacy & health', tagline: 'Pharmacy, optometry & wellness' },
  { id: 'homeware', label: 'Home & hardware', tagline: 'Hardware, plastics & variety goods' },
  { id: 'beauty', label: 'Hair & beauty', tagline: 'Hair and beauty supplies' },
  { id: 'services', label: 'Services & professional', tagline: 'Courier, print, property & more' },
  { id: 'finance', label: 'Banking & finance', tagline: 'Bank branches with tellers' },
];

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

const MIN = 60_000;
const HOUR = 60 * MIN;

/** Per-shop demo behaviour. Nothing here is real trading information. */
interface DemoOps {
  tradingNow: boolean;
  fulfilment: FulfilmentMethod[];
  deliveryFee: number;
  prepTimeLabel: string;
  description: string;
}

const LISTING_ONLY_OPS: Omit<DemoOps, 'description'> = {
  tradingNow: true,
  // Listing-only shops advertise no fulfilment method: offering "collection"
  // would imply the real business accepts an order from this app.
  fulfilment: [],
  deliveryFee: 0,
  prepTimeLabel: 'Listing only — ordering is not connected in this demo',
};

/** Shops that carry the scripted sample conversation / basket walkthrough. */
const DEMO_OPS: Record<string, DemoOps> = {
  'shop-superspar': {
    tradingNow: true,
    fulfilment: ['delivery', 'collection'],
    deliveryFee: 35,
    prepTimeLabel: 'Sample collection time ±45 min (simulated)',
    description:
      'Real tenant at Angelo Mall (Shop 13, supermarket with butchery and bakery). This is the worked example: a sample grocery chat, order summary and delivery are simulated in your browser — the real store receives nothing, and no price or stock level shown here is theirs.',
  },
  'shop-kfc': {
    tradingNow: true,
    fulfilment: ['delivery', 'collection'],
    deliveryFee: 25,
    prepTimeLabel: 'Sample collection time ±25 min (simulated)',
    description:
      'Real tenant at Angelo Mall (Shop 1, quick-service chicken restaurant). The scripted takeaway chat in this demo is fictional; KFC has no connection to Mall Go and no real order, price or delivery is shown.',
  },
  'shop-clicks': {
    tradingNow: true,
    fulfilment: ['delivery', 'collection'],
    deliveryFee: 30,
    prepTimeLabel: 'Sample collection time ±20 min (simulated)',
    description:
      'Real tenant at Angelo Mall (Shop 9A, Clicks store with an in-store pharmacy). The sample health-and-beauty chat is fictional and medicine is never sold or advised in this demo — Clicks receives nothing from the app.',
  },
  'shop-mtn': {
    tradingNow: true,
    fulfilment: ['delivery', 'collection'],
    deliveryFee: 60,
    prepTimeLabel: 'Sample collection time ±30 min (simulated)',
    description:
      'Real tenant at Angelo Mall (Shop 18A, MTN-branded mobile store). The sample airtime-and-accessory chat is fictional; no MTN systems, stock or contracts are connected to this demo.',
  },
};

/** Shops shown as "closed" so the directory keeps a realistic mix. */
const CLOSED_SHOP_IDS = new Set(['shop-aviya', 'shop-just-u-2']);

const DEMO_SCENARIO_PREFIX = 'Sample walkthrough · simulated';

function descriptionFor(tenant: TenantRecord, location: string): string {
  if (DEMO_OPS[tenant.id]) return DEMO_OPS[tenant.id].description;
  const parts = [
    `${tenant.summary} Listed from The Angelo Mall store directory at ${location}.`,
    'Mall Go is a concept demo: no chat, ordering, payment or delivery is connected to this business, and nothing on this page is an offer from it.',
  ];
  if (tenant.confidence === 'directory-only') {
    parts.push('Listing is from the mall directory only and could not be independently confirmed as current.');
  }
  return parts.join(' ');
}

function buildShop(tenant: TenantRecord): Shop {
  const ops = DEMO_OPS[tenant.id] ?? LISTING_ONLY_OPS;
  const location = tenant.shopNumber ? `Shop ${tenant.shopNumber}` : 'the mall property';
  const scenario = Boolean(DEMO_OPS[tenant.id]);
  return {
    id: tenant.id,
    name: tenant.name,
    category: tenant.category,
    tagline: tenant.tagline,
    description: descriptionFor(tenant, location),
    coverImage: tenant.coverImage,
    conceptImage: tenant.conceptImage,
    initials: tenant.initials,
    colour: tenant.colour,
    shopNumber: tenant.shopNumber,
    phones: tenant.phones,
    website: tenant.website,
    listingConfidence: tenant.confidence,
    listingSource: `${TENANT_SOURCE.title} — ${TENANT_SOURCE.url}`,
    listingCheckedOn: TENANT_SOURCE.checkedOn,
    listingNote: tenant.listingNote,
    tradingNow: CLOSED_SHOP_IDS.has(tenant.id) ? false : ops.tradingNow,
    hoursLabel: tenant.hoursLabel,
    fulfilment: ops.fulfilment,
    deliveryFee: ops.deliveryFee,
    participation: scenario ? 'demo-scenario' : 'real-listing',
    featured: Boolean(tenant.featured),
    prepTimeLabel: scenario ? ops.prepTimeLabel : LISTING_ONLY_OPS.prepTimeLabel,
    unitLabel: tenant.shopNumber
      ? `Shop ${tenant.shopNumber}, Angelo Mall (per mall directory)`
      : 'Angelo Mall, Heidelberg Rd & Station Rd, Nigel (no shop number listed)',
  };
}

export const SHOPS: Shop[] = TENANTS.map(buildShop);

export const DEMO_SCENARIO_LABEL = DEMO_SCENARIO_PREFIX;

/** Deterministic-shape seed; timestamps are relative to first load. */
export function createSeedState(now: number = Date.now()): DemoState {
  const t = (minutesAgo: number) => now - minutesAgo * MIN;

  return {
    version: 1,
    role: 'customer',
    activeShopId: 'shop-superspar',
    seq: 1042,
    shops: SHOPS.map((shop) => ({ ...shop })),
    conversations: [
      {
        id: 'conv-superspar-thandi',
        shopId: 'shop-superspar',
        customerId: DEMO_CUSTOMER.id,
        customerName: DEMO_CUSTOMER.name,
        customerArea: DEMO_CUSTOMER.area,
        unreadForCustomer: 1,
        unreadForShop: 0,
        createdAt: t(52),
        lastActivityAt: t(38),
      },
      {
        id: 'conv-kfc-thandi',
        shopId: 'shop-kfc',
        customerId: DEMO_CUSTOMER.id,
        customerName: DEMO_CUSTOMER.name,
        customerArea: DEMO_CUSTOMER.area,
        unreadForCustomer: 0,
        unreadForShop: 0,
        createdAt: t(190),
        lastActivityAt: t(64),
      },
      {
        id: 'conv-mtn-thandi',
        shopId: 'shop-mtn',
        customerId: DEMO_CUSTOMER.id,
        customerName: DEMO_CUSTOMER.name,
        customerArea: DEMO_CUSTOMER.area,
        unreadForCustomer: 0,
        unreadForShop: 0,
        createdAt: t(60 * 30),
        lastActivityAt: t(60 * 28),
      },
      {
        id: 'conv-superspar-Sipho',
        shopId: 'shop-superspar',
        customerId: 'customer-Sipho',
        customerName: 'Sipho D. (demo customer)',
        customerArea: 'Alra Park',
        unreadForCustomer: 0,
        unreadForShop: 2,
        createdAt: t(25),
        lastActivityAt: t(6),
      },
      {
        id: 'conv-superspar-aisha',
        shopId: 'shop-superspar',
        customerId: 'customer-aisha',
        customerName: 'Aisha K. (demo customer)',
        customerArea: 'Nigel Central',
        unreadForCustomer: 0,
        unreadForShop: 0,
        createdAt: t(300),
        lastActivityAt: t(120),
      },
      {
        id: 'conv-clicks-pieter',
        shopId: 'shop-clicks',
        customerId: 'customer-pieter',
        customerName: 'Pieter v. (demo customer)',
        customerArea: 'Glenvarloch',
        unreadForCustomer: 0,
        unreadForShop: 0,
        createdAt: t(240),
        lastActivityAt: t(95),
      },
    ],
    messages: [
      // --- Signature scripted conversation (SUPERSPAR × Thandi) ---
      {
        id: 'msg-001',
        conversationId: 'conv-superspar-thandi',
        sender: 'system',
        kind: 'system',
        text: 'Simulated sample conversation. The shop is a real Angelo Mall tenant, but it is not a Mall Go partner — nobody at the store sees or answers these messages.',
        createdAt: t(52),
      },
      {
        id: 'msg-002',
        conversationId: 'conv-superspar-thandi',
        sender: 'customer',
        kind: 'text',
        text: 'Hi, I need bread, milk, eggs and mince.',
        createdAt: t(50),
      },
      {
        id: 'msg-003',
        conversationId: 'conv-superspar-thandi',
        sender: 'shop',
        kind: 'text',
        text: 'Hi Thandi! Certainly. What size milk would you like, and how much mince do you need?',
        createdAt: t(47),
      },
      {
        id: 'msg-004',
        conversationId: 'conv-superspar-thandi',
        sender: 'customer',
        kind: 'text',
        text: 'Two litres of milk and 500 g mince, please.',
        createdAt: t(43),
      },
      {
        id: 'msg-005',
        conversationId: 'conv-superspar-thandi',
        sender: 'shop',
        kind: 'text',
        text: "No problem. I'll prepare your order summary now — white bread loaf, 2 L full-cream milk, 12 free-range eggs and 500 g beef mince.",
        createdAt: t(40),
      },
      {
        id: 'msg-006',
        conversationId: 'conv-superspar-thandi',
        sender: 'shop',
        kind: 'order-card',
        text: 'Order summary ready for your review (demo prices).',
        orderId: 'ord-demo-1001',
        createdAt: t(38),
      },
      // --- KFC × Thandi (order already out for delivery) ---
      {
        id: 'msg-106',
        conversationId: 'conv-kfc-thandi',
        sender: 'system',
        kind: 'system',
        text: 'Simulated sample conversation. KFC is a real tenant at Angelo Mall but has no Mall Go account — no staff member receives these messages.',
        createdAt: t(192),
      },
      {
        id: 'msg-101',
        conversationId: 'conv-kfc-thandi',
        sender: 'customer',
        kind: 'text',
        text: 'Hi! Please can I get 2× chicken burger meals, one mild and one hot?',
        createdAt: t(190),
      },
      {
        id: 'msg-102',
        conversationId: 'conv-kfc-thandi',
        sender: 'shop',
        kind: 'text',
        text: 'Of course — both with regular chips and cooldrinks? Summary coming up.',
        createdAt: t(184),
      },
      {
        id: 'msg-103',
        conversationId: 'conv-kfc-thandi',
        sender: 'shop',
        kind: 'order-card',
        text: 'Meal summary (demo prices).',
        orderId: 'ord-demo-1002',
        createdAt: t(180),
      },
      {
        id: 'msg-104',
        conversationId: 'conv-kfc-thandi',
        sender: 'system',
        kind: 'system',
        text: 'Demo order AMG-1002 confirmed · Delivery.',
        createdAt: t(176),
      },
      {
        id: 'msg-105',
        conversationId: 'conv-kfc-thandi',
        sender: 'system',
        kind: 'system',
        text: 'Demo order AMG-1002 is out for delivery.',
        createdAt: t(64),
      },
      // --- MTN × Thandi (completed history order) ---
      {
        id: 'msg-205',
        conversationId: 'conv-mtn-thandi',
        sender: 'system',
        kind: 'system',
        text: 'Simulated sample conversation. MTN is a real tenant at Angelo Mall but has no Mall Go account — no staff member receives these messages.',
        createdAt: t(60 * 30 + 2),
      },
      {
        id: 'msg-201',
        conversationId: 'conv-mtn-thandi',
        sender: 'customer',
        kind: 'text',
        text: 'Hi, do you have a USB-C fast-charge cable, about 1 m?',
        createdAt: t(60 * 30),
      },
      {
        id: 'msg-202',
        conversationId: 'conv-mtn-thandi',
        sender: 'shop',
        kind: 'text',
        text: 'Yes — braided 1 m, demo price on the summary. Collect or delivery?',
        createdAt: t(60 * 30 - 8),
      },
      {
        id: 'msg-203',
        conversationId: 'conv-mtn-thandi',
        sender: 'shop',
        kind: 'order-card',
        text: 'Order summary (demo prices).',
        orderId: 'ord-demo-1003',
        createdAt: t(60 * 30 - 10),
      },
      {
        id: 'msg-204',
        conversationId: 'conv-mtn-thandi',
        sender: 'system',
        kind: 'system',
        text: 'Demo order AMG-1003 completed · Collected.',
        createdAt: t(60 * 28),
      },
      // --- Retailer inbox realism: other demo customers at SUPERSPAR ---
      {
        id: 'msg-301',
        conversationId: 'conv-superspar-Sipho',
        sender: 'customer',
        kind: 'text',
        text: 'Morning! Do you have chicken braai packs today? Need for about 6 people.',
        createdAt: t(25),
      },
      {
        id: 'msg-302',
        conversationId: 'conv-superspar-Sipho',
        sender: 'customer',
        kind: 'text',
        text: 'And charcoal + firelighters if you stock them, please.',
        createdAt: t(6),
      },
      {
        id: 'msg-401',
        conversationId: 'conv-superspar-aisha',
        sender: 'customer',
        kind: 'text',
        text: 'Hi, is the brown bread back in stock?',
        createdAt: t(300),
      },
      {
        id: 'msg-402',
        conversationId: 'conv-superspar-aisha',
        sender: 'shop',
        kind: 'text',
        text: 'Hi Aisha — yes, fresh this morning. Shall I keep two loaves aside for collection?',
        createdAt: t(288),
      },
      {
        id: 'msg-403',
        conversationId: 'conv-superspar-aisha',
        sender: 'shop',
        kind: 'order-card',
        text: 'Kept-aside summary (demo prices).',
        orderId: 'ord-demo-1005',
        createdAt: t(120),
      },
      // --- Clicks order awaiting a driver (delivery tab day-one content) ---
      {
        id: 'msg-500',
        conversationId: 'conv-clicks-pieter',
        sender: 'system',
        kind: 'system',
        text: 'Simulated sample conversation. Clicks is a real tenant at Angelo Mall but has no Mall Go account — no staff member receives these messages.',
        createdAt: t(242),
      },
      {
        id: 'msg-501',
        conversationId: 'conv-clicks-pieter',
        sender: 'customer',
        kind: 'text',
        text: 'Hi, please can I get vitamin D and plasters delivered?',
        createdAt: t(240),
      },
      {
        id: 'msg-502',
        conversationId: 'conv-clicks-pieter',
        sender: 'shop',
        kind: 'order-card',
        text: 'Order summary (demo prices).',
        orderId: 'ord-demo-1004',
        createdAt: t(230),
      },
      {
        id: 'msg-503',
        conversationId: 'conv-clicks-pieter',
        sender: 'system',
        kind: 'system',
        text: 'Demo order AMG-1004 is awaiting driver assignment.',
        createdAt: t(95),
      },
    ],
    orders: [
      {
        id: 'ord-demo-1001',
        ref: 'AMG-1001',
        conversationId: 'conv-superspar-thandi',
        shopId: 'shop-superspar',
        customerId: DEMO_CUSTOMER.id,
        customerName: DEMO_CUSTOMER.name,
        destinationArea: DEMO_CUSTOMER.area,
        items: [
          { id: 'li-1001-1', description: 'White bread loaf 700 g', quantity: 1, unitPrice: 19.99 },
          { id: 'li-1001-2', description: 'Full-cream milk 2 L', quantity: 1, unitPrice: 44.99 },
          { id: 'li-1001-3', description: 'Free-range eggs, tray of 12', quantity: 1, unitPrice: 64.99 },
          { id: 'li-1001-4', description: 'Beef mince 500 g', quantity: 1, unitPrice: 89.99, note: 'Lean, as discussed' },
        ],
        status: 'awaiting-customer',
        fulfilment: 'delivery',
        deliveryFee: 35,
        changeRequests: [],
        history: [{ status: 'awaiting-customer', at: t(38), note: 'Shop sent the order summary (demo).' }],
        createdAt: t(38),
        updatedAt: t(38),
      },
      {
        id: 'ord-demo-1002',
        ref: 'AMG-1002',
        conversationId: 'conv-kfc-thandi',
        shopId: 'shop-kfc',
        customerId: DEMO_CUSTOMER.id,
        customerName: DEMO_CUSTOMER.name,
        destinationArea: DEMO_CUSTOMER.area,
        items: [
          { id: 'li-1002-1', description: 'Chicken burger meal — mild, regular chips + cooldrink', quantity: 1, unitPrice: 89.9 },
          { id: 'li-1002-2', description: 'Chicken burger meal — hot, regular chips + cooldrink', quantity: 1, unitPrice: 89.9 },
        ],
        status: 'out-for-delivery',
        fulfilment: 'delivery',
        deliveryFee: 25,
        changeRequests: [],
        deliveryJobId: 'job-demo-1002',
        history: [
          { status: 'awaiting-shop', at: t(176), note: 'Customer confirmed (demo).' },
          { status: 'accepted', at: t(170), note: 'Shop accepted (demo).' },
          { status: 'preparing', at: t(160), note: 'Being prepared (demo).' },
          { status: 'awaiting-driver', at: t(120), note: 'Ready — delivery job published (demo).' },
          { status: 'driver-assigned', at: t(100), note: 'Demo driver accepted the job.' },
          { status: 'collected', at: t(80), note: 'Driver collected from shop (demo).' },
          { status: 'out-for-delivery', at: t(64), note: 'Out for delivery (demo).' },
        ],
        createdAt: t(180),
        updatedAt: t(64),
      },
      {
        id: 'ord-demo-1003',
        ref: 'AMG-1003',
        conversationId: 'conv-mtn-thandi',
        shopId: 'shop-mtn',
        customerId: DEMO_CUSTOMER.id,
        customerName: DEMO_CUSTOMER.name,
        destinationArea: DEMO_CUSTOMER.area,
        items: [
          { id: 'li-1003-1', description: 'Braided USB-C fast-charge cable 1 m', quantity: 1, unitPrice: 149.99 },
        ],
        status: 'completed',
        fulfilment: 'collection',
        deliveryFee: 60,
        changeRequests: [],
        history: [
          { status: 'awaiting-shop', at: t(60 * 30 - 14), note: 'Customer confirmed (demo).' },
          { status: 'accepted', at: t(60 * 30 - 20), note: 'Shop accepted (demo).' },
          { status: 'preparing', at: t(60 * 29), note: 'Being prepared (demo).' },
          { status: 'ready-collection', at: t(60 * 29 - 30), note: 'Ready for collection (demo).' },
          { status: 'completed', at: t(60 * 28), note: 'Collected by customer (demo).' },
        ],
        createdAt: t(60 * 30 - 10),
        updatedAt: t(60 * 28),
      },
      {
        id: 'ord-demo-1004',
        ref: 'AMG-1004',
        conversationId: 'conv-clicks-pieter',
        shopId: 'shop-clicks',
        customerId: 'customer-pieter',
        customerName: 'Pieter v. (demo customer)',
        destinationArea: 'Glenvarloch',
        items: [
          { id: 'li-1004-1', description: 'Vitamin D3 1000 IU, 30 capsules (demo item)', quantity: 1, unitPrice: 129.99 },
          { id: 'li-1004-2', description: 'Assorted plasters, box of 40 (demo item)', quantity: 2, unitPrice: 39.99 },
        ],
        status: 'awaiting-driver',
        fulfilment: 'delivery',
        deliveryFee: 30,
        changeRequests: [],
        deliveryJobId: 'job-demo-1004',
        history: [
          { status: 'awaiting-shop', at: t(225), note: 'Customer confirmed (demo).' },
          { status: 'accepted', at: t(215), note: 'Shop accepted (demo).' },
          { status: 'preparing', at: t(200), note: 'Being prepared (demo).' },
          { status: 'awaiting-driver', at: t(95), note: 'Ready — delivery job published (demo).' },
        ],
        createdAt: t(230),
        updatedAt: t(95),
      },
      {
        id: 'ord-demo-1005',
        ref: 'AMG-1005',
        conversationId: 'conv-superspar-aisha',
        shopId: 'shop-superspar',
        customerId: 'customer-aisha',
        customerName: 'Aisha K. (demo customer)',
        destinationArea: 'Nigel Central',
        items: [
          { id: 'li-1005-1', description: 'Brown bread loaf 700 g', quantity: 2, unitPrice: 18.99 },
        ],
        status: 'awaiting-customer',
        fulfilment: 'collection',
        deliveryFee: 35,
        changeRequests: [],
        history: [{ status: 'awaiting-customer', at: t(120), note: 'Shop sent the order summary (demo).' }],
        createdAt: t(120),
        updatedAt: t(120),
      },
    ],
    deliveryJobs: [
      {
        id: 'job-demo-1002',
        orderId: 'ord-demo-1002',
        shopId: 'shop-kfc',
        destinationArea: 'Nigel Central',
        driverPayout: 22,
        distanceKm: 2.4,
        parcelsLabel: '1 food bag · keep upright (demo)',
        status: 'out-for-delivery',
        driverName: 'Demo driver · Johan K.',
        createdAt: t(120),
        updatedAt: t(64),
      },
      {
        id: 'job-demo-1004',
        orderId: 'ord-demo-1004',
        shopId: 'shop-clicks',
        destinationArea: 'Glenvarloch',
        driverPayout: 26,
        distanceKm: 3.8,
        parcelsLabel: '1 small pharmacy parcel (demo)',
        status: 'available',
        createdAt: t(95),
        updatedAt: t(95),
      },
    ],
    /**
     * Promotions are CONCEPT PLACEHOLDERS. They deliberately do not attribute an
     * offer, discount or event to any real tenant: the mall directory gives us no
     * promotional information, so inventing one would misrepresent a business.
     */
    promotions: [
      {
        id: 'promo-sample-nearby',
        title: 'Sample sponsored slot (placeholder)',
        description:
          'This is where a paid placement could appear. It is a placeholder, not an offer: no discount, price or campaign below belongs to any real shop at Angelo Mall.',
        image: imageSrc('promo-groceries'),
        placement: 'home-banner',
        sponsored: true,
        active: true,
        startsAt: '2026-10-23',
        endsAt: '2026-10-31',
        impressions: 128,
        clicks: 17,
        conversationStarts: 5,
      },
      {
        id: 'promo-sample-directory',
        title: 'How a listed shop could promote itself (example copy)',
        description:
          'Example of unpaid tenant content in the concept: a shop could send its own promotion and Mall Go would show it with the shop’s name. Nothing here is claimed on behalf of any tenant.',
        image: imageSrc('promo-takeaway'),
        placement: 'home-banner',
        sponsored: false,
        active: true,
        startsAt: '2026-10-20',
        endsAt: '2026-11-30',
        impressions: 204,
        clicks: 31,
        conversationStarts: 12,
      },
      {
        id: 'promo-mall-go-launch',
        title: 'Concept: chat to mall shops from home',
        description:
          'Concept announcement space for mall management. In a live rollout this slot could carry mall events or confirmed tenant promotions — with each shop’s written approval.',
        image: imageSrc('concept-map'),
        placement: 'directory-banner',
        sponsored: false,
        active: true,
        startsAt: '2026-10-01',
        endsAt: '2026-11-30',
        impressions: 412,
        clicks: 44,
        conversationStarts: 9,
      },
    ],
  };
}

// Keep HOUR referenced for future seed additions without unused-var noise.
export const SEED_TIME = { MIN, HOUR };
