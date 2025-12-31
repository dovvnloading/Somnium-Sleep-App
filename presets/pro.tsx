
import React from 'react';
import { Waves, Hexagon, Sunset, Boxes, Cpu } from 'lucide-react';
import { Preset, NoiseType } from '../types';

export const proPresets: Preset[] = [
  {
    id: 'stratus-evolution',
    name: 'Stratus: Evolution',
    description: 'Advanced Algorithmic Composition. Polyrhythmic piano sequences based on mathematical harmony rules and prime-number clocking.',
    settings: {
        noiseType: NoiseType.STRATUS_EVO,
        tone: 60,
        volume: 0.65,
        pan: 0,
        isAutopan: false, // Stereo field is handled by the algorithm
        timerDuration: 60
    },
    icon: <Cpu size={18} className="text-pink-300"/>
  },
  {
    id: 'stratus-tide',
    name: 'Stratus Tide',
    description: 'Somnium Pro: Algorithmic tide pool. Prime-number clocked piano waves.',
    settings: {
      noiseType: NoiseType.STRATUS,
      tone: 55,
      volume: 0.6,
      pan: 0,
      isAutopan: true,
      timerDuration: 60
    },
    icon: <Boxes size={18} className="text-sky-300"/>
  },
  {
    id: 'the-alchemist',
    name: 'The Alchemist',
    description: 'Somnium Pro: Generative sound garden. Muted metallic idiophones tuned to the Hirajoshi scale.',
    settings: {
      noiseType: NoiseType.ALCHEMIST,
      tone: 65,
      volume: 0.6,
      pan: 0,
      isAutopan: true,
      timerDuration: 45
    },
    icon: <Hexagon size={18} className="text-amber-200"/>
  },
  {
    id: 'silk-layers',
    name: 'Silk Layers',
    description: 'Somnium Pro: Organic, non-digital rolling noise algorithm. Multi-layered warmth without harsh edges.',
    settings: {
      noiseType: NoiseType.SILK,
      tone: 40,
      volume: 0.7,
      pan: 0,
      isAutopan: false,
      timerDuration: 60
    },
    icon: <Waves size={18} className="text-stone-300"/>
  },
  {
    id: 'event-horizon',
    name: 'Event Horizon',
    description: 'Somnium Pro: Massive "Super-Triangle" drone architecture with panoramic width.',
    settings: {
      noiseType: NoiseType.HORIZON,
      tone: 30,
      volume: 0.65,
      pan: 0,
      isAutopan: false,
      timerDuration: 90
    },
    icon: <Sunset size={18} className="text-orange-400"/>
  }
];
