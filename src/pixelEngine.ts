/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// PALETTE
// 22 strictly defined colors. Never draw a color outside this palette.
// ============================================================================
export const PALETTE = {
  outline: '#2a1b24',
  cream: '#fff1d6',
  glow: '#ffd98a',
  orange: '#f58a3d',
  deepOrange: '#c4552b',
  coral: '#e8604c',
  belly: '#ffb561',
  hungryGreen: '#c9d95a',
  waterLight: '#5cc2b0',
  waterMid: '#36908f',
  waterDeep: '#1f5566',
  waterDark: '#17384a',
  sand: '#f0c987',
  sandShade: '#c99a5b',
  wood: '#a8693a',
  woodDark: '#6b3f2a',
  woodLight: '#d18f52',
  gold: '#ffc83d',
  silver: '#d9e2ea',
  diamond: '#8ee8ff',
  alienGreen: '#7cc95a',
  alienDark: '#3f8f4a',
  carnivorePurple: '#9a5cc4',
  carnivoreDark: '#5e3a8c',
  tan: '#e0b070',
  dimBrown: '#7d5236',
  white: '#ffffff',
  lagoon1: '#7fe0c8',
  lagoon2: '#4fb8b0',
  lagoon3: '#2f8a99',
  midnight1: '#4a6fb5',
  midnight2: '#34509a',
  midnight3: '#26377a',
  midnight4: '#1a2257',
} as const;

export type PaletteKey = keyof typeof PALETTE;

// ============================================================================
// SPRITE BAKER
// Turns string array (1 char per pixel mapped to palette keys) into cached
// offscreen canvas with auto-generated 1px outline, plus cached flipped copy.
// ============================================================================
export interface BakedSprite {
  normal: HTMLCanvasElement;
  flipped: HTMLCanvasElement;
  glowNormal?: HTMLCanvasElement;
  glowFlipped?: HTMLCanvasElement;
  silNormal?: HTMLCanvasElement;
  silFlipped?: HTMLCanvasElement;
  width: number;
  height: number;
  originX: number;
  originY: number;
}

const VALID_PALETTE_HEX = new Set(Object.values(PALETTE));

export function bakeExactSprite(
  grid: string[],
  colorMap: Record<string, PaletteKey>,
  originX: number = 0,
  originY: number = 0,
  spriteName: string = 'sprite'
): BakedSprite {
  const h = grid.length;
  const w = grid[0].length;

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = w;
  normalCanvas.height = h;
  const nCtx = normalCanvas.getContext('2d')!;
  nCtx.imageSmoothingEnabled = false;

  let hasOutline = false;
  let hasSolidPixels = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = grid[y][x];
      if (ch && ch !== '.' && ch !== ' ') {
        hasSolidPixels = true;
        const colorKey = colorMap[ch];
        if (!colorKey || !PALETTE[colorKey] || !VALID_PALETTE_HEX.has(PALETTE[colorKey])) {
          console.warn(`[PALETTE WARN] Off-palette pixel '${ch}' (color: ${colorKey}) in sprite "${spriteName}" at (${x}, ${y})`);
        } else {
          if (colorKey === 'outline' || (PALETTE[colorKey] as string) === PALETTE.outline) {
            hasOutline = true;
          }
          nCtx.fillStyle = PALETTE[colorKey];
          nCtx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  if (hasSolidPixels && !hasOutline) {
    console.warn(`[OUTLINE WARN] Sprite "${spriteName}" is missing an outline.`);
  }

  const flippedCanvas = document.createElement('canvas');
  flippedCanvas.width = w;
  flippedCanvas.height = h;
  const fCtx = flippedCanvas.getContext('2d')!;
  fCtx.imageSmoothingEnabled = false;
  fCtx.save();
  fCtx.translate(w, 0);
  fCtx.scale(-1, 1);
  fCtx.drawImage(normalCanvas, 0, 0);
  fCtx.restore();

  return {
    normal: normalCanvas,
    flipped: flippedCanvas,
    width: w,
    height: h,
    originX,
    originY,
  };
}

export function bakeSprite(
  grid: string[],
  colorMap: Record<string, PaletteKey>,
  originX?: number,
  originY?: number,
  spriteName: string = 'sprite'
): BakedSprite {
  const h = grid.length;
  const w = grid[0].length;

  // Validate off-palette pixels at bake time
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = grid[y][x];
      if (ch && ch !== '.' && ch !== ' ') {
        const colorKey = colorMap[ch];
        if (!colorKey || !PALETTE[colorKey] || !VALID_PALETTE_HEX.has(PALETTE[colorKey])) {
          console.warn(`[PALETTE WARN] Off-palette pixel '${ch}' (color: ${colorKey}) in sprite "${spriteName}" at (${x}, ${y})`);
        }
      }
    }
  }

  // 1px padding on all sides for the 1px outline
  const canvasW = w + 2;
  const canvasH = h + 2;

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = canvasW;
  normalCanvas.height = canvasH;
  const nCtx = normalCanvas.getContext('2d')!;
  nCtx.imageSmoothingEnabled = false;

  // 1. Mark solid pixels
  const solid: boolean[][] = Array.from({ length: canvasH }, () => Array(canvasW).fill(false));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = grid[y][x];
      if (ch && ch !== '.' && ch !== ' ' && colorMap[ch]) {
        solid[y + 1][x + 1] = true;
      }
    }
  }

  // 2. Auto-generate 1px outline around solid pixels
  nCtx.fillStyle = PALETTE.outline;
  for (let cy = 0; cy < canvasH; cy++) {
    for (let cx = 0; cx < canvasW; cx++) {
      if (!solid[cy][cx]) {
        let hasNeighbor = false;
        for (let dy = -1; dy <= 1 && !hasNeighbor; dy++) {
          for (let dx = -1; dx <= 1 && !hasNeighbor; dx++) {
            if (dx === 0 && dy === 0) continue;
            const ny = cy + dy;
            const nx = cx + dx;
            if (ny >= 0 && ny < canvasH && nx >= 0 && nx < canvasW && solid[ny][nx]) {
              hasNeighbor = true;
            }
          }
        }
        if (hasNeighbor) {
          nCtx.fillRect(cx, cy, 1, 1);
        }
      }
    }
  }

  // 3. Render solid colored pixels over outline
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = grid[y][x];
      if (ch && ch !== '.' && ch !== ' ' && colorMap[ch]) {
        nCtx.fillStyle = PALETTE[colorMap[ch]];
        nCtx.fillRect(x + 1, y + 1, 1, 1);
      }
    }
  }

  // 4. Cached flipped copy
  const flippedCanvas = document.createElement('canvas');
  flippedCanvas.width = canvasW;
  flippedCanvas.height = canvasH;
  const fCtx = flippedCanvas.getContext('2d')!;
  fCtx.imageSmoothingEnabled = false;
  fCtx.translate(canvasW, 0);
  fCtx.scale(-1, 1);
  fCtx.drawImage(normalCanvas, 0, 0);

  const defOriginX = originX !== undefined ? originX + 1 : Math.floor(canvasW / 2);
  const defOriginY = originY !== undefined ? originY + 1 : Math.floor(canvasH / 2);

  return {
    normal: normalCanvas,
    flipped: flippedCanvas,
    width: canvasW,
    height: canvasH,
    originX: defOriginX,
    originY: defOriginY,
  };
}

// ============================================================================
// BITMAP FONT & TEXT ENGINE DELEGATION
// Re-exports unified text engine functions
// ============================================================================
export {
  FONT_5X7,
  FONT_3X5,
  getGlyph,
  measure,
  measureMiniBitmapText,
  wrap,
  fitText,
  getGroupFontTier,
  formatNumber,
  drawText,
  drawBitmapText,
  drawMiniBitmapText,
  drawFittedText,
  TEXT,
  type FontTier,
  type FitTextOptions,
  type FitTextResult,
  type DrawTextOptions,
} from './textEngine.ts';

// SPRITE DEFINITIONS
// Pre-baked on startup. No sprite is rebuilt per frame.
// ============================================================================
// Cozy Orange Ramp (body #f58a3d, belly #ffb561, top shade #c4552b)
// 2x2 cream eye (#fff1d6) with dark pupil (#2a1b24) and highlight (#fff1d6)
// 1px coral blush cheek (#e8604c)
const C_FISH_NORMAL: Record<string, PaletteKey> = {
  B: 'orange',      // #f58a3d
  L: 'belly',       // #ffb561
  T: 'deepOrange',  // #c4552b
  E: 'cream',       // #fff1d6
  P: 'outline',     // #2a1b24 dark pupil
  H: 'cream',       // #fff1d6 highlight pixel
  C: 'coral',       // #e8604c 1px coral blush cheek
  F: 'belly',       // #ffb561 fin
};

// Hungry Yellow-Green Palette (#c9d95a)
const C_FISH_HUNGRY: Record<string, PaletteKey> = {
  B: 'hungryGreen', // #c9d95a
  L: 'glow',        // #ffd98a
  T: 'alienDark',   // #3f8f4a
  E: 'cream',       // #fff1d6
  P: 'outline',     // #2a1b24
  H: 'cream',       // #fff1d6
  C: 'sandShade',   // #c99a5b
  F: 'hungryGreen', // #c9d95a
};

// Dying Desaturated Palette with X eyes
const C_FISH_DYING: Record<string, PaletteKey> = {
  B: 'silver',      // #d9e2ea
  L: 'cream',       // #fff1d6
  T: 'waterDeep',   // #1f5566
  E: 'cream',       // #fff1d6
  P: 'outline',     // #2a1b24
  H: 'silver',      // #d9e2ea
  C: 'silver',      // #d9e2ea
  F: 'silver',      // #d9e2ea
};

const C_COIN: Record<string, PaletteKey> = {
  G: 'gold',
  Y: 'glow',
  S: 'sandShade',
  C: 'cream',
  V: 'silver',
  D: 'diamond',
  W: 'waterDeep',
};

// ----------------------------------------------------------------------------
// SIZE 0: Plump round guppy, 14x10 art px
// Frame 0 & Frame 1: Tail swaps between 2 frames every 0.17s
// ----------------------------------------------------------------------------
const GRID_FISH_0_F0 = [
  '....FF...TTT..',
  '..FFFF.TTBBBB.',
  '.FFFFFFTBBBBT.',
  'FFFFFFFBBBBBHP',
  '.FFFFFFBBBBCEP',
  '..FFFFFBBBBBBB',
  '...FFFLLLLLLLL',
  '....F.LLLLLLLL',
  '......LLLLLL..',
  '.......LLLL...',
];

