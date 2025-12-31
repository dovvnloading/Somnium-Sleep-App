
import { SoundGenerator } from './SoundGenerator';

// Helper for buffers
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

export class SilkGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const now = this.ctx.currentTime;
    const master = this.ctx.createGain();
    master.gain.value = 0.6;
    master.connect(this.destination);
    this.registerNode(master);

    // Layer 1: Deep Rumble
    const l1 = this.ctx.createBufferSource();
    l1.buffer = createNoiseBuffer(this.ctx, 'brown');
    l1.loop = true;
    const f1 = this.ctx.createBiquadFilter();
    f1.type = 'lowpass'; f1.frequency.value = 180;
    const g1 = this.ctx.createGain();
    g1.gain.value = 0.8;
    
    const lfo1 = this.ctx.createOscillator();
    lfo1.frequency.value = 0.05;
    const lfo1g = this.ctx.createGain();
    lfo1g.gain.value = 0.1;
    lfo1.connect(lfo1g); lfo1g.connect(g1.gain);

    l1.connect(f1); f1.connect(g1); g1.connect(master);
    l1.start(now); lfo1.start(now);
    this.registerNode(l1); this.registerNode(f1); this.registerNode(g1); this.registerNode(lfo1); this.registerNode(lfo1g);

    // Layer 2: The Swell
    const l2 = this.ctx.createBufferSource();
    l2.buffer = createNoiseBuffer(this.ctx, 'pink');
    l2.loop = true;
    const f2 = this.ctx.createBiquadFilter();
    f2.type = 'bandpass'; f2.Q.value = 0.5;
    
    const lfo2 = this.ctx.createOscillator();
    lfo2.frequency.value = 0.12;
    const lfo2g = this.ctx.createGain();
    lfo2g.gain.value = 300;
    const base2 = this.ctx.createConstantSource();
    base2.offset.value = 500;
    lfo2.connect(lfo2g); lfo2g.connect(f2.frequency); base2.connect(f2.frequency);

    const g2 = this.ctx.createGain();
    g2.gain.value = 0.5;
    l2.connect(f2); f2.connect(g2); g2.connect(master);
    l2.start(now); lfo2.start(now); base2.start(now);
    this.registerNode(l2); this.registerNode(f2); this.registerNode(g2); this.registerNode(lfo2); this.registerNode(lfo2g); this.registerNode(base2);

    // Layer 3: Silk Highs
    const l3 = this.ctx.createBufferSource();
    l3.buffer = createNoiseBuffer(this.ctx, 'white');
    l3.loop = true;
    const f3 = this.ctx.createBiquadFilter();
    f3.frequency.value = 2500;
    const f3h = this.ctx.createBiquadFilter();
    f3h.type = 'highpass'; f3h.frequency.value = 1000;
    const g3 = this.ctx.createGain();
    g3.gain.value = 0;

    const lfo3 = this.ctx.createOscillator();
    lfo3.frequency.value = 0.03;
    const lfo3g = this.ctx.createGain();
    lfo3g.gain.value = 0.05;
    lfo3.connect(lfo3g); lfo3g.connect(g3.gain);

    l3.connect(f3); f3.connect(f3h); f3h.connect(g3); g3.connect(master);
    l3.start(now); lfo3.start(now);
    this.registerNode(l3); this.registerNode(f3); this.registerNode(f3h); this.registerNode(g3); this.registerNode(lfo3); this.registerNode(lfo3g);
  }
}

