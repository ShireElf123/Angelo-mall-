import { useId, useState } from 'react';
import type { Shop } from '../types';
import { CATEGORY_MONOGRAM_GLYPH, shopLogoAsset } from '../data/shopLogos';

/**
 * Shop identity lock-up used across the demo directory.
 *
 * Two layers, in this order:
 * 1. A **verified official logo** (`src/data/shopLogos.ts`) when the tenant has
 *    one that was retrieved from an official source. The image is bundled
 *    locally, sized from its intrinsic aspect ratio (no layout shift) and
 *    removed from the accessibility tree; the shop name carries the label.
 * 2. A **generated monogram tile** otherwise: initials in the shop's colour plus
 *    a category glyph. This is app artwork, not a brand mark, and it is what the
 *    entire directory currently uses (see the registry for why).
 *
 * If a logo file fails to load, the component silently falls back to the
 * monogram — a broken-image icon must never reach the UI.
 */
export function ShopLogo({
  shop,
  size = 'md',
  onDark = false,
  showGlyph = true,
}: {
  shop: Shop;
  size?: 'sm' | 'md' | 'lg';
  onDark?: boolean;
  /** Hide the category glyph on the smallest surfaces (e.g. dense lists). */
  showGlyph?: boolean;
}) {
  const asset = shopLogoAsset(shop.id);
  const [logoFailed, setLogoFailed] = useState(false);
  const glyphId = useId();
  const useFallback = !asset || logoFailed;

  return (
    <span className={`shop-logo shop-logo--${size} ${onDark ? 'shop-logo--on-dark' : ''}`.trim()}>
      {useFallback ? (
        <span
          className={`shop-logo__monogram shop-logo__monogram--${CATEGORY_MONOGRAM_GLYPH[shop.category]}`}
          style={{ background: shop.colour }}
          aria-hidden
        >
          <span className="shop-logo__initials">{shop.initials}</span>
          {showGlyph && size !== 'sm' && (
            <svg className="shop-logo__glyph" viewBox="0 0 24 24" aria-hidden focusable="false">
              <defs>
                <clipPath id={glyphId}>
                  <rect width="24" height="24" />
                </clipPath>
              </defs>
              <CategoryGlyph category={shop.category} />
            </svg>
          )}
        </span>
      ) : (
        <img
          className="shop-logo__image"
          src={asset.file}
          alt=""
          width={Math.round(40 * asset.aspectRatio)}
          height={40}
          loading="lazy"
          decoding="async"
          style={{ aspectRatio: `${asset.aspectRatio}` }}
          onError={() => setLogoFailed(true)}
        />
      )}
      <span className="shop-logo__word">{shop.name}</span>
    </span>
  );
}

/** Original, geometric category glyphs (24×24, stroke-based). */
function CategoryGlyph({ category }: { category: Shop['category'] }) {
  switch (CATEGORY_MONOGRAM_GLYPH[category]) {
    case 'basket':
      return (
        <>
          <path d="M4 9h16l-1.6 9.2a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8L4 9Z" />
          <path d="M9 9 12 4l3 5" />
        </>
      );
    case 'cutlery':
      return (
        <>
          <path d="M7 3v8a2 2 0 0 0 4 0V3" />
          <path d="M9 11v10" />
          <path d="M16 3c2 1.5 2 4 2 6s-1 3-2 3v9" />
        </>
      );
    case 'hanger':
      return (
        <>
          <path d="M12 8a2.5 2.5 0 1 1 2.5-2.5" />
          <path d="M12 8 3.5 14.5a1.5 1.5 0 0 0 .9 2.7h15.2a1.5 1.5 0 0 0 .9-2.7L12 8Z" />
        </>
      );
    case 'device':
      return (
        <>
          <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
          <path d="M10.5 18.5h3" />
        </>
      );
    case 'cross':
      return (
        <>
          <path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5V3Z" />
        </>
      );
    case 'tools':
      return (
        <>
          <path d="M14.5 3.5a4.5 4.5 0 0 0-4 6.6L3.8 16.8a2 2 0 0 0 2.8 2.8l6.7-6.7a4.5 4.5 0 0 0 6.6-4l-3 3-2.8-2.8 3-3a4.5 4.5 0 0 0-2.6-2.6Z" />
        </>
      );
    case 'scissors':
      return (
        <>
          <circle cx="6.5" cy="17.5" r="2.5" />
          <circle cx="17.5" cy="17.5" r="2.5" />
          <path d="M8.4 15.6 18 3M15.6 15.6 6 3" />
        </>
      );
    case 'parcel':
      return (
        <>
          <path d="M3.5 8.5 12 3l8.5 5.5v7L12 21l-8.5-5.5v-7Z" />
          <path d="M3.5 8.5 12 14l8.5-5.5M12 14v7" />
        </>
      );
    case 'bank':
      return (
        <>
          <path d="M3 10 12 4l9 6" />
          <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" />
          <path d="M3 21h18" />
        </>
      );
    default:
      return null;
  }
}
