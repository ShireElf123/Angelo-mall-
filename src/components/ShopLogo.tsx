import type { Shop } from '../types';

/**
 * Shop identity lock-up used across the demo directory.
 *
 * Branding honesty: the tenants are now real Angelo Mall businesses, but we do
 * not bundle or imitate any retailer logo. Every shop renders a generated text
 * wordmark — a monogram tile in an app-chosen colour plus the business name set
 * in the app type. These are labels, not official brand marks. If a tenant
 * supplies an official logo file with permission it can replace the monogram
 * without changing any consumers, and the `initials` + `colour` fallback keeps
 * working if an image is unavailable.
 */
export function ShopLogo({
  shop,
  size = 'md',
  onDark = false,
}: {
  shop: Shop;
  size?: 'sm' | 'md' | 'lg';
  onDark?: boolean;
}) {
  return (
    <span className={`shop-logo shop-logo--${size} ${onDark ? 'shop-logo--on-dark' : ''}`.trim()}>
      <span className="shop-logo__monogram" style={{ background: shop.colour }} aria-hidden>
        {shop.initials}
      </span>
      <span className="shop-logo__word">{shop.name}</span>
    </span>
  );
}
