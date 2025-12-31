import React from 'react';
import { ShieldCheck, Music, Leaf } from 'lucide-react';
import { Preset, NoiseType } from '../types';

export const wellnessPresets: Preset[] = [
  {
    id: 'somatic-release',
    name: 'Somatic Release',
    description: 'Nervous system reset. Weighted blanket bass, theta waves, and bio-rhythmic breathing.',
    settings: {
        noiseType: NoiseType.SOMATIC,
        tone: 30, // Darker tone for soothing
        volume: 0.7, // Higher volume for the "weighted" feel
        pan: 0,
        isAutopan: true,
        timerDuration: 60
    },
    icon: <ShieldCheck size={18} className="text-rose-300"/>
  },
  {
    id: 'polyrhythmic-dreams',
    name: 'Polyrhythmic Dreams',
    description: 'Procedurally generated 4:3:5 polyrhythms featuring soft-attack synthesis and lush harmonic pads.',
    settings: {
        noiseType: NoiseType.POLYRHYTHM,
        tone: 60,
        volume: 0.6,
        pan: 0,
        isAutopan: true,
        timerDuration: 60
    },
    icon: <Music size={18} className="text-indigo-400"/>
  },
  {
    id: 'zen-garden',
    name: 'Zen Garden',
    description: 'Mathematically perfect pentatonic chimes with gentle garden breezes.',
    settings: {
      noiseType: NoiseType.ZEN,
      tone: 65,
      volume: 0.6,
      pan: 0,
      isAutopan: true,
      timerDuration: 45
    },
    icon: <Leaf size={18}/>
  }
];