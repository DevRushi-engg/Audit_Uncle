import { DailyPoint, Forecast, ForecastPoint } from "@/types/finance";

export function forecastNext(series: DailyPoint[], forecastDays = 30): Forecast {
  if (series.length === 0) {
    return { points: [], endBalanceLow: 0, endBalanceHigh: 0 };
  }

  // Last 30 days for daily expense rate
  const recentDays = series.slice(-30);
  const totalRecentExpenses = recentDays.reduce((acc, d) => acc + d.expenses, 0);
  const avgDailyExpenses = recentDays.length > 0 ? totalRecentExpenses / recentDays.length : 0;

  // Last 28 days for weekday mean sales
  const last28 = series.slice(-28);
  const weekdaySalesBuckets: number[][] = [[], [], [], [], [], [], []];
  for (const d of last28) {
    const dayOfWeek = new Date(d.date + "T00:00:00Z").getUTCDay();
    weekdaySalesBuckets[dayOfWeek].push(d.sales);
  }

  const weekdayMeanSales = weekdaySalesBuckets.map((bucket) => {
    if (bucket.length === 0) return 0;
    return bucket.reduce((a, b) => a + b, 0) / bucket.length;
  });

  // Calculate standard deviation of daily net over the last 30 days
  const dailyNets = recentDays.map((d) => d.net);
  const meanNet = dailyNets.reduce((a, b) => a + b, 0) / Math.max(1, dailyNets.length);
  const variance = dailyNets.reduce((a, n) => a + Math.pow(n - meanNet, 2), 0) / Math.max(1, dailyNets.length);
  const stdDevDailyNet = Math.sqrt(variance);

  const lastPoint = series[series.length - 1];
  let runningBalance = lastPoint.balance;
  const lastDate = new Date(lastPoint.date + "T00:00:00Z");

  const points: ForecastPoint[] = [];

  for (let i = 1; i <= forecastDays; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setUTCDate(futureDate.getUTCDate() + i);
    const isoDate = futureDate.toISOString().split("T")[0];
    const dow = futureDate.getUTCDay();

    const expectedSales = Math.round(weekdayMeanSales[dow] || 0);
    const expectedExpenses = Math.round(avgDailyExpenses);
    const net = expectedSales - expectedExpenses;

    runningBalance += net;

    // Uncertainty band widens with square root of time
    const bandSpread = Math.round(stdDevDailyNet * Math.sqrt(i) * 1.2);
    const low = Math.round(runningBalance - bandSpread);
    const high = Math.round(runningBalance + bandSpread);

    points.push({
      date: isoDate,
      sales: expectedSales,
      expenses: expectedExpenses,
      balance: Math.round(runningBalance),
      low,
      high,
    });
  }

  const endPoint = points[points.length - 1];

  return {
    points,
    endBalanceLow: endPoint ? endPoint.low : runningBalance,
    endBalanceHigh: endPoint ? endPoint.high : runningBalance,
  };
}
