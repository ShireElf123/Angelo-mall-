import { useState } from 'react';
import { ArrowLeft, ClipboardList, MessageCircle, PackageSearch, Repeat, XCircle } from 'lucide-react';
import type { Route } from '../../router';
import { useDemoStore } from '../../store/DemoStore';
import { getShop, jobForOrder, orderById, ordersForCustomer } from '../../store/selectors';
import { formatRelative, formatZAR } from '../../utils/format';
import { calculateTotals, canTransition, isBasketOrder } from '../../utils/orderWorkflow';
import { FulfilmentLabel, OrderItemsTable, OrderTimeline } from '../../components/OrderBits';
import { EmptyState, Modal, SectionHeader, ShopAvatar, StatusPill, useToast } from '../../components/ui';

export function OrdersScreen({ navigate }: { navigate: (route: Route) => void }) {
  const { state } = useDemoStore();
  const orders = ordersForCustomer(state);
  const baskets = orders.filter(isBasketOrder);
  const active = orders.filter(
    (o) => !isBasketOrder(o) && !['delivered', 'completed', 'cancelled'].includes(o.status),
  );
  const past = orders.filter((o) => ['delivered', 'completed', 'cancelled'].includes(o.status));

  const renderOrder = (order: (typeof orders)[number]) => {
    const shop = getShop(state, order.shopId);
    const totals = calculateTotals(order.items, order.fulfilment, order.deliveryFee);
    return (
      <li key={order.id} className="order-list-card">
        <button
          type="button"
          className="order-list-card__main"
          onClick={() =>
            navigate(isBasketOrder(order) ? { name: 'basket', orderId: order.id } : { name: 'order', orderId: order.id })
          }
        >
          {shop && <ShopAvatar shop={shop} />}
          <span className="order-list-card__text">
            <strong>
              {order.ref} · {shop?.name ?? 'Shop'}
            </strong>
            <small>
              {totals.itemCount} item(s) · {formatZAR(totals.total)} · updated {formatRelative(order.updatedAt)}
            </small>
          </span>
          <StatusPill status={order.status} />
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => navigate({ name: 'chat', conversationId: order.conversationId })}
        >
          <MessageCircle size={15} aria-hidden /> Chat
        </button>
      </li>
    );
  };

  return (
    <div className="page page--narrow">
      <SectionHeader
        title="Your orders"
        subtitle="Demo order history for Thandi M. Every order stays linked to its shop conversation."
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={30} aria-hidden />}
          title="No orders yet"
          description="When a shop sends you a priced summary and you confirm it, the order will appear here with live (demo) tracking."
        >
          <button type="button" className="btn btn--primary" onClick={() => navigate({ name: 'shops' })}>
            Find a shop to chat to
          </button>
        </EmptyState>
      ) : (
        <>
          {baskets.length > 0 && (
            <section aria-label="Baskets awaiting confirmation">
              <h2 className="group-title">Waiting for you to review</h2>
              <ul className="order-list">{baskets.map(renderOrder)}</ul>
            </section>
          )}
          {active.length > 0 && (
            <section aria-label="Active orders">
              <h2 className="group-title">In progress</h2>
              <ul className="order-list">{active.map(renderOrder)}</ul>
            </section>
          )}
          {past.length > 0 && (
            <section aria-label="Past orders">
              <h2 className="group-title">Past orders</h2>
              <ul className="order-list">{past.map(renderOrder)}</ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export function OrderDetailScreen({
  orderId,
  navigate,
}: {
  orderId: string;
  navigate: (route: Route) => void;
}) {
  const { state, service } = useDemoStore();
  const { notify } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const order = orderById(state, orderId);
  const shop = order ? getShop(state, order.shopId) : undefined;
  const job = order ? jobForOrder(state, order.id) : undefined;

  if (!order || !shop) {
    return (
      <div className="page page--narrow">
        <EmptyState
          icon={<PackageSearch size={30} aria-hidden />}
          title="Order not found"
          description="This demo order may have been cleared by a reset."
        >
          <button type="button" className="btn btn--primary" onClick={() => navigate({ name: 'orders' })}>
            Back to your orders
          </button>
        </EmptyState>
      </div>
    );
  }

  const canCancel = canTransition(order, 'cancelled') && !isBasketOrder(order);

  return (
    <div className="page page--narrow">
      <button type="button" className="back-btn" onClick={() => navigate({ name: 'orders' })}>
        <ArrowLeft size={18} aria-hidden /> All orders
      </button>

      <div className="basket-head">
        <ShopAvatar shop={shop} />
        <div>
          <h1>Order {order.ref}</h1>
          <p>{shop.name}</p>
        </div>
        <StatusPill status={order.status} />
      </div>

      <section className="panel" aria-label="Order tracking">
        <OrderTimeline order={order} />
        <FulfilmentLabel order={order} />
        {order.fulfilment === 'delivery' && job && (
          <p className="panel__lede">
            {job.status === 'available' && 'Waiting for a demo delivery partner to accept this job.'}
            {job.driverName && job.status !== 'available' && (
              <>
                Delivery partner: <strong>{job.driverName}</strong> (demo identity shown after assignment only).
              </>
            )}{' '}
            No live map tracking exists in Phase 1.
          </p>
        )}
        <div className="demo-next-step">
          <strong>Move this demo along:</strong> use the Demo Mode switch above — <em>Shop staff</em> accepts and
          prepares the order, then a <em>Delivery partner</em> completes the delivery. This timeline updates instantly.
        </div>
      </section>

      <section className="panel" aria-label="Order items">
        <h2>What you ordered</h2>
        <OrderItemsTable order={order} />
      </section>

      <div className="action-stack">
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={() => navigate({ name: 'chat', conversationId: order.conversationId })}
        >
          <MessageCircle size={18} aria-hidden /> Message {shop.name} about this order
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--block"
          onClick={async () => {
            await service.sendMessage({
              conversationId: order.conversationId,
              sender: 'customer',
              text: `Hi! Please can I repeat order ${order.ref} sometime? Same items if you have them.`,
            });
            notify('Repeat request added to your demo chat.');
            navigate({ name: 'chat', conversationId: order.conversationId });
          }}
        >
          <Repeat size={17} aria-hidden /> Ask shop to repeat this order
        </button>
        {canCancel && (
          <button type="button" className="btn btn--danger-ghost btn--block" onClick={() => setCancelOpen(true)}>
            <XCircle size={17} aria-hidden /> Cancel this demo order
          </button>
        )}
      </div>

      {cancelOpen && (
        <Modal title={`Cancel order ${order.ref}?`} onClose={() => setCancelOpen(false)}>
          <p>
            The order will be marked cancelled across the customer, shop and delivery demo views, and noted in your
            chat. No payment is involved in this prototype.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setCancelOpen(false)}>
              Keep order
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={async () => {
                await service.cancelOrder(order.id, 'customer');
                setCancelOpen(false);
                notify(`Order ${order.ref} cancelled (demo).`);
              }}
            >
              Cancel order
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
