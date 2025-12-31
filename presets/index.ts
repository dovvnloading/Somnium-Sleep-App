
import { wellnessPresets } from './wellness';
import { cosmosPresets } from './cosmos';
import { naturePresets } from './nature';
import { focusPresets } from './focus';
import { proPresets } from './pro';
import { artistPresets } from './artist';
import { quintessencePresets } from './quintessence';
import { Preset } from '../types';

export const PRESETS: Preset[] = [
  ...quintessencePresets, // Featured at top
  ...artistPresets,
  ...proPresets,
  ...wellnessPresets,
  ...cosmosPresets,
  ...naturePresets,
  ...focusPresets
];
