import { describe, expect, it } from 'vitest';
import { CATEGORY_MONOGRAM_GLYPH, LOGO_COVERAGE, SHOP_LOGO_ASSETS, hasVerifiedLogo, shopLogoAsset } from './shopLogos';
import { TENANTS } from './tenants';

/**
 * Logo-registry guard (Phase 5).
 *
 * The registry is intentionally allowed to be empty — bundling an unverified
 * brand mark is worse than a clean wordmark. What these tests enforce is that
 * anything added to it is real: a file that exists, a source URL, a retrieval
 * date, an explicit verification flag and a sane aspect ratio.
 */
const PUBLIC_FILES = new Set(
  Object.keys(import.meta.glob('../../public/**/*')).map((p) => p.replace(/^.*\/public/, '')),
);

describe('shop logo registry', () => {
  it('never exposes an unverified asset to the UI', () => {
    for (const [shopId, asset] of Object.entries(SHOP_LOGO_ASSETS)) {
      if (!asset.verified) {
        expect(shopLogoAsset(shopId), `${shopId} is unverified but is served`).toBeUndefined();
        expect(hasVerifiedLogo(shopId)).toBe(false);
      }
    }
  });

  it('points every configured logo at a real local file', () => {
    for (const asset of Object.values(SHOP_LOGO_ASSETS)) {
      expect(PUBLIC_FILES.has(asset.file), `${asset.file} missing from public/`).toBe(true);
      expect(asset.file.startsWith('/images/logos/'), `${asset.file} must live in the logo folder`).toBe(true);
      expect(asset.file).toMatch(/\.(svg|png)$/);
    }
  });

  it('records provenance for every configured logo', () => {
    for (const asset of Object.values(SHOP_LOGO_ASSETS)) {
      expect(asset.sourceUrl).toMatch(/^https:\/\//);
      expect(asset.retrievedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['official-brand-site', 'official-media-kit', 'tenant-supplied']).toContain(asset.sourceType);
      expect(asset.aspectRatio).toBeGreaterThan(0.3);
      expect(asset.aspectRatio).toBeLessThan(4.5);
      expect(asset.alt.length).toBeGreaterThan(1);
    }
  });

  it('only references tenant ids that exist in the directory', () => {
    const tenantIds = new Set(TENANTS.map((tenant) => tenant.id));
    for (const asset of Object.values(SHOP_LOGO_ASSETS)) {
      expect(tenantIds.has(asset.shopId), `${asset.shopId} is not a tenant`).toBe(true);
      expect(asset.alt.length).toBeGreaterThan(0);
    }
    // Key and payload must agree, so a rename cannot desynchronise them.
    for (const [key, asset] of Object.entries(SHOP_LOGO_ASSETS)) {
      expect(asset.shopId).toBe(key);
    }
  });

  it('reports coverage that matches the registry', () => {
    const verified = Object.values(SHOP_LOGO_ASSETS).filter((asset) => asset.verified).length;
    expect(LOGO_COVERAGE.withVerifiedLogo).toBe(verified);
  });
});

describe('monogram fallback coverage', () => {
  it('gives every tenant a readable fallback', () => {
    for (const tenant of TENANTS) {
      expect(tenant.initials.trim().length, `${tenant.id} initials`).toBeGreaterThan(0);
      expect(tenant.initials.length, `${tenant.id} initials too long for a tile`).toBeLessThanOrEqual(4);
      expect(tenant.name.trim().length, `${tenant.id} name`).toBeGreaterThan(0);
      expect(tenant.colour, `${tenant.id} colour`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('has a category glyph for every category in use', () => {
    for (const tenant of TENANTS) {
      expect(CATEGORY_MONOGRAM_GLYPH[tenant.category], `${tenant.category} has no glyph`).toBeTruthy();
    }
  });

  it('does not give two tenants in the same category the same initials and colour', () => {
    const keys = new Set<string>();
    for (const tenant of TENANTS) {
      const key = `${tenant.category}:${tenant.initials}:${tenant.colour}`;
      // Identical identity would make two cards indistinguishable in a list.
      expect(keys.has(key), `${tenant.id} duplicates another card identity`).toBe(false);
      keys.add(key);
    }
  });
});
