/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


// --------------------------------------------------------------------------
// AUDIO SETTINGS
// --------------------------------------------------------------------------
export const game = {
  mode: 'levels' as 'levels' | 'sandbox' | 'tutorial',
  storageOk: true,
  profile: null as any,
  progress: {
    completed: {} as Record<string, number>,
    themes: {
      owned: ['default'] as string[],
      active: 'default' as string,
    },
    tutorial: false,
    sandboxTutorial: false,
  },
  sandbox: {
    freeShop: true,
    freeFood: false,
    aliens: false,
    hunger: true,
    godMode: false,
    autoCollect: false,
    limitBreaker: false,
    speed: 1,
    spawnSize: 0,
  },
  audio: {
    master: 0.8,
    music: 0.6,
    sfx: 0.8,
    muted: false,
    soundEnabled: true,
    musicEnabled: true,
  },
};

// --------------------------------------------------------------------------
// AUDIO MODULE STATE
// --------------------------------------------------------------------------
let ctx: AudioContext | null = null;

// Graph nodes
let masterGain: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let muffleFilter: BiquadFilterNode | null = null;
let convolver: ConvolverNode | null = null;
let reverbWetGain: GainNode | null = null;

// Voice limit & track
const activeVoices: { source: AudioScheduledSourceNode; gainNode: GainNode; soundId: string }[] = [];
const lastPlayTimes = new Map<string, number>();

// Concurrency settings per sound
const CONCURRENCY_CAPS: Record<string, number> = {
  coin: 4,
  eat: 3,
  feed: 4,
  laser: 5,
  shop: 2,
  alert: 1,
  damage: 4,
  die: 2,
  hatch: 1,
  alienSpawn: 1,
  alienHit: 4,
  alienKillFish: 2,
  alienDie: 1,
  carnivoreSpawn: 1,
  carnivoreEat: 2,
  snailCollect: 3,
  eggPiece: 1,
  eggHatch: 1,
  levelComplete: 1,
  gameOver: 1,
};

// Music scheduling variables
let musicIntervalId: any = null;
let musicStep = 0;

// --------------------------------------------------------------------------
// HELPER WRAPPERS
// --------------------------------------------------------------------------

/**
 * Clamps and replaces NaN to avoid throw-prone AudioParam operations.
 */
export function safeParam(v: number, lo: number, hi: number, fallback: number): number {
  if (typeof v !== 'number' || isNaN(v) || !isFinite(v)) {
    return fallback;
  }
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Apply gain value with setTargetAtTime
 */
function rampParam(param: AudioParam, targetValue: number, timeConstant: number = 0.03) {
  if (!ctx) return;
  const now = ctx.currentTime;
  const val = safeParam(targetValue, 0, 10, 0);
  param.setTargetAtTime(val, now, timeConstant);
}

// --------------------------------------------------------------------------
// REVERB CONVOLVER ENGINE
// --------------------------------------------------------------------------

/**
 * Creates 1.2s decaying random white noise to serve as synthetic impulse response.
 */
function createReverbImpulse(context: AudioContext, duration: number = 1.2): AudioBuffer {
  const sampleRate = context.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = context.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Exponential decay
      const decay = Math.exp(-t * 3.5);
      const noise = (Math.random() * 2 - 1) * decay;
      data[i] = noise;
    }
  }
  return buffer;
}

// --------------------------------------------------------------------------
// AUDIO CONTEXT UNLOCK & CREATION
// --------------------------------------------------------------------------

/**
 * Checks and resumes AudioContext on user-gestures or iOS wake.
 */
export function resumeAudioContext(): Promise<void> {
  if (!ctx) return Promise.resolve();
  if (ctx.state === 'suspended' || (ctx.state as any) === 'interrupted') {
    return ctx.resume().then(() => {
        nextNoteTime = ctx!.currentTime + 0.05;
    }).catch((err) => {
      console.warn('AudioContext resume failed:', err);
    });
  }
  return Promise.resolve();
}

/**
 * Lazily creates the entire Web Audio graph on first user-unlock.
 */
export function initAudio() {
  if (ctx) return; // already initialized

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    ctx = new AudioContextClass();

    // 1. Build buses and master nodes
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    masterGain = ctx.createGain();

    muffleFilter = ctx.createBiquadFilter();
    muffleFilter.type = 'lowpass';
    muffleFilter.frequency.setValueAtTime(20000, ctx.currentTime);

    // Dynamic Compressor
    const compressor = ctx.createDynamicsCompressor();
    // specs: threshold -14dB, knee 12, ratio 4, attack 0.003s, release 0.25s
    compressor.threshold.setValueAtTime(-14, ctx.currentTime);
    compressor.knee.setValueAtTime(12, ctx.currentTime);
    compressor.ratio.setValueAtTime(4, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);

    // Reverb send convolver (1.2s decaying noise, 22% wet)
    convolver = ctx.createConvolver();
    convolver.buffer = createReverbImpulse(ctx, 1.2);

    reverbWetGain = ctx.createGain();
    reverbWetGain.gain.setValueAtTime(0.22, ctx.currentTime); // 22% wet

    // 2. Connect the graph
    // musicBus taps convolver reverb
    musicBus.connect(convolver);
    
    // musicBus -> lowpass filter -> masterGain
    musicBus.connect(muffleFilter);
    muffleFilter.connect(masterGain);

    // sfxBus -> masterGain
    sfxBus.connect(masterGain);

    // convolver reverb -> reverbWetGain -> masterGain
    convolver.connect(reverbWetGain);
    reverbWetGain.connect(masterGain);

    // masterGain -> DynamicsCompressor -> Destination
    masterGain.connect(compressor);
    compressor.connect(ctx.destination);

    // Set initial volumes
    updateAudioVolumes();

    // Play a silent 1-sample buffer immediately to satisfy iOS autoplay lockout
    const silentBuffer = ctx.createBuffer(1, 1, 22050);
    const silentSource = ctx.createBufferSource();
    silentSource.buffer = silentBuffer;
    silentSource.connect(ctx.destination);
    silentSource.start(0);

    // Start background music loop
    startProceduralMusic();

  } catch (err) {
    console.error('Failed to initialize AudioContext:', err);
    ctx = null;
  }
}

