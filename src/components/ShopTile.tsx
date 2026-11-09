import { useState } from 'react';
import type { Shop } from '../types';
import { CATEGORY_MONOGRAM_GLYPH, shopMarkForSmallSurface } from '../data/shopLogos';
import { CategoryGlyph } from './ShopLogo';
import { Check, Info } from 'lucide-react';

/**
 * Shops as tappable app surfaces, in two shapes.
 *
 * The shapes are not decoration: they are the promise. A card in the grid only
 * ever appears for a shop whose sample chat is open, so every tap in the grid
 * starts a conversation; the list below the grid only ever contains directory
 * listings with no Mall Go connection, and every tap there opens the shop's
 * information page. That is why the two are separate components with separate
 * labels rather than one component with a flag — a caller cannot accidentally
 * put a listing-only shop in the chat grid, or a chat shop in the list.
 *
 * `ShopTile` is deliberately not `ShopCard` — that card leads with a 16:9
 * concept photo, a category line, a tagline, opening hours and an "Open shop"
 * button, which is right for the directory but pushes the actual shop mark and
 * name too far down to scan. A launcher tile is a square mark, a name, and what
 * happens when you tap it.
 *
 * The mark is the shop's **verified brand logo** where one exists; otherwise a
 * **category glyph on the tenant's own colour** — a clean, category-aware
 * fallback rather than a photo of a generic shop or a bare set of initials.
 * Both are decorative: the name beside the mark is the accessible label.
 */

/** The logo or category glyph for a shop, sized by its container. Decorative. */
function ShopMark({ shop }: { shop: Shop }) {
  // Small square surface: only a near-square mark survives at this size. A wide
  // wordmark here rendered its own name about four pixels tall, which reads as
  // a broken image rather than a brand, so those shops keep the glyph.
  const asset = shopMarkForSmallSurface(shop.id);
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = asset && !logoFailed;

  return (
    <span
      className="shop-tile__mark"
      /* The fallback is a tint of the tenant's own colour with the glyph in
         the full colour, not a solid block of it. A wall of saturated squares
         was the heaviest thing on the first screen; a tinted icon reads like
         an app icon on a white card, which is what the reference grid does,
         and it still tells the shops apart at a glance. */
      style={
        showLogo
          ? undefined
          : {
              background: `${shop.colour}14`,
              borderColor: `${shop.colour}33`,
              color: shop.colour,
            }
      }
    >
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
  );
}

/**
 * A shop whose sample chat is open. Tapping it starts that chat — there is no
 * other outcome, so the card states exactly one thing.
 */
export function ShopTile({ shop, onOpen }: { shop: Shop; onOpen: (shop: Shop) => void }) {
  return (
    <button
      type="button"
      className="shop-tile"
      onClick={() => onOpen(shop)}
      // One accessible name for the whole card, spelling out which action it
      // performs — a screen reader should not have to infer it from two spans.
      aria-label={`Open the sample chat with ${shop.name}`}
    >
      <ShopMark shop={shop} />
      <span className="shop-tile__name">{shop.name}</span>
      <span className="shop-tile__meta shop-tile__meta--chat">Sample chat</span>
      {/* The reference badges every card in its row with a solid green circle.
          Ours carries the same fact the caption says: this shop's sample chat
          is open. */}
      <span className="shop-tile__badge" aria-hidden>
        <Check size={13} strokeWidth={3} />
      </span>
    </button>
  );
}

/**
 * A directory listing with no Mall Go connection.
 *
 * Drawn as a full-width row rather than a card, so the shape itself says "this
 * is a different kind of thing" before the caption is read — the difference
 * between a chat and a page should not rest on a 12px icon. The caption says
 * what the tap does; it never says "no chat", because the information page it
 * opens offers a clearly labelled scripted sample chat.
 */
export function ShopRow({ shop, onOpen }: { shop: Shop; onOpen: (shop: Shop) => void }) {
  return (
    <button
      type="button"
      className="shop-row"
      onClick={() => onOpen(shop)}
      aria-label={`${shop.name} — opens shop information`}
    >
      <ShopMark shop={shop} />
      <span className="shop-row__text">
        <strong>{shop.name}</strong>
        <small>Opens shop information</small>
      </span>
      <span className="shop-row__badge" aria-hidden>
        <Info size={14} strokeWidth={2.6} />
      </span>
    </button>
  );
}
