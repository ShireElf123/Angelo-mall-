import { describe, expect, it } from 'vitest';
import css from './index.css?raw';

/**
 * Phase 2 — mobile shell contract.
 *
 * The pinned checkout bar is the only new fixed-position element in the app, so
 * these pin the two ways it could go wrong: covering the tab bar, or covering
 * the content it is supposed to sit above. jsdom cannot lay out CSS — this is
 * a source contract, not a measurement.
 */
/**
 * Only top-level rules: the needle must start a line. Without this, a selector
 * styled again inside a media query would be concatenated into the base rule
 * and a viewport-only declaration would look like a default.
 */
const rule = (selector: string): string => {
  const needle = `\n${selector} {`;
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

describe('pinned checkout bar', () => {
  it('sticks above the tab bar instead of scrolling away with the items', () => {
    const bar = rule('.checkout-bar');
    expect(bar).toContain('position: sticky');
    expect(bar).toContain('bottom: calc(var(--bottom-nav-h) + 8px)');
    // The nav is 55; the bar must sit below that so it can never cover it.
    expect(bar).toContain('z-index: 54');
  });

  it('is not fixed, because the page entry animation would hijack it', () => {
    // `.shell-main .page` animates a transform on mount, and a transformed
    // ancestor becomes the containing block for position:fixed — the bar would
    // be pinned to the page for 240ms and then jump to the viewport.
    expect(rule('.checkout-bar')).not.toContain('position: fixed');
    expect(css).toMatch(/@keyframes page-in \{\s*from \{ opacity: 0; transform: translateY/s);
  });

  it('settles into the flow, so no padding hack is needed to reach content', () => {
    // A fixed bar needs reserved page padding or it permanently covers the last
    // item. A sticky bar returns to the document flow at the end of the page.
    expect(rule('.page--basket')).not.toContain('padding-bottom');
  });

  it('lowers itself once the tab bar is hidden', () => {
    const desktop = mediaBlocks('(min-width: 900px)').join('\n');
    expect(desktop).toMatch(/\.checkout-bar\s*\{\s*bottom: 16px;/s);
  });

  it('holds the total and the action on one row down to 320px', () => {
    const row = rule('.checkout-bar__row');
    expect(row).toContain('justify-content: space-between');
    const tiny = mediaBlocks('(max-width: 359px)').join('\n');
    expect(tiny).toMatch(/\.checkout-bar \.btn\s*\{[^}]*padding-left: 14px/s);
    expect(tiny).toMatch(/\.checkout-bar__total strong\s*\{\s*font-size: 1.05rem;/s);
  });

  it('uses a tabular figure so the total does not jitter as it changes', () => {
    expect(rule('.checkout-bar__total strong')).toContain('font-variant-numeric: tabular-nums');
  });

  it('adds no new radius literal to the closed scale', () => {
    expect(rule('.checkout-bar')).toContain('border-radius: var(--radius)');
  });
});

describe('tab bar', () => {
  it('keeps every tab a comfortable target', () => {
    expect(rule('.nav-item')).toContain('min-height: 54px');
    // A 3px ring at a 2px offset is partly off-screen on the edge tabs.
    expect(rule('.bottom-nav .nav-item:focus-visible')).toContain('outline-offset: -3px');
  });

  it('reserves its own height plus the safe area in the page', () => {
    expect(css).toMatch(/\.page \{[^}]*padding: 16px var\(--space-4\) calc\(32px \+ var\(--bottom-nav-h\)\)/s);
  });
});

describe('chat thread definition', () => {
  it('gives both speakers a distinct edge on the dotted canvas', () => {
    // Re-contracted when outgoing became a filled forest bubble: the original
    // assertion pinned the pale-green hex, which was an implementation detail of
    // that particular design. What actually matters is that the two sides are
    // separable and still come from the brand palette.
    expect(rule('.chat-bubble--mine')).toContain('border: 1px solid var(--chat-mine-edge)');
    expect(rule('.chat-bubble--theirs')).toContain('border: 1px solid var(--border)');
    expect(rule('.chat-bubble--mine')).toContain('var(--chat-mine)');
    // Outgoing is filled, so its text must be light for contrast.
    expect(rule('.chat-bubble--mine')).toContain('color: #fff');
  });

  it('keeps the outgoing bubble readable against white text', () => {
    // #10503d on #ffffff is ~9:1. A pale bubble would fail this pairing, which
    // is why the token changed rather than the text colour.
    expect(css).toMatch(/--chat-mine:\s*#10503d;/);
  });

  it('squares off only the last bubble of a turn', () => {
    // Grouping is what makes a multi-line reply read as one turn, not three.
    expect(rule('.chat-row--end.chat-row--mine .chat-bubble')).toContain('border-bottom-right-radius: 6px');
    expect(rule('.chat-row--end.chat-row--theirs .chat-bubble')).toContain('border-bottom-left-radius: 6px');
    // Continuing lines keep the normal radius, so nothing looks cut off.
    expect(rule('.chat-row--cont')).toContain('margin-top: 2px');
    expect(rule('.chat-row--start')).toContain('margin-top: 10px');
  });

  it('hides keyboard shortcuts where there is no keyboard', () => {
    expect(css).toMatch(/@media \(hover: none\) \{ \.composer__hint-keys \{ display: none; \} \}/);
  });

  it('keeps the composer clear of the keyboard and the tab bar', () => {
    // The composer is the last child of the chat frame, which is sized from the
    // viewport; the page reserves the bar's height beneath it.
    expect(rule('.composer textarea')).toContain('min-height: 48px');
    expect(rule('.composer__send')).toContain('width: 48px');
  });
});

describe('shop page action placement', () => {
  it('keeps the primary action tight against the identity block', () => {
    expect(rule('.shop-hero__body > .btn--lg')).toContain('margin-top: 2px');
  });
});
