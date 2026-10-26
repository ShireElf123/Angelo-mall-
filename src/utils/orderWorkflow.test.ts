import { describe, expect, it } from 'vitest';
import type { LineItem, Order } from '../types';
import { formatZAR } from './format';
import {
  calculateTotals,
  canTransition,
  lineTotal,
  nextStatus,
  timelineSteps,
  validateLineItem,
} from './orderWorkflow';

const items: LineItem[] = [
  { id: 'a', description: 'White bread loaf 700 g', quantity: 1, unitPrice: 19.99 },
  { id: 'b', description: 'Full-cream milk 2 L', quantity: 2, unitPrice: 44.99 },
];

describe('basket totals (ZAR)', () => {
  it('sums line totals with cent-safe rounding', () => {
    expect(lineTotal(items[1])).toBe(89.98);
    const totals = calculateTotals(items, 'collection', 35);
    expect(totals.subtotal).toBe(109.97);
    expect(totals.deliveryFee).toBe(0);
    expect(totals.total).toBe(109.97);
    expect(totals.itemCount).toBe(3);
  });

  it('adds the delivery fee only for delivery orders', () => {
    const totals = calculateTotals(items, 'delivery', 35);
    expect(totals.deliveryFee).toBe(35);
    expect(totals.total).toBe(144.97);
  });

  it('formats South African rand via en-ZA', () => {
    const formatted = formatZAR(219.96);
    expect(formatted).toContain('R');
    expect(formatted).toContain('219');
    expect(formatted).toContain('96');
  });
});

describe('line item validation', () => {
  it('rejects empty descriptions, bad quantities and non-positive prices', () => {
    expect(validateLineItem({ description: ' ', quantity: 1, unitPrice: 10 }).valid).toBe(false);
    expect(validateLineItem({ description: 'Bread', quantity: 0, unitPrice: 10 }).valid).toBe(false);
    expect(validateLineItem({ description: 'Bread', quantity: 1.5, unitPrice: 10 }).valid).toBe(false);
    expect(validateLineItem({ description: 'Bread', quantity: 1, unitPrice: 0 }).valid).toBe(false);
    expect(validateLineItem({ description: 'Bread', quantity: 2, unitPrice: 19.99 }).valid).toBe(true);
  });
});

function orderLike(status: Order['status'], fulfilment: Order['fulfilment']): Order {
  return {
    id: 'o1',
    ref: 'AMG-1',
    conversationId: 'c1',
    shopId: 's1',
    customerId: 'cu1',
    customerName: 'Demo',
    destinationArea: 'Nigel Central',
    items,
    status,
    fulfilment,
    deliveryFee: 35,
    changeRequests: [],
    history: [{ status, at: 1000, note: '' }],
    createdAt: 1000,
    updatedAt: 1000,
  };
}

describe('status workflow', () => {
  it('only allows the next fulfilment-appropriate step', () => {
    expect(nextStatus(orderLike('preparing', 'delivery'))).toBe('awaiting-driver');
    expect(nextStatus(orderLike('preparing', 'collection'))).toBe('ready-collection');
    expect(canTransition(orderLike('preparing', 'collection'), 'out-for-delivery')).toBe(false);
    expect(canTransition(orderLike('accepted', 'delivery'), 'delivered')).toBe(false);
  });

  it('walks the draft → basket → confirmed handshake explicitly', () => {
    expect(canTransition(orderLike('draft', 'delivery'), 'awaiting-customer')).toBe(true);
    expect(canTransition(orderLike('draft', 'delivery'), 'accepted')).toBe(false);
    expect(canTransition(orderLike('awaiting-customer', 'delivery'), 'awaiting-shop')).toBe(true);
  });

  it('never leaves a cancelled or finished order', () => {
    expect(canTransition(orderLike('cancelled', 'delivery'), 'accepted')).toBe(false);
    expect(canTransition(orderLike('delivered', 'delivery'), 'cancelled')).toBe(false);
    expect(nextStatus(orderLike('delivered', 'delivery'))).toBeNull();
  });

  it('timeline shows only statuses relevant to the fulfilment method', () => {
    const deliverySteps = timelineSteps(orderLike('preparing', 'delivery')).map((s) => s.status);
    expect(deliverySteps).toContain('awaiting-driver');
    expect(deliverySteps).not.toContain('ready-collection');

    const collectionSteps = timelineSteps(orderLike('preparing', 'collection')).map((s) => s.status);
    expect(collectionSteps).toContain('ready-collection');
    expect(collectionSteps).not.toContain('driver-assigned');
  });
});
