import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-glass-100 backdrop-blur-xl border border-glass-200 shadow-xl shadow-black/30 ${className}`}>
      {/* Subtle shine effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10 p-6 h-full flex flex-col">
        {title && (
          <h3 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-4 shrink-0">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
};

export default GlassCard;