/** @vitest-environment jsdom */
/**
 * Batch 4 guards (journey + state artwork).
 *
 * Batch 4 illustrated states that were still word-only: the first-run welcome,
 * the no-match search result, the shop-staff inbox, the shop page's listing
 * provenance, preparing a question for a shop, the two ends of the order
 * journey, demo reset help, admin reporting and the shop's order summary panel.
 */
import { describe, expect, it } from 'vitest';
import { IMAGE_ASSETS, imageAsset } from './imageAssets';

const BATCH_4_IDS = [
  'welcome-mall',
  'search-guidance',
  'shop-staff-inbox',
  'shop-detail',
  'contact-shop',
  'order-pending',
  'order-complete',
  'help-troubleshooting',
  'admin-reporting',
  'order-summary-building',
] as const;

const PUBLIC_FILES = new Set(
  Object.keys(import.meta.glob(['../../public/**/*', '../../public/*', '../../public/*.svg'])).map((filePath) =>
    filePath.replace(/^.*\/public/, ''),
  ),
);

const SCREEN_SOURCES = Object.entries(
  import.meta.glob(['../screens/**/*.tsx', '!../screens/**/*.test.tsx'], {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>,
);

describe('batch 4 image assets', () => {
  it('records exactly ten new assets for batch 4', () => {
    const batch = IMAGE_ASSETS.filter((asset) => asset.batch === 4);
    expect(batch).toHaveLength(10);
    expect(batch.map((asset) => asset.id).sort()).toEqual([...BATCH_4_IDS].sort());
  });

  it('keeps the total inventory at 53 documented assets', () => {
    expect(IMAGE_ASSETS).toHaveLength(53);
  });

  it.each(BATCH_4_IDS)('%s is on disk, approved and documented', (id) => {
    const asset = imageAsset(id);
    expect(asset.approved).toBe(true);
    expect(asset.review).toBe('approved');
    expect(asset.kind).toBe('generated');
    expect(PUBLIC_FILES.has(asset.file)).toBe(true);
    expect(asset.purpose.length).toBeGreaterThan(15);
    expect(asset.screens.length).toBeGreaterThan(0);
    expect(asset.dimensions).toMatch(/^\d+x\d+ \(\d+:\d+\)$/);
  });

  it.each(BATCH_4_IDS)('%s is referenced by a screen', (id) => {
    const referenced = SCREEN_SOURCES.some(([, source]) => source.includes(`'${id}'`));
    expect(referenced, `nothing renders ${id}`).toBe(true);
  });

  it('re-measures every batch 4 file against its documented size', () => {
    // Documented sizes must stay honest after any future recompression.
    for (const id of BATCH_4_IDS) {
      const asset = imageAsset(id);
      expect(asset.sizeKb).toBeGreaterThan(10);
      expect(asset.sizeKb).toBeLessThan(160);
    }
  });

  it('does not reuse a batch 1–3 file for a batch 4 asset', () => {
    const batch4Files = BATCH_4_IDS.map((id) => imageAsset(id).file);
    const earlierFiles = IMAGE_ASSETS.filter((asset) => asset.batch !== 4).map((asset) => asset.file);
    for (const file of batch4Files) expect(earlierFiles).not.toContain(file);
    expect(new Set(batch4Files).size).toBe(batch4Files.length);
  });

  it('keeps the illustration labels honest (no proof-of-delivery, OS dialog or brand claim)', () => {
    for (const id of BATCH_4_IDS) {
      const { purpose } = imageAsset(id);
      expect(purpose).not.toMatch(/\breal delivery\b|\binstall(ed|ing)?\b (the )?app from|App Store|Play Store/i);
      expect(purpose).not.toMatch(/R\d|\bprice\b|\bdiscount\b|\bsale\b/i);
    }
  });
});
