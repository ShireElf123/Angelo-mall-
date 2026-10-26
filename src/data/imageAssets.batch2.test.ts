/** @vitest-environment jsdom */
/**
 * Batch 2 guards. Batch 1 shipped with only the empty-state and help artwork;
 * batch 2 added the remaining empty states, the concept illustrations and the
 * social card. These tests keep the batch documented, present on disk and
 * actually reachable from the UI helpers.
 */
import { describe, expect, it } from 'vitest';
import indexHtml from '../../index.html?raw';
import { IMAGE_ASSETS, imageAsset, imageSrc } from './imageAssets';

const BATCH_2_IDS = [
  'state-empty-basket',
  'state-empty-chats',
  'state-empty-orders',
  'state-empty-thread',
  'state-empty-delivery',
  'og-social-card',
  'concept-four-views',
  'concept-tenant-onboarding',
  'concept-privacy',
  'state-not-found',
] as const;

/** Files that actually exist under `public/` (Vite resolves them at build time). */
const PUBLIC_FILES = new Set(
  Object.keys(import.meta.glob(['../../public/**/*', '../../public/*', '../../public/*.svg'])).map((filePath) =>
    filePath.replace(/^.*\/public/, ''),
  ),
);

describe('batch 2 image assets', () => {
  it('documents all ten requested assets', () => {
    const batch = IMAGE_ASSETS.filter((asset) => asset.batch === 2);
    expect(batch.map((asset) => asset.id).sort()).toEqual([...BATCH_2_IDS].sort());
  });

  it.each(BATCH_2_IDS)('%s exists on disk and is approved', (id) => {
    const asset = imageAsset(id);
    expect(asset.approved).toBe(true);
    expect(asset.review).toBe('approved');
    expect(asset.kind).toBe('generated');
    expect(asset.file.startsWith('/images/')).toBe(true);
    expect(PUBLIC_FILES.has(asset.file)).toBe(true);
    expect(imageSrc(id)).toBe(asset.file);
  });

  it('keeps every generated asset word-free by design (no SVG text fallback)', () => {
    for (const id of BATCH_2_IDS) {
      expect(imageAsset(id).file.endsWith('.jpg')).toBe(true);
    }
  });

  it('never reuses one file for two different asset ids', () => {
    const files = IMAGE_ASSETS.map((asset) => asset.file);
    expect(new Set(files).size).toBe(files.length);
  });

  it('points the share preview at a documented asset', () => {
    const html = indexHtml;
    const match = html.match(/<meta property="og:image" content="([^"]+)"/);
    expect(match).not.toBeNull();
    const src = match?.[1] ?? '';
    expect(src).toBe(imageSrc('og-social-card'));
    // The share card is a dedicated 1200x630 treatment, not a promotion banner.
    expect(src).not.toContain('promo-illustration');
    expect(html).toContain('<meta property="og:image:width" content="1200" />');
    expect(html).toContain('name="twitter:card"');
  });
});
