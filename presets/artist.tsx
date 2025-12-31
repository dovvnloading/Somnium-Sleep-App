import React from 'react';
import { Radio, Mic2 } from 'lucide-react';
import { Preset, NoiseType } from '../types';

export const artistPresets: Preset[] = [
  {
    id: 'status-2',
    name: 'Status 2',
    description: 'Artist Series: Neoclassical Minimalist. Muted felt textures, polyrhythmic evolution, and massive shimmer delays. Inspired by Nils Frahm.',
    settings: {
      noiseType: NoiseType.STATUS_II,
      tone: 45, // Slightly dark for the felt sound
      volume: 0.7,
      pan: 0,
      isAutopan: false,
      timerDuration: 60
    },
    icon: <Radio size={18} className="text-rose-200"/>
  }
];