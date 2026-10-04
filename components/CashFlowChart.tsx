"use client";

import React, { useId, useMemo, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DailyPoint, Forecast } from "@/types/finance";
import { formatINR, formatShortINR } from "@/lib/finance/format";
import { LIMITS } from "@/config/app.config";

interface CashFlowChartProps {
  series: DailyPoint[];
  forecast: Forecast;
  bestDay: { date: string; sales: number } | null;
  worstDay: { date: string; sales: number } | null;
  hideForecast?: boolean;
}

export function CashFlowChart({ series, forecast, bestDay, worstDay, hideForecast }: CashFlowChartProps) {
  const [granularity, setGranularity] = useState<"daily" | "weekly">("daily");
  const patternId = useId();

  const showForecast = hideForecast !== undefined ? !hideForecast : series.length >= LIMITS.minDaysForRunway;

  // Aggregate weekly if selected
  const chartData = useMemo(() => {
    if (granularity === "daily") {
      // Historical points
      const historical = series.map((d) => ({
        date: d.date.slice(5), // mm-dd
        fullDate: d.date,
        inflow: d.sales,
        outflow: d.expenses,
        balance: d.balance,
        forecastBalance: undefined as number | undefined,
        rangeLow: undefined as number | undefined,
        rangeHigh: undefined as number | undefined,
        rangeBand: undefined as [number, number] | undefined,
        isForecast: false,
      }));

      if (!showForecast) return historical;

      // Append forecast points
      const future = forecast.points.slice(0, 14).map((f) => ({
        date: f.date.slice(5),
        fullDate: f.date,
        inflow: undefined as number | undefined,
        outflow: undefined as number | undefined,
        balance: undefined as number | undefined,
        forecastBalance: f.balance,
        rangeLow: f.low,
        rangeHigh: f.high,
        rangeBand: [f.low, f.high] as [number, number],
        isForecast: true,
      }));

      // Connect the bridge between historical and forecast
      if (historical.length > 0 && future.length > 0) {
        historical[historical.length - 1].forecastBalance = historical[historical.length - 1].balance;
      }

      return [...historical, ...future];
    } else {
      // Weekly rollup
      const weeks: {
        date: string;
        fullDate: string;
        inflow: number;
        outflow: number;
        balance: number;
        forecastBalance: number | undefined;
        isForecast: boolean;
      }[] = [];

      let curInflow = 0;
      let curOutflow = 0;
      let curEndBalance = 0;

      for (let i = 0; i < series.length; i++) {
        const d = series[i];
        curInflow += d.sales;
        curOutflow += d.expenses;
        curEndBalance = d.balance;

        if (i % 7 === 6 || i === series.length - 1) {
          weeks.push({
            date: `W${weeks.length + 1} (${d.date.slice(5)})`,
            fullDate: d.date,
            inflow: curInflow,
            outflow: curOutflow,
            balance: curEndBalance,
            forecastBalance: undefined,
            isForecast: false,
          });
          curInflow = 0;
          curOutflow = 0;
        }
      }

      return weeks;
    }
  }, [series, forecast, granularity, showForecast]);

  const screenReaderSummary = useMemo(() => {
    if (!bestDay) return "Cash flow chart showing daily ledger movements.";
    return `Sales peaked on ${bestDay.date} at ${formatINR(bestDay.sales)}; lowest sales day was ${
      worstDay ? worstDay.date : "N/A"
    } at ${worstDay ? formatINR(worstDay.sales) : "N/A"}.`;
  }, [bestDay, worstDay]);

  return (
    <div className="p-3.5 sm:p-4 bg-white border-2 border-[#1A1A1A] rounded-lg shadow-[2px_2px_0px_#1A1A1A]">
      {/* Header and Granularity Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-[#E2D6B8]">
        <div>
          <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
            <span>ROZ-ROZ NAQAD // CASH FLOW</span>
            {showForecast && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#E8F5E9] text-[#1B5E20] border border-[#2E7D4F]/30">
                +14d Forecast
              </span>
            )}
          </h3>
          <p className="text-[11px] text-[#6B645A]">Inflow, hatched outflow, and net balance trajectory</p>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-[#F3EAD3] border border-[#1A1A1A] rounded text-[11px] font-mono font-bold">
          <button
            type="button"
            onClick={() => setGranularity("daily")}
            className={`px-2 py-0.5 rounded transition-all ${
              granularity === "daily"
                ? "bg-[#E8A317] text-[#1A1A1A] border border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A]"
                : "text-[#6B645A] hover:text-[#1A1A1A]"
            }`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => setGranularity("weekly")}
            className={`px-2 py-0.5 rounded transition-all ${
              granularity === "weekly"
                ? "bg-[#E8A317] text-[#1A1A1A] border border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A]"
                : "text-[#6B645A] hover:text-[#1A1A1A]"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Screen Reader Only Accessibility Text */}
      <div className="sr-only">{screenReaderSummary}</div>

      {/* Chart Canvas with horizontal scroll wrapper on mobile */}
      <div className="overflow-x-auto">
        <div className="min-w-[620px] h-[280px] sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 18, right: 12, left: -10, bottom: 4 }}>
              <defs>
                {/* Diagonal hatch pattern for outflow bars */}
                <pattern
                  id={`hatch-${patternId}`}
                  width="8"
                  height="8"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#A8231B" strokeWidth="2.5" />
                  <line x1="4" y1="0" x2="4" y2="8" stroke="#FFFDF7" strokeWidth="1.5" />
                </pattern>
                {/* Shaded forecast range band */}
                <linearGradient id={`forecastBand-${patternId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#23408E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#23408E" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#E2D6B8" vertical={false} />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#6B645A", fontFamily: "monospace" }}
                stroke="#1A1A1A"
                tickLine={false}
              />

              <YAxis
                tickFormatter={formatShortINR}
                tick={{ fontSize: 10, fill: "#6B645A", fontFamily: "monospace" }}
                stroke="#1A1A1A"
                tickLine={false}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="p-2.5 bg-white border-2 border-[#1A1A1A] rounded shadow-[3px_3px_0px_#1A1A1A] font-mono text-xs">
                        <div className="font-bold text-[#1A1A1A] pb-1 mb-1 border-b border-[#E2D6B8]">
                          {item.fullDate || item.date}
                          {item.isForecast && (
                            <span className="text-[10px] text-[#23408E] ml-1">(Forecast)</span>
                          )}
                        </div>
                        {item.inflow !== undefined && (
                          <div className="text-[#23408E] font-bold">
                            Inflow (Sales): {formatINR(item.inflow)}
                          </div>
                        )}
                        {item.outflow !== undefined && (
                          <div className="text-[#A8231B] font-bold">
                            Outflow (Expenses): {formatINR(item.outflow)}
                          </div>
                        )}
                        {item.balance !== undefined && (
                          <div className="text-[#1A1A1A] font-bold">
                            Balance: {formatINR(item.balance)}
                          </div>
                        )}
                        {item.forecastBalance !== undefined && (
                          <div className="text-[#23408E] font-bold">
                            Proj Balance: {formatINR(item.forecastBalance)}
                          </div>
                        )}
                        {item.rangeLow !== undefined && (
                          <div className="text-[10px] text-[#6B645A]">
                            Range: {formatINR(item.rangeLow)} - {formatINR(item.rangeHigh)}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Inflow bars (Pen-Blue) */}
              <Bar dataKey="inflow" fill="#23408E" barSize={8} />

              {/* Outflow bars (Hatched Ledger-Red) */}
              <Bar dataKey="outflow" fill={`url(#hatch-${patternId})`} stroke="#A8231B" barSize={8} />

              {/* Historical running cash balance line */}
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#1A1A1A"
                strokeWidth={2.5}
                dot={false}
              />

              {/* Forecast range shaded area */}
              {showForecast && (
                <Area
                  type="monotone"
                  dataKey="rangeHigh"
                  stroke="none"
                  fill={`url(#forecastBand-${patternId})`}
                />
              )}

              {/* Forecast projected balance dashed line */}
              {showForecast && (
                <Line
                  type="monotone"
                  dataKey="forecastBalance"
                  stroke="#23408E"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              )}

              {/* Flag annotations for best/worst day */}
              {granularity === "daily" && bestDay && (
                <ReferenceDot
                  x={bestDay.date.slice(5)}
                  y={bestDay.sales}
                  r={5}
                  fill="#2E7D4F"
                  stroke="#1A1A1A"
                  strokeWidth={1.5}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* One-Line Legend Below Chart */}
      <div className="mt-3 pt-2 border-t border-[#E2D6B8] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono font-bold text-[#1A1A1A]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 bg-[#23408E] border border-[#1A1A1A]" />
            Inflow (Sales)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 bg-[#A8231B] border border-[#1A1A1A] hatch-red-pattern" />
            Outflow (Expenses)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5 bg-[#1A1A1A]" />
            Net Cash Balance
          </span>
          {showForecast && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-0.5 border-t border-dashed border-[#23408E]" />
              14d Forecast
            </span>
          )}
        </div>

        {bestDay && (
          <div className="text-[10px] text-[#2E7D4F] font-bold">
            ★ Peak Day: {bestDay.date} ({formatINR(bestDay.sales)})
          </div>
        )}
      </div>
    </div>
  );
}
