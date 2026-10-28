/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';
import { HomeScreen } from './Home';
import { DirectoryScreen } from './Directory';

/**
 * Bundle 3 — customer experience composition.
 *
 * These pin the *structure* of the redesign rather than its pixels: that Home
 * opens on one art-directed panel and then answers "where was I", "what do I
 * need" and "what is this" in that order; that the directory's search lives
 * inside the discovery card; and that the artwork is still labelled honestly.
 *
 * jsdom cannot lay out CSS, so nothing here proves what the screens look like.
 * Rendered appearance is unverified in this environment and is reported as
 * such.
 */
function wrap(node: ReactNode) {
  return render(
    <DemoStoreProvider>
      <ToastProvider>{node}</ToastProvider>
    </DemoStoreProvider>,
  );
}

const text = (container: HTMLElement) => container.textContent ?? '';

/** True when `a` comes before `b` in document order. */
const precedes = (a: Node, b: Node) =>
  Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

afterEach(() => {
  window.localStorage.clear();
});

describe('Home — composition', () => {
  it('opens on a hero that keeps one page title and one way in', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    const headings = container.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent ?? '').toMatch(/Chat to mall shops/i);

    // The artwork sits in its own panel beside/below the copy instead of
    // underneath it, so the words never depend on a scrim for contrast.
    const aside = container.querySelector('.hero__aside');
    expect(aside).not.toBeNull();
    const art = aside?.querySelector('img');
    expect(art?.getAttribute('alt')).toBe('');
    expect(container.querySelector('.hero__shade')).toBeNull();

    // Exactly one prominent entry into the directory.
    const browse = screen.getByRole('button', { name: /Browse all \d+ shops/i });
    expect(browse).toBeTruthy();
  });

  it('labels the hero artwork as concept art, never as a photograph', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    // The authored hero image is generated art (manifest kind
    // "generated-previous-phase"), so it must say so — the one thing it must
    // never do is imply it is a photo of this mall.
    const chip = container.querySelector('.hero__aside-chip');
    expect(chip).not.toBeNull();
    expect(chip?.textContent ?? '').toMatch(/concept art/i);
    expect(chip?.textContent ?? '').toMatch(/not a photo/i);
  });

  it('still searches from the hero', () => {
    const navigate = vi.fn();
    const { container } = wrap(<HomeScreen navigate={navigate} />);
    const input = container.querySelector('#home-search') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'kfc' } });
    fireEvent.submit(container.querySelector('form.hero__search') as HTMLFormElement);
    expect(navigate).toHaveBeenCalledWith({ name: 'shops', q: 'kfc' });
  });

  it('turns the nine categories into one rail of tappable tiles', () => {
    const navigate = vi.fn();
    const { container } = wrap(<HomeScreen navigate={navigate} />);
    const tiles = container.querySelectorAll('.category-tile');
    expect(tiles).toHaveLength(9);
    for (const tile of Array.from(tiles)) {
      const img = tile.querySelector('img') as HTMLImageElement | null;
      // Decorative: the label is the accessible name.
      expect(img?.getAttribute('alt')).toBe('');
      expect(tile.querySelector('strong')?.textContent?.trim().length).toBeGreaterThan(0);
    }
    fireEvent.click(tiles[2]);
    expect(navigate).toHaveBeenCalledWith({ name: 'shops', category: 'fashion' });
  });

  it('offers the scripted walkthrough as a labelled, data-backed panel', () => {
    const navigate = vi.fn();
    const { container } = wrap(<HomeScreen navigate={navigate} />);
    const spotlight = container.querySelector('.spotlight');
    expect(spotlight).not.toBeNull();
    // The panel exists to show the worked example, not to imply a promotion.
    expect(spotlight?.textContent ?? '').toMatch(/Simulated · demo prices/);
    expect(spotlight?.textContent ?? '').toMatch(/scripted/i);
    expect(spotlight?.querySelector('.spotlight__chip')?.textContent).toBe('Concept art');

    const open = screen.getByRole('button', { name: /Open the walkthrough/i });
    fireEvent.click(open);
    // SUPERSPAR carries the seeded basket, so it is the honest first stop.
    expect(navigate).toHaveBeenCalledWith({ name: 'shop', shopId: 'shop-superspar' });
  });

  it('puts the shopper back into their own chats before asking what they need', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    const heading = (label: RegExp) =>
      Array.from(container.querySelectorAll('h2')).find((h) => label.test(h.textContent ?? '')) as
        | HTMLHeadingElement
        | undefined;
    const continueHeading = heading(/Pick up where you left off/i);
    const categoryHeading = heading(/What do you need today/i);
    expect(continueHeading, 'no continuation block').toBeTruthy();
    expect(categoryHeading, 'no category block').toBeTruthy();
    expect(
      precedes(continueHeading!, categoryHeading!),
      'a returning shopper should see their chats before the category rail',
    ).toBe(true);
  });

  it('shows the five featured tenants in the Home rail', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    const rail = container.querySelector('.shop-grid--rail');
    expect(rail).not.toBeNull();
    expect(rail?.querySelectorAll('.shop-card').length).toBe(5);
  });

  it('invents no ratings, reviews, discounts or live availability', () => {
    const { container } = wrap(<HomeScreen navigate={vi.fn()} />);
    const copy = text(container);
    // The demo may say prices are simulated; it may never imply social proof or
    // a live offer it cannot support.
    // "ready for your review" is honest copy about an order summary, so the
    // guard is against *social proof*, not the word "review".
    expect(copy).not.toMatch(/\bstar rating\b/i);
    expect(copy).not.toMatch(/\bcustomer reviews?\b/i);
    expect(copy).not.toMatch(/\bout of 5\b/i);
    expect(copy).not.toMatch(/★/);
    expect(copy).not.toMatch(/\d+\s*%\s*off/i);
    // "no discount ... belongs to any real shop" is the promo's disclaimer, so
    // the word itself is allowed; an actual price-cut claim is not.
    expect(copy).not.toMatch(/(save|was)\s+R\s?\d/i);
    expect(copy).not.toMatch(/\bbestselling\b/i);
    // ...and the honesty it does carry stays put.
    expect(copy).toMatch(/simulated/i);
    expect(copy).toMatch(/no shop in this demo has product photographs/i);
  });
});

