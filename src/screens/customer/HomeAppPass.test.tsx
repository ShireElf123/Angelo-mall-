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
 * parts of that pass which are structural enough to regress silently — the
 * role switcher living behind a disclosure, and the two-up activity cards
 * reading real numbers out of the demo store rather than hard-coded ones.
 *
 * jsdom cannot lay out CSS, so nothing here proves what the screens look like.
 * The appearance was checked in a real browser and is reported separately.
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

describe('home — activity cards', () => {
  it('reads both counts from the demo store instead of hard-coding them', () => {
    const seed = createSeedState();
    const chats = conversationsForCustomer(seed).length;
    const active = ordersForCustomer(seed).filter(
      (order) => isConfirmedOrder(order) && !['delivered', 'completed'].includes(order.status),
    ).length;

    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    const values = Array.from(container.querySelectorAll('.home-stat__value')).map((el) => el.textContent);
    expect(values).toEqual([String(chats), String(active)]);
  });

  it('labels the numbers as demo data, so they can never read as live activity', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    const notes = Array.from(container.querySelectorAll('.home-stat__note')).map((el) => el.textContent);
    expect(notes).toEqual(['sample threads', 'demo orders']);
  });

  it('opens the chats and orders screens when the cards are tapped', () => {
    const navigate = vi.fn();
    const { container } = wrap(<HomeScreen navigate={navigate} />);
    const cards = container.querySelectorAll<HTMLButtonElement>('.home-stat');
    expect(cards).toHaveLength(2);

    fireEvent.click(cards[0]);
    expect(navigate).toHaveBeenCalledWith({ name: 'chats' });
    fireEvent.click(cards[1]);
    expect(navigate).toHaveBeenCalledWith({ name: 'orders' });
  });
});

describe('home — composition after the app pass', () => {
  it('still opens on the shops, with one way into the directory', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    const launcher = container.querySelector('.shop-launcher');
    const stats = container.querySelector('.home-stat-grid');
    expect(launcher).not.toBeNull();
    expect(stats).not.toBeNull();
    // The launcher is the point of the screen, so it precedes the activity
    // cards: see the shops, then see where you left off.
    expect(launcher!.compareDocumentPosition(stats!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('button', { name: /Browse all \d+ shops/i })).toBeTruthy();
  });

  it('keeps the simulated-chat disclosure on the screen', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    expect(container.textContent).toMatch(/Chats and prices here are simulated/i);
    expect(container.querySelector('.hero__aside-chip')?.textContent).toMatch(/not a photo/i);
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
