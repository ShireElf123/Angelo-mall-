/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../App';
import { ChatThread } from '../../components/ChatThread';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';
import { ChatScreen } from './ChatScreen';

const CHAT_HASH = '#/chat/conv-mzansi-thandi';

function renderAppAtChat() {
  window.location.hash = CHAT_HASH;
  return render(<App />);
}

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
  window.localStorage.clear();
  window.location.hash = '#/';
  vi.restoreAllMocks();
});

describe('defect fix: invisible attachment input is not a tab stop', () => {
  it('keeps the hidden file input out of the tab order in both chat modes', () => {
    const { container } = render(
      <ChatThread
        perspective="customer"
        messages={[]}
        getOrder={() => undefined}
        onSend={() => {}}
        onOpenOrder={() => {}}
        composerPlaceholder="Message the shop…"
      />,
    );
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();
    expect(fileInput.tabIndex).toBe(-1);
    expect(fileInput.getAttribute('aria-hidden')).toBe('true');
    // The visible, labelled control still opens the picker.
    expect(screen.getByRole('button', { name: /Attach a photo/ })).toBeTruthy();
  });

  it('leaves the labelled attach button and composer as the only composer tab stops', () => {
    renderChat();
    fireEvent.click(screen.getByRole('button', { name: 'Expand chat' }));
    const panel = screen.getByRole('dialog');
    const stops = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input:not([type="hidden"]), select',
      ),
    ).filter((node) => node.tabIndex !== -1);
    expect(stops.some((node) => node.getAttribute('type') === 'file')).toBe(false);
    expect(stops.some((node) => node.id === 'chat-composer-input')).toBe(true);
  });
});

describe('defect fix: page behind the expanded overlay is hidden from assistive tech', () => {
  it('marks and then restores the app chrome while expanded', () => {
    renderAppAtChat();
    const chrome = document.querySelector('.shell-chrome') as HTMLElement;
    const footer = document.querySelector('.app-footer') as HTMLElement;
    const bottomNav = document.querySelector('.bottom-nav') as HTMLElement;
    expect(chrome && footer && bottomNav).toBeTruthy();
    expect(chrome.hasAttribute('inert')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Expand chat' }));

    for (const node of [chrome, footer, bottomNav]) {
      expect(node.hasAttribute('inert')).toBe(true);
      expect(node.getAttribute('aria-hidden')).toBe('true');
    }

    fireEvent.click(screen.getByRole('button', { name: 'Minimise chat' }));

    for (const node of [chrome, footer, bottomNav]) {
      expect(node.hasAttribute('inert')).toBe(false);
      expect(node.hasAttribute('aria-hidden')).toBe(false);
    }
  });

  it('restores the page chrome if the chat unmounts while expanded', () => {
    const { unmount } = renderAppAtChat();
    const chrome = document.querySelector('.shell-chrome') as HTMLElement;
    fireEvent.click(screen.getByRole('button', { name: 'Expand chat' }));
    expect(chrome.hasAttribute('inert')).toBe(true);
    unmount();
    expect(chrome.hasAttribute('inert')).toBe(false);
    expect(chrome.hasAttribute('aria-hidden')).toBe(false);
  });
});

describe('defect fix: overlay follows the visual viewport when the keyboard opens', () => {
  it('sizes the panel from visualViewport and clears the override on close', async () => {
    const listeners = new Map<string, EventListener>();
    const viewport = {
      height: 844,
      width: 390,
      offsetTop: 0,
      addEventListener: (type: string, handler: EventListener) => {
        listeners.set(type, handler);
      },
      removeEventListener: (type: string) => {
        listeners.delete(type);
      },
    };
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true });

    const { container } = renderChat();
    fireEvent.click(screen.getByRole('button', { name: 'Expand chat' }));
    const frame = container.querySelector('.chat-frame') as HTMLElement;
    expect(frame.style.getPropertyValue('--chat-overlay-height')).toBe('844px');

    // Keyboard opens: the visual viewport shrinks and notifies listeners.
    viewport.height = 430;
    listeners.get('resize')?.(new Event('resize'));
    await waitFor(() => expect(frame.style.getPropertyValue('--chat-overlay-height')).toBe('430px'));

    fireEvent.click(screen.getByRole('button', { name: 'Minimise chat' }));
    expect(frame.style.getPropertyValue('--chat-overlay-height')).toBe('');
    expect(listeners.size).toBe(0);

    // @ts-expect-error test cleanup of a jsdom-only stub
    delete window.visualViewport;
  });

  it('falls back to the dvh layout when the browser has no visualViewport', () => {
    // @ts-expect-error jsdom does not implement visualViewport
    delete window.visualViewport;
    const { container } = renderChat();
    fireEvent.click(screen.getByRole('button', { name: 'Expand chat' }));
    const frame = container.querySelector('.chat-frame') as HTMLElement;
    expect(frame.style.getPropertyValue('--chat-overlay-height')).toBe('');
    expect(document.querySelector('.page--chat--expanded')).toBeTruthy();
  });
});

describe('switching shops and returning to a chat', () => {
  it('keeps the conversation history after leaving for a shop page and coming back', async () => {
    renderAppAtChat();
    fireEvent.change(screen.getByLabelText('Type a message'), {
      target: { value: 'Do you have brown bread today?' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(screen.getByText('Do you have brown bread today?')).toBeTruthy();

    // Leave the chat for the shop page, then switch to a different shop's chat.
    window.location.hash = '#/shop/shop-flame-co';
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(await screen.findByRole('heading', { level: 1, name: /Flame & Co\. Grill/ })).toBeTruthy();

    window.location.hash = '#/chat/conv-flame-thandi';
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(await screen.findByPlaceholderText('Message Flame & Co. Grill…')).toBeTruthy();

    // Return to the first conversation: the sent message is still there and the
    // composer is empty (drafts are per-mount, messages are per-store).
    window.location.hash = CHAT_HASH;
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(await screen.findByText('Do you have brown bread today?')).toBeTruthy();
    expect((screen.getByLabelText('Type a message') as HTMLTextAreaElement).value).toBe('');
  });
});