const GRID_FISH_0_F1 = [
  '.........TTT..',
  '.......TTBBBB.',
  '....FF.TBBBBT.',
  '..FFFFFBBBBBHP',
  '.FFFFFFBBBBCEP',
  'FFFFFFFBBBBBBB',
  '.FFFFFFLLLLLLL',
  '..FFFFLLLLLLLL',
  '...FF.LLLLLL..',
  '....F..LLLL...',
];

// Size 0 Dying: X-eye (PE / EP) & no blush
const GRID_FISH_0_DYING_F0 = [
  '....FF...TTT..',
  '..FFFF.TTBBBB.',
  '.FFFFFFTBBBBT.',
  'FFFFFFFBBBBBPE',
  '.FFFFFFBBBBBEP',
  '..FFFFFBBBBBBB',
  '...FFFLLLLLLLL',
  '....F.LLLLLLLL',
  '......LLLLLL..',
  '.......LLLL...',
];

const GRID_FISH_0_DYING_F1 = [
  '.........TTT..',
  '.......TTBBBB.',
  '....FF.TBBBBT.',
  '..FFFFFBBBBBPE',
  '.FFFFFFBBBBBEP',
  'FFFFFFFBBBBBBB',
  '.FFFFFFLLLLLLL',
  '..FFFFLLLLLLLL',
  '...FF.LLLLLL..',
  '....F..LLLL...',
];

// ----------------------------------------------------------------------------
// SIZE 1: 19x13 art px with longer flowing tail and small dorsal fin
// ----------------------------------------------------------------------------
const GRID_FISH_1_F0 = [
  '..........TTT......',
  '........TTTTTT.....',
  '.....FF.TTBBBBT....',
  '...FFFFTTBBBBBBT...',
  '.FFFFFFTBBBBBBBTHP.',
  'FFFFFFFFBBBBBBBCEP.',
  '.FFFFFFBBBBBBBBBBB.',
  '..FFFFFBBBBBBBBBBB.',
  '...FFFLLLLLLLLLLLLB',
  '....F.LLLLLLLLLLLL.',
  '......LLLLLLLLLLL..',
  '.......LLLLLLLLL...',
  '........LLLLLLL....',
];

const GRID_FISH_1_F1 = [
  '..........TTT......',
  '........TTTTTT.....',
  '........TTBBBBT....',
  '.......TTBBBBBBT...',
  '.....F.TBBBBBBBTHP.',
  '...FFFFTBBBBBBBCEP.',
  '.FFFFFFBBBBBBBBBBB.',
  'FFFFFFFFBBBBBBBBBBB',
  '.FFFFFFLLLLLLLLLLLB',
  '..FFFFLLLLLLLLLLLL.',
  '...FF.LLLLLLLLLLL..',
  '....F..LLLLLLLLL...',
  '........LLLLLLL....',
];

// Size 1 Dying: X-eye (PE / EP) & no blush
const GRID_FISH_1_DYING_F0 = [
  '..........TTT......',
  '........TTTTTT.....',
  '.....FF.TTBBBBT....',
  '...FFFFTTBBBBBBT...',
  '.FFFFFFTBBBBBBBTPE.',
  'FFFFFFFFBBBBBBBEP..',
  '.FFFFFFBBBBBBBBBBB.',
  '..FFFFFBBBBBBBBBBB.',
  '...FFFLLLLLLLLLLLLB',
  '....F.LLLLLLLLLLLL.',
  '......LLLLLLLLLLL..',
  '.......LLLLLLLLL...',
  '........LLLLLLL....',
];

const GRID_FISH_1_DYING_F1 = [
  '..........TTT......',
  '........TTTTTT.....',
  '........TTBBBBT....',
  '.......TTBBBBBBT...',
  '.....F.TBBBBBBBTPE.',
  '...FFFFTBBBBBBBEP..',
  '.FFFFFFBBBBBBBBBBB.',
  'FFFFFFFFBBBBBBBBBBB',
  '.FFFFFFLLLLLLLLLLLB',
  '..FFFFLLLLLLLLLLLL.',
  '...FF.LLLLLLLLLLL..',
  '....F..LLLLLLLLL...',
  '........LLLLLLL....',
];

// ----------------------------------------------------------------------------
// SIZE 2: 25x17 art px with fanned crest fin
// ----------------------------------------------------------------------------
const GRID_FISH_2_F0 = [
  '...........TT.TT.TT......',
  '..........TTTTTTTTTT.....',
  '.......TTTTTTTTTTTTTT....',
  '......TTTBBBBBBBBBBTT....',
  '....F.TTBBBBBBBBBBBBT....',
  '..FFFFTTBBBBBBBBBBBBT....',
  '.FFFFFFTBBBBBBBBBBBBTHP..',
  'FFFFFFFFTBBBBBBBBBBBCEP..',
  'FFFFFFFFBBBBBBBBBBBBBBBB.',
  'FFFFFFFFBBBBBBBBBBBBBBBB.',
  '.FFFFFFFBBBBBBBBBBBBBBBB.',
  '..FFFFFFLLLLLLLLLLLLLLLB.',
  '...FFFF.LLLLLLLLLLLLLLLL.',
  '.....F..LLLLLLLLLLLLLLL..',
  '........LLLLLLLLLLLLLL...',
  '.........LLLLLLLLLLLL....',
  '...........LLLLLLLL......',
];

const GRID_FISH_2_F1 = [
  '...........TT.TT.TT......',
  '..........TTTTTTTTTT.....',
  '.......TTTTTTTTTTTTTT....',
  '......TTTBBBBBBBBBBTT....',
  '.......TTBBBBBBBBBBBBT...',
  '......TTBBBBBBBBBBBBT....',
  '....F.TBBBBBBBBBBBBTHP...',
  '..FFFFTBBBBBBBBBBBCEP....',
  '.FFFFFFBBBBBBBBBBBBBBBB..',
  'FFFFFFFFBBBBBBBBBBBBBBBB.',
  'FFFFFFFFBBBBBBBBBBBBBBBB.',
  '.FFFFFFLLLLLLLLLLLLLLLB..',
  '..FFFFF.LLLLLLLLLLLLLLLL.',
  '...FF...LLLLLLLLLLLLLLL..',
  '....F...LLLLLLLLLLLLLL...',
  '.........LLLLLLLLLLLL....',
  '...........LLLLLLLL......',
];

// Size 2 Dying: X-eye (PE / EP) & no blush
const GRID_FISH_2_DYING_F0 = [
  '...........TT.TT.TT......',
  '..........TTTTTTTTTT.....',
  '.......TTTTTTTTTTTTTT....',
  '......TTTBBBBBBBBBBTT....',
  '....F.TTBBBBBBBBBBBBT....',
  '..FFFFTTBBBBBBBBBBBBT....',
  '.FFFFFFTBBBBBBBBBBBBTPE..',
  'FFFFFFFFTBBBBBBBBBBBEP...',
  'FFFFFFFFBBBBBBBBBBBBBBBB.',
  'FFFFFFFFBBBBBBBBBBBBBBBB.',
  '.FFFFFFFBBBBBBBBBBBBBBBB.',
  '..FFFFFFLLLLLLLLLLLLLLLB.',
  '...FFFF.LLLLLLLLLLLLLLLL.',
  '.....F..LLLLLLLLLLLLLLL..',
  '........LLLLLLLLLLLLLL...',
  '.........LLLLLLLLLLLL....',
  '...........LLLLLLLL......',
];

const GRID_FISH_2_DYING_F1 = [
  '...........TT.TT.TT......',
  '..........TTTTTTTTTT.....',
  '.......TTTTTTTTTTTTTT....',
  '......TTTBBBBBBBBBBTT....',
  '.......TTBBBBBBBBBBBBT...',
  '......TTBBBBBBBBBBBBT....',
  '....F.TBBBBBBBBBBBBTPE...',
  '..FFFFTBBBBBBBBBBBEP.....',
  '.FFFFFFBBBBBBBBBBBBBBBB..',
  'FFFFFFFFBBBBBBBBBBBBBBBB.',
  'FFFFFFFFBBBBBBBBBBBBBBBB.',
  '.FFFFFFLLLLLLLLLLLLLLLB..',
  '..FFFFF.LLLLLLLLLLLLLLLL.',
  '...FF...LLLLLLLLLLLLLLL..',
  '....F...LLLLLLLLLLLLLL...',
  '.........LLLLLLLLLLLL....',
  '...........LLLLLLLL......',
];

// ----------------------------------------------------------------------------
// DITHER & FLIP UTILITIES FOR ORDERED-DITHER DEATH FADE (4 STEPS)
// ----------------------------------------------------------------------------
function applyDitherStep(canvas: HTMLCanvasElement, step: number): HTMLCanvasElement {
  if (step === 0) return canvas;
  const dCanvas = document.createElement('canvas');
  dCanvas.width = canvas.width;
  dCanvas.height = canvas.height;
  const ctx = dCanvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0);

  // 2x2 Bayer dither clear:
  // Step 1: clear (x%2==0 && y%2==0) -> 25% cleared, 75% remains
  // Step 2: clear ((x+y)%2==0) -> 50% cleared, 50% remains
  // Step 3: clear !(x%2==1 && y%2==1) -> 75% cleared, 25% remains
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      let clear = false;
      if (step === 1) {
        clear = (x % 2 === 0 && y % 2 === 0);
      } else if (step === 2) {
        clear = ((x + y) % 2 === 0);
      } else if (step >= 3) {
        clear = !(x % 2 === 1 && y % 2 === 1);
      }
      if (clear) {
        ctx.clearRect(x, y, 1, 1);
      }
    }
  }
  return dCanvas;
}

function createFlippedCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const f = document.createElement('canvas');
  f.width = canvas.width;
  f.height = canvas.height;
  const ctx = f.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(canvas, 0, 0);
  return f;
}

function bakeSilhouette(sprite: HTMLCanvasElement, color: string): HTMLCanvasElement {
  const sCanvas = document.createElement('canvas');
  sCanvas.width = sprite.width;
  sCanvas.height = sprite.height;
  const sCtx = sCanvas.getContext('2d')!;
  sCtx.imageSmoothingEnabled = false;
  sCtx.drawImage(sprite, 0, 0);
  sCtx.globalCompositeOperation = 'source-in';
  sCtx.fillStyle = color;
  sCtx.fillRect(0, 0, sprite.width, sprite.height);
  return sCanvas;
}

