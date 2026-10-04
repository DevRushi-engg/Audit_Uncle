import { AgentState, CleanReport } from "@/types/finance";

export interface AgentContext {
  report: CleanReport;
}

export function runCleanerAgent(report: CleanReport): AgentState {
  const fixes: string[] = [];
  if (report.datesFixed > 0) fixes.push(`fixed ${report.datesFixed} dates`);
  if (report.amountsFixed > 0) fixes.push(`standardized ${report.amountsFixed} amounts`);

  const fixText = fixes.length > 0 ? `, ${fixes.join(" and ")}` : "";
  const factLine = `Read ${report.rowsRead} rows, kept ${report.rowsKept}${fixText}. ${report.days} days verified.`;

  return {
    id: "cleaner",
    status: "done",
    factLine,
    narration: undefined,
    narratedBy: "code",
  };
}
