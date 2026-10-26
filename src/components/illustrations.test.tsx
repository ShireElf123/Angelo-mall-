/** @vitest-environment jsdom */
/**
 * The illustrated empty state and info banner are shared primitives. Batch 2
 * added artwork to nine screens through them, so the contract they rely on
 * (decorative image, no alt noise, stable classes for layout) is tested here.
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState, InfoBanner } from './ui';
import { imageSrc } from '../data/imageAssets';

describe('illustrated empty state', () => {
  it('renders the illustration as decorative so screen readers skip it', () => {
    const { container } = render(
      <EmptyState
        illustration={imageSrc('state-empty-orders')}
        title="No orders yet"
        description="Confirmed baskets appear here."
      />,
    );
    const art = container.querySelector('img.empty-state__art') as HTMLImageElement | null;
    expect(art).not.toBeNull();
    expect(art?.getAttribute('src')).toBe('/images/state-empty-orders.jpg');
    expect(art?.getAttribute('alt')).toBe('');
    expect(art?.getAttribute('aria-hidden')).toBe('true');
    expect(art?.getAttribute('loading')).toBe('lazy');
    // The heading still carries the meaning.
    expect(container.querySelector('h3')?.textContent).toBe('No orders yet');
  });

  it('still renders without art when no illustration is supplied', () => {
    const { container } = render(<EmptyState title="Nothing here" description="Try another filter." />);
    expect(container.querySelector('.empty-state__art')).toBeNull();
    expect(container.querySelector('h3')?.textContent).toBe('Nothing here');
  });
});

describe('illustrated info banner', () => {
  it('keeps the banner note role and adds the illustration variant', () => {
    const { container } = render(
      <InfoBanner illustration={imageSrc('concept-tenant-onboarding')}>
        <p>Tenant onboarding checklist</p>
      </InfoBanner>,
    );
    const banner = container.querySelector('.info-banner');
    expect(banner?.classList.contains('info-banner--illustrated')).toBe(true);
    expect(banner?.getAttribute('role')).toBe('note');
    const art = container.querySelector('img.info-banner__art') as HTMLImageElement | null;
    expect(art?.getAttribute('src')).toBe('/images/concept-tenant-onboarding.jpg');
    expect(art?.getAttribute('alt')).toBe('');
    expect(container.textContent).toContain('Tenant onboarding checklist');
  });

  it('omits the variant class for a plain banner', () => {
    const { container } = render(<InfoBanner>Plain note</InfoBanner>);
    expect(container.querySelector('.info-banner')?.classList.contains('info-banner--illustrated')).toBe(false);
    expect(container.querySelector('img')).toBeNull();
  });
});
