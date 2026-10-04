"use client";

import React from "react";
import type {
  ReportState,
  FinanceFacts,
  WhatIfInput,
  WhatIfResult,
  CfoMemo as CfoMemoType,
  AgentState,
} from "@/types/finance";
import { LIMITS } from "@/config/app.config";
import { formatINR, formatDays } from "@/lib/finance/format";
import { SectionHeader } from "./SectionHeader";
import { EmptyState } from "./EmptyState";
import { AnalyzingState } from "./AnalyzingState";
import { ErrorState } from "./ErrorState";
import { HealthScoreStamp } from "./HealthScoreStamp";
import { KpiRow } from "./KpiRow";
import { CfoMemo } from "./CfoMemo";
import { CashFlowChart } from "./CashFlowChart";
import { RunwayCard } from "./RunwayCard";
import { TaxEstimateCard } from "./TaxEstimateCard";
import { InsightList } from "./InsightList";
import { WhatIfPanel } from "./WhatIfPanel";
import { AgentRoom } from "./AgentRoom";

interface DashboardPanelProps {
  reportState: ReportState;
  facts: FinanceFacts | null;
  memo?: CfoMemoType | null;
  agents?: AgentState[];
  whatIfInput: WhatIfInput;
  whatIfResult: WhatIfResult | null;
  onWhatIfChange: (input: WhatIfInput) => void;
  onWhatIfReset: () => void;
  onLoadKiranaSample: () => void;
  errorMessage?: string;
  onOpenMapper?: () => void;
}

export const DashboardPanel: React.FC<DashboardPanelProps> = ({
  reportState,
  facts,
  memo,
  agents = [],
  whatIfInput,
  whatIfResult,
  onWhatIfChange,
  onWhatIfReset,
  onLoadKiranaSample,
  errorMessage,
  onOpenMapper,
}) => {
  return (
    <div className="space-y-6">
      <SectionHeader
        number={2}
        title="DASHBOARD // EXECUTIVE FINANCIAL HISAB"
        badge={
          facts
            ? `${facts.dailySeries.length} Days Recorded · ${formatINR(facts.cashNow)} In Hand`
            : undefined
        }
      />

      {/* 1. Empty State */}
      {reportState === "empty" && (
        <EmptyState onLoadSample={onLoadKiranaSample} />
      )}

      {/* 2. Analyzing State */}
      {reportState === "analyzing" && <AnalyzingState />}

      {/* 3. Error State */}
      {reportState === "error" && (
        <ErrorState
          kind="csv"
          message={errorMessage}
          onAction={onOpenMapper}
        />
      )}

      {/* 4. Complete Executive Dashboard Results */}
      {(reportState === "results" || (reportState === "mapping" && facts)) && facts && (
        <div className="space-y-6">
          {/* Executive Overview Banner */}
          <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-xl p-5 shadow-[3px_3px_0px_#1A1A1A]">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
              <div className="shrink-0 flex items-center justify-center">
                <HealthScoreStamp score={facts.score} />
              </div>

              <div className="grow space-y-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="font-mono text-xs uppercase font-bold px-2 py-0.5 rounded bg-[#E8A317] text-[#1A1A1A] border border-[#1A1A1A]">
                    EXECUTIVE SUMMARY
                  </span>
                  <span className="font-mono text-xs text-[#6B645A]">
                    Deterministic Math + OpenRouter Gemma AI
                  </span>
                </div>

                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A] leading-snug">
                  {facts.score.band === "healthy"
                    ? "Your shop's financial footing is solid."
                    : facts.score.band === "watch"
                    ? "Your business is stable, but cash buffers require attention."
                    : "Immediate cash flow discipline recommended."}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-[#1A1A1A]/80 leading-relaxed">
                  Based on your ledger records, your current liquid cash is{" "}
                  <strong>{formatINR(facts.cashNow)}</strong>. At your recent 30-day average spending rate, this provides an estimated survival runway of{" "}
                  <strong>{formatDays(facts.runway.survivalDays)}</strong> if new sales completely stopped today.
                </p>

                {facts.bestDay && (
                  <div className="pt-2 border-t border-[#E2D6B8] flex flex-wrap items-center gap-4 text-[11px] font-mono text-[#6B645A]">
                    <span>
                      🏆 Peak Day: <strong>{facts.bestDay.date}</strong> ({formatINR(facts.bestDay.sales)})
                    </span>
                    {facts.worstDay && (
                      <span>
                        ⚠️ Slowest Day: <strong>{facts.worstDay.date}</strong> ({formatINR(facts.worstDay.sales)})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4 Spacious KPI Cards across the top */}
          <KpiRow facts={facts} />

          {/* Actionable CFO Memo right at the top */}
          {memo && (
            <div>
              <CfoMemo memo={memo} />
            </div>
          )}

          {/* Short Data Warning if days < 14 */}
          {facts.dailySeries.length < LIMITS.minDaysForRunway && (
            <ErrorState kind="short" />
          )}

          {/* Spacious Cash Flow & Forecast Chart */}
          <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-xl p-4 sm:p-6 shadow-[3px_3px_0px_#1A1A1A]">
            <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-3 mb-4">
              <div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-[#1A1A1A]">
                  Cash Flow & 30-Day Forward Projection
                </h4>
                <p className="font-mono text-xs text-[#6B645A]">
                  Inflow (Sales) vs Outflow (Expenses) & Running Cash Balance
                </p>
              </div>
            </div>

            <CashFlowChart
              series={facts.dailySeries}
              forecast={facts.forecast}
              bestDay={facts.bestDay}
              worstDay={facts.worstDay}
              hideForecast={facts.dailySeries.length < LIMITS.minDaysForRunway}
            />
          </div>

          {/* Runway and Tax Estimates side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <RunwayCard runway={facts.runway} />
            <TaxEstimateCard tax={facts.tax} />
          </div>

          {/* Interactive What-If Simulator (Kya-Agar) */}
          <WhatIfPanel
            input={whatIfInput}
            result={whatIfResult}
            onChange={onWhatIfChange}
            onReset={onWhatIfReset}
          />

          {/* Key Insights & Risk Flags */}
          <InsightList flags={facts.flags} />

          {/* Verified On-Device Agent Team */}
          {agents.length > 0 && (
            <div className="pt-2">
              <AgentRoom agents={agents} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