const C_SPECIES: Record<string, PaletteKey> = {
  X: 'outline',
  O: 'orange',
  d: 'deepOrange',
  c: 'coral',
  b: 'belly',
  g: 'hungryGreen',
  l: 'glow',
  w: 'waterLight',
  m: 'waterMid',
  u: 'waterDeep',
  k: 'waterDark',
  s: 'sand',
  h: 'sandShade',
  y: 'gold',
  v: 'silver',
  r: 'diamond',
  G: 'alienGreen',
  D: 'alienDark',
  P: 'carnivorePurple',
  K: 'carnivoreDark',
  t: 'tan',
  B: 'dimBrown',
  e: 'cream',
  W: 'white',
};

function bakeSpeciesSprite(
  grid: string[],
  glowColor: string | null = null
): BakedSprite {
  const base = bakeExactSprite(grid, C_SPECIES);
  const normal = base.normal;
  const flipped = base.flipped;

  const silNormal = bakeSilhouette(normal, '#1c1917');
  const silFlipped = createFlippedCanvas(silNormal);

  let glowNormal: HTMLCanvasElement | undefined = undefined;
  let glowFlipped: HTMLCanvasElement | undefined = undefined;
  if (glowColor) {
    glowNormal = bakeSilhouette(normal, glowColor);
    glowFlipped = createFlippedCanvas(glowNormal);
  }

  return {
    normal,
    flipped,
    glowNormal,
    glowFlipped,
    silNormal,
    silFlipped,
    width: base.width,
    height: base.height,
    originX: base.originX,
    originY: base.originY,
  };
}

// 18x12 Grids for 10 unique species
const GRID_PIP_F0 = [
  '.....XXXXX........',
  '....XOeeOX........',
  '..XXXOeeOXXXX.....',
  '.XOWWXOOXXWWXX..XX',
  'XOWWWOOOOWWWWOXXXd',
  'XOWWWOOOOWWWWOXXdd',
  'XOOOOOOOOOOOOOXXd.',
  'XOOOOOOOOOOOOOOX..',
  '.XOOOOOOOddddXX...',
  '..XXdddddXXXX.....',
  '....XXXXX.........',
  '..................'
];
const GRID_PIP_F1 = [
  '.....XXXXX........',
  '....XOeeOX........',
  '..XXXOeeOXXXX.....',
  '.XOWWXOOXXWWXX....',
  'XOWWWOOOOWWWWOXX..',
  'XOWWWOOOOWWWWOXXdd',
  'XOOOOOOOOOOOOOXXXd',
  'XOOOOOOOOOOOOOOXXd',
  '.XOOOOOOOddddXX...',
  '..XXdddddXXXX.....',
  '....XXXXX.........',
  '..................'
];

const GRID_MARINA_F0 = [
  '.....XXXX.........',
  '....XWWWXX........',
  '..XXWWWWWWX.......',
  '.XWeeWWWWWXX....XX',
  'XWeeWWWWWWWWXXXXyy',
  'XWWWWWWWWWWWXXyyyy',
  'XWWWWWWWWWWWWWXXy.',
  '.XWWWWWWWWWWWWX...',
  '..XWWWWWWyyyXX....',
  '...XXyyyyXXXX.....',
  '.....XXXX.........',
  '..................'
];
const GRID_MARINA_F1 = [
  '.....XXXX.........',
  '....XWWWXX........',
  '..XXWWWWWWX.......',
  '.XWeeWWWWWXX......',
  'XWeeWWWWWWWWXX....',
  'XWWWWWWWWWWWXXyyyy',
  'XWWWWWWWWWWWWWXXyy',
  '.XWWWWWWWWWWWWXXy.',
  '..XWWWWWWyyyXX....',
  '...XXyyyyXXXX.....',
  '.....XXXX.........',
  '..................'
];

const GRID_DOT_F0 = [
  '......XXXX........',
  '....XXyyyyXX......',
  '...XyyyyOyyyX.....',
  '..XyyOyyyyOyyX..XX',
  '.XyeeyyyyyOyyyXXyy',
  'XyeeyyyyyyyyyyXyyy',
  'XyyyyyyyyOyyyyXyy.',
  '.XyyyyOyyyyyyX....',
  '..XyyyyyyyyyX.....',
  '...XXyyyyyXX......',
  '.....XXXXX........',
  '..................'
];
const GRID_DOT_F1 = [
  '......XXXX........',
  '....XXyyyyXX......',
  '...XyyyyOyyyX.....',
  '..XyyOyyyyOyyX....',
  '.XyeeyyyyyOyyyXX..',
  'XyeeyyyyyyyyyyXyyy',
  'XyyyyyyyyOyyyyXyyy',
  '.XyyyyOyyyyyyXyyy.',
  '..XyyyyyyyyyX.....',
  '...XXyyyyyXX......',
  '.....XXXXX........',
  '..................'
];

const GRID_BUMBLE_F0 = [
  '.....XXXX.........',
  '....XyyyBXX.......',
  '...XyyyByyyX......',
  '..XyeeyByyyyX...XX',
  '.XyeeyyByyyyXXXXyy',
  'XyyyyyyByyyyXXyyyy',
  'XyyyyyyByyyyXXyyy.',
  '.XyyyyyByyyyX.....',
  '..XyyyyByyyX......',
  '...XXyyBXXX.......',
  '.....XXXX.........',
  '..................'
];
const GRID_BUMBLE_F1 = [
  '.....XXXX.........',
  '....XyyyBXX.......',
  '...XyyyByyyX......',
  '..XyeeyByyyyX.....',
  '.XyeeyyByyyyXX....',
  'XyyyyyyByyyyXXyyyy',
  'XyyyyyyByyyyXXyyy.',
  '.XyyyyyByyyyXXyy..',
  '..XyyyyByyyX......',
  '...XXyyBXXX.......',
  '.....XXXX.........',
  '..................'
];

const GRID_SOL_F0 = [
  '...cc..cc..cc.....',
  '..cOOccOOccOOc....',
  '.cOOOOOOOOOOOOc...',
  'cOOeeOOOOOOOOOOcXX',
  'cOOeeOOOOOOOOOOXOO',
  'cOOOOOOOOOOOOOOXOO',
  'cOOOOOOOOOOOOOOcXX',
  '.cOOOOOOOOOOOOc...',
  '..cOOccOOccOOc....',
  '...cc..cc..cc.....',
  '..................',
  '..................'
];
const GRID_SOL_F1 = [
  '...cc..cc..cc.....',
  '..cOOccOOccOOc....',
  '.cOOOOOOOOOOOOc...',
  'cOOeeOOOOOOOOOOc..',
  'cOOeeOOOOOOOOOOX..',
  'cOOOOOOOOOOOOOOXOO',
  'cOOOOOOOOOOOOOOXOO',
  '.cOOOOOOOOOOOOcXX.',
  '..cOOccOOccOOc....',
  '...cc..cc..cc.....',
  '..................',
  '..................'
];

const GRID_LUMI_F0 = [
  '.....XXXX.........',
  '....XuuuXX........',
  '..XXuuuuuX........',
  '.XueeuuuuXX.....XX',
  'XueeuuuuuuuXXXXyy',
  'XuuuuuuuuuuXXyyyy',
  'XuuuuuuuuuuuuXXy.',
  '.XuuuuuuuuuuuX...',
  '..XuuuuuuuyyXX....',
  '...XXyyyyXXXX.....',
  '.....XXXX.........',
  '..................'
];
const GRID_LUMI_F1 = [
  '.....XXXX.........',
  '....XuuuXX........',
  '..XXuuuuuX........',
  '.XueeuuuuXX.......',
  'XueeuuuuuuuXX.....',
  'XuuuuuuuuuuXXyyyy',
  'XuuuuuuuuuuuuXXyy',
  '.XuuuuuuuuuuuXXy.',
  '..XuuuuuuuyyXX....',
  '...XXyyyyXXXX.....',
  '.....XXXX.........',
  '..................'
];

const GRID_NOX_F0 = [
  '.....XXXX.........',
  '....XPPPXX........',
  '..XXPPPPPPX.......',
  '.XeeePPPPPXX....XX',
  'XeeePPPPPPPPXXXXrr',
  'XPPPPPPPPPPPXXrrrr',
  'XPPPPPPPPPPPPPXXr.',
  '.XPPPPPPPPPPPPX...',
  '..XPPPPPPPrrrXX....',
  '...XXrrrrXXXX.....',
  '.....XXXX.........',
  '..................'
];
const GRID_NOX_F1 = [
  '.....XXXX.........',
  '....XPPPXX........',
  '..XXPPPPPPX.......',
  '.XeeePPPPPXX......',
  'XeeePPPPPPPPXX....',
  'XPPPPPPPPPPPXXrrrr',
  'XPPPPPPPPPPPPPXXrr',
  '.XPPPPPPPPPPPPXXr.',
  '..XPPPPPPPrrrXX....',
  '...XXrrrrXXXX.....',
  '.....XXXX.........',
  '..................'
];

const GRID_GLIMMER_F0 = [
  '.....XXXX.........',
  '....XrrrcXX.......',
  '..XXrrrrccX.......',
  '.XeeerrrccXX....XX',
  'XeeerrrrcccccXXXcc',
  'XrrrrrrrcccccXXccc',
  'XrrrrrccccccXXcc..',
  '.XrrrcccccccX.....',
  '..XrrccccccXX.....',
  '...XXccccXXXX.....',
  '.....XXXX.........',
  '..................'
];
const GRID_GLIMMER_F1 = [
  '.....XXXX.........',
  '....XrrrcXX.......',
  '..XXrrrrccX.......',
  '.XeeerrrccXX......',
  'XeeerrrrcccccXX...',
  'XrrrrrrrcccccXXccc',
  'XrrrrrccccccXXcc..',
  '.XrrrcccccccXXcc..',
  '..XrrccccccXX.....',
  '...XXccccXXXX.....',
  '.....XXXX.........',
  '..................'
];

