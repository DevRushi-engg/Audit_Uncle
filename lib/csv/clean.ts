import { CleanReport, ColumnMapping, Transaction } from "@/types/finance";

interface DateParseResult {
  isoDate: string | null;
  fixed: boolean;
}

function parseFlexibleDate(raw: string): DateParseResult {
  if (!raw) return { isoDate: null, fixed: false };
  const s = raw.trim();

  // 1. ISO format: yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return { isoDate: s, fixed: false };
  }

  // 2. dd/mm/yyyy or dd-mm-yyyy or dd.mm.yyyy
  const dmyMatch = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    const day = d.padStart(2, "0");
    const month = m.padStart(2, "0");
    const iso = `${y}-${month}-${day}`;
    const dateObj = new Date(`${y}-${month}-${day}T00:00:00Z`);
    if (!isNaN(dateObj.getTime())) {
      return { isoDate: iso, fixed: true };
    }
  }

  // 3. dd/mm/yy or dd-mm-yy
  const dmyShortMatch = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})$/);
  if (dmyShortMatch) {
    const [, d, m, yy] = dmyShortMatch;
    const fullYear = Number(yy) > 70 ? `19${yy}` : `20${yy}`;
    const day = d.padStart(2, "0");
    const month = m.padStart(2, "0");
    const iso = `${fullYear}-${month}-${day}`;
    const dateObj = new Date(`${fullYear}-${month}-${day}T00:00:00Z`);
    if (!isNaN(dateObj.getTime())) {
      return { isoDate: iso, fixed: true };
    }
  }

  // 4. yyyy/mm/dd
  const ymdMatch = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    const day = d.padStart(2, "0");
    const month = m.padStart(2, "0");
    const iso = `${y}-${month}-${day}`;
    return { isoDate: iso, fixed: true };
  }

  // Fallback to JS Date parsing
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    const iso = parsed.toISOString().split("T")[0];
    return { isoDate: iso, fixed: true };
  }

  return { isoDate: null, fixed: false };
}

interface AmountParseResult {
  amount: number | null;
  rawTypeHint: "sale" | "expense" | null;
  fixed: boolean;
}

function parseFlexibleAmount(raw: string): AmountParseResult {
  if (!raw) return { amount: null, rawTypeHint: null, fixed: false };
  const s = raw.trim();

  let cleaned = s;
  let fixed = false;

  // Check currency symbols & text
  if (/[₹$,]|rs\.?|inr/i.test(cleaned)) {
    cleaned = cleaned.replace(/[₹$,]|rs\.?|inr/gi, "").trim();
    fixed = true;
  }

  // Clean trailing spaces
  cleaned = cleaned.replace(/\s+/g, "");

  // Indian bank notation: e.g. "4500.00 Cr" or "1200.00 Dr"
  let bankHint: "sale" | "expense" | null = null;
  if (/\bdr\b/i.test(cleaned)) {
    bankHint = "expense";
    cleaned = cleaned.replace(/\bdr\b/gi, "").trim();
    fixed = true;
  } else if (/\bcr\b/i.test(cleaned)) {
    bankHint = "sale";
    cleaned = cleaned.replace(/\bcr\b/gi, "").trim();
    fixed = true;
  }

  // Multiplier suffixes: k, L/lakh, Cr/crore
  let multiplier = 1;
  if (/(\d+(?:\.\d+)?)\s*cr(?:ore)?s?/i.test(cleaned)) {
    cleaned = cleaned.replace(/cr(?:ore)?s?/gi, "");
    multiplier = 10_000_000;
    fixed = true;
  } else if (/(\d+(?:\.\d+)?)\s*l(?:akh)?s?/i.test(cleaned)) {
    cleaned = cleaned.replace(/l(?:akh)?s?/gi, "");
    multiplier = 100_000;
    fixed = true;
  } else if (/(\d+(?:\.\d+)?)\s*k/i.test(cleaned)) {
    cleaned = cleaned.replace(/k/gi, "");
    multiplier = 1_000;
    fixed = true;
  }

  const num = parseFloat(cleaned) * multiplier;
  if (isNaN(num)) return { amount: null, rawTypeHint: null, fixed: false };

  if (num < 0 || bankHint === "expense") {
    return { amount: Math.abs(num), rawTypeHint: "expense", fixed: true };
  }

  return { amount: num, rawTypeHint: bankHint || "sale", fixed: fixed || s !== String(num) };
}

