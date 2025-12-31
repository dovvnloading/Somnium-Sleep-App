
import React, { useEffect, useState } from 'react';
import { X, Github, Globe, Twitter, ExternalLink, Code2, Heart, ShieldAlert } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
        isOpen ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-none pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        className={`relative w-full max-w-md bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 transform ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        }`}
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="relative p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-light text-white tracking-wide">Somnium</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1">System Info</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 relative max-h-[70vh] overflow-y-auto premium-scrollbar">
          
          {/* Developer Identity Card */}
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 relative group overflow-hidden shrink-0">
             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             
             <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center shadow-lg mb-4 border border-white/10">
                    <Code2 size={28} className="text-zinc-300" />
                </div>
                
                <h3 className="text-lg font-medium text-white mb-1">Matthew Robert Wesney</h3>
                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-4">Lead Architect</p>
                
                <div className="flex gap-2 w-full justify-center">
                   <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 border border-white/5 text-[10px] text-zinc-500">
                      <Heart size={10} />
                      <span>Audio Engineering</span>
                   </div>
                   <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 border border-white/5 text-[10px] text-zinc-500">
                      <Heart size={10} />
                      <span>UI/UX Design</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Social Links */}
          <div className="space-y-3 shrink-0">
             <p className="text-[10px] uppercase tracking-widest text-zinc-600 pl-2">Connect</p>
             
             <a 
                href="https://dovvnloading.github.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
             >
                <div className="p-2 rounded-lg bg-black/20 text-zinc-400 group-hover:text-blue-400 transition-colors">
                   <Globe size={18} />
                </div>
                <div className="flex-1">
                   <div className="text-sm text-zinc-200 font-medium">Personal Webpage</div>
                   <div className="text-xs text-zinc-500">dovvnloading.github.io</div>
                </div>
                <ExternalLink size={14} className="text-zinc-600 group-hover:text-zinc-400" />
             </a>

             <a 
                href="https://github.com/dovvnloading" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
             >
                <div className="p-2 rounded-lg bg-black/20 text-zinc-400 group-hover:text-white transition-colors">
                   <Github size={18} />
                </div>
                <div className="flex-1">
                   <div className="text-sm text-zinc-200 font-medium">Github</div>
                   <div className="text-xs text-zinc-500">@dovvnloading</div>
                </div>
                <ExternalLink size={14} className="text-zinc-600 group-hover:text-zinc-400" />
             </a>

             <a 
                href="https://x.com/D3VAUX" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
             >
                <div className="p-2 rounded-lg bg-black/20 text-zinc-400 group-hover:text-sky-400 transition-colors">
                   <Twitter size={18} />
                </div>
                <div className="flex-1">
                   <div className="text-sm text-zinc-200 font-medium">X (Twitter)</div>
                   <div className="text-xs text-zinc-500">@D3VAUX</div>
                </div>
                <ExternalLink size={14} className="text-zinc-600 group-hover:text-zinc-400" />
             </a>
          </div>

          {/* Development Restrictions */}
          <div className="shrink-0 p-4 rounded-xl bg-red-950/20 border border-red-500/10">
             <div className="flex items-center gap-2 mb-2 text-red-400/80">
                <ShieldAlert size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">License & Usage</span>
             </div>
             <p className="text-[10px] leading-relaxed text-red-200/50 font-medium text-justify">
                This project is proprietary intellectual property. While the source code is visible for educational purposes, unauthorized reproduction, modification, distribution, or creation of derivative works is strictly prohibited. All rights reserved.
             </p>
          </div>

        </div>
        
        {/* Footer */}
        <div className="bg-black/20 p-4 border-t border-white/5 text-center">
           <p className="text-[10px] text-zinc-600">
             © {new Date().getFullYear()} Somnium Soundscape. All rights reserved.
           </p>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
