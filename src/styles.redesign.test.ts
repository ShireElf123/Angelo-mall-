import { describe, expect, it } from 'vitest';
import css from './index.css?raw';

/**
 * Bundle 3 — customer composition contract.
 *
 * jsdom cannot lay out CSS, so these pin the *mechanisms* the redesign depends
 * on, not its appearance: the hero is a card with its own image panel rather
 * than a photograph under a scrim, the category strip is one scroll container
 * that becomes a grid when there is room, and the tenant card's action no
 * longer competes with its artwork.
 *
 * Rendered appearance at 320/360/390/430/768/1280 is NOT verified by this file
 * and is reported separately.
 */

/** Every declaration block for a selector, concatenated in source order. */
const rule = (selector: string): string => {
  const needle = `${selector} {`;
  const blocks: string[] = [];
  let index = css.indexOf(needle);
  while (index !== -1) {
    const end = css.indexOf('}', index);
    blocks.push(css.slice(index, end + 1));
    index = css.indexOf(needle, end);
  }
  return blocks.join('\n');
};

const mediaBlocks = (query: string): string[] =>
  [...css.matchAll(new RegExp(`@media ${query.replace(/[()]/g, '\\$&')}\\s*\\{([\\s\\S]*?)\\n\\}`, 'g'))].map(
    (m) => m[1],
  );

describe('display type', () => {
  it('declares one display face for the customer headlines', () => {
    expect(css).toMatch(/--font-display:\s*[^;]*serif/);
    expect(rule('.hero h1')).toContain('font-family: var(--font-display)');
    expect(rule('.page-header__title')).toContain('font-family: var(--font-display)');
    expect(rule('.spotlight__title')).toContain('font-family: var(--font-display)');
  });

  it('keeps the body copy in the UI face', () => {
    // The serif is a headline voice, not a theme: body text must not inherit it.
    expect(css).not.toMatch(/body\s*\{[^}]*font-family:\s*var\(--font-display\)/s);
  });
});

