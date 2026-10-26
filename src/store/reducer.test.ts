/**
 * End-to-end demonstration scenario, exercised against the pure reducer.
 * This is the Phase 1 acceptance journey: customer chat → shop summary →
 * customer confirmation → shop fulfilment → delivery partner → delivered,
 * all through ONE shared state.
 */
import { describe, expect, it } from 'vitest';
import { createSeedState } from '../data/seed';
import { demoReducer, type DemoAction } from './reducer';
import {
  messagesForConversation,
  openBasketForConversation,
  orderById,
} from './selectors';
import type { DemoState } from '../types';

let tick = 1_700_000_000_000;
const now = () => (tick += 60_000);

function run(state: DemoState, action: DemoAction): DemoState {
  return demoReducer(state, action);
}

describe('seed scenario', () => {
  it('starts with the scripted Mzansi Fresh conversation and a reviewable basket', () => {
    const state = createSeedState(1_700_000_000_000);
    const messages = messagesForConversation(state, 'conv-mzansi-thandi');
    expect(messages.some((m) => m.text === 'Hi, I need bread, milk, eggs and mince.')).toBe(true);
    expect(messages.some((m) => m.kind === 'order-card')).toBe(true);
    const basket = openBasketForConversation(state, 'conv-mzansi-thandi');
    expect(basket?.status).toBe('awaiting-customer');
    expect(basket?.items).toHaveLength(4);
  });

  it('customer and shop both append to the same conversation state', () => {
    let state = createSeedState(now());
    const before = messagesForConversation(state, 'conv-mzansi-thandi').length;
    state = run(state, {
      type: 'SEND_MESSAGE',
      conversationId: 'conv-mzansi-thandi',
      sender: 'customer',
      text: 'Please add butter if you have it.',
      now: now(),
    });
    state = run(state, {
      type: 'SEND_MESSAGE',
      conversationId: 'conv-mzansi-thandi',
      sender: 'shop',
      text: 'Added — see your updated basket.',
      now: now(),
    });
    const after = messagesForConversation(state, 'conv-mzansi-thandi');
    expect(after).toHaveLength(before + 2);
    expect(after[after.length - 2].sender).toBe('customer');
    expect(after[after.length - 1].sender).toBe('shop');
  });
});

