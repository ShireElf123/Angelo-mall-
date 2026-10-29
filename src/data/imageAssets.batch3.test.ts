/** @vitest-environment jsdom */
/**
 * Batch 3 guards (shop-discovery artwork).
 *
 * Batch 3 added illustrated "need" shortcuts, the directory's discovery strip
 * and wayfinding banner, the basket and delivery journey strips and the
 * welcome art on the Help install panel. Every asset must stay documented,
 * present and referenced from a real screen.
 */
import { describe, expect, it } from 'vitest';
import { IMAGE_ASSETS, NEED_SHORTCUTS, imageAsset, imageSrc } from './imageAssets';
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
    // Direct `imageSrc('…')` use in a screen, or (for the need tiles) through
    // the exported NEED_SHORTCUTS list that Home renders.
    const direct = SCREEN_SOURCES.some(([, source]) => source.includes(`'${id}'`));
    const viaNeedShortcuts =
      NEED_SHORTCUTS.some((need) => need.art === imageAsset(id).file) &&
      SCREEN_SOURCES.some(([, source]) => source.includes('NEED_SHORTCUTS'));
    expect(direct || viaNeedShortcuts, `nothing renders ${id}`).toBe(true);
  });

  it('maps every need shortcut to a real, filterable category', () => {
    const categoryIds = new Set(CATEGORIES.map((category) => category.id));
    expect(NEED_SHORTCUTS).toHaveLength(5);
    for (const need of NEED_SHORTCUTS) {
      expect(categoryIds.has(need.category)).toBe(true);
      expect(need.label.length).toBeGreaterThan(3);
      expect(need.art).toMatch(/^\/images\/.*\.jpg$/);
      expect(imageSrc(`need-${need.category === 'homeware' ? 'home-hardware' : need.category}`)).toBe(need.art);
    }
  });

  it('keeps the need artwork distinct from the photographic category covers', () => {
    const needFiles = NEED_SHORTCUTS.map((need) => need.art);
    const coverFiles = IMAGE_ASSETS.filter((asset) => asset.id.startsWith('category-')).map((asset) => asset.file);
    for (const file of needFiles) expect(coverFiles).not.toContain(file);
    expect(new Set(needFiles).size).toBe(needFiles.length);
  });

  it('never implies prices, offers or stock in the generated brief', () => {
    // The manifest is the human-readable promise; banned claims must not appear.
    for (const id of BATCH_3_IDS) {
      const { purpose } = imageAsset(id);
      expect(purpose).not.toMatch(/R\d|\bprice\b|\bdiscount\b|\bsale\b|\bguarantee\b/i);
    }
  });
});
