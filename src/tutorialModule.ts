/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CONFIG, type GameState, saveState, type Coin, type Alien, type Food } from './App.tsx';
import { t, fitText, drawText } from './textEngine.ts';
import { PALETTE, SPRITES, type PaletteKey } from './pixelEngine.ts';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TutorialControllerState {
  stepIndex: number;
  pageIndex: number;
  pageTime: number; // time on current page (seconds)
  stepTimer: number; // time on current step (seconds)
  anchorIndex: number; // 0: bottom-left, 1: bottom-right, 2: top-left, 3: top-right
  currentPos: { x: number; y: number };
  fromPos: { x: number; y: number };
  targetPos: { x: number; y: number };
  slideTimer: number; // timer for anchor slide transition (0..0.2s)
  overlapTimer: number; // timer for how long current anchor has been overlapped (>= 0.3s triggers slide)
  stepTransitionTimer: number; // timer for step enter/exit slide (0..0.2s)
  firstWaterTapDone: boolean; // whether player tapped water during water steps
  wrongTaps: number[]; // timestamps of wrong taps within 4s
  nudgeActive: boolean; // whether Shelly is saying "ONE STEP AT A TIME!"
  nudgeTimer: number; // timer for nudge display
  nudgeTime: number; // time on nudge (for typing/talking)
  boxRect: Rect; // current layout rect in UI px
}

// 4 candidate anchors in priority order: bottom-left, bottom-right, top-left, top-right
export const TUTORIAL_ANCHORS = [
  { x: 12, y: 230 },  // 0: bottom-left
  { x: 232, y: 230 }, // 1: bottom-right
  { x: 12, y: 42 },   // 2: top-left
  { x: 232, y: 42 },  // 3: top-right
];

export const tutorialController: TutorialControllerState = {
  stepIndex: 0,
  pageIndex: 0,
  pageTime: 0,
  stepTimer: 0,
  anchorIndex: 0,
  currentPos: { x: 12, y: 230 },
  fromPos: { x: 12, y: 230 },
  targetPos: { x: 12, y: 230 },
  slideTimer: 0,
  overlapTimer: 0,
  stepTransitionTimer: 0.2,
  firstWaterTapDone: false,
  wrongTaps: [],
  nudgeActive: false,
  nudgeTimer: 0,
  nudgeTime: 0,
  boxRect: { x: 12, y: 230, w: 156, h: 58 },
};

export function resetTutorialController() {
  tutorialController.stepIndex = 0;
  tutorialController.pageIndex = 0;
  tutorialController.pageTime = 0;
  tutorialController.stepTimer = 0;
  tutorialController.anchorIndex = 0;
  tutorialController.currentPos = { x: 12, y: 230 };
  tutorialController.fromPos = { x: 12, y: 230 };
  tutorialController.targetPos = { x: 12, y: 230 };
  tutorialController.slideTimer = 0;
  tutorialController.overlapTimer = 0;
  tutorialController.stepTransitionTimer = 0.2;
  tutorialController.firstWaterTapDone = false;
  tutorialController.wrongTaps = [];
  tutorialController.nudgeActive = false;
  tutorialController.nudgeTimer = 0;
  tutorialController.nudgeTime = 0;
  tutorialController.boxRect = { x: 12, y: 230, w: 156, h: 58 };
}

export function resetTutorialControllerForStep(stepNumber: number) {
  tutorialController.stepIndex = stepNumber - 1;
  tutorialController.pageIndex = 0;
  tutorialController.pageTime = 0;
  tutorialController.stepTimer = 0;
  tutorialController.stepTransitionTimer = 0.2;
  tutorialController.firstWaterTapDone = false;
  tutorialController.nudgeActive = false;
  tutorialController.nudgeTimer = 0;
  tutorialController.nudgeTime = 0;
}

export function recordWrongTap() {
  const now = performance.now();
  tutorialController.wrongTaps.push(now);
  tutorialController.wrongTaps = tutorialController.wrongTaps.filter(t => now - t <= 4000);
  if (tutorialController.wrongTaps.length >= 3) {
    tutorialController.wrongTaps = [];
    tutorialController.nudgeActive = true;
    tutorialController.nudgeTimer = 2.5;
    tutorialController.nudgeTime = 0;
  }
}

