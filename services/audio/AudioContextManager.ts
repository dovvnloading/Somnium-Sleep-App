
export class AudioContextManager {
  public ctx: AudioContext | null = null;
  
  // Graph Entry/Exit
  public inputNode: GainNode | null = null; // Generators connect here
  public masterGain: GainNode | null = null;
  
  // Stereo Analysis
  public analyserL: AnalyserNode | null = null;
  public analyserR: AnalyserNode | null = null;
  private splitter: ChannelSplitterNode | null = null;
  private merger: ChannelMergerNode | null = null;
  
  // Mastering Chain
  private safeLowCut: BiquadFilterNode | null = null;
  private safeHighCut: BiquadFilterNode | null = null;
  private filterNode: BiquadFilterNode | null = null; // Tone control
  private pannerNode: StereoPannerNode | null = null;
  private fadeGainNode: GainNode | null = null;
  
  // Safety / Dynamics
  private softClipNode: WaveShaperNode | null = null;
  private limiterNode: DynamicsCompressorNode | null = null;
  private hardClipNode: WaveShaperNode | null = null;
  private masterSafeGain: GainNode | null = null;
  
  // Global Effects
  public reverbNode: ConvolverNode | null = null;
  public reverbGain: GainNode | null = null;
  
  // Autopan
  private autoPanOsc: OscillatorNode | null = null;
  private autoPanGain: GainNode | null = null;

  private reverbBuffer: AudioBuffer | null = null;
  private safeModeEnabled: boolean = true;

  // State Cache (Ensures settings persist across init)
  private currentVol: number = 0.6;
  private currentTone: number = 50;
  private currentPan: number = 0;
  private isAutopanActive: boolean = false;
  private currentAutopanSpeed: number = 0.5;

  constructor() {}

  public init() {
    if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
    }

    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioCtor({ latencyHint: 'playback' });

    // Initialize Nodes
    this.inputNode = this.ctx.createGain(); // Bus entry
    this.fadeGainNode = this.ctx.createGain();
    this.fadeGainNode.gain.value = 0; // Start silent for smooth fade-in

    this.filterNode = this.ctx.createBiquadFilter(); // Tone
    this.pannerNode = this.ctx.createStereoPanner();
    this.masterGain = this.ctx.createGain();

    // Stereo Analysis Chain
    this.splitter = this.ctx.createChannelSplitter(2);
    this.merger = this.ctx.createChannelMerger(2);
    this.analyserL = this.ctx.createAnalyser();
    this.analyserR = this.ctx.createAnalyser();

    // Mastering Chain Init
    this.safeLowCut = this.ctx.createBiquadFilter();
    this.safeHighCut = this.ctx.createBiquadFilter();
    this.softClipNode = this.ctx.createWaveShaper();
    this.limiterNode = this.ctx.createDynamicsCompressor();
    this.hardClipNode = this.ctx.createWaveShaper();
    this.masterSafeGain = this.ctx.createGain();

    // Configure Nodes
    this.filterNode.type = 'lowpass';
    this.filterNode.Q.value = 0.5;
    
    // Apply Cached Tone Immediately (No ramp on init)
    const minFreq = 200;
    const maxFreq = 22000;
    const frequency = minFreq * Math.pow(maxFreq / minFreq, this.currentTone / 100);
    this.filterNode.frequency.value = frequency;

    this.safeLowCut.type = 'highpass';
    this.safeLowCut.frequency.value = 45;
    
    this.safeHighCut.type = 'lowpass';
    this.safeHighCut.frequency.value = 16000;

    this.softClipNode.curve = this.makeSoftClipCurve();
    this.softClipNode.oversample = '4x';

    this.limiterNode.threshold.value = -2.0;
    this.limiterNode.ratio.value = 20.0;
    this.limiterNode.attack.value = 0.003;
    this.limiterNode.release.value = 0.25;

    this.hardClipNode.curve = this.makeHardClipCurve();
    this.hardClipNode.oversample = 'none';

    // Apply Cached Volume & Pan Immediately
    this.masterGain.gain.value = this.currentVol;
    this.pannerNode.pan.value = this.currentPan;

    // Analysis Config (High Res)
    this.analyserL.fftSize = 4096;
    this.analyserL.smoothingTimeConstant = 0.92;
    this.analyserR.fftSize = 4096;
    this.analyserR.smoothingTimeConstant = 0.92;

    // Reverb
    this.reverbNode = this.ctx.createConvolver();
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.6;
    if (!this.reverbBuffer) {
        this.reverbBuffer = this.createImpulseResponse(5.0, 2.0);
    }
    this.reverbNode.buffer = this.reverbBuffer;

    // --- ROUTING ---
    
    // 1. Input -> Filter (Spectral Tilt)
    this.inputNode.connect(this.filterNode);

