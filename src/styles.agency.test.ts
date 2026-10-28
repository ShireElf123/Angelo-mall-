import { describe, expect, it } from 'vitest';
import css from './index.css?raw';

/**
 * Agency UI bundle — shell, directory and overflow contracts.
 *
 * jsdom cannot lay out CSS, so nothing here proves what the app *looks* like.
 * These pin the specific mechanisms that keep the layout from regressing:
 * a single scroll container for the category chips, a demo bar that cannot
 * reflow into three rows, and a card with one surface instead of three.
 */

const rule = (selector: string): string => {
  const blocks: string[] = [];
  let index = css.indexOf(`${selector} {`);
  while (index !== -1) {
    const end = css.indexOf('}', index);
    blocks.push(css.slice(index, end + 1));
    index = css.indexOf(`${selector} {`, end);
  }
  return blocks.join('\n');
};

/** The body of a media query block, by exact query text. */
const mediaBlocks = (query: string): string[] =>
  [...css.matchAll(new RegExp(`@media ${query.replace(/[()]/g, '\\$&')}\\s*\\{([\\s\\S]*?)\\n\\}`, 'g'))].map(
    (m) => m[1],
  );

describe('app shell compaction', () => {
  it('collapses the demo notice and reset to one strip on phones', () => {
    const phone = mediaBlocks('(max-width: 639px)').join('\n');
    expect(phone, 'no <=639px shell pass').not.toBe('');
    expect(phone).toMatch(/\.demo-bar\s*\{[^}]*flex-wrap: nowrap/s);
    expect(phone).toMatch(/\.demo-bar__label\s*\{\s*display: none;/);
    // The icon-only reset must keep an accessible name in the markup, which is
    // asserted in ShellUi.test.tsx; here we only assert the visual hiding.
    expect(phone).toMatch(/\.demo-bar__reset-label\s*\{[^}]*clip: rect\(0 0 0 0\)/s);
  });

  it('keeps every workspace role reachable in a single scrolling row', () => {
    const switcher = rule('.role-switcher');
    expect(switcher).toContain('overflow-x: auto');
    expect(switcher).toContain('flex-wrap: nowrap');
    // Buttons must not shrink, or the row would squash instead of scrolling.
    expect(rule('.role-switcher__btn')).toContain('flex: none');
  });

  it('gives the desktop and phone navigations the same active treatment', () => {
    // Same forest-100 pill behind the icon in both navs; the old desktop rule
    // used a different wash, so "you are here" looked like two systems.
    expect(css).toMatch(/\.bottom-nav \.nav-item--active \.nav-item__icon\s*\{[^}]*background: var\(--forest-100\)/s);
    expect(css).toMatch(/\.top-nav \.nav-item--active \.nav-item__icon\s*\{[^}]*background: var\(--forest-100\)/s);
    expect(css).toMatch(/\.top-nav \.nav-item--active svg\s*\{\s*stroke-width: 2\.4;/);
  });
});

describe('directory category chips', () => {
  it('scroll in one row instead of wrapping into several', () => {
    const scroller = rule('.chip-row--scroll');
    expect(scroller).not.toBe('');
    expect(scroller).toContain('flex-wrap: nowrap');
    expect(scroller).toContain('overflow-x: auto');
    expect(scroller).toContain('overflow-y: hidden');
  });

  it('keeps the sideways scroll inside the chip row, not the page', () => {
    const scroller = rule('.chip-row--scroll');
    // A width cap plus a contained overscroll keeps the page itself static.
    expect(scroller).toContain('max-width: calc(100% + var(--space-4))');
    expect(scroller).toContain('overscroll-behavior-x: contain');
  });

  it('lets a chip be reached by keyboard without the ring being clipped', () => {
    const scroller = rule('.chip-row--scroll');
    expect(scroller).toContain('padding: 3px');
    expect(rule('.chip-row--scroll > .chip')).toContain('flex: none');
  });

  it('still wraps normally everywhere the scroller modifier is not applied', () => {
    expect(rule('.chip-row')).toContain('flex-wrap: wrap');
  });
});

describe('directory reading order and density', () => {
  it('keeps the search box taller than a generic field', () => {
    expect(css).toMatch(/\.directory-controls \.search-field\s*\{[^}]*min-height: 52px/s);
  });

  it('no longer gives the discovery strip hero-level padding', () => {
    const strip = rule('.discovery-strip');
    expect(strip).toContain('padding: 9px 11px');
    // It must stay a strip: no 132px illustrated card above the results.
    expect(rule('.discovery-strip__art')).toContain('width: 96px');
  });

  it('shrinks the strip art further on phones', () => {
    const phone = mediaBlocks('(max-width: 639px)').join('\n');
    expect(phone).toMatch(/\.discovery-strip__art\s*\{\s*width: 60px;/);
  });
});

describe('shop card composition', () => {
  it('uses one surface per card instead of a panel inside a panel', () => {
    const brand = rule('.shop-card__brand');
    expect(brand).toContain('border: none');
    expect(brand).toContain('background: none');
    // Still load-bearing: the column stack is what keeps long names un-clipped.
    expect(brand).toContain('flex-direction: column');
    expect(rule('.shop-card__titles')).toContain('width: 100%');
  });

  it('clamps the tagline so a row of cards stays even', () => {
    const tagline = rule('.shop-card__tagline');
    expect(tagline).toContain('-webkit-line-clamp: 2');
    expect(tagline).toContain('overflow: hidden');
  });

  it('keeps the concept artwork primary and uncropped', () => {
    expect(rule('.shop-card__media')).toContain('aspect-ratio: 16 / 9');
    expect(css).toContain('object-fit: cover');
  });

  it('keeps the participation disclosure on the card', () => {
    // Demoted visually, never removed.
    expect(rule('.pill--participation')).toContain('background: var(--surface-warm)');
  });
});

describe('narrow-phone guards', () => {
  it('has an explicit 320-359px pass that shortens the header', () => {
    const tiny = mediaBlocks('(max-width: 359px)').join('\n');
    expect(tiny).not.toBe('');
    expect(tiny).toMatch(/\.brand__text small\s*\{\s*display: none;/);
  });

  it('never sets a fixed page width wider than the smallest phone', () => {
    // Any literal width over 320px on a page-level container would force a
    // horizontal scrollbar on the narrowest Android screens.
    const pageRules = rule('.page');
    // A *max*-width is fine and expected; a fixed `width` or `min-width` over
    // the smallest phone is what would force a sideways page scroll.
    expect(pageRules).not.toMatch(/(?<!max-)width:\s*\d{3,}px/);
    expect(pageRules).not.toMatch(/min-width:\s*\d+px/);
  });

  it('reserves the fixed bar height including the safe area', () => {
    expect(css).toMatch(/--bottom-nav-h:\s*calc\([^)]*env\(safe-area-inset-bottom/);
  });

  it('lets the brand text ellipsis rather than overflow', () => {
    expect(rule('.brand__text strong')).toMatch(/overflow: hidden/);
    expect(rule('.brand__text strong')).toMatch(/text-overflow: ellipsis/);
  });
});