const GRID_VEIL_F0 = [
  '.....XXXX.........',
  '....XvvvXX........',
  '..XXvvvvvvX.......',
  '.XeeevvvvvXX....XX',
  'XeeevvvvvvvvXXXXvv',
  'XvvvvvvvvvvvXXvvvv',
  'XvvvvvvvvvvvvvXXv.',
  '.XvvvvvvvvvvvvX...',
  '..XvvvvvvvvvXX....',
  '...XXvvvvXXXX.....',
  '.....XXXX.........',
  '..................'
];
const GRID_VEIL_F1 = [
  '.....XXXX.........',
  '....XvvvXX........',
  '..XXvvvvvvX.......',
  '.XeeevvvvvXX......',
  'XeeevvvvvvvvXX....',
  'XvvvvvvvvvvvXXvvvv',
  'XvvvvvvvvvvvvvXXvv',
  '.XvvvvvvvvvvvvXXv.',
  '..XvvvvvvvvvXX....',
  '...XXvvvvXXXX.....',
  '.....XXXX.........',
  '..................'
];

const GRID_AURORA_F0 = [
  '.....X..X..X......',
  '....XGXXGXXGX.....',
  '..XXGGGGGGGGX.....',
  '.XeeeGGGGGGGXX..XX',
  'XeeeGGGGGGGGPPXXPP',
  'XGGGGGGGGGGPPPXXPP',
  'XGGGGGGGGGGPPPXXP.',
  '.XGGGGGGGGPPPX....',
  '..XGGGGGGGPPXX....',
  '...XXPPPPXXXX.....',
  '.....XXXX.........',
  '..................'
];
const GRID_AURORA_F1 = [
  '.....X..X..X......',
  '....XGXXGXXGX.....',
  '..XXGGGGGGGGX.....',
  '.XeeeGGGGGGGXX....',
  'XeeeGGGGGGGGPPXX..',
  'XGGGGGGGGGGPPPXXPP',
  'XGGGGGGGGGGPPPXXPP',
  '.XGGGGGGGGPPPXXP..',
  '..XGGGGGGGPPXX....',
  '...XXPPPPXXXX.....',
  '.....XXXX.........',
  '..................'
];

// SPECIES SPRITES compiled array
export const SPECIES_SPRITES: BakedSprite[][] = [
  // Level 1: PIP
  [bakeSpeciesSprite(GRID_PIP_F0), bakeSpeciesSprite(GRID_PIP_F1)],
  // Level 2: MARINA
  [bakeSpeciesSprite(GRID_MARINA_F0), bakeSpeciesSprite(GRID_MARINA_F1)],
  // Level 3: DOT
  [bakeSpeciesSprite(GRID_DOT_F0), bakeSpeciesSprite(GRID_DOT_F1)],
  // Level 4: BUMBLE
  [bakeSpeciesSprite(GRID_BUMBLE_F0), bakeSpeciesSprite(GRID_BUMBLE_F1)],
  // Level 5: SOL
  [bakeSpeciesSprite(GRID_SOL_F0), bakeSpeciesSprite(GRID_SOL_F1)],
  // Level 6: LUMI (Glow: gold)
  [bakeSpeciesSprite(GRID_LUMI_F0, '#ffc83d'), bakeSpeciesSprite(GRID_LUMI_F1, '#ffc83d')],
  // Level 7: NOX (Glow: diamond)
  [bakeSpeciesSprite(GRID_NOX_F0, '#8ee8ff'), bakeSpeciesSprite(GRID_NOX_F1, '#8ee8ff')],
  // Level 8: GLIMMER (Glow: coral)
  [bakeSpeciesSprite(GRID_GLIMMER_F0, '#e8604c'), bakeSpeciesSprite(GRID_GLIMMER_F1, '#e8604c')],
  // Level 9: VEIL (Glow: silver)
  [bakeSpeciesSprite(GRID_VEIL_F0, '#d9e2ea'), bakeSpeciesSprite(GRID_VEIL_F1, '#d9e2ea')],
  // Level 10: AURORA (Glow: alienGreen)
  [bakeSpeciesSprite(GRID_AURORA_F0, '#7cc95a'), bakeSpeciesSprite(GRID_AURORA_F1, '#7cc95a')],
];

function bakeDitheredSteps(base: BakedSprite): BakedSprite[] {
  const steps: BakedSprite[] = [];
  for (let s = 0; s < 4; s++) {
    const normal = applyDitherStep(base.normal, s);
    const flipped = s === 0 ? base.flipped : createFlippedCanvas(normal);
    steps.push({
      normal,
      flipped,
      width: base.width,
      height: base.height,
      originX: base.originX,
      originY: base.originY,
    });
  }
  return steps;
}

// ============================================================================
// CARNIVORE FISH (30 art px, carnivorePurple & carnivoreDark, underbite with
// visible tooth pixels, spiky dorsal fin, 2-frame tail, and hunting eye glint)
// ============================================================================
const C_CARNIVORE: Record<string, PaletteKey> = {
  P: 'carnivorePurple',
  D: 'carnivoreDark',
  T: 'cream',          // Sharp tooth pixels
  E: 'gold',           // Predator eye
  X: 'outline',        // Pupil / outline
  L: 'belly',          // Jaw/belly highlight
};

const C_CARNIVORE_DYING: Record<string, PaletteKey> = {
  P: 'silver',
  D: 'outline',
  T: 'cream',
  E: 'outline',
  X: 'outline',
  L: 'silver',
};

// Carnivore Frame 0 (Tail up)
const GRID_CARNIVORE_F0 = [
  '.........DD.DD.DD.............',
  '........DPPDPPDPP.............',
  '.......DPPPPPPPPPP............',
  '......DPPPPPPPPPPPP...........',
  '.....DPPPPPPPPPPPPPP..........',
  '...PPPPPPPPPPPPPPPPPP....PP...',
  '..PEEXPPPPPPPPPPPPPPPP..PPPP..',
  '.PEEXXPPPPPPPPPPPPPPPPPDPPPP..',
  '.PPPPPPPPPPPPPPPPPPPPPPDPPPP..',
  '..PPPPPPPPPPPPPPPPPPPPPDDPPP..',
  '..TT..PPPPPPPPPPPPPPPPPDD.....',
  '.TTTTTLLLLLLLLDDDDDDDDDD......',
  'TTTTTTLLLLLLLLDDDDDDDDD.......',
  '.TTTTTLLLLLLLLDDDDDDDD........',
  '..TTTLLLLLLLLDDDDDDDD.........',
  '...LLLLLLLLLLDDDDDDD..........',
  '.....LLLLLLLDDDDD.............',
  '.......LLLDDDD................',
];

// Carnivore Frame 1 (Tail down)
const GRID_CARNIVORE_F1 = [
  '.........DD.DD.DD.............',
  '........DPPDPPDPP.............',
  '.......DPPPPPPPPPP............',
  '......DPPPPPPPPPPPP...........',
  '.....DPPPPPPPPPPPPPP..........',
  '...PPPPPPPPPPPPPPPPPP.........',
  '..PEEXPPPPPPPPPPPPPPPP........',
  '.PEEXXPPPPPPPPPPPPPPPPPDD.....',
  '.PPPPPPPPPPPPPPPPPPPPPDDPPP...',
  '..PPPPPPPPPPPPPPPPPPPPPDPPPP..',
  '..TT..PPPPPPPPPPPPPPPPPDPPPP..',
  '.TTTTTLLLLLLLLDDDDDDDD..PPPP..',
  'TTTTTTLLLLLLLLDDDDDDDDD..PP...',
  '.TTTTTLLLLLLLLDDDDDDDD........',
  '..TTTLLLLLLLLDDDDDDDD.........',
  '...LLLLLLLLLLDDDDDDD..........',
  '.....LLLLLLLDDDDD.............',
  '.......LLLDDDD................',
];

export const CARNIVORE_SPRITES = {
  normal: [
    bakeSprite(GRID_CARNIVORE_F0, C_CARNIVORE),
    bakeSprite(GRID_CARNIVORE_F1, C_CARNIVORE),
  ],
  dying: [
    bakeDitheredSteps(bakeSprite(GRID_CARNIVORE_F0, C_CARNIVORE_DYING)),
    bakeDitheredSteps(bakeSprite(GRID_CARNIVORE_F1, C_CARNIVORE_DYING)),
  ],
};

export function getCarnivoreSprite(
  frame: 0 | 1,
  state: 'normal' | 'dying' = 'normal',
  ditherStep: 0 | 1 | 2 | 3 = 0
): BakedSprite {
  if (state === 'dying') {
    const list = CARNIVORE_SPRITES.dying[frame % 2];
    return list[ditherStep] || list[0];
  }
  return CARNIVORE_SPRITES.normal[frame % 2];
}

// ============================================================================
// ALIEN GARGO (35 art px blob, 3-frame body wobble swapping every 0.2s:
// alienGreen body, alienDark shade, 1px lighter highlight, two angry eyes with
// brow pixels, small fang pixels, five tentacles on a 2-frame wave.
// 0.1s hit flash uses baked all-white silhouette.)
// ============================================================================
const C_GARGO: Record<string, PaletteKey> = {
  G: 'alienGreen',
  D: 'alienDark',
  L: 'hungryGreen', // 1px lighter highlight
  C: 'cream',       // Eye eyeball
  P: 'outline',     // Eye pupil
  B: 'alienDark',   // Angry brow
  F: 'cream',       // Small fang pixels
};

const C_GARGO_FLASH: Record<string, PaletteKey> = {
  G: 'white',
  D: 'white',
  L: 'white',
  C: 'white',
  P: 'white',
  B: 'white',
  F: 'white',
};

