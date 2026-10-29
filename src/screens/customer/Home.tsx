import { useMemo, useState, type FormEvent } from 'react';
import { ResponsiveImage } from '../../components/ResponsiveImage';
import { CARD_IMAGE_SIZES, HOME_HERO_SRC, HOME_HERO_SRCSET, webpSrcSetFor } from '../../utils/responsiveImages';
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
import { NEED_SHORTCUTS, imageSrc } from '../../data/imageAssets';
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
import { ShopTile } from '../../components/ShopTile';
import { DemoTag, SectionHeader, ShopAvatar, StatusPill } from '../../components/ui';

const CATEGORY_ICONS: Record<string, string> = {
  groceries: '/images/shop-grocery.jpg',
  food: '/images/shop-food.jpg',
  fashion: '/images/shop-fashion.jpg',
  electronics: '/images/shop-electronics.jpg',
  pharmacy: '/images/shop-pharmacy.jpg',
  homeware: '/images/shop-homeware.jpg',
  beauty: '/images/shop-beauty.jpg',
  services: '/images/shop-services.jpg',
  finance: '/images/shop-finance.jpg',
};

/**
 * Customer Home.
 *
 * One journey: open the app, see shops, tap a shop, start talking.
 *
 * The screen therefore opens on a deliberately short hero — the brand, one
 * sentence on what this is, and search — and then goes straight to the shop
 * launcher. Everything else (where you left off, categories, the walkthrough,
 * promotions, how it works) is kept, in full, *below* that, because none of it
 * is the first thing a customer wants to do.
 *
 * That ordering is the redesign. The previous version opened with a hero that
 * filled a whole phone screen — artwork, a four-line explanation, search and two
 * competing calls to action — so a shop was not reachable without first going
 * through the full directory. Measured at 390px the old page was 5,771px tall
 * and its first shop appeared well past the first viewport.
 *
 * Shop taps route by what the tenant can actually do (see `SHOP_LAUNCHER`):
 * the four seeded demo tenants open their conversation directly through the
 * existing `service.openConversation`, and every other tenant opens its
 * information screen, which states that no ordering is connected. No shop is
 * given a chat it does not have.
 *
 * Every block is built from existing data: the shops, categories, featured
 * flags, demo-scenario walkthrough and concept artwork already in `src/data`.
 * Nothing here invents a price, rating, offer or partnership.
 */

/**
 * The shops offered in the launcher, in the order they are shown.
 *
 * The first four are the tenants that carry a seeded demo conversation, so they
 * are the ones where "tap a shop → start chatting" actually works end to end.
 * SUPERSPAR carries the seeded basket. The remaining four are the tenants the
 * mall's own data already marks `featured`, plus two more that are listed with a
 * shop number in the Angelo Mall directory (TOPS at SPAR, shop 12; Mica, shop 5).
 *
 * This is a documented ordering, not a popularity ranking: nothing here is
 * derived from ratings, visit counts or sales, because the demo has none.
 */
const SHOP_LAUNCHER = [
  'shop-superspar',
  'shop-kfc',
  'shop-clicks',
  'shop-mtn',
  'shop-tops',
  'shop-pep',
  'shop-mica',
  'shop-golden-buffalo-spur',
] as const;

