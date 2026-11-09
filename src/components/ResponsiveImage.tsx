import type { ImgHTMLAttributes } from 'react';

/**
 * An `<img>` that can advertise WebP sources without the caller losing control
 * of the element.
 *
 * The app positions its media images absolutely (`inset: 0`) inside a frame, so
 * a wrapper element between the frame and the image would break the layout.
 * `picture` is therefore laid out with `display: contents` (see index.css), which
 * keeps the `<img>` a direct participant in the parent's positioning context
 * while still giving the browser a `<source type="image/webp">` to prefer.
 *
 * The `src` on the `<img>` is always the original file, so a browser without
 * WebP support — or a derivative that failed to upload — still shows the image.
 */
export function ResponsiveImage({
  webpSrcSet,
  sizes,
  ...imgProps
}: ImgHTMLAttributes<HTMLImageElement> & {
  /** WebP candidates, e.g. `/img-480.webp 480w, /img-960.webp 960w`. */
  webpSrcSet?: string;
  sizes?: string;
}) {
  const img = <img {...imgProps} />;
  if (!webpSrcSet) return img;
  return (
    <picture>
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      {img}
    </picture>
  );
}
