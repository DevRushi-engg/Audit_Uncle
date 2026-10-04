import { BANDS, SCORE_WEIGHTS } from "@/config/app.config";
import { HealthScore, ScoreFactor } from "@/types/finance";

interface ScoreInputFacts {
  runway: { survivalDays: number | null };
  totalSales: number;
  netIncome: number;
  salesDeltaPct: number;
  paymentSplit: { cashSharePct: number; digitalSharePct: number };
}

export function computeScore(facts: ScoreInputFacts): HealthScore {
  const factors: ScoreFactor[] = [];

  // 1. Runway Health (Max 35)
  // Full marks at >= 90 days, 0 at <= 15 days
  const survival = facts.runway.survivalDays;
  let runwayScore = 0;
  let runwayNote = "";

  if (survival === null) {
    runwayScore = 15;
    runwayNote = "Insufficient history (<14 days) to estimate runway";
  } else if (survival >= 90) {
    runwayScore = SCORE_WEIGHTS.runway;
    runwayNote = `Robust cash cushion of ${survival} days (exceeds 90-day threshold)`;
  } else if (survival <= 15) {
    runwayScore = 0;
    runwayNote = `Critical cash runway (${survival} days) requires immediate inflow`;
  } else {
    // Linear scale between 15 and 90
    const ratio = (survival - 15) / (90 - 15);
    runwayScore = Math.round(ratio * SCORE_WEIGHTS.runway);
    runwayNote = `Adequate runway of ${survival} days; target is 90+ days`;
  }
  factors.push({
    id: "runway",
    label: "Survival Runway",
    score: runwayScore,
    max: SCORE_WEIGHTS.runway,
    note: runwayNote,
  });

  // 2. Net Profit Margin (Max 25)
  // Full marks at >= 15% net margin
  const marginPct = facts.totalSales > 0 ? (facts.netIncome / facts.totalSales) * 100 : 0;
  let marginScore = 0;
  let marginNote = "";

  if (marginPct >= 15) {
    marginScore = SCORE_WEIGHTS.margin;
    marginNote = `Strong net margin of ${marginPct.toFixed(1)}% (benchmark: 15%+)`;
  } else if (marginPct <= 0) {
    marginScore = 0;
    marginNote = `Operating at negative or zero net margin (${marginPct.toFixed(1)}%)`;
  } else {
    marginScore = Math.round((marginPct / 15) * SCORE_WEIGHTS.margin);
    marginNote = `Moderate net margin of ${marginPct.toFixed(1)}%`;
  }
  factors.push({
    id: "margin",
    label: "Net Margin",
    score: marginScore,
    max: SCORE_WEIGHTS.margin,
    note: marginNote,
  });

  // 3. Sales Growth Trend (Max 20)
  // Last 30 vs prev 30 sales delta
  const delta = facts.salesDeltaPct;
  let trendScore = 0;
  let trendNote = "";

  if (delta >= 10) {
    trendScore = SCORE_WEIGHTS.trend;
    trendNote = `Strong upward sales growth (+${delta.toFixed(1)}% vs previous period)`;
  } else if (delta <= -15) {
    trendScore = 2;
    trendNote = `Sales down ${delta.toFixed(1)}% compared to previous period`;
  } else {
    // Linear between -15% and +10%
    const normalized = (delta + 15) / 25;
    trendScore = Math.round(Math.max(0, Math.min(1, normalized)) * SCORE_WEIGHTS.trend);
    trendNote = `Stable sales velocity (${delta >= 0 ? "+" : ""}${delta.toFixed(1)}% change)`;
  }
  factors.push({
    id: "trend",
    label: "Growth Velocity",
    score: trendScore,
    max: SCORE_WEIGHTS.trend,
    note: trendNote,
  });

  // 4. Cash Reliance & Traceability (Max 10)
  // Lower cash share = more digital & traceable. Full at <= 50% cash
  const cashShare = facts.paymentSplit.cashSharePct;
  let cashScore = 0;
  let cashNote = "";

  if (cashShare <= 50) {
    cashScore = SCORE_WEIGHTS.cashReliance;
    cashNote = `High digital adoption (${(100 - cashShare).toFixed(0)}% non-cash payments)`;
  } else if (cashShare >= 90) {
    cashScore = 2;
    cashNote = `Heavy reliance on physical cash (${cashShare.toFixed(0)}%) limits bankability`;
  } else {
    const ratio = (90 - cashShare) / 40;
    cashScore = Math.round(ratio * SCORE_WEIGHTS.cashReliance);
    cashNote = `Balanced payment mix (${cashShare.toFixed(0)}% cash / ${(100 - cashShare).toFixed(0)}% digital)`;
  }
  factors.push({
    id: "cashReliance",
    label: "Traceability & Cash Mix",
    score: cashScore,
    max: SCORE_WEIGHTS.cashReliance,
    note: cashNote,
  });

  // 5. Tax & Compliance Readiness (Max 10)
  // Digital share >= 50% gives 6% presumptive rate benefit
  const digitalShare = facts.paymentSplit.digitalSharePct;
  let taxScore = 5;
  let taxNote = "";

  if (digitalShare >= 50) {
    taxScore = SCORE_WEIGHTS.taxReadiness;
    taxNote = `Eligible for concessional 6% presumptive taxation via digital volume`;
  } else {
    taxScore = 6;
    taxNote = `Subject to standard 8% presumptive profit rate under Section 44AD`;
  }
  factors.push({
    id: "taxReadiness",
    label: "Compliance Readiness",
    score: taxScore,
    max: SCORE_WEIGHTS.taxReadiness,
    note: taxNote,
  });

  const total = factors.reduce((sum, f) => sum + f.score, 0);

  let band: "healthy" | "watch" | "danger" = "danger";
  if (total >= BANDS.healthy) {
    band = "healthy";
  } else if (total >= BANDS.watch) {
    band = "watch";
  }

  return {
    total,
    band,
    factors,
  };
}
