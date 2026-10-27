import { describe, expect, it } from 'vitest';
import css from './index.css?raw';

/**
 * Interaction-style contract (Phase 12).
 *
 * jsdom cannot compute shadows, transitions or press states, so these tests pin
 * the declarations that give the app its native feel. Each one stands for a
 * behaviour a user can lose silently in a refactor:
 *
 * - a press that never registers (no `:active` transform),
 * - a hover that sticks on touch after a tap,
 * - focus that disappears on a dark surface,
 * - a shadow scale that drifts into a template look,
 * - touch targets that shrink below the Android 48px floor.
 */

/** Every declaration block for a selector, concatenated in source order. */
function blocks(selector: string): string {
  const needle = `${selector} {`;
  const found: string[] = [];
  let index = css.indexOf(needle);
  while (index !== -1) {
    const end = css.indexOf('}', index);
    found.push(css.slice(index, end + 1));
    index = css.indexOf(needle, end);
  }
  return found.join('\n');
}

const token = (name: string): string => {
  const match = css.match(new RegExp(`${name}:\\s*([^;]+);`));
  return match?.[1].trim() ?? '';
};

describe('elevation scale', () => {
  it('defines a small, ordered set of levels rather than ad-hoc shadows', () => {
    const levels = [token('--elev-1'), token('--elev-2'), token('--elev-3'), token('--elev-4')];
    for (const [index, level] of levels.entries()) {
      expect(level, `--elev-${index + 1} is missing`).not.toBe('');
    }
    // Four levels, one nav-specific, one press state: nothing beyond a dialog.
    expect(token('--elev-nav')).not.toBe('');
    expect(token('--elev-press')).not.toBe('');
    expect(css).not.toMatch(/--elev-5:/);
  });

  it('keeps the legacy shadow aliases pointing at the scale', () => {
    expect(token('--shadow')).toBe('var(--elev-2)');
    expect(token('--shadow-lg')).toBe('var(--elev-3)');
  });

  it('reserves the deepest level for dialogs and toasts only', () => {
    expect(blocks('.modal')).toContain('var(--elev-4)');
    expect(blocks('.toast')).toContain('var(--elev-4)');
    expect(blocks('.shop-card')).toContain('var(--elev-2)');
    expect(blocks('.bottom-nav')).toContain('var(--elev-nav)');
  });
});

describe('tactile states', () => {
  it('gives primary buttons an immediate pressed state', () => {
    const active = css.match(/\.btn:active:not\(:disabled\)[^{]*\{[^}]*\}/g)?.join('\n') ?? '';
    expect(active).toContain('transform');
    expect(active).toContain('scale(');
    // Pressing collapses the shadow instead of adding one.
    expect(blocks('.btn:active:not(:disabled)')).toContain('var(--elev-press)');
  });

  it('presses chips, icon buttons, nav items and the send button too', () => {
    for (const selector of [
      '.chip:active',
      '.icon-btn:active:not(:disabled)',
      '.nav-item:active',
      '.composer__send:active:not(:disabled)',
      '.back-btn:active',
    ]) {
      expect(blocks(selector), `${selector} has no press state`).toContain('transform');
    }
  });

  it('uses one motion vocabulary and animates only compositor properties', () => {
    expect(token('--dur-fast')).toMatch(/m?s$/);
    expect(token('--ease-out')).toContain('cubic-bezier');
    const transition = blocks('.shop-card');
    expect(transition.length).toBeGreaterThan(0);
    const transitionBlock = css.match(/\.btn,\n\.chip,[\s\S]*?transition:([\s\S]*?);\n\}/);
    expect(transitionBlock?.[1]).toContain('transform var(--dur-fast)');
    // No transition on layout properties: a press must never reflow the card.
    expect(transitionBlock?.[1]).not.toMatch(/\b(width|height|margin|padding|top|left)\b/);
  });

  it('honours reduced motion while keeping the non-motion feedback', () => {
    const reduced = css.split('@media (prefers-reduced-motion: reduce)').pop() ?? '';
    expect(reduced).toContain('transform: none');
    // Colour/shadow feedback survives, so a press is still visible.
    expect(css.indexOf('transition-duration: 0.01ms !important')).toBeGreaterThan(-1);
  });

  it('gates hover styling to devices that can actually hover', () => {
    const hoverBlocks = [...css.matchAll(/@media \(hover: hover\) and \(pointer: fine\)\s*\{([\s\S]*?)\n\}/g)];
    expect(hoverBlocks.length).toBeGreaterThan(0);
    expect(hoverBlocks.map((match) => match[1]).join('\n')).toContain('.shop-card:hover');
    // And explicitly neutralises stuck hover on touch screens.
    expect(css).toContain('@media (hover: none)');
  });

  it('marks the selected tab without reflowing its label', () => {
    const marker = blocks('.bottom-nav .nav-item--active::before');
    expect(marker).toContain('content:');
    // A marker is used instead of a size change.
    expect(marker).not.toContain('font-size');
  });

  it('removes depth from disabled controls so they read as inert', () => {
    expect(blocks('.btn:disabled')).toContain('box-shadow: none');
    expect(blocks('.composer__send:disabled')).toContain('box-shadow: none');
  });
});

