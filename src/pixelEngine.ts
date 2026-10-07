/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// PALETTE
// Extended with 8 hue-shifted 5-tone ramps (shadows lean violet-blue, highlights yellow)
// ============================================================================
export const PALETTE = {
  // --- 5-Tone Hue-Shifted Ramps ---
  // Orange ramp
  orange1: '#ffe3a8', // Highlight
  orange2: '#ffb561', // Light / belly
  orange3: '#f58a3d', // Base orange
  orange4: '#c4552b', // Shade / interior line
  orange5: '#7c2f35', // Dark shadow / silhouette outline

  // Gold ramp
  gold1: '#fff1a8',   // Highlight
  gold2: '#ffd45a',   // Light
  gold3: '#ffc83d',   // Base gold
  gold4: '#d9962b',   // Shade
  gold5: '#8a5424',   // Dark shadow / silhouette outline

  // Teal ramp
  teal1: '#bff0dc',   // Highlight
  teal2: '#5cc2b0',   // Light / waterLight
  teal3: '#36908f',   // Base / waterMid
  teal4: '#1f5566',   // Shade / waterDeep
  teal5: '#17384a',   // Dark shadow / waterDark / silhouette outline

  // Sand ramp
  sand1: '#fff0c8',   // Highlight
  sand2: '#f0c987',   // Light / sand
  sand3: '#d9a864',   // Base / sandMid
  sand4: '#b07c4f',   // Shade / sandShade
  sand5: '#7a5240',   // Dark shadow / silhouette outline

  // Wood ramp
  wood1: '#e0a368',   // Highlight / woodLight
  wood2: '#c07a45',   // Light / woodMid
  wood3: '#a8693a',   // Base wood
  wood4: '#6b3f2a',   // Shade / woodDark
  wood5: '#3e2230',   // Dark shadow / silhouette outline

  // Leaf ramp
  leaf1: '#d8f29a',   // Highlight
  leaf2: '#9bd45a',   // Light / hungryGreen / alienGreen
  leaf3: '#5ea748',   // Base leaf / alienDark
  leaf4: '#2f7a4a',   // Shade
  leaf5: '#1f4d34',   // Dark shadow / silhouette outline

  // Coral ramp
  coral1: '#ffc2a8',  // Highlight
  coral2: '#ff8f78',  // Light
  coral3: '#e8604c',  // Base coral
  coral4: '#b8403f',  // Shade
  coral5: '#6e2a3a',  // Dark shadow / silhouette outline

  // Purple ramp
  purple1: '#d9b8f0', // Highlight
  purple2: '#b184d8', // Light
  purple3: '#9a5cc4', // Base purple / carnivorePurple
  purple4: '#5e3a8c', // Shade / carnivoreDark
  purple5: '#3a2660', // Dark shadow / silhouette outline

  // --- Base Aliases and Theme Utility Accents ---
  outline: '#2a1b24', // Silhouette fallback against similar-value backgrounds
  cream: '#fff1d6',
  glow: '#ffd98a',
  orange: '#f58a3d',
  deepOrange: '#c4552b',
  coral: '#e8604c',
  belly: '#ffb561',
  hungryGreen: '#9bd45a',
  waterLight: '#5cc2b0',
  waterMid: '#36908f',
  waterDeep: '#1f5566',
  waterDark: '#17384a',
  sand: '#f0c987',
  sandShade: '#b07c4f',
  wood: '#a8693a',
  woodDark: '#6b3f2a',
  woodLight: '#e0a368',
  gold: '#ffc83d',
  silver: '#d9e2ea',
  diamond: '#8ee8ff',
  alienGreen: '#9bd45a',
  alienDark: '#5ea748',
  carnivorePurple: '#9a5cc4',
  carnivoreDark: '#5e3a8c',
  tan: '#e0b070',
  dimBrown: '#7a5240',
  white: '#ffffff',
  lagoon1: '#7fe0c8',
  lagoon2: '#4fb8b0',
  lagoon3: '#2f8a99',
  midnight1: '#4a6fb5',
  midnight2: '#34509a',
  midnight3: '#26377a',
  midnight4: '#1a2257',
  // Frutiger Aero Palette
  navy: '#0b2f5b',
  glassLight: '#e8f8ff',
  glassMid: '#bfe9f7',
  sky: '#7fd6ff',
  skyLight: '#c9f0ff',
  aqua: '#3fd0e8',
  deepSky: '#1b78b8',
  lime: '#8de04a',
  limeLight: '#c9f58a',
  leaf: '#3fa83a',
  sun: '#ffe66b',
  fruitOrange: '#ffa53a',
  cherry: '#ff5a6e',
  aeroSilver: '#c9d6e2',
  aeroWater1: '#9be8ff',
  aeroWater2: '#5cc8f0',
  aeroWater3: '#2f9ad8',
  aeroWater4: '#1b6fb0',
  aeroSand: '#fff3c4',
  aeroSandRipple: '#e6d08c',
} as const;

export type PaletteKey = keyof typeof PALETTE;

// ----------------------------------------------------------------------------
// THEME RAMP OVERRIDES
// Each theme overrides the 8 same 5-tone ramp keys (budget: <= 64 colors per theme)
// ----------------------------------------------------------------------------
export const THEME_RAMPS = {
  default: {
    orange: ['#ffe3a8', '#ffb561', '#f58a3d', '#c4552b', '#7c2f35'] as const,
    gold: ['#fff1a8', '#ffd45a', '#ffc83d', '#d9962b', '#8a5424'] as const,
    teal: ['#bff0dc', '#5cc2b0', '#36908f', '#1f5566', '#17384a'] as const,
    sand: ['#fff0c8', '#f0c987', '#d9a864', '#b07c4f', '#7a5240'] as const,
    wood: ['#e0a368', '#c07a45', '#a8693a', '#6b3f2a', '#3e2230'] as const,
    leaf: ['#d8f29a', '#9bd45a', '#5ea748', '#2f7a4a', '#1f4d34'] as const,
    coral: ['#ffc2a8', '#ff8f78', '#e8604c', '#b8403f', '#6e2a3a'] as const,
    purple: ['#d9b8f0', '#b184d8', '#9a5cc4', '#5e3a8c', '#3a2660'] as const,
  },
  decorLagoon: {
    orange: ['#ffe8b8', '#ffc078', '#f29048', '#bd5030', '#6e2838'] as const,
    gold: ['#fff5b8', '#ffde6a', '#f5cb42', '#cb9430', '#7a4e28'] as const,
    teal: ['#cbfbf0', '#7fe0c8', '#4fb8b0', '#2f8a99', '#154854'] as const,
    sand: ['#fff4d0', '#f4d29a', '#deb476', '#b38257', '#6f4a38'] as const,
    wood: ['#e8af78', '#c88652', '#ad7242', '#6f4430', '#3a242c'] as const,
    leaf: ['#e2f8a8', '#aee068', '#6eb652', '#388852', '#1c5038'] as const,
    coral: ['#ffcbb2', '#ff9a85', '#e96d58', '#b54542', '#632532'] as const,
    purple: ['#e0c4f8', '#bc94e0', '#a26cd0', '#664598', '#382458'] as const,
  },
  decorMidnight: {
    orange: ['#feddb0', '#f0a858', '#dc7c38', '#ab462c', '#5a2232'] as const,
    gold: ['#fdf0b0', '#f0ce58', '#e6be38', '#ba8628', '#683e20'] as const,
    teal: ['#9ae8ff', '#4a6fb5', '#34509a', '#26377a', '#1a2257'] as const,
    sand: ['#eedcb0', '#d8b878', '#bc9258', '#926440', '#56382c'] as const,
    wood: ['#cca068', '#aa7040', '#8e5830', '#543024', '#321c24'] as const,
    leaf: ['#c4e890', '#88c850', '#4e9840', '#26683e', '#163e28'] as const,
    coral: ['#f0b8a2', '#e88270', '#cf5448', '#9e3438', '#54202c'] as const,
    purple: ['#cab0e8', '#9e74c8', '#864cb4', '#4e2c7a', '#281844'] as const,
  },
  themeFrutigerAero: {
    orange: ['#fff0c4', '#ffa53a', '#f58a3d', '#d05a28', '#0b2f5b'] as const,
    gold: ['#ffffd0', '#ffe66b', '#ffd45a', '#d9962b', '#0b2f5b'] as const,
    teal: ['#e8f8ff', '#9be8ff', '#5cc8f0', '#2f9ad8', '#0b2f5b'] as const,
    sand: ['#ffffff', '#fff3c4', '#e6d08c', '#c4b070', '#0b2f5b'] as const,
    wood: ['#f4c898', '#c9d6e2', '#7fd6ff', '#1b78b8', '#0b2f5b'] as const,
    leaf: ['#eaffbc', '#c9f58a', '#8de04a', '#3fa83a', '#0b2f5b'] as const,
    coral: ['#ffd0d8', '#ff8fa0', '#ff5a6e', '#c8304a', '#0b2f5b'] as const,
    purple: ['#f0e0ff', '#c8a8f8', '#9a5cc4', '#5e3a8c', '#0b2f5b'] as const,
  },
};

