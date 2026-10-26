/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { parseHash, roleForRoute, routeToHash, type Route } from './router';

describe('hash router', () => {
  const cases: Route[] = [
    { name: 'home' },
    { name: 'shops' },
    { name: 'shops', q: 'mince', category: 'groceries' },
    { name: 'shop', shopId: 'shop-mzansi-fresh' },
    { name: 'chat', conversationId: 'conv-mzansi-thandi' },
    { name: 'basket', orderId: 'ord-demo-1001' },
    { name: 'order', orderId: 'ord-demo-1002' },
    { name: 'retailer', tab: 'inbox', conversationId: 'conv-mzansi-Sipho' },
    { name: 'delivery', tab: 'mine' },
    { name: 'admin', tab: 'reports' },
  ];

  it('round-trips routes through hashes', () => {
    for (const route of cases) {
      expect(parseHash(routeToHash(route))).toEqual(route);
    }
  });

  it('maps route namespaces to demo roles', () => {
    expect(roleForRoute({ name: 'home' })).toBe('customer');
    expect(roleForRoute({ name: 'retailer', tab: 'today' })).toBe('shop');
    expect(roleForRoute({ name: 'delivery', tab: 'available' })).toBe('delivery');
    expect(roleForRoute({ name: 'admin', tab: 'overview' })).toBe('admin');
  });

  it('falls back home for unknown hashes', () => {
    expect(parseHash('#/nonsense/route')).toEqual({ name: 'home' });
  });
});
