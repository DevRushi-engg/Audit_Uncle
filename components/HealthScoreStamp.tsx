import React, { useState } from "react";
import { HealthScore } from "@/types/finance";

interface HealthScoreStampProps {
  score: HealthScore;
}

export function HealthScoreStamp({ score }: HealthScoreStampProps) {
  const [showPopover, setShowPopover] = useState(false);

  let bandBg = "bg-[#2E7D4F] text-white";
  let bandBorder = "border-[#2E7D4F]";
  let symbol = "✓";
  let bandText = "HEALTHY";

  if (score.band === "watch") {
    bandBg = "bg-[#E8A317] text-[#1A1A1A]";
    bandBorder = "border-[#E8A317]";
    symbol = "!";
    bandText = "WATCH";
  } else if (score.band === "danger") {
    bandBg = "bg-[#A8231B] text-white";
    bandBorder = "border-[#A8231B]";
    symbol = "✕";
    bandText = "DANGER";
  }

  return (
    <div className="relative inline-block">
      {/* Rotated Rubber Stamp */}
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        title="Click to view health score breakdown"
        className="transform -rotate-4 hover:-rotate-1 transition-transform cursor-pointer select-none text-center p-2.5 sm:p-3 bg-white border-3 border-[#1A1A1A] rounded-lg shadow-[4px_4px_0px_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px]"
      >
        <div className="border border-dashed border-[#1A1A1A]/40 p-1.5 rounded">
          <div className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#1A1A1A] tabular-numbers leading-none">
            {score.total}
          </div>
          <div className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest uppercase text-[#6B645A] my-0.5">
            HEALTH SCORE
          </div>
          <div
            className={`text-[9px] sm:text-[10px] font-mono font-black tracking-wider px-1.5 py-0.5 rounded border border-[#1A1A1A] ${bandBg}`}
          >
            {symbol} {bandText}
          </div>
        </div>
      </button>

      {/* Breakdown Popover */}
      {showPopover && (
        <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 p-3.5 bg-white border-2 border-[#1A1A1A] rounded-lg shadow-[5px_5px_0px_#1A1A1A] z-50 text-xs font-sans">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#E2D6B8]">
            <span className="font-mono font-bold uppercase text-[11px] text-[#1A1A1A]">
              Score Breakdown ({score.total}/100)
            </span>
            <button
              onClick={() => setShowPopover(false)}
              className="text-[#6B645A] hover:text-[#1A1A1A] font-mono font-bold text-xs"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2.5">
            {score.factors.map((f) => {
              const pct = Math.round((f.score / f.max) * 100);
              return (
                <div key={f.id} className="space-y-1">
                  <div className="flex justify-between font-mono text-[11px] font-bold text-[#1A1A1A]">
                    <span>{f.label}</span>
                    <span>
                      {f.score}/{f.max}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F3EAD3] border border-[#1A1A1A] rounded-xs overflow-hidden">
                    <div
                      className="h-full bg-[#E8A317]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#6B645A] leading-tight">{f.note}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-[#E2D6B8] text-right">
            <span className="text-[10px] font-mono text-[#6B645A]">
              Weighted model • Pure deterministic math
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
