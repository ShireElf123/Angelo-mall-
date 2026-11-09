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

describe('Home — category discovery hierarchy', () => {
  it('uses one canonical nine-category rail instead of repeating the same routes', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    expect(container.querySelectorAll('.category-tile')).toHaveLength(9);
    expect(container.querySelectorAll('.need-grid')).toHaveLength(0);
    expect(container.querySelectorAll('.need-tile')).toHaveLength(0);
    expect(container.querySelector('.category-grid__note')?.textContent).toMatch(
      /illustrations only.*no shop in this demo has product photographs, confirmed stock or offers/i,
    );
  });

  it('keeps the generated category artwork decorative and clearly disclosed', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    const tiles = Array.from(container.querySelectorAll('.category-tile'));
    const generatedArt = tiles.filter((tile) =>
      /category-(food|fashion|electronics|beauty|home-hardware)\.jpg/.test(
        tile.querySelector('img')?.getAttribute('src') ?? '',
      ),
    );
    expect(generatedArt).toHaveLength(5);
    for (const tile of generatedArt) {
      expect(tile.querySelector('img')?.getAttribute('alt')).toBe('');
    }
    expect(container.querySelector('.category-grid__note')?.textContent).toMatch(/illustrations only/i);
  });

  it('opens the directory filtered to the tapped category', () => {
    const navigate = vi.fn();
    const { container } = wrap(<HomeScreen navigate={navigate} />);
    const electronics = Array.from(container.querySelectorAll('.category-tile')).find((tile) =>
      tile.textContent?.includes('Electronics'),
    );
    expect(electronics).toBeTruthy();
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