export function tutorialAllow(targetId: string, gs?: GameState): boolean {
  if (!gs || !gs.isTutorial || gs.tutorialStep === 0) return true;
  const step = CONFIG.TUTORIAL[gs.tutorialStep - 1];
  if (!step || !step.allow) return true;

  if (targetId === 'dialogue:advance') return true;

  if (step.allow.includes(targetId)) return true;

  for (const a of step.allow) {
    if (targetId === a) return true;
    if (a.endsWith(':*') && targetId.startsWith(a.slice(0, -1))) return true;
    if (targetId.startsWith(a + ':')) return true;
  }

  return false;
}

export function getTutorialTargetRect(gs: GameState): { rect: Rect | null; type: 'ui' | 'water' | 'entity' | null } {
  if (!gs.isTutorial || gs.tutorialStep === 0) return { rect: null, type: null };

  const step = CONFIG.TUTORIAL[gs.tutorialStep - 1];
  if (!step) return { rect: null, type: null };

  const progress = gs.shop.animTimer || 0;
  const easeOut = 1 - Math.pow(1 - progress, 2);
  const mX = 250 + (1 - easeOut) * 150; // drawer X
  const mY = 30;
  const mW = 150;
  const mH = 240;
  const ribH = 20;
  const tabY = mY + ribH + 3;
  const tabStartX = mX + Math.floor((mW - 3 * 44) / 2);
  const contentY = tabY + 15 + 4;
  const scrollOffset = gs.shop.scrollOffset || 0;

  switch (step.id) {
    case 'welcome':
      return { rect: null, type: null };

    case 'buyFish': {
      if (!gs.shop.open && progress <= 0) {
        return { rect: { x: 45, y: 3, w: 52, h: 24 }, type: 'ui' };
      }
      if (gs.shop.selectedCategory !== 'pets') {
        return { rect: { x: tabStartX, y: tabY, w: 44, h: 15 }, type: 'ui' };
      }
      if (gs.shop.selectedItemId !== 'buyFish') {
        return { rect: { x: mX + 5, y: contentY + 2 - scrollOffset, w: 67, h: 48 }, type: 'ui' };
      }
      return { rect: { x: mX + 10, y: mY + mH - 18 - 5, w: mW - 20, h: 18 }, type: 'ui' };
    }

    case 'feed':
      return { rect: { x: 6, y: 36, w: 388, h: 234 }, type: 'water' };

    case 'alien': {
      const alien = gs.aliens.find(a => !a.dead);
      if (alien) {
        const ar = (CONFIG.alienRadius || 24) / 2;
        return {
          rect: {
            x: Math.round(alien.x / 2) - ar,
            y: Math.round(alien.y / 2) - ar,
            w: ar * 2,
            h: ar * 2,
          },
          type: 'entity',
        };
      }
      return { rect: null, type: null };
    }

    case 'coins': {
      const coin = gs.coins.find(c => !c.dead && !c.collected);
      if (coin) {
        return { rect: { x: Math.round(coin.x / 2) - 8, y: Math.round(coin.y / 2) - 8, w: 16, h: 16 }, type: 'entity' };
      }
      return { rect: null, type: null };
    }

    case 'grow':
      return { rect: { x: 6, y: 36, w: 388, h: 258 }, type: 'water' };

    case 'foodLimit': {
      if (!gs.shop.open && progress <= 0) {
        return { rect: { x: 45, y: 3, w: 52, h: 24 }, type: 'ui' };
      }
      if (gs.shop.selectedCategory !== 'upgrades') {
        return { rect: { x: tabStartX + 44, y: tabY, w: 44, h: 15 }, type: 'ui' };
      }
      if (gs.shop.selectedItemId !== 'foodLimit') {
        return { rect: { x: mX + 8, y: 73 - Math.floor(scrollOffset / 2), w: 67, h: 50 }, type: 'ui' };
      }
      return { rect: { x: mX + 10, y: mY + mH - 18 - 5, w: mW - 20, h: 18 }, type: 'ui' };
    }

    case 'egg':
    case 'hatch':
      return { rect: { x: 100, y: 3, w: 176, h: 24 }, type: 'ui' };

    case 'complete':
    case 'finish':
      return { rect: null, type: null };

    default:
      return { rect: null, type: null };
  }
}

function rectsIntersect(a: Rect, b: Rect): boolean {
  return !(a.x + a.w <= b.x || a.x >= b.x + b.w || a.y + a.h <= b.y || a.y >= b.y + b.h);
}

