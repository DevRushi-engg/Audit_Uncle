import { BUSINESS_TYPES, NARRATOR_LANGUAGES } from "@/config/app.config";

export type BusinessTypeId = (typeof BUSINESS_TYPES)[number]["id"];
export type NarratorLanguageId = (typeof NARRATOR_LANGUAGES)[number]["id"];

export interface Transaction {
  date: string; // ISO yyyy-mm-dd
  amount: number; // always positive
  type: "sale" | "expense";
  category?: string;
  paymentMode?: "cash" | "upi" | "card" | "other";
}

export type ColumnRole = "date" | "amount" | "type" | "category" | "paymentMode" | "ignore";
export type ColumnMapping = Record<string, ColumnRole>;

export interface CleanReport {
  rowsRead: number;
  rowsKept: number;
  rowsDropped: number;
  datesFixed: number;
  amountsFixed: number;
  warnings: string[];
  dateFrom: string;
  dateTo: string;
  days: number;
}

export interface DailyPoint {
  date: string; // yyyy-mm-dd
  sales: number;
  expenses: number;
  net: number;
  balance: number;
}

export interface WeekdayStat {
  dayName: string; // "Monday", "Tuesday", etc.
  dayIndex: number; // 0=Sunday, 1=Monday...
  avgSales: number;
  avgExpenses: number;
  totalSales: number;
  count: number;
}

export interface PaymentSplit {
  cash: number;
  upi: number;
  card: number;
  other: number;
  cashSharePct: number;
  digitalSharePct: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  sharePct: number;
}

export interface ForecastPoint {
  date: string;
  sales: number;
  expenses: number;
  balance: number;
  low: number;
  high: number;
}

export interface Forecast {
  points: ForecastPoint[];
  endBalanceLow: number;
  endBalanceHigh: number;
}

export interface Runway {
  survivalDays: number | null;
  trendDays: number | "cash-positive" | null;
  assumption: string;
}

export interface TaxEstimate {
  gstPayable: number;
  incomeTax: number;
  regimeLabel: string;
  rulesUsed: string;
  disclaimer: string;
}

export interface ScoreFactor {
  id: string;
  label: string;
  score: number;
  max: number;
  note: string;
}

export interface HealthScore {
  total: number;
  band: "healthy" | "watch" | "danger";
  factors: ScoreFactor[];
}

export interface Flag {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  text: string;
}

export interface FinanceFacts {
  openingCash: number;
  cashNow: number;
  totalSales: number;
  totalExpenses: number;
  netIncome: number;
  dailyAvgSales: number;
  dailyAvgExpenses: number;
  dailyAvgNet: number;
  last30Sales: number;
  last30Expenses: number;
  last30Net: number;
  prev30Sales: number;
  prev30Expenses: number;
  prev30Net: number;
  salesDeltaPct: number;
  expensesDeltaPct: number;
  netDeltaPct: number;
  bestDay: { date: string; sales: number } | null;
  worstDay: { date: string; sales: number } | null;
  weekdayStats: WeekdayStat[];
  paymentSplit: PaymentSplit;
  topExpenses: CategoryExpense[];
  dailySeries: DailyPoint[];
  runway: Runway;
  forecast: Forecast;
  tax: TaxEstimate;
  score: HealthScore;
  flags: Flag[];
}

export type AgentId = "cleaner" | "analyst" | "tax" | "risk" | "cfo";
export type AgentStatus = "waiting" | "working" | "done" | "fallback";

export interface AgentState {
  id: AgentId;
  status: AgentStatus;
  factLine: string;
  narration?: string;
  narratedBy: "code" | "ai" | "template";
}

export interface CfoMemo {
  headline: string;
  actions: string[];
}

export interface AnalysisResult {
  transactions: Transaction[];
  report: CleanReport;
  facts: FinanceFacts;
  memo: CfoMemo;
  agents: AgentState[];
}

export interface WhatIfInput {
  priceChangePct: number; // e.g. 5 for +5%
  expenseChangePct: number; // e.g. -10 for -10%
  oneTimeSpend: number; // e.g. 40000
}

export interface ScenarioMetrics {
  runwayDays: number | null;
  net30: number;
  endCash: number;
}

export interface WhatIfResult {
  baseline: ScenarioMetrics;
  scenario: ScenarioMetrics;
  deltas: {
    runwayDays: number | null;
    net30: number;
    endCash: number;
  };
}

export type ToolName =
  | "totalSales"
  | "bestWorstDays"
  | "weekdayPerformance"
  | "affordability"
  | "runwayNow"
  | "topExpenses";

export interface ToolResult {
  tool: ToolName;
  args?: Record<string, unknown>;
  numbers: Record<string, string>;
  rows?: string[][];
  summaryText?: string;
}

export type ReportState = "empty" | "mapping" | "analyzing" | "results" | "error";
