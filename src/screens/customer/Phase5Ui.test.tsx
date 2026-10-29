/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';
import { DirectoryScreen } from './Directory';
import { HomeScreen } from './Home';
import { HelpScreen } from './MiscScreens';
import { ShopCard } from '../../components/ShopCard';
import { createSeedState } from '../../data/seed';

/**
 * Phase 5 UI guards: the visual upgrade must not have weakened the demo
 * disclosures, and the directory's search and category filters must still work.
 */
function wrap(node: React.ReactNode) {
  return render(
    <DemoStoreProvider>
      <ToastProvider>{node}</ToastProvider>
    </DemoStoreProvider>,
  );
}

describe('disclosures survive the visual upgrade', () => {
  it('directory states that the shops are real but not partners', () => {
    wrap(<DirectoryScreen navigate={vi.fn()} />);
    expect(screen.getByText(/Real shops, concept app/)).toBeTruthy();
    expect(screen.getByText(/nothing you send here reaches a shop/i)).toBeTruthy();
  });

  it('help explains the listing and simulation rules', () => {
    wrap(<HelpScreen navigate={vi.fn()} />);
    expect(screen.getByText(/About the shop listings/)).toBeTruthy();
    expect(screen.getByText(/No shop is a Mall Go partner/)).toBeTruthy();
    expect(screen.getByText(/simulated in your browser/i)).toBeTruthy();
  });

  it('home keeps the concept wording and the demo marker', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    const text = container.textContent ?? '';
    expect(text).toMatch(/concept/i);
    expect(text).toMatch(/simulated/i);
    expect(text).toMatch(/Simulated · demo prices/);
  });
});

describe('directory search and filters still work', () => {
  it('filters by category', async () => {
    const { container } = wrap(<DirectoryScreen navigate={vi.fn()} initialCategory="pharmacy" />);
    await waitFor(() => expect(container.querySelectorAll('.shop-card').length).toBeGreaterThan(0));
    const cards = container.querySelectorAll('.shop-card');
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(card.textContent).toMatch(/Pharmacy|Health/);
    }
  });

  it('filters by free-text search', async () => {
    wrap(<DirectoryScreen navigate={vi.fn()} initialQuery="clicks" />);
    await waitFor(() => expect(screen.getByText('Clicks')).toBeTruthy());
    expect(screen.queryByText('Ocean Basket')).toBeNull();
  });

  it('shows the illustrated empty state when nothing matches', async () => {
    const { container } = wrap(<DirectoryScreen navigate={vi.fn()} initialQuery="zzzz-no-such-shop" />);
    await waitFor(() => expect(container.querySelector('.empty-state__art')).toBeTruthy());
    const art = container.querySelector('.empty-state__art') as HTMLImageElement;
    expect(art.getAttribute('src')).toBe('/images/illustration-empty-directory.jpg');
    expect(art.getAttribute('alt')).toBe('');
  });

  it('clears the search back to the full directory', async () => {
    wrap(<DirectoryScreen navigate={vi.fn()} initialQuery="clicks" />);
    await waitFor(() => expect(screen.getByText('Clicks')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: /Clear/ }));
    await waitFor(() => expect(screen.getByText('Ocean Basket')).toBeTruthy());
  });
});

describe('shop card brand plate', () => {
  it('separates the shop mark from the category illustration', () => {
    const shop = createSeedState().shops.find((candidate) => candidate.id === 'shop-pep')!;
    const { container } = render(<ShopCard shop={shop} onOpen={vi.fn()} />);

    const plate = container.querySelector('.shop-card__brand');
    expect(plate).toBeTruthy();
    expect(plate?.querySelector('.shop-logo__word')?.textContent).toBe('PEP');
    expect(plate?.querySelector('.pill')).toBeTruthy();
    expect(container.querySelector('.shop-card__category')?.textContent).toBe('Clothing & fashion');
    // The decorative cover stays decorative.
    expect(container.querySelector('.shop-card__media img')?.getAttribute('alt')).toBe('');
  });

  it('keeps the monogram when the cover illustration fails', () => {
    const shop = createSeedState().shops.find((candidate) => candidate.id === 'shop-mica')!;
    const { container } = render(<ShopCard shop={shop} onOpen={vi.fn()} />);
    const cover = container.querySelector('.shop-card__media img') as HTMLImageElement;
    fireEvent.error(cover);
    expect(cover.style.display).toBe('none');
    expect(container.querySelector('.shop-card__media-fallback')?.textContent).toContain('MC');
  });
});
