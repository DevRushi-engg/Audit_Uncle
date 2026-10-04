import React from "react";
import type { ToolResult } from "@/types/finance";

export interface AnswerItem {
  id: string;
  question: string;
  answer: string;
  toolResult: ToolResult;
  source: "ai" | "template";
  timestamp: string;
}

interface AnswerCardProps {
  item: AnswerItem;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({ item }) => {
  const { question, answer, toolResult, source, timestamp } = item;

  // Format the tool call representation e.g. weekdayPerformance("Tue")
  const argsString = toolResult.args
    ? Object.values(toolResult.args)
        .map((v) => (typeof v === "string" ? `"${v}"` : String(v)))
        .join(", ")
    : "";
  const toolCallStr = `${toolResult.tool}(${argsString})`;

  return (
    <div className="bg-paper border-2 border-ink rounded-lg p-3.5 shadow-[2px_2px_0px_#1A1A1A] space-y-2.5">
      {/* Question Header */}
      <div className="flex items-start justify-between gap-2 border-b border-rule pb-2">
        <div className="flex items-center gap-1.5 font-sans font-semibold text-xs sm:text-sm text-ink">
          <span className="font-mono text-muted-ink">Q:</span>
          <span>{question}</span>
        </div>
        <span className="font-mono text-[10px] text-muted-ink shrink-0">
          {timestamp}
        </span>
      </div>

      {/* Answer Narration */}
      <div className="text-xs sm:text-sm text-ink leading-relaxed font-sans">
        {answer}
      </div>

      {/* Calculated By Badge */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-paper-deep text-muted-ink border border-rule font-medium">
          CALCULATED BY
        </span>
        <code className="font-mono text-[10px] bg-paper-deep text-pen-blue px-2 py-0.5 rounded border border-rule font-bold">
          {toolCallStr}
        </code>
        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded text-muted-ink">
          Audit Uncle AI Explanation
        </span>
      </div>

      {/* Numbers / Rows table */}
      {toolResult.numbers && Object.keys(toolResult.numbers).length > 0 && (
        <div className="bg-paper-deep/70 rounded border border-rule p-2 overflow-x-auto">
          <div className="font-mono text-[9px] uppercase text-muted-ink tracking-wider font-semibold mb-1">
            Exact Code Outputs:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(toolResult.numbers).map(([k, v]) => (
              <div key={k} className="bg-paper p-1.5 rounded border border-rule">
                <div className="font-mono text-[9px] text-muted-ink uppercase truncate">
                  {k.replace(/([A-Z])/g, " $1")}
                </div>
                <div className="font-mono text-xs font-bold text-ink tabular-nums mt-0.5">
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Secondary rows if provided (e.g., top expenses list) */}
      {toolResult.rows && toolResult.rows.length > 0 && (
        <div className="bg-paper-deep/70 rounded border border-rule p-2 overflow-x-auto">
          <table className="w-full text-left font-mono text-[10px]">
            <tbody>
              {toolResult.rows.map((row, i) => (
                <tr key={i} className="border-b border-rule/50 last:border-0">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-1 px-1.5 text-ink tabular-nums">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
