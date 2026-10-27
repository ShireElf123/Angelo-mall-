import { ArrowLeft, Bike, Clock, Globe, MapPin, MessageCircle, Phone, ShoppingBag } from 'lucide-react';
import { ResponsiveImage } from '../../components/ResponsiveImage';
import { HERO_IMAGE_SIZES, webpSrcSetFor } from '../../utils/responsiveImages';
import { categoryLabel } from '../../data/seed';
import { imageSrc } from '../../data/imageAssets';
import type { Route } from '../../router';
import { useDemoStore } from '../../store/DemoStore';
import {
  conversationForShopAndCustomer,
  getShop,
  ordersForConversation,
} from '../../store/selectors';
import { formatZAR, formatRelative } from '../../utils/format';
import { PromotionBanner } from '../../components/PromotionBanner';
import {
  DemoTag,
  EmptyState,
  ParticipationPill,
  StatusPill,
  TradingPill,
  useToast,
} from '../../components/ui';
import { ShopLogo } from '../../components/ShopLogo';

const SUGGESTED_ASKS: Record<string, string[]> = {
  groceries: ['Hi, I need bread, milk, eggs and mince.', 'Do you have chicken braai packs today?', 'What fresh veg arrived this morning?'],
  food: ['What are today’s specials?', 'Please can I order 2 burger meals — one mild, one hot?', 'Do you do family-size portions?'],
  fashion: ['Hi, do you have this style in a medium?', 'What colours do you have in stock?', 'Can you keep an item aside for collection?'],
  electronics: ['Do you have a USB-C fast-charge cable?', 'Which earphones would you recommend under R 500?', 'Can you check stock of a 128 GB memory card?'],
  pharmacy: ['Hi, do you have vitamin D in stock?', 'Please can I order plasters and antiseptic?', 'What do you suggest for dry winter skin?'],
  homeware: ['Do you stock 2-slice toasters?', 'I need winter bedding for a double bed.', 'What storage boxes do you have?'],
  beauty: ['Which shade would suit warm skin tones?', 'Do you have braiding hair in stock?', 'Please can I book/ask about a treatment?'],
  services: ['How much is A4 colour printing per page?', 'Can you print ID photos?', 'Do you laminate documents?'],
};

