"use client";

import React, { useMemo } from "react";
import type { AgentState, AgentId, CfoMemo as CfoMemoType } from "@/types/finance";
import { SectionHeader } from "./SectionHeader";
import { AgentRow } from "./AgentRow";
import { CfoMemo } from "./CfoMemo";

interface AgentRoomProps {
  agents: AgentState[];
  memo?: CfoMemoType | null;
}

const AGENT_ORDER: AgentId[] = ["cleaner", "analyst", "tax", "risk", "cfo"];

const DEFAULT_AGENTS: AgentState[] = [
  { id: "cleaner", status: "waiting", factLine: "Awaiting CSV to parse and clean.", narratedBy: "code" },
  { id: "analyst", status: "waiting", factLine: "Awaiting cleaned transactions for trends.", narratedBy: "code" },
  { id: "tax", status: "waiting", factLine: "Awaiting turnover calculation.", narratedBy: "code" },
  { id: "risk", status: "waiting", factLine: "Awaiting cash and runway health signals.", narratedBy: "code" },
  { id: "cfo", status: "waiting", factLine: "Awaiting agent fact synthesis.", narratedBy: "code" },
];

export const AgentRoom: React.FC<AgentRoomProps> = ({ agents, memo }) => {
  // Ensure all 5 agents are always present in fixed order
  const orderedAgents = useMemo(() => {
    const map = new Map<AgentId, AgentState>();
    agents.forEach((a) => map.set(a.id, a));

    return AGENT_ORDER.map((id) => {
      const existing = map.get(id);
      if (existing) return existing;
      const def = DEFAULT_AGENTS.find((d) => d.id === id);
      return def || { id, status: "waiting" as const, factLine: "", narratedBy: "code" as const };
    });
  }, [agents]);

  // Live announcement message for accessibility
  const lastCompleted = useMemo(() => {
    const finished = agents.filter((a) => a.status === "done" || a.status === "fallback");
    if (finished.length === 0) return "";
    const latest = finished[finished.length - 1];
    return `${latest.id.toUpperCase()} agent completed calculation.`;
  }, [agents]);

  return (
    <div className="bg-paper border-2 border-ink rounded-lg p-4 sm:p-5 shadow-[3px_3px_0px_#1A1A1A]">
      <SectionHeader number={3} title="AGENT // ROOM" />

      {/* Screen reader live announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {lastCompleted}
      </div>

      <div className="mt-3 text-xs font-mono text-muted-ink mb-3">
        On-device agent pipeline · Deterministic code + AI explanation
      </div>

      {/* Agent list */}
      <div className="space-y-2.5">
        {orderedAgents.map((agent) => (
          <AgentRow key={agent.id} agent={agent} />
        ))}
      </div>

      {/* CFO Memo if available */}
      {memo && <CfoMemo memo={memo} />}
    </div>
  );
};
