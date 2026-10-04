import { BusinessTypeId, DailyPoint, FinanceFacts, Transaction, WeekdayStat } from "@/types/finance";
import { computeRunway } from "./runway";
import { forecastNext } from "./forecast";
import { estimateTax } from "./tax";
import { computeScore } from "./score";
import { buildFlags } from "./flags";

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function buildDailySeries(transactions: Transaction[], openingCash: number): DailyPoint[] {
  if (transactions.length === 0) return [];

  // Group by date
  const dateMap: Record<string, { sales: number; expenses: number }> = {};
  for (const t of transactions) {
    if (!dateMap[t.date]) {
      dateMap[t.date] = { sales: 0, expenses: 0 };
    }
    if (t.type === "sale") {
      dateMap[t.date].sales += t.amount;
    } else {
      dateMap[t.date].expenses += t.amount;
    }
  }

  // Generate full contiguous calendar dates
  const sortedDates = Object.keys(dateMap).sort();
  const startDate = new Date(sortedDates[0] + "T00:00:00Z");
  const endDate = new Date(sortedDates[sortedDates.length - 1] + "T00:00:00Z");

  const series: DailyPoint[] = [];
  let runningBalance = openingCash;

  const cur = new Date(startDate);
  while (cur <= endDate) {
    const iso = cur.toISOString().split("T")[0];
    const data = dateMap[iso] || { sales: 0, expenses: 0 };
    const net = data.sales - data.expenses;
    runningBalance += net;

    series.push({
      date: iso,
      sales: Math.round(data.sales),
      expenses: Math.round(data.expenses),
      net: Math.round(net),
      balance: Math.round(runningBalance),
    });

    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return series;
}

export function computeFacts(
  transactions: Transaction[],
  openingCash: number,
  businessType: BusinessTypeId
): FinanceFacts {
  const dailySeries = buildDailySeries(transactions, openingCash);

  // Totals
  let totalSales = 0;
  let totalExpenses = 0;
  const paymentTotals = { cash: 0, upi: 0, card: 0, other: 0 };
  const expenseCatMap: Record<string, number> = {};

  for (const t of transactions) {
    if (t.type === "sale") {
      totalSales += t.amount;
    } else {
      totalExpenses += t.amount;
      const cat = t.category || "General Expense";
      expenseCatMap[cat] = (expenseCatMap[cat] || 0) + t.amount;
    }

    if (t.paymentMode) {
      paymentTotals[t.paymentMode] = (paymentTotals[t.paymentMode] || 0) + t.amount;
    } else {
      paymentTotals.cash += t.amount;
    }
  }

  const netIncome = totalSales - totalExpenses;
  const cashNow = openingCash + netIncome;

  const daysCount = Math.max(1, dailySeries.length);
  const dailyAvgSales = Math.round(totalSales / daysCount);
  const dailyAvgExpenses = Math.round(totalExpenses / daysCount);
  const dailyAvgNet = Math.round(netIncome / daysCount);

  // Last 30 days window vs Previous 30 days window
  const last30 = dailySeries.slice(-30);
  const prev30 = dailySeries.slice(-60, -30);

  const last30Sales = last30.reduce((sum, d) => sum + d.sales, 0);
  const last30Expenses = last30.reduce((sum, d) => sum + d.expenses, 0);
  const last30Net = last30Sales - last30Expenses;

  const prev30Sales = prev30.reduce((sum, d) => sum + d.sales, 0);
  const prev30Expenses = prev30.reduce((sum, d) => sum + d.expenses, 0);
  const prev30Net = prev30Sales - prev30Expenses;

  const salesDeltaPct =
    prev30Sales > 0 ? ((last30Sales - prev30Sales) / prev30Sales) * 100 : 0;
  const expensesDeltaPct =
    prev30Expenses > 0 ? ((last30Expenses - prev30Expenses) / prev30Expenses) * 100 : 0;
  const netDeltaPct =
    prev30Net !== 0 ? ((last30Net - prev30Net) / Math.abs(prev30Net)) * 100 : 0;

  // Best and worst day
  let bestDay: { date: string; sales: number } | null = null;
  let worstDay: { date: string; sales: number } | null = null;

  for (const d of dailySeries) {
    if (d.sales > 0) {
      if (!bestDay || d.sales > bestDay.sales) {
        bestDay = { date: d.date, sales: d.sales };
      }
      if (!worstDay || d.sales < worstDay.sales) {
        worstDay = { date: d.date, sales: d.sales };
      }
    }
  }

  // Weekday stats (Mon-Sun)
  const weekdayBuckets: { sales: number; expenses: number; count: number }[] = Array.from(
    { length: 7 },
    () => ({ sales: 0, expenses: 0, count: 0 })
  );

  for (const d of dailySeries) {
    const dow = new Date(d.date + "T00:00:00Z").getUTCDay();
    weekdayBuckets[dow].sales += d.sales;
    weekdayBuckets[dow].expenses += d.expenses;
    weekdayBuckets[dow].count++;
  }

  // Order from Monday (1) to Sunday (0)
  const orderedIndices = [1, 2, 3, 4, 5, 6, 0];
  const weekdayStats: WeekdayStat[] = orderedIndices.map((dow) => {
    const b = weekdayBuckets[dow];
    return {
      dayName: WEEKDAY_NAMES[dow],
      dayIndex: dow,
      totalSales: b.sales,
      avgSales: b.count > 0 ? Math.round(b.sales / b.count) : 0,
      avgExpenses: b.count > 0 ? Math.round(b.expenses / b.count) : 0,
      count: b.count,
    };
  });

  // Payment mode split
  const totalVolume = paymentTotals.cash + paymentTotals.upi + paymentTotals.card + paymentTotals.other;
  const cashSharePct = totalVolume > 0 ? (paymentTotals.cash / totalVolume) * 100 : 100;
  const digitalSharePct = 100 - cashSharePct;

  const paymentSplit = {
    cash: paymentTotals.cash,
    upi: paymentTotals.upi,
    card: paymentTotals.card,
    other: paymentTotals.other,
    cashSharePct,
    digitalSharePct,
  };

  // Top expense categories
  const topExpenses = Object.entries(expenseCatMap)
    .map(([category, amount]) => ({
      category,
      amount,
      sharePct: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Runway
  const last30DailyExpenses = last30.length > 0 ? last30Expenses / last30.length : dailyAvgExpenses;
  const last30DailyNet = last30.length > 0 ? last30Net / last30.length : dailyAvgNet;
  const runway = computeRunway(cashNow, last30DailyExpenses, last30DailyNet, dailySeries.length);

  // 30-Day Forecast
  const forecast = forecastNext(dailySeries, 30);

  // Tax Estimation
  const tax = estimateTax(
    {
      totalSales,
      totalExpenses,
      paymentSplit,
      dailySeries,
    },
    businessType
  );

  // Health Score
  const score = computeScore({
    runway,
    totalSales,
    netIncome,
    salesDeltaPct,
    paymentSplit,
  });

  // Risk and advisory flags
  const flags = buildFlags({
    runway,
    totalSales,
    totalExpenses,
    paymentSplit,
    weekdayStats,
    bestDay,
  });

  return {
    openingCash,
    cashNow,
    totalSales: Math.round(totalSales),
    totalExpenses: Math.round(totalExpenses),
    netIncome: Math.round(netIncome),
    dailyAvgSales,
    dailyAvgExpenses,
    dailyAvgNet,
    last30Sales: Math.round(last30Sales),
    last30Expenses: Math.round(last30Expenses),
    last30Net: Math.round(last30Net),
    prev30Sales: Math.round(prev30Sales),
    prev30Expenses: Math.round(prev30Expenses),
    prev30Net: Math.round(prev30Net),
    salesDeltaPct,
    expensesDeltaPct,
    netDeltaPct,
    bestDay,
    worstDay,
    weekdayStats,
    paymentSplit,
    topExpenses,
    dailySeries,
    runway,
    forecast,
    tax,
    score,
    flags,
  };
}
