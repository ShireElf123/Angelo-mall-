import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  MapPin,
  MessagesSquare,
  Search,
  TriangleAlert,
} from 'lucide-react';
import type { RetailerTab, Route } from '../../router';
import { useDemoStore } from '../../store/DemoStore';
import {
  conversationsForShop,
  getShop,
  lastMessage,
  messagesForConversation,
  openBasketForConversation,
  orderById,
  ordersForConversation,
  ordersForShop,
} from '../../store/selectors';
import { formatRelative, formatZAR } from '../../utils/format';
import { calculateTotals, isBasketOrder, isConfirmedOrder } from '../../utils/orderWorkflow';
import { ChatThread } from '../../components/ChatThread';
import { EmptyState, InfoBanner, StatusPill } from '../../components/ui';
import { OrderPanel } from './OrderPanel';

const QUICK_REPLIES = [
  'Yes, we have that in stock — I’ll add it to your summary. (demo check)',
  'That one is out of stock today. Can I suggest a close alternative at a similar price?',
  'No problem — I’ll substitute as discussed and show it clearly on your summary.',
  'Your order is being prepared now. I’ll update you here when it’s ready.',
];

type InboxFilter = 'all' | 'unread' | 'orders' | 'action';

function RetailerChat({
  conversationId,
  navigate,
}: {
  conversationId: string;
  navigate: (route: Route) => void;
}) {
  const { state, service } = useDemoStore();
  const [focusOrderId, setFocusOrderId] = useState<string | undefined>(undefined);
  const conversation = state.conversations.find((c) => c.id === conversationId);
  const messages = messagesForConversation(state, conversationId);

  useEffect(() => {
    void service.markRead(conversationId, 'shop');
  }, [conversationId, messages.length, service]);

  if (!conversation) {
    return (
      <EmptyState
        icon={<MessagesSquare size={28} aria-hidden />}
        title="Conversation not found"
        description="It may belong to another demo shop — check the shop switcher above."
      >
        <button type="button" className="btn btn--primary" onClick={() => navigate({ name: 'retailer', tab: 'inbox' })}>
          Back to inbox
        </button>
      </EmptyState>
    );
  }

  return (
    <div className="retailer-chat">
      <div className="chat-frame">
        <header className="chat-header">
          <button type="button" className="icon-btn" onClick={() => navigate({ name: 'retailer', tab: 'inbox' })} aria-label="Back to inbox">
            <ArrowLeft size={21} aria-hidden />
          </button>
          <div className="chat-header__shop chat-header__shop--static">
            <span className="customer-avatar" aria-hidden>
              {conversation.customerName.replace(/[^A-Z]/g, '').slice(0, 2) || 'CU'}
            </span>
            <span>
              <strong>{conversation.customerName}</strong>
              <small>
                <MapPin size={12} aria-hidden /> {conversation.customerArea} (general area) · you are replying as the
                shop (demo)
              </small>
            </span>
          </div>
        </header>

        <ChatThread
          perspective="shop"
          messages={messages}
          getOrder={(orderId) => orderById(state, orderId)}
          onSend={(message) => void service.sendMessage({ conversationId, sender: 'shop', ...message })}
          onOpenOrder={(orderId) => setFocusOrderId(orderId)}
          composerPlaceholder="Reply as the shop…"
          quickReplies={QUICK_REPLIES}
          emptyState={
            <EmptyState
              icon={<MessagesSquare size={28} aria-hidden />}
              title="No messages yet"
              description="When the customer writes, it lands here. Reply, agree the items, then build the order in the panel."
            />
          }
        />
      </div>

      <OrderPanel conversation={conversation} focusOrderId={focusOrderId} />
    </div>
  );
}