// ----------------------------------------------------------------------------
// BAKE-TIME PALETTE LINT
// Enforces:
// 1. Max 16 colors per sprite
// 2. Max 64 colors per theme
// 3. Shading rules: top-left lighting, 3+ tones per volume + 1px bounce/rim, selective outlines
// 4. 2x2 dithering rules: only for gradients on >= 12 art px, never inside < 14 px sprites
// ----------------------------------------------------------------------------
export function lintThemePalette(themeKey: keyof typeof THEME_RAMPS) {
  const ramps = THEME_RAMPS[themeKey];
  const hexSet = new Set<string>();
  Object.values(ramps).forEach((ramp: readonly string[]) => ramp.forEach((hex: string) => hexSet.add(hex.toLowerCase())));
  if (hexSet.size > 64) {
    console.warn(`[THEME PALETTE LINT] Theme "${themeKey}" contains ${hexSet.size} colors (max 64 allowed).`);
  }
}

// Lint all themes on startup
Object.keys(THEME_RAMPS).forEach(k => lintThemePalette(k as keyof typeof THEME_RAMPS));

export function lintSpritePalette(
  spriteName: string,
  grid: string[],
  colorMap: Record<string, PaletteKey>
) {
  const h = grid.length;
  const w = grid[0]?.length || 0;
  const usedHexes = new Set<string>();
  let solidPx = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = grid[y][x];
      if (ch && ch !== '.' && ch !== ' ') {
        solidPx++;
        const colorKey = colorMap[ch];
        if (!colorKey || !PALETTE[colorKey]) {
          console.warn(`[PALETTE WARN] Off-palette pixel '${ch}' in sprite "${spriteName}" at (${x}, ${y})`);
        } else {
          usedHexes.add(PALETTE[colorKey].toLowerCase());
        }
      }
    }
  }

  // Budget rule 1: At most 16 colors per sprite
  if (usedHexes.size > 16) {
    console.warn(`[PALETTE BUDGET WARN] Sprite "${spriteName}" uses ${usedHexes.size} colors (max 16 allowed).`);
  }

  // Dither rule: Never inside sprites under 14 px, only for gradients on areas >= 12 px
  const isUnder14 = w < 14 || h < 14;
  if (isUnder14 && solidPx < 12) {
    // Check if 2x2 checker dither was improperly used in small sprite
    for (let y = 0; y < h - 1; y++) {
      for (let x = 0; x < w - 1; x++) {
        const c00 = grid[y][x];
        const c01 = grid[y][x+1];
        const c10 = grid[y+1][x];
        const c11 = grid[y+1][x+1];
        if (c00 !== '.' && c00 === c11 && c01 !== '.' && c01 === c10 && c00 !== c01) {
          console.warn(`[DITHER WARN] 2x2 checker dither detected inside small sprite "${spriteName}" (${w}x${h} px).`);
        }
      }
    }
  }
}

export let AERO_ACTIVE = false;
export function setAeroActive(active: boolean) { AERO_ACTIVE = active; }

export const C_FISH_AERO: Record<string, PaletteKey> = {
  F: 'fruitOrange', B: 'glassLight', T: 'glassMid', L: 'fruitOrange', H: 'white', C: 'aqua', P: 'cherry', E: 'navy',
};
export const C_SPECIES_AERO: Record<string, PaletteKey> = {
  X: 'navy', O: 'fruitOrange', d: 'orange', c: 'cherry', b: 'glassLight', g: 'lime', l: 'sun',
  w: 'sky', m: 'aqua', u: 'deepSky', k: 'navy', s: 'aeroSand', h: 'aeroSandRipple',
  y: 'sun', v: 'silver', r: 'aqua', G: 'lime', D: 'leaf', P: 'cherry', K: 'navy', t: 'glassMid', B: 'navy', e: 'glassLight', W: 'white',
};
export const C_GARGO_AERO: Record<string, PaletteKey> = {
  L: 'lime', G: 'limeLight', D: 'lime',
};
export const C_SNAIL_AERO: Record<string, PaletteKey> = {
  S: 'glassMid', O: 'aqua', D: 'glassLight', T: 'glassLight', E: 'navy',
};
export const C_PELLET_AERO: Record<string, PaletteKey>[] = [
  { H: 'white', M: 'lime', D: 'leaf' },   // Kiwi green
  { H: 'white', M: 'fruitOrange', D: 'orange4' }, // Orange segment
  { H: 'white', M: 'sun', D: 'gold4' },    // Pineapple
];
export const C_COIN_AERO: Record<'silver' | 'gold' | 'diamond', Record<string, PaletteKey>> = {
  silver: { V: 'aqua', C: 'glassMid', W: 'white', S: 'glassLight' },
  gold: { G: 'sun', Y: 'fruitOrange', S: 'white' },
  diamond: { D: 'aqua', C: 'sky', W: 'white' },
};

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

