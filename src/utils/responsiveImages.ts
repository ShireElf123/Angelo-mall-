/**
 * Responsive image helpers (Phase 14).
 *
 * Every tenant concept image is a 1280x720 JPEG of ~170 kB. Cards render it at
 * roughly 340 CSS px and the shop hero at up to 1100 px, so a phone was
 * downloading five times the pixels it could show — which is why the featured
 * cards appeared to "take forever" to load.
 *
 * The optimisation keeps the originals exactly where they are (nothing is
 * overwritten or renamed) and adds WebP derivatives next to them:
 *
 *   /images/tenants/kfc.jpg       1280x720, ~133 kB   (fallback, unchanged)
 *   /images/tenants/kfc-480.webp   480x270,  ~15 kB
 *   /images/tenants/kfc-960.webp   960x540,  ~43 kB
 *   /images/tenants/kfc-1280.webp 1280x720,  ~90 kB
 *
 * Browsers pick a width from `srcSet`; anything without WebP support falls back
 * to the original JPEG carried by the `<img>` element.
 */

/** Widths generated for every tenant concept image, in ascending order. */
export const TENANT_IMAGE_WIDTHS = [480, 960, 1280] as const;

/**
 * How wide the card actually paints, so the browser does not over-fetch.
 * Mirrors `.shop-grid`: 1 column on phones, 2 from 640px, 3 from 1024px inside
 * a 1120px container.
 */
export const CARD_IMAGE_SIZES = '(min-width: 1024px) 360px, (min-width: 640px) 46vw, 92vw';

/** The shop hero spans the page container. */
export const HERO_IMAGE_SIZES = '(min-width: 1180px) 1100px, 100vw';

/** The Home hero artwork, generated at 800 and full width. */
export const HOME_HERO_WIDTHS = [800, 1408] as const;
export const HOME_HERO_SRC = '/images/hero-mall.jpg';
export const HOME_HERO_SRCSET = HOME_HERO_WIDTHS.map(
  (width) => `/images/hero-mall-${width}.webp ${width}w`,
).join(', ');

const TENANT_SOURCE = /^\/images\/(tenants\/[a-z0-9-]+)\.jpg$/;

/**
 * Builds a WebP `srcSet` for a tenant concept image, or `undefined` when the
 * path is not one of the tenant images (for example the shared category cover
 * art, which has no derivatives — emitting a source for it would 404).
 */
export function webpSrcSetFor(src: string, widths: readonly number[] = TENANT_IMAGE_WIDTHS): string | undefined {
  const match = TENANT_SOURCE.exec(src);
  if (!match) return undefined;
  return widths.map((width) => `/images/${match[1]}-${width}.webp ${width}w`).join(', ');
}
