
import { SoundGenerator } from './SoundGenerator';
import { NoiseGenerator } from './BasicGenerators';
import { NoiseType } from '../../../types';

// Helper for noise generation used in WindGenerator
const createNatureNoiseBuffer = (ctx: AudioContext, type: 'pink' | 'white') => {
  const size = ctx.sampleRate * 4; // 4 seconds loop
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < size; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
  } else {
    // Pink Noise
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
    for (let i = 0; i < size; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }
  return buffer;
};

// REBUILT: Arctic Wind Generator
// - Features smooth start/stop to prevent popping
// - Multi-layered: Sub rumble, Stereo howling gusts, High frequency ice friction
export class WindGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const t = this.ctx.currentTime;
    
    // Master Gain for this generator (Prevents start-up pops)
    const master = this.ctx.createGain();
    master.gain.value = 0; 
    master.connect(this.destination);
    this.registerNode(master);
    
    // Smooth Fade In (2s)
    master.gain.linearRampToValueAtTime(0.8, t + 2.0);

    const pinkBuffer = createNatureNoiseBuffer(this.ctx, 'pink');
    const whiteBuffer = createNatureNoiseBuffer(this.ctx, 'white');

    // --- LAYER 1: DEEP SUB RUMBLE (The heavy air mass) ---
    // Provides the "pressure" feeling of a storm
    const subSrc = this.ctx.createBufferSource();
    subSrc.buffer = pinkBuffer;
    subSrc.loop = true;
    
    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.value = 140; 
    subFilter.Q.value = 0.5;
    
    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.6; // Heavy foundation

    subSrc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(master);
    subSrc.start(t);
    
    this.registerNode(subSrc); this.registerNode(subFilter); this.registerNode(subGain);

    // --- LAYER 2: HOWLING GUSTS (Stereo modulated filters) ---
    // Creates that "whooshing" sound of wind passing ears/structures
    const createGust = (pan: number, freqCenter: number, delay: number) => {
        const src = this.ctx.createBufferSource();
        src.buffer = pinkBuffer;
        src.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 1.2; 

        // Modulate Filter Frequency (Pitch of the wind)
        const fLfo = this.ctx.createOscillator();
        fLfo.frequency.value = 0.06 + Math.random() * 0.04; // Slow sweep
        const fLfoG = this.ctx.createGain();
        fLfoG.gain.value = 400; // Sweep width
        const fBase = this.ctx.createConstantSource();
        fBase.offset.value = freqCenter;

        fLfo.connect(fLfoG); fLfoG.connect(filter.frequency); fBase.connect(filter.frequency);

        // Modulate Amplitude (Gust intensity swelling)
        const aLfo = this.ctx.createOscillator();
        aLfo.frequency.value = 0.08 + Math.random() * 0.05;
        const aLfoG = this.ctx.createGain();
        aLfoG.gain.value = 0.2;
        const aBase = this.ctx.createConstantSource();
        aBase.offset.value = 0.25; 

        const vol = this.ctx.createGain();
        vol.gain.value = 0; 

        aLfo.connect(aLfoG); aLfoG.connect(vol.gain); aBase.connect(vol.gain);

        const panner = this.ctx.createStereoPanner();
        panner.pan.value = pan;

        src.connect(filter);
        filter.connect(vol);
        vol.connect(panner);
        panner.connect(master);

        src.start(t); fLfo.start(t); fBase.start(t); aLfo.start(t); aBase.start(t);
        
        this.registerNode(src); this.registerNode(filter); 
        this.registerNode(fLfo); this.registerNode(fLfoG); this.registerNode(fBase);
        this.registerNode(aLfo); this.registerNode(aLfoG); this.registerNode(aBase);
        this.registerNode(vol); this.registerNode(panner);
    };

    createGust(-0.7, 500, 0);
    createGust(0.7, 650, 1.5); 

    // --- LAYER 3: ICY FRICTION (High frequency hiss) ---
    // Simulates snow/ice particles hitting surfaces
    const iceSrc = this.ctx.createBufferSource();
    iceSrc.buffer = whiteBuffer;
    iceSrc.loop = true;

    const iceFilter = this.ctx.createBiquadFilter();
    iceFilter.type = 'highpass';
    iceFilter.frequency.value = 2000;
    
    const iceFilter2 = this.ctx.createBiquadFilter();
    iceFilter2.type = 'lowpass';
    iceFilter2.frequency.value = 5000;

    const iceGain = this.ctx.createGain();
    iceGain.gain.value = 0; // Controlled by procedure

    const icePan = this.ctx.createStereoPanner();
    const panLfo = this.ctx.createOscillator();
    panLfo.frequency.value = 0.04;
    const panLfoG = this.ctx.createGain();
    panLfoG.gain.value = 0.9;
    panLfo.connect(panLfoG); panLfoG.connect(icePan.pan);

    iceSrc.connect(iceFilter);
    iceFilter.connect(iceFilter2);
    iceFilter2.connect(iceGain);
    iceGain.connect(icePan);
    icePan.connect(master);

    iceSrc.start(t); panLfo.start(t);
    this.registerNode(iceSrc); this.registerNode(iceFilter); this.registerNode(iceFilter2);
    this.registerNode(iceGain); this.registerNode(icePan); this.registerNode(panLfo); this.registerNode(panLfoG);

    // Procedural random gusts for the high-end ice
    const triggerIceGust = () => {
        if (!this.isRunning) return;
        const now = this.ctx.currentTime;
        const duration = 2 + Math.random() * 4;
        
        // Gentle ramp up and down
        iceGain.gain.cancelScheduledValues(now);
        iceGain.gain.setValueAtTime(iceGain.gain.value, now);
        iceGain.gain.linearRampToValueAtTime(0.08, now + duration * 0.4);
        iceGain.gain.linearRampToValueAtTime(0, now + duration);

        this.registerTimeout(window.setTimeout(triggerIceGust, 3000 + Math.random() * 5000));
    };
    triggerIceGust();
  }
}

