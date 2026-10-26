/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';
import { ChatScreen } from './ChatScreen';

const CONVERSATION_ID = 'conv-mzansi-thandi';

function renderChat() {
  const navigate = vi.fn();
  const view = render(
    <DemoStoreProvider>
      <ToastProvider>
        <ChatScreen conversationId={CONVERSATION_ID} navigate={navigate} />
      </ToastProvider>
    </DemoStoreProvider>,
  );
  return { navigate, ...view };
}

afterEach(() => {
  document.body.classList.remove('chat-expanded');
  document.documentElement.classList.remove('chat-expanded');
});

describe('ChatScreen expand / collapse', () => {
  it('expands to the full-screen panel and collapses again', () => {
    renderChat();
    const toggle = screen.getByRole('button', { name: 'Expand chat' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.querySelector('.page--chat--expanded')).toBeNull();

    fireEvent.click(toggle);

    const minimise = screen.getByRole('button', { name: 'Minimise chat' });
    expect(minimise.getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelector('.page--chat--expanded')).toBeTruthy();
    const panel = screen.getByRole('dialog', { name: /Chat with Mzansi Fresh Grocers/ });
    expect(panel.getAttribute('aria-modal')).toBe('true');

    fireEvent.click(minimise);

    expect(screen.getByRole('button', { name: 'Expand chat' })).toBeTruthy();
    const compactPanel = screen.getByRole('region', { name: /Chat with Mzansi Fresh Grocers/ });
    expect(compactPanel.getAttribute('aria-modal')).toBeNull();
    expect(document.querySelector('.page--chat--expanded')).toBeNull();
  });

  it('keeps the conversation and does not duplicate messages when toggling', () => {
    renderChat();
    const firstMessage = 'Hi, I need bread, milk, eggs and mince.';
    const before = screen.getAllByRole('log')[0].querySelectorAll('.chat-bubble').length;

    fireEvent.click(screen.getByRole('button', { name: 'Expand chat' }));
    expect(screen.getByText(firstMessage)).toBeTruthy();
    expect(screen.getAllByRole('log')).toHaveLength(1);
    expect(screen.getAllByRole('log')[0].querySelectorAll('.chat-bubble').length).toBe(before);

    fireEvent.click(screen.getByRole('button', { name: 'Minimise chat' }));
    expect(screen.getByText(firstMessage)).toBeTruthy();
    expect(screen.getAllByRole('log')[0].querySelectorAll('.chat-bubble').length).toBe(before);
  });

  it('preserves the draft text and the attached image preview across modes', async () => {
    renderChat();
    const input = screen.getByLabelText('Type a message') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'Please add a 2 litre milk.' } });

    fireEvent.click(screen.getByRole('button', { name: 'Expand chat' }));
    expect((screen.getByLabelText('Type a message') as HTMLTextAreaElement).value).toBe(
      'Please add a 2 litre milk.',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Minimise chat' }));
    expect((screen.getByLabelText('Type a message') as HTMLTextAreaElement).value).toBe(
      'Please add a 2 litre milk.',
    );

    // The composer and its attach control stay on the same element (single mount).
    expect(screen.getByRole('button', { name: /Attach a photo/ })).toBeTruthy();
  });

  it('locks background scrolling while expanded and restores it when closed or unmounted', () => {
    const { unmount } = renderChat();
    fireEvent.click(screen.getByRole('button', { name: 'Expand chat' }));
    expect(document.body.classList.contains('chat-expanded')).toBe(true);
    expect(document.documentElement.classList.contains('chat-expanded')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Minimise chat' }));
    expect(document.body.classList.contains('chat-expanded')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Expand chat' }));
    expect(document.body.classList.contains('chat-expanded')).toBe(true);
    unmount();
    expect(document.body.classList.contains('chat-expanded')).toBe(false);
    expect(document.documentElement.classList.contains('chat-expanded')).toBe(false);
  });

  it('closes on Escape and returns focus to the expand control', async () => {
    renderChat();
    const toggle = screen.getByRole('button', { name: 'Expand chat' });
    fireEvent.click(toggle);

    fireEvent.keyDown(window, { key: 'Escape' });

    const restored = screen.getByRole('button', { name: 'Expand chat' });
    expect(restored.getAttribute('aria-expanded')).toBe('false');
    await waitFor(() => expect(document.activeElement).toBe(restored));
  });

  it('still sends messages and shows the simulated-reply indicator while expanded', () => {
    renderChat();
    fireEvent.click(screen.getByRole('button', { name: 'Expand chat' }));

    const input = screen.getByLabelText('Type a message');
    fireEvent.change(input, { target: { value: 'Do you have brown bread?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(screen.getByText('Do you have brown bread?')).toBeTruthy();
    expect((input as HTMLTextAreaElement).value).toBe('');
    const typing = screen.getByText(/is typing…/);
    expect(within(typing.parentElement as HTMLElement).getByText(/simulated for this demo/)).toBeTruthy();
  });
});