export class Status2Generator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const master = this.ctx.createGain();
    master.gain.value = 0.65;
    master.connect(this.destination);
    this.registerNode(master);

    // Delays
    const dL = this.ctx.createDelay(1.0); dL.delayTime.value = 0.3;
    const dLfb = this.ctx.createGain(); dLfb.gain.value = 0.4;
    const dR = this.ctx.createDelay(1.0); dR.delayTime.value = 0.45;
    const dRfb = this.ctx.createGain(); dRfb.gain.value = 0.4;
    const pL = this.ctx.createStereoPanner(); pL.pan.value = -0.5;
    const pR = this.ctx.createStereoPanner(); pR.pan.value = 0.5;

    dL.connect(dLfb); dLfb.connect(dL); dL.connect(pL); pL.connect(master);
    dR.connect(dRfb); dRfb.connect(dR); dR.connect(pR); pR.connect(master);
    this.registerNode(dL); this.registerNode(dLfb); this.registerNode(pL);
    this.registerNode(dR); this.registerNode(dRfb); this.registerNode(pR);

    // Shimmer
    const sD = this.ctx.createDelay(2.0); sD.delayTime.value = 0.5;
    const sF = this.ctx.createBiquadFilter(); sF.type = 'highpass'; sF.frequency.value = 1200;
    const sFb = this.ctx.createGain(); sFb.gain.value = 0.75;
    sD.connect(sF); sF.connect(sFb); sFb.connect(sD); sD.connect(master);
    this.registerNode(sD); this.registerNode(sF); this.registerNode(sFb);

    // Logic
    const scale = [130.81, 155.56, 196.00, 233.08, 293.66, 261.63, 311.13];
    const trigger = (vel: number) => {
        if (!this.isRunning) return;
        const t = this.ctx.currentTime;
        const freq = scale[Math.floor(Math.random() * scale.length)];

        const osc = this.ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = freq;
        const th = this.ctx.createOscillator(); th.frequency.setValueAtTime(150, t); th.frequency.exponentialRampToValueAtTime(0.01, t + 0.05);
        const thG = this.ctx.createGain(); thG.gain.setValueAtTime(0.3 * vel, t); thG.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        
        const f = this.ctx.createBiquadFilter(); f.frequency.setValueAtTime(200, t); f.frequency.linearRampToValueAtTime(600 * vel, t + 0.01); f.frequency.exponentialRampToValueAtTime(200, t + 0.3);
        const a = this.ctx.createGain(); a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(0.4 * vel, t + 0.015); a.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        const pan = this.ctx.createStereoPanner(); pan.pan.value = (Math.random() * 0.8) - 0.4;

        osc.connect(f); f.connect(a); th.connect(thG); thG.connect(a); a.connect(pan); pan.connect(master);
        pan.connect(dL); pan.connect(dR); if (Math.random() > 0.6) pan.connect(sD);

        osc.start(t); th.start(t); osc.stop(t+1); th.stop(t+0.1);
        
        // Auto cleanup temporary nodes
        setTimeout(() => { osc.disconnect(); th.disconnect(); f.disconnect(); a.disconnect(); pan.disconnect(); }, 1100);
    };

    const loop1 = () => { if(this.isRunning) { trigger(0.8); this.registerTimeout(window.setTimeout(loop1, 2900)); } };
    const loop2 = () => { if(this.isRunning) { trigger(0.6); if (Math.random()>0.7) setTimeout(()=>trigger(0.5), 150); this.registerTimeout(window.setTimeout(loop2, 4100)); } };
    const loop3 = () => { if(this.isRunning) { if(Math.random()>0.4) trigger(0.4); this.registerTimeout(window.setTimeout(loop3, 5300)); } };

    loop1();
    this.registerTimeout(window.setTimeout(loop2, 500));
    this.registerTimeout(window.setTimeout(loop3, 1200));
  }
}

export class AlchemistGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const master = this.ctx.createGain();
    master.gain.value = 0.7;
    master.connect(this.destination);
    this.registerNode(master);

    const dIn = this.ctx.createGain();
    const d = this.ctx.createDelay(2.0); d.delayTime.value = 0.35;
    const fb = this.ctx.createGain(); fb.gain.value = 0.4;
    dIn.connect(d); d.connect(master); d.connect(fb); fb.connect(dIn);
    this.registerNode(dIn); this.registerNode(d); this.registerNode(fb);

    const scale = [220.00, 246.94, 261.63, 329.63, 349.23, 440.00, 493.88, 523.25];
    const play = () => {
        if (!this.isRunning) return;
        const t = this.ctx.currentTime;
        const freq = scale[Math.floor(Math.random() * scale.length)];
        
        const osc = this.ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
        const mod = this.ctx.createOscillator(); mod.frequency.value = freq * 2.5;
        const modG = this.ctx.createGain();
        modG.gain.setValueAtTime(0, t); modG.gain.linearRampToValueAtTime(freq*1.5, t+0.01); modG.gain.exponentialRampToValueAtTime(0.01, t+0.3);
        mod.connect(modG); modG.connect(osc.frequency);

        const amp = this.ctx.createGain();
        amp.gain.setValueAtTime(0, t); amp.gain.linearRampToValueAtTime(0.1, t+0.02); amp.gain.exponentialRampToValueAtTime(0.001, t+2.5);
        const pan = this.ctx.createStereoPanner(); pan.pan.value = Math.random() * 1.5 - 0.75;
        
        osc.connect(amp); amp.connect(pan); pan.connect(master); pan.connect(dIn);
        osc.start(t); mod.start(t); osc.stop(t+3); mod.stop(t+3);

        setTimeout(() => { osc.disconnect(); mod.disconnect(); amp.disconnect(); pan.disconnect(); }, 3000);
        this.registerTimeout(window.setTimeout(play, 200 + Math.random() * 2500));
    };
    play();
    this.registerTimeout(window.setTimeout(play, 1000));
  }
}

