/**
 * Indian currency and numerical formatting utilities
 */

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "₹0";
  }
  const isNegative = amount < 0;
  const abs = Math.round(Math.abs(amount));
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(abs);

  return isNegative ? `-₹${formatted}` : `₹${formatted}`;
}

export function formatDays(days: number | null | undefined): string {
  if (days === null || days === undefined || isNaN(days)) {
    return "N/A";
  }
  const r = Math.round(days);
  return `${r} ${r === 1 ? "day" : "days"}`;
}

export function formatPct(value: number, decimals = 1): string {
  if (isNaN(value) || value === null || value === undefined) {
    return "0.0%";
  }
  return `${value.toFixed(decimals)}%`;
}

export function formatShortINR(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 10_000_000) {
    return `${sign}₹${(abs / 10_000_000).toFixed(1)}Cr`;
  }
  if (abs >= 100_000) {
    return `${sign}₹${(abs / 100_000).toFixed(1)}L`;
  }
  if (abs >= 1_000) {
    return `${sign}₹${(abs / 1_000).toFixed(0)}k`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
}