describe('home hero', () => {
  it('is a card with a photograph panel instead of a full-bleed image under a scrim', () => {
    const hero = rule('.hero');
    expect(hero).toContain('display: grid');
    expect(hero).toContain('background: var(--forest-950)');
    // A scrim over the artwork is how the old hero bought contrast: it dimmed
    // the picture it was trying to show. The two must not come back together.
    expect(hero).not.toContain('linear-gradient');
    expect(rule('.hero__shade')).toBe('');
    expect(css).not.toMatch(/\.hero__shade/);
  });

  it('stacks the panels on a phone and splits them on a wide screen', () => {
    expect(rule('.hero__aside')).toContain('order: -1');
    const wide = mediaBlocks('(min-width: 780px)').join('\n');
    expect(wide).toMatch(/\.hero\s*\{[^}]*grid-template-columns/s);
    expect(wide).toMatch(/\.hero__aside\s*\{\s*order: 0;/s);
  });

  it('uses no glass or blur behind the copy', () => {
    for (const selector of ['.hero', '.shop-card', '.directory-head', '.spotlight']) {
      expect(rule(selector), `${selector} uses backdrop-filter`).not.toContain('backdrop-filter');
    }
  });
});

describe('category rail', () => {
  it('scrolls as one strip on phones and keeps the page itself still', () => {
    const rail = rule('.category-grid');
    expect(rail).toContain('grid-auto-flow: column');
    expect(rail).toContain('overflow-x: auto');
    expect(rail).toContain('overscroll-behavior-x: contain');
    expect(rail).toContain('max-width: calc(100% + var(--space-4))');
    expect(rail).toContain('scroll-snap-type');
  });

  it('becomes a normal grid once the viewport can hold one', () => {
    // Without undoing every rail property the strip would keep overflowing.
    const wide = mediaBlocks('(min-width: 640px)').join('\n');
    expect(wide).toMatch(/\.category-grid\s*\{[^}]*grid-auto-flow: row/s);
    expect(wide).toMatch(/\.category-grid\s*\{[^}]*overflow: visible/s);
    // The old 2-column rules at <=420px would win on a small phone.
    const tiny = mediaBlocks('(max-width: 420px)').join('\n');
    expect(tiny).not.toMatch(/\.category-grid\s*\{[^}]*grid-template-columns/s);
  });

  it('gives the artwork the tile instead of a thumbnail beside a label', () => {
    const tile = rule('.category-tile');
    expect(tile).toContain('flex-direction: column');
    expect(tile).toContain('overflow: hidden');
    expect(rule('.category-tile img')).toContain('aspect-ratio: 1 / 1');
  });
});

describe('need tiles', () => {
  it('leads with one full-width tile on phones, then a two-up block', () => {
    expect(css).toMatch(/\.need-grid > li:first-child\s*\{\s*grid-column: 1 \/ -1;/s);
    expect(css).toMatch(/\.need-grid > li:first-child \.need-tile img\s*\{[^}]*aspect-ratio: 16 \/ 9/s);
  });

  it('drops the lead treatment when the grid has three or five columns', () => {
    const wide = mediaBlocks('(min-width: 640px)').join('\n');
    expect(wide).toMatch(/\.need-grid > li:first-child\s*\{\s*grid-column: auto;/s);
  });

  it('lets the artwork run to the tile edge', () => {
    // Padding on the tile is what made a photograph look like a swatch.
    expect(rule('.need-tile')).toContain('padding: 0');
    expect(rule('.need-tile img')).toContain('border-radius: 0');
  });
});

describe('tenant card', () => {
  it('demotes the action to a hairline row instead of a filled pill', () => {
    const quiet = rule('.btn--quiet');
    expect(quiet).toContain('border-top: 1px solid var(--border)');
    expect(quiet).toContain('border-radius: 0');
    expect(quiet).toContain('justify-content: space-between');
    expect(quiet).toContain('background: transparent');
    // It must still be a comfortable target.
    expect(css).toMatch(/\.shop-card__body > \.btn:last-child\s*\{\s*min-height: 46px;/s);
  });

  it('reads category, then identity, then action', () => {
    expect(rule('.shop-card__category')).toContain('text-transform: uppercase');
    // The name keeps the full width; nothing shares its row.
    expect(rule('.shop-card__brand')).toContain('flex-direction: column');
    expect(rule('.shop-card__titles')).toContain('width: 100%');
  });

  it('only lifts on a device that can hover', () => {
    // A hover transform that sticks after a tap is worse than none on touch.
    const hoverBlocks = [...css.matchAll(/@media \(hover: hover\)\s*\{([\s\S]*?)\n\}/g)].map((m) => m[1]);
    const cardHover = hoverBlocks.find((block) => block.includes('.shop-card:hover')) ?? '';
    expect(cardHover).not.toBe('');
    expect(cardHover).toContain('translateY');
  });
});

describe('directory discovery card', () => {
  it('groups title, search and filters on one surface', () => {
    const head = rule('.directory-head');
    expect(head).toContain('background: var(--surface)');
    expect(head).toMatch(/border-top: 3px solid var\(--gold-500\)/);
    expect(head).toContain('box-shadow');
    // The search keeps its taller target inside the card.
    expect(css).toMatch(/\.directory-controls \.search-field\s*\{[^}]*min-height: 52px/s);
  });

  it('keeps the result count on its own line', () => {
    expect(rule('.results-bar')).toContain('justify-content: space-between');
  });
});

describe('home walkthrough panel', () => {
  it('becomes a two-column panel on a tablet and up', () => {
    expect(rule('.spotlight')).toContain('overflow: hidden');
    const wide = mediaBlocks('(min-width: 720px)').join('\n');
    expect(wide).toMatch(/\.spotlight\s*\{[^}]*grid-template-columns:\s*minmax/s);
  });
});

describe('featured tenant rail', () => {
  it('scrolls sideways on phones and stops being a rail on wider screens', () => {
    const rail = rule('.shop-grid--rail');
    expect(rail).toContain('grid-auto-flow: column');
    expect(rail).toContain('overflow-x: auto');
    expect(rail).toContain('overscroll-behavior-x: contain');
    const wide = mediaBlocks('(min-width: 640px)').join('\n');
    expect(wide).toMatch(/\.shop-grid--rail\s*\{[^}]*grid-auto-flow: row/s);
    expect(wide).toMatch(/\.shop-grid--rail\s*\{[^}]*overflow: visible/s);
  });
});

describe('closing band', () => {
  it('closes Home on the brand colour rather than another white box', () => {
    expect(rule('.how-it-works')).toContain('background: var(--forest-950)');
    expect(rule('.steps li')).toContain('rgba(255, 255, 255, 0.06)');
    // The section heading is forest-950 by default and must be reversed here.
    expect(css).toMatch(/\.how-it-works \.section-header h2\s*\{\s*color: #fff;/s);
  });
});
