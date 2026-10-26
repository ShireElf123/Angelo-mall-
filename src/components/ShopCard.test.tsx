/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createSeedState } from '../data/seed';
import { ShopCard } from './ShopCard';

const shop = createSeedState().shops[0];

describe('ShopCard', () => {
  it('renders the shop wordmark, category and its own cover image', () => {
    const { container } = render(<ShopCard shop={shop} onOpen={() => {}} />);
    expect(screen.getByText(shop.name)).toBeTruthy();
    expect(screen.getByText('Groceries')).toBeTruthy();
    const img = container.querySelector('.shop-card__media img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe(shop.coverImage);
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('falls back to the monogram wordmark when the cover image fails to load', () => {
    const { container } = render(<ShopCard shop={shop} onOpen={() => {}} />);
    const img = container.querySelector('.shop-card__media img') as HTMLImageElement;
    fireEvent.error(img);
    expect(img.style.display).toBe('none');
    expect(container.querySelector('.shop-card__media-fallback')?.textContent).toBe(shop.initials);
  });

  it('opens the shop from both the media tile and the primary button', () => {
    const onOpen = vi.fn();
    render(<ShopCard shop={shop} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('button', { name: `Open ${shop.name}` }));
    fireEvent.click(screen.getByRole('button', { name: /Open shop/ }));
    expect(onOpen).toHaveBeenCalledTimes(2);
    expect(onOpen).toHaveBeenCalledWith(shop.id);
  });
});
