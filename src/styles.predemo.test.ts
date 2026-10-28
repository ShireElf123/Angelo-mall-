import { describe, expect, it } from 'vitest';
import css from './index.css?raw';

/**
 * Pre-demo QA regressions.
 *
 * Each of these pins a defect that was found by actually rendering the app in
 * Chromium at 320/360/390/430/768/1280 and measuring it — none of these were
 * visible from the source alone, and none were caught by the existing suites.
 * jsdom cannot lay out CSS, so these remain source contracts: they stop a
 * future edit from quietly deleting the fix, they do not re-measure it.
 */

/** Only top-level rules: the needle must start a line (see styles.phase2). */
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

describe('composer placeholder', () => {
  it('cannot wrap into a half-clipped second line', () => {
    // The placeholder is `Message ${shop.name}…`, and "Message The Angelo
    // SUPERSPAR…" is wider than a 320-430px field. As a <textarea> it wrapped,
    // and the 48px min-height cut the second line in half — the field looked
    // broken before anyone typed. Measured: scrollHeight 94 vs clientHeight 46.
    const placeholder = rule('.composer textarea::placeholder');
    expect(placeholder).toContain('white-space: nowrap');
    expect(placeholder).toContain('text-overflow: ellipsis');
    // The typed value must still wrap, so the rule stays on ::placeholder.
    expect(rule('.composer textarea')).not.toContain('white-space: nowrap');
  });
});

describe('chat header shop identity', () => {
  it('does not abbreviate the shop name on a phone', () => {
    // "The Angelo SUPERSPAR" needs 185px; at 320-390px the header gave it
    // 99-161px and ellipsised it. Which shop you are talking to is the one
    // thing this header must not shorten.
    expect(css).toMatch(
      /@media \(max-width: 430px\) \{[^@]*\.chat-header__shop strong \{[^}]*-webkit-line-clamp: 2/s,
    );
    // The trading line is secondary and may keep ellipsising.
    expect(rule('.chat-header__shop small')).toContain('text-overflow: ellipsis');
  });
});

describe('order summary in a message', () => {
  it('keeps a rand amount on one line', () => {
    // On a narrow card the amount column collapsed to ~45px and "R 254,96"
    // broke as "R 254,9 / 6". Money is read as a single token.
    expect(rule('.order-card-msg__total strong')).toContain('white-space: nowrap');
  });
});

describe('basket heading', () => {
  it('gives the title a usable column beside a long status pill', () => {
    // "Awaiting your confirmation" is a wide pill. In a nowrap flex row it left
    // the text block ~90px, so "Basket AMG-1001" broke over three lines and the
    // shop name over six.
    const head = rule('.basket-head');
    expect(head).toContain('flex-wrap: wrap');
    expect(head).toMatch(/gap: 10px 13px/);
    expect(rule('.basket-head > div')).toContain('flex: 1 1 210px');
  });
});

describe('home rails at 320px', () => {
  it('bleed by the same gutter the page actually uses', () => {
    // The two scroll rails bleed right by --space-4, and the <=359px rule drops
    // the page gutter to --space-3. The 4px mismatch made the document scroll
    // sideways on a 320px screen (scrollWidth 324).
    const small = css.slice(css.indexOf('@media (max-width: 359px)'));
    expect(small).toMatch(
      /@media \(max-width: 359px\) \{[\s\S]*?\.category-grid,\s*\.shop-grid--rail \{[\s\S]*?margin-right: calc\(-1 \* var\(--space-3\)\);/,
    );
    // The desktop/default bleed is unchanged.
    expect(rule('.category-grid')).toContain('margin: 0 calc(-1 * var(--space-4)) 0 0');
  });
});
