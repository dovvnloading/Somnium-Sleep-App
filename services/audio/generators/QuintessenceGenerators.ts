
import { SoundGenerator } from './SoundGenerator';

// Helper for noise buffers (Reused to keep isolation)
const createNoiseBuffer = (ctx: AudioContext, type: 'brown' | 'pink' | 'white') => {
    const size = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
    for (let i = 0; i < size; i++) {
        const w = Math.random() * 2 - 1;
        if (type === 'white') {
            data[i] = w * 0.1;
        } else if (type === 'pink') {
            b0 = 0.99886 * b0 + w * 0.0555179;
            b1 = 0.99332 * b1 + w * 0.0750759;
            b2 = 0.96900 * b2 + w * 0.1538520;
            b3 = 0.86650 * b3 + w * 0.3104856;
            b4 = 0.55000 * b4 + w * 0.5329522;
            b5 = -0.7616 * b5 - w * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
            b6 = w * 0.115926;
        } else { 
            data[i] = (0 + (0.02 * w)) / 1.02;
            data[i] *= 3.5;
        }
    }
    return buffer;
};

// 1. DEEP SOMNUS (Sleep)
// Low-frequency, circadian-aligned, Binaural Delta Waves
export class DeepSomnusGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const now = this.ctx.currentTime;
    const master = this.ctx.createGain();
    master.gain.value = 0.7;
    master.connect(this.destination);
    this.registerNode(master);

    // Bed of warm Brown Noise with "Cradling" motion
    const noise = this.ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(this.ctx, 'brown');
    noise.loop = true;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 110; // Very muffled
    noiseFilter.Q.value = 0.5;

    // Gentle cradling pan for the noise only
    const noisePan = this.ctx.createStereoPanner();
    const noiseLfo = this.ctx.createOscillator();
    noiseLfo.frequency.value = 0.1; // Slow rock
    const noiseLfoGain = this.ctx.createGain();
    noiseLfoGain.gain.value = 0.2; // Subtle width
    noiseLfo.connect(noiseLfoGain);
    noiseLfoGain.connect(noisePan.pan);

    noise.connect(noiseFilter);
    noiseFilter.connect(noisePan);
    noisePan.connect(master);
    
    noise.start(now);
    noiseLfo.start(now);
    
    this.registerNode(noise); this.registerNode(noiseFilter); 
    this.registerNode(noisePan); this.registerNode(noiseLfo); this.registerNode(noiseLfoGain);

    // Binaural Pulse Architecture (Delta Range ~3Hz)
    // Left Ear: 40Hz
    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.value = 40;
    const panL = this.ctx.createStereoPanner();
    panL.pan.value = -1; // Hard Left
    const gainL = this.ctx.createGain();
    gainL.gain.value = 0.15;
    
    // Right Ear: 43Hz (Creates 3Hz Delta Beat)
    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.value = 43;
    const panR = this.ctx.createStereoPanner();
    panR.pan.value = 1; // Hard Right
    const gainR = this.ctx.createGain();
    gainR.gain.value = 0.15;

    oscL.connect(gainL); gainL.connect(panL); panL.connect(master);
    oscR.connect(gainR); gainR.connect(panR); panR.connect(master);

    oscL.start(now); oscR.start(now);
    this.registerNode(oscL); this.registerNode(panL); this.registerNode(gainL);
    this.registerNode(oscR); this.registerNode(panR); this.registerNode(gainR);

    // Sub-bass swelling drone
    const sub = this.ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = 32.7; // C1
    const subGain = this.ctx.createGain();
    
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.05; // 20 second breath
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.05;
    
    // Base gain + modulation
    const baseC = this.ctx.createConstantSource();
    baseC.offset.value = 0.1;

    lfo.connect(lfoGain); 
    lfoGain.connect(subGain.gain);
    baseC.connect(subGain.gain);

    sub.connect(subGain);
    subGain.connect(master);

    sub.start(now); lfo.start(now); baseC.start(now);
    this.registerNode(sub); this.registerNode(subGain); this.registerNode(lfo); this.registerNode(lfoGain); this.registerNode(baseC);
  }
}

