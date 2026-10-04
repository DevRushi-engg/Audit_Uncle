import { AI } from "@/config/app.config";
import { AgentState, CfoMemo, FinanceFacts, Flag, NarratorLanguageId } from "@/types/finance";
import { NarratorProvider } from "../ai/provider";
import { CFO_SYSTEM, buildCfoPrompt } from "../ai/prompts";
import { parseAndValidateCfoJson } from "../ai/guard";
import { narrateCfo } from "../ai/template";
import { formatDays, formatINR } from "../finance/format";

export interface CfoContext {
  facts: FinanceFacts;
  flags: Flag[];
  provider: NarratorProvider;
  lang: NarratorLanguageId;
}

export interface CfoAgentResult {
  state: AgentState;
  memo: CfoMemo;
}

export async function runCfoAgent(ctx: CfoContext): Promise<CfoAgentResult> {
  const { facts, flags, provider, lang } = ctx;

  const factLine = `CFO Synthesis: Health score ${facts.score.total}/100 [${facts.score.band.toUpperCase()}]; ${formatDays(facts.runway.survivalDays)} survival cushion; Net ${formatINR(facts.netIncome)}.`;

  const templateMemo = narrateCfo(facts, flags, lang);

  if (!provider.isReady() || provider.id === "template") {
    return {
      state: {
        id: "cfo",
        status: "done",
        factLine,
        narration: templateMemo.headline,
        narratedBy: "template",
      },
      memo: templateMemo,
    };
  }

  try {
    const prompt = buildCfoPrompt(facts, flags);
    const rawAi = await provider.generate({
      system: CFO_SYSTEM(lang),
      user: prompt,
      maxTokens: AI.maxTokensCfo,
      json: true,
    });

    const parsedMemo = parseAndValidateCfoJson(rawAi, facts);

    if (parsedMemo) {
      return {
        state: {
          id: "cfo",
          status: "done",
          factLine,
          narration: parsedMemo.headline,
          narratedBy: "ai",
        },
        memo: parsedMemo,
      };
    } else {
      return {
        state: {
          id: "cfo",
          status: "fallback",
          factLine,
          narration: templateMemo.headline,
          narratedBy: "template",
        },
        memo: templateMemo,
      };
    }
  } catch (err) {
    console.warn("CFO AI call failed, falling back to template:", err);
    return {
      state: {
        id: "cfo",
        status: "fallback",
        factLine,
        narration: templateMemo.headline,
        narratedBy: "template",
      },
      memo: templateMemo,
    };
  }
}
