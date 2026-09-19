/**
 * Sharing.
 *
 * Sharing is Zat's main acquisition mechanism, so it is a real feature rather
 * than a button: a 1080 x 1920 PNG is generated in the browser and handed to
 * the native share sheet where the platform supports files, with copy-link and
 * download as fallbacks everywhere else. No path through this component is a
 * dead end.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, Share2 } from 'lucide-react';
import { Dialog } from '@/design/Dialog';
import { Button } from '@/design/primitives';
import { useCopy } from '@/lib/hooks';
import { absoluteUrl } from '@/lib/routing/base';
import type { Item, Person, Space } from '@/lib/schema';
import { renderStory, storyFileName, STORY_H, STORY_W, type StoryInput } from './story';
import { track } from '@/lib/analytics/events';

type ShareButtonProps = {
  url: string;
  person: Person;
  label?: string;
  variant?: 'glass' | 'primary' | 'quiet';
  size?: 'sm' | 'md';
} & (
  | { subject: 'profile'; spaces: Space[] }
  | { subject: 'space'; space: Space }
  | { subject: 'item'; space: Space; item: Item }
);

function buildInput(props: ShareButtonProps): StoryInput {
  if (props.subject === 'profile')
    return { subject: 'profile', person: props.person, spaces: props.spaces };
  if (props.subject === 'space')
    return { subject: 'space', person: props.person, space: props.space };
  return { subject: 'item', person: props.person, space: props.space, item: props.item };
}

export function ShareButton(props: ShareButtonProps) {
  const { url, label = 'Share', variant = 'glass', size = 'sm' } = props;
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <Share2 className="size-4" strokeWidth={1.8} />
        {label}
      </Button>
      {open ? (
        <ShareDialog input={buildInput(props)} url={url} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}

function ShareDialog({
  input,
  url,
  onClose,
}: {
  input: StoryInput;
  url: string;
  onClose: () => void;
}) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const { copied, copy } = useCopy();
  const objectUrl = useRef<string | null>(null);

  const absolute = absoluteUrl(url);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError(null);

    renderStory(input)
      .then((result) => {
        if (cancelled) return;
        setBlob(result);
        const next = URL.createObjectURL(result);
        objectUrl.current = next;
        setPreview(next);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'The Story image could not be generated.');
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    };
    // `input` is rebuilt per render; the identity that matters is the subject.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.subject, url]);

  const title =
    input.subject === 'profile'
      ? `${input.person.name} on Zat`
      : input.subject === 'space'
        ? `${input.space.title} — ${input.person.name}`
        : `${input.item.title} — ${input.person.name}`;

  /** Files are only offered where the platform can actually accept them. */
  const canShareFile =
    typeof navigator !== 'undefined' &&
    'canShare' in navigator &&
    blob != null &&
    navigator.canShare?.({
      files: [new File([blob], storyFileName(input), { type: 'image/png' })],
    }) === true;

  const shareNative = useCallback(async () => {
    if (!blob) return;
    const file = new File([blob], storyFileName(input), { type: 'image/png' });
    try {
      if (canShareFile) {
        await navigator.share({ files: [file], title, text: title, url: absolute });
      } else if (navigator.share) {
        await navigator.share({ title, text: title, url: absolute });
      }
      track({ type: 'share', targetType: input.subject === 'item' ? 'item' : 'space', targetId: url });
    } catch (err) {
      // An abort is the user changing their mind, not a failure.
      if ((err as Error)?.name !== 'AbortError') {
        setError('Your browser blocked the share sheet. Use copy link or download instead.');
      }
    }
  }, [blob, canShareFile, input, title, absolute, url]);

  const download = useCallback(() => {
    if (!preview) return;
    const a = document.createElement('a');
    a.href = preview;
    a.download = storyFileName(input);
    document.body.appendChild(a);
    a.click();
    a.remove();
    track({ type: 'share', targetType: 'space', targetId: url });
  }, [preview, input, url]);

  const hasNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  return (
    <Dialog
      open
      onClose={onClose}
      variant="sheet"
      title="Share"
      description="A 1080 × 1920 Story image, generated here in your browser."
    >
      <div className="grid gap-5 sm:grid-cols-[176px_1fr]">
        <div
          className="relative overflow-hidden rounded-2xl border border-line bg-panel"
          style={{ aspectRatio: `${STORY_W} / ${STORY_H}` }}
        >
          {busy ? (
            <div className="grid h-full place-items-center" role="status">
              <span className="sr-only">Generating Story image</span>
              <span
                aria-hidden="true"
                className="block size-6 animate-spin rounded-full border-2 border-white/10 border-t-bronze-300"
              />
            </div>
          ) : preview ? (
            <img src={preview} alt="Story preview" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center px-4 text-center text-[12px] text-ink-3">
              Preview unavailable
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-dot/40 bg-dot/8 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#ff9aa1]"
            >
              {error}
            </p>
          ) : null}

          {hasNativeShare ? (
            <Button variant="primary" onClick={() => void shareNative()} disabled={busy}>
              <Share2 className="size-4" strokeWidth={1.8} />
              {canShareFile ? 'Share Story image' : 'Share link'}
            </Button>
          ) : null}

          <Button variant="glass" onClick={download} disabled={busy || !preview}>
            <Download className="size-4" strokeWidth={1.8} />
            Download image
          </Button>

          <Button variant="glass" onClick={() => void copy(absolute)}>
            {copied ? (
              <>
                <Check className="size-4" strokeWidth={2} /> Copied
              </>
            ) : (
              <>
                <Copy className="size-4" strokeWidth={1.8} /> Copy link
              </>
            )}
          </Button>

          <p className="mt-1 break-all rounded-xl border border-line bg-surface px-3.5 py-2.5 font-mono text-[11.5px] leading-relaxed text-ink-3">
            {absolute}
          </p>
        </div>
      </div>
    </Dialog>
  );
}