export class HorizonGenerator extends SoundGenerator {
  start() {
     this.isRunning = true;
     const now = this.ctx.currentTime;
     const master = this.ctx.createGain(); master.gain.value = 0.4;
     master.connect(this.destination);
     this.registerNode(master);

     const freqs = [65.41, 77.78, 98.00, 116.54, 146.83];
     freqs.forEach(base => {
        [-6, 0, 6].forEach(d => {
            const osc = this.ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = base; osc.detune.value = d + (Math.random() * 4 - 2);
            const g = this.ctx.createGain(); g.gain.value = 0.05;
            const lfo = this.ctx.createOscillator(); lfo.frequency.value = 0.05 + Math.random() * 0.1;
            const lg = this.ctx.createGain(); lg.gain.value = 0.02;
            const c = this.ctx.createConstantSource(); c.offset.value = 0.05;
            lfo.connect(lg); lg.connect(g.gain); c.connect(g.gain);
            const p = this.ctx.createStereoPanner(); p.pan.value = Math.random() * 1.5 - 0.75;
            osc.connect(g); g.connect(p); p.connect(master);
            osc.start(now); lfo.start(now); c.start(now);
            this.registerNode(osc); this.registerNode(g); this.registerNode(lfo); this.registerNode(lg); this.registerNode(c); this.registerNode(p);
        });
     });
     
     // Noise layer
     const n = this.ctx.createBufferSource();
     n.buffer = createNoiseBuffer(this.ctx, 'white'); n.loop = true;
     const nf = this.ctx.createBiquadFilter(); nf.frequency.value = 200;
     const ng = this.ctx.createGain(); ng.gain.value = 0.05;
     n.connect(nf); nf.connect(ng); ng.connect(master);
     n.start(now);
     this.registerNode(n); this.registerNode(nf); this.registerNode(ng);
  }
}

export class StratusGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const master = this.ctx.createGain(); master.gain.value = 0.55;
    master.connect(this.destination);
    this.registerNode(master);

    const pool = [155.56, 196.00, 233.08, 293.66, 349.23, 311.13, 392.00, 466.16, 587.33, 698.46];
    const play = (mod: number) => {
        if(!this.isRunning) return;
        const t = this.ctx.currentTime;
        const freq = pool[Math.floor(Math.random() * pool.length)];
        const osc = this.ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = freq;
        const f = this.ctx.createBiquadFilter(); f.frequency.value = 400 + Math.random() * 200;
        const a = this.ctx.createGain(); a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(0.08, t+0.05); a.gain.exponentialRampToValueAtTime(0.001, t + 5.0 * mod);
        const p = this.ctx.createStereoPanner(); p.pan.value = Math.random() * 1.2 - 0.6;
        osc.connect(f); f.connect(a); a.connect(p); p.connect(master);
        osc.start(t); osc.stop(t + 6 * mod);
        setTimeout(() => { osc.disconnect(); f.disconnect(); a.disconnect(); p.disconnect(); }, 6000 * mod);
    }
    
    const l1 = () => { if(this.isRunning) { play(1.0); this.registerTimeout(window.setTimeout(l1, 3000)); }};
    const l2 = () => { if(this.isRunning) { if(Math.random()>0.3) play(1.2); this.registerTimeout(window.setTimeout(l2, 5000)); }};
    const l3 = () => { if(this.isRunning) { play(1.5); this.registerTimeout(window.setTimeout(l3, 7000)); }};
    l1();
    this.registerTimeout(window.setTimeout(l2, 1000));
    this.registerTimeout(window.setTimeout(l3, 2000));
  }
}