export function applyGlossPass(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const navyR = 0x0b, navyG = 0x2f, navyB = 0x5b;
  const whiteR = 255, whiteG = 255, whiteB = 255;
  const outlineR = 0x2a, outlineG = 0x1b, outlineB = 0x24;

  const topEdge: number[] = new Array(w).fill(-1);
  const bottomEdge: number[] = new Array(w).fill(-1);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === outlineR && data[i+1] === outlineG && data[i+2] === outlineB) {
      data[i] = navyR; data[i+1] = navyG; data[i+2] = navyB;
    }
    const x = (i / 4) % w;
    const y = Math.floor((i / 4) / w);
    if (data[i+3] > 128) {
      const isNotOutline = !(data[i] === navyR && data[i+1] === navyG && data[i+2] === navyB);
      if (isNotOutline) {
        if (topEdge[x] === -1) topEdge[x] = y;
        bottomEdge[x] = y;
      }
    }
  }

  let longestStreakStart = -1, longestStreakLen = 0, currentStreakStart = -1, currentStreakLen = 0;
  for (let x = 0; x < w; x++) {
    if (topEdge[x] !== -1) {
      if (currentStreakStart === -1) currentStreakStart = x;
      currentStreakLen++;
    } else {
      if (currentStreakLen > longestStreakLen) { longestStreakLen = currentStreakLen; longestStreakStart = currentStreakStart; }
      currentStreakStart = -1; currentStreakLen = 0;
    }
  }
  if (currentStreakLen > longestStreakLen) { longestStreakLen = currentStreakLen; longestStreakStart = currentStreakStart; }

  if (longestStreakStart !== -1) {
    for (let x = longestStreakStart; x < longestStreakStart + longestStreakLen; x++) {
      const y = topEdge[x];
      const i = (y * w + x) * 4;
      data[i] = whiteR; data[i+1] = whiteG; data[i+2] = whiteB;
    }
  }
  for (let x = 0; x < w; x++) {
    if (bottomEdge[x] !== -1) {
      const y = bottomEdge[x];
      const i = (y * w + x) * 4;
      if (data[i] !== 255) {
        data[i] = Math.min(255, data[i] + 40);
        data[i+1] = Math.min(255, data[i+1] + 40);
        data[i+2] = Math.min(255, data[i+2] + 40);
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

const VALID_PALETTE_HEX = new Set<string>(Object.values(PALETTE));

export function bakeExactSprite(
  grid: string[],
  colorMap: Record<string, PaletteKey>,
  originX: number = 0,
  originY: number = 0,
  spriteName: string = 'sprite',
  useGloss: boolean = false
): BakedSprite {
  // Bake-time palette & shading validation
  lintSpritePalette(spriteName, grid, colorMap);

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

  if (useGloss) applyGlossPass(normalCanvas);

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
  spriteName: string = 'sprite',
  useGloss: boolean = false
): BakedSprite {
  // Bake-time palette & shading validation
  lintSpritePalette(spriteName, grid, colorMap);

  const h = grid.length;
  const w = grid[0].length;

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
  nCtx.fillStyle = useGloss ? PALETTE.navy : PALETTE.outline;
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

  if (useGloss) applyGlossPass(normalCanvas);

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
// Hue-Shifted Orange Ramp (highlight #ffe3a8, light #ffb561, body #f58a3d, shade #c4552b, outline #7c2f35)
// 2x2 cream eye (#fff1d6) with dark pupil (#2a1b24) and highlight (#ffe3a8)
// 1px coral blush cheek (#e8604c)
const C_FISH_NORMAL: Record<string, PaletteKey> = {
  B: 'orange3',     // #f58a3d
  L: 'orange2',     // #ffb561
  T: 'orange4',     // #c4552b
  E: 'cream',       // #fff1d6
  P: 'outline',     // #2a1b24 dark pupil
  H: 'orange1',     // #ffe3a8 highlight
  C: 'coral3',      // #e8604c blush
  F: 'orange2',     // fin
};

const C_FISH_HUNGRY: Record<string, PaletteKey> = {
  B: 'leaf3',       // #5ea748
  L: 'leaf2',       // #9bd45a
  T: 'leaf4',       // #2f7a4a
  E: 'cream',       // #fff1d6
  P: 'outline',     // #2a1b24
  H: 'leaf1',       // #d8f29a
  C: 'sand4',       // #b07c4f
  F: 'leaf2',       // fin
};

const C_FISH_DYING: Record<string, PaletteKey> = {
  B: 'teal2',       // #5cc2b0
  L: 'silver',      // #d9e2ea
  T: 'teal4',       // #1f5566
  E: 'cream',       // #fff1d6
  P: 'outline',     // #2a1b24
  H: 'teal1',       // #bff0dc
  C: 'teal3',       // #36908f
  F: 'silver',      // fin
};

const C_COIN: Record<string, PaletteKey> = {
  G: 'gold3',
  Y: 'gold1',
  S: 'gold4',
  C: 'cream',
  V: 'silver',
  D: 'diamond',
  W: 'teal4',
};

// ----------------------------------------------------------------------------
// PROCEDURAL Goldfish Grid Generators (Keep exact widths & heights)
// Size 0: 14x10, Size 1: 19x13, Size 2: 25x17
// ----------------------------------------------------------------------------
function buildFish0Grid(state: string, tailFrame: number, pecFrame: number, isBlinking: boolean, isEating: boolean): string[] {
  const grid = [
    '..............',
    '........TTTT..',
    '......TTTTTT..',
    '.....TBBBBBB..',
    '....TBBBBBBBB.',
    '....LBBBBBBBB.',
    '.....LLLLLLLL.',
    '......LLLLLL..',
    '.......FFF....',
    '..............',
  ].map(row => row.split(''));

  const tailFrames = [
    [
      '....FF',
      '..FFFF',
      '.FFFFF',
      'FFFFFF',
      '.FFFFF',
      '..FFFF',
      '...FFF',
      '....F.',
      '......',
      '......',
    ],
    [
      '......',
      '....FF',
      '..FFFF',
      '.FFFFF',
      'FFFFFF',
      '.FFFFF',
      '..FFFF',
      '...FFF',
      '....F.',
      '......',
    ],
    [
      '......',
      '......',
      '....F.',
      '...FFF',
      '..FFFF',
      '.FFFFF',
      'FFFFFF',
      '.FFFFF',
      '..FFFF',
      '....FF',
    ],
    [
      '......',
      '....F.',
      '...FFF',
      '..FFFF',
      '.FFFFF',
      'FFFFFF',
      '.FFFFF',
      '..FFFF',
      '....FF',
      '......',
    ],
  ];

  const tail = tailFrames[tailFrame % 4];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 6; c++) {
      if (tail[r][c] === 'F') {
        let targetRow = r;
        if (state === 'hungry') {
          targetRow = Math.min(9, r + 1); // Drooping tail fin when hungry
        }
        grid[targetRow][c] = 'F';
      }
    }
  }

  // 2-Frame pectoral flutter
  if (pecFrame === 0) {
    grid[6][7] = 'F'; grid[6][8] = 'F';
    grid[7][7] = 'F'; grid[7][8] = 'F';
  } else {
    grid[7][6] = 'F'; grid[7][7] = 'F';
    grid[8][7] = 'F'; grid[8][8] = 'F';
  }

  // Drooping top fin when hungry
  if (state === 'hungry') {
    grid[1][7] = '.'; grid[1][8] = '.';
    grid[2][6] = 'T'; grid[2][7] = 'T';
  }

  grid[1][6] = 'T';
  grid[2][5] = 'T';
  grid[3][5] = 'B';
  grid[4][5] = 'B';
  grid[5][5] = 'B';

  // 1px vertical gill line
  grid[3][9] = 'T';
  grid[4][9] = 'T';
  grid[5][9] = 'T';

  // Eye with blink / dying state
  if (state === 'dying') {
    grid[3][11] = 'P'; grid[3][12] = '.';
    grid[4][11] = '.'; grid[4][12] = 'P';
  } else if (isBlinking) {
    grid[3][11] = 'T'; grid[3][12] = 'T';
    grid[4][11] = 'B'; grid[4][12] = 'B';
  } else {
    grid[2][12] = 'H';
    grid[3][11] = 'E'; grid[3][12] = 'P';
    grid[4][11] = 'C'; grid[4][12] = 'E';
  }

  // Mouth open (eating) or closed
  if (isEating) {
    grid[4][13] = '.';
    grid[5][13] = '.';
  } else {
    grid[4][13] = 'B';
    grid[5][13] = 'B';
  }

  return grid.map(row => row.join(''));
}

function buildFish1Grid(state: string, tailFrame: number, pecFrame: number, isBlinking: boolean, isEating: boolean): string[] {
  const grid = [
    '...................',
    '..........TTTTT....',
    '........TTTTTTTT...',
    '......TTTTTTTTTTT..',
    '.....TTTBBBBBBBBB..',
    '....TBBBBBBBBBBBBB.',
    '....LBBBBBBBBBBBBB.',
    '....LBBBBBBBBBBBBB.',
    '.....LLLLLLLLLLLLL.',
    '......LLLLLLLLLLL..',
    '.......LLLLLLLLL...',
    '.........FFFFF.....',
    '...................',
  ].map(row => row.split(''));

  const tailFrames = [
    [
      '.........',
      '.....FF..',
      '...FFFF..',
      '.FFFFFF..',
      'FFFFFFF..',
      '.FFFFFF..',
      '..FFFFF..',
      '...FFF...',
      '....F....',
      '.........',
      '.........',
      '.........',
      '.........',
    ],
    [
      '.........',
      '.........',
      '.....FF..',
      '...FFFF..',
      '.FFFFFF..',
      'FFFFFFF..',
      '.FFFFFF..',
      '..FFFFF..',
      '...FFF...',
      '....F....',
      '.........',
      '.........',
      '.........',
    ],
    [
      '.........',
      '.........',
      '.........',
      '....F....',
      '...FFF...',
      '..FFFFF..',
      '.FFFFFF..',
      'FFFFFFF..',
      '.FFFFFF..',
      '...FFFF..',
      '.....FF..',
      '.........',
      '.........',
    ],
    [
      '.........',
      '.........',
      '....F....',
      '...FFF...',
      '..FFFFF..',
      '.FFFFFF..',
      'FFFFFFF..',
      '.FFFFFF..',
      '..FFFFF..',
      '...FFF...',
      '....F....',
      '.........',
      '.........',
    ],
  ];

  const tail = tailFrames[tailFrame % 4];
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 9; c++) {
      if (tail[r][c] === 'F') {
        let targetRow = r;
        if (state === 'hungry') {
          targetRow = Math.min(12, r + 1);
        }
        grid[targetRow][c] = 'F';
      }
    }
  }

  // Pectoral flutter
  if (pecFrame === 0) {
    grid[8][9] = 'F'; grid[8][10] = 'F';
    grid[9][9] = 'F'; grid[9][10] = 'F';
  } else {
    grid[9][8] = 'F'; grid[9][9] = 'F';
    grid[10][9] = 'F'; grid[10][10] = 'F';
  }

  // 1px Gill line
  grid[4][13] = 'T';
  grid[5][13] = 'T';
  grid[6][13] = 'T';
  grid[7][13] = 'T';
  grid[8][13] = 'T';

  // 2 Stripes: cols 10 and 12, rows 3 to 7
  for (let r = 3; r <= 7; r++) {
    grid[r][10] = 'L';
    grid[r][12] = 'L';
  }

  // Eye
  if (state === 'dying') {
    grid[4][15] = 'P'; grid[4][16] = '.';
    grid[5][15] = '.'; grid[5][16] = 'P';
  } else if (isBlinking) {
    grid[4][15] = 'T'; grid[4][16] = 'T';
    grid[5][15] = 'B'; grid[5][16] = 'B';
  } else {
    grid[3][16] = 'H';
    grid[4][15] = 'E'; grid[4][16] = 'P';
    grid[5][15] = 'C'; grid[5][16] = 'E';
  }

  // Mouth
  if (isEating) {
    grid[5][18] = '.';
    grid[6][18] = '.';
  } else {
    grid[5][18] = 'B';
    grid[6][18] = 'B';
  }

  return grid.map(row => row.join(''));
}