// Gargo Frame 0 (Wave Left)
const GRID_GARGO_F0 = [
  '..........LLLLLLLLLL...............',
  '........LLGGGGGGGGGGLL.............',
  '......LLGGGGGGGGGGGGGGLL...........',
  '.....LGGGGGGGGGGGGGGGGGGLL.........',
  '....LGGGGGGGGGGGGGGGGGGGGGL........',
  '...LGGGGGGGGGGGGGGGGGGGGGGGD.......',
  '..LGGGGGGGGGGGGGGGGGGGGGGGGGD......',
  '..LGGGGGBBGGGGGGGGGGGBBGGGGGGD.....',
  '.LGGGGGGBPBGGGGGGGGGBPBGGGGGGGD....',
  '.LGGGGGCPPCGGGGGGGGGCPPCGGGGGGGD...',
  'LGGGGGGCPPCGGGGGGGGGCPPCGGGGGGGGD..',
  'LGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGD..',
  'LGGGGGGGDDDGGGGGGGGGDDDGGGGGGGGGD..',
  'LGGGGGGDDDDDDDDDDDDDDDDDGGGGGGGGD..',
  'LGGGGGGDDDFDDDFDDDFDDDDDGGGGGGGGD..',
  'LGGGGGGDDDDDDDDDDDDDDDDDGGGGGGGGD..',
  'LGGGGGGGDDDGGGGGGGGGDDDGGGGGGGGGD..',
  '.LGGGGGGGGGGGGGGGGGGGGGGGGGGGGGD...',
  '.LGGGGGGGGGGGGGGGGGGGGGGGGGGGGGD...',
  '..DGGGGGGGGGGGGGGGGGGGGGGGGGGGD....',
  '...DGGGGGGGGGGGGGGGGGGGGGGGGDD.....',
  '....DDGGGGGGGGGGGGGGGGGGGGDDD......',
  '.....DDDDGGGGGGGGGGGGGGDDDD........',
  '.......DDDDDDDDDDDDDDDDDD..........',
  '........DDDDDDDDDDDDDDDD...........',
  '...DDD....DDD....DDD....DDD....DDD.',
  '..DDDD...DDDD...DDDD...DDDD...DDDD.',
  '..DDDD...DDDD...DDDD...DDDD...DDDD.',
  '.DDDD...DDDD...DDDD...DDDD...DDDD..',
  '.DDD....DDD....DDD....DDD....DDD...',
  'DD.....DD.....DD.....DD.....DD.....',
  'DD.....DD.....DD.....DD.....DD.....',
  'D......D......D......D......D......',
  '...................................',
  '...................................',
];

// Gargo Frame 1 (Center Body Wobble)
const GRID_GARGO_F1 = [
  '...........LLLLLLLLLL..............',
  '.........LLGGGGGGGGGGLL............',
  '.......LLGGGGGGGGGGGGGGLL..........',
  '......LGGGGGGGGGGGGGGGGGGLL........',
  '.....LGGGGGGGGGGGGGGGGGGGGL........',
  '....LGGGGGGGGGGGGGGGGGGGGGGD.......',
  '...LGGGGGGGGGGGGGGGGGGGGGGGGD......',
  '...LGGGGGBBGGGGGGGGGGGBBGGGGGD.....',
  '..LGGGGGGBPBGGGGGGGGGBPBGGGGGGD....',
  '..LGGGGGCPPCGGGGGGGGGCPPCGGGGGGD...',
  '.LGGGGGGCPPCGGGGGGGGGCPPCGGGGGGGD..',
  '.LGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGD..',
  '.LGGGGGGDDDGGGGGGGGGDDDGGGGGGGGGD..',
  '.LGGGGGDDDDDDDDDDDDDDDDDGGGGGGGGD..',
  '.LGGGGGDDDFDDDFDDDFDDDDDGGGGGGGGD..',
  '.LGGGGGDDDDDDDDDDDDDDDDDGGGGGGGGD..',
  '.LGGGGGGDDDGGGGGGGGGDDDGGGGGGGGGD..',
  '..LGGGGGGGGGGGGGGGGGGGGGGGGGGGGGD..',
  '..LGGGGGGGGGGGGGGGGGGGGGGGGGGGGGD..',
  '...DGGGGGGGGGGGGGGGGGGGGGGGGGGDD...',
  '....DGGGGGGGGGGGGGGGGGGGGGGGGDD....',
  '.....DDGGGGGGGGGGGGGGGGGGGGDDD.....',
  '......DDDDGGGGGGGGGGGGGGDDDD.......',
  '........DDDDDDDDDDDDDDDDDD.........',
  '.........DDDDDDDDDDDDDDDD..........',
  '....DDD....DDD....DDD....DDD....DDD',
  '...DDDD...DDDD...DDDD...DDDD...DDDD',
  '...DDDD...DDDD...DDDD...DDDD...DDDD',
  '...DDDD...DDDD...DDDD...DDDD...DDDD',
  '....DDD....DDD....DDD....DDD....DDD',
  '....DD.....DD.....DD.....DD.....DD.',
  '....DD.....DD.....DD.....DD.....DD.',
  '....D......D......D......D......D..',
  '...................................',
  '...................................',
];

// Gargo Frame 2 (Wave Right)
const GRID_GARGO_F2 = [
  '..............LLLLLLLLLL...........',
  '............LLGGGGGGGGGGLL.........',
  '..........LLGGGGGGGGGGGGGGLL.......',
  '........LLGGGGGGGGGGGGGGGGGGGL.....',
  '.......LGGGGGGGGGGGGGGGGGGGGGGL....',
  '......LGGGGGGGGGGGGGGGGGGGGGGGGD...',
  '.....LGGGGGGGGGGGGGGGGGGGGGGGGGGD..',
  '....LGGGGGBBGGGGGGGGGGGBBGGGGGGGGD.',
  '...LGGGGGGBPBGGGGGGGGGBPBGGGGGGGGD.',
  '...LGGGGGCPPCGGGGGGGGGCPPCGGGGGGGGD',
  '..LGGGGGGCPPCGGGGGGGGGCPPCGGGGGGGGD',
  '..LGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGD',
  '..LGGGGGGGDDDGGGGGGGGGDDDGGGGGGGGGD',
  '..LGGGGGGDDDDDDDDDDDDDDDDDGGGGGGGD.',
  '..LGGGGGGDDDFDDDFDDDFDDDDDGGGGGGGD.',
  '..LGGGGGGDDDDDDDDDDDDDDDDDGGGGGGGD.',
  '..LGGGGGGGDDDGGGGGGGGGDDDGGGGGGGGGD',
  '...LGGGGGGGGGGGGGGGGGGGGGGGGGGGGGD.',
  '...LGGGGGGGGGGGGGGGGGGGGGGGGGGGGGD.',
  '....DGGGGGGGGGGGGGGGGGGGGGGGGGGGD..',
  '.....DDGGGGGGGGGGGGGGGGGGGGGGGDD...',
  '......DDDGGGGGGGGGGGGGGGGGGGGDD....',
  '........DDDDGGGGGGGGGGGGGGDDDD.....',
  '..........DDDDDDDDDDDDDDDDDD.......',
  '...........DDDDDDDDDDDDDDDD........',
  '.DDD....DDD....DDD....DDD....DDD...',
  '.DDDD...DDDD...DDDD...DDDD...DDDD..',
  '.DDDD...DDDD...DDDD...DDDD...DDDD..',
  '..DDDD...DDDD...DDDD...DDDD...DDDD.',
  '...DDD....DDD....DDD....DDD....DDD.',
  '.....DD.....DD.....DD.....DD.....DD',
  '.....DD.....DD.....DD.....DD.....DD',
  '......D......D......D......D......D',
  '...................................',
  '...................................',
];

export const GARGO_SPRITES = {
  normal: [
    bakeSprite(GRID_GARGO_F0, C_GARGO),
    bakeSprite(GRID_GARGO_F1, C_GARGO),
    bakeSprite(GRID_GARGO_F2, C_GARGO),
  ],
  flash: [
    bakeSprite(GRID_GARGO_F0, C_GARGO_FLASH),
    bakeSprite(GRID_GARGO_F1, C_GARGO_FLASH),
    bakeSprite(GRID_GARGO_F2, C_GARGO_FLASH),
  ],
};

export function getGargoSprite(frame: 0 | 1 | 2, isFlash: boolean): BakedSprite {
  const list = isFlash ? GARGO_SPRITES.flash : GARGO_SPRITES.normal;
  return list[frame % 3];
}

// ============================================================================
// SNAIL (14 art px, spiral shell in sand & orange, eyestalks bobbing 1px)
// ============================================================================
const C_SNAIL: Record<string, PaletteKey> = {
  S: 'sand',        // Shell base
  O: 'orange',      // Spiral swirl
  D: 'sandShade',   // Shell shade
  T: 'tan',         // Body foot
  E: 'outline',     // Eye dots
};

// Snail Frame 0 (Eyestalks normal)
const GRID_SNAIL_F0 = [
  '...........E..',
  '.....DDDD..T..',
  '..DDSOOOOSDT..',
  '.DSOOSSSOOSD..',
  '.DSOSTTSSOSDT.',
  'DSOSTTTTSOSDTT',
  'DSOOSSSSOOSDTT',
  'DDSOOOOOOSDDTT',
  '.TTTTTTTTTTTTT',
  '..TTTTTTTTTTT.',
];

// Snail Frame 1 (Eyestalks bobbed up 1px)
const GRID_SNAIL_F1 = [
  '...........E..',
  '.....DDDD..T..',
  '..DDSOOOOSD...',
  '.DSOOSSSOOSDT.',
  '.DSOSTTSSOSDTT',
  'DSOSTTTTSOSDTT',
  'DSOOSSSSOOSDTT',
  'DDSOOOOOOSDDTT',
  '.TTTTTTTTTTTTT',
  '..TTTTTTTTTTT.',
];

export const SNAIL_SPRITES = [
  bakeSprite(GRID_SNAIL_F0, C_SNAIL),
  bakeSprite(GRID_SNAIL_F1, C_SNAIL),
];

export function getSnailSprite(frame: 0 | 1): BakedSprite {
  return SNAIL_SPRITES[frame % 2];
}

// ----------------------------------------------------------------------------
// PELLETS: 4x4 art px chunky pixels with 1px outline and 1px highlight
// Colored tan #e0b070, orange and gold by quality tier
// ----------------------------------------------------------------------------
const GRID_PELLET_4X4 = [
  'HMMM',
  'MMMM',
  'MMMM',
  'MMMM',
];

export const PELLET_SPRITES = [
  bakeSprite(GRID_PELLET_4X4, { H: 'cream', M: 'tan' }),    // Tier 0: Tan #e0b070
  bakeSprite(GRID_PELLET_4X4, { H: 'cream', M: 'orange' }), // Tier 1: Orange #f58a3d
  bakeSprite(GRID_PELLET_4X4, { H: 'cream', M: 'gold' }),   // Tier 2: Gold #ffc83d
];

export function getPelletSprite(tier: number = 0): BakedSprite {
  const t = Math.max(0, Math.min(2, tier));
  return PELLET_SPRITES[t];
}

// ----------------------------------------------------------------------------
// COINS: 4-frame spin (full, three-quarter, edge, three-quarter) at 8fps
// Silver: 6 art px
// Gold: 7 art px
// Diamond: 8 art px with rotating 1px sparkle
// Each frame pre-baked with 4-step ordered-dither fade
// ----------------------------------------------------------------------------

