/** @vitest-environment jsdom */
/**
 * Batch 3 guards (shop-discovery artwork).
 *
 * Batch 3 added category illustrations, the directory's discovery strip and
 * wayfinding banner, the basket and delivery journey strips and the welcome
 * art on the Help install panel. Every asset must stay documented, present and
 * referenced from a real screen.
 */
import { describe, expect, it } from 'vitest';
import { IMAGE_ASSETS, imageAsset } from './imageAssets';
import { CATEGORIES } from './seed';

const BATCH_3_IDS = [
  'discover-shops',
  'need-food',
  'need-fashion',
  'need-electronics',
  'need-beauty',
  'need-home-hardware',
  'journey-navigation',
  'journey-basket',
  'journey-delivery',
  'intro-mall-go',
] as const;

const PUBLIC_FILES = new Set(
  Object.keys(import.meta.glob(['../../public/**/*', '../../public/*', '../../public/*.svg'])).map((filePath) =>
    filePath.replace(/^.*\/public/, ''),
  ),
);

/** Screen sources only — data modules and tests don't count as an integration. */
const SCREEN_SOURCES = Object.entries(
  import.meta.glob(['../screens/**/*.tsx', '!../screens/**/*.test.tsx'], {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>,
);

describe('batch 3 image assets', () => {
  it('documents exactly the ten planned assets', () => {
    const batch = IMAGE_ASSETS.filter((asset) => asset.batch === 3);
    expect(batch.map((asset) => asset.id).sort()).toEqual([...BATCH_3_IDS].sort());
  });

  it.each(BATCH_3_IDS)('%s is on disk, approved and documented', (id) => {
    const asset = imageAsset(id);
    expect(asset.approved).toBe(true);
    expect(asset.review).toBe('approved');
    expect(asset.kind).toBe('generated');
    expect(PUBLIC_FILES.has(asset.file)).toBe(true);
    expect(asset.purpose.length).toBeGreaterThan(10);
    expect(asset.screens.length).toBeGreaterThan(0);
    expect(asset.batch).toBe(3);
  });

  it.each(BATCH_3_IDS)('%s is reachable from a screen', (id) => {
    // Category illustrations are referenced by their canonical image path
    // from Home's category-icon map rather than by manifest identifier.
    const direct = SCREEN_SOURCES.some(([, source]) => source.includes(`'${id}'`));
    const filePath = SCREEN_SOURCES.some(([, source]) => source.includes(imageAsset(id).file));
    expect(direct || filePath, `nothing renders ${id}`).toBe(true);
  });

  it('maps the five illustrated category assets to real Home categories', () => {
    const categoryIds = new Set(CATEGORIES.map((category) => category.id));
    const mapping = [
      ['food', 'need-food', '/images/category-food.jpg'],
      ['fashion', 'need-fashion', '/images/category-fashion.jpg'],
      ['electronics', 'need-electronics', '/images/category-electronics.jpg'],
      ['beauty', 'need-beauty', '/images/category-beauty.jpg'],
      ['homeware', 'need-home-hardware', '/images/category-home-hardware.jpg'],
    ] as const;

    for (const [categoryId, assetId, file] of mapping) {
      expect(categoryIds.has(categoryId)).toBe(true);
      expect(imageAsset(assetId).file).toBe(file);
      expect(SCREEN_SOURCES.some(([, source]) => source.includes(file))).toBe(true);
    }
    expect(new Set(mapping.map(([, , file]) => file)).size).toBe(mapping.length);
  });

  it('never implies prices, offers or stock in the generated brief', () => {
    // The manifest is the human-readable promise; banned claims must not appear.
    for (const id of BATCH_3_IDS) {
      const { purpose } = imageAsset(id);
      expect(purpose).not.toMatch(/R\d|\bprice\b|\bdiscount\b|\bsale\b|\bguarantee\b/i);
    }
  });
});
