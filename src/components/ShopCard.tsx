import { ArrowRight, Bike, Clock, ShoppingBag, Star } from 'lucide-react';
import { categoryLabel } from '../data/seed';
import type { Shop } from '../types';
import { formatZAR } from '../utils/format';
import { ParticipationPill, SponsoredTag, TradingPill } from './ui';
import { ShopLogo } from './ShopLogo';
import { ResponsiveImage } from './ResponsiveImage';
import { CARD_IMAGE_SIZES, webpSrcSetFor } from '../utils/responsiveImages';

export function ShopCard({
  shop,
  sponsored = false,
  onOpen,
}: {
  shop: Shop;
  sponsored?: boolean;
  onOpen: (shopId: string) => void;
}) {
  // The tenant's own researched interior stands in for the shared category
  // illustration. Cards used to show `coverImage` for all 29 tenants, so a
  // directory full of different shops showed the same eight pictures and every
  // concept-image batch looked like it had changed nothing. `coverImage` stays
  // as the fallback for a tenant with no concept art yet.
  const media = shop.conceptImage ?? shop.coverImage;

  return (
    <article className="shop-card">
      <button type="button" className="shop-card__media" onClick={() => onOpen(shop.id)} aria-label={`Open ${shop.name}`}>
        {/* Decorative: the shop wordmark below is the accessible name. */}
        <ResponsiveImage
          src={media}
          webpSrcSet={webpSrcSetFor(media)}
          sizes={CARD_IMAGE_SIZES}
          alt=""
          width={1280}
          height={720}
          loading="lazy"
          decoding="async"
          onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
        />
        <span className="shop-card__media-fallback" style={{ background: shop.colour }} aria-hidden>
          {shop.initials}
        </span>
        {/* Same disclosure as the shop page: AI concept art, never a shopfront photo. */}
        {shop.conceptImage && <span className="shop-card__concept-chip">Concept art</span>}
        {shop.featured && (
          <span className="featured-ribbon">
            <Star size={13} aria-hidden /> Featured
          </span>
        )}
      </button>
      <div className="shop-card__body">
        {sponsored && <SponsoredTag />}
        <div className="shop-card__brand">
          <h3 className="shop-card__titles">
            <ShopLogo shop={shop} size="sm" />
          </h3>
          <TradingPill tradingNow={shop.tradingNow} />
        </div>
        <p className="shop-card__category">{categoryLabel(shop.category)}</p>
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
        <button type="button" className="btn btn--primary btn--block" onClick={() => onOpen(shop.id)}>
          Open shop <ArrowRight size={17} aria-hidden />
        </button>
      </div>
    </article>
  );
}
