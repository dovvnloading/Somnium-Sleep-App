
import React from 'react';
import { Wind, Mountain, Zap, Feather } from 'lucide-react';
import { Preset, NoiseType } from '../types';

export const focusPresets: Preset[] = [
  {
    id: 'pure-sleep',
    name: 'Pure Sleep',
    description: 'Steady white noise for masking distractions.',
    settings: {
      noiseType: NoiseType.WHITE,
      tone: 20,
      volume: 0.5,
      pan: 0,
      isAutopan: false,
      timerDuration: 60
    },
    icon: <Wind size={18} className="text-zinc-200"/>
  },
  {
    id: 'velvet-pink',
    name: 'Velvet Pink',
    description: 'Balanced frequency noise, similar to steady rain or wind.',
    settings: {
      noiseType: NoiseType.PINK,
      tone: 50,
      volume: 0.6,
      pan: 0,
      isAutopan: false,
      timerDuration: 60
    },
    icon: <Feather size={18} className="text-rose-300"/>
  },
  {
    id: 'deep-rest',
    name: 'Deep Hibernation',
    description: 'Heavy brown noise for deep sleep.',
    settings: {
      noiseType: NoiseType.BROWN,
      tone: 25,
      volume: 0.7,
      pan: 0,
      isAutopan: false,
      timerDuration: 90
    },
    icon: <Mountain size={18} className="text-stone-400"/>
  },
  {
    id: 'crystal-clarity',
    name: 'Crystal Clarity',
    description: 'High-frequency violet noise for focus.',
    settings: {
      noiseType: NoiseType.VIOLET,
      tone: 85,
      volume: 0.4,
      pan: 0,
      isAutopan: false,
      timerDuration: 45
    },
    icon: <Zap size={18} className="text-violet-400"/>
  }
];
