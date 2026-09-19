/**
 * The central figure of a Zat world.
 *
 * Art direction from the supplied references: a full-body figure standing on a
 * lit dais in near-darkness, shaped by a warm rim from camera-left, a cooler
 * rim from camera-right, and a soft frontal fill. Deliberately a rendered
 * illustration rather than an attempt at photorealism — at display size (a
 * ~50px head on desktop) restrained form-shading reads cleanly where a
 * near-photoreal face would not.
 *
 * Two rules keep it from reading as a cartoon:
 *   1. Rim light is a *tight* edge (small blur, partial contours), never a
 *      full-path stroke, which produces a halo.
 *   2. Every part is drawn in strict depth order, so nothing shows through
 *      the knitwear.
 *
 * Output is transparent so the figure composites onto any creator background.
 */
import { alpha, blur, linear, mix, radial, spline, svg } from './lib/svg.ts';

export type PortraitPalette = {
  knit: string;
  trouser: string;
  shoe: string;
  shirt: string;
  skin: string;
  hair: string;
  rimWarm: string;
  rimCool: string;
};

export const ALEX_PALETTE: PortraitPalette = {
  knit: '#71222f',
  trouser: '#3e3c3d',
  shoe: '#f0ece5',
  shirt: '#ece8e0',
  skin: '#c99a77',
  hair: '#141214',
  rimWarm: '#f3d0a0',
  rimCool: '#c9d4e4',
};

const W = 1100;
const H = 1900;
const CX = 550;

// --- anatomy ---------------------------------------------------------------
const HEAD_TOP = 96;
const HEAD_H = 208;
const CHIN = HEAD_TOP + HEAD_H;
const NECK_END = CHIN + 46;
const SHOULDER_Y = 392;
const CHEST_Y = 566;
const WAIST_Y = 796;
const HIP_Y = 896;
const HEM_Y = 946;
const KNEE_Y = 1346;
const ANKLE_Y = 1728;
const SOLE_Y = 1834;

const SH_HW = 186; // shoulder half-width
const CH_HW = 176;
const WA_HW = 150;
const HI_HW = 162;

