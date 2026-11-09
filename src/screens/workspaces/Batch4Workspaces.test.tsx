/** @vitest-environment jsdom */
import { fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DemoStoreProvider } from '../../store/DemoStore';
import { ToastProvider } from '../../components/ui';
import { RetailerWorkspace } from '../retailer/RetailerWorkspace';
import { AdminWorkspace } from '../admin/AdminWorkspace';
import { createSeedState } from '../../data/seed';

/**
 * Batch 4 workspace art: the shop-staff inbox illustration and the admin
 * reporting banner. Both must stay decorative and must not displace the demo
 * disclosures that sit around them.
 */
function wrap(node: React.ReactNode) {
  return render(
    <DemoStoreProvider>
      <ToastProvider>{node}</ToastProvider>
    </DemoStoreProvider>,
  );
}

function seedNoConversations() {
  window.localStorage.setItem(
    'angelo-mall-go-demo-v1',
    JSON.stringify({ ...createSeedState(), conversations: [], messages: [] }),
  );
}

afterEach(() => window.localStorage.clear());

describe('shop-staff inbox art', () => {
  it('illustrates the empty inbox for the active shop', async () => {
    seedNoConversations();
    const { container } = wrap(<RetailerWorkspace tab="inbox" navigate={vi.fn()} />);
    await waitFor(() => expect(container.textContent).toMatch(/No customer chats yet/));
    const art = container.querySelector('img.empty-state__art') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/shop-staff-inbox.jpg');
    expect(art?.getAttribute('alt')).toBe('');
  });

  it('uses the search guidance art when a filter matches nothing', async () => {
    const { container } = wrap(<RetailerWorkspace tab="inbox" navigate={vi.fn()} />);
    const search = container.querySelector('#inbox-search') as HTMLInputElement;
    fireEvent.change(search, { target: { value: 'zzzz-no-such-customer' } });
    await waitFor(() => expect(container.textContent).toMatch(/Nothing matches that filter/));
    const art = container.querySelector('img.empty-state__art') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/search-guidance.jpg');
  });

  it('keeps the demo-convenience warning visible', () => {
    const { container } = wrap(<RetailerWorkspace tab="inbox" navigate={vi.fn()} />);
    expect(container.textContent).toMatch(/not\s+security/i);
  });
});

describe('admin reporting art', () => {
  it('adds the reporting illustration to the banner without losing the caveat', async () => {
    const { container } = wrap(<AdminWorkspace tab="reports" navigate={vi.fn()} />);
    await waitFor(() => expect(container.querySelector('.info-banner__art')).not.toBeNull());
    const art = container.querySelector('.info-banner__art') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/admin-reporting.jpg');
    expect(art?.getAttribute('alt')).toBe('');
    expect(container.textContent).toMatch(/real tenant data would replace every sample figure/i);
  });
});