export function RetailerWorkspace({
  tab,
  conversationId,
  navigate,
}: {
  tab: RetailerTab;
  conversationId?: string;
  navigate: (route: Route) => void;
}) {
  const { state, dispatch } = useDemoStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<InboxFilter>('all');

  const shop = getShop(state, state.activeShopId);
  const conversations = conversationsForShop(state, state.activeShopId);
  const shopOrders = ordersForShop(state, state.activeShopId);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const orders = ordersForConversation(state, conversation.id);
      if (filter === 'unread' && conversation.unreadForShop === 0) return false;
      if (filter === 'orders' && orders.length === 0) return false;
      if (
        filter === 'action' &&
        !orders.some(
          (o) =>
            o.status === 'awaiting-shop' ||
            o.changeRequests.some((r) => r.status === 'pending') ||
            o.status === 'draft',
        ) &&
        conversation.unreadForShop === 0
      ) {
        return false;
      }
      if (q) {
        const last = lastMessage(state, conversation.id);
        const haystack = `${conversation.customerName} ${last?.text ?? ''} ${orders.map((o) => o.ref).join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [conversations, filter, query, state]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaysOrders = shopOrders.filter((o) => o.updatedAt >= todayStart.getTime() && isConfirmedOrder(o));
  const todaysValue = todaysOrders.reduce(
    (sum, o) => sum + calculateTotals(o.items, o.fulfilment, o.deliveryFee).subtotal,
    0,
  );
  const actionCount =
    conversations.reduce((n, c) => n + c.unreadForShop, 0) +
    shopOrders.filter((o) => o.status === 'awaiting-shop').length +
    shopOrders.reduce((n, o) => n + o.changeRequests.filter((r) => r.status === 'pending').length, 0);

  const orderBuckets: { title: string; orders: typeof shopOrders }[] = [
    { title: 'Needs your action', orders: shopOrders.filter((o) => ['draft', 'awaiting-customer', 'awaiting-shop'].includes(o.status)) },
    { title: 'In progress', orders: shopOrders.filter((o) => ['accepted', 'preparing', 'awaiting-driver', 'ready-collection', 'driver-assigned', 'collected', 'out-for-delivery'].includes(o.status)) },
    { title: 'Finished', orders: shopOrders.filter((o) => ['delivered', 'completed', 'cancelled'].includes(o.status)) },
  ];

  return (
    <div className="page page--wide">
      <div className="workspace-head">
        <div>
          <span className="workspace-kicker">Shop staff workspace · demo</span>
          <h1>{shop ? shop.name : 'Shop workspace'}</h1>
          <p>Handle customer chats and orders from the shop floor — no product catalogue to maintain.</p>
        </div>
        <label className="shop-switcher">
          Acting as demo shop
          <select
            value={state.activeShopId}
            onChange={(e) => {
              dispatch({ type: 'SET_ACTIVE_SHOP', shopId: e.target.value });
              navigate({ name: 'retailer', tab: 'inbox' });
            }}
          >
            {state.shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <InfoBanner>
        <TriangleAlert size={15} aria-hidden /> Demo convenience only: this shop switcher is <strong>not</strong>{' '}
        security. In production, staff sign in and the server limits them to their own shop’s data.
      </InfoBanner>

      <div className="workspace-tabs" role="tablist" aria-label="Shop workspace sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'inbox'}
          className={`workspace-tab ${tab === 'inbox' ? 'workspace-tab--active' : ''}`}
          onClick={() => navigate({ name: 'retailer', tab: 'inbox' })}
        >
          <Inbox size={17} aria-hidden /> Inbox
          {conversations.reduce((n, c) => n + c.unreadForShop, 0) > 0 && (
            <span className="unread-badge">{conversations.reduce((n, c) => n + c.unreadForShop, 0)}</span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'orders'}
          className={`workspace-tab ${tab === 'orders' ? 'workspace-tab--active' : ''}`}
          onClick={() => navigate({ name: 'retailer', tab: 'orders' })}
        >
          <ClipboardList size={17} aria-hidden /> Orders
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'today'}
          className={`workspace-tab ${tab === 'today' ? 'workspace-tab--active' : ''}`}
          onClick={() => navigate({ name: 'retailer', tab: 'today' })}
        >
          <LayoutDashboard size={17} aria-hidden /> Today
          {actionCount > 0 && <span className="unread-badge unread-badge--gold">{actionCount}</span>}
        </button>
      </div>

      {tab === 'inbox' && conversationId && <RetailerChat conversationId={conversationId} navigate={navigate} />}

      {tab === 'inbox' && !conversationId && (
        <div className="inbox">
          <div className="directory-controls">
            <div className="search-field">
              <Search size={19} aria-hidden />
              <label className="visually-hidden" htmlFor="inbox-search">
                Search conversations
              </label>
              <input
                id="inbox-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by customer, message or order ref (e.g. AMG-1001)…"
                autoComplete="off"
              />
            </div>
            <div className="chip-row" role="group" aria-label="Inbox filters">
              {(
                [
                  ['all', 'All'],
                  ['unread', 'Unread'],
                  ['orders', 'With orders'],
                  ['action', 'Needs action'],
                ] as [InboxFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`chip ${filter === value ? 'chip--active' : ''}`}
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filteredConversations.length === 0 ? (
            <EmptyState
              icon={<Inbox size={30} aria-hidden />}
              title={conversations.length === 0 ? 'No customer chats yet for this shop' : 'Nothing matches that filter'}
              description={
                conversations.length === 0
                  ? 'When a customer messages this demo shop, the conversation appears here with unread indicators. Try the Customer view to start one.'
                  : 'Clear the search or choose “All” to see every conversation for this shop.'
              }
            >
              {(query || filter !== 'all') && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    setQuery('');
                    setFilter('all');
                  }}
                >
                  Show all conversations
                </button>
              )}
            </EmptyState>
          ) : (
            <ul className="conversation-list conversation-list--full">
              {filteredConversations.map((conversation) => {
                const last = lastMessage(state, conversation.id);
                const basket = openBasketForConversation(state, conversation.id);
                const latestOrder = ordersForConversation(state, conversation.id)[0];
                const pendingChanges = (basket?.changeRequests ?? []).filter((r) => r.status === 'pending').length;
                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => navigate({ name: 'retailer', tab: 'inbox', conversationId: conversation.id })}
                    >
                      <span className="customer-avatar" aria-hidden>
                        {conversation.customerName.replace(/[^A-Z]/g, '').slice(0, 2) || 'CU'}
                      </span>
                      <span className="conversation-list__text">
                        <strong>{conversation.customerName}</strong>
                        <small>{last ? last.text || 'Photo (demo)' : 'No messages yet'}</small>
                        {pendingChanges > 0 && (
                          <small className="conversation-list__action">{pendingChanges} change request(s) to review</small>
                        )}
                        {!pendingChanges && latestOrder && (
                          <small className="conversation-list__basket">
                            {latestOrder.ref} · {isBasketOrder(latestOrder) ? 'summary in progress' : 'order in this chat'}
                          </small>
                        )}
                      </span>
                      <span className="conversation-list__meta">
                        <small>{formatRelative(conversation.lastActivityAt)}</small>
                        {conversation.unreadForShop > 0 && <span className="unread-badge">{conversation.unreadForShop}</span>}
                        {latestOrder && <StatusPill status={latestOrder.status} />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div className="orders-board">
          {orderBuckets.map((bucket) => (
            <section key={bucket.title} className="orders-bucket" aria-label={bucket.title}>
              <h2>
                {bucket.title} <span>{bucket.orders.length}</span>
              </h2>
              {bucket.orders.length === 0 ? (
                <p className="panel__empty">Nothing here right now.</p>
              ) : (
                <ul>
                  {bucket.orders.map((order) => {
                    const totals = calculateTotals(order.items, order.fulfilment, order.deliveryFee);
                    return (
                      <li key={order.id}>
                        <button
                          type="button"
                          onClick={() => navigate({ name: 'retailer', tab: 'inbox', conversationId: order.conversationId })}
                        >
                          <span>
                            <strong>
                              {order.ref} · {order.customerName}
                            </strong>
                            <small>
                              {totals.itemCount} item(s) · {formatZAR(totals.total)} · {order.fulfilment} ·{' '}
                              {formatRelative(order.updatedAt)}
                            </small>
                          </span>
                          <StatusPill status={order.status} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      {tab === 'today' && (
        <div className="today">
          <div className="stat-grid">
            <div className="stat-card">
              <span>Confirmed orders (today, demo)</span>
              <strong>{todaysOrders.length}</strong>
            </div>
            <div className="stat-card">
              <span>Goods value today (excl. delivery)</span>
              <strong>{formatZAR(todaysValue)}</strong>
            </div>
            <div className="stat-card">
              <span>Open conversations</span>
              <strong>{conversations.length}</strong>
            </div>
            <div className="stat-card stat-card--alert">
              <span>Waiting on you</span>
              <strong>{actionCount}</strong>
              <small>Unread + new orders + change requests</small>
            </div>
          </div>

          <section className="panel" aria-label="What needs attention">
            <h2>What needs attention</h2>
            {actionCount === 0 ? (
              <p className="panel__empty">All caught up — no unread chats, new orders or change requests for this shop.</p>
            ) : (
              <ul className="attention-list">
                {conversations
                  .filter((c) => c.unreadForShop > 0)
                  .map((c) => (
                    <li key={c.id}>
                      <button type="button" onClick={() => navigate({ name: 'retailer', tab: 'inbox', conversationId: c.id })}>
                        <MessagesSquare size={17} aria-hidden />
                        {c.unreadForShop} unread message(s) from {c.customerName}
                      </button>
                    </li>
                  ))}
                {shopOrders
                  .filter((o) => o.status === 'awaiting-shop')
                  .map((o) => (
                    <li key={o.id}>
                      <button type="button" onClick={() => navigate({ name: 'retailer', tab: 'inbox', conversationId: o.conversationId })}>
                        <ClipboardList size={17} aria-hidden />
                        Order {o.ref} is awaiting your acceptance
                      </button>
                    </li>
                  ))}
                {shopOrders.flatMap((o) =>
                  o.changeRequests
                    .filter((r) => r.status === 'pending')
                    .map((r) => (
                      <li key={r.id}>
                        <button type="button" onClick={() => navigate({ name: 'retailer', tab: 'inbox', conversationId: o.conversationId })}>
                          <TriangleAlert size={17} aria-hidden />
                          Change request on {o.ref}: {r.note}
                        </button>
                      </li>
                    )),
                )}
              </ul>
            )}
            <p className="panel__lede">Sample operational view for the demo — a live version would add shift handovers, staff assignment and response-time targets.</p>
          </section>
        </div>
      )}
    </div>
  );
}
