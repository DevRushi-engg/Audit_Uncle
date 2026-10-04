"use client";

import React, { useState, useEffect } from "react";

const QUOTES = [
  "Hisab lagaya ja raha hai…",
  "Chai thandi hone se pehle report ready…",
  "Har rupaya gin liya, bhau…",
  "Checking cash flows against 30-day averages…",
  "Synthesizing recommendations with CFO agent…",
];

export const AnalyzingState: React.FC = () => {
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % QUOTES.length);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-paper border-2 border-ink rounded-lg p-6 sm:p-8 shadow-[3px_3px_0px_#1A1A1A] space-y-6">
      {/* Top Banner with pulsating indicator */}
      <div className="flex items-center justify-between border-b-2 border-ink pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-turmeric opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-turmeric" />
          </span>
          <span className="font-mono text-xs uppercase font-bold text-ink tracking-wider">
            ANALYZING HISAB // हिशोब सुरू आहे
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-ink">
          Agents at work
        </span>
      </div>

      {/* Rotating Microcopy */}
      <div className="bg-paper-deep p-4 rounded border border-rule text-center">
        <p className="font-serif text-base sm:text-lg font-bold text-ink italic transition-all duration-300">
          &ldquo;{QUOTES[quoteIdx]}&rdquo;
        </p>
        <span className="font-mono text-[10px] text-muted-ink uppercase mt-1 block">
          Running Cleaner → Analyst → Tax → Risk → CFO
        </span>
      </div>

      {/* Skeleton Ruled Rows (no shimmer under reduced motion) */}
      <div className="space-y-3 pt-2">
        <div className="h-4 bg-rule/50 rounded w-1/3 animate-pulse motion-reduce:animate-none" />
        <div className="h-10 bg-paper-deep rounded border border-rule/80 animate-pulse motion-reduce:animate-none" />
        <div className="h-28 bg-paper-deep rounded border border-rule/80 animate-pulse motion-reduce:animate-none" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-paper-deep rounded border border-rule/80 animate-pulse motion-reduce:animate-none" />
          <div className="h-16 bg-paper-deep rounded border border-rule/80 animate-pulse motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
};
