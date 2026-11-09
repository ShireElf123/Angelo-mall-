/**
 * Order workflow rules shared by the customer, retailer and delivery screens.
 * One implementation of status transitions and totals — never duplicated per
 * screen — so a Phase 2 API can enforce the identical rules server-side.
 */
import type { FulfilmentMethod, LineItem, Order, OrderStatus } from '../types';
import { roundMoney } from './format';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Shop is preparing your summary',
  'awaiting-customer': 'Awaiting your confirmation',
  'awaiting-shop': 'Awaiting shop acceptance',
  accepted: 'Accepted by shop',
  preparing: 'Being prepared',
  'awaiting-driver': 'Awaiting driver assignment',
  'ready-collection': 'Ready for collection',
  'driver-assigned': 'Driver assigned',
  collected: 'Collected by driver',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/** Ordered happy-path steps per fulfilment method (post-confirmation). */
export const DELIVERY_FLOW: OrderStatus[] = [
  'awaiting-shop',
  'accepted',
  'preparing',
  'awaiting-driver',
  'driver-assigned',
  'collected',
  'out-for-delivery',
  'delivered',
];

export const COLLECTION_FLOW: OrderStatus[] = [
  'awaiting-shop',
  'accepted',
  'preparing',
  'ready-collection',
  'completed',
];

export function flowFor(fulfilment: FulfilmentMethod): OrderStatus[] {
  return fulfilment === 'delivery' ? DELIVERY_FLOW : COLLECTION_FLOW;
}

/** Statuses a given order may move to next (excluding cancellation). */
export function nextStatus(order: Pick<Order, 'status' | 'fulfilment'>): OrderStatus | null {
  const flow = flowFor(order.fulfilment);
  const index = flow.indexOf(order.status);
  if (index === -1 || index >= flow.length - 1) return null;
  return flow[index + 1];
}

export function canTransition(
  order: Pick<Order, 'status' | 'fulfilment'>,
  to: OrderStatus,
): boolean {
  if (order.status === 'cancelled') return false;
  if (to === 'cancelled') {
    return !['delivered', 'completed'].includes(order.status);
  }
  // Pre-confirmation handshake handled explicitly by draft/basket actions.
  if (order.status === 'draft') return to === 'awaiting-customer';
  if (order.status === 'awaiting-customer') return to === 'awaiting-shop';
  return nextStatus(order) === to;
}

export interface TimelineStep {
  status: OrderStatus;
  label: string;
  state: 'done' | 'current' | 'upcoming';
  at?: number;
}

/** Build the customer-facing timeline, showing only fulfilment-relevant steps. */
export function timelineSteps(order: Order): TimelineStep[] {
  if (order.status === 'cancelled') {
    const cancelledAt = [...order.history].reverse().find((h) => h.status === 'cancelled')?.at;
    return [{ status: 'cancelled', label: STATUS_LABELS.cancelled, state: 'current', at: cancelledAt }];
  }
  const flow = flowFor(order.fulfilment);
  const currentIndex = flow.indexOf(order.status);
  return flow.map((status, index) => ({
    status,
    label: STATUS_LABELS[status],
    state: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming',
    at: order.history.find((h) => h.status === status)?.at,
  }));
}

export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

export function lineTotal(item: LineItem): number {
  return roundMoney(item.quantity * item.unitPrice);
}

export function calculateTotals(
  items: LineItem[],
  fulfilment: FulfilmentMethod,
  deliveryFee: number,
): OrderTotals {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  const appliedDeliveryFee = fulfilment === 'delivery' ? roundMoney(deliveryFee) : 0;
  return {
    subtotal,
    deliveryFee: appliedDeliveryFee,
    total: roundMoney(subtotal + appliedDeliveryFee),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export interface LineItemValidation {
  valid: boolean;
  errors: Partial<Record<'description' | 'quantity' | 'unitPrice', string>>;
}

/** Validation for retailer-entered agreed items. Phase 2 must re-validate server-side. */
export function validateLineItem(input: {
  description: string;
  quantity: number;
  unitPrice: number;
}): LineItemValidation {
  const errors: LineItemValidation['errors'] = {};
  if (!input.description.trim()) errors.description = 'Add a clear item description.';
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 99) {
    errors.quantity = 'Quantity must be a whole number between 1 and 99.';
  }
  if (!Number.isFinite(input.unitPrice) || input.unitPrice <= 0 || input.unitPrice > 100000) {
    errors.unitPrice = 'Enter the agreed price in rand (greater than R 0).';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function isConfirmedOrder(order: Order): boolean {
  return !['draft', 'awaiting-customer', 'cancelled'].includes(order.status);
}

export function isBasketOrder(order: Order): boolean {
  return order.status === 'draft' || order.status === 'awaiting-customer';
}