// --------------------------------------------------------------------------
// VOLUME SYNCRONIZATION
// --------------------------------------------------------------------------
export function updateAudioVolumes() {
  if (!ctx || !masterGain || !musicBus || !sfxBus) return;
  const muted = game.audio.muted;
  const soundEnabled = (game.audio as any).soundEnabled !== false;
  const musicEnabled = (game.audio as any).musicEnabled !== false;

  const masterVal = muted ? 0 : game.audio.master;
  const musicVal = (muted || !musicEnabled) ? 0 : game.audio.music;
  const sfxVal = (muted || !soundEnabled) ? 0 : game.audio.sfx;

  rampParam(masterGain.gain, masterVal);
  rampParam(musicBus.gain, musicVal);
  rampParam(sfxBus.gain, sfxVal);
}

export function toggleSound(): boolean {
  (game.audio as any).soundEnabled = !((game.audio as any).soundEnabled !== false);
  updateAudioVolumes();
  try {
    localStorage.setItem('tankSoundEnabled', JSON.stringify((game.audio as any).soundEnabled));
  } catch (e) {}
  return (game.audio as any).soundEnabled;
}

export function toggleMusic(): boolean {
  (game.audio as any).musicEnabled = !((game.audio as any).musicEnabled !== false);
  updateAudioVolumes();
  if ((game.audio as any).musicEnabled) {
    initAudio();
    resumeAudioContext();
  }
  try {
    localStorage.setItem('tankMusicEnabled', JSON.stringify((game.audio as any).musicEnabled));
  } catch (e) {}
  return (game.audio as any).musicEnabled;
}

// --------------------------------------------------------------------------
// PAUSE STATE SWEEPS & MUSIC DUCKING
// --------------------------------------------------------------------------

/**
 * On pause, duck musicBus to 35% and sweep the muffle lowpass from 20kHz to 900Hz over 0.3s.
 * On resume, restore musicBus to 100% and sweep lowpass back to 20kHz over 0.3s.
 */
export function setMuffled(isMuffled: boolean) {
  if (!ctx || !musicBus || !muffleFilter) return;

  const now = ctx.currentTime;
  const musicEnabled = (game.audio as any).musicEnabled !== false;
  const currentMusicVolume = (game.audio.muted || !musicEnabled) ? 0 : game.audio.music;
  const targetMusicVal = isMuffled ? currentMusicVolume * 0.35 : currentMusicVolume;
  const targetFreq = isMuffled ? 900 : 20000;

  musicBus.gain.cancelScheduledValues(now);
  musicBus.gain.linearRampToValueAtTime(safeParam(targetMusicVal, 0, 1, 0), now + 0.3);

  muffleFilter.frequency.cancelScheduledValues(now);
  muffleFilter.frequency.exponentialRampToValueAtTime(safeParam(targetFreq, 20, 24000, 20000), now + 0.3);
}

// --------------------------------------------------------------------------
// VOICE MANAGEMENT & RETRIGGER FLOORS
// --------------------------------------------------------------------------

/**
 * Reserves a voice, handling retrigger floors, concurrency caps, and voice pools.
 * Returns true if the sound can play, false otherwise.
 */
function claimVoice(soundId: string, customCap?: number): boolean {
  if (!ctx) return false;
  if ((game.audio as any).soundEnabled === false) return false;

  // 1. Retrigger Floor Check
  const now = performance.now();
  const lastTime = lastPlayTimes.get(soundId) || 0;
  
  // Custom floors
  const floor = soundId === 'eat' ? 60 : soundId === 'coinDrop' ? 100 : soundId === 'fishHungry' ? 1000 : 40;
  if (now - lastTime < floor) {
    return false; // skip playing
  }
  lastPlayTimes.set(soundId, now);

  // 2. SFX Concurrency Cap
  const cap = customCap ?? CONCURRENCY_CAPS[soundId] ?? 4;
  const matches = activeVoices.filter((v) => v.soundId === soundId);
  while (matches.length >= cap) {
    const oldestMatch = matches.shift();
    if (oldestMatch) {
      evictVoice(oldestMatch);
    }
  }

  // 3. Max SFX Voices (at most 24 live SFX voices)
  while (activeVoices.length >= 24) {
    const oldestGlobal = activeVoices.shift();
    if (oldestGlobal) {
      evictVoice(oldestGlobal);
    }
  }

  return true;
}

/**
 * Forcefully stops and evicts a playing sound voice.
 */
function evictVoice(voice: { source: AudioScheduledSourceNode; gainNode: GainNode; soundId: string }) {
  try {
    voice.source.stop();
  } catch (err) {}
  try {
    voice.source.disconnect();
    voice.gainNode.disconnect();
  } catch (err) {}

  const idx = activeVoices.indexOf(voice);
  if (idx !== -1) {
    activeVoices.splice(idx, 1);
  }
}

/**
 * Registers an active playing node.
 * Automatically schedules fade-in, fade-out/stop, and unbinds onended.
 */
