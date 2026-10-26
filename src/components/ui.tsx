import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import type { OrderStatus, ParticipationStatus, Shop } from '../types';
import { STATUS_LABELS } from '../utils/orderWorkflow';

/* ---------------- Toast ---------------- */

interface ToastItem {
  id: number;
  message: string;
}

const ToastContext = createContext<{ notify: (message: string) => void }>({ notify: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const notify = useCallback((message: string) => {
    const id = ++seq.current;
    setToasts((current) => [...current.slice(-2), { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <CheckCircle2 size={18} aria-hidden />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

/* ---------------- Modal ---------------- */

export function Modal({
  title,
  children,
  onClose,
  labelledBy = 'modal-title',
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  labelledBy?: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id={labelledBy}>{title}</h2>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} aria-hidden />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Small building blocks ---------------- */

/**
 * Directory-level honesty: makes it unmistakable that the businesses are real
 * tenants of the mall while the Mall Go experience around them is a concept.
 */
export function ListingDisclosure() {
  return (
    <div className="listing-disclosure" role="note">
      <Info size={17} aria-hidden />
      <div>
        <strong>Real shops, concept app.</strong> Every business listed is a tenant of Angelo Mall, transcribed from the
        mall&rsquo;s own store directory. None of them is a Mall Go partner: nothing you send here reaches a shop, and no
        order, price, payment or delivery is real.
      </div>
    </div>
  );
}

export function DemoTag({ children = 'Demo data' }: { children?: ReactNode }) {
  return <span className="demo-tag">{children}</span>;
}

export function SponsoredTag() {
  return <span className="sponsored-tag">Sponsored · demo placement</span>;
}

export function ShopAvatar({ shop, size = 'md' }: { shop: Shop; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`shop-avatar shop-avatar--${size}`} style={{ background: shop.colour }} aria-hidden>
      {shop.initials}
    </span>
  );
}

export function TradingPill({ tradingNow }: { tradingNow: boolean }) {
  return (
    <span className={`pill ${tradingNow ? 'pill--open' : 'pill--closed'}`}>
      <span className="pill-dot" aria-hidden />
      {tradingNow ? 'Open now (demo)' : 'Closed (demo)'}
    </span>
  );
}

const PARTICIPATION_LABELS: Record<ParticipationStatus, string> = {
  'demo-scenario': 'Sample walkthrough · simulated',
  'real-listing': 'Listed from mall directory · no ordering',
  paused: 'Hidden in this demo',
};

export function ParticipationPill({ status }: { status: ParticipationStatus }) {
  return (
    <span className={`pill pill--participation pill--${status}`} title={PARTICIPATION_TITLES[status]}>
      {PARTICIPATION_LABELS[status]}
    </span>
  );
}

const PARTICIPATION_TITLES: Record<ParticipationStatus, string> = {
  'demo-scenario': 'This shop is a real tenant, but the chat and orders here are a scripted, simulated sample.',
  'real-listing': 'Real tenant transcribed from the mall store directory. Mall Go has no ordering, chat or payment link to it.',
  paused: 'Hidden from the demo directory by the admin demo.',
};

export function StatusPill({ status }: { status: OrderStatus }) {
  const tone =
    status === 'cancelled'
      ? 'danger'
      : status === 'delivered' || status === 'completed'
        ? 'success'
        : status === 'draft' || status === 'awaiting-customer' || status === 'awaiting-shop'
          ? 'warning'
          : 'info';
  return <span className={`pill pill--status pill--${tone}`}>{STATUS_LABELS[status]}</span>;
}

export function EmptyState({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden>
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}

export function InfoBanner({ children }: { children: ReactNode }) {
  return (
    <div className="info-banner" role="note">
      <Info size={18} aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Skeleton rows for simulated loading states (Phase 2: real API latency). */
export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton-list" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line skeleton-line--wide" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line--short" />
        </div>
      ))}
    </div>
  );
}