describe('Directory — composition', () => {
  async function renderDirectory() {
    const utils = wrap(<DirectoryScreen navigate={vi.fn()} />);
    await screen.findByText(/shops? found/i, undefined, { timeout: 3000 });
    return utils;
  }

  it('gives the title, search and filters one discovery surface', async () => {
    const { container } = await renderDirectory();
    const head = container.querySelector('.directory-head');
    expect(head).not.toBeNull();
    const search = screen.getByLabelText(/search shops/i);
    expect(head?.contains(search), 'search escaped the discovery card').toBe(true);
    const h1 = container.querySelector('h1');
    expect(head?.contains(h1!)).toBe(true);
    expect(h1?.textContent).toMatch(/Shop directory/i);
    // Filters belong to the same object as the search they modify.
    expect(head?.querySelector('[aria-label="Filter by category"]')).not.toBeNull();
    expect(head?.querySelector('[aria-label="Filter by fulfilment"]')).not.toBeNull();
  });

  it('leads each card with the category, then the names, then the action', async () => {
    const { container } = await renderDirectory();
    const card = container.querySelector('.shop-card') as HTMLElement;
    const category = card.querySelector('.shop-card__category') as HTMLElement;
    const brand = card.querySelector('.shop-card__brand') as HTMLElement;
    expect(precedes(category, brand), 'category should be read before the wordmark').toBe(true);
    // The action was a quiet hairline row when this test was written; the owner
    // has reversed that, so it asserts the prominent primary pill instead. The
    // ordering claim it is really about — category, then identity, then action —
    // is unchanged.
    const cta = card.querySelector('.shop-card__cta') as HTMLElement;
    expect(cta, 'card action is not the primary pill').not.toBeNull();
    expect(cta.className).toContain('btn--primary');
    expect(precedes(brand, cta), 'the action should follow the wordmark').toBe(true);
    expect(cta.textContent ?? '').toMatch(/Open shop/i);
  });

  it('keeps the payoff above the promo placement', async () => {
    const { container } = await renderDirectory();
    const grid = container.querySelector('.shop-grid') as HTMLElement;
    const promo = container.querySelector('.promo-banner') as HTMLElement | null;
    if (promo) {
      // Placements come after the listings, never between the search and them.
      expect(precedes(grid, promo), 'the promo should follow the results').toBe(true);
    }
    // The required disclosures still sit above the results.
    const disclosure = container.querySelector('.listing-disclosure') as HTMLElement;
    expect(precedes(disclosure, grid)).toBe(true);
  });

  it('offers a reset only once a filter is doing something', async () => {
    const { container } = await renderDirectory();
    const before = container.querySelectorAll('.shop-card').length;
    expect(screen.queryByRole('button', { name: /^reset$/i })).toBeNull();

    fireEvent.change(screen.getByLabelText(/search shops/i), { target: { value: 'clicks' } });
    await waitFor(() => expect(container.querySelectorAll('.shop-card').length).toBeLessThan(before));

    fireEvent.click(screen.getByRole('button', { name: /^reset$/i }));
    await waitFor(() => expect(container.querySelectorAll('.shop-card').length).toBe(before));
    expect(screen.queryByRole('button', { name: /^reset$/i })).toBeNull();
  });
});
