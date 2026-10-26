/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';
import { ChatScreen } from './ChatScreen';

function renderChat(conversationId: string) {
  return render(
    <DemoStoreProvider>
      <ToastProvider>
        <ChatScreen conversationId={conversationId} navigate={vi.fn()} />
      </ToastProvider>
    </DemoStoreProvider>,
  );
}

afterEach(() => {
  document.body.classList.remove('chat-expanded');
  document.documentElement.classList.remove('chat-expanded');
});

describe('chat state while toggling compact / expanded', () => {
  it('keeps the basket bar and review action available in both modes', () => {
    renderChat('conv-mzansi-thandi');
    const basketLabel = /Basket AMG-1001 ready/;

    expect(screen.getByText(basketLabel)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Expand chat' }));
    expect(screen.getByText(basketLabel)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /Basket AMG-1001 ready/ })).toHaveLength(1);
    const review = screen.getByRole('button', { name: /Basket AMG-1001 ready/ });
    fireEvent.click(review);
    fireEvent.click(screen.getByRole('button', { name: 'Minimise chat' }));
    expect(screen.getByText(basketLabel)).toBeTruthy();
  });

  it('keeps messages that were sent before expanding and survives a message sent while expanded', () => {
    renderChat('conv-mzansi-thandi');
    fireEvent.click(screen.getByRole('button', { name: 'Expand chat' }));
    const input = screen.getByLabelText('Type a message');
    fireEvent.change(input, { target: { value: 'Please add a loaf of brown bread.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    fireEvent.click(screen.getByRole('button', { name: 'Minimise chat' }));

    expect(screen.getByText('Please add a loaf of brown bread.')).toBeTruthy();
    expect(screen.getByText('Hi, I need bread, milk, eggs and mince.')).toBeTruthy();
    // Exactly one log node: the thread was never duplicated by the toggle.
    expect(screen.getAllByRole('log')).toHaveLength(1);
  });

  it('renders the correct shop identity when switching between shops', () => {
    const first = renderChat('conv-mzansi-thandi');
    expect(screen.getByRole('region', { name: /Chat with Mzansi Fresh Grocers/ })).toBeTruthy();
    expect(screen.getByPlaceholderText('Message Mzansi Fresh Grocers…')).toBeTruthy();
    first.unmount();

    renderChat('conv-flame-thandi');
    expect(screen.getByRole('region', { name: /Chat with Flame & Co\. Grill/ })).toBeTruthy();
    expect(screen.getByPlaceholderText('Message Flame & Co. Grill…')).toBeTruthy();
    expect(screen.queryByPlaceholderText('Message Mzansi Fresh Grocers…')).toBeNull();
  });

  it('shows the simulated-reply label after the automated demo response', async () => {
    vi.useFakeTimers();
    renderChat('conv-flame-thandi');
    fireEvent.change(screen.getByLabelText('Type a message'), { target: { value: 'What are today’s specials?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(screen.getByText(/is typing…/)).toBeTruthy();
    vi.advanceTimersByTime(1800);
    vi.useRealTimers();
    expect(await screen.findByText(/Simulated reply \(demo\)/)).toBeTruthy();
    expect(screen.getByText(/noted/i)).toBeTruthy();
  });
});