export function HomeScreen({ navigate }: { navigate: (route: Route) => void }) {
  const { state, service } = useDemoStore();
  const [query, setQuery] = useState('');

  const featured = state.shops.filter((s) => s.featured);
  const promos = activePromotions(state, 'home-banner');
  const conversations = conversationsForCustomer(state).slice(0, 3);
  const activeOrders = ordersForCustomer(state).filter(
    (o) => isConfirmedOrder(o) && !['delivered', 'completed'].includes(o.status),
  );

  /**
   * The worked example. SUPERSPAR carries the seeded basket, so it is the
   * honest "start here" — the same shop the old how-it-works note pointed at.
   * Falls back to any demo-scenario tenant if the demo data ever changes.
   */
  const walkthrough =
    state.shops.find((shop) => shop.id === 'shop-superspar') ??
    state.shops.find((shop) => shop.participation === 'demo-scenario');

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

  /**
   * The shops in the launcher, resolved by id so an admin-hidden tenant simply
   * drops out rather than leaving a hole in the grid.
   */
  const launcher = SHOP_LAUNCHER.map((id) => state.shops.find((shop) => shop.id === id)).filter(
    (shop): shop is NonNullable<typeof shop> => Boolean(shop),
  );

  /**
   * Only `demo-scenario` tenants carry a seeded conversation, so they are the
   * only ones that can open a chat. Everything else opens its information page.
   * This is the one place the distinction is made, and both `supportsChat` and
   * the resulting route read from it — the tile can never promise a chat the
   * shop does not have.
   */
  const supportsChat = (shopId: string) =>
    state.shops.find((shop) => shop.id === shopId)?.participation === 'demo-scenario';

  /**
   * Tap a shop: straight into the conversation, reusing the same store call the
   * shop page uses, so no second notion of "current conversation" is created.
   * Listing-only tenants go to their information screen instead.
   */
  const openShop = async (shopId: string) => {
    if (!supportsChat(shopId)) {
      navigate({ name: 'shop', shopId });
      return;
    }
    const conversationId = await service.openConversation(shopId);
    navigate({ name: 'chat', conversationId });
  };

  return (
    <div className="page page--home">
      <section className="hero" aria-labelledby="home-title">
        <div className="hero__content">
          <span className="hero__kicker">
            <Sparkles size={14} aria-hidden /> Angelo Mall · Nigel · demo
          </span>
          <h1 id="home-title">Chat to mall shops. Order without the catalogue hunt.</h1>
          {/* Kept short on purpose: one honest sentence, not a paragraph. The
              full explanation lives on the shop and chat screens, where it is
              relevant, and in Help. */}
          <p className="hero__lede">Real mall tenants. Chats and prices here are simulated.</p>
          <form className="hero__search" onSubmit={submitSearch} role="search">
            {/* The icon and input share a field so the icon can never drift away
                from the text when the form wraps, which is what happened when
                the pill was allowed to wrap at 390px. */}
            <span className="hero__search-field">
              <Search size={20} aria-hidden />
              <label className="visually-hidden" htmlFor="home-search">
                Search shops or things you need
              </label>
              <input
                id="home-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search shops or a need…"
                autoComplete="off"
              />
            </span>
            <button type="submit" className="btn btn--gold">
              Search
            </button>
          </form>
          {query.trim() && (
            <div className="hero__results" aria-live="polite">
              {searchResults.length === 0 ? (
                <div className="hero__no-match">
                  <img src={imageSrc('search-guidance')} alt="" loading="lazy" decoding="async" aria-hidden />
                  <p>
                    No listed shops match “{query}”. Try a need instead of a product — “cable”, “mince”, “burgers” — or
                    browse the full directory below.
                  </p>
                </div>
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
        </div>
        <div className="hero__aside">
          <ResponsiveImage
            src={HOME_HERO_SRC}
            webpSrcSet={HOME_HERO_SRCSET}
            sizes="(min-width: 780px) 45vw, 100vw"
            alt=""
            className="hero__img"
            width={1408}
            height={768}
            fetchPriority="high"
          />
          {/* The hero image is generated concept art, not a photograph of the
              mall — it carries the same label as the tenant artwork so the two
              can never be confused for real photography. */}
          <span className="hero__aside-chip">Concept art · not a photo of the mall</span>
        </div>
      </section>

      {/* The shop launcher comes first, directly under the hero: open the app,
          see shops, tap one. It is the main action on this screen. */}
      {launcher.length > 0 && (
        <section className="shop-launcher" aria-labelledby="launcher-title">
          <div className="shop-launcher__head">
            <h2 id="launcher-title">Shops</h2>
            <p className="shop-launcher__hint">Tap a shop to start chatting</p>
          </div>
          <ul className="shop-launcher__grid">
            {launcher.map((shop) => (
              <li key={shop.id}>
                <ShopTile
                  shop={shop}
                  supportsChat={supportsChat(shop.id)}
                  onOpen={(picked) => void openShop(picked.id)}
                />
              </li>
            ))}
          </ul>
          <div className="shop-launcher__all">
            <button type="button" className="btn btn--primary btn--lg" onClick={() => navigate({ name: 'shops' })}>
              Browse all {state.shops.length} shops <ArrowRight size={17} aria-hidden />
            </button>
          </div>
        </section>
      )}

      {conversations.length === 0 && activeOrders.length === 0 && (
        <section className="welcome-card" aria-label="New here?">
          <img
            className="welcome-card__art"
            src={imageSrc('welcome-mall')}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden
          />
          <div className="welcome-card__body">
            <h2>New here? Start with one shop.</h2>
            <p>
              Angelo Mall Go is a concept demo: the shops are real mall tenants, but nothing you send reaches them.
              Pick a shop, say hello, and watch a sample conversation build a basket — then switch to the Shop staff
              view to answer as the shop.
            </p>
            <div className="hero__actions">
              <button type="button" className="btn btn--primary" onClick={() => navigate({ name: 'shops' })}>
                Browse the shops
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => navigate({ name: 'help' })}>
                How the demo works
              </button>
            </div>
          </div>
        </section>
      )}

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

      <section aria-label="Shop by category">
        <SectionHeader
          title="What do you need today?"
          subtitle="Nine ways into the same mall directory. Real tenants, grouped the way the mall lists them."
          action={
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate({ name: 'shops' })}>
              All {state.shops.length} <ArrowRight size={15} aria-hidden />
            </button>
          }
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
                    {count} shop{count === 1 ? '' : 's'}
                  </small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {walkthrough && (
        <section className="spotlight" aria-label="Start with a walkthrough">
          <div className="spotlight__media">
            <ResponsiveImage
              src={walkthrough.conceptImage ?? walkthrough.coverImage}
              webpSrcSet={webpSrcSetFor(walkthrough.conceptImage ?? walkthrough.coverImage)}
              sizes={CARD_IMAGE_SIZES}
              alt=""
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
            />
            <span className="spotlight__chip">Concept art</span>
          </div>
          <div className="spotlight__body">
            <p className="spotlight__kicker">Start here</p>
            <h2 className="spotlight__title">See one chat become a basket</h2>
            <p className="spotlight__copy">
              A sample grocery basket is already waiting in {walkthrough.name}&rsquo;s chat. Open it to watch a
              conversation turn into a priced summary, then a simulated delivery or collection. The replies are
              scripted, and the prices are demo prices.
            </p>
            <div className="spotlight__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => navigate({ name: 'shop', shopId: walkthrough.id })}
              >
                Open the walkthrough <ArrowRight size={17} aria-hidden />
              </button>
              <DemoTag>Simulated · demo prices</DemoTag>
            </div>
          </div>
        </section>
      )}

      <section aria-label="Explore by need">
        <SectionHeader
          title="Explore by need"
          subtitle="Five quick ways in. Each one filters the same mall directory — there is no catalogue, and prices only appear if a shop replies in a chat."
        />
        <ul className="need-grid">
          {NEED_SHORTCUTS.map((need) => (
            <li key={need.category}>
              <button
                type="button"
                className="need-tile"
                onClick={() => navigate({ name: 'shops', category: need.category })}
              >
                <img src={need.art} alt="" loading="lazy" decoding="async" aria-hidden />
                <span>
                  <strong>{need.label}</strong>
                  <small>{need.caption}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="need-grid__note">
          Illustrations only — no shop in this demo has product photographs, confirmed stock or offers.
        </p>
      </section>

      <section aria-label="Featured shops">
        <SectionHeader
          title="Featured shops"
          subtitle="Real tenants, chosen because the mall directory and the business’s own listings agree. Their chats here are scripted samples."
          action={
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate({ name: 'shops' })}>
              All shops <ArrowRight size={15} aria-hidden />
            </button>
          }
        />
        <div className="shop-grid shop-grid--rail">
          {featured.map((shop) => (
            <ShopCard key={shop.id} shop={shop} onOpen={(shopId) => navigate({ name: 'shop', shopId })} />
          ))}
        </div>
      </section>

      {promos.length > 0 && (
        <section aria-label="Promotions">
          <SectionHeader
            title="Promotions"
            subtitle="Restrained demo placements — always labelled, never disguised as search results."
          />
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

      <section className="how-it-works" aria-label="How it works">
        <SectionHeader
          title="How chat-based ordering works"
          subtitle="Conversations first. Structured orders second. No giant catalogues."
        />
        <ol className="steps">
          <li>
            <span className="steps__icon">
              <MessagesSquare size={22} aria-hidden />
            </span>
            <h3>1. Chat to the shop</h3>
            <p>
              In a live version you would ask about availability, sizes and prices. Here the replies are scripted
              samples, clearly labelled.
            </p>
          </li>
          <li>
            <span className="steps__icon">
              <ClipboardList size={22} aria-hidden />
            </span>
            <h3>2. Review the summary</h3>
            <p>
              The shop would build a priced summary in the chat. In this demo the summary is sample data with demo
              prices.
            </p>
          </li>
          <li>
            <span className="steps__icon">
              <Bike size={22} aria-hidden />
            </span>
            <h3>3. Delivery or collection</h3>
            <p>
              Follow each step — accepted, prepared, out for delivery — in a simulated timeline. No real courier is
              involved.
            </p>
          </li>
        </ol>
        <p className="how-it-works__note">
          <ShoppingBag size={16} aria-hidden /> Nothing here is connected to a real shop, courier or payment.
        </p>
      </section>
    </div>
  );
}
