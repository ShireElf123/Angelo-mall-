/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSeedState } from '../data/seed';
import { ShopLogo } from './ShopLogo';

/**
 * Phase 5 logo behaviour: the verified-logo path is exercised with a mocked
 * registry entry (nothing is bundled yet), and the fallback path with the real,
 * unmodified registry.
 */
const TEST_ASSET = {
  shopId: 'shop-kfc',
  file: '/images/logos/shop-kfc.svg',
  aspectRatio: 2.4,
  alt: 'KFC',
  sourceType: 'official-brand-site' as const,
  sourceUrl: 'https://example.test/kfc-logo',
  retrievedOn: '2026-10-27',
  verified: true,
};

const state = createSeedState();
const shop = (id: string) => {
  const found = state.shops.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing seed shop ${id}`);
  return found;
};

afterEach(() => {
  vi.resetModules();
  vi.doUnmock('../data/shopLogos');
});

describe('ShopLogo fallback (no verified asset)', () => {
  it('renders the initials, the shop name and the category glyph', () => {
    const kfc = shop('shop-kfc');
    const { container } = render(<ShopLogo shop={kfc} />);

    expect(container.querySelector('.shop-logo__initials')?.textContent).toBe('KFC');
    expect(container.querySelector('.shop-logo__word')?.textContent).toBe('KFC');
    expect(container.querySelector('.shop-logo__glyph')).toBeTruthy();
    // No <img> at all -> no broken-image icon can ever appear.
    expect(container.querySelector('img')).toBeNull();
  });

  it('never duplicates the shop name in the accessibility tree', () => {
    render(<ShopLogo shop={shop('shop-superspar')} />);
    // The monogram is decorative (aria-hidden); only the name text is exposed.
    expect(screen.getAllByText('The Angelo SUPERSPAR')).toHaveLength(1);
  });

  it('scales its tile per size and supports dark surfaces', () => {
    const { container, rerender } = render(<ShopLogo shop={shop('shop-mica')} size="lg" onDark />);
    expect(container.querySelector('.shop-logo--lg')).toBeTruthy();
    expect(container.querySelector('.shop-logo--on-dark')).toBeTruthy();
    rerender(<ShopLogo shop={shop('shop-mica')} size="sm" />);
    expect(container.querySelector('.shop-logo--sm')).toBeTruthy();
    expect(container.querySelector('.shop-logo__glyph')).toBeNull();
  });
});

describe('ShopLogo with a verified asset', () => {
  it('renders the logo image with a reserved aspect ratio and no alt duplication', async () => {
    vi.resetModules();
    vi.doMock('../data/shopLogos', async () => {
      const actual = await vi.importActual<typeof import('../data/shopLogos')>('../data/shopLogos');
      return {
        ...actual,
        SHOP_LOGO_ASSETS: { 'shop-kfc': TEST_ASSET },
        shopLogoAsset: (id: string) => (id === 'shop-kfc' ? TEST_ASSET : undefined),
      };
    });
    const { ShopLogo: LogoWithAsset } = await import('./ShopLogo');
    const { container } = render(<LogoWithAsset shop={shop('shop-kfc')} />);

    const img = container.querySelector('img.shop-logo__image') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe(TEST_ASSET.file);
    expect(img.getAttribute('alt')).toBe('');
    expect(img.style.aspectRatio).toBe('2.4');
    expect(img.getAttribute('loading')).toBe('lazy');
    // The readable name still comes from real text, never from the image.
    expect(container.querySelector('.shop-logo__word')?.textContent).toBe('KFC');
  });

  it('falls back to the monogram when the logo file fails to load', async () => {
    vi.resetModules();
    vi.doMock('../data/shopLogos', async () => {
      const actual = await vi.importActual<typeof import('../data/shopLogos')>('../data/shopLogos');
      return {
        ...actual,
        SHOP_LOGO_ASSETS: { 'shop-kfc': TEST_ASSET },
        shopLogoAsset: (id: string) => (id === 'shop-kfc' ? TEST_ASSET : undefined),
      };
    });
    const { ShopLogo: LogoWithAsset } = await import('./ShopLogo');
    const { container } = render(<LogoWithAsset shop={shop('shop-kfc')} />);

    const img = container.querySelector('img.shop-logo__image') as HTMLImageElement;
    fireEvent.error(img);

    expect(container.querySelector('img.shop-logo__image')).toBeNull();
    expect(container.querySelector('.shop-logo__initials')?.textContent).toBe('KFC');
  });
});
