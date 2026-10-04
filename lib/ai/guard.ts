import { CfoMemo } from "@/types/finance";

function normalizeNumberToken(token: string): string {
  return token.replace(/[₹,%\s]/g, "").replace(/days?/gi, "").trim();
}

export function extractNumbers(text: string): string[] {
  // Matches patterns like ₹4,82,300, 41%, 36 days, 40000, 14.5
  const matches = text.match(/[₹]?\s*[\d,]+(?:\.\d+)?\s*(?:%|days?)?/gi) || [];
  return matches
    .map(normalizeNumberToken)
    .filter((n) => n.length > 0 && !isNaN(Number(n)));
}

export function extractAllowedNumbersFromObject(obj: unknown): Set<string> {
  const allowed = new Set<string>();

  function traverse(item: unknown) {
    if (typeof item === "number") {
      allowed.add(String(Math.round(item)));
      allowed.add(item.toFixed(1));
      allowed.add(String(item));
    } else if (typeof item === "string") {
      const nums = extractNumbers(item);
      for (const n of nums) {
        allowed.add(n);
        const floatVal = parseFloat(n);
        if (!isNaN(floatVal)) {
          allowed.add(String(Math.round(floatVal)));
        }
      }
    } else if (Array.isArray(item)) {
      for (const val of item) traverse(val);
    } else if (item && typeof item === "object") {
      for (const val of Object.values(item)) traverse(val);
    }
  }

  traverse(obj);

  // Common small structural constants allowed in natural language
  allowed.add("0");
  allowed.add("1");
  allowed.add("2");
  allowed.add("3");
  allowed.add("4");
  allowed.add("5");
  allowed.add("7");
  allowed.add("14");
  allowed.add("30");

  return allowed;
}

export function validateNarration(text: string, factsSubset: unknown): boolean {
  if (!text || text.trim().length === 0) return false;

  const textNumbers = extractNumbers(text);
  if (textNumbers.length === 0) return true; // Pure commentary is allowed

  const allowedNumbers = extractAllowedNumbersFromObject(factsSubset);

  for (const num of textNumbers) {
    const intVal = String(Math.round(parseFloat(num)));
    if (!allowedNumbers.has(num) && !allowedNumbers.has(intVal)) {
      console.warn(`Guard rejected AI narration. Disallowed number found: "${num}". Allowed numbers:`, Array.from(allowedNumbers));
      return false;
    }
  }

  return true;
}

export function stripCodeFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

export function parseAndValidateCfoJson(rawText: string, factsSubset: unknown): CfoMemo | null {
  try {
    const cleaned = stripCodeFences(rawText);
    const parsed = JSON.parse(cleaned);

    if (
      parsed &&
      typeof parsed.headline === "string" &&
      Array.isArray(parsed.actions) &&
      parsed.actions.length >= 3 &&
      parsed.actions.every((a: unknown) => typeof a === "string")
    ) {
      // Validate all sentences against guard
      const allText = `${parsed.headline} ${parsed.actions.join(" ")}`;
      if (validateNarration(allText, factsSubset)) {
        return {
          headline: parsed.headline,
          actions: parsed.actions.slice(0, 3),
        };
      }
    }
  } catch (err) {
    console.warn("CFO output was not valid JSON, falling back to template:", err);
  }

  return null;
}
