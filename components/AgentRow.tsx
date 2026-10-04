import React from "react";
import type { AgentState, AgentId } from "@/types/finance";

interface AgentRowProps {
  agent: AgentState;
}

const AGENT_META: Record<
  AgentId,
  { name: string; glyph: string; glyphBg: string; glyphColor: string }
> = {
  cleaner: {
    name: "CLEANER AGENT",
    glyph: "◆",
    glyphBg: "bg-ink",
    glyphColor: "text-paper",
  },
  analyst: {
    name: "ANALYST AGENT",
    glyph: "▲",
    glyphBg: "bg-pen-blue",
    glyphColor: "text-paper",
  },
  tax: {
    name: "TAX AGENT",
    glyph: "■",
    glyphBg: "bg-turmeric",
    glyphColor: "text-ink",
  },
  risk: {
    name: "RISK AGENT",
    glyph: "●",
    glyphBg: "bg-ledger-red",
    glyphColor: "text-paper",
  },
  cfo: {
    name: "CFO AGENT",
    glyph: "✦",
    glyphBg: "bg-tulsi",
    glyphColor: "text-paper",
  },
};

export const AgentRow: React.FC<AgentRowProps> = ({ agent }) => {
  const meta = AGENT_META[agent.id] || {
    name: agent.id.toUpperCase(),
    glyph: "●",
    glyphBg: "bg-ink",
    glyphColor: "text-paper",
  };

  const renderStatus = () => {
    switch (agent.status) {
      case "waiting":
        return (
          <span
            className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-ink"
            title="Waiting to run"
          >
            <span className="w-2.5 h-2.5 rounded-full border border-muted-ink inline-block" />
            <span className="hidden sm:inline">WAITING</span>
          </span>
        );
      case "working":
        return (
          <span
            className="inline-flex items-center gap-1 font-mono text-[11px] text-turmeric font-semibold"
            title="Analyzing..."
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-turmeric opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-turmeric" />
            </span>
            <span>WORKING</span>
          </span>
        );
      case "done":
        return (
          <span
            className="inline-flex items-center gap-1 font-mono text-[11px] text-tulsi font-semibold"
            title="Finished"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-tulsi text-paper inline-flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            <span className="hidden sm:inline">DONE</span>
          </span>
        );
      case "fallback":
        return (
          <span
            className="inline-flex items-center gap-1 font-mono text-[11px] text-turmeric font-semibold"
            title="Used template fallback"
          >
            <span>▲</span>
            <span className="hidden sm:inline">FALLBACK</span>
          </span>
        );
      default:
        return null;
    }
  };

  const renderTag = () => {
    if (!agent.narratedBy || agent.status === "waiting") return null;

    if (agent.narratedBy === "code") {
      return (
        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border border-rule bg-paper-deep text-muted-ink font-semibold">
          Calculated by code
        </span>
      );
    }
    return (
      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border border-pen-blue/40 bg-pen-blue/10 text-pen-blue font-semibold">
        Audit Uncle AI Analysis
      </span>
    );
  };

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        agent.status === "working"
          ? "border-turmeric bg-paper shadow-sm"
          : agent.status === "done"
          ? "border-rule bg-paper/80"
          : "border-rule/60 bg-paper-deep/30 opacity-70"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${meta.glyphBg} ${meta.glyphColor}`}
            aria-hidden="true"
          >
            {meta.glyph}
          </div>
          <span className="font-mono text-xs font-bold text-ink tracking-wider">
            {meta.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {renderTag()}
          {renderStatus()}
        </div>
      </div>

      {agent.factLine ? (
        <p className="font-mono text-xs text-ink/90 mt-1 pl-7 leading-relaxed">
          {agent.factLine}
        </p>
      ) : (
        <p className="font-mono text-xs text-muted-ink italic mt-1 pl-7">
          Waiting for data...
        </p>
      )}

      {agent.narration && (
        <div className="mt-2 pl-7 text-xs text-ink bg-paper-deep/60 p-2 rounded border border-rule/80 font-sans leading-snug">
          &ldquo;{agent.narration}&rdquo;
        </div>
      )}
    </div>
  );
};
