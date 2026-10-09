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

  // Blue ramp (for Blue Tang MARINA, Lanternfish LUMI, Humphead Wrasse AURORA)
  blue1: '#c2f0ff',   // Highlight / ice mint
  blue2: '#68bcf8',   // Light / sky
  blue3: '#2874db',   // Base royal cobalt
  blue4: '#1648a2',   // Shade
  blue5: '#0c2262',   // Dark shadow / silhouette outline

  // Pink ramp (for Mandarinfish GLIMMER swirl patterning)
  pink1: '#ffd4ec',   // Highlight / petal
  pink2: '#f890c8',   // Light
  pink3: '#de4e96',   // Base vivid magenta-pink
  pink4: '#a02868',   // Shade
  pink5: '#5c1038',   // Dark shadow / silhouette outline

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
// Each theme overrides the 10 same 5-tone ramp keys (budget: <= 64 colors per theme)
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
    blue: ['#c2f0ff', '#68bcf8', '#2874db', '#1648a2', '#0c2262'] as const,
    pink: ['#ffd4ec', '#f890c8', '#de4e96', '#a02868', '#5c1038'] as const,
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
    blue: ['#ccf4ff', '#78cbf8', '#3888db', '#1e54a8', '#0e2a68'] as const,
    pink: ['#ffe0f0', '#faa0d2', '#e65fa4', '#a83272', '#621640'] as const,
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
    blue: ['#9ad8ff', '#5296e8', '#245ec4', '#163c90', '#0a1e58'] as const,
    pink: ['#f4bcd8', '#d870a4', '#b8387c', '#7e1e54', '#480e30'] as const,
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
    blue: ['#e8f8ff', '#7fd6ff', '#2f9ad8', '#1b78b8', '#0b2f5b'] as const,
    pink: ['#ffe8f4', '#ffb0dc', '#f060a8', '#c83080', '#0b2f5b'] as const,
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

// ----------------------------------------------------------------------------
// FISH PARTS MANIFEST
// Lists only the anatomical parts that each species really has.
// ----------------------------------------------------------------------------
export interface FishPartsManifest {
  body: boolean;
  head: boolean;
  eye: boolean;
  mouth: boolean;
  operculum: boolean;
  dorsal: boolean;
  pectoral: boolean;
  pelvic: boolean;
  anal: boolean;
  caudal: boolean;
  lateralLine?: boolean;
  extras?: string[];
}

export const FISH_PARTS_MANIFESTS: Record<string, FishPartsManifest> = {
  guppy_fry: {
    body: true, head: true, eye: true, mouth: true, operculum: true,
    dorsal: true, pectoral: true, pelvic: false, anal: true, caudal: true,
    lateralLine: false, extras: ['bigEye', 'roundedTail', 'shortFins'],
  },
  guppy_juvenile: {
    body: true, head: true, eye: true, mouth: true, operculum: true,
    dorsal: true, pectoral: true, pelvic: true, anal: true, caudal: true,
    lateralLine: true, extras: ['juvenilePattern', 'rayLines'],
  },
  guppy_adult: {
    body: true, head: true, eye: true, mouth: true, operculum: true,
    dorsal: true, pectoral: true, pelvic: true, anal: true, caudal: true,
    lateralLine: true, extras: ['sailDorsal', 'fanTail', 'fullPattern', 'scaleDither2x2'],
  },
  carnivore: {
    body: true, head: true, eye: true, mouth: true, operculum: true,
    dorsal: true, pectoral: true, pelvic: true, anal: true, caudal: true,
    lateralLine: true, extras: ['deepBody', 'heavyUnderbite', 'twoRowsTriangularTeeth', 'adiposeFin', 'forkedTail'],
  },
  pip_clownfish: {
    body: true, head: true, eye: true, mouth: true, operculum: true,
    dorsal: true, pectoral: true, pelvic: true, anal: true, caudal: true,
    lateralLine: true, extras: ['stockyOval', 'roundedTail', 'threeWhiteBands', 'blackBandEdges', 'blackEdgedFins', 'notchedFusedDorsal'],
  },
  marina_bluetang: {
    body: true, head: true, eye: true, mouth: true, operculum: true,
    dorsal: true, pectoral: true, pelvic: true, anal: true, caudal: true,
    lateralLine: true, extras: ['compressedOval', 'cobaltToMint', 'blackPaletteMarking', 'yellowTailPectoral', 'scalpelSpine1px'],
  },
  dot_pufferfish: {
    body: true, head: true, eye: true, mouth: true, operculum: true,
    dorsal: true, pectoral: true, pelvic: false, anal: true, caudal: true,
    lateralLine: false, extras: ['nearSphere1_2x', 'tinyRoundedTail', 'translucentFarBackFins', 'beakMouth', 'paleLemon', 'brownSpots', 'spineDots1px'],
  },
  bumble_angelfish: {
    body: true, head: true, eye: true, mouth: true, operculum: true,
    dorsal: true, pectoral: true, pelvic: true, anal: true, caudal: true,
    lateralLine: true, extras: ['tallDiamond', 'dorsalFilament', 'analFilament', 'trailingPelvicFilaments', 'blackVerticalEyeStripes'],
  },
  sol_lionfish: {
    body: true, head: true, eye: true, mouth: true, operculum: true,
    dorsal: true, pectoral: true, pelvic: true, anal: true, caudal: true,
    lateralLine: true, extras: ['creamStripes', 'fanPectoralPetals', 'tallDorsalSpinesSunHalo'],
  },
  lumi_lanternfish: {
    body: true, head: true, eye: true, mouth: true, operculum: true,
    dorsal: true, pectoral: true, pelvic: true, anal: true, caudal: true,
    lateralLine: true, extras: ['slenderDeepBlue', 'largeEyes', 'forkedTail', 'goldPhotophoreDots', 'nightGlow'],
  },
  nox_eagleray: {
    body: true, head: true, eye: true, mouth: false, operculum: false,
    dorsal: true, pectoral: true, pelvic: true, anal: false, caudal: false,
    lateralLine: true, extras: ['violetDiamond', 'wingPectorals4FrameFlap', 'whipTail', 'paleUnderside', 'cyanEdgeGlow'],
  },
  glimmer_mandarinfish: {
    body: true, head: true, eye: true, mouth: true, operculum: true,
    dorsal: true, pectoral: true, pelvic: true, anal: true, caudal: true,
    lateralLine: true, extras: ['chunkyLow', 'largePaddlePectorals', 'shortDorsalTail', 'cyanPinkSwirls'],
  },
  veil_veiltail: {
    body: true, head: true, eye: true, mouth: true, operculum: true,
    dorsal: true, pectoral: true, pelvic: true, anal: true, caudal: true,
    lateralLine: true, extras: ['pearlyEggBody', 'doubleVeilTail1_5x', 'flowing4FrameCycle'],
  },
  aurora_humphead: {
    body: true, head: true, eye: true, mouth: true, operculum: true,
    dorsal: true, pectoral: true, pelvic: true, anal: true, caudal: true,
    lateralLine: true, extras: ['thickBody', 'foreheadHumpCrown', 'thickLips', 'blueGreenBody', 'violetRadiatingEyeLines'],
  },
};

// ----------------------------------------------------------------------------
// BASE FISH PALETTES
// Counter-shaded (dark back, light belly), 1px sclera ring, 1px pupil, 1px glint
// Max 16 colors per sprite strictly respected.
// ----------------------------------------------------------------------------
const C_FISH_NORMAL: Record<string, PaletteKey> = {
  B: 'orange3',     // #f58a3d flank body
  L: 'orange2',     // #ffb561 light counter-shaded belly
  T: 'orange4',     // #c4552b dark counter-shaded back
  K: 'orange5',     // #7c2f35 operculum rim & deep shadow
  E: 'cream',       // #fff1d6 1px sclera ring
  P: 'outline',     // #2a1b24 1px dark pupil / dying X
  H: 'white',       // #ffffff 1px eye glint
  F: 'orange2',     // soft fin rays
  S: 'orange4',     // spiny fin rays
  M: 'orange5',     // terminal mouth 1px line
  l: 'orange2',     // faint dotted lateral line
  d: 'orange4',     // 2x2 scale dither on flank (size 2 only)
  J: 'orange1',     // guppy pattern highlight
};

const C_FISH_HUNGRY: Record<string, PaletteKey> = {
  B: 'leaf3',       // dull green/yellow body
  L: 'leaf2',       // dull light belly
  T: 'leaf4',       // dull dark back
  K: 'leaf5',       // dark shadow
  E: 'cream',       // 1px sclera ring
  P: 'outline',     // 1px pupil
  H: 'leaf1',       // dull glint
  F: 'leaf2',       // folded fin rays
  S: 'leaf4',       // folded spiny rays
  M: 'leaf5',       // mouth line
  l: 'leaf2',       // lateral line
  d: 'leaf4',       // scale dither
  J: 'leaf2',       // pattern
};