export class SimpleNatureGenerator extends SoundGenerator {
  constructor(ctx: AudioContext, dest: AudioNode, private type: NoiseType) {
    super(ctx, dest);
  }

  start() {
    this.isRunning = true;
    
    // RAIN
    if (this.type === NoiseType.RAIN) {
        const b = this.ctx.createBufferSource();
        // Create simple rain buffer (White noise filtered)
        const size = this.ctx.sampleRate * 2;
        const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for(let i=0; i<size; i++) d[i] = Math.random() * 0.2 - 0.1;
        
        b.buffer = buf;
        b.loop = true;
        const f = this.ctx.createBiquadFilter(); f.frequency.value = 800;
        b.connect(f); f.connect(this.destination);
        b.start();
        this.registerNode(b); this.registerNode(f);
        return;
    }

    // STORM
    if (this.type === NoiseType.STORM) {
        // Rain layer
        const r = this.ctx.createBufferSource();
        const size = this.ctx.sampleRate * 2;
        const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for(let i=0; i<size; i++) d[i] = Math.random() * 0.2 - 0.1;
        r.buffer = buf; r.loop = true;
        
        const f = this.ctx.createBiquadFilter(); f.frequency.value = 600;
        r.connect(f); f.connect(this.destination);
        r.start();
        this.registerNode(r); this.registerNode(f);

        // Thunder (Random brown noise bursts)
        const thunder = () => {
            if(!this.isRunning) return;
            const t = this.ctx.currentTime;
            const tb = this.ctx.createBufferSource();
            // Create Brown noise chunk on fly or reuse? Let's just use white and filter heavily
            const tbuf = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
            const td = tbuf.getChannelData(0);
            for(let i=0;i<td.length;i++) td[i] = Math.random()*2-1;
            tb.buffer = tbuf;
            
            const tf = this.ctx.createBiquadFilter(); tf.frequency.value = 100;
            const tg = this.ctx.createGain(); tg.gain.setValueAtTime(0, t);
            tg.gain.linearRampToValueAtTime(0.8, t+0.2); tg.gain.exponentialRampToValueAtTime(0.001, t+1.5);
            
            tb.connect(tf); tf.connect(tg); tg.connect(this.destination);
            tb.start(t); tb.stop(t+2);
            setTimeout(()=>{ tb.disconnect(); tf.disconnect(); tg.disconnect(); }, 2100);
            this.registerTimeout(window.setTimeout(thunder, 5000 + Math.random() * 10000));
        }
        thunder();
        return;
    }

    // OCEAN
    if (this.type === NoiseType.OCEAN) {
        const size = this.ctx.sampleRate * 4;
        const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        // Pinkish
        let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
        for (let i=0; i<size; i++) {
            const w = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + w * 0.0555179;
            b1 = 0.99332 * b1 + w * 0.0750759;
            b2 = 0.96900 * b2 + w * 0.1538520;
            b3 = 0.86650 * b3 + w * 0.3104856;
            b4 = 0.55000 * b4 + w * 0.5329522;
            b5 = -0.7616 * b5 - w * 0.0168980;
            d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
            b6 = w * 0.115926;
        }
        const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
        const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300;
        
        // Wave LFO
        const lfo = this.ctx.createOscillator(); lfo.frequency.value = 0.1;
        const lg = this.ctx.createGain(); lg.gain.value = 300;
        lfo.connect(lg); lg.connect(f.frequency);
        
        src.connect(f); f.connect(this.destination);
        src.start(); lfo.start();
        this.registerNode(src); this.registerNode(f); this.registerNode(lfo); this.registerNode(lg);
        return;
    }

    // Fallback
    const noise = new NoiseGenerator(this.ctx, this.destination, NoiseType.PINK);
    noise.start();
  }
}
