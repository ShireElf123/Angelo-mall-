import { useEffect, useState, type ReactNode } from 'react';
import {
  BarChart3,
  Bike,
  Building2,
  ClipboardList,
  HelpCircle,
  Home,
  Inbox,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  PackageCheck,
  RotateCcw,
  Store,
  User,
  WifiOff,
} from 'lucide-react';
import { homeRouteForRole, roleForRoute, type Route } from '../router';
import { useDemoStore } from '../store/DemoStore';
import { customerUnreadTotal, shopUnreadTotal } from '../store/selectors';
import type { Role } from '../types';
import { Modal, useToast } from './ui';

const ROLE_OPTIONS: { id: Role; label: string; icon: ReactNode }[] = [
  { id: 'customer', label: 'Customer', icon: <User size={16} aria-hidden /> },
  { id: 'shop', label: 'Shop staff', icon: <Store size={16} aria-hidden /> },
  { id: 'delivery', label: 'Delivery partner', icon: <Bike size={16} aria-hidden /> },
  { id: 'admin', label: 'Mall admin', icon: <Building2 size={16} aria-hidden /> },
];

interface NavItem {
  label: string;
  icon: ReactNode;
  route: Route;
  active: boolean;
  badge?: number;
}

export function Shell({
  route,
  navigate,
  children,
}: {
  route: Route;
  navigate: (route: Route) => void;
  children: ReactNode;
}) {
  const { state, dispatch, resetDemo } = useDemoStore();
  const { notify } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const [online, setOnline] = useState(() => navigator.onLine);
  const role = roleForRoute(route);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  // Keep the store role in sync with the URL so deep links highlight correctly.
  useEffect(() => {
    if (state.role !== role) dispatch({ type: 'SET_ROLE', role });
  }, [role, state.role, dispatch]);

  const switchRole = (next: Role) => {
    dispatch({ type: 'SET_ROLE', role: next });
    navigate(homeRouteForRole(next));
  };

  const customerUnread = customerUnreadTotal(state);
  const shopUnread = shopUnreadTotal(state, state.activeShopId);
  const availableJobs = state.deliveryJobs.filter((j) => j.status === 'available').length;

  const navItems: NavItem[] =
    role === 'customer'
      ? [
          { label: 'Home', icon: <Home size={21} aria-hidden />, route: { name: 'home' }, active: route.name === 'home' },
          { label: 'Shops', icon: <Store size={21} aria-hidden />, route: { name: 'shops' }, active: route.name === 'shops' || route.name === 'shop' },
          { label: 'Chats', icon: <MessagesSquare size={21} aria-hidden />, route: { name: 'chats' }, active: route.name === 'chats' || route.name === 'chat', badge: customerUnread },
          { label: 'Orders', icon: <ClipboardList size={21} aria-hidden />, route: { name: 'orders' }, active: route.name === 'orders' || route.name === 'order' || route.name === 'basket' },
          { label: 'Help', icon: <HelpCircle size={21} aria-hidden />, route: { name: 'help' }, active: route.name === 'help' },
        ]
      : role === 'shop'
        ? [
            { label: 'Inbox', icon: <Inbox size={21} aria-hidden />, route: { name: 'retailer', tab: 'inbox' }, active: route.name === 'retailer' && route.tab === 'inbox', badge: shopUnread },
            { label: 'Orders', icon: <ClipboardList size={21} aria-hidden />, route: { name: 'retailer', tab: 'orders' }, active: route.name === 'retailer' && route.tab === 'orders' },
            { label: 'Today', icon: <LayoutDashboard size={21} aria-hidden />, route: { name: 'retailer', tab: 'today' }, active: route.name === 'retailer' && route.tab === 'today' },
          ]
        : role === 'delivery'
          ? [
              { label: 'Available', icon: <Bike size={21} aria-hidden />, route: { name: 'delivery', tab: 'available' }, active: route.name === 'delivery' && route.tab === 'available', badge: availableJobs },
              { label: 'My jobs', icon: <ClipboardList size={21} aria-hidden />, route: { name: 'delivery', tab: 'mine' }, active: route.name === 'delivery' && route.tab === 'mine' },
              { label: 'Completed', icon: <PackageCheck size={21} aria-hidden />, route: { name: 'delivery', tab: 'done' }, active: route.name === 'delivery' && route.tab === 'done' },
            ]
          : [
              { label: 'Overview', icon: <LayoutDashboard size={21} aria-hidden />, route: { name: 'admin', tab: 'overview' }, active: route.name === 'admin' && route.tab === 'overview' },
              { label: 'Shops', icon: <Store size={21} aria-hidden />, route: { name: 'admin', tab: 'shops' }, active: route.name === 'admin' && route.tab === 'shops' },
              { label: 'Promotions', icon: <Megaphone size={21} aria-hidden />, route: { name: 'admin', tab: 'promotions' }, active: route.name === 'admin' && route.tab === 'promotions' },
              { label: 'Deliveries', icon: <Bike size={21} aria-hidden />, route: { name: 'admin', tab: 'deliveries' }, active: route.name === 'admin' && route.tab === 'deliveries' },
              { label: 'Reports', icon: <BarChart3 size={21} aria-hidden />, route: { name: 'admin', tab: 'reports' }, active: route.name === 'admin' && route.tab === 'reports' },
            ];

  const nav = (className: string) => (
    <nav className={className} aria-label={className.includes('bottom') ? 'Main (mobile)' : 'Main'}>
      {navItems.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`nav-item ${item.active ? 'nav-item--active' : ''}`}
          onClick={() => navigate(item.route)}
          aria-current={item.active ? 'page' : undefined}
        >
          <span className="nav-item__icon">
            {item.icon}
            {item.badge !== undefined && item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <div className="shell-chrome">
      <div className="demo-bar">
        <span className="demo-bar__label">
          <strong>Demo Mode</strong> — sample tenants, prices & orders. Not live shopping.
        </span>
        <div className="demo-bar__actions">
          <div className="role-switcher" role="group" aria-label="Demo Mode role switcher (not real sign-in)">
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`role-switcher__btn ${role === option.id ? 'role-switcher__btn--active' : ''}`}
                onClick={() => switchRole(option.id)}
                aria-pressed={role === option.id}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <button type="button" className="demo-bar__reset" onClick={() => setConfirmReset(true)}>
            <RotateCcw size={15} aria-hidden /> Reset demo
          </button>
        </div>
      </div>

      <header className="app-header">
        <button type="button" className="brand" onClick={() => navigate(homeRouteForRole(role))} aria-label="Angelo Mall Go — go to start">
          <img src="/icon.svg" alt="" width={42} height={42} />
          <span className="brand__text">
            <strong>Angelo Mall Go</strong>
            <small>Your mall. Your shops. One easy way to shop.</small>
          </span>
        </button>
        {nav('top-nav')}
      </header>
      </div>

      {!online && (
        <div className="offline-banner" role="alert">
          <WifiOff size={17} aria-hidden />
          You appear to be offline. This demo keeps working on this device — live ordering would need a connection.
        </div>
      )}

      <main id="main" className="shell-main">
        {children}
      </main>

      <footer className="app-footer">
        <p>
          <strong>Angelo Mall Go (Phase 1 prototype).</strong> Concept demonstration for Angelo Mall, Nigel, Gauteng —
          prepared to show a possible chat-first shopping service. This demo does not imply endorsement by Angelo Mall
          or any tenant, and no real orders, payments or deliveries take place.
        </p>
        <p className="app-footer__small">
          Demo Mode role switching is a presentation tool, not authentication. A production version requires secure
          accounts and server-side permissions.
        </p>
      </footer>

      {nav('bottom-nav')}

      {confirmReset && (
        <Modal title="Reset all demo data?" onClose={() => setConfirmReset(false)}>
          <p>
            This restores the original sample shops, conversations, orders, delivery jobs and promotions, and removes
            messages or changes made during this demo session on this device.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setConfirmReset(false)}>
              Keep my demo changes
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                resetDemo();
                setConfirmReset(false);
                navigate(homeRouteForRole(role));
                notify('Demo data has been reset to the original sample scenario.');
              }}
            >
              Yes, reset demo data
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
