import { describe, expect, it } from 'vitest';
import { CATEGORIES, createSeedState } from './seed';

/**
 * Asset plan guard: every image referenced by demo data must exist locally in
 * `public/`, so a rename or a missing generated file fails the suite instead of
 * shipping a broken card. Uses Vite's glob so no Node filesystem types are needed.
 */
const publicAssets = new Set(
  Object.keys(import.meta.glob(['../../public/images/*', '../../public/*.svg'])).map((filePath) =>
    filePath.replace(/^.*\/public/, ''),
  ),
);

const exists = (assetPath: string) => publicAssets.has(assetPath);

const state = createSeedState();

describe('demo shop asset plan', () => {
  it('points every shop at a local image that exists in public/', () => {
    for (const shop of state.shops) {
      expect(shop.coverImage.startsWith('/images/'), `${shop.name} cover path`).toBe(true);
      expect(exists(shop.coverImage), `${shop.coverImage} missing`).toBe(true);
    }
  });

  it('uses one shared, logo-free category image per category', () => {
    // Phase 4: shops are real tenants and we deliberately ship NO shop
    // photographs or brand logos, so covers are shared category scenes. Guard
    // that a category never mixes images, and that every category has one.
    for (const category of CATEGORIES) {
      const covers = new Set(
        state.shops.filter((shop) => shop.category === category.id).map((shop) => shop.coverImage),
      );
      expect(covers.size, `${category.id} uses more than one cover`).toBeLessThanOrEqual(1);
    }
    const covers = new Set(state.shops.map((shop) => shop.coverImage));
    expect(covers.size).toBeGreaterThanOrEqual(8);
  });

  it('has at least one demo shop per category', () => {
    for (const category of CATEGORIES) {
      expect(
        state.shops.some((shop) => shop.category === category.id),
        `${category.id} has no shop`,
      ).toBe(true);
    }
  });

  it('keeps promo, hero and icon imagery local and present', () => {
    for (const promotion of state.promotions) {
      expect(exists(promotion.image), `${promotion.image} missing`).toBe(true);
    }
    expect(exists('/images/hero-mall.jpg')).toBe(true);
    expect(exists('/icon.svg')).toBe(true);
  });
});
