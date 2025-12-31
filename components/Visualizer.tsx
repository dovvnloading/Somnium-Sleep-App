
import React, { useRef, useEffect, useState } from 'react';
import { audioEngine } from '../services/audioEngine';

interface VisualizerProps {
  isPlaying: boolean;
  trackTitle: string;
  trackDescription: string;
  className?: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, trackTitle, trackDescription, className = "h-32" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 600, height: 120 });
  const rotationRef = useRef(0);
  
  // Smoothed data buffers for multiple bands
  const bassBufferRef = useRef<number[]>(new Array(40).fill(0));
  const midLeftBufferRef = useRef<number[]>(new Array(60).fill(0));
  const midRightBufferRef = useRef<number[]>(new Array(60).fill(0));
  const highBufferRef = useRef<number[]>(new Array(80).fill(0));

  // Handle Resize
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.scale(dpr, dpr);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    let analysers: { left: AnalyserNode, right: AnalyserNode } | null = null;
    const bufferSize = 4096;
    const dataArrayL = new Uint8Array(bufferSize / 2);
    const dataArrayR = new Uint8Array(bufferSize / 2);

    // Helpers
    const getPoint = (radius: number, angle: number, cx: number, cy: number) => ({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius
    });

    const smooth = (prev: number, curr: number, factor: number) => prev * factor + curr * (1 - factor);

    const drawRing = (
        data: number[], 
        radius: number, 
        center: {x: number, y: number}, 
        colorStops: [number, string][], 
        lineWidth: number, 
        amplitude: number,
        detailMultiplier: number,
        offsetPhase: number
    ) => {
        if (!data.length) return;
        
        ctx.beginPath();
        const totalPoints = data.length;
        const angleStep = (Math.PI * 2) / totalPoints;

        // Draw spline through points
        const points = data.map((val, i) => {
            const angle = (i * angleStep) + offsetPhase;
            const r = radius + (val * amplitude * detailMultiplier); 
            return getPoint(r, angle, center.x, center.y);
        });

        // Close loop smoothing
        for (let i = 0; i < points.length; i++) {
            const p0 = points[i];
            const p1 = points[(i + 1) % points.length];
            const mx = (p0.x + p1.x) / 2;
            const my = (p0.y + p1.y) / 2;
            if (i === 0) ctx.moveTo(mx, my);
            else ctx.quadraticCurveTo(p0.x, p0.y, mx, my);
        }
        // Close the curve
        const pLast = points[0];
        const pFirst = points[1]; // approximate logic for closed loop quadratic
        const mx = (points[points.length-1].x + points[0].x) / 2;
        const my = (points[points.length-1].y + points[0].y) / 2;
        ctx.quadraticCurveTo(points[points.length-1].x, points[points.length-1].y, mx, my);
        
        ctx.closePath();

        const grad = ctx.createRadialGradient(center.x, center.y, radius * 0.5, center.x, center.y, radius * 1.5);
        colorStops.forEach(([pos, col]) => grad.addColorStop(pos, col));
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2;
      const baseRadius = Math.min(dimensions.width, dimensions.height) * 0.35;
      
      // Global Rotation
      rotationRef.current += 0.0015;

      if (!isPlaying) {
        // IDLE STATE: Breathing Geometry
        const time = Date.now() / 2500;
        
        // Inner Ring
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * 0.8 + Math.sin(time) * 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Rotating Outer Ring
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * 1.1, 0, Math.PI * 1.5);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

      } else {
        // ACTIVE STATE: SOTA VIZ
        if (!analysers) analysers = audioEngine.getAnalysers();

        if (analysers) {
           analysers.left.getByteFrequencyData(dataArrayL);
           analysers.right.getByteFrequencyData(dataArrayR);

           // 1. Process Data into Bands
           
           // BASS (Mono Sum 20-150Hz approx) - Indices 0 to 10 approx in 4096 FFT
           // Taking average of first few bins
           let bassSum = 0;
           for(let i=1; i<12; i++) bassSum += (dataArrayL[i] + dataArrayR[i]); 
           const bassAvg = (bassSum / 22) / 255; // 0-1 normalized
           
           // Update Bass Buffer (Circular smoothness)
           bassBufferRef.current = bassBufferRef.current.map((prev, i) => {
               // Create a wave pattern
               const noise = (Math.random() - 0.5) * 0.1;
               const target = bassAvg + noise;
               return smooth(prev, target, 0.9);
           });

           // MIDS (Stereo Split) - Indices 20 to 200
           // Map to buffer size
           const midLBuffer = midLeftBufferRef.current;
           const midRBuffer = midRightBufferRef.current;
           
           for(let i=0; i<midLBuffer.length; i++) {
               const freqIdx = 20 + Math.floor(i * 3); 
               const valL = dataArrayL[freqIdx] / 255;
               const valR = dataArrayR[freqIdx] / 255;
               midLBuffer[i] = smooth(midLBuffer[i], valL, 0.85);
               midRBuffer[i] = smooth(midRBuffer[i], valR, 0.85);
           }

           // HIGHS (Stereo Sum) - Indices 300+
           const highBuffer = highBufferRef.current;
           for(let i=0; i<highBuffer.length; i++) {
               const freqIdx = 300 + Math.floor(i * 10);
               const val = Math.max(dataArrayL[freqIdx], dataArrayR[freqIdx]) / 255;
               highBuffer[i] = smooth(highBuffer[i], val, 0.88);
           }

           // 2. Draw Layers

           ctx.save();
           ctx.translate(cx, cy);
           ctx.rotate(rotationRef.current);
           ctx.translate(-cx, -cy);

           // LAYER 1: Deep Bass Core (Solid, glowing)
           // Normalized glow based on bass volume
           const bassGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.2);
           bassGlow.addColorStop(0, `rgba(99, 102, 241, ${0.1 + bassAvg * 0.2})`); // Indigo
           bassGlow.addColorStop(0.5, 'rgba(0,0,0,0)');
           ctx.fillStyle = bassGlow;
           ctx.beginPath();
           ctx.arc(cx, cy, baseRadius * 1.5, 0, Math.PI*2);
           ctx.fill();

           // Draw Bass Ring (Stable, heavy)
           drawRing(
               bassBufferRef.current, 
               baseRadius * 0.6, 
               {x: cx, y: cy}, 
               [[0, 'rgba(165, 180, 252, 0.2)'], [1, 'rgba(165, 180, 252, 0.0)']], 
               2, 
               40, 
               1, 
               0
           );

           // LAYER 2: Stereo Mids (Interlocking Rings)
           // Left Channel Ring
           drawRing(
               midLeftBufferRef.current,
               baseRadius * 0.9,
               {x: cx, y: cy},
               [[0, 'rgba(192, 132, 252, 0.5)'], [1, 'rgba(255, 255, 255, 0.1)']], // Purple/White
               1.5,
               60,
               1,
               rotationRef.current * 2 // Counter rotate phase
           );

           // Right Channel Ring
           drawRing(
               midRightBufferRef.current,
               baseRadius * 0.9,
               {x: cx, y: cy},
               [[0, 'rgba(96, 165, 250, 0.5)'], [1, 'rgba(255, 255, 255, 0.1)']], // Blue/White
               1.5,
               60,
               -1, // Invert waveform for symmetry
               rotationRef.current * -2 + Math.PI // Phase offset
           );

           // LAYER 3: Highs (Outer Halo)
           drawRing(
               highBufferRef.current,
               baseRadius * 1.25,
               {x: cx, y: cy},
               [[0, 'rgba(255, 255, 255, 0.1)'], [1, 'rgba(255, 255, 255, 0.0)']],
               0.5,
               30,
               1,
               Math.PI / 2
           );

           ctx.restore();

           // Center Glow Pulse
           const centerPulse = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.3);
           centerPulse.addColorStop(0, `rgba(255, 255, 255, ${bassAvg * 0.3})`);
           centerPulse.addColorStop(1, 'rgba(255, 255, 255, 0)');
           ctx.fillStyle = centerPulse;
           ctx.beginPath();
           ctx.arc(cx, cy, baseRadius, 0, Math.PI*2);
           ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, dimensions]);

  return (
    <div ref={containerRef} className={`w-full relative overflow-hidden rounded-xl ${className}`}>
        <canvas 
            ref={canvasRef}
            style={{ width: '100%', height: '100%' }}
            className="absolute inset-0 z-0"
        />
        
        {/* Text Overlay - Premium Center Stage Layout */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none p-4 mix-blend-plus-lighter w-full">
            <div className={`w-full transition-all duration-1000 transform flex flex-col items-center ${isPlaying ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-50 translate-y-4'}`}>
                
                {/* Title */}
                <h2 className="text-3xl md:text-5xl font-thin text-white tracking-[0.2em] text-center mb-6 drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                    {trackTitle}
                </h2>
                
                {/* Marquee Description Container */}
                <div className="w-full max-w-2xl relative h-10 overflow-hidden mask-linear-fade flex items-center justify-center">
                    <div className="absolute flex items-center animate-marquee">
                        {/* Duplicate content for seamless infinite scroll - translating -50% requires 2 sets of equal length */}
                        <div className="flex shrink-0">
                           <span className="text-zinc-400 text-xs md:text-sm font-light uppercase tracking-[0.2em] px-12 whitespace-nowrap">
                              {trackDescription}
                           </span>
                        </div>
                        <div className="flex shrink-0">
                           <span className="text-zinc-400 text-xs md:text-sm font-light uppercase tracking-[0.2em] px-12 whitespace-nowrap">
                              {trackDescription}
                           </span>
                        </div>
                         <div className="flex shrink-0">
                           <span className="text-zinc-400 text-xs md:text-sm font-light uppercase tracking-[0.2em] px-12 whitespace-nowrap">
                              {trackDescription}
                           </span>
                        </div>
                         <div className="flex shrink-0">
                           <span className="text-zinc-400 text-xs md:text-sm font-light uppercase tracking-[0.2em] px-12 whitespace-nowrap">
                              {trackDescription}
                           </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default Visualizer;
