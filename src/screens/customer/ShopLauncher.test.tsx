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
      expect(card.getAttribute('aria-label')).toMatch(/sample chat/i);
      // The visible caption is the shop's own fact — its category and whether
      // it is trading — not the app's status word repeated on every card.
      const meta = card.querySelector('.shop-tile__meta')?.textContent ?? '';
      expect(meta).toMatch(/Open now|Closed/);
      expect(meta).not.toMatch(/sample chat/i);
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

  it('gives every tile a brand band with a mark or signage, and a readable name', () => {
    const { container } = wrap();
    for (const tile of Array.from(container.querySelectorAll('.shop-tile'))) {
      // The band is the card's subject, not a chip beside the text: it is the
      // thing that makes eight shops read as brands rather than as inbox rows.
      const band = tile.querySelector('.shop-tile__mark');
      expect(band).not.toBeNull();
      // A mark, or the tenant's trade name — never an empty frame.
      const hasMark = band!.querySelector('img.shop-tile__logo, .shop-tile__sign-word') !== null;
      expect(hasMark).toBe(true);
      const name = tile.querySelector('.shop-tile__name')?.textContent ?? '';
      expect(name.trim().length).toBeGreaterThan(0);
    }
  });

  it('shows a directory row the tenant mark that the old square slot threw away', () => {
    const { container } = wrap();
    // PEP is a 2:1 wordmark. It was swapped for a category glyph by a rule that
    // only allowed marks up to 1.8:1 in a square slot, so four tenants with a
    // verified logo looked unbranded. A slot that is wider than it is tall is
    // what lets them show their own mark.
    const pep = rowFor(container, 'PEP')!;
    const img = pep.querySelector('img.shop-row__logo');
    expect(img).not.toBeNull();
    expect(img!.getAttribute('src')).toMatch(/brandfetch|pep/i);
    // Every row still has exactly one mark in its slot.
    for (const row of Array.from(container.querySelectorAll('.shop-row'))) {
      const slot = row.querySelector('.shop-row__mark')!;
      expect(slot.querySelectorAll('img, svg').length).toBe(1);
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
    // The card says what kind of shop it is and that it is trading; the row
    // says what kind of shop it is, and its information mark says what a tap
    // does. The action itself is also in the accessible name of both.
    expect(chatTile.querySelector('.shop-tile__meta')?.textContent).toMatch(/Groceries/);
    expect(listingRow.querySelector('small')?.textContent).toBe('Groceries');
    expect(chatTile.getAttribute('aria-label')).toMatch(/sample chat/i);
    expect(listingRow.getAttribute('aria-label')).toMatch(/shop information/i);

    // Both shapes show a real brand mark where the registry has one, rather
    // than a bare glyph: a mark is the thing a customer recognises a shop by.
    expect(chatTile.querySelector('img.shop-tile__logo')).not.toBeNull();
    expect(listingRow.querySelector('img.shop-row__logo')).not.toBeNull();
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
