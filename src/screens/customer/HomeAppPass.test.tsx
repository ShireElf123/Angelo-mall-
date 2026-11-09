/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';
import { HomeScreen } from './Home';
import { createSeedState } from '../../data/seed';
import { conversationsForCustomer, ordersForCustomer } from '../../store/selectors';
import { isConfirmedOrder } from '../../utils/orderWorkflow';

/**
 * The native-app pass.
 *
 * The owner's note was that the app still read as a web page: a permanent strip
 * of four demo controls, a green poster, then the shops. These tests pin the
 * parts of the Home flow which are structural enough to regress silently —
 * returning customers resume seeded demo work before browsing, while a first
 * visit can go straight to discovery without empty metric cards.
 *
 * jsdom cannot lay out CSS, so these tests pin order and destinations, not pixels.
 */
function wrap(node: ReactNode) {
  return render(
    <DemoStoreProvider>
      <ToastProvider>{node}</ToastProvider>
    </DemoStoreProvider>,
  );
}

afterEach(() => {
  window.localStorage.clear();
});

describe('home — resume real demo activity', () => {
  it('shows the demo orders and recent conversations from the store', () => {
    const seed = createSeedState();
    const activeOrders = ordersForCustomer(seed).filter(
      (order) => isConfirmedOrder(order) && !['delivered', 'completed'].includes(order.status),
    );
    const recentConversations = conversationsForCustomer(seed).slice(0, 3);
    expect(activeOrders.length).toBeGreaterThan(0);
    expect(recentConversations.length).toBeGreaterThan(0);

    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    expect(container.querySelectorAll('.home-resume__card--order')).toHaveLength(activeOrders.length > 0 ? 1 : 0);
    expect(container.querySelectorAll('.home-resume__card--chat')).toHaveLength(recentConversations.length > 0 ? 1 : 0);
    expect(container.querySelector('.home-resume__card--order')?.textContent).toContain(activeOrders[0].ref);
    expect(container.querySelector('.home-resume__card--chat')?.textContent).toContain('Sample chat');
    expect(container.querySelector('.home-resume')?.textContent).toMatch(/sample chats and orders only/i);
  });

  it('puts resumable orders and chats before category browsing', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    const hello = container.querySelector('.home-hello');
    const resume = container.querySelector('[aria-label="Pick up where you left off"]');
    const categories = container.querySelector('[aria-label="Shop by category"]');
    expect(hello).not.toBeNull();
    expect(resume).not.toBeNull();
    expect(categories).not.toBeNull();
    const follows = (a: Element, b: Element) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(follows(hello!, resume!), 'the returner panel follows the greeting').toBe(true);
    expect(follows(resume!, categories!), 'the returner panel precedes discovery').toBe(true);
  });

  it('opens an existing order or conversation when its preview is tapped', () => {
    const navigate = vi.fn();
    const seed = createSeedState();
    const expectedOrder = ordersForCustomer(seed).find(
      (candidate) => isConfirmedOrder(candidate) && !['delivered', 'completed'].includes(candidate.status),
    )!;
    const expectedConversation = conversationsForCustomer(seed)[0];
    const { container } = wrap(<HomeScreen navigate={navigate} />);
    const order = container.querySelector<HTMLButtonElement>('.home-resume__card--order');
    const conversation = container.querySelector<HTMLButtonElement>('.home-resume__card--chat');
    expect(order).not.toBeNull();
    expect(conversation).not.toBeNull();

    fireEvent.click(order!);
    expect(navigate).toHaveBeenCalledWith({ name: 'order', orderId: expectedOrder.id });
    navigate.mockClear();
    fireEvent.click(conversation!);
    expect(navigate).toHaveBeenCalledWith({ name: 'chat', conversationId: expectedConversation.id });

    navigate.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /All chats/i }));
    expect(navigate).toHaveBeenCalledWith({ name: 'chats' });
    navigate.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /All orders/i }));
    expect(navigate).toHaveBeenCalledWith({ name: 'orders' });
  });
});

describe('home — composition for a returning customer', () => {
  it('orders the greeting, resume activity, category rail and shop launcher', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    const hello = container.querySelector('.home-hello');
    const resume = container.querySelector('[aria-label="Pick up where you left off"]');
    const categories = container.querySelector('[aria-label="Shop by category"]');
    const launcher = container.querySelector('.shop-launcher');
    expect(hello).not.toBeNull();
    expect(resume).not.toBeNull();
    expect(categories).not.toBeNull();
    expect(launcher).not.toBeNull();

    const follows = (a: Element, b: Element) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(follows(hello!, resume!), 'the greeting comes first').toBe(true);
    expect(follows(resume!, categories!), 'returning work comes before browsing').toBe(true);
    expect(follows(categories!, launcher!), 'category discovery leads into shops').toBe(true);
    expect(container.querySelector('.home-stat-grid')).toBeNull();
    expect(screen.getByRole('button', { name: /See all \d+ shops/i })).toBeTruthy();
  });

  it('keeps the simulated-chat disclosure on the screen', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    expect(container.querySelector('.home-hello__lede')?.textContent).toMatch(/simulated/i);
    expect(container.querySelector('.hero__aside-chip')).toBeNull();
  });
});

describe('app shell — demo drawer', () => {
  it('keeps the role switcher behind a disclosure, not permanently open', async () => {
    window.location.hash = '#/';
    const App = (await import('../../App')).default;
    const { container } = render(<App />);

    const drawer = container.querySelector('details.demo-drawer');
    expect(drawer).not.toBeNull();
    // The summary is the control; the four roles live in the panel below it.
    const summary = drawer!.querySelector('summary');
    expect(summary).not.toBeNull();
    expect(drawer!.querySelector('.role-switcher')).not.toBeNull();

    // The current role is named on the collapsed control, so collapsing the
    // panel never leaves the presenter guessing which workspace is open.
    await waitFor(() => expect(summary!.textContent).toMatch(/Customer/));
  });

  it('keeps every role reachable and switchable from inside the drawer', async () => {
    window.location.hash = '#/';
    const App = (await import('../../App')).default;
    render(<App />);

    const group = await screen.findByRole('group', { name: /role switcher/i });
    for (const name of [/customer/i, /shop staff/i, /delivery partner/i, /mall admin/i]) {
      expect(group.textContent).toMatch(name);
    }
    const shopStaff = Array.from(group.querySelectorAll('button')).find((b) =>
      /shop staff/i.test(b.textContent ?? ''),
    )!;
    fireEvent.click(shopStaff);
    await waitFor(() => expect(screen.getAllByRole('button', { name: /inbox/i }).length).toBeGreaterThan(0));
  });

  it('still says this is not live shopping in the strip', async () => {
    window.location.hash = '#/';
    const App = (await import('../../App')).default;
    const { container } = render(<App />);
    const bar = container.querySelector('.demo-bar');
    expect(bar?.textContent).toMatch(/Demo Mode/i);
    expect(bar?.textContent).toMatch(/sample data/i);
  });
});
