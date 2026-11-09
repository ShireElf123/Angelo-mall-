/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Message } from '../types';
import { ChatThread } from './ChatThread';
import { DemoStoreProvider } from '../store/DemoStore';
import { ToastProvider } from './ui';
import { ChatScreen } from '../screens/customer/ChatScreen';

/**
 * Chat modernisation contract.
 *
 * A conversation is the part of this product customers will actually live in,
 * so the presentation rules that make a thread readable are pinned here:
 * consecutive messages from one speaker form a turn, a turn carries one
 * timestamp, and an order card never joins a text turn.
 *
 * jsdom cannot lay out CSS, so nothing here proves how the bubbles look.
 */
const T0 = new Date('2026-10-28T09:00:00+02:00').getTime();

function msg(id: string, sender: 'customer' | 'shop', text: string, minute: number, extra: Partial<Message> = {}): Message {
  return {
    id,
    conversationId: 'c1',
    sender,
    kind: 'text',
    text,
    createdAt: T0 + minute * 60_000,
    ...extra,
  };
}

function renderThread(messages: Message[]) {
  return render(
    <ChatThread
      perspective="customer"
      messages={messages}
      getOrder={() => undefined}
      onSend={() => {}}
      onOpenOrder={() => {}}
      composerPlaceholder="Message the shop…"
    />,
  );
}

describe('turn grouping', () => {
  it('joins consecutive messages from the same speaker into one turn', () => {
    const { container } = renderThread([
      msg('m1', 'customer', 'Hi there', 0),
      msg('m2', 'customer', 'Do you have brown bread?', 1),
      msg('m3', 'shop', 'We do!', 2),
    ]);

    // Three bubbles still render — grouping is presentation, never data.
    expect(container.querySelectorAll('.chat-bubble')).toHaveLength(3);

    const rows = Array.from(container.querySelectorAll('.chat-row'));
    expect(rows[0].className).toContain('chat-row--start');
    expect(rows[0].className).not.toContain('chat-row--end');
    // The second customer line continues the turn.
    expect(rows[1].className).toContain('chat-row--cont');
    expect(rows[1].className).toContain('chat-row--end');
    // A reply from the other side opens a new turn.
    expect(rows[2].className).toContain('chat-row--start');
    expect(rows[2].className).toContain('chat-row--end');
  });

  it('shows one timestamp per turn instead of one per bubble', () => {
    const { container } = renderThread([
      msg('m1', 'customer', 'One', 0),
      msg('m2', 'customer', 'Two', 1),
      msg('m3', 'customer', 'Three', 2),
    ]);
    // Three lines, one time: repeating it under every line is the noise that
    // made a multi-line reply look like three separate announcements.
    expect(container.querySelectorAll('.chat-bubble__meta')).toHaveLength(1);
    expect(container.querySelectorAll('.chat-bubble')).toHaveLength(3);
  });

  it('never groups an order card with the text around it', () => {
    const withCard: Message[] = [
      msg('m1', 'shop', 'Here is your summary', 0),
      { ...msg('m2', 'shop', '', 1), kind: 'order-card', orderId: 'ord-1' },
    ];
    const { container } = renderThread(withCard);
    const rows = Array.from(container.querySelectorAll('.chat-row'));
    // Both are from the shop, but a document is not a continuation of a
    // sentence, so each stands alone.
    expect(rows.every((row) => row.className.includes('chat-row--start'))).toBe(true);
  });

  it('treats a new day as a new turn', () => {
    const across: Message[] = [
      msg('m1', 'shop', 'Good evening', 0),
      { ...msg('m2', 'shop', 'Good morning again', 0), createdAt: T0 + 24 * 60 * 60_000 },
    ];
    const { container } = renderThread(across);
    const rows = Array.from(container.querySelectorAll('.chat-row'));
    expect(rows[0].className).toContain('chat-row--end');
    expect(rows[1].className).toContain('chat-row--start');
    expect(container.querySelectorAll('.chat-day').length).toBe(2);
  });
});

describe('composer', () => {
  it('keeps the device-storage disclosure visible and separates the keyboard tips', () => {
    const { container } = renderThread([msg('m1', 'shop', 'Hello', 0)]);
    const demo = container.querySelector('.composer__hint-demo');
    expect(demo?.textContent).toMatch(/stay on this device/i);
    // Keyboard shortcuts live in their own span so CSS can drop them on touch.
    const keys = container.querySelector('.composer__hint-keys');
    expect(keys?.textContent).toMatch(/Enter to send/i);
  });

  it('sends with a comfortable labelled control', () => {
    const onSend = vi.fn();
    render(
      <ChatThread
        perspective="customer"
        messages={[msg('m1', 'shop', 'Hello', 0)]}
        getOrder={() => undefined}
        onSend={onSend}
        onOpenOrder={() => {}}
        composerPlaceholder="Message the shop…"
      />,
    );
    const input = screen.getByLabelText('Type a message');
    fireEvent.change(input, { target: { value: 'Do you have milk?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(onSend).toHaveBeenCalledWith({ text: 'Do you have milk?', imageUrl: undefined, imageName: undefined });
    // The attach control keeps its explicit label for less confident users.
    expect(screen.getByRole('button', { name: /Attach a photo/ })).toBeTruthy();
  });
});

describe('conversation header', () => {
  it('states that replies are scripted instead of implying a real response time', () => {
    const { container } = render(
      <DemoStoreProvider>
        <ToastProvider>
          <ChatScreen conversationId="conv-superspar-thandi" navigate={vi.fn()} />
        </ToastProvider>
      </DemoStoreProvider>,
    );
    const subtitle = container.querySelector('.chat-header__shop small');
    expect(subtitle?.textContent).toMatch(/replies are scripted/i);
    // The shop identity stays visible at all times inside the conversation.
    expect(container.querySelector('.chat-header__shop strong')?.textContent).toBe('The Angelo SUPERSPAR');
  });
});
