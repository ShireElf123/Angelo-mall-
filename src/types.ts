/**
 * Angelo Mall Go — shared domain types (Phase 1 frontend).
 *
 * These shapes are deliberately API-shaped: a Phase 2 backend can return the
 * same structures without a UI rewrite. All prices are ZAR numbers (rands,
 * 2-decimal) for the demo; a production backend must validate prices
 * server-side and would typically store integer cents.
 */

export type Role = 'customer' | 'shop' | 'delivery' | 'admin';

export type CategoryId =
  | 'groceries'
  | 'food'
  | 'fashion'
  | 'electronics'
  | 'pharmacy'
  | 'homeware'
  | 'beauty'
  | 'services';

export type FulfilmentMethod = 'delivery' | 'collection';

/** Demo honesty: a listing is either a worked demo tenant or a directory example. */
export type ParticipationStatus = 'demo-partner' | 'directory-example' | 'paused';

export interface Shop {
  id: string;
  name: string;
  category: CategoryId;
  tagline: string;
  description: string;
  coverImage: string;
  initials: string;
  colour: string;
  /** Sample trading state — demo data, not live trading hours. */
  tradingNow: boolean;
  hoursLabel: string;
  fulfilment: FulfilmentMethod[];
  /** Demo delivery fee in ZAR charged to the customer for this shop. */
  deliveryFee: number;
  participation: ParticipationStatus;
  featured: boolean;
  prepTimeLabel: string;
  unitLabel: string;
}

export type MessageSender = 'customer' | 'shop' | 'system';
export type MessageKind = 'text' | 'image' | 'order-card' | 'system';

export interface MessageAttachment {
  /** Object/data URL for the demo — Phase 2 replaces this with secure uploads. */
  url: string;
  name: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  kind: MessageKind;
  text: string;
  attachment?: MessageAttachment;
  /** Set when kind === 'order-card' so the card renders live order state. */
  orderId?: string;
  /** True for automatically simulated shop replies — always labelled in the UI. */
  simulated?: boolean;
  createdAt: number;
}

export interface Conversation {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  /** General area only (e.g. "Nigel Central") — never an exact home address. */
  customerArea: string;
  unreadForCustomer: number;
  unreadForShop: number;
  createdAt: number;
  lastActivityAt: number;
}

export type OrderStatus =
  | 'draft' // shop is building the summary; customer cannot confirm yet
  | 'awaiting-customer' // summary sent; this is the customer's basket
  | 'awaiting-shop' // customer confirmed; shop must accept
  | 'accepted'
  | 'preparing'
  | 'awaiting-driver' // delivery only: ready, job published
  | 'ready-collection' // collection only
  | 'driver-assigned'
  | 'collected' // driver collected from shop (delivery only)
  | 'out-for-delivery'
  | 'delivered'
  | 'completed' // collected by customer (collection only)
  | 'cancelled';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  /** Shop-confirmed unit price (ZAR). Customers cannot edit this. */
  unitPrice: number;
  note?: string;
}

export type ChangeRequestStatus = 'pending' | 'approved' | 'declined';

export interface ChangeRequest {
  id: string;
  itemId: string;
  type: 'quantity' | 'remove';
  requestedQuantity?: number;
  note: string;
  status: ChangeRequestStatus;
  createdAt: number;
}

export interface OrderHistoryEntry {
  status: OrderStatus;
  at: number;
  note: string;
}

export interface Order {
  id: string;
  /** Human-friendly reference, e.g. AMG-1001. */
  ref: string;
  conversationId: string;
  shopId: string;
  customerId: string;
  customerName: string;
  /** General destination area shown to delivery partners before acceptance. */
  destinationArea: string;
  items: LineItem[];
  status: OrderStatus;
  fulfilment: FulfilmentMethod;
  /** Snapshot of the shop's delivery fee at confirmation time (ZAR). */
  deliveryFee: number;
  changeRequests: ChangeRequest[];
  history: OrderHistoryEntry[];
  deliveryJobId?: string;
  createdAt: number;
  updatedAt: number;
}

export type DeliveryJobStatus =
  | 'available'
  | 'accepted'
  | 'collected'
  | 'out-for-delivery'
  | 'delivered'
  | 'failed';

export interface DeliveryJob {
  id: string;
  orderId: string;
  shopId: string;
  /** General area only on public cards — see privacy note in the UI. */
  destinationArea: string;
  /** Demo payout to the driver (ZAR). */
  driverPayout: number;
  /** Supplied demo distance — never calculated from a real address. */
  distanceKm: number;
  parcelsLabel: string;
  status: DeliveryJobStatus;
  driverName?: string;
  createdAt: number;
  updatedAt: number;
}

export type PromotionPlacement = 'home-banner' | 'featured-shop' | 'directory-banner';

export interface Promotion {
  id: string;
  title: string;
  description: string;
  shopId?: string;
  image: string;
  placement: PromotionPlacement;
  /** Always render an explicit "Sponsored demo placement" label when true. */
  sponsored: boolean;
  active: boolean;
  startsAt: string;
  endsAt: string;
  /** Demo-mode counters (Phase 2: backend instrumentation + attribution). */
  impressions: number;
  clicks: number;
  conversationStarts: number;
}

export interface DemoState {
  version: number;
  role: Role;
  /** Which shop the retailer workspace is acting as (demo switcher). */
  activeShopId: string;
  shops: Shop[];
  conversations: Conversation[];
  messages: Message[];
  orders: Order[];
  deliveryJobs: DeliveryJob[];
  promotions: Promotion[];
  /** Monotonic sequence for deterministic demo ids/refs. */
  seq: number;
}

/** The single signed-in demo customer (no real accounts in Phase 1). */
export const DEMO_CUSTOMER = {
  id: 'customer-thandi',
  name: 'Thandi M.',
  area: 'Nigel Central',
} as const;

export const DEMO_DRIVER_NAME = 'Demo driver · Johan K.';
