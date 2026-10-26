import { useEffect, useState, type FormEvent } from 'react';
import {
  Bike,
  Check,
  ChefHat,
  CircleAlert,
  PackageCheck,
  Pencil,
  Plus,
  SendHorizonal,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { useDemoStore } from '../../store/DemoStore';
import { ordersForConversation } from '../../store/selectors';
import type { Conversation, LineItem, Order } from '../../types';
import { formatZAR } from '../../utils/format';
import {
  calculateTotals,
  canTransition,
  isBasketOrder,
  lineTotal,
  nextStatus,
  STATUS_LABELS,
  validateLineItem,
} from '../../utils/orderWorkflow';
import { Modal, StatusPill, useToast } from '../../components/ui';

function ItemEditor({
  order,
  item,
  onDone,
}: {
  order: Order;
  item: LineItem;
  onDone: () => void;
}) {
  const { service } = useDemoStore();
  const [description, setDescription] = useState(item.description);
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [unitPrice, setUnitPrice] = useState(String(item.unitPrice));
  const [note, setNote] = useState(item.note ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = { description, quantity: Number(quantity), unitPrice: Number(unitPrice) };
    const validation = validateLineItem(parsed);
    setErrors(validation.errors);
    if (!validation.valid) return;
    await service.updateItem(order.id, { id: item.id, ...parsed, note: note.trim() || undefined });
    onDone();
  };

  return (
    <form className="item-editor" onSubmit={save}>
      <label>
        Description
        <input value={description} onChange={(e) => setDescription(e.target.value)} aria-invalid={!!errors.description} />
        {errors.description && <span className="form-error">{errors.description}</span>}
      </label>
      <div className="item-editor__row">
        <label>
          Qty
          <input inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} aria-invalid={!!errors.quantity} />
          {errors.quantity && <span className="form-error">{errors.quantity}</span>}
        </label>
        <label>
          Unit price (R)
          <input inputMode="decimal" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} aria-invalid={!!errors.unitPrice} />
          {errors.unitPrice && <span className="form-error">{errors.unitPrice}</span>}
        </label>
      </div>
      <label>
        Note (e.g. substitution agreed)
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional — customer sees this" />
      </label>
      <div className="item-editor__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary btn--sm">
          <Check size={15} aria-hidden /> Save item
        </button>
      </div>
    </form>
  );
}

function AddItemForm({ order }: { order: Order }) {
  const { service } = useDemoStore();
  const { notify } = useToast();
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = { description, quantity: Number(quantity), unitPrice: Number(unitPrice) };
    const validation = validateLineItem(parsed);
    setErrors(validation.errors);
    if (!validation.valid) return;
    await service.addItem(order.id, { ...parsed, note: note.trim() || undefined });
    setDescription('');
    setQuantity('1');
    setUnitPrice('');
    setNote('');
    notify('Item added to the order summary.');
  };

  return (
    <form className="item-editor" onSubmit={submit}>
      <h4>
        <Plus size={16} aria-hidden /> Add agreed item
      </h4>
      <label>
        Description — as agreed in chat
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Chicken braai pack ±2 kg"
          aria-invalid={!!errors.description}
        />
        {errors.description && <span className="form-error">{errors.description}</span>}
      </label>
      <div className="item-editor__row">
        <label>
          Qty
          <input inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} aria-invalid={!!errors.quantity} />
          {errors.quantity && <span className="form-error">{errors.quantity}</span>}
        </label>
        <label>
          Unit price (R)
          <input
            inputMode="decimal"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="e.g. 149.99"
            aria-invalid={!!errors.unitPrice}
          />
          {errors.unitPrice && <span className="form-error">{errors.unitPrice}</span>}
        </label>
      </div>
      <label>
        Note (optional)
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Substituted brand, as discussed" />
      </label>
      <button type="submit" className="btn btn--primary btn--sm btn--block">
        Add to summary
      </button>
      <p className="panel__lede">No catalogue needed — type what you and the customer agreed. Demo prices only in Phase 1.</p>
    </form>
  );
}

const ADVANCE_LABELS: Partial<Record<Order['status'], string>> = {
  'awaiting-shop': 'Accept order',
  accepted: 'Start preparing',
  preparing: 'Order ready — next step',
};

