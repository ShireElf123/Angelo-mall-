/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createSeedState } from '../data/seed';
import { shopLogoAsset } from '../data/shopLogos';
import { ShopLogo } from './ShopLogo';

/**
 * Every shop in the directory must show a readable label.
 *
 * Before this, sixteen of the twenty-nine tenants had no sourced brand logo and
 * fell back to a bare initials tile — a coloured square reading "CC", "ZZ", "BB"
 * — sitting beside thirteen shops that displayed a real mark. Shown the mall's
 * own signage photograph, the owner read those tiles as missing data and asked
 * for the labels back. The fallback is now a signage plate carrying the trading
 * name, so no shop is ever identified by initials alone.
 */

const shops = createSeedState().shops;

describe('shop identity labels', () => {
  it('never leaves a shop labelled by initials only', () => {
    for (const shop of shops) {
      const { container, unmount } = render(<ShopLogo shop={shop} size="sm" />);

      const image = container.querySelector('img.shop-logo__image');
      const plateWord = container.querySelector('.shop-logo__plate-word')?.textContent?.trim();

      // Either a real brand mark, or the trading name on a plate. Never neither.
      expect(Boolean(image) || Boolean(plateWord), `${shop.id} has no visible label`).toBe(true);

      // A plate must spell out more than the initials it replaced.
      if (plateWord) {
        expect(plateWord, `${shop.id} plate is only initials`).not.toBe(shop.initials);
        expect(plateWord.length).toBeGreaterThan(shop.initials.length);
      }
      unmount();
    }
  });

  it('sets the plate in the tenant name, not an invented one', () => {
    const noLogo = shops.filter((shop) => !shopLogoAsset(shop.id));
    expect(noLogo.length).toBe(16);
    for (const shop of noLogo) {
      const { container, unmount } = render(<ShopLogo shop={shop} size="sm" />);
      expect(container.querySelector('.shop-logo__plate-word')?.textContent).toBe(
        shop.name.toUpperCase(),
      );
      unmount();
    }
  });

  it('paints the plate in the tenant colour, so it reads as that shop', () => {
    const shop = shops.find((candidate) => candidate.id === 'shop-maxis')!;
    const { container } = render(<ShopLogo shop={shop} size="sm" />);
    const plate = container.querySelector('.shop-logo__plate') as HTMLElement;
    expect(plate.style.background).toBeTruthy();
    // Decorative: the plate must not become the accessible name.
    expect(plate.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps the shop name as real text for assistive technology', () => {
    for (const shop of shops.slice(0, 6)) {
      const { container, unmount } = render(<ShopLogo shop={shop} size="sm" />);
      const word = container.querySelector('.shop-logo__word');
      expect(word?.textContent).toBe(shop.name);
      // Exactly once in the document, whether it shows a logo or a plate.
      expect(screen.queryAllByText(shop.name)).toHaveLength(1);
      unmount();
    }
  });

  it('does not print the name twice when the plate already spells it out', () => {
    const shop = shops.find((candidate) => candidate.id === 'shop-cash-crusaders')!;
    const { container } = render(<ShopLogo shop={shop} size="sm" />);
    const word = container.querySelector('.shop-logo__word');
    expect(word?.classList.contains('visually-hidden')).toBe(true);
    // The plate carries the name set as signage; the title-case copy next to it
    // is clipped for sighted users but kept for screen readers. Exactly one of
    // each, never two visible copies.
    expect(container.textContent?.match(/CASH CRUSADERS/g) ?? []).toHaveLength(1);
    expect(container.textContent?.match(/Cash Crusaders/g) ?? []).toHaveLength(1);
  });
});

describe('the visually-hidden accessible name', () => {
  it('cannot escape the card and stretch the page sideways', async () => {
    // The accessible name is hidden with .visually-hidden, which is
    // position:absolute. With no positioned ancestor the 1px box was placed
    // against the page instead of the card, so inside the horizontal shop rail
    // it sat far to the right and made the whole Home page scroll 825px
    // sideways on a phone. .shop-logo must establish a containing block.
    const css = (await import('../index.css?raw')).default as string;
    // The lockup's own rule, not the `flex: 1 1 auto` override further down.
    const start = css.indexOf('.shop-logo {\n  display: inline-flex');
    expect(start).toBeGreaterThan(-1);
    const block = css.slice(start, css.indexOf('}', start));
    expect(block).toContain('position: relative');
  });
});

describe('signage plate styling', () => {
  it('wraps long trading names instead of clipping them', async () => {
    // "AVIYA PHOTOGRAPHY & GRAPHICS" and "CARWASH @ ANGELO MALL" are the longest
    // of the sixteen; a nowrap plate would either clip or overflow the card.
    const css = (await import('../index.css?raw')).default as string;
    const start = css.indexOf('.shop-logo__plate {');
    expect(start).toBeGreaterThan(-1);
    const block = css.slice(start, css.indexOf('}', start));
    expect(block).toContain('max-width: 100%');
    const wordStart = css.indexOf('.shop-logo__plate-word {');
    const wordBlock = css.slice(wordStart, css.indexOf('}', wordStart));
    expect(wordBlock).toContain('overflow-wrap: break-word');
  });
});
