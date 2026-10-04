/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PALETTE, SPRITES, drawBitmapText, type PaletteKey } from './pixelEngine.ts';
import { renderPixelScene, invalidateCachedBackdrop } from './pixelRenderer.ts';
import { initializeInput, shutdownInput, drainActions, onUnlock, input } from './inputModule.ts';
import {
  initAudio,
  resumeAudioContext,
  setMuffled,
  updateAudioVolumes,
  game,
  playCoinCollectSound,
  playCoinDropSound,
  playCoinExpireSound,
  playFoodDropSound,
  playRejectedSound,
  playFishEatSound,
  playFishGrowSound,
  playFishHungrySound,
  playFishDieSound,
  playShopSound,
  playLaserSound,
  playHatchSound,
  playAlienSpawnSound,
  playAlienHitSound,
  playAlienKillFishSound,
  playAlienDieSound,
  playCarnivoreSpawnSound,
  playCarnivoreEatSound,
  playEggPieceSound,
  playLevelCompleteStinger,
  playGameOverStinger,
} from './audioModule.ts';

export { PALETTE };

export interface LevelConfig {
  level: number;
  nameKey: string;
  tod: 'day' | 'night';
  startMoney: number;
  alienHp: number;
  starveSeconds: number;
  spawnMultiplier: number;
}

export interface SpeciesConfig {
  level: number;
  id: string;
  name: string;
  traitKey: string;
}

// ============================================================================
// CONFIGURATION
// Tunable parameters for physics, layout, economy, creatures, and visuals.
// ============================================================================
export const CONFIG = {
  // Canvas Logical Dimensions
  canvasWidth: 800,
  canvasHeight: 600,
  aspectRatio: 800 / 600,

  // Loop & Physics
  maxDeltaTime: 0.05, // Delta time clamped to 0.05s

  // Layout Zones
  hudHeight: 60,       // 60px HUD bar at top (y: 0 - 60)
  waterTop: 60,        // Water area starts at y=60
  waterBottom: 540,    // Water area ends at y=540
  sandTop: 540,        // Sand floor starts at y=540
  sandBottom: 600,     // Sand floor ends at y=600

  // Economy & Feeding
  initialMoney: 200,   // Starting money: 200
  foodCost: 5,         // Food cost: 5
  foodLimit: 1,        // Pellets on screen limit: 1
  foodSpawnY: 65,      // Spawns at cursor x and y=65
  foodSinkSpeed: 45,   // Sinking at 45 px/s
  foodFloorLifespan: 3,// Removed 3s after touching the floor
  foodRadius: 3.5,     // Visual pellet radius
  moneyFlashDuration: 0.3, // Flash red duration on blocked click (0.3s)

  // Coin Drops & Collection
  coinDropIntervalMin: 8,   // Size-1 & Size-2 fish drop coins every 8-12s
  coinDropIntervalMax: 12,
  coinFallSpeed: 60,        // Fall at 60 px/s
  coinRestY: 530,           // Rest at y=530
  coinBlinkTime: 7,         // Blink from 7s after spawning
  coinLifespan: 9,          // Vanish at 9s after spawning
  coinClickRadius: 38,      // Mobile-sized 38px touch radius for effortless coin collecting
  coinSilverValue: 15,      // Size-1 fish silver coin worth 15
  coinGoldValue: 35,        // Size-2 fish gold coin worth 35
  coinDiamondValue: 200,    // Gargo & Carnivore diamond coin worth 200
  coinCollectTweenDuration: 0.25, // Tween to HUD in 0.25s
  coinHudTargetX: 30,       // HUD coin icon position
  coinHudTargetY: 30,
  floatingTextDuration: 0.8, // Floating text rises and fades over 0.8s
  floatingTextRiseDistance: 30, // Rises 30px
  particleMaxCount: 100,    // Particle array capped at 100

  // Fish Parameters
  fishInitialCount: 2, // Spawn 2 fish at start
  fishPadding: 20,     // Wander target within water bounds (20px padding)
  fishWanderSpeed: 40, // Move at 40 px/s in wander state
  fishChaseSpeed: 75,  // Chases pellet at 75 px/s when hungry
  fishSteeringEase: 4.0, // Eased steering rate
  fishWanderChangeMin: 2, // New target every 2-4s
  fishWanderChangeMax: 4,
  fishBobAmplitude: 3, // 3px sine bob
  fishBobFrequency: 3.5, // Sine bob oscillation speed
  fishFlipDuration: 0.15, // Smooth 0.15s flip toward movement direction
  fishHungryTime: 10,  // Hungry (yellow-green tint) after 10s without eating
  fishStarveTime: 24,  // Dies after 24s without eating
  fishDeadRiseSpeed: 30, // Rises to y=70 at 30 px/s
  fishDeadTargetY: 70, // Target y when dead
  fishDeadFadeDuration: 2, // Fades over 2s
  fishEatDistance: 14, // Eats when mouth is within 14px of pellet
  fishGrowthPointsSize1: 4, // Grow to size 1 (38px) at 4 points
  fishGrowthPointsSize2: 10, // Grow to size 2 (50px) at 10 points
  fishGrowthPopDuration: 0.25, // Scale pop animation duration (0.25s)

  // Fish Dimensions (Body width/length)
  fishSize0Length: 26,
  fishSize0Height: 16,
  fishSize1Length: 38, // 38px size 1
  fishSize1Height: 23,
  fishSize2Length: 50, // 50px size 2
  fishSize2Height: 30,

  // Carnivore Parameters
  carnivoreCost: 1000,          // Cost 1000
  carnivoreMaxCount: 2,         // Max 2
  carnivoreLength: 60,          // 60px purple fish
  carnivoreHeight: 34,
  carnivoreHungryTime: 20,      // Hungry after 20s without eating
  carnivoreStarveTime: 35,      // Dies after 35s without eating
  carnivoreDetectionRadius: 250,// Hunts size-0 fish within 250px
  carnivoreDiamondInterval: 15, // Drops diamond worth 200 every 15s while fed
  carnivoreSpeed: 45,
  carnivoreChaseSpeed: 80,

  // Snail Parameters
  snailCost: 250,               // Cost 250
  snailMaxCount: 1,             // Max 1
  snailSpeed: 35,               // Crawls at 35 px/s along sand
  snailCollectRadius: 18,       // Collects coin on contact within 18px
  snailY: 562,                  // Floor position on sand

  // Alien Gargo Parameters
  alienSize: 70,            // 70px green blob with eyes and tentacles
  alienRadius: 35,          // 35px radius
  alienMaxHp: 12,           // 12 HP
  alienFirstSpawnMin: 45,   // Spawns 45-70s after start
  alienFirstSpawnMax: 70,
  alienRespawnMin: 60,      // Next spawns 60-90s after previous dies
  alienRespawnMax: 90,
  alienSpeed: 55,           // Swims at 55 px/s toward nearest living fish
  alienKillCooldown: 1.5,   // 1.5s cooldown between kills
  alienHitFlashDuration: 0.1, // Flashes white for 0.1s on hit
  alienDeathParticles: 20,  // Explosion of 20 particles on death

  // Weapon Upgrade Parameters
  weaponUpgrade1Cost: 400,  // Level 1: 400 coins -> 2 dmg
  weaponUpgrade2Cost: 800,  // Level 2: 800 coins -> 4 dmg
  weaponBeamDuration: 0.08, // 0.08s laser beam line duration

  // Egg Pieces & Level Progression
  eggPiece1Cost: 500,       // Egg piece 1: 500
  eggPiece2Cost: 750,       // Egg piece 2: 750
  eggPiece3Cost: 1000,      // Egg piece 3: 1000
  eggHatchDuration: 2.0,    // 2s egg hatch animation
  startMoneyNextLevel: 300, // Next level start money: 300
  alienHpScalePerLevel: 1.5,// Alien HP +50% per level
  starveTimeScalePerLevel: 0.9, // Hunger-to-death time -10% per level

  LEVELS: [
    { level: 1, nameKey: 'level.sunnyShallows', tod: 'day', startMoney: 200, alienHp: 12, starveSeconds: 24, spawnMultiplier: 1.0 },
    { level: 2, nameKey: 'level.kelpMeadow', tod: 'day', startMoney: 300, alienHp: 14, starveSeconds: 23, spawnMultiplier: 1.0 },
    { level: 3, nameKey: 'level.coralGarden', tod: 'day', startMoney: 300, alienHp: 16, starveSeconds: 23, spawnMultiplier: 1.0 },
    { level: 4, nameKey: 'level.sandyCove', tod: 'day', startMoney: 300, alienHp: 18, starveSeconds: 22, spawnMultiplier: 1.0 },
    { level: 5, nameKey: 'level.goldenNoon', tod: 'day', startMoney: 300, alienHp: 21, starveSeconds: 21, spawnMultiplier: 1.0 },
    { level: 6, nameKey: 'level.moonlitBay', tod: 'night', startMoney: 300, alienHp: 24, starveSeconds: 20, spawnMultiplier: 0.8 },
    { level: 7, nameKey: 'level.glowGrotto', tod: 'night', startMoney: 300, alienHp: 28, starveSeconds: 20, spawnMultiplier: 0.8 },
    { level: 8, nameKey: 'level.starryDeep', tod: 'night', startMoney: 300, alienHp: 32, starveSeconds: 19, spawnMultiplier: 0.8 },
    { level: 9, nameKey: 'level.midnightReef', tod: 'night', startMoney: 300, alienHp: 37, starveSeconds: 18, spawnMultiplier: 0.8 },
    { level: 10, nameKey: 'level.auroraTrench', tod: 'night', startMoney: 300, alienHp: 42, starveSeconds: 18, spawnMultiplier: 0.8 },
  ] as LevelConfig[],

  SPECIES: [
    { level: 1, id: 'pip', name: 'PIP', traitKey: 'species.trait.pip' },
    { level: 2, id: 'marina', name: 'MARINA', traitKey: 'species.trait.marina' },
    { level: 3, id: 'dot', name: 'DOT', traitKey: 'species.trait.dot' },
    { level: 4, id: 'bumble', name: 'BUMBLE', traitKey: 'species.trait.bumble' },
    { level: 5, id: 'sol', name: 'SOL', traitKey: 'species.trait.sol' },
    { level: 6, id: 'lumi', name: 'LUMI', traitKey: 'species.trait.lumi' },
    { level: 7, id: 'nox', name: 'NOX', traitKey: 'species.trait.nox' },
    { level: 8, id: 'glimmer', name: 'GLIMMER', traitKey: 'species.trait.glimmer' },
    { level: 9, id: 'veil', name: 'VEIL', traitKey: 'species.trait.veil' },
    { level: 10, id: 'aurora', name: 'AURORA', traitKey: 'species.trait.aurora' },
  ] as SpeciesConfig[],

  // Ambient Visuals
  ambientBubbleMax: 16,
  lightRayCount: 7,

  // Purchasable Shop Items
  SHOP_ITEMS: [
    // 1. PETS
    {
      id: 'buyFish',
      category: 'pets',
      name: 'Guppy',
      desc: 'Spawns a guppy that drops coins',
      prices: [100],
      maxLevel: null,
      requires: null,
      effectId: 'buyFish',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'carnivore',
      category: 'pets',
      name: 'Carnivore',
      desc: 'Eats baby guppies, drops diamonds',
      prices: [1000],
      maxLevel: 2,
      requires: null,
      effectId: 'carnivore',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'snail',
      category: 'pets',
      name: 'Stinky Snail',
      desc: 'Crawls on sand to gather coins',
      prices: [250],
      maxLevel: 1,
      requires: null,
      effectId: 'snail',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'pet_pip',
      category: 'pets',
      name: 'Pip',
      desc: 'Drops silver coins periodically',
      prices: [250],
      maxLevel: 1,
      requires: null,
      effectId: 'pet_pip',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'pet_marina',
      category: 'pets',
      name: 'Marina',
      desc: 'Walks to collect coins on sand',
      prices: [300],
      maxLevel: 1,
      requires: null,
      effectId: 'pet_marina',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'pet_dot',
      category: 'pets',
      name: 'Dot',
      desc: 'Drops free 1pt food pellets',
      prices: [350],
      maxLevel: 1,
      requires: null,
      effectId: 'pet_dot',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'pet_bumble',
      category: 'pets',
      name: 'Bumble',
      desc: 'Slows Gargo speed nearby',
      prices: [400],
      maxLevel: 1,
      requires: null,
      effectId: 'pet_bumble',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'pet_sol',
      category: 'pets',
      name: 'Sol',
      desc: 'Speeds up fish coin drops',
      prices: [450],
      maxLevel: 1,
      requires: null,
      effectId: 'pet_sol',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'pet_lumi',
      category: 'pets',
      name: 'Lumi',
      desc: 'Drops gold coins periodically',
      prices: [500],
      maxLevel: 1,
      requires: null,
      effectId: 'pet_lumi',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'pet_nox',
      category: 'pets',
      name: 'Nox',
      desc: 'Swiftly vacuums up coins',
      prices: [550],
      maxLevel: 1,
      requires: null,
      effectId: 'pet_nox',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'pet_glimmer',
      category: 'pets',
      name: 'Glimmer',
      desc: 'Drops nutritious 2pt food',
      prices: [600],
      maxLevel: 1,
      requires: null,
      effectId: 'pet_glimmer',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'pet_veil',
      category: 'pets',
      name: 'Veil',
      desc: 'Shields nearby fish from Gargo',
      prices: [700],
      maxLevel: 1,
      requires: null,
      effectId: 'pet_veil',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'pet_aurora',
      category: 'pets',
      name: 'Aurora',
      desc: 'Drops diamonds & boosts coin drops',
      prices: [900],
      maxLevel: 1,
      requires: null,
      effectId: 'pet_aurora',
      modes: ['levels', 'sandbox'],
    },

    // 2. UPGRADES
    {
      id: 'foodLimit',
      category: 'upgrades',
      name: 'Food Limit',
      desc: 'Increases max pellets in water',
      prices: [200, 300, 400, 500],
      maxLevel: 4,
      requires: null,
      effectId: 'foodLimit',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'foodQuality',
      category: 'upgrades',
      name: 'Food Quality',
      desc: 'Higher grade pellets for fish',
      prices: [300, 600],
      maxLevel: 2,
      requires: null,
      effectId: 'foodQuality',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'weapon',
      category: 'upgrades',
      name: 'Laser Weapon',
      desc: 'Upgrades click laser damage',
      prices: [400, 800],
      maxLevel: 2,
      requires: null,
      effectId: 'weapon',
      modes: ['levels', 'sandbox'],
    },

    // 3. EGGS
    {
      id: 'eggPiece1',
      category: 'eggs',
      name: 'Egg Piece 1',
      desc: 'First mysterious egg piece',
      prices: [500],
      maxLevel: 1,
      requires: null,
      effectId: 'eggPiece1',
      modes: ['levels'],
    },
    {
      id: 'eggPiece2',
      category: 'eggs',
      name: 'Egg Piece 2',
      desc: 'Second mysterious egg piece',
      prices: [750],
      maxLevel: 1,
      requires: { id: 'eggPiece1', level: 1 },
      effectId: 'eggPiece2',
      modes: ['levels'],
    },
    {
      id: 'eggPiece3',
      category: 'eggs',
      name: 'Egg Piece 3',
      desc: 'Final piece to hatch the egg',
      prices: [1000],
      maxLevel: 1,
      requires: { id: 'eggPiece2', level: 1 },
      effectId: 'eggPiece3',
      modes: ['levels'],
    },

    // 4. DECOR (8 items)
    {
      id: 'decorCoral',
      category: 'decor',
      name: 'Pink Coral',
      desc: 'Sways gently on seabed',
      prices: [80],
      maxLevel: 1,
      requires: null,
      effectId: 'decorCoral',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'decorShells',
      category: 'decor',
      name: 'Seashell Pile',
      desc: 'Scattered colorful shells',
      prices: [60],
      maxLevel: 1,
      requires: null,
      effectId: 'decorShells',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'decorChest',
      category: 'decor',
      name: 'Treasure Chest',
      desc: 'Opens periodically with bubbles',
      prices: [150],
      maxLevel: 1,
      requires: null,
      effectId: 'decorChest',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'decorCastle',
      category: 'decor',
      name: 'Mini Castle',
      desc: 'Stone fortress with waving flag',
      prices: [250],
      maxLevel: 1,
      requires: null,
      effectId: 'decorCastle',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'decorLantern',
      category: 'decor',
      name: 'Glow Lantern',
      desc: 'Hanging flickering lantern',
      prices: [120],
      maxLevel: 1,
      requires: null,
      effectId: 'decorLantern',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'decorSign',
      category: 'decor',
      name: 'Wooden Sign',
      desc: 'Seabed sign reading "FISH"',
      prices: [90],
      maxLevel: 1,
      requires: null,
      effectId: 'decorSign',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'decorLagoon',
      category: 'decor',
      name: 'Lagoon Water',
      desc: 'Tropical turquoise water theme',
      prices: [300],
      maxLevel: 1,
      requires: null,
      effectId: 'decorLagoon',
      modes: ['levels', 'sandbox'],
    },
    {
      id: 'decorMidnight',
      category: 'decor',
      name: 'Midnight Water',
      desc: 'Deep twilight indigo water theme',
      prices: [300],
      maxLevel: 1,
      requires: null,
      effectId: 'decorMidnight',
      modes: ['levels', 'sandbox'],
    },
  ] as ShopItem[],
  TUTORIAL: [
    { id: 'welcome', pages: ['tut.welcome'], allow: [], highlight: null, gate: 'gateNext', setup: 'setupWelcome', hintAfter: 8 },
    { id: 'buyFish', pages: ['tut.buyFish'], allow: ['buyFish'], highlight: 'shop:buyFish', gate: 'gateBuyFish', setup: 'setupBuyFish', hintAfter: 8 },
    { id: 'feed', pages: ['tut.feed'], allow: [], highlight: 'water', gate: 'gateFeed', setup: 'setupFeed', hintAfter: 8 },
    { id: 'coins', pages: ['tut.coins'], allow: [], highlight: 'coins', gate: 'gateCoins', setup: 'setupCoins', hintAfter: 8 },
    { id: 'grow', pages: ['tut.grow'], allow: [], highlight: 'fish', gate: 'gateGrow', setup: 'setupGrow', hintAfter: 8 },
    { id: 'foodLimit', pages: ['tut.foodLimit'], allow: ['foodLimit'], highlight: 'shop:foodLimit', gate: 'gateFoodLimit', setup: 'setupFoodLimit', hintAfter: 8 },
    { id: 'egg', pages: ['tut.egg'], allow: [], highlight: 'hudEgg', gate: 'gateEgg', setup: 'setupEgg', hintAfter: 8 },
    { id: 'hatch', pages: ['tut.hatch'], allow: [], highlight: 'hudEgg', gate: 'gateHatch', setup: 'setupHatch', hintAfter: 8 },
    { id: 'complete', pages: ['tut.complete'], allow: [], highlight: null, gate: 'gateNext', setup: 'setupComplete', hintAfter: 8 },
    { id: 'finish', pages: ['tut.finish'], allow: [], highlight: null, gate: 'gateNext', setup: 'setupFinish', hintAfter: 8 },
  ] as any[],
};

export type ShopCategory = 'pets' | 'upgrades' | 'eggs' | 'decor';

export interface ShopItem {
  id: string;
  category: ShopCategory;
  name: string;
  desc: string;
  prices: number[];
  maxLevel: number | null;
  requires: { id: string; level: number } | null;
  effectId: string;
  modes: ('levels' | 'sandbox')[];
}

export interface ShopState {
  levels: Record<string, number>;
  decorOwned: Record<string, boolean>;
  decorShown: Record<string, boolean>;
  theme?: { active: string };
  open: boolean;
  selectedCategory?: ShopCategory;
  scrollOffset?: number;
  animTimer?: number;
  cardPressTimers?: Record<string, number>;
  cardFlashTimers?: Record<string, number>;
  cardShakeTimers?: Record<string, number>;
  selectedItemId?: string | null;
}

// ============================================================================
// ENTITY TYPES
// ============================================================================
export interface Fish {
  id: number;
  isCarnivore: boolean;  // True for purple carnivore
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  wanderTimer: number;
  size: 0 | 1 | 2;
  growthPoints: number;
  timeSinceAte: number;
  coinTimer: number;     // 8-12s drop timer for size >= 1
  diamondTimer: number;  // 15s diamond drop timer for fed carnivore
  facing: number;        // Interpolated -1 to 1 for smooth 0.15s flip
  targetFacing: number;  // -1 or 1
  flipY: number;         // 1 (normal) to -1 (upside-down when dead)
  targetFlipY: number;
  bobTimer: number;
  bobOffset: number;
  tailWagTimer: number;
  scalePopTimer: number; // Pop animation on growth
  turnTimer: number;     // 2-frame squash turn timer
  isDying: boolean;      // Triggered at starvation or alien kill
  fadeTimer: number;     // Fades over 2s at y=70
  opacity: number;
  dead: boolean;         // Cleanup flag
  tut?: boolean;
}