// Silver (6 art px)
const GRID_SILVER_F0 = [
  '.VVVV.',
  'VCCCVV',
  'VCWSCV',
  'VCWSCV',
  'VCCCCV',
  '.VVVV.',
];
const GRID_SILVER_F1 = [
  '.VV.',
  'VCCV',
  'VCWV',
  'VCWV',
  'VCCV',
  '.VV.',
];
const GRID_SILVER_F2 = [
  'VV',
  'VC',
  'VC',
  'VC',
  'VC',
  'VV',
];

// Gold (7 art px)
const GRID_GOLD_F0 = [
  '.GGGGG.',
  'GYYYYYG',
  'GYSSSSG',
  'GYSSSSG',
  'GYSSSSG',
  'GYYYYYG',
  '.GGGGG.',
];
const GRID_GOLD_F1 = [
  '.GGG.',
  'GYYYG',
  'GYSSG',
  'GYSSG',
  'GYSSG',
  'GYYYG',
  '.GGG.',
];
const GRID_GOLD_F2 = [
  'GG',
  'GY',
  'GY',
  'GY',
  'GY',
  'GY',
  'GG',
];

// Diamond (8 art px)
const GRID_DIAMOND_F0 = [
  '...DD...',
  '..DCCD..',
  '.DCCCCD.',
  'DCCWWCCD',
  'DCCWWCCD',
  '.DCCCCD.',
  '..DCCD..',
  '...DD...',
];
const GRID_DIAMOND_F1 = [
  '..DD..',
  '.DCCD.',
  'DCCCCD',
  'DCCWCD',
  'DCCWCD',
  'DCCCCD',
  '.DCCD.',
  '..DD..',
];
const GRID_DIAMOND_F2 = [
  'DD',
  'DC',
  'DC',
  'DW',
  'DW',
  'DC',
  'DC',
  'DD',
];

const BAKED_SILVER_FRAMES = [
  bakeDitheredSteps(bakeSprite(GRID_SILVER_F0, C_COIN)),
  bakeDitheredSteps(bakeSprite(GRID_SILVER_F1, C_COIN)),
  bakeDitheredSteps(bakeSprite(GRID_SILVER_F2, C_COIN)),
  bakeDitheredSteps(bakeSprite(GRID_SILVER_F1, C_COIN)),
];

const BAKED_GOLD_FRAMES = [
  bakeDitheredSteps(bakeSprite(GRID_GOLD_F0, C_COIN)),
  bakeDitheredSteps(bakeSprite(GRID_GOLD_F1, C_COIN)),
  bakeDitheredSteps(bakeSprite(GRID_GOLD_F2, C_COIN)),
  bakeDitheredSteps(bakeSprite(GRID_GOLD_F1, C_COIN)),
];

const BAKED_DIAMOND_FRAMES = [
  bakeDitheredSteps(bakeSprite(GRID_DIAMOND_F0, C_COIN)),
  bakeDitheredSteps(bakeSprite(GRID_DIAMOND_F1, C_COIN)),
  bakeDitheredSteps(bakeSprite(GRID_DIAMOND_F2, C_COIN)),
  bakeDitheredSteps(bakeSprite(GRID_DIAMOND_F1, C_COIN)),
];

export const COIN_SPRITES = {
  silver: BAKED_SILVER_FRAMES,
  gold: BAKED_GOLD_FRAMES,
  diamond: BAKED_DIAMOND_FRAMES,
};

export function getCoinSprite(
  type: 'silver' | 'gold' | 'diamond',
  frame: number,
  ditherStep: number = 0
): BakedSprite {
  const f = Math.abs(Math.floor(frame)) % 4;
  const d = Math.max(0, Math.min(3, Math.floor(ditherStep)));
  return COIN_SPRITES[type][f][d];
}

// Egg: 14x18
const GRID_EGG = [
  '......GGGG......', // y=0
  '.....GYYYYG.....', // y=1
  '....GYYYYYYG....', // y=2
  '...GYYYYYYYYG...', // y=3
  '..GYYYYYYYYYYG..', // y=4
  '..GYYYYYYYYYYG..', // y=5
  '.GYYYYYYYYYYYYG.', // y=6
  '.GYYYYYYYYYYYYG.', // y=7
  'GYYYYYYYYYYYYYYG', // y=8
  'GYYYYYYYYYYYYYYG', // y=9
  'GYYYYYYYYYYYYYYG', // y=10
  'GYYYYYYYYYYYYYYG', // y=11
  'GYYYYYYYYYYYYYYG', // y=12
  '.GYYYYYYYYYYYYG.', // y=13
  '.GYYYYYYYYYYYYG.', // y=14
  '..GYYYYYYYYYYG..', // y=15
  '...GGGGGGGGGG...', // y=16
];

// 6-Frame Egg Hatch Pixel Sequence:
// Frame 0: Wobble
// Frame 1: Crack lines
// Frame 2: Deep crack lines & inner glow
// Frame 3: Shell halves popping
// Frame 4: Baby fish emerging
// Frame 5: Baby fish bursting out with particle puff
const C_EGG_HATCH: Record<string, PaletteKey> = {
  G: 'gold',
  Y: 'glow',
  C: 'cream',
  X: 'outline',
  O: 'orange',
  B: 'belly',
  P: 'coral',
  D: 'diamond',
};

const GRID_EGG_HATCH_0 = [
  '......GGGG..........',
  '....GGYYYYGG........',
  '...GYYYYYYYYG.......',
  '..GYYYYYYYYYYG......',
  '..GYYYYYYYYYYG......',
  '.GYYYYYYYYYYYYG.....',
  '.GYYYYYYYYYYYYG.....',
  '.GYYYYYYYYYYYYG.....',
  '.GYYYYYYYYYYYYG.....',
  '.GYYYYYYYYYYYYG.....',
  '..GYYYYYYYYYYG......',
  '..GYYYYYYYYYYG......',
  '...GYYYYYYYYG.......',
  '....GGYYYYGG........',
  '......GGGG..........',
  '....................',
  '....................',
  '....................',
  '....................',
  '....................',
];

const GRID_EGG_HATCH_1 = [
  '.....GGGG...........',
  '...GGYYYYGG.........',
  '..GYYYYYYYYG........',
  '.GYYYYYYYYYYG.......',
  '.GYYYYYYYYYYG.......',
  'GYYYYYYXXYYYYG......',
  'GYYYYYXXYYYYYG......',
  'GYYYYXXYYYYYYG......',
  'GYYYYYXXYYYYYG......',
  'GYYYYYYXXYYYYG......',
  'GYYYYYXXYYYYYG......',
  '.GYYYYYYYYYYG.......',
  '.GYYYYYYYYYYG.......',
  '..GYYYYYYYYG........',
  '...GGYYYYGG.........',
  '.....GGGG...........',
  '....................',
  '....................',
  '....................',
  '....................',
];

const GRID_EGG_HATCH_2 = [
  '.....GGGG...........',
  '...GGYYYYGG.........',
  '..GYYYYYYYYG........',
  '.GYYYYYYYYYYG.......',
  '.GYYYYYCCYYYG.......',
  'GYYYYYCCXCCYYG......',
  'GYYYYCCX..XCCG......',
  'GYYYCCX....XCG......',
  'GYYYYCCX..XCCG......',
  'GYYYYYCCXCCYYG......',
  'GYYYYYYCCYYYYG......',
  '.GYYYYYYYYYYG.......',
  '.GYYYYYYYYYYG.......',
  '..GYYYYYYYYG........',
  '...GGYYYYGG.........',
  '.....GGGG...........',
  '....................',
  '....................',
  '....................',
  '....................',
];

const GRID_EGG_HATCH_3 = [
  '....GGGG............',
  '..GGYYYYGG..........',
  '.GYYYYYYYYG.........',
  '.GYYYYYYYYYYG.......',
  'GYYYYXXYYYYXXG......',
  'GYYXX..XXXX..X......',
  '....................',
  '....CCCCCCCC........',
  '....CCCCCCCC........',
  '....XX..XXXX..XX....',
  '..GYYYYXXYYYYXXG....',
  '..GYYYYYYYYYYYYG....',
  '...GYYYYYYYYYYG.....',
  '...GYYYYYYYYYYG.....',
  '....GYYYYYYYYG......',
  '.....GGYYYYGG.......',
  '.......GGGG.........',
  '....................',
  '....................',
  '....................',
];

const GRID_EGG_HATCH_4 = [
  '....................',
  '......OOOOO.........',
  '....OOOOOOOO........',
  '...OOCXCOOOOP.......',
  '..OOOCCXOOOOOO......',
  '..OOOBBBOOOOOO......',
  '...OOBBBOOOOO.......',
  '.....BBBB...........',
  '....XX..XXXX..XX....',
  '..GYYYYXXYYYYXXG....',
  '..GYYYYYYYYYYYYG....',
  '...GYYYYYYYYYYG.....',
  '...GYYYYYYYYYYG.....',
  '....GYYYYYYYYG......',
  '.....GGYYYYGG.......',
  '.......GGGG.........',
  '....................',
  '....................',
  '....................',
  '....................',
];

const GRID_EGG_HATCH_5 = [
  '.....DD..DD.........',
  '....DD.OOOOO.DD.....',
  '......OOOOOOOO......',
  '.....OOCXCOOOOP.....',
  '....OOOCCXOOOOOO....',
  '...BOOOBBBOOOOOOB...',
  '..B..OOBBBOOOOO..B..',
  '......BBBBBB........',
  '..CC...BBBB...CC....',
  '.CCCC........CCCC...',
  '..CC..........CC....',
  '..GYY..GYY..YYG.....',
  '.GYYY..YYYYYYYYG....',
  '..GYYY..YYYYYYG.....',
  '...GYY..GYYYYG......',
  '.....G..GYYGG.......',
  '.........GGGG.......',
  '....................',
  '....................',
  '....................',
];

export const EGG_HATCH_SPRITES = [
  bakeExactSprite(GRID_EGG_HATCH_0, C_EGG_HATCH, 10, 10),
  bakeExactSprite(GRID_EGG_HATCH_1, C_EGG_HATCH, 10, 10),
  bakeExactSprite(GRID_EGG_HATCH_2, C_EGG_HATCH, 10, 10),
  bakeExactSprite(GRID_EGG_HATCH_3, C_EGG_HATCH, 10, 10),
  bakeExactSprite(GRID_EGG_HATCH_4, C_EGG_HATCH, 10, 10),
  bakeExactSprite(GRID_EGG_HATCH_5, C_EGG_HATCH, 10, 10),
];

