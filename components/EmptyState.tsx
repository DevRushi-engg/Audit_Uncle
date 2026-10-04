import React from "react";

interface EmptyStateProps {
  onLoadSample: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onLoadSample }) => {
  return (
    <div className="bg-[#FFFDF7] border-2 border-dashed border-[#1A1A1A] rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[420px] shadow-[3px_3px_0px_#1A1A1A]">
      {/* Line-drawn shopfront awning SVG */}
      <div className="w-24 h-24 mb-4 text-[#1A1A1A] flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-20 h-20"
        >
          {/* Shop roof/awning scallops */}
          <path d="M10 38 L90 38 L85 20 L15 20 Z" fill="#F3EAD3" />
          <path d="M10 38 C 15 46, 25 46, 30 38 C 35 46, 45 46, 50 38 C 55 46, 65 46, 70 38 C 75 46, 85 46, 90 38" />
          <line x1="25" y1="20" x2="20" y2="38" />
          <line x1="45" y1="20" x2="40" y2="38" />
          <line x1="65" y1="20" x2="60" y2="38" />
          <line x1="80" y1="20" x2="75" y2="38" />
          {/* Shop walls and counter */}
          <rect x="20" y="44" width="60" height="42" fill="#FBF6E9" />
          <line x1="20" y1="64" x2="80" y2="64" />
          <line x1="32" y1="64" x2="32" y2="86" />
          <line x1="68" y1="64" x2="68" y2="86" />
          {/* Bahi-khata ledger book on counter */}
          <rect x="42" y="54" width="16" height="10" rx="1" fill="#E8A317" stroke="#1A1A1A" strokeWidth="2" />
          <line x1="50" y1="54" x2="50" y2="64" stroke="#A8231B" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="inline-block px-2.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#E8A317] font-mono text-[11px] font-bold uppercase mb-2">
        Awaiting Sales Records
      </div>

      <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#1A1A1A] mb-2">
        Khata abhi khali hai.
      </h3>

      <p className="font-sans text-xs sm:text-sm text-[#6B645A] max-w-lg mb-6 leading-relaxed">
        Drop your sales CSV file on the left (Tally, Vyapar, Khatabook, or Excel), or click below to load our freshly generated <strong>120-Day Real Business Sample</strong>.
      </p>

      <button
        type="button"
        onClick={onLoadSample}
        className="bg-[#E8A317] hover:bg-[#F59E0B] text-[#1A1A1A] font-mono font-bold text-xs uppercase px-6 py-3.5 rounded-lg border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
      >
        <span>LOAD REAL BUSINESS SAMPLE (510 ROWS)</span>
        <span>→</span>
      </button>

      <div className="mt-8 pt-4 border-t border-[#E2D6B8] flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-[#6B645A]">
        <span>🔒 Zero server upload</span>
        <span>•</span>
        <span>Pure local math</span>
        <span>•</span>
        <span>OpenRouter Gemma 26B analysis</span>
      </div>
    </div>
  );
};
