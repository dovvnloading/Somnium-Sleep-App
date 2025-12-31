
import React, { useState, useEffect } from 'react';
import { Play, Square, Volume2, Activity, Star, ShieldAlert, Sliders, Clock, Plus, Info, LayoutGrid, Eye } from 'lucide-react';
import GlassCard from './components/GlassCard';
import ControlSlider from './components/ControlSlider';
import Visualizer from './components/Visualizer';
import InfoModal from './components/InfoModal';
import SleepPuzzle from './components/ConstellationMode';
import { audioEngine } from './services/audioEngine';
import { AudioState, NoiseType, Preset } from './types';
import { NOISE_INFO } from './data/noiseData';
import { PRESETS } from './presets';

const App: React.FC = () => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('somnium_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [viewMode, setViewMode] = useState<'dashboard' | 'puzzle'>('dashboard');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Default to Ethereal Ambience for a lush first impression
  const [activeInfo, setActiveInfo] = useState<{title: string, description: string}>(
    NOISE_INFO[NoiseType.ETHEREAL]
  );

  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    volume: 0.6,
    tone: 50,
    pan: 0,
    isAutopan: true, // Ethereal uses autopan by default
    isSafeMode: true,
    noiseType: NoiseType.ETHEREAL,
    timerDuration: 60, 
    timerRemaining: null
  });

  // Apply audio changes when state changes
  useEffect(() => {
    audioEngine.setVolume(audioState.volume);
    audioEngine.setTone(audioState.tone);
    if (!audioState.isAutopan) {
        audioEngine.setPan(audioState.pan);
    }
    audioEngine.toggleAutopan(audioState.isAutopan, 0.4); // Slower autopan by default
  }, [audioState.volume, audioState.tone, audioState.pan, audioState.isAutopan]);

  // Sync Safe Mode
  useEffect(() => {
      audioEngine.toggleSafeMode(audioState.isSafeMode);
  }, [audioState.isSafeMode]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavs = prev.includes(id) 
        ? prev.filter(favId => favId !== id)
        : [...prev, id];
      localStorage.setItem('somnium_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const togglePlay = () => {
    if (audioState.isPlaying) {
      audioEngine.stop();
      setAudioState(prev => ({ ...prev, isPlaying: false, timerRemaining: null }));
    } else {
      audioEngine.play(audioState.noiseType);
      
      if (audioState.timerDuration > 0) {
        audioEngine.startTimer(
            audioState.timerDuration,
            (remaining) => setAudioState(prev => ({ ...prev, timerRemaining: remaining })),
            () => setAudioState(prev => ({ ...prev, isPlaying: false, timerRemaining: null }))
        );
      }
      
      setAudioState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const loadPreset = (preset: Preset) => {
    const newState = { ...audioState, ...preset.settings };
    setAudioState(newState);
    setActiveInfo({
      title: preset.name,
      description: preset.description
    });
    
    // If playing, restart to apply new type/timer immediately
    if (audioState.isPlaying) {
        audioEngine.play(newState.noiseType);
        if (newState.timerDuration && newState.timerDuration > 0) {
            audioEngine.startTimer(
                newState.timerDuration,
                (rem) => setAudioState(p => ({...p, timerRemaining: rem})),
                () => setAudioState(p => ({ ...p, isPlaying: false, timerRemaining: null }))
            );
        } else {
            audioEngine.cancelTimer();
            setAudioState(prev => ({ ...prev, timerRemaining: null }));
        }
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatTimerLabel = (minutes: number) => {
    if (minutes === 0) return 'Infinite';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h${m > 0 ? ` ${m}m` : ''}`;
    return `${m}m`;
  };

  const updateTimerSetting = (minutes: number) => {
      setAudioState(prev => ({...prev, timerDuration: minutes}));

      // Live update if playing
      if (audioState.isPlaying) {
          if (minutes === 0) {
              audioEngine.cancelTimer();
              setAudioState(prev => ({...prev, timerRemaining: null}));
          } else {
              audioEngine.startTimer(
                  minutes,
                  (rem) => setAudioState(prev => ({...prev, timerRemaining: rem})),
                  () => setAudioState(prev => ({...prev, isPlaying: false, timerRemaining: null}))
              );
          }
      }
  };

  const quickAddTime = (mins: number) => {
      const current = audioState.timerDuration;
      // Cap at 12 hours (720 mins)
      const newTime = Math.min(720, current + mins);
      updateTimerSetting(newTime);
  };

  const sortedPresets = [...PRESETS].sort((a, b) => {
    const aFav = favorites.includes(a.id);
    const bFav = favorites.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-transparent text-zinc-300 font-sans selection:bg-white/10">
      
      {/* Background Ambience - Modified for Deep Sleep (Less bright, slower) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-950/20 rounded-full blur-[150px] mix-blend-screen animate-pulse-slow" />
         <div className="absolute bottom-[-20%] left-[-10%] w-[900px] h-[900px] bg-slate-900/40 rounded-full blur-[180px] mix-blend-screen animate-drift" />
         <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-black/40 rounded-full blur-[100px]" />
      </div>

      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      {/* PUZZLE MODE OVERLAY */}
      {viewMode === 'puzzle' && (
          <SleepPuzzle onExit={() => setViewMode('dashboard')} />
      )}

      {/* MAIN DASHBOARD */}
      <div className={`relative z-10 w-full max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col h-auto xl:h-screen xl:max-h-screen xl:overflow-hidden transition-opacity duration-500 ${viewMode === 'puzzle' ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}>
        
        {/* Header */}
        <header className="flex-none mb-4 md:mb-6 xl:mb-8 flex flex-col md:flex-row items-center justify-between xl:px-4 gap-4">
           
           <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-thin tracking-tight text-white/90 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Somnium
              </h1>
              <p className="text-zinc-600 text-[10px] md:text-xs tracking-[0.4em] uppercase mt-2 opacity-60">
                Premium Sleep Sanctuary
              </p>
           </div>

           {/* Actions: Switcher + Info */}
           <div className="flex items-center gap-3">
               {/* View Switcher Tabs */}
               <div className="bg-black/20 backdrop-blur-md p-1 rounded-full border border-white/5 flex gap-1">
                   <button 
                      onClick={() => setViewMode('dashboard')}
                      className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === 'dashboard' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                   >
                       <LayoutGrid size={14} /> Soundscape
                   </button>
                   <button 
                      onClick={() => setViewMode('puzzle')}
                      className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === 'puzzle' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                   >
                       <LayoutGrid size={14} /> Puzzle Mode
                   </button>
               </div>

               <button
                 onClick={() => setIsInfoOpen(true)}
                 className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-zinc-500 hover:text-zinc-300 hidden md:flex"
                 aria-label="Developer Info"
               >
                 <Info size={18} className="opacity-70 group-hover:opacity-100" />
               </button>
           </div>
        </header>

        {/* Dashboard Grid */}
        <main className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 xl:gap-8 pb-4 xl:pb-0">
            
            {/* COLUMN 1: LIBRARY (Left) */}
            <section className="order-3 xl:order-1 xl:col-span-3 h-[400px] xl:h-full flex flex-col min-h-0">
               <GlassCard title="Soundscape Library" className="h-full flex flex-col bg-glass-100">
                  <div className="flex-1 overflow-y-auto premium-scrollbar pr-2 -mr-2">
                    <div className="space-y-2 pb-2">
                        {sortedPresets.map(preset => {
                            const isFav = favorites.includes(preset.id);
                            const isActive = activeInfo.title === preset.name;
                            return (
                                <div
                                    key={preset.id}
                                    onClick={() => loadPreset(preset)}
                                    className={`w-full text-left group p-3 rounded-xl transition-all border cursor-pointer flex items-center justify-between gap-3
                                      ${isActive 
                                        ? 'bg-white/5 border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.02)]' 
                                        : 'bg-transparent hover:bg-white/5 border-transparent hover:border-white/5 active:scale-[0.98]'
                                      }
                                    `}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="p-2 rounded-lg transition-colors shrink-0 bg-zinc-900/50 text-zinc-600 group-hover:text-zinc-400">
                                            {preset.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className={`text-sm font-medium transition-colors truncate ${isActive ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                                              {preset.name}
                                            </h4>
                                            <p className="text-xs text-zinc-600 truncate group-hover:text-zinc-500">{preset.description}</p>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={(e) => toggleFavorite(e, preset.id)}
                                        className={`p-2 rounded-full transition-all shrink-0 hover:bg-white/5 ${isFav ? 'text-amber-400/80' : 'text-zinc-700 group-hover:text-zinc-500'}`}
                                    >
                                        <Star size={14} fill={isFav ? "currentColor" : "none"} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                  </div>
               </GlassCard>
            </section>

            {/* COLUMN 2: MAIN STAGE (Center) */}
            <section className="order-1 xl:order-2 xl:col-span-6 h-auto xl:h-full flex flex-col min-h-0 gap-6">
               <GlassCard className="flex-1 min-h-[450px] relative flex flex-col justify-between overflow-hidden group border-white/5 shadow-2xl shadow-black">
                  {/* Full size visualizer background */}
                  <Visualizer 
                      className="absolute inset-0 w-full h-full opacity-100 mix-blend-screen" 
                      isPlaying={audioState.isPlaying}
                      trackTitle={activeInfo.title}
                      trackDescription={activeInfo.description}
                  />

                  {/* Top Status Bar */}
                  <div className="relative z-20 flex justify-between items-start w-full pointer-events-none">
                      <div className="text-[10px] font-bold tracking-[0.2em] uppercase bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 flex items-center gap-2 text-zinc-500">
                          {audioState.isPlaying ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_rgba(129,140,248,0.5)]"></span>
                                Active State
                              </>
                          ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                                Idle
                              </>
                          )}
                      </div>
                  </div>
                  
                  {/* Bottom Playback Controls - Centered for Portal feel */}
                  <div className="relative z-20 flex flex-col items-center justify-end pb-12 gap-8 mt-auto">
                      
                      {/* Timer Display */}
                      <div className={`text-4xl md:text-6xl font-mono font-thin tracking-wider text-zinc-200 tabular-nums drop-shadow-2xl transition-opacity duration-1000 ${audioState.isPlaying ? 'opacity-100' : 'opacity-30'}`}>
                          {audioState.timerRemaining !== null ? formatTime(audioState.timerRemaining) : '∞'}
                      </div>

                      {/* Main Play Button */}
                      <button
                        onClick={togglePlay}
                        className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-700 shadow-[0_0_60px_rgba(0,0,0,0.6)] border backdrop-blur-md group-hover:scale-105 active:scale-95 ${
                          audioState.isPlaying 
                          ? 'bg-white/10 border-white/20 text-white shadow-[0_0_40px_rgba(255,255,255,0.1)]' 
                          : 'bg-black/40 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-black/60 hover:border-white/10'
                        }`}
                      >
                        {audioState.isPlaying ? (
                            <Square size={24} fill="currentColor" className="opacity-80" /> 
                        ) : (
                            <Play size={32} fill="currentColor" className="ml-1 opacity-80"/>
                        )}
                      </button>
                  </div>
               </GlassCard>
            </section>

            {/* COLUMN 3: MIXER (Right) */}
            <section className="order-2 xl:order-3 xl:col-span-3 h-auto xl:h-full flex flex-col min-h-0">
               <GlassCard title="Atmosphere Mixer" className="h-full flex flex-col overflow-hidden bg-glass-100">
                  <div className="flex-1 xl:overflow-y-auto premium-scrollbar pr-2 -mr-2 flex flex-col gap-8 xl:gap-0 xl:justify-around py-2">
                    
                    {/* Audio Sliders */}
                    <div className="space-y-8">
                        <ControlSlider
                            label="Master Intensity"
                            value={audioState.volume}
                            min={0}
                            max={1}
                            onChange={(v) => setAudioState(p => ({...p, volume: v}))}
                            formatValue={(v) => `${Math.round(v * 100)}%`}
                            leftIcon={<Volume2 size={16}/>}
                        />
                        
                        <ControlSlider
                            label="Spectral Tilt"
                            value={audioState.tone}
                            min={0}
                            max={100}
                            onChange={(v) => setAudioState(p => ({...p, tone: v}))}
                            formatValue={(v) => v < 30 ? 'Dark' : v > 70 ? 'Bright' : 'Flat'}
                            leftIcon={<span className="text-[10px] font-bold text-zinc-700">LOW</span>}
                            rightIcon={<span className="text-[10px] font-bold text-zinc-700">HI</span>}
                        />

                        <ControlSlider
                            label="Spatial Field"
                            value={audioState.pan}
                            min={-1}
                            max={1}
                            onChange={(v) => setAudioState(p => ({...p, pan: v}))}
                            formatValue={(v) => v === 0 ? 'Center' : v < 0 ? `L ${Math.round(Math.abs(v)*100)}` : `R ${Math.round(v*100)}`}
                            leftIcon={<span className="text-[10px] text-zinc-700">L</span>}
                            rightIcon={<span className="text-[10px] text-zinc-700">R</span>}
                        />
                    </div>

                    <div className="w-full h-px bg-white/5 my-4 xl:my-0"></div>

                    {/* Timer & Toggles */}
                    <div className="space-y-6">
                        
                        {/* Timer Control */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm text-zinc-500 font-medium flex items-center gap-2">
                                    <Clock size={15} className="text-zinc-600" /> Auto-Fade
                                </label>
                                <span className="text-xs text-zinc-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                    {formatTimerLabel(audioState.timerDuration)}
                                </span>
                            </div>
                            
                            <div className="relative w-full h-6 flex items-center mb-3">
                                <input 
                                    type="range"
                                    min={0}
                                    max={720}
                                    step={15}
                                    value={audioState.timerDuration}
                                    onChange={(e) => updateTimerSetting(parseInt(e.target.value))}
                                    className="z-20 w-full"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {[15, 30, 60].map(mins => (
                                    <button 
                                        key={mins}
                                        onClick={() => quickAddTime(mins)}
                                        className="text-[10px] uppercase font-bold tracking-wider py-2 rounded bg-white/5 hover:bg-white/10 text-zinc-600 hover:text-zinc-300 transition-all border border-transparent hover:border-white/5 flex items-center justify-center gap-1 active:scale-95"
                                    >
                                        <Plus size={10} /> {mins < 60 ? `${mins}m` : '1h'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between bg-zinc-900/30 p-3 rounded-xl border border-white/5">
                                <span className="text-sm text-zinc-500 font-medium flex items-center gap-2">
                                    <Activity size={16} className={audioState.isAutopan ? "text-indigo-400" : "text-zinc-700"} /> 
                                    Orbital Drift
                                </span>
                                <button
                                    onClick={() => setAudioState(p => ({...p, isAutopan: !p.isAutopan}))}
                                    className={`w-10 h-5 rounded-full relative transition-colors duration-500 ${audioState.isAutopan ? 'bg-indigo-900/50 border border-indigo-500/30' : 'bg-zinc-800'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white/80 transition-all duration-500 ${audioState.isAutopan ? 'left-6 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'left-1 bg-zinc-600'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between bg-zinc-900/30 p-3 rounded-xl border border-white/5">
                                <span className="text-sm text-zinc-500 font-medium flex items-center gap-2">
                                    {audioState.isSafeMode ? (
                                        <Sliders size={16} className="text-emerald-500/70" />
                                    ) : (
                                        <ShieldAlert size={16} className="text-amber-700" />
                                    )}
                                    Ear Safety
                                </span>
                                <button
                                    onClick={() => setAudioState(p => ({...p, isSafeMode: !p.isSafeMode}))}
                                    className={`w-10 h-5 rounded-full relative transition-colors duration-500 ${audioState.isSafeMode ? 'bg-emerald-900/30 border border-emerald-500/20' : 'bg-zinc-800'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-500 ${audioState.isSafeMode ? 'bg-emerald-400/80 left-6 shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'bg-zinc-600 left-1'}`} />
                                </button>
                            </div>
                        </div>

                    </div>
                  </div>
               </GlassCard>
            </section>

        </main>
      </div>
    </div>
  );
};

export default App;
