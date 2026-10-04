import { CfoMemo, FinanceFacts, Flag, NarratorLanguageId, ToolResult } from "@/types/finance";
import { formatDays, formatINR, formatPct } from "../finance/format";
import { GenerateOptions, NarratorProvider } from "./provider";

export function narrateAnalyst(facts: FinanceFacts, lang: NarratorLanguageId): string {
  const isHinglish = lang === "hinglish";
  const trend = facts.salesDeltaPct;
  const best = facts.bestDay;
  const worst = facts.worstDay;

  // Find most divergent weekday
  const avgDaily = facts.dailyAvgSales;
  let slowDay = facts.weekdayStats[0];
  let maxDrop = 0;
  for (const w of facts.weekdayStats) {
    if (w.count > 0 && avgDaily > 0) {
      const drop = ((avgDaily - w.avgSales) / avgDaily) * 100;
      if (drop > maxDrop) {
        maxDrop = drop;
        slowDay = w;
      }
    }
  }

  if (isHinglish) {
    if (maxDrop > 25) {
      return `${slowDay.dayName} ki sales average se ${maxDrop.toFixed(0)}% kam hain. Overall trend pichle 30 din se ${Math.abs(trend).toFixed(1)}% ${trend >= 0 ? "upar" : "niche"} hai.`;
    }
    return `Pichle 30 din me total sales ${formatINR(facts.last30Sales)} hui. Cash ki daily velocity lagbhag ${formatINR(facts.dailyAvgSales)} hai.`;
  }

  // English
  if (maxDrop > 25) {
    return `${slowDay.dayName} sales run ${maxDrop.toFixed(0)}% below your daily average. Total sales are ${Math.abs(trend).toFixed(1)}% ${trend >= 0 ? "higher" : "lower"} compared to the previous period.`;
  }
  return `Sales averaged ${formatINR(facts.dailyAvgSales)} per day with a ${trend >= 0 ? "+" : ""}${trend.toFixed(1)}% movement compared to previous 30 days.`;
}

export function narrateRisk(flags: Flag[], lang: NarratorLanguageId): string {
  const isHinglish = lang === "hinglish";
  const highOrMed = flags.find((f) => f.severity === "HIGH") || flags.find((f) => f.severity === "MEDIUM") || flags[0];

  if (!highOrMed) {
    return isHinglish ? "Cash flow ekdum steady hai, koi bada risk nahi dikh raha." : "Cash flow is steady with no critical liquidity risk detected.";
  }

  if (isHinglish) {
    if (highOrMed.id.includes("runway")) {
      return `Dhyan de bhau: cash buffer kam ho raha hai. Udhaar recovery aur kharch control karna padega.`;
    }
    if (highOrMed.id.includes("expense")) {
      return `Kharch thoda zyada chal raha hai. Operating expenses control me rakhna zaroori hai.`;
    }
    return `${highOrMed.text}`;
  }

  return highOrMed.text;
}

