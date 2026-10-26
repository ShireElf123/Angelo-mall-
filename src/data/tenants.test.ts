import { describe, expect, it } from 'vitest';
import { CATEGORIES, DEMO_SCENARIO_LABEL, SHOPS, createSeedState } from './seed';
import { EXCLUDED_LISTINGS, TENANTS, TENANT_SOURCE, tenantById } from './tenants';

/**
 * Phase 4 data-integrity guard for the real tenant directory.
 *
 * These tests are deliberately strict about provenance: a listing may only exist
 * if it came from the mall's published store directory, carries a confidence
 * level and a check date, and does not re-introduce a fictional demo business.
 */
const state = createSeedState();
const categoryIds = new Set(CATEGORIES.map((c) => c.id));

describe('tenant source of truth', () => {
  it('records where the listings came from and when they were checked', () => {
    expect(TENANT_SOURCE.url).toBe('https://www.angelomall.co.za/');
    expect(TENANT_SOURCE.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(TENANT_SOURCE.context).toMatch(/no "last updated" date|no “last updated” date/i);
  });

  it('has unique, routable shop ids', () => {
    const ids = TENANTS.map((tenant) => tenant.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^shop-[a-z0-9-]+$/);
  });

  it('uses only categories the app knows about', () => {
    for (const tenant of TENANTS) {
      expect(categoryIds.has(tenant.category), `${tenant.id} has unknown category ${tenant.category}`).toBe(true);
    }
  });

  it('gives every tenant a name, summary, tagline, hours and a confidence level', () => {
    for (const tenant of TENANTS) {
      expect(tenant.name.trim().length, `${tenant.id} name`).toBeGreaterThan(0);
      expect(tenant.directoryName.trim().length, `${tenant.id} directory name`).toBeGreaterThan(0);
      expect(tenant.summary.trim().length, `${tenant.id} summary`).toBeGreaterThan(10);
      expect(tenant.tagline.trim().length, `${tenant.id} tagline`).toBeGreaterThan(3);
      expect(tenant.hoursLabel.trim().length, `${tenant.id} hours`).toBeGreaterThan(3);
      expect(['cross-verified', 'directory-only']).toContain(tenant.confidence);
    }
  });

  it('marks where each cross-verification came from', () => {
    for (const tenant of TENANTS) {
      if (tenant.confidence === 'cross-verified') {
        expect(tenant.crossCheck?.length ?? 0, `${tenant.id} needs a crossCheck note`).toBeGreaterThan(20);
      }
    }
  });

  it('only ships contact details that are plausible directory transcriptions', () => {
    for (const tenant of TENANTS) {
      for (const phone of tenant.phones ?? []) {
        expect(phone, `${tenant.id} phone`).toMatch(/^0\d{2} \d{3} \d{4}$|^0\d{2} \d{3} \d{4}$/);
      }
      if (tenant.website) expect(tenant.website, `${tenant.id} website`).toMatch(/^https?:\/\//);
    }
  });

  it('never presents a generated image as the tenant’s own photograph', () => {
    // Cover images are shared category scenes under /images/shop-<category>.jpg.
    for (const tenant of TENANTS) {
      expect(tenant.coverImage).toMatch(/^\/images\/shop-[a-z]+\.jpg$/);
      const slug = tenant.category === 'groceries' ? 'grocery' : tenant.category;
      expect(tenant.coverImage, `${tenant.id} should use its category scene`).toBe(`/images/shop-${slug}.jpg`);
    }
  });
});

describe('seed shops are the real directory', () => {
  it('projects every listed tenant and nothing else', () => {
    expect(SHOPS.map((shop) => shop.id).sort()).toEqual(TENANTS.map((tenant) => tenant.id).sort());
    expect(state.shops.length).toBe(TENANTS.length);
  });

  it('removes every fictional Phase 1 demo tenant', () => {
    const fictional = [
      'Mzansi Fresh Grocers',
      'Flame & Co. Grill',
      'Nigel Style Studio',
      'TechPoint Electronics',
      'CarePlus Pharmacy',
      'Home Comforts',
      'Glow Beauty Bar',
      'Fix & Print Services',
    ];
    const haystack = state.shops
      .map((shop) => `${shop.id} ${shop.name} ${shop.tagline} ${shop.description}`)
      .join('\n');
    for (const name of fictional) expect(haystack).not.toContain(name);
    for (const id of ['shop-mzansi-fresh', 'shop-flame-co', 'shop-style-studio', 'shop-techpoint', 'shop-careplus']) {
      expect(haystack).not.toContain(id);
    }
  });

  it('carries provenance through to the UI records', () => {
    for (const shop of state.shops) {
      expect(shop.listingSource).toContain('angelomall.co.za');
      expect(shop.listingCheckedOn).toBe(TENANT_SOURCE.checkedOn);
      expect(shop.listingConfidence).toBe(tenantById(shop.id)?.confidence);
      expect(shop.unitLabel).toMatch(/Angelo Mall/);
      expect(shop.website === undefined || !shop.website.includes('mallgo')).toBe(true);
    }
  });

  it('never claims a shop is a partner and never claims live fulfilment', () => {
    for (const shop of state.shops) {
      expect(['real-listing', 'demo-scenario', 'paused']).toContain(shop.participation);
      if (shop.participation === 'real-listing') {
        // A listing must not advertise a fulfilment method: that would imply the
        // real business accepts orders from this app.
        expect(shop.fulfilment).toEqual([]);
        expect(shop.deliveryFee).toBe(0);
        expect(shop.prepTimeLabel).toMatch(/not connected/i);
      }
    }
  });

  it('limits the scripted walkthrough to cross-verified tenants', () => {
    const scenarioShops = state.shops.filter((shop) => shop.participation === 'demo-scenario');
    expect(scenarioShops.length).toBeGreaterThanOrEqual(4);
    for (const shop of scenarioShops) {
      expect(tenantById(shop.id)?.confidence, `${shop.id} should be cross-verified`).toBe('cross-verified');
      expect(shop.description).toMatch(/real tenant/i);
      expect(DEMO_SCENARIO_LABEL.length).toBeGreaterThan(0);
    }
    // Every scripted shop must own at least one conversation, and vice versa.
    const conversationShopIds = new Set(state.conversations.map((c) => c.shopId));
    for (const shop of scenarioShops) expect(conversationShopIds.has(shop.id), `${shop.id} has no conversation`).toBe(true);
    for (const shopId of conversationShopIds) {
      expect(scenarioShops.some((s) => s.id === shopId), `${shopId} chats without a demo scenario`).toBe(true);
    }
  });

  it('says inside every scripted shop that the store is not connected', () => {
    const scenarioShops = state.shops.filter((shop) => shop.participation === 'demo-scenario');
    for (const shop of scenarioShops) {
      const conversationIds = new Set(
        state.conversations.filter((c) => c.shopId === shop.id).map((c) => c.id),
      );
      const notices = state.messages.filter(
        (message) => conversationIds.has(message.conversationId) && message.kind === 'system',
      );
      expect(
        notices.some((message) => /simulated|not a mall go partner|no mall go account/i.test(message.text)),
        `${shop.id} needs an honesty notice in its open thread`,
      ).toBe(true);
    }
  });

  it('does not attribute a promotion or offer to a real tenant', () => {
    for (const promotion of state.promotions) {
      expect(promotion.shopId, `${promotion.id} must not belong to a shop`).toBeUndefined();
      expect(promotion.description).toMatch(/placeholder|concept|example/i);
    }
  });

  it('keeps the excluded directory entries out of the app', () => {
    expect(EXCLUDED_LISTINGS.length).toBeGreaterThan(0);
    for (const excluded of EXCLUDED_LISTINGS) {
      const label = excluded.directoryEntry.toLowerCase();
      for (const shop of state.shops) {
        expect(label.includes(shop.name.toLowerCase())).toBe(false);
      }
    }
    expect(state.shops.some((shop) => /betting|tobacco|atm|centre management/i.test(shop.name))).toBe(false);
  });

  it('covers every category the directory filters offer', () => {
    for (const category of CATEGORIES) {
      expect(
        state.shops.some((shop) => shop.category === category.id),
        `${category.id} has no listed shop`,
      ).toBe(true);
    }
  });
});
