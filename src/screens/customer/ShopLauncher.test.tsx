/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createSeedState } from '../../data/seed';
import { DemoStoreProvider } from '../../store/DemoStore';
import { HomeScreen } from './Home';

/**
 * The redesigned Home: open the app, see shops, tap a shop, start talking.
 *
 * These pin the two things the redesign exists to guarantee — that shops are
 * the first thing on the screen, and that tapping one leads somewhere honest.
 * The chat/listing distinction is asserted from the real seed data rather than
 * a fixture, so it cannot drift away from what the demo actually supports.
 *
 * jsdom has no layout, so "above the fold" is asserted as document order, and
 * DOM measurements are in the commit message, not here.
 */

const seed = createSeedState();
const wrap = () => render(<HomeScreen navigate={vi.fn()} />, { wrapper: DemoStoreProvider });

const tileFor = (container: HTMLElement, name: string | RegExp) =>
  Array.from(container.querySelectorAll<HTMLButtonElement>('.shop-tile')).find((tile) =>
    typeof name === 'string'
      ? tile.textContent?.includes(name)
      : name.test(tile.textContent ?? ''),
  );

/** The directory-only list beneath the chat grid. */
const rowFor = (container: HTMLElement, name: string | RegExp) =>
  Array.from(container.querySelectorAll<HTMLButtonElement>('.shop-row')).find((row) =>
    typeof name === 'string' ? row.textContent?.includes(name) : name.test(row.textContent ?? ''),
  );

