import { useMemo, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Bike,
  ClipboardList,
  MessagesSquare,
  Search,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES } from '../../data/seed';
import type { Route } from '../../router';
import { useDemoStore } from '../../store/DemoStore';
import {
  activePromotions,
  conversationsForCustomer,
  getShop,
  lastMessage,
  ordersForCustomer,
} from '../../store/selectors';
import { formatRelative } from '../../utils/format';
import { isConfirmedOrder } from '../../utils/orderWorkflow';
import { PromotionBanner } from '../../components/PromotionBanner';
import { ShopCard } from '../../components/ShopCard';
import { DemoTag, SectionHeader, ShopAvatar, StatusPill } from '../../components/ui';

const CATEGORY_ICONS: Record<string, string> = {
  groceries: '/images/shop-grocery.jpg',
  food: '/images/shop-food.jpg',
  fashion: '/images/shop-fashion.jpg',
  electronics: '/images/shop-electronics.jpg',
  pharmacy: '/images/shop-pharmacy.jpg',
  homeware: '/images/shop-homeware.jpg',
  beauty: '/images/shop-pharmacy.jpg',
  services: '/images/shop-electronics.jpg',
};

export function HomeScreen({ navigate }: { navigate: (route: Route) => void }) {
  const { state, service } = useDemoStore();
  const [query, setQuery] = useState('');

  const featured = state.shops.filter((s) => s.featured);
  const promos = activePromotions(state, 'home-banner');
  const conversations = conversationsForCustomer(state).slice(0, 3);
  const activeOrders = ordersForCustomer(state).filter(
    (o) => isConfirmedOrder(o) && !['delivered', 'completed'].includes(o.status),
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return state.shops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }, [query, state.shops]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate({ name: 'shops', q: query.trim() || undefined });
  };

  return (
    <div className="page">
      <section className="hero">
        <img src="/images/hero-mall.jpg" alt="" className="hero__img" />
        <div className="hero__shade" aria-hidden />
        <div className="hero__content">
          <span className="hero__kicker">
            <Sparkles size={14} aria-hidden /> Angelo Mall · Nigel · concept demo
          </span>
          <h1>Chat to mall shops. Order without the catalogue hunt.</h1>
          <p>
            Message a participating shop, ask about sizes, stock and prices, and confirm a priced summary — for local
            delivery or collection.
          </p>
          <form className="hero__search" onSubmit={submitSearch} role="search">
            <Search size={20} aria-hidden />
            <label className="visually-hidden" htmlFor="home-search">
              Search shops or things you need
            </label>
            <input
              id="home-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shops — try “groceries”, “burgers” or “cable”…"
              autoComplete="off"
            />
            <button type="submit" className="btn btn--gold">
              Search
            </button>
          </form>
          {query.trim() && (
            <div className="hero__results" aria-live="polite">
              {searchResults.length === 0 ? (
                <p>No demo shops match “{query}”. Try a category below, or browse all shops — in chat you can ask for almost anything.</p>
              ) : (
                <ul>
                  {searchResults.map((shop) => (
                    <li key={shop.id}>
                      <button type="button" onClick={() => navigate({ name: 'shop', shopId: shop.id })}>
                        <ShopAvatar shop={shop} size="sm" />
                        <span>
                          <strong>{shop.name}</strong>
                          <small>{shop.tagline}</small>
                        </span>
                        <ArrowRight size={16} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="hero__actions">
            <button type="button" className="btn btn--light" onClick={() => navigate({ name: 'shops' })}>
              Browse all shops
            </button>
            <button type="button" className="btn btn--outline-light" onClick={() => navigate({ name: 'help' })}>
              How chat ordering works
            </button>
          </div>
        </div>
      </section>

      {activeOrders.length > 0 && (
        <section aria-label="Your active demo orders">
          <SectionHeader
            title="Your active orders"
            subtitle="Demo orders in progress right now."
            action={
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate({ name: 'orders' })}>
                Order history <ArrowRight size={15} aria-hidden />
              </button>
            }
          />
          <div className="active-order-strip">
            {activeOrders.map((order) => {
              const shop = getShop(state, order.shopId);
              return (
                <button
                  key={order.id}
                  type="button"
                  className="active-order-card"
                  onClick={() => navigate({ name: 'order', orderId: order.id })}
                >
                  {shop && <ShopAvatar shop={shop} />}
                  <span className="active-order-card__text">
                    <strong>
                      {order.ref} · {shop?.name ?? 'Shop'}
                    </strong>
                    <small>Updated {formatRelative(order.updatedAt)}</small>
                  </span>
                  <StatusPill status={order.status} />
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section aria-label="Shop by category">
        <SectionHeader
          title="What do you need today?"
          subtitle="Demo categories — listings are examples until real tenants opt in."
        />
        <div className="category-grid">
          {CATEGORIES.map((category) => {
            const count = state.shops.filter((s) => s.category === category.id).length;
            return (
              <button
                key={category.id}
                type="button"
                className="category-tile"
                onClick={() => navigate({ name: 'shops', category: category.id })}
              >
                <img src={CATEGORY_ICONS[category.id]} alt="" loading="lazy" />
                <span>
                  <strong>{category.label}</strong>
                  <small>
                    {category.tagline} · {count} demo listing{count === 1 ? '' : 's'}
                  </small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {promos.length > 0 && (
        <section aria-label="Promotions">
          <SectionHeader title="Promotions" subtitle="Restrained demo placements — always labelled, never disguised as search results." />
          <div className="promo-stack">
            {promos.map((promotion) => (
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

      <section aria-label="Featured shops">
        <SectionHeader
          title="Featured shops"
          subtitle="Worked demo tenants with full chat-to-order journeys."
          action={
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate({ name: 'shops' })}>
              All shops <ArrowRight size={15} aria-hidden />
            </button>
          }
        />
        <div className="shop-grid">
          {featured.map((shop) => (
            <ShopCard key={shop.id} shop={shop} onOpen={(shopId) => navigate({ name: 'shop', shopId })} />
          ))}
        </div>
      </section>

      {conversations.length > 0 && (
        <section aria-label="Recent conversations">
          <SectionHeader
            title="Pick up where you left off"
            subtitle="Your recent shop chats (demo customer: Thandi M.)."
            action={
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate({ name: 'chats' })}>
                All chats <ArrowRight size={15} aria-hidden />
              </button>
            }
          />
          <ul className="conversation-list">
            {conversations.map((conversation) => {
              const shop = getShop(state, conversation.shopId);
              const last = lastMessage(state, conversation.id);
              if (!shop) return null;
              return (
                <li key={conversation.id}>
                  <button type="button" onClick={() => navigate({ name: 'chat', conversationId: conversation.id })}>
                    <ShopAvatar shop={shop} />
                    <span className="conversation-list__text">
                      <strong>{shop.name}</strong>
                      <small>{last ? last.text || 'Photo (demo)' : 'Start the conversation'}</small>
                    </span>
                    <span className="conversation-list__meta">
                      <small>{formatRelative(conversation.lastActivityAt)}</small>
                      {conversation.unreadForCustomer > 0 && (
                        <span className="unread-badge">{conversation.unreadForCustomer}</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="how-it-works" aria-label="How it works">
        <SectionHeader title="How chat-based ordering works" subtitle="Conversations first. Structured orders second. No giant catalogues." />
        <ol className="steps">
          <li>
            <span className="steps__icon">
              <MessagesSquare size={22} aria-hidden />
            </span>
            <h3>1. Chat to the shop</h3>
            <p>Ask about availability, sizes, prices or substitutions — send a list or even a photo of what you need.</p>
          </li>
          <li>
            <span className="steps__icon">
              <ClipboardList size={22} aria-hidden />
            </span>
            <h3>2. Review the summary</h3>
            <p>Staff build a priced order summary in the chat. Check items, quantities and the delivery fee before you confirm anything.</p>
          </li>
          <li>
            <span className="steps__icon">
              <Bike size={22} aria-hidden />
            </span>
            <h3>3. Delivery or collection</h3>
            <p>Follow each step — accepted, prepared, out for delivery — and jump back into the same chat if you have a question.</p>
          </li>
        </ol>
        <p className="how-it-works__note">
          <ShoppingBag size={16} aria-hidden /> Try it now: open <strong>Mzansi Fresh Grocers</strong> — a basket is
          already waiting in the chat. <DemoTag>Demo prices</DemoTag>
        </p>
      </section>
    </div>
  );
}
