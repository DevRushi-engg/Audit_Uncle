import React from "react";

export type AiStatusType = "not_loaded" | "downloading" | "ready" | "fallback" | "openrouter";

interface ModelStatusChipProps {
  status?: AiStatusType;
  progress?: number;
  providerId?: string;
  onClick?: () => void;
}

export function ModelStatusChip({ onClick }: ModelStatusChipProps) {
  return (
    <div className="relative inline-block">
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border-2 border-[#1A1A1A] bg-[#E8F5E9] text-[#1B5E20] shadow-[2px_2px_0px_#1A1A1A]"
        title="Audit Uncle AI CFO Engine is connected and ready."
      >
        <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
        <span className="tracking-wide">● AI CFO ACTIVE</span>
      </div>
    </div>
  );
}