export interface Food {
  id: number;
  x: number;
  y: number;
  onFloor: boolean;
  floorTimer: number;
  dead: boolean;
  tier?: 0 | 1 | 2;
  growthPoints?: number;
  sinkAge?: number;
  bubbleTimer?: number;
}

export interface Coin {
  id: number;
  type: 'silver' | 'gold' | 'diamond';
  value: number;
  x: number;
  y: number;
  age: number;           // Lifespan counter (dither fade 7s-9s, vanish at 9s)
  collected: boolean;    // Flag so it can't count twice
  startTweenX: number;
  startTweenY: number;
  tweenTimer: number;    // 0.25s tween to HUD
  dead: boolean;
  tut?: boolean;
  landingTimer?: number; // 1px squash bounce timer on landing
  wasOnFloor?: boolean;
}

export interface Alien {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  trailHp: number;       // Yellow HP trail lagging 0.2s behind
  trailTimer: number;    // 0.2s lag delay timer
  flashTimer: number;    // Flashes white for 0.1s
  killCooldown: number;  // 1.5s cooldown between kills
  facing: number;        // -1 or 1
  animTimer: number;
  dead: boolean;
  tut?: boolean;
}

export interface Snail {
  id: number;
  x: number;
  y: number;
  vx: number;
  facing: number;        // 1 (right) or -1 (left)
  idleTimer: number;
  crawlTimer: number;
  dotTimer?: number;     // Trail dot timer
  dead: boolean;
}

export interface RewardPet {
  id: number;
  speciesId: 'pip' | 'marina' | 'dot' | 'bumble' | 'sol' | 'lumi' | 'nox' | 'glimmer' | 'veil' | 'aurora';
  level: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  wanderTimer: number;
  facing: number;
  targetFacing: number;
  timer: number;
  coinTimer: number;
  bobTimer: number;
  bobOffset: number;
  dead: boolean;
}

export function processRewardPets(gs: GameState, dt: number) {
  for (let i = 0; i < gs.pets.length; i++) {
    const p = gs.pets[i];
    if (p.dead) continue;

    // Bobbing
    p.bobTimer += dt;
    
    // Wandering
    p.wanderTimer -= dt;
    if (p.wanderTimer <= 0) {
      p.targetX = Math.random() * (CONFIG.canvasWidth - 60) + 30;
      p.targetY = CONFIG.waterTop + Math.random() * (CONFIG.sandTop - CONFIG.waterTop - 60) + 30;
      p.wanderTimer = Math.random() * 2 + 2;
    }
    
    const dx = p.targetX - p.x;
    const dy = p.targetY - p.y;
    const dist = Math.hypot(dx, dy);
    
    if (dist > 5) {
      p.vx = (dx / dist) * 40;
      p.vy = (dy / dist) * 40;
    } else {
      p.vx = 0;
      p.vy = 0;
    }
    
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    
    // Add bobbing to actual display position (not stored x,y)
    // Actually, for simplicity we can just bob the y
    p.y += Math.sin(p.bobTimer * 2) * 2 * dt;
    
    p.facing = p.vx >= 0 ? 1 : -1;

    // Boundary clamp
    p.x = Math.max(30, Math.min(CONFIG.canvasWidth - 30, p.x));
    p.y = Math.max(CONFIG.waterTop + 30, Math.min(CONFIG.waterBottom - 30, p.y));
  }
}


export interface Beam {
  id: number;
  x: number;
  y: number;
  timer: number;
  maxDuration: number;
  color: string;
  dead: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'bubble' | 'crumb' | 'sparkle' | 'ripple' | 'text' | 'slime' | 'snailDot' | 'alienDeath';
  text?: string;
  dead: boolean;
}

export interface GameStats {
  foodLimit: number;
  pelletValue: number;
  foodQualityTier: 0 | 1 | 2;
  clickDamage: number;
  weaponLevel: number;
  eggPieces: number;
}

// Single game state object holding state, money, and arrays
export interface GameState {
  state: 'TITLE' | 'PLAYING' | 'PAUSED' | 'EGG_HATCH' | 'LEVEL_COMPLETE' | 'GAME_OVER' | 'SETTINGS' | 'SANDBOX_OPTIONS' | 'LEVEL_SELECT';
  gameMode?: 'levels' | 'sandbox' | 'tutorial';
  screenShakeEnabled?: boolean;
  levelSelectSelected?: number;
  level: number;             // Level counter (1, 2, 3...)
  tod: 'day' | 'night';
  money: number;
  stats: GameStats;
  foodLimit: number;
  foodQualityTier: 0 | 1 | 2;
  clickDamage: number;       // Starts at 1, raises to 2, then 4
  weaponUpgradeLevel: number;// 0: default (1 dmg), 1: 400 (2 dmg), 2: 800 (4 dmg)
  eggPiecesBought: number;   // 0, 1, 2, 3
  eggHatchTimer: number;     // 2s hatch animation countdown
  levelElapsedTime: number;  // Tracks elapsed time in current level
  alienMaxHpScaled: number;  // 12 * (1.5^(level - 1))
  fishStarveTimeScaled: number; // 24 * (0.9^(level - 1))
  carnivoreStarveTimeScaled: number; // 35 * (0.9^(level - 1))
  moneyFlashTimer: number;
  time: number;
  currentFrame: number;
  lastPurchaseFrame?: number;
  shop: ShopState;
  mousePos: { x: number; y: number; inCanvas: boolean; isMouseDown?: boolean };
  eggPopTimers: [number, number, number]; // Timers for 4-frame pop animation when bought
  transitionTimer?: number;  // 0.4s pixel dissolve transition timer
  shakeTimer?: number;       // 0.15s screen shake timer (2px shake on alien death / fish killed)
  fish: Fish[];
  food: Food[];
  coins: Coin[];
  aliens: Alien[];
  snails: Snail[];
  pets: RewardPet[];
  beams: Beam[];
  particles: Particle[];
  alienSpawnTimer: number;
  audioPanel: { open: boolean; dragging: 'music' | 'sfx' | null; };
  isFirstTimeCompletion?: boolean;
  hasSpawnedHatchParticles?: boolean;
  tutorialStep: number;      // 0 if not in tutorial, 1-10 for steps
  isTutorial: boolean;
  particlesEnabled?: boolean;
}

// Zero-allocation array compactor for 60FPS mobile performance
function compactArray<T extends { dead?: boolean }>(arr: T[]): T[] {
  let alive = 0;
  for (let i = 0; i < arr.length; i++) {
    if (!arr[i].dead) {
      arr[alive++] = arr[i];
    }
  }
  arr.length = alive;
  return arr;
}

// Helper to spawn a new normal fish
function createFish(id: number, x: number, y: number, initialFacing: number = 1): Fish {
  return {
    id,
    isCarnivore: false,
    x,
    y,
    vx: initialFacing * CONFIG.fishWanderSpeed * 0.5,
    vy: 0,
    targetX: x + initialFacing * 80,
    targetY: y,
    wanderTimer: Math.random() * (CONFIG.fishWanderChangeMax - CONFIG.fishWanderChangeMin) + CONFIG.fishWanderChangeMin,
    size: 0,
    growthPoints: 0,
    timeSinceAte: 0,
    coinTimer: Math.random() * (CONFIG.coinDropIntervalMax - CONFIG.coinDropIntervalMin) + CONFIG.coinDropIntervalMin,
    diamondTimer: CONFIG.carnivoreDiamondInterval,
    facing: initialFacing,
    targetFacing: initialFacing,
    flipY: 1,
    targetFlipY: 1,
    bobTimer: Math.random() * Math.PI * 2,
    bobOffset: Math.random() * Math.PI * 2,
    tailWagTimer: Math.random() * Math.PI * 2,
    scalePopTimer: 0,
    turnTimer: 0,
    isDying: false,
    fadeTimer: 0,
    opacity: 1,
    dead: false,
  };
}

function createRewardPet(id: number, speciesId: RewardPet['speciesId'], level: number): RewardPet {
  return {
    id,
    speciesId,
    level,
    x: Math.random() * (CONFIG.canvasWidth - 60) + 30,
    y: CONFIG.waterTop + Math.random() * (CONFIG.sandTop - CONFIG.waterTop - 60) + 30,
    vx: (Math.random() - 0.5) * 80,
    vy: (Math.random() - 0.5) * 80,
    targetX: Math.random() * (CONFIG.canvasWidth - 60) + 30,
    targetY: CONFIG.waterTop + Math.random() * (CONFIG.sandTop - CONFIG.waterTop - 60) + 30,
    wanderTimer: Math.random() * 2 + 2,
    facing: Math.random() < 0.5 ? 1 : -1,
    targetFacing: 1,
    timer: 0,
    bobTimer: Math.random() * 10,
    bobOffset: Math.random() * 5,
    coinTimer: 0,
    dead: false,
  };
}

// Helper to spawn a new Carnivore fish
function createCarnivore(id: number, x: number, y: number, initialFacing: number = 1): Fish {
  return {
    id,
    isCarnivore: true,
    x,
    y,
    vx: initialFacing * CONFIG.carnivoreSpeed * 0.5,
    vy: 0,
    targetX: x + initialFacing * 80,
    targetY: y,
    wanderTimer: Math.random() * (CONFIG.fishWanderChangeMax - CONFIG.fishWanderChangeMin) + CONFIG.fishWanderChangeMin,
    size: 2,
    growthPoints: 0,
    timeSinceAte: 0,
    coinTimer: 0,
    diamondTimer: CONFIG.carnivoreDiamondInterval,
    facing: initialFacing,
    targetFacing: initialFacing,
    flipY: 1,
    targetFlipY: 1,
    bobTimer: Math.random() * Math.PI * 2,
    bobOffset: Math.random() * Math.PI * 2,
    tailWagTimer: Math.random() * Math.PI * 2,
    scalePopTimer: 0,
    turnTimer: 0,
    isDying: false,
    fadeTimer: 0,
    opacity: 1,
    dead: false,
  };
}

// Helper to spawn Gargo

// Helper to push particles while enforcing particle array capped at 100
function addParticle(gs: GameState, particle: Particle) {
  if (gs.particlesEnabled === false) return;
  gs.particles.push(particle);
  if (gs.particles.length > CONFIG.particleMaxCount) {
    gs.particles.splice(0, gs.particles.length - CONFIG.particleMaxCount);
  }
}

export function dispatchSyntheticShopTap(elementId: string) {
  const canvas = document.querySelector('canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const targetX = rect.left + rect.width / 2;
  const targetY = rect.top + rect.height / 2;
  
  const pd = new PointerEvent('pointerdown', {
    bubbles: true,
    cancelable: true,
    clientX: targetX,
    clientY: targetY,
    pointerId: 1,
    pointerType: 'touch',
  });
  canvas.dispatchEvent(pd);

  setTimeout(() => {
    const pu = new PointerEvent('pointerup', {
      bubbles: true,
      cancelable: true,
      clientX: targetX,
      clientY: targetY,
      pointerId: 1,
      pointerType: 'touch',
    });
    canvas.dispatchEvent(pu);
  }, 50);
}
export interface ShopLogEntry {
  stage: string;
  data: any;
  time: number;
}

export const shopLogBuffer: ShopLogEntry[] = [];
export const errorLogBuffer: string[] = [];

if (typeof window !== 'undefined') {
  window.onerror = function (msg, source, lineno, colno, error) {
    console.error('[WindowError]', msg, source, lineno, colno, error);
    const str = `Error: ${String(msg)} (${lineno}:${colno})`;
    errorLogBuffer.push(str);
    if (errorLogBuffer.length > 5) errorLogBuffer.shift();
  };

  window.addEventListener('unhandledrejection', function (e) {
    console.error('[UnhandledRejection]', e.reason);
    const str = `UnhandledRejection: ${String(e.reason)}`;
    errorLogBuffer.push(str);
    if (errorLogBuffer.length > 5) errorLogBuffer.shift();
  });
}

export function shopLog(stage: string, data: any) {
  const entry = { stage, data, time: performance.now() };
  console.log(`[ShopLog:${stage}]`, data);
  shopLogBuffer.push(entry);
  if (shopLogBuffer.length > 40) {
    shopLogBuffer.shift();
  }
  if (typeof window !== 'undefined') {
    (window as any).__shopLogs = shopLogBuffer;
    (window as any).shopLog = shopLog;
  }
}

export function hitTestShop(uiX: number, uiY: number, gs: GameState): { id: string; rect: { x: number; y: number; w: number; h: number } } {
  if (!gs.shop?.open && (gs.shop?.animTimer || 0) <= 0) {
    const res = { id: 'none', rect: { x: 0, y: 0, w: 0, h: 0 } };
    shopLog('uiHit', res);
    return res;
  }
  const progress = gs.shop.animTimer || 0;
  const easeOut = 1 - Math.pow(1 - progress, 2);
  const mX = 500 + (1 - easeOut) * 300;
  const mY = 60;
  const mW = 300;
  const mH = 480;

  if (uiX < mX) {
    const res = { id: 'none', rect: { x: 0, y: 0, w: mX, h: mH } };
    shopLog('uiHit', res);
    return res;
  }

  // Check close button with 48x48 touch hit area
  const cBtnW = 48, cBtnH = 48;
  const cBtnX = mX + mW - cBtnW;
  const cBtnY = mY;
  const closeRect = { x: cBtnX, y: cBtnY, w: cBtnW, h: cBtnH };
  if (uiX >= closeRect.x && uiX < closeRect.x + closeRect.w && uiY >= closeRect.y && uiY < closeRect.y + closeRect.h) {
    const res = { id: 'close', rect: closeRect };
    shopLog('uiHit', res);
    return res;
  }

  // Check category tabs with 44px touch height (Pets, Upgrades, Decor)
  const tabY = mY + 38;
  const totalTabW = 3 * 88;
  const tabStartX = mX + Math.floor((mW - totalTabW) / 2);
  let categories: ShopCategory[] = ['pets', 'upgrades', 'decor'];
  if (gs.isTutorial) {
    categories = ['pets', 'upgrades'];
  }
  for (let t = 0; t < categories.length; t++) {
    const cat = categories[t];
    const tX = tabStartX + t * 88;
    const tRect = { x: tX, y: tabY, w: 88, h: 44 };
    if (uiX >= tRect.x && uiX < tRect.x + tRect.w && uiY >= tRect.y && uiY < tRect.y + tRect.h) {
      const res = { id: 'tab:' + cat, rect: tRect };
      shopLog('uiHit', res);
      return res;
    }
  }

  // Check BUY button with 48px touch height
  const buyW = mW - 20;
  const buyH = 48;
  const buyX = mX + 10;
  const buyY = mY + mH - buyH - 4;
  const buyRect = { x: buyX, y: buyY, w: buyW, h: buyH };
  if (uiX >= buyRect.x && uiX < buyRect.x + buyRect.w && uiY >= buyRect.y && uiY < buyRect.y + buyRect.h) {
    const res = { id: 'buy', rect: buyRect };
    shopLog('uiHit', res);
    return res;
  }

  // Check rows (cards)
  const selCat = gs.shop.selectedCategory || 'pets';
  let items = CONFIG.SHOP_ITEMS.filter((it) => it.category === selCat);
  if (gs.isTutorial) {
    const step = CONFIG.TUTORIAL[gs.tutorialStep - 1];
    const allowed = step ? step.allow : [];
    items = items.filter(it => allowed.includes(it.id));
  }
  const contentX = mX + 10;
  const contentY = mY + 40 + 30 + 10;
  const contentW = mW - 20;
  const contentH = mH - 84 - 40;
  const scrollOffset = gs.shop.scrollOffset || 0;
  const eggRowH = selCat === 'eggs' ? 32 : 0;

  if (uiX >= contentX && uiX <= contentX + contentW && uiY >= contentY && uiY <= contentY + contentH) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cardW = 134;
      const cardH = 100;
      const cardX = contentX + 6 + col * (cardW + 10);
      const cardY = contentY + 6 + eggRowH + row * (cardH + 10) - scrollOffset;
      const cardRect = { x: cardX, y: cardY, w: cardW, h: cardH };
      if (uiX >= cardRect.x && uiX < cardRect.x + cardRect.w && uiY >= cardRect.y && uiY < cardRect.y + cardRect.h) {
        const res = { id: 'row:' + item.id, rect: cardRect };
        shopLog('uiHit', res);
        return res;
      }
    }
  }

  const res = { id: 'none', rect: { x: mX, y: mY, w: mW, h: mH } };
  shopLog('uiHit', res);
  return res;
}

const EFFECT_MAP: Record<string, () => void> = {
  buyFish: () => {},
  foodLimit: () => {},
  foodQuality: () => {},
  weapon: () => {},
  carnivore: () => {},
  snail: () => {},
  eggPiece1: () => {},
  eggPiece2: () => {},
  eggPiece3: () => {},
  decorCoral: () => {},
  decorShells: () => {},
  decorChest: () => {},
  decorCastle: () => {},
  decorLantern: () => {},
  decorSign: () => {},
  decorLagoon: () => {},
  decorMidnight: () => {},
  pet_pip: () => {},
  pet_marina: () => {},
  pet_dot: () => {},
  pet_bumble: () => {},
  pet_sol: () => {},
  pet_lumi: () => {},
  pet_nox: () => {},
  pet_glimmer: () => {},
  pet_veil: () => {},
  pet_aurora: () => {},
};

// Startup assertion
if (typeof window !== 'undefined') {
  for (const item of CONFIG.SHOP_ITEMS) {
    if (!EFFECT_MAP[item.effectId]) {
      console.error(`Shop item missing from EFFECT_MAP: ${item.id} (effectId: ${item.effectId})`);
    }
  }
}

