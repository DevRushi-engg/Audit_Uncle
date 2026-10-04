import React, { useState } from "react";
import { SAMPLES } from "@/config/app.config";

interface SampleMenuProps {
  onSelectSample: (sampleId: string) => void;
  disabled?: boolean;
}

export function SampleMenu({ onSelectSample, disabled }: SampleMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="w-full min-h-[40px] px-3 py-2 bg-white text-[#1A1A1A] border-1.5 border-[#1A1A1A] rounded-lg font-mono text-xs font-bold shadow-[2px_2px_0px_#1A1A1A] hover:bg-[#FFFDF7] active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50 flex items-center justify-between"
      >
        <span>TRY SAMPLE ▾</span>
        <span className="text-[10px] text-[#6B645A]">Kirana / Tiffin / Messy</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border-2 border-[#1A1A1A] rounded-lg shadow-[3px_3px_0px_#1A1A1A] z-30 py-1 font-mono text-xs">
          {SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => {
                setOpen(false);
                onSelectSample(sample.id);
              }}
              className="w-full text-left px-3 py-2 hover:bg-[#E8A317]/20 flex items-center justify-between border-b border-[#E2D6B8] last:border-b-0 transition-colors"
            >
              <span className="font-bold text-[#1A1A1A]">{sample.label}</span>
              <span className="text-[10px] text-[#6B645A]">
                {sample.id === "kirana" ? "120d store" : sample.id === "tiffin" ? "90d UPI" : "Raw format"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