export function ShopPageScreen({
  shopId,
  navigate,
}: {
  shopId: string;
  navigate: (route: Route) => void;
}) {
  const { state, service } = useDemoStore();
  const { notify } = useToast();
  const shop = getShop(state, shopId);

  if (!shop) {
    return (
      <div className="page">
        <EmptyState
          icon={<ShoppingBag size={30} aria-hidden />}
          title="That shop isn't in the demo directory"
          description="It may have been removed in the admin demo, or the link is out of date."
        >
          <button type="button" className="btn btn--primary" onClick={() => navigate({ name: 'shops' })}>
            Back to the directory
          </button>
        </EmptyState>
      </div>
    );
  }

  const conversation = conversationForShopAndCustomer(state, shop.id);
  const shopOrders = conversation ? ordersForConversation(state, conversation.id).filter((o) => o.status !== 'draft') : [];
  const shopPromos = state.promotions.filter((p) => p.active && p.shopId === shop.id);
  const asks = SUGGESTED_ASKS[shop.category] ?? SUGGESTED_ASKS.groceries;

  const startChat = async (prefilledMessage?: string, fromPromotionId?: string) => {
    const conversationId = await service.openConversation(shop.id);
    if (fromPromotionId) void service.recordPromotionEvent(fromPromotionId, 'conversation-start');
    if (prefilledMessage) {
      await service.sendMessage({ conversationId, sender: 'customer', text: prefilledMessage });
      notify('Message added to your demo chat. Switch to Shop staff (Demo Mode) to reply as the shop.');
    }
    navigate({ name: 'chat', conversationId });
  };

  return (
    <div className="page page--narrow">
      <button type="button" className="back-btn" onClick={() => navigate({ name: 'shops' })}>
        <ArrowLeft size={18} aria-hidden /> All shops
      </button>

      <article className="shop-hero">
        <div className="shop-hero__media">
          <ResponsiveImage
            src={shop.conceptImage ?? shop.coverImage}
            webpSrcSet={webpSrcSetFor(shop.conceptImage ?? shop.coverImage)}
            sizes={HERO_IMAGE_SIZES}
            alt=""
            width={1280}
            height={720}
            fetchPriority="high"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
          <span className="shop-card__media-fallback" style={{ background: shop.colour }} aria-hidden>
            {shop.initials}
          </span>
        </div>
        {shop.conceptImage && (
          <p className="shop-hero__caption">
            <span className="shop-hero__caption-chip">Concept art</span>
            AI-generated concept illustration — not this shop&apos;s logo or shopfront.
          </p>
        )}
        <div className="shop-hero__body">
          <div className="shop-hero__title">
            <div>
              <h1>
                <ShopLogo shop={shop} size="lg" />
              </h1>
              <p>{categoryLabel(shop.category)}</p>
            </div>
            <TradingPill tradingNow={shop.tradingNow} />
          </div>
          <p className="shop-hero__tagline">{shop.tagline}</p>
          <ParticipationPill status={shop.participation} />
          <p>{shop.description}</p>

          <dl className="shop-facts">
            <div>
              <dt>
                <Clock size={15} aria-hidden /> Trading hours
              </dt>
              <dd>{shop.hoursLabel}</dd>
            </div>
            <div>
              <dt>
                <MapPin size={15} aria-hidden /> Shop number
              </dt>
              <dd>{shop.unitLabel}</dd>
            </div>
            {shop.phones && shop.phones.length > 0 && (
              <div>
                <dt>
                  <Phone size={15} aria-hidden /> Shop telephone
                </dt>
                <dd>
                  {shop.phones.map((phone) => (
                    <a key={phone} href={`tel:${phone.replace(/\s+/g, '')}`}>
                      {phone}
                    </a>
                  ))}
                  <small className="shop-facts__note">As listed by the mall directory — call the shop directly.</small>
                </dd>
              </div>
            )}
            {shop.website && (
              <div>
                <dt>
                  <Globe size={15} aria-hidden /> Website
                </dt>
                <dd>
                  <a href={shop.website} target="_blank" rel="noopener noreferrer nofollow">
                    {shop.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                  <small className="shop-facts__note">Published by the mall directory or the business itself.</small>
                </dd>
              </div>
            )}
            <div>
              <dt>
                <Bike size={15} aria-hidden /> Delivery
              </dt>
              <dd>
                {shop.fulfilment.includes('delivery')
                  ? `Local delivery — ${formatZAR(shop.deliveryFee)} fee (demo)`
                  : 'Not offered by this demo shop'}
              </dd>
            </div>
            <div>
              <dt>
                <ShoppingBag size={15} aria-hidden /> Collection
              </dt>
              <dd>{shop.fulfilment.includes('collection') ? shop.prepTimeLabel : 'Not offered by this demo shop'}</dd>
            </div>
          </dl>

          <button type="button" className="btn btn--primary btn--lg btn--block" onClick={() => void startChat()}>
            <MessageCircle size={20} aria-hidden />
            {conversation ? 'Continue the sample chat' : 'Try the sample chat'}
          </button>
          <p className="shop-hero__hint">
            Sample chat only — nothing is sent to {shop.name}. Replies, prices and collection steps are simulated in this
            browser. <DemoTag>Simulated</DemoTag>
          </p>

          <div className="shop-source" aria-label="Listing source">
            <p>
              <strong>Listing source:</strong> The Angelo Mall store directory
              {shop.listingCheckedOn ? ` · checked ${shop.listingCheckedOn}` : ''} ·{' '}
              {shop.listingConfidence === 'cross-verified'
                ? 'cross-checked against the business’s own listing'
                : 'directory entry only — not independently confirmed as current'}
            </p>
            {shop.listingNote && (
              <p>
                <strong>Note:</strong> {shop.listingNote}
              </p>
            )}
            <p>
              The name, shop number, hours and contact details are the mall’s. The category and one-line description are
              our own summary of the business type, not wording supplied by the shop. No logo, photograph or product
              image from any business is used.
            </p>
            <figure className="shop-source__art">
              <img
                src={imageSrc('shop-detail')}
                alt=""
                loading="lazy"
                decoding="async"
                aria-hidden
              />
              <figcaption>
                Illustration of a generic shopfront — deliberately not this shop’s shopfront, signage or branding.
              </figcaption>
            </figure>
          </div>
        </div>
      </article>

      <section className="panel" aria-label="Popular things to ask">
        <h2>Popular things to ask</h2>
        <p className="panel__lede">Tap one to drop it straight into your demo conversation.</p>
        <img
          className="panel__art panel__art--banner"
          src={imageSrc('contact-shop')}
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden
        />
        <div className="ask-chips">
          {asks.map((ask) => (
            <button key={ask} type="button" className="chip chip--button" onClick={() => void startChat(ask)}>
              {ask}
            </button>
          ))}
        </div>
      </section>

      {shopPromos.length > 0 && (
        <section aria-label="Shop promotions">
          <div className="promo-stack">
            {shopPromos.map((promotion) => (
              <PromotionBanner
                key={promotion.id}
                promotion={promotion}
                onOpen={(id) => navigate({ name: 'promotion', promotionId: id })}
                recordEvent={(id, event) => void service.recordPromotionEvent(id, event)}
              />
            ))}
          </div>
        </section>
      )}

      {shopOrders.length > 0 && (
        <section className="panel" aria-label="Your orders with this shop">
          <h2>Your orders with this shop</h2>
          <ul className="mini-order-list">
            {shopOrders.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      order.status === 'awaiting-customer'
                        ? { name: 'basket', orderId: order.id }
                        : { name: 'order', orderId: order.id },
                    )
                  }
                >
                  <span>
                    <strong>{order.ref}</strong>
                    <small>Updated {formatRelative(order.updatedAt)}</small>
                  </span>
                  <StatusPill status={order.status} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
