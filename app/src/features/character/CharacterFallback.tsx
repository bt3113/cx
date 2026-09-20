import type { CharacterConfig } from './manifest';
import { HAIR_COLOURS, SKIN_TONES } from './manifest';

const tone = (id: string) => SKIN_TONES.find(([k]) => k === id)?.[1] ?? '#c9936e';
const hair = (id: string) => HAIR_COLOURS.find(([k]) => k === id)?.[1] ?? '#2a1b17';

const BODY: Record<CharacterConfig['body'], { shoulder: number; waist: number; hip: number }> = {
  slim: { shoulder: 88, waist: 66, hip: 76 },
  regular: { shoulder: 96, waist: 72, hip: 82 },
  athletic: { shoulder: 108, waist: 74, hip: 82 },
  curvy: { shoulder: 98, waist: 76, hip: 94 },
};

/** Zero-network, zero-WebGL fallback generated from the same character config. */
export function CharacterFallback({ config, className = '' }: { config: CharacterConfig; className?: string }) {
  const b = BODY[config.body];
  const skin = tone(config.skinTone);
  const hairColor = hair(config.hairColor);
  const longSleeve = ['knit', 'hoodie', 'shirt'].includes(config.top);
  const leftArm = config.pose === 'relaxed' ? -9 : config.pose === 'editorial' ? -4 : -1;
  const rightArm = config.pose === 'editorial' ? 14 : config.pose === 'relaxed' ? 7 : 1;

  return (
    <svg viewBox="0 0 320 620" role="img" aria-label="Static preview of the saved Zat character" className={className} preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="zatSkinGlow" cx="42%" cy="28%" r="70%"><stop offset="0" stopColor="#fff" stopOpacity=".18" /><stop offset="1" stopColor="#000" stopOpacity=".12" /></radialGradient>
        <linearGradient id="zatClothLight" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".12" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".2" /></linearGradient>
        <filter id="zatShadow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9" /></filter>
      </defs>
      <ellipse cx="160" cy="596" rx="72" ry="13" fill="#000" opacity=".28" filter="url(#zatShadow)" />
      <g>
        {config.bottom === 'skirt' ? <><path d={`M${160-b.hip/2} 352 L${160+b.hip/2} 352 L${160+b.hip*.6} 440 L${160-b.hip*.6} 440 Z`} fill={config.bottomColor} /><rect x="120" y="430" width="25" height="118" rx="12" fill={skin} /><rect x="175" y="430" width="25" height="118" rx="12" fill={skin} /></> : <><path d="M118 350 C120 330 145 330 151 350 L146 540 C145 553 120 553 119 540 Z" fill={config.bottomColor} /><path d="M169 350 C175 330 200 330 202 350 L201 540 C200 553 175 553 174 540 Z" fill={config.bottomColor} /></>}
        <path d="M108 542 C121 536 144 538 152 548 L148 565 L103 565 C98 558 100 549 108 542Z" fill={config.shoeColor} />
        <path d="M168 548 C179 538 202 536 215 542 C223 549 225 558 220 565 L174 565Z" fill={config.shoeColor} />
      </g>
      <path d={`M${160-b.shoulder/2} 214 Q160 198 ${160+b.shoulder/2} 214 L${160+b.waist/2} 356 Q160 370 ${160-b.waist/2} 356 Z`} fill={config.topColor} />
      <path d={`M${160-b.shoulder/2} 214 Q160 198 ${160+b.shoulder/2} 214 L${160+b.waist/2} 356 Q160 370 ${160-b.waist/2} 356 Z`} fill="url(#zatClothLight)" />
      {config.top === 'knit' ? <path d="M142 214 L160 230 L178 214 L170 205 L160 214 L150 205Z" fill="#f1ede6" /> : null}
      <g transform={`rotate(${leftArm} 112 224)`}><rect x="96" y="218" width="28" height="126" rx="14" fill={longSleeve ? config.topColor : skin} /><rect x="99" y="331" width="23" height="82" rx="12" fill={longSleeve ? config.topColor : skin} /><ellipse cx="110" cy="418" rx="13" ry="17" fill={skin} /></g>
      <g transform={`rotate(${rightArm} 208 224)`}><rect x="196" y="218" width="28" height="126" rx="14" fill={longSleeve ? config.topColor : skin} /><rect x="199" y="331" width="23" height="82" rx="12" fill={longSleeve ? config.topColor : skin} /><ellipse cx="210" cy="418" rx="13" ry="17" fill={skin} /></g>
      <rect x="147" y="180" width="26" height="38" rx="10" fill={skin} />
      <ellipse cx="160" cy="142" rx={config.face === 'round' ? 43 : 40} ry={config.face === 'soft' ? 49 : 52} fill={skin} />
      <ellipse cx="160" cy="142" rx="40" ry="52" fill="url(#zatSkinGlow)" />
      <ellipse cx="147" cy="142" rx="3.5" ry="2.5" fill="#27201d" /><ellipse cx="173" cy="142" rx="3.5" ry="2.5" fill="#27201d" />
      <path d="M154 163 Q160 167 166 163" stroke="#8f5149" strokeWidth="2" fill="none" strokeLinecap="round" />
      {config.hair === 'bob' ? <path d="M119 141 Q119 84 160 82 Q204 84 202 142 L197 190 Q187 204 181 181 L181 111 Q160 96 139 111 L139 181 Q133 204 123 190Z" fill={hairColor} /> : config.hair === 'bun' ? <><ellipse cx="160" cy="108" rx="41" ry="31" fill={hairColor} /><circle cx="160" cy="77" r="17" fill={hairColor} /></> : config.hair === 'waves' ? <><ellipse cx="160" cy="107" rx="42" ry="31" fill={hairColor} />{[126,143,160,177,194].map((x, i) => <circle key={x} cx={x} cy={90-(i%2)*4} r="12" fill={hairColor} />)}</> : <path d="M120 126 Q122 83 160 83 Q200 84 200 126 Q184 105 160 106 Q137 105 120 126Z" fill={hairColor} />}
      {config.facialHair !== 'none' ? <path d="M137 158 Q160 190 183 158 Q180 187 160 195 Q140 187 137 158Z" fill={hairColor} opacity={config.facialHair === 'stubble' ? .35 : .72} /> : null}
      {config.accessory === 'glasses' ? <g fill="none" stroke="#1a1919" strokeWidth="3"><circle cx="146" cy="141" r="12" /><circle cx="174" cy="141" r="12" /><path d="M158 141 H162" /></g> : null}
      {config.accessory === 'watch' ? <rect x="202" y="358" width="18" height="8" rx="3" fill="#9f9184" /> : null}
    </svg>
  );
}
