import React from 'react';
import { CloudRain, CloudLightning, CloudFog, Anchor } from 'lucide-react';
import { Preset, NoiseType } from '../types';

export const naturePresets: Preset[] = [
  {
    id: 'rainy-night',
    name: 'Rainy Night',
    description: 'High-fidelity procedural rain with multi-surface droplet simulation.',
    settings: {
      noiseType: NoiseType.RAIN,
      tone: 60,
      volume: 0.65,
      pan: 0,
      isAutopan: false,
      timerDuration: 180
    },
    icon: <CloudRain size={18}/>
  },
  {
    id: 'storm-cell',
    name: 'Storm Cell',
    description: 'Bi-directional gusts, deep thunder rumbles, and heavy rainfall.',
    settings: {
      noiseType: NoiseType.STORM,
      tone: 50,
      volume: 0.7,
      pan: 0,
      isAutopan: false,
      timerDuration: 60
    },
    icon: <CloudLightning size={18}/>
  },
  {
    id: 'arctic-wind',
    name: 'Arctic Wind',
    description: 'Cold, gusting winds for isolation.',
    settings: {
      noiseType: NoiseType.WIND,
      tone: 60,
      volume: 0.6,
      pan: 0,
      isAutopan: true,
      timerDuration: 30
    },
    icon: <CloudFog size={18}/>
  },
  {
    id: 'oceanic-voyage',
    name: 'Oceanic Voyage',
    description: 'Complex coastal soundscape with rolling waves, deep surf, and distant foghorns.',
    settings: {
      noiseType: NoiseType.OCEAN,
      tone: 55,
      volume: 0.65,
      pan: 0,
      isAutopan: false,
      timerDuration: 60
    },
    icon: <Anchor size={18}/>
  }
];