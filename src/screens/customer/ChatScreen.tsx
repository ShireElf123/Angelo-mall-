import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Maximize2,
  MessageCircleDashed,
  Minimize2,
  ReceiptText,
  TriangleAlert,
} from 'lucide-react';
import type { Route } from '../../router';
import { useDemoStore } from '../../store/DemoStore';
import { getShop, messagesForConversation, openBasketForConversation, orderById } from '../../store/selectors';
import { formatZAR } from '../../utils/format';
import { calculateTotals } from '../../utils/orderWorkflow';
import { ChatThread, type OutgoingMessage } from '../../components/ChatThread';
import { EmptyState, ShopAvatar, TradingPill } from '../../components/ui';

/** Class set on <html>/<body> while the mobile full-screen chat is open. */
const SCROLL_LOCK_CLASS = 'chat-expanded';

/**
 * Page chrome that sits outside the chat panel. While the full-screen overlay is
 * open it is marked inert + aria-hidden so screen readers and pointer users
 * cannot reach the page hidden behind it (Tab alone is handled by the trap).
 */
const BACKGROUND_SELECTORS = '.shell-chrome, .app-footer, .bottom-nav';

/** Clearly-labelled simulated staff replies (no real employee is connected). */
function simulatedReply(customerText: string): string {
  const text = customerText.toLowerCase();
  if (/(price|how much|cost|R\s?\d)/.test(text)) {
    return 'Thanks for asking! I’ll confirm the exact price on your order summary before you confirm anything — no surprises.';
  }
  if (/(deliver|delivery|collect)/.test(text)) {
    return 'We can arrange local delivery or keep it ready for collection — you’ll choose when you confirm the order summary.';
  }
  if (/(size|colour|color|stock|have|available)/.test(text)) {
    return 'Let me check that for you. If we’re out of stock I’ll suggest the closest alternative before adding anything to your order.';
  }
  if (/(thank|great|perfect|ok)/.test(text)) {
    return 'Pleasure! Shout if you’d like me to add anything else to your summary.';
  }
  return 'Thanks for your message — noted! I’ll include that when I prepare your order summary. Anything else you need?';
}