const C_FISH_DYING: Record<string, PaletteKey> = {
  B: 'teal2',       // limp pale body
  L: 'silver',      // limp belly
  T: 'teal4',       // limp dark back
  K: 'teal5',       // shadow
  E: 'cream',       // sclera ring
  P: 'outline',     // limp X eye
  H: 'teal1',       // dull glint
  F: 'silver',      // limp fins
  S: 'teal4',       // limp rays
  M: 'outline',     // slack mouth
  l: 'teal2',       // lateral line
  d: 'teal4',       // scale dither
  J: 'silver',      // pattern
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
// PROCEDURAL FANCY GUPPY GENERATORS
// Consistent body plan that grows from fry (14x10) -> juvenile (19x13) -> adult (25x17)
// Anatomy rules:
// - Fusiform body narrowing into caudal peduncle
// - Counter-shading (dark back, light belly)
// - Terminal mouth drawn as 1px line that opens for 0.15s while eating
// - Eye in upper third of head, 1/3 back from snout (1px sclera ring, 1px pupil, 1px glint, no eyelid blink)
// - Curved 1px operculum line with darker rim behind eye, pulses 1px every 1.5s
// - Pectoral fin at ~35% body length mid-flank (2-frame flutter)
// - Smaller pelvic fin under it at ~40%
// - Dorsal fin spanning ~30-70% (spiny front rays, soft rear rays with 1px ray lines that ripple)
// - Anal fin at ~55-75% mirroring soft dorsal
// - Caudal fin at 100% with ray lines on a 4-frame cycle
// - Faint dotted lateral line from size 1; 2x2 scale dither on flank at size 2 only
// - Hungry fish fold fins flat and dull; dying fish go limp with X eyes (all in same dimensions)
// ----------------------------------------------------------------------------

function buildFish0Grid(
  state: 'normal' | 'hungry' | 'dying',
  tailFrame: number,
  pecFrame: number,
  dorsalRipple: number,
  gillPulse: boolean,
  isEating: boolean
): string[] {
  // 14 wide x 10 high
  const grid: string[][] = Array.from({ length: 10 }, () => Array(14).fill('.'));

  // 1. Fusiform body narrowing into caudal peduncle (cols 3..12)
  // Counter-shading: rows 1..3 dark back (T), rows 4..5 mid-flank (B), rows 6..7 light belly (L)
  const isHungry = state === 'hungry';
  const isDying = state === 'dying';

  // Caudal peduncle (cols 3..4)
  grid[4][3] = 'T'; grid[5][3] = 'B';
  grid[3][4] = 'T'; grid[4][4] = 'B'; grid[5][4] = 'B'; grid[6][4] = 'L';

  // Main flank (cols 5..9)
  for (let c = 5; c <= 9; c++) {
    grid[2][c] = 'T';
    grid[3][c] = 'T';
    grid[4][c] = 'B';
    grid[5][c] = 'B';
    grid[6][c] = 'L';
  }
  grid[7][6] = 'L'; grid[7][7] = 'L'; grid[7][8] = 'L';

  // Head (cols 10..12)
  grid[2][10] = 'T'; grid[2][11] = 'T';
  grid[3][10] = 'T'; grid[3][11] = 'T'; grid[3][12] = 'T';
  grid[4][10] = 'B'; grid[4][11] = 'B'; grid[4][12] = 'B';
  grid[5][10] = 'B'; grid[5][11] = 'B'; grid[5][12] = 'B';
  grid[6][10] = 'L'; grid[6][11] = 'L';

  // 2. Terminal mouth (col 13): 1px line that opens for 0.15s while eating
  if (!isEating) {
    grid[4][13] = 'M';
    grid[5][13] = 'M';
  } else {
    // 1px open gap
    grid[3][13] = 'M';
    grid[6][13] = 'M';
  }

  // 3. Eye in upper third of head, 1/3 back from snout (cols 10..11, rows 3..4)
  // Fry has proportionally large eye (1px sclera ring, 1px pupil, 1px glint, no eyelid blink)
  if (isDying) {
    // Limp with X eyes
    grid[3][10] = 'P'; grid[3][11] = '.';
    grid[4][10] = '.'; grid[4][11] = 'P';
  } else {
    grid[3][10] = 'E'; grid[3][11] = 'H';
    grid[4][10] = 'E'; grid[4][11] = 'P';
  }

  // 4. Operculum: curved 1px line with darker rim behind eye (col 8..9). Pulses 1px every 1.5s
  const gillCol = gillPulse ? 8 : 9;
  grid[3][gillCol] = 'K';
  grid[4][gillCol] = 'T';
  grid[5][gillCol] = 'K';

  // 5. Dorsal fin: short fry dorsal spanning ~30-70% (cols 5..8, row 1..2)
  if (!isHungry) {
    grid[1][5] = 'S'; grid[1][6] = 'F'; grid[1][7] = 'F';
    if (dorsalRipple > 0) grid[1][8] = 'F';
  } else {
    // Folded flat when hungry
    grid[2][6] = 'S'; grid[2][7] = 'F';
  }

  // 6. Anal fin: cols 4..6, row 7..8
  if (!isHungry) {
    grid[7][5] = 'F'; grid[8][5] = 'F';
  }

  // 7. Pectoral fin: at ~35% body length (col 7..8, row 5..6, 2-frame flutter)
  if (pecFrame === 0) {
    grid[5][7] = 'F'; grid[5][8] = 'F';
  } else {
    grid[6][7] = 'F'; grid[6][8] = 'F';
  }

  // 8. Caudal fin: short rounded tail (fry) with 4-frame cycle (cols 0..3)
  const caudalFrames = [
    // Frame 0: center wave
    [[3,1],[4,0],[4,1],[4,2],[5,0],[5,1],[5,2],[6,1]],
    // Frame 1: wave up
    [[2,1],[3,0],[3,1],[4,0],[4,1],[4,2],[5,1],[5,2]],
    // Frame 2: center wave
    [[3,1],[4,0],[4,1],[4,2],[5,0],[5,1],[5,2],[6,1]],
    // Frame 3: wave down
    [[4,1],[4,2],[5,0],[5,1],[5,2],[6,0],[6,1],[7,1]],
  ];
  const cPts = caudalFrames[tailFrame % 4];
  cPts.forEach(([r, c]) => {
    const targetR = isHungry ? Math.min(9, r + 1) : r;
    if (targetR >= 0 && targetR < 10 && c >= 0 && c < 14) {
      grid[targetR][c] = 'F';
    }
  });

  return grid.map(row => row.join(''));
}

function buildFish1Grid(
  state: 'normal' | 'hungry' | 'dying',
  tailFrame: number,
  pecFrame: number,
  dorsalRipple: number,
  gillPulse: boolean,
  isEating: boolean
): string[] {
  // 19 wide x 13 high
  const grid: string[][] = Array.from({ length: 13 }, () => Array(19).fill('.'));
  const isHungry = state === 'hungry';
  const isDying = state === 'dying';

  // 1. Fusiform body with caudal peduncle (cols 4..17)
  // Caudal peduncle (cols 4..6)
  grid[5][4] = 'T'; grid[6][4] = 'B'; grid[7][4] = 'L';
  grid[4][5] = 'T'; grid[5][5] = 'T'; grid[6][5] = 'B'; grid[7][5] = 'L';
  grid[4][6] = 'T'; grid[5][6] = 'T'; grid[6][6] = 'B'; grid[7][6] = 'B'; grid[8][6] = 'L';

  // Mid-flank (cols 7..13)
  for (let c = 7; c <= 13; c++) {
    grid[2][c] = 'T';
    grid[3][c] = 'T';
    grid[4][c] = 'T';
    grid[5][c] = 'B';
    grid[6][c] = 'B';
    grid[7][c] = 'B';
    grid[8][c] = 'L';
    grid[9][c] = 'L';
  }
  grid[10][8] = 'L'; grid[10][9] = 'L'; grid[10][10] = 'L';

  // Head (cols 14..17)
  for (let c = 14; c <= 17; c++) {
    grid[3][c] = 'T';
    grid[4][c] = 'T';
    grid[5][c] = 'B';
    grid[6][c] = 'B';
    grid[7][c] = 'B';
    if (c <= 16) grid[8][c] = 'L';
  }

  // 2. Terminal mouth (col 18): 1px line that opens for 0.15s while eating
  if (!isEating) {
    grid[5][18] = 'M';
    grid[6][18] = 'M';
  } else {
    grid[4][18] = 'M';
    grid[7][18] = 'M';
  }

  // 3. Eye: upper third of head, 1/3 back from snout (cols 14..15, rows 3..4)
  if (isDying) {
    grid[3][14] = 'P'; grid[3][15] = '.';
    grid[4][14] = '.'; grid[4][15] = 'P';
  } else {
    grid[3][14] = 'E'; grid[3][15] = 'H';
    grid[4][14] = 'E'; grid[4][15] = 'P';
  }

  // 4. Operculum: curved 1px line with darker rim behind eye (col 12..13). Pulses 1px every 1.5s
  const gillCol = gillPulse ? 12 : 13;
  grid[4][gillCol] = 'K';
  grid[5][gillCol] = 'T';
  grid[6][gillCol] = 'T';
  grid[7][gillCol] = 'K';

  // 5. Faint dotted lateral line from operculum to peduncle (col 6..12, row 6)
  for (let c = 6; c <= 12; c += 2) {
    grid[6][c] = 'l';
  }

  // Juvenile pattern bars
  grid[5][8] = 'J'; grid[5][10] = 'J';
  grid[7][9] = 'J'; grid[7][11] = 'J';

  // 6. Dorsal fin: spanning ~30-70% (cols 7..13, rows 1..3)
  // Spiny front rays (S), soft rear rays with 1px ray lines that ripple
  if (!isHungry) {
    grid[1][7] = 'S'; grid[1][8] = 'S';
    grid[1][9] = 'F'; grid[1][10] = 'F'; grid[1][11] = 'F';
    grid[0][9] = dorsalRipple === 0 ? 'F' : '.';
    grid[0][10] = dorsalRipple === 1 ? 'F' : '.';
    grid[0][11] = dorsalRipple === 2 ? 'F' : '.';
  } else {
    // Folded flat when hungry
    grid[2][8] = 'S'; grid[2][9] = 'F'; grid[2][10] = 'F';
  }

  // 7. Pectoral fin: mid-flank at ~35% body length (cols 10..11, rows 7..8, 2-frame flutter)
  if (pecFrame === 0) {
    grid[7][10] = 'F'; grid[7][11] = 'F';
    grid[8][10] = 'F';
  } else {
    grid[8][10] = 'F'; grid[8][11] = 'F';
    grid[9][10] = 'F';
  }

  // 8. Pelvic fin under pectoral at ~40% (cols 9..10, rows 9..10)
  grid[9][9] = 'F'; grid[10][9] = 'F';

  // 9. Anal fin: cols 6..9, rows 9..11 mirroring soft dorsal
  if (!isHungry) {
    grid[9][6] = 'F'; grid[10][6] = 'F';
    grid[9][7] = 'F'; grid[10][7] = 'F'; grid[11][7] = 'F';
  }

  // 10. Caudal fin: ray lines on 4-frame cycle (cols 0..4)
  const caudalFrames = [
    // Frame 0
    [[3,3],[4,2],[4,3],[5,1],[5,2],[6,0],[6,1],[6,2],[7,1],[7,2],[8,2],[8,3],[9,3]],
    // Frame 1
    [[2,3],[3,2],[3,3],[4,1],[4,2],[5,0],[5,1],[5,2],[6,1],[6,2],[7,2],[8,3],[9,3]],
    // Frame 2
    [[3,3],[4,2],[4,3],[5,1],[5,2],[6,0],[6,1],[6,2],[7,1],[7,2],[8,2],[8,3],[9,3]],
    // Frame 3
    [[4,3],[5,3],[6,2],[7,1],[7,2],[8,0],[8,1],[8,2],[9,1],[9,2],[10,2],[10,3],[11,3]],
  ];
  const cPts = caudalFrames[tailFrame % 4];
  cPts.forEach(([r, c]) => {
    const targetR = isHungry ? Math.min(12, r + 1) : r;
    if (targetR >= 0 && targetR < 13 && c >= 0 && c < 19) {
      grid[targetR][c] = (c % 2 === 0) ? 'F' : 'J';
    }
  });

  return grid.map(row => row.join(''));
}

function buildFish2Grid(
  state: 'normal' | 'hungry' | 'dying',
  tailFrame: number,
  pecFrame: number,
  dorsalRipple: number,
  gillPulse: boolean,
  isEating: boolean
): string[] {
  // 25 wide x 17 high
  const grid: string[][] = Array.from({ length: 17 }, () => Array(25).fill('.'));
  const isHungry = state === 'hungry';
  const isDying = state === 'dying';

  // 1. Fusiform body narrowing into caudal peduncle (cols 6..23)
  // Caudal peduncle (cols 6..8)
  for (let c = 6; c <= 8; c++) {
    grid[6][c] = 'T';
    grid[7][c] = 'T';
    grid[8][c] = 'B';
    grid[9][c] = 'B';
    grid[10][c] = 'L';
  }

  // Mid-flank (cols 9..18)
  for (let c = 9; c <= 18; c++) {
    grid[3][c] = 'T';
    grid[4][c] = 'T';
    grid[5][c] = 'T';
    grid[6][c] = 'B';
    grid[7][c] = 'B';
    grid[8][c] = 'B';
    grid[9][c] = 'B';
    grid[10][c] = 'L';
    grid[11][c] = 'L';
    grid[12][c] = 'L';
  }
  grid[13][11] = 'L'; grid[13][12] = 'L'; grid[13][13] = 'L';

  // Head (cols 19..23)
  for (let c = 19; c <= 23; c++) {
    grid[4][c] = 'T';
    grid[5][c] = 'T';
    grid[6][c] = 'B';
    grid[7][c] = 'B';
    grid[8][c] = 'B';
    grid[9][c] = 'B';
    if (c <= 22) { grid[10][c] = 'L'; grid[11][c] = 'L'; }
  }

  // 2. Terminal mouth (col 24): 1px line that opens for 0.15s while eating
  if (!isEating) {
    grid[7][24] = 'M';
    grid[8][24] = 'M';
  } else {
    grid[6][24] = 'M';
    grid[9][24] = 'M';
  }

  // 3. Eye: upper third of head, 1/3 back from snout (cols 19..20, rows 4..5)
  // 1px sclera ring, 1px pupil, 1px glint, NO eyelid blink
  if (isDying) {
    grid[4][19] = 'P'; grid[4][20] = '.';
    grid[5][19] = '.'; grid[5][20] = 'P';
  } else {
    grid[4][19] = 'E'; grid[4][20] = 'H';
    grid[5][19] = 'E'; grid[5][20] = 'P';
  }

  // 4. Operculum: curved 1px line with darker rim behind eye (cols 17..18). Pulses 1px every 1.5s
  const gillCol = gillPulse ? 17 : 18;
  grid[5][gillCol] = 'K';
  grid[6][gillCol] = 'T';
  grid[7][gillCol] = 'T';
  grid[8][gillCol] = 'T';
  grid[9][gillCol] = 'K';

  // 5. Faint dotted lateral line from operculum to peduncle (cols 8..17, row 8)
  for (let c = 8; c <= 16; c += 2) {
    grid[8][c] = 'l';
  }

  // 6. 2x2 scale checker dither on the flank at size 2 ONLY (cols 11..16, rows 6..10)
  for (let r = 6; r <= 10; r++) {
    for (let c = 11; c <= 16; c++) {
      if ((r + c) % 2 === 0) {
        grid[r][c] = 'd';
      }
    }
  }

  // Full guppy adult pattern swirls
  grid[5][11] = 'J'; grid[5][13] = 'J'; grid[5][15] = 'J';
  grid[7][10] = 'J'; grid[7][12] = 'J'; grid[7][14] = 'J';
  grid[9][11] = 'J'; grid[9][13] = 'J'; grid[9][15] = 'J';

  // 7. Magnificent Sail Dorsal Fin spanning ~30-70% (cols 8..18, rows 0..3)
  // Spiny front rays (S), soft rear rays (F) shown as 1px ray lines that ripple when moving
  if (!isHungry) {
    grid[2][8] = 'S'; grid[1][9] = 'S'; grid[0][10] = 'S';
    for (let c = 11; c <= 17; c++) {
      grid[1][c] = 'F';
      grid[2][c] = 'F';
    }
    // Rippling dorsal tip
    const ripOffset = dorsalRipple;
    if (11 + ripOffset <= 18) grid[0][11 + ripOffset] = 'F';
    if (14 + ripOffset <= 18) grid[0][14 + ripOffset] = 'F';
  } else {
    // Folded flat and dull when hungry
    for (let c = 10; c <= 16; c++) {
      grid[3][c] = 'S';
    }
  }

  // 8. Pectoral fin: at ~35% body length (cols 13..15, rows 9..11, 2-frame flutter)
  if (pecFrame === 0) {
    grid[9][13] = 'F'; grid[9][14] = 'F';
    grid[10][13] = 'F'; grid[10][14] = 'F';
    grid[11][13] = 'F';
  } else {
    grid[10][13] = 'F'; grid[10][14] = 'F';
    grid[11][13] = 'F'; grid[11][14] = 'F';
    grid[12][13] = 'F';
  }

  // 9. Pelvic fin: under pectoral at ~40% (cols 12..14, rows 12..14)
  grid[12][12] = 'F'; grid[13][12] = 'F'; grid[14][12] = 'F';

  // 10. Anal fin: cols 8..12, rows 12..15 mirroring soft dorsal
  if (!isHungry) {
    grid[12][8] = 'F'; grid[13][8] = 'F';
    grid[13][9] = 'F'; grid[14][9] = 'F';
    grid[13][10] = 'F'; grid[14][10] = 'F'; grid[15][10] = 'F';
    grid[13][11] = 'F'; grid[14][11] = 'F';
  }

  // 11. Fan tail caudal fin at 100% (cols 0..6, rows 1..15) with full pattern and 1px ray lines (4-frame cycle)
  const caudalFrames = [
    // Frame 0
    [
      [2,5],[3,4],[3,5],[4,3],[4,4],[4,5],[5,2],[5,3],[5,4],[6,1],[6,2],[6,3],[7,0],[7,1],[7,2],[7,3],
      [8,0],[8,1],[8,2],[8,3],[9,0],[9,1],[9,2],[9,3],[10,1],[10,2],[10,3],[11,2],[11,3],[11,4],[12,3],[12,4],[13,5]
    ],
    // Frame 1
    [
      [1,5],[2,4],[2,5],[3,3],[3,4],[3,5],[4,2],[4,3],[4,4],[5,1],[5,2],[5,3],[6,0],[6,1],[6,2],[6,3],
      [7,0],[7,1],[7,2],[7,3],[8,0],[8,1],[8,2],[8,3],[9,1],[9,2],[9,3],[10,2],[10,3],[11,3],[11,4],[12,5]
    ],
    // Frame 2
    [
      [2,5],[3,4],[3,5],[4,3],[4,4],[4,5],[5,2],[5,3],[5,4],[6,1],[6,2],[6,3],[7,0],[7,1],[7,2],[7,3],
      [8,0],[8,1],[8,2],[8,3],[9,0],[9,1],[9,2],[9,3],[10,1],[10,2],[10,3],[11,2],[11,3],[11,4],[12,3],[12,4],[13,5]
    ],
    // Frame 3
    [
      [3,5],[4,4],[4,5],[5,3],[5,4],[6,2],[6,3],[7,1],[7,2],[8,0],[8,1],[8,2],[8,3],[9,0],[9,1],[9,2],[9,3],
      [10,0],[10,1],[10,2],[10,3],[11,1],[11,2],[11,3],[12,2],[12,3],[13,3],[13,4],[14,4],[14,5],[15,5]
    ],
  ];
  const cPts = caudalFrames[tailFrame % 4];
  cPts.forEach(([r, c]) => {
    const targetR = isHungry ? Math.min(16, r + 1) : r;
    if (targetR >= 0 && targetR < 17 && c >= 0 && c < 25) {
      grid[targetR][c] = (c % 2 === 0) ? 'F' : 'J';
    }
  });

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

// ----------------------------------------------------------------------------
// REWARD FISH SPECIES PALETTE & DEFINITIONS
// 10 real species, each with its own distinctive silhouette (not palette swaps!).
// Reward fish 18x12 with Dot at 16 wide. Max 16 colors per sprite.
// ----------------------------------------------------------------------------
const C_SPECIES: Record<string, PaletteKey> = {
  X: 'outline',     // Outline / dark rim / black bands / pupil
  W: 'white',       // Pure white / band centers / glint / scalpel spine
  e: 'cream',       // Sclera / pale belly / cream stripes
  O: 'orange3',     // Clownfish & lionfish base orange
  o: 'orange2',     // Light orange belly
  d: 'orange4',     // Orange shade
  u: 'blue3',       // Blue tang & lanternfish cobalt body
  U: 'blue4',       // Deep cobalt shade
  i: 'blue2',       // Light cobalt
  I: 'blue1',       // Ice mint highlight
  y: 'gold3',       // Yellow tail / photophore / angelfish gold
  Y: 'gold2',       // Pale lemon / glowing photophore / light gold
  j: 'gold4',       // Gold shade / beak plate
  b: 'wood4',       // Puffer brown spots / angelfish brown
  s: 'sand2',       // Sand / translucent fin
  c: 'coral3',      // Lionfish red-orange
  C: 'coral2',      // Light coral
  m: 'coral4',      // Deep coral shade
  p: 'pink3',       // Mandarinfish vivid pink
  P: 'purple3',     // Eagle ray violet / wrasse eye lines
  K: 'purple4',     // Deep violet shade
  k: 'purple5',     // Dark violet outline
  r: 'diamond',     // Mandarinfish cyan swirl / eagle ray edge glow
  w: 'teal1',       // Ice mint / cyan highlight
  t: 'teal3',       // Wrasse blue-green body
  T: 'teal2',       // Light blue-green
  g: 'leaf2',       // Lime tint
  G: 'leaf3',       // Green shade
  v: 'silver',      // Veiltail silver
  V: 'sand1',       // Veiltail ivory pearl
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

// ----------------------------------------------------------------------------
// 1. PIP - Clownfish (18x12)
// Stocky oval, rounded tail, orange with three white bands (head, mid-body with
// forward bulge, tail base) each band edged in near-black, black-edged fins,
// notched fused dorsal.
// ----------------------------------------------------------------------------
const GRID_PIP_F0 = [
  '......XX..XX......',
  '....XXddXXddXX....',
  '...XddddXddddX....',
  '..XOOXWWXOOOOXWWX.',
  '.XOOOXWWXOOOWXWWX.',
  'XOWXOOXWWXOWWXOOX.',
  'XWWXOOXWWXOWWXOOX.',
  'XOWXOOXWWXOOOOXOX.',
  '.XOOXXWWXXOOOOXX..',
  '..XooXWWXooooX....',
  '...XXooXXooooX....',
  '....XXXXXXXX......',
];
const GRID_PIP_F1 = [
  '......XX..XX......',
  '....XXddXXddXX....',
  '..XXddddXddddX....',
  '.XOOXWWXXOOOOXWWX.',
  'XOOOXWWXOOOWXWWX..',
  'XWWXOOXWWXOWWXOOX.',
  'XWWXOOXWWXOWWXOOX.',
  '.XOWXOOXWWXOOOOXOX',
  '..XOOXXWWXXOOOOXX.',
  '...XooXWWXooooX...',
  '....XXooXXooooX...',
  '.....XXXXXXXX.....',
];
const GRID_PIP_F2 = [
  '......XX..XX......',
  '....XXddXXddXX....',
  '...XddddXddddX....',
  '..XOOXWWXOOOOXWWX.',
  '.XOOOXWWXOOOWXWWX.',
  'XOWXOOXWWXOWWXOOX.',
  'XWWXOOXWWXOWWXOOX.',
  'XOWXOOXWWXOOOOXOX.',
  '.XOOXXWWXXOOOOXX..',
  '..XooXWWXooooX....',
  '...XXooXXooooX....',
  '....XXXXXXXX......',
];
const GRID_PIP_F3 = [
  '......XX..XX......',
  '....XXddXXddXX....',
  '....XddddXddddX...',
  '...XOOXWWXOOOOXWWX',
  '..XOOOXWWXOOOWXWWX',
  '.XOWXOOXWWXOWWXOOX',
  'XWWXOOXWWXOWWXOOX.',
  'XWWXOOXWWXOOOOXOX.',
  'XOWXOOXXWWXOOOOXX.',
  '.XOOXooXWWXooooX..',
  '..XXXooXXooooX....',
  '....XXXXXXXX......',
];

// ----------------------------------------------------------------------------
// 2. MARINA - Blue Tang (18x12)
// Compressed oval, cobalt-to-mint body, black palette marking from eye to
// peduncle, yellow tail and pectoral, and 1px scalpel spine.
// ----------------------------------------------------------------------------
const GRID_MARINA_F0 = [
  '.....XXXX.........',
  '...XXIIIIXXXX.....',
  '..XIiiiiiiiiiXX...',
  '.XiiiiXXXXXXXXuX..',
  'XiiiXXuuuuuuuuXuX.',
  'YyyXuuuuXXuuuuuXuX',
  'YyyXWuuuXXuuuuuXuX',
  'YyyXuuuuuuuuuuuXuX',
  '.XyyXuuuuuuuuuXuX.',
  '..XXyyXXXXXXXXuX..',
  '....XXyyyyyXXX....',
  '......XXXXX.......',
];
const GRID_MARINA_F1 = [
  '.....XXXX.........',
  '...XXIIIIXXXX.....',
  '..XIiiiiiiiiiXX...',
  '.XiiiiXXXXXXXXuX..',
  'YYyXiiXXuuuuuuXuX.',
  'YYyXuuuuXXuuuuuXuX',
  '.YYyXWuuXXuuuuuXuX',
  '..YyXuuuuuuuuuuXuX',
  '...XyyuuuuuuuuXuX.',
  '....XXyXXXXXXXuX..',
  '......XXyyyyXXX...',
  '........XXXX......',
];
const GRID_MARINA_F2 = [
  '.....XXXX.........',
  '...XXIIIIXXXX.....',
  '..XIiiiiiiiiiXX...',
  '.XiiiiXXXXXXXXuX..',
  'XiiiXXuuuuuuuuXuX.',
  'YyyXuuuuXXuuuuuXuX',
  'YyyXWuuuXXuuuuuXuX',
  'YyyXuuuuuuuuuuuXuX',
  '.XyyXuuuuuuuuuXuX.',
  '..XXyyXXXXXXXXuX..',
  '....XXyyyyyXXX....',
  '......XXXXX.......',
];
const GRID_MARINA_F3 = [
  '.....XXXX.........',
  '...XXIIIIXXXX.....',
  '..XIiiiiiiiiiXX...',
  '..XiiiXXXXXXXXuX..',
  '.XiiiiXXuuuuuuXuX.',
  '..YyXuuuXXuuuuuXuX',
  '.YYyXWuuXXuuuuuXuX',
  'YYyXuuuuuuuuuuuXuX',
  'YYyXuuuuuuuuuuXuX.',
  '.XXyyyXXXXXXXXuX..',
  '....XXyyyyyXXX....',
  '......XXXXX.......',
];

// ----------------------------------------------------------------------------
// 3. DOT - Pufferfish (16x12) - Exactly 16 wide!
// Near-sphere about 1.2x as wide as tall, tiny rounded tail, small translucent
// pectoral, dorsal and anal fins set far back, beak mouth, pale-lemon with
// brown spots and 1px spine dots.
// ----------------------------------------------------------------------------
const GRID_DOT_F0 = [
  '...ssssss.......',
  '..sYYYYYYss.....',
  '.sYYbYYXbYYs....',
  'sYYYXbYYbYYYs...',
  'sYYbYYXbYYeYYjj.',
  'ssYYYYYYeYYeYYj.',
  'sYYbYYXbYYeYYjj.',
  'sYYYXbYYbYYYs...',
  '.sYYbYYXbYYs....',
  '..sYYYYYYss.....',
  '...ssssss.......',
  '................',
];
const GRID_DOT_F1 = [
  '..ssssss........',
  '.sYYYYYYss......',
  'sYYbYYXbYYs.....',
  'sYYYXbYYbYYs....',
  'sYYbYYXbYYeYYjj.',
  'ssYYYYYYeYYeYYj.',
  '.sYYbYYXbYYeYjj.',
  '..sYYXbYYbYYYs..',
  '...sYYbYYXbYYs..',
  '....sYYYYYYss...',
  '.....ssssss.....',
  '................',
];
const GRID_DOT_F2 = [
  '...ssssss.......',
  '..sYYYYYYss.....',
  '.sYYbYYXbYYs....',
  'sYYYXbYYbYYYs...',
  'sYYbYYXbYYeYYjj.',
  'ssYYYYYYeYYeYYj.',
  'sYYbYYXbYYeYYjj.',
  'sYYYXbYYbYYYs...',
  '.sYYbYYXbYYs....',
  '..sYYYYYYss.....',
  '...ssssss.......',
  '................',
];
const GRID_DOT_F3 = [
  '.....ssssss.....',
  '....sYYYYYYss...',
  '...sYYbYYXbYYs..',
  '..sYYYXbYYbYYs..',
  '.sYYbYYXbYYeYjj.',
  'ssYYYYYYeYYeYYj.',
  'sYYbYYXbYYeYYjj.',
  'sYYYXbYYbYYYs...',
  'sYYbYYXbYYs.....',
  '.sYYYYYYss......',
  '..ssssss........',
  '................',
];

// ----------------------------------------------------------------------------
// 4. BUMBLE - Angelfish (18x12)
// Tall diamond silhouette with dorsal and anal fins sweeping back into long
// filaments, two trailing pelvic filaments, golden-brown with black vertical
// stripes through the eye.
// ----------------------------------------------------------------------------
const GRID_BUMBLE_F0 = [
  '..XX..............',
  '..XyXX............',
  '..XyyyXX..........',
  '..XyyXyyXX........',
  '...XyXyyyeXX..XXX.',
  '...XyXyyeXeeXXyyyX',
  '...XyXyyyeXX..XXX.',
  '..XyyXyyXX........',
  '..XyyyXX..........',
  '..XyXX............',
  '..XX..............',
  '..X...............',
];
const GRID_BUMBLE_F1 = [
  '.XX...............',
  '.XyXX.............',
  '.XyyyXX...........',
  '..XyyXyyXX........',
  '..XyXyyeXX...XXX..',
  '..XyXyyeXeeXXyyyX.',
  '...XyXyyyeXX..XXX.',
  '...XyyXyyXX.......',
  '..XyyyXX..........',
  '..XyXX............',
  '..XX..............',
  '..X...............',
];
const GRID_BUMBLE_F2 = [
  '..XX..............',
  '..XyXX............',
  '..XyyyXX..........',
  '..XyyXyyXX........',
  '...XyXyyyeXX..XXX.',
  '...XyXyyeXeeXXyyyX',
  '...XyXyyyeXX..XXX.',
  '..XyyXyyXX........',
  '..XyyyXX..........',
  '..XyXX............',
  '..XX..............',
  '..X...............',
];
const GRID_BUMBLE_F3 = [
  '...XX.............',
  '...XyXX...........',
  '...XyyyXX.........',
  '...XyyXyyXX.......',
  '..XyXyyeXX...XXX..',
  '..XyXyyeXeeXXyyyX.',
  '.XyXyyyeXX...XXX..',
  '.XyyXyyXX.........',
  '.XyyyXX...........',
  '.XyXX.............',
  '.XX...............',
  '.X................',
];

// ----------------------------------------------------------------------------
// 5. SOL - Lionfish (18x12)
// Red-orange with cream stripes, wide fan of pectoral "petals" and tall dorsal
// spines forming a sun halo.
// ----------------------------------------------------------------------------
const GRID_SOL_F0 = [
  '..X.X.X.X.X.X.....',
  '..XcXcXcXcXcX.....',
  '..XceXceXceXceX...',
  '.XceXceXceXceXceX.',
  'XceXceXceXceXceX..',
  'XceXceXceXceXceX..',
  'XceXceXceXceXceX..',
  '.XceXceXceXceXceX.',
  '..XceXceXceXceX...',
  '..XcXcXcXcXcX.....',
  '..X.X.X.X.X.X.....',
  '..................',
];
const GRID_SOL_F1 = [
  '.X.X.X.X.X.X......',
  '.XcXcXcXcXcX......',
  '.XceXceXceXceX....',
  'XceXceXceXceXceX..',
  'XceXceXceXceXceX..',
  'XceXceXceXceXceX..',
  '.XceXceXceXceXceX.',
  '..XceXceXceXceXceX',
  '..XceXceXceXceX...',
  '..XcXcXcXcXcX.....',
  '..X.X.X.X.X.X.....',
  '..................',
];
const GRID_SOL_F2 = [
  '..X.X.X.X.X.X.....',
  '..XcXcXcXcXcX.....',
  '..XceXceXceXceX...',
  '.XceXceXceXceXceX.',
  'XceXceXceXceXceX..',
  'XceXceXceXceXceX..',
  'XceXceXceXceXceX..',
  '.XceXceXceXceXceX.',
  '..XceXceXceXceX...',
  '..XcXcXcXcXcX.....',
  '..X.X.X.X.X.X.....',
  '..................',
];
const GRID_SOL_F3 = [
  '...X.X.X.X.X.X....',
  '...XcXcXcXcXcX....',
  '..XceXceXceXceX...',
  '..XceXceXceXceXceX',
  '.XceXceXceXceXceX.',
  'XceXceXceXceXceX..',
  'XceXceXceXceXceX..',
  'XceXceXceXceXceX..',
  '.XceXceXceXceXceX.',
  '.XcXcXcXcXcX......',
  '.X.X.X.X.X.X......',
  '..................',
];

// ----------------------------------------------------------------------------
// 6. LUMI - Lanternfish (18x12)
// Slender, deep-blue, with large eyes, a forked tail, and rows of gold
// photophore dots along the lower flank that glow at night.
// ----------------------------------------------------------------------------
const GRID_LUMI_F0 = [
  '......XXXX........',
  '....XXuuuuXX......',
  '..XXuuuuuuuuXX....',
  '.XuuWWuuuuuuuuXX..',
  'XuuuXeXuuuuuuuuuX.',
  'XuuuXeXuuuuuuuuuX.',
  'XuuWWuuuuuuuuuXX..',
  '.XuYYYyYYYyYXX....',
  '..XXvvvvvvXX......',
  '...XXvvvXX........',
  '....XXXX..........',
  '..................',
];
const GRID_LUMI_F1 = [
  '.....XXXX.........',
  '...XXuuuuXX.......',
  '.XXuuuuuuuuXX.....',
  'XuuWWuuuuuuuuXX...',
  'XuuuXeXuuuuuuuuuX.',
  '.XuuXeXuuuuuuuuuX.',
  '..XWWuuuuuuuuuXX..',
  '...XuYYYyYYYyYXX..',
  '....XXvvvvvvXX....',
  '.....XXvvvXX......',
  '......XXXX........',
  '..................',
];
const GRID_LUMI_F2 = [
  '......XXXX........',
  '....XXuuuuXX......',
  '..XXuuuuuuuuXX....',
  '.XuuWWuuuuuuuuXX..',
  'XuuuXeXuuuuuuuuuX.',
  'XuuuXeXuuuuuuuuuX.',
  'XuuWWuuuuuuuuuXX..',
  '.XuYYYyYYYyYXX....',
  '..XXvvvvvvXX......',
  '...XXvvvXX........',
  '....XXXX..........',
  '..................',
];
const GRID_LUMI_F3 = [
  '.......XXXX.......',
  '.....XXuuuuXX.....',
  '...XXuuuuuuuuXX...',
  '..XWWuuuuuuuuuXX..',
  '.XuuXeXuuuuuuuuuX.',
  'XuuuXeXuuuuuuuuuX.',
  'XuuWWuuuuuuuuXX...',
  '.XuYYYyYYYyYXX....',
  '..XXvvvvvvXX......',
  '...XXvvvXX........',
  '....XXXX..........',
  '..................',
];

// ----------------------------------------------------------------------------
// 7. NOX - Eagle Ray (18x12)
// Violet diamond body with wing-like pectoral fins on a 4-frame flap, a whip tail,
// pale underside and cyan edge glow.
// ----------------------------------------------------------------------------
const GRID_NOX_F0 = [
  '.....rrXXXXrr.....',
  '...rrXXPPPPXXrr...',
  '..rXXPPPPPPPPXXr..',
  '.rXXPPPPPPPPPPXXr.',
  'rXXPPPPPPPPPPPPXXr',
  'XPPPPPPPPPPPPPPPPX',
  'XeeeeeeeeeeeeeeeeX',
  'rXXeeeeeeeeeeeeXXr',
  '.rXXeeeeeeeeeeXXr.',
  '..rXXeeeeeeeeXXr..',
  '...rrXXeeeeXXrr...',
  '.....rrXXXXrr.....',
];
const GRID_NOX_F1 = [
  '...rrXXXXrr.......',
  '..rXXPPPPXXrr.....',
  '.rXXPPPPPPPPXXr...',
  'rXXPPPPPPPPPPXXr..',
  'XPPPPPPPPPPPPPPXXr',
  'XPPPPPPPPPPPPPPPPX',
  'XeeeeeeeeeeeeeeeeX',
  'XeeeeeeeeeeeeeeXXr',
  'rXXeeeeeeeeeeXXr..',
  '.rXXeeeeeeeeXXr...',
  '..rXXeeeeeeXXrr...',
  '...rrXXXXrr.......',
];
const GRID_NOX_F2 = [
  '.....rrXXXXrr.....',
  '...rrXXPPPPXXrr...',
  '..rXXPPPPPPPPXXr..',
  '.rXXPPPPPPPPPPXXr.',
  'rXXPPPPPPPPPPPPXXr',
  'XPPPPPPPPPPPPPPPPX',
  'XeeeeeeeeeeeeeeeeX',
  'rXXeeeeeeeeeeeeXXr',
  '.rXXeeeeeeeeeeXXr.',
  '..rXXeeeeeeeeXXr..',
  '...rrXXeeeeXXrr...',
  '.....rrXXXXrr.....',
];
const GRID_NOX_F3 = [
  '.......rrXXXXrr...',
  '.....rrXXPPPPXXr..',
  '...rXXPPPPPPPPXXr.',
  '..rXXPPPPPPPPPPXXr',
  'rXXPPPPPPPPPPPPPPX',
  'XPPPPPPPPPPPPPPPPX',
  'XeeeeeeeeeeeeeeeeX',
  'rXXeeeeeeeeeeeeeeX',
  '..rXXeeeeeeeeeeXXr',
  '...rXXeeeeeeeeXXr.',
  '....rrXXeeeeXXrr..',
  '.......rrXXXXrr...',
];

// ----------------------------------------------------------------------------
// 8. GLIMMER - Mandarinfish (18x12)
// Chunky and low, with large paddle pectorals, short dorsal and tail, and
// cyan-pink swirl patterning.
// ----------------------------------------------------------------------------
const GRID_GLIMMER_F0 = [
  '......XXXX........',
  '....XXrrrrXX......',
  '..XXrrpppprrXX....',
  '.XrrppOOOOpprrXX..',
  'XrrppOOeeOOpprrrX.',
  'XrrppOOeeOOpprrrX.',
  'XrrppOOOOOOpprrrX.',
  '.XrrpppppppprrXX..',
  '..XXrrrrrrrrXX....',
  '...XXrrrrrrXX.....',
  '....XXXXXXXX......',
  '..................',
];
const GRID_GLIMMER_F1 = [
  '.....XXXX.........',
  '...XXrrrrXX.......',
  '.XXrrpppprrXX.....',
  'XrrppOOOOpprrXX...',
  'XrrppOOeeOOpprrrX.',
  '.XrrpOOeeOOpprrrX.',
  '..XrpOOOOOOpprrrX.',
  '...XrrpppppprrXX..',
  '....XXrrrrrrXX....',
  '.....XXrrrrXX.....',
  '......XXXXXX......',
  '..................',
];
const GRID_GLIMMER_F2 = [
  '......XXXX........',
  '....XXrrrrXX......',
  '..XXrrpppprrXX....',
  '.XrrppOOOOpprrXX..',
  'XrrppOOeeOOpprrrX.',
  'XrrppOOeeOOpprrrX.',
  'XrrppOOOOOOpprrrX.',
  '.XrrpppppppprrXX..',
  '..XXrrrrrrrrXX....',
  '...XXrrrrrrXX.....',
  '....XXXXXXXX......',
  '..................',
];
const GRID_GLIMMER_F3 = [
  '.......XXXX.......',
  '.....XXrrrrXX.....',
  '...XXrrpppprrXX...',
  '..XrrppOOOOpprrXX.',
  '.XrrppOOeeOOpprrrX',
  'XrrppOOeeOOpprrrX.',
  'XrrppOOOOOOpprrrX.',
  '.XrrpppppppprrXX..',
  '..XXrrrrrrrrXX....',
  '...XXrrrrrrXX.....',
  '....XXXXXXXX......',
  '..................',
];

// ----------------------------------------------------------------------------
// 9. VEIL - Veiltail Goldfish (18x12)
// Pearly translucent egg-shaped body with double veil tail about 1.5x body
// length on a 4-frame flow.
// ----------------------------------------------------------------------------
const GRID_VEIL_F0 = [
  '......XXXX........',
  '....XXvvvvXX......',
  '..XXvvvvvvvvXX....',
  '.XvvvvvvvvvvvvXX..',
  'XvvvvvveevvvvvvvX.',
  'XvvvvvveevvvvvvvX.',
  'XvvvvvvvvvvvvvvvX.',
  '.XvvvvvvvvvvvvXX..',
  '..XXvvvvvvvvXX....',
  '...XXvvvvvvXX.....',
  '....XXXXXXXX......',
  '..................',
];
const GRID_VEIL_F1 = [
  '.....XXXX.........',
  '...XXvvvvXX.......',
  '.XXvvvvvvvvXX.....',
  'XvvvvvvvvvvvvXX...',
  'XvvvvvveevvvvvvvX.',
  '.XvvvveevvvvvvvvX.',
  '..XvvvvvvvvvvvvvX.',
  '...XvvvvvvvvvvXX..',
  '....XXvvvvvvXX....',
  '.....XXvvvvXX.....',
  '......XXXXXX......',
  '..................',
];
const GRID_VEIL_F2 = [
  '......XXXX........',
  '....XXvvvvXX......',
  '..XXvvvvvvvvXX....',
  '.XvvvvvvvvvvvvXX..',
  'XvvvvvveevvvvvvvX.',
  'XvvvvvveevvvvvvvX.',
  'XvvvvvvvvvvvvvvvX.',
  '.XvvvvvvvvvvvvXX..',
  '..XXvvvvvvvvXX....',
  '...XXvvvvvvXX.....',
  '....XXXXXXXX......',
  '..................',
];
const GRID_VEIL_F3 = [
  '.......XXXX.......',
  '.....XXvvvvXX.....',
  '...XXvvvvvvvvXX...',
  '..XvvvvvvvvvvvXX..',
  '.XvvvvveevvvvvvvX.',
  'XvvvvvveevvvvvvvX.',
  'XvvvvvvvvvvvvvvvX.',
  '.XvvvvvvvvvvvvXX..',
  '..XXvvvvvvvvXX....',
  '...XXvvvvvvXX.....',
  '....XXXXXXXX......',
  '..................',
];

// ----------------------------------------------------------------------------
// 10. AURORA - Humphead Wrasse (18x12)
// Thick body with a forehead hump as the crown, thick lips, a blue-green body
// and violet lines radiating from the eye.
// ----------------------------------------------------------------------------
const GRID_AURORA_F0 = [
  '.....XXXX.........',
  '....XttttXX.......',
  '..XXtttttttXX.....',
  '.XtttttttttttXX...',
  'XttttteettttttPX..',
  'XttttteettttttPXj.',
  'XtttttttttttttPXj.',
  '.XtttttttttttXX...',
  '..XXtttttttXX.....',
  '...XXtttttXX......',
  '.....XXXXX........',
  '..................',
];
const GRID_AURORA_F1 = [
  '....XXXX..........',
  '...XttttXX........',
  '.XXtttttttXX......',
  'XtttttttttttXX....',
  'XttttteettttttPX..',
  '.XtttteettttttPXj.',
  '..XtttttttttttPXj.',
  '...XtttttttttXX...',
  '....XXtttttXX.....',
  '.....XXtttXX......',
  '......XXXX........',
  '..................',
];
const GRID_AURORA_F2 = [
  '.....XXXX.........',
  '....XttttXX.......',
  '..XXtttttttXX.....',
  '.XtttttttttttXX...',
  'XttttteettttttPX..',
  'XttttteettttttPXj.',
  'XtttttttttttttPXj.',
  '.XtttttttttttXX...',
  '..XXtttttttXX.....',
  '...XXtttttXX......',
  '.....XXXXX........',
  '..................',
];
const GRID_AURORA_F3 = [
  '......XXXX........',
  '.....XttttXX......',
  '...XXtttttttXX....',
  '..XtttttttttttXX..',
  '.XttttteettttttPX.',
  'XttttteettttttPXj.',
  'XtttttttttttttPXj.',
  '.XtttttttttttXX...',
  '..XXtttttttXX.....',
  '...XXtttttXX......',
  '.....XXXXX........',
  '..................',
];

// SPECIES SPRITES compiled array (4-frame animated sets)
export const SPECIES_SPRITES: BakedSprite[][] = [
  // Level 1: PIP (Clownfish)
  [bakeSpeciesSprite(GRID_PIP_F0), bakeSpeciesSprite(GRID_PIP_F1), bakeSpeciesSprite(GRID_PIP_F2), bakeSpeciesSprite(GRID_PIP_F3)],
  // Level 2: MARINA (Blue Tang)
  [bakeSpeciesSprite(GRID_MARINA_F0), bakeSpeciesSprite(GRID_MARINA_F1), bakeSpeciesSprite(GRID_MARINA_F2), bakeSpeciesSprite(GRID_MARINA_F3)],
  // Level 3: DOT (Pufferfish, 16x12)
  [bakeSpeciesSprite(GRID_DOT_F0), bakeSpeciesSprite(GRID_DOT_F1), bakeSpeciesSprite(GRID_DOT_F2), bakeSpeciesSprite(GRID_DOT_F3)],
  // Level 4: BUMBLE (Angelfish)
  [bakeSpeciesSprite(GRID_BUMBLE_F0), bakeSpeciesSprite(GRID_BUMBLE_F1), bakeSpeciesSprite(GRID_BUMBLE_F2), bakeSpeciesSprite(GRID_BUMBLE_F3)],
  // Level 5: SOL (Lionfish)
  [bakeSpeciesSprite(GRID_SOL_F0), bakeSpeciesSprite(GRID_SOL_F1), bakeSpeciesSprite(GRID_SOL_F2), bakeSpeciesSprite(GRID_SOL_F3)],
  // Level 6: LUMI (Lanternfish, Gold glow)
  [bakeSpeciesSprite(GRID_LUMI_F0, '#ffc83d'), bakeSpeciesSprite(GRID_LUMI_F1, '#ffc83d'), bakeSpeciesSprite(GRID_LUMI_F2, '#ffc83d'), bakeSpeciesSprite(GRID_LUMI_F3, '#ffc83d')],
  // Level 7: NOX (Eagle Ray, Diamond cyan glow)
  [bakeSpeciesSprite(GRID_NOX_F0, '#8ee8ff'), bakeSpeciesSprite(GRID_NOX_F1, '#8ee8ff'), bakeSpeciesSprite(GRID_NOX_F2, '#8ee8ff'), bakeSpeciesSprite(GRID_NOX_F3, '#8ee8ff')],
  // Level 8: GLIMMER (Mandarinfish, Coral glow)
  [bakeSpeciesSprite(GRID_GLIMMER_F0, '#e8604c'), bakeSpeciesSprite(GRID_GLIMMER_F1, '#e8604c'), bakeSpeciesSprite(GRID_GLIMMER_F2, '#e8604c'), bakeSpeciesSprite(GRID_GLIMMER_F3, '#e8604c')],
  // Level 9: VEIL (Veiltail Goldfish, Silver pearl glow)
  [bakeSpeciesSprite(GRID_VEIL_F0, '#d9e2ea'), bakeSpeciesSprite(GRID_VEIL_F1, '#d9e2ea'), bakeSpeciesSprite(GRID_VEIL_F2, '#d9e2ea'), bakeSpeciesSprite(GRID_VEIL_F3, '#d9e2ea')],
  // Level 10: AURORA (Humphead Wrasse, Green glow)
  [bakeSpeciesSprite(GRID_AURORA_F0, '#7cc95a'), bakeSpeciesSprite(GRID_AURORA_F1, '#7cc95a'), bakeSpeciesSprite(GRID_AURORA_F2, '#7cc95a'), bakeSpeciesSprite(GRID_AURORA_F3, '#7cc95a')],
];

export function getSpeciesSprite(level: number, frame: number): BakedSprite {
  const list = AERO_ACTIVE ? SPECIES_SPRITES_AERO : SPECIES_SPRITES;
  const set = list[level - 1] || list[0];
  return set[frame % set.length];
}

export const SPECIES_SPRITES_AERO: BakedSprite[][] = [
  // Level 1: PIP
  [bakeSpeciesSprite(GRID_PIP_F0, null, true), bakeSpeciesSprite(GRID_PIP_F1, null, true), bakeSpeciesSprite(GRID_PIP_F2, null, true), bakeSpeciesSprite(GRID_PIP_F3, null, true)],
  // Level 2: MARINA
  [bakeSpeciesSprite(GRID_MARINA_F0, null, true), bakeSpeciesSprite(GRID_MARINA_F1, null, true), bakeSpeciesSprite(GRID_MARINA_F2, null, true), bakeSpeciesSprite(GRID_MARINA_F3, null, true)],
  // Level 3: DOT
  [bakeSpeciesSprite(GRID_DOT_F0, null, true), bakeSpeciesSprite(GRID_DOT_F1, null, true), bakeSpeciesSprite(GRID_DOT_F2, null, true), bakeSpeciesSprite(GRID_DOT_F3, null, true)],
  // Level 4: BUMBLE
  [bakeSpeciesSprite(GRID_BUMBLE_F0, null, true), bakeSpeciesSprite(GRID_BUMBLE_F1, null, true), bakeSpeciesSprite(GRID_BUMBLE_F2, null, true), bakeSpeciesSprite(GRID_BUMBLE_F3, null, true)],
  // Level 5: SOL
  [bakeSpeciesSprite(GRID_SOL_F0, null, true), bakeSpeciesSprite(GRID_SOL_F1, null, true), bakeSpeciesSprite(GRID_SOL_F2, null, true), bakeSpeciesSprite(GRID_SOL_F3, null, true)],
  // Level 6: LUMI
  [bakeSpeciesSprite(GRID_LUMI_F0, '#ffc83d', true), bakeSpeciesSprite(GRID_LUMI_F1, '#ffc83d', true), bakeSpeciesSprite(GRID_LUMI_F2, '#ffc83d', true), bakeSpeciesSprite(GRID_LUMI_F3, '#ffc83d', true)],
  // Level 7: NOX
  [bakeSpeciesSprite(GRID_NOX_F0, '#8ee8ff', true), bakeSpeciesSprite(GRID_NOX_F1, '#8ee8ff', true), bakeSpeciesSprite(GRID_NOX_F2, '#8ee8ff', true), bakeSpeciesSprite(GRID_NOX_F3, '#8ee8ff', true)],
  // Level 8: GLIMMER
  [bakeSpeciesSprite(GRID_GLIMMER_F0, '#e8604c', true), bakeSpeciesSprite(GRID_GLIMMER_F1, '#e8604c', true), bakeSpeciesSprite(GRID_GLIMMER_F2, '#e8604c', true), bakeSpeciesSprite(GRID_GLIMMER_F3, '#e8604c', true)],
  // Level 9: VEIL
  [bakeSpeciesSprite(GRID_VEIL_F0, '#d9e2ea', true), bakeSpeciesSprite(GRID_VEIL_F1, '#d9e2ea', true), bakeSpeciesSprite(GRID_VEIL_F2, '#d9e2ea', true), bakeSpeciesSprite(GRID_VEIL_F3, '#d9e2ea', true)],
  // Level 10: AURORA
  [bakeSpeciesSprite(GRID_AURORA_F0, '#7cc95a', true), bakeSpeciesSprite(GRID_AURORA_F1, '#7cc95a', true), bakeSpeciesSprite(GRID_AURORA_F2, '#7cc95a', true), bakeSpeciesSprite(GRID_AURORA_F3, '#7cc95a', true)],
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
// CARNIVORE FISH (30 art px wide: piranha-inspired in purple, deep body,
// heavy underbite, two rows of triangular teeth, adipose fin, and strong forked tail)
// ============================================================================
const C_CARNIVORE: Record<string, PaletteKey> = {
  P: 'purple3',       // #9a5cc4 base purple flank
  D: 'purple4',       // #5e3a8c dark back / adipose
  K: 'purple5',       // #3a2660 shadow
  T: 'cream',         // Sharp triangular teeth rows
  W: 'white',         // Tooth highlights
  E: 'gold3',         // Predator gold eye
  X: 'outline',       // Pupil / underbite rim
  L: 'purple2',       // #b184d8 light belly
};

const C_CARNIVORE_DYING: Record<string, PaletteKey> = {
  P: 'silver',
  D: 'outline',
  K: 'outline',
  T: 'cream',
  W: 'silver',
  E: 'outline',
  X: 'outline',
  L: 'silver',
};

// 4-frame strong forked tail & pectoral flutter (30 wide x 18 high)
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

const GRID_CARNIVORE_F2 = [
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

const GRID_CARNIVORE_F3 = [
  '.........DD.DD.DD.............',
  '........DPPDPPDPP.............',
  '.......DPPPPPPPPPP............',
  '......DPPPPPPPPPPPP...........',
  '.....DPPPPPPPPPPPPPP..........',
  '...PPPPPPPPPPPPPPPPPP.........',
  '..PEEXPPPPPPPPPPPPPPPP........',
  '.PEEXXPPPPPPPPPPPPPPPP..PP....',
  '.PPPPPPPPPPPPPPPPPPPPP.PPPP...',
  '..PPPPPPPPPPPPPPPPPPPPPDPPPP..',
  '..TT..PPPPPPPPPPPPPPPPPDPPPP..',
  '.TTTTTLLLLLLLLDDDDDDDD.DPPP...',
  'TTTTTTLLLLLLLLDDDDDDDDD.DD....',
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
    bakeSprite(GRID_CARNIVORE_F2, C_CARNIVORE),
    bakeSprite(GRID_CARNIVORE_F3, C_CARNIVORE),
  ],
  dying: [
    bakeDitheredSteps(bakeSprite(GRID_CARNIVORE_F0, C_CARNIVORE_DYING)),
    bakeDitheredSteps(bakeSprite(GRID_CARNIVORE_F1, C_CARNIVORE_DYING)),
    bakeDitheredSteps(bakeSprite(GRID_CARNIVORE_F2, C_CARNIVORE_DYING)),
    bakeDitheredSteps(bakeSprite(GRID_CARNIVORE_F3, C_CARNIVORE_DYING)),
  ],
};

export const CARNIVORE_SPRITES_AERO = {
  normal: [
    bakeSprite(GRID_CARNIVORE_F0, { ...C_CARNIVORE, P: 'aqua', D: 'navy' } as Record<string, PaletteKey>, undefined, undefined, 'carn', true),
    bakeSprite(GRID_CARNIVORE_F1, { ...C_CARNIVORE, P: 'aqua', D: 'navy' } as Record<string, PaletteKey>, undefined, undefined, 'carn', true),
    bakeSprite(GRID_CARNIVORE_F2, { ...C_CARNIVORE, P: 'aqua', D: 'navy' } as Record<string, PaletteKey>, undefined, undefined, 'carn', true),
    bakeSprite(GRID_CARNIVORE_F3, { ...C_CARNIVORE, P: 'aqua', D: 'navy' } as Record<string, PaletteKey>, undefined, undefined, 'carn', true),
  ],
  dying: [
    bakeDitheredSteps(bakeSprite(GRID_CARNIVORE_F0, { ...C_CARNIVORE, P: 'navy', D: 'silver' } as Record<string, PaletteKey>, undefined, undefined, 'carn', true)),
    bakeDitheredSteps(bakeSprite(GRID_CARNIVORE_F1, { ...C_CARNIVORE, P: 'navy', D: 'silver' } as Record<string, PaletteKey>, undefined, undefined, 'carn', true)),
    bakeDitheredSteps(bakeSprite(GRID_CARNIVORE_F2, { ...C_CARNIVORE, P: 'navy', D: 'silver' } as Record<string, PaletteKey>, undefined, undefined, 'carn', true)),
    bakeDitheredSteps(bakeSprite(GRID_CARNIVORE_F3, { ...C_CARNIVORE, P: 'navy', D: 'silver' } as Record<string, PaletteKey>, undefined, undefined, 'carn', true)),
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
  // Fins move independently
  const tailFrame = Math.floor(time / 0.12) % 4;
  const pecFrame = Math.floor(time * 6) % 2;
  const dorsalRipple = Math.floor(time * 5) % 3;
  const gillPulse = (time % 1.5) < 0.25;
  const isEating = state !== 'dying' && (timeSinceAte <= 0.15);

  const cacheKey = `${size}_${state}_${tailFrame}_${pecFrame}_${dorsalRipple}_${gillPulse ? 1 : 0}_${isEating ? 1 : 0}_${ditherStep}_${isAero ? 1 : 0}`;
  if (lazyFishCache.has(cacheKey)) {
    return lazyFishCache.get(cacheKey)!;
  }

  // Generate grid procedurally under anatomical parts manifest
  let grid: string[];
  if (size === 0) {
    grid = buildFish0Grid(state, tailFrame, pecFrame, dorsalRipple, gillPulse, isEating);
  } else if (size === 1) {
    grid = buildFish1Grid(state, tailFrame, pecFrame, dorsalRipple, gillPulse, isEating);
  } else {
    grid = buildFish2Grid(state, tailFrame, pecFrame, dorsalRipple, gillPulse, isEating);
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
  frame: number,
  state: 'normal' | 'dying' = 'normal',
  ditherStep: 0 | 1 | 2 | 3 = 0
): BakedSprite {
  const list = AERO_ACTIVE ? CARNIVORE_SPRITES_AERO : CARNIVORE_SPRITES;
  if (state === 'dying') {
    const dlist = list.dying[frame % list.dying.length];
    return dlist[ditherStep] || dlist[0];
  }
  return list.normal[frame % list.normal.length];
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


