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
    expect(names.slice(0, 4)).toEqual([
      'The Angelo SUPERSPAR',
      'KFC',
      'Clicks',
      'MTN @ The Angelo Mall',
    ]);
    // Eight tiles: the four chat-capable tenants plus four more from the
    // directory. No invented ranking — see the SHOP_LAUNCHER comment.
    expect(names).toHaveLength(8);
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
    // pretend to open one.
    const tops = seed.shops.find((shop) => shop.id === 'shop-tops')!;
    expect(tops.participation).toBe('real-listing');

    fireEvent.click(tileFor(container, 'TOPS at SPAR')!);
    expect(navigate).toHaveBeenLastCalledWith({ name: 'shop', shopId: 'shop-tops' });
    expect(navigate).not.toHaveBeenLastCalledWith(expect.objectContaining({ name: 'chat' }));
  });

  it('states what the tap will do, not what the shop is', () => {
    const { container } = wrap();
    const chatTile = tileFor(container, 'The Angelo SUPERSPAR')!;
    const listingTile = tileFor(container, 'TOPS at SPAR')!;

    // Both labels describe the action, and the accessible name carries the
    // destination, so the difference is audible as well as visible.
    expect(chatTile.querySelector('.shop-tile__meta')?.textContent).toBe('Sample chat');
    expect(listingTile.querySelector('.shop-tile__meta')?.textContent).toBe('View info');
    expect(chatTile.getAttribute('aria-label')).toMatch(/sample chat/i);
    expect(listingTile.getAttribute('aria-label')).toMatch(/shop information/i);
  });

  it('never claims a listing-only shop has no chat at all', () => {
    // The shop page does offer a clearly labelled scripted sample chat, so a
    // "No chat yet" label on the tile would contradict it.
    const { container } = wrap();
    const listingTile = tileFor(container, 'TOPS at SPAR')!;
    expect(listingTile.textContent).not.toMatch(/no chat/i);
  });
});

describe('the honest disclosures survive the redesign', () => {
  it('keeps the simulated-chat warning on the home screen', () => {
    const { container } = wrap();
    expect(container.textContent).toMatch(/simulated/i);
  });

  it('keeps the concept-art label on the hero art', () => {
    const { container } = wrap();
    const chip = container.querySelector('.hero__aside-chip');
    expect(chip?.textContent ?? '').toMatch(/concept art/i);
    expect(chip?.textContent ?? '').toMatch(/not a photo/i);
  });

  it('still puts a returning customer back into their chats and orders', () => {
    const { container } = wrap();
    // Seeded and active from the demo state, not a blank fixture.
    expect(container.textContent).toMatch(/Pick up where you left off/i);
    expect(container.textContent).toMatch(/Your active orders/i);
  });
});
