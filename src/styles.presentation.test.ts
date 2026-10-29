import { describe, expect, it } from 'vitest';
import css from './index.css?raw';
import homeSource from './screens/customer/Home.tsx?raw';

/**
 * Pre-approval presentation regressions.
 *
 * Each of these pins a defect found by rendering the production build in
 * Chromium at 320/360/390/430/560/768/899/900/1280 and measuring the DOM.
 * None were caught by the existing suites, because jsdom has no layout.
 * These are source contracts: they stop the fix being deleted, they do not
 * re-measure. The measurements themselves are recorded in the commit message.
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

describe('order list card on a phone', () => {
  it('stacks instead of crushing the text column to zero', () => {
    // Measured before the fix at 320/360/390/430px: the text column was 0px
    // wide because a 187px status pill, the avatar and the Chat button shared
    // one nowrap row. The reference ellipsised to "AM…", the summary wrapped to
    // one word per line and the price was clipped.
    const small = css.slice(css.indexOf('@media (max-width: 560px)'));
    expect(small).toMatch(
      /@media \(max-width: 560px\) \{[\s\S]*?\.order-list-card \{[\s\S]*?flex-wrap: wrap;/,
    );
    // The text block must be allowed to claim real width.
    expect(small).toMatch(/\.order-list-card__text \{ flex: 1 1 150px; \}/);
    // Nothing may shrink the card's own content to nothing.
    expect(rule('.order-list-card__text')).toContain('min-width: 0');
  });
});

describe('workspace tab rows', () => {
  it('does not repeat the header navigation above 900px', () => {
    // The admin, retailer and delivery workspaces render an in-page tab row
    // listing the same five destinations as .top-nav. At >=900px both were
    // shown, so the owner saw two identical navigation rows stacked on the
    // dashboard. Below 900px the tab row stays: the phone nav is icon-led and
    // the tabs carry full labels and larger targets.
    const desktop = css.slice(css.indexOf('@media (min-width: 900px)'));
    expect(desktop).toMatch(/@media \(min-width: 900px\) \{[\s\S]*?\.workspace-tabs \{ display: none; \}/);
    // The tabs must remain the documented styling elsewhere (mobile).
    expect(rule('.workspace-tabs')).toContain('overflow-x: auto');
  });
});

describe('grid tracks that could not shrink', () => {
  it('lets the promo form date row and the staff order board fit a 320px phone', () => {
    // A date input has an intrinsic minimum width, so two bare `1fr` tracks
    // pushed the admin promotions form past a 320px screen. A grid item also
    // defaults to min-width:auto, which made each staff order bucket wider than
    // the phone. Measurements before the fix: 358px and 327px on a 320px
    // viewport.
    expect(rule('.item-editor__row')).toContain('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)');
    expect(rule('.orders-board')).toContain('grid-template-columns: minmax(0, 1fr)');
  });
});

describe('home search placeholder', () => {
  it('fits the field instead of sitting half-clipped behind the Search button', () => {
    // The input is ~125px at 320px and ~171px at 390px. The old placeholder ran
    // to 51 characters, so it was cut mid-word behind the button. A search
    // placeholder that trails off reads as a broken field on the first screen
    // the owner sees.
    const match = homeSource.match(/id="home-search"[\s\S]{0,400}?placeholder="([^"]+)"/);
    expect(match).not.toBeNull();
    const placeholder = match![1];
    expect(placeholder.length).toBeLessThanOrEqual(28);
    expect(placeholder).toMatch(/^Search/);
  });
});
