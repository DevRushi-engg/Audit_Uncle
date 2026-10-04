import { ColumnMapping, ColumnRole } from "@/types/finance";

const ROLE_SYNONYMS: Record<ColumnRole, string[]> = {
  date: [
    "date",
    "day",
    "dt",
    "txn date",
    "transaction date",
    "entry date",
    "tarikh",
    "tariqh",
    "time",
    "timestamp",
    "invoice date",
    "bill date",
    "order date",
    "voucher date",
    "posting date",
    "value date",
    "created at",
    "date of txn",
  ],
  amount: [
    "amount",
    "amt",
    "total",
    "value",
    "sale",
    "sales",
    "price",
    "net amount",
    "gross",
    "rupees",
    "inr",
    "rs",
    "jama",
    "kharch",
    "debit",
    "credit",
    "dr",
    "cr",
    "balance",
    "grand total",
    "item total",
    "paid",
    "received",
    "inflow",
    "outflow",
  ],
  type: [
    "type",
    "kind",
    "dr-cr",
    "dr/cr",
    "drcr",
    "txn type",
    "transaction type",
    "direction",
    "flow",
    "jama-kharch",
    "credit/debit",
    "nature",
    "status",
  ],
  category: [
    "category",
    "item",
    "head",
    "particulars",
    "description",
    "product",
    "item name",
    "expense head",
    "type of item",
    "tag",
    "ledger",
    "account",
    "party",
    "party name",
    "customer",
    "supplier",
    "remarks",
    "note",
  ],
  paymentMode: [
    "mode",
    "payment",
    "payment mode",
    "pay mode",
    "method",
    "payment method",
    "channel",
    "via",
    "payment type",
    "source",
    "gateway",
    "mode of payment",
  ],
  ignore: [],
};

function isDateLike(val: string): boolean {
  if (!val) return false;
  const s = val.trim();
  // Matches yyyy-mm-dd, dd/mm/yyyy, dd-mm-yy, etc.
  return (
    /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(s) ||
    /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/.test(s) ||
    !isNaN(Date.parse(s))
  );
}

function isNumericLike(val: string): boolean {
  if (!val) return false;
  const cleaned = val.replace(/[₹$,\s]/g, "");
  return !isNaN(Number(cleaned)) && cleaned.length > 0;
}

function isTypeLike(val: string): boolean {
  if (!val) return false;
  const s = val.toLowerCase().trim();
  return ["sale", "sales", "income", "credit", "cr", "expense", "purchase", "debit", "dr"].includes(s);
}

function isPaymentModeLike(val: string): boolean {
  if (!val) return false;
  const s = val.toLowerCase().trim();
  return ["cash", "upi", "gpay", "phonepe", "paytm", "card", "online", "netbanking", "cheque"].includes(s);
}

export function detectMapping(
  headers: string[],
  sampleRows: Record<string, string>[]
): { mapping: ColumnMapping; autoDetected: Record<string, boolean> } {
  const mapping: ColumnMapping = {};
  const autoDetected: Record<string, boolean> = {};
  const assignedRoles = new Set<ColumnRole>();

  // Pass 0: Exact match check for all roles (Exact name takes highest priority)
  for (const header of headers) {
    const norm = header.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
    for (const [role, synonyms] of Object.entries(ROLE_SYNONYMS) as [ColumnRole, string[]][]) {
      if (role === "ignore" || assignedRoles.has(role)) continue;
      if (synonyms.some((syn) => norm === syn)) {
        mapping[header] = role;
        assignedRoles.add(role);
        autoDetected[header] = true;
        break;
      }
    }
  }

  // Pass 1: Word-boundary synonym matching for remaining unassigned headers
  for (const header of headers) {
    if (mapping[header] && mapping[header] !== "ignore") continue;
    const norm = header.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
    const words = norm.split(/\s+/).filter(Boolean);

    for (const [role, synonyms] of Object.entries(ROLE_SYNONYMS) as [ColumnRole, string[]][]) {
      if (role === "ignore" || assignedRoles.has(role)) continue;

      const hasMatch = synonyms.some((syn) => {
        if (norm === syn) return true;
        if (syn.includes(" ")) {
          const escaped = syn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          return new RegExp(`\\b${escaped}\\b`, "i").test(norm);
        }
        return words.includes(syn);
      });

      if (hasMatch) {
        mapping[header] = role;
        assignedRoles.add(role);
        autoDetected[header] = true;
        break;
      }
    }
  }

  // Pass 2: Sniff values for unassigned columns (especially date and amount)
  for (const header of headers) {
    if (mapping[header] && mapping[header] !== "ignore") continue;

    const values = sampleRows.map((r) => String(r[header] || "")).filter(Boolean).slice(0, 15);
    if (values.length === 0) {
      mapping[header] = "ignore";
      autoDetected[header] = false;
      continue;
    }

    if (!assignedRoles.has("date") && values.filter(isDateLike).length >= values.length * 0.6) {
      mapping[header] = "date";
      assignedRoles.add("date");
      autoDetected[header] = true;
      continue;
    }

    if (!assignedRoles.has("amount") && values.filter(isNumericLike).length >= values.length * 0.6) {
      mapping[header] = "amount";
      assignedRoles.add("amount");
      autoDetected[header] = true;
      continue;
    }

    if (!assignedRoles.has("type") && values.filter(isTypeLike).length >= values.length * 0.5) {
      mapping[header] = "type";
      assignedRoles.add("type");
      autoDetected[header] = true;
      continue;
    }

    if (!assignedRoles.has("paymentMode") && values.filter(isPaymentModeLike).length >= values.length * 0.5) {
      mapping[header] = "paymentMode";
      assignedRoles.add("paymentMode");
      autoDetected[header] = true;
      continue;
    }

    if (!assignedRoles.has("category")) {
      mapping[header] = "category";
      assignedRoles.add("category");
      autoDetected[header] = true;
      continue;
    }

    mapping[header] = "ignore";
    autoDetected[header] = false;
  }

  // Pass 3: Post-validation - ensure column mapped to "amount" is truly numeric!
  for (const header of headers) {
    if (mapping[header] === "amount") {
      const values = sampleRows.map((r) => String(r[header] || "")).filter(Boolean).slice(0, 15);
      const numericCount = values.filter(isNumericLike).length;
      if (values.length > 0 && numericCount === 0) {
        // Demote misclassified text column
        mapping[header] = "category";
        assignedRoles.delete("amount");

        // Find the real numeric column
        for (const candidate of headers) {
          if (candidate !== header && mapping[candidate] !== "date") {
            const candVals = sampleRows.map((r) => String(r[candidate] || "")).filter(Boolean).slice(0, 15);
            if (candVals.filter(isNumericLike).length >= candVals.length * 0.6) {
              mapping[candidate] = "amount";
              assignedRoles.add("amount");
              autoDetected[candidate] = true;
              break;
            }
          }
        }
      }
    }
  }

  return { mapping, autoDetected };
}
