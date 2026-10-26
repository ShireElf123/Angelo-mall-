import { useState } from 'react';
import {
  ArrowLeft,
  Bike,
  Building2,
  CalendarRange,
  Eye,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  MousePointerClick,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Store,
} from 'lucide-react';
import type { Route } from '../../router';
import { useDemoStore } from '../../store/DemoStore';
import { HELP_STEP_ILLUSTRATIONS, imageSrc } from '../../data/imageAssets';
import { getShop } from '../../store/selectors';
import { DemoTag, EmptyState, Modal, SectionHeader, ShopAvatar, SponsoredTag, useToast } from '../../components/ui';

export function PromotionDetailScreen({
  promotionId,
  navigate,
}: {
  promotionId: string;
  navigate: (route: Route) => void;
}) {
  const { state, service } = useDemoStore();
  const promotion = state.promotions.find((p) => p.id === promotionId);
  const shop = promotion?.shopId ? getShop(state, promotion.shopId) : undefined;

  if (!promotion) {
    return (
      <div className="page page--narrow">
        <EmptyState
          illustration={imageSrc('state-not-found')}
          icon={<Megaphone size={26} aria-hidden />}
          title="Promotion not found"
          description="This demo promotion may have ended or been removed in the admin workspace."
        >
          <button type="button" className="btn btn--primary" onClick={() => navigate({ name: 'home' })}>
            Back home
          </button>
        </EmptyState>
      </div>
    );
  }

  const startChatFromPromo = async () => {
    if (!shop) return;
    await service.recordPromotionEvent(promotion.id, 'conversation-start');
    const conversationId = await service.openConversation(shop.id);
    navigate({ name: 'chat', conversationId });
  };

  return (
    <div className="page page--narrow">
      <button type="button" className="back-btn" onClick={() => navigate({ name: 'home' })}>
        <ArrowLeft size={18} aria-hidden /> Back
      </button>

      <article className="promo-detail">
        <img src={promotion.image} alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
        <div className="promo-detail__body">
          {promotion.sponsored ? <SponsoredTag /> : <DemoTag>Concept placeholder · not a tenant offer</DemoTag>}
          <h1>{promotion.title}</h1>
          <p>{promotion.description}</p>
          <p className="promo-detail__dates">
            <CalendarRange size={16} aria-hidden /> Sample campaign: {promotion.startsAt} → {promotion.endsAt}
            {!promotion.active && ' · currently switched off in admin demo'}
          </p>

          {shop && (
            <div className="promo-detail__shop">
              <ShopAvatar shop={shop} />
              <div>
                <strong>{shop.name}</strong>
                <small>{shop.tagline}</small>
              </div>
            </div>
          )}

          <div className="action-stack">
            {shop ? (
              <>
                <button type="button" className="btn btn--primary btn--lg btn--block" onClick={() => void startChatFromPromo()}>
                  <MessageCircle size={19} aria-hidden /> Open a sample chat for {shop.name}
                </button>
                <button type="button" className="btn btn--ghost btn--block" onClick={() => navigate({ name: 'shop', shopId: shop.id })}>
                  View shop page
                </button>
              </>
            ) : (
              <button type="button" className="btn btn--primary btn--block" onClick={() => navigate({ name: 'shops' })}>
                Browse the mall directory
              </button>
            )}
          </div>

          <div className="promo-detail__stats" aria-label="Demo campaign counters">
            <span>
              <Eye size={15} aria-hidden /> {promotion.impressions} impressions (demo counter)
            </span>
            <span>
              <MousePointerClick size={15} aria-hidden /> {promotion.clicks} clicks
            </span>
            <span>
              <MessagesSquare size={15} aria-hidden /> {promotion.conversationStarts} chat starts
            </span>
          </div>
          <p className="panel__lede">
            Counters above are demonstration instrumentation. Real campaigns would need backend measurement and order
            attribution before anyone is billed for a placement.
          </p>
        </div>
      </article>
    </div>
  );
}

const DEMO_WALKTHROUGH: string[] = [
  'Customer: open The Angelo SUPERSPAR and review the basket already waiting in the chat (AMG-1001).',
  'Confirm the demo order — choose delivery to see the full journey.',
  'Switch Demo Mode to Shop staff: open Thandi’s conversation, reply, then accept → preparing → ready for driver.',
  'Switch to Delivery partner: accept the SUPERSPAR job, mark collected → out for delivery → delivered.',
  'Return to Customer: open Orders — AMG-1001 now shows Delivered with a complete timeline.',
  'Bonus: in the Shop staff inbox, open Sipho’s unread chat and build him an order from scratch.',
];

