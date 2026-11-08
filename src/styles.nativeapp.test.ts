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
  it('turns the phone hero into a light card instead of a dark slab', () => {
    // Two dark blocks stacked (bar + hero) was the "web page" tell. The hero
    // takes the card surface below 900px and regains the forest plate above it.
    const phone = media('(max-width: 899px)');
    expect(phone).not.toBe('');
    expect(phone).toMatch(/\.hero\s*\{\s*background: var\(--surface\);/s);
    expect(rule('.hero')).toContain('background: var(--forest-950)');
  });

  it('gives the app header the brand green rather than a light bar', () => {
    const phone = media('(max-width: 899px)');
    expect(phone).toMatch(/\.app-header\s*\{[^}]*var\(--forest-900\)/s);
    expect(phone).toMatch(/\.brand__text strong\s*\{\s*color: #fff;/s);
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
  it('uses two shop columns at 320-379px so names and labels stay whole', () => {
    const small = media('(max-width: 379px)');
    expect(small).toMatch(/\.shop-launcher__grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/s);
    // Three columns left ~86px per tile, which broke "SUPERSPAR" mid-word.
    expect(rule('.shop-launcher__grid')).toContain('repeat(3, minmax(0, 1fr))');
  });

  it('stacks a section header rather than wrapping its title and link', () => {
    const small = media('(max-width: 559px)');
    expect(small).toMatch(/\.section-header\s*\{[^}]*flex-direction: column;/s);
  });
});

describe('motion', () => {
  it('covers the new controls in the reduced-motion switch', () => {
    const reduced = css.split('@media (prefers-reduced-motion: reduce)').pop() ?? '';
    expect(reduced).toContain('.home-stat:active');
    expect(reduced).toContain('.demo-drawer__summary:active');
  });
});
