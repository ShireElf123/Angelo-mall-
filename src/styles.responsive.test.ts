import { describe, expect, it } from 'vitest';
import css from './index.css?raw';

/**
 * Responsive regression guard. jsdom cannot lay out CSS, so instead of
 * pretending to measure a viewport we assert the rules that make the chat
 * expandable are present and cannot silently disappear in a refactor.
 * Real device/browser review is still required and is reported separately.
 */
describe('expandable chat stylesheet contract', () => {
  it('has a compact chat frame height that the page keeps intact', () => {
    expect(css).toMatch(/\.chat-frame\s*\{[^}]*height:\s*min\(760px, calc\(100dvh - 235px\)\)/s);
  });

  it('pins the expanded panel to the viewport on mobile', () => {
    const block = css.match(/\.page--chat--expanded \.chat-frame\s*\{[^}]*\}/s)?.[0] ?? '';
    expect(block).toContain('position: fixed');
    expect(block).toContain('inset: 0');
    // Height follows the on-screen keyboard via visualViewport, with dvh as fallback.
    expect(block).toContain('height: var(--chat-overlay-height, 100dvh)');
  });

  it('reserves safe-area spacing for the status bar and home indicator', () => {
    expect(css).toContain('padding-top: calc(10px + env(safe-area-inset-top))');
    expect(css).toContain('padding-bottom: calc(10px + env(safe-area-inset-bottom))');
  });

  it('locks background scrolling while the overlay is open', () => {
    expect(css).toMatch(/\.chat-expanded,[\s\S]*?overflow:\s*hidden/);
    expect(css).toContain('overscroll-behavior: none');
  });

  it('turns the overlay into a large centred panel on desktop instead of a full bleed takeover', () => {
    // Locate the desktop block by what it contains rather than assuming it is
    // the last `min-width: 900px` query in the file: later feature sections add
    // their own 900px-and-up rules, and the assertion is about this panel.
    const desktopBlocks = [...css.matchAll(/@media \(min-width: 900px\)\s*\{([\s\S]*?)\n\}/g)].map(
      (match) => match[1],
    );
    const desktop = desktopBlocks.find((block) => block.includes('.page--chat--expanded .chat-frame')) ?? '';
    expect(desktop, 'no 900px+ block styles the expanded chat panel').not.toBe('');
    expect(desktop).toMatch(/\.page--chat--expanded \.chat-frame\s*\{[^}]*width:\s*min\(1080px/s);
    expect(desktop).toContain('border-radius: 20px');
    expect(desktop).toContain('.chat-header__expand-label { display: inline; }');
  });
});

/**
 * Tenant name / logo lock-up regression guard.
 *
 * Measured in Inter 800: the trading pill renders ~142px wide, a hosted wordmark
 * is up to 108px wide at 34px tall, and a 3-column card leaves the brand plate
 * ~266-306px. While the name shared a row with the pill, the text column was
 * left with 0-30px, and because the card hides overflow the name was clipped.
 * Each rule below is load-bearing; losing one brings the clipping back.
 *
 * jsdom cannot lay out CSS, so this asserts the declarations rather than
 * measuring a viewport - browser review is reported separately.
 */
/** Every declaration block for a selector, concatenated in source order. */
function cssRule(selector: string): string {
  const needle = `${selector} {`;
  const blocks: string[] = [];
  let index = css.indexOf(needle);
  while (index !== -1) {
    const end = css.indexOf('}', index);
    blocks.push(css.slice(index, end + 1));
    index = css.indexOf(needle, end);
  }
  return blocks.join('\n');
}

describe('tenant name and logo layout contract', () => {
  it('keeps shop cards on one consistent image ratio that matches the 16:9 art', () => {
    // The tenant heroes are 1280x720; a 16:10 window cropped 10% off them.
    expect(cssRule('.shop-card__media')).toContain('aspect-ratio: 16 / 9');
    expect(css).not.toContain('aspect-ratio: 16 / 10');
    expect(css).toContain('object-fit: cover');
  });

  it('stacks the name above the trading status so the pill cannot starve it', () => {
    expect(cssRule('.shop-card__brand')).toContain('flex-direction: column');
    expect(cssRule('.shop-card__titles')).toContain('width: 100%');
  });

  it('lets the wordmark shrink and wrap instead of overflowing its container', () => {
    const word = cssRule('.shop-logo__word');
    expect(word).toContain('min-width: 0');
    expect(word).toContain('overflow-wrap: break-word');
    // `anywhere` split words mid-syllable even when they would have fitted.
    expect(word).not.toContain('overflow-wrap: anywhere');
  });

  it('bounds the logo tile and preserves its proportions', () => {
    const image = cssRule('.shop-logo__image');
    expect(image).toContain('object-fit: contain');
    expect(image).toContain('max-width: min(108px, 45%)');
    // A flex:none logo could not give width back to the name.
    expect(image).toContain('flex: 0 1 auto');
    expect(image).toContain('min-width: 0');
  });

  it('wraps the hero title row instead of squeezing the name beside the pill', () => {
    expect(cssRule('.shop-hero__title')).toContain('flex-wrap: wrap');
    expect(cssRule('.shop-hero__title > div')).toContain('flex: 1 1 12rem');
    // Hero wordmark scales with the viewport instead of a flat 1.3rem.
    expect(cssRule('.shop-logo--lg .shop-logo__word')).toContain('clamp(');
  });

  it('shows the whole 16:9 hero instead of cropping it into a letterbox strip', () => {
    expect(cssRule('.shop-hero__media')).toContain('aspect-ratio: 16 / 9');
    // The old fixed clamp height turned the hero into a 3:1 strip on desktop.
    expect(css).not.toContain('height: clamp(170px, 32vw, 250px)');
  });
});