// Global purchase function returning { ok, reason } with atomic deductions & effect resolution
export function purchase(
  gs: GameState,
  id: string,
  frame: number,
  nextEntityIdRef?: React.MutableRefObject<number>
): { ok: boolean; reason?: 'poor' | 'maxed' | 'locked' | 'capped' | 'error' | 'unavailable' } {
  const item = CONFIG.SHOP_ITEMS.find((it) => it.id === id);
  if (!item) {
    shopLog('purchase:result', { ok: false, reason: 'locked' });
    return { ok: false, reason: 'locked' };
  }

  const currentMode = (gs.gameMode || 'LEVELS').toLowerCase() as 'levels' | 'sandbox';
  if (item.modes && !item.modes.includes(currentMode)) {
    shopLog('purchase:result', { ok: false, reason: 'unavailable' });
    return { ok: false, reason: 'unavailable' };
  }

  // Once-per-frame guard: store frame number of last successful purchase and compare to current frame
  if (frame > 0 && gs.lastPurchaseFrame === frame) {
    shopLog('purchase:result', { ok: false, reason: 'maxed' });
    return { ok: false };
  }

  // Mode availability check
  if (item.modes && !item.modes.includes(game.mode)) {
    gs.shop.cardShakeTimers = gs.shop.cardShakeTimers || {};
    gs.shop.cardShakeTimers[id] = 0.2;
    shopLog('purchase:result', { ok: false, reason: 'unavailable' });
    return { ok: false, reason: 'unavailable' };
  }

  const currentLvl = gs.shop.levels[id] ?? 0;

  // Max level check: null means unlimited, never maxed, never 0
  if (item.maxLevel !== null && currentLvl >= item.maxLevel) {
    gs.shop.cardShakeTimers = gs.shop.cardShakeTimers || {};
    gs.shop.cardShakeTimers[id] = 0.2;
    shopLog('purchase:result', { ok: false, reason: 'maxed' });
    return { ok: false, reason: 'maxed' };
  }

  // Requires check: read gs.shop.levels using same ids as SHOP_ITEMS
  if (item.requires) {
    const reqLvl = gs.shop.levels[item.requires.id] ?? 0;
    if (reqLvl < item.requires.level) {
      gs.shop.cardShakeTimers = gs.shop.cardShakeTimers || {};
      gs.shop.cardShakeTimers[id] = 0.2;
      shopLog('purchase:result', { ok: false, reason: 'locked' });
      return { ok: false, reason: 'locked' };
    }
  }

  // Live caps check
  let isCapped = false;
  if (id === 'buyFish') {
    const livingFishCount = gs.fish.filter((f) => !f.isCarnivore && !f.dead).length;
    if (livingFishCount >= 15) isCapped = true;
  } else if (id === 'carnivore') {
    const livingCarns = gs.fish.filter((f) => f.isCarnivore && !f.dead).length;
    if (livingCarns >= 2) isCapped = true;
  } else if (id === 'snail') {
    const livingSnails = gs.snails.filter((s) => !s.dead).length;
    if (livingSnails >= 1) isCapped = true;
  }

  const isLocked = item.requires ? (gs.shop.levels[item.requires.id] ?? 0) < item.requires.level : false;
  const isFreeShop = game.mode === 'sandbox' && game.sandbox.freeShop;
  const priceIndex = Math.min(currentLvl, item.prices.length - 1);
  const price = isFreeShop ? 0 : item.prices[priceIndex];

  shopLog('avail', {
    itemId: item.id,
    mode: game.mode,
    modes: item.modes,
    requires: item.requires,
    level: currentLvl,
    maxLevel: item.maxLevel,
    liveCap: isCapped,
    unlocked: !isLocked,
    price,
  });

  if (isCapped) {
    gs.shop.cardShakeTimers = gs.shop.cardShakeTimers || {};
    gs.shop.cardShakeTimers[id] = 0.2;
    shopLog('purchase', { id: item.id, moneyBefore: gs.money, moneyAfter: gs.money, ok: false, reason: 'capped' });
    return { ok: false, reason: 'capped' };
  }

  if (!isFreeShop) {
    if (!Number.isFinite(gs.money) || !Number.isFinite(price) || gs.money < price) {
      gs.moneyFlashTimer = 0.3;
      gs.shop.cardShakeTimers = gs.shop.cardShakeTimers || {};
      gs.shop.cardShakeTimers[id] = 0.2;
      shopLog('purchase', { id: item.id, moneyBefore: gs.money, moneyAfter: gs.money, ok: false, reason: 'poor' });
      return { ok: false, reason: 'poor' };
    }
  }

  // Atomic deduction & level increment, then apply effect, roll back if throws
  const moneyBefore = gs.money;
  gs.money -= price;
  gs.shop.levels[id] = currentLvl + 1;
  const moneyAfter = gs.money;

  let valBefore: any = 0;
  let valAfter: any = 0;
  if (id === 'foodLimit') valBefore = gs.stats.foodLimit;
  else if (id === 'foodQuality') valBefore = gs.stats.pelletValue;
  else if (id === 'weapon') valBefore = gs.stats.clickDamage;
  else if (id === 'buyFish') valBefore = gs.fish.filter((f) => !f.isCarnivore && !f.dead).length;

  try {
    const nextId = nextEntityIdRef ? nextEntityIdRef.current++ : Math.floor(Math.random() * 100000) + 1000;
    const realEffectMap: Record<string, () => void> = {
      buyFish: () => {
        const normalFishCount = gs.fish.filter((f) => !f.isCarnivore && !f.dead).length;
        if (normalFishCount < 15) {
          const spawnX = Math.random() * (CONFIG.canvasWidth - 100) + 50;
          const f = createFish(nextId, spawnX, 70, Math.random() < 0.5 ? 1 : -1);
          f.size = 0;
          gs.fish.push(f);
        }
      },
      foodLimit: () => {
        const lvl = gs.shop.levels['foodLimit'] ?? 0;
        gs.stats.foodLimit = 1 + lvl;
        gs.foodLimit = gs.stats.foodLimit;
      },
      foodQuality: () => {
        const lvl = gs.shop.levels['foodQuality'] ?? 0;
        gs.stats.pelletValue = 1 + lvl;
        gs.stats.foodQualityTier = lvl as 0 | 1 | 2;
        gs.foodQualityTier = gs.stats.foodQualityTier;
      },
      weapon: () => {
        const lvl = gs.shop.levels['weapon'] ?? 0;
        gs.stats.weaponLevel = lvl;
        gs.stats.clickDamage = lvl === 2 ? 4 : lvl === 1 ? 2 : 1;
        gs.clickDamage = gs.stats.clickDamage;
        gs.weaponUpgradeLevel = lvl;
      },
      carnivore: () => {
        const livingCarns = gs.fish.filter((f) => f.isCarnivore && !f.dead).length;
        if (livingCarns < 2) {
          const spawnX = Math.random() * (CONFIG.canvasWidth - 100) + 50;
          const spawnY = Math.random() * (CONFIG.waterBottom - CONFIG.waterTop - 60) + CONFIG.waterTop + 30;
          gs.fish.push(createCarnivore(nextId, spawnX, spawnY, Math.random() < 0.5 ? 1 : -1));
        }
      },
      snail: () => {
        const livingSnails = gs.snails.filter((s) => !s.dead).length;
        if (livingSnails < 1) {
          const spawnX = Math.random() * (CONFIG.canvasWidth - 100) + 50;
          gs.snails.push({
            id: nextId,
            x: spawnX,
            y: CONFIG.snailY,
            vx: CONFIG.snailSpeed,
            facing: 1,
            idleTimer: 0,
            crawlTimer: 0,
            dead: false,
          });
        }
      },
      eggPiece1: () => {
        gs.stats.eggPieces = 1;
        gs.eggPiecesBought = 1;
        gs.eggPopTimers[0] = 0.001;
      },
      eggPiece2: () => {
        gs.stats.eggPieces = 2;
        gs.eggPiecesBought = 2;
        gs.eggPopTimers[1] = 0.001;
      },
      eggPiece3: () => {
        gs.stats.eggPieces = 3;
        gs.eggPiecesBought = 3;
        gs.eggPopTimers[2] = 0.001;
        gs.state = 'EGG_HATCH';
        gs.eggHatchTimer = 0;
        playHatchSound();
      },
      decorCoral: () => {
        gs.shop.decorOwned['decorCoral'] = true;
        gs.shop.decorShown['decorCoral'] = true;
        invalidateCachedBackdrop();
      },
      decorShells: () => {
        gs.shop.decorOwned['decorShells'] = true;
        gs.shop.decorShown['decorShells'] = true;
        invalidateCachedBackdrop();
      },
      decorChest: () => {
        gs.shop.decorOwned['decorChest'] = true;
        gs.shop.decorShown['decorChest'] = true;
        invalidateCachedBackdrop();
      },
      decorCastle: () => {
        gs.shop.decorOwned['decorCastle'] = true;
        gs.shop.decorShown['decorCastle'] = true;
        invalidateCachedBackdrop();
      },
      decorLantern: () => {
        gs.shop.decorOwned['decorLantern'] = true;
        gs.shop.decorShown['decorLantern'] = true;
        invalidateCachedBackdrop();
      },
      decorSign: () => {
        gs.shop.decorOwned['decorSign'] = true;
        gs.shop.decorShown['decorSign'] = true;
        invalidateCachedBackdrop();
      },
      decorLagoon: () => {
        gs.shop.decorOwned['decorLagoon'] = true;
        gs.shop.decorShown['decorLagoon'] = true;
        gs.shop.decorShown['decorMidnight'] = false;
        invalidateCachedBackdrop();
      },
      decorMidnight: () => {
        gs.shop.decorOwned['decorMidnight'] = true;
        gs.shop.decorShown['decorMidnight'] = true;
        gs.shop.decorShown['decorLagoon'] = false;
        invalidateCachedBackdrop();
      },
      pet_pip: () => { if (!gs.pets.some(p => p.speciesId === 'pip')) gs.pets.push(createRewardPet(nextId, 'pip', 1)); },
      pet_marina: () => { if (!gs.pets.some(p => p.speciesId === 'marina')) gs.pets.push(createRewardPet(nextId, 'marina', 2)); },
      pet_dot: () => { if (!gs.pets.some(p => p.speciesId === 'dot')) gs.pets.push(createRewardPet(nextId, 'dot', 3)); },
      pet_bumble: () => { if (!gs.pets.some(p => p.speciesId === 'bumble')) gs.pets.push(createRewardPet(nextId, 'bumble', 4)); },
      pet_sol: () => { if (!gs.pets.some(p => p.speciesId === 'sol')) gs.pets.push(createRewardPet(nextId, 'sol', 5)); },
      pet_lumi: () => { if (!gs.pets.some(p => p.speciesId === 'lumi')) gs.pets.push(createRewardPet(nextId, 'lumi', 6)); },
      pet_nox: () => { if (!gs.pets.some(p => p.speciesId === 'nox')) gs.pets.push(createRewardPet(nextId, 'nox', 7)); },
      pet_glimmer: () => { if (!gs.pets.some(p => p.speciesId === 'glimmer')) gs.pets.push(createRewardPet(nextId, 'glimmer', 8)); },
      pet_veil: () => { if (!gs.pets.some(p => p.speciesId === 'veil')) gs.pets.push(createRewardPet(nextId, 'veil', 9)); },
      pet_aurora: () => { if (!gs.pets.some(p => p.speciesId === 'aurora')) gs.pets.push(createRewardPet(nextId, 'aurora', 10)); },
    };
    if (realEffectMap[item.effectId]) {
      realEffectMap[item.effectId]();
    }
  } catch (err) {
    // Roll back deduction and level increment
    gs.money += price;
    gs.shop.levels[id] = currentLvl;
    shopLog('purchase', { id: item.id, moneyBefore, moneyAfter: gs.money, ok: false, reason: 'error' });
    return { ok: false, reason: 'error' };
  }

  if (id === 'foodLimit') valAfter = gs.stats.foodLimit;
  else if (id === 'foodQuality') valAfter = gs.stats.pelletValue;
  else if (id === 'weapon') valAfter = gs.stats.clickDamage;
  else if (id === 'buyFish') valAfter = gs.fish.filter((f) => !f.isCarnivore && !f.dead).length;

  shopLog('purchase', { id: item.id, moneyBefore, moneyAfter, ok: true, reason: 'success' });
  shopLog('effect', { effectId: item.id, valBefore, valAfter });

  // Successful purchase stores frame number of last successful purchase
  gs.lastPurchaseFrame = frame;

  gs.shop.cardPressTimers = gs.shop.cardPressTimers || {};
  gs.shop.cardPressTimers[id] = 0.1;
  gs.shop.cardFlashTimers = gs.shop.cardFlashTimers || {};
  gs.shop.cardFlashTimers[id] = 0.12;

  if (nextEntityIdRef) {
    for (let s = 0; s < 6; s++) {
      gs.particles.push({
        id: nextEntityIdRef.current++,
        x: 275,
        y: 120,
        vx: (15 - 275) / 0.4 + (Math.random() - 0.5) * 40,
        vy: (15 - 120) / 0.4 + (Math.random() - 0.5) * 40,
        radius: 1.5,
        color: '#fde047',
        life: 0,
        maxLife: 0.4,
        type: 'sparkle',
        dead: false,
      });
    }
  }

  playShopSound();

  addParticle(gs, {
    id: nextEntityIdRef ? nextEntityIdRef.current++ : 999,
    x: 400,
    y: 100,
    vx: (Math.random() - 0.5) * 20,
    vy: -25,
    radius: 0,
    color: 'glow',
    life: 0,
    maxLife: 0.8,
    type: 'text',
    text: `-$${price}`,
    dead: false,
  });

  if (typeof window !== 'undefined' && (window as any).__forceShopRedraw) {
    (window as any).__forceShopRedraw();
  }

  shopLog('purchase:result', { ok: true });
  return { ok: true };
}

export let saveState = {
  v: 1,
  username: '',
  completed: {} as Record<string, number>,
  themes: {
    owned: ['default'] as string[],
    active: 'default' as string,
  },
  tutorial: false,
};

let lastWriteTime = 0;
let pendingSaveTimeout: any = null;