function parseType(raw: string | undefined, amountHint: "sale" | "expense" | null): "sale" | "expense" {
  if (!raw) return amountHint || "sale";
  const s = raw.toLowerCase().trim();

  if (["sale", "sales", "income", "credit", "cr", "jama", "inflow", "received"].includes(s)) {
    return "sale";
  }
  if (["expense", "expenses", "purchase", "debit", "dr", "kharch", "outflow", "paid"].includes(s)) {
    return "expense";
  }

  return amountHint || "sale";
}

function parsePaymentMode(raw: string | undefined): "cash" | "upi" | "card" | "other" | undefined {
  if (!raw) return undefined;
  const s = raw.toLowerCase().trim();

  if (s.includes("cash") || s === "rokh") return "cash";
  if (s.includes("upi") || s.includes("gpay") || s.includes("phonepe") || s.includes("paytm") || s.includes("bhim") || s.includes("qr")) {
    return "upi";
  }
  if (s.includes("card") || s.includes("pos") || s.includes("debit") || s.includes("credit") || s.includes("visa") || s.includes("mastercard")) {
    return "card";
  }
  return "other";
}

export function cleanRows(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): { transactions: Transaction[]; report: CleanReport } {
  let datesFixed = 0;
  let amountsFixed = 0;
  let rowsDropped = 0;
  const warnings: string[] = [];

  // Find column keys for roles
  const dateCol = Object.keys(mapping).find((k) => mapping[k] === "date");
  const amountCol = Object.keys(mapping).find((k) => mapping[k] === "amount");
  const typeCol = Object.keys(mapping).find((k) => mapping[k] === "type");
  const categoryCol = Object.keys(mapping).find((k) => mapping[k] === "category");
  const modeCol = Object.keys(mapping).find((k) => mapping[k] === "paymentMode");

  if (!dateCol || !amountCol) {
    throw new Error("Both Date and Amount columns must be mapped to clean data.");
  }

  const transactions: Transaction[] = [];
  const rowSignatures: Record<string, number> = {};
  let exactDuplicates = 0;

  for (const row of rows) {
    const rawDate = row[dateCol];
    const rawAmount = row[amountCol];

    const { isoDate, fixed: dateFixed } = parseFlexibleDate(rawDate);
    const { amount, rawTypeHint, fixed: amtFixed } = parseFlexibleAmount(rawAmount);

    if (!isoDate || amount === null || amount <= 0) {
      rowsDropped++;
      continue;
    }

    if (dateFixed) datesFixed++;
    if (amtFixed) amountsFixed++;

    const type = parseType(typeCol ? row[typeCol] : undefined, rawTypeHint);
    const category = categoryCol && row[categoryCol] ? row[categoryCol].trim() : undefined;
    const paymentMode = modeCol ? parsePaymentMode(row[modeCol]) : undefined;

    // Track duplicate occurrences
    const sig = `${isoDate}|${amount}|${type}|${category || ""}|${paymentMode || ""}`;
    rowSignatures[sig] = (rowSignatures[sig] || 0) + 1;
    if (rowSignatures[sig] > 1) {
      exactDuplicates++;
    }

    transactions.push({
      date: isoDate,
      amount,
      type,
      category: category || (type === "sale" ? "General Sales" : "General Expense"),
      paymentMode,
    });
  }

  // Warning if exact duplicates exceed 5%
  if (rows.length > 0 && exactDuplicates / rows.length > 0.05) {
    warnings.push(`${exactDuplicates} rows appear identical to previous rows. Repeat sales are retained.`);
  }

  // Sort chronologically
  transactions.sort((a, b) => a.date.localeCompare(b.date));

  const dateFrom = transactions.length > 0 ? transactions[0].date : "";
  const dateTo = transactions.length > 0 ? transactions[transactions.length - 1].date : "";

  let days = 0;
  if (dateFrom && dateTo) {
    const tFrom = new Date(dateFrom).getTime();
    const tTo = new Date(dateTo).getTime();
    days = Math.max(1, Math.round((tTo - tFrom) / (1000 * 60 * 60 * 24)) + 1);
  }

  const report: CleanReport = {
    rowsRead: rows.length,
    rowsKept: transactions.length,
    rowsDropped,
    datesFixed,
    amountsFixed,
    warnings,
    dateFrom,
    dateTo,
    days,
  };

  return { transactions, report };
}
