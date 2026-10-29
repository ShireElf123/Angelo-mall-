import { describe, expect, it } from 'vitest';
import template from '../../docs/tenant-onboarding-template.md?raw';
import { createSeedState } from './seed';

/**
 * Keeps the onboarding record in sync with the tenant data: every shop must have
 * an editable row, each row must record its provenance, and the doc must keep
 * stating that a listing is not a partnership.
 */
describe('tenant onboarding template', () => {
  const state = createSeedState();

  it('has exactly one onboarding row per demo shop', () => {
    for (const shop of state.shops) {
      const occurrences = template.split(`\`${shop.id}\``).length - 1;
      expect(occurrences, `${shop.id} missing from the onboarding table`).toBeGreaterThanOrEqual(1);
    }
    const rowCount = template
      .split('\n')
      .filter((line) => line.startsWith('| `shop-')).length;
    expect(rowCount).toBe(state.shops.length);
  });

  it('marks every row logo-free and provenance-tagged', () => {
    const rows = template.split('\n').filter((line) => line.startsWith('| `shop-'));
    for (const row of rows) {
      expect(row).toContain('wordmark-only');
      expect(row).toMatch(/cross-verified|directory-only/);
    }
    // The doc must never present a listing as a partnership.
    expect(template).toMatch(/not a partner/i);
    expect(template).not.toMatch(/\*\*fictional demo tenant\*\*/i);
  });

  it('documents the minimum information needed from the mall', () => {
    expect(template).toMatch(/Minimum information required from the mall/);
    for (const required of [
      'Trading name',
      'Category',
      'Written permission',
      'Approved logo file',
      'Image permission',
      'Confirmed shop number',
    ]) {
      expect(template).toContain(required);
    }
  });

  it('points at the directory record that explains provenance', () => {
    expect(template).toMatch(/angelomall\.co\.za/);
    expect(template).toMatch(/2026-10-26/);
  });
});
