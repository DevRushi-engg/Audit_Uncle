import React from "react";

export function TallyStrip({ count = 12 }: { count?: number } = {}) {
  return (
    <div
      aria-hidden="true"
      className="w-full py-3 my-4 flex items-center justify-center gap-6 text-[#1A1A1A] opacity-25 select-none font-mono text-sm tracking-widest border-y border-[#E2D6B8]"
    >
      <div className="flex items-center gap-6 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className="inline-block">
            ||||/
          </span>
        ))}
      </div>
    </div>
  );
}
