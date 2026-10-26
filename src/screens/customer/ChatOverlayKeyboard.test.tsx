/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';
import { ChatScreen } from './ChatScreen';

function renderChat() {
  return render(
    <DemoStoreProvider>
      <ToastProvider>
        <ChatScreen conversationId="conv-mzansi-thandi" navigate={vi.fn()} />
      </ToastProvider>
    </DemoStoreProvider>,
  );
}

afterEach(() => {
  document.body.classList.remove('chat-expanded');
  document.documentElement.classList.remove('chat-expanded');
});

describe('ChatScreen expanded-mode keyboard handling', () => {
  it('keeps Tab focus inside the overlay and wraps from the last control', async () => {
    renderChat();
    fireEvent.click(screen.getByRole('button', { name: 'Expand chat' }));
    const panel = screen.getByRole('dialog');
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select'),
    );
    expect(focusable.length).toBeGreaterThan(1);
    const last = focusable[focusable.length - 1];
    last.focus();

    fireEvent.keyDown(window, { key: 'Tab' });

    expect(document.activeElement).toBe(focusable[0]);
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true));
  });

  it('does not intercept Tab while the chat is compact', () => {
    renderChat();
    expect(screen.queryByRole('dialog')).toBeNull();
    const input = screen.getByLabelText('Type a message');
    input.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    // No preventDefault and no focus move: the browser handles Tab normally.
    expect(document.activeElement).toBe(input);
  });
});
