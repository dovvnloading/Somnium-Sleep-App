
import { SoundGenerator } from './SoundGenerator';
import { NoiseType } from '../../../types';

export class NoiseGenerator extends SoundGenerator {
  constructor(ctx: AudioContext, dest: AudioNode, private type: NoiseType) {
    super(ctx, dest);
  }

  start() {
    this.isRunning = true;
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      if (this.type === NoiseType.WHITE) {
        output[i] = Math.random() * 2 - 1;
      } else if (this.type === NoiseType.PINK) {
        // Paul Kellett's Pink Noise
        let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      } else if (this.type === NoiseType.BROWN) {
        const white = Math.random() * 2 - 1;
        output[i] = (0 + (0.02 * white)) / 1.02; 
        output[i] *= 3.5;
      } else { // VIOLET
         const white = Math.random() * 2 - 1;
         output[i] = white * 0.5; 
      }
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.destination);
    source.start();
    this.registerNode(source);
  }
}

// Improved Drone for Nebula Drift
export class DroneGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const master = this.ctx.createGain();
    master.gain.value = 0.25;
    master.connect(this.destination);
    this.registerNode(master);

    const freqs = [55, 110, 165, 220]; // A1 harmonic series
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      
      // Slight detune drift
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.05 + Math.random() * 0.1;
      const lfoG = this.ctx.createGain();
      lfoG.gain.value = 2; // +/- 2Hz drift
      lfo.connect(lfoG);
      lfoG.connect(osc.frequency);

      const amp = this.ctx.createGain();
      amp.gain.value = 0.25;
      
      osc.connect(amp);
      amp.connect(master);
      osc.start();
      lfo.start();

      this.registerNode(osc);
      this.registerNode(lfo);
      this.registerNode(lfoG);
      this.registerNode(amp);
    });
  }
}
