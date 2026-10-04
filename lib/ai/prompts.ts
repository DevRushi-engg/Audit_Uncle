import { FinanceFacts, Flag, NarratorLanguageId, ToolName, ToolResult } from "@/types/finance";
import { formatDays, formatINR } from "../finance/format";

export function NARRATOR_SYSTEM(lang: NarratorLanguageId): string {
  const base =
    "You are Audit Uncle, a calm, careful accountant's assistant for a small shop owner in India. You will be given FACTS as JSON. Use ONLY numbers that appear in FACTS — never calculate, estimate, or invent any new number. Never give tax, legal, or investment advice; say 'confirm with your CA' if asked. Write at most 2 short sentences. Explain what the numbers mean for the business and never blame the owner.";

  if (lang === "hinglish") {
    return `${base} Write in Hinglish — Hindi words in Roman letters mixed with simple English, keep terms like cash, sales, expenses, runway in English; no Devanagari; 0–1 emoji.`;
  }
  return `${base} Write in plain simple English.`;
}

export function CFO_SYSTEM(lang: NarratorLanguageId): string {
  const base =
    "You are Audit Uncle CFO, advising a micro-business owner. You will be given FACTS as JSON. Use ONLY numbers that appear in FACTS — never calculate, estimate, or invent any new number. Respond with a JSON object strictly matching this format: { \"headline\": string, \"actions\": [string, string, string] }. Write the headline and exactly 3 short actionable bullet points.";

  if (lang === "hinglish") {
    return `${base} Write in natural Hinglish using Roman alphabet only (no Devanagari). Use friendly respectful tone (e.g. 'Bhau'). 0-1 emoji. Output raw JSON only with no markdown fences.`;
  }
  return `${base} Write in clear, direct English. Output raw JSON only with no markdown fences.`;
}

export const ROUTER_SYSTEM = `You are a query router for a business finance assistant.
Pick exactly ONE tool from the list below that best answers the user's question.
Return JSON ONLY in this format: {"tool": "<tool_name>", "args": {<arguments>}}

Tools available:
1. totalSales: {"period": "7d" | "30d" | "all"} - for sales volume, total revenue, income over time
2. bestWorstDays: {} - for best day, worst day, peak sales day, lowest day
3. weekdayPerformance: {"weekday": "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"} - for performance on specific days of the week
4. affordability: {"amount": number} - for whether user can afford an item, buy equipment, spend money
5. runwayNow: {} - for how long cash will last, cash in hand, survival runway
6. topExpenses: {} - for where money is spent, top expenses, biggest costs

Respond with JSON only. No markdown formatting.`;

export function buildAnalystPrompt(facts: FinanceFacts): string {
  const data = {
    totalSales: formatINR(facts.totalSales),
    last30Sales: formatINR(facts.last30Sales),
    dailyAverageSales: formatINR(facts.dailyAvgSales),
    salesGrowthPct: `${facts.salesDeltaPct >= 0 ? "+" : ""}${facts.salesDeltaPct.toFixed(1)}%`,
    topExpenseCategory: facts.topExpenses[0]?.category || "None",
    topExpenseAmount: facts.topExpenses[0] ? formatINR(facts.topExpenses[0].amount) : "0",
    cashSharePct: `${facts.paymentSplit.cashSharePct.toFixed(0)}%`,
  };
  return `FACTS: ${JSON.stringify(data)}`;
}

export function buildRiskPrompt(flags: Flag[]): string {
  const highOrMed = flags.filter((f) => f.severity === "HIGH" || f.severity === "MEDIUM");
  const data = {
    primaryWarning: highOrMed[0]?.text || flags[0]?.text || "Cash flow is steady",
    warningCount: flags.length,
  };
  return `FACTS: ${JSON.stringify(data)}`;
}

export function buildCfoPrompt(facts: FinanceFacts, flags: Flag[]): string {
  const data = {
    cashNow: formatINR(facts.cashNow),
    survivalRunwayDays: facts.runway.survivalDays !== null ? `${facts.runway.survivalDays} days` : "uncalculated",
    netIncome: formatINR(facts.netIncome),
    totalSales: formatINR(facts.totalSales),
    estimatedGst: formatINR(facts.tax.gstPayable),
    estimatedIncomeTax: formatINR(facts.tax.incomeTax),
    topExpense: facts.topExpenses[0]?.category || "Suppliers",
    primaryFlag: flags[0]?.text || "Cash velocity is steady",
  };
  return `FACTS: ${JSON.stringify(data)}`;
}

export function buildAnswerPrompt(toolResult: ToolResult): string {
  return `FACTS: ${JSON.stringify({
    tool: toolResult.tool,
    numbers: toolResult.numbers,
    summary: toolResult.summaryText,
  })}`;
}
