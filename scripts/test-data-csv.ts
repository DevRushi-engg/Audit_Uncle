import fs from "fs";
import { parseCsvText } from "../lib/csv/parse";
import { detectMapping } from "../lib/csv/detect";
import { cleanRows } from "../lib/csv/clean";
import { computeFacts } from "../lib/finance/metrics";

const raw = fs.readFileSync("test-data/data.csv", "utf-8");
const { headers, rows } = parseCsvText(raw);
console.log("Parsed headers:", headers);
console.log("Parsed rows count:", rows.length);

const { mapping } = detectMapping(headers, rows);
console.log("Detected mapping:", mapping);

const { transactions, report } = cleanRows(rows, mapping);
console.log("Clean report:", report);

const facts = computeFacts(transactions, 60000, "kirana");
console.log("\n--- Financial Summary for data.csv ---");
console.log("Total Sales: ₹" + facts.totalSales.toLocaleString("en-IN"));
console.log("Total Expenses: ₹" + facts.totalExpenses.toLocaleString("en-IN"));
console.log("Net Income: ₹" + facts.netIncome.toLocaleString("en-IN"));
console.log("Cash in hand: ₹" + facts.cashNow.toLocaleString("en-IN"));
console.log("Survival Runway:", facts.runway.survivalDays, "days");
console.log("Health Score:", facts.score.total, "/ 100", `[${facts.score.band.toUpperCase()}]`);
console.log("Estimated GST: ₹" + facts.tax.gstPayable.toLocaleString("en-IN"));
console.log("Estimated Income Tax: ₹" + facts.tax.incomeTax.toLocaleString("en-IN"));