function doesAnchorOverlap(
  anchor: { x: number; y: number },
  highlightRect: Rect | null,
  gs: GameState,
  allowedTapZone: Rect | null
): boolean {
  const pad = 8;
  const boxRectWithPad: Rect = {
    x: anchor.x - pad,
    y: anchor.y - pad,
    w: 156 + pad * 2,
    h: 58 + pad * 2,
  };
  const boxRectNoPad: Rect = {
    x: anchor.x,
    y: anchor.y,
    w: 156,
    h: 58,
  };

  // 1. Highlight rect (overlap)
  if (highlightRect && rectsIntersect(boxRectNoPad, highlightRect)) {
    return true;
  }

  // 2. Active coins (within 8 UI px)
  for (const c of gs.coins) {
    if (!c.dead && !c.collected) {
      const cx = c.x / 2;
      const cy = c.y / 2;
      if (cx >= boxRectWithPad.x && cx <= boxRectWithPad.x + boxRectWithPad.w && cy >= boxRectWithPad.y && cy <= boxRectWithPad.y + boxRectWithPad.h) {
        return true;
      }
    }
  }

  // 3. Active aliens (within 8 UI px)
  for (const a of gs.aliens) {
    if (!a.dead) {
      const ax = a.x / 2;
      const ay = a.y / 2;
      const ar = (CONFIG.alienRadius || 24) / 2;
      const closestX = Math.max(boxRectNoPad.x, Math.min(ax, boxRectNoPad.x + boxRectNoPad.w));
      const closestY = Math.max(boxRectNoPad.y, Math.min(ay, boxRectNoPad.y + boxRectNoPad.h));
      const dist = Math.hypot(ax - closestX, ay - closestY);
      if (dist <= ar + pad) {
        return true;
      }
    }
  }

  // 4. Active pellets (within 8 UI px)
  for (const p of gs.food) {
    if (!p.dead) {
      const px = p.x / 2;
      const py = p.y / 2;
      if (px >= boxRectWithPad.x && px <= boxRectWithPad.x + boxRectWithPad.w && py >= boxRectWithPad.y && py <= boxRectWithPad.y + boxRectWithPad.h) {
        return true;
      }
    }
  }

  // 5. Allowed tap zone if UI target (overlap)
  if (allowedTapZone && rectsIntersect(boxRectNoPad, allowedTapZone)) {
    return true;
  }

  return false;
}

export function updateTutorialController(dt: number, gs: GameState) {
  if (!gs.isTutorial || gs.tutorialStep === 0) return;

  tutorialController.stepTimer += dt;
  tutorialController.pageTime += dt;

  if (tutorialController.nudgeActive) {
    tutorialController.nudgeTime += dt;
    tutorialController.nudgeTimer -= dt;
    if (tutorialController.nudgeTimer <= 0) {
      tutorialController.nudgeActive = false;
      tutorialController.nudgeTime = 0;
    }
  }

  if (tutorialController.stepTransitionTimer > 0) {
    tutorialController.stepTransitionTimer = Math.max(0, tutorialController.stepTransitionTimer - dt);
  }

  const targetInfo = getTutorialTargetRect(gs);
  const highlightRect = targetInfo.type === 'water' ? null : targetInfo.rect;
  const allowedTapZone = targetInfo.type === 'ui' ? targetInfo.rect : null;

  // Hysteresis: only slide if current anchor overlaps for >= 0.3s
  const currentAnchor = TUTORIAL_ANCHORS[tutorialController.anchorIndex];
  const isOverlapping = doesAnchorOverlap(currentAnchor, highlightRect, gs, allowedTapZone);

  if (isOverlapping) {
    tutorialController.overlapTimer += dt;
    if (tutorialController.overlapTimer >= 0.3) {
      let bestIndex = tutorialController.anchorIndex;
      for (let i = 0; i < TUTORIAL_ANCHORS.length; i++) {
        if (!doesAnchorOverlap(TUTORIAL_ANCHORS[i], highlightRect, gs, allowedTapZone)) {
          bestIndex = i;
          break;
        }
      }
      if (bestIndex !== tutorialController.anchorIndex) {
        tutorialController.fromPos = { ...tutorialController.currentPos };
        tutorialController.targetPos = TUTORIAL_ANCHORS[bestIndex];
        tutorialController.anchorIndex = bestIndex;
        tutorialController.slideTimer = 0.2;
      }
      tutorialController.overlapTimer = 0;
    }
  } else {
    tutorialController.overlapTimer = 0;
  }

  // Smooth slide over 0.2s
  if (tutorialController.slideTimer > 0) {
    tutorialController.slideTimer = Math.max(0, tutorialController.slideTimer - dt);
    const progress = 1 - tutorialController.slideTimer / 0.2;
    const ease = 1 - Math.pow(1 - progress, 3);
    tutorialController.currentPos.x = tutorialController.fromPos.x + (tutorialController.targetPos.x - tutorialController.fromPos.x) * ease;
    tutorialController.currentPos.y = tutorialController.fromPos.y + (tutorialController.targetPos.y - tutorialController.fromPos.y) * ease;
  } else {
    tutorialController.currentPos = { ...TUTORIAL_ANCHORS[tutorialController.anchorIndex] };
  }

  let yOffset = 0;
  if (tutorialController.stepTransitionTimer > 0) {
    const p = 1 - tutorialController.stepTransitionTimer / 0.2;
    yOffset = Math.round((1 - p) * 15);
  }

  tutorialController.boxRect = {
    x: Math.round(tutorialController.currentPos.x),
    y: Math.round(tutorialController.currentPos.y) + yOffset,
    w: 156,
    h: 58,
  };
}