function StatusActions({ order }: { order: Order }) {
  const { service } = useDemoStore();
  const { notify } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const next = nextStatus(order);

  // The shop drives fulfilment up to hand-off; the driver drives it after assignment.
  const shopDrivenNext =
    next && ['accepted', 'preparing', 'ready-collection', 'awaiting-driver', 'completed'].includes(next) ? next : null;

  const nextLabel =
    order.status === 'preparing' && order.fulfilment === 'delivery'
      ? 'Ready — request delivery partner'
      : order.status === 'preparing'
        ? 'Ready for collection'
        : order.status === 'ready-collection'
          ? 'Customer collected — complete'
          : (ADVANCE_LABELS[order.status] ?? (next ? STATUS_LABELS[next] : ''));

  return (
    <div className="status-actions">
      {shopDrivenNext && (
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={async () => {
            await service.setOrderStatus(order.id, shopDrivenNext);
            notify(
              shopDrivenNext === 'awaiting-driver'
                ? `Delivery job published for ${order.ref}. Switch to Delivery partner to accept it.`
                : `Order ${order.ref}: ${STATUS_LABELS[shopDrivenNext]}.`,
            );
          }}
        >
          {order.status === 'preparing' && order.fulfilment === 'delivery' ? (
            <Bike size={17} aria-hidden />
          ) : order.status === 'ready-collection' ? (
            <PackageCheck size={17} aria-hidden />
          ) : (
            <ChefHat size={17} aria-hidden />
          )}
          {nextLabel}
        </button>
      )}
      {order.status === 'awaiting-driver' && (
        <p className="status-actions__hint">
          <Bike size={15} aria-hidden /> Delivery job is live on the demo job board, waiting for a partner to accept.
        </p>
      )}
      {['driver-assigned', 'collected', 'out-for-delivery'].includes(order.status) && (
        <p className="status-actions__hint">With the delivery partner now — progress continues in the Delivery workspace (Demo Mode).</p>
      )}
      {canTransition(order, 'cancelled') && (
        <button type="button" className="btn btn--danger-ghost btn--sm btn--block" onClick={() => setCancelOpen(true)}>
          Cancel order / report issue
        </button>
      )}
      {cancelOpen && (
        <Modal title={`Cancel order ${order.ref}?`} onClose={() => setCancelOpen(false)}>
          <p>
            Use this if you can’t fulfil the order (out of stock, closed early, and so on). The customer sees the
            cancellation in their chat and tracking immediately. In a live system you’d add a reason and the customer
            would be refunded any payment automatically.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setCancelOpen(false)}>
              Keep order
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={async () => {
                await service.cancelOrder(order.id, 'shop');
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

export function OrderPanel({
  conversation,
  focusOrderId,
}: {
  conversation: Conversation;
  focusOrderId?: string;
}) {
  const { state, service } = useDemoStore();
  const { notify } = useToast();
  const orders = ordersForConversation(state, conversation.id);
  const openBasket = orders.find(isBasketOrder);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (focusOrderId) setSelectedId(focusOrderId);
  }, [focusOrderId]);

  const selected = orders.find((o) => o.id === selectedId) ?? openBasket ?? orders[0];
  const totals = selected ? calculateTotals(selected.items, selected.fulfilment, selected.deliveryFee) : undefined;
  const editable = selected ? isBasketOrder(selected) : false;

  return (
    <section className="order-panel" aria-label="Order panel">
      <div className="order-panel__head">
        <h3>
          <ShoppingBag size={18} aria-hidden /> Orders in this chat
        </h3>
        {!openBasket && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={async () => {
              const id = await service.ensureOrderDraft(conversation.id);
              if (id) setSelectedId(id);
              notify('Order summary started — add the items you agreed in chat.');
            }}
          >
            <Plus size={15} aria-hidden /> Start order summary
          </button>
        )}
      </div>

      {orders.length === 0 && (
        <p className="panel__empty">
          No orders yet in this conversation. Chat first, agree the items, then start a summary — no product catalogue
          required.
        </p>
      )}

      {orders.length > 1 && (
        <div className="chip-row" role="group" aria-label="Choose an order">
          {orders.map((order) => (
            <button
              key={order.id}
              type="button"
              className={`chip ${selected?.id === order.id ? 'chip--active' : ''}`}
              onClick={() => setSelectedId(order.id)}
              aria-pressed={selected?.id === order.id}
            >
              {order.ref}
            </button>
          ))}
        </div>
      )}

      {selected && totals && (
        <div className="order-panel__card">
          <div className="order-panel__title">
            <strong>
              {selected.ref} · {selected.fulfilment === 'delivery' ? 'Delivery' : 'Collection'}
            </strong>
            <StatusPill status={selected.status} />
          </div>

          {selected.items.length === 0 ? (
            <p className="panel__empty">No items yet — add what you agreed with the customer below.</p>
          ) : (
            <ul className="panel-items">
              {selected.items.map((item) => (
                <li key={item.id}>
                  {editingItemId === item.id && editable ? (
                    <ItemEditor order={selected} item={item} onDone={() => setEditingItemId(null)} />
                  ) : (
                    <>
                      <span className="panel-items__desc">
                        <strong>
                          {item.quantity} × {item.description}
                        </strong>
                        <small>
                          {formatZAR(item.unitPrice)} each{item.note ? ` · ${item.note}` : ''}
                        </small>
                      </span>
                      <span className="panel-items__side">
                        <strong>{formatZAR(lineTotal(item))}</strong>
                        {editable && (
                          <span className="panel-items__btns">
                            <button type="button" className="icon-btn icon-btn--sm" onClick={() => setEditingItemId(item.id)} aria-label={`Edit ${item.description}`}>
                              <Pencil size={15} aria-hidden />
                            </button>
                            <button
                              type="button"
                              className="icon-btn icon-btn--sm"
                              onClick={() => void service.removeItem(selected.id, item.id)}
                              aria-label={`Remove ${item.description}`}
                            >
                              <Trash2 size={15} aria-hidden />
                            </button>
                          </span>
                        )}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          <dl className="order-totals order-totals--standalone">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatZAR(totals.subtotal)}</dd>
            </div>
            <div>
              <dt>{selected.fulfilment === 'delivery' ? 'Delivery fee (demo)' : 'Collection'}</dt>
              <dd>{selected.fulfilment === 'delivery' ? formatZAR(totals.deliveryFee) : 'Free'}</dd>
            </div>
            <div className="order-totals__grand">
              <dt>Total</dt>
              <dd>{formatZAR(totals.total)}</dd>
            </div>
          </dl>

          {selected.changeRequests.filter((r) => r.status === 'pending').length > 0 && (
            <div className="change-requests" role="group" aria-label="Customer change requests">
              <h4>
                <CircleAlert size={16} aria-hidden /> Customer change requests
              </h4>
              {selected.changeRequests
                .filter((r) => r.status === 'pending')
                .map((request) => (
                  <div key={request.id} className="change-requests__row">
                    <span>{request.note}</span>
                    <span className="change-requests__btns">
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={async () => {
                          await service.resolveChange(selected.id, request.id, true);
                          notify('Change approved — the customer’s basket has been updated.');
                        }}
                      >
                        <Check size={14} aria-hidden /> Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={async () => {
                          await service.resolveChange(selected.id, request.id, false);
                          notify('Change declined — consider suggesting an alternative in the chat.');
                        }}
                      >
                        <X size={14} aria-hidden /> Decline
                      </button>
                    </span>
                  </div>
                ))}
            </div>
          )}

          {editable && <AddItemForm order={selected} />}

          {selected.status === 'draft' && (
            <button
              type="button"
              className="btn btn--gold btn--block"
              disabled={selected.items.length === 0}
              onClick={async () => {
                await service.sendOrderSummary(selected.id);
                notify(`Summary ${selected.ref} sent — switch to Customer view to review & confirm it.`);
              }}
            >
              <SendHorizonal size={17} aria-hidden /> Send summary to customer
            </button>
          )}
          {selected.status === 'draft' && selected.items.length === 0 && (
            <p className="form-error">Add at least one agreed item before sending the summary.</p>
          )}
          {selected.status === 'awaiting-customer' && (
            <p className="status-actions__hint">
              Sent to the customer. Edits update their basket live and post a note in the chat. Prices lock once they
              confirm.
            </p>
          )}

          {!isBasketOrder(selected) && selected.status !== 'cancelled' && <StatusActions order={selected} />}
          {selected.status === 'cancelled' && <p className="status-actions__hint">This demo order was cancelled.</p>}
        </div>
      )}
    </section>
  );
}
