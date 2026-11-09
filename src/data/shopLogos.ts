/**
 * Logo registry for the owner-facing demo.
 *
 * Some marks are loaded from direct hosted image URLs so the demo can use real
 * brand artwork without manually downloading every image to a phone. External
 * hosts may change URLs or block embedding; ShopLogo falls back cleanly if that
 * happens. For a production launch, bundle approved files locally instead.
 *
 * Use official brand/media sources when available. Third-party logo-host URLs
 * are explicitly marked and are for this non-transactional visual demo only.
 * Do not imply that any listed retailer endorses or partners with Mall Go.
 */
import type { CategoryId } from '../types';

export type LogoSourceType =
  | 'official-brand-site'
  | 'official-media-kit'
  | 'tenant-supplied'
  | 'third-party-logo-host';

export interface ShopLogoAsset {
  /** Tenant id from `src/data/tenants.ts` — never a new id scheme. */
  shopId: string;
  /** Local public path or direct HTTPS image URL for the complete brand mark. */
  file: string;
  /** Intrinsic width / height of the complete mark. */
  aspectRatio: number;
  /** Accessible name; normally the tenant's display name. */
  alt: string;
  sourceType: LogoSourceType;
  /** Exact page or direct image URL the asset was sourced from. */
  sourceUrl: string;
  /** ISO date the URL was checked against the source. */
  retrievedOn: string;
  /** True only when the image was visually identified as the correct brand mark. */
  verified: boolean;
  /**
   * The artwork is white (or very light) ink, i.e. the negative variant meant
   * for a dark background. On the pale brand tint used by cards it disappears
   * — Ocean Basket and PostNet were rendered as a white wordmark on a wash of
   * near-white, which read as an empty plate. These get a solid plate in the
   * tenant's own colour instead.
   */
  needsLightVariant?: boolean;
  /**
   * The file has an opaque background rather than transparency (a JPEG from an
   * official gallery, or a PNG exported flat). It is printed on a white plate
   * so the box does not show as a rectangle of the wrong colour on the tint.
   */
  opaqueBackground?: boolean;
  /**
   * Optical boost, 1 = trust the aspect-ratio formula. A very wide lock-up
   * (7:1 and beyond) hits the width cap and then renders its own name too small
   * to read, so it is allowed past the normal maximum.
   */
  markScale?: number;
  notes?: string;
}

/**
 * Direct hosted logo URLs. These are not copied into the repository.
 * The remote URL itself is the displayed image source; onError preserves the
 * app's original monogram fallback if a host stops serving it.
 */