export function isClickOnDialogueBox(logicalX: number, logicalY: number): boolean {
  const uiX = logicalX / 2;
  const uiY = logicalY / 2;
  const r = tutorialController.boxRect;
  return uiX >= r.x - 2 && uiX <= r.x + r.w + 2 && uiY >= r.y - 6 && uiY <= r.y + r.h + 2;
}

export function handleDialogueBoxClick(gs: GameState, advanceCallback: (gs: GameState) => void) {
  const step = CONFIG.TUTORIAL[gs.tutorialStep - 1];
  if (!step) return;

  const pageKey = step.pages[tutorialController.pageIndex] || step.pages[0];
  const fullText = tutorialController.nudgeActive ? t('tut.nudge') : t(pageKey);
  const currentTime = tutorialController.nudgeActive ? tutorialController.nudgeTime : tutorialController.pageTime;
  const charsShown = Math.floor(currentTime * 40);

  if (charsShown < fullText.length) {
    if (tutorialController.nudgeActive) {
      tutorialController.nudgeTime = fullText.length / 40;
    } else {
      tutorialController.pageTime = fullText.length / 40;
    }
    return;
  }

  if (tutorialController.nudgeActive) {
    tutorialController.nudgeActive = false;
    tutorialController.nudgeTimer = 0;
    return;
  }

  const isTapToContinue = step.gate === 'gateNext' || (step.pages.length > 1 && tutorialController.pageIndex < step.pages.length - 1);
  if (isTapToContinue) {
    if (tutorialController.pageIndex < step.pages.length - 1) {
      tutorialController.pageIndex++;
      tutorialController.pageTime = 0;
    } else if (step.gate === 'gateNext') {
      advanceCallback(gs);
    }
  }
}

let ditherPatternCanvas: HTMLCanvasElement | null = null;
let ditherPatternInstance: CanvasPattern | null = null;

export function drawDither50(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(10, 20, 30, 0.4)';
  ctx.fillRect(x, y, w, h);

  if (!ditherPatternInstance && typeof document !== 'undefined') {
    ditherPatternCanvas = document.createElement('canvas');
    ditherPatternCanvas.width = 2;
    ditherPatternCanvas.height = 2;
    const pctx = ditherPatternCanvas.getContext('2d');
    if (pctx) {
      pctx.fillStyle = PALETTE.outline;
      pctx.fillRect(0, 0, 1, 1);
      pctx.fillRect(1, 1, 1, 1);
      ditherPatternInstance = ctx.createPattern(ditherPatternCanvas, 'repeat');
    }
  }

  if (ditherPatternInstance) {
    ctx.fillStyle = ditherPatternInstance;
    ctx.fillRect(x, y, w, h);
  } else {
    ctx.fillStyle = PALETTE.outline;
    for (let dy = 0; dy < h; dy += 2) {
      for (let dx = 0; dx < w; dx += 2) {
        ctx.fillRect(x + dx + ((dy / 2) % 2 === 0 ? 0 : 1), y + dy, 1, 1);
      }
    }
  }
  ctx.restore();
}

