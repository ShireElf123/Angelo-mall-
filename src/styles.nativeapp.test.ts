import { describe, expect, it } from 'vitest';
import css from './index.css?raw';

/**
 * Native-app pass — style contracts.
 *
 * jsdom cannot lay out CSS, so these pin the decisions that a later edit could
 * quietly undo and that the screenshots depended on:
 *
 *  - the phone hero is a light card under a green bar, not a second dark slab;
 *  - the demo notice shares one line with the role disclosure;
 *  - the activity cards are a real two-up grid;
 *  - a 320px phone gets two shop columns, because three truncated a real
 *    tenant's name and the "Sample chat" label.
 *
 * Rendered appearance is verified in a browser and reported separately.
 */

const rule = (selector: string): string => {
  const blocks: string[] = [];
  let index = css.indexOf(`\n${selector} {`);
  while (index !== -1) {
    const end = css.indexOf('}', index);
    blocks.push(css.slice(index, end + 1));
    index = css.indexOf(`\n${selector} {`, end);
  }
  return blocks.join('\n');
};

/** Every media block with this exact query, concatenated in source order. */
const media = (query: string): string =>
  [
    ...css.matchAll(new RegExp(`@media ${query.replace(/[()]/g, '\\$&')}\\s*\\{([\\s\\S]*?)\\n\\}`, 'g')),
  ]
    .map((m) => m[1])
    .join('\n');

describe('phone shell', () => {
  it('opens on a greeting on the page, with no hero plate at all', () => {
    // The owner asked for the poster to go after comparing the app with a
    // reference that opens on a greeting. Two dark blocks stacked (bar + hero)
    // was the "web page" tell; there is now no second block at all.
    expect(rule('.home-hello')).not.toBe('');
    expect(rule('.hero')).toBe('');
    expect(rule('.hero__aside')).toBe('');
    const phone = media('(max-width: 899px)');
    expect(phone).toMatch(/\.app-header\s*\{[^}]*rgba\(255, 255, 255/s);
  });

  it('gives the app header a white bar with a hairline, not a green band', () => {
    // The dark green bar was the biggest remaining difference from the
    // reference, which is white to the top edge. It is also the reason the
    // screen said "website masthead" before it said "app". The green is still
    // the brand's, but it lives in type, icons and the tab pill.
    const phone = media('(max-width: 899px)');
    expect(phone).toMatch(/\.app-header\s*\{[^}]*border-bottom: 1px solid var\(--border\)/s);
    expect(phone).not.toMatch(/\.app-header\s*\{[^}]*var\(--forest-900\)/s);
  });

  it('keeps the demo strip light, so a phone does not open on two dark slabs', () => {
    expect(rule('.demo-bar')).toContain('background: var(--surface)');
    expect(rule('.demo-bar')).toContain('border-bottom: 1px solid var(--border)');
    expect(rule('.demo-bar')).not.toContain('var(--forest-950)');
  });

  it('keeps the demo notice on one line beside the role disclosure', () => {
    const phone = media('(max-width: 899px)');
    // A permanent 2x2 grid of role buttons took 110px before the app began.
    expect(phone).toMatch(/\.demo-bar\s*\{[^}]*padding: 5px 10px;/s);
    expect(rule('.demo-drawer__summary')).toContain('list-style: none');
    expect(rule('.demo-drawer__summary:focus-visible')).toContain('outline: 2px solid var(--gold-500)');
  });

  it('still shows the four roles in one row inside the drawer on a phone', () => {
    const small = media('(max-width: 560px)');
    expect(small).toMatch(/\.role-switcher\s*\{[^}]*display: flex;/s);
    expect(small).toMatch(/\.role-switcher__btn\s*\{[^}]*flex: 1 1 0;/s);
  });
});

describe('activity cards', () => {
  it('lay out as a real two-up grid of tappable cards', () => {
    const grid = rule('.home-stat-grid');
    expect(grid).toContain('display: grid');
    expect(grid).toContain('repeat(2, minmax(0, 1fr))');
    // Row, not column: the label and number sit beside the icon, as on the
    // reference dashboard. A column stacked the icon under the number.
    expect(rule('.home-stat')).toContain('flex-direction: row');
  });
});

describe('smallest phones', () => {
  it('uses two shop columns on a phone, and one at 320px', () => {
    // Two-up like the reference's "Home View". Three columns at 390px broke
    // "SUPERSPAR" mid-word and truncated "Sample chat"; at 320px even two
    // columns left the name as "The Angelo…", so the smallest phones get one
    // full-width row per shop rather than a cut label.
    expect(rule('.shop-launcher__grid')).toContain('repeat(2, minmax(0, 1fr))');
    expect(media('(max-width: 379px)')).toMatch(
      /\.shop-launcher__grid\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\)/s,
    );
  });

  it('stacks a section header rather than wrapping its title and link', () => {
    const small = media('(max-width: 559px)');
    expect(small).toMatch(/\.section-header\s*\{[^}]*flex-direction: column;/s);
  });
});

describe('reference parity — flat white surfaces', () => {
  /**
   * The owner compared the app against the reference and asked why it did not
   * look like it. The answer was warm cream page + brown hairline + a shadowed
   * card on every surface: the reference is a white page, white cards and one
   * green accent. These pin that decision so it cannot drift back.
   */
  it('paints the page a cool off-white and cards pure white', () => {
    const page = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
    expect(page).toMatch(/--bg:\s*#f2f5f2/);
    expect(page).toMatch(/--surface:\s*#ffffff/);
    // The warm cream and its brown border were the whole mismatch.
    expect(page).not.toMatch(/--bg:\s*#f4eee2/);
    expect(page).not.toMatch(/--border:\s*#d5c9ae/);
  });

  it('draws the shop tile as a flat row: a 44px mark beside the name', () => {
    const tile = rule('.shop-tile');
    expect(tile).toContain('grid-template-columns: 44px minmax(0, 1fr)');
    expect(tile).toContain('box-shadow: none');
    expect(rule('.shop-tile__mark')).toContain('width: 44px');
    // The fallback mark is a tint of the tenant colour with the glyph in the
    // colour itself — set inline by ShopTile — so the glyph must follow the
    // text colour rather than being hard-coded white.
    expect(rule('.shop-tile__glyph')).toContain('stroke: currentColor');
  });

  it('marks the two activity cards with a ring, not a filled tint', () => {
    const card = rule('.home-stat');
    expect(card).toContain('background: var(--surface)');
    expect(card).toContain('border: 1px solid var(--border)');
    expect(rule('.home-stat__icon')).toContain('border: 1.5px solid var(--forest-700)');
    expect(rule('.home-stat__icon')).toContain('background: transparent');
  });

  it('offers a quiet "See more" on the launcher rather than only a large button', () => {
    expect(rule('.shop-launcher__more')).toContain('background: none');
    expect(rule('.shop-launcher__more')).toContain('color: var(--forest-700)');
    // It is still a real target.
    expect(rule('.shop-launcher__more')).toContain('min-height: 44px');
  });
});

describe('motion', () => {
  it('covers the new controls in the reduced-motion switch', () => {
    const reduced = css.split('@media (prefers-reduced-motion: reduce)').pop() ?? '';
    expect(reduced).toContain('.home-stat:active');
    expect(reduced).toContain('.demo-drawer__summary:active');
    expect(reduced).toContain('.shop-launcher__more:active');
  });
});
