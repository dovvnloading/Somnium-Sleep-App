
import { NoiseType } from '../types';

export const NOISE_INFO: Record<NoiseType, { title: string, description: string }> = {
  [NoiseType.WHITE]: { title: 'White Noise', description: 'Equal energy per frequency. Effective for masking distractions.' },
  [NoiseType.PINK]: { title: 'Pink Noise', description: 'Balanced frequency noise, similar to steady rain or wind.' },
  [NoiseType.BROWN]: { title: 'Brown Noise', description: 'Deep, rumbling low-frequency noise for relaxation.' },
  [NoiseType.VIOLET]: { title: 'Violet Noise', description: 'High-frequency energy, often used for tinnitus relief.' },
  [NoiseType.DRONE]: { title: 'Deep Drone', description: 'Steady, oscillating low tones for focus and meditation.' },
  [NoiseType.WIND]: { title: 'Wind', description: 'Dynamic, modulated noise simulating cold gusts.' },
  [NoiseType.RAIN]: { title: 'Rain', description: 'Procedural droplets and wash for a rainy atmosphere.' },
  [NoiseType.STORM]: { title: 'Thunderstorm', description: 'Heavy rain mixed with distant thunder and wind.' },
  [NoiseType.COSMOS]: { title: 'Cosmos', description: 'Deep space ambience with drifting synth pads.' },
  [NoiseType.CELESTIAL]: { title: 'Celestial', description: 'Polyrhythmic glass-harp synthesis in Db Lydian, featuring FM-based bells and a breathing atmospheric halo.' },
  [NoiseType.ZEN]: { title: 'Zen Garden', description: 'Harmonious wind chimes, gentle breezes, and meditative flows.' },
  [NoiseType.OCEAN]: { title: 'Oceanic', description: 'Rolling surf, distant deep crashing waves, and faint coastal foghorns.' },
  [NoiseType.LUNAR]: { title: 'Lunar Crater', description: 'Deep cosmic immersion with silky harmonic pads, breathing sub-bass, and delicate stardust textures.' },
  [NoiseType.AURORA]: { title: 'Aurora', description: 'Shimmering electromagnetic winds and luminous harmonic pads.' },
  [NoiseType.FOREST]: { title: 'Bioluminescent Forest', description: 'Generative FM synthesis creating an alien ecosystem of glass fauna and swelling luminous flora.' },
  [NoiseType.QUANTUM]: { title: 'Quantum Field', description: 'The hum of the universe. Sub-bass gravitational waves, swirling event horizon textures, and generative particle fluctuations.' },
  [NoiseType.ELYSIUM]: { title: 'Elysium Fields', description: 'A state-of-the-art generative soundscape featuring lush "Super-Saw" pads, granular stardust textures, and FM-synthesized celestial harps.' },
  [NoiseType.ASTRAL]: { title: 'Astral Plane', description: 'Psycho-acoustic tapestry. Binaural theta waves interwoven with crystalline textures and infinite reverb tail.' },
  [NoiseType.SOMATIC]: { title: 'Somatic Release', description: 'Nervous system decompression. Features a "weighted blanket" of low-end warmth, bio-rhythmic breathing noise, and 174Hz somatic anchoring.' },
  [NoiseType.POLYRHYTHM]: { title: 'Polyrhythmic Dreams', description: 'Procedurally generated 4:3:5 polyrhythms featuring soft-attack synthesis and lush harmonic pads.' },
  
  // Somnium Pro
  [NoiseType.SILK]: { title: 'Silk Layers', description: 'An organic, non-digital noise algorithm. Three independent layers of warmth roll in and out like heavy fabric or distant tides, with zero harsh frequencies.' },
  [NoiseType.ALCHEMIST]: { title: 'The Alchemist', description: 'Muted metallic physical modeling. A generative sound garden of hang drums and bells tuned to the Hirajoshi scale.' },
  [NoiseType.HORIZON]: { title: 'Event Horizon', description: 'Massive "Super-Triangle" drone architecture. Seven detuned oscillators per voice create a thick, panoramic wall of sound.' },
  [NoiseType.STRATUS]: { title: 'Stratus Tide', description: 'Mathematical serenity. Algorithmically selected notes drift in a tide pool of harmony, inspired by generative neoclassical composition.' },
  [NoiseType.STRATUS_EVO]: { title: 'Stratus: Evolution', description: 'State of the Art MIDI simulation. Polyrhythmic piano sequences driven by prime-number math and harmonic probability rules.' },
  
  // Artist Series
  [NoiseType.STATUS_II]: { title: 'Status 2', description: 'Artist Series: Inspired by Nils Frahm & Ólafur Arnalds. Muted felt-piano textures, generative polyrhythms, and massive shimmer-delay architecture.' },

  // Quintessence Series
  [NoiseType.DEEP_SOMNUS]: { title: 'Deep Somnus', description: 'Quintessence: Circadian-aligned low-frequency architecture using 3Hz binaural Delta beats to bypass the conscious mind.' },
  [NoiseType.COGNITIVE]: { title: 'Cognitive Flow', description: 'Quintessence: Non-repetitive algorithmic texture. Designed to mask peripheral noise and enhance neural pathways for deep work.' },
  [NoiseType.VOID]: { title: 'The Void', description: 'Quintessence: Minimalist "nothingness". Uses spatial audio positioning to create a sense of infinite physical space and isolation.' },
  [NoiseType.ETHEREAL]: { title: 'Ethereal Ambience', description: 'Quintessence: A lush, organic-synthetic hybrid evoking safety and timelessness with swelling Major 9th harmonics.' },
  [NoiseType.BIOPHILIC]: { title: 'Biophilic Pulse', description: 'Quintessence: Hyper-realistic enhanced nature. Procedural FM synthesis mimics organic life patterns for grounding.' }
};
