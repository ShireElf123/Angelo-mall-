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
  'demo-partner': 'Demo tenant · worked example',
  'directory-example': 'Directory example · not a confirmed partner',
  paused: 'Paused in demo',
};

export function ParticipationPill({ status }: { status: ParticipationStatus }) {
  return <span className={`pill pill--participation pill--${status}`}>{PARTICIPATION_LABELS[status]}</span>;
}

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