export function ChatScreen({
  conversationId,
  navigate,
}: {
  conversationId: string;
  navigate: (route: Route) => void;
}) {
  const { state, service } = useDemoStore();
  const [typing, setTyping] = useState(false);
  /**
   * Compact vs expanded chat. The panel is the same component tree in both
   * modes, so messages, draft text, attachments, basket and order state are
   * never unmounted or duplicated when the mode changes.
   */
  const [expanded, setExpanded] = useState(false);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const conversation = state.conversations.find((c) => c.id === conversationId);
  const shop = conversation ? getShop(state, conversation.shopId) : undefined;
  const messages = messagesForConversation(state, conversationId);
  const basket = openBasketForConversation(state, conversationId);

  useEffect(() => {
    void service.markRead(conversationId, 'customer');
  }, [conversationId, messages.length, service]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const collapse = useCallback(() => {
    setExpanded(false);
    // Return focus to the control that opened the overlay so keyboard users
    // are not dropped at the top of the page.
    window.requestAnimationFrame?.(() => expandButtonRef.current?.focus());
  }, []);

  // Lock background scrolling while the full-screen overlay is open and
  // always release the lock if the screen unmounts mid-expansion.
  useEffect(() => {
    if (!expanded) return;
    const roots = [document.documentElement, document.body];
    roots.forEach((node) => node?.classList.add(SCROLL_LOCK_CLASS));
    return () => roots.forEach((node) => node?.classList.remove(SCROLL_LOCK_CLASS));
  }, [expanded]);

  // Hide the page behind the overlay from assistive tech for as long as it is
  // open; restore the exact previous state on close or unmount.
  useEffect(() => {
    if (!expanded) return;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(BACKGROUND_SELECTORS));
    const previous = nodes.map((node) => ({
      node,
      inert: node.hasAttribute('inert'),
      ariaHidden: node.getAttribute('aria-hidden'),
    }));
    nodes.forEach((node) => {
      node.setAttribute('inert', '');
      node.setAttribute('aria-hidden', 'true');
    });
    return () =>
      previous.forEach(({ node, inert, ariaHidden }) => {
        if (!inert) node.removeAttribute('inert');
        if (ariaHidden === null) node.removeAttribute('aria-hidden');
        else node.setAttribute('aria-hidden', ariaHidden);
      });
  }, [expanded]);

  // On-screen keyboards: iOS Safari does not shrink 100dvh when the keyboard
  // opens, which used to leave the composer behind the keyboard. Follow the
  // visual viewport where the browser exposes it and fall back to 100dvh.
  useEffect(() => {
    if (!expanded) return;
    const frame = frameRef.current;
    const viewport = window.visualViewport;
    if (!frame || !viewport) return;
    const apply = () => {
      frame.style.setProperty('--chat-overlay-height', `${Math.round(viewport.height)}px`);
    };
    apply();
    viewport.addEventListener('resize', apply);
    viewport.addEventListener('scroll', apply);
    return () => {
      viewport.removeEventListener('resize', apply);
      viewport.removeEventListener('scroll', apply);
      frame.style.removeProperty('--chat-overlay-height');
    };
  }, [expanded]);

  // Escape closes the overlay; Tab stays inside it while open so keyboard and
  // screen-reader users cannot wander into the page hidden behind the panel.
  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        collapse();
        return;
      }
      if (event.key !== 'Tab') return;
      const root = frameRef.current;
      if (!root) return;
      // Only ignore hidden inputs; jsdom has no layout, so offsetParent-based
      // visibility checks would wrongly drop every control in tests.
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input:not([type="hidden"]), select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((node) => !node.hidden);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!active || !root.contains(active)) {
        event.preventDefault();
        first.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expanded, collapse]);

  if (!conversation || !shop) {
    return (
      <div className="page page--narrow">
        <EmptyState
          icon={<MessageCircleDashed size={30} aria-hidden />}
          title="Conversation not found"
          description="This demo chat may have been cleared by a reset. Start again from the shop directory."
        >
          <button type="button" className="btn btn--primary" onClick={() => navigate({ name: 'shops' })}>
            Browse shops
          </button>
        </EmptyState>
      </div>
    );
  }

  const handleSend = (message: OutgoingMessage) => {
    void service.sendMessage({ conversationId, sender: 'customer', ...message });
    // Simulated staff reply — always flagged simulated:true and labelled in UI.
    setTyping(true);
    const timer = window.setTimeout(() => {
      setTyping(false);
      void service.sendMessage({
        conversationId,
        sender: 'shop',
        text: simulatedReply(message.text),
        simulated: true,
      });
    }, 1700);
    timers.current.push(timer);
  };

  const basketTotals = basket
    ? calculateTotals(basket.items, basket.fulfilment, basket.deliveryFee)
    : undefined;

  return (
    <div className={`page page--chat${expanded ? ' page--chat--expanded' : ''}`}>
      <div
        ref={frameRef}
        className="chat-frame"
        id="chat-panel"
        role={expanded ? 'dialog' : 'region'}
        aria-modal={expanded || undefined}
        aria-label={`Chat with ${shop.name}`}
      >
        <header className="chat-header">
          <button type="button" className="icon-btn" onClick={() => navigate({ name: 'chats' })} aria-label="Back to chats">
            <ArrowLeft size={21} aria-hidden />
          </button>
          <button type="button" className="chat-header__shop" onClick={() => navigate({ name: 'shop', shopId: shop.id })}>
            <ShopAvatar shop={shop} />
            <span>
              <strong>{shop.name}</strong>
              <small>{shop.tradingNow ? 'Demo shop · usually replies within the hour' : 'Demo shop · shown closed'}</small>
            </span>
          </button>
          <TradingPill tradingNow={shop.tradingNow} />
          <button
            ref={expandButtonRef}
            type="button"
            className="icon-btn chat-header__expand"
            onClick={() => setExpanded((current) => !current)}
            aria-label={expanded ? 'Minimise chat' : 'Expand chat'}
            aria-expanded={expanded}
            aria-controls="chat-panel"
            title={expanded ? 'Minimise chat' : 'Expand chat'}
          >
            {expanded ? <Minimize2 size={20} aria-hidden /> : <Maximize2 size={20} aria-hidden />}
            <span className="chat-header__expand-label" aria-hidden>
              {expanded ? 'Minimise' : 'Expand'}
            </span>
          </button>
        </header>

        {!shop.tradingNow && (
          <div className="chat-notice" role="note">
            <TriangleAlert size={16} aria-hidden />
            This demo shop is shown as closed right now. You can still send a message for when they open (sample hours
            on the shop page).
          </div>
        )}
        {shop.participation === 'demo-scenario' && (
          <div className="chat-notice chat-notice--info" role="note">
            <TriangleAlert size={16} aria-hidden />
            <span>
              Simulated chat: {shop.name} is a real tenant at Angelo Mall but has no Mall Go account. Nobody at the store
              receives these messages, and the replies, prices and delivery steps are scripted for this demo.
            </span>
          </div>
        )}
        {shop.participation === 'paused' && (
          <div className="chat-notice" role="note">
            <TriangleAlert size={16} aria-hidden />
            This listing is hidden in the demo directory — chat remains open so you can see how the state is handled.
          </div>
        )}

        <ChatThread
          perspective="customer"
          messages={messages}
          getOrder={(orderId) => orderById(state, orderId)}
          onSend={handleSend}
          onOpenOrder={(orderId) => {
            const order = orderById(state, orderId);
            navigate(
              order?.status === 'awaiting-customer'
                ? { name: 'basket', orderId }
                : { name: 'order', orderId },
            );
          }}
          composerPlaceholder={`Message ${shop.name}…`}
          emptyState={
            <EmptyState
              icon={<MessageCircleDashed size={28} aria-hidden />}
              title="Say hello"
              description="Ask about stock, sizes, prices — or send your whole list. Staff will build a priced summary with you."
            />
          }
          basketBar={
            <>
              {typing && (
                <div className="typing-bar" aria-live="polite">
                  <span className="typing-dots" aria-hidden>
                    <span /> <span /> <span />
                  </span>
                  {shop.name} is typing… <em>(simulated for this demo)</em>
                </div>
              )}
              {basket?.status === 'awaiting-customer' && basketTotals && (
                <button type="button" className="basket-bar" onClick={() => navigate({ name: 'basket', orderId: basket.id })}>
                  <ReceiptText size={20} aria-hidden />
                  <span>
                    <strong>Basket {basket.ref} ready</strong>
                    <small>
                      {basketTotals.itemCount} item(s) · {formatZAR(basketTotals.total)} · review & confirm
                    </small>
                  </span>
                </button>
              )}
              {basket?.status === 'draft' && (
                <div className="basket-bar basket-bar--muted" role="note">
                  <ReceiptText size={20} aria-hidden />
                  <span>
                    <strong>The shop is preparing your summary</strong>
                    <small>It will appear here as an order card when they send it (try the Shop staff workspace).</small>
                  </span>
                </div>
              )}
            </>
          }
        />
      </div>

      <aside className="chat-aside">
        <div className="panel">
          <h2>About this demo chat</h2>
          <ul className="tick-list">
            <li>Messages you send are stored only on this device (Phase 1 demo).</li>
            <li>Replies marked “Simulated reply” are automatic — no real staff member is connected.</li>
            <li>Use the <strong>Shop staff</strong> Demo Mode view to answer as {shop.name} and build the order.</li>
            <li>Photos you attach stay on this device — a live version would use secure uploads.</li>
          </ul>
          <button type="button" className="btn btn--ghost btn--block" onClick={() => navigate({ name: 'shop', shopId: shop.id })}>
            View shop details & hours
          </button>
        </div>
      </aside>
    </div>
  );
}
