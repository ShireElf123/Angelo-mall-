/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createSeedState } from '../../data/seed';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';
import { ChatScreen, demoReplyFor } from './ChatScreen';
import { ShopPageScreen } from './ShopPage';

/**
 * Chat honesty per tenant.
 *
 * Four tenants (SUPERSPAR, KFC, Clicks, MTN) carry a scripted journey. The other
 * twenty-five are directory listings with no Mall Go connection. Opening a
 * listing's thread must never read as though someone at the counter were
 * answering and building an order — that was the defect these tests pin: the
 * generic staff-voice reply ("We can arrange local delivery…") was produced for
 * every tenant, and listing-only threads showed no notice at all.
 */

const seed = createSeedState();
const wrap = (ui: React.ReactElement) =>
  render(
    <DemoStoreProvider>
      <ToastProvider>{ui}</ToastProvider>
    </DemoStoreProvider>,
  );

// A listing-only tenant that has no seeded conversation, so its thread is
// created by the test rather than loaded from demo data.
const LISTING_ID = 'shop-maxis';
const DEMO_CONVERSATION = 'conv-superspar-thandi';

describe('listing-only tenants', () => {
  it('is genuinely a listing, so the rest of this suite is meaningful', () => {
    expect(seed.shops.find((s) => s.id === LISTING_ID)?.participation).toBe('real-listing');
    expect(seed.conversations.some((c) => c.shopId === LISTING_ID)).toBe(false);
  });

  it('says chat is not enabled, on the shop page', () => {
    const shop = seed.shops.find((s) => s.id === LISTING_ID)!;
    wrap(<ShopPageScreen shopId={LISTING_ID} navigate={vi.fn()} />);
    const body = document.body.textContent ?? '';
    expect(body).toMatch(/chat not enabled/i);
    expect(body).toContain(shop.name);
    // And it must not offer a "sample chat" as though the shop were reachable.
    expect(body).not.toMatch(/try the sample chat/i);
  });

  it('still offers the demo thread, labelled as not connected', () => {
    wrap(<ShopPageScreen shopId={LISTING_ID} navigate={vi.fn()} />);
    expect(screen.getByRole('button', { name: /chat not enabled yet/i })).toBeTruthy();
    // The disclosure travels with the action.
    expect(document.body.textContent).toMatch(/no Mall Go connection/i);
    expect(document.body.textContent).toMatch(/not the shop/i);
  });

  it('answers in the app voice, never in the shop voice', () => {
    // Every branch of the generic staff reply must be unreachable for a listing.
    const questions = [
      'how much is this?',
      'can you deliver it?',
      'do you have stock?',
      'thanks!',
      'hello there',
    ];
    for (const text of questions) {
      const reply = demoReplyFor({ chatEnabled: false, shopName: 'Maxi\'s', text });
      // It must name the shop as NOT connected, and never speak as the shop.
      expect(reply).toMatch(/not connected to Mall Go/i);
      expect(reply).toMatch(/automated demo message/i);
      expect(reply).not.toMatch(/\bwe\b/i);
      expect(reply).not.toMatch(/I'll|I’ll/);
      expect(reply).not.toMatch(/your order summary/i);
    }
  });

  it('opens the thread so the state is still demonstrable', async () => {
    const navigate = vi.fn();
    wrap(<ShopPageScreen shopId={LISTING_ID} navigate={navigate} />);
    fireEvent.click(screen.getByRole('button', { name: /chat not enabled yet/i }));
    // openConversation is async.
    await waitFor(() => expect(navigate).toHaveBeenCalled());
    const route = navigate.mock.calls.at(-1)![0] as { name: string };
    expect(route.name).toBe('chat');
  });
});

describe('demo-scenario tenants keep their scripted journey', () => {
  it('shows the simulated-chat notice on SUPERSPAR', () => {
    wrap(<ChatScreen conversationId={DEMO_CONVERSATION} navigate={vi.fn()} />);
    expect(document.body.textContent).toMatch(/Simulated chat/i);
    expect(document.body.textContent).toMatch(/no Mall Go account/i);
    // No listing-only warning on a demo tenant.
    expect(document.body.textContent).not.toMatch(/Chat is not enabled for/i);
  });

  it('keeps the scripted staff replies for demo tenants', () => {
    // The four demo shops genuinely run a scripted journey, so their thread
    // answers as the shop, clearly marked simulated.
    const reply = demoReplyFor({ chatEnabled: true, shopName: 'The Angelo SUPERSPAR', text: 'can you deliver?' });
    expect(reply).toMatch(/delivery|collection/i);
    expect(reply).not.toMatch(/not connected/i);
  });

  it('still greets the customer with the shop, and a send control', () => {
    wrap(<ChatScreen conversationId={DEMO_CONVERSATION} navigate={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Message The Angelo SUPERSPAR/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /send/i })).toBeTruthy();
  });
});