describe('navigation layout', () => {
  it('lets five bottom-nav labels share a 320px screen instead of overflowing', () => {
    const item = blocks('.bottom-nav .nav-item');
    // flex-basis 0 + min-width 0 is what stops the widest label from widening
    // the bar; "Promotions" alone is 63.9px and five of those overflow 320px.
    expect(item).toContain('flex: 1 1 0');
    expect(item).toContain('min-width: 0');
    const label = blocks('.bottom-nav .nav-item > span:last-child');
    expect(label).toContain('text-overflow: ellipsis');
    expect(label).toContain('white-space: nowrap');
  });

  it('keeps the desktop header on one row instead of scrolling sideways', () => {
    expect(blocks('.app-header')).toContain('flex-wrap: wrap');
    // The tight 900-1080px band gets a tighter nav rather than a hidden one.
    expect(css).toMatch(/@media \(min-width: 900px\) and \(max-width: 1080px\)/);
  });
});

describe('touch targets and focus', () => {
  const minHeight = (selector: string): number => {
    const match = blocks(selector).match(/min-height:\s*(\d+)px/);
    return match ? Number(match[1]) : 0;
  };

  it('keeps the Android 48px floor on the controls that carry the journey', () => {
    expect(minHeight('.bottom-nav')).toBeGreaterThanOrEqual(48);
    expect(minHeight('.nav-item')).toBeGreaterThanOrEqual(48);
    // The send button is a fixed circle, so its size is height, not min-height.
    expect(blocks('.composer__send')).toContain('width: 48px; height: 48px');
    expect(minHeight('.composer textarea')).toBeGreaterThanOrEqual(48);
    // Buttons carry their own height rather than relying on padding.
    const btnHeight = blocks('.btn').match(/min-height:\s*(\d+)px/)?.[1] ?? '0';
    expect(Number(btnHeight)).toBeGreaterThanOrEqual(44);
  });

  it('keeps icon buttons at 44px and chips at 44px', () => {
    expect(blocks('.icon-btn')).toContain('width: 44px');
    expect(blocks('.icon-btn')).toContain('height: 44px');
    expect(minHeight('.chip')).toBeGreaterThanOrEqual(44);
  });

  it('never removes the keyboard focus ring, including on dark chrome', () => {
    expect(blocks(':focus-visible')).toContain('outline: 3px solid var(--gold-500)');
    expect(blocks(':focus-visible')).toContain('outline-offset');
  });

  it('suppresses the mobile tap flash and the double-tap zoom delay', () => {
    expect(css).toContain('-webkit-tap-highlight-color: transparent');
    expect(css).toContain('touch-action: manipulation');
  });
});

/**
 * Native-app shell (Phase 13).
 *
 * Phase 12 tokenised shadows without changing the layout, and the result read
 * as a website with a white bar glued to the bottom. These assertions pin the
 * handful of decisions that create the app feel, because every one of them can
 * be reverted by a single innocent-looking CSS edit:
 *
 * - the demo banner creeping back into the sticky box and eating the viewport,
 * - the tab bar going back to an opaque slab,
 * - the selected tab shifting its label when the pill appears,
 * - cards that stop responding to a thumb,
 * - page transitions that ignore reduced-motion.
 */
describe('native-app shell', () => {
  it('pins the app header only, not the demo banner around it', () => {
    expect(blocks('.app-header')).toContain('position: sticky');
    expect(blocks('.app-header')).toContain('backdrop-filter');
    // The banner's wrapper must not be sticky again, or a phone loses ~110px.
    expect(blocks('.shell-chrome')).toContain('position: static');
    expect(blocks('.shell-chrome')).not.toContain('position: sticky');
  });

  it('builds the tab bar out of frosted glass with a solid fallback', () => {
    const nav = blocks('.bottom-nav');
    expect(nav).toContain('backdrop-filter');
    expect(nav).toContain('min-height: 64px');
    // Depth still comes from the Phase 12 scale, not a new ad-hoc shadow.
    expect(nav).toContain('var(--elev-nav)');
    // Browsers without backdrop-filter must get an opaque surface, never 82% white.
    expect(css).toContain('@supports not ((backdrop-filter: blur(1px))');
  });

  it('marks the selected tab with a pill that cannot shift the label', () => {
    // Padding lives on every icon wrapper; only the background changes.
    expect(blocks('.bottom-nav .nav-item__icon')).toContain('padding: 3px 14px');
    expect(blocks('.bottom-nav .nav-item--active .nav-item__icon')).toContain('var(--forest-50)');
    expect(css).toContain('.bottom-nav .nav-item--active svg { stroke-width: 2.4; }');
    // Padding is not introduced by the active rule, which is what would reflow.
    expect(blocks('.bottom-nav .nav-item--active .nav-item__icon')).not.toContain('padding');
  });

  it('presses a shop card into the page instead of only tinting it', () => {
    const card = blocks('.shop-card');
    expect(card).toContain('border-radius: 20px');
    expect(card).toContain('transform var(--dur-fast)');
    const active = blocks('.shop-card:active');
    expect(active).toContain('transform: scale(');
    // The press collapses depth rather than adding it.
    expect(active).toContain('var(--elev-1)');
  });

  it('gives the primary action a raised-key gradient', () => {
    expect(blocks('.btn--primary')).toContain('linear-gradient(');
    expect(blocks('.btn--primary')).toContain('inset 0 1px 0');
  });

  it('animates route changes and turns that animation off for reduced motion', () => {
    expect(css).toContain('@keyframes page-in');
    expect(blocks('.shell-main .page')).toContain('animation: page-in');
    const reduced = css.split('@media (prefers-reduced-motion: reduce)').pop() ?? '';
    expect(reduced).toContain('.shell-main .page { animation: none; transform: none; }');
  });
});
