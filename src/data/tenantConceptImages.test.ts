/**
 * Per-tenant concept-art guard (batch 7 onward).
 *
 * Concept illustrations are app artwork that sits in a shop-page hero. They are
 * explicitly NOT logos: this suite pins that down so a future edit cannot quietly
 * promote concept art into the verified-logo registry, ship an undocumented file,
 * or drop the fallback for tenants that have no art yet.
 */
import { describe, expect, it } from 'vitest';
import { IMAGE_ASSETS } from './imageAssets';
import { SHOP_LOGO_ASSETS, SHOP_LOGO_DIR, LOGO_COVERAGE } from './shopLogos';
import { TENANTS } from './tenants';

const PUBLIC_FILES = new Set(
  Object.keys(import.meta.glob(['../../public/**/*', '../../public/*', '../../public/*.svg'])).map((filePath) =>
    filePath.replace(/^.*\/public/, ''),
  ),
);

const exists = (file: string) => PUBLIC_FILES.has(file);

const CONCEPT_ASSETS = IMAGE_ASSETS.filter((asset) => asset.usage === 'shop-concept');
const BATCH_7 = IMAGE_ASSETS.filter((asset) => asset.batch === 7);
const BATCH_8 = IMAGE_ASSETS.filter((asset) => asset.batch === 8);

describe('tenant concept illustrations', () => {
  it('ships the documented concept images, ten per approved batch', () => {
    expect(BATCH_7).toHaveLength(10);
    expect(BATCH_8).toHaveLength(10);
    expect(CONCEPT_ASSETS).toHaveLength(BATCH_7.length + BATCH_8.length);
    for (const asset of CONCEPT_ASSETS) {
      expect(asset.kind, `${asset.id} kind`).toBe('generated');
      expect(asset.usage, `${asset.id} usage`).toBe('shop-concept');
      expect(asset.review, `${asset.id} review`).toBe('approved');
      expect(asset.screens, `${asset.id} screens`).toEqual(['shop-page']);
      expect(asset.dimensions, `${asset.id} dimensions`).toBe('1280x720 (16:9)');
      expect(asset.file.startsWith('/images/tenants/'), `${asset.id} lives in the tenant folder`).toBe(true);
      expect(exists(asset.file), `${asset.id} -> ${asset.file} is missing from public/`).toBe(true);
      expect(asset.sizeKb ?? 0, `${asset.id} size recorded`).toBeGreaterThan(0);
    }
  });

  it('maps every concept file to an existing tenant that actually uses it', () => {
    for (const asset of CONCEPT_ASSETS) {
      const slug = asset.id.replace(/^tenant-/, '');
      const tenant = TENANTS.find((candidate) => candidate.id === `shop-${slug}`);
      expect(tenant, `${asset.id} has no matching tenant id`).toBeTruthy();
      expect(tenant?.conceptImage, `${asset.id} is documented but not wired into tenants.ts`).toBe(asset.file);
    }
  });

  it('never lets a tenant point at an undocumented concept file', () => {
    const documented = new Set(CONCEPT_ASSETS.map((asset) => asset.file));
    for (const tenant of TENANTS) {
      if (!tenant.conceptImage) continue;
      expect(documented.has(tenant.conceptImage), `${tenant.id} uses an undocumented concept file`).toBe(true);
      expect(exists(tenant.conceptImage), `${tenant.id} concept file is missing`).toBe(true);
    }
  });

  it('keeps concept art out of the verified-logo registry', () => {
    // The logo registry is still empty; if that ever changes, no entry may point
    // at tenant concept art or be marked verified without a recorded source.
    expect(LOGO_COVERAGE.withVerifiedLogo).toBe(
      Object.values(SHOP_LOGO_ASSETS).filter((asset) => asset.verified).length,
    );
    for (const [shopId, asset] of Object.entries(SHOP_LOGO_ASSETS)) {
      // A logo is either a bundled file in the logo folder or a direct hosted
      // brand URL. Anything else (concept art, a category cover) is not a logo.
      const bundled = asset.file.startsWith(SHOP_LOGO_DIR);
      const hosted = /^https:\/\//.test(asset.file);
      expect(bundled || hosted, `${shopId} logo must be bundled or hosted`).toBe(true);
      expect(asset.file.includes('/images/tenants/'), `${shopId} logo must not be concept art`).toBe(false);
      expect(asset.file.includes('/images/shop-'), `${shopId} logo must not be a category cover`).toBe(false);
      // Provenance is mandatory either way.
      expect(asset.sourceUrl, `${shopId} source`).toMatch(/^https:\/\//);
      expect(asset.retrievedOn, `${shopId} retrieval date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    const conceptFiles = new Set(IMAGE_ASSETS.filter((a) => a.usage === 'shop-concept').map((a) => a.file));
    for (const asset of IMAGE_ASSETS) {
      if (asset.kind !== 'verified-logo') continue;
      expect(conceptFiles.has(asset.file), `${asset.id} is concept art but claims to be a logo`).toBe(false);
    }
  });

  it('states in the manifest that concept art is not a brand asset', () => {
    for (const asset of CONCEPT_ASSETS) {
      expect(asset.notes ?? '', `${asset.id} notes`).toMatch(/not a logo/i);
      expect(asset.notes ?? '', `${asset.id} notes`).toMatch(/AI-generated concept imagery/i);
         // Batch 7 is illustrated, batch 8 is photographic-style; both are concepts.
      expect(asset.purpose, `${asset.id} purpose`).toMatch(/listing hero|concept illustration/i);
    }
  });

  it('keeps the category-cover fallback for tenants without concept art', () => {
    const withoutArt = TENANTS.filter((tenant) => !tenant.conceptImage);
    expect(withoutArt.length).toBe(TENANTS.length - CONCEPT_ASSETS.length);
    for (const tenant of withoutArt) {
      expect(tenant.coverImage, `${tenant.id} fallback cover`).toMatch(/^\/images\/shop-[a-z]+\.jpg$/);
      expect(exists(tenant.coverImage), `${tenant.id} fallback cover is missing`).toBe(true);
    }
  });
});
