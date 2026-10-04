import { AI } from "@/config/app.config";
import { AgentState, FinanceFacts, NarratorLanguageId } from "@/types/finance";
import { NarratorProvider } from "../ai/provider";
import { NARRATOR_SYSTEM, buildAnalystPrompt } from "../ai/prompts";
import { validateNarration } from "../ai/guard";
import { narrateAnalyst } from "../ai/template";
import { formatINR } from "../finance/format";

export interface AnalystContext {
  facts: FinanceFacts;
  provider: NarratorProvider;
  lang: NarratorLanguageId;
}

export async function runAnalystAgent(ctx: AnalystContext): Promise<AgentState> {
  const { facts, provider, lang } = ctx;

  const trendSign = facts.salesDeltaPct >= 0 ? "+" : "";
  const factLine = `Sales trend ${trendSign}${facts.salesDeltaPct.toFixed(1)}% vs prev 30d; daily burn ₹${Math.round(facts.dailyAvgExpenses).toLocaleString("en-IN")}; cash share ${facts.paymentSplit.cashSharePct.toFixed(0)}%.`;

  // Always generate default template narration
  const templateNarration = narrateAnalyst(facts, lang);

  if (!provider.isReady() || provider.id === "template") {
    return {
      id: "analyst",
      status: "done",
      factLine,
      narration: templateNarration,
      narratedBy: "template",
    };
  }

  try {
    const prompt = buildAnalystPrompt(facts);
    const rawAi = await provider.generate({
      system: NARRATOR_SYSTEM(lang),
      user: prompt,
      maxTokens: AI.maxTokensNarration,
    });

    if (validateNarration(rawAi, facts)) {
      return {
        id: "analyst",
        status: "done",
        factLine,
        narration: rawAi.trim(),
        narratedBy: "ai",
      };
    } else {
      return {
        id: "analyst",
        status: "fallback",
        factLine,
        narration: templateNarration,
        narratedBy: "template",
      };
    }
  } catch (err) {
    console.warn("Analyst AI call failed, falling back to template:", err);
    return {
      id: "analyst",
      status: "fallback",
      factLine,
      narration: templateNarration,
      narratedBy: "template",
    };
  }
}
