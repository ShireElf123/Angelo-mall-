import type { Shop } from '../types';

/**
 * Shop identity lock-up used across the demo directory.
 *
 * Branding honesty: every tenant in this demo is invented, so no shop has a
 * real retailer logo. Instead of imitating a real brand mark we render a
 * generated text wordmark — a monogram tile in the shop's own demo colour plus
 * the shop name set in the app type. If an official, verified logo is supplied
 * later it can replace the monogram without changing any consumers, and the
 * `initials` + `colour` fallback keeps working if the image is unavailable.
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