function registerVoice(
  soundId: string,
  source: AudioScheduledSourceNode,
  gainNode: GainNode,
  duration: number,
  sendToReverb: boolean = false
) {
  if (!ctx || !sfxBus || !convolver) return;

  const voice = { source, gainNode, soundId };
  activeVoices.push(voice);

  // Connect SFX voice to sfxBus
  gainNode.connect(sfxBus);

  // "A reverb send taps ... the shop and coin SFX"
  if (sendToReverb) {
    gainNode.connect(convolver);
  }

  const now = ctx.currentTime;

  // Every oscillator, buffer source and gain starts at 0, ramps in over 2ms
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.5, now + 0.002);

  // Schedule automatic fadeout prior to stop
  const fadeOutTime = Math.max(0.002, duration - 0.005);
  gainNode.gain.setValueAtTime(0.5, now + fadeOutTime);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);

  try {
    source.start(now);
    source.stop(now + duration);
  } catch (err) {
    console.error('Failed to start source:', err);
  }

  // "disconnected in its onended handler"
  source.onended = () => {
    try {
      source.disconnect();
      gainNode.disconnect();
    } catch (err) {}

    const idx = activeVoices.indexOf(voice);
    if (idx !== -1) {
      activeVoices.splice(idx, 1);
    }
  };
}

// --------------------------------------------------------------------------
// PRODUCIBLE SOUND EFFECTS
// --------------------------------------------------------------------------

/**
 * Generates a white noise audio buffer of specified duration.
 */
function createWhiteNoiseBuffer(context: AudioContext, duration: number): AudioBuffer {
  const sampleRate = context.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = context.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// Keep track of coin combo timings
let lastCollectTime = 0;
let comboStep = 0;

/**
 * Play Coin Collection sound with step combos
 */
export function playCoinCollectSound(type: 'silver' | 'gold' | 'diamond') {
  if (!ctx || !convolver) return;
  const nowMs = performance.now();

  // Semitone steps combo calculation
  if (nowMs - lastCollectTime < 500) {
    comboStep = Math.min(7, comboStep + 1);
  } else {
    comboStep = 0;
  }
  lastCollectTime = nowMs;

  const ratio = Math.pow(2, comboStep / 12);

  const notes = [1046.50, 1567.98]; // C6, G6
  if (type === 'gold') {
    notes.splice(1, 0, 1318.51); // insert E6
  } else if (type === 'diamond') {
    notes.splice(1, 0, 1318.51); // insert E6
    notes.push(2093.00); // add C7
  }

  const audioTime = ctx.currentTime;
  const totalDuration = 0.07;
  const stepDuration = totalDuration / notes.length;

  const sendGain = type === 'diamond' ? 0.3 : 0.0;
  let sendGainNode: GainNode | null = null;
  if (sendGain > 0) {
    sendGainNode = ctx.createGain();
    sendGainNode.gain.setValueAtTime(sendGain, audioTime);
    sendGainNode.connect(convolver);
  }

  notes.forEach((freq, idx) => {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * ratio, audioTime + idx * stepDuration);

    const noteStart = audioTime + idx * stepDuration;
    const noteEnd = noteStart + stepDuration;

    gainNode.gain.setValueAtTime(0, noteStart);
    gainNode.gain.linearRampToValueAtTime(0.08, noteStart + 0.002);
    gainNode.gain.setValueAtTime(0.08, noteEnd - 0.002);
    gainNode.gain.linearRampToValueAtTime(0, noteEnd);

    osc.connect(gainNode);
    gainNode.connect(sfxBus!);
    if (sendGainNode) {
      gainNode.connect(sendGainNode);
    }

    osc.start(noteStart);
    osc.stop(noteEnd);

    osc.onended = () => {
      try {
        osc.disconnect();
        gainNode.disconnect();
      } catch (err) {}
    };
  });

  if (sendGainNode) {
    setTimeout(() => {
      try {
        sendGainNode?.disconnect();
      } catch (err) {}
    }, 150);
  }
}

export function playCoinDropSound() {
  if (!claimVoice('coinDrop', 3)) return;
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = 'sine';
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(1320, now);
  registerVoice('coinDrop', osc, gainNode, 0.09, false);
  gainNode.gain.setValueAtTime(0.06, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
}

export function playCoinExpireSound() {
  if (!claimVoice('coinExpire')) return;
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = 'sine';
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(2000, now);
  registerVoice('coinExpire', osc, gainNode, 0.02, false);
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.03, now + 0.002);
  gainNode.gain.setValueAtTime(0.03, now + 0.018);
  gainNode.gain.linearRampToValueAtTime(0, now + 0.02);
}

export function playShopSound(gainMultiplier: number = 1.0) {
  if (!claimVoice('shop')) return;
  if (!ctx) return;
  const now = ctx.currentTime;
  const freqs = [523.25, 659.25, 783.99, 1046.50];
  freqs.forEach((freq, i) => {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.03);
    registerVoice('shop', osc, gain, 0.22 * gainMultiplier, true);
  });
}

export function playFoodDropSound() {
  if (!claimVoice('feed')) return;
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
  oscGain.gain.setValueAtTime(0, now);
  oscGain.gain.linearRampToValueAtTime(0.15, now + 0.002);
  oscGain.gain.setValueAtTime(0.15, now + 0.075);
  oscGain.gain.linearRampToValueAtTime(0, now + 0.08);
  osc.connect(oscGain);
  oscGain.connect(sfxBus!);
  osc.start(now);
  osc.stop(now + 0.08);
  osc.onended = () => { osc.disconnect(); oscGain.disconnect(); };
  const noise = ctx.createBufferSource();
  noise.buffer = createWhiteNoiseBuffer(ctx, 0.02);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(3000, now);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(0.05, now + 0.002);
  noiseGain.gain.setValueAtTime(0.05, now + 0.018);
  noiseGain.gain.linearRampToValueAtTime(0, now + 0.02);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(sfxBus!);
  noise.start(now);
  noise.stop(now + 0.02);
  noise.onended = () => { noise.disconnect(); filter.disconnect(); noiseGain.disconnect(); };
}

