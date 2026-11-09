import { useState } from 'react';
import { Info, MessageCircle } from 'lucide-react';
import type { Shop } from '../types';
import { CATEGORY_MONOGRAM_GLYPH, markWidthPercent, shopLogoAsset, shopMarkForRow } from '../data/shopLogos';
import { categoryLabel } from '../data/seed';
import { CategoryGlyph } from './ShopLogo';

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
 * ## Why the card leads with a brand band
 *
 * The first version was a 32px mark beside two lines of text. Measured on a
 * phone, that put a 32px chip in a 173px card — a sixth of the width — and only
 * logos that were nearly square survived in it, so a row of eight shops showed
 * two real brand marks and six grey category glyphs. It read as a list of
 * chats, not as a mall.
 *
 * A card now opens with a full-width band of the tenant's own colour carrying
 * their mark, the way every launcher on a phone does. A wide band is what makes
 * a wide wordmark possible at this size: SUPERSPAR's 3.2:1 lock-up gets the
 * whole width instead of being squeezed into a square. Marks are still sized to
 * an equal visual budget (see `markWidthPercent`), opaque files are printed on
 * white, and a tenant with no verified mark gets a signage band with its trade
 * name — never an empty frame.
 */
export function ShopTile({ shop, onOpen }: { shop: Shop; onOpen: (shop: Shop) => void }) {
  const logo = shopLogoAsset(shop.id);
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(logo) && !logoFailed;
  const printed = Boolean(logo?.opaqueBackground);
  const solid = Boolean(logo?.needsLightVariant);

  return (
    <button
      type="button"
      className="shop-tile"
      onClick={() => onOpen(shop)}
      // One accessible name for the whole card, spelling out which action it
      // performs — a screen reader should not have to infer it from two spans.
      aria-label={`Open the sample chat with ${shop.name}`}
    >
      <span
        className={`shop-tile__mark ${solid ? 'is-solid' : 'is-tinted'}`}
        style={
          {
            ['--plate-tint' as string]: `${shop.colour}1a`,
            ['--plate-solid' as string]: shop.colour,
          } as React.CSSProperties
        }
      >
        {showLogo ? (
          <span
            className={`shop-tile__mark-inner ${printed ? 'is-printed' : ''}`}
            style={{ ['--mark-width' as string]: `${markWidthPercent(logo)}%` }}
          >
            <img
              className="shop-tile__logo"
              src={logo!.file}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setLogoFailed(true)}
            />
          </span>
        ) : (
          /* No verified mark: a fascia, not a hole — the trade name in caps on
             the tenant's own colour, the same signage idea the shop page uses. */
          <span className="shop-tile__sign">
            <svg className="shop-tile__success" viewBox="0 0 24 24" aria-hidden focusable="false">
              <CategoryGlyph category={shop.category} />
            </svg>
            <span className="shop-tile__sign-word">{shop.name}</span>
          </span>
        )}
        {/* A chat bubble in the band's corner: this is the one thing a tap on a
            card does, and it is the only chat mark on the screen — said once,
            as an affordance, instead of "Sample chat" repeated on every card. */}
        <span className="shop-tile__badge" aria-hidden>
          <MessageCircle size={13} strokeWidth={2.6} />
        </span>
      </span>
      <span className="shop-tile__body">
        <span className="shop-tile__name">{shop.name}</span>
        {/* The shop's own facts, not the app's: what kind of shop it is and
            whether it is trading in the demo. Two cards in a row used to read
            "Sample chat / Sample chat", which made a mall look like an inbox. */}
        <span className="shop-tile__meta">
          {categoryLabel(shop.category)} · {shop.tradingNow ? 'Open now' : 'Closed'}
        </span>
      </span>
    </button>
  );
}

/**
 * A directory listing with no Mall Go connection.
 *
 * Drawn as a full-width row rather than a card, so the shape itself says "this
 * is a different kind of thing" before the caption is read. The mark slot is
 * wider than it is tall, because these tenants' marks are wordmarks — a square
 * slot forced PEP and Mica back to a category glyph even though their logo is
 * in the registry, which is what made half the directory look unbranded.
 */
export function ShopRow({ shop, onOpen }: { shop: Shop; onOpen: (shop: Shop) => void }) {
  const logo = shopMarkForRow(shop.id);
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(logo) && !logoFailed;
  const printed = Boolean(logo?.opaqueBackground);

  return (
    <button
      type="button"
      className="shop-row"
      onClick={() => onOpen(shop)}
      aria-label={`${shop.name} — opens shop information`}
    >
      <span
        className="shop-row__mark"
        style={{ background: `${shop.colour}14`, borderColor: `${shop.colour}26` }}
      >
        {showLogo ? (
          <img
            className={`shop-row__logo ${printed ? 'is-printed' : ''}`}
            src={logo!.file}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <svg
            className="shop-row__glyph"
            viewBox="0 0 24 24"
            aria-hidden
            focusable="false"
            style={{ color: shop.colour }}
          >
            <CategoryGlyph category={shop.category} />
          </svg>
        )}
      </span>
      <span className="shop-row__text">
        <strong>{shop.name}</strong>
        <small>{categoryLabel(shop.category)}</small>
      </span>
      <span className="shop-row__badge" aria-hidden>
        <Info size={14} strokeWidth={2.6} />
      </span>
    </button>
  );
}
