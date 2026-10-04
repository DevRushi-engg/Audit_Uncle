"use client";

import React, { useState } from "react";
import type { CfoMemo as CfoMemoType } from "@/types/finance";

interface CfoMemoProps {
  memo: CfoMemoType | null;
}

export const CfoMemo: React.FC<CfoMemoProps> = ({ memo }) => {
  const [copied, setCopied] = useState(false);

  if (!memo) return null;

  const handleCopy = async () => {
    const text = `AUDIT UNCLE CFO MEMO\n\n${memo.headline}\n\nKey Actions:\n${memo.actions
      .map((action, i) => `${i + 1}. ${action}`)
      .join("\n")}\n\n— Generated locally by Audit Uncle AI CFO`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <div className="relative my-4 transition-transform duration-200">
      {/* Paper-slip card with slight tilt and hard offset shadow */}
      <div className="relative bg-paper-deep border-2 border-ink rounded-lg p-5 shadow-[3px_3px_0px_#1A1A1A] transform -rotate-[0.5deg] hover:rotate-0 transition-transform">
        {/* Folded-corner CSS simulation */}
        <div
          className="absolute top-0 right-0 w-6 h-6 bg-rule border-b-2 border-l-2 border-ink rounded-bl-sm pointer-events-none"
          aria-hidden="true"
        />

        {/* Header line */}
        <div className="flex items-center justify-between border-b border-rule/80 pb-2 mb-3 pr-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-widest uppercase bg-ink text-paper px-1.5 py-0.5 rounded font-bold">
              CFO MEMO
            </span>
            <span className="font-mono text-xs text-muted-ink">
              // ACTIONABLE HISAB
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="text-xs font-mono px-2 py-1 bg-paper border border-ink rounded hover:bg-turmeric transition-colors shadow-[1px_1px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5"
            title="Copy summary to clipboard"
          >
            {copied ? "✓ COPIED" : "COPY SUMMARY"}
          </button>
        </div>

        {/* Headline */}
        <h4 className="font-serif text-base sm:text-lg font-bold text-ink leading-snug mb-3">
          &ldquo;{memo.headline}&rdquo;
        </h4>

        {/* 3 Numbered Actions */}
        <div className="space-y-2 mt-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-ink font-semibold">
            Recommended Steps:
          </div>
          <ol className="space-y-2">
            {memo.actions.map((action, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-ink bg-paper/90 p-2.5 rounded border border-rule"
              >
                <span className="font-mono font-bold text-xs bg-turmeric text-ink w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-ink shadow-[1px_1px_0px_#1A1A1A]">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-sans">{action}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 pt-2 border-t border-rule/60 flex items-center justify-between text-[10px] font-mono text-muted-ink">
          <span>* Deterministic calculations narrated for execution</span>
          <span>Audit Uncle v1</span>
        </div>
      </div>
    </div>
  );
};
