/**
 * Verified shop-logo registry.
 *
 * WHY THIS IS EMPTY RIGHT NOW (Phase 5 finding, 2026-10-27)
 * ---------------------------------------------------------
 * No real retailer logo is bundled, because none could be retrieved and verified
 * from an official source inside this build environment: outbound network access
 * is restricted to a small allowlist (GitHub, npm, PyPI), so brand websites and
 * their official media kits could not be downloaded. Adding a logo from an
 * image-search thumbnail, a third-party logo library or a screenshot would breach
 * the project rule "no unverified third-party image presented as an official
 * asset", so nothing was added.
 *
 * The wiring below is ready: drop a verified file into `public/images/logos/`,
 * add one entry here, and every surface (shop card, shop page, chat header,
 * admin lists) picks it up with no other change.
 *
 * RULES FOR ADDING AN ENTRY
 * 1. The file must come from the brand's own website, official media/press kit,
 *    or the tenant themselves (with written permission).
 * 2. It must be recorded in `docs/image-asset-manifest.md` with source URL,
 *    retrieval date and verification status.
 * 3. Never trace, redraw, recolour or AI-generate a brand mark, and never use a
 *    screenshot of a shopfront as a logo.
 * 4. Keep the asset small (SVG preferred; PNG <= 24 kB) and transparent.
 */
import type { CategoryId } from '../types';

export type LogoSourceType = 'official-brand-site' | 'official-media-kit' | 'tenant-supplied';

export interface ShopLogoAsset {
  /** Tenant id from `src/data/tenants.ts` — never a new id scheme. */
  shopId: string;
  /** Path under `public/`, e.g. `/images/logos/shop-kfc.svg`. */
  file: string;
  /** Intrinsic width / height, used to reserve space and avoid layout shift. */
  aspectRatio: number;
  /** Accessible name; normally the tenant's display name. */
  alt: string;
  sourceType: LogoSourceType;
  /** Exact page the file was downloaded from. */
  sourceUrl: string;
  /** ISO date the asset was retrieved and compared with the brand's own usage. */
  retrievedOn: string;
  /** True only when the mark was confirmed to belong to this brand at source. */
  verified: boolean;
  /** Marks that must be inverted when rendered on a dark surface. */
  needsLightVariant?: boolean;
  notes?: string;
}

/**
 * tenantId -> verified logo asset. Empty by design: see the note above.
 * Tests assert that every entry points at a real file and that every tenant has
 * a readable fallback, so adding an entry is safe but cannot be done silently.
 */
export const SHOP_LOGO_ASSETS: Record<string, ShopLogoAsset> = {};

/** Directory reserved for verified assets (created on first use). */
export const SHOP_LOGO_DIR = '/images/logos/';

export function shopLogoAsset(shopId: string): ShopLogoAsset | undefined {
  const asset = SHOP_LOGO_ASSETS[shopId];
  return asset && asset.verified ? asset : undefined;
}

export function hasVerifiedLogo(shopId: string): boolean {
  return shopLogoAsset(shopId) !== undefined;
}

/** Counts used by docs/tests so the inventory cannot drift from reality. */
export const LOGO_COVERAGE = {
  withVerifiedLogo: Object.keys(SHOP_LOGO_ASSETS).filter((id) => hasVerifiedLogo(id)).length,
} as const;

/**
 * Category glyph used by the monogram fallback, so a shop without a verified
 * logo still reads as "a hardware shop" rather than an anonymous initial.
 * These are original app glyphs, not brand marks.
 */
export const CATEGORY_MONOGRAM_GLYPH: Record<CategoryId, string> = {
  groceries: 'basket',
  food: 'cutlery',
  fashion: 'hanger',
  electronics: 'device',
  pharmacy: 'cross',
  homeware: 'tools',
  beauty: 'scissors',
  services: 'parcel',
  finance: 'bank',
};
