/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Message, Order } from '../types';
import { ChatThread } from './ChatThread';

const order: Order = {
  id: 'ord-1',
  ref: 'AMG-1001',
  conversationId: 'conv-1',
  shopId: 'shop-1',
  customerId: 'customer-thandi',
  customerName: 'Thandi M.',
  destinationArea: 'Nigel Central',
  items: [{ id: 'li-1', description: 'White bread loaf 700 g', quantity: 1, unitPrice: 19.99 }],
  status: 'awaiting-customer',
  fulfilment: 'delivery',
  deliveryFee: 35,
  changeRequests: [],
  history: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const messages: Message[] = [
  {
    id: 'm1',
    conversationId: 'conv-1',
    sender: 'customer',
    kind: 'text',
    text: 'Hi, I need bread, milk, eggs and mince.',
    createdAt: Date.now() - 60000,
  },
  {
    id: 'm2',
    conversationId: 'conv-1',
    sender: 'shop',
    kind: 'text',
    text: 'Certainly — 2 litres of milk noted.',
    simulated: true,
    createdAt: Date.now() - 30000,
  },
  {
    id: 'm3',
    conversationId: 'conv-1',
    sender: 'shop',
    kind: 'order-card',
    text: 'Order summary ready',
    orderId: 'ord-1',
    createdAt: Date.now(),
  },
];

describe('ChatThread', () => {
  it('renders both sides, labels simulated replies and shows the order card', () => {
    render(
      <ChatThread
        perspective="customer"
        messages={messages}
        getOrder={() => order}
        onSend={() => {}}
        onOpenOrder={() => {}}
        composerPlaceholder="Message the shop…"
      />,
    );
    expect(screen.getByText('Hi, I need bread, milk, eggs and mince.')).toBeTruthy();
    expect(screen.getByText(/Simulated reply \(demo\)/)).toBeTruthy();
    expect(screen.getByText(/Order AMG-1001/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Review basket & confirm' })).toBeTruthy();
  });

  it('sends a typed message with the send button and clears the composer', () => {
    const onSend = vi.fn();
    render(
      <ChatThread
        perspective="customer"
        messages={messages}
        getOrder={() => order}
        onSend={onSend}
        onOpenOrder={() => {}}
        composerPlaceholder="Message the shop…"
      />,
    );
    const input = screen.getByLabelText('Type a message');
    fireEvent.change(input, { target: { value: 'Please add butter too.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(onSend).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Please add butter too.' }),
    );
    expect((input as HTMLTextAreaElement).value).toBe('');
  });

  it('sends on Enter but not on Shift+Enter', () => {
    const onSend = vi.fn();
    render(
      <ChatThread
        perspective="shop"
        messages={[]}
        getOrder={() => undefined}
        onSend={onSend}
        onOpenOrder={() => {}}
        composerPlaceholder="Reply…"
      />,
    );
    const input = screen.getByLabelText('Type a message');
    fireEvent.change(input, { target: { value: 'Line one' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledTimes(1);
  });
});
