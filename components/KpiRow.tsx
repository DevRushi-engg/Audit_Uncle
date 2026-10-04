import React from "react";
import { formatINR, formatPct } from "@/lib/finance/format";
import type { FinanceFacts } from "@/types/finance";

interface KpiRowProps {
  sales?: number;
  expenses?: number;
  net?: number;
  cashNow?: number;
  salesDeltaPct?: number;
  expensesDeltaPct?: number;
  netDeltaPct?: number;
  facts?: FinanceFacts;
}

export function KpiRow(props: KpiRowProps) {
  const sales = props.facts ? props.facts.last30Sales : (props.sales ?? 0);
  const expenses = props.facts ? props.facts.last30Expenses : (props.expenses ?? 0);
  const net = props.facts ? props.facts.last30Net : (props.net ?? 0);
  const cashNow = props.facts ? props.facts.cashNow : (props.cashNow ?? 0);
  const salesDeltaPct = props.facts ? props.facts.salesDeltaPct : (props.salesDeltaPct ?? 0);
  const expensesDeltaPct = props.facts ? props.facts.expensesDeltaPct : (props.expensesDeltaPct ?? 0);
  const netDeltaPct = props.facts ? props.facts.netDeltaPct : (props.netDeltaPct ?? 0);
  // Delta helper: positive sales/net is good (tulsi), positive expenses is bad (ledger-red)
  const renderDelta = (delta: number, isInverse = false) => {
    if (delta === 0 || isNaN(delta)) return null;
    const isPositive = delta > 0;
    const isGood = isInverse ? !isPositive : isPositive;

    const symbol = isPositive ? "▲" : "▼";
    const colorClass = isGood
      ? "bg-[#E8F5E9] text-[#1B5E20] border-[#2E7D4F]/40"
      : "bg-[#FEF2F2] text-[#991B1B] border-[#A8231B]/40";

    return (
      <span
        className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded border text-[9px] sm:text-[10px] font-mono font-bold ${colorClass}`}
      >
        <span>{symbol}</span>
        <span>{Math.abs(delta).toFixed(1)}% vs prev 30d</span>
      </span>
    );
  };

  const kpis = [
    {
      label: "SALES",
      marathi: "विक्री",
      value: sales,
      delta: renderDelta(salesDeltaPct, false),
      accent: "border-l-4 border-l-[#23408E]",
    },
    {
      label: "EXPENSES",
      marathi: "खर्च",
      value: expenses,
      delta: renderDelta(expensesDeltaPct, true), // Expenses rising is bad
      accent: "border-l-4 border-l-[#A8231B]",
    },
    {
      label: "NET",
      marathi: "निव्वळ",
      value: net,
      delta: renderDelta(netDeltaPct, false),
      accent: "border-l-4 border-l-[#2E7D4F]",
    },
    {
      label: "CASH IN HAND",
      marathi: "गल्ला",
      value: cashNow,
      delta: (
        <span className="text-[9px] sm:text-[10px] font-mono text-[#6B645A] font-bold">
          Liquid Available
        </span>
      ),
      accent: "border-l-4 border-l-[#E8A317]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={`p-3 bg-white border-2 border-[#1A1A1A] rounded-lg shadow-[2px_2px_0px_#1A1A1A] flex flex-col justify-between ${kpi.accent}`}
        >
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#6B645A] uppercase tracking-wider">
              <span>{kpi.label}</span>
              <span className="text-[#A8231B] text-[9px] font-devanagari">{kpi.marathi}</span>
            </div>
            <div className="mt-1 text-base sm:text-lg lg:text-xl font-mono font-bold text-[#1A1A1A] tabular-numbers truncate">
              {formatINR(kpi.value)}
            </div>
          </div>
          <div className="mt-1.5 pt-1 border-t border-[#E2D6B8] flex items-center justify-between">
            {kpi.delta}
          </div>
        </div>
      ))}
    </div>
  );
}
