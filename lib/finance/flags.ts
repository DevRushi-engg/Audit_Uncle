import { Flag, WeekdayStat } from "@/types/finance";

interface FlagInputFacts {
  runway: { survivalDays: number | null };
  totalSales: number;
  totalExpenses: number;
  paymentSplit: { cashSharePct: number };
  weekdayStats: WeekdayStat[];
  bestDay: { date: string; sales: number } | null;
}

export function buildFlags(facts: FlagInputFacts): Flag[] {
  const flags: Flag[] = [];

  // 1. Runway Warning
  const survival = facts.runway.survivalDays;
  if (survival !== null) {
    if (survival < 15) {
      flags.push({
        id: "runway-critical",
        severity: "HIGH",
        text: `Critical Runway: Only ${survival} days of cash remaining at current daily expense rate.`,
      });
    } else if (survival < 30) {
      flags.push({
        id: "runway-short",
        severity: "HIGH",
        text: `Short Runway Alert: Cash buffer lasts ${survival} days. Immediate expense trimming or credit recovery needed.`,
      });
    } else if (survival < 60) {
      flags.push({
        id: "runway-medium",
        severity: "MEDIUM",
        text: `Moderate Runway: ${survival} days remaining. Maintain cash reserve for unexpected dips.`,
      });
    }
  }

  // 2. Expense Ratio Alert
  if (facts.totalSales > 0) {
    const expenseRatio = (facts.totalExpenses / facts.totalSales) * 100;
    if (expenseRatio > 90) {
      flags.push({
        id: "expense-ratio-critical",
        severity: "HIGH",
        text: `High Burn Rate: Expenses consume ${expenseRatio.toFixed(1)}% of all sales revenue.`,
      });
    } else if (expenseRatio > 85) {
      flags.push({
        id: "expense-ratio-warning",
        severity: "MEDIUM",
        text: `Tight Operating Margin: Expenses are ${expenseRatio.toFixed(1)}% of total revenues.`,
      });
    }
  }

  // 3. Weak Weekday Pattern
  if (facts.weekdayStats.length > 0) {
    const avgDailySales =
      facts.weekdayStats.reduce((sum, w) => sum + w.avgSales, 0) /
      Math.max(1, facts.weekdayStats.filter((w) => w.count > 0).length);

    for (const w of facts.weekdayStats) {
      if (w.count > 0 && avgDailySales > 0) {
        const dropPct = ((avgDailySales - w.avgSales) / avgDailySales) * 100;
        if (dropPct > 35) {
          flags.push({
            id: `weak-${w.dayName.toLowerCase()}`,
            severity: "LOW",
            text: `${w.dayName}s are ${dropPct.toFixed(0)}% below your average daily sales. Consider a weekday bundle offer.`,
          });
        }
      }
    }
  }

  // 4. Cash Reliance Flag
  if (facts.paymentSplit.cashSharePct > 80) {
    flags.push({
      id: "cash-reliance-high",
      severity: "LOW",
      text: `Cash transactions account for ${facts.paymentSplit.cashSharePct.toFixed(0)}% of revenue. Higher digital volume qualifies for 6% presumptive tax.`,
    });
  }

  // 5. Revenue Concentration on Single Day
  if (facts.bestDay && facts.totalSales > 0) {
    const singleDayShare = (facts.bestDay.sales / facts.totalSales) * 100;
    if (singleDayShare > 25) {
      flags.push({
        id: "spike-day-concentration",
        severity: "LOW",
        text: `Single peak day (${facts.bestDay.date}) contributed ${singleDayShare.toFixed(0)}% of overall sales.`,
      });
    }
  }

  // Fallback benign flag if empty
  if (flags.length === 0) {
    flags.push({
      id: "steady-state",
      severity: "LOW",
      text: "Cash velocity is steady with balanced expense ratios across the observation window.",
    });
  }

  return flags;
}
