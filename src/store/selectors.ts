/** Read-side selectors — the frontend equivalent of future API queries. */
import type { Conversation, DemoState, Message, Order, Shop } from '../types';
import { DEMO_CUSTOMER } from '../types';

export function getShop(state: DemoState, shopId: string): Shop | undefined {
  return state.shops.find((s) => s.id === shopId);
}

export function messagesForConversation(state: DemoState, conversationId: string): Message[] {
  return state.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function lastMessage(state: DemoState, conversationId: string): Message | undefined {
  const list = messagesForConversation(state, conversationId);
  return list[list.length - 1];
}

export function conversationsForCustomer(state: DemoState, customerId = DEMO_CUSTOMER.id): Conversation[] {
  return state.conversations
    .filter((c) => c.customerId === customerId)
    .sort((a, b) => b.lastActivityAt - a.lastActivityAt);
}

export function conversationsForShop(state: DemoState, shopId: string): Conversation[] {
  return state.conversations
    .filter((c) => c.shopId === shopId)
    .sort((a, b) => b.lastActivityAt - a.lastActivityAt);
}

export function conversationForShopAndCustomer(
  state: DemoState,
  shopId: string,
  customerId = DEMO_CUSTOMER.id,
): Conversation | undefined {
  return state.conversations.find((c) => c.shopId === shopId && c.customerId === customerId);
}

export function orderById(state: DemoState, orderId: string): Order | undefined {
  return state.orders.find((o) => o.id === orderId);
}

export function ordersForConversation(state: DemoState, conversationId: string): Order[] {
  return state.orders
    .filter((o) => o.conversationId === conversationId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** The open basket/draft linked to a conversation, if any. */
export function openBasketForConversation(state: DemoState, conversationId: string): Order | undefined {
  return state.orders.find(
    (o) => o.conversationId === conversationId && (o.status === 'draft' || o.status === 'awaiting-customer'),
  );
}

export function ordersForCustomer(state: DemoState, customerId = DEMO_CUSTOMER.id): Order[] {
  return state.orders
    .filter((o) => o.customerId === customerId && o.status !== 'draft')
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function ordersForShop(state: DemoState, shopId: string): Order[] {
  return state.orders.filter((o) => o.shopId === shopId).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function jobForOrder(state: DemoState, orderId: string) {
  return state.deliveryJobs
    .filter((j) => j.orderId === orderId)
    .sort((a, b) => b.createdAt - a.createdAt)[0];
}

export function activePromotions(state: DemoState, placement?: string) {
  return state.promotions.filter((p) => p.active && (!placement || p.placement === placement));
}

export function customerUnreadTotal(state: DemoState): number {
  return conversationsForCustomer(state).reduce((n, c) => n + c.unreadForCustomer, 0);
}

export function shopUnreadTotal(state: DemoState, shopId: string): number {
  return conversationsForShop(state, shopId).reduce((n, c) => n + c.unreadForShop, 0);
}
