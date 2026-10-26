import { Bike, Check, ShoppingBag } from 'lucide-react';
import type { Order } from '../types';
import { formatTime, formatZAR } from '../utils/format';
import { calculateTotals, lineTotal, timelineSteps } from '../utils/orderWorkflow';
import { StatusPill } from './ui';

/** Read-only items + totals block reused by basket, chat cards and tracking. */
export function OrderItemsTable({ order, compact = false }: { order: Order; compact?: boolean }) {
  const totals = calculateTotals(order.items, order.fulfilment, order.deliveryFee);
  return (
    <div className={`order-items ${compact ? 'order-items--compact' : ''}`}>
      <ul>
        {order.items.map((item) => (
          <li key={item.id}>
            <div className="order-items__desc">
              <span className="order-items__qty" aria-label={`Quantity ${item.quantity}`}>
                {item.quantity} ×
              </span>
              <span>
                {item.description}
                {item.note && <small className="order-items__note">{item.note}</small>}
              </span>
            </div>
            <div className="order-items__prices">
              {!compact && <small>{formatZAR(item.unitPrice)} each</small>}
              <strong>{formatZAR(lineTotal(item))}</strong>
            </div>
          </li>
        ))}
      </ul>
      <dl className="order-totals">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatZAR(totals.subtotal)}</dd>
        </div>
        <div>
          <dt>{order.fulfilment === 'delivery' ? 'Delivery fee (demo)' : 'Collection'}</dt>
          <dd>{order.fulfilment === 'delivery' ? formatZAR(totals.deliveryFee) : 'Free'}</dd>
        </div>
        <div className="order-totals__grand">
          <dt>Total</dt>
          <dd>{formatZAR(totals.total)}</dd>
        </div>
      </dl>
      <p className="order-items__vat-note">Demo prices for illustration. In a live rollout, prices are confirmed by the shop before you order.</p>
    </div>
  );
}

export function FulfilmentLabel({ order }: { order: Order }) {
  return order.fulfilment === 'delivery' ? (
    <span className="fulfilment-label">
      <Bike size={15} aria-hidden /> Delivery to {order.destinationArea} (area only)
    </span>
  ) : (
    <span className="fulfilment-label">
      <ShoppingBag size={15} aria-hidden /> Collection at the shop
    </span>
  );
}

/** Fulfilment-aware progress timeline (only relevant states are shown). */
export function OrderTimeline({ order }: { order: Order }) {
  const steps = timelineSteps(order);
  return (
    <div className="timeline-wrap">
      <div className="timeline-head">
        <h3>Order progress</h3>
        <StatusPill status={order.status} />
      </div>
      <ol className="timeline">
        {steps.map((step) => (
          <li key={step.status} className={`timeline__step timeline__step--${step.state}`}>
            <span className="timeline__dot" aria-hidden>
              {step.state === 'done' && <Check size={13} />}
            </span>
            <span className="timeline__label">
              {step.label}
              {step.at && <small>{formatTime(step.at)}</small>}
            </span>
          </li>
        ))}
      </ol>
      <p className="timeline-note">
        Demo timeline — statuses change when the shop or delivery workspace (Demo Mode switch above) updates this
        order. No live tracking exists in Phase 1.
      </p>
    </div>
  );
}