export function playRejectedSound(volMult = 1.0) {
  if (!claimVoice('rejected')) return;
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = 'sawtooth';
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(130, now);
  osc.frequency.linearRampToValueAtTime(110, now + 0.15);
  registerVoice('rejected', osc, gainNode, 0.15, false);
  const targetGain = 0.12 * volMult;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(targetGain, now + 0.002);
  gainNode.gain.setValueAtTime(targetGain, now + 0.14);
  gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
}

export function playFishEatSound() {
  if (!claimVoice('eat', 4)) return;
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(330, now + 0.07);
  oscGain.gain.setValueAtTime(0, now);
  oscGain.gain.linearRampToValueAtTime(0.12, now + 0.002);
  oscGain.gain.setValueAtTime(0.12, now + 0.065);
  oscGain.gain.linearRampToValueAtTime(0, now + 0.07);
  osc.connect(oscGain);
  oscGain.connect(sfxBus!);
  osc.start(now);
  osc.stop(now + 0.07);
  osc.onended = () => { osc.disconnect(); oscGain.disconnect(); };
  const noise = ctx.createBufferSource();
  noise.buffer = createWhiteNoiseBuffer(ctx, 0.025);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(900, now);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(0.12, now + 0.002);
  noiseGain.gain.setValueAtTime(0.12, now + 0.022);
  noiseGain.gain.linearRampToValueAtTime(0, now + 0.025);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(sfxBus!);
  noise.start(now);
  noise.stop(now + 0.025);
  noise.onended = () => { noise.disconnect(); filter.disconnect(); noiseGain.disconnect(); };
}

export function playFishGrowSound() {
  if (!claimVoice('grow')) return;
  if (!ctx || !convolver) return;
  const now = ctx.currentTime;
  const sendGainNode = ctx.createGain();
  sendGainNode.gain.setValueAtTime(0.15, now);
  sendGainNode.connect(convolver);
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.linearRampToValueAtTime(900, now + 0.25);
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.15, now + 0.002);
  gainNode.gain.setValueAtTime(0.15, now + 0.24);
  gainNode.gain.linearRampToValueAtTime(0, now + 0.25);
  osc.connect(gainNode);
  gainNode.connect(sfxBus!);
  gainNode.connect(sendGainNode);
  osc.start(now);
  osc.stop(now + 0.25);
  osc.onended = () => { osc.disconnect(); gainNode.disconnect(); };
  const oscG = ctx.createOscillator();
  const gainG = ctx.createGain();
  oscG.type = 'sine';
  oscG.frequency.setValueAtTime(1567.98, now + 0.15);
  gainG.gain.setValueAtTime(0, now + 0.15);
  gainG.gain.linearRampToValueAtTime(0.15, now + 0.152);
  gainG.gain.setValueAtTime(0.15, now + 0.178);
  gainG.gain.linearRampToValueAtTime(0, now + 0.18);
  oscG.connect(gainG);
  gainG.connect(sfxBus!);
  gainG.connect(sendGainNode);
  oscG.start(now + 0.15);
  oscG.stop(now + 0.18);
  oscG.onended = () => { oscG.disconnect(); gainG.disconnect(); };
  const oscC = ctx.createOscillator();
  const gainC = ctx.createGain();
  oscC.type = 'sine';
  oscC.frequency.setValueAtTime(2093.00, now + 0.18);
  gainC.gain.setValueAtTime(0, now + 0.18);
  gainC.gain.linearRampToValueAtTime(0.15, now + 0.182);
  gainC.gain.setValueAtTime(0.15, now + 0.208);
  gainC.gain.linearRampToValueAtTime(0, now + 0.21);
  oscC.connect(gainC);
  gainC.connect(sfxBus!);
  gainC.connect(sendGainNode);
  oscC.start(now + 0.18);
  oscC.stop(now + 0.21);
  oscC.onended = () => { oscC.disconnect(); gainC.disconnect(); try { sendGainNode?.disconnect(); } catch (err) {} };
}

export function playFishHungrySound() {
  if (!claimVoice('fishHungry')) return;
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = 'sine';
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.linearRampToValueAtTime(170, now + 0.12);
  registerVoice('fishHungry', osc, gainNode, 0.12, false);
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.05, now + 0.002);
  gainNode.gain.setValueAtTime(0.05, now + 0.115);
  gainNode.gain.linearRampToValueAtTime(0, now + 0.12);
}

export function playLaserSound(weaponLevel: number) {
  if (!claimVoice('laser')) return;
  if (!ctx) return;
  const now = ctx.currentTime;
  const playBeam = (freqStart: number, freqEnd: number, vol: number) => {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, now + 0.08);
    registerVoice('laser', osc, gain, 0.08, false);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.002);
    gain.gain.setValueAtTime(vol, now + 0.075);
    gain.gain.linearRampToValueAtTime(0, now + 0.08);
  };
  playBeam(1800, 300, 0.1);
  if (weaponLevel >= 2) {
    playBeam(900, 150, 0.05);
  }
}

