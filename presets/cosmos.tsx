
import React from 'react';
import { Infinity as InfinityIcon, Crown, Atom, TreePine, Activity, Moon, Star, Sparkles } from 'lucide-react';
import { Preset, NoiseType } from '../types';

export const cosmosPresets: Preset[] = [
  {
    id: 'astral-plane',
    name: 'Astral Plane',
    description: 'Binaural theta waves, formant-shifted ether, and generative stardust.',
    settings: {
        noiseType: NoiseType.ASTRAL,
        tone: 50,
        volume: 0.6,
        pan: 0,
        isAutopan: true,
        timerDuration: 60
    },
    icon: <InfinityIcon size={18} className="text-purple-400"/>
  },
  {
    id: 'elysium-fields',
    name: 'Elysium Fields',
    description: 'Rich generative ambiance. Lush breathing pads, stereo delays, and celestial harps.',
    settings: {
        noiseType: NoiseType.ELYSIUM,
        tone: 55,
        volume: 0.6,
        pan: 0,
        isAutopan: true,
        timerDuration: 60
    },
    icon: <Crown size={18} className="text-amber-300"/>
  },
  {
    id: 'quantum-field',
    name: 'Quantum Field',
    description: 'Deep gravitational waves, swirling event horizons, and generative quantum fluctuations.',
    settings: {
        noiseType: NoiseType.QUANTUM,
        tone: 50,
        volume: 0.7,
        pan: 0,
        isAutopan: true,
        timerDuration: 60
    },
    icon: <Atom size={18} className="text-cyan-400"/>
  },
  {
    id: 'bioluminescent-forest',
    name: 'Bioluminescent Forest',
    description: 'Deep, humid alien night with FM-synthesized glass fauna and swelling light-blooms.',
    settings: {
        noiseType: NoiseType.FOREST,
        tone: 35,
        volume: 0.65,
        pan: 0,
        isAutopan: true,
        timerDuration: 60
    },
    icon: <TreePine size={18} className="text-emerald-400"/>
  },
  {
    id: 'aurora-lights',
    name: 'Northern Lights',
    description: 'Ethereal magnetic winds and shimmering luminous pads.',
    settings: {
      noiseType: NoiseType.AURORA,
      tone: 60,
      volume: 0.6,
      pan: 0,
      isAutopan: true,
      timerDuration: 60
    },
    icon: <Activity size={18}/>
  },
  {
    id: 'lunar-crater',
    name: 'Lunar Crater',
    description: 'Ambient C Minor 11 harmonic lows with silky breathing pads and stardust sparkles.',
    settings: {
      noiseType: NoiseType.LUNAR,
      tone: 40,
      volume: 0.65,
      pan: 0,
      isAutopan: true,
      timerDuration: 60
    },
    icon: <Moon size={18}/>
  },
  {
    id: 'celestial-dream',
    name: 'Celestial Dream',
    description: 'Generative soundscape. FM-synthesized glass harps in Db Lydian with stereo-ping pong delays and breathing atmospheric halos.',
    settings: {
      noiseType: NoiseType.CELESTIAL,
      tone: 55, // Slightly bright for the bells to shine
      volume: 0.6,
      pan: 0,
      isAutopan: true, // Movement adds to the dreaminess
      timerDuration: 60
    },
    icon: <Star size={18} className="text-yellow-100"/>
  },
  {
    id: 'nebula-drift',
    name: 'Nebula Drift',
    description: 'Deep space drone for total immersion.',
    settings: {
      noiseType: NoiseType.DRONE,
      tone: 40,
      volume: 0.65,
      pan: 0,
      isAutopan: true,
      timerDuration: 60
    },
    icon: <Activity size={18}/>
  },
  {
    id: 'galactic-core',
    name: 'Galactic Core',
    description: 'Heavy, drifting sub-bass clusters and dark suspended pads for deep focus.',
    settings: {
      noiseType: NoiseType.COSMOS,
      tone: 35,
      volume: 0.65,
      pan: 0,
      isAutopan: true,
      timerDuration: 60
    },
    icon: <Sparkles size={18}/>
  }
];
