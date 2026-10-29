import { describe, expect, it } from 'vitest';
import css from './index.css?raw';

/**
 * Design-system contract for the app-polish bundle.
 *
 * jsdom cannot lay out CSS, so these pin the decisions that a later edit could
 * silently undo: a closed radius scale, sub-pixel-free type steps, a bottom bar
 * that reserves its safe-area, and press feedback that exists on every control
 * a thumb can hit. Rendered appearance is still unverified in this environment
 * and is reported as such.
 */

const token = (name: string): string => {
  const match = css.match(new RegExp(`${name}:\\s*([^;]+);`));
  return match?.[1].trim() ?? '';
};

const radiusValues = (): string[] =>
  [...css.matchAll(/border-radius:\s*([^;]+);/g)].map((m) => m[1].trim());

describe('radius scale', () => {
  it('defines one ordered scale rather than ad-hoc values', () => {
    const scale = [
      ['--radius-xs', 8],
      ['--radius-sm', 10],
      ['--radius-md', 12],
      ['--radius', 16],
      ['--radius-xl', 20],
    ] as const;
    for (const [name, px] of scale) {
      expect(token(name), `${name} missing`).toBe(`${px}px`);
    }
    expect(token('--radius-pill')).toBe('999px');
  });

  it('leaves no bare pixel radius outside the scale', () => {
    // Every horizontal radius must come from a token (or be a deliberate
    // 50% circle / asymmetric sheet corner). A stray literal is how the sheet
    // drifted to sixteen near-identical radii in the first place.
    const bare = radiusValues().filter((value) => /^\d+px$/.test(value));
    expect(bare, `un-tokenised radii: ${bare.join(', ')}`).toEqual([]);
  });

  it('uses a small, closed set of radius values', () => {
    const distinct = new Set(radiusValues());
    expect(distinct.size, [...distinct].join(' | ')).toBeLessThanOrEqual(10);
  });
});

describe('type scale', () => {
  it('has no two type steps within a fifth of a pixel of each other', () => {
    // 0.88/0.92/0.93 and friends used to coexist, which reads as sloppiness
    // rather than hierarchy. Steps must be at least 0.3px apart at 16px base.
    const rems = [
      ...new Set([...css.matchAll(/font-size:\s*([\d.]+)rem;/g)].map((m) => Number(m[1]))),
    ].sort((a, b) => a - b);
    for (let i = 1; i < rems.length; i += 1) {
      const gapPx = (rems[i] - rems[i - 1]) * 16;
      expect(gapPx, `${rems[i - 1]}rem and ${rems[i]}rem are too close`).toBeGreaterThanOrEqual(0.3);
    }
  });
});

describe('fixed bottom bar', () => {
  it('reserves its own height plus the device safe-area', () => {
    // The bar is 54px of nav-item + padding + env(safe-area-inset-bottom),
    // which is ~98px on a notched phone. A flat 68px hid the end of every page.
    expect(css).toMatch(/--bottom-nav-h:\s*calc\([^)]*env\(safe-area-inset-bottom/);
  });

  it('keeps the flat fallback for engines without env()', () => {
    expect(token('--bottom-nav-h')).not.toBe('');
    expect(css).toMatch(/--bottom-nav-h:\s*\d+px;/);
  });

  it('offsets anchor scrolling so targets do not land under the bar', () => {
    expect(css).toMatch(/scroll-padding-bottom:\s*var\(--bottom-nav-h\)/);
  });
});

describe('page title block', () => {
  it('styles a single page title at h1 weight, distinct from section headings', () => {
    const block = css.match(/\.page-header__title\s*\{[^}]*\}/s)?.[0] ?? '';
    expect(block).not.toBe('');
    expect(block).toContain('font-weight: 800');
    // Section headings stay at --forest-950 too, but smaller: the two must not
    // collapse into the same treatment.
    const section = css.match(/\.section-header h2\s*\{[^}]*\}/s)?.[0] ?? '';
    expect(section).toContain('1.35rem');
    expect(block).toContain('clamp(');
  });

  it('keeps the eyebrow readable rather than decorative gold', () => {
    // --gold-500 is 2.09:1 on --bg and unusable for 11.5px text; --gold-600 is
    // 4.97:1. Comments are stripped first so the rule itself is what is tested.
    const block = (css.match(/\.page-header__eyebrow\s*\{[^}]*\}/s)?.[0] ?? '').replace(
      /\/\*[\s\S]*?\*\//g,
      '',
    );
    expect(block).toContain('color: var(--gold-600)');
    expect(block).not.toContain('--gold-500');
  });

  it('lets a long title wrap without pushing an action off-screen', () => {
    const lead = css.match(/\.page-header__lead\s*\{[^}]*\}/s)?.[0] ?? '';
    expect(lead).toContain('min-width: 0');
    expect(css).toMatch(/\.page-header__title\s*\{[^}]*overflow-wrap: anywhere/s);
  });
});

describe('narrow-phone hardening', () => {
  it('has an explicit 320-359px pass', () => {
    expect(css).toMatch(/@media \(max-width: 359px\)\s*\{[\s\S]*?\.page-header__title/);
  });

  it('stops the 5-tab bar from clipping labels at 320px', () => {
    const block = css.match(/@media \(max-width: 359px\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
    expect(block).toContain('.nav-item { min-width: 0;');
  });
});

describe('card composition', () => {
  it('pins the card CTA to the floor so a row of cards lines up', () => {
    expect(css).toMatch(/\.shop-card__body > \.btn:last-child\s*\{\s*margin-top: auto;/);
  });

  it('does not shrink chips below the 44px target on small phones', () => {
    // The base rule claims 44px; a 38px override at <=420px quietly broke it.
    // There are several 420px blocks, so find the one that styles chips.
    const blocks420 = [...css.matchAll(/@media \(max-width: 420px\)\s*\{([\s\S]*?)\n\}/g)].map(
      (m) => m[1],
    );
    const chipBlock = blocks420.find((block) => block.includes('.chip {')) ?? '';
    expect(chipBlock, 'no 420px block styles .chip').not.toBe('');
    const chip = chipBlock.match(/\.chip \{[^}]*\}/)?.[0] ?? '';
    expect(chip).toContain('min-height: 44px');
  });
});

describe('press feedback parity', () => {
  it('gives the remaining tappable controls a pressed state', () => {
    for (const selector of [
      '.role-switcher__btn:active',
      '.demo-bar__reset:active',
      '.hero__results li button:active',
      '.conversation-list li button:active',
      '.need-tile:active',
      '.category-tile:active',
    ]) {
      expect(css, `${selector} has no feedback`).toContain(selector);
    }
  });

  it('turns those presses off when reduced motion is requested', () => {
    const reduced = css.split('@media (prefers-reduced-motion: reduce)').pop() ?? '';
    expect(reduced).toContain('.shell-main .page { animation: none; transform: none; }');
    expect(reduced).toContain('.category-tile:active');
    expect(reduced).toContain('transform: none');
  });
});