export function playAlienSpawnSound() {
  if (!claimVoice('alienSpawn')) return;
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc1.type = 'sawtooth';
  osc2.type = 'sawtooth';
  osc1.frequency.setValueAtTime(78, now);
  osc2.frequency.setValueAtTime(82, now);
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(8, now);
  lfoGain.gain.setValueAtTime(0.05, now);
  lfo.connect(lfoGain);
  lfoGain.connect(gainNode.gain);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(500, now);
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.18, now + 0.05);
  gainNode.gain.setValueAtTime(0.18, now + 0.75);
  gainNode.gain.linearRampToValueAtTime(0, now + 0.8);
  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(sfxBus!);
  lfo.start(now);
  osc1.start(now);
  osc2.start(now);
  lfo.stop(now + 0.8);
  osc1.stop(now + 0.8);
  osc2.stop(now + 0.8);
  const noise = ctx.createBufferSource();
  noise.buffer = createWhiteNoiseBuffer(ctx, 0.8);
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = 'bandpass';
  nFilter.frequency.setValueAtTime(200, now);
  nFilter.frequency.linearRampToValueAtTime(600, now + 0.8);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.05, now);
  noise.connect(nFilter);
  nFilter.connect(nGain);
  nGain.connect(sfxBus!);
  noise.start(now);
  noise.stop(now + 0.8);
}

export function playAlienHitSound(weaponLevel: number) {
  if (!claimVoice('alienHit')) return;
  if (!ctx) return;
  const now = ctx.currentTime;
  const noise = ctx.createBufferSource();
  noise.buffer = createWhiteNoiseBuffer(ctx, 0.04);
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = 'bandpass';
  nFilter.frequency.setValueAtTime(1800, now);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.1, now);
  noise.connect(nFilter);
  nFilter.connect(nGain);
  nGain.connect(sfxBus!);
  noise.start(now);
  noise.stop(now + 0.04);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(120 * (1 + 0.15 * weaponLevel), now);
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.05);
  osc.connect(gain);
  gain.connect(sfxBus!);
  osc.start(now);
  osc.stop(now + 0.05);
}

export function playAlienKillFishSound() {
  if (!claimVoice('alienKillFish')) return;
  if (!ctx) return;
  const now = ctx.currentTime;
  const noise = ctx.createBufferSource();
  noise.buffer = createWhiteNoiseBuffer(ctx, 0.12);
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = 'lowpass';
  nFilter.frequency.setValueAtTime(2000, now);
  nFilter.frequency.linearRampToValueAtTime(400, now + 0.12);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.2, now);
  nGain.gain.linearRampToValueAtTime(0, now + 0.12);
  noise.connect(nFilter);
  nFilter.connect(nGain);
  nGain.connect(sfxBus!);
  noise.start(now);
  noise.stop(now + 0.12);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.linearRampToValueAtTime(80, now + 0.12);
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.12);
  osc.connect(gain);
  gain.connect(sfxBus!);
  osc.start(now);
  osc.stop(now + 0.12);
}

export function playAlienDieSound() {
  if (!claimVoice('alienDie')) return;
  if (!ctx || !convolver) return;
  const now = ctx.currentTime;
  const sendGainNode = ctx.createGain();
  sendGainNode.gain.setValueAtTime(0.25, now);
  sendGainNode.connect(convolver);
  const noise = ctx.createBufferSource();
  noise.buffer = createWhiteNoiseBuffer(ctx, 0.5);
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = 'lowpass';
  nFilter.frequency.setValueAtTime(1200, now);
  nFilter.frequency.linearRampToValueAtTime(200, now + 0.5);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.25, now);
  nGain.gain.linearRampToValueAtTime(0, now + 0.5);
  noise.connect(nFilter);
  nFilter.connect(nGain);
  nGain.connect(sfxBus!);
  nGain.connect(sendGainNode);
  noise.start(now);
  noise.stop(now + 0.5);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.linearRampToValueAtTime(60, now + 0.4);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.4);
  osc.connect(gain);
  gain.connect(sfxBus!);
  gain.connect(sendGainNode);
  osc.start(now);
  osc.stop(now + 0.4);
  setTimeout(() => playCoinDropSound(), 150);
}

export function playCarnivoreSpawnSound() {
  if (!claimVoice('carnivoreSpawn')) return;
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(90, now);
  osc.frequency.linearRampToValueAtTime(60, now + 0.4);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, now);
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.4);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfxBus!);
  osc.start(now);
  osc.stop(now + 0.4);
}

export function playCarnivoreEatSound() {
  if (!claimVoice('carnivoreEat')) return;
  if (!ctx) return;
  const now = ctx.currentTime;
  const noise = ctx.createBufferSource();
  noise.buffer = createWhiteNoiseBuffer(ctx, 0.1);
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = 'lowpass';
  nFilter.frequency.setValueAtTime(1500, now);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.22, now);
  nGain.gain.linearRampToValueAtTime(0, now + 0.1);
  noise.connect(nFilter);
  nFilter.connect(nGain);
  nGain.connect(sfxBus!);
  noise.start(now);
  noise.stop(now + 0.1);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(90, now);
  gain.gain.setValueAtTime(0.22, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.12);
  osc.connect(gain);
  gain.connect(sfxBus!);
  osc.start(now);
  osc.stop(now + 0.12);
}

export function playSnailCollectSound() {
  if (!claimVoice('snailCollect')) return;
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = 'sine';
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.linearRampToValueAtTime(660, now + 0.06);
  registerVoice('snailCollect', osc, gainNode, 0.06, false);
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.08, now + 0.002);
  gainNode.gain.setValueAtTime(0.08, now + 0.058);
  gainNode.gain.linearRampToValueAtTime(0, now + 0.06);
}

