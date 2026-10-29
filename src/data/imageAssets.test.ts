import { describe, expect, it } from 'vitest';
import manifest from '../../docs/image-asset-manifest.json';
import manifestRaw from '../../docs/image-asset-manifest.json?raw';
import { IMAGE_ASSETS, imageSrc, imageAsset, APPROVED_ASSETS, RESPONSIVE_DERIVATIVES } from './imageAssets';
import { createSeedState } from './seed';

/**
 * Asset-inventory guard (Phase 5).
 *
 * The manifest is the contract: every image the app ships must be documented,
 * every documented image must exist in `public/`, and no screen may reference a
 * file that isn't in the manifest. This is what keeps batch-generated artwork
 * from silently drifting away from the code.
 */
const PUBLIC_FILES = new Set(
  Object.keys(import.meta.glob(['../../public/**/*', '../../public/*', '../../public/*.svg'])).map((filePath) =>
    filePath.replace(/^.*\/public/, ''),
  ),
);

const exists = (file: string) => PUBLIC_FILES.has(file);

describe('image asset manifest', () => {
  it('has a stable, unique id and file per asset', () => {
    const ids = IMAGE_ASSETS.map((a) => a.id);
    const files = IMAGE_ASSETS.map((a) => a.file);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(files).size).toBe(files.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('documents an existing file in public/ for every asset', () => {
    for (const asset of IMAGE_ASSETS) {
      expect(asset.file.startsWith('/'), `${asset.id} path should be root-relative`).toBe(true);
      expect(exists(asset.file), `${asset.id} -> ${asset.file} is missing from public/`).toBe(true);
    }
  });

  it('records purpose, screen usage, batch and review status', () => {
    for (const asset of IMAGE_ASSETS) {
      expect(asset.purpose.length, `${asset.id} purpose`).toBeGreaterThan(10);
      if (asset.usage === 'source-master') {
        // A generation master is never rendered directly, so it has no screen.
        // In exchange it must document the assets derived from it, otherwise
        // nothing would prove it is still doing a job.
        expect(asset.screens, `${asset.id} is a source master and must not claim a screen`).toEqual([]);
        expect(
          IMAGE_ASSETS.some((other) => other.derivedFrom === asset.id),
          `${asset.id} is a source master but nothing records derivedFrom: it`,
        ).toBe(true);
      } else {
        expect(asset.screens.length, `${asset.id} screens`).toBeGreaterThan(0);
      }
      expect(typeof asset.batch, `${asset.id} batch`).toBe('number');
      expect(['approved', 'approved-but-unused']).toContain(asset.review);
      expect(asset.approved).toBe(true);
    }
  });

  it('accounts for every image file in public/images', () => {
    // Delivery derivatives are documented separately: they belong to an asset
    // rather than being one, but the rule is the same — no undocumented file.
    const documented = new Set([...IMAGE_ASSETS.map((a) => a.file), ...RESPONSIVE_DERIVATIVES]);
    const actual = [...PUBLIC_FILES].filter(
      (file) => file.startsWith('/images/') && !file.startsWith('/images/logos/'),
    );
    for (const file of actual) {
      expect(documented.has(file), `${file} exists but is not in docs/image-asset-manifest.json`).toBe(true);
    }
    // And nothing in the manifest is a phantom.
    expect(actual.length).toBeGreaterThanOrEqual(documented.size);
  });

  it('documents every responsive derivative and only real WebP files', () => {
    expect(RESPONSIVE_DERIVATIVES.length).toBe(89);
    for (const file of RESPONSIVE_DERIVATIVES) {
      expect(file.endsWith('.webp'), `${file} should be a .webp`).toBe(true);
      expect(exists(file), `${file} is documented but missing from public/`).toBe(true);
    }
    // Each tenant image must have its full set of widths, not a partial ladder.
    const tenants = RESPONSIVE_DERIVATIVES.filter((f) => f.startsWith('/images/tenants/'));
    expect(tenants.length).toBe(29 * 3);
  });

  it('keeps the manifest JSON and its TypeScript projection in sync', () => {
    expect(IMAGE_ASSETS.length).toBe(manifest.assets.length);
    expect(manifestRaw).toContain('"phase": 5');
  });

  it('exposes helpers that resolve documented ids only', () => {
    expect(imageSrc('state-empty-directory')).toBe('/images/illustration-empty-directory.jpg');
    expect(imageAsset('help-chat').screens).toContain('help');
    expect(() => imageSrc('does-not-exist')).toThrow(/Unknown image asset id/);
    expect(APPROVED_ASSETS.length).toBe(IMAGE_ASSETS.length);
  });

  it('uses documented artwork for every promotion banner', () => {
    const state = createSeedState();
    for (const promotion of state.promotions) {
      const documented = IMAGE_ASSETS.some((asset) => asset.file === promotion.image);
      expect(documented, `${promotion.id} uses an undocumented image ${promotion.image}`).toBe(true);
    }
  });

  it('never ships a promotional image that reads as a real shop photo', () => {
    const state = createSeedState();
    for (const promotion of state.promotions) {
      expect(promotion.image.includes('illustration') || promotion.image.includes('hero')).toBe(true);
      // No offer may be attributed to a real tenant.
      expect(promotion.shopId).toBeUndefined();
    }
  });
});

describe('PWA assets', () => {
  it('keeps the manifest, service worker and icons resolvable', async () => {
    const { default: raw } = await import('../../public/manifest.webmanifest?raw');
    const parsed = JSON.parse(raw) as {
      icons: { src: string; sizes: string; purpose?: string }[];
      start_url: string;
    };
    expect(parsed.start_url).toBe('/');
    for (const icon of parsed.icons) {
      expect(exists(icon.src), `${icon.src} missing`).toBe(true);
    }
    const iconSizes = parsed.icons.map((icon) => icon.sizes);
    expect(iconSizes).toContain('192x192');
    expect(iconSizes).toContain('512x512');
    expect(parsed.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
    expect(exists('/sw.js')).toBe(true);
    expect(exists('/icon.svg')).toBe(true);
  });

  it('precaches only files that exist', async () => {
    const { default: sw } = await import('../../public/sw.js?raw');
    const shellMatch = sw.match(/const SHELL = \[([\s\S]*?)\];/);
    expect(shellMatch, 'SHELL array not found in sw.js').toBeTruthy();
    const paths = [...(shellMatch?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(paths.length).toBeGreaterThan(2);
    for (const path of paths) {
      // '/' and '/index.html' are produced by the build; static assets must exist now.
      if (path === '/' || path === '/index.html') continue;
      expect(exists(path), `service worker precaches missing ${path}`).toBe(true);
    }
  });
});