export const SHOP_LOGO_ASSETS: Record<string, ShopLogoAsset> = {
  'shop-kfc': {
    shopId: 'shop-kfc',
    file: 'https://cdn.sanity.io/images/kbqq3e0r/production/afcc23c7797d1ad1d55bd0e200e2128cfe163eba-4096x3802.png?q=90&w=640',
    aspectRatio: 1.08,
    alt: 'KFC',
    sourceType: 'official-media-kit',
    sourceUrl: 'https://global.kfc.com/media-assets',
    retrievedOn: '2026-10-27',
    verified: true,
    opaqueBackground: true,
    notes: 'KFC Global brand-assets image URL; usage notice on the source page applies.',
  },
  'shop-golden-buffalo-spur': {
    shopId: 'shop-golden-buffalo-spur',
    file: 'https://cdn.brandfetch.io/idzvBW8J-u/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1732697103583',
    aspectRatio: 2.8,
    alt: 'Spur Steak Ranches',
    sourceType: 'third-party-logo-host',
    sourceUrl: 'https://brandfetch.com/spursteakranches.com',
    retrievedOn: '2026-10-27',
    verified: true,
    notes: 'Brandfetch profile for Spur Steak Ranches; tenant is listed by the mall as Golden Buffalo Spur. Use as the parent-brand mark, not a claim of partnership.',
  },
  'shop-clicks': {
    shopId: 'shop-clicks',
    file: '/images/logos/clicks.png',
    // Use the complete lock-up on every surface. The emblem-only crop was
    // visibly soft at tile size and removed the brand's readable wordmark.
    aspectRatio: 7.9,
    alt: 'Clicks',
    sourceType: 'third-party-logo-host',
    sourceUrl: 'https://tukuz.com/download-logo-vector-3414/',
    retrievedOn: '2026-11-09',
    verified: true,
    // The previous asset was the *corporate* lock-up — "CLICKS GROUP LIMITED",
    // the JSE-listed parent — for a card about the Clicks shop. A shopper reads
    // the unicorn, the blue CLICKS wordmark and the green pharmacy cross; the
    // group's annual-report wordmark is not the shop's brand. Brand colours per
    // the group's own brand sheet: blue #005093, green #84bf41.
    opaqueBackground: true,
    markScale: 1.25,
    notes:
      'Clicks retail mark (unicorn + CLICKS + pharmacy cross). Bundled locally because the only hosted version found was the parent company lock-up. Brand usage is Clicks Group Limited’s; this is a non-transactional visual demo and implies no partnership.',
  },
  'shop-vodacom': {
    shopId: 'shop-vodacom',
    file: 'https://companieslogo.com/img/orig/VOD.JO_BIG-fbad7eb2.png?download=true&t=1720244494',
    aspectRatio: 3.2,
    alt: 'Vodacom',
    sourceType: 'third-party-logo-host',
    sourceUrl: 'https://companieslogo.com/vodacom/logo/',
    retrievedOn: '2026-10-27',
    verified: true,
    notes: 'Direct transparent PNG from a third-party public-company logo host.',
  },
  'shop-nedbank': {
    shopId: 'shop-nedbank',
    file: 'https://companieslogo.com/img/orig/NED.JO-84253744.svg?download=true&t=1720244493',
    aspectRatio: 3.0,
    alt: 'Nedbank',
    sourceType: 'third-party-logo-host',
    sourceUrl: 'https://companieslogo.com/nedbank/logo',
    retrievedOn: '2026-10-27',
    verified: true,
    notes: 'Direct SVG from a third-party public-company logo host.',
  },
  'shop-mtn': {
    shopId: 'shop-mtn',
    file: 'https://companieslogo.com/img/orig/MTN.JO-9d655169.svg?download=true&t=1720244493',
    aspectRatio: 1.25,
    alt: 'MTN',
    sourceType: 'third-party-logo-host',
    sourceUrl: 'https://companieslogo.com/mtn-group/logo',
    retrievedOn: '2026-10-27',
    verified: true,
    notes: 'Direct SVG from a third-party public-company logo host.',
  },
  'shop-mica': {
    shopId: 'shop-mica',
    file: 'https://cdn.brandfetch.io/idHE5CdyLE/w/242/h/119/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1787355725136',
    aspectRatio: 2.03,
    alt: 'Mica Hardware',
    sourceType: 'third-party-logo-host',
    sourceUrl: 'https://brandfetch.com/mica.co.za',
    retrievedOn: '2026-10-27',
    verified: true,
    notes: 'Direct PNG from Brandfetch Mica Hardware brand profile.',
  },
  'shop-pep': {
    shopId: 'shop-pep',
    file: 'https://cdn.brandfetch.io/id9iqV5J-K/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1790018485214',
    aspectRatio: 2.0,
    alt: 'PEP',
    sourceType: 'third-party-logo-host',
    sourceUrl: 'https://brandfetch.com/pepstores.com',
    retrievedOn: '2026-10-27',
    verified: true,
    notes: 'Direct SVG from Brandfetch profile for the South African PEP retailer.',
  },
  'shop-ocean-basket': {
    shopId: 'shop-ocean-basket',
    file: 'https://cdn.brandfetch.io/idMW6HHXX1/theme/light/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1781792048050',
    aspectRatio: 3.0,
    alt: 'Ocean Basket',
    sourceType: 'third-party-logo-host',
    sourceUrl: 'https://brandfetch.com/oceanbasket.com',
    retrievedOn: '2026-10-27',
    verified: true,
    // Served by the host as the white/negative variant; invisible on a tint.
    needsLightVariant: true,
    notes: 'Direct SVG from Brandfetch Ocean Basket brand profile.',
  },
  'shop-postnet': {
    shopId: 'shop-postnet',
    file: 'https://cdn.brandfetch.io/iduP6VYHQ_/theme/light/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1781822850410',
    aspectRatio: 2.5,
    alt: 'PostNet',
    sourceType: 'third-party-logo-host',
    sourceUrl: 'https://brandfetch.com/postnet.co.za',
    retrievedOn: '2026-10-27',
    verified: true,
    // Served by the host as the white/negative variant; invisible on a tint.
    needsLightVariant: true,
    notes: 'Direct SVG from Brandfetch PostNet Southern Africa brand profile.',
  },
  'shop-fnb': {
    shopId: 'shop-fnb',
    file: 'https://cdn.brandfetch.io/idMm5AKGl0/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1668074463386',
    aspectRatio: 2.5,
    alt: 'FNB',
    sourceType: 'third-party-logo-host',
    sourceUrl: 'https://brandfetch.com/fnb.co.za',
    retrievedOn: '2026-10-27',
    verified: true,
    notes: 'Direct SVG from Brandfetch profile for FNB South Africa.',
  },
  'shop-superspar': {
    shopId: 'shop-superspar',
    file: 'https://thespargroup.com/wp-content/uploads/photo-gallery/SUPERSPAR_Horizontal_Logo.jpg',
    aspectRatio: 3.2,
    alt: 'SUPERSPAR',
    sourceType: 'official-brand-site',
    sourceUrl: 'https://thespargroup.com/bwg_gallery/logos/',
    retrievedOn: '2026-10-27',
    verified: true,
    opaqueBackground: true,
    notes: 'Official SPAR Group logo gallery. JPEG rather than transparent PNG.',
  },
  'shop-tops': {
    shopId: 'shop-tops',
    file: 'https://thespargroup.com/wp-content/uploads/photo-gallery/TOPS_at_SPAR_Logo.jpg',
    aspectRatio: 2.0,
    alt: 'TOPS at SPAR',
    sourceType: 'official-brand-site',
    sourceUrl: 'https://thespargroup.com/bwg_gallery/logos/',
    retrievedOn: '2026-10-27',
    verified: true,
    opaqueBackground: true,
    notes: 'Official SPAR Group logo gallery. JPEG rather than transparent PNG.',
  },
};

