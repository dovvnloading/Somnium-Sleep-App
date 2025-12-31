import React from 'react';

interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const ControlSlider: React.FC<ControlSliderProps> = ({ 
  label, 
  value, 
  min, 
  max, 
  onChange, 
  formatValue,
  leftIcon,
  rightIcon
}) => {
  return (
    <div className="mb-6 group">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors">{label}</label>
        <span className="text-xs text-zinc-500 font-mono bg-white/5 px-2 py-0.5 rounded-md group-hover:text-zinc-300 transition-colors">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {leftIcon && <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors">{leftIcon}</div>}
        <div className="relative w-full h-6 flex items-center">
             <input
                type="range"
                min={min}
                max={max}
                step={0.1}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="z-20 w-full"
            />
        </div>
        {rightIcon && <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors">{rightIcon}</div>}
      </div>
    </div>
  );
};

export default ControlSlider;