/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../../App';

/**
 * Page-title contract.
 *
 * Before this bundle Home had an `h1` buried inside the hero while the
 * directory, chats, orders and help screens had no `h1` at all — their first
 * heading was an `h2`. A screen-reader user navigating by heading landed on a
 * page with no title, and the document outline started one level in.
 *
 * These tests pin the fix at the level a user experiences it: every screen
 * announces exactly one top-level heading, and it carries the screen's name.
 */
const ROUTES: [hash: string, expectedHeading: RegExp][] = [
  ['#/', /Chat to mall shops/i],
  ['#/shops', /Shop directory/i],
  ['#/chats', /Your chats/i],
  ['#/orders', /Your orders/i],
  ['#/help', /Help & about this demo/i],
  ['#/shop/shop-superspar', /SUPERSPAR/i],
  ['#/chat/conv-superspar-thandi', /Chat with/i],
  ['#/orders', /Your orders/i],
  ['#/retailer/inbox', /./],
  ['#/delivery/available', /./],
  ['#/admin/overview', /./],
];

describe('every screen has one page title', () => {
  afterEach(() => {
    window.localStorage.clear();
    window.location.hash = '#/';
  });

  for (const [hash, expected] of ROUTES) {
    it(`renders exactly one h1 on ${hash}`, async () => {
      window.location.hash = hash;
      render(<App />);
      // The directory shows a skeleton before its first paint.
      const headings = await screen.findAllByRole('heading', { level: 1 }, { timeout: 3000 });
      expect(headings, `${hash} should have exactly one h1`).toHaveLength(1);
      expect(headings[0].textContent ?? '').toMatch(expected);
    });
  }
});

describe('page title treatment is shared, not re-invented per screen', () => {
  afterEach(() => {
    window.localStorage.clear();
    window.location.hash = '#/';
  });

  for (const hash of ['#/shops', '#/chats', '#/orders', '#/help']) {
    it(`uses the PageHeader block on ${hash}`, async () => {
      window.location.hash = hash;
      render(<App />);
      const h1 = await screen.findByRole('heading', { level: 1 }, { timeout: 3000 });
      // The title must live inside the shared block, so spacing/typography is
      // decided once rather than four times.
      expect(h1.closest('.page-header'), `${hash} h1 escaped .page-header`).not.toBeNull();
      expect(h1.className).toContain('page-header__title');
    });
  }

  it('keeps the section heading distinct from the page heading', async () => {
    window.location.hash = '#/shops';
    render(<App />);
    const h1 = await screen.findByRole('heading', { level: 1 }, { timeout: 3000 });
    expect(h1.className).toContain('page-header__title');
    // Section headings stay h2 and must not masquerade as the page title.
    expect(h1.className).not.toContain('section-header');
  });
});
