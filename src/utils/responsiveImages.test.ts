import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CARD_IMAGE_SIZES,
  HOME_HERO_SRC,
  HOME_HERO_SRCSET,
  TENANT_IMAGE_WIDTHS,
  webpSrcSetFor,
} from './responsiveImages';

/**
 * Image delivery contract (Phase 14).
 *
 * A `srcSet` is only worth having if the files it names actually exist, are
 * genuinely lighter than the JPEG fallback, and are real WebP. Referencing a
 * derivative that was never generated produces a card that silently falls back
 * to a 170 kB JPEG — which is exactly the slow load this phase set out to fix.
 * These assertions read the filesystem so the claim is checked, not assumed.
 */

const TENANT_DIR = join(process.cwd(), 'public', 'images', 'tenants');

const tenantSlugs = readdirSync(TENANT_DIR)
  .filter((name) => name.endsWith('.jpg'))
  .map((name) => name.replace(/\.jpg$/, ''));

/** Width/height of a PNG or WebP is not needed here; the RIFF container is enough. */
function isWebp(path: string): boolean {
  const header = readFileSync(path).subarray(0, 12);
  return header.subarray(0, 4).toString('ascii') === 'RIFF' && header.subarray(8, 12).toString('ascii') === 'WEBP';
}

describe('tenant image derivatives', () => {
  it('finds all 29 tenant JPEGs to optimise', () => {
    expect(tenantSlugs.length).toBe(29);
  });

  it('has a valid, lighter WebP for every width of every tenant image', () => {
    for (const slug of tenantSlugs) {
      const original = statSync(join(TENANT_DIR, `${slug}.jpg`)).size;
      for (const width of TENANT_IMAGE_WIDTHS) {
        const file = join(TENANT_DIR, `${slug}-${width}.webp`);
        const size = statSync(file).size;
        expect(isWebp(file), `${slug}-${width}.webp is not a WebP file`).toBe(true);
        expect(size, `${slug}-${width}.webp is not smaller than the JPEG`).toBeLessThan(original);
      }
    }
  });

  it('keeps the smallest card variant dramatically lighter than the JPEG', () => {
    // The card paints ~340 CSS px, so the 480w file is what most phones fetch.
    // If this ever regresses to JPEG-sized files the slow load comes back.
    for (const slug of tenantSlugs) {
      const original = statSync(join(TENANT_DIR, `${slug}.jpg`)).size;
      const small = statSync(join(TENANT_DIR, `${slug}-480.webp`)).size;
      expect(small).toBeLessThan(original * 0.3);
    }
  });

  it('never overwrites the original JPEG the fallback depends on', () => {
    for (const slug of tenantSlugs) {
      expect(isWebp(join(TENANT_DIR, `${slug}.jpg`))).toBe(false);
    }
  });
});

describe('srcSet construction', () => {
  it('names every generated width in ascending order', () => {
    expect(webpSrcSetFor('/images/tenants/kfc.jpg')).toBe(
      '/images/tenants/kfc-480.webp 480w, /images/tenants/kfc-960.webp 960w, /images/tenants/kfc-1280.webp 1280w',
    );
  });

  it('emits nothing for shared category art that has no derivatives', () => {
    // Category covers are 8 shared illustrations with no generated variants;
    // a source pointing at a missing file would break the card outright.
    expect(webpSrcSetFor('/images/category-food.jpg')).toBeUndefined();
    expect(webpSrcSetFor('/images/hero-mall.jpg')).toBeUndefined();
  });

  it('describes how wide a card paints so the browser stops over-fetching', () => {
    expect(CARD_IMAGE_SIZES).toContain('360px');
    expect(CARD_IMAGE_SIZES).toContain('92vw');
  });
});

describe('Home hero', () => {
  it('offers an 800w variant for phones on top of the 1408w original', () => {
    expect(HOME_HERO_SRC).toBe('/images/hero-mall.jpg');
    expect(HOME_HERO_SRCSET).toBe('/images/hero-mall-800.webp 800w, /images/hero-mall-1408.webp 1408w');
  });

  it('has both hero derivatives on disk and lighter than the JPEG', () => {
    const dir = join(process.cwd(), 'public', 'images');
    const original = statSync(join(dir, 'hero-mall.jpg')).size;
    for (const width of [800, 1408]) {
      const file = join(dir, `hero-mall-${width}.webp`);
      expect(isWebp(file)).toBe(true);
      expect(statSync(file).size).toBeLessThan(original);
    }
  });
});