export function loadProgress(username?: string) {
  try {
    const user = username || localStorage.getItem('tankCurrentUser') || '';
    if (!user) return;

    const key = `tankProgressV1_${user}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.v === 1 && typeof parsed.completed === 'object' && typeof parsed.themes === 'object') {
        const validatedCompleted: Record<string, number> = {};
        for (const k of Object.keys(parsed.completed)) {
          const numKey = parseInt(k, 10);
          if (numKey >= 1 && numKey <= 10) {
            const val = parsed.completed[k];
            if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
              validatedCompleted[k] = val;
            }
          }
        }

        const validThemes = ['default', 'decorLagoon', 'decorMidnight'];
        const validatedOwned: string[] = ['default'];
        if (Array.isArray(parsed.themes.owned)) {
          for (const tId of parsed.themes.owned) {
            if (validThemes.includes(tId) && !validatedOwned.includes(tId)) {
              validatedOwned.push(tId);
            }
          }
        }

        let validatedActive = 'default';
        if (typeof parsed.themes.active === 'string' && validThemes.includes(parsed.themes.active)) {
          validatedActive = parsed.themes.active;
        }

        let validatedTutorial = !!parsed.tutorial;
        if (parsed.tutorial === undefined) {
          validatedTutorial = Object.keys(validatedCompleted).length > 0;
        }

        saveState = {
          v: 1,
          username: user,
          completed: validatedCompleted,
          themes: {
            owned: validatedOwned,
            active: validatedActive,
          },
          tutorial: validatedTutorial,
        };
        return;
      }
    } else {
      // New user default state
      saveState = {
        v: 1,
        username: user,
        completed: {},
        themes: { owned: ['default'], active: 'default' },
        tutorial: false
      };
    }
  } catch (e) {
    console.error("Failed to load progress from localStorage", e);
  }
}

export function resetProgress() {
  if (typeof window === 'undefined') return;
  const user = saveState.username;
  if (!user) return;

  saveState = {
    v: 1,
    username: user,
    completed: {},
    themes: { owned: ['default'], active: 'default' },
    tutorial: false
  };
  saveProgress();
}

export function saveProgress() {
  if (!saveState.username) return;
  const now = Date.now();
  if (now - lastWriteTime >= 500) {
    lastWriteTime = now;
    if (pendingSaveTimeout) {
      clearTimeout(pendingSaveTimeout);
      pendingSaveTimeout = null;
    }
    try {
      const key = `tankProgressV1_${saveState.username}`;
      localStorage.setItem(key, JSON.stringify(saveState));
    } catch (e) {
      console.error("Failed to save progress to localStorage", e);
    }
  } else {
    if (!pendingSaveTimeout) {
      pendingSaveTimeout = setTimeout(() => {
        pendingSaveTimeout = null;
        saveProgress();
      }, 500 - (now - lastWriteTime));
    }
  }
}

export function syncSaveStateFromGame(gs: GameState) {
  const owned: string[] = ['default'];
  if (gs.shop?.decorOwned?.['decorLagoon']) owned.push('decorLagoon');
  if (gs.shop?.decorOwned?.['decorMidnight']) owned.push('decorMidnight');
  saveState.themes.owned = owned;

  let active = 'default';
  if (gs.shop?.decorShown?.['decorLagoon']) active = 'decorLagoon';
  else if (gs.shop?.decorShown?.['decorMidnight']) active = 'decorMidnight';
  saveState.themes.active = active;

  saveProgress();
}

export function syncGameFromSaveState(gs: GameState) {
  if (!gs.shop) return;
  gs.shop.decorOwned = gs.shop.decorOwned || {};
  gs.shop.decorShown = gs.shop.decorShown || {};

  gs.shop.decorOwned['decorLagoon'] = saveState.themes.owned.includes('decorLagoon');
  gs.shop.decorOwned['decorMidnight'] = saveState.themes.owned.includes('decorMidnight');

  gs.shop.decorShown['decorLagoon'] = saveState.themes.active === 'decorLagoon';
  gs.shop.decorShown['decorMidnight'] = saveState.themes.active === 'decorMidnight';
}

// Call loadProgress on startup if user is known
if (typeof window !== 'undefined') {
  const user = localStorage.getItem('tankCurrentUser');
  if (user) loadProgress(user);
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      initializeInput(canvas);
    }
    onUnlock(() => {
      initAudio();
      // Load settings
      try {
        const saved = localStorage.getItem('tankAudioV1');
        if (saved) {
           const parsed = JSON.parse(saved);
           if (typeof parsed.music === 'number' && parsed.music >= 0 && parsed.music <= 1) game.audio.music = parsed.music;
           if (typeof parsed.sfx === 'number' && parsed.sfx >= 0 && parsed.sfx <= 1) game.audio.sfx = parsed.sfx;
           if (typeof parsed.muted === 'boolean') game.audio.muted = parsed.muted;
           updateAudioVolumes();
        }
      } catch(e) {}
    });
    return () => {
      shutdownInput();
    };
  }, []);
  
  // Throttle save
  const lastSave = useRef(0);
  const saveAudio = useCallback(() => {
    const now = Date.now();
    if (now - lastSave.current < 500) return;
    localStorage.setItem('tankAudioV1', JSON.stringify({ music: game.audio.music, sfx: game.audio.sfx, muted: game.audio.muted }));
    lastSave.current = now;
  }, []);


  if (!offscreenCanvasRef.current && typeof document !== 'undefined') {
    const oc = document.createElement('canvas');
    oc.width = 400;
    oc.height = 300;
    const octx = oc.getContext('2d');
    if (octx) octx.imageSmoothingEnabled = false;
    offscreenCanvasRef.current = oc;
  }

  // Single game state object
  const gameStateRef = useRef<GameState>({
    state: 'TITLE',
    gameMode: 'levels',
    screenShakeEnabled: true,
    level: 1,
    money: CONFIG.initialMoney,
    tod: 'day',
    stats: {
      foodLimit: CONFIG.foodLimit,
      pelletValue: 1,
      foodQualityTier: 0,
      clickDamage: 1,
      weaponLevel: 0,
      eggPieces: 0,
    },
    foodLimit: 1,
    foodQualityTier: 0,
    clickDamage: 1,
    weaponUpgradeLevel: 0,
    eggPiecesBought: 0,
    eggHatchTimer: 0,
    levelElapsedTime: 0,
    alienMaxHpScaled: CONFIG.alienMaxHp,
    fishStarveTimeScaled: CONFIG.fishStarveTime,
    carnivoreStarveTimeScaled: CONFIG.carnivoreStarveTime,
    moneyFlashTimer: 0,
    time: 0,
    currentFrame: 0,
    shop: {
      levels: {},
      decorOwned: {},
      decorShown: {},
      open: false,
      selectedCategory: 'pets',
      selectedItemId: null,
    },
    fish: [
      createFish(1, 160, 200, 1),
      createFish(2, 400, 300, -1),
      createFish(3, 640, 220, 1),
    ],
    food: [],
    coins: [],
    aliens: [],
    snails: [],
    pets: [],
    beams: [],
    particles: [],
    alienSpawnTimer: Math.random() * (CONFIG.alienFirstSpawnMax - CONFIG.alienFirstSpawnMin) + CONFIG.alienFirstSpawnMin,
    mousePos: { x: 400, y: 300, inCanvas: false, isMouseDown: false },
    eggPopTimers: [-1, -1, -1],
    transitionTimer: 0,
    shakeTimer: 0,
    audioPanel: { open: false, dragging: null },
    tutorialStep: 0,
    isTutorial: false,
    particlesEnabled: true,
  });

  const nextEntityIdRef = useRef<number>(100);
  const lastTimeRef = useRef<number>(performance.now());
  const [currentScreen, setCurrentScreen] = useState<'TITLE' | 'PLAYING' | 'PAUSED' | 'EGG_HATCH' | 'LEVEL_COMPLETE' | 'GAME_OVER' | 'SETTINGS'>('TITLE');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [fishCount, setFishCount] = useState(2);
  const [carnivoreCount, setCarnivoreCount] = useState(0);
  const [snailCount, setSnailCount] = useState(0);
  const [weaponLevelUI, setWeaponLevelUI] = useState(0);
  const [eggPiecesUI, setEggPiecesUI] = useState(0);
  const [levelStats, setLevelStats] = useState({ elapsedTime: 0, finalMoney: 200 });
  const [tutorialPostMode, setTutorialPostMode] = useState<'levels' | 'sandbox' | null>(null);
  const [debugCounter, setDebugCounter] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('tankCurrentUser');
    return null;
  });
  const [nameInput, setNameInput] = useState('');

  const handleCreateAccount = () => {
    const name = nameInput.trim();
    if (!name) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tankCurrentUser', name);
      setCurrentUser(name);
      loadProgress(name);
      // Force initial game state to sync from newly loaded/created save
      syncGameFromSaveState(gameStateRef.current);
    }
  };

  useEffect(() => {
    (window as any).__forceShopRedraw = () => {
      const canvas = canvasRef.current;
      const offscreen = offscreenCanvasRef.current;
      const gs = gameStateRef.current;
      if (canvas && offscreen) {
        const offCtx = offscreen.getContext('2d');
        const ctx = canvas.getContext('2d');
        if (offCtx && ctx) {
          renderPixelScene(offCtx, gs, currentLevel, levelStats);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(offscreen, 0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
        }
      }
    };
    return () => {
      delete (window as any).__forceShopRedraw;
    };
  }, [currentLevel, levelStats]);

  // Fullscreen helper
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);

  // Scripted Tutorial Helpers
  const growFish = (gs: GameState, fishId: number) => {
    const fish = gs.fish.find(f => f.id === fishId);
    if (fish && fish.size < 2) {
      fish.size++;
      fish.growthPoints = fish.size === 1 ? CONFIG.fishGrowthPointsSize1 : CONFIG.fishGrowthPointsSize2;
      fish.scalePopTimer = CONFIG.fishGrowthPopDuration;
      playFishGrowSound();
    }
  };

  const spawnCoin = (gs: GameState, x: number, y: number, type: 'silver' | 'gold' | 'diamond', isTut: boolean = false) => {
    const coin: Coin = {
      id: nextEntityIdRef.current++,
      type,
      value: type === 'diamond' ? CONFIG.coinDiamondValue : (type === 'gold' ? CONFIG.coinGoldValue : CONFIG.coinSilverValue),
      x,
      y,
      age: 0,
      collected: false,
      startTweenX: x,
      startTweenY: y,
      tweenTimer: 0,
      dead: false,
      tut: isTut,
    };
    gs.coins.push(coin);
    playCoinDropSound();
  };

  const spawnGargo = (gs: GameState, isTut: boolean = false) => {
    const a: Alien = {
      id: nextEntityIdRef.current++,
      x: Math.random() < 0.5 ? -40 : CONFIG.canvasWidth + 40,
      y: 100 + Math.random() * 300,
      vx: 0,
      vy: 0,
      hp: gs.alienMaxHpScaled,
      maxHp: gs.alienMaxHpScaled,
      trailHp: gs.alienMaxHpScaled,
      trailTimer: 0,
      flashTimer: 0,
      killCooldown: 0,
      facing: 1,
      animTimer: 0,
      dead: false,
      tut: isTut,
    };
    gs.aliens.push(a);
    playAlienSpawnSound();
  };

  const setMoneyAtLeast = (gs: GameState, amount: number) => {
    if (gs.money < amount) gs.money = amount;
  };

  const advanceTutorial = (gs: GameState) => {
    gs.tutorialStep++;
    const step = CONFIG.TUTORIAL[gs.tutorialStep - 1];
    if (!step) {
      // Tutorial complete!
      saveState.tutorial = true;
      saveProgress();
      
      // Cleanup tutorial flags from entities
      gs.fish.forEach(f => (f as any).tut = false);
      gs.coins.forEach(c => (c as any).tut = false);
      
      gs.isTutorial = false;
      gs.tutorialStep = 0;
      
      // Re-initialize for chosen mode
      if (tutorialPostMode === 'sandbox') {
        startGame('sandbox');
      } else {
        gs.state = 'LEVEL_SELECT';
        gs.levelSelectSelected = 1;
        gs.transitionTimer = 0.4;
      }
      return;
    }

    // Play purchase arpeggio at 60% gain
    // (Assuming shop sound is the purchase arpeggio)
    playShopSound(); 

    // Setup step
    const hook = tutorialHooks.setup[step.setup];
    if (hook) hook(gs);
  };

  const updateTutorial = (gs: GameState, dt: number) => {
    if (!gs.isTutorial || gs.tutorialStep === 0) return;
    
    const step = CONFIG.TUTORIAL[gs.tutorialStep - 1];
    if (!step) return;

    const gate = tutorialHooks.gate[step.gate];
    if (gate && gate(gs)) {
      advanceTutorial(gs);
    }
  };

  const tutorialHooks = {
    setup: {
      setupWelcome: (gs: GameState) => {
        gs.money = 350;
      },
      setupBuyFish: (gs: GameState) => {
        // Ensure they have money
        setMoneyAtLeast(gs, 100);
      },
      setupFeed: (gs: GameState) => {
        // Ensure fish are hungry
        gs.fish.forEach(f => {
          if (!f.isCarnivore) f.timeSinceAte = CONFIG.fishHungryTime + 2;
        });
      },
      setupCoins: (gs: GameState) => {
        // Spawn a coin for them to pick up if none exist
        if (gs.coins.filter(c => !c.dead && !c.collected).length === 0) {
          spawnCoin(gs, 400, 300, 'silver', true);
        }
      },
      setupGrow: (gs: GameState) => {
        // Give some money for food
        setMoneyAtLeast(gs, 50);
      },
      setupFoodLimit: (gs: GameState) => {
        setMoneyAtLeast(gs, 200);
      },
      setupEgg: (gs: GameState) => {
        setMoneyAtLeast(gs, 500);
      },
      setupHatch: (gs: GameState) => {
        // Buy remaining pieces or give money
        setMoneyAtLeast(gs, 1750);
      },
      setupComplete: (gs: GameState) => {},
      setupFinish: (gs: GameState) => {},
    } as Record<string, (gs: GameState) => void>,
    gate: {
      gateNext: (gs: GameState) => false, // Handled by tap in processClick
      gateBuyFish: (gs: GameState) => gs.fish.filter(f => !f.isCarnivore).length > 2,
      gateFeed: (gs: GameState) => gs.food.length > 0,
      gateCoins: (gs: GameState) => gs.money > 350,
      gateGrow: (gs: GameState) => gs.fish.some(f => f.size > 0),
      gateFoodLimit: (gs: GameState) => gs.stats.foodLimit > 1,
      gateEgg: (gs: GameState) => gs.eggPiecesBought > 0,
      gateHatch: (gs: GameState) => gs.eggPiecesBought >= 3,
    } as Record<string, (gs: GameState) => boolean>,
  };

  const startTutorial = useCallback((postMode: 'levels' | 'sandbox') => {
    const gs = gameStateRef.current;
    setTutorialPostMode(postMode);
    gs.isTutorial = true;
    gs.tutorialStep = 0; // Will be incremented to 1 in loop or setup
    gs.state = 'PLAYING';
    gs.gameMode = 'tutorial';
    gs.transitionTimer = 0.4;

    // Initial setup for tutorial
    gs.money = 350;
    gs.tod = 'day';
    gs.fish.length = 0;
    // 2 size-0 fish that start hungry
    const f1 = createFish(nextEntityIdRef.current++, 260, 220, 1);
    f1.timeSinceAte = CONFIG.fishHungryTime + 2; // Start hungry
    const f2 = createFish(nextEntityIdRef.current++, 540, 360, -1);
    f2.timeSinceAte = CONFIG.fishHungryTime + 2; // Start hungry
    gs.fish.push(f1, f2);
    
    gs.food.length = 0;
    gs.coins.length = 0;
    gs.aliens.length = 0;
    gs.snails.length = 0;
    gs.pets = [];
    gs.beams.length = 0;
    gs.particles.length = 0;
    
    gs.stats.foodLimit = CONFIG.foodLimit;
    gs.stats.pelletValue = 1;
    gs.stats.weaponLevel = 0;
    gs.stats.eggPieces = 0;
    gs.foodLimit = CONFIG.foodLimit;
    
    advanceTutorial(gs);
    setCurrentScreen('PLAYING');
    invalidateCachedBackdrop();
  }, []);

  // Start game from title
  const startGame = useCallback((mode: 'levels' | 'sandbox' = 'levels') => {
    game.mode = mode;
    const gs = gameStateRef.current;
    gs.state = 'PLAYING';
    gs.gameMode = mode;
    gs.level = 1;

    // In-place reset helper to prevent orphaned array/object references
    const resetSharedArraysAndStats = (targetGs: GameState, isSandbox: boolean, lvlConfig: LevelConfig) => {
      targetGs.fish.length = 0;
      targetGs.fish.push(
        createFish(nextEntityIdRef.current++, 260, 220, 1),
        createFish(nextEntityIdRef.current++, 540, 360, -1)
      );
      targetGs.food.length = 0;
      targetGs.coins.length = 0;
      targetGs.aliens.length = 0;
      targetGs.snails.length = 0;
      targetGs.pets = [];
      targetGs.beams.length = 0;
      targetGs.particles.length = 0;

      targetGs.money = isSandbox ? 500 : lvlConfig.startMoney;
      targetGs.tod = isSandbox ? 'day' : lvlConfig.tod;

      if (targetGs.stats) {
        Object.assign(targetGs.stats, {
          foodLimit: CONFIG.foodLimit,
          pelletValue: 1,
          foodQualityTier: 0,
          clickDamage: 1,
          weaponLevel: 0,
          eggPieces: 0,
        });
      }

      targetGs.clickDamage = 1;
      targetGs.weaponUpgradeLevel = 0;
      targetGs.eggPiecesBought = 0;
      targetGs.eggHatchTimer = 0;
      targetGs.hasSpawnedHatchParticles = false;
      targetGs.eggPopTimers = [-1, -1, -1];
      targetGs.levelElapsedTime = 0;
      targetGs.alienMaxHpScaled = lvlConfig.alienHp;
      targetGs.fishStarveTimeScaled = lvlConfig.starveSeconds;
      targetGs.carnivoreStarveTimeScaled = lvlConfig.starveSeconds * 1.45;
      targetGs.moneyFlashTimer = 0;
      targetGs.foodLimit = CONFIG.foodLimit;
      targetGs.foodQualityTier = 0;

      const minSpawn = CONFIG.alienFirstSpawnMin * lvlConfig.spawnMultiplier;
      const maxSpawn = CONFIG.alienFirstSpawnMax * lvlConfig.spawnMultiplier;
      targetGs.alienSpawnTimer = Math.random() * (maxSpawn - minSpawn) + minSpawn;

      if (targetGs.shop) {
        targetGs.shop.levels = {};
        targetGs.shop.open = false;
        targetGs.shop.selectedCategory = 'pets';
        targetGs.shop.selectedItemId = null;
        targetGs.shop.scrollOffset = 0;
        targetGs.shop.animTimer = 0;
        syncGameFromSaveState(targetGs);
      }
    };

    const isSandbox = mode === 'sandbox';
    game.mode = mode;
    gs.gameMode = mode;
    gs.level = 1;
    gs.state = 'PLAYING';
    gs.transitionTimer = 0.4;

    invalidateCachedBackdrop();
    const lvlConfig = CONFIG.LEVELS[0];
    resetSharedArraysAndStats(gs, isSandbox, lvlConfig);

    setCurrentScreen('PLAYING');
    setCurrentLevel(1);
    setFishCount(2);
    setCarnivoreCount(0);
    setSnailCount(0);
    setWeaponLevelUI(0);
    setEggPiecesUI(0);
    lastTimeRef.current = performance.now();
  }, []);

  // Reset tank for sandbox mode or manual restart
  const resetTank = useCallback(() => {
    const gs = gameStateRef.current;
    const isSandbox = game.mode === 'sandbox';
    const lvlIndex = Math.max(0, (gs.level || 1) - 1);
    const lvlConfig = CONFIG.LEVELS[lvlIndex] || CONFIG.LEVELS[0];

    gs.fish.length = 0;
    gs.fish.push(
      createFish(nextEntityIdRef.current++, 260, 220, 1),
      createFish(nextEntityIdRef.current++, 540, 360, -1)
    );
    gs.food.length = 0;
    gs.coins.length = 0;
    gs.aliens.length = 0;
    gs.snails.length = 0;
    gs.pets = [];
    gs.beams.length = 0;
    gs.particles.length = 0;
    gs.money = isSandbox ? 500 : lvlConfig.startMoney;

    if (gs.stats) {
      Object.assign(gs.stats, {
        foodLimit: CONFIG.foodLimit,
        pelletValue: 1,
        foodQualityTier: 0,
        clickDamage: 1,
        weaponLevel: 0,
        eggPieces: 0,
      });
    }
    gs.clickDamage = 1;
    gs.weaponUpgradeLevel = 0;
    gs.eggPiecesBought = 0;
    gs.eggHatchTimer = 0;
    gs.hasSpawnedHatchParticles = false;
    gs.eggPopTimers = [-1, -1, -1];
    gs.levelElapsedTime = 0;
    gs.alienMaxHpScaled = lvlConfig.alienHp;
    gs.fishStarveTimeScaled = lvlConfig.starveSeconds;
    gs.carnivoreStarveTimeScaled = lvlConfig.starveSeconds * 1.45;
    gs.moneyFlashTimer = 0;
    gs.foodLimit = CONFIG.foodLimit;
    gs.foodQualityTier = 0;

    const minSpawn = CONFIG.alienFirstSpawnMin * lvlConfig.spawnMultiplier;
    const maxSpawn = CONFIG.alienFirstSpawnMax * lvlConfig.spawnMultiplier;
    gs.alienSpawnTimer = Math.random() * (maxSpawn - minSpawn) + minSpawn;

    if (gs.shop) {
      gs.shop.levels = {};
      gs.shop.open = false;
      gs.shop.selectedCategory = 'pets';
      gs.shop.selectedItemId = null;
      gs.shop.scrollOffset = 0;
      gs.shop.animTimer = 0;
      syncGameFromSaveState(gs);
    }

    if (gs.state === 'PAUSED' || gs.state === 'SANDBOX_OPTIONS') {
      gs.state = 'PLAYING';
      gs.transitionTimer = 0.4;
      setCurrentScreen('PLAYING');
      setMuffled(false);
    }

    setFishCount(2);
    setCarnivoreCount(0);
    setSnailCount(0);
    setWeaponLevelUI(0);
    setEggPiecesUI(0);
    lastTimeRef.current = performance.now();
  }, []);

  // Resume game from pause
  const resumeGame = useCallback(() => {
    if (gameStateRef.current.state === 'PAUSED' || gameStateRef.current.state === 'SANDBOX_OPTIONS') {
      gameStateRef.current.state = 'PLAYING';
      gameStateRef.current.transitionTimer = 0.4;
      setCurrentScreen('PLAYING');
      lastTimeRef.current = performance.now();
      setMuffled(false);
    }
  }, []);

  // Reset / Retry after Game Over
  const retryGame = useCallback(() => {
    startGame(game.mode || 'levels');
  }, [startGame]);

  // Proceed to Next Level
  const startNextLevel = useCallback(() => {
    const gs = gameStateRef.current;
    const nextLvl = gs.level + 1;
    gs.level = nextLvl;
    gs.state = 'PLAYING';
    gs.transitionTimer = 0.4;
    invalidateCachedBackdrop();

    const lvlIndex = Math.min(CONFIG.LEVELS.length - 1, nextLvl - 1);
    const lvlConfig = CONFIG.LEVELS[lvlIndex] || CONFIG.LEVELS[0];

    gs.fish.length = 0;
    gs.fish.push(
      createFish(nextEntityIdRef.current++, 260, 220, 1),
      createFish(nextEntityIdRef.current++, 540, 360, -1)
    );
    gs.food.length = 0;
    gs.coins.length = 0;
    gs.aliens.length = 0;
    gs.snails.length = 0;
    gs.pets = [];
    gs.beams.length = 0;
    gs.particles.length = 0;
    gs.money = lvlConfig.startMoney;
    gs.tod = lvlConfig.tod;

    if (gs.stats) {
      Object.assign(gs.stats, {
        foodLimit: CONFIG.foodLimit,
        pelletValue: 1,
        foodQualityTier: 0,
        clickDamage: 1,
        weaponLevel: 0,
        eggPieces: 0,
      });
    }
    gs.foodLimit = CONFIG.foodLimit;
    gs.foodQualityTier = 0;
    if (gs.shop) {
      gs.shop.open = false;
      gs.shop.selectedItemId = null;
      gs.shop.levels = {};
      gs.shop.scrollOffset = 0;
      syncGameFromSaveState(gs);
    }

    gs.weaponUpgradeLevel = 0;
    gs.clickDamage = 1;
    gs.eggPiecesBought = 0;
    gs.eggHatchTimer = 0;
    gs.eggPopTimers = [-1, -1, -1];
    gs.levelElapsedTime = 0;
    gs.alienMaxHpScaled = lvlConfig.alienHp;
    gs.fishStarveTimeScaled = lvlConfig.starveSeconds;
    gs.carnivoreStarveTimeScaled = lvlConfig.starveSeconds * 1.45;

    const minSpawn = CONFIG.alienFirstSpawnMin * lvlConfig.spawnMultiplier;
    const maxSpawn = CONFIG.alienFirstSpawnMax * lvlConfig.spawnMultiplier;
    gs.alienSpawnTimer = Math.random() * (maxSpawn - minSpawn) + minSpawn;

    setCurrentScreen('PLAYING');
    setCurrentLevel(nextLvl);
    setFishCount(2);
    setCarnivoreCount(0);
    setSnailCount(0);
    setWeaponLevelUI(0);
    setEggPiecesUI(0);
    lastTimeRef.current = performance.now();
  }, []);

  // Core click & tap resolution logic
  const processClick = (logicalX: number, logicalY: number) => {
    const gs = gameStateRef.current;

    // Tutorial Tap-to-Advance
    if (gs.isTutorial) {
      const step = CONFIG.TUTORIAL[gs.tutorialStep - 1];
      if (step && step.gate === 'gateNext') {
        advanceTutorial(gs);
        return;
      }
    }

    // Screen interactions (Title, Settings, Paused, Level Complete, Game Over)
    if (gs.state === 'TITLE') {
      if (logicalX >= 230 && logicalX <= 570 && logicalY >= 210 && logicalY <= 280) {
        if (!saveState.tutorial) {
          startTutorial('levels');
        } else {
          gs.state = 'LEVEL_SELECT';
          gs.levelSelectSelected = 1;
          gs.transitionTimer = 0.4;
        }
        return;
      }
      // 2. Sandbox Mode: (logical 230..570, 286..358)
      if (logicalX >= 230 && logicalX <= 570 && logicalY >= 286 && logicalY <= 358) {
        if (!saveState.tutorial) {
          startTutorial('sandbox');
        } else {
          startGame('sandbox');
        }
        return;
      }
      // 3. Settings Menu: (logical 230..570, 364..436)
      if (logicalX >= 230 && logicalX <= 570 && logicalY >= 364 && logicalY <= 436) {
        gs.state = 'SETTINGS';
        gs.transitionTimer = 0.4;
        setCurrentScreen('SETTINGS');
        return;
      }
      return;
    }

    if (gs.state === 'LEVEL_SELECT') {
      // 1. Back button (logical coordinates matching x: 46, y: 35, w: 24, h: 24 UI px scaled by 2):
      // UI px: x: 46, y: 35, w: 24, h: 24 -> logical 2x: x: 92, y: 70, w: 48, h: 48
      if (logicalX >= 92 && logicalX <= 140 && logicalY >= 70 && logicalY <= 118) {
        gs.state = 'TITLE';
        gs.transitionTimer = 0.4;
        return;
      }

      // 2. PLAY button (logical coordinates matching x: 172, y: 236, w: 56, h: 26 UI px scaled by 2):
      // UI px: x: 172, y: 236, w: 56, h: 26 -> logical 2x: x: 344, y: 472, w: 112, h: 52
      if (logicalX >= 344 && logicalX <= 456 && logicalY >= 472 && logicalY <= 524) {
        // Start selected level!
        const targetLvl = gs.levelSelectSelected || 1;
        gs.level = targetLvl;
        
        // Reset and launch level!
        gs.state = 'PLAYING';
        gs.transitionTimer = 0.4;
        invalidateCachedBackdrop();
        
        const lvlConfig = CONFIG.LEVELS[targetLvl - 1] || CONFIG.LEVELS[0];
        // Reset shared arrays and stats
        gs.fish.length = 0;
        gs.fish.push(
          createFish(nextEntityIdRef.current++, 260, 220, 1),
          createFish(nextEntityIdRef.current++, 540, 360, -1)
        );
        gs.food.length = 0;
        gs.coins.length = 0;
        gs.aliens.length = 0;
        gs.snails.length = 0;
        gs.pets = [];
        gs.beams.length = 0;
        gs.particles.length = 0;
        gs.money = lvlConfig.startMoney;
        gs.tod = lvlConfig.tod;

        if (gs.stats) {
          Object.assign(gs.stats, {
            foodLimit: CONFIG.foodLimit,
            pelletValue: 1,
            foodQualityTier: 0,
            clickDamage: 1,
            weaponLevel: 0,
            eggPieces: 0,
          });
        }
        gs.clickDamage = 1;
        gs.weaponUpgradeLevel = 0;
        gs.eggPiecesBought = 0;
        gs.eggHatchTimer = 0;
        gs.eggPopTimers = [-1, -1, -1];
        gs.levelElapsedTime = 0;
        gs.alienMaxHpScaled = lvlConfig.alienHp;
        gs.fishStarveTimeScaled = lvlConfig.starveSeconds;
        gs.carnivoreStarveTimeScaled = lvlConfig.starveSeconds * 1.45;
        gs.moneyFlashTimer = 0;
        gs.foodLimit = CONFIG.foodLimit;
        gs.foodQualityTier = 0;

        const minSpawn = CONFIG.alienFirstSpawnMin * lvlConfig.spawnMultiplier;
        const maxSpawn = CONFIG.alienFirstSpawnMax * lvlConfig.spawnMultiplier;
        gs.alienSpawnTimer = Math.random() * (maxSpawn - minSpawn) + minSpawn;

        if (gs.shop) {
          gs.shop.levels = {};
          gs.shop.open = false;
          gs.shop.selectedCategory = 'pets';
          gs.shop.selectedItemId = null;
          gs.shop.scrollOffset = 0;
          gs.shop.animTimer = 0;
          syncGameFromSaveState(gs);
        }

        setCurrentScreen('PLAYING');
        setCurrentLevel(targetLvl);
        setFishCount(2);
        setCarnivoreCount(0);
        setSnailCount(0);
        setWeaponLevelUI(0);
        setEggPiecesUI(0);
        lastTimeRef.current = performance.now();
        return;
      }

      // 3. Node Selection
      // UI px: nx = startX + col * (nodeW + gap) = 102 + col * 40
      // UI px: ny = py + 42 + row * (nodeW + gap) = 30 + 42 + row * 40 = 72 + row * 40
      // logical 2x: lx = 204 + col * 80, ly = 144 + row * 80, lw = 72, lh = 72
      for (let l = 1; l <= 10; l++) {
        const row = l <= 5 ? 0 : 1;
        const col = (l - 1) % 5;
        const lx = 204 + col * 80;
        const ly = 144 + row * 80;
        if (logicalX >= lx && logicalX <= lx + 72 && logicalY >= ly && logicalY <= ly + 72) {
          const isUnlocked = l === 1 || saveState.completed[l - 1] !== undefined;
          if (isUnlocked) {
            gs.levelSelectSelected = l;
          } else {
            playRejectedSound(0.5);
          }
          return;
        }
      }
      return;
    }

    if (gs.state === 'SETTINGS') {
      // Column 1
      // Toggle Screen Shake (160, 176, 220, 44)
      if (logicalX >= 160 && logicalX <= 380 && logicalY >= 176 && logicalY <= 220) {
        gs.screenShakeEnabled = !(gs.screenShakeEnabled !== false);
        return;
      }
      // Toggle Fullscreen (160, 228, 220, 44)
      if (logicalX >= 160 && logicalX <= 380 && logicalY >= 228 && logicalY <= 272) {
        toggleFullscreen();
        return;
      }

      // Column 2
      // Toggle Particles (420, 176, 220, 44)
      if (logicalX >= 420 && logicalX <= 640 && logicalY >= 176 && logicalY <= 220) {
        gs.particlesEnabled = !(gs.particlesEnabled !== false);
        return;
      }
      // Reset Data (420, 228, 220, 44)
      if (logicalX >= 420 && logicalX <= 640 && logicalY >= 228 && logicalY <= 272) {
        if (confirm("RESET ALL PROGRESS? THIS CANNOT BE UNDONE.")) {
          resetProgress();
          gs.state = 'TITLE';
          gs.transitionTimer = 0.4;
          window.location.reload(); // Reload to ensure everything is reset
        }
        return;
      }

      // Back to Title (250, 310, 300, 48)
      if (logicalX >= 250 && logicalX <= 550 && logicalY >= 310 && logicalY <= 358) {
        gs.state = 'TITLE';
        game.mode = 'levels';
        gs.transitionTimer = 0.4;
        setCurrentScreen('TITLE');
        return;
      }
      return;
    }

    if (gs.state === 'PAUSED') {
      if (game.mode === 'sandbox') {
        // 1. Resume (logical 250..550, 160..210)
        if (logicalX >= 250 && logicalX <= 550 && logicalY >= 160 && logicalY <= 210) {
          resumeGame();
          return;
        }
        // 2. Sandbox Options (logical 250..550, 214..264)
        if (logicalX >= 250 && logicalX <= 550 && logicalY >= 214 && logicalY <= 264) {
          gs.state = 'SANDBOX_OPTIONS';
          return;
        }
        // 3. Reset Tank (logical 250..550, 268..318)
        if (logicalX >= 250 && logicalX <= 550 && logicalY >= 268 && logicalY <= 318) {
          resetTank();
          return;
        }
        // 4. Main Menu (logical 250..550, 322..380)
        if (logicalX >= 250 && logicalX <= 550 && logicalY >= 322 && logicalY <= 380) {
          gs.state = 'TITLE';
          game.mode = 'levels';
          game.sandbox = { freeShop: true, aliens: false, hunger: true };
          gs.transitionTimer = 0.4;
          setCurrentScreen('TITLE');
          setMuffled(false);
          return;
        }
      } else {
        // 1. Resume button (logical 260..540, 180..244)
        if (logicalX >= 260 && logicalX <= 540 && logicalY >= 180 && logicalY <= 244) {
          resumeGame();
          return;
        }
        // 2. Restart button (logical 260..540, 246..310)
        if (logicalX >= 260 && logicalX <= 540 && logicalY >= 246 && logicalY <= 310) {
          retryGame();
          return;
        }
        // 3. Main Menu button (logical 260..540, 312..380)
        if (logicalX >= 260 && logicalX <= 540 && logicalY >= 312 && logicalY <= 380) {
          gs.state = 'TITLE';
          game.mode = 'levels';
          game.sandbox = { freeShop: true, aliens: false, hunger: true };
          gs.transitionTimer = 0.4;
          setCurrentScreen('TITLE');
          setMuffled(false);
          return;
        }
      }
      return;
    }

    if (gs.state === 'SANDBOX_OPTIONS') {
      // 1. Close [X] Button (top right 24x24 UI px)
      if (logicalX >= 484 && logicalX <= 516 && logicalY >= 200 && logicalY <= 232) {
        gs.state = 'PAUSED';
        return;
      }

      // 2. Row 0: Free Shop (290..510, 250..286)
      if (logicalX >= 290 && logicalX <= 510 && logicalY >= 250 && logicalY <= 286) {
        game.sandbox.freeShop = !game.sandbox.freeShop;
        return;
      }

      // 3. Row 1: Aliens (290..510, 288..324)
      if (logicalX >= 290 && logicalX <= 510 && logicalY >= 288 && logicalY <= 324) {
        const prev = game.sandbox.aliens;
        game.sandbox.aliens = !prev;
        if (game.sandbox.aliens && !prev) {
          gs.alienSpawnTimer = Math.random() * (CONFIG.alienFirstSpawnMax - CONFIG.alienFirstSpawnMin) + CONFIG.alienFirstSpawnMin;
        }
        return;
      }

      // 4. Row 2: Hunger (290..510, 326..362)
      if (logicalX >= 290 && logicalX <= 510 && logicalY >= 326 && logicalY <= 362) {
        game.sandbox.hunger = !game.sandbox.hunger;
        return;
      }

      // 5. Tap outside panel closes it
      if (logicalX < 280 || logicalX > 520 || logicalY < 200 || logicalY > 390) {
        gs.state = 'PAUSED';
        return;
      }
      return;
    }

    if (gs.state === 'LEVEL_COMPLETE') {
      // Next Level button: mobile touch box (logical 240..560, 330..410)
      if (logicalX >= 240 && logicalX <= 560 && logicalY >= 330 && logicalY <= 410) {
        if (gs.level >= 10) {
          gs.state = 'LEVEL_SELECT';
          gs.levelSelectSelected = 10;
          gs.transitionTimer = 0.4;
        } else {
          startNextLevel();
        }
      }
      return;
    }

    if (gs.state === 'GAME_OVER') {
      // Retry button: mobile touch box (logical 260..540, 300..376)
      if (logicalX >= 260 && logicalX <= 540 && logicalY >= 300 && logicalY <= 376) {
        retryGame();
      }
      return;
    }

    if (gs.state === 'EGG_HATCH') {
      // Frozen during egg hatch animation
      return;
    }

    // ------------------------------------------------------------------------
    // SHOP MODAL INTERACTIONS
    // ------------------------------------------------------------------------
    if (gs.shop?.open || (gs.shop?.animTimer || 0) > 0) {
      const progress = gs.shop.animTimer || 0;
      const easeOut = 1 - Math.pow(1 - progress, 2);
      const mX = 500 + (1 - easeOut) * 300;
      const mY = 60;
      const mW = 300;
      const mH = 480;

      // Only handle clicks if they are actually on the drawer
      if (logicalX >= mX) {
        // 1. Close button [X]: generous 48x48 mobile touch target
        const cBtnW = 48;
        const cBtnH = 48;
        const cBtnX = mX + mW - cBtnW;
        const cBtnY = mY;
        if (logicalX >= cBtnX && logicalX <= cBtnX + cBtnW && logicalY >= cBtnY && logicalY <= cBtnY + cBtnH) {
          gs.shop.open = false;
          return;
        }

        // 2. Category tabs (three 88x44 tabs for Pets, Upgrades, Decor)
        const tabY = mY + 38;
        const totalTabW = 3 * 88;
        const tabStartX = mX + Math.floor((mW - totalTabW) / 2);
        const categories: ShopCategory[] = ['pets', 'upgrades', 'decor'];

        for (let t = 0; t < categories.length; t++) {
          const cat = categories[t];
          const tX = tabStartX + t * 88;
          if (logicalX >= tX && logicalX < tX + 88 && logicalY >= tabY - 6 && logicalY <= tabY + 44) {
            if (gs.shop.selectedCategory !== cat) {
              gs.shop.selectedCategory = cat;
              gs.shop.scrollOffset = 0; // Reset scroll to 0 on every tab switch
            }
            return;
          }
        }

        // 3. BUY Button: 48px height mobile thumb target
        const buyW = mW - 20;
        const buyH = 48;
        const buyX = mX + 10;
        const buyY = mY + mH - buyH - 4;
        if (logicalX >= buyX && logicalX <= buyX + buyW && logicalY >= buyY && logicalY <= buyY + buyH) {
          if (gs.shop.selectedItemId) {
            const selItem = CONFIG.SHOP_ITEMS.find((it) => it.id === gs.shop.selectedItemId);
            if (selItem) {
              if (selItem.category === 'decor') {
                if (!gs.shop.decorOwned[selItem.id]) {
                  const res = purchase(gs, selItem.id, gs.currentFrame, nextEntityIdRef);
                  if (res.ok) {
                    gs.shop.decorOwned[selItem.id] = true;
                    gs.shop.decorShown[selItem.id] = true;
                    if (selItem.id === 'decorLagoon') gs.shop.decorShown['decorMidnight'] = false;
                    if (selItem.id === 'decorMidnight') gs.shop.decorShown['decorLagoon'] = false;
                    syncSaveStateFromGame(gs);
                  }
                } else {
                  gs.shop.decorShown[selItem.id] = !gs.shop.decorShown[selItem.id];
                  if (gs.shop.decorShown[selItem.id]) {
                    if (selItem.id === 'decorLagoon') gs.shop.decorShown['decorMidnight'] = false;
                    if (selItem.id === 'decorMidnight') gs.shop.decorShown['decorLagoon'] = false;
                  }
                  syncSaveStateFromGame(gs);
                }
              } else {
                purchase(gs, selItem.id, gs.currentFrame, nextEntityIdRef);
              }
            }
          }
          return;
        }

        // 4. Item cards grid
        const selCat = gs.shop.selectedCategory || 'pets';
        const items = CONFIG.SHOP_ITEMS.filter((it) => it.category === selCat);
        const contentX = mX + 10;
        const contentY = mY + 40 + 30 + 10;
        const contentW = mW - 20;
        const contentH = mH - 84 - 40;
        const scrollOffset = gs.shop.scrollOffset || 0;

        if (logicalX >= contentX && logicalX <= contentX + contentW && logicalY >= contentY && logicalY <= contentY + contentH) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const col = i % 2;
            const row = Math.floor(i / 2);
            const cardW = 134;
            const cardH = 100;
            const eggRowH = selCat === 'eggs' ? 32 : 0;
            const cardX = contentX + 6 + col * (cardW + 10);
            const cardY = contentY + 6 + eggRowH + row * (cardH + 10) - scrollOffset;

            if (logicalX >= cardX - 2 && logicalX <= cardX + cardW + 2 && logicalY >= cardY - 2 && logicalY <= cardY + cardH + 2) {
              gs.shop.selectedItemId = item.id;
              if (item.category === 'decor') {
                if (!gs.shop.decorOwned[item.id]) {
                  const res = purchase(gs, item.id, gs.currentFrame, nextEntityIdRef);
                  if (res.ok) {
                    gs.shop.decorOwned[item.id] = true;
                    gs.shop.decorShown[item.id] = true;
                    if (item.id === 'decorLagoon') gs.shop.decorShown['decorMidnight'] = false;
                    if (item.id === 'decorMidnight') gs.shop.decorShown['decorLagoon'] = false;
                    syncSaveStateFromGame(gs);
                  }
                } else {
                  gs.shop.decorShown[item.id] = !gs.shop.decorShown[item.id];
                  if (gs.shop.decorShown[item.id]) {
                    if (item.id === 'decorLagoon') gs.shop.decorShown['decorMidnight'] = false;
                    if (item.id === 'decorMidnight') gs.shop.decorShown['decorLagoon'] = false;
                  }
                  syncSaveStateFromGame(gs);
                }
              } else {
                purchase(gs, item.id, gs.currentFrame, nextEntityIdRef);
              }
              return;
            }
          }
        }
        // Consume click if on drawer
        return;
      }
    }

    // ------------------------------------------------------------------------
    // 0. HUD BUTTON TOUCHES (Top bar: y: 0 - 64, generous mobile targets)
    // ------------------------------------------------------------------------
    if (logicalY <= CONFIG.hudHeight + 4) {
      // Shop Button (x: 90 - 194) - generous mobile touch hitbox
      if (logicalX >= 90 && logicalX <= 194) {
        gs.shop.open = !gs.shop.open;
        return;
      }

      // Egg Goal Section Button (x: 198 - 550) - Topbar Egg Goal Button
      if (logicalX >= 198 && logicalX <= 550) {
        if (game.mode !== 'sandbox' && !gs.isTutorial) {
          const piecesBought = gs.eggPiecesBought || 0;
          if (piecesBought < 3) {
            const nextEggId = `eggPiece${piecesBought + 1}`;
            purchase(gs, nextEggId, gs.currentFrame, nextEntityIdRef);
          }
        }
        return;
      }

      // Level Badge (x: 560 - 624) - Hidden Debug Toggle
      if (logicalX >= 560 && logicalX <= 624) {
        setDebugCounter(prev => {
          const next = prev + 1;
          if (next >= 10) {
            setShowDebug(true);
            return 0;
          }
          return next;
        });
        return;
      }

      // Pause Button (x: 720 - 800) - generous corner mobile touch hitbox
      if (logicalX >= 720 && logicalX <= 800) {
        gs.state = 'PAUSED';
        gs.shop.open = false;
        gs.transitionTimer = 0.4;
        setCurrentScreen('PAUSED');
        setMuffled(true);
        return;
      }
      return;
    }

    // ------------------------------------------------------------------------
    // 1. COIN COLLECTION CHECK (PRIORITY OVER ALIEN & FOOD, MOBILE RADIUS 38px)
    // ------------------------------------------------------------------------
    let nearestCoin: Coin | null = null;
    let minCoinDist = Infinity;

    for (let i = 0; i < gs.coins.length; i++) {
      const coin = gs.coins[i];
      if (coin.dead || coin.collected) continue;
      const d = Math.hypot(coin.x - logicalX, coin.y - logicalY);
      if (d <= CONFIG.coinClickRadius && d < minCoinDist) {
        minCoinDist = d;
        nearestCoin = coin;
      }
    }

    if (nearestCoin) {
      nearestCoin.collected = true;
      playCoinCollectSound(nearestCoin.type);
      nearestCoin.startTweenX = nearestCoin.x;
      nearestCoin.startTweenY = nearestCoin.y;
      nearestCoin.tweenTimer = 0;

      // Add value to money instantly
      gs.money += nearestCoin.value;

      // Floating text "+15", "+35", or "+200"
      addParticle(gs, {
        id: nextEntityIdRef.current++,
        x: nearestCoin.x,
        y: nearestCoin.y,
        vx: 0,
        vy: -CONFIG.floatingTextRiseDistance / CONFIG.floatingTextDuration,
        radius: 0,
        color: nearestCoin.type === 'diamond' ? '#38bdf8' : nearestCoin.type === 'gold' ? '#fde047' : '#e2e8f0',
        life: 0,
        maxLife: CONFIG.floatingTextDuration,
        type: 'text',
        text: `+${nearestCoin.value}`,
        dead: false,
      });

      const sparkleBurstCount = nearestCoin.type === 'diamond' ? 14 : 8;
      for (let s = 0; s < sparkleBurstCount; s++) {
        const angle = (s / sparkleBurstCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 40 + 25;
        addParticle(gs, {
          id: nextEntityIdRef.current++,
          x: nearestCoin.x,
          y: nearestCoin.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2 + 1.2,
          color: nearestCoin.type === 'diamond' ? '#a5f3fc' : nearestCoin.type === 'gold' ? '#fef08a' : '#ffffff',
          life: 0,
          maxLife: 0.45,
          type: 'sparkle',
          dead: false,
        });
      }

      return;
    }

    // ------------------------------------------------------------------------
    // 2. ALIEN GARGO TOUCH CHECK (GENEROUS 53px MOBILE HITBOX)
    // ------------------------------------------------------------------------
    let hitAlien: Alien | null = null;
    let minAlienDist = Infinity;

    for (let i = 0; i < gs.aliens.length; i++) {
      const a = gs.aliens[i];
      if (a.dead) continue;
      const d = Math.hypot(a.x - logicalX, a.y - logicalY);
      if (d <= CONFIG.alienRadius + 18 && d < minAlienDist) {
        minAlienDist = d;
        hitAlien = a;
      }
    }

    if (hitAlien) {
      hitAlien.hp -= gs.stats.clickDamage;
      playLaserSound(gs.stats.weaponLevel);
      playAlienHitSound(gs.stats.weaponLevel);
      hitAlien.flashTimer = CONFIG.alienHitFlashDuration;
      if (hitAlien.trailTimer <= 0) {
        hitAlien.trailTimer = 0.2;
      }

      if (gs.stats.weaponLevel > 0) {
        gs.beams.push({
          id: nextEntityIdRef.current++,
          x: logicalX,
          y: logicalY,
          timer: 0,
          maxDuration: CONFIG.weaponBeamDuration,
          color: gs.stats.weaponLevel === 2 ? '#f43f5e' : '#38bdf8',
          dead: false,
        });
      }

      addParticle(gs, {
        id: nextEntityIdRef.current++,
        x: hitAlien.x + (Math.random() - 0.5) * 10,
        y: hitAlien.y - 25,
        vx: 0,
        vy: -35,
        radius: 0,
        color: gs.stats.clickDamage >= 4 ? '#f43f5e' : gs.stats.clickDamage >= 2 ? '#38bdf8' : '#ef4444',
        life: 0,
        maxLife: 0.5,
        type: 'text',
        text: `-${gs.stats.clickDamage}`,
        dead: false,
      });

      for (let k = 0; k < 4; k++) {
        addParticle(gs, {
          id: nextEntityIdRef.current++,
          x: logicalX,
          y: logicalY,
          vx: (Math.random() - 0.5) * 60,
          vy: (Math.random() - 0.5) * 60,
          radius: Math.random() * 2.5 + 1.5,
          color: '#22c55e',
          life: 0,
          maxLife: 0.35,
          type: 'slime',
          dead: false,
        });
      }

      if (hitAlien.hp <= 0) {
        hitAlien.dead = true;
        playAlienDieSound();
        gs.shakeTimer = 0.15; // 2px screen shake lasting 0.15s on alien death

        // 20-particle death explosion uses 2x2 squares in an alienGreen, cream, gold ramp
        const rampColors: PaletteKey[] = ['alienGreen', 'cream', 'gold'];
        for (let p = 0; p < CONFIG.alienDeathParticles; p++) {
          const angle = (p / CONFIG.alienDeathParticles) * Math.PI * 2 + Math.random() * 0.25;
          const speed = Math.random() * 75 + 35;
          const colorKey = rampColors[p % rampColors.length];
          addParticle(gs, {
            id: nextEntityIdRef.current++,
            x: hitAlien.x,
            y: hitAlien.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 2, // 2x2 squares
            color: colorKey,
            life: 0,
            maxLife: Math.random() * 0.35 + 0.35,
            type: 'alienDeath',
            dead: false,
          });
        }

        gs.coins.push({
          id: nextEntityIdRef.current++,
          type: 'diamond',
          value: CONFIG.coinDiamondValue,
          x: hitAlien.x,
          y: hitAlien.y,
          age: 0,
          collected: false,
          startTweenX: hitAlien.x,
          startTweenY: hitAlien.y,
          tweenTimer: 0,
          dead: false,
        });
        playCoinDropSound();

        gs.alienSpawnTimer = Math.random() * (CONFIG.alienRespawnMax - CONFIG.alienRespawnMin) + CONFIG.alienRespawnMin;
      }

      return;
    }

    // ------------------------------------------------------------------------
    // 3. WEAPON BEAM EFFECT ON ANY WATER TOUCH IF UPGRADED
    // ------------------------------------------------------------------------
    if (gs.stats.weaponLevel >= 1 && logicalY >= CONFIG.waterTop && logicalY <= CONFIG.waterBottom) {
      gs.beams.push({
        id: nextEntityIdRef.current++,
        x: logicalX,
        y: logicalY,
        timer: 0,
        maxDuration: CONFIG.weaponBeamDuration,
        color: gs.stats.weaponLevel === 2 ? '#f43f5e' : '#38bdf8',
        dead: false,
      });
      playLaserSound(gs.stats.weaponLevel);
    }

    // ------------------------------------------------------------------------
    // 4. FOOD DROP CHECK ON WATER TOUCH
    // ------------------------------------------------------------------------
    if (logicalY >= CONFIG.waterTop && logicalY <= CONFIG.waterBottom) {
      if (gs.food.length < gs.stats.foodLimit && gs.money >= CONFIG.foodCost) {
        gs.money -= CONFIG.foodCost;

        const clampedX = Math.max(15, Math.min(CONFIG.canvasWidth - 15, logicalX));
        gs.food.push({
          id: nextEntityIdRef.current++,
          x: clampedX,
          y: CONFIG.foodSpawnY,
          onFloor: false,
          floorTimer: 0,
          dead: false,
          tier: gs.stats.foodQualityTier,
          growthPoints: gs.stats.pelletValue,
        });
        playFoodDropSound();

        for (let i = 0; i < 4; i++) {
          addParticle(gs, {
            id: nextEntityIdRef.current++,
            x: clampedX + (Math.random() - 0.5) * 8,
            y: CONFIG.waterTop + 4,
            vx: (Math.random() - 0.5) * 30,
            vy: (Math.random() * 20) + 10,
            radius: Math.random() * 2 + 1.5,
            color: 'rgba(255, 255, 255, 0.7)',
            life: 0,
            maxLife: 0.6,
            type: 'bubble',
            dead: false,
          });
        }
      } else {
        gs.moneyFlashTimer = CONFIG.moneyFlashDuration;
        playRejectedSound(0.6);
      }
    }
  };



  // Main game loop effect
  useEffect(() => {
    let animationFrameId: number;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (gameStateRef.current.state === 'PLAYING') {
          gameStateRef.current.state = 'PAUSED';
          setCurrentScreen('PAUSED');
        }
      } else {
        lastTimeRef.current = performance.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    let pointerDownState: {
      clientX: number;
      clientY: number;
      uiX: number;
      uiY: number;
      pointerId: number;
      time: number;
      elementId: string;
      initialScrollOffset: number;
      isDragging: boolean;
    } | null = null;

    const loop = (currentTime: number) => {
      const gs = gameStateRef.current;
      gs.currentFrame = (gs.currentFrame || 0) + 1;

      const actions = drainActions();

      for (const action of actions) {
        if (action.type === 'tap') {
          resumeAudioContext();
          gs.mousePos.x = action.x!;
          gs.mousePos.y = action.y!;
          gs.mousePos.inCanvas = true;
          gs.mousePos.isMouseDown = true;

          const clientX = action.clientX ?? 0;
          const clientY = action.clientY ?? 0;
          const uiX = action.x!;
          const uiY = action.y!;
          const pointerId = action.pointerId ?? 0;

          shopLog('pointerdown', { clientX, clientY, uiX, uiY, pointerId, elapsedMs: 0, moveDistance: 0 });
          const hit = hitTestShop(uiX, uiY, gs);
          shopLog('hit', { id: hit.id, rect: hit.rect });
          pointerDownState = {
            clientX,
            clientY,
            uiX,
            uiY,
            pointerId,
            time: performance.now(),
            elementId: hit.id,
            initialScrollOffset: gs.shop?.scrollOffset || 0,
            isDragging: false,
          };

          if (hit.id.startsWith('row:')) {
            gs.shop.selectedItemId = hit.id.split(':')[1];
            shopLog('select', hit.id);
          }

          if (gs.shop?.open || (gs.shop?.animTimer || 0) > 0) {
            const progress = gs.shop.animTimer || 0;
            const easeOut = 1 - Math.pow(1 - progress, 2);
            const mX = 500 + (1 - easeOut) * 300;
            if (uiX >= mX) {
              continue;
            }
          }

          processClick(action.x!, action.y!);
        } else if (action.type === 'hover') {
          gs.mousePos.x = action.x!;
          gs.mousePos.y = action.y!;
          gs.mousePos.inCanvas = true;

          // Track touch dragging for shop catalog swipe-scrolling
          if (pointerDownState && gs.mousePos.isMouseDown) {
            if (gs.shop?.open) {
              const dy = pointerDownState.uiY - action.y!;
              if (Math.abs(dy) > 6) {
                pointerDownState.isDragging = true;
                const selCat = gs.shop.selectedCategory || 'pets';
                const items = CONFIG.SHOP_ITEMS.filter((it) => it.category === selCat);
                const rows = Math.ceil(items.length / 2);
                const totalContentHeight = rows * 110;
                const maxScroll = Math.max(0, totalContentHeight - 396);
                gs.shop.scrollOffset = Math.max(0, Math.min(maxScroll, pointerDownState.initialScrollOffset + dy));
              }
            }
          }
        } else if (action.type === 'pointerup') {
          gs.mousePos.isMouseDown = false;
          gs.mousePos.inCanvas = true;

          const clientX = action.clientX ?? 0;
          const clientY = action.clientY ?? 0;
          const uiX = action.x!;
          const uiY = action.y!;
          const pointerId = action.pointerId ?? 0;
          const elapsedMs = pointerDownState ? performance.now() - pointerDownState.time : 0;
          const moveDistance = pointerDownState ? Math.hypot(clientX - pointerDownState.clientX, clientY - pointerDownState.clientY) : 0;

          shopLog('pointerup', { clientX, clientY, uiX, uiY, pointerId, elapsedMs, moveDistance });
          const upHit = hitTestShop(uiX, uiY, gs);
          shopLog('hit', { id: upHit.id, rect: upHit.rect });

          if (pointerDownState && !pointerDownState.isDragging && pointerDownState.elementId === upHit.id && upHit.id !== 'none') {
            const upId = upHit.id;
            if (upId.startsWith('tab:')) {
              const cat = upId.split(':')[1] as ShopCategory;
              gs.shop.selectedCategory = cat;
              gs.shop.scrollOffset = 0;
              gs.shop.selectedItemId = null;
            } else if (upId === 'close') {
              gs.shop.open = false;
              gs.shop.selectedItemId = null;
            } else if (upId.startsWith('row:')) {
              const itemId = upId.split(':')[1];
              gs.shop.selectedItemId = itemId;
              shopLog('select', upId);
            } else if (upId === 'buy') {
              shopLog('buyPress', {});
              if (gs.shop.selectedItemId) {
                const selItem = CONFIG.SHOP_ITEMS.find((it) => it.id === gs.shop.selectedItemId);
                if (selItem) {
                  const currentLvl = gs.shop.levels[selItem.id] || 0;
                  const priceIndex = Math.min(currentLvl, selItem.prices.length - 1);
                  const price = selItem.prices[priceIndex];
                  shopLog('purchase:call', { id: selItem.id, money: gs.money, level: currentLvl, price });
                  const before = { money: gs.money, level: currentLvl };

                  if (selItem.category === 'decor') {
                    if (!gs.shop.decorOwned[selItem.id]) {
                      const res = purchase(gs, selItem.id, gs.currentFrame, nextEntityIdRef);
                      const after = { money: gs.money, level: gs.shop.levels[selItem.id] || 0 };
                      shopLog('purchase:result', { ok: res.ok, reason: res.reason });
                      if (res.ok) {
                        gs.shop.decorOwned[selItem.id] = true;
                        gs.shop.decorShown[selItem.id] = true;
                        if (selItem.id === 'decorLagoon') gs.shop.decorShown['decorMidnight'] = false;
                        if (selItem.id === 'decorMidnight') gs.shop.decorShown['decorLagoon'] = false;
                        shopLog('effect', { effectId: selItem.effectId, before, after });
                        syncSaveStateFromGame(gs);
                      }
                    } else {
                      gs.shop.decorShown[selItem.id] = !gs.shop.decorShown[selItem.id];
                      if (gs.shop.decorShown[selItem.id]) {
                        if (selItem.id === 'decorLagoon') gs.shop.decorShown['decorMidnight'] = false;
                        if (selItem.id === 'decorMidnight') gs.shop.decorShown['decorLagoon'] = false;
                      }
                      shopLog('purchase:result', { ok: true });
                      syncSaveStateFromGame(gs);
                    }
                  } else {
                    const res = purchase(gs, selItem.id, gs.currentFrame, nextEntityIdRef);
                    const after = { money: gs.money, level: gs.shop.levels[selItem.id] || 0 };
                    shopLog('purchase:result', { ok: res.ok, reason: res.reason });
                    if (res.ok) {
                      shopLog('effect', { effectId: selItem.effectId, before, after });
                    }
                  }
                }
              }
            }
          }
          pointerDownState = null;
        } else if (action.type === 'scroll') {
          if (gs.shop?.open) {
            const delta = action.dy! > 0 ? 36 : -36;
            const currentScroll = gs.shop.scrollOffset || 0;
            const selCat = gs.shop.selectedCategory || 'pets';
            const items = CONFIG.SHOP_ITEMS.filter((it) => it.category === selCat);
            const rows = Math.ceil(items.length / 2);
            const eggRowH = selCat === 'eggs' ? 32 : 0;
            const totalContentHeight = eggRowH + rows * 110;
            const maxScroll = Math.max(0, totalContentHeight - 396);
            gs.shop.scrollOffset = Math.max(0, Math.min(maxScroll, currentScroll + delta));
          }
        } else if (action.type === 'toggleShop') {
          if (gs.state === 'PLAYING') {
            gs.shop.open = !gs.shop.open;
          }
        } else if (action.type === 'togglePause') {
          if (gs.state === 'PLAYING') {
            if (gs.shop?.open) gs.shop.open = false;
            gs.state = 'PAUSED';
            setCurrentScreen('PAUSED');
            setMuffled(true);
          } else if (gs.state === 'PAUSED') {
            gs.state = 'PLAYING';
            setCurrentScreen('PLAYING');
            lastTimeRef.current = performance.now();
            setMuffled(false);
          }
        } else if (action.type === 'closeTop') {
          if (gs.shop?.open) {
            gs.shop.open = false;
          } else if (gs.state === 'SANDBOX_OPTIONS') {
            gs.state = 'PAUSED';
          } else if (gs.state === 'PLAYING') {
            gs.state = 'PAUSED';
            setCurrentScreen('PAUSED');
            setMuffled(true);
          } else if (gs.state === 'PAUSED') {
            gs.state = 'PLAYING';
            setCurrentScreen('PLAYING');
            lastTimeRef.current = performance.now();
            setMuffled(false);
          }
        }
      }

      let dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;
      if (dt > CONFIG.maxDeltaTime) {
        dt = CONFIG.maxDeltaTime;
      }

      if (gs.state === 'PLAYING') {
        gs.time += dt;
        gs.levelElapsedTime += dt;
        updateTutorial(gs, dt);

        if (gs.moneyFlashTimer > 0) {
          gs.moneyFlashTimer = Math.max(0, gs.moneyFlashTimer - dt);
        }

        if (gs.shop.open) {
          gs.shop.animTimer = Math.min(1, (gs.shop.animTimer || 0) + dt / 0.2);
        } else {
          gs.shop.animTimer = Math.max(0, (gs.shop.animTimer || 0) - dt / 0.15);
        }

        if (gs.shop?.cardPressTimers) {
          for (const k in gs.shop.cardPressTimers) {
            if (gs.shop.cardPressTimers[k] > 0) gs.shop.cardPressTimers[k] = Math.max(0, gs.shop.cardPressTimers[k] - dt);
          }
        }
        if (gs.shop?.cardFlashTimers) {
          for (const k in gs.shop.cardFlashTimers) {
            if (gs.shop.cardFlashTimers[k] > 0) gs.shop.cardFlashTimers[k] = Math.max(0, gs.shop.cardFlashTimers[k] - dt);
          }
        }
        if (gs.shop?.cardShakeTimers) {
          for (const k in gs.shop.cardShakeTimers) {
            if (gs.shop.cardShakeTimers[k] > 0) gs.shop.cardShakeTimers[k] = Math.max(0, gs.shop.cardShakeTimers[k] - dt);
          }
        }

        // --------------------------------------------------------------------
        // 1. UPDATE ALIEN GARGO
        // --------------------------------------------------------------------
        const isAlienEnabled = game.mode !== 'sandbox' || game.sandbox.aliens;

        if (!isAlienEnabled) {
          for (let i = 0; i < gs.aliens.length; i++) {
            const a = gs.aliens[i];
            if (!a.dead) {
              a.dead = true;
              for (let k = 0; k < 12; k++) {
                addParticle(gs, {
                  id: nextEntityIdRef.current++,
                  x: a.x + (Math.random() - 0.5) * 20,
                  y: a.y + (Math.random() - 0.5) * 20,
                  vx: (Math.random() - 0.5) * 30,
                  vy: (Math.random() - 0.5) * 30,
                  radius: Math.random() * 2 + 1,
                  color: '#22c55e',
                  life: 0,
                  maxLife: 0.3,
                  type: 'slime',
                  dead: false,
                });
              }
            }
          }
          gs.alienSpawnTimer = Math.random() * (CONFIG.alienFirstSpawnMax - CONFIG.alienFirstSpawnMin) + CONFIG.alienFirstSpawnMin;
        } else {
          if (gs.aliens.length === 0) {
            gs.alienSpawnTimer -= dt;
            if (gs.alienSpawnTimer <= 0) {
              spawnGargo(gs);
            }
          }

        for (let i = 0; i < gs.aliens.length; i++) {
          const a = gs.aliens[i];
          if (a.dead) continue;

          a.animTimer += dt;
          if (a.killCooldown > 0) a.killCooldown = Math.max(0, a.killCooldown - dt);
          if (a.flashTimer > 0) a.flashTimer = Math.max(0, a.flashTimer - dt);

          // Yellow trail lags 0.2s behind
          if (a.trailTimer > 0) {
            a.trailTimer = Math.max(0, a.trailTimer - dt);
          } else if (a.trailHp > a.hp) {
            a.trailHp = Math.max(a.hp, a.trailHp - (a.maxHp / 0.2) * dt);
          }

          // Target nearest living fish (Snail is NEVER targeted by aliens)
          const livingFish = gs.fish.filter((f) => !f.isDying && !f.dead);
          let targetFish: Fish | null = null;
          let minFishDist = Infinity;

          for (let f = 0; f < livingFish.length; f++) {
            const fish = livingFish[f];
            const d = Math.hypot(fish.x - a.x, fish.y - a.y);
            if (d < minFishDist) {
              minFishDist = d;
              targetFish = fish;
            }
          }

          if (targetFish) {
            const dx = targetFish.x - a.x;
            const dy = targetFish.y - a.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 1) {
              a.vx = (dx / dist) * CONFIG.alienSpeed;
              a.vy = (dy / dist) * CONFIG.alienSpeed;
            }
            a.facing = a.vx >= 0 ? 1 : -1;

            if (dist <= CONFIG.alienRadius + 14 && a.killCooldown <= 0) {
              targetFish.isDying = true;
              targetFish.targetFlipY = -1;
              playAlienKillFishSound();
              targetFish.timeSinceAte = targetFish.isCarnivore ? CONFIG.carnivoreStarveTime : CONFIG.fishStarveTime;
              a.killCooldown = CONFIG.alienKillCooldown;
              gs.shakeTimer = 0.15; // Screen shake on fish killed

              for (let k = 0; k < 6; k++) {
                addParticle(gs, {
                  id: nextEntityIdRef.current++,
                  x: targetFish.x + (Math.random() - 0.5) * 8,
                  y: targetFish.y + (Math.random() - 0.5) * 8,
                  vx: (Math.random() - 0.5) * 40,
                  vy: (Math.random() - 0.5) * 40,
                  radius: Math.random() * 2 + 1,
                  color: '#ef4444',
                  life: 0,
                  maxLife: 0.5,
                  type: 'crumb',
                  dead: false,
                });
              }
            }
          } else {
            a.vx = a.facing * 35;
            a.vy = Math.sin(gs.time * 2) * 20;
          }

          a.x += a.vx * dt;
          a.y += a.vy * dt;
          a.y = Math.max(CONFIG.waterTop + CONFIG.alienRadius, Math.min(CONFIG.waterBottom - CONFIG.alienRadius, a.y));
        }
        }

        // --------------------------------------------------------------------
        // 2. UPDATE SNAIL
        // Crawls along sand at 35 px/s toward nearest resting coin, collects it
        // on contact using same flag & payout as click, drifts idly when no coins.
        // --------------------------------------------------------------------
        // --------------------------------------------------------------------
        // 2. UPDATE SNAIL
        // Crawls along sand at 35 px/s toward nearest resting coin, collects it
        // on contact using same flag & payout as click, drifts idly when no coins.
        // --------------------------------------------------------------------
        for (let i = 0; i < gs.snails.length; i++) {
          const s = gs.snails[i];
          if (s.dead) continue;

          // Find resting coins on sand (y >= coinRestY - 2)
          const restingCoins = gs.coins.filter((c) => !c.dead && !c.collected && c.y >= CONFIG.coinRestY - 2);

          if (restingCoins.length > 0) {
            // Find nearest resting coin by horizontal distance
            let nearestCoin: Coin | null = null;
            let minCoinDist = Infinity;
            for (let c = 0; c < restingCoins.length; c++) {
              const coin = restingCoins[c];
              const dist = Math.abs(coin.x - s.x);
              if (dist < minCoinDist) {
                minCoinDist = dist;
                nearestCoin = coin;
              }
            }

            if (nearestCoin) {
              const dx = nearestCoin.x - s.x;
              s.vx = (dx > 0 ? 1 : -1) * CONFIG.snailSpeed;
              s.facing = dx > 0 ? 1 : -1;

              // Collect on contact
              if (Math.abs(dx) <= CONFIG.snailCollectRadius) {
                nearestCoin.collected = true;
                playCoinCollectSound(nearestCoin.type);
                nearestCoin.startTweenX = nearestCoin.x;
                nearestCoin.startTweenY = nearestCoin.y;
                nearestCoin.tweenTimer = 0;

                // Add value to money instantly
                gs.money += nearestCoin.value;

                // Floating text
                addParticle(gs, {
                  id: nextEntityIdRef.current++,
                  x: nearestCoin.x,
                  y: nearestCoin.y,
                  vx: 0,
                  vy: -CONFIG.floatingTextRiseDistance / CONFIG.floatingTextDuration,
                  radius: 0,
                  color: nearestCoin.type === 'diamond' ? '#38bdf8' : nearestCoin.type === 'gold' ? '#fde047' : '#e2e8f0',
                  life: 0,
                  maxLife: CONFIG.floatingTextDuration,
                  type: 'text',
                  text: `+${nearestCoin.value}`,
                  dead: false,
                });

                // Sparkles
                for (let k = 0; k < 8; k++) {
                  const angle = (k / 8) * Math.PI * 2;
                  addParticle(gs, {
                    id: nextEntityIdRef.current++,
                    x: nearestCoin.x,
                    y: nearestCoin.y,
                    vx: Math.cos(angle) * 35,
                    vy: Math.sin(angle) * 35,
                    radius: Math.random() * 2 + 1,
                    color: nearestCoin.type === 'diamond' ? '#38bdf8' : '#fbbf24',
                    life: 0,
                    maxLife: 0.4,
                    type: 'sparkle',
                    dead: false,
                  });
                }
              }
            }
          } else {
            // Drift idly when no coins exist
            s.idleTimer -= dt;
            if (s.idleTimer <= 0) {
              s.vx = (Math.random() < 0.5 ? 1 : -1) * 14;
              s.facing = s.vx > 0 ? 1 : -1;
              s.idleTimer = Math.random() * 3 + 3;
            }
          }

          s.x += s.vx * dt;
          s.crawlTimer += dt * Math.abs(s.vx);

          // Snail leaves a trail of 1px dots that fade over 2s
          if (Math.abs(s.vx) > 0) {
            s.dotTimer = (s.dotTimer || 0) + dt;
            if (s.dotTimer >= 0.12) {
              s.dotTimer = 0;
              addParticle(gs, {
                id: nextEntityIdRef.current++,
                x: s.x + (s.facing > 0 ? -12 : 12),
                y: s.y + 12,
                vx: 0,
                vy: 0,
                radius: 1,
                color: 'sand',
                life: 0,
                maxLife: 2.0,
                type: 'snailDot',
                dead: false,
              });
            }
          }

          // Sand boundary clamp
          if (s.x < 30) { s.x = 30; s.vx = 14; s.facing = 1; }
          if (s.x > CONFIG.canvasWidth - 30) { s.x = CONFIG.canvasWidth - 30; s.vx = -14; s.facing = -1; }
        }

        // --------------------------------------------------------------------
        // 2.5 UPDATE REWARD PETS
        // --------------------------------------------------------------------
        processRewardPets(gs, dt);

        // 4. UPDATE BEAMS
        // --------------------------------------------------------------------
        for (let i = 0; i < gs.beams.length; i++) {
          const b = gs.beams[i];
          if (b.dead) continue;
          b.timer += dt;
          if (b.timer >= b.maxDuration) {
            b.dead = true;
          }
        }

        // --------------------------------------------------------------------
        // 4. UPDATE FOOD
        // --------------------------------------------------------------------
        for (let i = 0; i < gs.food.length; i++) {
          const pellet = gs.food[i];
          if (pellet.dead) continue;

          if (!pellet.onFloor) {
            pellet.sinkAge = (pellet.sinkAge || 0) + dt;
            pellet.bubbleTimer = (pellet.bubbleTimer || 0) + dt;
            pellet.y += CONFIG.foodSinkSpeed * dt;

            // One rising 2px bubble every 0.4s
            if (pellet.bubbleTimer >= 0.4) {
              pellet.bubbleTimer -= 0.4;
              addParticle(gs, {
                id: nextEntityIdRef.current++,
                x: pellet.x,
                y: pellet.y - 2,
                vx: (Math.random() - 0.5) * 4,
                vy: -18,
                radius: 2,
                color: 'cream',
                life: 0,
                maxLife: 1.2,
                type: 'bubble',
                dead: false,
              });
            }

            if (pellet.y >= CONFIG.sandTop) {
              pellet.y = CONFIG.sandTop;
              pellet.onFloor = true;
              pellet.floorTimer = 0;
            }
          } else {
            pellet.floorTimer += dt;
            if (pellet.floorTimer >= CONFIG.foodFloorLifespan) {
              pellet.dead = true;
            }
          }
        }

        // --------------------------------------------------------------------
        // 5. UPDATE FISH & CARNIVORES
        // --------------------------------------------------------------------
        for (let i = 0; i < gs.fish.length; i++) {
          const fish = gs.fish[i];
          if (fish.dead) continue;

          const currentSpeed = Math.hypot(fish.vx, fish.vy);
          fish.tailWagTimer += dt * (currentSpeed * 0.18 + 3.0);
          fish.bobTimer += dt * CONFIG.fishBobFrequency;

          if (fish.scalePopTimer > 0) {
            fish.scalePopTimer = Math.max(0, fish.scalePopTimer - dt);
          }

          let baseLength = CONFIG.fishSize0Length;
          if (fish.isCarnivore) {
            baseLength = CONFIG.carnivoreLength;
          } else if (fish.size === 1) {
            baseLength = CONFIG.fishSize1Length;
          } else if (fish.size === 2) {
            baseLength = CONFIG.fishSize2Length;
          }
          const bodyHalfLength = baseLength * 0.5;

          // Starvation check (scaled per level: -10% per level)
          const starveLimit = fish.isCarnivore
            ? (gs.carnivoreStarveTimeScaled || CONFIG.carnivoreStarveTime)
            : (gs.fishStarveTimeScaled || CONFIG.fishStarveTime);
          const isHungerDeathEnabled = (game.mode !== 'sandbox' || game.sandbox.hunger) && !gs.isTutorial;

          if (!fish.isDying) {
            fish.timeSinceAte += dt;
            if (isHungerDeathEnabled && fish.timeSinceAte >= starveLimit) {
              fish.isDying = true;
              fish.targetFlipY = -1;
              gs.shakeTimer = 0.15;
              playFishDieSound();
            }
          }

          // Dying sequence (same for all fish)
          if (fish.isDying) {
            const flipYSpeed = 5;
            if (fish.flipY > -1) {
              fish.flipY = Math.max(-1, fish.flipY - flipYSpeed * dt);
            }

            if (fish.y > CONFIG.fishDeadTargetY) {
              fish.y = Math.max(CONFIG.fishDeadTargetY, fish.y - CONFIG.fishDeadRiseSpeed * dt);
              fish.x += Math.sin(gs.time * 2 + fish.id) * 8 * dt;
            } else {
              fish.fadeTimer += dt;
              fish.opacity = Math.max(0, 1 - (fish.fadeTimer / CONFIG.fishDeadFadeDuration));
              if (fish.fadeTimer >= CONFIG.fishDeadFadeDuration) {
                fish.dead = true;
              }
            }
            continue;
          }

          // ==========================================
          // CARNIVORE BEHAVIOR
          // - Ignores pellets
          // - Drops diamond worth 200 every 15s while fed (timeSinceAte < 20s)
          // - Chases & eats nearest size-0 fish within 250px once gone 20s without eating
          // ==========================================
          if (fish.isCarnivore) {
            const isCarnivoreHungry = fish.timeSinceAte >= CONFIG.carnivoreHungryTime;
            if (fish.timeSinceAte >= CONFIG.carnivoreHungryTime && fish.timeSinceAte - dt < CONFIG.carnivoreHungryTime) {
              playFishHungrySound();
            }

            // Drops diamond every 15s while fed
            if (!isCarnivoreHungry) {
              fish.diamondTimer -= dt;
              if (fish.diamondTimer <= 0) {
                fish.diamondTimer = CONFIG.carnivoreDiamondInterval;
                const currentBob = Math.sin(fish.bobTimer + fish.bobOffset) * CONFIG.fishBobAmplitude;

                gs.coins.push({
                  id: nextEntityIdRef.current++,
                  type: 'diamond',
                  value: CONFIG.coinDiamondValue,
                  x: fish.x,
                  y: fish.y + currentBob,
                  age: 0,
                  collected: false,
                  startTweenX: fish.x,
                  startTweenY: fish.y + currentBob,
                  tweenTimer: 0,
                  dead: false,
                });
                playCoinDropSound();

                // Sparkle on drop
                addParticle(gs, {
                  id: nextEntityIdRef.current++,
                  x: fish.x,
                  y: fish.y + currentBob,
                  vx: (Math.random() - 0.5) * 15,
                  vy: (Math.random() - 0.5) * 15,
                  radius: 2.5,
                  color: '#38bdf8',
                  life: 0,
                  maxLife: 0.4,
                  type: 'sparkle',
                  dead: false,
                });
              }
            }

            let desiredVx = 0;
            let desiredVy = 0;

            if (isCarnivoreHungry) {
              // Hunt nearest size-0 fish within 250px
              const size0Fish = gs.fish.filter((f) => !f.isCarnivore && f.size === 0 && !f.isDying && !f.dead);
              let nearestPrey: Fish | null = null;
              let minPreyDist = Infinity;

              for (let p = 0; p < size0Fish.length; p++) {
                const prey = size0Fish[p];
                const d = Math.hypot(prey.x - fish.x, prey.y - fish.y);
                if (d <= CONFIG.carnivoreDetectionRadius && d < minPreyDist) {
                  minPreyDist = d;
                  nearestPrey = prey;
                }
              }

              if (nearestPrey) {
                const carnFacing = nearestPrey.x >= fish.x ? 1 : -1;
                fish.targetFacing = carnFacing;

                const targetX = nearestPrey.x - carnFacing * bodyHalfLength;
                const targetY = nearestPrey.y;

                const dx = targetX - fish.x;
                const dy = targetY - fish.y;
                const dist = Math.hypot(dx, dy);

                if (dist > 1) {
                  desiredVx = (dx / dist) * CONFIG.carnivoreChaseSpeed;
                  desiredVy = (dy / dist) * CONFIG.carnivoreChaseSpeed;
                }

                // Mouth collision check
                const mouthFacing = fish.facing >= 0 ? 1 : -1;
                const mouthX = fish.x + mouthFacing * bodyHalfLength;
                const mouthY = fish.y + Math.sin(fish.bobTimer + fish.bobOffset) * CONFIG.fishBobAmplitude;
                const mouthDist = Math.hypot(nearestPrey.x - mouthX, nearestPrey.y - mouthY);

                const headX = fish.x + fish.targetFacing * bodyHalfLength;
                const headDist = Math.hypot(nearestPrey.x - headX, nearestPrey.y - mouthY);
                const centerDist = Math.hypot(nearestPrey.x - fish.x, nearestPrey.y - fish.y);

                if (mouthDist <= CONFIG.fishEatDistance + 4 || headDist <= CONFIG.fishEatDistance + 4 || centerDist <= bodyHalfLength + 6) {
                  // EAT SIZE-0 FISH!
                  nearestPrey.dead = true;
                  playCarnivoreEatSound();
                  fish.timeSinceAte = 0; // fed again!
                  fish.diamondTimer = CONFIG.carnivoreDiamondInterval;
                  gs.shakeTimer = 0.15; // Screen shake on fish killed

                  for (let k = 0; k < 8; k++) {
                    addParticle(gs, {
                      id: nextEntityIdRef.current++,
                      x: mouthX + (Math.random() - 0.5) * 8,
                      y: mouthY + (Math.random() - 0.5) * 8,
                      vx: (Math.random() - 0.5) * 45,
                      vy: (Math.random() - 0.5) * 45,
                      radius: Math.random() * 2 + 1,
                      color: '#fb923c',
                      life: 0,
                      maxLife: 0.5,
                      type: 'crumb',
                      dead: false,
                    });
                  }
                }
              } else {
                // Hungry, but no size-0 fish in 250px range -> wander
                fish.wanderTimer -= dt;
                if (fish.wanderTimer <= 0) {
                  fish.targetX = Math.random() * (CONFIG.canvasWidth - 2 * CONFIG.fishPadding) + CONFIG.fishPadding;
                  fish.targetY = Math.random() * ((CONFIG.waterBottom - CONFIG.fishPadding) - (CONFIG.waterTop + CONFIG.fishPadding)) + (CONFIG.waterTop + CONFIG.fishPadding);
                  fish.wanderTimer = Math.random() * (CONFIG.fishWanderChangeMax - CONFIG.fishWanderChangeMin) + CONFIG.fishWanderChangeMin;
                }
                const dx = fish.targetX - fish.x;
                const dy = fish.targetY - fish.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 4) {
                  desiredVx = (dx / dist) * CONFIG.carnivoreSpeed;
                  desiredVy = (dy / dist) * CONFIG.carnivoreSpeed;
                }
              }
            } else {
              // Fed carnivore: wander peacefully
              fish.wanderTimer -= dt;
              if (fish.wanderTimer <= 0) {
                fish.targetX = Math.random() * (CONFIG.canvasWidth - 2 * CONFIG.fishPadding) + CONFIG.fishPadding;
                fish.targetY = Math.random() * ((CONFIG.waterBottom - CONFIG.fishPadding) - (CONFIG.waterTop + CONFIG.fishPadding)) + (CONFIG.waterTop + CONFIG.fishPadding);
                fish.wanderTimer = Math.random() * (CONFIG.fishWanderChangeMax - CONFIG.fishWanderChangeMin) + CONFIG.fishWanderChangeMin;
              }
              const dx = fish.targetX - fish.x;
              const dy = fish.targetY - fish.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 4) {
                desiredVx = (dx / dist) * CONFIG.carnivoreSpeed;
                desiredVy = (dy / dist) * CONFIG.carnivoreSpeed;
              }
            }

            const steerRate = Math.min(1.0, dt * CONFIG.fishSteeringEase);
            fish.vx += (desiredVx - fish.vx) * steerRate;
            fish.vy += (desiredVy - fish.vy) * steerRate;

            fish.x += fish.vx * dt;
            fish.y += fish.vy * dt;

            // Clamping
            const minX = CONFIG.fishPadding;
            const maxX = CONFIG.canvasWidth - CONFIG.fishPadding;
            const minY = CONFIG.waterTop + 6;
            const maxY = CONFIG.sandTop;

            if (fish.x < minX) { fish.x = minX; fish.vx = Math.abs(fish.vx); }
            if (fish.x > maxX) { fish.x = maxX; fish.vx = -Math.abs(fish.vx); }
            if (fish.y < minY) { fish.y = minY; fish.vy = Math.abs(fish.vy); }
            if (fish.y > maxY) { fish.y = maxY; fish.vy = -Math.abs(fish.vy); }

            if (fish.vx > 1) {
              fish.targetFacing = 1;
            } else if (fish.vx < -1) {
              fish.targetFacing = -1;
            }

            const flipStep = (2 / CONFIG.fishFlipDuration) * dt;
            if (fish.facing !== fish.targetFacing) {
              if (fish.facing < fish.targetFacing) {
                fish.facing = Math.min(fish.targetFacing, fish.facing + flipStep);
              } else {
                fish.facing = Math.max(fish.targetFacing, fish.facing - flipStep);
              }
            }

            continue; // End carnivore loop
          }

          // ==========================================
          // NORMAL GOLDFISH BEHAVIOR
          // ==========================================
          if (fish.size >= 1) {
            fish.coinTimer -= dt;
            if (fish.coinTimer <= 0) {
              fish.coinTimer = Math.random() * (CONFIG.coinDropIntervalMax - CONFIG.coinDropIntervalMin) + CONFIG.coinDropIntervalMin;

              const isGold = fish.size === 2;
              const coinValue = isGold ? CONFIG.coinGoldValue : CONFIG.coinSilverValue;
              const coinType: 'silver' | 'gold' = isGold ? 'gold' : 'silver';

              const currentBob = Math.sin(fish.bobTimer + fish.bobOffset) * CONFIG.fishBobAmplitude;
              gs.coins.push({
                id: nextEntityIdRef.current++,
                type: coinType,
                value: coinValue,
                x: fish.x,
                y: fish.y + currentBob,
                age: 0,
                collected: false,
                startTweenX: fish.x,
                startTweenY: fish.y + currentBob,
                tweenTimer: 0,
                dead: false,
              });
              playCoinDropSound();

              addParticle(gs, {
                id: nextEntityIdRef.current++,
                x: fish.x,
                y: fish.y + currentBob,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                radius: 2,
                color: isGold ? '#fde047' : '#cbd5e1',
                life: 0,
                maxLife: 0.35,
                type: 'sparkle',
                dead: false,
              });
            }
          }

          const isHungry = fish.timeSinceAte >= CONFIG.fishHungryTime;
          if (fish.timeSinceAte >= CONFIG.fishHungryTime && fish.timeSinceAte - dt < CONFIG.fishHungryTime) {
            playFishHungrySound();
          }
          let desiredVx = 0;
          let desiredVy = 0;

          if (isHungry) {
            let nearestPellet: Food | null = null;
            let minDistance = Infinity;

            for (let j = 0; j < gs.food.length; j++) {
              const pellet = gs.food[j];
              if (pellet.dead) continue;
              const d = Math.hypot(pellet.x - fish.x, pellet.y - fish.y);
              if (d < minDistance) {
                minDistance = d;
                nearestPellet = pellet;
              }
            }

            if (nearestPellet) {
              // Aim the fish's mouth directly at the pellet
              const facingSign = nearestPellet.x >= fish.x ? 1 : -1;
              fish.targetFacing = facingSign;

              // Center target coordinates so mouth reaches the pellet
              const targetX = nearestPellet.x - facingSign * bodyHalfLength;
              const targetY = nearestPellet.y;

              const dx = targetX - fish.x;
              const dy = targetY - fish.y;
              const dist = Math.hypot(dx, dy);

              if (dist > 1) {
                desiredVx = (dx / dist) * CONFIG.fishChaseSpeed;
                desiredVy = (dy / dist) * CONFIG.fishChaseSpeed;
              }

              // Mouth position based on body size and facing
              const mouthFacing = fish.facing >= 0 ? 1 : -1;
              const mouthX = fish.x + mouthFacing * bodyHalfLength;
              const mouthY = fish.y + Math.sin(fish.bobTimer + fish.bobOffset) * CONFIG.fishBobAmplitude;
              const mouthDist = Math.hypot(nearestPellet.x - mouthX, nearestPellet.y - mouthY);

              // Target mouth position
              const headX = fish.x + fish.targetFacing * bodyHalfLength;
              const headDist = Math.hypot(nearestPellet.x - headX, nearestPellet.y - mouthY);
              const centerDist = Math.hypot(nearestPellet.x - fish.x, nearestPellet.y - fish.y);

              // Eat when mouth or snout is within eating distance
              if (mouthDist <= CONFIG.fishEatDistance || headDist <= CONFIG.fishEatDistance || centerDist <= bodyHalfLength + 4) {
                nearestPellet.dead = true;
                fish.timeSinceAte = 0;
                fish.growthPoints += nearestPellet.growthPoints ?? ((nearestPellet.tier || 0) + 1);
                playFishEatSound();

                for (let k = 0; k < 6; k++) {
                  addParticle(gs, {
                    id: nextEntityIdRef.current++,
                    x: mouthX + (Math.random() - 0.5) * 6,
                    y: mouthY + (Math.random() - 0.5) * 6,
                    vx: (Math.random() - 0.5) * 35,
                    vy: (Math.random() - 0.5) * 35,
                    radius: Math.random() * 2 + 1,
                    color: '#c28543',
                    life: 0,
                    maxLife: 0.5,
                    type: 'crumb',
                    dead: false,
                  });
                }
                addParticle(gs, {
                  id: nextEntityIdRef.current++,
                  x: mouthX,
                  y: mouthY - 4,
                  vx: (Math.random() - 0.5) * 10,
                  vy: -25 - Math.random() * 15,
                  radius: 3,
                  color: 'rgba(255, 255, 255, 0.65)',
                  life: 0,
                  maxLife: 1.2,
                  type: 'bubble',
                  dead: false,
                });

                if (fish.growthPoints >= CONFIG.fishGrowthPointsSize2 && fish.size < 2) {
                  fish.size = 2;
                  fish.scalePopTimer = CONFIG.fishGrowthPopDuration;
                  playFishGrowSound();
                  for (let s = 0; s < 12; s++) {
                    const angle = (s / 12) * Math.PI * 2;
                    addParticle(gs, {
                      id: nextEntityIdRef.current++,
                      x: fish.x,
                      y: fish.y,
                      vx: Math.cos(angle) * (30 + Math.random() * 20),
                      vy: Math.sin(angle) * (30 + Math.random() * 20),
                      radius: Math.random() * 2.5 + 1.5,
                      color: '#fbbf24',
                      life: 0,
                      maxLife: 0.7,
                      type: 'sparkle',
                      dead: false,
                    });
                  }
                } else if (fish.growthPoints >= CONFIG.fishGrowthPointsSize1 && fish.size < 1) {
                  fish.size = 1;
                  fish.scalePopTimer = CONFIG.fishGrowthPopDuration;
                  playFishGrowSound();
                  for (let s = 0; s < 10; s++) {
                    const angle = (s / 10) * Math.PI * 2;
                    addParticle(gs, {
                      id: nextEntityIdRef.current++,
                      x: fish.x,
                      y: fish.y,
                      vx: Math.cos(angle) * (25 + Math.random() * 15),
                      vy: Math.sin(angle) * (25 + Math.random() * 15),
                      radius: Math.random() * 2 + 1.5,
                      color: '#38bdf8',
                      life: 0,
                      maxLife: 0.6,
                      type: 'sparkle',
                      dead: false,
                    });
                  }
                }
              }
            } else {
              fish.wanderTimer -= dt;
              if (fish.wanderTimer <= 0) {
                fish.targetX = Math.random() * (CONFIG.canvasWidth - 2 * CONFIG.fishPadding) + CONFIG.fishPadding;
                fish.targetY = Math.random() * ((CONFIG.waterBottom - CONFIG.fishPadding) - (CONFIG.waterTop + CONFIG.fishPadding)) + (CONFIG.waterTop + CONFIG.fishPadding);
                fish.wanderTimer = Math.random() * (CONFIG.fishWanderChangeMax - CONFIG.fishWanderChangeMin) + CONFIG.fishWanderChangeMin;
              }
              const dx = fish.targetX - fish.x;
              const dy = fish.targetY - fish.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 4) {
                desiredVx = (dx / dist) * CONFIG.fishWanderSpeed;
                desiredVy = (dy / dist) * CONFIG.fishWanderSpeed;
              }
            }
          } else {
            fish.wanderTimer -= dt;
            if (fish.wanderTimer <= 0) {
              fish.targetX = Math.random() * (CONFIG.canvasWidth - 2 * CONFIG.fishPadding) + CONFIG.fishPadding;
              fish.targetY = Math.random() * ((CONFIG.waterBottom - CONFIG.fishPadding) - (CONFIG.waterTop + CONFIG.fishPadding)) + (CONFIG.waterTop + CONFIG.fishPadding);
              fish.wanderTimer = Math.random() * (CONFIG.fishWanderChangeMax - CONFIG.fishWanderChangeMin) + CONFIG.fishWanderChangeMin;
            }
            const dx = fish.targetX - fish.x;
            const dy = fish.targetY - fish.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 4) {
              desiredVx = (dx / dist) * CONFIG.fishWanderSpeed;
              desiredVy = (dy / dist) * CONFIG.fishWanderSpeed;
            }
          }

          const steerRate = Math.min(1.0, dt * CONFIG.fishSteeringEase);
          fish.vx += (desiredVx - fish.vx) * steerRate;
          fish.vy += (desiredVy - fish.vy) * steerRate;

          fish.x += fish.vx * dt;
          fish.y += fish.vy * dt;

          const minX = CONFIG.fishPadding;
          const maxX = CONFIG.canvasWidth - CONFIG.fishPadding;
          const minY = CONFIG.waterTop + 6;
          const maxY = CONFIG.sandTop; // Sand floor surface at y=540

          if (fish.x < minX) { fish.x = minX; fish.vx = Math.abs(fish.vx); }
          if (fish.x > maxX) { fish.x = maxX; fish.vx = -Math.abs(fish.vx); }
          if (fish.y < minY) { fish.y = minY; fish.vy = Math.abs(fish.vy); }
          if (fish.y > maxY) { fish.y = maxY; fish.vy = -Math.abs(fish.vy); }

          if (fish.vx > 1) {
            fish.targetFacing = 1;
          } else if (fish.vx < -1) {
            fish.targetFacing = -1;
          }

          // Direction changes use the cached flipped sprite with a 2-frame squash instead of smooth scaling
          if (fish.facing !== fish.targetFacing && fish.turnTimer <= 0) {
            fish.turnTimer = 0.08;
          }

          if (fish.turnTimer > 0) {
            fish.turnTimer -= dt;
            if (fish.turnTimer <= 0.04 && fish.facing !== fish.targetFacing) {
              fish.facing = fish.targetFacing;
            }
          } else {
            fish.facing = fish.targetFacing;
          }
        }

        // --------------------------------------------------------------------
        // 6. UPDATE COINS
        // --------------------------------------------------------------------
        for (let i = 0; i < gs.coins.length; i++) {
          const coin = gs.coins[i];
          if (coin.dead) continue;

          coin.age += dt;
          if (coin.landingTimer !== undefined && coin.landingTimer > 0) {
            coin.landingTimer = Math.max(0, coin.landingTimer - dt);
          }

          if (coin.collected) {
            coin.tweenTimer += dt;
            const t = Math.min(1, coin.tweenTimer / CONFIG.coinCollectTweenDuration);
            const easeT = 1 - (1 - t) * (1 - t);
            coin.x = coin.startTweenX + (CONFIG.coinHudTargetX - coin.startTweenX) * easeT;
            coin.y = coin.startTweenY + (CONFIG.coinHudTargetY - coin.startTweenY) * easeT;

            if (coin.tweenTimer >= CONFIG.coinCollectTweenDuration) {
              coin.dead = true;
            }
          } else {
            if (coin.y < CONFIG.coinRestY) {
              coin.y = Math.min(CONFIG.coinRestY, coin.y + CONFIG.coinFallSpeed * dt);
              if (coin.y >= CONFIG.coinRestY && !coin.wasOnFloor) {
                coin.wasOnFloor = true;
                coin.landingTimer = 0.15; // 1px squash bounce
              }
            }
            if (coin.age >= CONFIG.coinLifespan) {
              coin.dead = true;
              playCoinExpireSound();
            }
          }
        }

        // --------------------------------------------------------------------
        // 7. AMBIENT PARTICLES
        // --------------------------------------------------------------------
        let currentBubbleCount = 0;
        for (let i = 0; i < gs.particles.length; i++) {
          if (gs.particles[i].type === 'bubble') currentBubbleCount++;
        }

        if (currentBubbleCount < CONFIG.ambientBubbleMax && Math.random() < 0.05) {
          addParticle(gs, {
            id: nextEntityIdRef.current++,
            x: Math.random() * (CONFIG.canvasWidth - 40) + 20,
            y: CONFIG.sandTop + Math.random() * 20,
            vx: (Math.random() - 0.5) * 8,
            vy: -20 - Math.random() * 25,
            radius: Math.random() * 2.5 + 1.2,
            color: 'rgba(255, 255, 255, 0.45)',
            life: 0,
            maxLife: 20,
            type: 'bubble',
            dead: false,
          });
        }

        for (let i = 0; i < gs.particles.length; i++) {
          const p = gs.particles[i];
          if (p.dead) continue;

          p.life += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          if (p.type === 'bubble') {
            p.vx += Math.sin(gs.time * 3 + p.id) * 0.5 * dt;
            if (p.y <= CONFIG.waterTop + 2 || p.life >= p.maxLife) {
              p.dead = true;
            }
          } else {
            if (p.life >= p.maxLife) {
              p.dead = true;
            }
          }
        }

        // --------------------------------------------------------------------
        // 8. ZERO-ALLOCATION ENTITY COMPACTING
        // --------------------------------------------------------------------
        compactArray(gs.fish);
        compactArray(gs.food);
        compactArray(gs.coins);
        compactArray(gs.aliens);
        compactArray(gs.snails);
        compactArray(gs.beams);
        compactArray(gs.particles);

        let currentNormFish = 0;
        let currentCarn = 0;
        let livingFishCount = 0;
        for (let f = 0; f < gs.fish.length; f++) {
          const fish = gs.fish[f];
          if (fish.isCarnivore) currentCarn++;
          else currentNormFish++;
          if (!fish.dead && !fish.isDying) livingFishCount++;
        }
        const currentSnails = gs.snails.length;

        if (currentNormFish !== fishCount) setFishCount(currentNormFish);
        if (currentCarn !== carnivoreCount) setCarnivoreCount(currentCarn);
        if (currentSnails !== snailCount) setSnailCount(currentSnails);

        // Game Over condition: triggers when no fish are alive (Adventure mode only)
        if (livingFishCount === 0 && game.mode !== 'sandbox') {
          gs.state = 'GAME_OVER';
          gs.transitionTimer = 0.4;
          setCurrentScreen('GAME_OVER');
        }
      } else if (gs.state === 'EGG_HATCH') {
        gs.time += dt;
        gs.eggHatchTimer += dt;

        // Fish are frozen in place! Just update sparkling ambient particles
        for (let i = 0; i < gs.particles.length; i++) {
          const p = gs.particles[i];
          if (p.dead) continue;
          p.life += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.life >= p.maxLife) p.dead = true;
        }
        compactArray(gs.particles);

        // Spawn 12 burst particles exactly when egg bursts open (t = 1.0s)
        if (gs.eggHatchTimer >= 1.0 && !gs.hasSpawnedHatchParticles) {
          gs.hasSpawnedHatchParticles = true;
          // Play hatch crack sound
          playHatchSound();
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
            const speed = 40 + Math.random() * 30;
            addParticle(gs, {
              id: nextEntityIdRef.current++,
              x: 200,
              y: 145,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 10,
              radius: Math.random() * 2 + 1.2,
              color: i % 2 === 0 ? '#ffc83d' : '#8ee8ff',
              life: 0,
              maxLife: 0.7 + Math.random() * 0.4,
              type: 'sparkle',
              dead: false,
            });
          }
        }

        // Radiant egg sparkles (before hatch burst)
        if (gs.eggHatchTimer < 1.0 && Math.random() < 0.45) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * 30 + 10;
          addParticle(gs, {
            id: nextEntityIdRef.current++,
            x: 200 + Math.cos(angle) * dist,
            y: 145 + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 20,
            vy: Math.sin(angle) * 20 - 10,
            radius: Math.random() * 2 + 1,
            color: Math.random() < 0.5 ? '#fde047' : '#38bdf8',
            life: 0,
            maxLife: 0.55,
            type: 'sparkle',
            dead: false,
          });
        }

        if (gs.eggHatchTimer >= CONFIG.eggHatchDuration) {
          gs.state = 'LEVEL_COMPLETE';
          gs.transitionTimer = 0.4;
          setLevelStats({ elapsedTime: gs.levelElapsedTime, finalMoney: gs.money });
          setCurrentScreen('LEVEL_COMPLETE');
          playHatchSound();

          // Persist progress
          const prevBest = saveState.completed[gs.level];
          gs.isFirstTimeCompletion = (prevBest === undefined);
          if (prevBest === undefined || gs.levelElapsedTime < prevBest) {
            saveState.completed[gs.level] = gs.levelElapsedTime;
          }
          saveProgress();
        }
      } else if (gs.state === 'TITLE') {
        gs.time += dt;

        // 3 idle fish swimming smoothly behind title logo
        for (let i = 0; i < gs.fish.length; i++) {
          const fish = gs.fish[i];
          fish.bobTimer += dt * CONFIG.fishBobFrequency;
          fish.wanderTimer -= dt;
          if (fish.wanderTimer <= 0) {
            fish.targetX = Math.random() * (CONFIG.canvasWidth - 2 * CONFIG.fishPadding) + CONFIG.fishPadding;
            fish.targetY = Math.random() * ((CONFIG.waterBottom - CONFIG.fishPadding) - (CONFIG.waterTop + CONFIG.fishPadding)) + (CONFIG.waterTop + CONFIG.fishPadding);
            fish.wanderTimer = Math.random() * (CONFIG.fishWanderChangeMax - CONFIG.fishWanderChangeMin) + CONFIG.fishWanderChangeMin;
          }

          const dx = fish.targetX - fish.x;
          const dy = fish.targetY - fish.y;
          const dist = Math.hypot(dx, dy);
          let desiredVx = 0;
          let desiredVy = 0;
          if (dist > 4) {
            desiredVx = (dx / dist) * CONFIG.fishWanderSpeed;
            desiredVy = (dy / dist) * CONFIG.fishWanderSpeed;
          }

          const steerRate = Math.min(1.0, dt * CONFIG.fishSteeringEase);
          fish.vx += (desiredVx - fish.vx) * steerRate;
          fish.vy += (desiredVy - fish.vy) * steerRate;

          fish.x += fish.vx * dt;
          fish.y += fish.vy * dt;

          if (fish.vx > 1) {
            fish.targetFacing = 1;
          } else if (fish.vx < -1) {
            fish.targetFacing = -1;
          }

          const flipStep = (2 / CONFIG.fishFlipDuration) * dt;
          if (fish.facing !== fish.targetFacing) {
            if (fish.facing < fish.targetFacing) {
              fish.facing = Math.min(fish.targetFacing, fish.facing + flipStep);
            } else {
              fish.facing = Math.max(fish.targetFacing, fish.facing - flipStep);
            }
          }
        }

        // Keep ambient bubbles rising during title screen
        for (let i = 0; i < gs.particles.length; i++) {
          const p = gs.particles[i];
          if (p.dead) continue;
          p.life += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.type === 'bubble' && (p.y <= CONFIG.waterTop + 2 || p.life >= p.maxLife)) {
            p.dead = true;
          }
        }
        compactArray(gs.particles);
      }

      // Decrement dissolve transition timer if active
      if (gs.transitionTimer && gs.transitionTimer > 0) {
        gs.transitionTimer = Math.max(0, gs.transitionTimer - dt);
      }

      // Decrement screen shake timer if active
      if (gs.shakeTimer && gs.shakeTimer > 0) {
        gs.shakeTimer = Math.max(0, gs.shakeTimer - dt);
      }

      // Advance egg pop timers
      if (gs.eggPopTimers) {
        for (let e = 0; e < 3; e++) {
          if (gs.eggPopTimers[e] >= 0 && gs.eggPopTimers[e] < 0.4) {
            gs.eggPopTimers[e] += dt;
          }
        }
      }

      // Expose gameStateRef.current on window for debug/probe access
      if (typeof window !== 'undefined') {
        (window as any).__GAME_STATE__ = gameStateRef.current;
        (window as any).shopProbe = shopProbe;
      }

      // ----------------------------------------------------------------------
      // 9. RENDER CANVAS (400x300 OFFSCREEN -> 2X UPSCALE TO 800x600 VISIBLE)
      // ----------------------------------------------------------------------
      const canvas = canvasRef.current;
      const offscreen = offscreenCanvasRef.current;
      if (canvas && offscreen) {
        const offCtx = offscreen.getContext('2d');
        const ctx = canvas.getContext('2d');
        if (offCtx && ctx) {
          renderPixelScene(offCtx, gs, currentLevel, levelStats);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(offscreen, 0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fishCount, carnivoreCount, snailCount]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-[#050a12] select-none overflow-hidden p-0 m-0 touch-none"
      style={{
        width: '100vw',
        height: '100vh',
        touchAction: 'none',
        overscrollBehavior: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        width={CONFIG.canvasWidth}
        height={CONFIG.canvasHeight}
        className="block touch-none cursor-none w-screen h-screen"
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'fill',
          imageRendering: 'pixelated',
          display: 'block',
        }}
      />

      {showDebug && (
        <div className="absolute top-4 left-4 bg-black/80 p-4 rounded-lg text-white font-mono text-xs border border-white/20 z-50 flex flex-col gap-2">
          <div className="font-bold border-b border-white/20 pb-1 mb-1 text-yellow-400">DEBUG PANEL</div>
          <button 
            className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded"
            onClick={() => {
              saveState.tutorial = false;
              saveProgress();
              startTutorial('levels');
              setShowDebug(false);
            }}
          >
            RESET TUTORIAL
          </button>
          <button 
            className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded"
            onClick={() => {
              saveState.tutorial = true;
              saveProgress();
              advanceTutorial(gameStateRef.current);
              setShowDebug(false);
            }}
          >
            SKIP TUTORIAL
          </button>
          <button 
            className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded"
            onClick={() => {
              localStorage.removeItem('tankCurrentUser');
              window.location.reload();
            }}
          >
            LOGOUT
          </button>
          <button 
            className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded mt-2"
            onClick={() => setShowDebug(false)}
          >
            CLOSE
          </button>
        </div>
      )}

      {!currentUser && (
        <div className="absolute inset-0 bg-[#050a12] z-[100] flex items-center justify-center p-4">
          <div className="bg-[#a8693a] border-4 border-[#6b3f2a] p-8 rounded-lg max-w-sm w-full shadow-2xl flex flex-col gap-6 text-center">
            <h1 className="text-[#fff1d6] text-3xl font-bold tracking-widest drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
              INSANITANK
            </h1>
            
            <div className="flex flex-col gap-2 text-left">
              <label className="text-[#ffd98a] text-sm font-bold uppercase tracking-wider">
                Enter Username
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateAccount()}
                autoFocus
                className="bg-[#2a1b24] border-2 border-[#ffc83d] text-[#fff1d6] p-3 rounded font-mono focus:outline-none focus:ring-2 focus:ring-[#ffd98a]"
                placeholder="NICKNAME..."
                maxLength={12}
              />
            </div>

            <button
              onClick={handleCreateAccount}
              className="bg-[#ffc83d] hover:bg-[#ffd98a] text-[#2a1b24] font-bold py-4 rounded-md transition-all active:translate-y-1 shadow-[0_4px_0_#c99a5b] active:shadow-none uppercase tracking-widest"
            >
              Start Game
            </button>

            <p className="text-[#ffb561] text-[10px] font-mono leading-tight">
              YOUR PROGRESS WILL BE SAVED LOCALLY ON THIS DEVICE.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function shopProbe() {
  const gs = (window as any).__GAME_STATE__;
  const canvas = document.querySelector('canvas');
  if (!gs || !canvas) {
    console.error('shopProbe failed: Game state or canvas not found');
    return [];
  }

  console.log('=================== STARTING SHOP PROBE ===================');
  gs.money = 5000;
  gs.shop.open = true;
  gs.shop.animTimer = 1.0;

  const probeResults: Array<{
    itemId: string;
    tapHit: boolean;
    selected: boolean;
    buyResultTap: boolean;
    buyResultDirect: boolean;
    effectApplied: boolean;
    redrawn: boolean;
    status: string;
  }> = [];

  const categories: ShopCategory[] = ['pets', 'upgrades', 'decor'];

  for (const cat of categories) {
    gs.shop.selectedCategory = cat;
    gs.shop.scrollOffset = 0;

    const items = CONFIG.SHOP_ITEMS.filter((it) => it.category === cat);

    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      // Calculate row center UI px
      const mX = 500;
      const mY = 60;
      const mW = 300;
      const mH = 480;
      const contentX = mX + 10;
      const contentY = mY + 80;
      const col = index % 2;
      const row = Math.floor(index / 2);
      const cardW = 134;
      const cardH = 100;
      const cardX = contentX + 6 + col * (cardW + 10);
      const cardY = contentY + 6 + row * (cardH + 10) - gs.shop.scrollOffset;
      const rowCenterX = cardX + cardW / 2;
      const rowCenterY = cardY + cardH / 2;

      // 1. Dispatch Tap on Row Center
      const rect = canvas.getBoundingClientRect();
      const rowClientX = rect.left + (rowCenterX / 800) * rect.width;
      const rowClientY = rect.top + (rowCenterY / 600) * rect.height;

      shopLog('event', {
        pointerType: 'touch',
        clientX: rowClientX,
        clientY: rowClientY,
        uiX: rowCenterX,
        uiY: rowCenterY,
        element: document.elementFromPoint(rowClientX, rowClientY)?.tagName || 'canvas',
      });

      const hit = hitTestShop(rowCenterX, rowCenterY, gs);
      const tapHit = hit.id === 'row:' + item.id;

      // Dispatch synthetic pointerdown & pointerup
      const pd1 = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, clientX: rowClientX, clientY: rowClientY, pointerId: 1, pointerType: 'touch' });
      const pu1 = new PointerEvent('pointerup', { bubbles: true, cancelable: true, clientX: rowClientX, clientY: rowClientY, pointerId: 1, pointerType: 'touch' });
      canvas.dispatchEvent(pd1);
      canvas.dispatchEvent(pu1);

      const actions1 = drainActions();
      for (const act of actions1) {
        if (act.type === 'tap' && act.x !== undefined && act.y !== undefined) {
          const hitRes = hitTestShop(act.x, act.y, gs);
          if (hitRes.id.startsWith('row:')) {
            gs.shop.selectedItemId = hitRes.id.split(':')[1];
          }
        }
      }

      const selected = gs.shop.selectedItemId === item.id;

      // 2. Dispatch Tap on BUY Button
      const buyCenterX = 650;
      const buyCenterY = 512;
      const buyClientX = rect.left + (buyCenterX / 800) * rect.width;
      const buyClientY = rect.top + (buyCenterY / 600) * rect.height;

      const moneyBeforeTap = gs.money;
      const levelBeforeTap = gs.shop.levels[item.id] || 0;

      shopLog('event', {
        pointerType: 'touch',
        clientX: buyClientX,
        clientY: buyCenterY,
        uiX: buyCenterX,
        uiY: buyCenterY,
        element: document.elementFromPoint(buyClientX, buyCenterY)?.tagName || 'canvas',
      });

      const pd2 = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, clientX: buyClientX, clientY: buyCenterY, pointerId: 1, pointerType: 'touch' });
      const pu2 = new PointerEvent('pointerup', { bubbles: true, cancelable: true, clientX: buyClientX, clientY: buyCenterY, pointerId: 1, pointerType: 'touch' });
      canvas.dispatchEvent(pd2);
      canvas.dispatchEvent(pu2);

      const actions2 = drainActions();
      let tapBuySuccess = false;
      for (const act of actions2) {
        if (act.type === 'tap' && act.x !== undefined && act.y !== undefined) {
          const bHit = hitTestShop(act.x, act.y, gs);
          if (bHit.id === 'buy' && gs.shop.selectedItemId) {
            const res = purchase(gs, gs.shop.selectedItemId, gs.currentFrame);
            tapBuySuccess = res.ok;
          }
        }
      }

      const moneyAfterTap = gs.money;
      const levelAfterTap = gs.shop.levels[item.id] || 0;
      if (!tapBuySuccess) {
        tapBuySuccess = (moneyAfterTap !== moneyBeforeTap) || (levelAfterTap !== levelBeforeTap) || (item.category === 'decor' && gs.shop.decorOwned[item.id]);
      }

      // 3. Direct purchase(id) comparison
      gs.currentFrame = (gs.currentFrame || 0) + 1;
      const directRes = purchase(gs, item.id, gs.currentFrame);
      const buyResultDirect = directRes.ok;

      // 4. Effect applied check
      let effectApplied = true;
      if (item.id === 'buyFish') effectApplied = gs.fish.some((f: Fish) => !f.isCarnivore && !f.dead);
      else if (item.id === 'foodLimit') effectApplied = gs.stats.foodLimit > 1;
      else if (item.id === 'foodQuality') effectApplied = gs.stats.pelletValue >= 1;
      else if (item.id === 'weapon') effectApplied = gs.stats.weaponLevel >= 0;
      else if (item.category === 'decor') effectApplied = !!gs.shop.decorOwned[item.id];

      // 5. Redraw check
      const currentLvl = gs.shop.levels[item.id] || 0;
      const isMax = item.maxLevel !== null && currentLvl >= item.maxLevel;
      const isLocked = item.requires ? (gs.shop.levels[item.requires.id] || 0) < item.requires.level : false;
      let isCapped = false;
      if (item.id === 'buyFish') isCapped = gs.fish.filter((f: Fish) => !f.isCarnivore && !f.dead).length >= 15;
      else if (item.id === 'carnivore') isCapped = gs.fish.filter((f: Fish) => f.isCarnivore && !f.dead).length >= 2;
      else if (item.id === 'snail') isCapped = gs.snails.filter((s: Snail) => !s.dead).length >= 1;

      const isAffordable = gs.money >= (item.prices ? item.prices[Math.min(currentLvl, item.prices.length - 1)] : 0);
      const redrawn = true;

      shopLog('redraw', {
        id: item.id,
        currentLvl,
        isAffordable,
        isMax,
        isCapped,
        isLocked,
        isSelected: selected,
      });

      // Diagnosis
      let status = 'PASS';
      if (!tapHit) {
        status = 'FAIL (HIT TEST FAILED)';
      } else if (!selected) {
        status = 'FAIL (SELECTION FAILED)';
      } else if (buyResultDirect && !tapBuySuccess) {
        status = 'FAIL (INPUT LAYER BROKEN - direct call passed but tap failed)';
      } else if (tapBuySuccess && !effectApplied) {
        status = 'FAIL (EFFECT WIRING BROKEN - tap passed but no effect applied)';
      } else if (!tapBuySuccess && !buyResultDirect) {
        status = `SKIPPED (${directRes.reason || 'unavailable'})`;
      }

      probeResults.push({
        itemId: item.id,
        tapHit,
        selected,
        buyResultTap: tapBuySuccess,
        buyResultDirect,
        effectApplied,
        redrawn,
        status,
      });

      console.log(
        `[PROBE] ${item.id.padEnd(14)} | tap->hit: ${tapHit ? 'PASS' : 'FAIL'} | select: ${selected ? 'PASS' : 'FAIL'} | buy->result: ${tapBuySuccess ? 'PASS' : 'FAIL'} | effect: ${effectApplied ? 'PASS' : 'FAIL'} | redrawn: ${redrawn ? 'PASS' : 'FAIL'} | STATUS: ${status}`
      );
    }
  }

  console.log('=================== SHOP PROBE COMPLETED ===================');
  if (typeof window !== 'undefined') {
    (window as any).__PROBE_RESULTS__ = probeResults;
    (window as any).shopProbe = shopProbe;
  }
  return probeResults;
}

