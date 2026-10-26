import { useMemo, useState, type FormEvent } from 'react';
import {
  BarChart3,
  Bike,
  Building2,
  Eye,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  MousePointerClick,
  Plus,
  Store,
  Trash2,
} from 'lucide-react';
import type { AdminTab, Route } from '../../router';
import { categoryLabel } from '../../data/seed';
import { useDemoStore } from '../../store/DemoStore';
import { getShop } from '../../store/selectors';
import type { ParticipationStatus, Promotion, PromotionPlacement } from '../../types';
import { formatRelative, formatZAR, roundMoney } from '../../utils/format';
import { calculateTotals, isConfirmedOrder, STATUS_LABELS } from '../../utils/orderWorkflow';
import { DemoTag, InfoBanner, Modal, ShopAvatar, SponsoredTag, StatusPill, useToast } from '../../components/ui';

function useMarketplaceMetrics(commissionRate: number) {
  const { state } = useDemoStore();
  return useMemo(() => {
    const confirmed = state.orders.filter(isConfirmedOrder);
    const gmv = roundMoney(
      confirmed.reduce((sum, o) => sum + calculateTotals(o.items, o.fulfilment, o.deliveryFee).subtotal, 0),
    );
    const deliveryFees = roundMoney(
      confirmed
        .filter((o) => o.fulfilment === 'delivery')
        .reduce((sum, o) => sum + calculateTotals(o.items, o.fulfilment, o.deliveryFee).deliveryFee, 0),
    );
    const deliveredJobs = state.deliveryJobs.filter((j) => j.status === 'delivered');
    const driverPayouts = roundMoney(deliveredJobs.reduce((sum, j) => sum + j.driverPayout, 0));
    const commission = roundMoney(gmv * commissionRate);
    const deliveryMargin = roundMoney(deliveryFees - driverPayouts);
    return {
      participating: state.shops.filter((s) => s.participation === 'demo-partner').length,
      listings: state.shops.length,
      conversations: state.conversations.length,
      confirmedOrders: confirmed.length,
      completedDeliveries: deliveredJobs.length,
      gmv,
      deliveryFees,
      driverPayouts,
      commission,
      deliveryMargin,
      estimatedNet: roundMoney(commission + deliveryMargin),
    };
  }, [state, commissionRate]);
}

function Overview() {
  const [commissionPct, setCommissionPct] = useState(8);
  const metrics = useMarketplaceMetrics(commissionPct / 100);

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <span>Participating shops (demo)</span>
          <strong>{metrics.participating}</strong>
          <small>of {metrics.listings} directory listings</small>
        </div>
        <div className="stat-card">
          <span>Conversations</span>
          <strong>{metrics.conversations}</strong>
          <small>chat-first shopping sessions</small>
        </div>
        <div className="stat-card">
          <span>Confirmed orders</span>
          <strong>{metrics.confirmedOrders}</strong>
          <small>structured orders from chats</small>
        </div>
        <div className="stat-card">
          <span>Completed deliveries</span>
          <strong>{metrics.completedDeliveries}</strong>
          <small>via demo delivery partners</small>
        </div>
      </div>

      <section className="panel" aria-label="Illustrative marketplace economics">
        <h2>
          Illustrative marketplace economics <DemoTag>Sample figures — not mall performance</DemoTag>
        </h2>
        <dl className="money-table">
          <div>
            <dt>
              Gross merchandise value (GMV)
              <small>Value of goods in confirmed demo orders — belongs to the shops</small>
            </dt>
            <dd>{formatZAR(metrics.gmv)}</dd>
          </div>
          <div>
            <dt>
              Delivery fees charged
              <small>Paid by customers on delivery orders; mostly passed to drivers</small>
            </dt>
            <dd>{formatZAR(metrics.deliveryFees)}</dd>
          </div>
          <div>
            <dt>
              Driver payouts (completed)
              <small>What demo partners earned — a cost against delivery fees</small>
            </dt>
            <dd>− {formatZAR(metrics.driverPayouts)}</dd>
          </div>
          <div>
            <dt>
              Illustrative platform commission
              <small>Adjust the sample rate — a live model would be negotiated per tenant</small>
            </dt>
            <dd>{formatZAR(metrics.commission)}</dd>
          </div>
          <div className="money-table__net">
            <dt>
              Estimated net platform revenue
              <small>Commission + delivery margin. Excludes payment costs, support, marketing and tax.</small>
            </dt>
            <dd>{formatZAR(metrics.estimatedNet)}</dd>
          </div>
        </dl>
        <label className="commission-slider">
          Sample commission rate: <strong>{commissionPct}% of GMV</strong>
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={commissionPct}
            onChange={(e) => setCommissionPct(Number(e.target.value))}
          />
        </label>
        <p className="panel__lede">
          These numbers move live as you run the demo scenario (confirm orders, complete deliveries). They exist to
          structure a commercial conversation — they are <strong>not</strong> Angelo Mall trading results.
        </p>
      </section>
    </div>
  );
}