export function narrateCfo(facts: FinanceFacts, flags: Flag[], lang: NarratorLanguageId): CfoMemo {
  const isHinglish = lang === "hinglish";
  const survival = facts.runway.survivalDays;
  const net = facts.netIncome;

  let headline = "";
  const actions: string[] = [];

  if (isHinglish) {
    headline = survival !== null
      ? `Bhau, cash lagbhag ${survival} din chalega. Net munafa ${formatINR(net)} par stable hai.`
      : `Bhau, hisab solid hai. Total net munafa ${formatINR(net)} ban raha hai.`;

    // Action 1: Cash/Runway
    if (survival !== null && survival < 30) {
      actions.push(`Udhaar vasooli par zor do — agle 7 din me kam se kam ₹15,000 cash collect karo.`);
    } else {
      actions.push(`Cash buffer theek hai — minimum 30 din ka kharch alag liquid reserve me rakho.`);
    }

    // Action 2: Expenses / Stock
    if (facts.topExpenses.length > 0) {
      actions.push(`${facts.topExpenses[0].category} par ${formatINR(facts.topExpenses[0].amount)} kharch hua — wholesale vendor se volume discount negotiate karo.`);
    } else {
      actions.push(`Fast-moving stock par dhyan do aur inventory turnaround fast rakho.`);
    }

    // Action 3: Tax
    actions.push(`Advance tax aur GST ke liye lagbhag ${formatINR(facts.tax.gstPayable + facts.tax.incomeTax)} alag rakh lo. CA se confirm karo.`);
  } else {
    headline = survival !== null
      ? `Survival runway is estimated at ${survival} days with net balance at ${formatINR(net)}.`
      : `Business performance is stable with net profit of ${formatINR(net)}.`;

    if (survival !== null && survival < 30) {
      actions.push(`Accelerate customer credit recovery to replenish the 30-day operational safety cushion.`);
    } else {
      actions.push(`Maintain minimum 30 days of operating expenses in reserve before any capital expenditure.`);
    }

    if (facts.topExpenses.length > 0) {
      actions.push(`Top expense is ${facts.topExpenses[0].category} (${formatINR(facts.topExpenses[0].amount)}) — review supplier contracts for bulk terms.`);
    } else {
      actions.push(`Track supplier payments to avoid late reconciliation charges.`);
    }

    actions.push(`Reserve approximately ${formatINR(facts.tax.gstPayable + facts.tax.incomeTax)} for estimated GST and income tax obligations.`);
  }

  return { headline, actions };
}

export function narrateAnswer(toolResult: ToolResult, lang: NarratorLanguageId): string {
  const isHinglish = lang === "hinglish";

  if (toolResult.summaryText) {
    if (isHinglish) {
      if (toolResult.tool === "runwayNow") {
        return `Current hisab ke mutabik cash lagbhag ${toolResult.numbers["Survival Runway"]} chalega. ${toolResult.numbers["Current Cash"]} cash in hand hai.`;
      }
      if (toolResult.tool === "affordability") {
        const canAfford = toolResult.numbers["Runway After Purchase"] && !toolResult.numbers["Runway After Purchase"].includes("0");
        return canAfford
          ? `Yeh purchase possible hai. Khareedi ke baad ${toolResult.numbers["Cash Remaining After"]} cash aur ${toolResult.numbers["Runway After Purchase"]} ka runway bachega.`
          : `Thoda sambhal ke bhau! Is kharch ke baad cash bahut tight ho jayega (${toolResult.numbers["Runway After Purchase"]} runway).`;
      }
      if (toolResult.tool === "totalSales") {
        return `Is period me kul sales ${toolResult.numbers["Total Sales"] || toolResult.numbers["Last 30 Days Sales"] || Object.values(toolResult.numbers)[0]} hui hai.`;
      }
      if (toolResult.tool === "bestWorstDays") {
        return `Aapka sabse accha sales din ${toolResult.numbers["Best Day Sales"]} par tha aur sabse slow din ${toolResult.numbers["Worst Day Sales"]} tha.`;
      }
    }
    return toolResult.summaryText;
  }

  return `Based on verified ledger math: ${JSON.stringify(toolResult.numbers)}`;
}

export class TemplateProvider implements NarratorProvider {
  id = "template" as const;
  label = "Template Narrator (Instant)";

  isReady(): boolean {
    return true;
  }

  async generate(opts: GenerateOptions): Promise<string> {
    if (opts.json) {
      return JSON.stringify({
        headline: "Hisab tayyar hai. Sabhi figures code dwaara verify kiye gaye hain.",
        actions: [
          "Regular cash flow monitor karein.",
          "High expenses par vendor se baat karein.",
          "Tax aur GST estimate ke anusaar buffer rakhein.",
        ],
      });
    }
    return "Calculations verified by code.";
  }
}
