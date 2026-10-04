/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InputMode = 'touch';

export interface Action {
  type: 'tap' | 'pointerup' | 'scroll' | 'toggleShop' | 'togglePause' | 'closeTop';
  x?: number;
  y?: number;
  id?: number;
  dy?: number;
  name?: string;
  clientX?: number;
  clientY?: number;
  pointerId?: number;
}

// Global mobile input state object
export const input = {
  mode: 'touch' as InputMode,
  x: 400,
  y: 300,
  inCanvas: true,
  isMouseDown: false,
};

let lastTouchY: number | null = null;

// Registry of active listeners to prevent any duplicates
interface RegisteredListener {
  target: EventTarget;
  type: string;
  listener: any;
  options?: boolean | AddEventListenerOptions;
}
const listenerRegistry: RegisteredListener[] = [];

// Event callbacks for 'unlock'
const unlockCallbacks: (() => void)[] = [];

export function onUnlock(cb: () => void) {
  if (!unlockCallbacks.includes(cb)) {
    unlockCallbacks.push(cb);
  }
}

function emitUnlock() {
  const current = [...unlockCallbacks];
  unlockCallbacks.length = 0; // Trigger once
  for (const cb of current) {
    try {
      cb();
    } catch (err) {
      console.error('Error in unlock callback:', err);
    }
  }
}

// Action queue drained per-frame by the game loop
let actionQueue: Action[] = [];

/**
 * Register listener with the registry to avoid duplicates.
 */
function register(
  target: EventTarget,
  type: string,
  listener: any,
  options?: boolean | AddEventListenerOptions
) {
  const alreadyExists = listenerRegistry.some(
    (item) => item.target === target && item.type === type && item.listener === listener
  );
  if (alreadyExists) return;

  target.addEventListener(type, listener, options);
  listenerRegistry.push({ target, type, listener, options });
}

/**
 * Drains the action queue per-frame.
 */
export function drainActions(): Action[] {
  const current = actionQueue;
  actionQueue = [];
  return current;
}

/**
 * Manual/direct queue injector (useful for debug or simulated actions).
 */
export function queueAction(action: Action) {
  actionQueue.push(action);
}

/**
 * Main mobile input initialization.
 */
export function initializeInput(canvas: HTMLCanvasElement) {
  // Translate touch client coords to canvas 800x600 logical coords
  const getLogicalCoords = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (800 / (rect.width || 1));
    const y = (clientY - rect.top) * (600 / (rect.height || 1));
    return { x, y };
  };

  // --------------------------------------------------------------------------
  // TOUCH / POINTER EVENTS ON CANVAS
  // --------------------------------------------------------------------------

  const handlePointerDown = (e: PointerEvent) => {
    emitUnlock();
    input.isMouseDown = true;
    input.inCanvas = true;
    lastTouchY = e.clientY;

    const { x, y } = getLogicalCoords(e.clientX, e.clientY);
    input.x = x;
    input.y = y;

    actionQueue.push({
      type: 'tap',
      x,
      y,
      id: e.pointerId,
      clientX: e.clientX,
      clientY: e.clientY,
      pointerId: e.pointerId,
    });
  };

  const handlePointerMove = (e: PointerEvent) => {
    const { x, y } = getLogicalCoords(e.clientX, e.clientY);
    input.x = x;
    input.y = y;

    if (input.isMouseDown && lastTouchY !== null) {
      const deltaY = e.clientY - lastTouchY;
      if (Math.abs(deltaY) > 2) {
        actionQueue.push({
          type: 'scroll',
          dy: -deltaY * 1.5,
        });
        lastTouchY = e.clientY;
      }
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (e.isTrusted) {
      emitUnlock();
    }
    input.isMouseDown = false;
    lastTouchY = null;

    const { x, y } = getLogicalCoords(e.clientX, e.clientY);
    input.x = x;
    input.y = y;
    actionQueue.push({
      type: 'pointerup',
      x,
      y,
      clientX: e.clientX,
      clientY: e.clientY,
      pointerId: e.pointerId,
    });
  };

  const handlePointerCancel = () => {
    input.isMouseDown = false;
    lastTouchY = null;
  };

  // Register canvas touch pointer events
  register(canvas, 'pointerdown', handlePointerDown);
  register(canvas, 'pointermove', handlePointerMove);
  register(canvas, 'pointerup', handlePointerUp);
  register(canvas, 'pointercancel', handlePointerCancel);

  // Blur window -> trigger pause
  const handleBlur = () => {
    input.isMouseDown = false;
    lastTouchY = null;
    actionQueue.push({ type: 'togglePause' });
  };

  register(window, 'blur', handleBlur);
}

/**
 * Complete teardown/cleanup for tests or hot-reloads.
 */
export function shutdownInput() {
  for (const item of listenerRegistry) {
    item.target.removeEventListener(item.type, item.listener, item.options);
  }
  listenerRegistry.length = 0;
  actionQueue = [];
}
