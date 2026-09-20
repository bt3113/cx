/**
 * Character builder.
 *
 * Constrained on purpose: a style, a few colours, and a shuffle. Zat enforces
 * good design rather than shipping a free-form editor, and every control here
 * maps onto something the chosen DiceBear style genuinely supports — unsupported
 * controls hide themselves rather than appearing dead.
 */
import { useCallback, useId, useMemo, useRef } from 'react';
import { Shuffle, Upload, X } from 'lucide-react';
import { cn } from '@/design/cn';
import { Button } from '@/design/primitives';
import {
  BACKGROUNDS,
  CHARACTER_STYLES,
  CLOTHING_COLOURS,
  HAIR_COLOURS,
  SKIN_TONES,
  STYLE_LABEL,
  type CharacterConfig,
  type CharacterStyle,
} from './schema';
import { characterOptions, renderCharacterDataUri } from './render';

/** Largest image accepted for an uploaded figure, before base64 expansion. */
const MAX_UPLOAD_BYTES = 2_000_000;

export function CharacterPreview({
  config,
  className,
  alt,
}: {
  config: CharacterConfig;
  className?: string;
  alt: string;
}) {
  const src = useMemo(() => renderCharacterDataUri(config), [config]);
  if (!src) {
    return (
      <div
        className={cn('grid place-items-center rounded-full bg-surface text-ink-3', className)}
        role="img"
        aria-label={alt}
      >
        <span className="kicker">No character</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} draggable={false} />;
}

function Swatches({
  label,
  values,
  current,
  onChange,
  allowTransparent = false,
}: {
  label: string;
  values: readonly string[];
  current: string;
  onChange: (value: string) => void;
  allowTransparent?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <p className="kicker mb-2.5" id={id}>
        {label}
      </p>
      <div role="radiogroup" aria-labelledby={id} className="flex flex-wrap gap-2">
        {values.map((value) => {
          const active = current === value;
          const transparent = allowTransparent && value === 'transparent';
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={transparent ? 'Transparent' : value}
              onClick={() => onChange(value)}
              className={cn(
                'size-8 rounded-full border transition-[transform,border-color] duration-200',
                active
                  ? 'border-bronze-300 scale-110'
                  : 'border-line hover:border-line-2 hover:scale-105',
              )}
              style={
                transparent
                  ? {
                      backgroundImage:
                        'linear-gradient(45deg,#2a2a2e 25%,transparent 25%,transparent 75%,#2a2a2e 75%),linear-gradient(45deg,#2a2a2e 25%,transparent 25%,transparent 75%,#2a2a2e 75%)',
                      backgroundSize: '8px 8px',
                      backgroundPosition: '0 0,4px 4px',
                    }
                  : { background: value }
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export function CharacterBuilder({
  value,
  onChange,
  className,
}: {
  value: CharacterConfig;
  onChange: (next: CharacterConfig) => void;
  className?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const patch = useCallback(
    (next: Partial<CharacterConfig>) => onChange({ ...value, ...next }),
    [onChange, value],
  );

  // Hide controls the chosen style cannot act on, rather than showing a
  // swatch row that does nothing.
  const active = useMemo(() => {
    const opts = characterOptions(value);
    return {
      skin: 'skinColor' in opts || 'skin' in opts || 'baseColor' in opts,
      hair: 'hairColor' in opts,
      clothing: 'clothingColor' in opts || 'clothesColor' in opts || 'body' in opts,
      background: 'backgroundColor' in opts,
    };
  }, [value]);

  const onUpload = (file: File | undefined) => {
    if (!file) return;
    const problem =
      !file.type.startsWith('image/')
        ? 'That file is not an image.'
        : file.size > MAX_UPLOAD_BYTES
          ? 'Images need to be under 2MB.'
          : null;

    if (problem) {
      if (errorRef.current) errorRef.current.textContent = problem;
      return;
    }
    if (errorRef.current) errorRef.current.textContent = '';

    const reader = new FileReader();
    reader.onload = () => patch({ photo: String(reader.result) });
    reader.onerror = () => {
      if (errorRef.current) errorRef.current.textContent = 'That image could not be read.';
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={cn('grid gap-8 lg:grid-cols-[260px_1fr]', className)}>
      {/* --- preview ------------------------------------------------- */}
      <div>
        <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[var(--radius-panel)] border border-line bg-[radial-gradient(ellipse_at_50%_25%,rgba(216,169,106,0.1),transparent_65%)]">
          <CharacterPreview
            config={value}
            alt="Your character"
            className="size-[78%] object-contain"
          />
          {value.photo ? (
            <button
              type="button"
              onClick={() => patch({ photo: null })}
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-full border border-line bg-black/50 text-ink-2 backdrop-blur-sm transition-colors hover:text-ink"
              aria-label="Remove uploaded image"
            >
              <X className="size-4" strokeWidth={1.8} />
            </button>
          ) : null}
        </div>

        <div className="mt-3 flex gap-2">
          <Button
            variant="glass"
            size="sm"
            className="flex-1"
            onClick={() => patch({ seed: Math.random().toString(36).slice(2, 10) })}
            disabled={Boolean(value.photo)}
          >
            <Shuffle className="size-4" strokeWidth={1.8} />
            Shuffle
          </Button>
          <Button variant="glass" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" strokeWidth={1.8} />
            Upload
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
        </div>
        <p ref={errorRef} role="alert" className="mt-2 text-[12px] text-[#ff9aa1]" />
        <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3">
          Upload a cut-out figure for a full-length world, or build a character below. Uploads stay
          in this browser.
        </p>
      </div>

      {/* --- controls ------------------------------------------------ */}
      <div className={cn('space-y-7', value.photo && 'pointer-events-none opacity-40')}>
        <div>
          <p className="kicker mb-2.5" id="char-style">
            Style
          </p>
          <div role="radiogroup" aria-labelledby="char-style" className="flex flex-wrap gap-2">
            {CHARACTER_STYLES.map((style) => (
              <button
                key={style}
                type="button"
                role="radio"
                aria-checked={value.style === style}
                onClick={() => patch({ style: style as CharacterStyle })}
                className={cn(
                  'rounded-full border px-3.5 py-2 text-[13px] transition-colors',
                  value.style === style
                    ? 'border-bronze-500/50 bg-bronze-500/10 text-ink'
                    : 'border-line text-ink-3 hover:border-line-2 hover:text-ink',
                )}
              >
                {STYLE_LABEL[style]}
              </button>
            ))}
          </div>
        </div>

        {active.skin ? (
          <Swatches
            label="Skin tone"
            values={SKIN_TONES}
            current={value.skinTone}
            onChange={(skinTone) => patch({ skinTone })}
          />
        ) : null}

        {active.hair ? (
          <Swatches
            label="Hair"
            values={HAIR_COLOURS}
            current={value.hairColour}
            onChange={(hairColour) => patch({ hairColour })}
          />
        ) : null}

        {active.clothing ? (
          <Swatches
            label="Clothing"
            values={CLOTHING_COLOURS}
            current={value.clothingColour}
            onChange={(clothingColour) => patch({ clothingColour })}
          />
        ) : null}

        {active.background ? (
          <Swatches
            label="Backdrop"
            values={BACKGROUNDS}
            current={value.background}
            onChange={(background) => patch({ background })}
            allowTransparent
          />
        ) : null}

        <p className="border-t border-line pt-5 text-[12px] leading-relaxed text-ink-3">
          Characters are generated with{' '}
          <a
            href="https://www.dicebear.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-2 underline underline-offset-4 hover:text-ink"
          >
            DiceBear
          </a>
          , an open-source avatar library. Rendering happens in your browser — nothing is sent
          anywhere.
        </p>
      </div>
    </div>
  );
}
