
import { SoundGenerator } from './SoundGenerator';

// Helper: Create noise buffer
const createNoise = (ctx: AudioContext, type: 'white' | 'pink' | 'brown') => {
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

// ZEN GARDEN: Wind chimes + Gentle Breeze
export class ZenGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const master = this.ctx.createGain(); master.gain.value = 0.6;
    master.connect(this.destination); this.registerNode(master);

    // Breeze
    const wind = this.ctx.createBufferSource();
    wind.buffer = createNoise(this.ctx, 'pink'); wind.loop = true;
    const wFilter = this.ctx.createBiquadFilter(); wFilter.type = 'lowpass'; wFilter.frequency.value = 400;
    const wLfo = this.ctx.createOscillator(); wLfo.frequency.value = 0.1;
    const wLfoG = this.ctx.createGain(); wLfoG.gain.value = 200;
    wLfo.connect(wLfoG); wLfoG.connect(wFilter.frequency);
    const wGain = this.ctx.createGain(); wGain.gain.value = 0.15;
    wind.connect(wFilter); wFilter.connect(wGain); wGain.connect(master);
    wind.start(); wLfo.start();
    this.registerNode(wind); this.registerNode(wFilter); this.registerNode(wLfo); this.registerNode(wLfoG); this.registerNode(wGain);

    // Chimes (Pentatonic)
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C Major Pentatonic
    const chime = () => {
        if (!this.isRunning) return;
        const t = this.ctx.currentTime;
        const freq = scale[Math.floor(Math.random() * scale.length)];
        
        const osc = this.ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
        // FM for "metallic" hit
        const mod = this.ctx.createOscillator(); mod.frequency.value = freq * 2.5;
        const modG = this.ctx.createGain(); modG.gain.setValueAtTime(500, t); modG.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        mod.connect(modG); modG.connect(osc.frequency);

        const amp = this.ctx.createGain(); amp.gain.setValueAtTime(0, t); amp.gain.linearRampToValueAtTime(0.3, t+0.01); amp.gain.exponentialRampToValueAtTime(0.001, t+3.0);
        const pan = this.ctx.createStereoPanner(); pan.pan.value = Math.random() * 1.6 - 0.8;

        osc.connect(amp); amp.connect(pan); pan.connect(master);
        osc.start(t); mod.start(t); osc.stop(t+3.1); mod.stop(t+3.1);

        setTimeout(() => { osc.disconnect(); mod.disconnect(); modG.disconnect(); amp.disconnect(); pan.disconnect(); }, 3200);
        this.registerTimeout(window.setTimeout(chime, 1000 + Math.random() * 4000));
    };
    chime();
  }
}

// POLYRHYTHMIC DREAMS: 4:3:5 Loops
export class PolyrhythmGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const master = this.ctx.createGain(); master.gain.value = 0.5;
    master.connect(this.destination); this.registerNode(master);

    const createLoop = (freq: number, interval: number, panVal: number) => {
        const loop = () => {
            if(!this.isRunning) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = freq;
            const f = this.ctx.createBiquadFilter(); f.frequency.value = 800;
            const a = this.ctx.createGain(); a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(0.1, t+0.05); a.gain.exponentialRampToValueAtTime(0.001, t+0.4);
            const p = this.ctx.createStereoPanner(); p.pan.value = panVal;
            
            osc.connect(f); f.connect(a); a.connect(p); p.connect(master);
            osc.start(t); osc.stop(t+0.5);
            setTimeout(() => { osc.disconnect(); f.disconnect(); a.disconnect(); p.disconnect(); }, 600);
            this.registerTimeout(window.setTimeout(loop, interval));
        };
        loop();
    };

    createLoop(261.63, 4000, -0.5); // C4, 4s
    createLoop(329.63, 3000, 0.5);  // E4, 3s
    createLoop(392.00, 5000, 0);    // G4, 5s
    
    // Pad layer
    const pad = this.ctx.createOscillator(); pad.frequency.value = 130.81;
    const padG = this.ctx.createGain(); padG.gain.value = 0.05;
    pad.connect(padG); padG.connect(master);
    pad.start(); this.registerNode(pad); this.registerNode(padG);
  }
}

