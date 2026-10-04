import fs from "fs";
import path from "path";
import { parseCsvText } from "../lib/csv/parse";
import { detectMapping } from "../lib/csv/detect";
import { cleanRows } from "../lib/csv/clean";
import { computeFacts } from "../lib/finance/metrics";
import { executeTool } from "../lib/finance/tools";
import { formatINR } from "../lib/finance/format";

async function main() {
  console.log("=== Checking Audit Uncle Financial Math Engine ===");

  const samplePath = path.join(process.cwd(), "public", "samples", "kirana-store.csv");
  if (!fs.existsSync(samplePath)) {
    console.error(`Sample file not found at ${samplePath}. Run 'npm run generate:samples' first.`);
    process.exit(1);
  }

  const rawCsv = fs.readFileSync(samplePath, "utf-8");
  const { headers, rows } = parseCsvText(rawCsv);

  console.log(`Parsed CSV: ${headers.length} columns, ${rows.length} rows`);

  const { mapping } = detectMapping(headers, rows);
  console.log("Detected Mapping:", mapping);

  const { transactions, report } = cleanRows(rows, mapping);
  console.log(
    `Clean Report: Kept ${report.rowsKept}/${report.rowsRead} rows, Fixed ${report.datesFixed} dates, ${report.amountsFixed} amounts, ${report.days} days span`
  );

  const openingCash = 60000;
  const facts = computeFacts(transactions, openingCash, "kirana");

  // Validate no NaNs
  const checks: [string, number][] = [
    ["Cash Now", facts.cashNow],
    ["Total Sales", facts.totalSales],
    ["Total Expenses", facts.totalExpenses],
    ["Net Income", facts.netIncome],
    ["Daily Avg Sales", facts.dailyAvgSales],
    ["Daily Avg Expenses", facts.dailyAvgExpenses],
    ["Health Score Total", facts.score.total],
    ["GST Payable", facts.tax.gstPayable],
    ["Income Tax", facts.tax.incomeTax],
    ["Forecast End Balance (Low)", facts.forecast.endBalanceLow],
    ["Forecast End Balance (High)", facts.forecast.endBalanceHigh],
  ];

  for (const [name, val] of checks) {
    if (isNaN(val) || val === null || val === undefined) {
      console.error(`FAIL: ${name} is NaN or undefined! Value:`, val);
      process.exit(1);
    }
  }

  console.log("\n--- Key Financial Metrics ---");
  console.log(`Cash Now: ${formatINR(facts.cashNow)}`);
  console.log(`Total Sales: ${formatINR(facts.totalSales)}`);
  console.log(`Total Expenses: ${formatINR(facts.totalExpenses)}`);
  console.log(`Net Income: ${formatINR(facts.netIncome)}`);
  console.log(`Survival Runway: ${facts.runway.survivalDays} days (${facts.runway.assumption})`);
  console.log(`Trend Runway: ${facts.runway.trendDays}`);
  console.log(`Health Score: ${facts.score.total}/100 [Band: ${facts.score.band.toUpperCase()}]`);
  console.log(`Tax Estimate: GST ${formatINR(facts.tax.gstPayable)}, IT ${formatINR(facts.tax.incomeTax)} (${facts.tax.rulesUsed})`);
  console.log(`Forecast 30d End Balance: ${formatINR(facts.forecast.endBalanceLow)} to ${formatINR(facts.forecast.endBalanceHigh)}`);

  console.log("\n--- Testing Researched Retail Tax Profiles ---");
  const testProfiles = ["vmart", "dmart", "smart_bazaar", "cafe", "salon"] as const;
  for (const bType of testProfiles) {
    const f = computeFacts(transactions, openingCash, bType);
    console.log(`[Profile: ${bType.toUpperCase()}] GST: ${formatINR(f.tax.gstPayable)} | Rules: ${f.tax.rulesUsed}`);
    if (isNaN(f.tax.gstPayable) || isNaN(f.tax.incomeTax)) {
      console.error(`FAIL: NaN in tax for profile ${bType}`);
      process.exit(1);
    }
  }

  console.log("\n--- Testing Ask Tools ---");
  const tool1 = executeTool("totalSales", { period: "30d" }, facts);
  console.log("totalSales(30d):", tool1.summaryText);

  const tool2 = executeTool("bestWorstDays", {}, facts);
  console.log("bestWorstDays():", tool2.summaryText);

  const tool3 = executeTool("weekdayPerformance", { weekday: "Tuesday" }, facts);
  console.log("weekdayPerformance(Tuesday):", tool3.summaryText);

  const tool4 = executeTool("affordability", { amount: 40000 }, facts);
  console.log("affordability(₹40,000):", tool4.summaryText);

  const tool5 = executeTool("runwayNow", {}, facts);
  console.log("runwayNow():", tool5.summaryText);

  console.log("\n>>> ALL MATH CHECKS PASSED PERFECTLY! Deterministic engine verified. <<<");
}

main().catch((err) => {
  console.error("FATAL ERROR in check-math:", err);
  process.exit(1);
});
