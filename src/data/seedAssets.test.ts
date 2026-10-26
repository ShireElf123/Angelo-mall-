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

  it('does not repeat a shop image when a distinct category image exists', () => {
    const covers = state.shops.map((shop) => shop.coverImage);
    expect(new Set(covers).size).toBe(covers.length);
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
