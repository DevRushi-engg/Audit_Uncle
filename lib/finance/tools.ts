import { FinanceFacts, ToolName, ToolResult } from "@/types/finance";
import { formatDays, formatINR, formatPct } from "./format";

export function executeTool(
  name: ToolName,
  args: Record<string, unknown> = {},
  facts: FinanceFacts
): ToolResult {
  switch (name) {
    case "totalSales": {
      const period = (args.period as string) || "30d";
      let amount = 0;
      let label = "Total Sales";

      if (period === "7d") {
        const last7 = facts.dailySeries.slice(-7);
        amount = last7.reduce((sum, d) => sum + d.sales, 0);
        label = "Last 7 Days Sales";
      } else if (period === "30d") {
        amount = facts.last30Sales;
        label = "Last 30 Days Sales";
      } else {
        amount = facts.totalSales;
        label = "Total Observed Sales";
      }

      return {
        tool: "totalSales",
        args: { period },
        numbers: {
          [label]: formatINR(amount),
          "Daily Average": formatINR(amount / (period === "7d" ? 7 : period === "30d" ? 30 : Math.max(1, facts.dailySeries.length))),
        },
        rows: [
          [label, formatINR(amount)],
          ["Period Length", period === "7d" ? "7 days" : period === "30d" ? "30 days" : `${facts.dailySeries.length} days`],
        ],
        summaryText: `Your sales for the period (${period}) totaled ${formatINR(amount)}.`,
      };
    }

    case "bestWorstDays": {
      const best = facts.bestDay;
      const worst = facts.worstDay;

      return {
        tool: "bestWorstDays",
        args,
        numbers: {
          "Best Day Sales": best ? formatINR(best.sales) : "N/A",
          "Worst Day Sales": worst ? formatINR(worst.sales) : "N/A",
        },
        rows: [
          ["Peak Record Day", best ? `${best.date} (${formatINR(best.sales)})` : "N/A"],
          ["Lowest Slow Day", worst ? `${worst.date} (${formatINR(worst.sales)})` : "N/A"],
        ],
        summaryText: best
          ? `Your best sales day was ${best.date} at ${formatINR(best.sales)}, and lowest was ${worst ? worst.date : ""} at ${worst ? formatINR(worst.sales) : ""}.`
          : "Insufficient transaction records to determine peak days.",
      };
    }

    case "weekdayPerformance": {
      const requestedDay = typeof args.weekday === "string" ? args.weekday.toLowerCase() : undefined;
      const weekdayRows: string[][] = [["Weekday", "Avg Sales", "Transactions"]];

      let targetStat = facts.weekdayStats[0];
      if (requestedDay) {
        const found = facts.weekdayStats.find((w) => w.dayName.toLowerCase().startsWith(requestedDay.slice(0, 3)));
        if (found) targetStat = found;
      }

      for (const w of facts.weekdayStats) {
        weekdayRows.push([w.dayName, formatINR(w.avgSales), `${w.count} days`]);
      }

      const overallAvg =
        facts.weekdayStats.reduce((sum, w) => sum + w.avgSales, 0) / Math.max(1, facts.weekdayStats.length);
      const diffPct = overallAvg > 0 ? ((targetStat.avgSales - overallAvg) / overallAvg) * 100 : 0;

      return {
        tool: "weekdayPerformance",
        args: { weekday: targetStat.dayName },
        numbers: {
          [`${targetStat.dayName} Average`]: formatINR(targetStat.avgSales),
          "Overall Daily Average": formatINR(overallAvg),
          "Difference vs Average": `${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(1)}%`,
        },
        rows: weekdayRows,
        summaryText: `${targetStat.dayName} averages ${formatINR(targetStat.avgSales)}, which is ${Math.abs(diffPct).toFixed(1)}% ${diffPct >= 0 ? "above" : "below"} your overall daily average (${formatINR(overallAvg)}).`,
      };
    }

    case "affordability": {
      const amount = typeof args.amount === "number" ? args.amount : parseFloat(String(args.amount || "0")) || 40000;
      const cashAfterPurchase = Math.max(0, facts.cashNow - amount);
      const dailyExpenses = facts.last30Expenses / 30;
      const runwayAfter = dailyExpenses > 0 ? Math.round(cashAfterPurchase / dailyExpenses) : 999;
      const canAffordSafely = cashAfterPurchase > facts.last30Expenses && runwayAfter >= 30;

      return {
        tool: "affordability",
        args: { amount },
        numbers: {
          "Proposed Purchase": formatINR(amount),
          "Current Cash in Hand": formatINR(facts.cashNow),
          "Cash Remaining After": formatINR(cashAfterPurchase),
          "Runway After Purchase": formatDays(runwayAfter),
          "Projected 30d Min Cash": formatINR(facts.forecast.endBalanceLow),
        },
        rows: [
          ["Item Cost", formatINR(amount)],
          ["Current Liquid Cash", formatINR(facts.cashNow)],
          ["Buffer After Purchase", formatINR(cashAfterPurchase)],
          ["New Survival Runway", formatDays(runwayAfter)],
          ["Verdict", canAffordSafely ? "Affordable (Runway stays >30 days)" : "Tight (Reduces buffer below 30 days)"],
        ],
        summaryText: canAffordSafely
          ? `You have ${formatINR(facts.cashNow)} in hand. After spending ${formatINR(amount)}, you will have ${formatINR(cashAfterPurchase)} with ${runwayAfter} days of runway.`
          : `Spending ${formatINR(amount)} drops cash to ${formatINR(cashAfterPurchase)} (${runwayAfter} days runway), which is below the safe 30-day cushion.`,
      };
    }

    case "runwayNow": {
      const survival = facts.runway.survivalDays;
      const trend = facts.runway.trendDays;

      return {
        tool: "runwayNow",
        args,
        numbers: {
          "Survival Runway": formatDays(survival),
          "Trend Trajectory": typeof trend === "number" ? formatDays(trend) : "Cash Positive",
          "Current Cash": formatINR(facts.cashNow),
          "Daily Expense Burn": formatINR(facts.last30Expenses / 30),
        },
        rows: [
          ["Survival Runway", formatDays(survival)],
          ["Trend Projection", typeof trend === "number" ? formatDays(trend) : "Cash Positive"],
          ["Assumption", facts.runway.assumption],
        ],
        summaryText: `Cash in hand is ${formatINR(facts.cashNow)}. Your survival runway is ${formatDays(survival)} if sales stopped today.`,
      };
    }

    case "topExpenses": {
      const rows: string[][] = [["Expense Category", "Total Spent", "Share"]];
      const numbers: Record<string, string> = {};

      for (const e of facts.topExpenses.slice(0, 5)) {
        rows.push([e.category, formatINR(e.amount), formatPct(e.sharePct)]);
        numbers[e.category] = formatINR(e.amount);
      }

      return {
        tool: "topExpenses",
        args,
        numbers,
        rows,
        summaryText:
          facts.topExpenses.length > 0
            ? `Your largest expense category is ${facts.topExpenses[0].category} at ${formatINR(facts.topExpenses[0].amount)} (${facts.topExpenses[0].sharePct.toFixed(1)}% of all expenses).`
            : "No categorized expenses recorded.",
      };
    }

    default: {
      return executeTool("runwayNow", args, facts);
    }
  }
}
