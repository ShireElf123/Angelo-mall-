/**
 * Pure demo-state reducer. Every workspace (customer, shop staff, delivery,
 * admin) reads and writes THIS state, which is what makes the end-to-end
 * demonstration scenario work: a status changed by the "driver" is instantly
 * the customer's timeline.
 *
 * The reducer is intentionally free of Date.now(), storage and network calls:
 * callers pass `now`, so behaviour is unit-testable. A Phase 2 backend would
 * own these transitions server-side; the shapes already match.
 */
import { createSeedState } from '../data/seed';
import type {
  ChangeRequest,
  DemoState,
  DeliveryJob,
  FulfilmentMethod,
  LineItem,
  Message,
  Order,
  OrderStatus,
  ParticipationStatus,
  Promotion,
  Role,
} from '../types';
import { DEMO_CUSTOMER, DEMO_DRIVER_NAME } from '../types';
import { canTransition, STATUS_LABELS } from '../utils/orderWorkflow';

export type DemoAction =
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'SET_ACTIVE_SHOP'; shopId: string }
  | { type: 'ENSURE_CONVERSATION'; shopId: string; now: number }
  | {
      type: 'SEND_MESSAGE';
      conversationId: string;
      sender: 'customer' | 'shop';
      text: string;
      imageUrl?: string;
      imageName?: string;
      simulated?: boolean;
      now: number;
    }
  | { type: 'MARK_READ'; conversationId: string; reader: 'customer' | 'shop' }
  | { type: 'CREATE_ORDER_DRAFT'; conversationId: string; now: number }
  | { type: 'ADD_ORDER_ITEM'; orderId: string; item: Omit<LineItem, 'id'>; now: number }
  | { type: 'UPDATE_ORDER_ITEM'; orderId: string; item: LineItem; now: number }
  | { type: 'REMOVE_ORDER_ITEM'; orderId: string; itemId: string; now: number }
  | { type: 'SEND_ORDER_SUMMARY'; orderId: string; now: number }
  | {
      type: 'REQUEST_CHANGE';
      orderId: string;
      itemId: string;
      changeType: 'quantity' | 'remove';
      requestedQuantity?: number;
      now: number;
    }
  | { type: 'WITHDRAW_CHANGE'; orderId: string; requestId: string; now: number }
  | { type: 'RESOLVE_CHANGE'; orderId: string; requestId: string; approve: boolean; now: number }
  | { type: 'CONFIRM_ORDER'; orderId: string; fulfilment: FulfilmentMethod; now: number }
  | { type: 'SET_ORDER_STATUS'; orderId: string; to: OrderStatus; now: number; distanceKm?: number }
  | { type: 'CANCEL_ORDER'; orderId: string; by: 'customer' | 'shop'; now: number }
  | { type: 'ACCEPT_JOB'; jobId: string; now: number }
  | { type: 'ADVANCE_JOB'; jobId: string; to: 'collected' | 'out-for-delivery' | 'delivered' | 'failed'; now: number }
  | { type: 'PROMO_EVENT'; promotionId: string; event: 'impression' | 'click' | 'conversation-start' }
  | { type: 'ADMIN_SET_PARTICIPATION'; shopId: string; status: ParticipationStatus }
  | { type: 'ADMIN_SET_FEATURED'; shopId: string; featured: boolean }
  | { type: 'ADMIN_SET_TRADING'; shopId: string; tradingNow: boolean }
  | { type: 'ADMIN_UPSERT_PROMOTION'; promotion: Promotion }
  | { type: 'ADMIN_DELETE_PROMOTION'; promotionId: string }
  | { type: 'ADMIN_SET_PROMO_ACTIVE'; promotionId: string; active: boolean }
  | { type: 'RESET_DEMO'; now: number };

function systemMessage(state: DemoState, conversationId: string, text: string, now: number): Message {
  return {
    id: `msg-sys-${state.seq}`,
    conversationId,
    sender: 'system',
    kind: 'system',
    text,
    createdAt: now,
  };
}

function touchConversation(
  state: DemoState,
  conversationId: string,
  now: number,
  unread?: 'customer' | 'shop',
): DemoState['conversations'] {
  return state.conversations.map((c) =>
    c.id === conversationId
      ? {
          ...c,
          lastActivityAt: now,
          unreadForCustomer: unread === 'customer' ? c.unreadForCustomer + 1 : c.unreadForCustomer,
          unreadForShop: unread === 'shop' ? c.unreadForShop + 1 : c.unreadForShop,
        }
      : c,
  );
}