describe('shop launcher', () => {
  it('puts the shops ahead of every supporting section', () => {
    const { container } = wrap();
    const launcher = container.querySelector('.shop-launcher');
    expect(launcher).not.toBeNull();

    const heading = (label: RegExp) =>
      Array.from(container.querySelectorAll('h2')).find((h) => label.test(h.textContent ?? ''));

    // Document order is what a screen reader and a phone scroll follow, so the
    // launcher must precede categories, featured, promos and how-it-works.
    const follows = (label: RegExp) => {
      const other = heading(label);
      expect(other, `no ${label} section`).toBeTruthy();
      return Boolean(
        launcher!.compareDocumentPosition(other!) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
    };
    expect(follows(/What do you need today/i)).toBe(true);
    expect(follows(/Featured shops/i)).toBe(true);
    expect(follows(/How chat-based ordering works/i)).toBe(true);
  });

  it('leads with SUPERSPAR, KFC, Clicks and MTN, in that order', () => {
    const { container } = wrap();
    const names = Array.from(container.querySelectorAll('.shop-tile__name')).map(
      (n) => n.textContent,
    );
    expect(names).toEqual([
      'The Angelo SUPERSPAR',
      'KFC',
      'Clicks',
      'MTN @ The Angelo Mall',
    ]);
    // Eight shops stay on Home, but in two shapes: the four chat-capable
    // tenants are cards in the grid and the four directory listings are rows
    // under their own heading. No invented ranking — see the SHOP_LAUNCHER
    // comment.
    const rows = Array.from(container.querySelectorAll('.shop-row__text strong')).map(
      (n) => n.textContent,
    );
    expect(rows).toEqual(['TOPS at SPAR', 'PEP', 'Mica', 'Golden Buffalo Spur']);
  });

  it('puts only chat-capable shops in the card grid', () => {
    const { container } = wrap();
    const cards = Array.from(container.querySelectorAll('.shop-tile'));
    expect(cards).toHaveLength(4);
    for (const card of cards) {
      // Every card promises a chat, and the seed data backs the promise.
      expect(card.querySelector('.shop-tile__meta')?.textContent).toBe('Sample chat');
      expect(card.getAttribute('aria-label')).toMatch(/sample chat/i);
    }
  });

  it('labels the directory listings as information, not as chats', () => {
    const { container } = wrap();
    const listed = container.querySelector('.shop-launcher__listed');
    expect(listed).not.toBeNull();
    expect(listed?.querySelector('h3')?.textContent).toMatch(/information only/i);
    expect(listed?.textContent).toMatch(/no Mall Go connection/i);
    // A listing is a row, never a tile, so the two outcomes never share a shape.
    expect(listed?.querySelector('.shop-tile')).toBeNull();
  });

  it('offers a way through to the whole directory', () => {
    wrap();
    expect(screen.getByRole('button', { name: /Browse all \d+ shops/i })).toBeTruthy();
  });

  it('gives every tile a square mark and a readable name', () => {
    const { container } = wrap();
    for (const tile of Array.from(container.querySelectorAll('.shop-tile'))) {
      expect(tile.querySelector('.shop-tile__mark')).not.toBeNull();
      const name = tile.querySelector('.shop-tile__name')?.textContent ?? '';
      expect(name.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('tapping a shop', () => {
  it('sends the four demo tenants straight into their conversation', async () => {
    const navigate = vi.fn();
    const { container } = render(<HomeScreen navigate={navigate} />, { wrapper: DemoStoreProvider });

    for (const name of ['The Angelo SUPERSPAR', 'KFC', 'Clicks', 'MTN @ The Angelo Mall']) {
      const tile = tileFor(container, name)!;
      expect(tile, `no tile for ${name}`).toBeTruthy();
      navigate.mockClear();
      fireEvent.click(tile);
      // openConversation is async, so the route lands a microtask later.
      // Directly to a chat route — no shop page in between.
      await waitFor(() =>
        expect(navigate).toHaveBeenLastCalledWith(
          expect.objectContaining({ name: 'chat', conversationId: expect.any(String) }),
        ),
      );
    }
  });

  it('sends a listing-only tenant to its information page instead', () => {
    const navigate = vi.fn();
    const { container } = render(<HomeScreen navigate={navigate} />, { wrapper: DemoStoreProvider });

    // TOPS at SPAR is `real-listing`: no seeded conversation, so it must not
    // pretend to open one — and it is a row in the information list, not a card.
    const tops = seed.shops.find((shop) => shop.id === 'shop-tops')!;
    expect(tops.participation).toBe('real-listing');
    expect(tileFor(container, 'TOPS at SPAR')).toBeUndefined();

    fireEvent.click(rowFor(container, 'TOPS at SPAR')!);
    expect(navigate).toHaveBeenLastCalledWith({ name: 'shop', shopId: 'shop-tops' });
    expect(navigate).not.toHaveBeenLastCalledWith(expect.objectContaining({ name: 'chat' }));
  });

  it('states what the tap will do, not what the shop is', () => {
    const { container } = wrap();
    const chatTile = tileFor(container, 'The Angelo SUPERSPAR')!;

    // Both labels describe the action, and the accessible name carries the
    // destination, so the difference is audible as well as visible.
    const listingRow = rowFor(container, 'TOPS at SPAR')!;
    expect(chatTile.querySelector('.shop-tile__meta')?.textContent).toBe('Sample chat');
    expect(listingRow.querySelector('small')?.textContent).toBe('Opens shop information');
    expect(chatTile.getAttribute('aria-label')).toMatch(/sample chat/i);
    expect(listingRow.getAttribute('aria-label')).toMatch(/shop information/i);
  });

  it('never claims a listing-only shop has no chat at all', () => {
    // The shop page does offer a clearly labelled scripted sample chat, so a
    // "No chat yet" label on the tile would contradict it.
    const { container } = wrap();
    const listingRow = rowFor(container, 'TOPS at SPAR')!;
    expect(listingRow.textContent).not.toMatch(/no chat/i);
  });
});

describe('the honest disclosures survive the redesign', () => {
  it('keeps the simulated-chat warning on the home screen', () => {
    const { container } = wrap();
    expect(container.textContent).toMatch(/simulated/i);
  });

  it('keeps the simulated-chat warning where the greening header used to be', () => {
    // Home no longer has a hero poster, so the concept-art chip moved off this
    // screen with the artwork. The disclosure that has to survive here is the
    // one about the chats and prices, and it now sits in the greeting block.
    const { container } = wrap();
    expect(container.querySelector('.home-hello__lede')?.textContent).toMatch(/simulated/i);
    expect(container.querySelector('.hero__aside-chip')).toBeNull();
  });

  it('still puts a returning customer back into their chats and orders', () => {
    const { container } = wrap();
    // Seeded and active from the demo state, not a blank fixture.
    expect(container.textContent).toMatch(/Pick up where you left off/i);
    expect(container.textContent).toMatch(/Your active orders/i);
  });
});