export function getEggHatchSprite(frame: number): BakedSprite {
  const f = Math.max(0, Math.min(5, Math.floor(frame)));
  return EGG_HATCH_SPRITES[f];
}

export interface FishSpriteSet {
  normal: [BakedSprite, BakedSprite]; // [frame0, frame1]
  hungry: [BakedSprite, BakedSprite]; // [frame0, frame1]
  dying: [BakedSprite[], BakedSprite[]]; // [f0Steps[0..3], f1Steps[0..3]]
}

export const FISH_SPRITES: {
  0: FishSpriteSet;
  1: FishSpriteSet;
  2: FishSpriteSet;
} = {
  0: {
    normal: [
      bakeSprite(GRID_FISH_0_F0, C_FISH_NORMAL),
      bakeSprite(GRID_FISH_0_F1, C_FISH_NORMAL),
    ],
    hungry: [
      bakeSprite(GRID_FISH_0_F0, C_FISH_HUNGRY),
      bakeSprite(GRID_FISH_0_F1, C_FISH_HUNGRY),
    ],
    dying: [
      bakeDitheredSteps(bakeSprite(GRID_FISH_0_DYING_F0, C_FISH_DYING)),
      bakeDitheredSteps(bakeSprite(GRID_FISH_0_DYING_F1, C_FISH_DYING)),
    ],
  },
  1: {
    normal: [
      bakeSprite(GRID_FISH_1_F0, C_FISH_NORMAL),
      bakeSprite(GRID_FISH_1_F1, C_FISH_NORMAL),
    ],
    hungry: [
      bakeSprite(GRID_FISH_1_F0, C_FISH_HUNGRY),
      bakeSprite(GRID_FISH_1_F1, C_FISH_HUNGRY),
    ],
    dying: [
      bakeDitheredSteps(bakeSprite(GRID_FISH_1_DYING_F0, C_FISH_DYING)),
      bakeDitheredSteps(bakeSprite(GRID_FISH_1_DYING_F1, C_FISH_DYING)),
    ],
  },
  2: {
    normal: [
      bakeSprite(GRID_FISH_2_F0, C_FISH_NORMAL),
      bakeSprite(GRID_FISH_2_F1, C_FISH_NORMAL),
    ],
    hungry: [
      bakeSprite(GRID_FISH_2_F0, C_FISH_HUNGRY),
      bakeSprite(GRID_FISH_2_F1, C_FISH_HUNGRY),
    ],
    dying: [
      bakeDitheredSteps(bakeSprite(GRID_FISH_2_DYING_F0, C_FISH_DYING)),
      bakeDitheredSteps(bakeSprite(GRID_FISH_2_DYING_F1, C_FISH_DYING)),
    ],
  },
};

export function getFishSprite(
  size: 0 | 1 | 2,
  state: 'normal' | 'hungry' | 'dying',
  frame: 0 | 1,
  ditherStep: 0 | 1 | 2 | 3 = 0
): BakedSprite {
  const set = FISH_SPRITES[size];
  if (state === 'dying') {
    const steps = set.dying[frame];
    return steps[ditherStep] || steps[0];
  }
  return state === 'hungry' ? set.hungry[frame] : set.normal[frame];
}

// ============================================================================
// HUD BAKED SPRITES (8x8 Coin, 5x5 Tiny Coin, 12x12 Icons, Cursor, Ribbon, Gems)
// ============================================================================

// 1. 8x8 Gold Coin Icon (for Money Plaque)
const GRID_COIN_8X8 = [
  '..XXXX..',
  '.XGGGGX.',
  'XGGCCGGX',
  'XGCCKKGX',
  'XGCCKKGX',
  'XGGGGGGX',
  '.XGGGGX.',
  '..XXXX..',
];
const C_COIN_8X8: Record<string, PaletteKey> = {
  X: 'woodDark',
  G: 'gold',
  C: 'glow',
  K: 'deepOrange',
};

// 2. 5x5 Tiny Gold Coin (for Button Prices)
const GRID_COIN_TINY = [
  '.XXX.',
  'XGGGX',
  'XGCGX',
  'XGGGX',
  '.XXX.',
];
const C_COIN_TINY: Record<string, PaletteKey> = {
  X: 'woodDark',
  G: 'gold',
  C: 'glow',
};

// 3. 12x12 Weapon Icon (Tactical laser / reticle)
const GRID_ICON_WEAPON = [
  '....XXXX....',
  '...XDDDDX...',
  '..XDDCCDDX..',
  '.XDDCCCCDDX.',
  'XDDDDCCDDDDX',
  'XCCCCDDCCCCX',
  'XCCCCDDCCCCX',
  'XDDDDCCDDDDX',
  '.XDDCCCCDDX.',
  '..XDDCCDDX..',
  '...XDDDDX...',
  '....XXXX....',
];
const C_ICON_WEAPON: Record<string, PaletteKey> = {
  X: 'woodDark',
  D: 'diamond',
  C: 'cream',
};

// 4. 12x12 Carnivore Icon (Purple piranha with sharp teeth)
const GRID_ICON_CARNIVORE = [
  '...XXXXXX...',
  '..XPPPPPPX..',
  '.XPPPEEPPPX.',
  '.XPPPECCEPPX',
  'XPPPPPPPPPPP',
  'XPPPPPPPPPPP',
  'XPPPPWWWWPPP',
  '.XPPWWWWWWPX',
  '..XPPPPPPX..',
  '...XPPPPX...',
  '....XXXX....',
  '............',
];
const C_ICON_CARNIVORE: Record<string, PaletteKey> = {
  X: 'woodDark',
  P: 'carnivorePurple',
  E: 'gold',
  C: 'outline',
  W: 'cream',
};

// 5. 12x12 Snail Icon (Tan spiral shell & body)
const GRID_ICON_SNAIL = [
  '....XXXX....',
  '...XSSSSX...',
  '..XSSDDSSX..',
  '.XSDDTDDSSX.',
  '.XSDTSSSDSX.',
  '.XSDDTTDDSX.',
  '.XXSSSSSSXX.',
  'XSSXXXXXXSSX',
  'X...E..E...X',
  'XTTTTTTTTTTX',
  '.XXXXXXXXXX.',
  '............',
];
const C_ICON_SNAIL: Record<string, PaletteKey> = {
  X: 'woodDark',
  S: 'sand',
  D: 'sandShade',
  T: 'tan',
  E: 'outline',
};

// 6. Corner Green Check Ribbon (for Maxed Buttons)
const GRID_CHECK_RIBBON = [
  '....XXXX',
  '...XGGGX',
  '..XGGG.X',
  '.XGCCG.X',
  'XGGCCGX.',
  'XGCGGX..',
  'XXXXX...',
  '........',
];
const C_CHECK_RIBBON: Record<string, PaletteKey> = {
  X: 'woodDark',
  G: 'alienGreen',
  C: 'cream',
};

// 7. Pixel Hand Cursor (Pointing glove)
const GRID_HAND_CURSOR = [
  '..XX........',
  '.XCCX.......',
  '.XCCX.......',
  '.XCCX.......',
  '.XCCXXX.....',
  '.XCCXCCX....',
  '.XCCXCCXXXX.',
  'XXCCXCCXCCX.',
  'XCCCCCCCCCX.',
  '.XCCCCCCCCX.',
  '.XSSSSSSSSX.',
  '..XSSSSSSX..',
  '..XSSSSSSX..',
  '...XXXXXX...',
];
const GRID_HAND_CURSOR_PRESSED = [
  '............',
  '..XX........',
  '.XCCX.......',
  '.XCCX.......',
  '.XCCXXX.....',
  '.XCCXCCX....',
  '.XCCXCCXXXX.',
  'XXCCXCCXCCX.',
  'XCCCCCCCCCX.',
  '.XCCCCCCCCX.',
  '.XSSSSSSSSX.',
  '..XSSSSSSX..',
  '..XSSSSSSX..',
  '...XXXXXX...',
];
const C_HAND: Record<string, PaletteKey> = {
  X: 'outline',
  C: 'cream',
  S: 'sand',
};

// 8. 4-frame Gem Pop Grids for Egg Sockets (Gem 0: Ruby, Gem 1: Amber, Gem 2: Sapphire)
const GRID_GEM_F0 = [
  '..........',
  '....CC....',
  '...CCCC...',
  '..CCCCCC..',
  '..CCCCCC..',
  '...CCCC...',
  '....CC....',
  '..........',
  '..........',
  '..........',
];

const GRID_GEM_F1 = [
  '....XX....',
  '...XCCX...',
  '..XCKKC...',
  '.XCKKKKC..',
  'XCKKKKKKC.',
  '.XCKKKKC..',
  '..XCKKC...',
  '...XCCX...',
  '....XX....',
  '..........',
];

const GRID_GEM_F2 = [
  '..XXXXXX..',
  '.XCCCCCCX.',
  'XCKKKKKKDX',
  'XCKKKKKKDX',
  'XCKKKKKKDX',
  'XCKKKKKKDX',
  '.XDDDDDDX.',
  '..XXXXXX..',
  '..........',
  '..........',
];

const GRID_GEM_F3 = [
  '..XXXXXX..',
  '.XCCCCCCX.',
  'XCCKKKKKDX',
  'XCKKKKKKDX',
  'XCKKCKKKDX',
  'XCKKKKKKDX',
  '.XDDDDDDX.',
  '..XXXXXX..',
  '..........',
  '..........',
];

const C_GEM_RUBY: Record<string, PaletteKey> = {
  C: 'cream',
  K: 'coral',
  D: 'deepOrange',
  X: 'woodDark',
};

const C_GEM_AMBER: Record<string, PaletteKey> = {
  C: 'glow',
  K: 'gold',
  D: 'orange',
  X: 'woodDark',
};

const C_GEM_SAPPHIRE: Record<string, PaletteKey> = {
  C: 'cream',
  K: 'diamond',
  D: 'waterDeep',
  X: 'woodDark',
};

