import { ReactNode } from 'react';

export enum NoiseType {
  WHITE = 'white',
  PINK = 'pink',
  BROWN = 'brown',
  VIOLET = 'violet', // High frequency energy
  DRONE = 'drone',   // Oscillator based
  WIND = 'wind',      // Modulated pink noise
  RAIN = 'rain',       // Procedural rain
  STORM = 'storm',      // Rain + Wind + Thunder composite
  COSMOS = 'cosmos',     // New lush synth pads
  CELESTIAL = 'celestial', // Dreamy pads + resonant plucks
  ZEN = 'zen',        // Zen Garden
  OCEAN = 'ocean',     // Complex wave simulation
  LUNAR = 'lunar',     // Dark filtered strings + low rumble
  AURORA = 'aurora',    // Shimmering electromagnetic winds
  FOREST = 'forest',     // Bioluminescent night forest
  QUANTUM = 'quantum',    // Quantum Field Singularity
  ELYSIUM = 'elysium',    // State of the art generative sanctuary
  ASTRAL = 'astral',      // Psycho-acoustic binaural tapestry
  SOMATIC = 'somatic',     // Nervous system decompression
  POLYRHYTHM = 'polyrhythm', // Procedural polyrhythmic synthesis
  
  // SOMNIUM PRO SERIES
  SILK = 'silk',          // Rolling organic noise layers
  ALCHEMIST = 'alchemist', // Muted metallic sound garden
  HORIZON = 'horizon',    // Massive panoramic drone
  STRATUS = 'stratus',     // Algorithmic tide pool piano
  STRATUS_EVO = 'stratus_evo', // Mathematical polyrhythmic evolution
  
  // ARTIST SERIES
  STATUS_II = 'status_ii', // Nils Frahm/Olafur Arnalds inspired

  // THE QUINTESSENCE SERIES
  DEEP_SOMNUS = 'deep_somnus',
  COGNITIVE = 'cognitive',
  VOID = 'void',
  ETHEREAL = 'ethereal',
  BIOPHILIC = 'biophilic'
}

export interface AudioState {
  isPlaying: boolean;
  volume: number; // 0.0 to 1.0
  tone: number; // 0 to 100 (mapped to frequency)
  pan: number; // -1 to 1
  isAutopan: boolean;
  isSafeMode: boolean; // Soft limiter enabled
  noiseType: NoiseType;
  timerDuration: number; // minutes
  timerRemaining: number | null; // seconds remaining
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  settings: Partial<AudioState>;
  icon?: ReactNode;
}