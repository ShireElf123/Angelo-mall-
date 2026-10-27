/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';
import { HomeScreen } from './Home';
import { OrderDetailScreen, OrdersScreen } from './Orders';
import { ShopPageScreen } from './ShopPage';
import { HelpScreen } from './MiscScreens';
import { createSeedState } from '../../data/seed';

/**
 * Batch 4 UI guards: each new illustration must appear only where it was
 * designed to, stay decorative to assistive tech, and never replace the visible
 * simulation wording it sits beside.
 */
/** Seed a state with no conversations so the true first-run path is exercised. */
function seedEmptyCustomerState() {
  window.localStorage.setItem(
    'angelo-mall-go-demo-v1',
    JSON.stringify({ ...createSeedState(), conversations: [], orders: [], messages: [], deliveryJobs: [] }),
  );
}

afterEach(() => {
  window.localStorage.clear();
});

function wrap(node: React.ReactNode) {
  return render(
    <DemoStoreProvider>
      <ToastProvider>{node}</ToastProvider>
    </DemoStoreProvider>,
  );
}

describe('order tracking status art', () => {
  it('shows the waiting illustration for an order the shop has not accepted yet', () => {
    const { container } = wrap(<OrderDetailScreen orderId="ord-demo-1001" navigate={vi.fn()} />);
    const art = container.querySelector('.journey-strip__art') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/order-pending.jpg');
    expect(art?.getAttribute('alt')).toBe('');
    expect(container.querySelector('.journey-strip')?.textContent).toMatch(/simulated stages/i);
  });

  it('shows the delivery route illustration while the order is in flight', () => {
    const { container } = wrap(<OrderDetailScreen orderId="ord-demo-1002" navigate={vi.fn()} />);
    const art = container.querySelector('.journey-strip__art') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/journey-delivery.jpg');
  });

  it('shows the completed illustration for a collected order without claiming a real delivery', () => {
    const { container } = wrap(<OrderDetailScreen orderId="ord-demo-1003" navigate={vi.fn()} />);
    const art = container.querySelector('.journey-strip__art') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/order-complete.jpg');
    expect(container.querySelector('.journey-strip')?.textContent).toMatch(/no live courier and no map tracking/i);
  });

  it('renders exactly one status illustration at a time', () => {
    const { container } = wrap(<OrderDetailScreen orderId="ord-demo-1004" navigate={vi.fn()} />);
    expect(container.querySelectorAll('.journey-strip__art')).toHaveLength(1);
  });
});

describe('shop page provenance art', () => {
  it('labels the generic shopfront as not this shop’s shopfront', async () => {
    const { container } = wrap(<ShopPageScreen shopId="shop-superspar" navigate={vi.fn()} />);
    const art = container.querySelector('.shop-source__art img') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/shop-detail.jpg');
    expect(art?.getAttribute('alt')).toBe('');
    expect(container.querySelector('.shop-source__art figcaption')?.textContent).toMatch(
      /not this shop’s shopfront/i,
    );
  });

  it('keeps the no-logo statement and adds the “ask a question” art', async () => {
    const { container } = wrap(<ShopPageScreen shopId="shop-superspar" navigate={vi.fn()} />);
    await waitFor(() => expect(container.querySelector('.ask-chips')).not.toBeNull());
    expect(container.textContent).toMatch(/No logo, photograph or product\s+image from any business is used/i);
    const panelArt = container.querySelector('.panel__art--banner') as HTMLImageElement | null;
    expect(panelArt?.getAttribute('src')).toBe('/images/contact-shop.jpg');
    expect(panelArt?.getAttribute('alt')).toBe('');
  });
});

describe('home guidance art', () => {
  it('illustrates a home search that finds nothing, without hiding the message', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    const input = container.querySelector('#home-search') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'zzzzz' } });
    const art = container.querySelector('.hero__no-match img') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/search-guidance.jpg');
    expect(art?.getAttribute('alt')).toBe('');
    expect(container.querySelector('.hero__no-match')?.textContent).toMatch(/No listed shops match/i);
  });

  it('hides the welcome card once the demo already has conversations', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    expect(container.querySelector('.welcome-card')).toBeNull();
  });

  it('shows the welcome card for a first-run visitor and keeps the disclosure wording', () => {
    seedEmptyCustomerState();
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    const card = container.querySelector('.welcome-card');
    expect(card).not.toBeNull();
    const art = card?.querySelector('.welcome-card__art') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/welcome-mall.jpg');
    expect(art?.getAttribute('alt')).toBe('');
    expect(art?.getAttribute('aria-hidden')).toBe('true');
    expect(card?.textContent).toMatch(/concept demo/i);
    expect(card?.textContent).toMatch(/nothing you send reaches them/i);
    expect(card?.querySelectorAll('button').length).toBe(2);
  });
});

describe('help reset panel art', () => {
  it('adds the troubleshooting illustration next to the reset instructions', () => {
    const { container } = wrap(<HelpScreen navigate={vi.fn()} />);
    const art = container.querySelector('img[src="/images/help-troubleshooting.jpg"]') as HTMLImageElement | null;
    expect(art).not.toBeNull();
    expect(art?.getAttribute('alt')).toBe('');
    expect(screen.getByText(/Restore the original sample shops/)).toBeTruthy();
  });
});

describe('orders list still renders every order', () => {
  it('keeps the demo order references after the artwork changes', () => {
    const { container } = wrap(<OrdersScreen navigate={vi.fn()} />);
    const text = container.textContent ?? '';
    for (const ref of ['AMG-1001', 'AMG-1002', 'AMG-1003']) expect(text).toContain(ref);
  });
});