// 2. COGNITIVE FLOW (Focus)
// Non-repetitive, algorithmic-style, masks peripheral noise
export class CognitiveFlowGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const master = this.ctx.createGain();
    master.gain.value = 0.6;
    master.connect(this.destination);
    this.registerNode(master);

    // Background Texture: Filtered Pink Noise with slow movement
    const pink = this.ctx.createBufferSource();
    pink.buffer = createNoiseBuffer(this.ctx, 'pink');
    pink.loop = true;
    
    const bpFilter = this.ctx.createBiquadFilter();
    bpFilter.type = 'bandpass';
    bpFilter.Q.value = 0.5;
    bpFilter.frequency.value = 300;

    // Modulate filter to prevent ear fatigue (masking)
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoG = this.ctx.createGain();
    lfoG.gain.value = 100;
    lfo.connect(lfoG);
    lfoG.connect(bpFilter.frequency);

    pink.connect(bpFilter);
    bpFilter.connect(master);
    pink.start(); lfo.start();
    this.registerNode(pink); this.registerNode(bpFilter); this.registerNode(lfo); this.registerNode(lfoG);

    // Algorithmic Blips (Polyrhythmic, soft sine pings)
    // Scale: Pentatonic Neutral
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00]; // C4 - A4
    
    const playBlip = () => {
        if (!this.isRunning) return;
        const t = this.ctx.currentTime;
        const freq = scale[Math.floor(Math.random() * scale.length)];
        
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.05); // Soft attack
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5); // Short decay

        const pan = this.ctx.createStereoPanner();
        pan.pan.value = (Math.random() * 1.5) - 0.75; // Stereo field

        osc.connect(gain);
        gain.connect(pan);
        pan.connect(master);

        osc.start(t);
        osc.stop(t + 0.6);

        // Schedule next (irregular interval)
        const nextTime = 2000 + Math.random() * 4000;
        this.registerTimeout(window.setTimeout(playBlip, nextTime));
        
        // Cleanup node references
        setTimeout(() => { osc.disconnect(); gain.disconnect(); pan.disconnect(); }, 700);
    };

    playBlip();
    this.registerTimeout(window.setTimeout(playBlip, 1500));
  }
}

// 3. THE VOID (Meditation)
// Minimalist, atmospheric "nothingness", infinite physical space
export class VoidGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const master = this.ctx.createGain();
    master.gain.value = 0.8;
    master.connect(this.destination);
    this.registerNode(master);

    // The "Air" - Very high passed noise, barely audible
    const air = this.ctx.createBufferSource();
    air.buffer = createNoiseBuffer(this.ctx, 'white');
    air.loop = true;
    const airF = this.ctx.createBiquadFilter();
    airF.type = 'highpass';
    airF.frequency.value = 8000;
    const airG = this.ctx.createGain();
    airG.gain.value = 0.015; // Whisper quiet
    air.connect(airF); airF.connect(airG); airG.connect(master);
    air.start();
    this.registerNode(air); this.registerNode(airF); this.registerNode(airG);

    // Deep Impact Generator (Sub pulse + Massive Reverb simulation)
    const impact = () => {
        if (!this.isRunning) return;
        const t = this.ctx.currentTime;
        
        // Sub drop
        const osc = this.ctx.createOscillator();
        osc.frequency.setValueAtTime(60, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 3);
        
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.3, t + 1.5);
        g.gain.exponentialRampToValueAtTime(0.001, t + 8);

        // Send to delay line for "Space"
        const delay = this.ctx.createDelay(2.0);
        delay.delayTime.value = 0.5;
        const fb = this.ctx.createGain();
        fb.gain.value = 0.7;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400; // Dark echoes

        osc.connect(g);
        g.connect(delay);
        delay.connect(fb);
        fb.connect(filter);
        filter.connect(delay); // Feedback loop
        delay.connect(master);

        // Dry signal (low)
        g.connect(master);

        osc.start(t);
        osc.stop(t + 10);

        setTimeout(() => { osc.disconnect(); g.disconnect(); delay.disconnect(); fb.disconnect(); filter.disconnect(); }, 10000);

        this.registerTimeout(window.setTimeout(impact, 12000 + Math.random() * 8000));
    };

    impact();
  }
}

