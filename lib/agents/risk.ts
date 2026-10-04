import { AI } from "@/config/app.config";
import { AgentState, Flag, NarratorLanguageId } from "@/types/finance";
import { NarratorProvider } from "../ai/provider";
import { NARRATOR_SYSTEM, buildRiskPrompt } from "../ai/prompts";
import { validateNarration } from "../ai/guard";
import { narrateRisk } from "../ai/template";

export interface RiskContext {
  flags: Flag[];
  provider: NarratorProvider;
  lang: NarratorLanguageId;
}

export async function runRiskAgent(ctx: RiskContext): Promise<AgentState> {
  const { flags, provider, lang } = ctx;

  const highest = flags.find((f) => f.severity === "HIGH") || flags.find((f) => f.severity === "MEDIUM") || flags[0];
  const factLine = highest
    ? `[${highest.severity} RISK] ${highest.text}`
    : "No critical liquidity or operational risk flags identified.";

  const templateNarration = narrateRisk(flags, lang);

  if (!provider.isReady() || provider.id === "template") {
    return {
      id: "risk",
      status: "done",
      factLine,
      narration: templateNarration,
      narratedBy: "template",
    };
  }

  try {
    const prompt = buildRiskPrompt(flags);
    const rawAi = await provider.generate({
      system: NARRATOR_SYSTEM(lang),
      user: prompt,
      maxTokens: AI.maxTokensNarration,
    });

    if (validateNarration(rawAi, flags)) {
      return {
        id: "risk",
        status: "done",
        factLine,
        narration: rawAi.trim(),
        narratedBy: "ai",
      };
    } else {
      return {
        id: "risk",
        status: "fallback",
        factLine,
        narration: templateNarration,
        narratedBy: "template",
      };
    }
  } catch (err) {
    console.warn("Risk AI call failed, falling back to template:", err);
    return {
      id: "risk",
      status: "fallback",
      factLine,
      narration: templateNarration,
      narratedBy: "template",
    };
  }
}
