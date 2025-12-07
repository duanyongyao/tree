import React from 'react';
import { useStore } from '../store';
import { AppState } from '../types';

const UI: React.FC = () => {
  const { mode, toggleMode } = useStore();

  const isTree = mode === AppState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
      {/* Header */}
      <header className="flex flex-col items-center md:items-start text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-serif text-[#F5F5F5] tracking-wider drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          GRAND
        </h1>
        <h2 className="text-sm md:text-lg font-light text-[#D4AF37] tracking-[0.3em] uppercase mt-2">
          LUXURY
        </h2>
      </header>

      {/* Controls */}
      <div className="flex flex-col items-center pointer-events-auto mb-12">
        <button
          onClick={toggleMode}
          className={`
            group relative px-8 py-4 bg-transparent border border-[#D4AF37] 
            transition-all duration-700 ease-out overflow-hidden
            ${isTree ? 'bg-[#D4AF37]/10' : ''}
          `}
        >
          {/* Fill Effect */}
          <div className={`
            absolute inset-0 bg-[#D4AF37] transform transition-transform duration-500 origin-left
            ${isTree ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-10'}
            opacity-20
          `} />
          
          <span className={`
            relative z-10 font-serif text-lg tracking-widest transition-colors duration-500
            ${isTree ? 'text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]' : 'text-[#D4AF37]'}
          `}>
            {isTree ? 'DISASSEMBLE' : 'ASSEMBLE FORM'}
          </span>
        </button>
        
        <p className="mt-4 text-[10px] text-[#004225] font-bold bg-[#D4AF37] px-2 py-1 rounded opacity-60">
          INTERACTIVE EXPERIENCE
        </p>
      </div>

      {/* Footer / Credits */}
      <div className="hidden md:block absolute bottom-12 right-12 text-right">
        <p className="text-[#D4AF37] font-serif text-xs tracking-widest opacity-80">
          EST. 2024
        </p>
        <div className="w-12 h-[1px] bg-[#D4AF37] ml-auto mt-2 mb-1" />
        <p className="text-white/40 text-[10px] uppercase tracking-wider">
          Rendered in Realtime
        </p>
      </div>
    </div>
  );
};

export default UI;