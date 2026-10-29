/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { DirectoryScreen } from './Directory';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';

/**
 * Directory experience contract.
 *
 * Two things are pinned here:
 *
 * 1. The reading order. The search box must come before the explanatory strip,
 *    which must come before the results, because the whole point of the
 *    re-layout is that a phone reaches shops with less scrolling.
 * 2. The filtering itself, so a visual re-layout can never quietly break
 *    search, category, fulfilment or open-only behaviour.
 */
function wrap(node: ReactNode) {
  return render(
    <DemoStoreProvider>
      <ToastProvider>{node}</ToastProvider>
    </DemoStoreProvider>,
  );
}

async function renderDirectory() {
  const utils = wrap(<DirectoryScreen navigate={vi.fn()} />);
  // The screen shows a short skeleton before its first paint.
  await screen.findByText(/shops? found/i, undefined, { timeout: 3000 });
  return utils;
}

const cards = (container: HTMLElement) => container.querySelectorAll('.shop-card');

afterEach(() => {
  window.localStorage.clear();
});

describe('directory reading order', () => {
  it('puts the search control before the explanatory strip and the results', async () => {
    const { container } = await renderDirectory();

    const search = screen.getByLabelText(/search shops/i);
    const strip = container.querySelector('.discovery-strip');
    const grid = container.querySelector('.shop-grid');
    expect(search).not.toBeNull();
    expect(strip).not.toBeNull();
    expect(grid).not.toBeNull();

    // compareDocumentPosition: FOLLOWING means `search` precedes the other node.
    const precedes = (a: Node, b: Node) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(precedes(search, strip!), 'search should precede the discovery strip').toBe(true);
    expect(precedes(strip!, grid!), 'the strip should precede the results').toBe(true);
  });

  it('keeps the concept-vs-real disclosure above the results', async () => {
    const { container } = await renderDirectory();
    const disclosure = container.querySelector('.listing-disclosure');
    const grid = container.querySelector('.shop-grid');
    expect(disclosure).not.toBeNull();
    expect(
      Boolean(disclosure!.compareDocumentPosition(grid!) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true);
    expect(disclosure!.textContent).toMatch(/not a Mall Go partner|None of them is a Mall Go partner/i);
  });

  it('keeps the discovery artwork and its scripted-reply wording', async () => {
    const { container } = await renderDirectory();
    const art = container.querySelector('.discovery-strip__art');
    expect(art?.getAttribute('src')).toBe('/images/discover-shops.jpg');
    expect(container.querySelector('.discovery-strip')?.textContent).toMatch(
      /replies are scripted samples/i,
    );
  });
});

describe('directory filtering still works after the re-layout', () => {
  it('filters as the customer types, then restores on clear', async () => {
    const { container } = await renderDirectory();
    const before = cards(container).length;
    expect(before).toBeGreaterThan(1);

    const search = screen.getByLabelText(/search shops/i);
    fireEvent.change(search, { target: { value: 'superspar' } });
    await waitFor(() => expect(cards(container).length).toBeLessThan(before));
    expect(container.textContent).toMatch(/SUPERSPAR/i);

    fireEvent.click(screen.getByRole('button', { name: /^clear$/i }));
    await waitFor(() => expect(cards(container).length).toBe(before));
  });

  it('filters by category chip and marks the active chip', async () => {
    const { container } = await renderDirectory();
    const before = cards(container).length;

    const group = screen.getByRole('group', { name: /filter by category/i });
    const bakery = within(group).getByRole('button', { name: /restaurants/i });
    fireEvent.click(bakery);

    await waitFor(() => expect(cards(container).length).toBeLessThan(before));
    expect(bakery.getAttribute('aria-pressed')).toBe('true');
    // Every visible card now belongs to that category.
    for (const card of Array.from(cards(container))) {
      expect(card.textContent).toMatch(/restaurants/i);
    }

    fireEvent.click(within(group).getByRole('button', { name: /all categories/i }));
    await waitFor(() => expect(cards(container).length).toBe(before));
  });

  it('keeps the fulfilment and open-only controls operable', async () => {
    const { container } = await renderDirectory();
    const before = cards(container).length;

    const fulfilment = screen.getByRole('group', { name: /filter by fulfilment/i });
    const collection = within(fulfilment).getByRole('button', { name: /collection/i });
    fireEvent.click(collection);
    await waitFor(() => expect(cards(container).length).toBeLessThanOrEqual(before));
    expect(collection.getAttribute('aria-pressed')).toBe('true');

    const openOnly = screen.getByRole('checkbox', { name: /open now/i });
    fireEvent.click(openOnly);
    expect((openOnly as HTMLInputElement).checked).toBe(true);
    // Still a filtered subset, never more than the full directory.
    expect(cards(container).length).toBeLessThanOrEqual(before);
  });

  it('offers a way out of an empty result set', async () => {
    const { container } = await renderDirectory();
    const before = cards(container).length;

    fireEvent.change(screen.getByLabelText(/search shops/i), { target: { value: 'zzzzqqqq' } });
    await waitFor(() => expect(cards(container).length).toBe(0));

    fireEvent.click(screen.getByRole('button', { name: /clear search & filters/i }));
    await waitFor(() => expect(cards(container).length).toBe(before));
  });
});
