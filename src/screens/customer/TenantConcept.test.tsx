/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createSeedState } from '../../data/seed';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';
import { ShopPageScreen } from './ShopPage';

/**
 * Batch 7: a shop page may open with an AI-generated concept illustration. The
 * app must label it as concept art (so nobody reads it as the shop's premises,
 * logo or an endorsement) and must fall back to the shared category cover for
 * shops that have no concept art yet.
 */
const state = createSeedState();

const shop = (id: string) => {
  const found = state.shops.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing seed shop ${id}`);
  return found;
};

function renderShop(shopId: string) {
  return render(
    <DemoStoreProvider>
      <ToastProvider>
        <ShopPageScreen shopId={shopId} navigate={vi.fn()} />
      </ToastProvider>
    </DemoStoreProvider>,
  );
}

describe('shop-page concept art', () => {
  it('shows the tenant concept image and labels it as AI-generated concept art', () => {
    const kfc = shop('shop-kfc');
    const { container } = renderShop(kfc.id);

    const hero = container.querySelector('.shop-hero__media img') as HTMLImageElement;
    expect(hero.getAttribute('src')).toBe('/images/tenants/kfc.jpg');
    // Decorative: the real shop name is always rendered as text.
    expect(hero.getAttribute('alt')).toBe('');

    expect(container.querySelector('.shop-hero__caption-chip')?.textContent).toBe('Concept art');
    expect(screen.getByText(/AI-generated concept illustration/)).toBeTruthy();
    expect(screen.getByText(/not this shop's logo or shopfront/)).toBeTruthy();
    // The genuine shop name stays visible as text.
    expect(screen.getAllByText(kfc.name).length).toBeGreaterThan(0);
  });

  it('falls back to the category cover, with no concept-art caption, when a shop has no art', () => {
    const superspar = shop('shop-superspar');
    const { container } = renderShop(superspar.id);

    const hero = container.querySelector('.shop-hero__media img') as HTMLImageElement;
    expect(hero.getAttribute('src')).toBe(superspar.coverImage);
    expect(container.querySelector('.shop-hero__caption')).toBeNull();
    expect(screen.queryByText(/AI-generated concept illustration/)).toBeNull();
  });
});