export function playEggPieceSound(pieceIndex: number) {
  if (!claimVoice('eggPiece')) return;
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(600, now);
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.05);
  osc.connect(gain);
  gain.connect(sfxBus!);
  osc.start(now);
  osc.stop(now + 0.05);
  const freqs = [523.25, 659.25, 783.99];
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freqs[pieceIndex - 1], now + 0.05);
  gain2.gain.setValueAtTime(0.1, now + 0.05);
  gain2.gain.linearRampToValueAtTime(0, now + 0.2);
  osc2.connect(gain2);
  gain2.connect(sfxBus!);
  osc2.start(now + 0.05);
  osc2.stop(now + 0.2);
}

export function playHatchSound() {
  if (!claimVoice('eggHatch')) return;
  if (!ctx) return;
  const now = ctx.currentTime;
  const gaps = [0.30, 0.25, 0.20, 0.16, 0.12, 0.09];
  let time = now;
  gaps.forEach(gap => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, time);
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.linearRampToValueAtTime(0, time + 0.02);
    osc.connect(gain);
    gain.connect(sfxBus!);
    osc.start(time);
    osc.stop(time + 0.02);
    time += gap;
  });
  let burstTime = now + 1.2;
  for(let i=0; i<3; i++) {
    const noise = ctx!.createBufferSource();
    noise.buffer = createWhiteNoiseBuffer(ctx!, 0.03);
    const filter = ctx!.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, burstTime);
    const gain = ctx!.createGain();
    gain.gain.setValueAtTime(0.1, burstTime);
    gain.gain.linearRampToValueAtTime(0, burstTime + 0.03);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfxBus!);
    noise.start(burstTime);
    noise.stop(burstTime + 0.03);
    burstTime += 0.1;
  }
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, now + 1.5);
  osc.frequency.linearRampToValueAtTime(1200, now + 1.6);
  gain.gain.setValueAtTime(0.2, now + 1.5);
  gain.gain.linearRampToValueAtTime(0, now + 1.6);
  osc.connect(gain);
  gain.connect(sfxBus!);
  osc.start(now + 1.5);
  osc.stop(now + 1.6);
}

export function playLevelCompleteStinger() {
  if (!ctx || !convolver) return;
  const now = ctx.currentTime;
  const sendGainNode = ctx.createGain();
  sendGainNode.gain.setValueAtTime(0.3, now);
  sendGainNode.connect(convolver);
  const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
  freqs.forEach((freq, i) => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    osc.type = i % 2 === 0 ? 'triangle' : 'square';
    osc.frequency.setValueAtTime(freq, now + i * 0.12);
    gain.gain.setValueAtTime(0.15, now + i * 0.12);
    gain.gain.linearRampToValueAtTime(0, now + i * 0.12 + 0.12);
    osc.connect(gain);
    gain.connect(sfxBus!);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.12);
  });
  const chord = [1046.50, 1318.51, 1567.98];
  chord.forEach(freq => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + 0.6);
    gain.gain.setValueAtTime(0.15, now + 0.6);
    gain.gain.linearRampToValueAtTime(0, now + 0.6 + 0.8);
    osc.connect(gain);
    gain.connect(sfxBus!);
    gain.connect(sendGainNode);
    osc.start(now + 0.6);
    osc.stop(now + 0.6 + 0.8);
  });
}

export function playGameOverStinger() {
  if (!ctx) return;
  const now = ctx.currentTime;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, now);
  const freqs = [880.00, 698.46, 587.33, 220.00];
  freqs.forEach((freq, i) => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.18);
    const dur = i === freqs.length - 1 ? 0.6 : 0.18;
    gain.gain.setValueAtTime(0.15, now + i * 0.18);
    gain.gain.linearRampToValueAtTime(0, now + i * 0.18 + dur);
    osc.connect(gain);
    gain.connect(filter);
    filter.connect(sfxBus!);
    osc.start(now + i * 0.18);
    osc.stop(now + i * 0.18 + dur);
  });
}

// --------------------------------------------------------------------------
// LOOKAHEAD SEQUENCER ENGINE
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// LOOKAHEAD SEQUENCER ENGINE (Dynamic Layered)
// --------------------------------------------------------------------------
let currentBPM = 78;
let targetBPM = 78;
let currentGameState = 'TITLE';
let targetGameState = 'TITLE';
let level = 1;
let alienAlive = false;

// Layer gain nodes
let bassGain: GainNode | null = null;
let padGain: GainNode | null = null;
let arpGain: GainNode | null = null;
let leadGain: GainNode | null = null;
let drumGain: GainNode | null = null;
let droneGain: GainNode | null = null;

const LOOKAHEAD_MS = 25;
const LOOKAHEAD_SEC = 0.12;
let nextNoteTime = 0;
let currentStep = 0;
let sequencerInterval: any = null;

export function updateAudioState(state: string, newLevel: number, isAlienAlive: boolean) {
  targetGameState = state;
  level = newLevel;
  targetBPM = Math.min(78 + 4 * (level - 1), 96);
  if (state === 'TITLE') targetBPM = 66;
  alienAlive = isAlienAlive;
}