function ShopsAdmin() {
  const { state, dispatch } = useDemoStore();
  const { notify } = useToast();

  return (
    <div>
      <InfoBanner>
        Tenant participation is a management decision. Changing a status here updates the customer directory
        immediately — e.g. switch a “directory example” to “demo partner” to present an onboarding conversation.
        Nothing here enrols a real tenant.
      </InfoBanner>
      <ul className="admin-shop-list">
        {state.shops.map((shop) => (
          <li key={shop.id} className="admin-shop-row">
            <ShopAvatar shop={shop} />
            <div className="admin-shop-row__main">
              <strong>{shop.name}</strong>
              <small>
                {categoryLabel(shop.category)} · {shop.unitLabel}
              </small>
            </div>
            <label className="admin-shop-row__field">
              Participation
              <select
                value={shop.participation}
                onChange={(e) => {
                  dispatch({
                    type: 'ADMIN_SET_PARTICIPATION',
                    shopId: shop.id,
                    status: e.target.value as ParticipationStatus,
                  });
                  notify(`${shop.name} participation updated (demo).`);
                }}
              >
                <option value="demo-partner">Demo partner</option>
                <option value="directory-example">Directory example</option>
                <option value="paused">Paused</option>
              </select>
            </label>
            <label className="switch">
              <input
                type="checkbox"
                checked={shop.featured}
                onChange={(e) => dispatch({ type: 'ADMIN_SET_FEATURED', shopId: shop.id, featured: e.target.checked })}
              />
              <span>Featured</span>
            </label>
            <label className="switch">
              <input
                type="checkbox"
                checked={shop.tradingNow}
                onChange={(e) => dispatch({ type: 'ADMIN_SET_TRADING', shopId: shop.id, tradingNow: e.target.checked })}
              />
              <span>Open (demo)</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PromotionsAdmin() {
  const { state, dispatch } = useDemoStore();
  const { notify } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shopId, setShopId] = useState('');
  const [placement, setPlacement] = useState<PromotionPlacement>('home-banner');
  const [sponsored, setSponsored] = useState(false);
  const [startsAt, setStartsAt] = useState('2026-10-24');
  const [endsAt, setEndsAt] = useState('2026-10-31');
  const [formError, setFormError] = useState('');

  const create = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError('Give the demo promotion a title and a short description.');
      return;
    }
    if (endsAt < startsAt) {
      setFormError('End date must be after the start date.');
      return;
    }
    const shop = shopId ? getShop(state, shopId) : undefined;
    const promotion: Promotion = {
      id: `promo-${state.seq}`,
      title: title.trim(),
      description: description.trim(),
      shopId: shopId || undefined,
      image: shop?.coverImage ?? '/images/hero-mall.jpg',
      placement,
      sponsored,
      active: true,
      startsAt,
      endsAt,
      impressions: 0,
      clicks: 0,
      conversationStarts: 0,
    };
    dispatch({ type: 'ADMIN_UPSERT_PROMOTION', promotion });
    setTitle('');
    setDescription('');
    setFormError('');
    notify('Demo promotion published — check the customer home page.');
  };

  return (
    <div>
      <ul className="admin-promo-list">
        {state.promotions.map((promotion) => {
          const shop = promotion.shopId ? getShop(state, promotion.shopId) : undefined;
          const ctr = promotion.impressions > 0 ? Math.round((promotion.clicks / promotion.impressions) * 100) : 0;
          return (
            <li key={promotion.id} className="admin-promo-row">
              <img src={promotion.image} alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
              <div className="admin-promo-row__main">
                {promotion.sponsored ? <SponsoredTag /> : <DemoTag>Unpaid demo content</DemoTag>}
                <strong>{promotion.title}</strong>
                <small>
                  {shop ? shop.name : 'Mall-wide'} · {promotion.placement} · {promotion.startsAt} → {promotion.endsAt}
                </small>
                <small className="admin-promo-row__stats">
                  <Eye size={13} aria-hidden /> {promotion.impressions} · <MousePointerClick size={13} aria-hidden />{' '}
                  {promotion.clicks} ({ctr}% CTR) · <MessagesSquare size={13} aria-hidden />{' '}
                  {promotion.conversationStarts} chat starts (demo counters)
                </small>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={promotion.active}
                  onChange={(e) =>
                    dispatch({ type: 'ADMIN_SET_PROMO_ACTIVE', promotionId: promotion.id, active: e.target.checked })
                  }
                />
                <span>Live</span>
              </label>
              <button type="button" className="icon-btn" onClick={() => setDeleteId(promotion.id)} aria-label={`Delete ${promotion.title}`}>
                <Trash2 size={18} aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      <form className="panel promo-form" onSubmit={create}>
        <h2>
          <Plus size={18} aria-hidden /> New demo promotion
        </h2>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Month-end grocery savings (demo)" />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Short, honest copy. Prices are always confirmed in chat." />
        </label>
        <div className="item-editor__row">
          <label>
            Linked shop (optional)
            <select value={shopId} onChange={(e) => setShopId(e.target.value)}>
              <option value="">Mall-wide notice</option>
              {state.shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Placement
            <select value={placement} onChange={(e) => setPlacement(e.target.value as PromotionPlacement)}>
              <option value="home-banner">Home banner</option>
              <option value="directory-banner">Directory banner</option>
              <option value="featured-shop">Featured shop slot</option>
            </select>
          </label>
        </div>
        <div className="item-editor__row">
          <label>
            Starts
            <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </label>
          <label>
            Ends
            <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </label>
        </div>
        <label className="switch">
          <input type="checkbox" checked={sponsored} onChange={(e) => setSponsored(e.target.checked)} />
          <span>Sponsored placement (will be labelled “Sponsored · demo placement”)</span>
        </label>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <button type="submit" className="btn btn--primary">
          Publish demo promotion
        </button>
        <p className="panel__lede">
          Placement rules for a live rollout (pricing, caps, approval workflow, advertiser reporting) belong in the
          Phase 2 commercial design — the UI already separates paid placement from organic listings.
        </p>
      </form>

      {deleteId && (
        <Modal title="Delete this demo promotion?" onClose={() => setDeleteId(null)}>
          <p>It will disappear from customer screens immediately. Demo counters go with it.</p>
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setDeleteId(null)}>
              Keep it
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                dispatch({ type: 'ADMIN_DELETE_PROMOTION', promotionId: deleteId });
                setDeleteId(null);
                notify('Demo promotion deleted.');
              }}
            >
              Delete promotion
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function DeliveriesAdmin() {
  const { state } = useDemoStore();
  return (
    <div>
      <InfoBanner>
        Marketplace-wide delivery oversight (demo). Partners are independent of any single shop, so one reliable local
        pool can serve the whole mall.
      </InfoBanner>
      {state.deliveryJobs.length === 0 ? (
        <p className="panel__empty">No delivery jobs yet — they appear when shops mark orders ready for delivery.</p>
      ) : (
        <ul className="admin-job-list">
          {[...state.deliveryJobs]
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((job) => {
              const shop = getShop(state, job.shopId);
              const order = state.orders.find((o) => o.id === job.orderId);
              return (
                <li key={job.id} className="admin-job-row">
                  <Bike size={19} aria-hidden />
                  <div>
                    <strong>
                      {shop?.name ?? 'Shop'} → {job.destinationArea}
                    </strong>
                    <small>
                      Order {order?.ref ?? '—'} · {job.distanceKm.toFixed(1)} km (demo) · payout{' '}
                      {formatZAR(job.driverPayout)} · {formatRelative(job.updatedAt)}
                      {job.driverName ? ` · ${job.driverName}` : ''}
                    </small>
                  </div>
                  <span className={`pill pill--job pill--job-${job.status}`}>{job.status.replace(/-/g, ' ')}</span>
                  {order && <StatusPill status={order.status} />}
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}

function Reports() {
  const { state } = useDemoStore();
  const byStatus = useMemo(() => {
    const counts = new Map<string, number>();
    for (const order of state.orders) counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [state.orders]);

  const byShop = useMemo(() => {
    return state.shops
      .map((shop) => {
        const orders = state.orders.filter((o) => o.shopId === shop.id && isConfirmedOrder(o));
        const gmv = roundMoney(
          orders.reduce((sum, o) => sum + calculateTotals(o.items, o.fulfilment, o.deliveryFee).subtotal, 0),
        );
        return { shop, orders: orders.length, gmv };
      })
      .sort((a, b) => b.gmv - a.gmv);
  }, [state]);

  const maxStatus = Math.max(1, ...byStatus.map(([, n]) => n));

  return (
    <div className="reports">
      <InfoBanner>
        Simple activity reporting from live demo state. A production rollout would add date ranges, exports and
        audited financial reports — and real tenant data would replace every sample figure here.
      </InfoBanner>

      <section className="panel" aria-label="Orders by status">
        <h2>Demo orders by status</h2>
        {byStatus.length === 0 ? (
          <p className="panel__empty">No orders in the demo state.</p>
        ) : (
          <ul className="bar-list">
            {byStatus.map(([status, count]) => (
              <li key={status}>
                <span className="bar-list__label">{STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status}</span>
                <span className="bar-list__track">
                  <span className="bar-list__fill" style={{ width: `${(count / maxStatus) * 100}%` }} />
                </span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel" aria-label="Value by shop">
        <h2>Confirmed demo value by shop (GMV)</h2>
        <ul className="report-shop-list">
          {byShop.map(({ shop, orders, gmv }) => (
            <li key={shop.id}>
              <ShopAvatar shop={shop} size="sm" />
              <span className="report-shop-list__name">
                <strong>{shop.name}</strong>
                <small>
                  {orders} confirmed order(s) · {shop.participation === 'demo-partner' ? 'demo partner' : shop.participation}
                </small>
              </span>
              <strong>{formatZAR(gmv)}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel" aria-label="Promotion funnel">
        <h2>Promotion funnel (demo counters)</h2>
        <ul className="report-shop-list">
          {state.promotions.map((promotion) => (
            <li key={promotion.id}>
              <Megaphone size={18} aria-hidden />
              <span className="report-shop-list__name">
                <strong>{promotion.title}</strong>
                <small>
                  {promotion.impressions} impressions → {promotion.clicks} clicks → {promotion.conversationStarts}{' '}
                  chats started
                </small>
              </span>
              <DemoTag>{promotion.sponsored ? 'Sponsored demo' : 'Organic demo'}</DemoTag>
            </li>
          ))}
        </ul>
        <p className="panel__lede">
          Order attribution (which promotion caused which sale) is deliberately not faked — it requires backend
          instrumentation in Phase 2.
        </p>
      </section>
    </div>
  );
}

const ADMIN_TABS: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'shops', label: 'Shops', icon: Store },
  { id: 'promotions', label: 'Promotions', icon: Megaphone },
  { id: 'deliveries', label: 'Deliveries', icon: Bike },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export function AdminWorkspace({
  tab,
  navigate,
}: {
  tab: AdminTab;
  navigate: (route: Route) => void;
}) {
  return (
    <div className="page page--wide">
      <div className="workspace-head">
        <div>
          <span className="workspace-kicker">
            <Building2 size={14} aria-hidden /> Mall management workspace · demonstration
          </span>
          <h1>Angelo Mall Go — management view</h1>
          <p>Tenant participation, promotions and marketplace activity at a glance. Every figure is sample demo data unless it came from orders you just ran in this session.</p>
        </div>
      </div>

      <div className="workspace-tabs" role="tablist" aria-label="Admin sections">
        {ADMIN_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`workspace-tab ${tab === t.id ? 'workspace-tab--active' : ''}`}
            onClick={() => navigate({ name: 'admin', tab: t.id })}
          >
            <t.icon size={17} aria-hidden /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview />}
      {tab === 'shops' && <ShopsAdmin />}
      {tab === 'promotions' && <PromotionsAdmin />}
      {tab === 'deliveries' && <DeliveriesAdmin />}
      {tab === 'reports' && <Reports />}
    </div>
  );
}