export function renderTutorialDialogueBox(ctx: CanvasRenderingContext2D, gs: GameState) {
  let alpha = 1;
  let yOffset = 0;
  if (tutorialController.stepTransitionTimer > 0) {
    const p = 1 - tutorialController.stepTransitionTimer / 0.2;
    alpha = Math.min(1, Math.max(0, p));
    yOffset = Math.round((1 - p) * 15);
  }

  const { x, y, w, h } = tutorialController.boxRect;
  const boxX = x;
  const boxY = y + yOffset;
  const boxW = w;
  const boxH = h;

  ctx.save();
  if (alpha < 1) {
    ctx.globalAlpha = alpha;
  }

  let borderColor: string = PALETTE.woodDark;
  let bevelLight: string = PALETTE.woodLight;
  let bevelDark: string = PALETTE.sandShade;
  let faceColor: string = PALETTE.wood;
  let ribbonColor: PaletteKey = 'coral';


  // 1. Drop shadow
  ctx.fillStyle = PALETTE.outline;
  ctx.fillRect(boxX + 2, boxY + 2, boxW, boxH);

  // 2. Outer border
  ctx.fillStyle = borderColor;
  ctx.fillRect(boxX, boxY, boxW, boxH);

  // 3. Inner bevels
  ctx.fillStyle = bevelLight;
  ctx.fillRect(boxX + 1, boxY + 1, boxW - 2, 1);
  ctx.fillRect(boxX + 1, boxY + 1, 1, boxH - 2);
  ctx.fillStyle = bevelDark;
  ctx.fillRect(boxX + 1, boxY + boxH - 2, boxW - 2, 1);
  ctx.fillRect(boxX + boxW - 2, boxY + 1, 1, boxH - 2);

  // 4. Panel face
  ctx.fillStyle = faceColor;
  ctx.fillRect(boxX + 2, boxY + 2, boxW - 4, boxH - 4);

  // 5. "SHELLY" Name Ribbon straddling top edge
  const rx = boxX + 8;
  const ry = boxY - 5;
  const rw = 44;
  const rh = 11;

  ctx.fillStyle = PALETTE.outline;
  ctx.fillRect(rx - 3, ry + 2, 4, rh - 4);
  ctx.fillRect(rx + rw - 1, ry + 2, 4, rh - 4);
  ctx.fillRect(rx, ry, rw, rh);
  ctx.fillStyle = PALETTE[ribbonColor];
  ctx.fillRect(rx + 1, ry + 1, rw - 2, rh - 2);

  drawText(ctx, 'SHELLY', rx + 6, ry + 3, { font: 'small', color: 'outline' });
  drawText(ctx, 'SHELLY', rx + 5, ry + 2, { font: 'small', color: 'cream' });

  // 6. 22x22 Baked Portrait of Shelly
  const portraitX = boxX + 5;
  const portraitY = boxY + 18;

  ctx.fillStyle = borderColor;
  ctx.fillRect(portraitX - 1, portraitY - 1, 24, 24);
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(portraitX, portraitY, 22, 22);

  const isBlinking = (gs.time % 3.0) < 0.15;

  const step = CONFIG.TUTORIAL[gs.tutorialStep - 1];
  const pageKey = step ? (step.pages[tutorialController.pageIndex] || step.pages[0]) : 'tut.welcome.1';
  const fullText = tutorialController.nudgeActive ? t('tut.nudge') : t(pageKey);
  const currentTime = tutorialController.nudgeActive ? tutorialController.nudgeTime : tutorialController.pageTime;
  const charsShown = Math.floor(currentTime * 40);
  const isTyping = charsShown < fullText.length;

  const isTalking = isTyping && (Math.floor(gs.time * 4) % 2 === 1);

  let shellySprite = SPRITES.shellyNormal;
  if (isBlinking && isTalking) {
    shellySprite = SPRITES.shellyBlinkTalk;
  } else if (isBlinking) {
    shellySprite = SPRITES.shellyBlink;
  } else if (isTalking) {
    shellySprite = SPRITES.shellyTalk;
  }

  ctx.drawImage(shellySprite.normal, portraitX, portraitY);

  // 7. Text area: 122 UI px wide, up to 4 lines
  const textX = boxX + 30;
  const textY = boxY + 10;
  const textW = 122;
  const textH = 42;

  const displayText = fullText.slice(0, Math.min(charsShown, fullText.length));

  const fitted = fitText(displayText, {
    w: textW,
    h: textH,
    maxLines: 4,
    fonts: ['normal', 'small'],
    align: 'left',
    valign: 'top',
  });

  const lineHeight = fitted.font === 'small' ? 6 : 9;
  for (let l = 0; l < fitted.lines.length; l++) {
    const line = fitted.lines[l];
    drawText(ctx, line, textX + 1, textY + l * lineHeight + 1, { font: fitted.font, color: 'outline' });
    drawText(ctx, line, textX, textY + l * lineHeight, { font: fitted.font, color: 'cream' });
  }

  // 8. Blinking pixel ▼ marker
  const isTapToContinue = step && (step.gate === 'gateNext' || (step.pages.length > 1 && tutorialController.pageIndex < step.pages.length - 1));
  if (isTapToContinue && !isTyping && !tutorialController.nudgeActive) {
    if (Math.floor(gs.time * 4) % 2 === 0) {
      const mx = boxX + boxW - 10;
      const my = boxY + boxH - 8;
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(mx, my, 5, 1);
      ctx.fillRect(mx + 1, my + 1, 3, 1);
      ctx.fillRect(mx + 2, my + 2, 1, 1);
    }
  }

  ctx.restore();
}

