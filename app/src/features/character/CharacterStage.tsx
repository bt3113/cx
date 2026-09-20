import { useEffect, useMemo, useRef, useState } from 'react';
import { asset } from '@/lib/routing/base';
import { cn } from '@/design/cn';
import type { CharacterConfig } from './manifest';
import { CharacterFallback } from './CharacterFallback';
import { CHARACTER_STORAGE_PREFIX } from './manifest';

type Engine = {
  update: (config: CharacterConfig) => void;
  capture: (type?: string, quality?: number) => string;
  dispose: () => void;
};

type EngineModule = {
  mountCharacter: (
    canvas: HTMLCanvasElement,
    config: CharacterConfig,
    options?: { reducedMotion?: boolean; mobile?: boolean },
  ) => Promise<Engine>;
};

function loadSaved(handle: string | undefined, fallback: CharacterConfig): CharacterConfig {
  if (!handle || typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(`${CHARACTER_STORAGE_PREFIX}${handle}`);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function shouldStayStatic() {
  if (typeof window === 'undefined') return true;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return true;
  if ((nav.hardwareConcurrency ?? 4) <= 2) return true;
  try {
    const c = document.createElement('canvas');
    return !c.getContext('webgl2') && !c.getContext('webgl');
  } catch {
    return true;
  }
}

export function CharacterStage({
  config,
  handle,
  className,
  preferSaved = true,
  force3d = false,
}: {
  config: CharacterConfig;
  handle?: string;
  className?: string;
  preferSaved?: boolean;
  force3d?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saved, setSaved] = useState(() => (preferSaved ? loadSaved(handle, config) : config));
  const effective = preferSaved ? saved : config;
  const effectiveRef = useRef(effective);
  effectiveRef.current = effective;

  useEffect(() => {
    if (!preferSaved || !handle) return;
    const refresh = () => setSaved(loadSaved(handle, config));
    const storage = (event: StorageEvent) => {
      if (event.key === `${CHARACTER_STORAGE_PREFIX}${handle}`) refresh();
    };
    window.addEventListener('storage', storage);
    window.addEventListener('zat:character-updated', refresh as EventListener);
    return () => {
      window.removeEventListener('storage', storage);
      window.removeEventListener('zat:character-updated', refresh as EventListener);
    };
  }, [config, handle, preferSaved]);

  const staticOnly = useMemo(() => !force3d && shouldStayStatic(), [force3d]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || staticOnly) return;
    let cancelled = false;
    let mounted: Engine | null = null;

    (async () => {
      try {
        const moduleUrl = asset('character-engine.js');
        const mod = (await import(/* @vite-ignore */ moduleUrl)) as EngineModule;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        mounted = await mod.mountCharacter(canvas, effectiveRef.current, {
          reducedMotion: reduced,
          mobile: window.matchMedia('(max-width: 767px)').matches,
        });
        if (cancelled) {
          mounted.dispose();
          return;
        }
        engineRef.current = mounted;
        mounted.update(effectiveRef.current);
        setFailed(false);
        setReady(true);
      } catch (error) {
        console.warn('[Zat character] 3D renderer unavailable; using structured static fallback.', error);
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      mounted?.dispose();
      if (engineRef.current === mounted) engineRef.current = null;
    };
  }, [staticOnly]);

  useEffect(() => {
    engineRef.current?.update(effective);
  }, [effective]);

  return (
    <div
      className={cn('relative isolate h-full w-full overflow-visible', className)}
      data-character-renderer={staticOnly || failed ? 'static' : ready ? 'webgl' : 'loading'}
    >
      <CharacterFallback
        config={effective}
        className={cn('absolute inset-0 h-full w-full transition-opacity duration-500', ready && !failed && 'opacity-0')}
      />
      {!staticOnly ? (
        <canvas
          ref={canvasRef}
          data-zat-character-canvas
          aria-hidden="true"
          className={cn('absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500', ready && !failed && 'opacity-100')}
        />
      ) : null}
      <span className="sr-only">Zat character rendered from a structured avatar configuration.</span>
    </div>
  );
}

export function captureVisibleCharacter(container: HTMLElement): string | null {
  const canvas = container.querySelector<HTMLCanvasElement>('canvas[data-zat-character-canvas]');
  if (!canvas || !canvas.width || !canvas.height) return null;
  try {
    return canvas.toDataURL('image/png', .95);
  } catch {
    return null;
  }
}
