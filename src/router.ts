/**
 * Tiny hash router — shareable demo links (and QR codes in a live rollout)
 * without a routing dependency. The route is also what keeps the selected
 * demonstration role obvious in the URL.
 */
import { useCallback, useEffect, useState } from 'react';
import type { Role } from './types';

export type RetailerTab = 'inbox' | 'orders' | 'today';
export type DeliveryTab = 'available' | 'mine' | 'done';
export type AdminTab = 'overview' | 'shops' | 'promotions' | 'deliveries' | 'reports';

export type Route =
  | { name: 'home' }
  | { name: 'shops'; q?: string; category?: string }
  | { name: 'shop'; shopId: string }
  | { name: 'chats' }
  | { name: 'chat'; conversationId: string }
  | { name: 'basket'; orderId: string }
  | { name: 'orders' }
  | { name: 'order'; orderId: string }
  | { name: 'promotion'; promotionId: string }
  | { name: 'help' }
  | { name: 'retailer'; tab: RetailerTab; conversationId?: string }
  | { name: 'delivery'; tab: DeliveryTab }
  | { name: 'admin'; tab: AdminTab };

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'shops': {
      const params = new URLSearchParams();
      if (route.q) params.set('q', route.q);
      if (route.category) params.set('cat', route.category);
      const qs = params.toString();
      return qs ? `#/shops?${qs}` : '#/shops';
    }
    case 'shop':
      return `#/shop/${route.shopId}`;
    case 'chats':
      return '#/chats';
    case 'chat':
      return `#/chat/${route.conversationId}`;
    case 'basket':
      return `#/basket/${route.orderId}`;
    case 'orders':
      return '#/orders';
    case 'order':
      return `#/order/${route.orderId}`;
    case 'promotion':
      return `#/promotion/${route.promotionId}`;
    case 'help':
      return '#/help';
    case 'retailer':
      return route.conversationId
        ? `#/retailer/chat/${route.conversationId}`
        : `#/retailer/${route.tab}`;
    case 'delivery':
      return `#/delivery/${route.tab}`;
    case 'admin':
      return `#/admin/${route.tab}`;
  }
}

export function parseHash(hash: string): Route {
  const [pathPart, queryPart] = hash.replace(/^#\/?/, '').split('?');
  const query = new URLSearchParams(queryPart ?? '');
  const parts = pathPart.split('/').filter(Boolean);
  const [head, second, third] = parts;
  switch (head) {
    case undefined:
    case '':
      return { name: 'home' };
    case 'shops':
      return { name: 'shops', q: query.get('q') ?? undefined, category: query.get('cat') ?? undefined };
    case 'shop':
      return second ? { name: 'shop', shopId: second } : { name: 'shops' };
    case 'chats':
      return { name: 'chats' };
    case 'chat':
      return second ? { name: 'chat', conversationId: second } : { name: 'chats' };
    case 'basket':
      return second ? { name: 'basket', orderId: second } : { name: 'orders' };
    case 'orders':
      return { name: 'orders' };
    case 'order':
      return second ? { name: 'order', orderId: second } : { name: 'orders' };
    case 'promotion':
      return second ? { name: 'promotion', promotionId: second } : { name: 'home' };
    case 'help':
      return { name: 'help' };
    case 'retailer':
      if (second === 'chat' && third) return { name: 'retailer', tab: 'inbox', conversationId: third };
      if (second === 'orders' || second === 'today') return { name: 'retailer', tab: second };
      return { name: 'retailer', tab: 'inbox' };
    case 'delivery':
      if (second === 'mine' || second === 'done') return { name: 'delivery', tab: second };
      return { name: 'delivery', tab: 'available' };
    case 'admin':
      if (second === 'shops' || second === 'promotions' || second === 'deliveries' || second === 'reports') {
        return { name: 'admin', tab: second };
      }
      return { name: 'admin', tab: 'overview' };
    default:
      return { name: 'home' };
  }
}

export function roleForRoute(route: Route): Role {
  if (route.name === 'retailer') return 'shop';
  if (route.name === 'delivery') return 'delivery';
  if (route.name === 'admin') return 'admin';
  return 'customer';
}

export function homeRouteForRole(role: Role): Route {
  switch (role) {
    case 'shop':
      return { name: 'retailer', tab: 'inbox' };
    case 'delivery':
      return { name: 'delivery', tab: 'available' };
    case 'admin':
      return { name: 'admin', tab: 'overview' };
    default:
      return { name: 'home' };
  }
}

export function useHashRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    const hash = routeToHash(next);
    if (window.location.hash === hash) {
      setRoute(next);
    } else {
      window.location.hash = hash;
    }
  }, []);

  return [route, navigate];
}