describe('full chat → order → delivery journey', () => {
  it('runs the complete cross-role scenario on shared state', () => {
    let state = createSeedState(now());

    // Shop staff starts a fresh summary for Sipho (unread braai-pack chat).
    state = run(state, { type: 'CREATE_ORDER_DRAFT', conversationId: 'conv-mzansi-Sipho', now: now() });
    const draft = openBasketForConversation(state, 'conv-mzansi-Sipho');
    expect(draft?.status).toBe('draft');

    state = run(state, {
      type: 'ADD_ORDER_ITEM',
      orderId: draft!.id,
      item: { description: 'Chicken braai pack ±2 kg', quantity: 1, unitPrice: 189.99 },
      now: now(),
    });
    state = run(state, {
      type: 'ADD_ORDER_ITEM',
      orderId: draft!.id,
      item: { description: 'Charcoal 4 kg + firelighters', quantity: 1, unitPrice: 79.99 },
      now: now(),
    });

    // Customer cannot confirm a draft that was never sent.
    const unsent = run(state, { type: 'CONFIRM_ORDER', orderId: draft!.id, fulfilment: 'delivery', now: now() });
    expect(orderById(unsent, draft!.id)?.status).toBe('draft');

    state = run(state, { type: 'SEND_ORDER_SUMMARY', orderId: draft!.id, now: now() });
    expect(orderById(state, draft!.id)?.status).toBe('awaiting-customer');

    // Customer requests 2 braai packs — a request, not a silent edit.
    const braaiItem = orderById(state, draft!.id)!.items[0];
    state = run(state, {
      type: 'REQUEST_CHANGE',
      orderId: draft!.id,
      itemId: braaiItem.id,
      changeType: 'quantity',
      requestedQuantity: 2,
      now: now(),
    });
    expect(orderById(state, draft!.id)!.items[0].quantity).toBe(1); // unchanged until approved

    // Pending request blocks confirmation.
    const blocked = run(state, { type: 'CONFIRM_ORDER', orderId: draft!.id, fulfilment: 'delivery', now: now() });
    expect(orderById(blocked, draft!.id)?.status).toBe('awaiting-customer');

    // Shop approves → basket updates, prices untouched.
    const request = orderById(state, draft!.id)!.changeRequests.find((r) => r.status === 'pending')!;
    state = run(state, { type: 'RESOLVE_CHANGE', orderId: draft!.id, requestId: request.id, approve: true, now: now() });
    const approved = orderById(state, draft!.id)!;
    expect(approved.items[0].quantity).toBe(2);
    expect(approved.items[0].unitPrice).toBe(189.99);

    // Customer confirms explicitly → awaiting shop acceptance.
    state = run(state, { type: 'CONFIRM_ORDER', orderId: draft!.id, fulfilment: 'delivery', now: now() });
    expect(orderById(state, draft!.id)?.status).toBe('awaiting-shop');

    // Shop works the order; skipping steps is rejected.
    const skipped = run(state, { type: 'SET_ORDER_STATUS', orderId: draft!.id, to: 'delivered', now: now() });
    expect(orderById(skipped, draft!.id)?.status).toBe('awaiting-shop');

    state = run(state, { type: 'SET_ORDER_STATUS', orderId: draft!.id, to: 'accepted', now: now() });
    state = run(state, { type: 'SET_ORDER_STATUS', orderId: draft!.id, to: 'preparing', now: now() });
    state = run(state, { type: 'SET_ORDER_STATUS', orderId: draft!.id, to: 'awaiting-driver', now: now() });

    const job = state.deliveryJobs.find((j) => j.orderId === draft!.id);
    expect(job?.status).toBe('available');
    expect(job?.destinationArea).toBe('Alra Park'); // general area only

    // Delivery partner completes the job; the order follows.
    state = run(state, { type: 'ACCEPT_JOB', jobId: job!.id, now: now() });
    expect(orderById(state, draft!.id)?.status).toBe('driver-assigned');
    state = run(state, { type: 'ADVANCE_JOB', jobId: job!.id, to: 'collected', now: now() });
    state = run(state, { type: 'ADVANCE_JOB', jobId: job!.id, to: 'out-for-delivery', now: now() });
    state = run(state, { type: 'ADVANCE_JOB', jobId: job!.id, to: 'delivered', now: now() });
    expect(orderById(state, draft!.id)?.status).toBe('delivered');

    // The customer conversation narrates the whole journey via system messages.
    const systemNotes = messagesForConversation(state, 'conv-mzansi-Sipho').filter((m) => m.kind === 'system');
    expect(systemNotes.some((m) => m.text.includes('confirmed'))).toBe(true);
    expect(systemNotes.some((m) => m.text.includes('Delivered'))).toBe(true);
  });

  it('a failed delivery re-publishes the job and returns the order to awaiting-driver', () => {
    let state = createSeedState(now());
    const job = state.deliveryJobs.find((j) => j.id === 'job-demo-1004')!;
    state = run(state, { type: 'ACCEPT_JOB', jobId: job.id, now: now() });
    state = run(state, { type: 'ADVANCE_JOB', jobId: job.id, to: 'failed', now: now() });
    expect(orderById(state, 'ord-demo-1004')?.status).toBe('awaiting-driver');
    const replacement = state.deliveryJobs.find((j) => j.orderId === 'ord-demo-1004' && j.status === 'available');
    expect(replacement).toBeDefined();
    expect(replacement!.id).not.toBe(job.id);
  });
});

describe('demo reset', () => {
  it('restores the seed scenario while preserving the selected role', () => {
    let state = createSeedState(now());
    state = run(state, { type: 'SET_ROLE', role: 'delivery' });
    state = run(state, {
      type: 'SEND_MESSAGE',
      conversationId: 'conv-mzansi-thandi',
      sender: 'customer',
      text: 'Extra message that reset should remove',
      now: now(),
    });
    state = run(state, { type: 'RESET_DEMO', now: now() });
    expect(state.role).toBe('delivery');
    const texts = messagesForConversation(state, 'conv-mzansi-thandi').map((m) => m.text);
    expect(texts).not.toContain('Extra message that reset should remove');
    expect(orderById(state, 'ord-demo-1001')?.status).toBe('awaiting-customer');
  });
});
