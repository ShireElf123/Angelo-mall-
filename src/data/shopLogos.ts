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
  /** Local public path or direct HTTPS image URL. */
  file: string;
  /** Intrinsic width / height, used to reserve space and avoid layout shift. */
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
  needsLightVariant?: boolean;
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
    notes: 'KFC Global brand-assets image URL; usage notice on the source page applies.',
  },
  'shop-clicks': {
    shopId: 'shop-clicks',
    file: 'https://companieslogo.com/img/orig/CLS.JO_BIG-e435f2e6.svg?download=true&t=1720244491',
    aspectRatio: 3.2,
    alt: 'Clicks',
    sourceType: 'third-party-logo-host',
    sourceUrl: 'https://companieslogo.com/clicks-group/logo',
    retrievedOn: '2026-10-27',
    verified: true,
    notes: 'Third-party public-company logo host; brand is Clicks Group / Clicks retail.',
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
