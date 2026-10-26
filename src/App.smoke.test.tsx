/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

/** Route-level smoke test: every demo workspace still mounts after Phase 2. */
const ROUTES: [hash: string, expected: RegExp][] = [
  ['#/', /What do you need today\?/],
  ['#/shops', /Shop directory/],
  ['#/shops?q=bread', /Shop directory/],
  ['#/shop/shop-mzansi-fresh', /Mzansi Fresh Grocers/],
  ['#/chats', /Your chats/],
  ['#/chat/conv-mzansi-thandi', /Basket AMG-1001 ready/],
  ['#/orders', /orders/i],
  ['#/order/ord-demo-1001', /AMG-1001/],
  ['#/basket/ord-demo-1002', /./],
  ['#/help', /./],
  ['#/promotion/promo-mzansi-weekly', /./],
  ['#/retailer/inbox', /./],
  ['#/retailer/orders', /./],
  ['#/retailer/today', /./],
  ['#/delivery/available', /./],
  ['#/delivery/mine', /./],
  ['#/delivery/done', /./],
  ['#/admin/overview', /./],
  ['#/admin/shops', /./],
  ['#/admin/promotions', /./],
  ['#/admin/deliveries', /./],
  ['#/admin/reports', /./],
];

describe('all demo routes mount', () => {
  afterEach(() => {
    window.localStorage.clear();
    window.location.hash = '#/';
  });

  for (const [hash, expected] of ROUTES) {
    it(`renders ${hash}`, () => {
      window.location.hash = hash;
      const { container, unmount } = render(<App />);
      expect(container.querySelector('main#main')).toBeTruthy();
      expect(screen.getByText('Angelo Mall Go')).toBeTruthy();
      // The route rendered something beyond the shell.
      expect((container.querySelector('main#main')?.textContent ?? '').length).toBeGreaterThan(20);
      if (expected.source !== '.') {
        expect((container.querySelector('main#main')?.textContent ?? '')).toMatch(expected);
      }
      unmount();
    });
  }
});