// ASTRAL PLANE: Binaural Theta + Shimmer
export class AstralGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const master = this.ctx.createGain(); master.gain.value = 0.6;
    master.connect(this.destination); this.registerNode(master);

    // Binaural Theta (6Hz difference)
    const oscL = this.ctx.createOscillator(); oscL.frequency.value = 100;
    const oscR = this.ctx.createOscillator(); oscR.frequency.value = 106;
    const pL = this.ctx.createStereoPanner(); pL.pan.value = -1;
    const pR = this.ctx.createStereoPanner(); pR.pan.value = 1;
    const g = this.ctx.createGain(); g.gain.value = 0.1;
    
    oscL.connect(pL); pL.connect(g); oscR.connect(pR); pR.connect(g); g.connect(master);
    oscL.start(); oscR.start();
    this.registerNode(oscL); this.registerNode(oscR); this.registerNode(pL); this.registerNode(pR); this.registerNode(g);

    // Shimmer Textures
    const makeShimmer = () => {
        if(!this.isRunning) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = 200 + Math.random() * 400;
        const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(200, t); f.frequency.linearRampToValueAtTime(1000, t+2); f.frequency.linearRampToValueAtTime(200, t+4);
        const a = this.ctx.createGain(); a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(0.03, t+2); a.gain.linearRampToValueAtTime(0, t+4);
        const p = this.ctx.createStereoPanner(); p.pan.value = Math.random() * 2 - 1;
        
        osc.connect(f); f.connect(a); a.connect(p); p.connect(master);
        osc.start(t); osc.stop(t+4.1);
        setTimeout(() => { osc.disconnect(); f.disconnect(); a.disconnect(); p.disconnect(); }, 4200);
        this.registerTimeout(window.setTimeout(makeShimmer, 1500));
    };
    makeShimmer();
  }
}

// ELYSIUM FIELDS: Super-Saw Pads
export class ElysiumGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const master = this.ctx.createGain(); master.gain.value = 0.4;
    master.connect(this.destination); this.registerNode(master);

    const chord = [130.81, 164.81, 196.00, 246.94]; // Cmaj7
    chord.forEach(freq => {
        // 3 detuned saws per voice
        [-5, 0, 5].forEach(detune => {
            const osc = this.ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = freq; osc.detune.value = detune;
            const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400;
            
            // Filter drift
            const lfo = this.ctx.createOscillator(); lfo.frequency.value = 0.1 + Math.random() * 0.1;
            const lfoG = this.ctx.createGain(); lfoG.gain.value = 150;
            lfo.connect(lfoG); lfoG.connect(f.frequency);
            
            const g = this.ctx.createGain(); g.gain.value = 0.03;
            osc.connect(f); f.connect(g); g.connect(master);
            osc.start(); lfo.start();
            this.registerNode(osc); this.registerNode(f); this.registerNode(lfo); this.registerNode(lfoG); this.registerNode(g);
        });
    });
  }
}

// QUANTUM FIELD: Sub + Data Blips
export class QuantumGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const master = this.ctx.createGain(); master.gain.value = 0.7;
    master.connect(this.destination); this.registerNode(master);

    // Rumble
    const noise = this.ctx.createBufferSource(); noise.buffer = createNoise(this.ctx, 'brown'); noise.loop = true;
    const nf = this.ctx.createBiquadFilter(); nf.frequency.value = 80;
    noise.connect(nf); nf.connect(master); noise.start();
    this.registerNode(noise); this.registerNode(nf);

    // Data Artifacts
    const artifact = () => {
        if(!this.isRunning) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator(); osc.type = 'square'; osc.frequency.value = 2000 + Math.random() * 3000;
        const g = this.ctx.createGain(); g.gain.setValueAtTime(0.02, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.05);
        const p = this.ctx.createStereoPanner(); p.pan.value = Math.random() * 2 - 1;
        
        osc.connect(g); g.connect(p); p.connect(master);
        osc.start(t); osc.stop(t+0.1);
        setTimeout(() => { osc.disconnect(); g.disconnect(); p.disconnect(); }, 200);
        this.registerTimeout(window.setTimeout(artifact, 200 + Math.random() * 800));
    };
    artifact();
  }
}

