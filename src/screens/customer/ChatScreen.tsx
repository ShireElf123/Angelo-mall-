import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MessageCircleDashed, ReceiptText, TriangleAlert } from 'lucide-react';
import type { Route } from '../../router';
import { useDemoStore } from '../../store/DemoStore';
import { getShop, messagesForConversation, openBasketForConversation, orderById } from '../../store/selectors';
import { formatZAR } from '../../utils/format';
import { calculateTotals } from '../../utils/orderWorkflow';
import { ChatThread, type OutgoingMessage } from '../../components/ChatThread';
import { EmptyState, ShopAvatar, TradingPill } from '../../components/ui';

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
  const timers = useRef<number[]>([]);

  const conversation = state.conversations.find((c) => c.id === conversationId);
  const shop = conversation ? getShop(state, conversation.shopId) : undefined;
  const messages = messagesForConversation(state, conversationId);
  const basket = openBasketForConversation(state, conversationId);

  useEffect(() => {
    void service.markRead(conversationId, 'customer');
  }, [conversationId, messages.length, service]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

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
    <div className="page page--chat">
      <div className="chat-frame">
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
        </header>

        {!shop.tradingNow && (
          <div className="chat-notice" role="note">
            <TriangleAlert size={16} aria-hidden />
            This demo shop is shown as closed right now. You can still send a message for when they open (sample hours
            on the shop page).
          </div>
        )}
        {shop.participation === 'paused' && (
          <div className="chat-notice" role="note">
            <TriangleAlert size={16} aria-hidden />
            This listing is paused in the demo directory — chat remains open so you can see how the state is handled.
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
