/**
 * Profile photograph upload.
 *
 * Everything happens in the browser: the file is read with `FileReader`,
 * downscaled on a canvas and stored as a data URL on the person record. No
 * upload endpoint is contacted and nothing leaves the device — which is
 * honest about what this build is, and also means the photograph survives a
 * reload because it is persisted with the rest of the draft world.
 *
 * The downscale is not cosmetic. Browser storage is a few megabytes and a
 * modern phone photograph is larger than that on its own, so a full-size
 * data URL would silently blow the quota and lose the creator's whole
 * draft. 900px on the long edge at JPEG 0.82 lands around 120kB and is more
 * than the frame ever displays.
 */
import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MAX_EDGE = 900;
const QUALITY = 0.82;
/** Refused before reading, so a huge file cannot lock up the main thread. */
const MAX_BYTES = 12 * 1024 * 1024;

async function toDownscaledDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable in this browser.');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return canvas.toDataURL('image/jpeg', QUALITY);
}

export function PhotoUpload({
  photoUrl,
  onChange,
}: {
  photoUrl: string | null;
  onChange: (photoUrl: string | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('That is not an image file.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('That image is over 12MB. Try a smaller one.');
      return;
    }

    setBusy(true);
    try {
      onChange(await toDownscaledDataUrl(file));
    } catch {
      setError('That image could not be read. Try a JPEG or PNG.');
    } finally {
      setBusy(false);
      // Clearing the input means re-picking the same file fires `change`.
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => void accept(e.target.files?.[0])}
        />
        <Button type="button" variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          {photoUrl ? 'Replace photo' : 'Upload a photo'}
        </Button>
        {photoUrl ? (
          <Button type="button" variant="ghost" onClick={() => onChange(null)}>
            <Trash2 />
            Remove
          </Button>
        ) : null}
      </div>

      <p className="text-muted-foreground text-[12.5px] leading-relaxed">
        Shown as the centrepiece of your world. Portrait orientation works best.
        Resized to 900px and stored in this browser — it is never uploaded anywhere.
      </p>

      {error ? (
        <p role="alert" className="text-destructive text-[12.5px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
