import { ArrowRight, Bike, Clock, ShoppingBag, Star } from 'lucide-react';
import { categoryLabel } from '../data/seed';
import type { Shop } from '../types';
import { formatZAR } from '../utils/format';
import { ParticipationPill, ShopAvatar, SponsoredTag, TradingPill } from './ui';

export function ShopCard({
  shop,
  sponsored = false,
  onOpen,
}: {
  shop: Shop;
  sponsored?: boolean;
  onOpen: (shopId: string) => void;
}) {
  return (
    <article className="shop-card">
      <button type="button" className="shop-card__media" onClick={() => onOpen(shop.id)} aria-label={`Open ${shop.name}`}>
        <img src={shop.coverImage} alt="" loading="lazy" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
        <span className="shop-card__media-fallback" style={{ background: shop.colour }} aria-hidden>
          {shop.initials}
        </span>
        {shop.featured && (
          <span className="featured-ribbon">
            <Star size={13} aria-hidden /> Featured
          </span>
        )}
      </button>
      <div className="shop-card__body">
        {sponsored && <SponsoredTag />}
        <div className="shop-card__title-row">
          <ShopAvatar shop={shop} size="sm" />
          <div className="shop-card__titles">
            <h3>{shop.name}</h3>
            <p>{categoryLabel(shop.category)}</p>
          </div>
          <TradingPill tradingNow={shop.tradingNow} />
        </div>
        <p className="shop-card__tagline">{shop.tagline}</p>
        <div className="shop-card__meta">
          <span>
            <Clock size={14} aria-hidden /> {shop.prepTimeLabel}
          </span>
          {shop.fulfilment.includes('delivery') && (
            <span>
              <Bike size={14} aria-hidden /> Delivery {formatZAR(shop.deliveryFee)} (demo)
            </span>
          )}
          {shop.fulfilment.includes('collection') && (
            <span>
              <ShoppingBag size={14} aria-hidden /> Collection
            </span>
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
