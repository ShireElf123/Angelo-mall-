import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Installability guard (Phase 12).
 *
 * The other PWA test checks that the declared icon paths exist. This one checks
 * what a launcher actually reads: the icon pixel dimensions in the PNG headers,
 * the identity fields a browser needs to treat the manifest as the app, and that
 * the page-level `theme-color` matches the manifest instead of drifting from it.
 *
 * Passing this is *not* a claim of Play Store readiness: no APK/AAB, no Play
 * listing, no signing, no Digital Asset Links. It only proves the web manifest
 * is internally consistent and the icons are the sizes they claim to be.
 */

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path));
const readText = (path: string) => read(path).toString('utf8');

function pngSize(path: string): { width: number; height: number } {
  const buffer = read(path);
  // PNG signature, then the IHDR chunk: 8-byte signature, 4-byte length,
  // 4-byte type, then width and height as big-endian uint32.
  expect(buffer.subarray(1, 4).toString('latin1'), `${path} is not a PNG`).toBe('PNG');
  expect(buffer.subarray(12, 16).toString('latin1'), `${path} has no IHDR chunk`).toBe('IHDR');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const manifest = JSON.parse(readText('public/manifest.webmanifest')) as {
  id?: string;
  name: string;
  short_name: string;
  lang: string;
  start_url: string;
  scope: string;
  display: string;
  display_override?: string[];
  background_color: string;
  theme_color: string;
  prefer_related_applications?: boolean;
  icons: { src: string; sizes: string; type: string; purpose?: string }[];
};

describe('web app manifest', () => {
  it('declares a stable identity instead of relying on the URL', () => {
    expect(manifest.id).toBe('/');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.lang).toBe('en-ZA');
  });

  it('opens standalone, with a fallback if a launcher refuses that', () => {
    expect(manifest.display).toBe('standalone');
    expect(manifest.display_override?.[0]).toBe('standalone');
    expect(manifest.prefer_related_applications).toBe(false);
  });

  it('names the app for the home screen without truncating it', () => {
    expect(manifest.name).toMatch(/Angelo Mall Go/);
    // Android truncates long labels on the launcher grid.
    expect(manifest.short_name.length).toBeLessThanOrEqual(12);
  });

  it('keeps the native window colours in the brand palette', () => {
    expect(manifest.theme_color.toLowerCase()).toBe('#0c3b2e');
    // PWA splash must match --bg, otherwise install shows a flash of a
    // different page colour than the app.
    expect(manifest.background_color.toLowerCase()).toBe('#f4eee2');
  });

  it('matches the page theme-color meta tag to the manifest', () => {
    const html = readText('index.html');
    const meta = html.match(/<meta name="theme-color" content="(#[0-9a-fA-F]{6})"/);
    expect(meta?.[1].toLowerCase(), 'index.html has no theme-color meta').toBe(
      manifest.theme_color.toLowerCase(),
    );
    // The status bar must be legible in a standalone window.
    expect(html).toContain('viewport-fit=cover');
  });

  it('ships icons at the exact pixel sizes it advertises', () => {
    const pngs = manifest.icons.filter((icon) => icon.type === 'image/png');
    expect(pngs.length).toBeGreaterThanOrEqual(2);

    for (const icon of pngs) {
      const declared = icon.sizes.split('x').map(Number) as [number, number];
      const actual = pngSize(`public${icon.src}`);
      expect(actual, `${icon.src} is not ${icon.sizes}`).toEqual({
        width: declared[0],
        height: declared[1],
      });
    }

    const sizes = pngs.map((icon) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    // Android crops anything that is not maskable, so one must be provided.
    const maskable = manifest.icons.filter((icon) => icon.purpose === 'maskable');
    expect(maskable.length, 'no maskable icon').toBeGreaterThanOrEqual(1);
    expect(maskable.every((icon) => icon.sizes === '512x512')).toBe(true);
  });
});
