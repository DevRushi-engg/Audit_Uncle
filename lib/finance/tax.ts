import { TAX, TAX_DISCLAIMER } from "@/config/tax.config";
import { BUSINESS_TYPES } from "@/config/app.config";
import { BusinessTypeId, TaxEstimate } from "@/types/finance";

interface TaxFactsSubset {
  totalSales: number;
  totalExpenses: number;
  paymentSplit: {
    digitalSharePct: number;
  };
  dailySeries: { length: number };
}

export function estimateTax(facts: TaxFactsSubset, businessType: BusinessTypeId): TaxEstimate {
  const bConfig = BUSINESS_TYPES.find((b) => b.id === businessType) || BUSINESS_TYPES[0];
  const profile = bConfig.taxProfile;
  const days = Math.max(1, facts.dailySeries.length);

  // Annualize turnover based on observation window
  const annualFactor = 365 / days;
  const annualizedTurnover = facts.totalSales * annualFactor;
  const annualizedExpenses = facts.totalExpenses * annualFactor;

  // 1. GST Estimation
  const regimeId = TAX.defaultRegimeByProfile[profile] || "composition";
  let gstPayable = 0;
  let regimeLabel = "";

  if (regimeId === "composition") {
    const rate = TAX.gst.regimes.composition.rate;
    // Composition levy on total sales
    gstPayable = Math.round(facts.totalSales * rate);
    regimeLabel = `${TAX.gst.regimes.composition.label} (${(rate * 100).toFixed(0)}%)`;
  } else if (regimeId === "regular") {
    const rate = TAX.gst.regimes.regular.rate;
    // Output GST minus Input Tax Credit on estimated 70% eligible purchases
    const outputTax = facts.totalSales * rate;
    const inputCredit = facts.totalExpenses * 0.7 * rate;
    gstPayable = Math.max(0, Math.round(outputTax - inputCredit));
    regimeLabel = `${TAX.gst.regimes.regular.label} with ITC`;
  } else if (regimeId === "vmart_apparel") {
    const rate = TAX.gst.regimes.vmart_apparel.rate;
    const outputTax = facts.totalSales * rate;
    const inputCredit = facts.totalExpenses * 0.75 * rate;
    gstPayable = Math.max(0, Math.round(outputTax - inputCredit));
    regimeLabel = TAX.gst.regimes.vmart_apparel.label;
  } else if (regimeId === "dmart_retail") {
    const rate = TAX.gst.regimes.dmart_retail.rate;
    const outputTax = facts.totalSales * rate;
    const inputCredit = facts.totalExpenses * 0.80 * rate;
    gstPayable = Math.max(0, Math.round(outputTax - inputCredit));
    regimeLabel = TAX.gst.regimes.dmart_retail.label;
  } else if (regimeId === "smart_bazaar") {
    const rate = TAX.gst.regimes.smart_bazaar.rate;
    const outputTax = facts.totalSales * rate;
    const inputCredit = facts.totalExpenses * 0.75 * rate;
    gstPayable = Math.max(0, Math.round(outputTax - inputCredit));
    regimeLabel = TAX.gst.regimes.smart_bazaar.label;
  } else {
    gstPayable = 0;
    regimeLabel = TAX.gst.regimes.none.label;
  }

  // 2. Presumptive Income Tax (Section 44AD)
  const isDigitalMajority = facts.paymentSplit.digitalSharePct >= 50;
  const presumptiveRate = isDigitalMajority
    ? TAX.presumptive.digitalRatePct
    : TAX.presumptive.ratePct;

  // Deemed annual profit
  const deemedAnnualProfit = Math.min(annualizedTurnover, TAX.presumptive.turnoverCapAnnual) * presumptiveRate;

  // Calculate annual income tax liability using tax slabs
  let calculatedAnnualIncomeTax = 0;
  let previousLimit = 0;

  for (const slab of TAX.incomeTaxSlabs) {
    if (deemedAnnualProfit > previousLimit) {
      const taxableInThisSlab = Math.min(deemedAnnualProfit, slab.upTo) - previousLimit;
      calculatedAnnualIncomeTax += taxableInThisSlab * slab.rate;
      previousLimit = slab.upTo;
    } else {
      break;
    }
  }

  // Prorate back to observation window
  const periodIncomeTax = Math.round(calculatedAnnualIncomeTax / annualFactor);

  const rulesUsed = `GST ${regimeLabel} · Sec 44AD Presumptive ${(presumptiveRate * 100).toFixed(0)}% (${
    isDigitalMajority ? "Digital predominant" : "Standard"
  })`;

  return {
    gstPayable,
    incomeTax: periodIncomeTax,
    regimeLabel,
    rulesUsed,
    disclaimer: TAX_DISCLAIMER,
  };
}
