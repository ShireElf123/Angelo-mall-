import { useState } from 'react';
import type { Shop } from '../types';
import { CATEGORY_MONOGRAM_GLYPH, shopLogoAsset } from '../data/shopLogos';
import { CategoryGlyph } from './ShopLogo';

/**
 * A shop as a large, tappable app tile.
 *
 * This is the primary action on Home: open the app, see shops, tap one, start
 * talking. It is deliberately not `ShopCard` — that card leads with a 16:9
 * concept photo, a category line, a tagline, opening hours and an "Open shop"
 * button, which is right for the directory but pushes the actual shop mark and
 * name too far down to scan. A launcher tile is a square mark, a name, and what
 * happens when you tap it.
 *
 * The mark is the shop's **verified brand logo** where one exists; otherwise a
 * **category glyph on the tenant's own colour** — a clean, category-aware
 * fallback rather than a photo of a generic shop or a bare set of initials.
 * Both are decorative: the name below the mark is the accessible label.
 *
 * Chat is not implied. `supportsChat` is passed in by the caller from the real
 * participation data, and the tile states plainly which shops can be chatted
 * with in this demo. A listing-only tenant must never look like an open line.
 */
export function ShopTile({
  shop,
  supportsChat,
  onOpen,
}: {
  shop: Shop;
  /** True only when this tenant has a seeded demo conversation. */
  supportsChat: boolean;
  onOpen: (shop: Shop) => void;
}) {
  const asset = shopLogoAsset(shop.id);
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = asset && !logoFailed;

  return (
    <button
      type="button"
      className="shop-tile"
      onClick={() => onOpen(shop)}
      // One accessible name for the whole tile, spelling out which action it
      // performs — a screen reader should not have to infer it from two spans.
      aria-label={
        supportsChat ? `Open the sample chat with ${shop.name}` : `${shop.name} — shop information`
      }
    >
      <span className="shop-tile__mark" style={showLogo ? undefined : { background: shop.colour }}>
        {showLogo ? (
          <img
            className="shop-tile__logo"
            src={asset.file}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <svg
            className={`shop-tile__glyph shop-tile__glyph--${CATEGORY_MONOGRAM_GLYPH[shop.category]}`}
            viewBox="0 0 24 24"
            aria-hidden
            focusable="false"
          >
            <CategoryGlyph category={shop.category} />
          </svg>
        )}
      </span>
      <span className="shop-tile__name">{shop.name}</span>
      {/* Both labels describe what the tap does, not what the shop is. A
          listing-only tenant opens its information page, which offers a clearly
          labelled scripted sample chat — so "No chat yet" here would be untrue,
          and "Chat" would promise a line that is not open. */}
      <span className={`shop-tile__meta ${supportsChat ? 'shop-tile__meta--chat' : ''}`}>
        {supportsChat ? 'Sample chat' : 'View info'}
      </span>
    </button>
  );
}
