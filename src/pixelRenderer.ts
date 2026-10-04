/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CONFIG, type GameState, type ShopCategory, shopLog, saveState, saveProgress } from './App.tsx';
import { game } from './audioModule.ts';
import { t } from './textEngine.ts';
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
  drawBitmapText,
  drawMiniBitmapText,
  drawText,
  drawFittedText,
  fitText,
  getGroupFontTier,
  formatNumber,
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

// ============================================================================
// CACHED BACKDROP LAYER
// Baked once on startup: 4 water bands with 2px-tall 2x2 Bayer dither,
// 12% glow tint near top, sand floor with speckles, ripple lines,
// 10 pebbles, 3 shells, 2 starfish, and 3 coral clusters.
// ============================================================================
let cachedBackdropCanvas: HTMLCanvasElement | null = null;

export function invalidateCachedBackdrop() {
  cachedBackdropCanvas = null;
}

function buildCachedBackdrop(gs?: GameState): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const activeTheme = gs?.shop?.theme?.active || (gs?.shop?.decorShown?.['decorMidnight'] ? 'decorMidnight' : (gs?.shop?.decorShown?.['decorLagoon'] ? 'decorLagoon' : 'default'));

  let waterLightCol: string = PALETTE.waterLight;
  let waterMidCol: string = PALETTE.waterMid;
  let waterDeepCol: string = PALETTE.waterDeep;
  let waterDarkCol: string = PALETTE.waterDark;

  const isNight = gs?.tod === 'night';
  const mixColor = '#0a0d26'; // Even darker midnight blue
  const mixRatio = 0.75;      // High ratio for noticeable darkness

  function mix(c1: string, c2: string, ratio: number): string {
    const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
    const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  let sandCol: string = PALETTE.sand;
  let sandShadeCol: string = PALETTE.sandShade;
  let woodCol: string = PALETTE.wood;
  let woodDarkCol: string = PALETTE.woodDark;
  let woodLightCol: string = PALETTE.woodLight;

  if (isNight) {
    sandCol = mix(sandCol, mixColor, 0.6);
    sandShadeCol = mix(sandShadeCol, mixColor, 0.6);
    woodCol = mix(woodCol, mixColor, 0.5);
    woodDarkCol = mix(woodDarkCol, mixColor, 0.5);
    woodLightCol = mix(woodLightCol, mixColor, 0.5);
  }

  if (activeTheme === 'decorMidnight') {
    waterLightCol = '#0f172a';
    waterMidCol = '#020617';
    waterDeepCol = '#020617';
    waterDarkCol = '#000000';
  } else if (activeTheme === 'decorLagoon') {
    waterLightCol = '#38bdf8';
    waterMidCol = '#0284c7';
    waterDeepCol = '#0369a1';
    waterDarkCol = '#075985';
  }
  
  if (isNight) {
      waterLightCol = mix(waterLightCol, mixColor, mixRatio);
      waterMidCol = mix(waterMidCol, mixColor, mixRatio);
      waterDeepCol = mix(waterDeepCol, mixColor, mixRatio);
      waterDarkCol = mix(waterDarkCol, mixColor, mixRatio);
  }

  // Clear with waterDark
  ctx.fillStyle = waterDarkCol;
  ctx.fillRect(0, 0, 400, 300);

  // --------------------------------------------------------------------------
  // 1. WATER BANDS (y: 30 to 270)
  // --------------------------------------------------------------------------
  ctx.fillStyle = waterLightCol;
  ctx.fillRect(0, 30, 400, 60);

  ctx.fillStyle = waterMidCol;
  ctx.fillRect(0, 90, 400, 60);

  ctx.fillStyle = waterDeepCol;
  ctx.fillRect(0, 150, 400, 60);

  ctx.fillStyle = waterDarkCol;
  ctx.fillRect(0, 210, 400, 60);

  // 2px-tall 2x2 Bayer dither transitions:
  for (let x = 0; x < 400; x++) {
    if (x % 2 === 0) {
      ctx.fillStyle = waterMidCol;
      ctx.fillRect(x, 89, 1, 1);
    }
    if (x % 2 === 1) {
      ctx.fillStyle = waterLightCol;
      ctx.fillRect(x, 90, 1, 1);
    }
  }

  for (let x = 0; x < 400; x++) {
    if (x % 2 === 0) {
      ctx.fillStyle = waterDeepCol;
      ctx.fillRect(x, 149, 1, 1);
    }
    if (x % 2 === 1) {
      ctx.fillStyle = waterMidCol;
      ctx.fillRect(x, 150, 1, 1);
    }
  }

  for (let x = 0; x < 400; x++) {
    if (x % 2 === 0) {
      ctx.fillStyle = waterDarkCol;
      ctx.fillRect(x, 209, 1, 1);
    }
    if (x % 2 === 1) {
      ctx.fillStyle = waterDeepCol;
      ctx.fillRect(x, 210, 1, 1);
    }
  }

  // 12% glow tint near top (y: 30 to 45)
  // In a 4x4 grid (16 pixels), 2 pixels = 12.5%
  for (let y = 30; y < 45; y++) {
    for (let x = 0; x < 400; x++) {
      if ((x % 4 === 0 && y % 4 === 1) || (x % 4 === 2 && y % 4 === 3)) {
        ctx.fillStyle = PALETTE.glow;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // Water surface shimmer line at y = 30
  ctx.fillStyle = PALETTE.waterLight;
  ctx.fillRect(0, 30, 400, 1);

  // --------------------------------------------------------------------------
  // 2. SAND FLOOR (y: 270 to 300)
  // Two tones: sand with sandShade speckles and ripple lines
  // --------------------------------------------------------------------------
  ctx.fillStyle = sandCol;
  ctx.fillRect(0, 270, 400, 30);

  ctx.fillStyle = sandShadeCol;
  ctx.fillRect(0, 287, 400, 13);

  // Sand ripple lines
  for (let x = 0; x < 400; x++) {
    const r1 = Math.floor(Math.sin(x * 0.08) * 1.5);
    const r2 = Math.floor(Math.cos(x * 0.06 + 1.2) * 1.5);
    ctx.fillStyle = sandShadeCol;
    ctx.fillRect(x, 274 + r1, 1, 1);
    ctx.fillRect(x, 282 + r2, 1, 1);
  }

  // Sand speckles (deterministic scatter)
  for (let i = 0; i < 90; i++) {
    const sx = (i * 37 + 13) % 400;
    const sy = 271 + ((i * 19 + 7) % 27);
    ctx.fillStyle = sandShadeCol;
    ctx.fillRect(sx, sy, 1, 1);
  }

  // --------------------------------------------------------------------------
  // 3. STATIC DECORATIONS (10 pebbles, 3 shells, 2 starfish, 3 coral clusters)
  // --------------------------------------------------------------------------
  // 10 pebbles (in woodDark and sandShade)
  const pebbles: [number, number][] = [
    [26, 278], [72, 288], [116, 276], [162, 292], [208, 281],
    [248, 289], [288, 275], [332, 293], [360, 283], [386, 277]
  ];
  for (let i = 0; i < pebbles.length; i++) {
    const [px, py] = pebbles[i];
    ctx.fillStyle = sandShadeCol;
    ctx.fillRect(px, py, 3, 2);
    ctx.fillStyle = woodDarkCol;
    ctx.fillRect(px, py + 1, 3, 1);
  }

  // 3 shells (delicate spiral in cream with sandShade ribs)
  const shells: [number, number][] = [
    [98, 283], [236, 286], [344, 280]
  ];
  for (let i = 0; i < shells.length; i++) {
    const [sx, sy] = shells[i];
    ctx.fillStyle = sandShadeCol;
    ctx.fillRect(sx, sy, 4, 3);
    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(sx + 1, sy, 2, 2);
    ctx.fillRect(sx, sy + 1, 1, 1);
  }

  // 2 starfish (in coral with orange center)
  const starfish: [number, number][] = [
    [135, 287], [292, 284]
  ];
  for (let i = 0; i < starfish.length; i++) {
    const [tx, ty] = starfish[i];
    ctx.fillStyle = PALETTE.coral;
    // 5-pointed star pattern
    ctx.fillRect(tx + 2, ty, 1, 5);
    ctx.fillRect(tx, ty + 2, 5, 1);
    ctx.fillRect(tx + 1, ty + 1, 3, 3);
    ctx.fillStyle = PALETTE.orange;
    ctx.fillRect(tx + 2, ty + 2, 1, 1);
  }

  // 3 coral clusters in coral and orange (rooted at y: 270)
  const corals: [number, number][] = [
    [54, 270], [182, 270], [318, 270]
  ];
  for (let i = 0; i < corals.length; i++) {
    const [cx, cy] = corals[i];
    // Main branches in coral
    ctx.fillStyle = PALETTE.coral;
    ctx.fillRect(cx + 2, cy - 8, 2, 8);
    ctx.fillRect(cx - 2, cy - 6, 2, 6);
    ctx.fillRect(cx + 6, cy - 5, 2, 5);
    ctx.fillRect(cx, cy - 7, 2, 2);
    ctx.fillRect(cx + 4, cy - 7, 2, 2);
    // Orange glowing tips
    ctx.fillStyle = PALETTE.orange;
    ctx.fillRect(cx + 2, cy - 9, 2, 2);
    ctx.fillRect(cx - 2, cy - 7, 2, 2);
    ctx.fillRect(cx + 6, cy - 6, 2, 2);
  }

  // Moon glow at top-right if night
  if (isNight) {
    const moonCenterX = 340;
    const moonCenterY = 60;
    const moonRad = 40;
    ctx.fillStyle = '#e0f2fe'; // Pale blue-white
    for (let dy = -moonRad; dy <= moonRad; dy++) {
      for (let dx = -moonRad; dx <= moonRad; dx++) {
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);
        if (dist <= moonRad) {
          // Dither based on distance
          const ditherProb = 1.0 - (dist / moonRad);
          if (Math.random() < ditherProb * 0.4) {
            ctx.fillRect(moonCenterX + dx, moonCenterY + dy, 1, 1);
          }
        }
      }
    }
  }

  return canvas;
}

// ============================================================================
// LIVE DECORATIONS: 6 KELP STRANDS (14-22 art px tall, swaying ±1px)
// ============================================================================
const KELP_DATA = [
  { x: 38, height: 18 },
  { x: 88, height: 22 },
  { x: 150, height: 15 },
  { x: 224, height: 20 },
  { x: 302, height: 17 },
  { x: 366, height: 21 },
];

function renderLiveKelp(ctx: CanvasRenderingContext2D, time: number) {
  // Sway ±1px on a 2-frame sine rhythm
  const swayOffset = Math.floor(Math.sin(time * 4) * 1.4);

  for (let k = 0; k < KELP_DATA.length; k++) {
    const { x, height } = KELP_DATA[k];
    const baseY = 270;

    for (let seg = 0; seg < height; seg += 2) {
      const segT = seg / height;
      const curSway = Math.floor(segT * swayOffset);
      const px = x + curSway;
      const py = baseY - seg;

      // Stem in alienDark
      ctx.fillStyle = PALETTE.alienDark;
      ctx.fillRect(px, py - 2, 1, 2);

      // Fronds in alienGreen branching alternately
      if (seg > 4 && seg % 4 === 0) {
        ctx.fillStyle = PALETTE.alienGreen;
        const side = (seg / 4) % 2 === 0 ? 1 : -1;
        ctx.fillRect(px + side, py - 2, 2, 1);
        ctx.fillRect(px + side * 2, py - 3, 1, 1);
      }
    }
  }
}

// ============================================================================
// LIVE LIGHT SHAFTS: 6 sun or 4 moon shafts swaying on 9s/14s sine
// ============================================================================
function renderLiveLightShafts(ctx: CanvasRenderingContext2D, gs: GameState) {
  const time = gs.time;
  const isNight = gs.tod === 'night';
  
  // Sway on a sine
  const swayDuration = isNight ? 14.0 : 9.0;
  const swayCycle = (time % swayDuration) / swayDuration;
  const sway = Math.sin(swayCycle * Math.PI * 2) * 16;

  const shaftOrigins = isNight ? [80, 160, 240, 320] : [25, 85, 145, 205, 265, 335];
  const shaftWidth = isNight ? 18 : 14;

  for (let i = 0; i < shaftOrigins.length; i++) {
    const originX = shaftOrigins[i] + sway;

    for (let y = 31; y < 240; y += 2) {
      // Slanted diagonal progression
      const diagShift = Math.floor((y - 30) * 0.32 + sway * 0.4);
      const startX = Math.floor(originX + diagShift);

      // Dither texture across shaft width
      for (let x = startX; x < startX + shaftWidth; x += 2) {
        if (x >= 6 && x < 394) {
          // Bayer dither texture
          if ((x + y) % (isNight ? 2 : 3) === 0) {
            if (isNight) {
              // 40% dither opacity pale blue-white
              if (Math.random() < 0.4) {
                ctx.fillStyle = '#e0f2fe';
                ctx.fillRect(x, y, 1, 1);
              }
            } else {
              ctx.fillStyle = y < 130 ? PALETTE.waterLight : PALETTE.waterMid;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        }
      }
    }
  }
}

// ============================================================================
// CHUNKY 6 ART PX WOODEN TANK BORDER
// woodDark outline, wood fill, woodLight top bevel, corner rivets
// Drawn over outer edge only, so play bounds don't change.
// ============================================================================
function renderTankBorder(ctx: CanvasRenderingContext2D, gs: GameState) {
  // Border is 6 art px wide on perimeter:
  // Top: y: 30 to 35
  // Bottom: y: 294 to 299
  // Left: x: 0 to 5
  // Right: x: 394 to 399

  const isNight = gs.tod === 'night';
  const mixColor = '#0a0d26';
  
  function mix(c1: string, c2: string, ratio: number): string {
    const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
    const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  let woodCol: string = PALETTE.wood;
  let woodDarkCol: string = PALETTE.woodDark;
  let woodLightCol: string = PALETTE.woodLight;

  if (isNight) {
    woodCol = mix(woodCol, mixColor, 0.5);
    woodDarkCol = mix(woodDarkCol, mixColor, 0.5);
    woodLightCol = mix(woodLightCol, mixColor, 0.5);
  }

  // 1. Fill 6px frame with wood
  ctx.fillStyle = woodCol;
  ctx.fillRect(0, 30, 400, 6);   // Top bar
  ctx.fillRect(0, 294, 400, 6);  // Bottom bar
  ctx.fillRect(0, 30, 6, 270);   // Left bar
  ctx.fillRect(394, 30, 6, 270); // Right bar

  // 2. woodDark outline (outer edge and inner rim)
  ctx.fillStyle = woodDarkCol;
  // Outer perimeter
  ctx.fillRect(0, 30, 400, 1);
  ctx.fillRect(0, 299, 400, 1);
  ctx.fillRect(0, 30, 1, 270);
  ctx.fillRect(399, 30, 1, 270);
  // Inner perimeter
  ctx.fillRect(5, 35, 390, 1);
  ctx.fillRect(5, 294, 390, 1);
  ctx.fillRect(5, 35, 1, 260);
  ctx.fillRect(394, 35, 1, 260);

  // 3. woodLight top bevel (inner highlight on top and left bevels)
  ctx.fillStyle = woodLightCol;
  ctx.fillRect(1, 31, 398, 1);
  ctx.fillRect(1, 31, 1, 267);

  // 4. Corner rivets in 4 corners (2x2 silver with woodDark shadow)
  const cornerRivets: [number, number][] = [
    [2, 32],     // Top-left
    [396, 32],   // Top-right
    [2, 296],    // Bottom-left
    [396, 296],  // Bottom-right
  ];
  for (let r = 0; r < cornerRivets.length; r++) {
    const [rx, ry] = cornerRivets[r];
    ctx.fillStyle = PALETTE.silver;
    ctx.fillRect(rx, ry, 2, 2);
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(rx + 1, ry + 1, 1, 1);
  }
}

function renderDecorLayer(ctx: CanvasRenderingContext2D, gs: GameState) {
  if (!gs.shop?.decorShown) return;

  // 1. Pink Coral (x: 45, y: 270)
  if (gs.shop.decorShown['decorCoral']) {
    const sway = Math.floor(gs.time * 2) % 2;
    const cx = 45;
    const cy = 270;
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(cx - 5, cy - 16, 10, 16);
    ctx.fillStyle = PALETTE.coral;
    ctx.fillRect(cx - 4, cy - 15, 8, 15);
    ctx.fillStyle = PALETTE.belly;
    ctx.fillRect(cx - 3 + sway, cy - 14, 2, 8);
    ctx.fillRect(cx + 1 + sway, cy - 12, 2, 7);
  }

  // 2. Seashell Pile (x: 105, y: 270)
  if (gs.shop.decorShown['decorShells']) {
    const sx = 105;
    const sy = 270;
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(sx - 6, sy - 5, 5, 5);
    ctx.fillStyle = PALETTE.cream;
    ctx.fillRect(sx - 5, sy - 4, 3, 4);

    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(sx - 1, sy - 7, 6, 7);
    ctx.fillStyle = PALETTE.belly;
    ctx.fillRect(sx, sy - 6, 4, 6);

    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(sx + 4, sy - 4, 4, 4);
    ctx.fillStyle = PALETTE.tan;
    ctx.fillRect(sx + 5, sy - 3, 2, 3);
  }

  // 3. Treasure Chest (x: 165, y: 270)
  if (gs.shop.decorShown['decorChest']) {
    const tx = 165;
    const ty = 270;
    const isOpen = (gs.time % 6) < 1.0;
    const chestSprite = SPRITES.decorChest.normal;
    ctx.drawImage(chestSprite, tx - Math.floor(chestSprite.width / 2), ty - chestSprite.height);

    if (isOpen) {
      ctx.fillStyle = PALETTE.wood;
      ctx.fillRect(tx - 6, ty - 14, 12, 3);
      const bubbleT = (gs.time % 6);
      for (let b = 0; b < 3; b++) {
        const by = ty - 12 - ((bubbleT * 20 + b * 6) % 30);
        const bx = tx - 2 + (b * 3 - 3) + Math.sin(bubbleT * 4 + b) * 2;
        ctx.fillStyle = PALETTE.waterLight;
        ctx.fillRect(Math.floor(bx), Math.floor(by), 2, 2);
      }
    }
  }

  // 4. Mini Castle (x: 235, y: 270, 20px tall in internal space = 40 art px)
  if (gs.shop.decorShown['decorCastle']) {
    const kx = 235;
    const ky = 270;
    const castleSprite = SPRITES.decorCastle.normal;
    ctx.drawImage(castleSprite, kx - Math.floor(castleSprite.width / 2), ky - castleSprite.height);

    const flagFrame = Math.floor(gs.time * 3) % 2;
    const fx = kx + 1;
    const fy = ky - castleSprite.height - 4;
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(fx, fy, 1, 5);
    ctx.fillStyle = PALETTE.coral;
    ctx.fillRect(fx + 1, fy, 3 + flagFrame, 3);
  }

  // 5. Glow Lantern (x: 320, hanging from y: 30)
  if (gs.shop.decorShown['decorLantern']) {
    const lx = 320;
    const ly = 30;
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(lx, ly, 1, 18);
    ctx.fillRect(lx - 3, ly + 18, 7, 8);

    const flicker = Math.floor(gs.time * 6) % 3;
    const coreCols: PaletteKey[] = ['glow', 'gold', 'cream'];
    ctx.fillStyle = PALETTE[coreCols[flicker]];
    ctx.fillRect(lx - 1, ly + 20, 3, 4);

    // 40px radius (20px internal radius) dither glow around lantern
    const glowRad = 20;
    const gx = lx;
    const gy = ly + 22;
    ctx.fillStyle = PALETTE.glow;
    for (let dy = -glowRad; dy <= glowRad; dy++) {
      for (let dx = -glowRad; dx <= glowRad; dx++) {
        const dist = Math.hypot(dx, dy);
        if (dist <= glowRad) {
          const dither = dist / glowRad;
          const px = gx + dx;
          const py = gy + dy;
          if (dither < 0.3) {
            if ((px + py) % 2 === 0) ctx.fillRect(px, py, 1, 1);
          } else if (dither < 0.7) {
            if (px % 2 === 0 && py % 2 === 0) ctx.fillRect(px, py, 1, 1);
          } else {
            if (px % 4 === 0 && py % 4 === 0) ctx.fillRect(px, py, 1, 1);
          }
        }
      }
    }
  }

  // 6. Wooden Sign (x: 360, y: 270, reads "FISH")
  if (gs.shop.decorShown['decorSign']) {
    const sx = 360;
    const sy = 270;
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(sx - 1, sy - 14, 2, 14);
    ctx.fillRect(sx - 12, sy - 14, 24, 9);
    ctx.fillStyle = PALETTE.wood;
    ctx.fillRect(sx - 11, sy - 13, 22, 7);
    drawMiniBitmapText(ctx, 'FISH', sx, sy - 12, 'cream', 'center');
  }
}

export function computeShopBadge(gs: GameState): boolean {
  if (!gs || !gs.shop) return false;

  for (let i = 0; i < CONFIG.SHOP_ITEMS.length; i++) {
    const item = CONFIG.SHOP_ITEMS[i];
    const currentLvl = gs.shop.levels[item.id] || 0;

    // Check maxed / owned
    if (item.category === 'decor') {
      if (gs.shop.decorOwned[item.id]) continue;
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
// MAIN EXPORTED RENDER FUNCTION
// ============================================================================
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

  // 1. BACKGROUND (Cached backdrop layer baked once on startup)
  if (!cachedBackdropCanvas) {
    cachedBackdropCanvas = buildCachedBackdrop(gs);
  }
  ctx.drawImage(cachedBackdropCanvas, 0, 0);

  // Water Themes (Lagoon / Midnight)
  if (gs.shop?.decorShown?.['decorLagoon']) {
    ctx.fillStyle = PALETTE.lagoon1; ctx.fillRect(0, 30, 400, 60);
    ctx.fillStyle = PALETTE.lagoon2; ctx.fillRect(0, 90, 400, 60);
    ctx.fillStyle = PALETTE.lagoon3; ctx.fillRect(0, 150, 400, 60);
    ctx.fillStyle = PALETTE.waterDeep; ctx.fillRect(0, 210, 400, 60);
  } else if (gs.shop?.decorShown?.['decorMidnight']) {
    ctx.fillStyle = PALETTE.midnight1; ctx.fillRect(0, 30, 400, 60);
    ctx.fillStyle = PALETTE.midnight2; ctx.fillRect(0, 90, 400, 60);
    ctx.fillStyle = PALETTE.midnight3; ctx.fillRect(0, 150, 400, 60);
    ctx.fillStyle = PALETTE.midnight4; ctx.fillRect(0, 210, 400, 60);
  }

  // 2. DECOR (Light shafts, swaying kelp, custom purchased decor)
  renderLiveLightShafts(ctx, gs);
  renderLiveKelp(ctx, gs.time);
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
    
    const speciesList = SPECIES_SPRITES[p.level - 1];
    if (!speciesList) continue;
    
    const frameIndex = Math.floor(gs.time / 0.17) % 2;
    const sprite = speciesList[frameIndex];
    const isFacingLeft = p.facing < 0;
    const img = isFacingLeft ? sprite.flipped : sprite.normal;
    
    drawWithGlowRim(ctx, img, px - Math.floor(sprite.width / 2), py - Math.floor(sprite.height / 2), sprite.width, sprite.height, isNight);
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
      const size = p.radius >= 2 ? 2 : 1;
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
        ctx.fillRect(px, py, size, size);
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
  // Base wood fill
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(0, 0, 400, 30);

  // 1px woodLight top highlight
  ctx.fillStyle = PALETTE.woodLight;
  ctx.fillRect(0, 0, 400, 1);

  // Bottom woodDark outline
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(0, 29, 400, 1);

  // Two plank seams at y = 10 and y = 20
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(0, 10, 400, 1);
  ctx.fillRect(0, 20, 400, 1);
  ctx.fillStyle = PALETTE.woodLight;
  ctx.fillRect(0, 11, 400, 1);
  ctx.fillRect(0, 21, 400, 1);

  // Pixel grain streaks across the 3 boards
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

  // Nailheads at both ends (Left x: 3, Right x: 394)
  const nailY = [5, 22];
  for (let n = 0; n < 2; n++) {
    // Left nailhead
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(3, nailY[n], 3, 3);
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(4, nailY[n] + 1, 1, 1);
    ctx.fillStyle = PALETTE.silver;
    ctx.fillRect(3, nailY[n], 1, 1);

    // Right nailhead
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(394, nailY[n], 3, 3);
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(395, nailY[n] + 1, 1, 1);
    ctx.fillStyle = PALETTE.silver;
    ctx.fillRect(394, nailY[n], 1, 1);
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

  // Baked 8x8 Gold Coin Icon
  ctx.drawImage(SPRITES.coinPlaque.normal, plX + 3, plY + 4);

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
  const sTl = isShopPressed ? PALETTE.sandShade : (gs.shop?.open ? PALETTE.glow : PALETTE.woodLight);
  const sBr = isShopPressed ? PALETTE.woodLight : PALETTE.sandShade;
  ctx.fillStyle = sTl;
  ctx.fillRect(shopBtnX + 1, shopBtnY + shopYOff + 1, shopBtnW - 2, 1);
  ctx.fillRect(shopBtnX + 1, shopBtnY + shopYOff + 1, 1, shopBtnH - 2);
  ctx.fillStyle = sBr;
  ctx.fillRect(shopBtnX + 1, shopBtnY + shopYOff + shopBtnH - 2, shopBtnW - 2, 1);
  ctx.fillRect(shopBtnX + shopBtnW - 2, shopBtnY + shopYOff + 1, 1, shopBtnH - 2);

  ctx.fillStyle = gs.shop?.open ? PALETTE.glow : (isShopHovered ? PALETTE.white : PALETTE.cream);
  ctx.fillRect(shopBtnX + 3, shopBtnY + shopYOff + 3, shopBtnW - 6, shopBtnH - 6);

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

    const eTl = isEggPressed ? PALETTE.sandShade : (isEggAffordable ? PALETTE.gold : PALETTE.woodLight);
    const eBr = isEggPressed ? PALETTE.woodLight : PALETTE.sandShade;
    ctx.fillStyle = eTl;
    ctx.fillRect(eggBtnX + 1, eggBtnY + eggYOff + 1, eggBtnW - 2, 1);
    ctx.fillRect(eggBtnX + 1, eggBtnY + eggYOff + 1, 1, eggBtnH - 2);
    ctx.fillStyle = eBr;
    ctx.fillRect(eggBtnX + 1, eggBtnY + eggYOff + eggBtnH - 2, eggBtnW - 2, 1);
    ctx.fillRect(eggBtnX + eggBtnW - 2, eggBtnY + eggYOff + 1, 1, eggBtnH - 2);

    ctx.fillStyle = isEggPressed ? PALETTE.sandShade : (piecesBought >= 3 ? PALETTE.glow : (isEggAffordable ? (isEggHovered ? PALETTE.white : PALETTE.gold) : PALETTE.cream));
    ctx.fillRect(eggBtnX + 2, eggBtnY + eggYOff + 2, eggBtnW - 4, eggBtnH - 4);

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

  const pTl = isPausePressed ? PALETTE.sandShade : PALETTE.woodLight;
  const pBr = isPausePressed ? PALETTE.woodLight : PALETTE.sandShade;
  ctx.fillStyle = pTl;
  ctx.fillRect(pBtnX + 1, pBtnY + pYOffset + 1, pBtnW - 2, 1);
  ctx.fillRect(pBtnX + 1, pBtnY + pYOffset + 1, 1, pBtnH - 2);
  ctx.fillStyle = pBr;
  ctx.fillRect(pBtnX + 1, pBtnY + pYOffset + pBtnH - 2, pBtnW - 2, 1);
  ctx.fillRect(pBtnX + pBtnW - 2, pBtnY + pYOffset + 1, 1, pBtnH - 2);

  ctx.fillStyle = isPausePressed ? PALETTE.sandShade : (isPauseHovered ? PALETTE.woodLight : PALETTE.wood);
  ctx.fillRect(pBtnX + 2, pBtnY + pYOffset + 2, pBtnW - 4, pBtnH - 4);

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
      const speciesList = SPECIES_SPRITES[gs.level - 1];
      if (speciesList) {
        const frameIndex = Math.floor(t / 0.17) % 2;
        const sprite = speciesList[frameIndex];

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
  // 10. OVERLAYS (Title, Settings, Pause, Level Complete, Game Over)
  // --------------------------------------------------------------------------
  if (gs.state === 'TITLE') {
    drawTitleScreen(ctx, gs);
  } else if (gs.state === 'LEVEL_SELECT') {
    drawLevelSelectScreen(ctx, gs);
  } else if (gs.state === 'SETTINGS') {
    drawSettingsScreen(ctx, gs);
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

  // --------------------------------------------------------------------------
  // 11. 0.4s PIXEL DISSOLVE TRANSITION (4x4 blocks revealed in random order)
  // --------------------------------------------------------------------------
  if (gs.transitionTimer && gs.transitionTimer > 0) {
    renderDissolveTransition(ctx, gs.transitionTimer);
  }

  // --------------------------------------------------------------------------
  // 12. 6% WARM OVERLAY (#ffb561) FOR COZY RETRO TONE
  // --------------------------------------------------------------------------
  ctx.save();
  ctx.fillStyle = '#ffb561';
  ctx.globalAlpha = 0.06;
  ctx.fillRect(0, 0, 400, 300);
  ctx.restore();

  // --------------------------------------------------------------------------
  // 13. PIXEL HAND CURSOR & TACTICAL WEAPON RING (2px ring in cream & gold)
  // --------------------------------------------------------------------------
  renderPixelCursor(ctx, gs);
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

  // 2. Bevel: 2px woodLight top-left, 2px sandShade bottom-right
  const tlColor = isPressed ? PALETTE.sandShade : (isHovered ? PALETTE.glow : PALETTE.woodLight);
  const brColor = isPressed ? PALETTE.woodLight : PALETTE.sandShade;

  ctx.fillStyle = tlColor;
  ctx.fillRect(bx + 1, by + 1, w - 2, 2);
  ctx.fillRect(bx + 1, by + 1, 2, h - 2);

  ctx.fillStyle = brColor;
  ctx.fillRect(bx + 1, by + h - 3, w - 2, 2);
  ctx.fillRect(bx + w - 3, by + 1, 2, h - 2);

  // 3. Face: hover brightens face
  const faceColor = isHovered ? PALETTE.white : (isPressed ? PALETTE.sand : PALETTE.cream);
  ctx.fillStyle = faceColor;
  ctx.fillRect(bx + 3, by + 3, w - 6, h - 6);

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
function drawDimCheckerboardOverlay(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(10, 20, 30, 0.65)';
  ctx.fillRect(0, 0, 400, 300);
  ctx.fillStyle = PALETTE.outline;
  for (let y = 0; y < 300; y += 2) {
    for (let x = 0; x < 400; x += 2) {
      ctx.fillRect(x + ((y / 2) % 2 === 0 ? 0 : 1), y, 1, 1);
    }
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
  // 1. Dim overlay over the live tank background
  drawDimCheckerboardOverlay(ctx);

  // 2. Game Logo "REZONAQUARIUM" in 2x bitmap font with outline, drop shadow, and 1px wave bob per letter
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

    // 2x drop shadow
    drawText(ctx, ch, lx + 2, ly + 2, { font: 'normal', color: 'outline', scale });
    // Main letter in gold with 1px outline
    drawText(ctx, ch, lx, ly, { font: 'normal', color: 'gold', scale });
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

  drawSharedButton(
    ctx,
    125,
    148,
    150,
    28,
    t('menu.sandbox'),
    mx,
    my,
    isMouseDown,
    'outline',
    undefined,
    true,
    gs.time + 1.2,
    titleGroupFont
  );

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
}

// ============================================================================
// SETTINGS SCREEN (260x160 wooden panel with settings toggles & back button)
// ============================================================================
function drawSettingsScreen(ctx: CanvasRenderingContext2D, gs: GameState) {
  drawDimCheckerboardOverlay(ctx);
  drawWoodenOverlayPanel(ctx, 'SETTINGS', 'waterMid');

  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);
  const isMouseDown = gs.mousePos.isMouseDown ?? false;

  const shakeText = `SHAKE: ${gs.screenShakeEnabled !== false ? 'ON' : 'OFF'}`;
  const partText = `PARTICLES: ${gs.particlesEnabled !== false ? 'ON' : 'OFF'}`;
  
  // Layout in two columns or a list
  // Column 1: General
  drawFittedText(ctx, 'GENERAL', 85, 75, { w: 100, h: 10, align: 'center', color: 'gold', fonts: ['small'] });
  drawSharedButton(ctx, 80, 88, 110, 22, shakeText, mx, my, isMouseDown, 'outline', undefined, false, 0);
  drawSharedButton(ctx, 80, 114, 110, 22, 'FULLSCREEN', mx, my, isMouseDown, 'outline', undefined, false, 0);

  // Column 2: Optimization
  drawFittedText(ctx, 'OPTIMIZATION', 215, 75, { w: 100, h: 10, align: 'center', color: 'gold', fonts: ['small'] });
  drawSharedButton(ctx, 210, 88, 110, 22, partText, mx, my, isMouseDown, 'outline', undefined, false, 0);
  drawSharedButton(ctx, 210, 114, 110, 22, 'RESET DATA', mx, my, isMouseDown, 'outline', undefined, false, 0);

  // Back button at bottom
  drawSharedButton(ctx, 125, 155, 150, 24, 'BACK TO TITLE', mx, my, isMouseDown, 'outline', undefined, false, 0);
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
    const pauseLabels = ['RESUME', 'SANDBOX OPTIONS', 'RESET TANK', 'MAIN MENU'];
    const pauseGroupFont = getGroupFontTier(pauseLabels, { w: 140 - 6, h: 22 - 6, maxLines: 1 });

    drawSharedButton(ctx, 130, 85, 140, 22, 'RESUME', mx, my, isMouseDown, 'outline', undefined, false, 0, pauseGroupFont);
    drawSharedButton(ctx, 130, 112, 140, 22, 'SANDBOX OPTIONS', mx, my, isMouseDown, 'outline', undefined, false, 0, pauseGroupFont);
    drawSharedButton(ctx, 130, 139, 140, 22, 'RESET TANK', mx, my, isMouseDown, 'outline', undefined, false, 0, pauseGroupFont);
    drawSharedButton(ctx, 130, 166, 140, 22, 'MAIN MENU', mx, my, isMouseDown, 'outline', undefined, false, 0, pauseGroupFont);
  } else {
    const pauseLabels = ['RESUME', 'RESTART LEVEL', 'MAIN MENU'];
    const pauseGroupFont = getGroupFontTier(pauseLabels, { w: 120 - 6, h: 24 - 6, maxLines: 1 });

    drawSharedButton(ctx, 140, 95, 120, 24, 'RESUME', mx, my, isMouseDown, 'outline', undefined, false, 0, pauseGroupFont);
    drawSharedButton(ctx, 140, 128, 120, 24, 'RESTART LEVEL', mx, my, isMouseDown, 'outline', undefined, false, 0, pauseGroupFont);
    drawSharedButton(ctx, 140, 161, 120, 24, 'MAIN MENU', mx, my, isMouseDown, 'outline', undefined, false, 0, pauseGroupFont);
  }
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
  const speciesList = SPECIES_SPRITES[currentLevel - 1];
  if (speciesList) {
    const frameIndex = Math.floor(gs.time / 0.17) % 2;
    const sprite = speciesList[frameIndex];
    const isNight = currentLevel >= 6;
    // Scaled 2x and centered
    S(ctx, sprite, 122, 105, false, 2, 2, gs.time, isNight);
  }

  // "NEW FISH!" or "COLLECTED" ribbon below species sprite
  const ribbonText = gs.isFirstTimeCompletion ? 'NEW FISH!' : 'COLLECTED';
  const ribW = 66;
  const ribH = 12;
  const rx = 122 - Math.floor(ribW / 2);
  const ry = 122;

  ctx.fillStyle = PALETTE.outline;
  ctx.fillRect(rx, ry, ribW, ribH);
  ctx.fillStyle = gs.isFirstTimeCompletion ? PALETTE.coral : PALETTE.midnight2;
  ctx.fillRect(rx + 1, ry + 1, ribW - 2, ribH - 2);

  drawFittedText(ctx, ribbonText, rx + 2, ry + 3, {
    w: ribW - 4,
    h: 8,
    maxLines: 1,
    align: 'center',
    valign: 'middle',
    color: 'cream',
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
  ctx.drawImage(SPRITES.iconTime.normal, rightColX, timeY + 1);
  drawFittedText(ctx, 'TIME:', rightColX + 11, timeY, {
    w: 35,
    h: 12,
    maxLines: 1,
    align: 'left',
    valign: 'middle',
    color: 'diamond',
  });
  drawFittedText(ctx, formatTime(levelStats.elapsedTime), rightColX + rightColW - 60, timeY, {
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
  drawFittedText(ctx, `$${formatNumber(levelStats.finalMoney, 60)}`, rightColX + rightColW - 60, moneyY, {
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

  // 2. 20px (40px) 'SHOP' Ribbon Header showing current money with coin icon
  const ribH = 20;
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(mX + 2, mY + 2, mW - 4, ribH);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(mX + 3, mY + 3, mW - 6, ribH - 2);

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

  // 4. Three 44x15 (88x30) tabs below header (Pets, Upgrades, Decor)
  const tabY = mY + ribH + 3;
  const tabH = 15;
  let categories: { id: ShopCategory; label: string }[] = [
    { id: 'pets', label: 'Pets' },
    { id: 'upgrades', label: 'Upgrades' },
    { id: 'decor', label: 'Decor' },
  ];
  if (gs.isTutorial) {
    categories = [
      { id: 'pets', label: 'Pets' },
      { id: 'upgrades', label: 'Upgrades' },
    ];
  }

  const totalTabW = 3 * 44;
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

  // 5. Content Area (cards in 2-column grid, each 67x50 with 5px gap)
  const contentX = mX + 5;
  const contentY = mY + ribH + tabH + 5;
  const contentW = mW - 10;
  const contentH = mH - (ribH + tabH + 8);

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
    const tutorialStep = CONFIG.TUTORIAL[gs.tutorialStep - 1];
    const allowedIds = tutorialStep ? tutorialStep.allow : [];
    items = items.filter(it => allowedIds.includes(it.id));
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
    decorCastle: 'Toggle display of sunken stone castle',
    decorChest: 'Toggle display of gilded treasure chest',
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
    else if (item.id === 'decorCastle') icon = SPRITES.iconCastle;
    else if (item.id === 'decorChest') icon = SPRITES.iconChest;

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
    }

    const descResult = drawFittedText(ctx, descText, cardX + 2, cardY + 20, {
      w: 63,
      h: 14,
      maxLines: 2,
      align: 'left',
      valign: 'top',
      color: 'dimBrown',
      fonts: ['small'],
    });

    // Price row at y=36 with coin + price on left and level indicators/pips or n/15 on right
    if (item.category === 'decor' && gs.shop.decorOwned[item.id]) {
      const isShown = gs.shop.decorShown[item.id];
      ctx.fillStyle = isShown ? PALETTE.woodDark : PALETTE.wood;
      ctx.fillRect(cardX + 2, cardY + 36, 32, 11);
      drawFittedText(ctx, isShown ? 'HIDE' : 'SHOW', cardX + 2, cardY + 36, {
        w: 32,
        h: 11,
        maxLines: 1,
        align: 'center',
        valign: 'middle',
        color: isShown ? 'glow' : 'cream',
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
      ctx.fillRect(cardX - 1, cardY - 1, cardW + 2, 1);
      ctx.fillRect(cardX - 1, cardY + cardH, cardW + 2, 1);
      ctx.fillRect(cardX - 1, cardY, 1, cardH);
      ctx.fillRect(cardX + cardW, cardY, 1, cardH);
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

  // Draw BUY Button at bottom of modal
  const buyW = mW - 20;
  const buyH = 18;
  const buyX = mX + 10;
  const buyY = mY + mH - buyH - 5;
  const selItemId = gs.shop.selectedItemId;
  const selItem = selItemId ? CONFIG.SHOP_ITEMS.find(it => it.id === selItemId) : null;
  const selItemLvl = selItem ? (gs.shop.levels[selItem.id] || 0) : 0;
  const selPrice = selItem ? selItem.prices[Math.min(selItemLvl, selItem.prices.length - 1)] : 0;
  const isFreeShop = game.mode === 'sandbox' && game.sandbox.freeShop;
  const selPriceText = isFreeShop ? t('shop.free') : `$${selPrice}`;
  const buyLabel = selItem ? `BUY ${selItem.name.toUpperCase()} (${selPriceText})` : 'SELECT ITEM';

  const isBuyHovered = mx >= buyX && mx < buyX + buyW && my >= buyY && my < buyY + buyH;
  const isBuyPressed = isBuyHovered && isMouseDown;

  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(buyX, buyY, buyW, buyH);
  ctx.fillStyle = isBuyPressed ? PALETTE.sandShade : (selItem && gs.money >= selPrice ? PALETTE.gold : PALETTE.sand);
  ctx.fillRect(buyX + 1, buyY + 1, buyW - 2, buyH - 2);
  drawFittedText(ctx, buyLabel, buyX + 2, buyY + 3, {
    w: buyW - 4,
    h: buyH - 6,
    maxLines: 1,
    align: 'center',
    valign: 'middle',
    color: 'outline',
  });

  ctx.restore();

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

  // 11. AUDIO PANEL
  renderAudioPanel(ctx, gs);

  // 12. TUTORIAL OVERLAY
  if (gs.isTutorial && gs.tutorialStep > 0) {
    renderTutorialOverlay(ctx, gs);
  }

  // 13. CURSOR
  renderPixelCursor(ctx, gs);
}

function renderPixelCursor(ctx: CanvasRenderingContext2D, gs: GameState) {
  if (!gs.mousePos.inCanvas) return;
  const mx = Math.floor(gs.mousePos.x / 2);
  const my = Math.floor(gs.mousePos.y / 2);

  if (gs.weaponUpgradeLevel >= 1 && gs.mousePos.y >= CONFIG.waterTop && gs.state === 'PLAYING') {
    renderTacticalWeaponRing(ctx, mx, my);
  }

  const hand = gs.mousePos.isMouseDown ? SPRITES.handCursorPressed : SPRITES.handCursor;
  ctx.drawImage(hand.normal, mx - hand.originX, my - hand.originY);
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

function renderTutorialOverlay(ctx: CanvasRenderingContext2D, gs: GameState) {
  const stepIndex = gs.tutorialStep - 1;
  const step = CONFIG.TUTORIAL[stepIndex];
  if (!step) return;

  const pageKey = step.pages[0];
  const pageText = t(pageKey);

  // Draw tutorial box at bottom center
  const bw = 240;
  const bh = 50;
  const bx = 200 - bw / 2;
  const by = 240;

  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = PALETTE.woodLight;
  ctx.fillRect(bx + 1, by + 1, bw - 2, 1);
  ctx.fillRect(bx + 1, by + 1, 1, bh - 2);
  ctx.fillStyle = PALETTE.sandShade;
  ctx.fillRect(bx + 1, by + bh - 2, bw - 2, 1);
  ctx.fillRect(bx + bw - 2, by + 1, 1, bh - 2);
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(bx + 2, by + 2, bw - 4, bh - 4);

  drawFittedText(ctx, pageText, bx + 10, by + 6, {
    w: bw - 20,
    h: bh - 12,
    maxLines: 4,
    align: 'center',
    valign: 'middle',
    color: 'cream',
  });

  // Render Highlight
  if (step.highlight) {
    if (step.highlight === 'water') {
      // Highlight water area with a subtle glow
      ctx.strokeStyle = PALETTE.glow;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(30, 60, 340, 210);
      ctx.setLineDash([]);
    } else if (step.highlight === 'shop:buyFish') {
      // Highlight Guppy in shop
      // This is harder as it depends on shop being open and scroll
      if (gs.shop.open && gs.shop.selectedCategory === 'pets') {
        ctx.strokeStyle = PALETTE.glow;
        ctx.lineWidth = 2;
        ctx.strokeRect(200, 100, 140, 100); // Placeholder
      }
    }
  }
}
// Call renderAudioPanel inside renderPixelScene...
