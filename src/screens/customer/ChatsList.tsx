import { MessagesSquare, ReceiptText } from 'lucide-react';
import type { Route } from '../../router';
import { useDemoStore } from '../../store/DemoStore';
import {
  conversationsForCustomer,
  getShop,
  lastMessage,
  openBasketForConversation,
} from '../../store/selectors';
import { formatRelative } from '../../utils/format';
import { EmptyState, SectionHeader, ShopAvatar } from '../../components/ui';

export function ChatsListScreen({ navigate }: { navigate: (route: Route) => void }) {
  const { state } = useDemoStore();
  const conversations = conversationsForCustomer(state);

  return (
    <div className="page page--narrow">
      <SectionHeader
        title="Your chats"
        subtitle="Every order lives inside its conversation — reopen a chat any time to ask about an order. Demo customer: Thandi M."
      />

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessagesSquare size={30} aria-hidden />}
          title="No conversations yet"
          description="Open a shop and tap “Start chatting” to ask about stock, sizes or prices. Your chats will live here."
        >
          <button type="button" className="btn btn--primary" onClick={() => navigate({ name: 'shops' })}>
            Browse shops
          </button>
        </EmptyState>
      ) : (
        <ul className="conversation-list conversation-list--full">
          {conversations.map((conversation) => {
            const shop = getShop(state, conversation.shopId);
            const last = lastMessage(state, conversation.id);
            const basket = openBasketForConversation(state, conversation.id);
            if (!shop) return null;
            return (
              <li key={conversation.id}>
                <button type="button" onClick={() => navigate({ name: 'chat', conversationId: conversation.id })}>
                  <ShopAvatar shop={shop} />
                  <span className="conversation-list__text">
                    <strong>{shop.name}</strong>
                    <small>{last ? last.text || 'Photo (demo)' : 'Say hello…'}</small>
                    {basket?.status === 'awaiting-customer' && (
                      <small className="conversation-list__basket">
                        <ReceiptText size={13} aria-hidden /> Basket {basket.ref} ready to review
                      </small>
                    )}
                  </span>
                  <span className="conversation-list__meta">
                    <small>{formatRelative(conversation.lastActivityAt)}</small>
                    {conversation.unreadForCustomer > 0 && (
                      <span className="unread-badge">{conversation.unreadForCustomer}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
