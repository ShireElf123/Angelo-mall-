import { useState } from 'react';
import {
  Bike,
  CheckCircle2,
  MapPin,
  Navigation,
  PackageCheck,
  PackageOpen,
  ShieldCheck,
  Store,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import type { DeliveryTab, Route } from '../../router';
import { useDemoStore } from '../../store/DemoStore';
import { getShop, orderById } from '../../store/selectors';
import type { DeliveryJob } from '../../types';
import { formatRelative, formatZAR } from '../../utils/format';
import { EmptyState, InfoBanner, Modal, ShopAvatar, useToast } from '../../components/ui';

const JOB_STATUS_LABELS: Record<DeliveryJob['status'], string> = {
  available: 'Available',
  accepted: 'Accepted — go to shop',
  collected: 'Collected from shop',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
  failed: 'Could not complete',
};

function JobCard({ job, mode }: { job: DeliveryJob; mode: 'available' | 'mine' | 'done' }) {
  const { state, service } = useDemoStore();
  const { notify } = useToast();
  const [failOpen, setFailOpen] = useState(false);
  const shop = getShop(state, job.shopId);
  const order = orderById(state, job.orderId);

  return (
    <article className="job-card">
      <div className="job-card__head">
        {shop && <ShopAvatar shop={shop} />}
        <div className="job-card__titles">
          <strong>{shop?.name ?? 'Shop'}</strong>
          <small>
            <Store size={12} aria-hidden /> Pickup: {shop?.unitLabel ?? 'Angelo Mall (demo)'}
          </small>
        </div>
        <span className={`pill pill--job pill--job-${job.status}`}>{JOB_STATUS_LABELS[job.status]}</span>
      </div>

      <dl className="job-card__facts">
        <div>
          <dt>
            <MapPin size={14} aria-hidden /> Deliver to
          </dt>
          <dd>
            {job.destinationArea} <small>(general area{mode === 'available' ? ' — exact address only after acceptance in a live system' : ''})</small>
          </dd>
        </div>
        <div>
          <dt>
            <Navigation size={14} aria-hidden /> Distance
          </dt>
          <dd>{job.distanceKm.toFixed(1)} km (supplied demo value)</dd>
        </div>
        <div>
          <dt>
            <Wallet size={14} aria-hidden /> You earn
          </dt>
          <dd>
            <strong>{formatZAR(job.driverPayout)}</strong> (demo payout)
          </dd>
        </div>
        <div>
          <dt>
            <PackageOpen size={14} aria-hidden /> Parcel
          </dt>
          <dd>{job.parcelsLabel}</dd>
        </div>
      </dl>

      <p className="job-card__meta">
        {mode === 'available' ? (
          <>Published {formatRelative(job.createdAt)} · customer name & contact details are never shown on open job cards.</>
        ) : (
          <>
            Order {order?.ref ?? '—'} · Customer: {order?.customerName ?? '—'} (shown after acceptance in this demo) ·
            updated {formatRelative(job.updatedAt)}
          </>
        )}
      </p>

      {mode === 'available' && (
        <button
          type="button"
          className="btn btn--primary btn--lg btn--block"
          onClick={async () => {
            await service.acceptDeliveryJob(job.id);
            notify(`Job accepted — head to ${shop?.name ?? 'the shop'} for collection. The customer’s timeline now shows “Driver assigned”.`);
          }}
        >
          <Bike size={19} aria-hidden /> Accept this demo job
        </button>
      )}

      {mode === 'mine' && job.status === 'accepted' && (
        <button
          type="button"
          className="btn btn--primary btn--lg btn--block"
          onClick={async () => {
            await service.advanceDeliveryJob(job.id, 'collected');
            notify('Collection confirmed. The customer can see the order was collected.');
          }}
        >
          <PackageCheck size={19} aria-hidden /> Confirm collection from shop
        </button>
      )}
      {mode === 'mine' && job.status === 'collected' && (
        <button
          type="button"
          className="btn btn--primary btn--lg btn--block"
          onClick={async () => {
            await service.advanceDeliveryJob(job.id, 'out-for-delivery');
            notify('Marked out for delivery.');
          }}
        >
          <Navigation size={19} aria-hidden /> Start delivery (out for delivery)
        </button>
      )}
      {mode === 'mine' && job.status === 'out-for-delivery' && (
        <button
          type="button"
          className="btn btn--gold btn--lg btn--block"
          onClick={async () => {
            await service.advanceDeliveryJob(job.id, 'delivered');
            notify('Delivered! Switch back to the Customer view to see the completed timeline.');
          }}
        >
          <CheckCircle2 size={19} aria-hidden /> Confirm delivered
        </button>
      )}
      {mode === 'mine' && ['accepted', 'collected', 'out-for-delivery'].includes(job.status) && (
        <button type="button" className="btn btn--danger-ghost btn--block" onClick={() => setFailOpen(true)}>
          <TriangleAlert size={16} aria-hidden /> I can’t complete this delivery
        </button>
      )}

      {failOpen && (
        <Modal title="Can’t complete this delivery?" onClose={() => setFailOpen(false)}>
          <p>
            The job will be re-published for another demo partner and the customer’s order returns to “Awaiting driver
            assignment”. In a live system you’d pick a reason (vehicle trouble, customer unreachable…) and support
            would be notified.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setFailOpen(false)}>
              Keep the job
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={async () => {
                await service.advanceDeliveryJob(job.id, 'failed');
                setFailOpen(false);
                notify('Job released and re-published (demo).');
              }}
            >
              Release this job
            </button>
          </div>
        </Modal>
      )}
    </article>
  );
}

