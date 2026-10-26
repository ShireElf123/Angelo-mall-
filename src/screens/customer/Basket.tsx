import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bike,
  Check,
  Lock,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Undo2,
} from 'lucide-react';
import type { Route } from '../../router';
import { useDemoStore } from '../../store/DemoStore';
import { getShop, orderById } from '../../store/selectors';
import type { FulfilmentMethod } from '../../types';
import { formatZAR } from '../../utils/format';
import { calculateTotals, isBasketOrder, lineTotal } from '../../utils/orderWorkflow';
import { EmptyState, InfoBanner, Modal, ShopAvatar, StatusPill, useToast } from '../../components/ui';

export function BasketScreen({
  orderId,
  navigate,
}: {
  orderId: string;
  navigate: (route: Route) => void;
}) {
  const { state, service } = useDemoStore();
  const { notify } = useToast();
  const order = orderById(state, orderId);
  const shop = order ? getShop(state, order.shopId) : undefined;
  const [fulfilment, setFulfilment] = useState<FulfilmentMethod>(order?.fulfilment ?? 'collection');
  const [requestedQty, setRequestedQty] = useState<Record<string, number>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const totals = useMemo(
    () => (order ? calculateTotals(order.items, fulfilment, shop?.deliveryFee ?? order.deliveryFee) : undefined),
    [order, fulfilment, shop?.deliveryFee],
  );

  if (!order || !shop || !totals) {
    return (
      <div className="page page--narrow">
        <EmptyState
          icon={<ShoppingBag size={30} aria-hidden />}
          title="Basket not found"
          description="This demo basket may have been cleared by a reset. Your chats are the best place to pick things up again."
        >
          <button type="button" className="btn btn--primary" onClick={() => navigate({ name: 'chats' })}>
            Go to chats
          </button>
        </EmptyState>
      </div>
    );
  }

  if (!isBasketOrder(order)) {
    return (
      <div className="page page--narrow">
        <EmptyState
          icon={<Check size={30} aria-hidden />}
          title={`Order ${order.ref} is already confirmed`}
          description="A chat message is never a purchase on its own — this one was explicitly confirmed, so it now lives in order tracking."
        >
          <button type="button" className="btn btn--primary" onClick={() => navigate({ name: 'order', orderId: order.id })}>
            Track this order
          </button>
        </EmptyState>
      </div>
    );
  }

  const pendingRequests = order.changeRequests.filter((r) => r.status === 'pending');
  const confirmBlocked = pendingRequests.length > 0 || order.items.length === 0;

  const requestQuantity = (itemId: string) => {
    const item = order.items.find((i) => i.id === itemId);
    const next = requestedQty[itemId] ?? item?.quantity ?? 1;
    if (!item || next === item.quantity) return;
    void service.requestChange({ orderId: order.id, itemId, changeType: 'quantity', requestedQuantity: next });
    notify('Change requested — the shop must approve it before your basket updates. See it in your chat.');
  };

  const doConfirm = async () => {
    await service.confirmOrder(order.id, fulfilment);
    setConfirmOpen(false);
    notify(`Demo order ${order.ref} confirmed. Now switch to Shop staff to accept it!`);
    navigate({ name: 'order', orderId: order.id });
  };

  return (
    <div className="page page--narrow">
      <button type="button" className="back-btn" onClick={() => navigate({ name: 'chat', conversationId: order.conversationId })}>
        <ArrowLeft size={18} aria-hidden /> Back to chat
      </button>

      <div className="basket-head">
        <ShopAvatar shop={shop} />
        <div>
          <h1>Basket {order.ref}</h1>
          <p>{shop.name} · prepared from your conversation</p>
        </div>
        <StatusPill status={order.status} />
      </div>

      {order.status === 'draft' ? (
        <InfoBanner>
          The shop is still preparing this summary in the demo — items may change. You’ll be able to confirm once they
          send it. (Open the <strong>Shop staff</strong> workspace to finish and send it.)
        </InfoBanner>
      ) : (
        <InfoBanner>
          <Lock size={15} aria-hidden /> Prices below were confirmed by the shop and can’t be edited here. Need a
          different quantity? Send a <strong>change request</strong> — the shop approves it in the chat.
        </InfoBanner>
      )}

      <section className="panel" aria-label="Basket items">
        {order.items.length === 0 ? (
          <p className="panel__empty">No items yet. Chat to the shop and they’ll add agreed items here.</p>
        ) : (
          <ul className="basket-items">
            {order.items.map((item) => {
              const pending = pendingRequests.find((r) => r.itemId === item.id);
              const draftQty = requestedQty[item.id] ?? item.quantity;
              return (
                <li key={item.id}>
                  <div className="basket-items__main">
                    <strong>{item.description}</strong>
                    {item.note && <small>{item.note}</small>}
                    <small>{formatZAR(item.unitPrice)} each · shop-confirmed (demo)</small>
                    {pending && (
                      <span className="change-pending">
                        {pending.type === 'remove'
                          ? 'Removal requested — waiting for shop approval'
                          : `Change to ${pending.requestedQuantity} requested — waiting for shop approval`}
                      </span>
                    )}
                  </div>
                  <div className="basket-items__controls">
                    <div className="qty-stepper" aria-label={`Requested quantity for ${item.description}`}>
                      <button
                        type="button"
                        onClick={() => setRequestedQty((q) => ({ ...q, [item.id]: Math.max(1, draftQty - 1) }))}
                        disabled={!!pending || order.status !== 'awaiting-customer'}
                        aria-label="Decrease requested quantity"
                      >
                        <Minus size={15} aria-hidden />
                      </button>
                      <span aria-live="polite">{draftQty}</span>
                      <button
                        type="button"
                        onClick={() => setRequestedQty((q) => ({ ...q, [item.id]: Math.min(99, draftQty + 1) }))}
                        disabled={!!pending || order.status !== 'awaiting-customer'}
                        aria-label="Increase requested quantity"
                      >
                        <Plus size={15} aria-hidden />
                      </button>
                    </div>
                    <strong>{formatZAR(lineTotal(item))}</strong>
                  </div>
                  {order.status === 'awaiting-customer' && !pending && (
                    <div className="basket-items__actions">
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        disabled={draftQty === item.quantity}
                        onClick={() => requestQuantity(item.id)}
                      >
                        Request quantity change
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm btn--danger-ghost"
                        onClick={() => {
                          void service.requestChange({ orderId: order.id, itemId: item.id, changeType: 'remove' });
                          notify('Removal requested — the shop must approve it in the chat.');
                        }}
                      >
                        <Trash2 size={14} aria-hidden /> Request removal
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {pendingRequests.length > 0 && (
        <section className="panel panel--warning" aria-label="Pending change requests">
          <h2>Waiting for the shop</h2>
          <ul className="request-list">
            {pendingRequests.map((request) => (
              <li key={request.id}>
                <span>{request.note}</span>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => void service.withdrawChange(order.id, request.id)}
                >
                  <Undo2 size={14} aria-hidden /> Withdraw
                </button>
              </li>
            ))}
          </ul>
          <p className="panel__lede">
            You can’t confirm while a request is pending — withdraw it, or open the Shop staff workspace to approve it.
          </p>
        </section>
      )}

      <section className="panel" aria-label="Fulfilment and totals">
        <h2>Delivery or collection?</h2>
        <div className="fulfilment-options" role="radiogroup" aria-label="Fulfilment method">
          {shop.fulfilment.includes('delivery') && (
            <label className={`fulfilment-option ${fulfilment === 'delivery' ? 'fulfilment-option--active' : ''}`}>
              <input
                type="radio"
                name="fulfilment"
                value="delivery"
                checked={fulfilment === 'delivery'}
                onChange={() => setFulfilment('delivery')}
              />
              <Bike size={22} aria-hidden />
              <span>
                <strong>Local delivery</strong>
                <small>
                  {formatZAR(shop.deliveryFee)} demo fee · to {order.destinationArea} (area shown to drivers; exact
                  address shared only later in a live system)
                </small>
              </span>
            </label>
          )}
          {shop.fulfilment.includes('collection') && (
            <label className={`fulfilment-option ${fulfilment === 'collection' ? 'fulfilment-option--active' : ''}`}>
              <input
                type="radio"
                name="fulfilment"
                value="collection"
                checked={fulfilment === 'collection'}
                onChange={() => setFulfilment('collection')}
              />
              <ShoppingBag size={22} aria-hidden />
              <span>
                <strong>Collect at the shop</strong>
                <small>Free · {shop.prepTimeLabel}</small>
              </span>
            </label>
          )}
        </div>

        <dl className="order-totals order-totals--standalone">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatZAR(totals.subtotal)}</dd>
          </div>
          <div>
            <dt>{fulfilment === 'delivery' ? 'Delivery fee (demo)' : 'Collection'}</dt>
            <dd>{fulfilment === 'delivery' ? formatZAR(totals.deliveryFee) : 'Free'}</dd>
          </div>
          <div className="order-totals__grand">
            <dt>Total to confirm</dt>
            <dd>{formatZAR(totals.total)}</dd>
          </div>
        </dl>
        <p className="panel__lede">
          No payment is taken in this prototype. In a live rollout, payment terms confirmed with the shop (e.g. pay in
          store / on delivery / secure online payment) would be shown here before you confirm.
        </p>

        <button
          type="button"
          className="btn btn--primary btn--lg btn--block"
          disabled={confirmBlocked || order.status !== 'awaiting-customer'}
          onClick={() => setConfirmOpen(true)}
        >
          Confirm demo order · {formatZAR(totals.total)}
        </button>
        {confirmBlocked && order.items.length > 0 && (
          <p className="form-error" role="note">
            Confirmation is paused while a change request waits for shop approval.
          </p>
        )}
        <button type="button" className="btn btn--ghost btn--block" onClick={() => setCancelOpen(true)}>
          Cancel this basket
        </button>
      </section>

      {confirmOpen && (
        <Modal title={`Confirm demo order ${order.ref}?`} onClose={() => setConfirmOpen(false)}>
          <p>
            You’re confirming <strong>{totals.itemCount} item(s)</strong> from <strong>{shop.name}</strong> for{' '}
            <strong>{formatZAR(totals.total)}</strong> ({fulfilment === 'delivery' ? 'local delivery' : 'collection'}).
            The shop still needs to accept it — you’ll follow progress on the tracking screen and in your chat.
          </p>
          <p className="panel__lede">This creates a demonstration order only. No payment, no real delivery.</p>
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setConfirmOpen(false)}>
              Not yet
            </button>
            <button type="button" className="btn btn--primary" onClick={() => void doConfirm()}>
              Yes — confirm demo order
            </button>
          </div>
        </Modal>
      )}

      {cancelOpen && (
        <Modal title={`Cancel basket ${order.ref}?`} onClose={() => setCancelOpen(false)}>
          <p>The basket will be cancelled and the shop notified in the demo chat. You can ask them for a new summary any time.</p>
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setCancelOpen(false)}>
              Keep basket
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={async () => {
                await service.cancelOrder(order.id, 'customer');
                setCancelOpen(false);
                notify(`Basket ${order.ref} cancelled (demo).`);
                navigate({ name: 'chat', conversationId: order.conversationId });
              }}
            >
              Cancel basket
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
