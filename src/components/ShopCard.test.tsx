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
    const widthFor = (shopId: string) => {
      const candidate = seed.shops.find((item) => item.id === shopId)!;
      const { container, unmount } = render(<ShopCard shop={candidate} onOpen={() => {}} />);
      const raw = (container.querySelector('.shop-card__mark-wrap') as HTMLElement).style.getPropertyValue(
        '--mark-width',
      );
      unmount();
      expect(raw).toMatch(/^\d+%$/);
      return Number(raw.replace('%', ''));
    };

    // A width cap derived from the mark's aspect ratio, so a wide wordmark and
    // a roundel carry the same visual weight in the same row.
    for (const shopId of ['shop-kfc', 'shop-superspar', 'shop-pep', 'shop-mtn']) {
      const width = widthFor(shopId);
      expect(width).toBeGreaterThanOrEqual(42);
      expect(width).toBeLessThanOrEqual(80);
    }
    // The wide wordmark earns more width than the near-square roundel, but not
    // in proportion to its ratio: a 3.2:1 mark is not three times the roundel.
    const wide = widthFor('shop-superspar');
    const round = widthFor('shop-kfc');
    expect(wide).toBeGreaterThan(round);
    expect(wide / round).toBeLessThan(2);
  });

  it('prints an opaque mark on white instead of on the tint', () => {
    const spar = seed.shops.find((candidate) => candidate.id === 'shop-superspar')!;
    // JPEGs carry their own white background, so the registry flags them.
    expect(shopLogoAsset(spar.id)?.opaqueBackground).toBe(true);
    const { container } = render(<ShopCard shop={spar} onOpen={() => {}} />);
    expect(container.querySelector('.shop-card__mark-wrap--printed')).not.toBeNull();

    // KFC's PNG is opaque too — a flat export, not a transparent one. The old
    // check sniffed the file extension and missed it, so it sat on the tint as
    // a white rectangle.
    const kfc = seed.shops.find((candidate) => candidate.id === 'shop-kfc')!;
    expect(shopLogoAsset(kfc.id)?.file).toMatch(/\.png(\?|$)/i);
    const kfcCard = render(<ShopCard shop={kfc} onOpen={() => {}} />);
    expect(kfcCard.container.querySelector('.shop-card__mark-wrap--printed')).not.toBeNull();
  });

  it('gives white-ink artwork a solid plate so it cannot vanish', () => {
    for (const shopId of ['shop-ocean-basket', 'shop-postnet']) {
      const whiteInk = seed.shops.find((candidate) => candidate.id === shopId)!;
      expect(shopLogoAsset(shopId)?.needsLightVariant, `${shopId} should be flagged`).toBe(true);
      const { container, unmount } = render(<ShopCard shop={whiteInk} onOpen={() => {}} />);
      const media = container.querySelector('.shop-card__media') as HTMLElement;
      expect(media.className).toContain('is-solid');
      expect(media.style.getPropertyValue('--plate-solid')).toBe(whiteInk.colour);
      unmount();
    }
    // A normal dark-ink mark keeps the soft tint, not a heavy block of colour.
    const { container } = render(<ShopCard shop={shop} onOpen={() => {}} />);
    expect((container.querySelector('.shop-card__media') as HTMLElement).className).not.toContain('is-solid');
  });

  it('uses the Clicks shop mark, not the parent company’s corporate lock-up', () => {
    const clicks = seed.shops.find((candidate) => candidate.id === 'shop-clicks')!;
    const asset = shopLogoAsset(clicks.id)!;
    // The retail mark is a wide lock-up (unicorn, CLICKS, pharmacy cross) and is
    // bundled locally; the corporate "CLICKS GROUP LIMITED" wordmark is not the
    // brand a shopper recognises over the shop door.
    expect(asset.file).toBe('/images/logos/clicks.png');
    expect(asset.notes).toMatch(/parent company/i);
    expect(asset.aspectRatio).toBeGreaterThan(4);
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
