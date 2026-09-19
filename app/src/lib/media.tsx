/**
 * Image resolution.
 *
 * Every asset is emitted by `npm run assets` as AVIF + WebP at known sizes,
 * and recorded in a build-time manifest. Rendering through this module means
 * intrinsic dimensions are always known, so images never cause layout shift.
 */
import manifest from '@/content/media-manifest.json';
import type { Media } from '@/lib/schema';
import { asset } from '@/lib/routing/base';

type Entry = { w: number; h: number; formats: string[] };
const entries = manifest as Record<string, Entry>;

export function mediaEntry(key: string): Entry | undefined {
  return entries[key];
}

export type PictureProps = {
  media: Media;
  /** Rendered CSS width hint for the browser's source selection. */
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** Set when the image is purely decorative and described by nearby text. */
  decorative?: boolean;
};

/**
 * Renders an asset as `<picture>` with AVIF first and WebP as the fallback.
 * Both formats are emitted for every asset, so there is always a match.
 */
export function Picture({
  media,
  sizes = '100vw',
  className,
  imgClassName,
  priority = false,
  decorative = false,
}: PictureProps) {
  const base = entries[media.key];
  const retinaKey = `${media.key}@2x`;
  const retina = media.retina ? entries[retinaKey] : undefined;

  const srcSet = (ext: string) =>
    retina
      ? `${asset(`media/${media.key}.${ext}`)} ${base?.w ?? 480}w, ${asset(`media/${retinaKey}.${ext}`)} ${retina.w}w`
      : `${asset(`media/${media.key}.${ext}`)} ${base?.w ?? 480}w`;

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      <img
        src={asset(`media/${media.key}.webp`)}
        width={base?.w}
        height={base?.h}
        alt={decorative ? '' : media.alt}
        aria-hidden={decorative || undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={imgClassName}
        draggable={false}
      />
    </picture>
  );
}