function updateOrder(state: DemoState, orderId: string, patch: Partial<Order>): Order[] {
  return state.orders.map((o) => (o.id === orderId ? { ...o, ...patch } : o));
}

function withStatus(order: Order, to: OrderStatus, now: number, note: string): Order {
  return {
    ...order,
    status: to,
    updatedAt: now,
    history: [...order.history, { status: to, at: now, note }],
  };
}

function createDeliveryJob(state: DemoState, order: Order, now: number, distanceKm?: number): DeliveryJob {
  return {
    id: `job-${state.seq}`,
    orderId: order.id,
    shopId: order.shopId,
    destinationArea: order.destinationArea,
    // Demo rule only: driver payout is the delivery fee minus a sample platform portion.
    driverPayout: Math.max(18, Math.round(order.deliveryFee - 8)),
    distanceKm: distanceKm ?? 3.1,
    parcelsLabel: `${order.items.reduce((n, i) => n + i.quantity, 0)} item(s) · prepared by shop (demo)`,
    status: 'available',
    createdAt: now,
    updatedAt: now,
  };
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role };

    case 'SET_ACTIVE_SHOP':
      return { ...state, activeShopId: action.shopId };

    case 'ENSURE_CONVERSATION': {
      const existing = state.conversations.find(
        (c) => c.shopId === action.shopId && c.customerId === DEMO_CUSTOMER.id,
      );
      if (existing) return state;
      const conversationId = `conv-${action.shopId}-${state.seq}`;
      return {
        ...state,
        seq: state.seq + 1,
        conversations: [
          ...state.conversations,
          {
            id: conversationId,
            shopId: action.shopId,
            customerId: DEMO_CUSTOMER.id,
            customerName: DEMO_CUSTOMER.name,
            customerArea: DEMO_CUSTOMER.area,
            unreadForCustomer: 0,
            unreadForShop: 0,
            createdAt: action.now,
            lastActivityAt: action.now,
          },
        ],
        messages: [
          ...state.messages,
          {
            id: `msg-welcome-${state.seq}`,
            conversationId,
            sender: 'system',
            kind: 'system',
            text: 'Demo conversation started. Messages here stay on this device — no real shop is connected in Phase 1.',
            createdAt: action.now,
          },
        ],
      };
    }

    case 'SEND_MESSAGE': {
      const message: Message = {
        id: `msg-${state.seq}`,
        conversationId: action.conversationId,
        sender: action.sender,
        kind: action.imageUrl ? 'image' : 'text',
        text: action.text,
        attachment: action.imageUrl ? { url: action.imageUrl, name: action.imageName ?? 'Photo (demo)' } : undefined,
        simulated: action.simulated,
        createdAt: action.now,
      };
      return {
        ...state,
        seq: state.seq + 1,
        messages: [...state.messages, message],
        conversations: touchConversation(
          state,
          action.conversationId,
          action.now,
          action.sender === 'customer' ? 'shop' : 'customer',
        ),
      };
    }

    case 'MARK_READ':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? {
                ...c,
                unreadForCustomer: action.reader === 'customer' ? 0 : c.unreadForCustomer,
                unreadForShop: action.reader === 'shop' ? 0 : c.unreadForShop,
              }
            : c,
        ),
      };

    case 'CREATE_ORDER_DRAFT': {
      const conversation = state.conversations.find((c) => c.id === action.conversationId);
      if (!conversation) return state;
      const open = state.orders.find(
        (o) =>
          o.conversationId === action.conversationId &&
          (o.status === 'draft' || o.status === 'awaiting-customer'),
      );
      if (open) return state;
      const shop = state.shops.find((s) => s.id === conversation.shopId);
      const order: Order = {
        id: `ord-${state.seq}`,
        ref: `AMG-${state.seq}`,
        conversationId: conversation.id,
        shopId: conversation.shopId,
        customerId: conversation.customerId,
        customerName: conversation.customerName,
        destinationArea: conversation.customerArea,
        items: [],
        status: 'draft',
        fulfilment: shop?.fulfilment[0] ?? 'collection',
        deliveryFee: shop?.deliveryFee ?? 0,
        changeRequests: [],
        history: [{ status: 'draft', at: action.now, note: 'Shop started an order summary (demo).' }],
        createdAt: action.now,
        updatedAt: action.now,
      };
      return { ...state, seq: state.seq + 1, orders: [...state.orders, order] };
    }

    case 'ADD_ORDER_ITEM':
    case 'UPDATE_ORDER_ITEM':
    case 'REMOVE_ORDER_ITEM': {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order || (order.status !== 'draft' && order.status !== 'awaiting-customer')) return state;
      let items: LineItem[];
      let seq = state.seq;
      if (action.type === 'ADD_ORDER_ITEM') {
        items = [...order.items, { ...action.item, id: `li-${state.seq}` }];
        seq += 1;
      } else if (action.type === 'UPDATE_ORDER_ITEM') {
        items = order.items.map((i) => (i.id === action.item.id ? action.item : i));
      } else {
        items = order.items.filter((i) => i.id !== action.itemId);
      }
      const next: DemoState = {
        ...state,
        seq,
        orders: updateOrder(state, order.id, { items, updatedAt: action.now }),
      };
      // The customer's basket is live: tell them in-chat when a sent summary changes.
      if (order.status === 'awaiting-customer') {
        next.messages = [
          ...next.messages,
          systemMessage(next, order.conversationId, `The shop updated order summary ${order.ref} (demo). Please review before confirming.`, action.now),
        ];
        next.seq += 1;
        next.conversations = touchConversation(next, order.conversationId, action.now, 'customer');
      }
      return next;
    }

    case 'SEND_ORDER_SUMMARY': {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order || order.status !== 'draft' || order.items.length === 0) return state;
      const updated = withStatus(order, 'awaiting-customer', action.now, 'Shop sent the order summary (demo).');
      const card: Message = {
        id: `msg-card-${state.seq}`,
        conversationId: order.conversationId,
        sender: 'shop',
        kind: 'order-card',
        text: 'Order summary ready for your review (demo prices).',
        orderId: order.id,
        createdAt: action.now,
      };
      return {
        ...state,
        seq: state.seq + 1,
        orders: state.orders.map((o) => (o.id === order.id ? updated : o)),
        messages: [...state.messages, card],
        conversations: touchConversation(state, order.conversationId, action.now, 'customer'),
      };
    }

    case 'REQUEST_CHANGE': {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order || order.status !== 'awaiting-customer') return state;
      const item = order.items.find((i) => i.id === action.itemId);
      if (!item) return state;
      const alreadyPending = order.changeRequests.some(
        (r) => r.itemId === action.itemId && r.status === 'pending',
      );
      if (alreadyPending) return state;
      const request: ChangeRequest = {
        id: `chg-${state.seq}`,
        itemId: action.itemId,
        type: action.changeType,
        requestedQuantity: action.requestedQuantity,
        note:
          action.changeType === 'remove'
            ? `Customer asked to remove “${item.description}”.`
            : `Customer asked for ${action.requestedQuantity} × “${item.description}” (currently ${item.quantity}).`,
        status: 'pending',
        createdAt: action.now,
      };
      const next: DemoState = {
        ...state,
        seq: state.seq + 1,
        orders: updateOrder(state, order.id, {
          changeRequests: [...order.changeRequests, request],
          updatedAt: action.now,
        }),
      };
      next.messages = [
        ...next.messages,
        {
          id: `msg-chg-${next.seq}`,
          conversationId: order.conversationId,
          sender: 'customer',
          kind: 'text',
          text:
            action.changeType === 'remove'
              ? `Please can you remove the ${item.description} from my order? (change request — needs shop approval)`
              : `Please can I change the ${item.description} to ${action.requestedQuantity}? (change request — needs shop approval)`,
          createdAt: action.now,
        },
      ];
      next.seq += 1;
      next.conversations = touchConversation(next, order.conversationId, action.now, 'shop');
      return next;
    }

    case 'WITHDRAW_CHANGE': {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order) return state;
      return {
        ...state,
        orders: updateOrder(state, order.id, {
          changeRequests: order.changeRequests.filter(
            (r) => !(r.id === action.requestId && r.status === 'pending'),
          ),
          updatedAt: action.now,
        }),
      };
    }

    case 'RESOLVE_CHANGE': {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order) return state;
      const request = order.changeRequests.find((r) => r.id === action.requestId && r.status === 'pending');
      if (!request) return state;
      let items = order.items;
      if (action.approve) {
        items =
          request.type === 'remove'
            ? order.items.filter((i) => i.id !== request.itemId)
            : order.items.map((i) =>
                i.id === request.itemId ? { ...i, quantity: request.requestedQuantity ?? i.quantity } : i,
              );
      }
      const next: DemoState = {
        ...state,
        orders: updateOrder(state, order.id, {
          items,
          changeRequests: order.changeRequests.map((r) =>
            r.id === request.id ? { ...r, status: action.approve ? 'approved' : 'declined' } : r,
          ),
          updatedAt: action.now,
        }),
      };
      next.messages = [
        ...next.messages,
        systemMessage(
          next,
          order.conversationId,
          action.approve
            ? `Shop approved your change request for ${order.ref} (demo). The basket has been updated.`
            : `Shop could not approve that change for ${order.ref} (demo). Chat to them about an alternative.`,
          action.now,
        ),
      ];
      next.seq += 1;
      next.conversations = touchConversation(next, order.conversationId, action.now, 'customer');
      return next;
    }

    case 'CONFIRM_ORDER': {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order || order.status !== 'awaiting-customer' || order.items.length === 0) return state;
      if (order.changeRequests.some((r) => r.status === 'pending')) return state;
      const shop = state.shops.find((s) => s.id === order.shopId);
      const confirmed: Order = {
        ...withStatus(order, 'awaiting-shop', action.now, 'Customer confirmed the demo order.'),
        fulfilment: action.fulfilment,
        deliveryFee: shop?.deliveryFee ?? order.deliveryFee,
      };
      const next: DemoState = {
        ...state,
        orders: state.orders.map((o) => (o.id === order.id ? confirmed : o)),
      };
      next.messages = [
        ...next.messages,
        systemMessage(
          next,
          order.conversationId,
          `Demo order ${order.ref} confirmed · ${action.fulfilment === 'delivery' ? 'Delivery' : 'Collection'}. Awaiting shop acceptance. No payment has been taken — this is a prototype.`,
          action.now,
        ),
      ];
      next.seq += 1;
      next.conversations = touchConversation(next, order.conversationId, action.now, 'shop');
      return next;
    }

    case 'SET_ORDER_STATUS': {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order || !canTransition(order, action.to)) return state;
      let next: DemoState = {
        ...state,
        orders: state.orders.map((o) =>
          o.id === order.id ? withStatus(o, action.to, action.now, `${STATUS_LABELS[action.to]} (demo).`) : o,
        ),
      };
      if (action.to === 'awaiting-driver') {
        const job = createDeliveryJob(next, { ...order, status: action.to }, action.now, action.distanceKm);
        next = {
          ...next,
          seq: next.seq + 1,
          deliveryJobs: [...next.deliveryJobs, job],
          orders: updateOrder(next, order.id, { deliveryJobId: job.id }),
        };
      }
      next.messages = [
        ...next.messages,
        systemMessage(next, order.conversationId, `Demo order ${order.ref}: ${STATUS_LABELS[action.to]}.`, action.now),
      ];
      next.seq += 1;
      next.conversations = touchConversation(next, order.conversationId, action.now, 'customer');
      return next;
    }

    case 'CANCEL_ORDER': {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order || !canTransition(order, 'cancelled')) return state;
      const next: DemoState = {
        ...state,
        orders: state.orders.map((o) =>
          o.id === order.id
            ? withStatus(o, 'cancelled', action.now, `Cancelled by ${action.by} (demo).`)
            : o,
        ),
        deliveryJobs: state.deliveryJobs.map((j) =>
          j.orderId === order.id && !['delivered', 'failed'].includes(j.status)
            ? { ...j, status: 'failed' as const, updatedAt: action.now }
            : j,
        ),
      };
      next.messages = [
        ...next.messages,
        systemMessage(
          next,
          order.conversationId,
          `Demo order ${order.ref} was cancelled by the ${action.by === 'shop' ? 'shop' : 'customer'}. No payment was involved.`,
          action.now,
        ),
      ];
      next.seq += 1;
      next.conversations = touchConversation(
        next,
        order.conversationId,
        action.now,
        action.by === 'shop' ? 'customer' : 'shop',
      );
      return next;
    }

    case 'ACCEPT_JOB': {
      const job = state.deliveryJobs.find((j) => j.id === action.jobId);
      if (!job || job.status !== 'available') return state;
      const order = state.orders.find((o) => o.id === job.orderId);
      if (!order || order.status !== 'awaiting-driver') return state;
      const next: DemoState = {
        ...state,
        deliveryJobs: state.deliveryJobs.map((j) =>
          j.id === job.id
            ? { ...j, status: 'accepted' as const, driverName: DEMO_DRIVER_NAME, updatedAt: action.now }
            : j,
        ),
        orders: state.orders.map((o) =>
          o.id === order.id ? withStatus(o, 'driver-assigned', action.now, 'Demo driver accepted the job.') : o,
        ),
      };
      next.messages = [
        ...next.messages,
        systemMessage(next, order.conversationId, `A demo delivery partner accepted order ${order.ref} and is heading to the shop.`, action.now),
      ];
      next.seq += 1;
      next.conversations = touchConversation(next, order.conversationId, action.now, 'customer');
      return next;
    }

    case 'ADVANCE_JOB': {
      const job = state.deliveryJobs.find((j) => j.id === action.jobId);
      if (!job) return state;
      const order = state.orders.find((o) => o.id === job.orderId);
      if (!order) return state;
      const allowed: Record<string, string[]> = {
        accepted: ['collected', 'failed'],
        collected: ['out-for-delivery', 'failed'],
        'out-for-delivery': ['delivered', 'failed'],
      };
      if (!(allowed[job.status] ?? []).includes(action.to)) return state;

      let next: DemoState = {
        ...state,
        deliveryJobs: state.deliveryJobs.map((j) =>
          j.id === job.id ? { ...j, status: action.to, updatedAt: action.now } : j,
        ),
      };

      if (action.to === 'failed') {
        // Realistic demo behaviour: the order goes back out to other partners.
        const replacement = createDeliveryJob(next, order, action.now, job.distanceKm);
        next = {
          ...next,
          seq: next.seq + 1,
          deliveryJobs: [...next.deliveryJobs, replacement],
          orders: next.orders.map((o) =>
            o.id === order.id
              ? { ...withStatus(o, 'awaiting-driver', action.now, 'Delivery could not be completed — job re-published (demo).'), deliveryJobId: replacement.id }
              : o,
          ),
        };
        next.messages = [
          ...next.messages,
          systemMessage(next, order.conversationId, `Delivery for ${order.ref} could not be completed (demo). The shop has re-published the delivery job.`, action.now),
        ];
      } else {
        const orderStatus: OrderStatus =
          action.to === 'collected' ? 'collected' : action.to === 'out-for-delivery' ? 'out-for-delivery' : 'delivered';
        next.orders = next.orders.map((o) =>
          o.id === order.id ? withStatus(o, orderStatus, action.now, `${STATUS_LABELS[orderStatus]} (demo).`) : o,
        );
        next.messages = [
          ...next.messages,
          systemMessage(next, order.conversationId, `Demo order ${order.ref}: ${STATUS_LABELS[orderStatus]}.`, action.now),
        ];
      }
      next.seq += 1;
      next.conversations = touchConversation(next, order.conversationId, action.now, 'customer');
      return next;
    }

    case 'PROMO_EVENT':
      return {
        ...state,
        promotions: state.promotions.map((p) =>
          p.id === action.promotionId
            ? {
                ...p,
                impressions: p.impressions + (action.event === 'impression' ? 1 : 0),
                clicks: p.clicks + (action.event === 'click' ? 1 : 0),
                conversationStarts: p.conversationStarts + (action.event === 'conversation-start' ? 1 : 0),
              }
            : p,
        ),
      };

    case 'ADMIN_SET_PARTICIPATION':
      return {
        ...state,
        shops: state.shops.map((s) => (s.id === action.shopId ? { ...s, participation: action.status } : s)),
      };

    case 'ADMIN_SET_FEATURED':
      return {
        ...state,
        shops: state.shops.map((s) => (s.id === action.shopId ? { ...s, featured: action.featured } : s)),
      };

    case 'ADMIN_SET_TRADING':
      return {
        ...state,
        shops: state.shops.map((s) => (s.id === action.shopId ? { ...s, tradingNow: action.tradingNow } : s)),
      };

    case 'ADMIN_UPSERT_PROMOTION': {
      const exists = state.promotions.some((p) => p.id === action.promotion.id);
      return {
        ...state,
        seq: exists ? state.seq : state.seq + 1,
        promotions: exists
          ? state.promotions.map((p) => (p.id === action.promotion.id ? action.promotion : p))
          : [...state.promotions, action.promotion],
      };
    }

    case 'ADMIN_DELETE_PROMOTION':
      return { ...state, promotions: state.promotions.filter((p) => p.id !== action.promotionId) };

    case 'ADMIN_SET_PROMO_ACTIVE':
      return {
        ...state,
        promotions: state.promotions.map((p) =>
          p.id === action.promotionId ? { ...p, active: action.active } : p,
        ),
      };

    case 'RESET_DEMO': {
      const fresh = createSeedState(action.now);
      return { ...fresh, role: state.role, activeShopId: fresh.activeShopId };
    }

    default:
      return state;
  }
}