export function HelpScreen({ navigate }: { navigate: (route: Route) => void }) {
  const { resetDemo } = useDemoStore();
  const { notify } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="page page--narrow">
      <SectionHeader
        title="Help & about this demo"
        subtitle="Angelo Mall Go is a front-end prototype: real interface behaviour, sample data from the mall’s own store directory, no live services."
      />

      <section className="panel" aria-label="About the shop listings">
        <h2>About the shop listings</h2>
        <p>
          Every shop in the directory is a real business at Angelo Mall, transcribed from the mall’s published store
          directory (<a href="https://www.angelomall.co.za/" target="_blank" rel="noopener noreferrer nofollow">angelomall.co.za</a>),
          including shop numbers, telephone numbers and trading hours. The directory has no “last updated” date, so
          those details are shown as listed rather than as confirmed today.
        </p>
        <p>
          <strong>No shop is a Mall Go partner.</strong> None has agreed to take part, none receives messages or orders
          from this app, and no logo or shop photograph is used. Replies, prices, stock, collection and delivery in the
          four sample chats are simulated in your browser. Before any real launch, each business needs to be contacted
          and must give written permission.
        </p>
      </section>

      <section className="panel" aria-label="How ordering works">
        <h2>
          <MessagesSquare size={19} aria-hidden /> How chat ordering works
        </h2>
        <ol className="flow-steps">
          <li className="flow-step">
            <img src={HELP_STEP_ILLUSTRATIONS[0]} alt="" loading="lazy" decoding="async" aria-hidden />
            <div>
              <strong>1. Find a shop and say hello</strong>
              <p>
                Open a shop from the directory and start a conversation — no account needed for this demo. Ask a
                question or send a list, the way you would message a person.
              </p>
            </div>
          </li>
          <li className="flow-step">
            <img src={HELP_STEP_ILLUSTRATIONS[1]} alt="" loading="lazy" decoding="async" aria-hidden />
            <div>
              <strong>2. Review the summary, then confirm</strong>
              <p>
                The shop would build a priced summary in the thread; you check items, quantities and fees before
                anything is confirmed. Here the summary is sample data with demo prices.
              </p>
            </div>
          </li>
          <li className="flow-step">
            <img src={HELP_STEP_ILLUSTRATIONS[2]} alt="" loading="lazy" decoding="async" aria-hidden />
            <div>
              <strong>3. Follow delivery or collection</strong>
              <p>
                Progress runs through a simulated timeline — accepted, prepared, out for delivery. No real courier or
                shop is involved, and the chat stays open the whole time.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className="panel" aria-label="Guided demo">
        <h2>
          <Smartphone size={19} aria-hidden /> Guided 3-minute demo
        </h2>
        <ol className="numbered-list">
          {DEMO_WALKTHROUGH.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <button type="button" className="btn btn--primary" onClick={() => navigate({ name: 'chat', conversationId: 'conv-superspar-thandi' })}>
          Start at the SUPERSPAR chat
        </button>
      </section>

      <section className="panel" aria-label="The four demo views">
        <h2>The four demo views (Demo Mode switch)</h2>
        <img
          className="panel__art"
          src={imageSrc('concept-four-views')}
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden
        />
        <ul className="role-explain">
          <li>
            <Store size={18} aria-hidden />
            <span>
              <strong>Shop staff</strong> — the retailer inbox: answer chats, build order summaries, move orders through
              preparation.
            </span>
          </li>
          <li>
            <Bike size={18} aria-hidden />
            <span>
              <strong>Delivery partner</strong> — phone-first job board. Job cards show only a general area until a
              partner accepts.
            </span>
          </li>
          <li>
            <Building2 size={18} aria-hidden />
            <span>
              <strong>Mall admin</strong> — tenant participation, promotions and illustrative marketplace reporting for
              mall management.
            </span>
          </li>
        </ul>
        <p className="panel__lede">
          All four views share one demo dataset on this device, so a change in one view is immediately visible in the
          others.
        </p>
      </section>

      <section className="panel" aria-label="Install this demo">
        <h2>Add to your home screen</h2>
        <p>
          Angelo Mall Go is built as a Progressive Web App. On most Android phones: open the browser menu →{' '}
          <strong>“Install app” / “Add to Home screen”</strong>. On iPhone Safari: Share →{' '}
          <strong>“Add to Home Screen”</strong>. The demo shell then opens full-screen like an app. (Offline ordering
          and push notifications are <em>not</em> part of Phase 1.)
        </p>
      </section>

      <section className="panel" aria-label="What is real and what is not">
        <h2>
          <ShieldCheck size={19} aria-hidden /> What’s real, what’s not
        </h2>
        <img
          className="panel__art panel__art--narrow"
          src={imageSrc('concept-privacy')}
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden
        />
        <ul className="tick-list">
          <li>
            <strong>Real in this demo:</strong> navigation, chat state, baskets, order workflow, delivery hand-offs,
            promotion counters — all running in your browser.
          </li>
          <li>
            <strong>Sample data:</strong> every tenant name, price, trading hour, distance and metric. No shop has
            confirmed participation.
          </li>
          <li>
            <strong>Not connected:</strong> payments, real couriers, WhatsApp, live stock, user accounts, push
            notifications.
          </li>
          <li>
            <strong>Demo Mode is not security.</strong> A production version needs proper sign-in and server-enforced
            permissions per shop.
          </li>
        </ul>
      </section>

      <section className="panel" aria-label="Reset demo data">
        <h2>Start the demo over</h2>
        <p>Restore the original sample shops, conversations, orders and jobs on this device.</p>
        <button type="button" className="btn btn--danger-ghost" onClick={() => setConfirmReset(true)}>
          <RotateCcw size={16} aria-hidden /> Reset demo data…
        </button>
      </section>

      {confirmReset && (
        <Modal title="Reset all demo data?" onClose={() => setConfirmReset(false)}>
          <p>
            This removes messages and changes from this demo session on this device and restores the original sample
            scenario.
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
                notify('Demo data has been reset.');
                navigate({ name: 'home' });
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