// BIOLUMINESCENT FOREST: FM Insects + Night Atmosphere
export class ForestGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const master = this.ctx.createGain(); master.gain.value = 0.5;
    master.connect(this.destination); this.registerNode(master);

    // Night air
    const air = this.ctx.createBufferSource(); air.buffer = createNoise(this.ctx, 'pink'); air.loop = true;
    const af = this.ctx.createBiquadFilter(); af.type = 'highpass'; af.frequency.value = 2000;
    const ag = this.ctx.createGain(); ag.gain.value = 0.1;
    air.connect(af); af.connect(ag); ag.connect(master);
    air.start(); this.registerNode(air); this.registerNode(af); this.registerNode(ag);

    // FM Insect
    const chirp = () => {
        if(!this.isRunning) return;
        const t = this.ctx.currentTime;
        const carrier = this.ctx.createOscillator(); carrier.frequency.value = 3000 + Math.random() * 1000;
        const mod = this.ctx.createOscillator(); mod.frequency.value = 40;
        const modG = this.ctx.createGain(); modG.gain.value = 500;
        mod.connect(modG); modG.connect(carrier.frequency);
        
        const g = this.ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t+0.1); g.gain.linearRampToValueAtTime(0, t+0.2 + Math.random()*0.3);
        const p = this.ctx.createStereoPanner(); p.pan.value = Math.random() * 2 - 1;

        carrier.connect(g); g.connect(p); p.connect(master);
        carrier.start(t); mod.start(t); carrier.stop(t+0.6); mod.stop(t+0.6);
        setTimeout(() => { carrier.disconnect(); mod.disconnect(); modG.disconnect(); g.disconnect(); p.disconnect(); }, 700);
        this.registerTimeout(window.setTimeout(chirp, 500 + Math.random() * 1500));
    };
    chirp();
  }
}

// CELESTIAL DREAM: Re-engineered Glass Harp & Ambient Halo
export class CelestialGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const now = this.ctx.currentTime;
    const master = this.ctx.createGain(); 
    master.gain.value = 0.5; // Overall volume
    master.connect(this.destination); 
    this.registerNode(master);

    // 1. DELAY BUS (Stereo Ping Pong for the Bells)
    const dL = this.ctx.createDelay(); dL.delayTime.value = 0.4;
    const dR = this.ctx.createDelay(); dR.delayTime.value = 0.6;
    const fbL = this.ctx.createGain(); fbL.gain.value = 0.3;
    const fbR = this.ctx.createGain(); fbR.gain.value = 0.3;
    const dFilter = this.ctx.createBiquadFilter(); dFilter.frequency.value = 2000; // Dampen delay echoes
    
    // Wire Delay
    const delayInput = this.ctx.createGain();
    delayInput.connect(dL); delayInput.connect(dR);
    dL.connect(fbL); fbL.connect(dR); // Cross feedback
    dR.connect(fbR); fbR.connect(dL);
    dL.connect(dFilter); dR.connect(dFilter);
    dFilter.connect(master);

    this.registerNode(dL); this.registerNode(dR); this.registerNode(fbL); this.registerNode(fbR); 
    this.registerNode(dFilter); this.registerNode(delayInput);

    // 2. ATMOSPHERE HALO (Db Major 9 Pad)
    // Frequencies: Db3 (138.59), F3 (174.61), Ab3 (207.65), C4 (261.63), Eb4 (311.13)
    const padChords = [138.59, 174.61, 207.65, 261.63, 311.13]; 
    padChords.forEach((freq, i) => {
        const osc = this.ctx.createOscillator(); 
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = Math.random() * 10 - 5; // Detune for thickness

        const g = this.ctx.createGain(); 
        g.gain.value = 0; 
        
        // Slow breathing LFO
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.05 + (Math.random() * 0.05);
        const lfoG = this.ctx.createGain(); lfoG.gain.value = 0.03;
        const bias = this.ctx.createConstantSource(); bias.offset.value = 0.03; // Base volume

        lfo.connect(lfoG); lfoG.connect(g.gain); bias.connect(g.gain);
        
        const pan = this.ctx.createStereoPanner(); 
        pan.pan.value = (Math.random() * 1.5) - 0.75;

        osc.connect(g); g.connect(pan); pan.connect(master);
        
        osc.start(now); lfo.start(now); bias.start(now);
        this.registerNode(osc); this.registerNode(g); this.registerNode(lfo); 
        this.registerNode(lfoG); this.registerNode(bias); this.registerNode(pan);
    });

    // 3. GENERATIVE GLASS BELLS (FM Synthesis)
    // Scale: Db Lydian (Dreamy, magical)
    // Db, Eb, F, G, Ab, Bb, C
    const scale = [
        277.18, 311.13, 349.23, 392.00, 415.30, 466.16, 523.25, // Octave 4
        554.37, 622.25, 698.46, 783.99, 830.61, 932.33, 1046.50 // Octave 5
    ];

    const playBell = () => {
        if(!this.isRunning) return;
        const t = this.ctx.currentTime;
        const freq = scale[Math.floor(Math.random() * scale.length)];

        // FM Configuration for "Glass/Bell"
        // Modulator Ratio 1 : 3.5 creates inharmonic bell overtones
        const carrier = this.ctx.createOscillator(); 
        carrier.type = 'sine'; 
        carrier.frequency.value = freq;

        const modulator = this.ctx.createOscillator();
        modulator.type = 'sine';
        modulator.frequency.value = freq * 3.5; 

        const modIndex = this.ctx.createGain();
        // Envelope for Modulator (The "Strike")
        modIndex.gain.setValueAtTime(0, t);
        modIndex.gain.linearRampToValueAtTime(freq * 2, t + 0.01); 
        modIndex.gain.exponentialRampToValueAtTime(0.1, t + 0.4); // Quick decay for metallic hit
        
        modulator.connect(modIndex);
        modIndex.connect(carrier.frequency);

        // Carrier Envelope (The "Ring")
        const amp = this.ctx.createGain();
        amp.gain.setValueAtTime(0, t);
        amp.gain.linearRampToValueAtTime(0.15, t + 0.02);
        amp.gain.exponentialRampToValueAtTime(0.001, t + 4.0); // Long decay

        const pan = this.ctx.createStereoPanner();
        pan.pan.value = Math.random() * 1.6 - 0.8;

        // Connections
        carrier.connect(amp);
        amp.connect(pan);
        pan.connect(master);
        pan.connect(delayInput); // Send to delay

        // High Sparkle Layer (Subtle upper harmonic)
        const sparkle = this.ctx.createOscillator();
        sparkle.frequency.value = freq * 8;
        const sG = this.ctx.createGain();
        sG.gain.setValueAtTime(0, t);
        sG.gain.linearRampToValueAtTime(0.02, t + 0.01);
        sG.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        sparkle.connect(sG); sG.connect(pan);
        sparkle.start(t); sparkle.stop(t+1);

        carrier.start(t); modulator.start(t);
        carrier.stop(t + 4.1); modulator.stop(t + 4.1);

        // Cleanup
        setTimeout(() => { 
            carrier.disconnect(); modulator.disconnect(); modIndex.disconnect(); 
            amp.disconnect(); pan.disconnect(); sparkle.disconnect(); sG.disconnect();
        }, 4500);

        // Next note schedule (Irregular)
        this.registerTimeout(window.setTimeout(playBell, 500 + Math.random() * 3500));
    };

    // Start loop
    playBell();
  }
}