function applyLayerFades() {
  if (!ctx || !bassGain || !padGain || !arpGain || !leadGain || !drumGain) return;
  const now = ctx.currentTime;
  const isPlay = currentGameState === 'PLAYING';
  
  const fade = (node: GainNode, targetGain: number) => {
    node.gain.cancelScheduledValues(now);
    node.gain.linearRampToValueAtTime(targetGain, now + 0.35);
  };
  
  // BGM plays indefinitely across all game states (TITLE, SETTINGS, LEVEL_SELECT, PLAYING, PAUSED, etc.)
  fade(bassGain, 0.22);
  fade(padGain, 0.20);
  fade(arpGain, 0.16);
  fade(leadGain, isPlay ? 0.20 : 0.08); // Chill ambient lead in menus/settings, full lead in gameplay
  fade(drumGain, isPlay ? 0.22 : 0.0);  // Drums kick in during active gameplay
  if (droneGain) fade(droneGain, 0.14);
}

export function startProceduralMusic() {
  if (sequencerInterval) return;
  if (!ctx) return;
  
  // Initialize layers
  bassGain = ctx.createGain(); bassGain.connect(musicBus!);
  padGain = ctx.createGain(); padGain.connect(musicBus!);
  arpGain = ctx.createGain(); arpGain.connect(musicBus!);
  leadGain = ctx.createGain(); leadGain.connect(musicBus!);
  drumGain = ctx.createGain(); drumGain.connect(sfxBus!);
  droneGain = ctx.createGain(); droneGain.connect(musicBus!);

  applyLayerFades();

  nextNoteTime = ctx.currentTime;
  sequencerInterval = setInterval(scheduler, LOOKAHEAD_MS);
  initGlobalFX();
}

function scheduler() {
  if (!ctx) return;
  while (nextNoteTime < ctx.currentTime + LOOKAHEAD_SEC) {
    if (currentStep % 16 === 0) {
      // State transition on bar boundary
      if (currentGameState !== targetGameState || currentBPM !== targetBPM) {
        currentGameState = targetGameState;
        currentBPM = targetBPM;
        applyLayerFades();
      }
    }
    scheduleStep(currentStep, nextNoteTime);
    nextNoteTime += 60 / currentBPM / 4;
    currentStep = (currentStep + 1) % 128;
  }
}

function scheduleStep(step: number, time: number) {
  // Swing logic
  let scheduledTime = time;
  const subStep = step % 16;
  if ([2, 6, 10, 14].includes(subStep)) {
    scheduledTime += (60 / currentBPM / 8) * 0.1; // 10% of an 8th
  }

  // Bar/Chord logic (8 bars, Cmaj7, Am7, Fmaj7, G6)
  const bar = Math.floor(step / 16);
  const chordProg = [0, 1, 2, 3, 0, 1, 2, 3]; // Cmaj7, Am7, Fmaj7, G6
  const chordIdx = chordProg[bar];
  
  // Instruments schedule...
  // [Bass, Pad, Arp, Lead, Drums...]
  scheduleBass(step, chordIdx, scheduledTime);
  schedulePad(step, chordIdx, scheduledTime);
  scheduleArp(step, chordIdx, scheduledTime);
  scheduleLead(step, chordIdx, scheduledTime);
  scheduleDrums(step, scheduledTime);
}

// Global FX nodes
let wobbleLFO: OscillatorNode | null = null;
let pinkNoiseBedGain: GainNode | null = null;

// Tape wobble LFO
function initGlobalFX() {
  if (!ctx) return;
  wobbleLFO = ctx.createOscillator();
  wobbleLFO.type = 'sine';
  wobbleLFO.frequency.setValueAtTime(0.4, ctx.currentTime);
  wobbleLFO.start();

  // Pink noise bed
  const noise = ctx.createBufferSource();
  noise.buffer = createWhiteNoiseBuffer(ctx, 10);
  noise.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3000, ctx.currentTime);
  pinkNoiseBedGain = ctx.createGain();
  pinkNoiseBedGain.gain.setValueAtTime(0.008, ctx.currentTime);
  noise.connect(filter);
  filter.connect(pinkNoiseBedGain);
  pinkNoiseBedGain.connect(masterGain!);
  noise.start();
}

function scheduleBass(step: number, chordIdx: number, time: number) {
  if (step % 4 !== 0) return; // Bass on beats 1 and 3 (steps 0, 4, 8, 12...)
  const roots = [130.81, 110.00, 87.31, 98.00]; // C2, A1, F1, G1
  const fifths = [196.00, 164.81, 130.81, 146.83]; // G2, E2, C2, D2
  
  // Root on beat 1, Fifth on beat 3
  const isRoot = step % 8 === 0;
  const freq = isRoot ? roots[chordIdx] : fifths[chordIdx];
  const duration = isRoot ? (60/currentBPM) * 1.5 : (60/currentBPM) * 0.5;

  const osc = ctx!.createOscillator();
  const filter = ctx!.createBiquadFilter();
  const gain = ctx!.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);
  
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(500, time);
  
  gain.gain.setValueAtTime(0.22, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(bassGain!);
  
  osc.start(time);
  osc.stop(time + duration);
  
  // Hook wobble LFO
  if(wobbleLFO) {
    const lfoGain = ctx!.createGain();
    lfoGain.gain.setValueAtTime(freq * 0.0023, time); // ±4 cents
    wobbleLFO.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.onended = () => { lfoGain.disconnect(); };
  }
}

function schedulePad(step: number, chordIdx: number, time: number) {
  if (step % 16 !== 0) return;
  const chords = [
    [130.81, 164.81, 196.00, 246.94], // Cmaj7
    [110.00, 130.81, 164.81, 196.00], // Am7
    [87.31, 110.00, 130.81, 164.81],  // Fmaj7
    [98.00, 123.47, 146.83, 164.81],  // G6
  ];
  
  chords[chordIdx].forEach(freq => {
    [0.996, 1.0, 1.004].forEach(detune => {
      const osc = ctx!.createOscillator();
      const filter = ctx!.createBiquadFilter();
      const gain = ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * detune, time);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.05, time + 0.4);
      gain.gain.setValueAtTime(0.05, time + (60/currentBPM)*4 - 0.6);
      gain.gain.linearRampToValueAtTime(0, time + (60/currentBPM)*4);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(padGain!);
      osc.start(time);
      osc.stop(time + (60/currentBPM)*4);
    });
  });
}

