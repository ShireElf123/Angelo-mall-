import { useState } from 'react';
import { ArrowRight, Bike, Clock, ShoppingBag, Star } from 'lucide-react';
import { categoryLabel } from '../data/seed';
import { markWidthPercent, shopLogoAsset } from '../data/shopLogos';
import type { Shop } from '../types';
import { formatZAR } from '../utils/format';
import { ParticipationPill, SponsoredTag, TradingPill } from './ui';
import { CategoryGlyph } from './ShopLogo';

/**
 * Tenant card.
 *
 * The card is read in one pass, top to bottom: **brand plate** → category →
 * name → trading state → what the shop is → the demo facts → the disclosure →
 * action.
 *
 * ## Why the top of the card is a brand plate, not a photograph
 *
 * Every card used to open with a 16:9 interior shot. In a directory of 29 shops
 * that is eight photos reused across 29 tenants, and the ones that were not
 * reused were AI concept art carrying a "Concept art" chip — so the largest,
 * loudest part of every card was the part that was least true, and two shops in
 * the same category still looked alike. A brand mark is the opposite: it is
 * real, it is the tenant's own, and it is what a customer actually recognises
 * across a shopfront, a carrier bag and a phone.
 *
 * So the media frame is now a full-bleed **brand plate**: the tenant's verified
 * logo on a wash of the tenant's own colour, or — where we have no verified
 * mark — a signage plate with their trade name set in caps and a category
 * glyph. 13 of the 29 tenants have a verified logo; the other 16 are the reason
 * the signage plate exists, so a missing file can never read as broken data.
 *
 * ## Why the marks are sized per logo, not to one box
 *
 * Logos arrive in wildly different shapes (SUPERSPAR 3.2:1, KFC 1.08:1). Fitting
 * all of them to the same width makes square marks balloon and wide wordmarks
 * dominate; fitting them all to the same height does the reverse. Each mark is
 * therefore given an equal *visual budget* inside a safe area, with its width
 * cap moved by the square root of its own aspect ratio — the standard optical
 * normalisation for a mixed logo wall. Wide marks get more width, compact marks
 * bind on height, and the row reads as one weight at a glance.
 *
 * JPEG-sourced marks (the SPAR group files) have an opaque white background, so
 * they get a white plate of their own instead of sitting on the tint.
 *
 * ## The body
 *
 * The plate carries the identity, so the body no longer repeats the logo beside
 * the name: it is text from the name down. The action stays a filled forest
 * pill rather than a hairline row, because a card has one obvious thing to do
 * and a quiet row read as a label.
 */
export function ShopCard({
  shop,
  sponsored = false,
  onOpen,
}: {
  shop: Shop;
  sponsored?: boolean;
  onOpen: (shopId: string) => void;
}) {
  const logo = shopLogoAsset(shop.id);
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(logo) && !logoFailed;

  /**
   * Equal visual budget, adjusted for shape: `58 * (ratio / 2.2) ^ 0.45`,
   * clamped to 42–80% of the safe area, times an optional per-asset boost.
   * A 3.2:1 wordmark gets ~69% of the width, a 1.08:1 roundel ~42% and binds on
   * height instead. The exponent is damped the way an optical logo wall dampens
   * it — wide marks earn more width, but not linearly, so they stop dominating.
   */
  const markWidth = `${markWidthPercent(logo)}%`;

  // An opaque file (JPEG from an official gallery, or a flat PNG) is printed on
  // a white plate so the box does not show as a rectangle of the wrong colour.
  const opaqueMark = Boolean(logo?.opaqueBackground);
  // White-ink artwork needs a dark bed: the pale tint made Ocean Basket and
  // PostNet look like empty plates.
  const solidPlate = Boolean(logo?.needsLightVariant);

  return (
    <article className="shop-card">
      <button
        type="button"
        className={`shop-card__media shop-card__media--brand ${showLogo ? 'is-mark' : 'is-sign'} ${
          showLogo && solidPlate ? 'is-solid' : ''
        }`}
        onClick={() => onOpen(shop.id)}
        aria-label={`Open ${shop.name}`}
        style={
          {
            ['--plate-tint' as string]: `${shop.colour}1a`,
            ['--plate-tint-strong' as string]: `${shop.colour}26`,
            ['--plate-solid' as string]: shop.colour,
          } as React.CSSProperties
        }
      >
        {showLogo ? (
          <span
            className={`shop-card__mark-wrap ${opaqueMark ? 'shop-card__mark-wrap--printed' : ''}`}
            style={{ ['--mark-width' as string]: markWidth }}
          >
            {/* Decorative: the shop name in the body is the accessible name. */}
            <img
              className="shop-card__mark"
              src={logo!.file}
              alt=""
              width={Math.round(48 * logo!.aspectRatio)}
              height={48}
              loading="lazy"
              decoding="async"
              style={{ aspectRatio: `${logo!.aspectRatio}` }}
              onError={() => setLogoFailed(true)}
            />
          </span>
        ) : (
          /* No verified mark: a fascia, not a hole. The trade name is set in
             caps on the tenant's own colour — the same signage idea the rest of
             the app uses where a logo is unavailable — so the plate still
             identifies the shop at a glance and never looks like missing data. */
          <span className="shop-card__sign" style={{ color: shop.colour }}>
            <svg className="shop-card__sign-glyph" viewBox="0 0 24 24" aria-hidden focusable="false">
              <CategoryGlyph category={shop.category} />
            </svg>
            <span className="shop-card__sign-word">{shop.name}</span>
          </span>
        )}
        {shop.featured && (
          <span className="featured-ribbon">
            <Star size={13} aria-hidden /> Featured
          </span>
        )}
      </button>
      <div className="shop-card__body">
        {sponsored && <SponsoredTag />}
        <p className="shop-card__category">{categoryLabel(shop.category)}</p>
        <div className="shop-card__brand">
          <h3 className="shop-card__titles">{shop.name}</h3>
          <TradingPill tradingNow={shop.tradingNow} />
        </div>
        <p className="shop-card__tagline">{shop.tagline}</p>
        <div className="shop-card__meta">
          {shop.participation === 'demo-scenario' ? (
            <>
              <span>
                <Clock size={14} aria-hidden /> {shop.prepTimeLabel}
              </span>
              {shop.fulfilment.includes('delivery') && (
                <span>
                  <Bike size={14} aria-hidden /> Sample delivery fee {formatZAR(shop.deliveryFee)}
                </span>
              )}
              {shop.fulfilment.includes('collection') && (
                <span>
                  <ShoppingBag size={14} aria-hidden /> Collection (simulated)
                </span>
              )}
            </>
          ) : (
            <>
              {shop.shopNumber && (
                <span>
                  <ShoppingBag size={14} aria-hidden /> Shop {shop.shopNumber}
                </span>
              )}
              <span>
                <Clock size={14} aria-hidden /> {shop.hoursLabel}
              </span>
            </>
          )}
        </div>
        <ParticipationPill status={shop.participation} />
        <button
          type="button"
          className="btn btn--primary btn--block shop-card__cta"
          onClick={() => onOpen(shop.id)}
        >
          Open shop <ArrowRight size={17} aria-hidden />
        </button>
      </div>
    </article>
  );
}
