/** @vitest-environment jsdom */
/**
 * Batch 5 guards (state coverage).
 *
 * Batch 5 was chosen from a UI gap audit rather than a theme: cancelled and
 * collection orders, the confirmed-basket dead end, the shop's all-clear and
 * empty order board, the shop-side empty thread, the two empty delivery tabs,
 * and the two admin empty states that previously had none.
 */
import { describe, expect, it } from 'vitest';
import { IMAGE_ASSETS, imageAsset } from './imageAssets';

const BATCH_5_IDS = [
  'order-cancelled',
  'order-collection',
  'state-basket-confirmed',
  'shop-all-caught-up',
  'shop-orders-empty',
  'shop-thread-empty',
  'delivery-mine-empty',
  'delivery-done-empty',
  'admin-promotions-empty',
  'admin-deliveries-empty',
] as const;

const PUBLIC_FILES = new Set(
  Object.keys(import.meta.glob(['../../public/**/*', '../../public/*', '../../public/*.svg'])).map((filePath) =>
    filePath.replace(/^.*\/public/, ''),
  ),
);

const SCREEN_SOURCES = Object.entries(
  import.meta.glob(['../screens/**/*.tsx', '../components/*.tsx', '!../**/*.test.tsx'], {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>,
);

describe('batch 5 image assets', () => {
  it('records exactly ten new assets for batch 5', () => {
    const batch = IMAGE_ASSETS.filter((asset) => asset.batch === 5);
    expect(batch).toHaveLength(10);
    expect(batch.map((asset) => asset.id).sort()).toEqual([...BATCH_5_IDS].sort());
  });

  it('keeps the whole inventory at 63 documented assets', () => {
    expect(IMAGE_ASSETS).toHaveLength(63);
  });

  it.each(BATCH_5_IDS)('%s is approved, on disk and documented as a gap fix', (id) => {
    const asset = imageAsset(id);
    expect(asset.approved).toBe(true);
    expect(asset.review).toBe('approved');
    expect(asset.kind).toBe('generated');
    expect(asset.batch).toBe(5);
    expect(PUBLIC_FILES.has(asset.file)).toBe(true);
    expect(asset.dimensions).toBe('1280x720 (16:9)');
    expect(asset.sizeKb).toBeGreaterThan(10);
    expect(asset.sizeKb).toBeLessThan(160);
    expect(asset.gapAddressed?.length ?? 0).toBeGreaterThan(20);
  });

  it.each(BATCH_5_IDS)('%s is referenced by a screen or component', (id) => {
    const referenced = SCREEN_SOURCES.some(([, source]) => source.includes(`'${id}'`));
    expect(referenced, `nothing renders ${id}`).toBe(true);
  });

  it('never reuses earlier artwork for a batch 5 asset', () => {
    const batch5Files = BATCH_5_IDS.map((id) => imageAsset(id).file);
    const earlier = IMAGE_ASSETS.filter((asset) => asset.batch !== 5).map((asset) => asset.file);
    for (const file of batch5Files) expect(earlier).not.toContain(file);
    expect(new Set(batch5Files).size).toBe(10);
  });

  it('keeps the offline and not-found favourites wired rather than orphaned', () => {
    // These two existed since batch 1/2 but had no consumer before batch 5.
    const all = SCREEN_SOURCES.map(([, source]) => source).join('\n');
    expect(all).toContain("'state-offline'");
    expect(all).toContain("'state-not-found'");
  });

  it('does not imply real fulfilment in the new purposes', () => {
    for (const id of BATCH_5_IDS) {
      const { purpose, gapAddressed } = imageAsset(id);
      const text = `${purpose} ${gapAddressed ?? ''}`;
      expect(text).not.toMatch(/R\d|\bprice\b|\bdiscount\b|\bsale\b|\bguaranteed\b|\breal delivery\b/i);
    }
  });
});
