"use client";

import React from "react";
import type { WhatIfInput, WhatIfResult } from "@/types/finance";
import { ASSUMPTIONS } from "@/config/app.config";
import { formatINR, formatDays } from "@/lib/finance/format";

interface WhatIfPanelProps {
  input: WhatIfInput;
  result: WhatIfResult | null;
  onChange: (input: WhatIfInput) => void;
  onReset: () => void;
}

export const WhatIfPanel: React.FC<WhatIfPanelProps> = ({
  input,
  result,
  onChange,
  onReset,
}) => {
  const handlePriceChange = (val: number) => {
    onChange({ ...input, priceChangePct: val });
  };

  const handleExpenseChange = (val: number) => {
    onChange({ ...input, expenseChangePct: val });
  };

  const handleSpendChange = (val: number) => {
    const safeVal = Math.max(0, isNaN(val) ? 0 : val);
    onChange({ ...input, oneTimeSpend: safeVal });
  };

  const formatDelta = (delta: number, isCurrency = true) => {
    const isPositive = delta > 0;
    const isNegative = delta < 0;
    const arrow = isPositive ? "▲" : isNegative ? "▼" : "—";
    const colorClass = isPositive
      ? "text-tulsi font-semibold"
      : isNegative
      ? "text-ledger-red font-semibold"
      : "text-muted-ink";

    const formattedVal = isCurrency
      ? formatINR(Math.abs(delta))
      : `${Math.abs(delta)} days`;

    return (
      <span className={`inline-flex items-center gap-1 font-mono text-xs ${colorClass}`}>
        <span>{arrow}</span>
        <span>
          {isPositive ? "+" : isNegative ? "-" : ""}
          {formattedVal}
        </span>
      </span>
    );
  };

  return (
    <div className="bg-paper border-2 border-ink rounded-lg p-4 sm:p-5 shadow-[3px_3px_0px_#1A1A1A] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-ink pb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs sm:text-sm font-bold text-ink tracking-wider">
            KYA-AGAR // WHAT IF
          </span>
          <span className="font-mono text-[10px] bg-paper-deep text-muted-ink px-1.5 py-0.5 rounded border border-rule">
            SIMULATOR
          </span>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="font-mono text-[11px] text-muted-ink hover:text-ink underline uppercase transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-paper-deep/50 p-3 sm:p-4 rounded-lg border border-rule">
        {/* Slider 1: Price Change */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-muted-ink uppercase">Price Change</span>
            <span
              className={`font-bold tabular-nums ${
                input.priceChangePct > 0
                  ? "text-tulsi"
                  : input.priceChangePct < 0
                  ? "text-ledger-red"
                  : "text-ink"
              }`}
            >
              {input.priceChangePct > 0 ? `+${input.priceChangePct}%` : `${input.priceChangePct}%`}
            </span>
          </div>
          <div className="h-11 flex items-center">
            <input
              type="range"
              min="-10"
              max="15"
              step="1"
              value={input.priceChangePct}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              className="w-full accent-turmeric cursor-pointer h-2 bg-rule rounded-lg"
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-muted-ink">
            <span>-10%</span>
            <span>0%</span>
            <span>+15%</span>
          </div>
        </div>

        {/* Slider 2: Monthly Expenses */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-muted-ink uppercase">Expense Change</span>
            <span
              className={`font-bold tabular-nums ${
                input.expenseChangePct > 0
                  ? "text-ledger-red"
                  : input.expenseChangePct < 0
                  ? "text-tulsi"
                  : "text-ink"
              }`}
            >
              {input.expenseChangePct > 0
                ? `+${input.expenseChangePct}%`
                : `${input.expenseChangePct}%`}
            </span>
          </div>
          <div className="h-11 flex items-center">
            <input
              type="range"
              min="-20"
              max="20"
              step="1"
              value={input.expenseChangePct}
              onChange={(e) => handleExpenseChange(Number(e.target.value))}
              className="w-full accent-turmeric cursor-pointer h-2 bg-rule rounded-lg"
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-muted-ink">
            <span>-20%</span>
            <span>0%</span>
            <span>+20%</span>
          </div>
        </div>

        {/* Control 3: One-time Spend */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-muted-ink uppercase">One-time Purchase</span>
            <span className="font-bold text-ink tabular-nums">
              {formatINR(input.oneTimeSpend)}
            </span>
          </div>
          <div className="h-11 flex items-center">
            <div className="relative w-full">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-ink">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                value={input.oneTimeSpend === 0 ? "" : input.oneTimeSpend}
                placeholder="0"
                onChange={(e) => handleSpendChange(Number(e.target.value))}
                className="w-full bg-paper border border-ink rounded px-7 py-2 text-xs font-mono text-ink tabular-nums focus:outline-none focus:ring-1 focus:ring-turmeric"
              />
            </div>
          </div>
          <div className="text-[10px] font-mono text-muted-ink">
            e.g. Fridge, machinery, renovation
          </div>
        </div>
      </div>

      {/* Assumption text */}
      <div className="text-[11px] font-mono text-muted-ink bg-paper-deep/60 px-3 py-1.5 rounded border border-rule">
        * Elasticity assumption: {ASSUMPTIONS.priceElasticity * 10}% of customers leave per 10% price rise. Pure deterministic calculation.
      </div>

      {/* Comparison Table */}
      {result && (
        <div className="overflow-x-auto border-2 border-ink rounded-lg bg-paper">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-paper-deep border-b-2 border-ink text-muted-ink uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Metric</th>
                <th className="py-2.5 px-3">Baseline</th>
                <th className="py-2.5 px-3 bg-turmeric/10 font-bold text-ink">
                  Scenario
                </th>
                <th className="py-2.5 px-3">Impact / Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {/* Runway Days */}
              <tr>
                <td className="py-2.5 px-3 font-semibold text-ink">Survival Runway</td>
                <td className="py-2.5 px-3 text-muted-ink tabular-nums">
                  {formatDays(result.baseline.runwayDays)}
                </td>
                <td className="py-2.5 px-3 font-bold bg-turmeric/10 text-ink tabular-nums">
                  {formatDays(result.scenario.runwayDays)}
                </td>
                <td className="py-2.5 px-3 tabular-nums">
                  {result.deltas.runwayDays !== null
                    ? formatDelta(result.deltas.runwayDays, false)
                    : "—"}
                </td>
              </tr>

              {/* 30-day Net */}
              <tr>
                <td className="py-2.5 px-3 font-semibold text-ink">30-day Projected Net</td>
                <td className="py-2.5 px-3 text-muted-ink tabular-nums">
                  {formatINR(result.baseline.net30)}
                </td>
                <td className="py-2.5 px-3 font-bold bg-turmeric/10 text-ink tabular-nums">
                  {formatINR(result.scenario.net30)}
                </td>
                <td className="py-2.5 px-3 tabular-nums">
                  {formatDelta(result.deltas.net30, true)}
                </td>
              </tr>

              {/* End Cash */}
              <tr>
                <td className="py-2.5 px-3 font-semibold text-ink">Day 30 Cash Balance</td>
                <td className="py-2.5 px-3 text-muted-ink tabular-nums">
                  {formatINR(result.baseline.endCash)}
                </td>
                <td className="py-2.5 px-3 font-bold bg-turmeric/10 text-ink tabular-nums">
                  {formatINR(result.scenario.endCash)}
                </td>
                <td className="py-2.5 px-3 tabular-nums">
                  {formatDelta(result.deltas.endCash, true)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
