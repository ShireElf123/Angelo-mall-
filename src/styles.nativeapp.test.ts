import { describe, expect, it } from 'vitest';
import css from './cssSource';

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

/** A custom property's value, from the first `:root` block that declares it. */
const token = (name: string): string =>
  css.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim() ?? '';

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
    expect(phone).toMatch(/\.app-header\s*\{[^}]*background: var\(--app-bar\)/s);
  });

  it('gives the app header the reference\'s green bar, with white type', () => {
    // The reference's bar is a solid moss green with a white wordmark, and the
    // grey content sheet tucks in under it with rounded top corners. That
    // silhouette — green band, rounded sheet — is the thing that reads as this
    // app at a glance, so both halves are pinned here together.
    const phone = media('(max-width: 899px)');
    expect(phone).toMatch(/\.app-header\s*\{[^}]*background: var\(--app-bar\)/s);
    expect(phone).toMatch(/\.brand__text strong\s*\{\s*color: #fff;/s);
    expect(token('--app-bar')).toMatch(/^#[0-9a-f]{6}$/);
    expect(rule('.shell-main')).toContain('border-radius: 20px 20px 0 0');
  });

  it('keeps the demo strip on that same green band', () => {
    // One band, not two: the notice and the app bar share the colour so the top
    // of the screen is a single surface down to the sheet's corners.
    expect(rule('.demo-bar')).toContain('background: var(--app-bar)');
    expect(rule('.demo-bar')).toContain('border-bottom: 1px solid rgba(255, 255, 255, 0.12)');
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

describe('reference parity — the reference\'s own surfaces', () => {
  /**
   * The owner compared the app against the reference twice and both times the
   * gap was surface, not layout: first a warm cream page with brown hairlines,
   * then a white page whose cards were outlined like form fields. The reference
   * is a grey sheet (#f3f5f7, sampled from the mock) with outline-free white
   * cards on it, one solid green badge per row, and a green app bar. These pin
   * that, because every one of those decisions can be undone by one CSS edit.
   */
  it('paints the sheet the reference\'s grey and the cards pure white', () => {
    const page = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
    expect(page).toMatch(/--bg:\s*#f3f5f7/);
    expect(page).toMatch(/--surface:\s*#ffffff/);
    expect(page).toMatch(/--app-bar:\s*#[0-9a-f]{6}/);
    // Neither of the two rejected palettes may come back.
    expect(page).not.toMatch(/--bg:\s*#f4eee2/);
    expect(page).not.toMatch(/--bg:\s*#f2f5f2/);
  });

  it('draws the shop tile as a card whose brand band carries the mark', () => {
    const tile = rule('.shop-tile');
    // A column card: band, then name and facts. It was a 32px-chip row, which
    // only fitted near-square logos and read like an inbox row.
    expect(tile).toContain('flex-direction: column');
    expect(tile).toContain('border: none');
    expect(rule('.shop-tile__mark')).toContain('aspect-ratio: 2 / 1');
    expect(rule('.shop-tile__mark')).toContain('width: 100%');
    // The mark's own safe area is sized by the shared optical budget, so a wide
    // wordmark and a roundel carry the same visual weight.
    expect(rule('.shop-tile__mark-inner')).toContain('width: var(--mark-width');
    expect(rule('.shop-tile__logo')).toContain('object-fit: contain');
    // The one chat mark on the screen sits in the band's corner.
    expect(rule('.shop-tile__badge')).toContain('position: absolute');
    // Both fallbacks (signage band, row glyph) follow the tenant's own colour,
    // set inline, rather than being hard-coded white.
    expect(rule('.shop-tile__success')).toContain('stroke: currentColor');
    expect(rule('.shop-row__glyph')).toContain('stroke: currentColor');
  });

  it('marks the activity cards with the reference\'s solid green badge', () => {
    const card = rule('.home-stat');
    expect(card).toContain('background: var(--surface)');
    // No outline: the white card on the grey sheet is the whole separation.
    expect(card).toContain('border: none');
    expect(rule('.home-stat__icon')).toContain('background: var(--forest-900)');
    expect(rule('.home-stat__icon')).toContain('color: #fff');
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
