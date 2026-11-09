/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { categoryLabel, createSeedState } from '../data/seed';
import { shopLogoAsset } from '../data/shopLogos';
import { ShopCard } from './ShopCard';

const seed = createSeedState();
const shop = seed.shops.find((candidate) => candidate.id === 'shop-kfc')!;
/** A tenant with no verified mark, i.e. the signage-plate case. */
const noLogoShop = seed.shops.find((candidate) => candidate.id === 'shop-cash-crusaders')!;

describe('ShopCard', () => {
  it('leads with the verified brand mark, not concept art', () => {
    const { container } = render(<ShopCard shop={shop} onOpen={() => {}} />);
    const asset = shopLogoAsset(shop.id)!;
    expect(asset, 'KFC has a verified mark in the registry').toBeTruthy();

    expect(screen.getAllByText(categoryLabel(shop.category)).length).toBeGreaterThanOrEqual(1);
    const mark = container.querySelector('.shop-card__media img.shop-card__mark') as HTMLImageElement;
    expect(mark.getAttribute('src')).toBe(asset.file);
    expect(mark.getAttribute('loading')).toBe('lazy');
    // Decorative: the shop name in the body carries the accessible name.
    expect(mark.getAttribute('alt')).toBe('');
    expect(mark.style.aspectRatio).toBe(`${asset.aspectRatio}`);

    // The AI concept frame and its disclaimer are gone from cards entirely —
    // there is no concept art left here to disclose.
    expect(container.querySelector('.shop-card__concept-chip')).toBeNull();
    expect(container.querySelector('picture')).toBeNull();
  });

  it('sizes each mark to its own shape instead of one fixed box', () => {
    const { container } = render(<ShopCard shop={shop} onOpen={() => {}} />);
    const wrap = container.querySelector('.shop-card__mark-wrap') as HTMLElement;
    // A width cap derived from the mark's aspect ratio, so a wide wordmark and
    // a roundel carry the same visual weight in the same row.
    const raw = wrap.style.getPropertyValue('--mark-width');
    expect(raw).toMatch(/^\d+%$/);
    const width = Number(raw.replace('%', ''));
    expect(width).toBeGreaterThanOrEqual(34);
    expect(width).toBeLessThanOrEqual(78);
  });

  it('prints an opaque JPEG mark on white instead of on the tint', () => {
    const spar = seed.shops.find((candidate) => candidate.id === 'shop-superspar')!;
    expect(shopLogoAsset(spar.id)?.file).toMatch(/\.jpe?g$/i);
    const { container } = render(<ShopCard shop={spar} onOpen={() => {}} />);
    expect(container.querySelector('.shop-card__mark-wrap--printed')).not.toBeNull();
  });

  it('gives a tenant with no verified mark a signage plate, not a hole', () => {
    expect(shopLogoAsset(noLogoShop.id)).toBeUndefined();
    const { container } = render(<ShopCard shop={noLogoShop} onOpen={() => {}} />);
    const media = container.querySelector('.shop-card__media') as HTMLElement;
    expect(media.className).toContain('is-sign');
    expect(media.querySelector('.shop-card__sign-glyph')).not.toBeNull();
    // The trade name is set in caps on the plate itself.
    expect(media.querySelector('.shop-card__sign-word')?.textContent).toBe(noLogoShop.name);
    expect(media.querySelector('img')).toBeNull();
  });

  it('falls back to the signage plate when a logo file fails to load', () => {
    const { container } = render(<ShopCard shop={shop} onOpen={() => {}} />);
    const mark = container.querySelector('.shop-card__media img.shop-card__mark') as HTMLImageElement;
    fireEvent.error(mark);
    // A broken image must never reach the UI: the plate becomes the fascia.
    expect(container.querySelector('.shop-card__media img')).toBeNull();
    expect(container.querySelector('.shop-card__sign-word')?.textContent).toBe(shop.name);
  });

  it('names the shop once in the body, now that the plate carries the mark', () => {
    const { container } = render(<ShopCard shop={shop} onOpen={() => {}} />);
    expect(container.querySelector('.shop-card__titles')?.textContent).toBe(shop.name);
    // The small logo lock-up beside the name would repeat the plate's mark.
    expect(container.querySelector('.shop-card__brand .shop-logo')).toBeNull();
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
