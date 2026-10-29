import { useEffect, useMemo, useState } from 'react';
import { Search, SearchX, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES, categoryLabel } from '../../data/seed';
import { imageSrc } from '../../data/imageAssets';
import type { Route } from '../../router';
import { useDemoStore } from '../../store/DemoStore';
import { activePromotions } from '../../store/selectors';
import type { CategoryId, FulfilmentMethod } from '../../types';
import { PromotionBanner } from '../../components/PromotionBanner';
import { ShopCard } from '../../components/ShopCard';
import { EmptyState, InfoBanner, ListingDisclosure, PageHeader, SectionHeader, SkeletonList } from '../../components/ui';

type FulfilmentFilter = 'all' | FulfilmentMethod;

/**
 * Shop directory.
 *
 * One "discovery card" holds the page title, the search field and the filters,
 * so the whole act of *finding* a shop reads as a single object at the top of
 * the screen. Previously the title, the field, two chip rows and a filter row
 * were four separate blocks with the page's own spacing between them, which is
 * why the directory still looked like the document it started as.
 *
 * The reading order is deliberate and pinned by a test: search → guidance →
 * disclosure → results.
 */
export function DirectoryScreen({
  navigate,
  initialQuery = '',
  initialCategory,
}: {
  navigate: (route: Route) => void;
  initialQuery?: string;
  initialCategory?: string;
}) {
  const { state, service } = useDemoStore();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<CategoryId | 'all'>(
    CATEGORIES.some((c) => c.id === initialCategory) ? (initialCategory as CategoryId) : 'all',
  );
  const [fulfilment, setFulfilment] = useState<FulfilmentFilter>('all');
  const [openOnly, setOpenOnly] = useState(false);
  // Brief skeleton demonstrates the loading state a live directory API would have.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => setQuery(initialQuery), [initialQuery]);
  useEffect(() => {
    if (CATEGORIES.some((c) => c.id === initialCategory)) setCategory(initialCategory as CategoryId);
  }, [initialCategory]);

  const directoryPromo = activePromotions(state, 'directory-banner')[0];
  const sponsoredShopIds = useMemo(
    () =>
      new Set(
        state.promotions.filter((p) => p.active && p.sponsored && p.shopId).map((p) => p.shopId as string),
      ),
    [state.promotions],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.shops.filter((shop) => {
      if (category !== 'all' && shop.category !== category) return false;
      if (fulfilment !== 'all' && !shop.fulfilment.includes(fulfilment)) return false;
      if (openOnly && !shop.tradingNow) return false;
      if (q && !`${shop.name} ${shop.tagline} ${shop.description} ${categoryLabel(shop.category)}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [state.shops, query, category, fulfilment, openOnly]);

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setFulfilment('all');
    setOpenOnly(false);
  };
  const filtered = Boolean(query.trim()) || category !== 'all' || fulfilment !== 'all' || openOnly;

  return (
    <div className="page page--directory">
      <div className="directory-head">
        <PageHeader
          eyebrow="Discover"
          title="Shop directory"
          subtitle="Every shop listed is a real Angelo Mall tenant. Chat, prices and delivery here are simulated."
          meta={
            <>
              <span>{state.shops.length} tenants</span>
              <span aria-hidden>·</span>
              <span>Mall directory only</span>
            </>
          }
        />

        <div className="directory-controls">
          <div className="search-field">
            <Search size={19} aria-hidden />
            <label className="visually-hidden" htmlFor="directory-search">
              Search shops
            </label>
            <input
              id="directory-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shops or what you need…"
              autoComplete="off"
            />
            {query && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setQuery('')}>
                Clear
              </button>
            )}
          </div>

          <div className="chip-row chip-row--scroll" role="group" aria-label="Filter by category">
            <button
              type="button"
              className={`chip ${category === 'all' ? 'chip--active' : ''}`}
              onClick={() => setCategory('all')}
              aria-pressed={category === 'all'}
            >
              All categories
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`chip ${category === c.id ? 'chip--active' : ''}`}
                onClick={() => setCategory(c.id)}
                aria-pressed={category === c.id}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="filter-row">
            <span className="filter-row__label">
              <SlidersHorizontal size={15} aria-hidden /> Fulfilment
            </span>
            <div className="chip-row" role="group" aria-label="Filter by fulfilment">
              {(
                [
                  ['all', 'Any'],
                  ['delivery', 'Delivery'],
                  ['collection', 'Collection'],
                ] as [FulfilmentFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`chip ${fulfilment === value ? 'chip--active' : ''}`}
                  onClick={() => setFulfilment(value)}
                  aria-pressed={fulfilment === value}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="switch">
              <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} />
              <span>Open now (demo)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="results-bar">
        <p className="results-count" aria-live="polite">
          {loading ? 'Loading demo directory…' : `${results.length} shop${results.length === 1 ? '' : 's'} found`}
        </p>
        {filtered && !loading && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={clearFilters}>
            Reset
          </button>
        )}
      </div>

      <div className="discovery-strip">
        <img
          className="discovery-strip__art"
          src={imageSrc('discover-shops')}
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden
        />
        <p>
          <strong>Find a shop, then ask.</strong> Search by name or need, filter by category — or open any shop and
          describe what you’re after in the chat. In this demo the shop’s replies are scripted samples.
        </p>
      </div>

      <ListingDisclosure />

      {loading ? (
        <SkeletonList rows={3} />
      ) : results.length === 0 ? (
        <EmptyState
          illustration={imageSrc('state-empty-directory')}
          icon={<SearchX size={26} aria-hidden />}
          title="No shops match those filters"
          description="Try a different word — or clear the filters. Remember: in Mall Go you don't need an exact product match; open a likely shop and ask in the chat."
        >
          <button type="button" className="btn btn--primary" onClick={clearFilters}>
            Clear search &amp; filters
          </button>
        </EmptyState>
      ) : (
        <div className="shop-grid">
          {results.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              sponsored={sponsoredShopIds.has(shop.id)}
              onOpen={(shopId) => navigate({ name: 'shop', shopId })}
            />
          ))}
        </div>
      )}

      {directoryPromo && (
        <section aria-label="Promotions">
          <SectionHeader title="Promotions" subtitle="Labelled demo placements, shown after the listings." />
          <PromotionBanner
            promotion={directoryPromo}
            onOpen={(id) => navigate({ name: 'promotion', promotionId: id })}
            recordEvent={(id, event) => void service.recordPromotionEvent(id, event)}
          />
        </section>
      )}

      <InfoBanner illustration={imageSrc('journey-navigation')}>
        Directory data is centralised demo content. In a live rollout, mall management would verify each tenant before
        it can take chat orders — the admin workspace (Demo Mode switch) shows that control.
      </InfoBanner>
    </div>
  );
}