function buildFish2Grid(state: string, tailFrame: number, pecFrame: number, isBlinking: boolean, isEating: boolean): string[] {
  const grid = [
    '.........................',
    '...........TT.TT.TT......',
    '..........TTTTTTTTTT.....',
    '.......TTTTTTTTTTTTTT....',
    '......TTTBBBBBBBBBBTT....',
    '.....TTBBBBBBBBBBBBBB....',
    '....TTTBBBBBBBBBBBBBBB...',
    '....LBBBBBBBBBBBBBBBBBB..',
    '....LBBBBBBBBBBBBBBBBBBB.',
    '....LBBBBBBBBBBBBBBBBBBB.',
    '.....LLLLLLLLLLLLLLLLLLL.',
    '......LLLLLLLLLLLLLLLLL..',
    '.......LLLLLLLLLLLLLLLL..',
    '.........LLLLLLLLLLLLL...',
    '...........LLLLLLLLLL....',
    '.............FFFFFF......',
    '.........................',
  ].map(row => row.split(''));

  const tailFrames = [
    [
      '............',
      '............',
      '............',
      '............',
      '....F.......',
      '..FFFF......',
      '.FFFFFF.....',
      'FFFFFFFF....',
      'FFFFFFFF....',
      'FFFFFFFF....',
      '.FFFFFFF....',
      '..FFFFFF....',
      '...FFFF.....',
      '.....F......',
      '............',
      '............',
      '............',
    ],
    [
      '............',
      '............',
      '............',
      '............',
      '............',
      '....F.......',
      '..FFFF......',
      '.FFFFFF.....',
      'FFFFFFFF....',
      'FFFFFFFF....',
      'FFFFFFFF....',
      '.FFFFFFF....',
      '..FFFFFF....',
      '...FFFF.....',
      '.....F......',
      '............',
      '............',
    ],
    [
      '............',
      '............',
      '............',
      '.....F......',
      '...FFFF.....',
      '..FFFFFF....',
      '.FFFFFFF....',
      'FFFFFFFF....',
      'FFFFFFFF....',
      'FFFFFFFF....',
      '.FFFFFF.....',
      '..FFFF......',
      '....F.......',
      '............',
      '............',
      '............',
      '............',
    ],
    [
      '............',
      '............',
      '............',
      '............',
      '.....F......',
      '...FFFF.....',
      '..FFFFFF....',
      '.FFFFFFF....',
      'FFFFFFFF....',
      'FFFFFFFF....',
      'FFFFFFFF....',
      '.FFFFFF.....',
      '..FFFF......',
      '....F.......',
      '............',
      '............',
      '............',
    ],
  ];

  const tail = tailFrames[tailFrame % 4];
  for (let r = 0; r < 17; r++) {
    for (let c = 0; c < 12; c++) {
      if (tail[r][c] === 'F') {
        let targetRow = r;
        if (state === 'hungry') {
          targetRow = Math.min(16, r + 1);
        }
        grid[targetRow][c] = 'F';
      }
    }
  }

  // Pectoral flutter
  if (pecFrame === 0) {
    grid[11][10] = 'F'; grid[11][11] = 'F';
    grid[12][10] = 'F'; grid[12][11] = 'F';
  } else {
    grid[12][9] = 'F'; grid[12][10] = 'F';
    grid[13][10] = 'F'; grid[13][11] = 'F';
  }

  // 1px Gill line
  for (let r = 5; r <= 11; r++) {
    grid[r][18] = 'T';
  }

  // 3 Stripes: cols 13, 15, and 17, rows 4 to 9
  for (let r = 4; r <= 9; r++) {
    grid[r][13] = 'L';
    grid[r][15] = 'L';
    grid[r][17] = 'L';
  }

  // Eye
  if (state === 'dying') {
    grid[6][21] = 'P'; grid[6][22] = '.';
    grid[7][21] = '.'; grid[7][22] = 'P';
  } else if (isBlinking) {
    grid[6][21] = 'T'; grid[6][22] = 'T';
    grid[7][21] = 'B'; grid[7][22] = 'B';
  } else {
    grid[5][22] = 'H';
    grid[6][21] = 'E'; grid[6][22] = 'P';
    grid[7][21] = 'C'; grid[7][22] = 'E';
  }

  // Mouth
  if (isEating) {
    grid[7][24] = '.';
    grid[8][24] = '.';
  } else {
    grid[7][24] = 'B';
    grid[8][24] = 'B';
  }

  return grid.map(row => row.join(''));
}

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
  O: 'orange3',
  d: 'orange4',
  c: 'coral3',
  b: 'orange2',
  g: 'leaf2',
  l: 'gold2',
  w: 'teal1',
  m: 'teal2',
  u: 'teal4',
  k: 'teal5',
  s: 'sand2',
  h: 'sand4',
  y: 'gold3',
  v: 'silver',
  r: 'diamond',
  G: 'leaf2',
  D: 'leaf4',
  P: 'purple3',
  K: 'purple4',
  t: 'sand3',
  B: 'wood4',
  e: 'cream',
  W: 'white',
};

