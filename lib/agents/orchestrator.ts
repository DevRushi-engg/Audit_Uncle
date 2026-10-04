import { AI } from "@/config/app.config";
import {
  AgentId,
  AgentState,
  AnalysisResult,
  CleanReport,
  FinanceFacts,
  NarratorLanguageId,
  Transaction,
} from "@/types/finance";
import { NarratorProvider } from "../ai/provider";
import { runCleanerAgent } from "./cleaner";
import { runAnalystAgent } from "./analyst";
import { runTaxAgent } from "./tax";
import { runRiskAgent } from "./risk";
import { runCfoAgent } from "./cfo";

export interface OrchestratorInput {
  transactions: Transaction[];
  report: CleanReport;
  facts: FinanceFacts;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`Operation timed out after ${timeoutMs}ms, using fallback.`);
      resolve(fallbackValue);
    }, timeoutMs);
  });

  return Promise.race([
    promise.then((val) => {
      clearTimeout(timer);
      return val;
    }),
    timeoutPromise,
  ]);
}

export async function runAnalysis(
  input: OrchestratorInput,
  provider: NarratorProvider,
  lang: NarratorLanguageId,
  onUpdate: (agents: AgentState[]) => void
): Promise<AnalysisResult> {
  const { transactions, report, facts } = input;

  const agentOrder: AgentId[] = ["cleaner", "analyst", "tax", "risk", "cfo"];

  // Initialize all agents to waiting state
  const agentsState: Record<AgentId, AgentState> = {
    cleaner: { id: "cleaner", status: "waiting", factLine: "Waiting to verify CSV schema...", narratedBy: "code" },
    analyst: { id: "analyst", status: "waiting", factLine: "Waiting for clean data...", narratedBy: "code" },
    tax: { id: "tax", status: "waiting", factLine: "Waiting for sales turnover totals...", narratedBy: "code" },
    risk: { id: "risk", status: "waiting", factLine: "Waiting for burn rate and liquidity metrics...", narratedBy: "code" },
    cfo: { id: "cfo", status: "waiting", factLine: "Waiting for team analysis to generate memo...", narratedBy: "code" },
  };

  const publish = () => {
    onUpdate(agentOrder.map((id) => ({ ...agentsState[id] })));
  };

  publish();
  await sleep(250);

  // 1. Cleaner Agent
  agentsState.cleaner.status = "working";
  publish();
  await sleep(350);

  const cleanerResult = runCleanerAgent(report);
  agentsState.cleaner = cleanerResult;
  publish();
  await sleep(350);

  // 2. Analyst Agent
  agentsState.analyst.status = "working";
  publish();
  await sleep(350);

  const analystFallbackState: AgentState = {
    id: "analyst",
    status: "fallback",
    factLine: "Calculated sales velocities and daily averages.",
    narratedBy: "template",
  };

  const analystResult = await withTimeout(
    runAnalystAgent({ facts, provider, lang }),
    AI.timeoutMs,
    analystFallbackState
  );
  agentsState.analyst = analystResult;
  publish();
  await sleep(350);

  // 3. Tax Agent
  agentsState.tax.status = "working";
  publish();
  await sleep(350);

  const taxResult = runTaxAgent(facts);
  agentsState.tax = taxResult;
  publish();
  await sleep(350);

  // 4. Risk Agent
  agentsState.risk.status = "working";
  publish();
  await sleep(350);

  const riskFallbackState: AgentState = {
    id: "risk",
    status: "fallback",
    factLine: "Audited liquidity flags and expense burn.",
    narratedBy: "template",
  };

  const riskResult = await withTimeout(
    runRiskAgent({ flags: facts.flags, provider, lang }),
    AI.timeoutMs,
    riskFallbackState
  );
  agentsState.risk = riskResult;
  publish();
  await sleep(350);

  // 5. CFO Agent
  agentsState.cfo.status = "working";
  publish();
  await sleep(350);

  const cfoFallbackState: AgentState = {
    id: "cfo",
    status: "fallback",
    factLine: `CFO synthesis complete for ${facts.runway.survivalDays} days runway.`,
    narratedBy: "template",
  };

  const cfoResult = await withTimeout(
    runCfoAgent({ facts, flags: facts.flags, provider, lang }),
    AI.timeoutMs,
    {
      state: cfoFallbackState,
      memo: {
        headline: "Hisab tayyar hai.",
        actions: [
          "Maintain adequate liquid cash cushion.",
          "Control operating expenses.",
          "Set aside tax buffer for quarterly dues.",
        ],
      },
    }
  );

  agentsState.cfo = cfoResult.state;
  publish();

  return {
    transactions,
    report,
    facts,
    memo: cfoResult.memo,
    agents: agentOrder.map((id) => agentsState[id]),
  };
}