export const GEM_SPRITES: Record<number, [BakedSprite, BakedSprite, BakedSprite, BakedSprite]> = {
  0: [
    bakeExactSprite(GRID_GEM_F0, C_GEM_RUBY, 5, 5),
    bakeExactSprite(GRID_GEM_F1, C_GEM_RUBY, 5, 5),
    bakeExactSprite(GRID_GEM_F2, C_GEM_RUBY, 5, 5),
    bakeExactSprite(GRID_GEM_F3, C_GEM_RUBY, 5, 5),
  ],
  1: [
    bakeExactSprite(GRID_GEM_F0, C_GEM_AMBER, 5, 5),
    bakeExactSprite(GRID_GEM_F1, C_GEM_AMBER, 5, 5),
    bakeExactSprite(GRID_GEM_F2, C_GEM_AMBER, 5, 5),
    bakeExactSprite(GRID_GEM_F3, C_GEM_AMBER, 5, 5),
  ],
  2: [
    bakeExactSprite(GRID_GEM_F0, C_GEM_SAPPHIRE, 5, 5),
    bakeExactSprite(GRID_GEM_F1, C_GEM_SAPPHIRE, 5, 5),
    bakeExactSprite(GRID_GEM_F2, C_GEM_SAPPHIRE, 5, 5),
    bakeExactSprite(GRID_GEM_F3, C_GEM_SAPPHIRE, 5, 5),
  ],
};

export function getGemSprite(gemIndex: 0 | 1 | 2, frame: 0 | 1 | 2 | 3): BakedSprite {
  const gemSet = GEM_SPRITES[gemIndex] || GEM_SPRITES[0];
  return gemSet[frame] || gemSet[3];
}

const GRID_ICON_TIME_8X8 = [
  '..XXXX..',
  '.XGGGGX.',
  'XG.CC.GX',
  'XG..C.GX',
  'XG..C.GX',
  'XG....GX',
  '.XGGGGX.',
  '..XXXX..',
];
const C_ICON_TIME: Record<string, PaletteKey> = {
  X: 'woodDark',
  G: 'diamond',
  C: 'cream',
};

const GRID_ICON_SHOP = [
  '....XXXX....',
  '...XCCCCX...',
  '..XCCCCCCX..',
  '.XCCCCCCCCX.',
  '.XXXXXXXXXX.',
  '.XGGGGGGGGX.',
  '.XGG....GGX.',
  '.XGG.CC.GGX.',
  '.XGG.CC.GGX.',
  '.XGG.CC.GGX.',
  '.XXXXXXXXXX.',
  '............',
];
const C_ICON_SHOP: Record<string, PaletteKey> = {
  X: 'outline',
  C: 'gold',
  G: 'sand',
};

const GRID_ICON_CASTLE = [
  '..X.XX.XX.X.',
  '..XSSXSSXSSX',
  '..XSSSSSSSSX',
  '..XXXXXXXXXX',
  '..XSSSSSSSSX',
  '..XSS..SS..X',
  '..XSS..SS..X',
  '..XSSSSSSSSX',
  '..XSS.DD.SSX',
  '..XSS.DD.SSX',
  '..XXXXXXXXXX',
  '............',
];
const C_ICON_CASTLE: Record<string, PaletteKey> = {
  X: 'outline',
  S: 'sand',
  D: 'sandShade',
};

const GRID_ICON_CHEST = [
  '..XXXXXXXX..',
  '.XWWWWWWWWX.',
  '.XWGGGGGGWX.',
  'XXXXXXXXXXXX',
  'XWWWWWWWWWWX',
  'XWGGGCCGGGWX',
  'XWGGGCCGGGWX',
  'XWWWWWWWWWWX',
  'XXXXXXXXXXXX',
  '............',
  '............',
  '............',
];
const C_ICON_CHEST: Record<string, PaletteKey> = {
  X: 'outline',
  W: 'wood',
  G: 'gold',
  C: 'cream',
};

const GRID_CASTLE_SEABED = [
  '.....X...XX...XX...X.....',
  '....XSS.XSSX.XSSX.SSX....',
  '...XSSSSSSSSSSSSSSSSX...',
  '...XXXXXXXXXXXXXXXXXX...',
  '...XSSSSSSSSSSSSSSSSX...',
  '...XSS..SS..SS..SS..X...',
  '...XSS..SS..SS..SS..X...',
  '...XSSSSSSSSSSSSSSSSX...',
  '...XSS.DD.SSSS.DD.SSX...',
  '...XSS.DD.SSSS.DD.SSX...',
  '...XSSSSSSSSSSSSSSSSX...',
  '..XSS..SS.DDDD.SS..SSX..',
  '..XSS..SS.DDDD.SS..SSX..',
  '..XSSSSSSSSSSSSSSSSSSX..',
  '.XSSSSSSSDDDDDDSSSSSSSX.',
  '.XXXXXXXXXXXXXXXXXXXXXX.',
];
const C_CASTLE_SEABED: Record<string, PaletteKey> = {
  X: 'outline',
  S: 'sand',
  D: 'sandShade',
};

const GRID_CHEST_SEABED = [
  '......XXXXXXXXXXXX......',
  '....XWWWWWWWWWWWWWWX....',
  '...XWGGGGGGGGGGGGGGWX...',
  '..XWWWWWWWWWWWWWWWWWWX..',
  '..XXXXXXXXXXXXXXXXXXXX..',
  '..XWWWWWWWWWWWWWWWWWWX..',
  '..XWGGGGGGCCCCGGGGGGWX..',
  '..XWGGGGGGCCCCGGGGGGWX..',
  '..XWWWWWWWWWWWWWWWWWWX..',
  '..XXXXXXXXXXXXXXXXXXXX..',
  '....XXXXXXXXXXXXXXXX....',
];
const C_CHEST_SEABED: Record<string, PaletteKey> = {
  X: 'outline',
  W: 'wood',
  G: 'gold',
  C: 'cream',
};

const GRID_ICON_GEAR = [
  '.....XXXXX......',
  '...XXWWWWWXX....',
  '..XWWWWWWWWWX...',
  '..XWWWWXWWWWX...',
  '.XWWWWXXXWWWWX..',
  '.XWWWXXXXXWWWX..',
  '.XWWWXXXXXWWWX..',
  'XWWWWXXXXXWWWWX',
  'XWWWWXXXXXWWWWX',
  'XWWWWXXXXXWWWWX',
  '.XWWWXXXXXWWWX..',
  '.XWWWXXXXXWWWX..',
  '.XWWWWXXXWWWWX..',
  '..XWWWWXWWWWX...',
  '..XWWWWWWWWWX...',
  '...XXWWWWWXX....',
];

const GRID_ICON_SPEAKER = [
  '......XXXX......',
  '.....XWWWWX.....',
  '....XWWWWWWX....',
  '...XWWWWWWWWX...',
  '..XWWWWWWWWWWX..',
  '..XWWWWWWWWWWX..',
  '..XWWWWWWWWWWX..',
  '..XWWWWWWWWWWX..',
  '..XWWWWWWWWWWX..',
  '..XWWWWWWWWWWX..',
  '..XWWWWWWWWWWX..',
  '..XWWWWWWWWWWX..',
  '...XWWWWWWWWX...',
  '....XWWWWWWX....',
  '.....XWWWWX.....',
  '......XXXX......',
];

const GRID_ICON_SPEAKER_MUTED = [
  'XX....XXXX......',
  '.XX..XWWWWX.....',
  '..XXWWWWWWWX....',
  '...XXWWWWWWWX...',
  '..XWWXXWWWWWWX..',
  '..XWWWXXWWWWWWX.',
  '..XWWWWXXWWWWWWX',
  '..XWWWWWXXWWWWWW',
  '..XWWWWWWXXWWWWW',
  '..XWWWWWWWXXWWWW',
  '..XWWWWWWWWXXWWW',
  '..XWWWWWWWWWXXWW',
  '...XWWWWWWWWWXX.',
  '....XWWWWWWWWWXX',
  '.....XWWWWWWWWXX',
  '......XXXX......',
];

// Lazily baked or baked on first call
export const SPRITES = {
  fish0: FISH_SPRITES[0].normal[0],
  fish0Hungry: FISH_SPRITES[0].hungry[0],
  fish1: FISH_SPRITES[1].normal[0],
  fish1Hungry: FISH_SPRITES[1].hungry[0],
  fish2: FISH_SPRITES[2].normal[0],
  fish2Hungry: FISH_SPRITES[2].hungry[0],
  carnivore: CARNIVORE_SPRITES.normal[0],
  gargo: GARGO_SPRITES.normal[0],
  gargoFlash: GARGO_SPRITES.flash[0],
  snail: SNAIL_SPRITES[0],
  pellet: PELLET_SPRITES[0],
  coinSilver: COIN_SPRITES.silver[0][0],
  coinGold: COIN_SPRITES.gold[0][0],
  coinDiamond: COIN_SPRITES.diamond[0][0],
  egg: bakeSprite(GRID_EGG, C_COIN),
  coinPlaque: bakeExactSprite(GRID_COIN_8X8, C_COIN_8X8),
  coinTiny: bakeExactSprite(GRID_COIN_TINY, C_COIN_TINY),
  iconWeapon: bakeExactSprite(GRID_ICON_WEAPON, C_ICON_WEAPON),
  iconCarnivore: bakeExactSprite(GRID_ICON_CARNIVORE, C_ICON_CARNIVORE),
  iconSnail: bakeExactSprite(GRID_ICON_SNAIL, C_ICON_SNAIL),
  iconShop: bakeExactSprite(GRID_ICON_SHOP, C_ICON_SHOP),
  iconCastle: bakeExactSprite(GRID_ICON_CASTLE, C_ICON_CASTLE),
  iconChest: bakeExactSprite(GRID_ICON_CHEST, C_ICON_CHEST),
  decorCastle: bakeExactSprite(GRID_CASTLE_SEABED, C_CASTLE_SEABED),
  decorChest: bakeExactSprite(GRID_CHEST_SEABED, C_CHEST_SEABED),
  iconTime: bakeExactSprite(GRID_ICON_TIME_8X8, C_ICON_TIME),
  checkRibbon: bakeExactSprite(GRID_CHECK_RIBBON, C_CHECK_RIBBON),
  handCursor: bakeExactSprite(GRID_HAND_CURSOR, C_HAND, 2, 0),
  handCursorPressed: bakeExactSprite(GRID_HAND_CURSOR_PRESSED, C_HAND, 2, 0),
  iconGear: bakeExactSprite(GRID_ICON_GEAR, { X: 'woodDark', W: 'silver' }),
  iconSpeaker: bakeExactSprite(GRID_ICON_SPEAKER, { X: 'woodDark', W: 'cream' }),
  iconSpeakerMuted: bakeExactSprite(GRID_ICON_SPEAKER_MUTED, { X: 'woodDark', W: 'cream' }),
};


