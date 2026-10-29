/** @vitest-environment jsdom */
import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';
import { OrderDetailScreen } from '../customer/Orders';
import { BasketScreen } from '../customer/Basket';
import { RetailerWorkspace } from '../retailer/RetailerWorkspace';
import { DeliveryWorkspace } from '../delivery/DeliveryWorkspace';
import { AdminWorkspace } from '../admin/AdminWorkspace';
import { createSeedState } from '../../data/seed';
import type { DemoState } from '../../types';

/**
 * Batch 5 UI guards: each new illustration must appear for the state the audit
 * identified — and the copy beside it must never over-claim (no courier route
 * for a collection, nothing "moving" for a cancelled order).
 */
function wrap(node: React.ReactNode) {
  return render(
    <DemoStoreProvider>
      <ToastProvider>{node}</ToastProvider>
    </DemoStoreProvider>,
  );
}

function seed(mutate: (state: DemoState) => void) {
  const state = createSeedState();
  mutate(state);
  window.localStorage.setItem('angelo-mall-go-demo-v1', JSON.stringify(state));
}

function orderById(state: DemoState, id: string) {
  const order = state.orders.find((o) => o.id === id);
  if (!order) throw new Error(`seed order ${id} missing`);
  return order;
}

afterEach(() => window.localStorage.clear());

describe('order status artwork', () => {
  it('a cancelled order gets cancellation art, not a live delivery route', () => {
    seed((state) => {
      const order = orderById(state, 'ord-demo-1004');
      order.status = 'cancelled';
      order.history.push({ status: 'cancelled', at: Date.now(), note: 'Cancelled in demo.' });
    });
    const { container } = wrap(<OrderDetailScreen orderId="ord-demo-1004" navigate={vi.fn()} />);
    const art = container.querySelector('.journey-strip__art') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/order-cancelled.jpg');
    expect(container.querySelector('.journey-strip')?.textContent).toMatch(/cancelled/i);
    // A cancelled order must not invite the user to move it along.
    expect(container.querySelector('.demo-next-step')).toBeNull();
  });

  it('a in-progress collection order gets collection art and no courier wording', () => {
    seed((state) => {
      const order = orderById(state, 'ord-demo-1004');
      order.status = 'preparing';
      order.fulfilment = 'collection';
      order.history = [{ status: 'preparing', at: Date.now(), note: 'Shop preparing (demo).' }];
    });
    const { container } = wrap(<OrderDetailScreen orderId="ord-demo-1004" navigate={vi.fn()} />);
    const art = container.querySelector('.journey-strip__art') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/order-collection.jpg');
    const caption = container.querySelector('.journey-strip figcaption')?.textContent ?? '';
    expect(caption).toMatch(/collect at the shop/i);
    expect(caption).not.toMatch(/delivery partner/i);
  });

  it('a delivery order in flight still shows the batch 3 route', () => {
    const { container } = wrap(<OrderDetailScreen orderId="ord-demo-1002" navigate={vi.fn()} />);
    const art = container.querySelector('.journey-strip__art') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/journey-delivery.jpg');
  });
});

describe('basket confirmed dead end', () => {
  it('illustrates the already-confirmed basket and keeps the explanation', () => {
    const { container } = wrap(<BasketScreen orderId="ord-demo-1002" navigate={vi.fn()} />);
    const art = container.querySelector('img.empty-state__art') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/state-basket-confirmed.jpg');
    expect(art?.getAttribute('alt')).toBe('');
    expect(container.textContent).toMatch(/A chat message is never a purchase on its own/i);
    expect(container.textContent).toMatch(/Track this order/i);
  });
});

describe('shop staff empty states', () => {
  it('illustrates the all-caught-up shift', async () => {
    seed((state) => {
      state.conversations.forEach((c) => {
        c.unreadForShop = 0;
      });
      state.orders.forEach((o) => {
        o.status = o.status === 'awaiting-shop' ? 'accepted' : o.status;
        o.changeRequests = [];
      });
    });
    const { container } = wrap(<RetailerWorkspace tab="today" navigate={vi.fn()} />);
    await waitFor(() => expect(container.textContent).toMatch(/All caught up/i));
    expect(container.querySelector('img[src="/images/shop-all-caught-up.jpg"]')).not.toBeNull();
  });

  it('illustrates an order board with no orders instead of three bare buckets', async () => {
    seed((state) => {
      state.orders = [];
      state.conversations = [];
    });
    const { container } = wrap(<RetailerWorkspace tab="orders" navigate={vi.fn()} />);
    await waitFor(() => expect(container.textContent).toMatch(/No orders for this shop yet/i));
    expect(container.querySelector('img[src="/images/shop-orders-empty.jpg"]')).not.toBeNull();
  });

  it('illustrates the shop-side empty conversation when no message exists yet', () => {
    seed((state) => {
      state.messages = state.messages.filter((m) => m.conversationId !== 'conv-superspar-thandi');
    });
    const { container } = wrap(
      <RetailerWorkspace tab="inbox" conversationId="conv-superspar-thandi" navigate={vi.fn()} />,
    );
    const art = container.querySelector('img[src="/images/shop-thread-empty.jpg"]') as HTMLImageElement | null;
    expect(art).not.toBeNull();
    expect(art?.getAttribute('alt')).toBe('');
    expect(container.textContent).toMatch(/No messages yet/i);
  });

  it('does not show the empty-thread art once the conversation has messages', () => {
    const { container } = wrap(
      <RetailerWorkspace tab="inbox" conversationId="conv-superspar-thandi" navigate={vi.fn()} />,
    );
    expect(container.querySelector('img[src="/images/shop-thread-empty.jpg"]')).toBeNull();
  });
});

describe('delivery empty tabs', () => {
  it('illustrates an empty “My jobs” tab', async () => {
    seed((state) => {
      state.deliveryJobs = state.deliveryJobs.map((job) => ({ ...job, status: 'available' as const }));
    });
    const { container } = wrap(<DeliveryWorkspace tab="mine" navigate={vi.fn()} />);
    await waitFor(() => expect(container.textContent).toMatch(/No active jobs/i));
    expect(container.querySelector('img[src="/images/delivery-mine-empty.jpg"]')).not.toBeNull();
  });

  it('illustrates an empty completed tab', async () => {
    seed((state) => {
      state.deliveryJobs = [];
    });
    const { container } = wrap(<DeliveryWorkspace tab="done" navigate={vi.fn()} />);
    await waitFor(() => expect(container.textContent).toMatch(/Nothing completed yet/i));
    expect(container.querySelector('img[src="/images/delivery-done-empty.jpg"]')).not.toBeNull();
  });
});

describe('admin empty states', () => {
  it('gives the promotions tab a real empty state', async () => {
    seed((state) => {
      state.promotions = [];
    });
    const { container } = wrap(<AdminWorkspace tab="promotions" navigate={vi.fn()} />);
    await waitFor(() => expect(container.textContent).toMatch(/No demo promotions yet/i));
    expect(container.querySelector('img[src="/images/admin-promotions-empty.jpg"]')).not.toBeNull();
    // The creation form must remain available from the empty state.
    expect(container.textContent).toMatch(/New demo promotion/i);
  });

  it('illustrates an empty delivery marketplace', async () => {
    seed((state) => {
      state.deliveryJobs = [];
    });
    const { container } = wrap(<AdminWorkspace tab="deliveries" navigate={vi.fn()} />);
    await waitFor(() => expect(container.textContent).toMatch(/No delivery jobs yet/i));
    expect(container.querySelector('img[src="/images/admin-deliveries-empty.jpg"]')).not.toBeNull();
  });
});
