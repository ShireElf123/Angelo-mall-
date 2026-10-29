/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { categoryLabel, createSeedState } from '../data/seed';
import { ShopCard } from './ShopCard';

const shop = createSeedState().shops[0];

describe('ShopCard', () => {
  it('renders the shop wordmark, category and the tenant\'s own concept image', () => {
    const { container } = render(<ShopCard shop={shop} onOpen={() => {}} />);
    // Real tenants can share a short initials mark with their name (e.g. "KFC"),
    // so assert on the wordmark element rather than on ambiguous text.
    expect(container.querySelector('.shop-logo__word')?.textContent).toBe(shop.name);
    expect(screen.getAllByText(categoryLabel(shop.category)).length).toBeGreaterThanOrEqual(1);
    const img = container.querySelector('.shop-card__media img') as HTMLImageElement;
    // The card shows this tenant's researched interior, not the category art
    // that every shop in a category used to share.
    expect(shop.conceptImage).toBeTruthy();
    expect(img.getAttribute('src')).toBe(shop.conceptImage);
    expect(img.getAttribute('loading')).toBe('lazy');
    // Intrinsic size is declared so the 16:9 frame cannot shift while loading.
    expect(img.getAttribute('width')).toBe('1280');
    expect(img.getAttribute('height')).toBe('720');
  });

  it('labels the concept image as concept art', () => {
    const { container } = render(<ShopCard shop={shop} onOpen={() => {}} />);
    expect(container.querySelector('.shop-card__concept-chip')?.textContent).toBe('Concept art');
  });

  it('falls back to the category cover, with no concept label, when a shop has no concept art', () => {
    const noArt = { ...shop, conceptImage: undefined };
    const { container } = render(<ShopCard shop={noArt} onOpen={() => {}} />);
    const img = container.querySelector('.shop-card__media img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe(shop.coverImage);
    // No AI art on screen, so no concept-art disclaimer either.
    expect(container.querySelector('.shop-card__concept-chip')).toBeNull();
  });

  it('falls back to the monogram wordmark when the cover image fails to load', () => {
    const { container } = render(<ShopCard shop={shop} onOpen={() => {}} />);
    const img = container.querySelector('.shop-card__media img') as HTMLImageElement;
    fireEvent.error(img);
    expect(img.style.display).toBe('none');
    expect(container.querySelector('.shop-card__media-fallback')?.textContent).toBe(shop.initials);
  });

  it('gives the card a prominent primary action, not a quiet row', () => {
    const { container } = render(<ShopCard shop={shop} onOpen={() => {}} />);
    const cta = container.querySelector('.shop-card__cta') as HTMLButtonElement;
    expect(cta).not.toBeNull();
    // It is the shared primary button — no bespoke card button system.
    expect(cta.className).toContain('btn');
    expect(cta.className).toContain('btn--primary');
    expect(cta.className).toContain('btn--block');
    // The old demoted row must be gone from the markup entirely.
    expect(container.querySelector('.btn--quiet')).toBeNull();
    // The legacy quiet styling depended on this class; it must not come back.
    expect(cta.className).not.toContain('btn--quiet');
  });

  it('says what it does, with a word not just an icon', () => {
    render(<ShopCard shop={shop} onOpen={() => {}} />);
    const cta = screen.getByRole('button', { name: 'Open shop' });
    // The label is the accessible name, so the arrow must stay decorative.
    expect(cta.textContent).toMatch(/Open shop/);
    const arrow = cta.querySelector('svg');
    expect(arrow).not.toBeNull();
    expect(arrow?.getAttribute('aria-hidden')).toBe('true');
    // Comfortable touch target, announced by the DOM test above; the CSS
    // height is pinned in styles.redesign.
    expect(cta.getAttribute('type')).toBe('button');
  });

  it('sits last in the card body, after the metadata and disclosures', () => {
    const { container } = render(<ShopCard shop={shop} onOpen={() => {}} />);
    const body = container.querySelector('.shop-card__body') as HTMLElement;
    // Nothing may follow the primary action: a quieter control underneath it
    // would compete with the one thing the card is for.
    expect(body.lastElementChild?.classList.contains('shop-card__cta')).toBe(true);
    const meta = body.querySelector('.shop-card__meta') as HTMLElement;
    const cta = body.querySelector('.shop-card__cta') as HTMLElement;
    // jsdom has no layout, so compare document order instead of position.
    expect(meta.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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
