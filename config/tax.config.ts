/**
 * ESTIMATION ONLY. Rates below are illustrative placeholders —
 * VERIFY against current official rules before any demo.
 * Never present as tax advice.
 */

export const TAX_DISCLAIMER = "Estimate only — not tax advice. Please confirm with your CA.";

export const TAX = {
  gst: {
    regimes: {
      regular: { id: "regular", label: "Regular GST (5%)", rate: 0.05 },
      composition: { id: "composition", label: "GST Composition (1%)", rate: 0.01 },
      vmart_apparel: { id: "vmart_apparel", label: "V-Mart Model: Apparel & Fashion (5%–12% Blended with ITC)", rate: 0.07 },
      dmart_retail: { id: "dmart_retail", label: "DMart Model: Hypermarket & FMCG (5% Blended with High ITC)", rate: 0.05 },
      smart_bazaar: { id: "smart_bazaar", label: "Smart Bazaar Model: Multi-Category Supermarket (8% Blended with ITC)", rate: 0.08 },
      none: { id: "none", label: "No GST (Below Threshold)", rate: 0.0 },
    },
    thresholdGoodsAnnual: 4_000_000, // ₹40 Lakhs for goods
    thresholdServicesAnnual: 2_000_000, // ₹20 Lakhs for services / restaurants
  },
  presumptive: {
    ratePct: 0.08, // Section 44AD - 8% on non-digital sales
    digitalRatePct: 0.06, // Section 44AD - 6% on digital (UPI/card) sales
    turnoverCapAnnual: 20_000_000, // ₹2 Crore cap for presumptive taxation
  },
  incomeTaxSlabs: [
    { upTo: 300_000, rate: 0.0 }, // Up to ₹3 Lakhs: 0%
    { upTo: 700_000, rate: 0.05 }, // ₹3L - ₹7L: 5% (with rebate under new tax regime)
    { upTo: 1_000_000, rate: 0.1 }, // ₹7L - ₹10L: 10%
    { upTo: 1_200_000, rate: 0.15 }, // ₹10L - ₹12L: 15%
    { upTo: 1_500_000, rate: 0.2 }, // ₹12L - ₹15L: 20%
    { upTo: Infinity, rate: 0.3 }, // Above ₹15L: 30%
  ],
  defaultRegimeByProfile: {
    goods: "composition",
    restaurant: "composition",
    services: "regular",
    vmart: "vmart_apparel",
    dmart: "dmart_retail",
    smart_bazaar: "smart_bazaar",
  } as Record<string, string>,
} as const;
