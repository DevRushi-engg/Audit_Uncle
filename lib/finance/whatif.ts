import { ASSUMPTIONS } from "@/config/app.config";
import { FinanceFacts, WhatIfInput, WhatIfResult } from "@/types/finance";

export function runWhatIf(facts: FinanceFacts, input: WhatIfInput): WhatIfResult {
  const { priceChangePct, expenseChangePct, oneTimeSpend } = input;

  // 1. Baseline metrics from actual facts and 30-day forecast
  const baselineRunway = facts.runway.survivalDays;
  const baseline30Net = facts.last30Net;
  const baselineEndCash = facts.cashNow + baseline30Net;

  // 2. Scenario Calculations
  // Volume elasticity effect: price rises -> volume drops
  // volumeChangePct = -priceChangePct * priceElasticity
  const volumeChangePct = -priceChangePct * ASSUMPTIONS.priceElasticity;

  // Effective revenue multiplier = (1 + priceChangePct / 100) * (1 + volumeChangePct / 100)
  const revenueMultiplier = (1 + priceChangePct / 100) * (1 + volumeChangePct / 100);

  // Expense multiplier = (1 + expenseChangePct / 100)
  const expenseMultiplier = 1 + expenseChangePct / 100;

  // Adjusted 30-day sales and expenses
  const scenario30Sales = Math.round(facts.last30Sales * revenueMultiplier);
  const scenario30Expenses = Math.round(facts.last30Expenses * expenseMultiplier);
  const scenario30Net = scenario30Sales - scenario30Expenses;

  // Cash on day 1 immediately absorbs one-time capital spend
  const scenarioDay1Cash = Math.max(0, facts.cashNow - Math.max(0, oneTimeSpend));
  const scenarioEndCash = Math.round(scenarioDay1Cash + scenario30Net);

  // Scenario daily expense rate
  const scenarioDailyExpenses = scenario30Expenses / 30;

  let scenarioRunwayDays: number | null = null;
  if (baselineRunway !== null) {
    if (scenarioDailyExpenses > 0) {
      scenarioRunwayDays = Math.max(0, Math.round(scenarioDay1Cash / scenarioDailyExpenses));
    } else {
      scenarioRunwayDays = 999;
    }
  }

  return {
    baseline: {
      runwayDays: baselineRunway,
      net30: baseline30Net,
      endCash: baselineEndCash,
    },
    scenario: {
      runwayDays: scenarioRunwayDays,
      net30: scenario30Net,
      endCash: scenarioEndCash,
    },
    deltas: {
      runwayDays:
        baselineRunway !== null && scenarioRunwayDays !== null
          ? scenarioRunwayDays - baselineRunway
          : null,
      net30: scenario30Net - baseline30Net,
      endCash: scenarioEndCash - baselineEndCash,
    },
  };
}
