import React, { useState } from "react";
import { APP } from "@/config/app.config";
import { AiStatusType, ModelStatusChip } from "./ModelStatusChip";

interface HeaderProps {
  aiStatus: AiStatusType;
  aiProgress: number;
  providerId: string;
  onOpenModelModal?: () => void;
}

export function Header({ aiStatus, aiProgress, providerId, onOpenModelModal }: HeaderProps) {
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  return (
    <header className="w-full bg-[#A8231B] text-[#FBF6E9] border-b-2 border-[#1A1A1A] sticky top-0 z-40 shadow-[0_2px_0px_#1A1A1A]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Left: Brand wordmark & version tag */}
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-6 bg-[#E8A317] border border-[#1A1A1A] rounded-xs shadow-[1px_1px_0px_#1A1A1A]" />
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl sm:text-2xl font-serif font-black tracking-wider text-[#FBF6E9]">
              {APP.name.toUpperCase()}
            </h1>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#FBF6E9]/40 bg-[#A8231B] text-[#FBF6E9]">
              {APP.version}
            </span>
          </div>
        </div>

        {/* Right: Model Status Chip & Privacy Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ModelStatusChip
            status={aiStatus}
            progress={aiProgress}
            providerId={providerId}
            onClick={onOpenModelModal}
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
              aria-label="Privacy information"
              className="w-8 h-8 rounded-full border-2 border-[#1A1A1A] bg-[#FBF6E9] text-[#1A1A1A] font-mono font-bold text-xs flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A] hover:bg-white active:translate-x-[1px] active:translate-y-[1px]"
            >
              i
            </button>

            {showPrivacyInfo && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 p-4 bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-lg shadow-[4px_4px_0px_#1A1A1A] z-50 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2D6B8]">
                  <span className="font-mono font-bold uppercase text-[11px] text-[#A8231B] flex items-center gap-1.5">
                    <span>🔒</span> Zero-Cloud Privacy
                  </span>
                  <button
                    onClick={() => setShowPrivacyInfo(false)}
                    className="font-mono font-bold text-xs text-[#6B645A] hover:text-[#1A1A1A]"
                  >
                    ✕
                  </button>
                </div>
                <p className="font-sans leading-relaxed text-[#1A1A1A]">
                  Your sales CSV is processed entirely in your browser sandbox. <strong>Zero rows are ever sent to an external server or database.</strong>
                </p>
                <div className="mt-2 pt-2 border-t border-[#E2D6B8] text-[10px] font-mono text-[#6B645A]">
                  Math runs deterministically on-device via TypeScript. AI narrations run via WebGPU / OpenRouter with numbers strictly bound by code guards.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