// 4. ETHEREAL AMBIENCE (Relax)
// Lush, organic-synthetic hybrid, safety and timelessness
export class EtherealGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const now = this.ctx.currentTime;
    const master = this.ctx.createGain();
    master.gain.value = 0.45;
    master.connect(this.destination);
    this.registerNode(master);

    // Warm Pad Cluster (Major 9th Chord)
    const freqs = [196.00, 246.94, 293.66, 349.23, 440.00]; // G Major 9
    
    freqs.forEach((f, i) => {
        // Multi-oscillator per voice for thickness
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.value = f;
        osc1.detune.value = -5 + Math.random() * 10;

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine'; // Sine for fundamental warmth
        osc2.frequency.value = f;
        osc2.detune.value = -5 + Math.random() * 10;

        const voiceGain = this.ctx.createGain();
        voiceGain.gain.value = 0;

        // Swelling LFO
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.05 + (Math.random() * 0.05); // Slow breath
        const lfoG = this.ctx.createGain();
        lfoG.gain.value = 0.08;
        const base = this.ctx.createConstantSource();
        base.offset.value = 0.08;

        lfo.connect(lfoG);
        lfoG.connect(voiceGain.gain);
        base.connect(voiceGain.gain);

        const pan = this.ctx.createStereoPanner();
        pan.pan.value = (Math.random() * 1.8) - 0.9;

        osc1.connect(voiceGain);
        osc2.connect(voiceGain);
        voiceGain.connect(pan);
        pan.connect(master);

        osc1.start(now); osc2.start(now); lfo.start(now); base.start(now);
        this.registerNode(osc1); this.registerNode(osc2); this.registerNode(voiceGain);
        this.registerNode(lfo); this.registerNode(lfoG); this.registerNode(base); this.registerNode(pan);
    });
  }
}

// 5. BIOPHILIC PULSE (Nature)
// Hyper-realistic "enhanced reality" nature
export class BiophilicGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const now = this.ctx.currentTime;
    const master = this.ctx.createGain();
    master.gain.value = 0.6;
    master.connect(this.destination);
    this.registerNode(master);

    // 1. Synthetic Wind/Water base
    const noise = this.ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(this.ctx, 'pink');
    noise.loop = true;
    
    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 400;
    
    // Wind modulation
    const windLfo = this.ctx.createOscillator();
    windLfo.frequency.value = 0.15;
    const windLfoG = this.ctx.createGain();
    windLfoG.gain.value = 300;
    windLfo.connect(windLfoG);
    windLfoG.connect(windFilter.frequency);

    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.2;

    noise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(master);
    
    noise.start(now); windLfo.start(now);
    this.registerNode(noise); this.registerNode(windFilter); this.registerNode(windLfo); this.registerNode(windLfoG); this.registerNode(windGain);

    // 2. Procedural "Insects" (High FM Synthesis)
    const cricket = () => {
        if (!this.isRunning) return;
        const t = this.ctx.currentTime;
        
        // FM Synthesis
        const carrier = this.ctx.createOscillator();
        carrier.frequency.value = 4000 + Math.random() * 500;
        
        const modulator = this.ctx.createOscillator();
        modulator.frequency.value = 40 + Math.random() * 10; // Flutter speed
        const modGain = this.ctx.createGain();
        modGain.gain.value = 500;
        
        modulator.connect(modGain);
        modGain.connect(carrier.frequency);

        const amp = this.ctx.createGain();
        amp.gain.setValueAtTime(0, t);
        // Reduced peak gain from 0.05 to 0.015 to be less prominent
        amp.gain.linearRampToValueAtTime(0.015, t + 0.1);
        amp.gain.linearRampToValueAtTime(0, t + 0.5 + Math.random()); // Chirp length

        const pan = this.ctx.createStereoPanner();
        pan.pan.value = (Math.random() * 2) - 1;

        carrier.connect(amp);
        amp.connect(pan);
        pan.connect(master);

        carrier.start(t); modulator.start(t);
        carrier.stop(t + 2); modulator.stop(t + 2);

        setTimeout(() => { carrier.disconnect(); modulator.disconnect(); modGain.disconnect(); amp.disconnect(); pan.disconnect(); }, 2100);

        this.registerTimeout(window.setTimeout(cricket, 500 + Math.random() * 2000));
    };

    cricket();
    this.registerTimeout(window.setTimeout(cricket, 1000));
  }
}