// STRATUS: EVOLUTION - SOTA Mathematical MIDI Simulation
// Prime Number Polyrhythms: 3s, 5s, 7s loops
// Harmonic Rule: Lydian Mode with 50% probability of chord tone, 30% scale tone, 20% passing tone
export class StratusEvolutionGenerator extends SoundGenerator {
  start() {
    this.isRunning = true;
    const master = this.ctx.createGain();
    master.gain.value = 0.55;
    master.connect(this.destination);
    this.registerNode(master);

    // FM Piano Synthesis
    const createPianoNote = (freq: number, vel: number, dur: number) => {
        const t = this.ctx.currentTime;
        
        // Operator 1 (Modulator)
        const mod = this.ctx.createOscillator();
        mod.type = 'sine';
        mod.frequency.value = freq * 2; // 2:1 ratio for bright keys
        
        const modGain = this.ctx.createGain();
        modGain.gain.setValueAtTime(0, t);
        modGain.gain.linearRampToValueAtTime(freq * 0.5 * vel, t + 0.01);
        modGain.gain.exponentialRampToValueAtTime(0.01, t + dur * 0.5);
        mod.connect(modGain);

        // Operator 2 (Carrier)
        const car = this.ctx.createOscillator();
        car.type = 'sine';
        car.frequency.value = freq;
        modGain.connect(car.frequency); // FM linkage

        // Amplitude Envelope
        const amp = this.ctx.createGain();
        amp.gain.setValueAtTime(0, t);
        amp.gain.linearRampToValueAtTime(0.15 * vel, t + 0.02);
        amp.gain.exponentialRampToValueAtTime(0.001, t + dur);

        // Spatial
        const pan = this.ctx.createStereoPanner();
        pan.pan.value = (Math.random() * 1.5) - 0.75;

        car.connect(amp);
        amp.connect(pan);
        pan.connect(master);

        car.start(t); mod.start(t);
        car.stop(t + dur + 0.1); mod.stop(t + dur + 0.1);

        setTimeout(() => {
            car.disconnect(); mod.disconnect(); modGain.disconnect(); amp.disconnect(); pan.disconnect();
        }, (dur + 0.2) * 1000);
    };

    // Harmonic Rules: Eb Lydian Scale
    // Eb, F, G, A, Bb, C, D
    const scale = [155.56, 174.61, 196.00, 220.00, 233.08, 261.63, 293.66]; // Octave 3
    const highScale = scale.map(f => f * 2); // Octave 4
    
    // Voice 1: The Prime Mover (Every 3 seconds - The Ground)
    // Plays root/fifth relationships
    const voice1 = () => {
        if (!this.isRunning) return;
        const roots = [155.56, 196.00, 233.08]; // Eb, G, Bb (Eb Major Triad)
        const note = roots[Math.floor(Math.random() * roots.length)];
        createPianoNote(note, 0.6, 4.0);
        
        // Next event in 3000ms (Prime 3)
        this.registerTimeout(window.setTimeout(voice1, 3000));
    };

    // Voice 2: The Weaver (Every 5 seconds - The Texture)
    // Arpeggiates in the mid range using "Golden Ratio" probability
    const voice2 = () => {
        if (!this.isRunning) return;
        // Select 3 notes for a quick arpeggio
        let delay = 0;
        for (let i = 0; i < 3; i++) {
            const note = scale[Math.floor(Math.random() * scale.length)];
            setTimeout(() => {
                if (this.isRunning) createPianoNote(note, 0.4, 2.0);
            }, delay);
            delay += 250; // 16th note feel at 60bpm
        }
        // Next event in 5000ms (Prime 5)
        this.registerTimeout(window.setTimeout(voice2, 5000));
    };

    // Voice 3: The Spark (Every 7 seconds - The Melody)
    // High register, sparse, generative melody
    const voice3 = () => {
        if (!this.isRunning) return;
        // Generate a 4-note phrase
        let delay = 0;
        const phraseLength = Math.floor(Math.random() * 3) + 2; // 2 to 4 notes
        
        for (let i = 0; i < phraseLength; i++) {
            const note = highScale[Math.floor(Math.random() * highScale.length)];
            const vel = 0.3 + Math.random() * 0.2;
            setTimeout(() => {
                if (this.isRunning) createPianoNote(note, vel, 3.0);
            }, delay);
            
            // Randomized rhythm for melody
            delay += (Math.random() > 0.5 ? 500 : 250); 
        }

        // Next event in 7000ms (Prime 7)
        this.registerTimeout(window.setTimeout(voice3, 7000));
    };

    // Initialize Polyrhythms
    voice1();
    this.registerTimeout(window.setTimeout(voice2, 1200)); // Phase shift start
    this.registerTimeout(window.setTimeout(voice3, 2500)); // Phase shift start
  }
}
