/** @vitest-environment jsdom */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';
import { BasketScreen } from './Basket';
import { ShopPageScreen } from './ShopPage';
import { createSeedState } from '../../data/seed';
import { openBasketForConversation } from '../../store/selectors';

/**
 * Phase 2 — mobile app shell and checkout contract.
 *
 * These pin the two composition changes that are easy to undo by accident:
 * the basket's primary action is pinned with its total instead of buried at the
 * bottom of the page, and the shop's primary action comes before the long
 * description and fact grid.
 *
 * jsdom cannot lay out CSS, so nothing here proves what the screen looks like
 * at any viewport. Rendered appearance is reported as unverified.
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

/** The seeded SUPERSPAR basket the demo opens on. */
function seedBasketId() {
  const state = createSeedState();
  const basket = openBasketForConversation(state, 'conv-superspar-thandi');
  if (!basket) throw new Error('seed basket missing');
  return basket.id;
}

describe('basket — pinned action', () => {
  it('keeps the confirm action and the total in one pinned bar', () => {
    const { container } = wrap(<BasketScreen orderId={seedBasketId()} navigate={vi.fn()} />);
    const bar = container.querySelector('.checkout-bar');
    expect(bar, 'no pinned checkout bar').not.toBeNull();

    // The action and the amount it commits to travel together.
    const confirm = within(bar as HTMLElement).getByRole('button', { name: /confirm demo order/i });
    expect(confirm).toBeTruthy();
    expect(bar?.querySelector('.checkout-bar__total')?.textContent).toMatch(/R\s?\d/);
    expect(bar?.textContent).toMatch(/item/i);
  });

  it('no longer leaves a second confirm button further up the page', () => {
    const { container } = wrap(<BasketScreen orderId={seedBasketId()} navigate={vi.fn()} />);
    // One primary action, not two: a duplicate would also duplicate the
    // accessible name for anyone navigating by button.
    const confirms = screen.getAllByRole('button', { name: /confirm demo order/i });
    expect(confirms).toHaveLength(1);
    expect(container.querySelector('.checkout-bar')?.contains(confirms[0])).toBe(true);
  });

  it('opens the confirmation dialog from the pinned bar', () => {
    wrap(<BasketScreen orderId={seedBasketId()} navigate={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /confirm demo order/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toMatch(/no payment, no real delivery/i);
  });

  it('keeps the rest of the basket operable below the bar', () => {
    const { container } = wrap(<BasketScreen orderId={seedBasketId()} navigate={vi.fn()} />);
    // The bar is sticky, so it returns to the flow at the end of the page and
    // nothing is permanently covered.
    expect(container.querySelector('.page--basket')).not.toBeNull();
    expect(screen.getByRole('button', { name: /cancel this basket/i })).toBeTruthy();
    // The fulfilment radios live below the fold but must stay operable.
    expect(screen.getByRole('radiogroup', { name: /fulfilment method/i })).toBeTruthy();
  });
});

describe('shop page — action before the details', () => {
  it('puts the sample-chat action above the description and the fact grid', () => {
    const { container } = wrap(<ShopPageScreen shopId="shop-superspar" navigate={vi.fn()} />);
    const cta = screen.getByRole('button', { name: /sample chat/i });
    const facts = container.querySelector('.shop-facts');
    expect(facts).not.toBeNull();
    // FOLLOWING means the CTA precedes the facts in document order.
    expect(
      Boolean(cta.compareDocumentPosition(facts as Node) & Node.DOCUMENT_POSITION_FOLLOWING),
      'the primary action should come before the fact grid',
    ).toBe(true);
  });

  it('keeps the simulation disclosure next to the action it describes', () => {
    const { container } = wrap(<ShopPageScreen shopId="shop-superspar" navigate={vi.fn()} />);
    const hint = container.querySelector('.shop-hero__hint');
    expect(hint).not.toBeNull();
    expect(hint?.textContent).toMatch(/nothing is sent to/i);
    expect(hint?.textContent).toMatch(/simulated/i);
  });

  it('keeps the concept-art label and the directory provenance', () => {
    const { container } = wrap(<ShopPageScreen shopId="shop-superspar" navigate={vi.fn()} />);
    expect(container.querySelector('.shop-hero__caption-chip')?.textContent).toBe('Concept art');
    expect(container.textContent).toMatch(/Listing source:/i);
  });
});
