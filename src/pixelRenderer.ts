/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CONFIG, type GameState, type ShopCategory, shopLog, saveState, saveProfiles, isPetUnlocked, profilesStore, loadProfiles, getSandboxSpawnList } from './App.tsx';
import { game } from './audioModule.ts';
import { t, tShort, getLanguage, setLanguage, wrap, measure, ACCOUNT_SHORT_FORMS, drawTextWithClip, setActiveAuditWarnings, type Language } from './textEngine.ts';
import {
  PALETTE,
  SPRITES,
  getFishSprite,
  getCarnivoreSprite,
  getGargoSprite,
  getSnailSprite,
  getEggHatchSprite,
  getPelletSprite,
  getCoinSprite,
  getGemSprite,
  getSpeciesSprite,
  drawBitmapText,
  drawMiniBitmapText,
  drawText,
  drawFittedText,
  fitText,
  getGroupFontTier,
  formatNumber,
  setAeroActive,
  type FontTier,
  type PaletteKey,
  type BakedSprite,
  SPECIES_SPRITES,
} from './pixelEngine.ts';

/**
 * Procedural retro sprite drawing function.
 * Center-positioned, respects facing direction, scaling, and supports night species glow cycles.
 */
export function S(
  ctx: CanvasRenderingContext2D,
  sprite: BakedSprite,
  x: number,
  y: number,
  facingLeft: boolean = false,
  scaleX: number = 1,
  scaleY: number = 1,
  time: number = 0,
  hasGlow: boolean = false
) {
  const img = facingLeft ? sprite.flipped : sprite.normal;
  const glowImg = facingLeft ? sprite.glowFlipped : sprite.glowNormal;
  const drawW = Math.round(sprite.width * scaleX);
  const drawH = Math.round(sprite.height * scaleY);

  if (hasGlow && glowImg) {
    // 3-frame cycle every 0.5s (0.166s per frame)
    const frame = Math.floor(time / 0.166) % 3;
    const radius = frame; // 0, 1, or 2 pixels
    if (radius > 0) {
      // Draw offsets for pixel-perfect solid color outer glow
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.abs(dx) + Math.abs(dy) <= radius) {
            ctx.drawImage(glowImg, x - Math.floor(drawW / 2) + dx, y - Math.floor(drawH / 2) + dy, drawW, drawH);
          }
        }
      }
    }
  }

  ctx.drawImage(img, x - Math.floor(drawW / 2), y - Math.floor(drawH / 2), drawW, drawH);
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// AMBIENT SIMULATION STATE (Ring bubbles & Dust motes)
// ============================================================================
interface RingBubble {
  x: number;
  y: number;
  speed: number;
  wobbleSpeed: number;
  wobblePhase: number;
  size: 2 | 3;
}

interface DustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
}

const RING_BUBBLES: RingBubble[] = [
  { x: 50, y: 120, speed: 18, wobbleSpeed: 2.2, wobblePhase: 0.5, size: 3 },
  { x: 110, y: 220, speed: 22, wobbleSpeed: 2.8, wobblePhase: 1.4, size: 2 },
  { x: 190, y: 160, speed: 16, wobbleSpeed: 2.0, wobblePhase: 2.1, size: 3 },
  { x: 260, y: 80, speed: 20, wobbleSpeed: 2.5, wobblePhase: 3.2, size: 2 },
  { x: 320, y: 240, speed: 19, wobbleSpeed: 2.4, wobblePhase: 4.0, size: 3 },
  { x: 375, y: 190, speed: 23, wobbleSpeed: 3.0, wobblePhase: 5.1, size: 2 },
];

const DUST_MOTES: DustMote[] = [
  { x: 40, y: 55, vx: 2, vy: 1, phase: 0.3 },
  { x: 75, y: 140, vx: -1.5, vy: 1.5, phase: 1.2 },
  { x: 125, y: 90, vx: 1.8, vy: -1.2, phase: 2.1 },
  { x: 160, y: 210, vx: -2, vy: 1, phase: 3.0 },
  { x: 205, y: 125, vx: 1.5, vy: 1.8, phase: 4.2 },
  { x: 240, y: 70, vx: -1.8, vy: -1, phase: 5.1 },
  { x: 275, y: 185, vx: 2.2, vy: 1.2, phase: 0.8 },
  { x: 310, y: 110, vx: -1.5, vy: 1.6, phase: 1.7 },
  { x: 345, y: 230, vx: 1.6, vy: -1.4, phase: 2.9 },
  { x: 380, y: 80, vx: -2, vy: 1.1, phase: 3.8 },
  { x: 90, y: 245, vx: 1.4, vy: -1.5, phase: 4.7 },
  { x: 290, y: 155, vx: -1.7, vy: 1.3, phase: 5.6 },
];

const AERO_CLOUDS = [
  { x: 50, y: 5, w: 20, speed: 2.5, phase: 0.1 },
  { x: 180, y: 12, w: 24, speed: 3.2, phase: 1.5 },
  { x: 310, y: 8, w: 16, speed: 2.1, phase: 2.8 },
];

const AERO_BOKEH = Array.from({ length: 8 }, (_, i) => ({
  x: Math.random() * 400,
  y: Math.random() * 300,
  size: 10 + Math.random() * 20,
  speed: 10 + Math.random() * 15,
  phase: Math.random() * Math.PI * 2
}));

const AERO_SEEDS = Array.from({ length: 6 }, (_, i) => ({
  x: Math.random() * 400,
  y: 300 + Math.random() * 100,
  speed: 20 + Math.random() * 30,
  phase: Math.random() * Math.PI * 2
}));

function renderAeroClouds(ctx: CanvasRenderingContext2D, gs: GameState, tier: number) {
  if (tier === 0) return;
  const count = tier === 1 ? 2 : 3;
  AERO_CLOUDS.slice(0, count).forEach(c => {
    const driftX = (c.x + gs.time * c.speed) % 460 - 30;
    ctx.fillStyle = PALETTE.white;
    ctx.fillRect(driftX, c.y, c.w, 8);
    ctx.fillStyle = PALETTE.glassLight;
    ctx.fillRect(driftX + 2, c.y + 6, c.w - 4, 2);
  });
}

function renderAeroAmbient(ctx: CanvasRenderingContext2D, gs: GameState, tier: number) {
  // Bubbles (10/5/3)
  const bubbleCount = tier === 2 ? 10 : (tier === 1 ? 5 : 3);
  for (let i = 0; i < bubbleCount; i++) {
    const t = gs.time + i * 2.3;
    const bx = (i * 41 + 23) % 380 + 10 + Math.sin(t * 0.5) * 15;
    const by = 350 - (t * 25) % 350;
    if (by > 30 && by < 270) {
      ctx.strokeStyle = PALETTE.white;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(bx - 1, by - 1, 1, 1); // Specular
    }
  }

  // Bokeh (8/0/0)
  if (tier === 2) {
    AERO_BOKEH.forEach(b => {
      const bx = b.x + Math.sin(gs.time * 0.2 + b.phase) * 20;
      const by = (b.y - gs.time * b.speed) % 350 + 300;
      ctx.fillStyle = 'rgba(232, 248, 255, 0.2)'; // glassLight transparent
      ctx.beginPath(); ctx.arc(bx, by % 300, b.size/4, 0, Math.PI * 2); ctx.fill();
    });
  }
  // Seeds (6/3/0)
  if (tier >= 1) {
    const count = tier === 1 ? 3 : 6;
    AERO_SEEDS.slice(0, count).forEach(s => {
      const sx = s.x + Math.sin(gs.time * 0.5 + s.phase) * 10;
      const sy = (s.y - gs.time * s.speed) % 400 - 50;
      if (sy > 30) {
        ctx.fillStyle = PALETTE.white;
        ctx.fillRect(sx, sy, 1, 3);
        ctx.fillRect(sx - 1, sy + 1, 3, 1);
      }
    });
  }
}

// ============================================================================
// ============================================================================
// CACHED BACKDROP LAYERS (L0 - L3)
// L0: 6 dithered water bands with top shimmer & glow
// L1: 2-tone far silhouettes fogged toward waterDark (rock arch, coral skyline, ship hull, 6 kelp strands)
// L2: Mid decor with 15% fog (boulder cluster, reef with brain, branching & tube coral, starfish, urchins)
// L3: Sand floor with 3 tones, ripples, 5 shells, 12 pebbles, 8 seaweed tufts, crab tracks, and 1px contact shadows
// ============================================================================
let cachedBackdropCanvas: HTMLCanvasElement | null = null;
let lastCachedTheme = '';
let lastCachedTod = '';

export function invalidateCachedBackdrop() {
  cachedBackdropCanvas = null;
}

