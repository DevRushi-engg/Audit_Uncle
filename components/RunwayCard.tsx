import React from "react";
import { Runway } from "@/types/finance";
import { formatDays } from "@/lib/finance/format";

interface RunwayCardProps {
  runway: Runway;
}

export function RunwayCard({ runway }: RunwayCardProps) {
  const isShort = runway.survivalDays !== null && runway.survivalDays < 30;
  const isHealthy = runway.survivalDays !== null && runway.survivalDays >= 60;

  return (
    <div className="p-3.5 sm:p-4 bg-white border-2 border-[#1A1A1A] rounded-lg shadow-[2px_2px_0px_#1A1A1A] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#E2D6B8]">
          <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-[#1A1A1A]">
            RUNWAY // टिकाव
          </span>
          <span
            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#1A1A1A] ${
              isShort
                ? "bg-[#FEF2F2] text-[#991B1B]"
                : isHealthy
                ? "bg-[#E8F5E9] text-[#1B5E20]"
                : "bg-[#FEF3C7] text-[#92400E]"
            }`}
          >
            {isShort ? "SHORT RUNWAY" : isHealthy ? "SAFE BUFFER" : "WATCH"}
          </span>
        </div>

        {/* Big Display Figure */}
        <div className="my-1.5">
          {runway.survivalDays !== null ? (
            <div className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#1A1A1A]">
              {runway.survivalDays}{" "}
              <span className="text-base sm:text-lg font-sans font-bold text-[#6B645A]">
                days
              </span>
            </div>
          ) : (
            <div className="text-xl font-serif font-bold text-[#A8231B]">
              Not enough data
            </div>
          )}
        </div>

        {/* Obligatory Assumption Line */}
        <p className="text-xs text-[#6B645A] font-sans font-medium">
          {runway.assumption}
        </p>
      </div>

      {/* Trend Forecast Line */}
      <div className="mt-3 pt-2 border-t border-[#E2D6B8] text-[11px] font-mono">
        <span className="text-[#6B645A]">Trend forecast: </span>
        <span className="font-bold text-[#1A1A1A]">
          {typeof runway.trendDays === "number"
            ? `${runway.trendDays} days at current burn`
            : runway.trendDays === "cash-positive"
            ? "Cash-positive trajectory"
            : "Calculating trajectory..."}
        </span>
      </div>
    </div>
  );
}