function bakeSpeciesSprite(
  grid: string[],
  glowColor: string | null = null,
  useAero: boolean = false
): BakedSprite {
  const base = bakeExactSprite(grid, useAero ? C_SPECIES_AERO : C_SPECIES, undefined, undefined, 'species', useAero);
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

export function getSpeciesSprite(level: number, frame: 0 | 1): BakedSprite {
  const list = AERO_ACTIVE ? SPECIES_SPRITES_AERO : SPECIES_SPRITES;
  const set = list[level - 1] || list[0];
  return set[frame];
}

export const SPECIES_SPRITES_AERO: BakedSprite[][] = [
  // Level 1: PIP
  [bakeSpeciesSprite(GRID_PIP_F0, null, true), bakeSpeciesSprite(GRID_PIP_F1, null, true)],
  // Level 2: MARINA
  [bakeSpeciesSprite(GRID_MARINA_F0, null, true), bakeSpeciesSprite(GRID_MARINA_F1, null, true)],
  // Level 3: DOT
  [bakeSpeciesSprite(GRID_DOT_F0, null, true), bakeSpeciesSprite(GRID_DOT_F1, null, true)],
  // Level 4: BUMBLE
  [bakeSpeciesSprite(GRID_BUMBLE_F0, null, true), bakeSpeciesSprite(GRID_BUMBLE_F1, null, true)],
  // Level 5: SOL
  [bakeSpeciesSprite(GRID_SOL_F0, null, true), bakeSpeciesSprite(GRID_SOL_F1, null, true)],
  // Level 6: LUMI (Glow: gold)
  [bakeSpeciesSprite(GRID_LUMI_F0, '#ffc83d', true), bakeSpeciesSprite(GRID_LUMI_F1, '#ffc83d', true)],
  // Level 7: NOX (Glow: diamond)
  [bakeSpeciesSprite(GRID_NOX_F0, '#8ee8ff', true), bakeSpeciesSprite(GRID_NOX_F1, '#8ee8ff', true)],
  // Level 8: GLIMMER (Glow: coral)
  [bakeSpeciesSprite(GRID_GLIMMER_F0, '#e8604c', true), bakeSpeciesSprite(GRID_GLIMMER_F1, '#e8604c', true)],
  // Level 9: VEIL (Glow: silver)
  [bakeSpeciesSprite(GRID_VEIL_F0, '#d9e2ea', true), bakeSpeciesSprite(GRID_VEIL_F1, '#d9e2ea', true)],
  // Level 10: AURORA (Glow: alienGreen)
  [bakeSpeciesSprite(GRID_AURORA_F0, '#7cc95a', true), bakeSpeciesSprite(GRID_AURORA_F1, '#7cc95a', true)],
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
// CARNIVORE FISH (30 art px, purple3 & purple4, underbite with
// visible tooth pixels, spiky dorsal fin, 2-frame tail, and hunting eye glint)
// ============================================================================
const C_CARNIVORE: Record<string, PaletteKey> = {
  P: 'purple3',       // #9a5cc4 main body
  D: 'purple4',       // #5e3a8c dorsal / shadow
  T: 'cream',         // Sharp tooth pixels
  E: 'gold3',         // Predator gold eye
  X: 'outline',       // Pupil / outline
  L: 'purple2',       // #b184d8 jaw/belly highlight
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


export const CARNIVORE_SPRITES_AERO = {
  normal: [
    bakeSprite(GRID_CARNIVORE_F0, { ...C_CARNIVORE, P: 'aqua', D: 'navy' } as Record<string, PaletteKey>, undefined, undefined, 'carn', true),
    bakeSprite(GRID_CARNIVORE_F1, { ...C_CARNIVORE, P: 'aqua', D: 'navy' } as Record<string, PaletteKey>, undefined, undefined, 'carn', true),
  ],
  dying: [
    bakeDitheredSteps(bakeSprite(GRID_CARNIVORE_F0, { ...C_CARNIVORE, P: 'navy', D: 'silver' } as Record<string, PaletteKey>, undefined, undefined, 'carn', true)),
    bakeDitheredSteps(bakeSprite(GRID_CARNIVORE_F1, { ...C_CARNIVORE, P: 'navy', D: 'silver' } as Record<string, PaletteKey>, undefined, undefined, 'carn', true)),
  ],
};

const C_FISH_HUNGRY_AERO = { ...C_FISH_AERO, F: 'lime' } as Record<string, PaletteKey>;
const C_FISH_DYING_AERO = { ...C_FISH_AERO, F: 'silver', B: 'glassMid', T: 'silver', L: 'silver', C: 'navy', H: 'glassLight' } as Record<string, PaletteKey>;

const lazyFishCache = new Map<string, BakedSprite>();

export function getFishSprite(
  size: 0 | 1 | 2,
  state: 'normal' | 'hungry' | 'dying',
  frame: number,
  ditherStep: 0 | 1 | 2 | 3 = 0,
  time: number = 0,
  timeSinceAte: number = 999,
  isAeroOverride?: boolean
): BakedSprite {
  const isAero = isAeroOverride !== undefined ? isAeroOverride : AERO_ACTIVE;
  const tailFrame = Math.floor(time / 0.12) % 4;
  const pecFrame = Math.floor(time * 6) % 2;
  const isBlinking = state !== 'dying' && (time % 4.0 < 0.15);
  const isEating = state !== 'dying' && (timeSinceAte <= 0.15);

  const cacheKey = `${size}_${state}_${tailFrame}_${pecFrame}_${isBlinking ? 1 : 0}_${isEating ? 1 : 0}_${ditherStep}_${isAero ? 1 : 0}`;
  if (lazyFishCache.has(cacheKey)) {
    return lazyFishCache.get(cacheKey)!;
  }

  // Generate grid procedurally
  let grid: string[];
  if (size === 0) {
    grid = buildFish0Grid(state, tailFrame, pecFrame, isBlinking, isEating);
  } else if (size === 1) {
    grid = buildFish1Grid(state, tailFrame, pecFrame, isBlinking, isEating);
  } else {
    grid = buildFish2Grid(state, tailFrame, pecFrame, isBlinking, isEating);
  }

  // Color Map selection
  let colorMap = isAero ? C_FISH_AERO : C_FISH_NORMAL;
  if (state === 'hungry') {
    colorMap = isAero ? C_FISH_HUNGRY_AERO : C_FISH_HUNGRY;
  } else if (state === 'dying') {
    colorMap = isAero ? C_FISH_DYING_AERO : C_FISH_DYING;
  }

  // Bake base sprite
  const baseSprite = bakeSprite(grid, colorMap, undefined, undefined, `fish_${size}`, isAero);

  // Apply dither steps if dying
  let resultSprite = baseSprite;
  if (state === 'dying') {
    const ditheredNormal = applyDitherStep(baseSprite.normal, ditherStep);
    const ditheredFlipped = createFlippedCanvas(ditheredNormal);
    resultSprite = {
      normal: ditheredNormal,
      flipped: ditheredFlipped,
      width: baseSprite.width,
      height: baseSprite.height,
      originX: baseSprite.originX,
      originY: baseSprite.originY,
    };
  }

  lazyFishCache.set(cacheKey, resultSprite);
  return resultSprite;
}

export function getCarnivoreSprite(
  frame: 0 | 1,
  state: 'normal' | 'dying' = 'normal',
  ditherStep: 0 | 1 | 2 | 3 = 0
): BakedSprite {
  const list = AERO_ACTIVE ? CARNIVORE_SPRITES_AERO : CARNIVORE_SPRITES;
  if (state === 'dying') {
    const dlist = list.dying[frame % 2];
    return dlist[ditherStep] || dlist[0];
  }
  return list.normal[frame % 2];
}

// ============================================================================
// ALIEN GARGO (35 art px blob, 3-frame body wobble swapping every 0.2s:
// leaf3 body, leaf4 shade, 1px leaf1 highlight, two angry eyes with
// brow pixels, small fang pixels, five tentacles on a 2-frame wave.
// 0.1s hit flash uses baked all-white silhouette.)
// ============================================================================
const C_GARGO: Record<string, PaletteKey> = {
  G: 'leaf3',         // #5ea748
  D: 'leaf4',         // #2f7a4a
  L: 'leaf1',         // #d8f29a highlight
  C: 'cream',         // Eye eyeball
  P: 'outline',       // Eye pupil
  B: 'leaf5',         // #1f4d34 angry brow
  F: 'cream',         // Small fang pixels
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

export const GARGO_SPRITES_AERO = {
  normal: [
    bakeSprite(GRID_GARGO_F0, C_GARGO_AERO, undefined, undefined, 'gargo', true),
    bakeSprite(GRID_GARGO_F1, C_GARGO_AERO, undefined, undefined, 'gargo', true),
    bakeSprite(GRID_GARGO_F2, C_GARGO_AERO, undefined, undefined, 'gargo', true),
  ],
  flash: [
    bakeSprite(GRID_GARGO_F0, { ...C_GARGO_AERO, L: 'white' }, undefined, undefined, 'gargo', true),
    bakeSprite(GRID_GARGO_F1, { ...C_GARGO_AERO, L: 'white' }, undefined, undefined, 'gargo', true),
    bakeSprite(GRID_GARGO_F2, { ...C_GARGO_AERO, L: 'white' }, undefined, undefined, 'gargo', true),
  ],
};

export function getGargoSprite(frame: 0 | 1 | 2, isFlash: boolean): BakedSprite {
  const list = AERO_ACTIVE ? GARGO_SPRITES_AERO : GARGO_SPRITES;
  const set = isFlash ? list.flash : list.normal;
  return set[frame % 3];
}

// ============================================================================
// SNAIL (14 art px, spiral shell in sand2 & orange3, eyestalks bobbing 1px)
// ============================================================================
const C_SNAIL: Record<string, PaletteKey> = {
  S: 'sand2',        // #f0c987 Shell base
  O: 'orange3',      // #f58a3d Spiral swirl
  D: 'sand4',        // #b07c4f Shell shade
  T: 'wood2',        // #c07a45 Body foot
  E: 'outline',      // #2a1b24 Eye dots
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

export const SNAIL_SPRITES_AERO = [
  bakeSprite(GRID_SNAIL_F0, C_SNAIL_AERO, undefined, undefined, 'snail', true),
  bakeSprite(GRID_SNAIL_F1, C_SNAIL_AERO, undefined, undefined, 'snail', true),
];

export function getSnailSprite(frame: 0 | 1): BakedSprite {
  const list = AERO_ACTIVE ? SNAIL_SPRITES_AERO : SNAIL_SPRITES;
  return list[frame % 2];
}

// ----------------------------------------------------------------------------
// PELLETS: 4x4 art px chunky pixels with 1px outline and 1px highlight
// Colored sand, orange and gold by quality tier
// ----------------------------------------------------------------------------
const GRID_PELLET_4X4 = [
  'HMMM',
  'MMMM',
  'MMMM',
  'MMMM',
];

export const PELLET_SPRITES = [
  bakeSprite(GRID_PELLET_4X4, { H: 'sand1', M: 'sand3' }),    // Tier 0: Sand #d9a864
  bakeSprite(GRID_PELLET_4X4, { H: 'orange1', M: 'orange3' }), // Tier 1: Orange #f58a3d
  bakeSprite(GRID_PELLET_4X4, { H: 'gold1', M: 'gold3' }),   // Tier 2: Gold #ffc83d
];

export const PELLET_SPRITES_AERO = [
  bakeSprite(GRID_PELLET_4X4, C_PELLET_AERO[0], undefined, undefined, 'pellet', true),
  bakeSprite(GRID_PELLET_4X4, C_PELLET_AERO[1], undefined, undefined, 'pellet', true),
  bakeSprite(GRID_PELLET_4X4, C_PELLET_AERO[2], undefined, undefined, 'pellet', true),
];

export function getPelletSprite(tier: number = 0): BakedSprite {
  const t = Math.max(0, Math.min(2, tier));
  const list = AERO_ACTIVE ? PELLET_SPRITES_AERO : PELLET_SPRITES;
  return list[t];
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

export const COIN_SPRITES_AERO = {
  silver: Array.from({ length: 4 }, (_, step) => [
    bakeDitheredSteps(bakeExactSprite(GRID_SILVER_F0, C_COIN_AERO.silver, undefined, undefined, 'coin', true))[step],
    bakeDitheredSteps(bakeExactSprite(GRID_SILVER_F1, C_COIN_AERO.silver, undefined, undefined, 'coin', true))[step],
    bakeDitheredSteps(bakeExactSprite(GRID_SILVER_F2, C_COIN_AERO.silver, undefined, undefined, 'coin', true))[step],
    bakeDitheredSteps(bakeExactSprite(GRID_SILVER_F1, C_COIN_AERO.silver, undefined, undefined, 'coin', true))[step],
  ]),
  gold: Array.from({ length: 4 }, (_, step) => [
    bakeDitheredSteps(bakeExactSprite(GRID_GOLD_F0, C_COIN_AERO.gold, undefined, undefined, 'coin', true))[step],
    bakeDitheredSteps(bakeExactSprite(GRID_GOLD_F1, C_COIN_AERO.gold, undefined, undefined, 'coin', true))[step],
    bakeDitheredSteps(bakeExactSprite(GRID_GOLD_F2, C_COIN_AERO.gold, undefined, undefined, 'coin', true))[step],
    bakeDitheredSteps(bakeExactSprite(GRID_GOLD_F1, C_COIN_AERO.gold, undefined, undefined, 'coin', true))[step],
  ]),
  diamond: Array.from({ length: 4 }, (_, step) => [
    bakeDitheredSteps(bakeExactSprite(GRID_DIAMOND_F0, C_COIN_AERO.diamond, undefined, undefined, 'coin', true))[step],
    bakeDitheredSteps(bakeExactSprite(GRID_DIAMOND_F1, C_COIN_AERO.diamond, undefined, undefined, 'coin', true))[step],
    bakeDitheredSteps(bakeExactSprite(GRID_DIAMOND_F2, C_COIN_AERO.diamond, undefined, undefined, 'coin', true))[step],
    bakeDitheredSteps(bakeExactSprite(GRID_DIAMOND_F1, C_COIN_AERO.diamond, undefined, undefined, 'coin', true))[step],
  ]),
};

export function getCoinSprite(
  type: 'silver' | 'gold' | 'diamond',
  frame: number,
  ditherStep: number = 0
): BakedSprite {
  const f = Math.abs(Math.floor(frame)) % 4;
  const d = Math.max(0, Math.min(3, Math.floor(ditherStep)));
  const list = AERO_ACTIVE ? COIN_SPRITES_AERO : COIN_SPRITES;
  if (AERO_ACTIVE) {
    return list[type][d][f];
  }
  return list[type][f][d];
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
  G: 'gold3',
  Y: 'gold1',
  C: 'cream',
  X: 'outline',
  O: 'orange3',
  B: 'orange2',
  P: 'coral3',
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

export const C_EGG_HATCH_AERO: Record<string, PaletteKey> = {
  G: 'aqua',
  Y: 'glassLight',
  C: 'white',
  X: 'navy',
  O: 'fruitOrange',
  B: 'glassMid',
  P: 'cherry',
  D: 'sky',
};

export const EGG_HATCH_SPRITES_AERO = [
  bakeExactSprite(GRID_EGG_HATCH_0, C_EGG_HATCH_AERO, 10, 10, 'egg', true),
  bakeExactSprite(GRID_EGG_HATCH_1, C_EGG_HATCH_AERO, 10, 10, 'egg', true),
  bakeExactSprite(GRID_EGG_HATCH_2, C_EGG_HATCH_AERO, 10, 10, 'egg', true),
  bakeExactSprite(GRID_EGG_HATCH_3, C_EGG_HATCH_AERO, 10, 10, 'egg', true),
  bakeExactSprite(GRID_EGG_HATCH_4, C_EGG_HATCH_AERO, 10, 10, 'egg', true),
  bakeExactSprite(GRID_EGG_HATCH_5, C_EGG_HATCH_AERO, 10, 10, 'egg', true),
];

export function getEggHatchSprite(frame: number): BakedSprite {
  const f = Math.max(0, Math.min(5, Math.floor(frame)));
  const list = AERO_ACTIVE ? EGG_HATCH_SPRITES_AERO : EGG_HATCH_SPRITES;
  return list[f];
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
    normal: [getFishSprite(0, 'normal', 0, 0, 0, 999, false), getFishSprite(0, 'normal', 1, 0, 0, 999, false)],
    hungry: [getFishSprite(0, 'hungry', 0, 0, 0, 999, false), getFishSprite(0, 'hungry', 1, 0, 0, 999, false)],
    dying: [
      [getFishSprite(0, 'dying', 0, 0, 0, 999, false), getFishSprite(0, 'dying', 0, 1, 0, 999, false), getFishSprite(0, 'dying', 0, 2, 0, 999, false), getFishSprite(0, 'dying', 0, 3, 0, 999, false)],
      [getFishSprite(0, 'dying', 1, 0, 0, 999, false), getFishSprite(0, 'dying', 1, 1, 0, 999, false), getFishSprite(0, 'dying', 1, 2, 0, 999, false), getFishSprite(0, 'dying', 1, 3, 0, 999, false)],
    ],
  },
  1: {
    normal: [getFishSprite(1, 'normal', 0, 0, 0, 999, false), getFishSprite(1, 'normal', 1, 0, 0, 999, false)],
    hungry: [getFishSprite(1, 'hungry', 0, 0, 0, 999, false), getFishSprite(1, 'hungry', 1, 0, 0, 999, false)],
    dying: [
      [getFishSprite(1, 'dying', 0, 0, 0, 999, false), getFishSprite(1, 'dying', 0, 1, 0, 999, false), getFishSprite(1, 'dying', 0, 2, 0, 999, false), getFishSprite(1, 'dying', 0, 3, 0, 999, false)],
      [getFishSprite(1, 'dying', 1, 0, 0, 999, false), getFishSprite(1, 'dying', 1, 1, 0, 999, false), getFishSprite(1, 'dying', 1, 2, 0, 999, false), getFishSprite(1, 'dying', 1, 3, 0, 999, false)],
    ],
  },
  2: {
    normal: [getFishSprite(2, 'normal', 0, 0, 0, 999, false), getFishSprite(2, 'normal', 1, 0, 0, 999, false)],
    hungry: [getFishSprite(2, 'hungry', 0, 0, 0, 999, false), getFishSprite(2, 'hungry', 1, 0, 0, 999, false)],
    dying: [
      [getFishSprite(2, 'dying', 0, 0, 0, 999, false), getFishSprite(2, 'dying', 0, 1, 0, 999, false), getFishSprite(2, 'dying', 0, 2, 0, 999, false), getFishSprite(2, 'dying', 0, 3, 0, 999, false)],
      [getFishSprite(2, 'dying', 1, 0, 0, 999, false), getFishSprite(2, 'dying', 1, 1, 0, 999, false), getFishSprite(2, 'dying', 1, 2, 0, 999, false), getFishSprite(2, 'dying', 1, 3, 0, 999, false)],
    ],
  },
};

export const FISH_SPRITES_AERO: {
  0: FishSpriteSet;
  1: FishSpriteSet;
  2: FishSpriteSet;
} = {
  0: {
    normal: [getFishSprite(0, 'normal', 0, 0, 0, 999, true), getFishSprite(0, 'normal', 1, 0, 0, 999, true)],
    hungry: [getFishSprite(0, 'hungry', 0, 0, 0, 999, true), getFishSprite(0, 'hungry', 1, 0, 0, 999, true)],
    dying: [
      [getFishSprite(0, 'dying', 0, 0, 0, 999, true), getFishSprite(0, 'dying', 0, 1, 0, 999, true), getFishSprite(0, 'dying', 0, 2, 0, 999, true), getFishSprite(0, 'dying', 0, 3, 0, 999, true)],
      [getFishSprite(0, 'dying', 1, 0, 0, 999, true), getFishSprite(0, 'dying', 1, 1, 0, 999, true), getFishSprite(0, 'dying', 1, 2, 0, 999, true), getFishSprite(0, 'dying', 1, 3, 0, 999, true)],
    ],
  },
  1: {
    normal: [getFishSprite(1, 'normal', 0, 0, 0, 999, true), getFishSprite(1, 'normal', 1, 0, 0, 999, true)],
    hungry: [getFishSprite(1, 'hungry', 0, 0, 0, 999, true), getFishSprite(1, 'hungry', 1, 0, 0, 999, true)],
    dying: [
      [getFishSprite(1, 'dying', 0, 0, 0, 999, true), getFishSprite(1, 'dying', 0, 1, 0, 999, true), getFishSprite(1, 'dying', 0, 2, 0, 999, true), getFishSprite(1, 'dying', 0, 3, 0, 999, true)],
      [getFishSprite(1, 'dying', 1, 0, 0, 999, true), getFishSprite(1, 'dying', 1, 1, 0, 999, true), getFishSprite(1, 'dying', 1, 2, 0, 999, true), getFishSprite(1, 'dying', 1, 3, 0, 999, true)],
    ],
  },
  2: {
    normal: [getFishSprite(2, 'normal', 0, 0, 0, 999, true), getFishSprite(2, 'normal', 1, 0, 0, 999, true)],
    hungry: [getFishSprite(2, 'hungry', 0, 0, 0, 999, true), getFishSprite(2, 'hungry', 1, 0, 0, 999, true)],
    dying: [
      [getFishSprite(2, 'dying', 0, 0, 0, 999, true), getFishSprite(2, 'dying', 0, 1, 0, 999, true), getFishSprite(2, 'dying', 0, 2, 0, 999, true), getFishSprite(2, 'dying', 0, 3, 0, 999, true)],
      [getFishSprite(2, 'dying', 1, 0, 0, 999, true), getFishSprite(2, 'dying', 1, 1, 0, 999, true), getFishSprite(2, 'dying', 1, 2, 0, 999, true), getFishSprite(2, 'dying', 1, 3, 0, 999, true)],
    ],
  },
};

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
  X: 'wood4',
  G: 'gold3',
  C: 'gold1',
  K: 'orange4',
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
  X: 'wood4',
  G: 'gold3',
  C: 'gold1',
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
  X: 'wood4',
  D: 'diamond',
  C: 'teal1',
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
  X: 'wood4',
  P: 'purple3',
  E: 'gold3',
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
  X: 'wood4',
  S: 'sand2',
  D: 'sand4',
  T: 'wood2',
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
  X: 'wood4',
  G: 'leaf3',
  C: 'leaf1',
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
  C: 'sand1',
  S: 'sand3',
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
  C: 'coral1',
  K: 'coral3',
  D: 'coral4',
  X: 'wood4',
};

const C_GEM_AMBER: Record<string, PaletteKey> = {
  C: 'gold1',
  K: 'gold3',
  D: 'gold4',
  X: 'wood4',
};

const C_GEM_SAPPHIRE: Record<string, PaletteKey> = {
  C: 'teal1',
  K: 'teal3',
  D: 'teal4',
  X: 'wood4',
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
  X: 'wood4',
  G: 'teal3',
  C: 'teal1',
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
  C: 'gold3',
  G: 'sand2',
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
  S: 'sand2',
  D: 'sand4',
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
  W: 'wood3',
  G: 'gold3',
  C: 'gold1',
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
  S: 'sand2',
  D: 'sand4',
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
  W: 'wood3',
  G: 'gold3',
  C: 'gold1',
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

const C_SHELLY: Record<string, PaletteKey> = {
  X: 'outline',
  C: 'coral3',
  D: 'coral4',
  O: 'orange3',
  W: 'cream',
  S: 'sand2',
  T: 'sand4',
  E: 'white',
  P: 'outline',
  H: 'gold1',
  m: 'coral4',
};

const GRID_SHELLY_NORMAL = [
  '......................',
  '..XX....XX............',
  '.XEEX..XEEX...XXXX....',
  '.XPHX..XPHX..XSSSSX...',
  '..XX....XX..XSWWWSSX..',
  '..CC....CC.XSTTTTWWSX.',
  '.XCCCCCCCCXXSSTTTTTSX.',
  'XCCCCCCCCCCXSWWTTTTSX.',
  'XCOOOOOOOOCXSSWWTTTSX.',
  'XOOOOOOOOOCXTTSSWWSX..',
  'XOOOOOOOOOCXTTTTSSX...',
  'XOOOOOOOOOCXXTTTTX....',
  'XOOOXXXXOOOC.XXXXX....',
  'XOOOOOOOOOC...........',
  '.XCCOOOOCCX...........',
  '..XCCCCCCX............',
  '.XDDX..XDDX...........',
  'XDDDX..XDDDX..........',
  'XDDX....XDDX..........',
  '.XX......XX...........',
  '......................',
  '......................',
];

const GRID_SHELLY_TALK = [
  '......................',
  '..XX....XX............',
  '.XEEX..XEEX...XXXX....',
  '.XPHX..XPHX..XSSSSX...',
  '..XX....XX..XSWWWSSX..',
  '..CC....CC.XSTTTTWWSX.',
  '.XCCCCCCCCXXSSTTTTTSX.',
  'XCCCCCCCCCCXSWWTTTTSX.',
  'XCOOOOOOOOCXSSWWTTTSX.',
  'XOOOOOOOOOCXTTSSWWSX..',
  'XOOOOOOOOOCXTTTTSSX...',
  'XOOOOOOOOOCXXTTTTX....',
  'XOOOXmmXOOOC.XXXXX....',
  'XOOOXmmXOOOC..........',
  '.XCCOOOOCCX...........',
  '..XCCCCCCX............',
  '.XDDX..XDDX...........',
  'XDDDX..XDDDX..........',
  'XDDX....XDDX..........',
  '.XX......XX...........',
  '......................',
  '......................',
];

const GRID_SHELLY_BLINK = [
  '......................',
  '..XX....XX............',
  '.XXXX..XXXX...XXXX....',
  '..XX....XX...XSSSSX...',
  '..XX....XX..XSWWWSSX..',
  '..CC....CC.XSTTTTWWSX.',
  '.XCCCCCCCCXXSSTTTTTSX.',
  'XCCCCCCCCCCXSWWTTTTSX.',
  'XCOOOOOOOOCXSSWWTTTSX.',
  'XOOOOOOOOOCXTTSSWWSX..',
  'XOOOOOOOOOCXTTTTSSX...',
  'XOOOOOOOOOCXXTTTTX....',
  'XOOOXXXXOOOC.XXXXX....',
  'XOOOOOOOOOC...........',
  '.XCCOOOOCCX...........',
  '..XCCCCCCX............',
  '.XDDX..XDDX...........',
  'XDDDX..XDDDX..........',
  'XDDX....XDDX..........',
  '.XX......XX...........',
  '......................',
  '......................',
];

const GRID_SHELLY_BLINK_TALK = [
  '......................',
  '..XX....XX............',
  '.XXXX..XXXX...XXXX....',
  '..XX....XX...XSSSSX...',
  '..XX....XX..XSWWWSSX..',
  '..CC....CC.XSTTTTWWSX.',
  '.XCCCCCCCCXXSSTTTTTSX.',
  'XCCCCCCCCCCXSWWTTTTSX.',
  'XCOOOOOOOOCXSSWWTTTSX.',
  'XOOOOOOOOOCXTTSSWWSX..',
  'XOOOOOOOOOCXTTTTSSX...',
  'XOOOOOOOOOCXXTTTTX....',
  'XOOOXmmXOOOC.XXXXX....',
  'XOOOXmmXOOOC..........',
  '.XCCOOOOCCX...........',
  '..XCCCCCCX............',
  '.XDDX..XDDX...........',
  'XDDDX..XDDDX..........',
  'XDDX....XDDX..........',
  '.XX......XX...........',
  '......................',
  '......................',
];

const GRID_TAP_HAND = [
  '..XX......',
  '.XWWX.....',
  '.XWWX.....',
  '.XWWX..XX.',
  '.XWWX.XWWX',
  '.XWWXXWWX.',
  'XWWWWWWWWX',
  'XWWWWWWWWX',
  '.XWWWWWWX.',
  '.XWWWWWWX.',
  '..XXXXXX..',
  '..........',
];

const GRID_ARROW_8X8 = [
  '..XXXX..',
  '..XYYX..',
  '..XYYX..',
  '.XXYYXX.',
  'XYYYYYYX',
  '.XYYYYX.',
  '..XYYX..',
  '...XX...',
];

const GRID_ARROW_UP_8X8 = [
  '...XX...',
  '..XYYX..',
  '.XYYYYX.',
  'XYYYYYYX',
  '.XXYYXX.',
  '..XYYX..',
  '..XYYX..',
  '..XXXX..',
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
  shellyNormal: bakeExactSprite(GRID_SHELLY_NORMAL, C_SHELLY),
  shellyTalk: bakeExactSprite(GRID_SHELLY_TALK, C_SHELLY),
  shellyBlink: bakeExactSprite(GRID_SHELLY_BLINK, C_SHELLY),
  shellyBlinkTalk: bakeExactSprite(GRID_SHELLY_BLINK_TALK, C_SHELLY),
  tutorialHand: bakeExactSprite(GRID_TAP_HAND, { X: 'outline', W: 'cream' }),
  tutorialArrow: bakeExactSprite(GRID_ARROW_8X8, { X: 'outline', Y: 'gold' }),
  tutorialArrowUp: bakeExactSprite(GRID_ARROW_UP_8X8, { X: 'outline', Y: 'gold' }),
};


