import React, { useState } from "react";
import { Flag } from "@/types/finance";

interface InsightListProps {
  flags: Flag[];
  analystNarration?: string;
  narratedBy?: "code" | "ai" | "template";
}

export function InsightList({ flags, analystNarration, narratedBy = "code" }: InsightListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Combine analyst sentence and up to 4 top flags
  const items: {
    id: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    title: string;
    details: string;
    tag: string;
  }[] = [];

  if (analystNarration) {
    items.push({
      id: "analyst-trend",
      severity: "LOW",
      title: analystNarration,
      details: "Derived from sales velocity, weekday performance, and 30-day comparisons.",
      tag: narratedBy === "ai" ? "narrated by AI" : "template",
    });
  }

  for (const f of flags.slice(0, 4)) {
    items.push({
      id: f.id,
      severity: f.severity,
      title: f.text,
      details: `Rule triggered by system auditor: Severity ${f.severity} based on current cash buffer and burn rates.`,
      tag: "calculated by code",
    });
  }

  const getSeverityStyle = (s: "LOW" | "MEDIUM" | "HIGH") => {
    if (s === "HIGH") {
      return "bg-[#FEF2F2] text-[#991B1B] border-[#A8231B]";
    }
    if (s === "MEDIUM") {
      return "bg-[#FEF3C7] text-[#92400E] border-[#E8A317]";
    }
    return "bg-[#E8F5E9] text-[#1B5E20] border-[#2E7D4F]";
  };

  return (
    <div className="p-3.5 sm:p-4 bg-white border-2 border-[#1A1A1A] rounded-lg shadow-[2px_2px_0px_#1A1A1A] space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-[#E2D6B8]">
        <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-[#1A1A1A]">
          FINANCIAL INSIGHTS // नोंदी
        </span>
        <span className="text-[10px] font-mono text-[#6B645A]">
          {items.length} observations
        </span>
      </div>

      <div className="space-y-2 pt-1">
        {items.map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={item.id + idx}
              className="p-2.5 bg-[#FFFDF7] border border-[#1A1A1A] rounded shadow-[1px_1px_0px_#1A1A1A] text-xs font-sans"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <span
                    className={`mt-0.5 px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold tracking-wider uppercase shrink-0 ${getSeverityStyle(
                      item.severity
                    )}`}
                  >
                    {item.severity}
                  </span>
                  <p className="text-[#1A1A1A] font-medium leading-snug">{item.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="text-[10px] font-mono font-bold text-[#23408E] hover:underline shrink-0"
                >
                  {isExpanded ? "Hide" : "Why?"}
                </button>
              </div>

              {/* Expanded Explainer & Audit Tag */}
              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-[#E2D6B8] flex items-center justify-between text-[10px] font-mono text-[#6B645A]">
                  <span>{item.details}</span>
                  <span className="px-1.5 py-0.2 bg-[#F3EAD3] border border-[#1A1A1A] rounded text-[#1A1A1A] font-bold">
                    {item.tag}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
