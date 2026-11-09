/**
 * Frontend service boundary for Angelo Mall Go.
 *
 * UI components only ever call this interface. Phase 1 binds it to the local
 * mock store (synchronous reducer wrapped in Promises). Phase 2 implements
 * the same interface against a secured API — authenticated, server-authorised,
 * with real-time messaging and server-side price validation — without
 * rewriting screens.
 *
 * Never put secrets or credentials in this layer; a production implementation
 * would hold only a public API base URL and the user's session token handling
 * provided by the auth system.
 */
import type { DemoAction } from '../store/reducer';
import type { DemoState, FulfilmentMethod, LineItem, OrderStatus } from '../types';
import { conversationForShopAndCustomer, openBasketForConversation } from '../store/selectors';

export interface MarketplaceService {
  /** Ensure a conversation exists for the demo customer + shop; returns its id. */
  openConversation(shopId: string): Promise<string>;
  sendMessage(input: {
    conversationId: string;
    sender: 'customer' | 'shop';
    text: string;
    imageUrl?: string;
    imageName?: string;
    simulated?: boolean;
  }): Promise<void>;
  markRead(conversationId: string, reader: 'customer' | 'shop'): Promise<void>;
  /** Create (or return) the open order draft for a conversation. */
  ensureOrderDraft(conversationId: string): Promise<string | undefined>;
  addItem(orderId: string, item: Omit<LineItem, 'id'>): Promise<void>;
  updateItem(orderId: string, item: LineItem): Promise<void>;
  removeItem(orderId: string, itemId: string): Promise<void>;
  sendOrderSummary(orderId: string): Promise<void>;
  requestChange(input: {
    orderId: string;
    itemId: string;
    changeType: 'quantity' | 'remove';
    requestedQuantity?: number;
  }): Promise<void>;
  withdrawChange(orderId: string, requestId: string): Promise<void>;
  resolveChange(orderId: string, requestId: string, approve: boolean): Promise<void>;
  confirmOrder(orderId: string, fulfilment: FulfilmentMethod): Promise<void>;
  setOrderStatus(orderId: string, to: OrderStatus): Promise<void>;
  cancelOrder(orderId: string, by: 'customer' | 'shop'): Promise<void>;
  acceptDeliveryJob(jobId: string): Promise<void>;
  advanceDeliveryJob(jobId: string, to: 'collected' | 'out-for-delivery' | 'delivered' | 'failed'): Promise<void>;
  recordPromotionEvent(promotionId: string, event: 'impression' | 'click' | 'conversation-start'): Promise<void>;
}

/** Phase 1 mock implementation bound to the demo store. */
export function createMockMarketplaceService(
  getState: () => DemoState,
  dispatch: (action: DemoAction) => void,
): MarketplaceService {
  const now = () => Date.now();
  return {
    async openConversation(shopId) {
      dispatch({ type: 'ENSURE_CONVERSATION', shopId, now: now() });
      // The reducer is synchronous inside React state updates via the store's
      // dispatch wrapper, which mirrors getState — see DemoStore.
      const conversation = conversationForShopAndCustomer(getState(), shopId);
      if (!conversation) throw new Error('Could not open the demo conversation.');
      return conversation.id;
    },
    async sendMessage(input) {
      dispatch({ type: 'SEND_MESSAGE', ...input, now: now() });
    },
    async markRead(conversationId, reader) {
      dispatch({ type: 'MARK_READ', conversationId, reader });
    },
    async ensureOrderDraft(conversationId) {
      dispatch({ type: 'CREATE_ORDER_DRAFT', conversationId, now: now() });
      return openBasketForConversation(getState(), conversationId)?.id;
    },
    async addItem(orderId, item) {
      dispatch({ type: 'ADD_ORDER_ITEM', orderId, item, now: now() });
    },
    async updateItem(orderId, item) {
      dispatch({ type: 'UPDATE_ORDER_ITEM', orderId, item, now: now() });
    },
    async removeItem(orderId, itemId) {
      dispatch({ type: 'REMOVE_ORDER_ITEM', orderId, itemId, now: now() });
    },
    async sendOrderSummary(orderId) {
      dispatch({ type: 'SEND_ORDER_SUMMARY', orderId, now: now() });
    },
    async requestChange(input) {
      dispatch({ type: 'REQUEST_CHANGE', ...input, now: now() });
    },
    async withdrawChange(orderId, requestId) {
      dispatch({ type: 'WITHDRAW_CHANGE', orderId, requestId, now: now() });
    },
    async resolveChange(orderId, requestId, approve) {
      dispatch({ type: 'RESOLVE_CHANGE', orderId, requestId, approve, now: now() });
    },
    async confirmOrder(orderId, fulfilment) {
      dispatch({ type: 'CONFIRM_ORDER', orderId, fulfilment, now: now() });
    },
    async setOrderStatus(orderId, to) {
      dispatch({ type: 'SET_ORDER_STATUS', orderId, to, now: now() });
    },
    async cancelOrder(orderId, by) {
      dispatch({ type: 'CANCEL_ORDER', orderId, by, now: now() });
    },
    async acceptDeliveryJob(jobId) {
      dispatch({ type: 'ACCEPT_JOB', jobId, now: now() });
    },
    async advanceDeliveryJob(jobId, to) {
      dispatch({ type: 'ADVANCE_JOB', jobId, to, now: now() });
    },
    async recordPromotionEvent(promotionId, event) {
      dispatch({ type: 'PROMO_EVENT', promotionId, event });
    },
  };
}