export function renderTutorialHighlights(ctx: CanvasRenderingContext2D, gs: GameState) {
  if (!gs.isTutorial || gs.tutorialStep === 0) return;

  const targetInfo = getTutorialTargetRect(gs);
  const targetRect = targetInfo.rect;
  if (!targetRect) return;

  const freq = tutorialController.stepTimer >= 8 ? 4 : 2;
  const pulse = 0.5 + 0.5 * Math.sin(gs.time * freq * Math.PI * 2);
  const bob = Math.round(Math.sin(gs.time * freq * Math.PI * 2) * 2);
  const strokeCol = pulse > 0.5 ? PALETTE.glow : PALETTE.gold;

  if (targetInfo.type === 'ui') {
    const pad = 2;
    const cx = targetRect.x - pad;
    const cy = targetRect.y - pad;
    const cw = targetRect.w + pad * 2;
    const ch = targetRect.h + pad * 2;

    let overlayBg = 'rgba(10, 20, 30, 0.35)';
    let ditherCol: string = PALETTE.outline;

    // Viewport dim with theme's 35% checkerboard except cutout
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 400, 300);
    ctx.rect(cx, cy, cw, ch);
    ctx.clip('evenodd');

    ctx.fillStyle = overlayBg;
    ctx.fillRect(0, 0, 400, 300);

    ctx.fillStyle = ditherCol;
    for (let y = 0; y < 300; y += 4) {
      for (let x = 0; x < 400; x += 4) {
        ctx.fillRect(x + ((y / 4) % 2 === 0 ? 0 : 2), y, 2, 2);
      }
    }
    ctx.restore();

    // 2px pulsing outline at 2Hz (or 4Hz after 8s)
    ctx.fillStyle = strokeCol;
    ctx.fillRect(cx - 2, cy - 2, cw + 4, 2); // Top
    ctx.fillRect(cx - 2, cy + ch, cw + 4, 2); // Bottom
    ctx.fillRect(cx - 2, cy, 2, ch);          // Left
    ctx.fillRect(cx + cw, cy, 2, ch);         // Right

    // Bouncing 8x8 UI px arrow (2 UI px bob)
    const arrowX = cx + Math.floor(cw / 2) - 4;
    if (cy >= 16) {
      const arrowY = cy - 10 + bob;
      ctx.drawImage(SPRITES.tutorialArrow.normal, arrowX, arrowY);
    } else {
      // Below target
      const arrowY = cy + ch + 4 - bob;
      const arrowSprite = SPRITES.tutorialArrowUp ? SPRITES.tutorialArrowUp : SPRITES.tutorialArrow;
      ctx.drawImage(arrowSprite.normal, arrowX, arrowY);
    }
  } else if (targetInfo.type === 'water') {
    // Skip dim, pulsing 2 UI px border around water area (tank inside bounds: 6, 36, 388, 258)
    ctx.fillStyle = strokeCol;
    ctx.fillRect(6, 36, 388, 2);  // Top
    ctx.fillRect(6, 292, 388, 2); // Bottom
    ctx.fillRect(6, 38, 2, 254);  // Left
    ctx.fillRect(392, 38, 2, 254); // Right

    // 10x12 UI px tap-hand icon bobbing at center until first tap
    if (!tutorialController.firstWaterTapDone) {
      const hx = 200 - 5;
      const hy = 165 - 6 + bob;
      ctx.drawImage(SPRITES.tutorialHand.normal, hx, hy);
    }
  } else if (targetInfo.type === 'entity') {
    // Arrow above the live entity each frame (2 UI px bob)
    const arrowX = targetRect.x + Math.floor(targetRect.w / 2) - 4;
    const arrowY = targetRect.y - 12 + bob;
    ctx.drawImage(SPRITES.tutorialArrow.normal, arrowX, arrowY);
  }
}