/** Directory reserved for locally bundled logos if we replace external links. */
export const SHOP_LOGO_DIR = '/images/logos/';

export function shopLogoAsset(shopId: string): ShopLogoAsset | undefined {
  const asset = SHOP_LOGO_ASSETS[shopId];
  return asset && asset.verified ? asset : undefined;
}

export function hasVerifiedLogo(shopId: string): boolean {
  return shopLogoAsset(shopId) !== undefined;
}

/**
 * The widest mark that still reads in a small square, e.g. the 32px box on the
 * narrowest phone surface.
 *
 * A 3.2:1 wordmark squeezed into 32px renders its own name at about four
 * pixels tall: it stops being a brand mark and becomes a smudge that looks like
 * a broken image. Below this ratio the mark is used; above it the caller should
 * fall back to the category glyph or the signage plate, which is legible at
 * that size.
 */
export const SMALL_MARK_MAX_RATIO = 1.8;

/** The mark to show in a small square surface, if the artwork can survive it. */
export function shopMarkForSmallSurface(shopId: string): ShopLogoAsset | undefined {
  const asset = shopLogoAsset(shopId);
  return asset && asset.aspectRatio <= SMALL_MARK_MAX_RATIO ? asset : undefined;
}

/**
 * The widest a mark can be and still read in a directory row's mark slot,
 * which is deliberately wider than it is tall (52x36).
 *
 * PEP (2.0:1), TOPS at SPAR (2.0:1), Mica (2.03:1) and Spur (2.8:1) all have a
 * verified mark, and all of them were being thrown away for a category glyph
 * because the slot used to be a square governed by the 1.8 rule above. In a
 * 52px-wide slot a 2:1 wordmark is 52x26 — small, but a brand, and a brand is
 * the whole point of the plate.
 */
export const ROW_MARK_MAX_RATIO = 3;

/** The mark to show in a directory row's mark slot. */
export function shopMarkForRow(shopId: string): ShopLogoAsset | undefined {
  const asset = shopLogoAsset(shopId);
  return asset && asset.aspectRatio <= ROW_MARK_MAX_RATIO ? asset : undefined;
}

/**
 * Optical width budget for a mark inside a safe area, as a percentage.
 *
 * Equal *visual weight*, not equal box: the width grows with the square root of
 * the mark's own aspect ratio — damped, so a 3.2:1 wordmark earns more width
 * than a 1.08:1 roundel but not three times as much — then a per-asset boost can
 * lift a very wide lock-up that would otherwise hit the cap and render its own
 * name too small to read.
 *
 * Used by both the directory card and the Home tile so the two surfaces cannot
 * drift into sizing the same logo differently.
 */
export function markWidthPercent(asset?: ShopLogoAsset): number {
  const ratio = asset?.aspectRatio ?? 1;
  const budget = 58 * Math.pow(ratio / 2.2, 0.45) * (asset?.markScale ?? 1);
  return Math.round(Math.min(80, Math.max(42, budget)));
}

export const LOGO_COVERAGE = {
  withVerifiedLogo: Object.keys(SHOP_LOGO_ASSETS).filter((id) => hasVerifiedLogo(id)).length,
} as const;

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
