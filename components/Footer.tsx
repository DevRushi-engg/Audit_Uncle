import React from "react";
import { APP } from "@/config/app.config";

interface FooterProps {
  modelStatusText: string;
}

export function Footer({ modelStatusText }: FooterProps) {
  return (
    <footer className="mt-auto pt-6 pb-8 border-t-2 border-[#1A1A1A] bg-[#FFFDF7] text-[#1A1A1A]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#6B645A]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#2E7D4F]" />
            <span>{modelStatusText}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-[#1A1A1A]">
              {APP.name} {APP.version}
            </span>
            <span>•</span>
            <span>Local Bahi-Khata Ledger Engine</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#E2D6B8] text-center">
          <p className="text-[11px] font-mono tracking-wider text-[#6B645A]">
            Built at Hacktoberfest Hack Day Nashik × Hustler Hive (MLH)
          </p>
        </div>
      </div>
    </footer>
  );
}