// LUNAR CRATER: Filtered Noise + Sub
export class LunarGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const master = this.ctx.createGain(); master.gain.value = 0.6;
    master.connect(this.destination); this.registerNode(master);

    const n = this.ctx.createBufferSource(); n.buffer = createNoise(this.ctx, 'pink'); n.loop = true;
    const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 150; f.Q.value = 2;
    
    // Wind howl
    const lfo = this.ctx.createOscillator(); lfo.frequency.value = 0.05;
    const lfoG = this.ctx.createGain(); lfoG.gain.value = 100;
    lfo.connect(lfoG); lfoG.connect(f.frequency);
    
    const g = this.ctx.createGain(); g.gain.value = 0.3;
    n.connect(f); f.connect(g); g.connect(master);
    n.start(); lfo.start();
    this.registerNode(n); this.registerNode(f); this.registerNode(lfo); this.registerNode(lfoG); this.registerNode(g);

    // Drone
    const sub = this.ctx.createOscillator(); sub.frequency.value = 40;
    const subG = this.ctx.createGain(); subG.gain.value = 0.1;
    sub.connect(subG); subG.connect(master); sub.start();
    this.registerNode(sub); this.registerNode(subG);
  }
}

// SOMATIC RELEASE: 174Hz Anchor
export class SomaticGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const master = this.ctx.createGain(); master.gain.value = 0.6;
    master.connect(this.destination); this.registerNode(master);

    // 174Hz Solfeggio / Anchor
    const osc = this.ctx.createOscillator(); osc.frequency.value = 174;
    const g = this.ctx.createGain(); g.gain.value = 0.15;
    osc.connect(g); g.connect(master); osc.start();
    this.registerNode(osc); this.registerNode(g);

    // Weighted Blanket (Brown Noise)
    const n = this.ctx.createBufferSource(); n.buffer = createNoise(this.ctx, 'brown'); n.loop = true;
    const f = this.ctx.createBiquadFilter(); f.frequency.value = 100;
    const ng = this.ctx.createGain(); ng.gain.value = 0.3;
    n.connect(f); f.connect(ng); ng.connect(master);
    n.start();
    this.registerNode(n); this.registerNode(f); this.registerNode(ng);
  }
}