export function DeliveryWorkspace({
  tab,
  navigate,
}: {
  tab: DeliveryTab;
  navigate: (route: Route) => void;
}) {
  const { state } = useDemoStore();
  const available = state.deliveryJobs.filter((j) => j.status === 'available');
  const mine = state.deliveryJobs.filter((j) => ['accepted', 'collected', 'out-for-delivery'].includes(j.status));
  const done = state.deliveryJobs.filter((j) => j.status === 'delivered' || j.status === 'failed');
  const earned = done.filter((j) => j.status === 'delivered').reduce((sum, j) => sum + j.driverPayout, 0);

  const tabs: { id: DeliveryTab; label: string; count: number }[] = [
    { id: 'available', label: 'Available jobs', count: available.length },
    { id: 'mine', label: 'My active jobs', count: mine.length },
    { id: 'done', label: 'Completed', count: done.length },
  ];

  return (
    <div className="page page--narrow">
      <div className="workspace-head">
        <div>
          <span className="workspace-kicker">Delivery partner workspace · demo</span>
          <h1>Local deliveries around Nigel</h1>
          <p>Independent demo job board for approved local partners — serving any participating mall shop. Not connected to any courier company.</p>
        </div>
      </div>

      <div className="driver-strip">
        <span className="customer-avatar" aria-hidden>
          JK
        </span>
        <div>
          <strong>Demo driver · Johan K.</strong>
          <small>Approved partner (sample profile) · earnings in this demo: {formatZAR(earned)}</small>
        </div>
        <span className="pill pill--open">
          <span className="pill-dot" aria-hidden /> Online (demo)
        </span>
      </div>

      <InfoBanner>
        <ShieldCheck size={15} aria-hidden /> Privacy by design: open job cards show the pickup shop, a{' '}
        <strong>general area</strong>, distance (demo value) and payout only — never a customer’s phone number or exact
        address.
      </InfoBanner>

      <div className="workspace-tabs" role="tablist" aria-label="Delivery jobs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`workspace-tab ${tab === t.id ? 'workspace-tab--active' : ''}`}
            onClick={() => navigate({ name: 'delivery', tab: t.id })}
          >
            {t.label}
            {t.count > 0 && <span className="unread-badge unread-badge--gold">{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="job-list">
        {tab === 'available' &&
          (available.length === 0 ? (
            <EmptyState
              icon={<Bike size={30} aria-hidden />}
              title="No open jobs right now"
              description="When a shop marks a delivery order ready, the job appears here instantly. Try it: confirm AMG-1001 as the customer, then prepare it in the Shop staff workspace."
            />
          ) : (
            available.map((job) => <JobCard key={job.id} job={job} mode="available" />)
          ))}

        {tab === 'mine' &&
          (mine.length === 0 ? (
            <EmptyState
              icon={<PackageOpen size={30} aria-hidden />}
              title="No active jobs"
              description="Accept an available job and it will wait for you here with big, thumb-friendly status buttons."
            >
              <button type="button" className="btn btn--primary" onClick={() => navigate({ name: 'delivery', tab: 'available' })}>
                See available jobs
              </button>
            </EmptyState>
          ) : (
            mine.map((job) => <JobCard key={job.id} job={job} mode="mine" />)
          ))}

        {tab === 'done' &&
          (done.length === 0 ? (
            <EmptyState
              icon={<PackageCheck size={30} aria-hidden />}
              title="Nothing completed yet"
              description="Delivered (and released) jobs collect here with their demo payouts — the start of an earnings history in a live system."
            />
          ) : (
            done.map((job) => <JobCard key={job.id} job={job} mode="done" />)
          ))}
      </div>
    </div>
  );
}
