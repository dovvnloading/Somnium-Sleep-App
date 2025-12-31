
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, LayoutGrid, Check } from 'lucide-react';

interface SleepPuzzleProps {
  onExit: () => void;
}

const GRID_SIZE = 4;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;

const SleepPuzzle: React.FC<SleepPuzzleProps> = ({ onExit }) => {
  const [tiles, setTiles] = useState<number[]>([]); 
  const [isSolved, setIsSolved] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  const initGame = useCallback(() => {
    // 0..15 array where index is current position, value is tile ID (original position)
    let state = Array.from({ length: CELL_COUNT }, (_, i) => i);
    
    // Shuffle logic: Perform random valid moves to ensure solvability
    let emptyIdx = CELL_COUNT - 1;
    let lastMove = -1;
    const shuffleMoves = 200; 

    for(let i=0; i<shuffleMoves; i++) {
       const neighbors = [];
       const row = Math.floor(emptyIdx / GRID_SIZE);
       const col = emptyIdx % GRID_SIZE;

       if (row > 0) neighbors.push(emptyIdx - GRID_SIZE);
       if (row < GRID_SIZE - 1) neighbors.push(emptyIdx + GRID_SIZE);
       if (col > 0) neighbors.push(emptyIdx - 1);
       if (col < GRID_SIZE - 1) neighbors.push(emptyIdx + 1);

       const validNeighbors = neighbors.filter(n => n !== lastMove);
       const next = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
       
       if (next !== undefined) {
           state[emptyIdx] = state[next];
           state[next] = CELL_COUNT - 1;
           lastMove = emptyIdx;
           emptyIdx = next;
       }
    }

    setTiles(state);
    setIsSolved(false);
    setMoveCount(0);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleTileClick = (index: number) => {
    if (isSolved) return;
    
    const emptyIdx = tiles.indexOf(CELL_COUNT - 1);
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const emptyRow = Math.floor(emptyIdx / GRID_SIZE);
    const emptyCol = emptyIdx % GRID_SIZE;

    const isAdjacent = 
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const newTiles = [...tiles];
      newTiles[emptyIdx] = newTiles[index];
      newTiles[index] = CELL_COUNT - 1;
      setTiles(newTiles);
      setMoveCount(prev => prev + 1);

      const won = newTiles.every((val, i) => val === i);
      if (won) setIsSolved(true);
    }
  };

  const getTileStyle = (tileId: number) => {
     if (tileId === CELL_COUNT - 1) return {}; 
     
     const row = Math.floor(tileId / GRID_SIZE);
     const col = tileId % GRID_SIZE;
     
     // Revised Gradient Logic: 2-Axis separation for clarity
     // X-Axis: Hue shift (Indigo to Emerald)
     // Y-Axis: Lightness shift (Deep to Bright)
     
     // Hue: 240 (Blue) -> 160 (Teal/Green)
     const hue = 240 - (col / (GRID_SIZE - 1)) * 80;
     
     // Lightness: 30% -> 60%
     const lightness = 30 + (row / (GRID_SIZE - 1)) * 30;
     
     return {
         backgroundColor: `hsla(${hue}, 50%, ${lightness}%, 0.6)`,
         borderColor: `hsla(${hue}, 50%, ${lightness + 20}%, 0.4)`,
         boxShadow: `inset 0 0 15px hsla(${hue}, 60%, ${lightness}%, 0.2)`
     };
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0c0c14] text-zinc-300 font-sans overflow-hidden flex flex-col animate-in fade-in duration-700">
       
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-black to-black" />

       <div className="relative z-10 p-6 flex justify-between items-center">
          <button onClick={onExit} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-zinc-300">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2 text-xs tracking-widest uppercase opacity-50 text-zinc-400">
            <LayoutGrid size={14} />
            <span>Spectrum Puzzle</span>
          </div>
          <button onClick={initGame} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-zinc-300">
            <RefreshCw size={20} />
          </button>
       </div>

       <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
          <div 
            className="relative bg-white/5 p-2 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl"
            style={{ 
                width: 'min(90vw, 400px)', 
                height: 'min(90vw, 400px)',
            }}
          >
             <div className="w-full h-full grid grid-cols-4 gap-2">
                 {tiles.map((tileId, currentIdx) => {
                     const isEmpty = tileId === CELL_COUNT - 1;
                     return (
                         <div
                            key={`${currentIdx}-${tileId}`}
                            onClick={() => handleTileClick(currentIdx)}
                            className={`rounded-lg transition-all duration-300 flex items-center justify-center relative group
                                ${isEmpty ? 'invisible' : 'cursor-pointer hover:brightness-110 active:scale-95 border'}
                            `}
                            style={getTileStyle(tileId)}
                         >
                            {/* Subtle Number Hint */}
                            {!isEmpty && (
                                <span className="absolute text-[10px] font-mono font-medium text-white/30 group-hover:text-white/60 transition-colors">
                                    {tileId + 1}
                                </span>
                            )}
                         </div>
                     )
                 })}
             </div>
             
             {isSolved && (
                 <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-2xl animate-in fade-in zoom-in duration-500">
                     <div className="text-center">
                         <div className="mb-4 inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                             <Check size={32} />
                         </div>
                         <h3 className="text-2xl font-thin text-white tracking-widest mb-2">Restored</h3>
                         <p className="text-zinc-400 text-xs uppercase tracking-wider mb-6">{moveCount} Moves</p>
                         <button 
                            onClick={initGame} 
                            className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-[10px] uppercase tracking-widest transition-colors text-zinc-200"
                         >
                             Play Again
                         </button>
                     </div>
                 </div>
             )}
          </div>
          
          <div className="mt-12 text-center opacity-30">
              <p className="text-[10px] tracking-[0.3em] uppercase font-light">
                  {isSolved ? "Harmony Achieved" : "Restore the Gradient"}
              </p>
          </div>
       </div>
    </div>
  );
};

export default SleepPuzzle;
