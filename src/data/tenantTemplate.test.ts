import { describe, expect, it } from 'vitest';
import template from '../../docs/tenant-onboarding-template.md?raw';
import { createSeedState } from './seed';

/**
 * Keeps the onboarding record in sync with the demo data: every shop must have
 * an editable row, and the doc must keep stating that all shops are fictional.
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

  it('still marks every row as fictional and logo-free', () => {
    const rows = template.split('\n').filter((line) => line.startsWith('| `shop-'));
    for (const row of rows) {
      expect(row).toContain('wordmark-only');
      expect(row).toContain('fictional');
    }
    expect(template).toMatch(/fictional demo tenant/i);
  });

  it('documents the minimum information needed from the mall', () => {
    expect(template).toMatch(/Minimum information required from the mall/);
    for (const required of ['Trading name', 'Category', 'Written permission', 'Approved logo file', 'Image permission']) {
      expect(template).toContain(required);
    }
  });
});