function scheduleArp(step: number, chordIdx: number, time: number) {
  if (step % 4 !== 0) return;
  const arpIndices = [0,1,2,3,2,1,2,1];
  const arpNoteIdx = arpIndices[Math.floor(step / 4) % 8];
  const notes = [
    [261.63, 329.63, 392.00, 493.88],
    [220.00, 261.63, 329.63, 392.00],
    [174.61, 220.00, 261.63, 329.63],
    [196.00, 246.94, 293.66, 329.63],
  ];
  
  const freq = notes[chordIdx][arpNoteIdx];
  const osc = ctx!.createOscillator();
  const gain = ctx!.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);
  
  const osc2 = ctx!.createOscillator();
  const gain2 = ctx!.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2, time);
  
  gain.gain.setValueAtTime(0.1, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
  gain2.gain.setValueAtTime(0.03, time);
  gain2.gain.exponentialRampToValueAtTime(0.0003, time + 0.35);
  
  osc.connect(gain);
  osc2.connect(gain2);
  gain.connect(musicBus!);
  gain2.connect(musicBus!);
  osc.start(time);
  osc2.start(time);
  osc.stop(time + 0.35);
  osc2.stop(time + 0.35);
}

function scheduleLead(step: number, chordIdx: number, time: number) {
  // Simplified Lead note
  const osc = ctx!.createOscillator();
  const gain = ctx!.createGain();
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.09, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  osc.connect(gain);
  gain.connect(leadGain!);
  osc.start(time);
  osc.stop(time + 0.1);
}

function scheduleDrums(step: number, time: number) {
  if (step % 8 === 0) {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(gain);
    gain.connect(sfxBus!);
    osc.start(time);
    osc.stop(time + 0.12);
  }
  if ([2, 6, 10, 14].includes(step % 16)) {
    const noise = ctx!.createBufferSource();
    noise.buffer = createWhiteNoiseBuffer(ctx!, 0.03);
    const filter = ctx!.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);
    const gain = ctx!.createGain();
    gain.gain.setValueAtTime(0.05, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfxBus!);
    noise.start(time);
    noise.stop(time + 0.03);
  }
  if (step % 8 === 4) {
    const noise = ctx!.createBufferSource();
    noise.buffer = createWhiteNoiseBuffer(ctx!, 0.025);
    const filter = ctx!.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, time);
    const gain = ctx!.createGain();
    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfxBus!);
    noise.start(time);
    noise.stop(time + 0.025);
  }
}

/**
 * Suspend context on app page-hidden, and auto resume when back.
 * Also start BGM indefinitely on page load without player input.
 */
if (typeof window !== 'undefined') {
  // Load saved sound/music preferences
  try {
    const savedSound = localStorage.getItem('tankSoundEnabled');
    if (savedSound !== null) (game.audio as any).soundEnabled = JSON.parse(savedSound);
    const savedMusic = localStorage.getItem('tankMusicEnabled');
    if (savedMusic !== null) (game.audio as any).musicEnabled = JSON.parse(savedMusic);
  } catch (e) {}

  const autoStartAudio = () => {
    initAudio();
    resumeAudioContext();
  };

  // 1. Start audio immediately without player input
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    autoStartAudio();
  } else {
    window.addEventListener('DOMContentLoaded', autoStartAudio);
    window.addEventListener('load', autoStartAudio);
  }

  // 2. Also register passive presence listeners (pointermove, touch, key, focus) in case browser autoplay held it suspended
  const passiveEvents = ['pointerdown', 'pointermove', 'touchstart', 'touchend', 'keydown', 'click', 'focus', 'mouseenter', 'wheel'];
  passiveEvents.forEach((evt) => {
    window.addEventListener(evt, autoStartAudio, { passive: true, capture: true });
  });

  // 3. Keep gentle interval to resume if browser allows it
  const resumeTimer = setInterval(() => {
    if (!ctx) {
      initAudio();
    } else if (ctx.state !== 'running') {
      ctx.resume().catch(() => {});
    } else {
      clearInterval(resumeTimer);
    }
  }, 400);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (ctx && ctx.state === 'running') {
        ctx.suspend().catch(() => {});
      }
    } else {
      resumeAudioContext();
    }
  });
}

export function playFishDieSound() {
  if (!claimVoice('die', 2)) return;
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gainNode = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.linearRampToValueAtTime(110, now + 0.5);

  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(6, now);
  lfoGain.gain.setValueAtTime(4, now); // ±15 cents at 440Hz is ~4Hz
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  registerVoice('die', osc, gainNode, 0.5, false);
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.15, now + 0.002);
  gainNode.gain.setValueAtTime(0.15, now + 0.49);
  gainNode.gain.linearRampToValueAtTime(0, now + 0.5);

  lfo.start(now);
  lfo.stop(now + 0.5);
  osc.onended = () => {
    try {
      osc.disconnect();
      lfo.disconnect();
      lfoGain.disconnect();
      gainNode.disconnect();
    } catch (err) {}
  };
}

export function uiClick() {
  if (!claimVoice('uiClick')) return;
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc.connect(gain);
  gain.connect(sfxBus!);
  osc.start(now);
  osc.stop(now + 0.05);
}