export function portraitSvg(p: PortraitPalette = ALEX_PALETTE): string {
  const knitDark = mix(p.knit, '#000000', 0.66);
  const knitMid = mix(p.knit, '#000000', 0.3);
  const knitLit = mix(p.knit, '#ffb08a', 0.16);
  const trouserDark = mix(p.trouser, '#000000', 0.7);
  const skinShadow = mix(p.skin, '#2b1508', 0.6);
  const skinLit = mix(p.skin, '#fff0dc', 0.32);

  const defs = [
    linear(
      'knit-g',
      [
        { offset: 0, color: knitMid },
        { offset: 0.3, color: p.knit },
        { offset: 0.72, color: mix(p.knit, '#000000', 0.45) },
        { offset: 1, color: knitDark },
      ],
      { x1: 0.15, y1: 0.05, x2: 0.7, y2: 1 },
    ),
    radial(
      'knit-fill',
      [
        { offset: 0, color: knitLit, opacity: 0.6 },
        { offset: 1, color: knitLit, opacity: 0 },
      ],
      { cx: 0.44, cy: 0.26, r: 0.44 },
    ),
    linear(
      'sleeve-g',
      [
        { offset: 0, color: mix(p.knit, '#000000', 0.34) },
        { offset: 0.5, color: mix(p.knit, '#000000', 0.5) },
        { offset: 1, color: knitDark },
      ],
      { x1: 0, y1: 0, x2: 0.9, y2: 1 },
    ),
    linear(
      'trouser-g',
      [
        { offset: 0, color: mix(p.trouser, '#ffffff', 0.05) },
        { offset: 0.38, color: p.trouser },
        { offset: 1, color: trouserDark },
      ],
      { x1: 0.2, y1: 0, x2: 0.75, y2: 1 },
    ),
    linear(
      'skin-g',
      [
        { offset: 0, color: skinLit },
        { offset: 0.5, color: p.skin },
        { offset: 1, color: skinShadow },
      ],
      { x1: 0.2, y1: 0.05, x2: 0.85, y2: 1 },
    ),
    linear(
      'hair-g',
      [
        { offset: 0, color: mix(p.hair, '#7a6552', 0.34) },
        { offset: 0.4, color: p.hair },
        { offset: 1, color: '#07060a' },
      ],
      { x1: 0.15, y1: 0, x2: 0.85, y2: 1 },
    ),
    linear(
      'shoe-g',
      [
        { offset: 0, color: mix(p.shoe, '#ffffff', 0.3) },
        { offset: 0.55, color: mix(p.shoe, '#000000', 0.16) },
        { offset: 1, color: mix(p.shoe, '#000000', 0.55) },
      ],
      { x1: 0.2, y1: 0, x2: 0.6, y2: 1 },
    ),
    linear(
      'shirt-g',
      [
        { offset: 0, color: p.shirt },
        { offset: 1, color: mix(p.shirt, '#000000', 0.48) },
      ],
      { x1: 0.2, y1: 0, x2: 0.75, y2: 1 },
    ),
    blur('b1', 1.5),
    blur('b3', 3),
    blur('b8', 8),
    blur('b18', 18),
    blur('b34', 34),
  ].join('');

  // --- geometry -----------------------------------------------------------

  /** Torso only — sleeves are separate so the silhouette has real arm gaps. */
  const torso = spline(
    [
      [CX - 58, NECK_END - 4],
      [CX - 130, SHOULDER_Y - 28],
      [CX - SH_HW, SHOULDER_Y + 14],
      [CX - CH_HW, CHEST_Y],
      [CX - WA_HW, WAIST_Y],
      [CX - HI_HW, HIP_Y],
      [CX - HI_HW + 4, HEM_Y - 2],
      [CX, HEM_Y + 4],
      [CX + HI_HW - 4, HEM_Y - 2],
      [CX + HI_HW, HIP_Y],
      [CX + WA_HW, WAIST_Y],
      [CX + CH_HW, CHEST_Y],
      [CX + SH_HW, SHOULDER_Y + 14],
      [CX + 130, SHOULDER_Y - 28],
      [CX + 58, NECK_END - 4],
      [CX + 28, NECK_END + 20],
      [CX - 28, NECK_END + 20],
    ],
    true,
  );

  /**
   * Sleeve: shoulder → elbow angled slightly away from the body → forearm
   * turning back in, ending at a hand tucked into the trouser pocket.
   */
  const sleeve = (dir: 1 | -1) => {
    const sx = CX + dir * (SH_HW - 16);
    return spline(
      [
        [sx - dir * 18, SHOULDER_Y - 10],
        [sx + dir * 26, SHOULDER_Y + 40],
        [sx + dir * 42, CHEST_Y + 30],
        [sx + dir * 40, WAIST_Y - 10],
        [sx + dir * 20, HIP_Y + 4],
        [sx - dir * 22, HEM_Y - 2],
        [sx - dir * 34, WAIST_Y - 20],
        [sx - dir * 30, CHEST_Y],
        [sx - dir * 26, SHOULDER_Y + 54],
      ],
      true,
    );
  };

  /** Hand emerging below the cuff into the pocket. */
  const hand = (dir: 1 | -1) => {
    const hx = CX + dir * (SH_HW - 34);
    return spline(
      [
        [hx - dir * 26, HEM_Y - 12],
        [hx + dir * 16, HEM_Y - 6],
        [hx + dir * 20, HEM_Y + 48],
        [hx - dir * 18, HEM_Y + 54],
      ],
      true,
    );
  };

  const leg = (dir: 1 | -1) => {
    const inTop = CX + dir * 16;
    const outTop = CX + dir * (HI_HW - 6);
    const inKnee = CX + dir * 26;
    const outKnee = CX + dir * 120;
    const inAnk = CX + dir * 40;
    const outAnk = CX + dir * 100;
    return spline(
      [
        [inTop, HIP_Y - 30],
        [outTop, HIP_Y - 26],
        [outKnee, KNEE_Y - 30],
        [outAnk, ANKLE_Y - 10],
        [outAnk - dir * 4, ANKLE_Y + 24],
        [inAnk, ANKLE_Y + 26],
        [inKnee, KNEE_Y + 8],
        [inTop, HIP_Y + 60],
      ],
      true,
    );
  };

  const shoe = (dir: 1 | -1) => {
    const heel = CX + dir * 42;
    const toe = CX + dir * 186;
    return spline(
      [
        [heel, ANKLE_Y + 6],
        [heel - dir * 4, ANKLE_Y + 62],
        [heel + dir * 10, SOLE_Y - 4],
        [toe - dir * 26, SOLE_Y],
        [toe, SOLE_Y - 20],
        [toe - dir * 30, ANKLE_Y + 50],
        [heel + dir * 72, ANKLE_Y + 12],
      ],
      true,
    );
  };

  const head = spline(
    [
      [CX + 2, HEAD_TOP],
      [CX + 60, HEAD_TOP + 30],
      [CX + 74, HEAD_TOP + 98],
      [CX + 66, HEAD_TOP + 152],
      [CX + 42, CHIN - 20],
      [CX, CHIN],
      [CX - 42, CHIN - 20],
      [CX - 66, HEAD_TOP + 152],
      [CX - 74, HEAD_TOP + 98],
      [CX - 60, HEAD_TOP + 30],
    ],
    true,
  );

  const hair = spline(
    [
      [CX + 2, HEAD_TOP - 14],
      [CX + 62, HEAD_TOP + 10],
      [CX + 80, HEAD_TOP + 74],
      [CX + 76, HEAD_TOP + 116],
      [CX + 66, HEAD_TOP + 62],
      [CX + 34, HEAD_TOP + 44],
      [CX - 10, HEAD_TOP + 54],
      [CX - 48, HEAD_TOP + 42],
      [CX - 70, HEAD_TOP + 70],
      [CX - 78, HEAD_TOP + 118],
      [CX - 82, HEAD_TOP + 72],
      [CX - 62, HEAD_TOP + 8],
    ],
    true,
  );

  /**
   * Tight rim: an *open* partial contour, small blur, high opacity. Stroking a
   * closed path instead produces an even halo, which is the tell of a cheap
   * vector figure.
   */
  const edge = (pts: Array<[number, number]>, color: string, w: number, op: number, f = 'b3') =>
    `<path d="${spline(pts)}" fill="none" stroke="${alpha(color, op)}" stroke-width="${w}" stroke-linecap="round" filter="url(#${f})"/>`;

  const out: string[] = [];

  // Ambient spill behind the figure.
  out.push(
    `<ellipse cx="${CX}" cy="${CHEST_Y - 10}" rx="290" ry="320" fill="${alpha(p.rimWarm, 0.045)}" filter="url(#b34)"/>`,
  );

  // Contact shadow.
  out.push(
    `<ellipse cx="${CX}" cy="${SOLE_Y + 12}" rx="250" ry="32" fill="${alpha('#000000', 0.75)}" filter="url(#b34)"/>`,
    `<ellipse cx="${CX}" cy="${SOLE_Y + 6}" rx="140" ry="16" fill="${alpha('#000000', 0.85)}" filter="url(#b8)"/>`,
  );

  // --- depth order: legs → shoes → their rims → neck → collar → knit -------
  for (const dir of [-1, 1] as const) out.push(`<path d="${leg(dir)}" fill="url(#trouser-g)"/>`);

  // Crease shading down each leg.
  for (const dir of [-1, 1] as const) {
    out.push(
      edge(
        [
          [CX + dir * 92, HIP_Y + 40],
          [CX + dir * 80, KNEE_Y - 60],
          [CX + dir * 74, ANKLE_Y - 60],
        ],
        mix(p.trouser, '#ffffff', 0.22),
        6,
        0.16,
        'b8',
      ),
    );
  }

  for (const dir of [-1, 1] as const) out.push(`<path d="${shoe(dir)}" fill="url(#shoe-g)"/>`);

  // Leg + shoe rims go here, before the knit, so nothing bleeds through it.
  for (const dir of [-1, 1] as const) {
    const col = dir === -1 ? p.rimWarm : p.rimCool;
    out.push(
      edge(
        [
          [CX + dir * (HI_HW - 10), HIP_Y + 10],
          [CX + dir * 118, KNEE_Y - 40],
          [CX + dir * 100, ANKLE_Y - 20],
        ],
        col,
        3.5,
        0.34,
      ),
      edge(
        [
          [CX + dir * 60, ANKLE_Y + 30],
          [CX + dir * 120, SOLE_Y - 14],
          [CX + dir * 168, SOLE_Y - 16],
        ],
        '#ffffff',
        5,
        0.7,
        'b1',
      ),
    );
    // Sole strip.
    out.push(
      `<path d="${spline([
        [CX + dir * 52, SOLE_Y - 8],
        [CX + dir * 120, SOLE_Y - 1],
        [CX + dir * 170, SOLE_Y - 12],
      ])}" fill="none" stroke="${alpha('#ffffff', 0.55)}" stroke-width="8" stroke-linecap="round" filter="url(#b3)"/>`,
    );
  }

  // Neck in shadow, then the shirt collar.
  out.push(
    `<path d="${spline(
      [
        [CX - 42, CHIN - 26],
        [CX + 42, CHIN - 26],
        [CX + 46, NECK_END + 22],
        [CX - 46, NECK_END + 22],
      ],
      true,
    )}" fill="${mix(skinShadow, '#000000', 0.12)}"/>`,
    // Shirt collar: kept inside the knit neckline so it reads as a collar
    // rather than as wings past the shoulder line.
    `<path d="${spline(
      [
        [CX - 74, NECK_END - 4],
        [CX - 24, NECK_END + 20],
        [CX, SHOULDER_Y + 58],
        [CX + 24, NECK_END + 20],
        [CX + 74, NECK_END - 4],
        [CX + 58, SHOULDER_Y + 30],
        [CX, SHOULDER_Y + 74],
        [CX - 58, SHOULDER_Y + 30],
      ],
      true,
    )}" fill="url(#shirt-g)"/>`,
  );

  // Sleeves sit behind the body of the knit.
  for (const dir of [-1, 1] as const) out.push(`<path d="${sleeve(dir)}" fill="url(#sleeve-g)"/>`);

  // Hands.
  for (const dir of [-1, 1] as const) {
    out.push(
      `<path d="${hand(dir)}" fill="${mix(p.skin, '#000000', 0.42)}"/>`,
      edge(
        [
          [CX + dir * (SH_HW - 50), HEM_Y - 4],
          [CX + dir * (SH_HW - 18), HEM_Y + 16],
        ],
        dir === -1 ? p.rimWarm : p.rimCool,
        3,
        0.3,
        'b1',
      ),
    );
  }

  // Body of the knit, over the sleeves.
  out.push(
    `<path d="${torso}" fill="url(#knit-g)"/>`,
    `<path d="${torso}" fill="url(#knit-fill)"/>`,
  );

  // Shoulder seams read as garment construction rather than anatomy.
  for (const dir of [-1, 1] as const) {
    out.push(
      edge(
        [
          [CX + dir * 120, SHOULDER_Y - 22],
          [CX + dir * (SH_HW - 8), SHOULDER_Y + 26],
          [CX + dir * (CH_HW - 4), CHEST_Y + 20],
        ],
        knitDark,
        5,
        0.5,
        'b3',
      ),
    );
  }

  // Ribbed hem, and the shadow the hem casts onto the trousers.
  out.push(
    `<path d="${spline([
      [CX - HI_HW + 10, HEM_Y - 20],
      [CX, HEM_Y - 4],
      [CX + HI_HW - 10, HEM_Y - 20],
    ])}" fill="none" stroke="${alpha(knitDark, 0.55)}" stroke-width="12" filter="url(#b8)"/>`,
    `<path d="${spline([
      [CX - HI_HW + 16, HEM_Y + 16],
      [CX, HEM_Y + 30],
      [CX + HI_HW - 16, HEM_Y + 16],
    ])}" fill="none" stroke="${alpha('#000000', 0.5)}" stroke-width="26" filter="url(#b18)"/>`,
  );

  // Crew neckline, and the shirt collar showing inside it. The collar is drawn
  // after the knit so it stays visible — underneath, the torso covers it.
  const collarOuter: Array<[number, number]> = [
    [CX - 58, NECK_END + 2],
    [CX, SHOULDER_Y + 26],
    [CX + 58, NECK_END + 2],
  ];
  const collarInner: Array<[number, number]> = [
    [CX - 40, NECK_END - 10],
    [CX, SHOULDER_Y - 2],
    [CX + 40, NECK_END - 10],
  ];
  out.push(
    `<path d="${spline(collarOuter)} L${collarInner[2]![0]},${collarInner[2]![1]} ${spline([...collarInner].reverse()).replace(/^M[^C]*/, '')} Z" fill="url(#shirt-g)" opacity="0.95"/>`,
    `<path d="${spline(collarOuter)}" fill="none" stroke="${alpha(knitDark, 0.85)}" stroke-width="11" stroke-linecap="round" filter="url(#b1)"/>`,
  );

  // --- head ---------------------------------------------------------------
  out.push(`<path d="${head}" fill="url(#skin-g)"/>`);
  out.push(
    `<ellipse cx="${CX + 44}" cy="${HEAD_TOP + 142}" rx="30" ry="46" fill="${alpha(skinShadow, 0.42)}" filter="url(#b18)"/>`,
    `<ellipse cx="${CX - 26}" cy="${HEAD_TOP + 112}" rx="34" ry="40" fill="${alpha(skinLit, 0.28)}" filter="url(#b18)"/>`,
  );

  const eyeY = HEAD_TOP + 122;
  for (const dir of [-1, 1] as const) {
    const ex = CX + dir * 30;
    out.push(
      edge([[ex - 20, eyeY - 24], [ex, eyeY - 29], [ex + 19, eyeY - 23]], '#17120f', 6, 0.55, 'b1'),
      edge([[ex - 17, eyeY], [ex, eyeY - 5], [ex + 17, eyeY]], '#241a14', 5, 0.85, 'b1'),
      `<circle cx="${ex}" cy="${eyeY + 1}" r="4.2" fill="${alpha('#15100d', 0.92)}"/>`,
    );
  }

  out.push(
    edge(
      [[CX + 3, HEAD_TOP + 132], [CX + 11, HEAD_TOP + 168], [CX - 2, HEAD_TOP + 176]],
      skinShadow,
      6,
      0.45,
      'b3',
    ),
    edge(
      [[CX - 20, HEAD_TOP + 204], [CX, HEAD_TOP + 209], [CX + 20, HEAD_TOP + 203]],
      mix(p.skin, '#5a2418', 0.62),
      4.5,
      0.7,
      'b1',
    ),
    `<path d="${hair}" fill="url(#hair-g)"/>`,
  );

  // --- rim lights, tight and partial --------------------------------------
  out.push(
    // Warm, camera-left: shoulder → ribcage.
    edge(
      [
        [CX - 126, SHOULDER_Y - 24],
        [CX - SH_HW + 4, SHOULDER_Y + 18],
        [CX - CH_HW + 2, CHEST_Y],
        [CX - WA_HW - 2, WAIST_Y - 30],
      ],
      p.rimWarm,
      4.5,
      0.85,
      'b3',
    ),
    // Cool, camera-right.
    edge(
      [
        [CX + 126, SHOULDER_Y - 24],
        [CX + SH_HW - 4, SHOULDER_Y + 18],
        [CX + CH_HW - 2, CHEST_Y],
        [CX + WA_HW + 2, WAIST_Y - 30],
      ],
      p.rimCool,
      4,
      0.62,
      'b3',
    ),
    // Outer sleeve edges.
    edge(
      [
        [CX - SH_HW - 4, SHOULDER_Y + 40],
        [CX - SH_HW - 18, CHEST_Y + 30],
        [CX - SH_HW - 14, WAIST_Y],
      ],
      p.rimWarm,
      3.5,
      0.5,
      'b3',
    ),
    edge(
      [
        [CX + SH_HW + 4, SHOULDER_Y + 40],
        [CX + SH_HW + 18, CHEST_Y + 30],
        [CX + SH_HW + 14, WAIST_Y],
      ],
      p.rimCool,
      3.5,
      0.42,
      'b3',
    ),
    // Head and hair.
    edge(
      [[CX - 56, HEAD_TOP + 34], [CX - 72, HEAD_TOP + 104], [CX - 56, HEAD_TOP + 166]],
      p.rimWarm,
      3.5,
      0.6,
      'b3',
    ),
    edge(
      [[CX + 54, HEAD_TOP + 30], [CX + 72, HEAD_TOP + 100], [CX + 56, HEAD_TOP + 162]],
      p.rimCool,
      3,
      0.45,
      'b3',
    ),
    edge(
      [[CX - 58, HEAD_TOP + 8], [CX + 4, HEAD_TOP - 11], [CX + 60, HEAD_TOP + 6]],
      p.rimWarm,
      3.5,
      0.55,
      'b3',
    ),
  );

  return svg(W, H, defs, out.join(''));
}
