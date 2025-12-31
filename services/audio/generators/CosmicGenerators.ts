
import { SoundGenerator } from './SoundGenerator';

export class AuroraGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const now = this.ctx.currentTime;
    const master = this.ctx.createGain();
    master.gain.value = 0.35;
    master.connect(this.destination);
    this.registerNode(master);

    // 1. Shimmering Pad (Fmaj7 add 9)
    const chords = [174.61, 220.00, 261.63, 329.63];
    chords.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = (Math.random() * 10) - 5;

        const ampGain = this.ctx.createGain();
        ampGain.gain.value = 0.0;

        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.1 + (Math.random() * 0.2);
        
        const lfoScaler = this.ctx.createGain();
        lfoScaler.gain.value = 0.15;
        
        const constant = this.ctx.createConstantSource();
        constant.offset.value = 0.15;
        
        lfo.connect(lfoScaler);
        constant.connect(ampGain.gain);
        lfoScaler.connect(ampGain.gain);

        const panner = this.ctx.createStereoPanner();
        panner.pan.value = (Math.random() * 1.5) - 0.75;

        osc.connect(ampGain);
        ampGain.connect(panner);
        panner.connect(master);

        osc.start(now);
        lfo.start(now);
        constant.start(now);

        this.registerNode(osc);
        this.registerNode(ampGain);
        this.registerNode(lfo);
        this.registerNode(lfoScaler);
        this.registerNode(constant);
        this.registerNode(panner);
    });

    // 2. Solar Wind Crackle
    const bSize = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const dat = buf.getChannelData(0);
    for (let i = 0; i < bSize; i++) dat[i] = (Math.random() * 2 - 1) * 0.5;

    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = buf;
    noiseSrc.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.Q.value = 5;
    noiseFilter.frequency.value = 2000;

    const sweepLfo = this.ctx.createOscillator();
    sweepLfo.frequency.value = 0.05;
    const sweepGain = this.ctx.createGain();
    sweepGain.gain.value = 1000;

    sweepLfo.connect(sweepGain);
    sweepGain.connect(noiseFilter.frequency);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.05;

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);

    noiseSrc.start(now);
    sweepLfo.start(now);

    this.registerNode(noiseSrc);
    this.registerNode(noiseFilter);
    this.registerNode(sweepLfo);
    this.registerNode(sweepGain);
    this.registerNode(noiseGain);
  }
}

export class CosmosGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const now = this.ctx.currentTime;
    const master = this.ctx.createGain();
    master.gain.value = 0.5;
    master.connect(this.destination);
    this.registerNode(master);

    // Dark, slow moving cluster (Csus2 base in low register)
    // Frequencies: C2 (65.41), G2 (98.00), D3 (146.83)
    const freqs = [65.41, 98.00, 146.83];
    
    freqs.forEach((freq, i) => {
        // Voice 1: Triangle for body
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = (Math.random() * 4) - 2;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 150 + Math.random() * 100;

        const amp = this.ctx.createGain();
        amp.gain.value = 0;

        // Ultra slow breathing
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.04 + (Math.random() * 0.02);
        const lfoG = this.ctx.createGain();
        lfoG.gain.value = 0.15;
        const bias = this.ctx.createConstantSource();
        bias.offset.value = 0.15;

        lfo.connect(lfoG);
        lfoG.connect(amp.gain);
        bias.connect(amp.gain);

        const pan = this.ctx.createStereoPanner();
        pan.pan.value = (Math.random() * 1.2) - 0.6;

        osc.connect(filter);
        filter.connect(amp);
        amp.connect(pan);
        pan.connect(master);

        osc.start(now); lfo.start(now); bias.start(now);
        this.registerNode(osc); this.registerNode(filter); this.registerNode(amp);
        this.registerNode(lfo); this.registerNode(lfoG); this.registerNode(bias); this.registerNode(pan);
    });

    // Deep Sub Rumble
    const sub = this.ctx.createOscillator();
    sub.type = 'sawtooth';
    sub.frequency.value = 32.70; // C1
    const subF = this.ctx.createBiquadFilter();
    subF.type = 'lowpass';
    subF.frequency.value = 80;
    const subG = this.ctx.createGain();
    subG.gain.value = 0.25;
    
    sub.connect(subF); subF.connect(subG); subG.connect(master);
    sub.start(now);
    this.registerNode(sub); this.registerNode(subF); this.registerNode(subG);
  }
}
