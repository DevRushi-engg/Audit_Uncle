import { LIMITS } from "@/config/app.config";
import { Runway } from "@/types/finance";

export function computeRunway(
  cashNow: number,
  last30DailyExpenses: number,
  last30DailyNet: number,
  totalDays: number
): Runway {
  const assumption = "if sales stopped today and expenses continued at the last 30-day average";

  if (totalDays < LIMITS.minDaysForRunway) {
    return {
      survivalDays: null,
      trendDays: null,
      assumption: `Need at least ${LIMITS.minDaysForRunway} days of data to project runway`,
    };
  }

  // Survival runway: How long cash lasts if all sales drop to 0
  let survivalDays: number | null = null;
  if (last30DailyExpenses > 0) {
    survivalDays = Math.max(0, Math.round(cashNow / last30DailyExpenses));
  } else if (cashNow > 0) {
    survivalDays = 999;
  } else {
    survivalDays = 0;
  }

  // Trend runway: At current net trajectory
  let trendDays: number | "cash-positive" | null = null;
  if (last30DailyNet >= 0) {
    trendDays = "cash-positive";
  } else {
    const burn = Math.abs(last30DailyNet);
    trendDays = burn > 0 ? Math.max(0, Math.round(cashNow / burn)) : "cash-positive";
  }

  return {
    survivalDays,
    trendDays,
    assumption,
  };
}
