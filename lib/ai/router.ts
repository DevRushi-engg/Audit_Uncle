import { FinanceFacts, ToolName } from "@/types/finance";
import { NarratorProvider } from "./provider";
import { ROUTER_SYSTEM } from "./prompts";
import { stripCodeFences } from "./guard";

const VALID_TOOLS: ToolName[] = [
  "totalSales",
  "bestWorstDays",
  "weekdayPerformance",
  "affordability",
  "runwayNow",
  "topExpenses",
];

const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function keywordRouter(question: string): { tool: ToolName; args: Record<string, unknown> } {
  const q = question.toLowerCase();

  // 1. Affordability / Purchase check
  if (
    q.includes("afford") ||
    q.includes("buy") ||
    q.includes("purchase") ||
    q.includes("khareed") ||
    q.includes("le sakta") ||
    q.includes("fridge") ||
    q.includes("can i")
  ) {
    // Extract numerical amount from question if present (e.g. ₹40,000 or 40000)
    const match = q.match(/[₹]?\s*(\d[\d,]*)/);
    let amount = 40000;
    if (match) {
      const parsed = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(parsed) && parsed > 0) amount = parsed;
    }
    return { tool: "affordability", args: { amount } };
  }

  // 2. Best / Worst Days
  if (
    q.includes("best") ||
    q.includes("worst") ||
    q.includes("peak") ||
    q.includes("highest") ||
    q.includes("lowest") ||
    q.includes("sabse accha") ||
    q.includes("sabse slow") ||
    q.includes("slowest")
  ) {
    return { tool: "bestWorstDays", args: {} };
  }

  // 3. Specific Weekday Performance
  for (const day of WEEKDAY_NAMES) {
    if (q.includes(day.toLowerCase())) {
      return { tool: "weekdayPerformance", args: { weekday: day } };
    }
  }
  if (q.includes("weekday") || q.includes("tuesday") || q.includes("sunday") || q.includes("var")) {
    return { tool: "weekdayPerformance", args: { weekday: "Tuesday" } };
  }

  // 4. Expenses / Where does money go
  if (
    q.includes("expense") ||
    q.includes("spend") ||
    q.includes("kharch") ||
    q.includes("where does") ||
    q.includes("kaha gaya") ||
    q.includes("cost")
  ) {
    return { tool: "topExpenses", args: {} };
  }

  // 5. Total Sales / Revenue
  if (
    q.includes("sales") ||
    q.includes("sale") ||
    q.includes("revenue") ||
    q.includes("income") ||
    q.includes("kamai") ||
    q.includes("total") ||
    q.includes("dhandha")
  ) {
    const period = q.includes("7") || q.includes("week") ? "7d" : q.includes("all") ? "all" : "30d";
    return { tool: "totalSales", args: { period } };
  }

  // 6. Runway / Cash left
  return { tool: "runwayNow", args: {} };
}

export async function routeQuestion(
  question: string,
  provider: NarratorProvider,
  facts: FinanceFacts
): Promise<{ tool: ToolName; args: Record<string, unknown> }> {
  // If provider is active and ready, try LLM classification
  if (provider.isReady() && provider.id !== "template") {
    try {
      const response = await provider.generate({
        system: ROUTER_SYSTEM,
        user: `QUESTION: "${question}"`,
        maxTokens: 80,
        json: true,
      });

      const cleaned = stripCodeFences(response);
      const parsed = JSON.parse(cleaned);

      if (parsed && typeof parsed.tool === "string" && VALID_TOOLS.includes(parsed.tool as ToolName)) {
        return {
          tool: parsed.tool as ToolName,
          args: parsed.args && typeof parsed.args === "object" ? parsed.args : {},
        };
      }
    } catch (err) {
      console.warn("LLM router failed, falling back to keywordRouter:", err);
    }
  }

  return keywordRouter(question);
}
