import { useEffect, useRef } from 'react';
import { ArrowRight, Megaphone } from 'lucide-react';
import type { Promotion } from '../types';
import { SponsoredTag } from './ui';

/**
 * Restrained promotional placement. Records one demo impression per mount and
 * a click on tap; Phase 2 replaces these counters with backend attribution
 * (impressions → clicks → conversation starts → attributed orders).
 */
export function PromotionBanner({
  promotion,
  onOpen,
  recordEvent,
}: {
  promotion: Promotion;
  onOpen: (promotionId: string) => void;
  recordEvent: (promotionId: string, event: 'impression' | 'click') => void;
}) {
  const recorded = useRef(false);

  useEffect(() => {
    if (!recorded.current) {
      recorded.current = true;
      recordEvent(promotion.id, 'impression');
    }
  }, [promotion.id, recordEvent]);

  return (
    <article className="promo-banner">
      <img
        src={promotion.image}
        alt=""
        loading="lazy"
        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
      />
      <div className="promo-banner__shade" aria-hidden />
      <div className="promo-banner__content">
        {promotion.sponsored ? (
          <SponsoredTag />
        ) : (
          <span className="promo-banner__kicker">
            <Megaphone size={13} aria-hidden /> Mall Go notice · demo content
          </span>
        )}
        <h3>{promotion.title}</h3>
        <p>{promotion.description}</p>
        <button
          type="button"
          className="btn btn--gold btn--sm"
          onClick={() => {
            recordEvent(promotion.id, 'click');
            onOpen(promotion.id);
          }}
        >
          View promotion <ArrowRight size={16} aria-hidden />
        </button>
      </div>
    </article>
  );
}
