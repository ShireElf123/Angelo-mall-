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
    const desktop = css.split('@media (min-width: 900px)').at(-1) ?? '';
    expect(desktop).toMatch(/\.page--chat--expanded \.chat-frame\s*\{[^}]*width:\s*min\(1080px/s);
    expect(desktop).toContain('border-radius: 20px');
    expect(desktop).toContain('.chat-header__expand-label { display: inline; }');
  });

  it('keeps shop cards on one consistent image ratio', () => {
    expect(css).toMatch(/\.shop-card__media\s*\{[^}]*aspect-ratio:\s*16 \/ 10/s);
    expect(css).toContain('object-fit: cover');
  });
});
