/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';

/**
 * App shell contract.
 *
 * The shell was compacted so a phone spends less of its screen on chrome. That
 * is exactly the kind of change that can silently strand a control: the reset
 * button becomes icon-only, and the role switcher becomes a scrolling row. Both
 * must stay reachable and correctly named for assistive tech, and switching
 * workspaces must still navigate.
 */
afterEach(() => {
  window.localStorage.clear();
  window.location.hash = '#/';
});

describe('app shell', () => {
  it('keeps every workspace control present and switchable', async () => {
    window.location.hash = '#/';
    render(<App />);

    const group = await screen.findByRole('group', { name: /role switcher/i });
    for (const name of [/customer/i, /shop staff/i, /delivery partner/i, /mall admin/i]) {
      expect(within(group, name)).not.toBeNull();
    }

    // Switching to Shop staff must land on the shop workspace.
    fireEvent.click(within(group, /shop staff/i));
    await waitFor(() => expect(screen.getAllByRole('button', { name: /inbox/i }).length).toBeGreaterThan(0));
  });

  it('keeps the reset control operable and named after collapsing to an icon', async () => {
    render(<App />);
    const reset = await screen.findByRole('button', { name: /reset demo data/i });
    // The visible label is wrapped so CSS can hide it; the accessible name comes
    // from aria-label, which is what a screen reader announces at any width.
    expect(reset.querySelector('.demo-bar__reset-label')?.textContent).toBe('Reset demo');

    fireEvent.click(reset);
    expect(await screen.findByRole('dialog', { name: /reset all demo data/i })).not.toBeNull();
  });

  it('marks the current navigation item for both navs', async () => {
    window.location.hash = '#/shops';
    render(<App />);
    await screen.findByText(/shops? found/i, undefined, { timeout: 3000 });

    const current = document.querySelectorAll('.nav-item[aria-current="page"]');
    // One in the desktop nav, one in the phone nav — the same item, not two
    // competing ones.
    expect(current.length).toBe(2);
    for (const item of Array.from(current)) {
      expect(item.textContent).toMatch(/shops/i);
      expect(item.className).toContain('nav-item--active');
    }
  });

  it('keeps the active icon pill identical across both navs', async () => {
    window.location.hash = '#/shops';
    render(<App />);
    await screen.findByText(/shops? found/i, undefined, { timeout: 3000 });
    const activeIcons = document.querySelectorAll('.nav-item--active .nav-item__icon');
    expect(activeIcons.length).toBe(2);
  });
});

/** Tiny scoping helper: the first element in `root` whose text matches `re`. */
function within(root: HTMLElement, re: RegExp): Element {
  const found = Array.from(root.querySelectorAll('button')).find((el) => re.test(el.textContent ?? ''));
  if (!found) throw new Error(`no control matching ${re}`);
  return found;
}