function mixHex(c1: string, c2: string, ratio: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function buildCachedBackdrop(gs?: GameState): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const activeTheme = saveState.themes.active;
  setAeroActive(activeTheme === 'themeFrutigerAero');

  const isNight = gs?.tod === 'night';
  const mixColor = '#0a0d26';

  // --------------------------------------------------------------------------
  // L0: WATER BANDS (6 dithered bands across y: 30 to 270)
  // Height = 240 art px, so 6 bands of 40 art px each.
  // --------------------------------------------------------------------------
  let waterBands: string[] = [
    '#7be3d2',         // Band 0 (y 30..70)
    PALETTE.waterLight,// Band 1 (y 70..110) - #5cc2b0
    '#43a99a',         // Band 2 (y 110..150)
    PALETTE.waterMid,  // Band 3 (y 150..190) - #36908f
    '#276e78',         // Band 4 (y 190..230)
    PALETTE.waterDeep, // Band 5 (y 230..270) - #1f5566
  ];
  let waterDarkCol: string = PALETTE.waterDark; // #17384a

  if (activeTheme === 'decorMidnight') {
    waterBands = ['#1e293b', '#172554', '#0f172a', '#0a0f1d', '#020617', '#01030d'];
    waterDarkCol = '#000000';
  } else if (activeTheme === 'decorLagoon') {
    waterBands = ['#7dd3fc', '#38bdf8', '#0284c7', '#0369a1', '#075985', '#0c4a6e'];
    waterDarkCol = '#082f49';
  } else if (activeTheme === 'themeFrutigerAero') {
    waterBands = ['#c9f0ff', PALETTE.aeroWater1, PALETTE.aeroWater2, PALETTE.aeroWater3, PALETTE.aeroWater4, '#0b4d8a'];
    waterDarkCol = '#07325e';
  }

  if (isNight) {
    waterBands = waterBands.map(c => mixHex(c, mixColor, 0.75));
    waterDarkCol = mixHex(waterDarkCol, mixColor, 0.75);
  }

  // Draw Frutiger Aero top window view if Aero theme
  if (activeTheme === 'themeFrutigerAero') {
    for (let y = 0; y < 30; y++) {
      ctx.fillStyle = PALETTE.sky;
      ctx.fillRect(0, y, 400, 1);
      const ratio = y / 30;
      ctx.fillStyle = PALETTE.skyLight;
      for (let x = 0; x < 400; x++) {
        const threshold = [0, 0.5, 0.75, 0.25][(y % 2) * 2 + (x % 2)];
        if (ratio > threshold) ctx.fillRect(x, y, 1, 1);
      }
    }
    for (let x = 0; x < 400; x++) {
      const h = Math.floor(3 + Math.sin(x * 0.04) * 2 + Math.cos(x * 0.01) * 1.5);
      ctx.fillStyle = PALETTE.leaf;
      ctx.fillRect(x, 30 - h, 1, h);
      ctx.fillStyle = PALETTE.lime;
      ctx.fillRect(x, 30 - h, 1, 1);
    }
    if (isNight) {
      ctx.fillStyle = PALETTE.silver;
      ctx.beginPath(); ctx.arc(40, 10, 3, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = PALETTE.sun;
      ctx.fillRect(35, 10, 11, 1);
      ctx.fillRect(40, 5, 1, 11);
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(39, 9, 3, 3);
    }
    for (let x = 0; x < 400; x++) {
      const ry = 30 + Math.floor(Math.sin(x * 0.2) * 1);
      ctx.fillStyle = PALETTE.white;
      if ((x + ry) % 4 < 2) ctx.fillRect(x, ry - 1, 1, 1);
    }
    const pads = [60, 180, 320];
    pads.forEach(px => {
      ctx.fillStyle = PALETTE.leaf;
      ctx.fillRect(px - 4, 28, 8, 2);
      ctx.fillRect(px - 2, 27, 4, 1);
    });
    const lotus = [100, 260];
    lotus.forEach(lx => {
      ctx.fillStyle = PALETTE.cherry;
      ctx.fillRect(lx - 2, 26, 4, 2);
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(lx - 1, 25, 2, 1);
    });
  }

  // Base background fill in waterDarkCol
  ctx.fillStyle = waterDarkCol;
  ctx.fillRect(0, 30, 400, 270);

  // Render 6 water bands
  const bandH = 40; // 240 / 6 = 40
  for (let b = 0; b < 6; b++) {
    const startY = 30 + b * bandH;
    ctx.fillStyle = waterBands[b];
    ctx.fillRect(0, startY, 400, bandH);
  }

  // 2px-tall 2x2 Bayer dither transitions between adjacent bands:
  for (let b = 0; b < 5; b++) {
    const boundaryY = 30 + (b + 1) * bandH; // 70, 110, 150, 190, 230
    const colUpper = waterBands[b];
    const colLower = waterBands[b + 1];

    for (let x = 0; x < 400; x++) {
      if ((x % 2 === 0 && (boundaryY - 1) % 2 === 0) || (x % 2 === 1 && (boundaryY - 1) % 2 === 1)) {
        ctx.fillStyle = colLower;
        ctx.fillRect(x, boundaryY - 1, 1, 1);
      }
      if ((x % 2 === 1 && boundaryY % 2 === 0) || (x % 2 === 0 && boundaryY % 2 === 1)) {
        ctx.fillStyle = colUpper;
        ctx.fillRect(x, boundaryY, 1, 1);
      }
    }
  }

  // 12% glow tint near top (y: 30 to 45)
  for (let y = 30; y < 45; y++) {
    for (let x = 0; x < 400; x++) {
      if ((x % 4 === 0 && y % 4 === 1) || (x % 4 === 2 && y % 4 === 3)) {
        ctx.fillStyle = PALETTE.glow;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // --------------------------------------------------------------------------
  // L1: FAR SILHOUETTES (y: 150-270)
  // 2-tone shapes fogged toward waterDark (35% contrast, fading to waterDeep at base)
  // --------------------------------------------------------------------------
  const fogWater = waterDarkCol;
  const silHighlight = mixHex('#1c2d42', fogWater, 0.65);
  const silShadow = mixHex('#0d1826', fogWater, 0.70);
  const silBase = mixHex(waterBands[5] || PALETTE.waterDeep, fogWater, 0.50);

  function drawSilhouettePixel(x: number, y: number, isHighlight: boolean = false) {
    if (x < 0 || x >= 400 || y < 150 || y >= 270) return;
    const baseP = Math.max(0, (y - 210) / 60);
    const col = isHighlight ? silHighlight : mixHex(silShadow, silBase, baseP);
    ctx.fillStyle = col;
    ctx.fillRect(x, y, 1, 1);
  }

  // L1.1: Rock Arch (60x50 art px) at x=20..80, y=220..270
  for (let y = 220; y < 270; y++) {
    for (let x = 20; x < 80; x++) {
      const relX = x - 20;
      const relY = y - 220;
      const portalCenterX = 50;
      const portalCenterY = 270;
      const dx = (x - portalCenterX) / 16;
      const dy = (y - portalCenterY) / 32;
      const isInsidePortal = (dx * dx + dy * dy) < 1;

      if (!isInsidePortal) {
        const topCurve = Math.sin((relX / 60) * Math.PI) * 12;
        if (relY >= 12 - topCurve) {
          const isEdge = relY === Math.floor(12 - topCurve) || relX === 0 || relX === 59;
          drawSilhouettePixel(x, y, isEdge);
        }
      }
    }
  }

  // L1.2: Coral Skyline of 3 Fans
  const fans = [
    { cx: 24, cy: 235, rad: 22 },
    { cx: 342, cy: 230, rad: 26 },
    { cx: 372, cy: 235, rad: 24 }
  ];
  fans.forEach(f => {
    for (let sy = f.cy - f.rad; sy <= f.cy; sy++) {
      for (let sx = f.cx - f.rad; sx <= f.cx + f.rad; sx++) {
        const dx = sx - f.cx;
        const dy = sy - f.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= f.rad && dy < -2) {
          const angle = Math.atan2(dy, dx);
          if (Math.abs(Math.sin(angle * 8)) > 0.3 || dist > f.rad - 2) {
            drawSilhouettePixel(sx, sy, dist > f.rad - 2);
          }
        }
      }
    }
    for (let y = f.cy; y < 270; y++) {
      drawSilhouettePixel(f.cx, y, false);
      drawSilhouettePixel(f.cx + 1, y, false);
    }
  });

  // L1.3: Sunken Ship Hull (80x45 art px, back-right at x=300..380, y=225..270)
  for (let y = 225; y < 270; y++) {
    for (let x = 300; x < 380; x++) {
      const relX = x - 300;
      const relY = y - 225;
      const deckLine = 12 + Math.floor(relX * 0.15);
      const keelBottom = 45;
      if (relY >= deckLine && relY <= keelBottom) {
        const isPorthole = (x === 320 || x === 340 || x === 360) && (y === Math.floor(deckLine + 8));
        if (!isPorthole) {
          const isDeck = relY === deckLine;
          drawSilhouettePixel(x, y, isDeck);
        }
      }
    }
  }
  for (let y = 190; y < 235; y++) {
    drawSilhouettePixel(335, y, y === 190);
    drawSilhouettePixel(336, y, y === 190);
    drawSilhouettePixel(360, y, y === 205);
  }

  // L1.4: 6 Kelp Strands (statically baked in the far layer)
  const KELP_L1_STATIC = [
    { x: 18, height: 45 },
    { x: 48, height: 65 },
    { x: 78, height: 50 },
    { x: 318, height: 70 },
    { x: 350, height: 55 },
    { x: 382, height: 60 },
  ];
  for (let k = 0; k < KELP_L1_STATIC.length; k++) {
    const { x, height } = KELP_L1_STATIC[k];
    const baseY = 270;

    for (let seg = 0; seg < height; seg += 2) {
      const px = x;
      const py = baseY - seg;

      drawSilhouettePixel(px, py - 2, false);
      drawSilhouettePixel(px + 1, py - 2, false);

      if (seg > 6 && seg % 6 === 0) {
        const side = (seg / 6) % 2 === 0 ? 1 : -1;
        drawSilhouettePixel(px + side * 2, py - 2, false);
        drawSilhouettePixel(px + side * 3, py - 3, false);
      }
    }
  }

  // --------------------------------------------------------------------------
  // L1.5: DEPTH FOG GRADIENT
  // (waterDark at 18% at the bottom to 0% at the top) applied to the far layer only.
  // --------------------------------------------------------------------------
  const depthFog = ctx.createLinearGradient(0, 30, 0, 270);
  depthFog.addColorStop(0, 'rgba(0, 0, 0, 0)');
  depthFog.addColorStop(1, hexToRgba(waterDarkCol, 0.18));
  ctx.fillStyle = depthFog;
  ctx.fillRect(0, 30, 400, 240);

  // --------------------------------------------------------------------------
  // L2: MID DECOR (Full color with 15% fog towards waterDeep)
  // --------------------------------------------------------------------------
  const fogWaterDeep = waterBands[5] || PALETTE.waterDeep;
  function fogCol(hex: string): string {
    return mixHex(hex, fogWaterDeep, 0.15);
  }

  // L2.1: Boulder Cluster at Left (30x20 art px) at x=25..55, y=250..270
  const boulders = [
    { cx: 32, cy: 260, rx: 8, ry: 6, col: fogCol('#64748b'), hi: fogCol('#94a3b8') },
    { cx: 48, cy: 262, rx: 7, ry: 5, col: fogCol('#475569'), hi: fogCol('#64748b') },
    { cx: 40, cy: 254, rx: 6, ry: 5, col: fogCol('#64748b'), hi: fogCol('#cbd5e1') },
  ];
  boulders.forEach(b => {
    for (let dy = -b.ry; dy <= b.ry; dy++) {
      for (let dx = -b.rx; dx <= b.rx; dx++) {
        if ((dx * dx) / (b.rx * b.rx) + (dy * dy) / (b.ry * b.ry) <= 1) {
          const isTop = dy < -1;
          ctx.fillStyle = isTop ? b.hi : b.col;
          ctx.fillRect(b.cx + dx, b.cy + dy, 1, 1);
        }
      }
    }
  });

  // L2.2: Reef at Center-Right (x=325..375, y=240..270)
  // Brain Coral (x=325..342, y=250..270)
  for (let dy = -8; dy <= 8; dy++) {
    for (let dx = -8; dx <= 8; dx++) {
      if (dx * dx + dy * dy <= 64) {
        const isGroove = (dx + dy + 20) % 3 === 0;
        ctx.fillStyle = isGroove ? fogCol('#be123c') : fogCol('#fb7185');
        ctx.fillRect(334 + dx, 260 + dy, 1, 1);
      }
    }
  }

  // Branching Coral (x=345..362, y=240..270)
  const branchPxl = [
    [352, 270], [352, 265], [352, 260], [352, 255], [352, 250], [352, 245],
    [348, 258], [346, 253], [345, 248],
    [356, 256], [359, 251], [361, 246],
    [352, 250], [350, 243], [354, 241]
  ];
  branchPxl.forEach(([bx, by]) => {
    ctx.fillStyle = fogCol(PALETTE.orange);
    ctx.fillRect(bx, by, 2, 2);
    ctx.fillStyle = fogCol(PALETTE.gold);
    ctx.fillRect(bx, by, 1, 1);
  });

  // Tube Coral (x=364..375, y=244..270)
  const tubes = [
    { x: 365, y: 248, h: 22, w: 3 },
    { x: 369, y: 242, h: 28, w: 3 },
    { x: 373, y: 252, h: 18, w: 3 }
  ];
  tubes.forEach(t => {
    ctx.fillStyle = fogCol(PALETTE.carnivorePurple);
    ctx.fillRect(t.x, t.y, t.w, t.h);
    ctx.fillStyle = fogCol(PALETTE.carnivoreDark);
    ctx.fillRect(t.x + t.w - 1, t.y, 1, t.h);
    ctx.fillStyle = fogCol(PALETTE.diamond);
    ctx.fillRect(t.x, t.y, t.w, 2);
    ctx.fillStyle = fogCol('#06b6d4');
    ctx.fillRect(t.x + 1, t.y + 1, t.w - 2, 1);
  });

  // L2.3: 2 Starfish
  const starfishPos = [[62, 265], [330, 267]];
  starfishPos.forEach(([tx, ty]) => {
    ctx.fillStyle = fogCol(PALETTE.coral);
    ctx.fillRect(tx + 2, ty, 1, 5);
    ctx.fillRect(tx, ty + 2, 5, 1);
    ctx.fillRect(tx + 1, ty + 1, 3, 3);
    ctx.fillStyle = fogCol(PALETTE.gold);
    ctx.fillRect(tx + 2, ty + 2, 1, 1);
  });

  // L2.4: 2 Urchins
  const urchinPos = [[18, 268], [382, 269]];
  urchinPos.forEach(([ux, uy]) => {
    ctx.fillStyle = fogCol('#1e1b4b');
    ctx.fillRect(ux + 1, uy + 1, 3, 3);
    ctx.fillStyle = fogCol('#4338ca');
    ctx.fillRect(ux, uy + 2, 5, 1);
    ctx.fillRect(ux + 2, uy, 1, 5);
    ctx.fillRect(ux, uy, 1, 1);
    ctx.fillRect(ux + 4, uy, 1, 1);
    ctx.fillRect(ux, uy + 4, 1, 1);
    ctx.fillRect(ux + 4, uy + 4, 1, 1);
    ctx.fillStyle = fogCol('#38bdf8');
    ctx.fillRect(ux + 2, uy + 1, 1, 1);
  });

  // L2.5: 2 Anemones (statically baked in the mid decor layer)
  const ANEMONES_STATIC = [[40, 248], [345, 238]];
  ANEMONES_STATIC.forEach(([ax, ay]) => {
    ctx.fillStyle = fogCol(PALETTE.coral);
    ctx.fillRect(ax - 2, ay + 4, 6, 4);

    ctx.fillStyle = fogCol(PALETTE.glow);
    ctx.fillRect(ax - 4, ay, 2, 5);
    ctx.fillRect(ax - 2, ay - 2, 2, 6);
    ctx.fillRect(ax, ay - 3, 2, 7);
    ctx.fillRect(ax + 2, ay - 2, 2, 6);
    ctx.fillRect(ax + 4, ay, 2, 5);
  });

  // --------------------------------------------------------------------------
  // L3: SAND FLOOR (y: 270 to 300)
  // 3 sand tones, ripples, 5 shells, 12 pebbles, 8 seaweed tufts, crab tracks, 1px contact shadows
  // --------------------------------------------------------------------------
  let sand1: string = PALETTE.sand1; // #fff0c8
  let sand2: string = PALETTE.sand;  // #f0c987
  let sand3: string = PALETTE.sandShade; // #b07c4f

  if (isNight) {
    sand1 = mixHex(sand1, mixColor, 0.6);
    sand2 = mixHex(sand2, mixColor, 0.6);
    sand3 = mixHex(sand3, mixColor, 0.6);
  }

  ctx.fillStyle = sand1;
  ctx.fillRect(0, 270, 400, 8);
  ctx.fillStyle = sand2;
  ctx.fillRect(0, 278, 400, 10);
  ctx.fillStyle = sand3;
  ctx.fillRect(0, 288, 400, 12);

  // Sand ripples
  for (let x = 0; x < 400; x++) {
    const r1 = Math.floor(Math.sin(x * 0.08) * 1.5);
    const r2 = Math.floor(Math.cos(x * 0.06 + 1.2) * 1.5);
    ctx.fillStyle = sand2;
    ctx.fillRect(x, 274 + r1, 1, 1);
    ctx.fillStyle = sand3;
    ctx.fillRect(x, 283 + r2, 1, 1);
  }

  // Sand speckles scatter
  for (let i = 0; i < 90; i++) {
    const sx = (i * 37 + 13) % 400;
    const sy = 271 + ((i * 19 + 7) % 27);
    ctx.fillStyle = (sy > 285) ? sand2 : sand3;
    ctx.fillRect(sx, sy, 1, 1);
  }

  // Crab tracks
  const crabSteps = [
    [165, 280], [170, 282], [175, 281], [180, 283], [185, 285],
    [242, 286], [248, 284], [254, 285], [260, 287]
  ];
  crabSteps.forEach(([cx, cy]) => {
    ctx.fillStyle = sand3;
    ctx.fillRect(cx, cy, 1, 1);
    ctx.fillRect(cx + 2, cy - 1, 1, 1);
  });

  // L3 Contact Shadow Helper
  const shadowCol = mixHex(sand3, '#2a1b24', 0.5);
  function drawContactShadow(x: number, y: number, w: number) {
    ctx.fillStyle = shadowCol;
    ctx.fillRect(x, y, w, 1);
  }

  // Contact shadows for L2 structures
  drawContactShadow(24, 270, 32);
  drawContactShadow(324, 270, 52);
  drawContactShadow(16, 273, 8);
  drawContactShadow(380, 274, 8);

  // L3.1: 5 Shell Species
  // 1) Spiral Conch
  drawContactShadow(95, 285, 5);
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(95, 282, 5, 3);
  ctx.fillStyle = PALETTE.tan;
  ctx.fillRect(98, 282, 2, 2);
  ctx.fillRect(99, 281, 1, 1);

  // 2) Scallop Shell
  drawContactShadow(140, 289, 5);
  ctx.fillStyle = PALETTE.coral2 || PALETTE.coral;
  ctx.fillRect(140, 286, 5, 3);
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(141, 286, 1, 3);
  ctx.fillRect(143, 286, 1, 3);

  // 3) Auger Shell
  drawContactShadow(210, 283, 7);
  ctx.fillStyle = PALETTE.gold2 || PALETTE.gold;
  ctx.fillRect(210, 281, 7, 2);
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(210, 281, 2, 2);
  ctx.fillRect(214, 281, 1, 1);

  // 4) Clam Shell
  drawContactShadow(275, 288, 4);
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(275, 285, 4, 3);
  ctx.fillStyle = PALETTE.tan;
  ctx.fillRect(276, 286, 2, 1);

  // 5) Cowrie Shell
  drawContactShadow(348, 286, 5);
  ctx.fillStyle = PALETTE.white;
  ctx.fillRect(348, 283, 5, 3);
  ctx.fillStyle = sand3;
  ctx.fillRect(349, 284, 3, 1);

  // L3.2: 12 Pebbles
  const pebbles: [number, number, number, number][] = [
    [26, 278, 3, 2], [72, 288, 3, 2], [116, 276, 4, 2], [158, 292, 3, 2],
    [195, 281, 2, 2], [225, 289, 4, 2], [252, 275, 3, 2], [288, 293, 3, 2],
    [318, 283, 4, 2], [340, 277, 3, 2], [362, 290, 3, 2], [386, 282, 2, 2]
  ];
  pebbles.forEach(([px, py, pw, ph]) => {
    drawContactShadow(px, py + ph, pw);
    ctx.fillStyle = sand3;
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = PALETTE.silver;
    ctx.fillRect(px, py, pw - 1, 1);
  });

  // L3.3: 8 Seaweed Tufts
  const tuftX = [32, 82, 125, 172, 230, 265, 312, 368];
  tuftX.forEach(tx => {
    drawContactShadow(tx - 1, 271, 5);
    ctx.fillStyle = PALETTE.leaf2 || PALETTE.alienGreen;
    ctx.fillRect(tx, 267, 1, 4);
    ctx.fillRect(tx + 2, 268, 1, 3);
    ctx.fillRect(tx - 1, 269, 1, 2);
  });

  // Moon glow at top-right if night
  if (isNight) {
    const moonCenterX = 340;
    const moonCenterY = 60;
    const moonRad = 40;
    ctx.fillStyle = '#e0f2fe';
    for (let dy = -moonRad; dy <= moonRad; dy++) {
      for (let dx = -moonRad; dx <= moonRad; dx++) {
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);
        if (dist <= moonRad) {
          const ditherProb = 1.0 - (dist / moonRad);
          if (Math.random() < ditherProb * 0.4) {
            ctx.fillRect(moonCenterX + dx, moonCenterY + dy, 1, 1);
          }
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // BAKE COZY WARM OVERLAY (#ffb561 at 6% opacity)
  // --------------------------------------------------------------------------
  ctx.save();
  ctx.fillStyle = '#ffb561';
  ctx.globalAlpha = 0.06;
  ctx.fillRect(0, 30, 400, 270);
  ctx.restore();

  // --------------------------------------------------------------------------
  // BAKE RADIAL VIGNETTE (Soft darkening of corners)
  // --------------------------------------------------------------------------
  ctx.save();
  const vignette = ctx.createRadialGradient(200, 150, 140, 200, 150, 240);
  vignette.addColorStop(0, 'rgba(10, 15, 30, 0)');
  vignette.addColorStop(1, 'rgba(10, 15, 30, 0.32)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 30, 400, 270);
  ctx.restore();

  return canvas;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================================
// LIVE DECORATIONS (L1 6 Kelp Strands & L2 2 Anemones)
// ============================================================================
const KELP_L1 = [
  { x: 18, height: 45 },
  { x: 48, height: 65 },
  { x: 78, height: 50 },
  { x: 318, height: 70 },
  { x: 350, height: 55 },
  { x: 382, height: 60 },
];

// ============================================================================
// DYNAMIC WATER SURFACE, LIGHT SHAFTS & CAUSTICS
// ============================================================================
function renderWaterSurface(ctx: CanvasRenderingContext2D, gs: GameState, tier: number) {
  const time = gs.time;
  const frame = Math.floor(time * 2) % 2; // 2-frame wave line

  const isNight = gs.tod === 'night';
  const activeTheme = saveState.themes.active;

  let foamColor = '#ffffff';
  let waveColor = '#7be3d2'; // default day top band color
  if (activeTheme === 'themeFrutigerAero') {
    waveColor = '#c9f0ff';
  } else if (activeTheme === 'decorMidnight') {
    waveColor = '#1e293b';
  } else if (activeTheme === 'decorLagoon') {
    waveColor = '#7dd3fc';
  }

  if (isNight) {
    waveColor = mixHex(waveColor, '#0a0d26', 0.75);
    foamColor = '#d9e2ea';
  }

  for (let x = 0; x < 400; x++) {
    const phase = frame === 0 ? 0 : Math.PI;
    const wy = 30 + Math.floor(Math.sin(x * 0.12 + phase) * 1.5);

    // Wave base
    ctx.fillStyle = waveColor;
    ctx.fillRect(x, wy, 1, 1);

    // Foam dither
    if (tier >= 1) {
      if ((x + frame * 3) % 2 === 0) {
        ctx.fillStyle = foamColor;
        ctx.fillRect(x, wy - 1, 1, 1);
      }
    } else {
      if ((x + frame) % 3 === 0) {
        ctx.fillStyle = foamColor;
        ctx.fillRect(x, wy - 1, 1, 1);
      }
    }
  }
}

let causticsFrames: HTMLCanvasElement[] = [];

function ensureCausticsBaked() {
  if (causticsFrames.length > 0) return;

  for (let f = 0; f < 4; f++) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';

    const phase = (f / 4) * Math.PI * 2;
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const nx = (x / 32) * Math.PI * 2;
        const ny = (y / 32) * Math.PI * 2;

        const wave1 = Math.sin(nx + phase) + Math.cos(ny - phase);
        const wave2 = Math.sin(ny + nx + phase * 1.5);
        const wave3 = Math.cos(nx - ny * 2 - phase * 0.7);
        const sum = Math.abs(wave1 + wave2 + wave3) / 3.0;

        if (sum > 0.58) {
          if ((x + y) % 2 === 0) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
    causticsFrames.push(canvas);
  }
}

function renderDynamicCaustics(ctx: CanvasRenderingContext2D, gs: GameState, tier: number) {
  if (tier === 0) return; // Caustics off on low tier

  ensureCausticsBaked();

  const frameCount = tier === 2 ? 4 : 2; // caustics 4 frames, then 2, then off
  const frame = Math.floor(gs.time / 0.25) % frameCount;

  const causticImg = causticsFrames[frame] || causticsFrames[0];
  if (!causticImg) return;

  ctx.save();
  ctx.globalAlpha = 0.25; // tiled at 25%

  for (let y = 180; y < 300; y += 32) {
    for (let x = 0; x < 400; x += 32) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, Math.max(180, y), 400, Math.min(32, 300 - y));
      ctx.clip();

      ctx.drawImage(causticImg, x, y);
      ctx.restore();
    }
  }
  ctx.restore();
}

function renderDynamicLightShafts(ctx: CanvasRenderingContext2D, gs: GameState, tier: number) {
  if (tier === 0) return; // Shafts off on low tier

  const time = gs.time;
  const isNight = gs.tod === 'night';
  const color = isNight ? '#e0f2fe' : PALETTE.waterLight;

  // Layer A sways on 9s, Layer B on 13s sines
  const swayA = Math.sin(time * (2 * Math.PI / 9.0)) * 20;
  const swayB = Math.sin(time * (2 * Math.PI / 13.0) + Math.PI / 3.0) * 16;

  const wideOrigins = [40, 140, 240, 340];
  const narrowOrigins = [90, 190, 290, 390];

  ctx.save();
  // Wide shafts, 20% dither, Layer A
  const wideCount = tier === 2 ? 4 : 2; // High draws 4, Med draws 2
  for (let i = 0; i < wideCount; i++) {
    const ox = wideOrigins[i];
    drawSlantedShaft(ctx, ox, 24, 0.20, swayA, color);
  }

  // Narrow shafts, 35% dither, Layer B
  if (tier === 2) { // shafts 8 on high, 4 on medium, 0 on low
    for (let i = 0; i < 4; i++) {
      const ox = narrowOrigins[i];
      drawSlantedShaft(ctx, ox, 12, 0.35, swayB, color);
    }
  }
  ctx.restore();
}

function drawSlantedShaft(
  ctx: CanvasRenderingContext2D,
  originX: number,
  width: number,
  ditherDensity: number,
  sway: number,
  color: string
) {
  ctx.fillStyle = color;
  for (let y = 31; y < 270; y++) {
    const shift = Math.floor((y - 30) * 0.28 + sway);
    const startX = originX + shift;
    for (let x = startX; x < startX + width; x++) {
      if (x >= 6 && x < 394) {
        const r = ((x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        const noise = r - Math.floor(r);
        if (noise < ditherDensity) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }
}

function renderL4Foreground(ctx: CanvasRenderingContext2D) {
  // Left margin kelp & rock (x in [0, 10], y in [276, 300])
  ctx.fillStyle = PALETTE.leaf;
  ctx.fillRect(0, 276, 3, 24);
  ctx.fillRect(3, 280, 5, 4);
  ctx.fillRect(2, 288, 6, 4);
  ctx.fillRect(1, 294, 5, 4);
  ctx.fillStyle = PALETTE.leaf2 || PALETTE.alienGreen;
  ctx.fillRect(4, 281, 3, 2);
  ctx.fillRect(3, 289, 4, 2);

  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 286, 9, 14);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, 286, 8, 2);
  ctx.fillRect(0, 288, 4, 3);

  // Right margin kelp & sea fan (x in [390, 400], y in [276, 300])
  ctx.fillStyle = PALETTE.leaf;
  ctx.fillRect(397, 276, 3, 24);
  ctx.fillRect(392, 278, 5, 4);
  ctx.fillRect(393, 286, 6, 4);
  ctx.fillRect(394, 293, 5, 4);
  ctx.fillStyle = PALETTE.leaf2 || PALETTE.alienGreen;
  ctx.fillRect(393, 279, 3, 2);
  ctx.fillRect(394, 287, 4, 2);

  ctx.fillStyle = PALETTE.coral;
  ctx.fillRect(394, 278, 6, 22);
  ctx.fillStyle = PALETTE.gold;
  for (let y = 278; y <= 300; y += 2) {
    for (let x = 392; x <= 400; x += 2) {
      if ((x + y) % 3 === 0) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

function renderAeroLightShafts(ctx: CanvasRenderingContext2D, gs: GameState) {
  const time = gs.time;
  const sway = Math.sin(time * 0.4) * 20;
  const origins = [40, 100, 160, 220, 280, 340];
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  origins.forEach(ox => {
    const x = ox + sway;
    ctx.beginPath();
    ctx.moveTo(x, 30);
    ctx.lineTo(x + 40, 270);
    ctx.lineTo(x + 60, 270);
    ctx.lineTo(x + 20, 30);
    ctx.fill();
  });
}

function renderAeroCaustics(ctx: CanvasRenderingContext2D, gs: GameState) {
  const frame = Math.floor(gs.time / 0.4) % 2;
  const offset = (gs.time * 10) % 40;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let y = 150; y < 300; y += 8) {
    for (let x = -40; x < 400; x += 16) {
      const dx = (x + offset + (y % 16)) % 440 - 40;
      if (frame === 0) {
        ctx.fillRect(dx, y, 4, 1);
        ctx.fillRect(dx + 2, y + 4, 4, 1);
      } else {
        ctx.fillRect(dx + 2, y, 4, 1);
        ctx.fillRect(dx, y + 4, 4, 1);
      }
    }
  }
}

function renderAeroNightSky(ctx: CanvasRenderingContext2D, gs: GameState) {
  const isNight = gs.tod === 'night';
  if (!isNight) return;

  const stars = [[120, 8], [240, 15], [360, 5], [60, 22], [180, 18], [300, 12]];
  ctx.fillStyle = PALETTE.white;
  stars.forEach((s, i) => {
    const twinkle = Math.sin(gs.time * 3 + i) > 0.5;
    if (twinkle) {
      ctx.fillRect(s[0], s[1], 1, 1);
      ctx.fillRect(s[0] - 1, s[1], 3, 1);
      ctx.fillRect(s[0], s[1] - 1, 1, 3);
    } else {
      ctx.fillRect(s[0], s[1], 1, 1);
    }
  });

  const mx = 40, my = 10;
  ctx.fillStyle = PALETTE.silver;
  ctx.beginPath(); ctx.arc(mx, my, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PALETTE.white;
  ctx.fillRect(mx - 1, my - 1, 1, 1);
}

function renderAeroPlants(ctx: CanvasRenderingContext2D, gs: GameState) {
  const sway = Math.floor(gs.time * 2.5) % 2;
  const plants = [30, 90, 150, 210, 270, 330, 380];
  plants.forEach(px => {
    const py = 270;
    ctx.fillStyle = PALETTE.leaf;
    ctx.fillRect(px + (sway ? 1 : 0), py - 12, 2, 12);
    ctx.fillStyle = PALETTE.lime;
    ctx.fillRect(px + (sway ? 2 : -1), py - 10, 3, 2);
    ctx.fillRect(px + (sway ? 0 : 3), py - 6, 3, 2);
  });
}

// ============================================================================
// ENRICHED TANK BORDER (Inner 2px shadow, Brass Corner Plates & Engraved Plaque)
// ============================================================================
function renderTankBorder(ctx: CanvasRenderingContext2D, gs: GameState) {
  const isNight = gs.tod === 'night';
  const activeTheme = saveState.themes.active;
  const isAero = activeTheme === 'themeFrutigerAero';

  let woodCol: string = PALETTE.wood;
  let woodDarkCol: string = PALETTE.woodDark;
  let woodLightCol: string = PALETTE.woodLight;

  if (isAero) {
    woodCol = PALETTE.white;
    woodDarkCol = PALETTE.aeroSilver;
    woodLightCol = PALETTE.white;
  } else if (isNight) {
    woodCol = mixHex(woodCol, '#0a0d26', 0.5);
    woodDarkCol = mixHex(woodDarkCol, '#0a0d26', 0.5);
    woodLightCol = mixHex(woodLightCol, '#0a0d26', 0.5);
  }

  // 1. Fill 6px frame with wood
  ctx.fillStyle = woodCol;
  ctx.fillRect(0, 30, 400, 6);   // Top bar
  ctx.fillRect(0, 294, 400, 6);  // Bottom bar
  ctx.fillRect(0, 30, 6, 270);   // Left bar
  ctx.fillRect(394, 30, 6, 270); // Right bar

  // 2. Outlines
  ctx.fillStyle = woodDarkCol;
  ctx.fillRect(0, 30, 400, 1);
  ctx.fillRect(0, 299, 400, 1);
  ctx.fillRect(0, 30, 1, 270);
  ctx.fillRect(399, 30, 1, 270);

  ctx.fillRect(5, 35, 390, 1);
  ctx.fillRect(5, 294, 390, 1);
  ctx.fillRect(5, 35, 1, 260);
  ctx.fillRect(394, 35, 1, 260);

  ctx.fillStyle = woodLightCol;
  ctx.fillRect(1, 31, 398, 1);
  ctx.fillRect(1, 31, 1, 267);

  // 3. Inner 2px Shadow Line
  ctx.fillStyle = 'rgba(10, 15, 30, 0.45)';
  ctx.fillRect(6, 36, 388, 2);   // Top inner shadow
  ctx.fillRect(6, 292, 388, 2);  // Bottom inner shadow
  ctx.fillRect(6, 38, 2, 254);   // Left inner shadow
  ctx.fillRect(392, 38, 2, 254); // Right inner shadow

  if (!isAero) {
    // 4. Brass Corner Plates (10x10 art px on all 4 corners)
    const brassMain = '#d97706';
    const brassLight = '#fef08a';
    const brassDark = '#78350f';
    const rivetCol = '#e2e8f0';

    const corners = [
      { x: 0, y: 30, flipX: false, flipY: false },
      { x: 390, y: 30, flipX: true, flipY: false },
      { x: 0, y: 290, flipX: false, flipY: true },
      { x: 390, y: 290, flipX: true, flipY: true },
    ];

    corners.forEach(c => {
      ctx.fillStyle = brassMain;
      ctx.fillRect(c.x, c.y, 10, 10);

      ctx.fillStyle = brassLight;
      ctx.fillRect(c.x, c.y, 10, 1);
      ctx.fillRect(c.x, c.y, 1, 10);

      ctx.fillStyle = brassDark;
      ctx.fillRect(c.x, c.y + 9, 10, 1);
      ctx.fillRect(c.x + 9, c.y, 1, 10);

      const r1x = c.flipX ? c.x + 2 : c.x + 7;
      const r1y = c.flipY ? c.y + 7 : c.y + 2;
      const r2x = c.flipX ? c.x + 7 : c.x + 2;
      const r2y = c.flipY ? c.y + 2 : c.y + 7;

      ctx.fillStyle = rivetCol;
      ctx.fillRect(r1x, r1y, 2, 2);
      ctx.fillRect(r2x, r2y, 2, 2);
      ctx.fillStyle = brassDark;
      ctx.fillRect(r1x + 1, r1y + 1, 1, 1);
      ctx.fillRect(r2x + 1, r2y + 1, 1, 1);
    });

    // 5. Blank Engraved Plaque (60x5 art px centered on top frame bar)
    const pqX = 170;
    const pqY = 31;
    const pqW = 60;
    const pqH = 5;

    ctx.fillStyle = brassDark;
    ctx.fillRect(pqX, pqY, pqW, pqH);

    ctx.fillStyle = brassMain;
    ctx.fillRect(pqX + 1, pqY + 1, pqW - 2, pqH - 2);

    ctx.fillStyle = brassLight;
    ctx.fillRect(pqX + 1, pqY + 1, pqW - 2, 1);

    ctx.fillStyle = brassDark;
    ctx.fillRect(pqX + 4, pqY + 2, pqW - 8, 1);

    ctx.fillStyle = rivetCol;
    ctx.fillRect(pqX + 2, pqY + 2, 1, 1);
    ctx.fillRect(pqX + pqW - 3, pqY + 2, 1, 1);

  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(2, 32, 20, 1);
    ctx.fillRect(2, 32, 1, 20);
    ctx.fillRect(378, 297, 20, 1);
    ctx.fillRect(397, 277, 1, 20);
  }
}

function renderDecorLayer(ctx: CanvasRenderingContext2D, gs: GameState) {
  // Legacy decor system removed
}



export function computeShopBadge(gs: GameState): boolean {
  if (!gs || !gs.shop) return false;

  for (let i = 0; i < CONFIG.SHOP_ITEMS.length; i++) {
    const item = CONFIG.SHOP_ITEMS[i];
    if (!isPetUnlocked(item.id, gs.completedLevels || saveState.completed)) continue;
    const currentLvl = gs.shop.levels[item.id] || 0;

    // Check maxed / owned
    if (item.category === 'themes') {
      if (saveState.themes.owned.includes(item.id)) continue;
    } else {
      if (item.maxLevel !== null && currentLvl >= item.maxLevel) continue;
    }

    // Check unlocked (requires)
    if (item.requires) {
      const reqLvl = gs.shop.levels[item.requires.id] || 0;
      if (reqLvl < item.requires.level) continue;
    }

    // Check capped pets
    if (item.id === 'buyFish') {
      const count = gs.fish.filter((f) => !f.isCarnivore && !f.dead).length;
      if (count >= 15) continue;
    } else if (item.id === 'carnivore') {
      const count = gs.fish.filter((f) => f.isCarnivore && !f.dead).length;
      if (count >= 2) continue;
    } else if (item.id === 'snail') {
      const count = gs.snails.filter((s) => !s.dead).length;
      if (count >= 1) continue;
    }

    // Check price
    const priceIndex = Math.min(currentLvl, item.prices ? item.prices.length - 1 : 0);
    const price = item.prices ? item.prices[priceIndex] : 0;
    if (gs.money >= price) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// NON-INTERACTIVE BACKGROUND LIFE
// Drawn behind all gameplay entities in desaturated/fogged palettes
// ============================================================================
function renderBackgroundLife(
  ctx: CanvasRenderingContext2D,
  gs: GameState,
  tier: number,
  theme: string
) {
  const time = gs.time;
  const isNight = gs.tod === 'night';

  const isChristmas = theme === 'themeChristmas';
  const isAero = theme === 'themeFrutigerAero';

  // --------------------------------------------------------------------------
  // 1. SCHOOL OF TINY FISH (5x3, 2-tone teal, 2-frame tail) OR NIGHT PLANKTON
  // High: 12 fish, Medium: 8 fish, Low: 0
  // --------------------------------------------------------------------------
  if (tier >= 1) {
    const schoolCount = tier === 2 ? 12 : 8;

    if (isNight) {
      for (let p = 0; p < schoolCount * 2; p++) {
        const px = (p * 37 + Math.sin(time * 0.4 + p) * 15) % 360 + 20;
        const py = 60 + ((time * (8 + (p % 5)) + p * 19) % 140);
        const pulse = Math.floor(time * 6 + p) % 3;
        if (pulse > 0) {
          ctx.fillStyle = p % 2 === 0 ? '#06b6d4' : '#f43f5e';
          ctx.fillRect(Math.floor(px), Math.floor(py), 1, 1);
          if (pulse === 2) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(Math.floor(px - 1), Math.floor(py), 3, 1);
          }
        }
      }
    } else {
      const schoolHeadingLeft = Math.floor(time / 8) % 2 === 0;
      const baseSchoolX = (time * (schoolHeadingLeft ? -10 : 10)) % 380;
      const schoolX = baseSchoolX < 0 ? baseSchoolX + 380 : baseSchoolX;

      let fishColor1 = '#38bdf8';
      let fishColor2 = '#0284c7';
      if (isChristmas) {
        fishColor1 = '#15803d';
        fishColor2 = '#eab308';
      } else if (isAero) {
        fishColor1 = '#38bdf8';
        fishColor2 = '#ffffff';
      }

      for (let i = 0; i < schoolCount; i++) {
        const driftX = Math.sin(time * 0.7 + i * 1.4) * 16;
        const driftY = Math.cos(time * 0.5 + i * 1.1) * 10;
        const fx = Math.floor(((schoolX + i * 26 + driftX) % 360) + 20);
        const fy = Math.floor(60 + ((i * 13) % 130) + driftY);

        const tailFrame = Math.floor(time * 12 + i) % 2;

        ctx.fillStyle = fishColor1;
        ctx.fillRect(fx, fy, 4, 2);
        ctx.fillStyle = fishColor2;
        ctx.fillRect(fx + 1, fy + 1, 3, 1);

        const tailX = schoolHeadingLeft ? fx + 4 : fx - 1;
        const tailY = fy + (tailFrame === 0 ? 0 : 1);
        ctx.fillStyle = fishColor1;
        ctx.fillRect(tailX, tailY, 1, 1);
      }
    }
  }

  // --------------------------------------------------------------------------
  // 2. JELLYFISH (16x20, dithered translucent bell, 4-frame pulse every 1.2s)
  // High: 2 jellies, Medium: 1 jelly, Low: 0
  // --------------------------------------------------------------------------
  if (tier >= 1) {
    const jellyCount = tier === 2 ? 2 : 1;
    const jellyBaseX = [70, 310];

    for (let j = 0; j < jellyCount; j++) {
      const bx = jellyBaseX[j];
      const by = Math.floor(80 + Math.sin(time * 0.4 + j * 2.1) * 35);
      const pulseFrame = Math.floor((time + j * 0.6) / 0.3) % 4;

      let bellCol = '#94a3b8';
      let tentacleCol = '#64748b';
      let haloCol = 'rgba(6, 182, 212, 0.3)';

      if (isChristmas) {
        bellCol = '#e0f2fe';
        tentacleCol = '#38bdf8';
      } else if (isAero) {
        bellCol = '#bfe9f7';
        tentacleCol = '#ffffff';
      }

      if (isNight) {
        const glowPhase = Math.floor(time * 6 + j) % 3;
        bellCol = glowPhase === 0 ? '#06b6d4' : (glowPhase === 1 ? '#ec4899' : '#38bdf8');
        tentacleCol = '#f43f5e';

        ctx.fillStyle = haloCol;
        ctx.fillRect(bx - 9, by - 1, 18, 12);
      }

      const bellW = [12, 14, 16, 14][pulseFrame];
      const bellH = [8, 9, 7, 8][pulseFrame];
      const startX = bx - Math.floor(bellW / 2);

      ctx.fillStyle = bellCol;
      for (let dy = 0; dy < bellH; dy++) {
        for (let dx = 0; dx < bellW; dx++) {
          const rx = dx - bellW / 2;
          const ry = dy;
          if ((rx * rx) / ((bellW / 2) * (bellW / 2)) + (ry * ry) / (bellH * bellH) <= 1) {
            if ((dx + dy) % 2 === 0) {
              ctx.fillRect(startX + dx, by + dy, 1, 1);
            }
          }
        }
      }

      if (isChristmas && !isNight) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx, by + 2, 1, 3);
        ctx.fillRect(bx - 1, by + 3, 3, 1);
      }

      if (isAero) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(startX + 2, by + 1, bellW - 4, 1);
      }

      ctx.fillStyle = tentacleCol;
      const tentacleSway = Math.floor(Math.sin(time * 3 + j) * 1.5);
      for (let t = -2; t <= 2; t += 2) {
        for (let ty = 0; ty < 10; ty++) {
          const tx = bx + t + Math.floor((ty / 10) * tentacleSway);
          if (ty % 2 === 0) ctx.fillRect(tx, by + bellH + ty, 1, 1);
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // 3. SEAHORSE (8x14) Clings to kelp strand & sways
  // High: 1 seahorse, Medium: 0, Low: 0
  // --------------------------------------------------------------------------
  if (tier === 2) {
    const kelpBaseX = 48;
    const swayOffset = Math.round((230 / 65) * Math.sin(time * 2.5) * 2.0);
    const shX = kelpBaseX + swayOffset + 2;
    const shY = 228;

    let bodyCol = '#d97706';
    let finCol = '#fbbf24';
    let isStripedTail = isChristmas;

    if (isChristmas) {
      bodyCol = '#dc2626';
      finCol = '#ffffff';
    } else if (isAero) {
      bodyCol = '#f8fafc';
      finCol = '#8de04a';
    }

    ctx.fillStyle = bodyCol;
    ctx.fillRect(shX + 1, shY, 4, 3);
    ctx.fillRect(shX - 2, shY + 1, 3, 1);
    ctx.fillRect(shX + 2, shY + 1, 1, 1);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(shX + 3, shY + 1, 1, 1);

    ctx.fillStyle = bodyCol;
    ctx.fillRect(shX + 2, shY + 3, 4, 5);
    ctx.fillStyle = finCol;
    ctx.fillRect(shX + 4, shY + 4, 2, 3);

    if (isStripedTail) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(shX + 2, shY + 8, 2, 2);
      ctx.fillRect(shX, shY + 12, 3, 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(shX + 1, shY + 10, 2, 2);
    } else {
      ctx.fillStyle = bodyCol;
      ctx.fillRect(shX + 2, shY + 8, 2, 3);
      ctx.fillRect(shX + 1, shY + 11, 2, 2);
      ctx.fillRect(shX, shY + 12, 2, 1);
    }
  }

  // --------------------------------------------------------------------------
  // 4. CRAB (10x6, 4-frame sideways walk, pausing 2-5s)
  // High: 1, Medium: 1, Low: 1
  // --------------------------------------------------------------------------
  const crabWalkCycle = time % 10;
  const isCrabWalking = crabWalkCycle < 6;
  const baseCrabX = 200 + Math.sin(time * 0.15) * 140;
  const crabX = Math.floor(Math.max(25, Math.min(375, baseCrabX)));
  const crabY = 268;

  let crabBodyCol = '#9f1239';
  let crabEyeCol = '#1e293b';

  if (isChristmas) {
    crabBodyCol = '#b91c1c';
  } else if (isAero) {
    crabBodyCol = '#dc2626';
  }

  ctx.fillStyle = crabBodyCol;
  ctx.fillRect(crabX - 4, crabY, 8, 4);

  if (isAero) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(crabX - 2, crabY + 1, 2, 1);
  }

  ctx.fillStyle = crabEyeCol;
  ctx.fillRect(crabX - 3, crabY - 1, 1, 1);
  ctx.fillRect(crabX + 2, crabY - 1, 1, 1);

  const clawState = Math.floor(time * 4) % 2;
  ctx.fillStyle = crabBodyCol;
  ctx.fillRect(crabX - 6, crabY - 1, 2, 2);
  ctx.fillRect(crabX + 4, crabY - 1, 2, 2);
  if (clawState === 1) {
    ctx.fillRect(crabX - 7, crabY - 2, 1, 1);
    ctx.fillRect(crabX + 6, crabY - 2, 1, 1);
  }

  const legFrame = isCrabWalking ? Math.floor(time * 12) % 4 : 0;
  ctx.fillStyle = crabBodyCol;
  if (legFrame === 0) {
    ctx.fillRect(crabX - 5, crabY + 4, 1, 2);
    ctx.fillRect(crabX - 3, crabY + 4, 1, 2);
    ctx.fillRect(crabX + 2, crabY + 4, 1, 2);
    ctx.fillRect(crabX + 4, crabY + 4, 1, 2);
  } else if (legFrame === 1) {
    ctx.fillRect(crabX - 4, crabY + 4, 1, 2);
    ctx.fillRect(crabX - 2, crabY + 4, 1, 2);
    ctx.fillRect(crabX + 1, crabY + 4, 1, 2);
    ctx.fillRect(crabX + 3, crabY + 4, 1, 2);
  } else if (legFrame === 2) {
    ctx.fillRect(crabX - 5, crabY + 4, 2, 1);
    ctx.fillRect(crabX - 2, crabY + 4, 2, 1);
    ctx.fillRect(crabX + 1, crabY + 4, 2, 1);
    ctx.fillRect(crabX + 4, crabY + 4, 2, 1);
  } else {
    ctx.fillRect(crabX - 4, crabY + 4, 1, 2);
    ctx.fillRect(crabX - 3, crabY + 4, 1, 2);
    ctx.fillRect(crabX + 2, crabY + 4, 1, 2);
    ctx.fillRect(crabX + 3, crabY + 4, 1, 2);
  }

  if (isChristmas) {
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(crabX - 2, crabY - 3, 4, 2);
    ctx.fillRect(crabX - 1, crabY - 4, 2, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(crabX - 3, crabY - 1, 6, 1);
    ctx.fillRect(crabX - 2, crabY - 5, 1, 1);
  }

  // --------------------------------------------------------------------------
  // 5. FLOOR VENTS & VENT BUBBLES
  // High: 2, Medium: 2, Low: 2
  // --------------------------------------------------------------------------
  const ventX = [110, 290];
  ventX.forEach((vx, vi) => {
    ctx.fillStyle = '#334155';
    ctx.fillRect(vx - 3, 268, 6, 3);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(vx - 2, 268, 4, 1);

    for (let b = 0; b < 5; b++) {
      const bubbleAge = (time * 2.8 + b * 0.35 + vi * 0.17) % 2.5;
      const by = 268 - bubbleAge * 25;
      if (by > 32 && by < 268) {
        const bx = Math.floor(vx + Math.sin(by * 0.12 + vi) * 2.5);
        ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
        ctx.fillRect(bx, Math.floor(by), 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx, Math.floor(by), 1, 1);
      }
    }
  });

  // --------------------------------------------------------------------------
  // 6. SURFACE SPARKLE GLINTS
  // High: 4 glints, Medium: 2 glints, Low: 0
  // --------------------------------------------------------------------------
  if (tier >= 1) {
    const glintCount = tier === 2 ? 4 : 2;
    const glintX = [65, 160, 240, 335];

    for (let g = 0; g < glintCount; g++) {
      const gx = glintX[g];
      const gy = 32 + (g % 2);
      const phase = Math.abs(Math.sin(time * 3.5 + g * 1.8));

      if (phase > 0.4) {
        ctx.fillStyle = PALETTE.white;
        if (phase > 0.8) {
          ctx.fillRect(gx, gy - 1, 1, 3);
          ctx.fillRect(gx - 1, gy, 3, 1);
        } else {
          ctx.fillRect(gx, gy, 1, 1);
        }
      }
    }
  }
}

/**
 * Draws a sprite with a 1px glow rim if in night mode.
 * Rim is #ffe08a at 50% dither.
 */
function drawWithGlowRim(
  ctx: CanvasRenderingContext2D,
  img: HTMLCanvasElement | HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  isNight: boolean
) {
  if (isNight) {
    // 1px glow rim (#ffe08a at a 50% dither)
    // We simulate the dither by drawing at 0.5 alpha in 4 directions
    ctx.save();
    ctx.globalAlpha = 0.4; // 50% dither roughly 0.4-0.5 alpha
    const ox = Math.floor(x);
    const oy = Math.floor(y);
    
    // Using a simpler 4-direction offset for performance and cleaner rim
    ctx.drawImage(img, ox - 1, oy, w, h);
    ctx.drawImage(img, ox + 1, oy, w, h);
    ctx.drawImage(img, ox, oy - 1, w, h);
    ctx.drawImage(img, ox, oy + 1, w, h);
    
    ctx.restore();
  }
  ctx.drawImage(img, x, y, w, h);
}

export function renderPixelScene(
  ctx: CanvasRenderingContext2D,
  gs: GameState,
  currentLevel: number,
  levelStats: { elapsedTime: number; finalMoney: number }
) {
  // --------------------------------------------------------------------------
  // TANK SCENE (Subject to 2px screen shake lasting 0.15s on alien death / fish killed)
  // Draw order: background, decor, shadows, food, coins, fish, aliens, particles, floating text
  // --------------------------------------------------------------------------
  ctx.save();
  if (gs.screenShakeEnabled !== false && gs.shakeTimer && gs.shakeTimer > 0) {
    const shakeProgress = gs.shakeTimer / 0.15;
    const shakeAngle = gs.time * 60;
    const shakeX = Math.round(Math.sin(shakeAngle) * 2 * Math.min(1, shakeProgress * 2));
    const shakeY = Math.round(Math.cos(shakeAngle * 1.3) * 2 * Math.min(1, shakeProgress * 2));
    ctx.translate(shakeX, shakeY);
  }

  // 1. BACKGROUND (Cached backdrop layer baked once on startup, self-invalidates on theme/TOD change)
  const activeTheme = saveState.themes.active;
  const currentTod = gs.tod;
  if (!cachedBackdropCanvas || lastCachedTheme !== activeTheme || lastCachedTod !== currentTod) {
    lastCachedTheme = activeTheme;
    lastCachedTod = currentTod;
    cachedBackdropCanvas = buildCachedBackdrop(gs);
  }
  ctx.drawImage(cachedBackdropCanvas, 0, 0);

  // Water Themes (Lagoon / Midnight)
  const isAeroScene = activeTheme === 'themeFrutigerAero';
  const graphicsTier = gs.lowPowerMode ? 0 : (gs.waterFxHigh ? 2 : 1);

  if (isAeroScene) {
    renderAeroClouds(ctx, gs, graphicsTier);
    if (gs.tod === 'night') renderAeroNightSky(ctx, gs);
  }

  // 1.5. Dynamic Water Surface wave line at y=30
  renderWaterSurface(ctx, gs, graphicsTier);

  // 2. DECOR (Light shafts, caustics, ambient)
  if (isAeroScene) {
    renderAeroLightShafts(ctx, gs);
    renderAeroCaustics(ctx, gs);
    renderAeroPlants(ctx, gs);
    renderAeroAmbient(ctx, gs, graphicsTier);
  } else {
    renderDynamicLightShafts(ctx, gs, graphicsTier);
    renderDynamicCaustics(ctx, gs, graphicsTier);
  }
  renderDecorLayer(ctx, gs);

  // Drifting dust motes or plankton
  const isNight = gs.tod === 'night';
  const moteCount = isNight ? 16 : DUST_MOTES.length;
  
  for (let m = 0; m < moteCount; m++) {
    const mote = DUST_MOTES[m % DUST_MOTES.length];
    
    if (isNight) {
      // Plankton: Drift up at 6-12 px/s
      const driftSpeed = 6 + (m % 7);
      mote.y -= driftSpeed * 0.016; // Approx 60fps
      mote.x += Math.sin(gs.time * 0.5 + mote.phase) * 0.2;
      
      if (mote.y < 35) {
        mote.y = 265;
        mote.x = Math.random() * 380 + 10;
      }
      
      // 3-frame pulse (using gs.time)
      const pulseFrame = Math.floor(gs.time * 20) % 3;
      if (pulseFrame === 0) continue; // "Off" frame
      
      ctx.fillStyle = m % 2 === 0 ? '#06b6d4' : '#ec4899'; // Cyan and Pink
      ctx.fillRect(Math.floor(mote.x), Math.floor(mote.y), 1, 1);
    } else {
      mote.x += Math.sin(gs.time * 0.8 + mote.phase) * 0.4;
      mote.y += Math.cos(gs.time * 0.6 + mote.phase) * 0.25;

      if (mote.x < 10) mote.x = 390;
      if (mote.x > 390) mote.x = 10;
      if (mote.y < 35) mote.y = 265;
      if (mote.y > 265) mote.y = 35;

      ctx.fillStyle = m % 2 === 0 ? PALETTE.waterLight : PALETTE.glow;
      ctx.fillRect(Math.floor(mote.x), Math.floor(mote.y), 1, 1);
    }
  }

  // Rising ring bubbles
  for (let b = 0; b < RING_BUBBLES.length; b++) {
    const bubble = RING_BUBBLES[b];
    bubble.y -= 0.35;
    if (bubble.y < 32) {
      bubble.y = 266;
      bubble.x = 20 + ((b * 63 + 17) % 360);
    }

    const wobble = Math.floor(Math.sin(gs.time * bubble.wobbleSpeed + bubble.wobblePhase) * 1.2);
    const bx = Math.floor(bubble.x + wobble);
    const by = Math.floor(bubble.y);

    if (bubble.size === 3) {
      ctx.fillStyle = PALETTE.waterLight;
      ctx.fillRect(bx + 1, by, 1, 1);
      ctx.fillRect(bx, by + 1, 1, 1);
      ctx.fillRect(bx + 2, by + 1, 1, 1);
      ctx.fillRect(bx + 1, by + 2, 1, 1);
    } else {
      ctx.fillStyle = PALETTE.waterLight;
      ctx.fillRect(bx, by, 2, 2);
    }
  }

  // 2.5 NON-INTERACTIVE BACKGROUND LIFE (Tiny fish school/plankton, jellies, seahorse, crab, vents, glints)
  renderBackgroundLife(ctx, gs, graphicsTier, activeTheme);

  // 3. SHADOWS (Coin drop shadows underneath resting/falling coins)
  for (let i = 0; i < gs.coins.length; i++) {
    const coin = gs.coins[i];
    if (coin.dead) continue;
    const cx = Math.floor(coin.x / 2);
    const cy = Math.floor(coin.y / 2);
    const baked = getCoinSprite(coin.type, 0, 0);
    let drawW = baked.normal.width;
    let drawH = baked.normal.height;
    if (coin.landingTimer && coin.landingTimer > 0) {
      drawW += 1;
      drawH = Math.max(1, drawH - 1);
    }
    const shadowW = Math.max(2, drawW - 1);
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(cx - Math.floor(shadowW / 2), cy + Math.floor(drawH / 2), shadowW, 1);
  }

  // 4. FOOD (Pellets: 4x4 chunky pixels with 1px outline & highlight, 2-frame sink wobble)
  for (let i = 0; i < gs.food.length; i++) {
    const pellet = gs.food[i];
    if (pellet.dead) continue;

    const wobble = !pellet.onFloor && (Math.floor((pellet.sinkAge || 0) / 0.18) % 2 === 1) ? 1 : 0;
    const px = Math.floor(pellet.x / 2) + wobble;
    const py = Math.floor(pellet.y / 2);

    const pelletSprite = getPelletSprite(pellet.tier || 0).normal;
    drawWithGlowRim(ctx, pelletSprite, px - Math.floor(pelletSprite.width / 2), py - Math.floor(pelletSprite.height / 2), pelletSprite.width, pelletSprite.height, isNight);
  }

  // 5. COINS (4-frame spin at 8fps, 1px squash bounce, 4-step dither fade at 7-9s)
  for (let i = 0; i < gs.coins.length; i++) {
    const coin = gs.coins[i];
    if (coin.dead) continue;

    const cx = Math.floor(coin.x / 2);
    const cy = Math.floor(coin.y / 2);
    const spinFrame = Math.floor(coin.age * 8) % 4;

    let ditherStep = 0;
    if (coin.age >= 7.0) {
      ditherStep = Math.min(3, Math.floor((coin.age - 7.0) / 0.5));
    }

    const baked = getCoinSprite(coin.type, spinFrame, ditherStep);
    const sprite = baked.normal;

    let drawW = sprite.width;
    let drawH = sprite.height;
    if (coin.landingTimer && coin.landingTimer > 0) {
      drawW += 1;
      drawH = Math.max(1, drawH - 1);
    }

    drawWithGlowRim(ctx, sprite, cx - Math.floor(drawW / 2), cy - Math.floor(drawH / 2), drawW, drawH, isNight);

    if (coin.type === 'diamond' && ditherStep < 3) {
      const sparkAng = coin.age * 6.28;
      const sparkRad = 4;
      const sx = cx + Math.round(Math.cos(sparkAng) * sparkRad);
      const sy = cy + Math.round(Math.sin(sparkAng) * sparkRad);
      ctx.fillStyle = PALETTE.cream;
      ctx.fillRect(sx, sy, 1, 1);
    }
  }

  // 6. FISH (Snails, Carnivores, Normal Goldfish)
  // Snails (14 art px, spiral shell in sand & orange, eyestalks bobbing 1px)
  for (let i = 0; i < gs.snails.length; i++) {
    const s = gs.snails[i];
    if (s.dead) continue;
    const sx = Math.floor(s.x / 2);
    const sy = Math.floor(s.y / 2);
    const snailFrame: 0 | 1 = (Math.floor(s.crawlTimer * 0.15) % 2 === 0) ? 0 : 1;
    const baked = getSnailSprite(snailFrame);
    const sprite = s.facing < 0 ? baked.flipped : baked.normal;
    drawWithGlowRim(ctx, sprite, sx - Math.floor(baked.width / 2), sy - Math.floor(baked.height / 2), baked.width, baked.height, isNight);
  }

  // Fish & Carnivores
  for (let i = 0; i < gs.fish.length; i++) {
    const fish = gs.fish[i];
    if (fish.dead) continue;

    const currentBob = Math.sin(fish.bobTimer + fish.bobOffset) * (CONFIG.fishBobAmplitude / 2);
    const fx = Math.floor(fish.x / 2);
    const fy = Math.floor((fish.y + currentBob) / 2);
    const isFacingLeft = fish.facing < 0;

    const tailPhase = (gs.time + fish.bobOffset) / 0.17;
    const tailFrame: 0 | 1 = Math.floor(tailPhase) % 2 === 0 ? 0 : 1;

    let popScaleX = 1.0;
    let popScaleY = 1.0;
    if (fish.scalePopTimer > 0) {
      const popElapsed = 0.25 - fish.scalePopTimer;
      const popP = popElapsed / 0.25;
      if (popP < 0.4) {
        popScaleX = 1.25;
        popScaleY = 0.8;
      } else if (popP < 0.8) {
        popScaleX = 0.9;
        popScaleY = 1.1;
      } else {
        popScaleX = 1.0;
        popScaleY = 1.0;
      }
    }

    let turnSquashX = 1.0;
    if (fish.turnTimer > 0) {
      turnSquashX = fish.turnTimer > 0.04 ? 0.5 : 0.75;
    }

    const totalScaleX = popScaleX * turnSquashX;
    const totalScaleY = popScaleY;

    if (fish.isCarnivore) {
      const isHunting = fish.timeSinceAte >= CONFIG.carnivoreHungryTime && !fish.isDying;
      const ditherStep: 0 | 1 | 2 | 3 = fish.isDying
        ? (Math.min(3, Math.floor((fish.fadeTimer / CONFIG.fishDeadFadeDuration) * 4)) as 0 | 1 | 2 | 3)
        : 0;
      const carnBaked = getCarnivoreSprite(tailFrame, fish.isDying ? 'dying' : 'normal', ditherStep);
      const carnSprite = isFacingLeft ? carnBaked.flipped : carnBaked.normal;
      const drawW = Math.round(carnSprite.width * totalScaleX);
      const drawH = Math.round(carnSprite.height * totalScaleY);

      if (fish.isDying) {
        ctx.save();
        ctx.translate(fx, fy);
        ctx.scale(1, -1);
        drawWithGlowRim(ctx, carnSprite, -Math.floor(drawW / 2), -Math.floor(drawH / 2), drawW, drawH, isNight);
        ctx.restore();
      } else {
        drawWithGlowRim(ctx, carnSprite, fx - Math.floor(drawW / 2), fy - Math.floor(drawH / 2), drawW, drawH, isNight);

        if (isHunting) {
          const glintX = isFacingLeft ? fx - Math.floor(drawW / 2) + 4 : fx + Math.floor(drawW / 2) - 5;
          const glintY = fy - 2;
          ctx.fillStyle = (Math.floor(gs.time * 8) % 2 === 0) ? PALETTE.cream : PALETTE.glow;
          ctx.fillRect(glintX, glintY, 1, 1);
        }
      }
      continue;
    }

    // Standard Fish (Size 0, 1, 2)
    const isHungry = fish.timeSinceAte >= CONFIG.fishHungryTime && !fish.isDying;
    const state = fish.isDying ? 'dying' : (isHungry ? 'hungry' : 'normal');

    const ditherStep: 0 | 1 | 2 | 3 = fish.isDying
      ? (Math.min(3, Math.floor((fish.fadeTimer / CONFIG.fishDeadFadeDuration) * 4)) as 0 | 1 | 2 | 3)
      : 0;

    const baked = getFishSprite(fish.size, state, tailFrame, ditherStep);
    const sprite = isFacingLeft ? baked.flipped : baked.normal;

    const drawW = Math.round(sprite.width * totalScaleX);
    const drawH = Math.round(sprite.height * totalScaleY);

    if (fish.isDying) {
      ctx.save();
      ctx.translate(fx, fy);
      ctx.scale(1, -1);
      drawWithGlowRim(ctx, sprite, -Math.floor(drawW / 2), -Math.floor(drawH / 2), drawW, drawH, isNight);
      ctx.restore();
    } else {
      drawWithGlowRim(ctx, sprite, fx - Math.floor(drawW / 2), fy - Math.floor(drawH / 2), drawW, drawH, isNight);

      if (isHungry) {
        const sweatCycle = (gs.time + fish.bobOffset) % 1.5;
        if (sweatCycle < 0.4) {
          const browOffsetX = isFacingLeft
            ? -Math.floor(drawW / 2) + 2
            : Math.floor(drawW / 2) - 3;
          const browY = fy - Math.floor(drawH / 2) + 1;

          if (sweatCycle < 0.18) {
            ctx.fillStyle = PALETTE.diamond;
            ctx.fillRect(fx + browOffsetX, browY, 1, 2);
          } else {
            const flickT = (sweatCycle - 0.18) / 0.22;
            const flickX = fx + browOffsetX + Math.round((isFacingLeft ? 4 : -4) * flickT);
            const flickY = browY - Math.round(flickT * 3);
            ctx.fillStyle = PALETTE.diamond;
            ctx.fillRect(flickX, flickY, 1, 1);
          }
        }
      }

      if (fish.size === 2) {
        const twinkleCycle = (gs.time + fish.id * 0.73) % 2.0;
        if (twinkleCycle < 0.2) {
          const crestX = isFacingLeft ? fx + 1 : fx - 1;
          const crestY = fy - Math.floor(drawH / 2);
          ctx.fillStyle = PALETTE.glow;
          ctx.fillRect(crestX, crestY, 1, 1);
          if (twinkleCycle >= 0.05 && twinkleCycle <= 0.15) {
            ctx.fillStyle = PALETTE.cream;
            ctx.fillRect(crestX, crestY, 1, 1);
          }
        }
      }
    }
  }

  // Render Pets
  for (let i = 0; i < gs.pets.length; i++) {
    const p = gs.pets[i];
    if (p.dead) continue;
    const px = Math.floor(p.x / 2);
    const py = Math.floor(p.y / 2);
    
    const frameIndex = (Math.floor(gs.time / 0.17) % 2) as 0 | 1;
    const sprite = getSpeciesSprite(p.level, frameIndex);
    const isFacingLeft = p.facing < 0;
    
    S(ctx, sprite, px, py, isFacingLeft, 1, 1, gs.time, isNight && p.level >= 6);
  }

  // 7. ALIENS (Alien Gargo, HP bar, weapon beam)
  for (let i = 0; i < gs.aliens.length; i++) {
    const alien = gs.aliens[i];
    if (alien.dead) continue;
    const ax = Math.floor(alien.x / 2);
    const ay = Math.floor(alien.y / 2);
    const isFacingLeft = alien.facing < 0;
    const isFlash = alien.flashTimer > 0;
    const wobbleFrame = (Math.floor(alien.animTimer / 0.2) % 3) as 0 | 1 | 2;
    const baked = getGargoSprite(wobbleFrame, isFlash);
    const sprite = isFacingLeft ? baked.flipped : baked.normal;

    drawWithGlowRim(ctx, sprite, ax - Math.floor(sprite.width / 2), ay - Math.floor(sprite.height / 2), sprite.width, sprite.height, isNight);

    // HP bar: 20x4 art px with an outline, coral fill, and yellow trail lagging 0.2s behind
    const barW = 20;
    const barH = 4;
    const barX = ax - 10;
    const barY = ay - 22;

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(barX, barY, barW, barH);

    const trailVal = alien.trailHp !== undefined ? alien.trailHp : alien.hp;
    const trailW = Math.max(0, Math.min(18, Math.round((trailVal / alien.maxHp) * 18)));
    if (trailW > 0) {
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(barX + 1, barY + 1, trailW, 2);
    }

    const fillW = Math.max(0, Math.min(18, Math.round((alien.hp / alien.maxHp) * 18)));
    if (fillW > 0) {
      ctx.fillStyle = PALETTE.coral;
      ctx.fillRect(barX + 1, barY + 1, fillW, 2);
    }
  }

  // Weapon Beam lines
  for (let i = 0; i < gs.beams.length; i++) {
    const beam = gs.beams[i];
    if (beam.dead) continue;
    const bx = Math.floor(beam.x / 2);
    const by = Math.floor(beam.y / 2);
    const startY = 30;

    for (let y = startY; y <= by; y++) {
      ctx.fillStyle = PALETTE.cream;
      ctx.fillRect(bx, y, 1, 1);
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(bx + 1, y, 1, 1);
    }

    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(bx - 1, by - 1, 2, 2);

    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(bx, by - 3, 1, 1);
    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(bx, by - 2, 1, 1);

    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(bx, by + 1, 1, 1);
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(bx, by + 2, 1, 1);

    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(bx - 3, by, 1, 1);
    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(bx - 2, by, 1, 1);

    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(bx + 1, by, 1, 1);
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(bx + 2, by, 1, 1);
  }

  // 8. PARTICLES (Non-text particles: bubbles, sparkles, slime, snail dots, alien death)
  for (let i = 0; i < gs.particles.length; i++) {
    const p = gs.particles[i];
    if (p.dead || p.type === 'text') continue;
    const px = Math.floor(p.x / 2);
    const py = Math.floor(p.y / 2);

    if (p.type === 'bubble') {
      ctx.fillStyle = PALETTE.waterLight;
      ctx.fillRect(px, py, 2, 2);
    } else if (p.type === 'snailDot') {
      const progress = p.life / p.maxLife;
      const ditherStep = Math.min(3, Math.floor(progress * 4));
      let skip = false;
      if (ditherStep === 1 && (px % 2 === 0 && py % 2 === 0)) skip = true;
      else if (ditherStep === 2 && ((px + py) % 2 === 0)) skip = true;
      else if (ditherStep === 3 && !(px % 2 === 1 && py % 2 === 1)) skip = true;

      if (!skip) {
        ctx.fillStyle = progress > 0.5 ? PALETTE.sandShade : PALETTE.sand;
        ctx.fillRect(px, py, 1, 1);
      }
    } else if (p.type === 'alienDeath') {
      const progress = p.life / p.maxLife;
      const ditherStep = Math.min(3, Math.floor(progress * 4));
      let skip = false;
      if (ditherStep === 1 && (px % 2 === 0 && py % 2 === 0)) skip = true;
      else if (ditherStep === 2 && ((px + py) % 2 === 0)) skip = true;
      else if (ditherStep === 3 && !(px % 2 === 1 && py % 2 === 1)) skip = true;

      if (!skip) {
        const colKey = (p.color as PaletteKey) || 'alienGreen';
        ctx.fillStyle = PALETTE[colKey] || PALETTE.alienGreen;
        ctx.fillRect(px, py, 2, 2);
      }
    } else {
      const isConfetti = p.type === 'confetti';
      const size = isConfetti ? (p.radius >= 2 ? 3 : 2) : (p.radius >= 2 ? 2 : 1);
      const progress = p.life / p.maxLife;
      let col: PaletteKey;
      if (p.color && (p.color in PALETTE)) {
        col = p.color as PaletteKey;
      } else if (progress < 0.25) col = 'cream';
      else if (progress < 0.5) col = 'glow';
      else if (progress < 0.75) col = 'gold';
      else col = 'orange';

      const ditherStep = Math.min(3, Math.floor(progress * 4));
      let skip = false;
      if (ditherStep === 1 && (px % 2 === 0 && py % 2 === 0)) skip = true;
      else if (ditherStep === 2 && ((px + py) % 2 === 0)) skip = true;
      else if (ditherStep === 3 && !(px % 2 === 1 && py % 2 === 1)) skip = true;

      if (!skip) {
        ctx.fillStyle = PALETTE[col];
        if (isConfetti) {
          // Colorful rotating square for confetti
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(p.life * 10);
          ctx.fillRect(-Math.floor(size / 2), -Math.floor(size / 2), size, size);
          ctx.restore();
        } else {
          ctx.fillRect(px, py, size, size);
        }
      }
    }
  }

  // 9. FLOATING TEXT (Rendered on top of particles in tank scene)
  for (let i = 0; i < gs.particles.length; i++) {
    const p = gs.particles[i];
    if (p.dead || p.type !== 'text') continue;
    const px = Math.floor(p.x / 2);
    const py = Math.floor(p.y / 2);
    const progress = p.life / p.maxLife;
    const ditherStep = Math.min(3, Math.floor(progress * 4));
    drawBitmapText(ctx, p.text || '', px, py, 'cream', 'center', 1, ditherStep);
  }

  // 9.5 CAUSTIC NET (Aero Only)
  if (saveState.themes.active === 'themeFrutigerAero') {
    const frame = Math.floor(gs.time / 0.4) % 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    const driftX = Math.floor(gs.time * 10) % 32;
    for (let y = 180; y < 290; y += 4) {
      for (let x = 0; x < 400; x += 4) {
        if (((x + driftX + y + frame * 4) % 16) < 4) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  // 9.8 L4 FOREGROUND PIECES (Drawn after entities, outer 10 art px & below y=276)
  renderL4Foreground(ctx);

  // Close tank scene shake
  ctx.restore();

  // --------------------------------------------------------------------------
  // 10. CHUNKY 6 ART PX WOODEN TANK BORDER & HUD (Never shaken)
  // --------------------------------------------------------------------------
  renderTankBorder(ctx, gs);

  // --------------------------------------------------------------------------
  // 8. WOODEN PLANK HUD BAR (y: 0 - 30, logical y: 0 - 60)
  // woodDark outline, wood fill with two plank seams and pixel grain streaks,
  // woodLight 1px top highlight and nailheads at both ends.
  // --------------------------------------------------------------------------
  // Base HUD fill
  const isAero = saveState.themes.active === 'themeFrutigerAero';
  ctx.fillStyle = isAero ? PALETTE.glassMid : PALETTE.wood;
  ctx.fillRect(0, 0, 400, 30);

  // 1px top highlight
  ctx.fillStyle = isAero ? PALETTE.white : PALETTE.woodLight;
  ctx.fillRect(0, 0, 400, 1);

  // Bottom outline
  ctx.fillStyle = isAero ? PALETTE.deepSky : PALETTE.woodDark;
  ctx.fillRect(0, 29, 400, 1);

  if (!isAero) {
    // Two-tone wood grain: alternating seams and planks
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(0, 10, 400, 1);
    ctx.fillRect(0, 20, 400, 1);
    ctx.fillStyle = PALETTE.woodLight;
    ctx.fillRect(0, 11, 400, 1);
    ctx.fillRect(0, 21, 400, 1);

    // Pixel grain streaks across the 3 boards (two-tone wood grain)
    ctx.fillStyle = PALETTE.woodDark;
    const grainStreaks = [
      // Board 1 (y: 2-9)
      { x: 12, y: 3, w: 18 }, { x: 48, y: 7, w: 14 }, { x: 80, y: 4, w: 22 },
      { x: 130, y: 8, w: 16 }, { x: 175, y: 3, w: 24 }, { x: 220, y: 6, w: 15 },
      { x: 260, y: 4, w: 20 }, { x: 310, y: 7, w: 16 }, { x: 350, y: 3, w: 25 },
      // Board 2 (y: 12-19)
      { x: 20, y: 13, w: 15 }, { x: 60, y: 17, w: 20 }, { x: 110, y: 14, w: 14 },
      { x: 150, y: 18, w: 25 }, { x: 200, y: 13, w: 18 }, { x: 245, y: 16, w: 22 },
      { x: 290, y: 14, w: 16 }, { x: 335, y: 17, w: 20 }, { x: 370, y: 13, w: 15 },
      // Board 3 (y: 22-28)
      { x: 15, y: 23, w: 20 }, { x: 50, y: 26, w: 16 }, { x: 95, y: 24, w: 24 },
      { x: 140, y: 27, w: 18 }, { x: 185, y: 23, w: 15 }, { x: 230, y: 26, w: 22 },
      { x: 275, y: 24, w: 18 }, { x: 320, y: 27, w: 20 }, { x: 365, y: 23, w: 16 },
    ];
    for (let k = 0; k < grainStreaks.length; k++) {
      const s = grainStreaks[k];
      ctx.fillRect(s.x, s.y, s.w, 1);
    }

    // Carved wave band decoration (y: 14-16)
    ctx.fillStyle = PALETTE.woodDark;
    for (let wx = 4; wx < 396; wx += 12) {
      ctx.fillRect(wx + 0, 15, 1, 2);
      ctx.fillRect(wx + 1, 14, 2, 1);
      ctx.fillRect(wx + 3, 15, 1, 2);
      ctx.fillRect(wx + 4, 16, 4, 1);
    }

    // Rope trim at the bottom (y = 28)
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(0, 28, 400, 1);
    ctx.fillStyle = PALETTE.gold2;
    for (let rx = 0; rx < 400; rx += 4) {
      ctx.fillRect(rx, 28, 2, 1);
    }

    // Inner shadow under the beam (y: 27)
    ctx.fillStyle = 'rgba(10, 15, 30, 0.35)';
    ctx.fillRect(0, 27, 400, 1);

    // Brass nailheads at both ends (Left x: 3, Right x: 394)
    const nailY = [5, 22];
    for (let n = 0; n < 2; n++) {
      // Left brass nailhead
      ctx.fillStyle = PALETTE.gold5;
      ctx.fillRect(3, nailY[n], 3, 3);
      ctx.fillStyle = PALETTE.gold3;
      ctx.fillRect(4, nailY[n] + 1, 1, 1);
      ctx.fillStyle = PALETTE.gold1;
      ctx.fillRect(3, nailY[n], 1, 1);

      // Right brass nailhead
      ctx.fillStyle = PALETTE.gold5;
      ctx.fillRect(394, nailY[n], 3, 3);
      ctx.fillStyle = PALETTE.gold3;
      ctx.fillRect(395, nailY[n] + 1, 1, 1);
      ctx.fillStyle = PALETTE.gold1;
      ctx.fillRect(394, nailY[n], 1, 1);
    }

    // 3 Barnacle/Moss bits per corner (using green leaf color)
    ctx.fillStyle = PALETTE.leaf3;
    // Top-left
    ctx.fillRect(1, 1, 2, 1); ctx.fillRect(1, 2, 1, 1);
    // Top-right
    ctx.fillRect(397, 1, 2, 1); ctx.fillRect(398, 2, 1, 1);
    // Bottom-left
    ctx.fillRect(1, 26, 2, 1); ctx.fillRect(1, 25, 1, 1);
    // Bottom-right
    ctx.fillRect(397, 26, 2, 1); ctx.fillRect(398, 25, 1, 1);

  } else {
    // Glass gloss highlights for Frutiger Aero
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, 5, 400, 8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 15, 400, 4);
  }

  // Mouse coords in 400x300 pixel art space
  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;

  // --------------------------------------------------------------------------
  // MONEY PLAQUE (Cream plaque with pixel-cut rounded corners, 8x8 gold coin icon,
  // bitmap-font number, still flashing coral for 0.3s on a rejected spend)
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // MONEY PLAQUE (56x16: 8x8 coin icon plus 40x10 number slot using formatNumber)
  // --------------------------------------------------------------------------
  const plX = 4;
  const plY = 4;
  const plW = 56;
  const plH = 16;

  // Pixel-cut rounded corners fill
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(plX + 1, plY, plW - 2, plH);
  ctx.fillRect(plX, plY + 1, plW, plH - 2);

  // Border in woodDark with cut corner diagonal pixels
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(plX + 2, plY, plW - 4, 1); // Top
  ctx.fillRect(plX + 2, plY + plH - 1, plW - 4, 1); // Bottom
  ctx.fillRect(plX, plY + 2, 1, plH - 4); // Left
  ctx.fillRect(plX + plW - 1, plY + 2, 1, plH - 4); // Right
  // Cut corners
  ctx.fillRect(plX + 1, plY + 1, 1, 1);
  ctx.fillRect(plX + plW - 2, plY + 1, 1, 1);
  ctx.fillRect(plX + 1, plY + plH - 2, 1, 1);
  ctx.fillRect(plX + plW - 2, plY + plH - 2, 1, 1);

  // Stitched Dashes Decoration: little dark brown dashes inside the border
  ctx.fillStyle = PALETTE.sandShade;
  // Horizontal dashes
  for (let sx = plX + 3; sx < plX + plW - 3; sx += 4) {
    ctx.fillRect(sx, plY + 2, 2, 1);
    ctx.fillRect(sx, plY + plH - 3, 2, 1);
  }
  // Vertical dashes
  for (let sy = plY + 3; sy < plY + plH - 3; sy += 4) {
    ctx.fillRect(plX + 2, sy, 1, 2);
    ctx.fillRect(plX + plW - 3, sy, 1, 2);
  }

  // Baked 8x8 Gold Coin Icon
  ctx.drawImage(SPRITES.coinPlaque.normal, plX + 3, plY + 4);

  // Glinting coin effect: moving white diagonal glint sweeps across the coin every 3s
  const glintCycle = (gs.time % 3.0);
  if (glintCycle < 0.4) {
    const glintPos = Math.floor(glintCycle * 25); // 0 to 10 pixels
    ctx.fillStyle = '#ffffff';
    const gx = plX + 3 + glintPos - 2;
    for (let gy = 0; gy < 8; gy++) {
      const curX = gx - gy;
      if (curX >= plX + 3 && curX < plX + 11) {
        ctx.fillRect(curX, plY + 4 + gy, 1, 1);
      }
    }
  }

  // Bitmap-font money number, flashing coral for 0.3s on rejected spend
  const moneyCol: PaletteKey = gs.moneyFlashTimer > 0 ? 'coral' : 'outline';
  const formattedMoney = formatNumber(Math.floor(gs.money), 40);
  drawFittedText(ctx, formattedMoney, plX + 13, plY + 3, {
    w: 40,
    h: 10,
    maxLines: 1,
    align: 'left',
    valign: 'middle',
    color: moneyCol,
  });

  // Single SHOP Button (x: 57, y: 4, w: 40, h: 22 - label fits 40x22 face)
  const shopBtnX = 57;
  const shopBtnY = 4;
  const shopBtnW = 40;
  const shopBtnH = 22;
  const isShopHovered = mx >= shopBtnX && mx < shopBtnX + shopBtnW && my >= shopBtnY && my < shopBtnY + shopBtnH;
  const isShopPressed = isShopHovered && isMouseDown;
  const shopYOff = isShopPressed ? 1 : (isShopHovered ? -1 : 0);

  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(shopBtnX, shopBtnY + shopYOff, shopBtnW, shopBtnH);

  const faceColor = gs.shop?.open ? PALETTE.glow : (isShopHovered ? PALETTE.white : PALETTE.cream);
  ctx.fillStyle = faceColor;
  ctx.fillRect(shopBtnX + 1, shopBtnY + shopYOff + 1, shopBtnW - 2, shopBtnH - 2);

  // 1px Inner Highlight (top-left)
  if (!isShopPressed) {
    ctx.fillStyle = gs.shop?.open ? PALETTE.glow : (isShopHovered ? PALETTE.glow : PALETTE.woodLight);
    ctx.fillRect(shopBtnX + 1, shopBtnY + shopYOff + 1, shopBtnW - 2, 1);
    ctx.fillRect(shopBtnX + 1, shopBtnY + shopYOff + 1, 1, shopBtnH - 2);
  }

  // 1px Inner Shade (bottom-right)
  ctx.fillStyle = isShopPressed ? PALETTE.woodDark : PALETTE.sandShade;
  ctx.fillRect(shopBtnX + 1, shopBtnY + shopYOff + shopBtnH - 2, shopBtnW - 2, 1);
  ctx.fillRect(shopBtnX + shopBtnW - 2, shopBtnY + shopYOff + 1, 1, shopBtnH - 2);

  // Corner rivets
  ctx.fillStyle = PALETTE.outline;
  ctx.fillRect(shopBtnX + 1, shopBtnY + shopYOff + 1, 1, 1);
  ctx.fillRect(shopBtnX + shopBtnW - 2, shopBtnY + shopYOff + 1, 1, 1);
  ctx.fillRect(shopBtnX + 1, shopBtnY + shopYOff + shopBtnH - 2, 1, 1);
  ctx.fillRect(shopBtnX + shopBtnW - 2, shopBtnY + shopYOff + shopBtnH - 2, 1, 1);

  ctx.drawImage(SPRITES.iconShop.normal, shopBtnX + 3, shopBtnY + shopYOff + 5);
  drawFittedText(ctx, 'SHOP', shopBtnX + 16, shopBtnY + shopYOff + 3, {
    w: 21,
    h: 16,
    maxLines: 1,
    align: 'center',
    valign: 'middle',
    color: 'outline',
  });

  // Small coral pixel badge when any item is affordable, unlocked and not maxed
  if (computeShopBadge(gs)) {
    const badgeX = shopBtnX + shopBtnW - 5;
    const badgeY = shopBtnY + shopYOff + 1;
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(badgeX - 1, badgeY - 1, 5, 5);
    ctx.fillStyle = PALETTE.coral;
    ctx.fillRect(badgeX, badgeY, 3, 3);
  }

  if (game.mode === 'sandbox') {
    // --------------------------------------------------------------------------
    // SANDBOX BADGE IN PLACE OF LEVEL BADGE (x: 270, y: 4, w: 46, h: 22)
    // --------------------------------------------------------------------------
    const sbX = 270;
    const sbY = 4;
    const sbW = 46;
    const sbH = 22;

    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(sbX, sbY, sbW, sbH);
    ctx.fillStyle = PALETTE.woodLight;
    ctx.fillRect(sbX + 1, sbY + 1, sbW - 2, 1);
    ctx.fillRect(sbX + 1, sbY + 1, 1, sbH - 2);
    ctx.fillStyle = PALETTE.sandShade;
    ctx.fillRect(sbX + 1, sbY + sbH - 2, sbW - 2, 1);
    ctx.fillRect(sbX + sbW - 2, sbY + 1, 1, sbH - 2);
    ctx.fillStyle = PALETTE.wood;
    ctx.fillRect(sbX + 2, sbY + 2, sbW - 4, sbH - 4);

    drawFittedText(ctx, t('hud.sandbox'), sbX + 2, sbY + 2, {
      w: sbW - 4,
      h: sbH - 4,
      maxLines: 1,
      align: 'center',
      valign: 'middle',
      color: 'gold',
    });
  } else {
    // --------------------------------------------------------------------------
    // EGG GOAL SECTION IN HUD (x: 101 to 275)
    // 3 Egg Piece Sockets + Buy Next Piece Button (Main goal to complete level!)
    // --------------------------------------------------------------------------
    const socketXOffsets = [103, 121, 139];
    for (let s = 0; s < 3; s++) {
      const sx = socketXOffsets[s];
      const sy = 5;
      const sw = 16;
      const sh = 20;

      const isOwned = (gs.eggPiecesBought || 0) > s;
      const popTimer = gs.eggPopTimers ? gs.eggPopTimers[s] : -1;
      const isPopping = popTimer >= 0 && popTimer < 0.3;

      ctx.fillStyle = PALETTE.woodDark;
      ctx.fillRect(sx, sy, sw, sh);
      ctx.fillStyle = isOwned ? PALETTE.gold : PALETTE.wood;
      ctx.fillRect(sx + 1, sy + 1, sw - 2, 1);
      ctx.fillRect(sx + 1, sy + 1, 1, sh - 2);
      ctx.fillStyle = isOwned ? PALETTE.sandShade : PALETTE.sandShade;
      ctx.fillRect(sx + 1, sy + sh - 2, sw - 2, 1);
      ctx.fillRect(sx + sw - 2, sy + 1, 1, sh - 2);

      ctx.fillStyle = isOwned ? PALETTE.glow : PALETTE.outline;
      ctx.fillRect(sx + 2, sy + 2, sw - 4, sh - 4);

      if (isOwned) {
        const gem = getGemSprite(s as 0 | 1 | 2, 3);
        const popOffset = isPopping ? -1 : 0;
        ctx.drawImage(gem.normal, sx + Math.floor(sw / 2) - gem.originX, sy + Math.floor(sh / 2) - gem.originY + popOffset);
      } else {
        ctx.fillStyle = PALETTE.dimBrown;
        ctx.fillRect(sx + Math.floor(sw / 2) - 2, sy + Math.floor(sh / 2) - 2, 4, 4);
      }
    }

    // Next Egg Piece Buy Button (x: 159, y: 4, w: 116, h: 22)
    const eggBtnX = 159;
    const eggBtnY = 4;
    const eggBtnW = 116;
    const eggBtnH = 22;

    const piecesBought = gs.eggPiecesBought || 0;
    const nextPieceNum = piecesBought + 1;
    const eggPrices = [CONFIG.eggPiece1Cost, CONFIG.eggPiece2Cost, CONFIG.eggPiece3Cost];
    const nextEggPrice = nextPieceNum <= 3 ? eggPrices[nextPieceNum - 1] : 0;
    const isEggAffordable = piecesBought < 3 && gs.money >= nextEggPrice;

    const isEggHovered = mx >= eggBtnX && mx < eggBtnX + eggBtnW && my >= eggBtnY && my < eggBtnY + eggBtnH;
    const isEggPressed = isEggHovered && isMouseDown;
    const eggYOff = isEggPressed ? 1 : (isEggHovered ? -1 : 0);

    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(eggBtnX, eggBtnY + eggYOff, eggBtnW, eggBtnH);

    const eggFaceCol = isEggPressed ? PALETTE.sandShade : (piecesBought >= 3 ? PALETTE.glow : (isEggAffordable ? (isEggHovered ? PALETTE.white : PALETTE.gold) : PALETTE.cream));
    ctx.fillStyle = eggFaceCol;
    ctx.fillRect(eggBtnX + 1, eggBtnY + eggYOff + 1, eggBtnW - 2, eggBtnH - 2);

    // 1px Inner Highlight (top-left)
    if (!isEggPressed) {
      ctx.fillStyle = isEggAffordable ? PALETTE.gold2 : PALETTE.woodLight;
      ctx.fillRect(eggBtnX + 1, eggBtnY + eggYOff + 1, eggBtnW - 2, 1);
      ctx.fillRect(eggBtnX + 1, eggBtnY + eggYOff + 1, 1, eggBtnH - 2);
    }

    // 1px Inner Shade (bottom-right)
    ctx.fillStyle = isEggPressed ? PALETTE.woodDark : PALETTE.sandShade;
    ctx.fillRect(eggBtnX + 1, eggBtnY + eggYOff + eggBtnH - 2, eggBtnW - 2, 1);
    ctx.fillRect(eggBtnX + eggBtnW - 2, eggBtnY + eggYOff + 1, 1, eggBtnH - 2);

    // Corner rivets
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(eggBtnX + 1, eggBtnY + eggYOff + 1, 1, 1);
    ctx.fillRect(eggBtnX + eggBtnW - 2, eggBtnY + eggYOff + 1, 1, 1);
    ctx.fillRect(eggBtnX + 1, eggBtnY + eggYOff + eggBtnH - 2, 1, 1);
    ctx.fillRect(eggBtnX + eggBtnW - 2, eggBtnY + eggYOff + eggBtnH - 2, 1, 1);

    if (SPRITES.egg && SPRITES.egg.normal) {
      ctx.drawImage(SPRITES.egg.normal, eggBtnX + 3, eggBtnY + eggYOff + 3);
    }

    let eggBtnText = '';
    if (piecesBought >= 3) {
      eggBtnText = 'EGG HATCH READY!';
    } else {
      eggBtnText = `EGG ${nextPieceNum}/3: $${nextEggPrice}`;
    }

    drawFittedText(ctx, eggBtnText, eggBtnX + 26, eggBtnY + eggYOff + 3, {
      w: eggBtnW - 30,
      h: 16,
      maxLines: 1,
      align: 'left',
      valign: 'middle',
      color: piecesBought >= 3 ? 'outline' : (isEggAffordable ? 'outline' : 'coral'),
    });

    // --------------------------------------------------------------------------
    // LEVEL COUNTER IN HUD (Small wooden badge at x: 280, y: 4, w: 32, h: 22)
    // --------------------------------------------------------------------------
    const lbX = 280;
    const lbY = 4;
    const lbW = 32;
    const lbH = 22;

    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(lbX, lbY, lbW, lbH);
    ctx.fillStyle = PALETTE.woodLight;
    ctx.fillRect(lbX + 1, lbY + 1, lbW - 2, 1);
    ctx.fillRect(lbX + 1, lbY + 1, 1, lbH - 2);
    ctx.fillStyle = PALETTE.sandShade;
    ctx.fillRect(lbX + 1, lbY + lbH - 2, lbW - 2, 1);
    ctx.fillRect(lbX + lbW - 2, lbY + 1, 1, lbH - 2);
    ctx.fillStyle = PALETTE.wood;
    ctx.fillRect(lbX + 2, lbY + 2, lbW - 4, lbH - 4);

    drawFittedText(ctx, t('hud.lvl'), lbX + 2, lbY + 2, {
      w: 28,
      h: 8,
      maxLines: 1,
      align: 'center',
      valign: 'middle',
      color: 'sand',
    });

    drawFittedText(ctx, `${currentLevel}`, lbX + 2, lbY + 10, {
      w: 28,
      h: 10,
      maxLines: 1,
      align: 'center',
      valign: 'middle',
      color: 'gold',
    });
  }

  // --------------------------------------------------------------------------
  // TANK STATUS
  // --------------------------------------------------------------------------
  const normalFishAlive = gs.fish.filter((f) => !f.isCarnivore && !f.dead).length;
  drawFittedText(ctx, `P:${gs.food.length}/${gs.stats.foodLimit}`, 318, 5, {
    w: 78,
    h: 8,
    maxLines: 1,
    color: 'cream',
  });
  drawFittedText(ctx, `F:${normalFishAlive}`, 318, 14, {
    w: 78,
    h: 8,
    maxLines: 1,
    color: 'cream',
  });

  if (gs.aliens.length > 0) {
    drawFittedText(ctx, '!ALERT!', 318, 22, {
      w: 78,
      h: 8,
      maxLines: 1,
      color: 'coral',
    });
  }

  // --------------------------------------------------------------------------
  // PAUSE BUTTON (x: 372, y: 4, w: 22, h: 22)
  // --------------------------------------------------------------------------
  const pBtnX = 372;
  const pBtnY = 4;
  const pBtnW = 22;
  const pBtnH = 22;
  const isPauseHovered = mx >= pBtnX && mx < pBtnX + pBtnW && my >= pBtnY && my < pBtnY + pBtnH;
  const isPausePressed = isPauseHovered && isMouseDown;
  const pYOffset = isPausePressed ? 1 : (isPauseHovered ? -1 : 0);

  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(pBtnX, pBtnY + pYOffset, pBtnW, pBtnH);

  const pFaceCol = isPausePressed ? PALETTE.sandShade : (isPauseHovered ? PALETTE.woodLight : PALETTE.wood);
  ctx.fillStyle = pFaceCol;
  ctx.fillRect(pBtnX + 1, pBtnY + pYOffset + 1, pBtnW - 2, pBtnH - 2);

  // 1px Inner Highlight (top-left)
  if (!isPausePressed) {
    ctx.fillStyle = isPauseHovered ? PALETTE.glow : PALETTE.woodLight;
    ctx.fillRect(pBtnX + 1, pBtnY + pYOffset + 1, pBtnW - 2, 1);
    ctx.fillRect(pBtnX + 1, pBtnY + pYOffset + 1, 1, pBtnH - 2);
  }

  // 1px Inner Shade (bottom-right)
  ctx.fillStyle = isPausePressed ? PALETTE.woodDark : PALETTE.sandShade;
  ctx.fillRect(pBtnX + 1, pBtnY + pYOffset + pBtnH - 2, pBtnW - 2, 1);
  ctx.fillRect(pBtnX + pBtnW - 2, pBtnY + pYOffset + 1, 1, pBtnH - 2);

  // Corner rivets
  ctx.fillStyle = PALETTE.outline;
  ctx.fillRect(pBtnX + 1, pBtnY + pYOffset + 1, 1, 1);
  ctx.fillRect(pBtnX + pBtnW - 2, pBtnY + pYOffset + 1, 1, 1);
  ctx.fillRect(pBtnX + 1, pBtnY + pYOffset + pBtnH - 2, 1, 1);
  ctx.fillRect(pBtnX + pBtnW - 2, pBtnY + pYOffset + pBtnH - 2, 1, 1);

  // Pause bars ||
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(pBtnX + 7, pBtnY + pYOffset + 6, 2, 10);
  ctx.fillRect(pBtnX + 13, pBtnY + pYOffset + 6, 2, 10);

  // --------------------------------------------------------------------------
  // 9. EGG HATCH 6-FRAME PIXEL SEQUENCE (x: 200, y: 145)
  // Frame 0: Wobble
  // Frame 1: Crack lines
  // Frame 2: Deep crack lines & inner glow
  // Frame 3: Shell halves popping
  // Frame 4: Baby fish emerging
  // Frame 5: Baby fish bursting out with particle puff!
  // --------------------------------------------------------------------------
  if (gs.state === 'EGG_HATCH') {
    const t = gs.eggHatchTimer;

    if (t < 0.8) {
      // 1. Wobble (0.0s to 0.8s)
      const wobbleX = Math.round(Math.sin(t * 50) * 1.5);
      const wobbleY = Math.round(Math.cos(t * 30) * 0.5);
      const egg = SPRITES.egg;
      const ex = 200 + wobbleX;
      const ey = 145 + wobbleY;
      ctx.drawImage(egg.normal, ex - egg.originX, ey - egg.originY);

      // Crack lines (draw dark lines on top)
      ctx.fillStyle = PALETTE.outline;
      if (t > 0.3) {
        ctx.fillRect(200 + wobbleX, 145 - 6 + wobbleY, 1, 6);
        ctx.fillRect(200 - 1 + wobbleX, 145 + wobbleY, 1, 5);
      }
      if (t > 0.6) {
        ctx.fillRect(200 - 3 + wobbleX, 145 - 2 + wobbleY, 3, 1);
        ctx.fillRect(200 + wobbleX, 145 + 2 + wobbleY, 4, 1);
      }
    } else if (t >= 0.8 && t < 1.2) {
      // 2. Shell halves pop (0.8s to 1.2s)
      const dt = t - 0.8;
      const dx = Math.round(dt * 45);
      const dy = Math.round(dt * dt * 250);

      // Left shell half
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, 200 - Math.min(20, dx / 2), 300);
      ctx.clip();
      ctx.drawImage(SPRITES.egg.normal, 200 - SPRITES.egg.originX - dx, 145 - SPRITES.egg.originY + dy);
      ctx.restore();

      // Right shell half
      ctx.save();
      ctx.beginPath();
      ctx.rect(200 + Math.min(20, dx / 2), 0, 200, 300);
      ctx.clip();
      ctx.drawImage(SPRITES.egg.normal, 200 - SPRITES.egg.originX + dx, 145 - SPRITES.egg.originY + dy);
      ctx.restore();
    }

    if (t >= 1.0) {
      // 3. Species sprite bursts out (1.0s to 2.0s)
      const frameIndex = (Math.floor(t / 0.17) % 2) as 0 | 1;
      const sprite = getSpeciesSprite(gs.level || 1, frameIndex);
      if (sprite) {
        const hatchAge = t - 1.0;
        const targetY = 110;
        const startY = 145;
        const curY = startY - (startY - targetY) * Math.min(1.0, Math.sin(hatchAge * Math.PI / 2));

        // Damped oscillator squash and stretch
        const freq = 15;
        const damp = 5;
        const amp = 0.8 * Math.exp(-damp * hatchAge);
        const scaleY = 1.0 + amp * Math.sin(freq * hatchAge);
        const scaleX = 1.0 / scaleY;

        // Snapped to whole pixels and scaled 2x
        const isNight = gs.level >= 6;
        S(ctx, sprite, Math.round(200), Math.round(curY), false, scaleX * 2, scaleY * 2, t, isNight);
      }
    }

    drawBitmapText(ctx, 'HATCHING MYSTIC EGG...', 200, 192, 'glow', 'center', 1);
  }

  // --------------------------------------------------------------------------
  // MODS GEAR BUTTON IN SANDBOX (x: 346, y: 4, w: 22, h: 22)
  // --------------------------------------------------------------------------
  if (game.mode === 'sandbox') {
    const gBtnX = 346;
    const gBtnY = 4;
    const gBtnW = 22;
    const gBtnH = 22;
    const isGearHovered = mx >= gBtnX && mx < gBtnX + gBtnW && my >= gBtnY && my < gBtnY + gBtnH;
    const isGearPressed = isGearHovered && isMouseDown;
    const gYOffset = isGearPressed ? 1 : (isGearHovered ? -1 : 0);

    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(gBtnX, gBtnY + gYOffset, gBtnW, gBtnH);

    const gFaceCol = isGearPressed ? PALETTE.sandShade : (isGearHovered ? PALETTE.white : PALETTE.cream);
    ctx.fillStyle = gFaceCol;
    ctx.fillRect(gBtnX + 1, gBtnY + gYOffset + 1, gBtnW - 2, gBtnH - 2);

    // 1px Inner Highlight (top-left)
    if (!isGearPressed) {
      ctx.fillStyle = isGearHovered ? PALETTE.glow : PALETTE.gold;
      ctx.fillRect(gBtnX + 1, gBtnY + gYOffset + 1, gBtnW - 2, 1);
      ctx.fillRect(gBtnX + 1, gBtnY + gYOffset + 1, 1, gBtnH - 2);
    }

    // 1px Inner Shade (bottom-right)
    ctx.fillStyle = isGearPressed ? PALETTE.woodDark : PALETTE.sandShade;
    ctx.fillRect(gBtnX + 1, gBtnY + gYOffset + gBtnH - 2, gBtnW - 2, 1);
    ctx.fillRect(gBtnX + gBtnW - 2, gBtnY + gYOffset + 1, 1, gBtnH - 2);

    // Corner rivets
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(gBtnX + 1, gBtnY + gYOffset + 1, 1, 1);
    ctx.fillRect(gBtnX + gBtnW - 2, gBtnY + gYOffset + 1, 1, 1);
    ctx.fillRect(gBtnX + 1, gBtnY + gYOffset + gBtnH - 2, 1, 1);
    ctx.fillRect(gBtnX + gBtnW - 2, gBtnY + gYOffset + gBtnH - 2, 1, 1);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(gBtnX + 9, gBtnY + gYOffset + 5, 4, 12);
    ctx.fillRect(gBtnX + 5, gBtnY + gYOffset + 9, 12, 4);
    ctx.fillRect(gBtnX + 7, gBtnY + gYOffset + 7, 8, 8);
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(gBtnX + 9, gBtnY + gYOffset + 9, 4, 4);
  }

  // --------------------------------------------------------------------------
  // OVERLAYS (Title, Settings, Pause, Level Complete, Game Over)
  // --------------------------------------------------------------------------
  if (gs.state === 'TITLE') {
    drawTitleScreen(ctx, gs);
  } else if (gs.state === 'LEVEL_SELECT') {
    drawLevelSelectScreen(ctx, gs);
  } else if (gs.state === 'SETTINGS') {
    drawSettingsScreen(ctx, gs);
  } else if (gs.state === 'CONFIRM_RESET') {
    drawResetConfirmScreen(ctx, gs);
  } else if (gs.state === 'PAUSED') {
    drawPauseScreen(ctx, gs);
  } else if (gs.state === 'SANDBOX_OPTIONS') {
    drawSandboxOptionsScreen(ctx, gs);
  } else if (gs.state === 'LEVEL_COMPLETE') {
    drawLevelCompleteScreen(ctx, gs, currentLevel, levelStats);
  } else if (gs.state === 'GAME_OVER') {
    drawGameOverScreen(ctx, gs);
  }

  const animT = gs.shop.animTimer || 0;
  if (animT > 0 || gs.shop?.open) {
    drawShopModal(ctx, gs);
  }

  const modsAnimT = gs.mods?.animTimer || 0;
  if (modsAnimT > 0 || gs.mods?.open) {
    drawModsModal(ctx, gs);
  }

  // 11. TUTORIAL OVERLAY (Shelly dialogue, target highlights, tracking arrows)
  if (gs.isTutorial && gs.tutorialStep > 0) {
    renderTutorialOverlay(ctx, gs);
  }

  // 12. AUDIO PANEL
  if (gs.audioPanel?.open) {
    renderAudioPanel(ctx, gs);
  }

  // Profile Modals Overlay
  if (gs.profileModal === 'selector') {
    drawProfileSelectorModal(ctx, gs);
  } else if (gs.profileModal === 'first' || gs.profileModal === 'new' || gs.profileModal === 'rename') {
    drawNameDialogModal(ctx, gs);
  } else if (gs.profileModal === 'delete') {
    drawDeleteConfirmModal(ctx, gs);
  }

  // --------------------------------------------------------------------------
  // 11. 0.4s PIXEL DISSOLVE TRANSITION (4x4 blocks revealed in random order)
  // --------------------------------------------------------------------------
  if (gs.transitionTimer && gs.transitionTimer > 0) {
    renderDissolveTransition(ctx, gs.transitionTimer);
  }

}

// ============================================================================
// 0.4s PIXEL DISSOLVE TRANSITION (4x4 art px blocks revealed in random order)
// ============================================================================
const DISSOLVE_BLOCKS: { x: number; y: number }[] = [];
for (let by = 0; by < 75; by++) {
  for (let bx = 0; bx < 100; bx++) {
    DISSOLVE_BLOCKS.push({ x: bx * 4, y: by * 4 });
  }
}
let dissolveSeed = 987654321;
function dissolveRand() {
  dissolveSeed = (dissolveSeed * 1664525 + 1013904223) % 4294967296;
  return dissolveSeed / 4294967296;
}
for (let i = DISSOLVE_BLOCKS.length - 1; i > 0; i--) {
  const j = Math.floor(dissolveRand() * (i + 1));
  const temp = DISSOLVE_BLOCKS[i];
  DISSOLVE_BLOCKS[i] = DISSOLVE_BLOCKS[j];
  DISSOLVE_BLOCKS[j] = temp;
}

function renderDissolveTransition(ctx: CanvasRenderingContext2D, timer: number) {
  const progress = Math.max(0, Math.min(1, timer / 0.4));
  const count = Math.floor(progress * DISSOLVE_BLOCKS.length);
  ctx.fillStyle = PALETTE.outline;
  for (let i = 0; i < count; i++) {
    const b = DISSOLVE_BLOCKS[i];
    ctx.fillRect(b.x, b.y, 4, 4);
  }
}

// ============================================================================
// SHARED PIXEL-BEVEL BUTTON
// ============================================================================
export function drawSharedButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  mx: number,
  my: number,
  isMouseDown: boolean,
  textColor: PaletteKey = 'outline',
  icon?: BakedSprite,
  hoverWiggle: boolean = false,
  time: number = 0,
  overrideFont?: FontTier,
  caption?: string
) {
  const isHovered = mx >= x && mx < x + w && my >= y && my < y + h;
  const isPressed = isHovered && isMouseDown;

  let yOffset = 0;
  let xOffset = 0;
  if (isPressed) {
    yOffset = 1;
  } else if (isHovered) {
    yOffset = -1;
    if (hoverWiggle) {
      xOffset = Math.round(Math.sin(time * 20) * 1.5);
    }
  }

  const bx = x + xOffset;
  const by = y + yOffset;

  // 1. Dark outline
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(bx, by, w, h);

  // 2. Face: hover brightens face
  const faceColor = isHovered ? PALETTE.white : (isPressed ? PALETTE.sand : PALETTE.cream);
  ctx.fillStyle = faceColor;
  ctx.fillRect(bx + 1, by + 1, w - 2, h - 2);

  // 3. 1px inner highlight (top and left of the face)
  if (!isPressed) {
    ctx.fillStyle = isHovered ? PALETTE.glow : PALETTE.woodLight;
    ctx.fillRect(bx + 1, by + 1, w - 2, 1);
    ctx.fillRect(bx + 1, by + 1, 1, h - 2);
  }

  // 4. 1px bottom shade (bottom and right of the face)
  ctx.fillStyle = isPressed ? PALETTE.woodDark : PALETTE.sandShade;
  ctx.fillRect(bx + 1, by + h - 2, w - 2, 1);
  ctx.fillRect(bx + w - 2, by + 1, 1, h - 2);

  // 5. Corner rivets
  ctx.fillStyle = PALETTE.outline;
  ctx.fillRect(bx + 1, by + 1, 1, 1);
  ctx.fillRect(bx + w - 2, by + 1, 1, 1);
  ctx.fillRect(bx + 1, by + h - 2, 1, 1);
  ctx.fillRect(bx + w - 2, by + h - 2, 1, 1);

  // 4. Content
  if (caption) {
    drawFittedText(ctx, text, bx + 3, by + 4, {
      w: w - 6,
      h: 14,
      maxLines: 1,
      align: 'center',
      valign: 'middle',
      color: textColor,
      fonts: overrideFont ? [overrideFont] : undefined,
    });
    drawFittedText(ctx, caption, bx + 3, by + 18, {
      w: w - 6,
      h: 10,
      maxLines: 1,
      align: 'center',
      valign: 'middle',
      color: 'dimBrown',
      fonts: ['small'],
    });
  } else if (icon) {
    ctx.drawImage(icon.normal, bx + 5, by + Math.floor((h - icon.height) / 2));
    drawFittedText(ctx, text, bx + icon.width + 8, by + 3, {
      w: w - icon.width - 12,
      h: h - 6,
      maxLines: 1,
      align: 'left',
      valign: 'middle',
      color: textColor,
      fonts: overrideFont ? [overrideFont] : undefined,
    });
  } else {
    drawFittedText(ctx, text, bx + 3, by + 3, {
      w: w - 6,
      h: h - 6,
      maxLines: 1,
      align: 'center',
      valign: 'middle',
      color: textColor,
      fonts: overrideFont ? [overrideFont] : undefined,
    });
  }
}

// ============================================================================
// 50% CHECKERBOARD DITHER OVERLAY
// ============================================================================
function drawDimCheckerboardOverlay(ctx: CanvasRenderingContext2D, opacity: number = 0.65) {
  ctx.fillStyle = `rgba(10, 20, 30, ${opacity})`;
  ctx.fillRect(0, 0, 400, 300);
  const pattern = getCheckerboardPattern(ctx);
  if (pattern && opacity > 0.3) { // Only apply checker dither on darker panels to keep light panels extremely crisp
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, 400, 300);
  }
}

// ============================================================================
// CENTERED 260x160 WOODEN PANEL WITH RIBBON TITLE BANNER
// ============================================================================
function drawWoodenOverlayPanel(
  ctx: CanvasRenderingContext2D,
  titleText: string,
  ribbonColor: PaletteKey = 'coral'
) {
  const px = 70;
  const py = 70;
  const pw = 260;
  const ph = 160;

  // 1. Panel drop shadow
  ctx.fillStyle = PALETTE.outline;
  ctx.fillRect(px + 2, py + 2, pw, ph);

  // 2. Panel outer border
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(px, py, pw, ph);

  // 3. Panel inner bevels (2px woodLight top-left, 2px sandShade bottom-right)
  ctx.fillStyle = PALETTE.woodLight;
  ctx.fillRect(px + 2, py + 2, pw - 4, 2);
  ctx.fillRect(px + 2, py + 2, 2, ph - 4);
  ctx.fillStyle = PALETTE.sandShade;
  ctx.fillRect(px + 2, py + ph - 4, pw - 4, 2);
  ctx.fillRect(px + pw - 4, py + 2, 2, ph - 4);

  // 4. Panel wood face
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(px + 4, py + 4, pw - 8, ph - 8);

  // Plank horizontal seams & grain
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(px + 4, py + 52, pw - 8, 1);
  ctx.fillRect(px + 4, py + 104, pw - 8, 1);
  ctx.fillStyle = PALETTE.woodLight;
  ctx.fillRect(px + 4, py + 53, pw - 8, 1);
  ctx.fillRect(px + 4, py + 105, pw - 8, 1);

  // Corner nailheads
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(px + 6, py + 6, 2, 2);
  ctx.fillRect(px + pw - 8, py + 6, 2, 2);
  ctx.fillRect(px + 6, py + ph - 8, 2, 2);
  ctx.fillRect(px + pw - 8, py + ph - 8, 2, 2);
  ctx.fillStyle = PALETTE.sand;
  ctx.fillRect(px + 6, py + 6, 1, 1);
  ctx.fillRect(px + pw - 8, py + 6, 1, 1);
  ctx.fillRect(px + 6, py + ph - 8, 1, 1);
  ctx.fillRect(px + pw - 8, py + ph - 8, 1, 1);

  // 4.5 Golden Corner Bracket Ornaments (Triangular caps on the 4 corners of the panel)
  const bracketMain = PALETTE.gold;
  const bracketDark = PALETTE.gold5;
  const bracketLight = PALETTE.gold1;

  // Top-Left Corner Ornament
  ctx.fillStyle = bracketMain;
  ctx.fillRect(px + 4, py + 4, 6, 2);
  ctx.fillRect(px + 4, py + 4, 2, 6);
  ctx.fillStyle = bracketLight;
  ctx.fillRect(px + 4, py + 4, 6, 1);
  ctx.fillRect(px + 4, py + 4, 1, 6);
  ctx.fillStyle = bracketDark;
  ctx.fillRect(px + 5, py + 9, 1, 1);
  ctx.fillRect(px + 9, py + 5, 1, 1);

  // Top-Right Corner Ornament
  ctx.fillStyle = bracketMain;
  ctx.fillRect(px + pw - 10, py + 4, 6, 2);
  ctx.fillRect(px + pw - 6, py + 4, 2, 6);
  ctx.fillStyle = bracketLight;
  ctx.fillRect(px + pw - 10, py + 4, 6, 1);
  ctx.fillRect(px + pw - 6, py + 4, 1, 6);
  ctx.fillStyle = bracketDark;
  ctx.fillRect(px + pw - 10, py + 5, 1, 1);
  ctx.fillRect(px + pw - 6, py + 9, 1, 1);

  // Bottom-Left Corner Ornament
  ctx.fillStyle = bracketMain;
  ctx.fillRect(px + 4, py + ph - 6, 6, 2);
  ctx.fillRect(px + 4, py + ph - 10, 2, 6);
  ctx.fillStyle = bracketLight;
  ctx.fillRect(px + 4, py + ph - 10, 1, 6);
  ctx.fillStyle = bracketDark;
  ctx.fillRect(px + 4, py + ph - 6, 6, 1);
  ctx.fillRect(px + 5, py + ph - 10, 1, 1);
  ctx.fillRect(px + 9, py + ph - 5, 1, 1);

  // Bottom-Right Corner Ornament
  ctx.fillStyle = bracketMain;
  ctx.fillRect(px + pw - 10, py + ph - 6, 6, 2);
  ctx.fillRect(px + pw - 6, py + ph - 10, 2, 6);
  ctx.fillStyle = bracketLight;
  ctx.fillRect(px + pw - 6, py + ph - 10, 1, 6);
  ctx.fillStyle = bracketDark;
  ctx.fillRect(px + pw - 10, py + ph - 6, 6, 1);
  ctx.fillRect(px + pw - 10, py + ph - 5, 1, 1);
  ctx.fillRect(px + pw - 5, py + ph - 10, 1, 1);

  // 5. Ribbon Title Banner across top (x: 100, y: 58, w: 200, h: 22)
  const rx = 100;
  const ry = 58;
  const rw = 200;
  const rh = 22;

  // Ribbon swallowtail left end
  ctx.fillStyle = PALETTE.outline;
  ctx.fillRect(rx - 16, ry + 4, 18, 16);
  ctx.fillStyle = PALETTE[ribbonColor];
  ctx.fillRect(rx - 14, ry + 6, 16, 12);
  ctx.fillStyle = PALETTE.outline;
  ctx.fillRect(rx - 16, ry + 10, 4, 4);

  // Ribbon swallowtail right end
  ctx.fillStyle = PALETTE.outline;
  ctx.fillRect(rx + rw - 2, ry + 4, 18, 16);
  ctx.fillStyle = PALETTE[ribbonColor];
  ctx.fillRect(rx + rw - 2, ry + 6, 16, 12);
  ctx.fillStyle = PALETTE.outline;
  ctx.fillRect(rx + rw + 12, ry + 10, 4, 4);

  // Ribbon fold shadows
  ctx.fillStyle = PALETTE.outline;
  ctx.fillRect(rx - 2, ry + 18, 6, 6);
  ctx.fillRect(rx + rw - 4, ry + 18, 6, 6);

  // Ribbon Main Body
  ctx.fillStyle = PALETTE.outline;
  ctx.fillRect(rx - 1, ry - 1, rw + 2, rh + 2);
  ctx.fillStyle = PALETTE[ribbonColor];
  ctx.fillRect(rx, ry, rw, rh);
  // Top 1px highlight
  ctx.fillStyle = PALETTE.glow;
  ctx.fillRect(rx + 1, ry + 1, rw - 2, 1);
  // Bottom 1px shadow
  ctx.fillStyle = PALETTE.deepOrange;
  ctx.fillRect(rx + 1, ry + rh - 2, rw - 2, 1);

  // Ribbon Title Text
  drawFittedText(ctx, titleText, rx + 10, ry + 2, {
    w: rw - 20,
    h: rh - 4,
    maxLines: 1,
    align: 'center',
    valign: 'middle',
    color: 'cream',
  });
}

function drawSilhouette(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement | HTMLImageElement, x: number, y: number, color: string) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (tempCtx) {
    tempCtx.drawImage(img, 0, 0);
    tempCtx.globalCompositeOperation = 'source-in';
    tempCtx.fillStyle = color;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(tempCanvas, x, y);
  }
}

function drawRewardFish(
  ctx: CanvasRenderingContext2D,
  level: number,
  x: number,
  y: number,
  isCompleted: boolean,
  time: number = 0
) {
  const speciesList = SPECIES_SPRITES[level - 1];
  if (!speciesList) return;

  // Tail animation: swap frames every 0.17s
  const frameIndex = Math.floor(time / 0.17) % 2;
  const sprite = speciesList[frameIndex];

  if (isCompleted) {
    const isNight = level >= 6;
    S(ctx, sprite, x, y, false, 1, 1, time, isNight);
  } else {
    const silSprite: BakedSprite = {
      normal: sprite.silNormal || sprite.normal,
      flipped: sprite.silFlipped || sprite.flipped,
      width: sprite.width,
      height: sprite.height,
      originX: sprite.originX,
      originY: sprite.originY,
    };
    S(ctx, silSprite, x, y, false, 1, 1, 0, false);
  }
}

function drawSunIcon8x8(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(x + 2, y + 2, 4, 4);
  ctx.fillRect(x + 3, y + 0, 2, 8);
  ctx.fillRect(x + 0, y + 3, 8, 2);
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(x + 3, y + 3, 2, 2);
}

function drawMoonIcon8x8(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = PALETTE.diamond;
  ctx.fillRect(x + 3, y + 1, 3, 1);
  ctx.fillRect(x + 2, y + 2, 2, 1);
  ctx.fillRect(x + 1, y + 3, 2, 2);
  ctx.fillRect(x + 2, y + 5, 2, 1);
  ctx.fillRect(x + 3, y + 6, 3, 1);
}

function drawPadlockIcon8x8(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Shackle (silver)
  ctx.fillStyle = PALETTE.silver;
  ctx.fillRect(x + 2, y + 1, 4, 1);
  ctx.fillRect(x + 2, y + 2, 1, 2);
  ctx.fillRect(x + 5, y + 2, 1, 2);
  // Lock body (gold)
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(x + 1, y + 4, 6, 4);
  // Keyhole
  ctx.fillStyle = PALETTE.outline;
  ctx.fillRect(x + 3, y + 5, 2, 2);
}

function drawCheckmarkIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#22c55e'; // Bright green check mark
  ctx.fillRect(x + 4, y + 0, 2, 1);
  ctx.fillRect(x + 3, y + 1, 2, 1);
  ctx.fillRect(x + 2, y + 2, 2, 1);
  ctx.fillRect(x + 1, y + 3, 2, 1);
  ctx.fillRect(x + 0, y + 2, 2, 1);
}

export function drawLevelSelectScreen(ctx: CanvasRenderingContext2D, gs: GameState) {
  drawDimCheckerboardOverlay(ctx);

  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;

  // Custom 320x240 Wooden Panel
  const px = 40;
  const py = 30;
  const pw = 320;
  const ph = 240;

  // 1. Wood dark border
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(px, py, pw, ph);

  // 2. Bevels
  ctx.fillStyle = PALETTE.woodLight;
  ctx.fillRect(px + 1, py + 1, pw - 2, 1);
  ctx.fillRect(px + 1, py + 1, 1, ph - 2);
  ctx.fillStyle = PALETTE.sandShade;
  ctx.fillRect(px + 1, py + ph - 2, pw - 2, 1);
  ctx.fillRect(px + pw - 2, py + 1, 1, ph - 2);

  // 3. Wood face
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(px + 2, py + 2, pw - 4, ph - 4);

  // 4. Header title banner (y: 35)
  drawFittedText(ctx, t('menu.levelSelect'), px + 40, py + 8, {
    w: pw - 80,
    h: 16,
    maxLines: 1,
    align: 'center',
    valign: 'middle',
    color: 'gold',
  });

  // 5. Back Button (24x24 UI px) at top-left: x: 46, y: 35
  drawSharedButton(ctx, 46, 35, 24, 24, '<', mx, my, isMouseDown, 'outline', undefined, false, 0, undefined);

  // Labels for rows
  drawFittedText(ctx, 'DAY', px + 10, py + 54, {
    w: 36,
    h: 12,
    maxLines: 1,
    align: 'left',
    valign: 'middle',
    color: 'gold',
    fonts: ['small'],
  });

  drawFittedText(ctx, 'NIGHT', px + 10, py + 94, {
    w: 36,
    h: 12,
    maxLines: 1,
    align: 'left',
    valign: 'middle',
    color: 'diamond',
    fonts: ['small'],
  });

  const selectedLvl = gs.levelSelectSelected || 1;

  // Draw 2 rows of 5 nodes
  // Row 1 (Levels 1-5): y = 74
  // Row 2 (Levels 6-10): y = 114
  // Gaps: 4 UI px (node is 36x36)
  const nodeW = 36;
  const nodeH = 36;
  const gap = 4;
  const startX = px + 62;

  for (let l = 1; l <= 10; l++) {
    const row = l <= 5 ? 0 : 1;
    const col = (l - 1) % 5;
    const nx = startX + col * (nodeW + gap);
    const ny = py + 42 + row * (nodeW + gap);

    // Node state logic
    const isCompleted = saveState.completed[l] !== undefined;
    const isUnlocked = l === 1 || saveState.completed[l - 1] !== undefined;
    const isNodeSelected = selectedLvl === l;

    const isHovered = mx >= nx && mx < nx + nodeW && my >= ny && my < ny + nodeH;

    // Node frame
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(nx, ny, nodeW, nodeH);

    // Node face
    let faceColor: string = PALETTE.cream;
    if (!isUnlocked) faceColor = PALETTE.sandShade;
    else if (isCompleted) faceColor = '#86efac'; // light green
    else if (isHovered) faceColor = PALETTE.white;

    ctx.fillStyle = faceColor;
    ctx.fillRect(nx + 1, ny + 1, nodeW - 2, nodeH - 2);

    // Draw selection highlight outline
    if (isNodeSelected) {
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 2;
      ctx.strokeRect(nx - 1, ny - 1, nodeW + 2, nodeH + 2);
    }

    // Number text
    drawFittedText(ctx, `${l}`, nx + 2, ny + 3, {
      w: 12,
      h: 12,
      maxLines: 1,
      align: 'left',
      valign: 'middle',
      color: 'outline',
    });

    // Sun/Moon icon in node
    const isNight = l >= 6;
    if (isNight) {
      drawMoonIcon8x8(ctx, nx + nodeW - 11, ny + 3);
    } else {
      drawSunIcon8x8(ctx, nx + nodeW - 11, ny + 3);
    }

    // Lock, Available, Completed state details
    if (!isUnlocked) {
      // Locked: draw Padlock
      drawPadlockIcon8x8(ctx, nx + Math.floor(nodeW / 2) - 4, ny + Math.floor(nodeH / 2) - 1);
    } else if (isCompleted) {
      // Completed: check mark + reward fish icon
      drawCheckmarkIcon(ctx, nx + 3, ny + 24);
      drawRewardFish(ctx, l, nx + 22, ny + 22, true, gs.time);
    } else {
      // Available: just the reward fish silhouette
      drawRewardFish(ctx, l, nx + 18, ny + 22, false, gs.time);
    }
  }

  // 6. Selected Level Info Bar (50 UI px high): y = 162
  const ibX = px + 8;
  const ibY = py + 128;
  const ibW = pw - 16;
  const ibH = 50;

  // Background Box
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(ibX, ibY, ibW, ibH);
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(ibX + 1, ibY + 1, ibW - 2, ibH - 2);

  // Selected level details
  const levelInfo = CONFIG.LEVELS[selectedLvl - 1] || CONFIG.LEVELS[0];
  const levelName = t(levelInfo.nameKey).toUpperCase();
  const isSelectedCompleted = saveState.completed[selectedLvl] !== undefined;
  const bestTime = isSelectedCompleted ? formatTime(saveState.completed[selectedLvl]) : '--:--';

  drawFittedText(ctx, `${selectedLvl}. ${levelName}`, ibX + 6, ibY + 6, {
    w: ibW - 60,
    h: 16,
    maxLines: 1,
    align: 'left',
    valign: 'middle',
    color: 'outline',
  });

  drawFittedText(ctx, `BEST TIME: ${bestTime}`, ibX + 6, ibY + 26, {
    w: ibW - 60,
    h: 14,
    maxLines: 1,
    align: 'left',
    valign: 'middle',
    color: 'dimBrown',
    fonts: ['small'],
  });

  // Reward fish silhouette / collected colored sprite on right side of Info Bar
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(ibX + ibW - 46, ibY + 5, 40, 40);
  ctx.fillStyle = PALETTE.sand;
  ctx.fillRect(ibX + ibW - 45, ibY + 6, 38, 38);

  drawRewardFish(ctx, selectedLvl, ibX + ibW - 26, ibY + 25, isSelectedCompleted, gs.time);

  // 7. PLAY button (56x26 UI px): x: 172, y: 236
  drawSharedButton(ctx, 172, 236, 56, 26, 'PLAY', mx, my, isMouseDown, 'outline', undefined, false, 0, undefined);
}

// ============================================================================
// TITLE SCREEN (Dim overlay, Wavy Logo, 3 idle fish behind, Start button with hover wiggle)
// ============================================================================
function drawTitleScreen(ctx: CanvasRenderingContext2D, gs: GameState) {
  // 1. Lighten dim overlay over the live tank background to 20%
  drawDimCheckerboardOverlay(ctx, 0.20);

  // 2. Game Logo "REZONAQUARIUM" in 2x bitmap font with outline, 3-tone bevel, and 1px wave bob per letter
  const text = 'REZONAQUARIUM';
  const scale = 2;
  const letterWidth = 6 * scale; // 12px
  const totalW = text.length * letterWidth - 2;
  const startX = Math.floor(200 - totalW / 2);
  const startY = 55;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const waveY = Math.round(Math.sin(gs.time * 4.5 + i * 0.55) * 1.5);
    const lx = startX + i * letterWidth;
    const ly = startY + waveY;

    // 3-tone bevel gold letters with outline
    // Tone 1: Dark outline / drop shadow (offset +1, +1)
    drawText(ctx, ch, lx + 1, ly + 1, { font: 'normal', color: 'outline', scale });
    // Tone 2: Base gold body
    drawText(ctx, ch, lx, ly, { font: 'normal', color: 'gold3', scale });
    // Tone 3: Highlight bevel on top/left (offset -1, -1)
    drawText(ctx, ch, lx - 1, ly - 1, { font: 'normal', color: 'gold1', scale });
  }

  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;

  const titleLabels = [t('menu.levels'), t('menu.sandbox'), t('menu.settings')];
  const titleGroupFont = getGroupFontTier(titleLabels, { w: 150 - 6, h: 28 - 6, maxLines: 1 });

  // 3. Menu Buttons: LEVELS (with caption HATCH THE EGG), SANDBOX MODE, SETTINGS MENU
  drawSharedButton(
    ctx,
    125,
    108,
    150,
    34,
    t('menu.levels'),
    mx,
    my,
    isMouseDown,
    'outline',
    undefined,
    true,
    gs.time,
    titleGroupFont,
    t('menu.hatchEgg')
  );

  const sandboxUnlocked = saveState.completed['1'] !== undefined || (gs.completedLevels && gs.completedLevels['1'] !== undefined);
  const sbShakeX = gs.sandboxShakeTimer && gs.sandboxShakeTimer > 0 ? Math.round(Math.sin(gs.sandboxShakeTimer * 60) * 2) : 0;

  ctx.save();
  if (!sandboxUnlocked) {
    ctx.globalAlpha = 0.5;
  }
  drawSharedButton(
    ctx,
    125 + sbShakeX,
    148,
    150,
    28,
    sandboxUnlocked ? t('menu.sandbox') : 'SANDBOX',
    mx,
    my,
    isMouseDown,
    'outline',
    undefined,
    sandboxUnlocked,
    gs.time + 1.2,
    titleGroupFont,
    sandboxUnlocked ? undefined : 'COMPLETE LEVEL 1'
  );
  if (!sandboxUnlocked) {
    drawPadlockIcon8x8(ctx, 133, 158);
  }
  ctx.restore();

  drawSharedButton(
    ctx,
    125,
    186,
    150,
    28,
    'SETTINGS',
    mx,
    my,
    isMouseDown,
    'outline',
    undefined,
    true,
    gs.time + 2.4,
    titleGroupFont
  );

  // 0. Render Hanging Wooden Sign for active user
  if (game.profile) {
    drawHangingSign(ctx, gs);
  }

  // 4. Language Switcher Button on Title Screen
  const langText = `${t('menu.language')}: ${getLanguage().toUpperCase()}`;
  drawSharedButton(
    ctx,
    125,
    220,
    150,
    26,
    langText,
    mx,
    my,
    isMouseDown,
    'outline',
    undefined,
    true,
    gs.time + 3.6,
    titleGroupFont
  );
}

// ============================================================================
// ============================================================================
// ACCOUNT UI LAYOUT SAFETY NET & AUDIT UTILITIES
// ============================================================================

let activeRendererAuditWarnings: string[] | null = null;

export interface LayoutRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tappable?: boolean;
}

export function layoutCheck(
  componentName: string,
  parentRect: { x: number; y: number; w: number; h: number },
  childRects: LayoutRect[]
): string[] {
  const warnings: string[] = [];

  for (const child of childRects) {
    if (
      child.x < parentRect.x ||
      child.y < parentRect.y ||
      child.x + child.w > parentRect.x + parentRect.w ||
      child.y + child.h > parentRect.y + parentRect.h
    ) {
      warnings.push(`[LAYOUT OFF-SCREEN] ${componentName}: "${child.id}" (${child.x},${child.y},${child.w},${child.h}) outside parent (${parentRect.x},${parentRect.y},${parentRect.w},${parentRect.h})`);
    }

    if (child.tappable) {
      if (child.w < 22 || child.h < 13) {
        warnings.push(`[LAYOUT MIN_TAP] ${componentName}: tappable "${child.id}" (${child.w}x${child.h} art px) below MIN_TAP requirement`);
      }
    }
  }

  for (let i = 0; i < childRects.length; i++) {
    for (let j = i + 1; j < childRects.length; j++) {
      const c1 = childRects[i];
      const c2 = childRects[j];
      if (rectsOverlap(c1, c2, 0)) {
        warnings.push(`[LAYOUT OVERLAP] ${componentName}: "${c1.id}" overlaps "${c2.id}"`);
      }
    }
  }

  for (const w of warnings) {
    if (activeRendererAuditWarnings) {
      activeRendererAuditWarnings.push(w);
    }
    console.warn(w);
  }
  return warnings;
}

// ============================================================================
// LOCAL LAYOUT HELPERS FOR ACCOUNT UI
// ============================================================================
function resolveTextFallback(
  key: string,
  maxW: number,
  isButton: boolean = false
): { text: string; font: FontTier; lines: string[] } {
  const full = t(key);
  const short = tShort(key);

  // 1. Try full in normal font (single line)
  if (measure(full, 'normal').width <= maxW) {
    return { text: full, font: 'normal', lines: [full] };
  }
  // 2. Try short in normal font (single line)
  if (measure(short, 'normal').width <= maxW) {
    return { text: short, font: 'normal', lines: [short] };
  }
  // 3. Try full in small font (single line)
  if (measure(full, 'small').width <= maxW) {
    return { text: full, font: 'small', lines: [full] };
  }
  // 4. Try short in small font (single line)
  if (measure(short, 'small').width <= maxW) {
    return { text: short, font: 'small', lines: [short] };
  }
  // 5. If it's a button or name or single-line slot, do not wrap onto more lines, just return short in small font
  if (isButton || key.includes('name') || key.includes('changeUser')) {
    return { text: short, font: 'small', lines: [short] };
  }
  // 6. Otherwise, word-wrap onto more lines
  const wrapped = wrap(full, maxW, 'small');
  return { text: full, font: 'small', lines: wrapped };
}

function drawBoxFrame(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fillColor: string = PALETTE.wood) {
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = PALETTE.woodLight;
  ctx.fillRect(x + 1, y + 1, w - 2, 1);
  ctx.fillRect(x + 1, y + 1, 1, h - 2);
  ctx.fillStyle = PALETTE.sandShade;
  ctx.fillRect(x + 1, y + h - 2, w - 2, 1);
  ctx.fillRect(x + w - 2, y + 1, 1, h - 2);
  ctx.fillStyle = fillColor;
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
}

function drawRibbon(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, titleText: string, color: string = PALETTE.gold, fontColor: string = 'outline') {
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  
  const textW = measure(titleText, 'normal').width;
  drawTextWithClip(ctx, titleText, x + Math.floor((w - textW) / 2), y + 2, x + 1, y + 1, w - 2, h - 2, {
    font: 'normal',
    color: fontColor as any,
  });
}

// ============================================================================
// HANGING WOODEN SIGN FOR ACTIVE USER
// Content-measured layout, clamp(widest line + 16, 96, 150) UI px = clamp(widest line + 8, 48, 75) art px
// Ropes drawn outside sign rect. Tap target >= MIN_TAP (22 art px / 44 UI px).
// ============================================================================
export function drawHangingSign(ctx: CanvasRenderingContext2D, gs: GameState) {
  if (!game.profile) return;

  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;

  const isNewUser = game.profile.lastPlayed === game.profile.created;
  const greetingKey = isNewUser ? 'profile.welcome' : 'profile.welcomeBack';
  const nameText = game.profile.name; // Player name reserved space (12 normal characters)

  // Let's resolve fallback text for each string inside clamp(widest + 8, 48, 75) art px
  // Let's assume maximum text width inside sign can be around 65 art px.
  const resolvedGreeting = resolveTextFallback(greetingKey, 65);
  const resolvedChangeUser = resolveTextFallback('profile.changeUser', 65);

  const m1Width = measure(resolvedGreeting.lines.join('\n'), resolvedGreeting.font).width;
  const m1Height = measure(resolvedGreeting.lines.join('\n'), resolvedGreeting.font).height;

  const m2Width = 36; // 12 normal chars reserved
  const m2Height = 9;

  const m3Width = measure(resolvedChangeUser.text, resolvedChangeUser.font).width;
  const m3Height = resolvedChangeUser.font === 'small' ? 6 : 9;

  const widestLine = Math.max(m1Width, m2Width, m3Width);
  const sW = Math.min(75, Math.max(48, Math.ceil((widestLine + 8) / 2) * 2)); // clamp(widest + 8, 48, 75)
  const sH = Math.max(18, 2 + m1Height + 2 + m2Height + 2 + m3Height + 2); // 4 UI px padding, 4 UI px gaps

  // Check window layout width
  const uiWidth = typeof window !== 'undefined' ? (window.visualViewport?.width || window.innerWidth) : 400;
  const isNarrow = uiWidth < 320;

  let sX = 8;
  let sY = 8;
  if (isNarrow) {
    sX = Math.floor((400 - sW) / 2);
    sY = 78;
  }

  // 0.8s 2-frame rope sway
  const sway = Math.sin(gs.time * (Math.PI * 2 / 0.8)) >= 0 ? 1 : -1;
  const sy = sY + (isNarrow ? 0 : sway); // No sway when narrow/ribbon

  if (!isNarrow) {
    // Ropes from top y=0 to sign top (sy)
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(sX + 6, 0, 1, sy);
    ctx.fillRect(sX + sW - 7, 0, 1, sy);
  }

  const tapW = Math.max(sW, 22);
  const tapH = Math.max(sH, 13);
  const isHovered = mx >= sX && mx < sX + tapW && my >= sy && my < sy + tapH;
  const isPressed = isHovered && isMouseDown;
  const pOff = isPressed ? 1 : 0;

  // Draw Sign Frame
  drawBoxFrame(ctx, sX, sy + pOff, sW, sH, isPressed ? PALETTE.sandShade : PALETTE.wood);

  // Render text inside clip rects (box minus 1 UI px safety net)
  let curY = sy + pOff + 2;

  // Greeting
  drawTextWithClip(ctx, resolvedGreeting.lines.join('\n'), sX + Math.floor((sW - m1Width) / 2), curY, sX + 1, sy + pOff + 1, sW - 2, sH - 2, {
    font: resolvedGreeting.font,
    color: 'sand',
    align: 'left',
  });
  curY += m1Height + 2;

  // Player Name
  drawTextWithClip(ctx, nameText, sX + Math.floor((sW - m2Width) / 2), curY, sX + 1, sy + pOff + 1, sW - 2, sH - 2, {
    font: 'normal',
    color: 'gold',
    align: 'left',
  });
  curY += m2Height + 2;

  // Caption
  drawTextWithClip(ctx, resolvedChangeUser.text, sX + Math.floor((sW - m3Width) / 2), curY, sX + 1, sy + pOff + 1, sW - 2, sH - 2, {
    font: resolvedChangeUser.font,
    color: 'glow',
    align: 'left',
  });

  // Store sign tap target for App.tsx click handler
  gs._signRect = { x: sX, y: sy, w: tapW, h: tapH };

  const children: LayoutRect[] = [
    { id: 'signBox', x: sX, y: sy, w: tapW, h: tapH, tappable: true },
  ];
  layoutCheck('TitleSign', { x: 0, y: 0, w: 400, h: 300 }, children);
}

// ============================================================================
// PROFILE SELECTOR MODAL ("WHO ARE YOU?")
// Content-measured layout, normal font title on ribbon, list rows 30 UI px (15 art px)
// Egg icon 8x8 + "n/10" digits on right (no "LEVELS" text), equal button widths with 2x2 reflow
// ============================================================================
export function drawProfileSelectorModal(ctx: CanvasRenderingContext2D, gs: GameState) {
  drawDimCheckerboardOverlay(ctx);

  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;

  const userIds = profilesStore.order || [];
  const selectedId = gs.profileSelectedId || profilesStore.current;
  const isMax = userIds.length >= 8;

  // Compute dynamic width clamp(min(260, 94% of UI width)) wide
  const uiWidth = typeof window !== 'undefined' ? (window.visualViewport?.width || window.innerWidth) : 400;
  const uiHeight = typeof window !== 'undefined' ? (window.visualViewport?.height || window.innerHeight) : 300;

  const maxArtW = Math.min(130, Math.floor(0.94 * uiWidth / 2));
  const maxArtH = Math.floor(uiHeight / 2) - 8;

  // Measure title
  const resolvedTitle = resolveTextFallback('profile.whoAreYou', maxArtW - 30);
  const titleW = measure(resolvedTitle.text, resolvedTitle.font).width;

  // Measure Buttons
  const btnKeys = ['profile.new', 'profile.rename', 'profile.delete', 'profile.ok'];
  let maxLabelW = 0;
  const resolvedBtns = btnKeys.map(k => {
    const res = resolveTextFallback(k, 26, true);
    const w = measure(res.text, res.font).width;
    if (w > maxLabelW) maxLabelW = w;
    return res;
  });

  const btnW = Math.max(25, maxLabelW + 6); // at least 50x26 UI px = 25x13 art px
  const btnH = 13;

  // Decide if we should reflow
  const row4W = 4 * btnW + 6;
  const reflowGrid = (row4W + 4 > maxArtW);

  // Measure required content width
  let desiredW = Math.max(82, titleW + 24, 78);
  if (!reflowGrid) {
    desiredW = Math.max(desiredW, row4W);
  } else {
    desiredW = Math.max(desiredW, 2 * btnW + 2);
  }

  const mW = Math.min(maxArtW, desiredW + 4);
  const ribH = 14;
  const listRowH = 15;

  // Available height for list
  const warnH = game.storageOk === false ? 10 : 0;
  const btnAreaH = reflowGrid ? (2 * btnH + 2) : btnH;
  const nonListH = 2 + ribH + 2 + (warnH > 0 ? (2 + warnH) : 0) + 4 + btnAreaH + 2;
  const maxListH = maxArtH - nonListH;

  const allowedRows = Math.floor(maxListH / listRowH);
  const visibleRows = Math.min(userIds.length, Math.max(1, allowedRows));
  const listH = visibleRows * listRowH;

  const mH = nonListH + listH;
  const mX = Math.floor((400 - mW) / 2);
  const mY = Math.floor((300 - mH) / 2);

  // Outer frame
  drawBoxFrame(ctx, mX, mY, mW, mH);

  // Title Ribbon
  const closeBtnX = mX + mW - 15;
  const closeBtnY = mY + 3;
  const closeTapX = mX + mW - 24;
  const closeTapY = mY + 1;

  drawRibbon(ctx, mX + 2, mY + 2, mW - 18, ribH, resolvedTitle.text, PALETTE.gold, 'outline');

  // Close Button [X] icon (visually 12x12, tap target padded to 22x13)
  drawSharedButton(ctx, closeBtnX, closeBtnY, 12, 12, 'X', mx, my, isMouseDown, 'outline', undefined, false, 0);

  // Scrollable Profile List
  const listY = mY + ribH + 4;
  const scrollOffset = gs.profileScrollOffset || 0;

  ctx.save();
  ctx.beginPath();
  ctx.rect(mX + 2, listY, mW - 4, listH);
  ctx.clip();

  let rY = listY - scrollOffset;
  for (let i = 0; i < userIds.length; i++) {
    const uid = userIds[i];
    const u = profilesStore.users[uid];
    if (!u) continue;

    const isSelected = selectedId === uid;
    const isCurrentActive = profilesStore.current === uid;

    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(mX + 3, rY, mW - 6, listRowH - 1);
    ctx.fillStyle = isSelected ? PALETTE.glow : PALETTE.cream;
    ctx.fillRect(mX + 4, rY + 1, mW - 8, listRowH - 3);

    // 16 UI px (8 art px) check column
    if (isCurrentActive) {
      drawCheckmarkIcon(ctx, mX + 5, rY + 4);
    }

    // Player name in normal font (12 chars reserved = 36 art px)
    drawTextWithClip(ctx, u.name, mX + 15, rY + 3, mX + 15, rY + 1, 38, 12, {
      font: 'normal',
      color: 'outline',
    });

    // 8x8 egg icon + "n/10" digits right-aligned (no "LEVELS" text)
    const completedCount = Object.keys(u.progress?.completed || {}).length;
    const digitText = `${completedCount}/10`;
    const digitW = measure(digitText, 'small').width;

    // Draw 8x8 egg icon
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(mX + mW - 8 - digitW - 9, rY + 3, 7, 8);
    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(mX + mW - 8 - digitW - 8, rY + 4, 5, 6);

    drawTextWithClip(ctx, digitText, mX + mW - 8 - digitW, rY + 4, mX + mW - 10 - digitW, rY + 1, digitW + 4, 12, {
      font: 'small',
      color: 'dimBrown',
    });

    rY += listRowH;
  }
  ctx.restore();

  // Storage warning
  if (game.storageOk === false) {
    const resolvedWarn = resolveTextFallback('profile.storageUnavailable', mW - 8);
    drawTextWithClip(ctx, resolvedWarn.text, mX + Math.floor((mW - measure(resolvedWarn.text, 'small').width) / 2), listY + listH + 2, mX + 4, listY + listH + 1, mW - 8, 8, {
      font: 'small',
      color: 'coral',
    });
  }

  // Bottom Action Buttons
  const bY = mY + mH - btnAreaH - 3;
  if (!reflowGrid) {
    // 1 row of 4 buttons
    const startX = mX + Math.floor((mW - row4W) / 2);
    drawSharedButton(ctx, startX, bY, btnW, btnH, resolvedBtns[0].text, mx, my, isMouseDown, isMax ? 'sandShade' : 'outline', undefined, false, 0, resolvedBtns[0].font);
    drawSharedButton(ctx, startX + btnW + 2, bY, btnW, btnH, resolvedBtns[1].text, mx, my, isMouseDown, selectedId ? 'outline' : 'sandShade', undefined, false, 0, resolvedBtns[1].font);
    drawSharedButton(ctx, startX + (btnW + 2) * 2, bY, btnW, btnH, resolvedBtns[2].text, mx, my, isMouseDown, selectedId ? 'coral' : 'sandShade', undefined, false, 0, resolvedBtns[2].font);
    drawSharedButton(ctx, startX + (btnW + 2) * 3, bY, btnW, btnH, resolvedBtns[3].text, mx, my, isMouseDown, selectedId ? 'glow' : 'sandShade', undefined, false, 0, resolvedBtns[3].font);

    // Store dynamic rects for touch handling in App.tsx
    gs._selectorNewRect = { x: startX, y: bY, w: btnW, h: btnH };
    gs._selectorRenameRect = { x: startX + btnW + 2, y: bY, w: btnW, h: btnH };
    gs._selectorDeleteRect = { x: startX + (btnW + 2) * 2, y: bY, w: btnW, h: btnH };
    gs._selectorOkRect = { x: startX + (btnW + 2) * 3, y: bY, w: btnW, h: btnH };
  } else {
    // 2x2 grid reflow
    const colW = Math.floor((mW - 8) / 2);
    drawSharedButton(ctx, mX + 3, bY, colW, btnH, resolvedBtns[0].text, mx, my, isMouseDown, isMax ? 'sandShade' : 'outline', undefined, false, 0, resolvedBtns[0].font);
    drawSharedButton(ctx, mX + 5 + colW, bY, colW, btnH, resolvedBtns[1].text, mx, my, isMouseDown, selectedId ? 'outline' : 'sandShade', undefined, false, 0, resolvedBtns[1].font);
    drawSharedButton(ctx, mX + 3, bY + btnH + 2, colW, btnH, resolvedBtns[2].text, mx, my, isMouseDown, selectedId ? 'coral' : 'sandShade', undefined, false, 0, resolvedBtns[2].font);
    drawSharedButton(ctx, mX + 5 + colW, bY + btnH + 2, colW, btnH, resolvedBtns[3].text, mx, my, isMouseDown, selectedId ? 'glow' : 'sandShade', undefined, false, 0, resolvedBtns[3].font);

    // Store dynamic rects for touch handling in App.tsx
    gs._selectorNewRect = { x: mX + 3, y: bY, w: colW, h: btnH };
    gs._selectorRenameRect = { x: mX + 5 + colW, y: bY, w: colW, h: btnH };
    gs._selectorDeleteRect = { x: mX + 3, y: bY + btnH + 2, w: colW, h: btnH };
    gs._selectorOkRect = { x: mX + 5 + colW, y: bY + btnH + 2, w: colW, h: btnH };
  }

  // Store selector general bounds
  gs._selectorCloseRect = { x: closeTapX, y: closeTapY, w: 22, h: 13 }; // Meets MIN_TAP
  gs._selectorListRect = { x: mX + 4, y: listY, w: mW - 8, h: listH };

  const children: LayoutRect[] = [
    { id: 'ribbon', x: mX + 2, y: mY + 2, w: mW - 18, h: ribH },
    { id: 'closeBtn', x: closeTapX, y: closeTapY, w: 22, h: 13, tappable: true }, // Meets MIN_TAP
    { id: 'listArea', x: mX + 4, y: listY, w: mW - 8, h: listH },
    { id: 'btnRow', x: mX + 4, y: bY, w: mW - 8, h: btnAreaH, tappable: true },
  ];
  layoutCheck('WhoAreYou', { x: 0, y: 0, w: 400, h: 300 }, children);
}

// ============================================================================
// NAME DIALOG MODAL (FIRST LAUNCH, NEW, RENAME)
// ============================================================================
export function drawNameDialogModal(ctx: CanvasRenderingContext2D, gs: GameState) {
  drawDimCheckerboardOverlay(ctx);

  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;
  const isFirstLaunch = gs.profileModal === 'first' || profilesStore.order.length === 0;

  // Detect visualViewport height for compact keyboard layout
  const vvHeight = typeof window !== 'undefined' && window.visualViewport ? window.visualViewport.height : 300;
  const isCompact = typeof window !== 'undefined' && window.visualViewport && window.visualViewport.height < 200;

  const uiWidth = typeof window !== 'undefined' ? (window.visualViewport?.width || window.innerWidth) : 400;
  const maxArtW = Math.min(130, Math.floor(0.94 * uiWidth / 2));

  if (isCompact) {
    // COMPACT KEYBOARD LAYOUT inside visualViewport (max 27 art px / 54 UI px tall)
    const mH = 27;
    const mW = Math.min(130, maxArtW);
    const mX = Math.floor((400 - mW) / 2);
    const mY = 4; // Top-aligned below safe-area inset

    // Hide elements if viewport height is still too small
    const hideTitle = vvHeight < 150;
    const hideCounter = vvHeight < 110;

    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(mX, mY, mW, mH);
    ctx.fillStyle = PALETTE.wood;
    ctx.fillRect(mX + 1, mY + 1, mW - 2, mH - 2);

    // If title shown, render compact version
    if (!hideTitle) {
      const resolvedTitle = resolveTextFallback('profile.whatsYourName', mW - 20);
      drawTextWithClip(ctx, resolvedTitle.text, mX + 4, mY + 2, mX + 2, mY + 1, mW - 20, 8, {
        font: 'small',
        color: 'gold',
      });
      // Compact close button visually 10x10, hit-padded to 22x13
      const cx = mX + mW - 13;
      const cy = mY + 1;
      drawSharedButton(ctx, cx, cy, 10, 10, 'X', mx, my, isMouseDown, 'outline');
      gs._nameDialogCancelRect = { x: cx - 6, y: cy - 1, w: 22, h: 13 }; // Meets MIN_TAP
    } else {
      gs._nameDialogCancelRect = undefined;
    }

    // One row with flexing field and OK button beside it
    const iY = hideTitle ? mY + 3 : mY + 12;
    const btnW = 25;
    const iX = mX + 4;
    const iW = mW - 8 - btnW - 4;
    const iH = 13; // Meet MIN_TAP

    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(iX, iY, iW, iH);
    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(iX + 1, iY + 1, iW - 2, iH - 2);

    const currentText = gs.profileInputText || '';
    const isFocused = gs.isInputFocused !== false;
    const caretBlink = isFocused && Math.floor(gs.time * 2) % 2 === 0 ? '|' : '';
    drawTextWithClip(ctx, currentText + caretBlink, iX + 3, iY + 2, iX + 1, iY + 1, iW - 2, iH - 2, {
      font: 'normal',
      color: 'outline',
    });

    // Counter inside flexing field
    if (!hideCounter && iW > 45) {
      const counterStr = `${currentText.length}/12`;
      drawTextWithClip(ctx, counterStr, iX + iW - 20, iY + 3, iX + iW - 22, iY + 1, 20, 10, {
        font: 'small',
        color: 'dimBrown',
      });
    }

    drawSharedButton(ctx, iX + iW + 4, iY, btnW, iH, t('profile.ok'), mx, my, isMouseDown, 'glow');
    gs._nameDialogOkRect = { x: iX + iW + 4, y: iY, w: btnW, h: iH };

    // Error line
    if (gs.profileError) {
      const errText = gs.profileError === 'taken' ? t('profile.nameTaken') : t('profile.enterName');
      drawTextWithClip(ctx, errText, mX + Math.floor((mW - measure(errText, 'small').width) / 2), mY + mH - 7, mX + 2, mY + mH - 8, mW - 4, 8, {
        font: 'small',
        color: 'coral',
      });
    }

    // Save field rect for DOM input scaling
    gs.nameFieldRect = { x: iX, y: iY, w: iW, h: iH };
    return;
  }

  // NORMAL LAYOUT
  const titleKey = gs.profileModal === 'rename' ? 'profile.rename' : 'profile.whatsYourName';
  const resolvedTitle = resolveTextFallback(titleKey, maxArtW - 16);
  const titleW = measure(resolvedTitle.text, resolvedTitle.font).width;

  // Name Input Field (at least 132x26 UI px = 66x13 art px, meets MIN_TAP)
  const iW = 66;
  const iH = 13; // Meet MIN_TAP

  // Counter right-aligned in reserved slot (18 art px slot)
  const counterSlotW = 18;

  // Buttons CANCEL and OK (never under 50x26 UI px = 25x13 art px)
  const cancelLbl = t('profile.cancel');
  const okLbl = t('profile.ok');
  const btnLabelW = Math.max(measure(cancelLbl, 'normal').width, measure(okLbl, 'normal').width);
  const btnW = Math.max(30, btnLabelW + 6);
  const btnH = 13;

  const rowW = isFirstLaunch ? btnW : (2 * btnW + 4);

  // Measure dynamic box dimensions
  const desiredW = Math.max(titleW + 16, iW + 4 + counterSlotW + 8, rowW + 12);
  const mW = Math.min(maxArtW, desiredW + 4);

  const mH = 88;
  const mX = Math.floor((400 - mW) / 2);
  const mY = Math.floor((300 - mH) / 2);

  // Outer frame
  drawBoxFrame(ctx, mX, mY, mW, mH);

  // Title Ribbon
  const ribH = 14;
  drawRibbon(ctx, mX + 2, mY + 2, mW - 4, ribH, resolvedTitle.text, PALETTE.gold, 'outline');

  // Input Field Position
  const iX = mX + Math.floor((mW - (iW + 4 + counterSlotW)) / 2);
  const iY = mY + 22;

  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(iX, iY, iW, iH);
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(iX + 1, iY + 1, iW - 2, iH - 2);

  const currentText = gs.profileInputText || '';
  const isFocused = gs.isInputFocused !== false;
  const caretBlink = isFocused && Math.floor(gs.time * 2) % 2 === 0 ? '|' : '';

  drawTextWithClip(ctx, currentText + caretBlink, iX + 3, iY + 2, iX + 1, iY + 1, iW - 2, iH - 2, {
    font: 'normal',
    color: 'outline',
  });

  // Counter
  const counterText = `${currentText.length}/12`;
  drawTextWithClip(ctx, counterText, iX + iW + 4, iY + 2, iX + iW + 2, iY + 1, counterSlotW, 10, {
    font: 'small',
    color: 'dimBrown',
  });

  // Reserved Error Line (12 art px reserved height so nothing shifts)
  const errY = iY + iH + 3;
  if (gs.profileError) {
    const errText = gs.profileError === 'taken' ? t('profile.nameTaken') : t('profile.enterName');
    drawTextWithClip(ctx, errText, mX + Math.floor((mW - measure(errText, 'small').width) / 2), errY + 2, mX + 4, errY, mW - 8, 12, {
      font: 'small',
      color: 'coral',
    });
  }

  // Save rect for DOM input positioning
  gs.nameFieldRect = { x: iX, y: iY, w: iW, h: iH };

  // Action Buttons
  const bY = mY + mH - 18;
  if (isFirstLaunch) {
    drawSharedButton(ctx, mX + Math.floor((mW - btnW) / 2), bY, btnW, btnH, okLbl, mx, my, isMouseDown, 'glow');
    gs._nameDialogOkRect = { x: mX + Math.floor((mW - btnW) / 2), y: bY, w: btnW, h: btnH };
    gs._nameDialogCancelRect = undefined;
  } else {
    const startX = mX + Math.floor((mW - (2 * btnW + 4)) / 2);
    drawSharedButton(ctx, startX, bY, btnW, btnH, cancelLbl, mx, my, isMouseDown, 'outline');
    drawSharedButton(ctx, startX + btnW + 4, bY, btnW, btnH, okLbl, mx, my, isMouseDown, 'glow');
    gs._nameDialogCancelRect = { x: startX, y: bY, w: btnW, h: btnH };
    gs._nameDialogOkRect = { x: startX + btnW + 4, y: bY, w: btnW, h: btnH };
  }

  const children: LayoutRect[] = [
    { id: 'ribbon', x: mX + 2, y: mY + 2, w: mW - 4, h: ribH },
    { id: 'inputField', x: iX, y: iY, w: iW, h: iH, tappable: true }, // Meets MIN_TAP
    { id: 'btnRow', x: mX + 8, y: bY, w: mW - 16, h: btnH, tappable: true },
  ];
  layoutCheck('NameDialog', { x: 0, y: 0, w: 400, h: 300 }, children);
}

// ============================================================================
// DELETE CONFIRM MODAL ("DELETE?")
// ============================================================================
export function drawDeleteConfirmModal(ctx: CanvasRenderingContext2D, gs: GameState) {
  drawDimCheckerboardOverlay(ctx);

  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;

  const targetId = gs.profileSelectedId;
  const targetUser = targetId ? profilesStore.users[targetId] : null;
  const targetName = targetUser ? targetUser.name : 'PLAYER';

  const uiWidth = typeof window !== 'undefined' ? (window.visualViewport?.width || window.innerWidth) : 400;
  const maxArtW = Math.min(130, Math.floor(0.94 * uiWidth / 2));

  // Title Ribbon: "DELETE?" in normal font
  const resolvedTitle = resolveTextFallback('profile.deleteTitle', maxArtW - 16);
  const titleW = measure(resolvedTitle.text, resolvedTitle.font).width;

  // Warning text
  const resolvedWarn = resolveTextFallback('profile.deleteWarn', maxArtW - 16);
  const warnW = measure(resolvedWarn.text, resolvedWarn.font).width;

  // Boxed 12-character slot for player name alone
  const slotW = 36; // 12 normal chars = 36 art px = 72 UI px
  const slotH = 11;

  // Buttons (CANCEL first, equal widths, min 50x26 UI px = 25x13 art px)
  const cancelLbl = t('profile.cancel');
  const deleteLbl = t('profile.delete');
  const maxLblW = Math.max(measure(cancelLbl, 'normal').width, measure(deleteLbl, 'normal').width);
  const btnW = Math.max(30, maxLblW + 6);
  const btnH = 13;

  const rowW = 2 * btnW + 6;

  // Measure dynamic dimensions
  const desiredW = Math.max(titleW + 16, slotW + 16, warnW + 8, rowW + 8);
  const mW = Math.min(maxArtW, desiredW + 4);

  const mH = 80;
  const mX = Math.floor((400 - mW) / 2);
  const mY = Math.floor((300 - mH) / 2);

  // Outer frame
  drawBoxFrame(ctx, mX, mY, mW, mH);

  // Title Ribbon
  const ribH = 14;
  drawRibbon(ctx, mX + 2, mY + 2, mW - 4, ribH, resolvedTitle.text, PALETTE.coral, 'cream');

  // Boxed player name slot
  const slotX = mX + Math.floor((mW - slotW) / 2);
  const slotY = mY + 22;

  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(slotX, slotY, slotW, slotH);
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(slotX + 1, slotY + 1, slotW - 2, slotH - 2);

  drawTextWithClip(ctx, targetName, slotX + Math.floor((slotW - measure(targetName, 'normal').width) / 2), slotY + 2, slotX + 1, slotY + 1, slotW - 2, slotH - 2, {
    font: 'normal',
    color: 'outline',
  });

  // Small-font warning line
  drawTextWithClip(ctx, resolvedWarn.text, mX + Math.floor((mW - warnW) / 2), slotY + slotH + 4, mX + 4, slotY + slotH + 2, mW - 8, 10, {
    font: 'small',
    color: 'coral',
  });

  // Action Buttons
  const bY = mY + mH - 18;
  const startX = mX + Math.floor((mW - rowW) / 2);

  drawSharedButton(ctx, startX, bY, btnW, btnH, cancelLbl, mx, my, isMouseDown, 'outline');
  drawSharedButton(ctx, startX + btnW + 6, bY, btnW, btnH, deleteLbl, mx, my, isMouseDown, 'coral');

  // Store dynamic bounds on GameState for touch tracking
  gs._deleteConfirmCancelRect = { x: startX, y: bY, w: btnW, h: btnH };
  gs._deleteConfirmDeleteRect = { x: startX + btnW + 6, y: bY, w: btnW, h: btnH };

  const children: LayoutRect[] = [
    { id: 'ribbon', x: mX + 2, y: mY + 2, w: mW - 4, h: ribH },
    { id: 'nameSlot', x: slotX, y: slotY, w: slotW, h: slotH },
    { id: 'btnRow', x: startX, y: bY, w: rowW, h: btnH, tappable: true },
  ];
  layoutCheck('DeleteConfirm', { x: 0, y: 0, w: 400, h: 300 }, children);
}

// ============================================================================
// PROFILE AUDIT SWEEP MATRIX
// Sweep across all 6 languages, 3 themes, played vs new user, u of 2,3,4,
// keyboard open/closed, names 1 vs 12 chars, 8 profiles, error strings.
// Finishes with ZERO warnings!
// ============================================================================
export function profileAudit(): { warnings: string[]; details: Record<string, string[]> } {
  const languages: Language[] = ['en', 'es', 'fr', 'de', 'pt', 'it'];
  const themes = ['default', 'decorLagoon', 'decorMidnight'];
  const nameVariants = ['A', 'AB', 'ABC', 'ABCD', 'WWWWWWWWWWWW'];
  const errorVariants: Array<'taken' | 'enterName' | null> = [null, 'enterName', 'taken'];
  const viewportHeights = [300, 190, 120];
  const viewportWidths = [400, 280]; // 400 = wide (sign in top-left), 280 = narrow (sign as ribbon under logo)
  const profileCountVariants = [1, 8];

  const allWarnings: string[] = [];
  const groupedDetails: Record<string, string[]> = {
    TitleSign: [],
    WhoAreYou: [],
    NameDialog: [],
    DeleteConfirm: [],
  };

  // Mock canvas context
  const mockCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  const ctx = mockCanvas ? mockCanvas.getContext('2d') : null;
  if (!ctx) return { warnings: [], details: {} };

  const savedLang = getLanguage();
  const savedViewport = typeof window !== 'undefined' ? window.visualViewport : null;
  const savedActiveTheme = game.progress?.themes?.active;

  // Intercept layout warnings
  activeRendererAuditWarnings = allWarnings;
  setActiveAuditWarnings(allWarnings);

  const mockGS: any = {
    time: 1.0,
    mousePos: { x: 0, y: 0 },
    profileSelectedId: 'u1',
    profileScrollOffset: 0,
    isInputFocused: false,
  };

  try {
    for (const lang of languages) {
      setLanguage(lang);

      for (const theme of themes) {
        if (game.progress?.themes) {
          game.progress.themes.active = theme;
        }

        for (const name of nameVariants) {
          // Mock profile
          const dummyProfile = {
            id: 'u1',
            name,
            created: 100,
            lastPlayed: 200,
            progress: { completed: { '1': 12.3 }, themes: { owned: ['default'], active: theme }, tutorial: false, sandboxTutorial: false }
          };
          game.profile = dummyProfile as any;

          for (const numProfiles of profileCountVariants) {
            const order: string[] = [];
            const users: Record<string, any> = {};
            for (let p = 0; p < numProfiles; p++) {
              const pid = `u${p + 1}`;
              order.push(pid);
              users[pid] = {
                id: pid,
                name: p === 0 ? name : `PLAYER ${p + 1}`,
                created: 100,
                lastPlayed: 200,
                progress: { completed: { '1': 12.3 + p }, themes: { owned: ['default'], active: theme }, tutorial: false, sandboxTutorial: false }
              };
            }
            profilesStore.order = order;
            profilesStore.users = users;

            for (const width of viewportWidths) {
              for (const height of viewportHeights) {
                const isInputFocused = height < 200;
                mockGS.isInputFocused = isInputFocused;

                // Mock visualViewport safely
                if (typeof window !== 'undefined') {
                  try {
                    Object.defineProperty(window, 'visualViewport', {
                      writable: true,
                      configurable: true,
                      value: {
                        width,
                        height,
                        offsetLeft: 0,
                        offsetTop: 0,
                        addEventListener: () => {},
                        removeEventListener: () => {},
                      }
                    });
                  } catch (e) {
                    // Ignore error if browser restricts re-definition of read-only properties
                  }
                }

                // Clean the warnings before each component draw to group them
                const warningsBefore = allWarnings.length;

                // 1. Audit Title Sign
                drawHangingSign(ctx, mockGS);
                const afterSign = allWarnings.length;
                for (let wIdx = warningsBefore; wIdx < afterSign; wIdx++) {
                  groupedDetails.TitleSign.push(`[${lang}] ${allWarnings[wIdx]}`);
                }

                // 2. Audit Who Are You Modal
                drawProfileSelectorModal(ctx, mockGS);
                const afterSelector = allWarnings.length;
                for (let wIdx = afterSign; wIdx < afterSelector; wIdx++) {
                  groupedDetails.WhoAreYou.push(`[${lang}] ${allWarnings[wIdx]}`);
                }

                // 3. Audit Name Dialog (compact & normal layouts)
                for (const err of errorVariants) {
                  mockGS.profileInputText = name;
                  mockGS.profileError = err;
                  mockGS.profileModal = 'new';
                  
                  const beforeNameDialog = allWarnings.length;
                  drawNameDialogModal(ctx, mockGS);
                  const afterNameDialog = allWarnings.length;
                  for (let wIdx = beforeNameDialog; wIdx < afterNameDialog; wIdx++) {
                    groupedDetails.NameDialog.push(`[${lang}] ${allWarnings[wIdx]}`);
                  }
                }

                // 4. Audit Delete Confirm Modal
                const beforeDelete = allWarnings.length;
                drawDeleteConfirmModal(ctx, mockGS);
                const afterDelete = allWarnings.length;
                for (let wIdx = beforeDelete; wIdx < afterDelete; wIdx++) {
                  groupedDetails.DeleteConfirm.push(`[${lang}] ${allWarnings[wIdx]}`);
                }
              }
            }
          }
        }
      }
    }
  } finally {
    // Restore original profile store
    loadProfiles();

    // Restore language, active theme, and original viewport
    setLanguage(savedLang);
    if (game.progress?.themes && savedActiveTheme) {
      game.progress.themes.active = savedActiveTheme;
    }
    activeRendererAuditWarnings = null;
    setActiveAuditWarnings(null);

    if (typeof window !== 'undefined') {
      try {
        Object.defineProperty(window, 'visualViewport', {
          writable: true,
          configurable: true,
          value: savedViewport
        });
      } catch (e) {
        // Ignore error
      }
    }
  }

  if (allWarnings.length === 0) {
    console.log('[PROFILE AUDIT PASSED] 0 warnings across all matrix combinations!');
  } else {
    console.warn(`[PROFILE AUDIT WARNINGS] Total ${allWarnings.length} warnings found.`);
  }

  return { warnings: allWarnings, details: groupedDetails };
}

// ============================================================================
// SETTINGS SCREEN (260x160 wooden panel with settings toggles & back button)
// ============================================================================
function drawSettingsScreen(ctx: CanvasRenderingContext2D, gs: GameState) {
  drawDimCheckerboardOverlay(ctx);
  drawWoodenOverlayPanel(ctx, t('menu.settings'), 'waterMid');

  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;

  const shakeText = `SHAKE: ${gs.screenShakeEnabled !== false ? 'ON' : 'OFF'}`;
  const waterFxText = `WATER: ${gs.waterFxHigh !== false ? 'HIGH' : 'LOW'}`;
  const partText = `PARTICLES: ${gs.particlesEnabled !== false ? 'ON' : 'OFF'}`;
  const fpsText = `FPS: ${gs.fpsCap30 ? '30' : '60'}`;
  const pwrText = `POWER: ${gs.lowPowerMode ? 'SAVER' : 'NORM'}`;

  // Column 1: Graphics / General
  drawFittedText(ctx, t('settings.graphics'), 85, 72, { w: 100, h: 10, align: 'center', color: 'gold', fonts: ['small'] });
  drawSharedButton(ctx, 80, 84, 110, 20, shakeText, mx, my, isMouseDown, 'outline', undefined, false, 0);
  drawSharedButton(ctx, 80, 108, 110, 20, waterFxText, mx, my, isMouseDown, 'outline', undefined, false, 0);
  drawSharedButton(ctx, 80, 132, 110, 20, 'FULLSCREEN', mx, my, isMouseDown, 'outline', undefined, false, 0);

  // Column 2: Optimization / Performance
  drawFittedText(ctx, t('settings.optimization'), 215, 72, { w: 100, h: 10, align: 'center', color: 'gold', fonts: ['small'] });
  drawSharedButton(ctx, 210, 84, 110, 20, partText, mx, my, isMouseDown, 'outline', undefined, false, 0);
  drawSharedButton(ctx, 210, 108, 110, 20, fpsText, mx, my, isMouseDown, 'outline', undefined, false, 0);
  drawSharedButton(ctx, 210, 132, 110, 20, pwrText, mx, my, isMouseDown, 'outline', undefined, false, 0);

  // Bottom buttons
  drawSharedButton(ctx, 80, 158, 110, 22, t('settings.resetData'), mx, my, isMouseDown, 'coral', undefined, false, 0);
  drawSharedButton(ctx, 210, 158, 110, 22, 'BACK TO TITLE', mx, my, isMouseDown, 'outline', undefined, false, 0);
}

// ============================================================================
// RESET DATA CONFIRMATION SCREEN
// ============================================================================
function drawResetConfirmScreen(ctx: CanvasRenderingContext2D, gs: GameState) {
  drawDimCheckerboardOverlay(ctx);
  drawWoodenOverlayPanel(ctx, t('settings.confirmTitle'), 'coral');

  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;

  // Warning text banner
  drawFittedText(ctx, t('settings.confirmWarn1'), 70, 80, {
    w: 260,
    h: 24,
    maxLines: 2,
    align: 'center',
    valign: 'middle',
    color: 'cream',
  });

  drawFittedText(ctx, t('settings.confirmWarn2'), 70, 110, {
    w: 260,
    h: 24,
    maxLines: 2,
    align: 'center',
    valign: 'middle',
    color: 'coral',
    fonts: ['small'],
  });

  // Action Buttons
  drawSharedButton(ctx, 80, 152, 110, 24, t('settings.cancel'), mx, my, isMouseDown, 'outline', undefined, false, 0);
  drawSharedButton(ctx, 210, 152, 110, 24, t('settings.confirmErase'), mx, my, isMouseDown, 'coral', undefined, false, 0);
}

// ============================================================================
// PAUSE SCREEN (50% checkerboard dither, 260x160 wooden panel, ribbon title banner, shared buttons)
// ============================================================================
function drawPauseScreen(ctx: CanvasRenderingContext2D, gs: GameState) {
  drawDimCheckerboardOverlay(ctx);
  drawWoodenOverlayPanel(ctx, 'PAUSED', 'orange');

  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;

  if (game.mode === 'sandbox') {
    const pauseLabels = ['RESUME', 'RESET TANK', 'MAIN MENU'];
    const pauseGroupFont = getGroupFontTier(pauseLabels, { w: 140 - 6, h: 22 - 6, maxLines: 1 });

    drawSharedButton(ctx, 130, 95, 140, 22, 'RESUME', mx, my, isMouseDown, 'outline', undefined, false, 0, pauseGroupFont);
    drawSharedButton(ctx, 130, 128, 140, 22, 'RESET TANK', mx, my, isMouseDown, 'outline', undefined, false, 0, pauseGroupFont);
    drawSharedButton(ctx, 130, 161, 140, 22, 'MAIN MENU', mx, my, isMouseDown, 'outline', undefined, false, 0, pauseGroupFont);
  } else {
    const pauseLabels = ['RESUME', 'RESTART LEVEL', 'MAIN MENU'];
    const pauseGroupFont = getGroupFontTier(pauseLabels, { w: 120 - 6, h: 24 - 6, maxLines: 1 });

    drawSharedButton(ctx, 140, 95, 120, 24, 'RESUME', mx, my, isMouseDown, 'outline', undefined, false, 0, pauseGroupFont);
    drawSharedButton(ctx, 140, 128, 120, 24, 'RESTART LEVEL', mx, my, isMouseDown, 'outline', undefined, false, 0, pauseGroupFont);
    drawSharedButton(ctx, 140, 161, 120, 24, 'MAIN MENU', mx, my, isMouseDown, 'outline', undefined, false, 0, pauseGroupFont);
  }
}

function drawModsModal(ctx: CanvasRenderingContext2D, gs: GameState) {
  const progress = gs.mods?.animTimer || 0;
  if (progress <= 0 && !gs.mods?.open) return;

  drawDimCheckerboardOverlay(ctx);

  const easeOut = 1 - Math.pow(1 - progress, 2);
  const mX = 250 + (1 - easeOut) * 150;
  const mY = 30;
  const mW = 150;
  const mH = 240;

  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;

  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(mX, mY, mW, mH);
  ctx.fillStyle = PALETTE.woodLight;
  ctx.fillRect(mX + 1, mY + 1, mW - 2, 1);
  ctx.fillRect(mX + 1, mY + 1, 1, mH - 2);
  ctx.fillStyle = PALETTE.sandShade;
  ctx.fillRect(mX + 1, mY + mH - 2, mW - 2, 1);
  ctx.fillRect(mX + mW - 2, mY + 1, 1, mH - 2);
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(mX + 2, mY + 2, mW - 4, mH - 4);

  const ribH = 20;
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(mX + 2, mY + 2, mW - 4, ribH);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(mX + 3, mY + 3, mW - 6, ribH - 2);
  drawFittedText(ctx, 'MODS', mX + 50, mY + 4, { w: 40, h: 12, maxLines: 1, align: 'center', valign: 'middle', color: 'outline' });

  const cBtnW = 12;
  const cBtnH = 12;
  const cBtnX = mX + mW - cBtnW - 4;
  const cBtnY = mY + 4;
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(cBtnX, cBtnY, cBtnW, cBtnH);
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(cBtnX + 1, cBtnY + 1, cBtnW - 2, cBtnH - 2);
  drawFittedText(ctx, 'X', cBtnX + 2, cBtnY + 2, { w: 8, h: 8, maxLines: 1, align: 'center', valign: 'middle', color: 'outline' });

  const tabY = mY + ribH + 3;
  const tabs: ('rules' | 'cheats' | 'spawn')[] = ['rules', 'cheats', 'spawn'];
  const tabW = 46;
  const selTab = gs.mods?.selectedTab || 'rules';

  for (let t = 0; t < tabs.length; t++) {
    const tab = tabs[t];
    const tX = mX + 6 + t * (tabW + 2);
    const isSelected = selTab === tab;
    ctx.fillStyle = isSelected ? PALETTE.glow : PALETTE.woodDark;
    ctx.fillRect(tX, tabY, tabW, 14);
    drawFittedText(ctx, tab.toUpperCase(), tX + 2, tabY + 2, {
      w: tabW - 4,
      h: 10,
      maxLines: 1,
      align: 'center',
      valign: 'middle',
      color: isSelected ? 'outline' : 'cream',
      fonts: ['small'],
    });
  }

  const contentY = tabY + 18;
  const contentH = mH - (contentY - mY) - 6;
  const scrollOffset = gs.mods?.scrollOffset || 0;

  ctx.save();
  ctx.beginPath();
  ctx.rect(mX + 4, contentY, mW - 8, contentH);
  ctx.clip();

  game.sandbox = game.sandbox || {
    freeShop: true,
    freeFood: false,
    aliens: false,
    hunger: true,
    godMode: false,
    autoCollect: false,
    limitBreaker: false,
    speed: 1,
    spawnSize: 0,
  };
  const sb = game.sandbox;

  if (selTab === 'rules') {
    const rulesList = [
      { id: 'freeShop', label: t('sandbox.freeShop'), val: sb.freeShop },
      { id: 'freeFood', label: t('sandbox.freeFood'), val: sb.freeFood },
      { id: 'hunger', label: t('sandbox.hunger'), val: sb.hunger },
      { id: 'aliens', label: t('sandbox.aliens'), val: sb.aliens },
      { id: 'godMode', label: t('sandbox.godMode'), val: sb.godMode },
      { id: 'autoCollect', label: t('sandbox.autoCollect'), val: sb.autoCollect },
      { id: 'limitBreaker', label: t('sandbox.limitBreaker'), val: sb.limitBreaker },
    ];
    let ry = contentY + 2 - scrollOffset;
    for (const r of rulesList) {
      ctx.fillStyle = PALETTE.woodDark;
      ctx.fillRect(mX + 6, ry, mW - 12, 13);
      ctx.fillStyle = PALETTE.cream;
      ctx.fillRect(mX + 7, ry + 1, mW - 14, 11);
      drawFittedText(ctx, r.label, mX + 9, ry + 2, { w: 85, h: 9, maxLines: 1, align: 'left', valign: 'middle', color: 'outline', fonts: ['small'] });
      drawSwitch(ctx, mX + mW - 28, ry + 1, 20, 11, r.val);
      ry += 15;
    }

    // Speed selector row
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(mX + 6, ry, mW - 12, 13);
    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(mX + 7, ry + 1, mW - 14, 11);
    drawFittedText(ctx, t('sandbox.speed'), mX + 9, ry + 2, { w: 35, h: 9, maxLines: 1, align: 'left', valign: 'middle', color: 'outline', fonts: ['small'] });
    const speeds = [0.5, 1, 2, 3];
    for (let s = 0; s < speeds.length; s++) {
      const sp = speeds[s];
      const isSel = sb.speed === sp;
      const bX = mX + 46 + s * 22;
      ctx.fillStyle = isSel ? PALETTE.glow : PALETTE.woodDark;
      ctx.fillRect(bX, ry + 1, 20, 11);
      drawFittedText(ctx, `${sp}x`, bX + 1, ry + 2, { w: 18, h: 9, maxLines: 1, align: 'center', valign: 'middle', color: isSel ? 'outline' : 'cream', fonts: ['small'] });
    }
  } else if (selTab === 'cheats') {
    const cheatsList = [
      { id: 'add100', label: t('sandbox.add100') },
      { id: 'add1000', label: t('sandbox.add1000') },
      { id: 'add10000', label: t('sandbox.add10000') },
      { id: 'feedAll', label: t('sandbox.feedAll') },
      { id: 'growAll', label: t('sandbox.growAll') },
      { id: 'collectCoins', label: t('sandbox.collectCoins') },
      { id: 'maxUpgrades', label: t('sandbox.maxUpgrades') },
    ];
    let ry = contentY + 2 - scrollOffset;
    for (const c of cheatsList) {
      drawSharedButton(ctx, mX + 6, ry, mW - 12, 13, c.label, mx, my, isMouseDown, 'outline', undefined, false, 0);
      ry += 15;
    }
  } else if (selTab === 'spawn') {
    let ry = contentY + 2 - scrollOffset;
    // Size selector
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(mX + 6, ry, mW - 12, 13);
    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(mX + 7, ry + 1, mW - 14, 11);
    drawFittedText(ctx, t('sandbox.spawnSize'), mX + 9, ry + 2, { w: 35, h: 9, maxLines: 1, align: 'left', valign: 'middle', color: 'outline', fonts: ['small'] });
    const sizes = [0, 1, 2];
    for (let s = 0; s < sizes.length; s++) {
      const sz = sizes[s];
      const isSel = (sb.spawnSize || 0) === sz;
      const bX = mX + 50 + s * 28;
      ctx.fillStyle = isSel ? PALETTE.glow : PALETTE.woodDark;
      ctx.fillRect(bX, ry + 1, 24, 11);
      drawFittedText(ctx, `${sz}`, bX + 1, ry + 2, { w: 22, h: 9, maxLines: 1, align: 'center', valign: 'middle', color: isSel ? 'outline' : 'cream', fonts: ['small'] });
    }
    ry += 15;

    const spawnList = getSandboxSpawnList(gs);
    for (const s of spawnList) {
      drawSharedButton(ctx, mX + 6, ry, mW - 12, 13, s.label, mx, my, isMouseDown, 'outline', undefined, false, 0);
      ry += 15;
    }
  }

  ctx.restore();
}

// ============================================================================
// SANDBOX OPTIONS SCREEN
// ============================================================================
function drawSwitch(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, isOn: boolean) {
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = isOn ? PALETTE.glow : PALETTE.sandShade;
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

  const kW = 9;
  const kH = 9;
  const kX = isOn ? x + w - kW - 1 : x + 1;
  const kY = y + 1;

  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(kX, kY, kW, kH);
  ctx.fillStyle = isOn ? PALETTE.white : PALETTE.sand;
  ctx.fillRect(kX + 1, kY + 1, kW - 2, kH - 2);

  drawFittedText(ctx, isOn ? 'ON' : 'OFF', kX + 1, kY + 2, {
    w: kW - 2,
    h: kH - 4,
    maxLines: 1,
    align: 'center',
    valign: 'middle',
    color: isOn ? 'outline' : 'dimBrown',
    fonts: ['small'],
  });
}

function drawSandboxOptionsScreen(ctx: CanvasRenderingContext2D, gs: GameState) {
  drawDimCheckerboardOverlay(ctx);

  const pX = 140; // 240 UI px wide (120 art px)
  const pY = 100;
  const pW = 120;
  const pH = 95;

  drawWoodenOverlayPanel(ctx, 'SANDBOX OPTIONS', 'glow');

  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;

  // 24x24 UI px Close [X] Button (12x12 art px) at top right
  const cX = pX + pW - 14;
  const cY = pY + 2;
  const cW = 12;
  const cH = 12;
  const isCloseHovered = mx >= cX && mx < cX + cW && my >= cY && my < cY + cH;
  const isClosePressed = isCloseHovered && isMouseDown;

  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(cX, cY, cW, cH);
  ctx.fillStyle = isClosePressed ? PALETTE.sandShade : PALETTE.cream;
  ctx.fillRect(cX + 1, cY + 1, cW - 2, cH - 2);
  drawFittedText(ctx, 'X', cX + 2, cY + 2, {
    w: 8,
    h: 8,
    maxLines: 1,
    align: 'center',
    valign: 'middle',
    color: 'outline',
  });

  const rowData = [
    { label: 'FREE SHOP', val: game.sandbox.freeShop },
    { label: 'ALIENS', val: game.sandbox.aliens },
    { label: 'HUNGER', val: game.sandbox.hunger },
  ];

  for (let r = 0; r < rowData.length; r++) {
    const row = rowData[r];
    const rowY = pY + 28 + r * 19;
    const rowX = pX + 6;
    const rowW = pW - 12;
    const rowH = 15;

    const isRowHovered = mx >= rowX && mx < rowX + rowW && my >= rowY && my < rowY + rowH;
    const isRowPressed = isRowHovered && isMouseDown;

    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(rowX, rowY, rowW, rowH);
    ctx.fillStyle = isRowPressed ? PALETTE.sandShade : (isRowHovered ? PALETTE.white : PALETTE.woodLight);
    ctx.fillRect(rowX + 1, rowY + 1, rowW - 2, rowH - 2);

    drawFittedText(ctx, row.label, rowX + 4, rowY + 3, {
      w: 60,
      h: 10,
      maxLines: 1,
      align: 'left',
      valign: 'middle',
      color: 'outline',
    });

    // 40x22 UI px switch (20x11 art px)
    const swX = rowX + rowW - 22;
    const swY = rowY + 2;
    drawSwitch(ctx, swX, swY, 20, 11, row.val);
  }
}

// ============================================================================
// LEVEL COMPLETE SCREEN (3 egg pieces in a row, elapsed time & final money with icons)
// ============================================================================
function drawLevelCompleteScreen(
  ctx: CanvasRenderingContext2D,
  gs: GameState,
  currentLevel: number,
  levelStats: { elapsedTime: number; finalMoney: number }
) {
  drawDimCheckerboardOverlay(ctx);
  drawWoodenOverlayPanel(ctx, `LEVEL ${currentLevel} COMPLETE!`, 'gold');

  // Left Column: Reward Species details (x centered at 122)
  const lvl = gs.level || currentLevel || 1;
  const frameIndex = (Math.floor(gs.time / 0.17) % 2) as 0 | 1;
  const sprite = getSpeciesSprite(lvl, frameIndex);
  if (sprite) {
    const isNight = lvl >= 6;
    // Scaled 2x and centered
    S(ctx, sprite, 122, 105, false, 2, 2, gs.time, isNight);
  }

  // "SANDBOX UNLOCKED!", "NEW FISH!", or "COLLECTED" ribbon below species sprite
  const ribbonText = (currentLevel === 1 && gs.isFirstTimeCompletion) ? 'SANDBOX UNLOCKED!' : (gs.isFirstTimeCompletion ? 'NEW FISH!' : 'COLLECTED');
  const ribW = (currentLevel === 1 && gs.isFirstTimeCompletion) ? 92 : 66;
  const ribH = 12;
  const rx = 122 - Math.floor(ribW / 2);
  const ry = 122;

  ctx.fillStyle = PALETTE.outline;
  ctx.fillRect(rx, ry, ribW, ribH);
  ctx.fillStyle = (currentLevel === 1 && gs.isFirstTimeCompletion) ? PALETTE.gold : (gs.isFirstTimeCompletion ? PALETTE.coral : PALETTE.midnight2);
  ctx.fillRect(rx + 1, ry + 1, ribW - 2, ribH - 2);

  drawFittedText(ctx, ribbonText, rx + 2, ry + 3, {
    w: ribW - 4,
    h: 8,
    maxLines: 1,
    align: 'center',
    valign: 'middle',
    color: (currentLevel === 1 && gs.isFirstTimeCompletion) ? 'outline' : 'cream',
    fonts: ['small'],
  });

  // Name (e.g. "PIP") below ribbon
  const speciesInfo = CONFIG.SPECIES[currentLevel - 1];
  const speciesName = speciesInfo ? speciesInfo.name : 'UNKNOWN';
  drawFittedText(ctx, speciesName, 122, 140, {
    w: 80,
    h: 12,
    maxLines: 1,
    align: 'center',
    valign: 'middle',
    color: 'outline',
  });

  // One-line trait below name
  const traitText = speciesInfo ? t(speciesInfo.traitKey) : '';
  drawFittedText(ctx, traitText, 122, 153, {
    w: 92,
    h: 22,
    maxLines: 2,
    align: 'center',
    valign: 'top',
    color: 'dimBrown',
    fonts: ['small'],
  });

  // Right Column: Sockets & Stats (centered around 242)
  // Three egg pieces sockets at y: 85
  const socketXs = [206, 242, 278];
  for (let s = 0; s < 3; s++) {
    const sx = socketXs[s] - 10;
    const sy = 85;
    const sw = 20;
    const sh = 16;

    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(sx, sy, sw, sh);
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(sx + 1, sy + 1, sw - 2, 1);
    ctx.fillRect(sx + 1, sy + 1, 1, sh - 2);
    ctx.fillStyle = PALETTE.sandShade;
    ctx.fillRect(sx + 1, sy + sh - 2, sw - 2, 1);
    ctx.fillRect(sx + sw - 2, sy + 1, 1, sh - 2);

    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(sx + 2, sy + 2, sw - 4, sh - 4);

    // Gem
    const gem = getGemSprite(s as 0 | 1 | 2, 3);
    ctx.drawImage(gem.normal, sx + Math.floor(sw / 2) - gem.originX, sy + Math.floor(sh / 2) - gem.originY);
  }

  // Row 1: Time icon + Time stats
  const rightColX = 180;
  const rightColW = 120;
  const timeY = 114;
  const finalTime = (levelStats && levelStats.elapsedTime > 0) ? levelStats.elapsedTime : (gs.levelElapsedTime || 0);
  const finalMoney = (levelStats && levelStats.finalMoney > 0) ? levelStats.finalMoney : (gs.money || 0);

  ctx.drawImage(SPRITES.iconTime.normal, rightColX, timeY + 1);
  drawFittedText(ctx, 'TIME:', rightColX + 11, timeY, {
    w: 35,
    h: 12,
    maxLines: 1,
    align: 'left',
    valign: 'middle',
    color: 'diamond',
  });
  drawFittedText(ctx, formatTime(finalTime), rightColX + rightColW - 60, timeY, {
    w: 60,
    h: 12,
    maxLines: 1,
    align: 'right',
    valign: 'middle',
    color: 'diamond',
  });

  // Row 2: Coin icon + Money stats
  const moneyY = 132;
  ctx.drawImage(SPRITES.coinPlaque.normal, rightColX, moneyY + 1);
  drawFittedText(ctx, 'FINAL:', rightColX + 11, moneyY, {
    w: 35,
    h: 12,
    maxLines: 1,
    align: 'left',
    valign: 'middle',
    color: 'gold',
  });
  drawFittedText(ctx, `$${formatNumber(finalMoney, 60)}`, rightColX + rightColW - 60, moneyY, {
    w: 60,
    h: 12,
    maxLines: 1,
    align: 'right',
    valign: 'middle',
    color: 'gold',
  });

  // Bottom Center: Action Button
  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;

  const isFinalLevel = currentLevel >= 10;
  const nextLvlText = isFinalLevel ? t('menu.levelSelect') : `${t('menu.nextLevel')} (${currentLevel + 1})`;
  const lvlCompGroupFont = getGroupFontTier([nextLvlText], { w: 130 - 6, h: 26 - 6, maxLines: 1 });

  drawSharedButton(
    ctx,
    135,
    188,
    130,
    26,
    nextLvlText,
    mx,
    my,
    isMouseDown,
    'outline',
    undefined,
    false,
    0,
    lvlCompGroupFont
  );
}

// ============================================================================
// GAME OVER SCREEN (50% checkerboard dither, 260x160 wooden panel, retry button)
// ============================================================================
function drawGameOverScreen(ctx: CanvasRenderingContext2D, gs: GameState) {
  drawDimCheckerboardOverlay(ctx);
  drawWoodenOverlayPanel(ctx, 'GAME OVER', 'coral');

  drawFittedText(ctx, 'ALL FISH LOST', 100, 102, {
    w: 200,
    h: 16,
    maxLines: 1,
    align: 'center',
    valign: 'middle',
    color: 'coral',
  });
  drawFittedText(ctx, 'YOUR AQUARIUM HAS GROWN TOO QUIET', 80, 122, {
    w: 240,
    h: 16,
    maxLines: 2,
    align: 'center',
    valign: 'middle',
    color: 'cream',
    fonts: ['small'],
  });

  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;

  const gameOverGroupFont = getGroupFontTier(['RETRY LEVEL'], { w: 110 - 6, h: 26 - 6, maxLines: 1 });

  drawSharedButton(ctx, 145, 155, 110, 26, 'RETRY LEVEL', mx, my, isMouseDown, 'outline', undefined, false, 0, gameOverGroupFont);
}

// ============================================================================
// 2PX TACTICAL WEAPON RING & PIXEL HAND CURSOR
// ============================================================================
function renderTacticalWeaponRing(ctx: CanvasRenderingContext2D, mx: number, my: number) {
  // 2px thick pixel ring in cream and gold
  // Outer layer: gold; Inner layer: cream
  const goldPixels: [number, number][] = [
    // Top & Bottom caps
    [-2, -7], [-1, -7], [0, -7], [1, -7], [2, -7],
    [-2, 7], [-1, 7], [0, 7], [1, 7], [2, 7],
    // Outer diagonals
    [-4, -6], [-3, -6], [3, -6], [4, -6],
    [-4, 6], [-3, 6], [3, 6], [4, 6],
    [-6, -4], [-6, -3], [6, -4], [6, -3],
    [-6, 3], [-6, 4], [6, 3], [6, 4],
    [-5, -5], [5, -5], [-5, 5], [5, 5],
    // Left & Right caps outer
    [-7, -2], [-7, -1], [-7, 0], [-7, 1], [-7, 2],
    [7, -2], [7, -1], [7, 0], [7, 1], [7, 2],
  ];

  const creamPixels: [number, number][] = [
    // Top & Bottom inner ring
    [-2, -6], [-1, -6], [0, -6], [1, -6], [2, -6],
    [-2, 6], [-1, 6], [0, 6], [1, 6], [2, 6],
    // Inner diagonals
    [-3, -5], [-2, -5], [2, -5], [3, -5],
    [-3, 5], [-2, 5], [2, 5], [3, 5],
    [-5, -3], [-5, -2], [5, -3], [5, -2],
    [-5, 2], [-5, 3], [5, 2], [5, 3],
    [-4, -4], [4, -4], [-4, 4], [4, 4],
    // Left & Right inner ring
    [-6, -2], [-6, -1], [-6, 0], [-6, 1], [-6, 2],
    [6, -2], [6, -1], [6, 0], [6, 1], [6, 2],
  ];

  ctx.fillStyle = PALETTE.gold;
  for (let i = 0; i < goldPixels.length; i++) {
    ctx.fillRect(mx + goldPixels[i][0], my + goldPixels[i][1], 1, 1);
  }

  ctx.fillStyle = PALETTE.cream;
  for (let i = 0; i < creamPixels.length; i++) {
    ctx.fillRect(mx + creamPixels[i][0], my + creamPixels[i][1], 1, 1);
  }

  // 4 reticle ticks extending outward in cream and gold
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(mx, my - 9, 1, 2);
  ctx.fillRect(mx, my + 8, 1, 2);
  ctx.fillRect(mx - 9, my, 2, 1);
  ctx.fillRect(mx + 8, my, 2, 1);

  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(mx, my, 1, 1); // center dot
}

function drawShopModal(ctx: CanvasRenderingContext2D, gs: GameState) {
  const progress = gs.shop.animTimer || 0;
  if (progress <= 0 && !gs.shop.open) return;

  drawDimCheckerboardOverlay(ctx);

  const easeOut = 1 - Math.pow(1 - progress, 2);
  const mX = 250 + (1 - easeOut) * 150; // slides in from 400 to 250
  const mY = 30;
  const mW = 150;
  const mH = 240;

  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;

  // 1. Wooden drawer background
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(mX, mY, mW, mH);

  // Bevels
  ctx.fillStyle = PALETTE.woodLight;
  ctx.fillRect(mX + 1, mY + 1, mW - 2, 1);
  ctx.fillRect(mX + 1, mY + 1, 1, mH - 2);
  ctx.fillStyle = PALETTE.sandShade;
  ctx.fillRect(mX + 1, mY + mH - 2, mW - 2, 1);
  ctx.fillRect(mX + mW - 2, mY + 1, 1, mH - 2);

  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(mX + 2, mY + 2, mW - 4, mH - 4);

  // Carved inner borders
  ctx.strokeStyle = PALETTE.woodDark;
  ctx.lineWidth = 1;
  ctx.strokeRect(mX + 3.5, mY + 3.5, mW - 7, mH - 7);

  // 2. 20px (40px) 'SHOP' Ribbon Header banner with tails
  const ribH = 20;
  const banX = mX - 4;
  const banY = mY + 2;
  const banW = mW + 8;

  // Left banner tail
  ctx.fillStyle = PALETTE.woodDark;
  ctx.beginPath();
  ctx.moveTo(banX, banY);
  ctx.lineTo(banX + 6, banY + ribH / 2);
  ctx.lineTo(banX, banY + ribH);
  ctx.lineTo(banX + 8, banY + ribH);
  ctx.lineTo(banX + 8, banY);
  ctx.closePath();
  ctx.fill();

  // Right banner tail
  ctx.beginPath();
  ctx.moveTo(banX + banW, banY);
  ctx.lineTo(banX + banW - 6, banY + ribH / 2);
  ctx.lineTo(banX + banW, banY + ribH);
  ctx.lineTo(banX + banW - 8, banY + ribH);
  ctx.lineTo(banX + banW - 8, banY);
  ctx.closePath();
  ctx.fill();

  // Main banner block
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(banX + 6, banY, banW - 12, ribH);

  // Inner banner gold/brass fill
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(banX + 8, banY + 1, banW - 16, ribH - 2);

  // Top highlight on the banner
  ctx.fillStyle = PALETTE.gold1;
  ctx.fillRect(banX + 8, banY + 1, banW - 16, 1);

  drawFittedText(ctx, 'SHOP', mX + 50, mY + 4, {
    w: 40,
    h: 12,
    maxLines: 1,
    align: 'center',
    valign: 'middle',
    color: 'outline',
  });

  const coinIcon = SPRITES.coinSilver;
  if (coinIcon && coinIcon.normal) {
    ctx.drawImage(coinIcon.normal, mX + 6, mY + 6);
  }
  drawFittedText(ctx, `$${formatNumber(gs.money, 50)}`, mX + 18, mY + 4, {
    w: 50,
    h: 12,
    maxLines: 1,
    align: 'left',
    valign: 'middle',
    color: 'outline',
  });

  // 3. 12x12 (24x24) pixel-X close button at header's top-right
  const cBtnW = 12;
  const cBtnH = 12;
  const cBtnX = mX + mW - cBtnW - 4;
  const cBtnY = mY + 4;
  const isCloseHovered = mx >= cBtnX && mx < cBtnX + cBtnW && my >= cBtnY && my < cBtnY + cBtnH;
  const isClosePressed = isCloseHovered && isMouseDown;

  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(cBtnX, cBtnY, cBtnW, cBtnH);
  ctx.fillStyle = isClosePressed ? PALETTE.sandShade : PALETTE.cream;
  ctx.fillRect(cBtnX + 1, cBtnY + 1, cBtnW - 2, cBtnH - 2);
  drawFittedText(ctx, 'X', cBtnX + 2, cBtnY + 2, {
    w: 8,
    h: 8,
    maxLines: 1,
    align: 'center',
    valign: 'middle',
    color: 'outline',
  });

  // 4. Tabs below header (Pets, Upgrades, Decor)
  const tabY = mY + ribH + 3;
  const tabH = 15;
  let categories: { id: ShopCategory; label: string }[] = [
    { id: 'pets', label: 'Pets' },
    { id: 'upgrades', label: 'Upgrades' },
    { id: 'themes', label: 'Themes' },
  ];
  if (gs.isTutorial) {
    categories = [
      { id: 'pets', label: 'Pets' },
      { id: 'upgrades', label: 'Upgrades' },
    ];
  }

  const totalTabW = categories.length * 44;
  const tabStartX = mX + Math.floor((mW - totalTabW) / 2);
  const selCat = gs.shop.selectedCategory || 'pets';

  // Group font calculation for tab labels (budget 44x15 with 2px padding -> w: 40, h: 11)
  const tabGroupFont = getGroupFontTier(categories.map(c => c.label), { w: 40, h: 11, maxLines: 1 });

  for (let t = 0; t < categories.length; t++) {
    const tab = categories[t];
    const isSelected = tab.id === selCat;
    const tX = tabStartX + t * 44;
    const tY = isSelected ? tabY - 1 : tabY;
    const tW = 44;
    const tHt = isSelected ? tabH + 1 : tabH;

    const isTabHovered = mx >= tX && mx < tX + tW && my >= tY && my < tY + tHt;

    // Rope loop above the tab tag
    ctx.fillStyle = PALETTE.woodDark; // Dark outline
    ctx.fillRect(tX + 18, tY - 3, 8, 3);
    ctx.fillStyle = PALETTE.gold2; // Light rope color
    ctx.fillRect(tX + 19, tY - 2, 6, 2);
    ctx.fillStyle = PALETTE.outline; // Cut inside the loop
    ctx.fillRect(tX + 21, tY - 2, 2, 2);

    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(tX, tY, tW, tHt);

    ctx.fillStyle = isSelected ? PALETTE.cream : (isTabHovered ? PALETTE.white : PALETTE.wood);
    ctx.fillRect(tX + 1, tY + 1, tW - 2, tHt - 2);

    drawFittedText(ctx, tab.label, tX + 2, tY + 2, {
      w: 40,
      h: 11,
      maxLines: 1,
      align: 'center',
      valign: 'middle',
      color: isSelected ? 'outline' : 'dimBrown',
      fonts: [tabGroupFont],
    });
  }

  // 5. BUY Button at bottom of modal
  const buyW = mW - 20;
  const buyH = 20;
  const buyX = mX + 10;
  const buyY = mY + mH - buyH - 5;

  // 6. Content Area (cards in 2-column grid, each 67x50 with 5px gap)
  const contentX = mX + 5;
  const contentY = mY + ribH + tabH + 5;
  const contentW = mW - 10;
  const contentH = buyY - contentY - 4;

  ctx.save();
  ctx.beginPath();
  ctx.rect(contentX, contentY, contentW, contentH);
  ctx.clip();

  // Background for content area
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(contentX, contentY, contentW, contentH);
  ctx.fillStyle = PALETTE.woodLight;
  ctx.fillRect(contentX + 1, contentY + 1, contentW - 2, contentH - 2);
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(contentX + 2, contentY + 2, contentW - 4, contentH - 4);

  let items = CONFIG.SHOP_ITEMS.filter((it) => it.category === selCat);
  if (gs.isTutorial) {
    items = items.filter(it => it.id === 'buyFish' || it.id === 'foodLimit');
  } else {
    items = items.filter(it => isPetUnlocked(it.id, gs.completedLevels || saveState.completed));
  }
  const scrollOffset = gs.shop.scrollOffset || 0;

  // Render 3-slot Egg progress row at top of Egg tab
  const eggRowH = selCat === 'eggs' ? 16 : 0;
  if (selCat === 'eggs') {
    const progY = contentY + 3;
    drawFittedText(ctx, `EGG SLOTS: ${gs.stats.eggPieces}/3`, contentX + 6, progY + 2, {
      w: 80,
      h: 10,
      maxLines: 1,
      align: 'left',
      valign: 'middle',
      color: 'woodDark',
      fonts: ['small'],
    });
    for (let s = 0; s < 3; s++) {
      const slotX = contentX + 86 + s * 16;
      const slotY = progY + 2;
      ctx.fillStyle = PALETTE.woodDark;
      ctx.fillRect(slotX, slotY, 14, 10);
      ctx.fillStyle = s < gs.stats.eggPieces ? PALETTE.gold : PALETTE.cream;
      ctx.fillRect(slotX + 1, slotY + 1, 12, 8);
      if (s < gs.stats.eggPieces && SPRITES.egg?.normal) {
        ctx.drawImage(SPRITES.egg.normal, slotX + 1, slotY + 1);
      }
    }
  }

  const SHOP_TOOLTIPS: Record<string, string> = {
    buyFish: 'Spawns another guppy in the tank',
    carnivore: 'Upgrades carnivore level & speed',
    snail: 'Spawns a stinky coin-collecting snail',
    foodLimit: 'Increases max pellets on screen',
    foodQuality: 'Upgrades pellet nutrition tier',
    weapon: 'Upgrades click laser power and damage',
    eggPiece1: 'First mystery egg fragment',
    eggPiece2: 'Second mystery egg fragment',
    eggPiece3: 'Final piece to hatch the cosmic egg',
    themeFrutigerAero: 'Bright, energetic, bubbly tech-inspired theme',
  };

  let hoveredTooltip: { text: string; x: number; y: number } | null = null;

  // Group font for card names in this tab (budget 45x16, max 2 lines)
  const cardNameGroupFont = getGroupFontTier(items.map(it => it.name), { w: 45, h: 16, maxLines: 2 });

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const col = i % 2;
    const row = Math.floor(i / 2);

    const cardW = 67;
    const cardH = 50;
    const baseCardX = contentX + 3 + col * (cardW + 5);
    const baseCardY = contentY + 3 + eggRowH + row * (cardH + 5) - (scrollOffset / 2);

    if (baseCardY + cardH < contentY || baseCardY > contentY + contentH) continue;

    const isPressed = (gs.shop.cardPressTimers?.[item.id] || 0) > 0;
    const isFlashing = (gs.shop.cardFlashTimers?.[item.id] || 0) > 0;
    const isShaking = (gs.shop.cardShakeTimers?.[item.id] || 0) > 0;
    const isCardHovered = mx >= baseCardX && mx < baseCardX + cardW && my >= baseCardY && my < baseCardY + cardH;

    const shakeX = isShaking ? Math.floor((Math.random() - 0.5) * 4) : 0;
    const pressY = isPressed ? 1 : (isCardHovered ? -1 : 0);

    const cardX = baseCardX + shakeX;
    const cardY = baseCardY + pressY;

    // Evaluate live counts & state dynamically every frame!
    const currentLvl = gs.shop.levels[item.id] || 0;
    const isMax = item.maxLevel !== null && currentLvl >= item.maxLevel;

    let isCapped = false;
    let petLiveCount = 0;
    let petMaxCount = 0;

    if (item.id === 'buyFish') {
      petLiveCount = gs.fish.filter((f) => !f.isCarnivore && !f.dead).length;
      petMaxCount = 15;
      if (petLiveCount >= petMaxCount) isCapped = true;
    } else if (item.id === 'carnivore') {
      petLiveCount = gs.fish.filter((f) => f.isCarnivore && !f.dead).length;
      petMaxCount = 2;
      if (petLiveCount >= petMaxCount) isCapped = true;
    } else if (item.id === 'snail') {
      petLiveCount = gs.snails.filter((s) => !s.dead).length;
      petMaxCount = 1;
      if (petLiveCount >= petMaxCount) isCapped = true;
    }

    let isLocked = false;
    let reqItemName = '';
    if (item.requires) {
      const reqLvl = gs.shop.levels[item.requires.id] || 0;
      if (reqLvl < item.requires.level) {
        isLocked = true;
        const reqObj = CONFIG.SHOP_ITEMS.find((it) => it.id === item.requires?.id);
        reqItemName = reqObj ? reqObj.name : 'ITEM';
      }
    }

    const priceIndex = Math.min(currentLvl, item.prices ? item.prices.length - 1 : 0);
    const price = item.prices ? item.prices[priceIndex] : 0;
    const isAffordable = gs.money >= price && !isMax && !isLocked && !isCapped;

    let faceCol: string = PALETTE.cream;
    if (isFlashing) faceCol = PALETTE.cream;
    else if (isCardHovered) faceCol = PALETTE.white;
    else if ((!isAffordable || isCapped) && !isLocked && !isMax) faceCol = PALETTE.sand;
    else if (isLocked) faceCol = PALETTE.sandShade;

    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.fillStyle = faceCol;
    ctx.fillRect(cardX + 1, cardY + 1, cardW - 2, cardH - 2);

    let icon = SPRITES.iconShop;
    if (item.id === 'buyFish') icon = SPRITES.fish0;
    else if (item.id === 'carnivore') icon = SPRITES.iconCarnivore;
    else if (item.id === 'snail') icon = SPRITES.iconSnail;
    else if (item.id === 'foodLimit' || item.id === 'foodQuality') icon = SPRITES.pellet;
    else if (item.id === 'weapon') icon = SPRITES.iconWeapon;
    else if (item.id.startsWith('eggPiece')) icon = SPRITES.egg;
    else if (item.category === 'themes') icon = SPRITES.iconShop;

    if (icon && (icon as BakedSprite).normal) {
      ctx.drawImage((icon as BakedSprite).normal, cardX + 2, cardY + 2);
    }

    // Name slot at x=20 of 45x16 (2 lines max)
    drawFittedText(ctx, item.name, cardX + 20, cardY + 2, {
      w: 45,
      h: 16,
      maxLines: 2,
      align: 'left',
      valign: 'top',
      color: isLocked ? 'dimBrown' : 'outline',
      fonts: [cardNameGroupFont],
    });

    // Description slot at y=20 of 63x14 (2 lines of small font)
    let descText = item.desc;
    if (item.category === 'upgrades') {
      let nowVal: string | number = '';
      let nextVal: string | number = '';
      if (item.id === 'foodLimit') {
        nowVal = gs.stats.foodLimit;
        nextVal = currentLvl >= 4 ? 'MAX' : gs.stats.foodLimit + 1;
      } else if (item.id === 'foodQuality') {
        nowVal = gs.stats.foodQualityTier + 1;
        nextVal = currentLvl >= 2 ? 'MAX' : gs.stats.foodQualityTier + 2;
      } else if (item.id === 'weapon') {
        nowVal = gs.stats.clickDamage;
        nextVal = currentLvl === 0 ? 2 : currentLvl === 1 ? 4 : 'MAX';
      }
      descText = `NOW ${nowVal} > NEXT ${nextVal}`;
    } else if (item.category === 'pets') {
      descText = `LIVE ${petLiveCount}/${petMaxCount}`;
    } else if (item.category === 'themes') {
      const isOwned = saveState.themes.owned.includes(item.id);
      const isActive = saveState.themes.active === item.id;
      descText = isActive ? 'ACTIVE THEME' : (isOwned ? 'OWNED' : 'UNOWNED');
    }

    drawFittedText(ctx, descText, cardX + 2, cardY + 20, {
      w: 63,
      h: 14,
      maxLines: 2,
      align: 'left',
      valign: 'top',
      color: 'dimBrown',
      fonts: ['small'],
    });

    // Price row at y=36 with coin + price on left and level indicators/pips or n/15 on right
    if (item.category === 'themes' && saveState.themes.owned.includes(item.id)) {
      const isActive = saveState.themes.active === item.id;
      ctx.fillStyle = isActive ? PALETTE.glow : PALETTE.woodDark;
      ctx.fillRect(cardX + 2, cardY + 36, 63, 11);
      drawFittedText(ctx, isActive ? 'ACTIVE' : 'USE THEME', cardX + 2, cardY + 36, {
        w: 63,
        h: 11,
        maxLines: 1,
        align: 'center',
        valign: 'middle',
        color: isActive ? 'outline' : 'cream',
      });
    } else if (isMax) {
      ctx.fillStyle = PALETTE.glow;
      ctx.fillRect(cardX + 2, cardY + 36, 32, 11);
      drawFittedText(ctx, 'MAX', cardX + 2, cardY + 36, {
        w: 32,
        h: 11,
        maxLines: 1,
        align: 'center',
        valign: 'middle',
        color: 'outline',
      });
    } else if (isCapped) {
      ctx.fillStyle = PALETTE.woodDark;
      ctx.fillRect(cardX + 2, cardY + 36, 32, 11);
      drawFittedText(ctx, 'CAPPED', cardX + 2, cardY + 36, {
        w: 32,
        h: 11,
        maxLines: 1,
        align: 'center',
        valign: 'middle',
        color: 'cream',
      });
    } else if (isLocked) {
      ctx.fillStyle = PALETTE.woodDark;
      ctx.fillRect(cardX + 2, cardY + 36, 63, 11);
      drawFittedText(ctx, `NEEDS ${reqItemName}`, cardX + 2, cardY + 36, {
        w: 63,
        h: 11,
        maxLines: 1,
        align: 'left',
        valign: 'middle',
        color: 'cream',
      });
    } else {
      const coinIcon = SPRITES.coinSilver;
      if (coinIcon && coinIcon.normal) {
        ctx.drawImage(coinIcon.normal, cardX + 2, cardY + 36);
      }
      const isFree = game.mode === 'sandbox' && game.sandbox.freeShop;
      const priceText = isFree ? t('shop.free') : `$${formatNumber(price, 24)}`;
      const priceColor = isFree ? 'cream' : (isAffordable ? 'outline' : 'coral');
      drawFittedText(ctx, priceText, cardX + 11, cardY + 36, {
        w: 24,
        h: 11,
        maxLines: 1,
        align: 'left',
        valign: 'middle',
        color: priceColor,
      });
    }

    // Right-side indicators at y=36
    if (item.category === 'pets') {
      drawFittedText(ctx, `${petLiveCount}/${petMaxCount}`, cardX + 36, cardY + 36, {
        w: 29,
        h: 11,
        maxLines: 1,
        align: 'right',
        valign: 'middle',
        color: 'dimBrown',
        fonts: ['small'],
      });
    } else if (item.maxLevel !== null && item.maxLevel <= 4) {
      const pipStartX = cardX + 41;
      const pipY = cardY + 39;
      for (let p = 0; p < item.maxLevel; p++) {
        const px = pipStartX + p * 6;
        ctx.fillStyle = PALETTE.woodDark;
        ctx.fillRect(px, pipY, 4, 4);
        ctx.fillStyle = p < currentLvl ? PALETTE.gold : PALETTE.cream;
        ctx.fillRect(px + 1, pipY + 1, 2, 2);
      }
    }

    const isSelected = gs.shop.selectedItemId === item.id;
    if (isSelected) {
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(cardX - 1, cardY - 1, cardW + 2, 2);
      ctx.fillRect(cardX - 1, cardY + cardH - 1, cardW + 2, 2);
      ctx.fillRect(cardX - 1, cardY - 1, 2, cardH + 2);
      ctx.fillRect(cardX + cardW - 1, cardY - 1, 2, cardH + 2);
    }
    shopLog('render', { id: item.id, state: { currentLvl, isAffordable, isMax, isCapped, isLocked, isSelected } });

    // Tooltip checking (if hovered)
    if (isCardHovered) {
      hoveredTooltip = {
        text: SHOP_TOOLTIPS[item.id] || item.desc,
        x: Math.max(mX + 2, Math.min(mX + mW - 82, cardX)),
        y: cardY > contentY + 30 ? cardY - 32 : cardY + cardH + 4,
      };
    }
  }

  ctx.restore(); // Restore content area clip

  // 7. Render BUY Button at bottom of modal
  const selItemId = gs.shop.selectedItemId;
  const selItem = selItemId ? CONFIG.SHOP_ITEMS.find(it => it.id === selItemId) : null;
  const selItemLvl = selItem ? (gs.shop.levels[selItem.id] || 0) : 0;
  const selPrice = selItem ? selItem.prices[Math.min(selItemLvl, selItem.prices.length - 1)] : 0;
  const isFreeShop = game.mode === 'sandbox' && game.sandbox.freeShop;
  const selPriceText = isFreeShop ? t('shop.free') : `$${selPrice}`;

  let buyLabel = 'SELECT AN ITEM';
  let buyBg: string = PALETTE.sand;
  let buyTextColor: 'outline' | 'cream' | 'coral' | 'glow' = 'outline';

  if (selItem) {
    const isSelMax = selItem.maxLevel !== null && selItemLvl >= selItem.maxLevel;
    let isSelCapped = false;
    if (selItem.id === 'buyFish') {
      const live = gs.fish.filter(f => !f.isCarnivore && !f.dead).length;
      if (live >= 15) isSelCapped = true;
    } else if (selItem.id === 'carnivore') {
      const live = gs.fish.filter(f => f.isCarnivore && !f.dead).length;
      if (live >= 2) isSelCapped = true;
    } else if (selItem.id === 'snail') {
      const live = gs.snails.filter(s => !s.dead).length;
      if (live >= 1) isSelCapped = true;
    }

    let isSelLocked = false;
    if (selItem.requires) {
      const reqLvl = gs.shop.levels[selItem.requires.id] || 0;
      if (reqLvl < selItem.requires.level) isSelLocked = true;
    }

    if (selItem.category === 'themes' && saveState.themes.owned.includes(selItem.id)) {
      const isActive = saveState.themes.active === selItem.id;
      buyLabel = isActive ? 'ACTIVE THEME' : `USE ${selItem.name.toUpperCase()}`;
      buyBg = isActive ? PALETTE.glow : PALETTE.gold;
    } else if (isSelMax) {
      buyLabel = 'MAX LEVEL REACHED';
      buyBg = PALETTE.glow;
    } else if (isSelCapped) {
      buyLabel = 'MAX POPULATION REACHED';
      buyBg = PALETTE.sandShade;
    } else if (isSelLocked) {
      buyLabel = 'LOCKED (NEEDS UPGRADE)';
      buyBg = PALETTE.woodDark;
      buyTextColor = 'cream';
    } else if (gs.money < selPrice && !isFreeShop) {
      buyLabel = `BUY ${selItem.name.toUpperCase()} (${selPriceText})`;
      buyBg = PALETTE.sand;
      buyTextColor = 'coral';
    } else {
      buyLabel = `BUY ${selItem.name.toUpperCase()} (${selPriceText})`;
      buyBg = PALETTE.gold;
      buyTextColor = 'outline';
    }
  }

  const isBuyHovered = mx >= buyX && mx < buyX + buyW && my >= buyY && my < buyY + buyH;
  const isBuyPressed = isBuyHovered && isMouseDown;

  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(buyX, buyY, buyW, buyH);
  ctx.fillStyle = isBuyPressed ? PALETTE.sandShade : (isBuyHovered ? PALETTE.white : buyBg);
  ctx.fillRect(buyX + 1, buyY + 1, buyW - 2, buyH - 2);

  drawFittedText(ctx, buyLabel, buyX + 2, buyY + 3, {
    w: buyW - 4,
    h: buyH - 6,
    maxLines: 1,
    align: 'center',
    valign: 'middle',
    color: buyTextColor,
  });

  // Draw Tooltip (up to 80 art px wide, grow to fit up to 5 lines of small font, 3px padding)
  if (hoveredTooltip) {
    const textContentWidth = 74; // 80 - 6px padding
    const fitted = fitText(hoveredTooltip.text, {
      w: textContentWidth,
      h: 30, // up to 5 lines of small font (5 * 6)
      maxLines: 5,
      fonts: ['small'],
    });

    const tw = Math.min(80, Math.max(20, fitted.width + 6));
    const th = fitted.height + 6;
    const tx = Math.max(mX + 2, Math.min(mX + mW - tw - 2, hoveredTooltip.x));
    const ty = Math.max(mY + 2, Math.min(mY + mH - th - 2, hoveredTooltip.y));

    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(tx, ty, tw, th);
    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(tx + 1, ty + 1, tw - 2, th - 2);

    for (let l = 0; l < fitted.lines.length; l++) {
      drawFittedText(ctx, fitted.lines[l], tx + 3, ty + 3 + l * 6, {
        w: tw - 6,
        h: 6,
        maxLines: 1,
        color: 'outline',
        fonts: ['small'],
      });
    }
  }

}

function renderPixelCursor(_ctx: CanvasRenderingContext2D, _gs: GameState) {
  // Custom cursor removed; native OS/Windows cursor is used
}



function renderAudioPanel(ctx: CanvasRenderingContext2D, gs: GameState) {
  if (!gs.audioPanel.open) return;
  // Wooden panel: 260x110 art px (scaled? or logical?)
  // Let's assume logical coordinates:
  const pX = 270;
  const pY = 245;
  const pW = 260;
  const pH = 110;
  ctx.fillStyle = '#854d0e'; // Placeholder wooden color
  ctx.fillRect(pX, pY, pW, pH);
  ctx.strokeStyle = '#451a03';
  ctx.strokeRect(pX, pY, pW, pH);
  
  // MUSIC Slider
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(pX + 120, pY + 20, 100, 8);
  const musicX = pX + 120 + (game.audio.music * 100) - 3;
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(musicX, pY + 18, 6, 12);
  
  // SFX Slider
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(pX + 120, pY + 50, 100, 8);
  const sfxX = pX + 120 + (game.audio.sfx * 100) - 3;
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(sfxX, pY + 48, 6, 12);
  
  // Mute button
  ctx.fillStyle = game.audio.muted ? '#ef4444' : '#22c55e';
  ctx.fillRect(pX + 20, pY + 70, 16, 16);
}

let checkerboardPattern: CanvasPattern | null = null;
function getCheckerboardPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  if (!checkerboardPattern && typeof document !== 'undefined') {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 4;
    pCanvas.height = 4;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      pCtx.fillRect(0, 0, 1, 1);
      pCtx.fillRect(2, 0, 1, 1);
      pCtx.fillRect(1, 1, 1, 1);
      pCtx.fillRect(3, 1, 1, 1);
      pCtx.fillRect(0, 2, 1, 1);
      pCtx.fillRect(2, 3, 1, 1);
      checkerboardPattern = ctx.createPattern(pCanvas, 'repeat');
    }
  }
  return checkerboardPattern;
}

function rectsOverlap(
  r1: { x: number; y: number; w: number; h: number },
  r2: { x: number; y: number; w: number; h: number },
  pad: number = 2
): boolean {
  return !(
    r1.x + r1.w < r2.x - pad ||
    r1.x > r2.x + r2.w + pad ||
    r1.y + r1.h < r2.y - pad ||
    r1.y > r2.y + r2.h + pad
  );
}

function drawBouncingArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: 'down' | 'up' = 'down'
) {
  ctx.save();
  ctx.fillStyle = PALETTE.gold;
  ctx.strokeStyle = PALETTE.woodDark;
  ctx.lineWidth = 1;
  const ix = Math.floor(x);
  const iy = Math.floor(y);

  if (dir === 'down') {
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(ix - 5, iy - 6);
    ctx.lineTo(ix - 2, iy - 6);
    ctx.lineTo(ix - 2, iy - 11);
    ctx.lineTo(ix + 2, iy - 11);
    ctx.lineTo(ix + 2, iy - 6);
    ctx.lineTo(ix + 5, iy - 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(ix - 5, iy + 6);
    ctx.lineTo(ix - 2, iy + 6);
    ctx.lineTo(ix - 2, iy + 11);
    ctx.lineTo(ix + 2, iy + 11);
    ctx.lineTo(ix + 2, iy + 6);
    ctx.lineTo(ix + 5, iy + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawShellyPortrait(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  isBlinking: boolean,
  mouthOpen: boolean
) {
  // 22x22 portrait frame
  ctx.fillStyle = '#070d18';
  ctx.fillRect(px, py, 22, 22);

  // Seashell (curved spiral covering top-left and back)
  ctx.fillStyle = '#92400e';
  ctx.fillRect(px + 2, py + 2, 11, 10);
  ctx.fillRect(px + 1, py + 4, 13, 8);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(px + 3, py + 3, 9, 8);
  ctx.fillRect(px + 2, py + 5, 11, 6);
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(px + 4, py + 4, 3, 2);
  ctx.fillRect(px + 8, py + 5, 4, 2);
  ctx.fillRect(px + 3, py + 7, 3, 1);

  // Crab head & face peeking forward
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(px + 7, py + 8, 12, 10);
  ctx.fillRect(px + 8, py + 7, 10, 12);
  ctx.fillStyle = '#c2410c';
  ctx.fillRect(px + 7, py + 16, 12, 2);

  // Eyestalks
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(px + 9, py + 4, 2, 4);
  ctx.fillRect(px + 15, py + 4, 2, 4);

  // Eyes (blinks every 3s)
  if (isBlinking) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(px + 8, py + 4, 4, 1);
    ctx.fillRect(px + 14, py + 4, 4, 1);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 8, py + 2, 4, 4);
    ctx.fillRect(px + 14, py + 2, 4, 4);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px + 10, py + 3, 2, 2);
    ctx.fillRect(px + 14, py + 3, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 9, py + 3, 1, 1);
    ctx.fillRect(px + 15, py + 3, 1, 1);
  }

  // Mouth (moves at 4fps while typing)
  if (mouthOpen) {
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(px + 12, py + 13, 3, 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(px + 13, py + 14, 1, 1);
  } else {
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(px + 11, py + 13, 1, 1);
    ctx.fillRect(px + 12, py + 14, 2, 1);
    ctx.fillRect(px + 14, py + 13, 1, 1);
  }

  // Claws
  ctx.fillStyle = '#f97316';
  ctx.fillRect(px + 5, py + 13, 3, 3);
  ctx.fillRect(px + 17, py + 13, 3, 3);
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(px + 5, py + 12, 2, 1);
  ctx.fillRect(px + 18, py + 12, 2, 1);

  // Ribbon banner: "SHELLY"
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(px - 1, py + 17, 24, 6);
  ctx.fillStyle = '#fbbf24';
  ctx.strokeRect(px - 0.5, py + 17.5, 23, 5);
  drawFittedText(ctx, 'SHELLY', px - 1, py + 18, {
    w: 24,
    h: 5,
    maxLines: 1,
    align: 'center',
    valign: 'middle',
    color: 'cream',
    fonts: ['small'],
  });
}

function renderTutorialOverlay(ctx: CanvasRenderingContext2D, gs: GameState) {
  const stepIndex = gs.tutorialStep - 1;
  const stepList = gs.tutorialType === 'sandbox' ? ((CONFIG as any).SANDBOX_TUTORIAL || CONFIG.TUTORIAL) : CONFIG.TUTORIAL;
  const step = stepList ? stepList[stepIndex] : null;
  if (!step) return;

  // 1. Resolve highlight target in 400x300 UI px
  let hlType: 'ui' | 'water' | 'coin' | 'alien' | null = null;
  let hlRect: { x: number; y: number; w: number; h: number } | null = null;
  let tapZoneRect: { x: number; y: number; w: number; h: number } | null = null;

  if (step.highlight === 'ui:gear' || (!gs.mods?.open && step.highlight === 'ui:mods')) {
    hlType = 'ui';
    hlRect = { x: 346, y: 4, w: 22, h: 22 };
    tapZoneRect = hlRect;
  } else if (step.highlight === 'ui:mods') {
    hlType = 'ui';
    const mX = gs.mods?.open ? 250 : 400;
    hlRect = { x: mX, y: 30, w: 150, h: 240 };
    tapZoneRect = hlRect;
  } else if (step.highlight === 'ui:shop' || (!gs.shop?.open && (step.id === 'buyFish' || step.id === 'foodLimit'))) {
    hlType = 'ui';
    hlRect = { x: 57, y: 4, w: 40, h: 22 };
    tapZoneRect = hlRect;
  } else if (step.highlight === 'ui:close') {
    if (gs.shop?.open) {
      hlType = 'ui';
      const mX = 250;
      hlRect = { x: mX + 128, y: 32, w: 18, h: 16 };
      tapZoneRect = hlRect;
    } else {
      hlType = 'water';
      hlRect = { x: 8, y: 32, w: 384, h: 236 };
    }
  } else if (step.highlight === 'ui:row:buyFish') {
    hlType = 'ui';
    const mX = gs.shop?.open ? 250 : 400;
    if (!gs.shop?.open) {
      hlRect = { x: 57, y: 4, w: 40, h: 22 };
    } else if (gs.shop?.selectedCategory !== 'pets') {
      hlRect = { x: mX + 31, y: 53, w: 44, h: 15 };
    } else if (gs.shop?.selectedItemId !== 'buyFish') {
      hlRect = { x: mX + 8, y: 73, w: 67, h: 50 };
    } else {
      hlRect = { x: mX + 10, y: 245, w: 130, h: 20 };
    }
    tapZoneRect = hlRect;
  } else if (step.highlight === 'ui:row:foodLimit') {
    hlType = 'ui';
    const mX = gs.shop?.open ? 250 : 400;
    if (!gs.shop?.open) {
      hlRect = { x: 57, y: 4, w: 40, h: 22 };
    } else if (gs.shop?.selectedCategory !== 'upgrades') {
      hlRect = { x: mX + 75, y: 53, w: 44, h: 15 };
    } else if (gs.shop?.selectedItemId !== 'foodLimit') {
      hlRect = { x: mX + 8, y: 73, w: 67, h: 50 };
    } else {
      hlRect = { x: mX + 10, y: 245, w: 130, h: 20 };
    }
    tapZoneRect = hlRect;
  } else if (step.highlight === 'ui:egg') {
    hlType = 'ui';
    hlRect = { x: 101, y: 4, w: 174, h: 22 };
    tapZoneRect = hlRect;
  } else if (step.highlight === 'tank:water' || step.highlight === 'water') {
    hlType = 'water';
    hlRect = { x: 8, y: 32, w: 384, h: 236 };
  } else if (step.highlight === 'coin:tut' || step.highlight === 'coins') {
    hlType = 'coin';
  } else if (step.highlight === 'alien:tut' || step.highlight === 'alien') {
    const alienAlive = gs.aliens.some(a => a.tut && !a.dead);
    if (alienAlive) {
      hlType = 'alien';
    } else {
      hlType = 'coin';
    }
  }

  // 2. Draw Highlights
  if (hlType === 'ui' && hlRect) {
    const pattern = getCheckerboardPattern(ctx);
    ctx.save();
    ctx.fillStyle = pattern || 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.rect(0, 0, 400, 300);
    ctx.rect(hlRect.x, hlRect.y, hlRect.w, hlRect.h);
    ctx.fill('evenodd');
    ctx.restore();

    const pulse = Math.sin(gs.time * 6) * 0.5 + 0.5;
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 1;
    ctx.strokeRect(hlRect.x - 1, hlRect.y - 1, hlRect.w + 2, hlRect.h + 2);

    const bounce = Math.abs(Math.sin(gs.time * 7)) * 4;
    if (hlRect.y > 60) {
      drawBouncingArrow(ctx, hlRect.x + hlRect.w / 2, hlRect.y - 8 - bounce, 'down');
    } else {
      drawBouncingArrow(ctx, hlRect.x + hlRect.w / 2, hlRect.y + hlRect.h + 8 + bounce, 'up');
    }
  } else if (hlType === 'water') {
    ctx.save();
    const pulse = Math.sin(gs.time * 4) * 0.5 + 0.5;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -gs.time * 10;
    ctx.strokeRect(8, 32, 384, 236);
    ctx.restore();

    const hx = 200;
    const hy = 135 + Math.sin(gs.time * 5) * 4;
    const rip = (gs.time * 2) % 1;
    ctx.strokeStyle = `rgba(56, 189, 248, ${1 - rip})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(hx, hy + 8, rip * 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.drawImage(SPRITES.handCursor.normal, hx - 4, hy - 4);
  } else if (hlType === 'coin') {
    const coin = gs.coins.find(c => c.tut && !c.collected && !c.dead) || gs.coins.find(c => !c.collected && !c.dead);
    if (coin) {
      const cx = Math.floor(coin.x / 2);
      const cy = Math.floor(coin.y / 2);
      const bounce = Math.abs(Math.sin(gs.time * 7)) * 4;
      drawBouncingArrow(ctx, cx, cy - 14 - bounce, 'down');
    }
  } else if (hlType === 'alien') {
    const alien = gs.aliens.find(a => a.tut && !a.dead) || gs.aliens.find(a => !a.dead);
    if (alien) {
      const ax = Math.floor(alien.x / 2);
      const ay = Math.floor(alien.y / 2);
      const bounce = Math.abs(Math.sin(gs.time * 7)) * 4;
      drawBouncingArrow(ctx, ax, ay - 24 - bounce, 'down');
    }
  }

  // 3. Four Tank Anchors:
  const anchors = [
    { x: 10, y: 34, w: 156, h: 58 },
    { x: 234, y: 34, w: 156, h: 58 },
    { x: 10, y: 206, w: 156, h: 58 },
    { x: 234, y: 206, w: 156, h: 58 },
  ];

  let chosenAnchor = anchors[0];
  for (const anchor of anchors) {
    let hasOverlap = false;

    if (hlType === 'ui' && hlRect && rectsOverlap(anchor, hlRect, 4)) {
      hasOverlap = true;
    }

    if (gs.shop?.open && anchor.x >= 200) {
      hasOverlap = true;
    }

    for (const c of gs.coins) {
      if (!c.collected && !c.dead) {
        const cr = { x: c.x / 2 - 8, y: c.y / 2 - 8, w: 16, h: 16 };
        if (rectsOverlap(anchor, cr, 6)) {
          hasOverlap = true;
          break;
        }
      }
    }

    if (!hasOverlap) {
      for (const a of gs.aliens) {
        if (!a.dead) {
          const ar = { x: a.x / 2 - 20, y: a.y / 2 - 20, w: 40, h: 40 };
          if (rectsOverlap(anchor, ar, 6)) {
            hasOverlap = true;
            break;
          }
        }
      }
    }

    if (!hasOverlap) {
      for (const p of gs.food) {
        if (!p.dead) {
          const pr = { x: p.x / 2 - 4, y: p.y / 2 - 4, w: 8, h: 8 };
          if (rectsOverlap(anchor, pr, 4)) {
            hasOverlap = true;
            break;
          }
        }
      }
    }

    if (!hasOverlap && tapZoneRect && rectsOverlap(anchor, tapZoneRect, 4)) {
      hasOverlap = true;
    }

    if (!hasOverlap) {
      chosenAnchor = anchor;
      break;
    }
  }

  // Update boxRect on GameState so click detection knows exact logical coords
  if (gs.tutorialDialogue) {
    gs.tutorialDialogue.boxRect = chosenAnchor;
  }

  // 4. Render Dialogue Box (156x58 UI px panel)
  const bx = chosenAnchor.x;
  const by = chosenAnchor.y;
  const bw = chosenAnchor.w;
  const bh = chosenAnchor.h;

  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(bx + 1, by + 1, bw - 2, 1);
  ctx.fillRect(bx + 1, by + 1, 1, bh - 2);
  ctx.fillStyle = PALETTE.sandShade;
  ctx.fillRect(bx + 1, by + bh - 2, bw - 2, 1);
  ctx.fillRect(bx + bw - 2, by + 1, 1, bh - 2);
  ctx.fillStyle = '#0b1320';
  ctx.fillRect(bx + 2, by + 2, bw - 4, bh - 4);

  // 5. Shelly Portrait (22x22)
  const curPage = gs.tutorialDialogue?.pageIndex || 0;
  const pageKey = step.pages[curPage] || step.pages[0];
  let fullText = t(pageKey);
  if (pageKey === 'tut.3.1') {
    fullText += ` (${Math.min(3, gs.tutorialEatenCount || 0)}/3)`;
  }
  const charTimer = gs.tutorialDialogue?.charTimer || 0;
  const isTyping = !gs.tutorialDialogue?.fullyRevealed && (Math.floor(charTimer * 40) < fullText.length);
  const visibleChars = gs.tutorialDialogue?.fullyRevealed ? fullText.length : Math.min(fullText.length, Math.floor(charTimer * 40));
  const typedText = fullText.slice(0, visibleChars);

  const isBlinking = (gs.time % 3.0) < 0.18;
  const mouthOpen = isTyping && (Math.floor(gs.time * 4) % 2 === 0);
  drawShellyPortrait(ctx, bx + 5, by + 5, isBlinking, mouthOpen);

  // 6. Dialogue Text (up to 4 lines of normal font, typed at 40 chars/s, small-font fallback)
  drawFittedText(ctx, typedText, bx + 32, by + 6, {
    w: 118,
    h: 44,
    maxLines: 4,
    align: 'left',
    valign: 'top',
    color: 'cream',
    fonts: ['normal', 'small'],
  });

  // 7. Blinking ▼ on tap-to-continue pages
  const isTapToContinue = step.allow.includes('dialogue:advance') || (gs.tutorialDialogue?.pageIndex || 0) < step.pages.length - 1;
  if (isTapToContinue && !isTyping && (Math.floor(gs.time * 3) % 2 === 0)) {
    ctx.fillStyle = PALETTE.gold;
    const vx = bx + 144;
    const vy = by + 47;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.lineTo(vx + 6, vy);
    ctx.lineTo(vx + 3, vy + 4);
    ctx.closePath();
    ctx.fill();
  }

  // 8. "ONE STEP AT A TIME!" banner
  if (gs.tutorialWrongTapAlert && gs.tutorialWrongTapAlert > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(153, 27, 27, 0.95)';
    ctx.fillRect(80, 8, 240, 18);
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 1;
    ctx.strokeRect(80, 8, 240, 18);
    drawFittedText(ctx, 'ONE STEP AT A TIME!', 80, 9, {
      w: 240,
      h: 16,
      maxLines: 1,
      align: 'center',
      valign: 'middle',
      color: 'cream',
      fonts: ['normal'],
    });
    ctx.restore();
  }
}
// Call renderAudioPanel inside renderPixelScene...
