/**
 * Typed projection of `docs/image-asset-manifest.json`.
 *
 * The manifest is the single list of images the app is allowed to use. This
 * module turns it into lookup helpers so screens never hard-code a filename,
 * and `imageAssets.test.ts` keeps the file list, the manifest and the code in
 * step (every referenced image exists; every file is documented).
 */
import manifest from '../../docs/image-asset-manifest.json';

export type AssetKind = 'generated' | 'generated-previous-phase' | 'verified-logo';
export type ReviewStatus = 'approved' | 'approved-but-unused' | 'pending' | 'rejected';

export interface ImageAsset {
  id: string;
  file: string;
  kind: AssetKind | string;
  batch: number;
  purpose: string;
  screens: string[];
  approved: boolean;
  review: ReviewStatus | string;
  derivedFrom?: string;
  notes?: string;
  /** Documented display size, e.g. `1000x667 (3:2)` — recorded from batch 3 on. */
  dimensions?: string;
  /** Compressed file size in kB, recorded from batch 3 on. */
  sizeKb?: number;
  usage?: string;
  /** The verified UI gap this asset closes (batch 5 onward). */
  gapAddressed?: string;
  /**
   * Set when this asset replaced an earlier approved image at the same path
   * (batch 10 superseded batch 7). Records what was replaced and where the old
   * file can still be recovered, so a swap is auditable rather than silent.
   */
  revision?: {
    replacesBatch: number;
    replacedOn: string;
    reason: string;
    previousFileInGitHistory: string;
  };
}

export const IMAGE_ASSETS = manifest.assets as ImageAsset[];

const byId = new Map(IMAGE_ASSETS.map((asset) => [asset.id, asset]));

export function imageAsset(id: string): ImageAsset {
  const asset = byId.get(id);
  if (!asset) throw new Error(`Unknown image asset id: ${id}`);
  return asset;
}

/** Use in components: `src={imageSrc('state-empty-directory')}`. */
export function imageSrc(id: string): string {
  return imageAsset(id).file;
}

/** Assets that are approved for use (excludes rejected/pending). */
/**
 * Delivery derivatives (Phase 14): WebP copies of the tenant concept images and
 * the Home hero, generated at fixed widths so a phone stops downloading a
 * 1280px JPEG for a 340px card. They are documented in the manifest but are not
 * separate assets — they never render on their own, and the original JPEG stays
 * as the `<img>` fallback.
 */
export const RESPONSIVE_DERIVATIVES: string[] = manifest.responsiveDerivatives.files;

export const APPROVED_ASSETS = IMAGE_ASSETS.filter(
  (asset) => asset.approved && asset.review !== 'rejected' && asset.review !== 'pending',
);

/**
 * Illustrated shortcuts for the Home "Explore by need" row. Each one filters the
 * mall directory by a real category id — the artwork is illustrative, never a
 * product claim, price or tenant offer.
 */
export const NEED_SHORTCUTS = [
  { category: 'food', label: 'Food & dining', caption: 'Takeaway, sit-down, biltong', art: imageSrc('need-food') },
  { category: 'fashion', label: 'Fashion & accessories', caption: 'Clothing, shoes, jewellery', art: imageSrc('need-fashion') },
  { category: 'electronics', label: 'Electronics & mobile', caption: 'Phones, networks, appliances', art: imageSrc('need-electronics') },
  { category: 'beauty', label: 'Beauty & personal care', caption: 'Hair, skin, beauty supplies', art: imageSrc('need-beauty') },
  { category: 'homeware', label: 'Home & hardware', caption: 'Hardware, plastics, homeware', art: imageSrc('need-home-hardware') },
] as const;

/** Reserved helper image slots shown in the Help screen steps. */
export const HELP_STEP_ILLUSTRATIONS = [
  imageSrc('help-chat'),
  imageSrc('help-summary'),
  imageSrc('help-delivery'),
] as const;
