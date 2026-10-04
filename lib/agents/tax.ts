import { AgentState, FinanceFacts } from "@/types/finance";
import { formatINR } from "../finance/format";

export function runTaxAgent(facts: FinanceFacts): AgentState {
  const factLine = `GST payable est. ${formatINR(facts.tax.gstPayable)} · income tax est. ${formatINR(facts.tax.incomeTax)} (${facts.tax.rulesUsed}).`;

  return {
    id: "tax",
    status: "done",
    factLine,
    narration: facts.tax.disclaimer,
    narratedBy: "code",
  };
}
