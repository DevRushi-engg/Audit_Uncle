import React from "react";
import { TaxEstimate } from "@/types/finance";
import { formatINR } from "@/lib/finance/format";

interface TaxEstimateCardProps {
  tax: TaxEstimate;
}

export function TaxEstimateCard({ tax }: TaxEstimateCardProps) {
  return (
    <div className="p-3.5 sm:p-4 bg-white border-2 border-[#1A1A1A] rounded-lg shadow-[2px_2px_0px_#1A1A1A] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#E2D6B8]">
          <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-[#1A1A1A]">
            TAX // ESTIMATE
          </span>
          <span className="transform rotate-2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#1A1A1A] bg-[#FEF3C7] text-[#92400E] shadow-[1px_1px_0px_#1A1A1A]">
            ESTIMATE
          </span>
        </div>

        {/* Tax Figures Table */}
        <div className="space-y-1.5 my-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#6B645A]">GST payable (est.):</span>
            <span className="font-bold text-[#1A1A1A] text-sm tabular-numbers">
              {formatINR(tax.gstPayable)}
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#6B645A]">Income tax (est.):</span>
            <span className="font-bold text-[#1A1A1A] text-sm tabular-numbers">
              {formatINR(tax.incomeTax)}
            </span>
          </div>
        </div>

        {/* Rules Line */}
        <p className="text-[10px] sm:text-[11px] text-[#6B645A] font-mono leading-tight">
          Rules used: {tax.rulesUsed}
        </p>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="mt-3 pt-2 border-t border-[#E2D6B8] text-[10px] font-mono font-bold text-[#A8231B] flex items-center gap-1">
        <span>⚠</span>
        <span>{tax.disclaimer}</span>
      </div>
    </div>
  );
}
