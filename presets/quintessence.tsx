
import React from 'react';
import { Moon, Brain, Disc, Feather, Sprout } from 'lucide-react';
import { Preset, NoiseType } from '../types';

export const quintessencePresets: Preset[] = [
  {
    id: 'ethereal-ambience',
    name: 'Ethereal Ambience',
    description: 'Quintessence: Organic-synthetic swelling pads for safety and timelessness.',
    settings: {
      noiseType: NoiseType.ETHEREAL,
      tone: 50,
      volume: 0.55,
      pan: 0,
      isAutopan: true, // Gentle floating
      timerDuration: 60
    },
    icon: <Feather size={18} className="text-sky-200"/>
  },
  {
    id: 'biophilic-pulse',
    name: 'Biophilic Pulse',
    description: 'Quintessence: Enhanced reality nature synthesis. Grounding and alive.',
    settings: {
      noiseType: NoiseType.BIOPHILIC,
      tone: 65,
      volume: 0.6,
      pan: 0,
      isAutopan: true,
      timerDuration: 60
    },
    icon: <Sprout size={18} className="text-emerald-300"/>
  },
  {
    id: 'cognitive-flow',
    name: 'Cognitive Flow',
    description: 'Quintessence: Algorithmic noise-masking for high-performance deep work.',
    settings: {
        noiseType: NoiseType.COGNITIVE,
        tone: 60,
        volume: 0.6,
        pan: 0,
        isAutopan: false,
        timerDuration: 90
    },
    icon: <Brain size={18} className="text-rose-300"/>
  },
  {
    id: 'deep-somnus',
    name: 'Deep Somnus',
    description: 'Quintessence: 3Hz Delta-wave binaural transition for immediate sleep induction.',
    settings: {
        noiseType: NoiseType.DEEP_SOMNUS,
        tone: 30, // Dark and heavy
        volume: 0.75, // Louder presence for immersion
        pan: 0,
        isAutopan: false, // Position needs to be static for binaural effect
        timerDuration: 60
    },
    icon: <Moon size={18} className="text-indigo-300"/>
  },
  {
    id: 'the-void',
    name: 'The Void',
    description: 'Quintessence: Minimalist isolation. Infinite reverb tails and sub-bass impacts.',
    settings: {
      noiseType: NoiseType.VOID,
      tone: 20, // Very dark
      volume: 0.8,
      pan: 0,
      isAutopan: false,
      timerDuration: 45
    },
    icon: <Disc size={18} className="text-zinc-400"/>
  }
];
