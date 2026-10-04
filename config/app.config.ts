export const APP = {
  name: "Audit Uncle",
  version: "v1",
  tagline: "Your books. Your phone. Your CFO.",
} as const;

export const AI = {
  defaultProvider: "template",
  webllmModelId: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
  modelLabel: "Qwen2.5 1.5B",
  approxDownloadMB: 900,
  openrouterUrl: "https://openrouter.ai/api/v1/chat/completions",
  openrouterModel: "google/gemma-4-26b-a4b-it:free",
  openrouterLabel: "Gemma 4 26B (OpenRouter)",
  maxTokensNarration: 120,
  maxTokensCfo: 300,
  timeoutMs: 25_000,
} as const;

export const BUSINESS_TYPES = [
  {
    id: "kirana",
    label: "Kirana / General store",
    taxProfile: "goods",
    taxDetails: "1% flat GST Composition or 5% standard goods",
  },
  {
    id: "vmart",
    label: "V-Mart (Apparel & Value Fashion)",
    taxProfile: "vmart",
    taxDetails: "5% (≤₹1k) & 12% (>₹1k) apparel · ~7% blended with 75% ITC",
  },
  {
    id: "dmart",
    label: "DMart (Hypermarket & FMCG Staples)",
    taxProfile: "dmart",
    taxDetails: "0% staples, 5% food & oil, 18% FMCG · ~5% blended with 80% ITC",
  },
  {
    id: "smart_bazaar",
    label: "Smart Bazaar (Supermarket & Departmental)",
    taxProfile: "smart_bazaar",
    taxDetails: "0-5% grocery, 12% apparel, 18% home · ~8% blended with 75% ITC",
  },
  {
    id: "cafe",
    label: "Cafe & tiffin",
    taxProfile: "restaurant",
    taxDetails: "5% GST under restaurant service scheme (no ITC)",
  },
  {
    id: "salon",
    label: "Salon & services",
    taxProfile: "services",
    taxDetails: "18% GST with eligible business ITC",
  },
  {
    id: "other",
    label: "Other",
    taxProfile: "goods",
    taxDetails: "Standard 5% goods / 1% composition",
  },
] as const;

export const NARRATOR_LANGUAGES = [
  { id: "english", label: "English" },
  { id: "hinglish", label: "Hinglish" },
] as const;

export const DEFAULTS = {
  openingCash: 50_000,
  businessType: "kirana",
  narratorLanguage: "hinglish",
  forecastDays: 30,
} as const;

export const LIMITS = {
  maxRows: 50_000,
  maxFileMB: 5,
  minDaysForRunway: 14,
} as const;

export const SCORE_WEIGHTS = {
  runway: 35,
  margin: 25,
  trend: 20,
  cashReliance: 10,
  taxReadiness: 10,
} as const;

export const BANDS = {
  healthy: 70,
  watch: 40,
} as const;

export const ASSUMPTIONS = {
  priceElasticity: 0.5, // 10% price rise loses 5% volume
} as const;

export const SAMPLES = [
  {
    id: "real",
    label: "Real Business Sample (Clean)",
    file: "/samples/real-business-sample.csv",
    openingCash: 50000,
    businessType: "kirana",
  },
  {
    id: "kirana",
    label: "Kirana store",
    file: "/samples/kirana-store.csv",
    openingCash: 60000,
    businessType: "kirana",
  },
  {
    id: "tiffin",
    label: "Tiffin service",
    file: "/samples/tiffin-service.csv",
    openingCash: 35000,
    businessType: "cafe",
  },
  {
    id: "messy",
    label: "Messy CSV",
    file: "/samples/messy-sample.csv",
    openingCash: 40000,
    businessType: "kirana",
  },
] as const;