    // 2. Filter -> Reverb Chain (Wet)
    this.filterNode.connect(this.reverbNode);
    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.fadeGainNode);
    
    // 3. Filter -> Direct Output (Dry)
    this.filterNode.connect(this.fadeGainNode);

    // Main Chain
    this.fadeGainNode.connect(this.masterGain);
    this.masterGain.connect(this.pannerNode);

    // Stereo Split for Analysis
    this.pannerNode.connect(this.splitter);
    this.splitter.connect(this.analyserL, 0);
    this.splitter.connect(this.analyserR, 1);
    
    // Merge back for output
    this.analyserL.connect(this.merger, 0, 0);
    this.analyserR.connect(this.merger, 0, 1);

    // Apply Cached Autopan
    if (this.isAutopanActive) {
        this.toggleAutopan(true, this.currentAutopanSpeed);
    }

    // Routing from Merger to Destination/SafeMode
    this.updateOutputRouting();
  }

  public getContext(): AudioContext {
      if (!this.ctx) this.init();
      return this.ctx!;
  }

  public getInput(): AudioNode {
      if (!this.inputNode) this.init();
      return this.inputNode!;
  }

  public getAnalysers() {
      if (!this.analyserL || !this.analyserR) this.init();
      return { left: this.analyserL!, right: this.analyserR! };
  }

  public setVolume(val: number) {
      this.currentVol = val; // Cache state
      if (this.masterGain && this.ctx) {
          this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
      }
  }

  public setTone(val: number) {
    this.currentTone = val; // Cache state
    if (this.filterNode && this.ctx) {
        const minFreq = 200;
        const maxFreq = 22000;
        const frequency = minFreq * Math.pow(maxFreq / minFreq, val / 100);
        this.filterNode.frequency.setTargetAtTime(frequency, this.ctx.currentTime, 0.1);
    }
  }

  public setPan(val: number) {
    this.currentPan = val; // Cache state
    if (this.pannerNode && this.ctx) {
        this.pannerNode.pan.setTargetAtTime(val, this.ctx.currentTime, 0.1);
    }
  }

  public toggleAutopan(enable: boolean, speed: number = 0.5) {
    this.isAutopanActive = enable;
    this.currentAutopanSpeed = speed;

    if (!this.ctx || !this.pannerNode) return;

    if (enable && !this.autoPanOsc) {
        this.autoPanOsc = this.ctx.createOscillator();
        this.autoPanOsc.type = 'sine';
        this.autoPanOsc.frequency.value = speed; // Fixed: Use cached speed
        
        this.autoPanGain = this.ctx.createGain();
        this.autoPanGain.gain.value = 1; 
        
        this.autoPanOsc.connect(this.autoPanGain);
        this.autoPanGain.connect(this.pannerNode.pan);
        this.autoPanOsc.start();
    } else if (!enable && this.autoPanOsc) {
        try { this.autoPanOsc.stop(); this.autoPanOsc.disconnect(); } catch(e){}
        try { this.autoPanGain?.disconnect(); } catch(e){}
        this.autoPanOsc = null;
        this.autoPanGain = null;
        this.pannerNode.pan.cancelScheduledValues(this.ctx.currentTime);
        this.pannerNode.pan.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public toggleSafeMode(enable: boolean) {
      this.safeModeEnabled = enable;
      this.updateOutputRouting();
  }

  public fadeOut(duration: number, callback: () => void) {
      if (this.fadeGainNode && this.ctx) {
          const t = this.ctx.currentTime;
          this.fadeGainNode.gain.cancelScheduledValues(t);
          this.fadeGainNode.gain.setValueAtTime(this.fadeGainNode.gain.value, t);
          this.fadeGainNode.gain.linearRampToValueAtTime(0, t + duration);
          setTimeout(callback, duration * 1000);
      } else {
          callback();
      }
  }

  public fadeIn(duration: number) {
      if (this.fadeGainNode && this.ctx) {
          const t = this.ctx.currentTime;
          this.fadeGainNode.gain.cancelScheduledValues(t);
          this.fadeGainNode.gain.setValueAtTime(0, t);
          this.fadeGainNode.gain.linearRampToValueAtTime(0.01, t + 0.1);
          this.fadeGainNode.gain.exponentialRampToValueAtTime(1, t + duration);
      }
  }

  private updateOutputRouting() {
    if (!this.ctx || !this.merger || !this.limiterNode || !this.masterSafeGain) return;
    
    // Disconnect outputs
    try { this.merger.disconnect(); } catch(e) {}
    try { this.safeLowCut?.disconnect(); } catch(e) {}
    try { this.safeHighCut?.disconnect(); } catch(e) {}
    try { this.softClipNode?.disconnect(); } catch(e) {}
    try { this.limiterNode?.disconnect(); } catch(e) {}
    try { this.hardClipNode?.disconnect(); } catch(e) {}
    try { this.masterSafeGain.disconnect(); } catch(e) {}

    if (this.safeModeEnabled && this.safeLowCut) {
        this.merger.connect(this.safeLowCut);
        this.safeLowCut.connect(this.safeHighCut!);
        this.safeHighCut!.connect(this.softClipNode!);
        this.softClipNode!.connect(this.limiterNode);
        this.limiterNode.connect(this.hardClipNode!);
        this.hardClipNode!.connect(this.masterSafeGain);
        this.masterSafeGain.connect(this.ctx.destination);
    } else {
        this.merger.connect(this.ctx.destination);
    }
  }

  private makeSoftClipCurve(): Float32Array {
    const n_samples = 65536;
    const curve = new Float32Array(n_samples);
    for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = Math.tanh(x); 
    }
    return curve;
  }

  private makeHardClipCurve(): Float32Array {
    const n_samples = 65536;
    const curve = new Float32Array(n_samples);
    const limit = 0.99;
    for (let i = 0; i < n_samples; i++) {
      const x = (i * 2) / n_samples - 1;
      if (x > limit) curve[i] = limit;
      else if (x < -limit) curve[i] = -limit;
      else curve[i] = x;
    }
    return curve;
  }

  private createImpulseResponse(duration: number, decay: number): AudioBuffer {
    const rate = this.ctx!.sampleRate;
    const length = rate * duration;
    const impulse = this.ctx!.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i; 
      const e = Math.pow(1 - n / length, decay);
      left[i] = (Math.random() * 2 - 1) * e;
      right[i] = (Math.random() * 2 - 1) * e;
    }

    return impulse;
  }
}

export const audioContextManager = new AudioContextManager();
