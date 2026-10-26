/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';
import { HomeScreen } from './Home';
import { DirectoryScreen } from './Directory';
import { HelpScreen } from './MiscScreens';

/**
 * Batch 3 UI guards: the shop-discovery artwork must appear where it was
 * designed to appear, stay decorative for assistive tech, and must not weaken
 * the demo disclosures around it.
 */
function wrap(node: React.ReactNode) {
  return render(
    <DemoStoreProvider>
      <ToastProvider>{node}</ToastProvider>
    </DemoStoreProvider>,
  );
}

describe('Home — explore by need', () => {
  it('shows five illustrated shortcuts as decorative art with readable labels', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    const tiles = container.querySelectorAll('.need-tile');
    expect(tiles).toHaveLength(5);

    const labels = Array.from(tiles).map((tile) => tile.querySelector('strong')?.textContent);
    expect(labels).toEqual([
      'Food & dining',
      'Fashion & accessories',
      'Electronics & mobile',
      'Beauty & personal care',
      'Home & hardware',
    ]);

    for (const tile of Array.from(tiles)) {
      const img = tile.querySelector('img') as HTMLImageElement | null;
      expect(img).not.toBeNull();
      expect(img?.getAttribute('src')).toMatch(/^\/images\/category-.*\.jpg$/);
      expect(img?.getAttribute('alt')).toBe('');
      expect(img?.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('keeps the "no catalogue" honesty note next to the shortcuts', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    expect(container.textContent).toMatch(/no shop in this demo has product photographs, confirmed stock or offers/i);
  });

  it('opens the directory filtered to the tapped need', () => {
    const navigate = vi.fn();
    const { container } = wrap(<HomeScreen navigate={navigate} />);
    const electronics = Array.from(container.querySelectorAll('.need-tile')).find((tile) =>
      tile.textContent?.includes('Electronics & mobile'),
    );
    fireEvent.click(electronics as Element);
    expect(navigate).toHaveBeenCalledWith({ name: 'shops', category: 'electronics' });
  });
});

describe('Directory — discovery artwork', () => {
  it('renders the discovery strip and keeps the simulated-reply wording', () => {
    const { container } = wrap(<DirectoryScreen navigate={vi.fn()} />);
    const art = container.querySelector('.discovery-strip__art') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/discover-shops.jpg');
    expect(art?.getAttribute('alt')).toBe('');
    expect(container.querySelector('.discovery-strip')?.textContent).toMatch(/replies are scripted samples/i);
  });

  it('keeps the directory disclosure banner and adds the wayfinding illustration', async () => {
    const { container } = wrap(<DirectoryScreen navigate={vi.fn()} />);
    await waitFor(() => expect(container.querySelectorAll('.shop-card').length).toBeGreaterThan(0));
    const banner = container.querySelector('.info-banner--illustrated');
    expect(banner).not.toBeNull();
    expect(banner?.getAttribute('role')).toBe('note');
    expect(banner?.textContent).toMatch(/Directory data is centralised demo content/i);
    const art = banner?.querySelector('img');
    expect(art?.getAttribute('src')).toBe('/images/journey-navigation.jpg');
    expect(art?.getAttribute('alt')).toBe('');
  });
});

describe('Help — welcome art', () => {
  it('shows the welcome illustration in the install panel without replacing the text', () => {
    const { container } = wrap(<HelpScreen navigate={vi.fn()} />);
    const art = container.querySelector('img.panel__art--landscape') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/intro-mall-go.jpg');
    expect(art?.getAttribute('alt')).toBe('');
    expect(screen.getByText(/Add to your home screen/)).toBeTruthy();
  });
});
