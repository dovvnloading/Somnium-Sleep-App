
import { NoiseType } from '../types';
import { audioContextManager } from './audio/AudioContextManager';
import { SoundGenerator } from './audio/generators/SoundGenerator';
import { NoiseGenerator, DroneGenerator } from './audio/generators/BasicGenerators';
import { WindGenerator, SimpleNatureGenerator } from './audio/generators/NatureGenerators';
import { AuroraGenerator, CosmosGenerator } from './audio/generators/CosmicGenerators';
import { SilkGenerator, AlchemistGenerator, HorizonGenerator, StratusGenerator, Status2Generator, StratusEvolutionGenerator } from './audio/generators/ProGenerators';
import { DeepSomnusGenerator, CognitiveFlowGenerator, VoidGenerator, EtherealGenerator, BiophilicGenerator } from './audio/generators/QuintessenceGenerators';
import { 
  ZenGenerator, 
  PolyrhythmGenerator, 
  AstralGenerator, 
  ElysiumGenerator, 
  QuantumGenerator, 
  ForestGenerator, 
  CelestialGenerator, 
  LunarGenerator, 
  SomaticGenerator 
} from './audio/generators/RestoredGenerators';

export class AudioEngine {
  private currentGenerator: SoundGenerator | null = null;
  private timerId: number | null = null;
  private onTimerUpdate: ((remaining: number | null) => void) | null = null;
  private onTimerComplete: (() => void) | null = null;

  public init() {
    audioContextManager.init();
  }

  public getAnalysers(): { left: AnalyserNode, right: AnalyserNode } | null {
    return audioContextManager.getAnalysers();
  }

  public toggleSafeMode(enable: boolean) {
    audioContextManager.toggleSafeMode(enable);
  }

  public setVolume(val: number) {
    audioContextManager.setVolume(val);
  }

  public setTone(val: number) {
    audioContextManager.setTone(val);
  }

  public setPan(val: number) {
    audioContextManager.setPan(val);
  }

  public toggleAutopan(enable: boolean, speed: number = 0.5) {
    audioContextManager.toggleAutopan(enable, speed);
  }

  public play(type: NoiseType) {
    this.stop(); // Clean up previous
    this.init(); // Ensure context

    const ctx = audioContextManager.getContext();
    const dest = audioContextManager.getInput();

    // Factory Logic
    switch (type) {
      case NoiseType.WHITE:
      case NoiseType.PINK:
      case NoiseType.BROWN:
      case NoiseType.VIOLET:
        this.currentGenerator = new NoiseGenerator(ctx, dest, type);
        break;
      case NoiseType.DRONE: // Nebula Drift
        this.currentGenerator = new DroneGenerator(ctx, dest); 
        break;
      case NoiseType.COSMOS: // Galactic Core
        this.currentGenerator = new CosmosGenerator(ctx, dest);
        break;
      case NoiseType.WIND:
        this.currentGenerator = new WindGenerator(ctx, dest);
        break;
      case NoiseType.AURORA:
        this.currentGenerator = new AuroraGenerator(ctx, dest);
        break;
      
      // RESTORED TYPES (The ones that were missing/broken)
      case NoiseType.ZEN:
        this.currentGenerator = new ZenGenerator(ctx, dest);
        break;
      case NoiseType.POLYRHYTHM:
        this.currentGenerator = new PolyrhythmGenerator(ctx, dest);
        break;
      case NoiseType.ASTRAL:
        this.currentGenerator = new AstralGenerator(ctx, dest);
        break;
      case NoiseType.ELYSIUM:
        this.currentGenerator = new ElysiumGenerator(ctx, dest);
        break;
      case NoiseType.QUANTUM:
        this.currentGenerator = new QuantumGenerator(ctx, dest);
        break;
      case NoiseType.FOREST:
        this.currentGenerator = new ForestGenerator(ctx, dest);
        break;
      case NoiseType.CELESTIAL:
        this.currentGenerator = new CelestialGenerator(ctx, dest);
        break;
      case NoiseType.LUNAR:
        this.currentGenerator = new LunarGenerator(ctx, dest);
        break;
      case NoiseType.SOMATIC:
        this.currentGenerator = new SomaticGenerator(ctx, dest);
        break;
      
      // Pro Series
      case NoiseType.SILK:
        this.currentGenerator = new SilkGenerator(ctx, dest);
        break;
      case NoiseType.ALCHEMIST:
        this.currentGenerator = new AlchemistGenerator(ctx, dest);
        break;
      case NoiseType.HORIZON:
        this.currentGenerator = new HorizonGenerator(ctx, dest);
        break;
      case NoiseType.STRATUS:
        this.currentGenerator = new StratusGenerator(ctx, dest);
        break;
      case NoiseType.STRATUS_EVO:
        this.currentGenerator = new StratusEvolutionGenerator(ctx, dest);
        break;
      
      // Artist Series
      case NoiseType.STATUS_II:
        this.currentGenerator = new Status2Generator(ctx, dest);
        break;

      // Quintessence Series
      case NoiseType.DEEP_SOMNUS:
        this.currentGenerator = new DeepSomnusGenerator(ctx, dest);
        break;
      case NoiseType.COGNITIVE:
        this.currentGenerator = new CognitiveFlowGenerator(ctx, dest);
        break;
      case NoiseType.VOID:
        this.currentGenerator = new VoidGenerator(ctx, dest);
        break;
      case NoiseType.ETHEREAL:
        this.currentGenerator = new EtherealGenerator(ctx, dest);
        break;
      case NoiseType.BIOPHILIC:
        this.currentGenerator = new BiophilicGenerator(ctx, dest);
        break;

      default:
        // Remaining Nature types (Rain, Storm, Ocean) are handled here with better logic now
        this.currentGenerator = new SimpleNatureGenerator(ctx, dest, type);
        break;
    }

    if (this.currentGenerator) {
      audioContextManager.fadeIn(4.0);
      this.currentGenerator.start();
    }
  }

  public stop() {
    if (this.currentGenerator) {
      this.currentGenerator.stop();
      this.currentGenerator = null;
    }
    this.cancelTimer();
  }

  public startTimer(minutes: number, onUpdate: (rem: number | null) => void, onComplete: () => void) {
    this.cancelTimer();
    const endTime = Date.now() + minutes * 60 * 1000;
    this.onTimerUpdate = onUpdate;
    this.onTimerComplete = onComplete;

    const tick = () => {
      const remaining = Math.ceil((endTime - Date.now()) / 1000);
      if (remaining <= 0) {
        audioContextManager.fadeOut(5.0, () => {
          this.stop();
          if (this.onTimerComplete) this.onTimerComplete();
        });
        this.cancelTimer();
      } else {
        if (this.onTimerUpdate) this.onTimerUpdate(remaining);
        this.timerId = window.setTimeout(tick, 1000);
      }
    };
    tick();
  }

  public cancelTimer() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.onTimerUpdate) this.onTimerUpdate(null);
  }
}

export const audioEngine = new AudioEngine();
