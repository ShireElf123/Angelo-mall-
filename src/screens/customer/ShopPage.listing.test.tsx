/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createSeedState } from '../../data/seed';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';
import { ShopPageScreen } from './ShopPage';

/**
 * Phase 4: the shop page must be honest about where the listing came from and
 * must not imply a relationship with the real business.
 */
const state = createSeedState();

function renderShop(shopId: string) {
  return render(
    <DemoStoreProvider>
      <ToastProvider>
        <ShopPageScreen shopId={shopId} navigate={vi.fn()} />
      </ToastProvider>
    </DemoStoreProvider>,
  );
}
const shop = (id: string) => {
  const found = state.shops.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing seed shop ${id}`);
  return found;
};

describe('ShopPage listing honesty', () => {
  it('shows provenance for a cross-verified listing with a website', () => {
    const clicks = shop('shop-clicks');
    renderShop(clicks.id);

    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
    expect(screen.getByText(clicks.name)).toBeTruthy();
    expect(screen.getByText(/Shop 9a, Angelo Mall/)).toBeTruthy();
    expect(screen.getByText(clicks.phones![0])).toBeTruthy();
    expect(screen.getByText(/cross-checked against the business’s own listing/)).toBeTruthy();
    expect(screen.getByText(/Sample chat only/)).toBeTruthy();
    expect(screen.getByText(/No logo, photograph or product image/)).toBeTruthy();
    expect(screen.getByText(/Shop telephone/)).toBeTruthy();
  });

  it('flags a directory-only listing as not independently confirmed', () => {
    const bestBuy = shop('shop-best-buy');
    renderShop(bestBuy.id);

    expect(
      screen.getByText(/directory entry only — not independently confirmed as current/),
    ).toBeTruthy();
  });

  it('omits contact rows the directory does not publish', () => {
    const boutique = shop('shop-angel-kiss');
    renderShop(boutique.id);

    expect(screen.getByText(/Shop 25a, Angelo Mall/)).toBeTruthy();
    expect(screen.queryByText(/Shop telephone/)).toBeNull();
    expect(screen.queryByText(/^Website$/)).toBeNull();
  });

  it('explains a listing with no shop number', () => {
    const carwash = shop('shop-carwash');
    renderShop(carwash.id);

    expect(screen.getByText(/no shop number listed/)).toBeTruthy();
    expect(screen.getByText(carwash.phones![0])).toBeTruthy();
  });

  it('never offers live ordering language for a listing-only shop', () => {
    const mica = shop('shop-mica');
    const { container } = renderShop(mica.id);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/added to basket/i);
    expect(text).not.toMatch(/order now/i);
    expect(text).toMatch(/Not offered by this demo shop/);
  });
});
