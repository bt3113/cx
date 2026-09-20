import { useMemo, useRef, useState } from 'react';
import type { CharacterConfig } from './manifest';
import { CharacterStage, captureVisibleCharacter } from './CharacterStage';
import {
  ACCESSORIES,
  BODY_PRESETS,
  BOTTOMS,
  CHARACTER_STORAGE_PREFIX,
  EYE_COLOURS,
  FACE_PRESETS,
  HAIR_COLOURS,
  HAIR_STYLES,
  POSES,
  SHOES,
  SKIN_TONES,
  TOPS,
} from './manifest';

function OptionRow({ label, options, value, onChange }: {
  label: string;
  options: ReadonlyArray<{ id: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-[10px] uppercase tracking-[0.2em] text-ink-3">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
            className={`rounded-full border px-3 py-2 text-xs transition ${value === option.id ? 'border-bronze-400 bg-bronze-400/10 text-ink' : 'border-line bg-surface/40 text-ink-2 hover:border-line-2 hover:text-ink'}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Swatches({ label, options, value, onChange }: {
  label: string;
  options: ReadonlyArray<readonly [string, string]>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-[10px] uppercase tracking-[0.2em] text-ink-3">{label}</legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map(([id, color]) => (
          <button
            key={id}
            type="button"
            aria-label={`${label}: ${id}`}
            aria-pressed={value === id}
            onClick={() => onChange(id)}
            className={`size-8 rounded-full border p-[3px] transition ${value === id ? 'scale-110 border-bronze-400' : 'border-line hover:border-line-2'}`}
          >
            <span className="block size-full rounded-full" style={{ backgroundColor: color }} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ColourInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/30 px-3 py-2.5">
      <span className="text-xs text-ink-2">{label}</span>
      <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-ink-3">
        {value}
        <input className="h-7 w-9 cursor-pointer border-0 bg-transparent p-0" type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      </span>
    </label>
  );
}

function download(name: string, href: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function CharacterCreator({ handle, initial }: { handle: string; initial: CharacterConfig }) {
  const [config, setConfig] = useState<CharacterConfig>(() => {
    try {
      const saved = localStorage.getItem(`${CHARACTER_STORAGE_PREFIX}${handle}`);
      return saved ? { ...initial, ...JSON.parse(saved) } : initial;
    } catch {
      return initial;
    }
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const patch = (next: Partial<CharacterConfig>) => setConfig((current) => ({ ...current, ...next }));
  const summary = useMemo(() => `${config.body} · ${config.face} · ${config.hair} · ${config.top}`, [config]);

  const save = () => {
    localStorage.setItem(`${CHARACTER_STORAGE_PREFIX}${handle}`, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('zat:character-updated', { detail: { handle } }));
    setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    download(`${handle}-zat-character.json`, url);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const savePng = () => {
    const container = previewRef.current;
    if (!container) return;
    const png = captureVisibleCharacter(container);
    if (png) download(`${handle}-zat-character.png`, png);
  };

  return (
    <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-5 py-8 lg:grid-cols-[minmax(360px,0.9fr)_minmax(480px,1.1fr)] lg:px-10 lg:py-10">
      <section className="lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)]">
        <div ref={previewRef} className="relative h-[min(72dvh,760px)] min-h-[560px] overflow-hidden rounded-[34px] border border-line bg-[radial-gradient(circle_at_50%_22%,#2b282a_0%,#111214_42%,#09090a_72%)] shadow-2xl">
          <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:54px_54px]" />
          <CharacterStage config={config} preferSaved={false} force3d className="absolute inset-[5%_11%_0]" />
          <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur">Zat Character V1</div>
          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
            <div><p className="text-lg font-medium text-white">@{handle}</p><p className="mt-1 text-xs capitalize text-white/55">{summary}</p></div>
            <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/65 backdrop-blur">Editorial 3D</span>
          </div>
        </div>
      </section>

      <section className="space-y-7 pb-20">
        <div>
          <p className="kicker">Zero-budget character system</p>
          <h1 className="mt-2 font-display text-4xl tracking-[-0.035em] text-ink md:text-5xl">Make the person recognisable, not configurable forever.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-2">A small curated system: safe body presets, face presets, skin, hair, wardrobe and three restrained poses. The saved JSON is canonical; WebGL and the static fallback both render from it.</p>
        </div>

        <div className="grid gap-6 rounded-[28px] border border-line bg-surface/35 p-5 md:p-6">
          <OptionRow label="Body" options={BODY_PRESETS} value={config.body} onChange={(body) => patch({ body: body as CharacterConfig['body'] })} />
          <OptionRow label="Face" options={FACE_PRESETS} value={config.face} onChange={(face) => patch({ face: face as CharacterConfig['face'] })} />
          <Swatches label="Skin tone" options={SKIN_TONES} value={config.skinTone} onChange={(skinTone) => patch({ skinTone: skinTone as CharacterConfig['skinTone'] })} />
          <Swatches label="Eye colour" options={EYE_COLOURS} value={config.eyeColor} onChange={(eyeColor) => patch({ eyeColor: eyeColor as CharacterConfig['eyeColor'] })} />
          <OptionRow label="Eyebrows" options={[{ id: 'natural', label: 'Natural' }, { id: 'soft', label: 'Soft' }, { id: 'defined', label: 'Defined' }]} value={config.brow} onChange={(brow) => patch({ brow: brow as CharacterConfig['brow'] })} />
        </div>

        <div className="grid gap-6 rounded-[28px] border border-line bg-surface/35 p-5 md:p-6">
          <OptionRow label="Hair" options={HAIR_STYLES} value={config.hair} onChange={(hair) => patch({ hair: hair as CharacterConfig['hair'] })} />
          <Swatches label="Hair colour" options={HAIR_COLOURS} value={config.hairColor} onChange={(hairColor) => patch({ hairColor: hairColor as CharacterConfig['hairColor'] })} />
          <OptionRow label="Facial hair" options={[{ id: 'none', label: 'None' }, { id: 'stubble', label: 'Stubble' }, { id: 'short-beard', label: 'Short beard' }]} value={config.facialHair} onChange={(facialHair) => patch({ facialHair: facialHair as CharacterConfig['facialHair'] })} />
        </div>

        <div className="grid gap-6 rounded-[28px] border border-line bg-surface/35 p-5 md:p-6">
          <OptionRow label="Top" options={TOPS} value={config.top} onChange={(top) => patch({ top: top as CharacterConfig['top'] })} />
          <ColourInput label="Top colour" value={config.topColor} onChange={(topColor) => patch({ topColor })} />
          <OptionRow label="Bottom" options={BOTTOMS} value={config.bottom} onChange={(bottom) => patch({ bottom: bottom as CharacterConfig['bottom'] })} />
          <ColourInput label="Bottom colour" value={config.bottomColor} onChange={(bottomColor) => patch({ bottomColor })} />
          <OptionRow label="Shoes" options={SHOES} value={config.shoes} onChange={(shoes) => patch({ shoes: shoes as CharacterConfig['shoes'] })} />
          <ColourInput label="Shoe colour" value={config.shoeColor} onChange={(shoeColor) => patch({ shoeColor })} />
          <OptionRow label="Accessory" options={ACCESSORIES} value={config.accessory} onChange={(accessory) => patch({ accessory: accessory as CharacterConfig['accessory'] })} />
          <OptionRow label="Pose" options={POSES} value={config.pose} onChange={(pose) => patch({ pose: pose as CharacterConfig['pose'] })} />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 rounded-[28px] border border-line bg-surface/35 p-4">
          <button type="button" onClick={save} className="rounded-full bg-ink px-5 py-2.5 text-xs font-medium text-void transition hover:opacity-85">Save character</button>
          <button type="button" onClick={exportJson} className="rounded-full border border-line px-4 py-2.5 text-xs text-ink-2 transition hover:border-line-2 hover:text-ink">Export JSON</button>
          <button type="button" onClick={savePng} className="rounded-full border border-line px-4 py-2.5 text-xs text-ink-2 transition hover:border-line-2 hover:text-ink">Save PNG</button>
          <button type="button" onClick={() => setConfig(initial)} className="rounded-full border border-line px-4 py-2.5 text-xs text-ink-3 transition hover:border-line-2 hover:text-ink">Reset</button>
          {savedAt ? <span className="ml-auto text-[11px] text-ink-3">Saved locally at {savedAt}</span> : null}
        </div>

        <p className="text-xs leading-5 text-ink-3">No paid API, account, marketplace asset or external character service is used. On low-power devices the same character configuration renders as a static SVG fallback instead of loading WebGL.</p>
      </section>
    </div>
  );
}
