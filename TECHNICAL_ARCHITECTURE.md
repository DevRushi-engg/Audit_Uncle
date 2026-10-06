# Audit Uncle — Complete Technical Architecture & Reference Manual

> **॥ तुमचा हिशोब, तुमच्याच फोनवर ॥**  
> *Private, Local-First AI CFO & Financial Intelligence Engine for Indian Retailers*

---

## 1. Executive Technical Summary

| Dimension | Specification |
| :--- | :--- |
| **Core Framework** | Next.js 15.5.27 (App Router), React 19, TypeScript 5.8 |
| **Styling & Design** | Tailwind CSS + PostCSS, Indian Ledger Paper Aesthetics (`#FBF6E9`, `#A8231B`, `#E8A317`) |
| **Inference Runtime** | Hybrid: Local deterministic TypeScript math engine + Open-source multimodal LLM via OpenRouter |
| **AI Models Used** | **Qwen 3.8 27B Vision** (OCR / Multimodal) & **Google Gemma 4** (CFO Narration) |
| **Database / Storage** | **Zero-Database Architecture**; Ephemeral in-memory session map (15-min TTL) + React memory sandbox |
| **Data Ingestion** | Raw CSV file drag-and-drop + Mobile Camera QR Handshake OCR |
| **Target Sector** | Indian micro-businesses (Kirana, V-Mart, DMart, Smart Bazaar, Cafes, Salons) |

---

## 2. End-to-End System Architecture

```
[ User Input: CSV File or Phone Camera Snap ]
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│ 1. INGESTION & SANITIZATION LAYER                      │
│    • lib/csv/parse.ts: In-browser streaming CSV parser │
│    • lib/csv/detect.ts: Fuzzy header auto-mapper       │
│    • lib/csv/clean.ts: Currency/Date sanitization      │
│    • app/api/vision/parse-bill: Qwen 3.8 27B OCR       │
└──────────────────────────┬─────────────────────────────┘
                           │ Cleaned Transactions []
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. DETERMINISTIC FINANCIAL ENGINE (lib/finance/)       │
│    • metrics.ts: Net cash, daily averages, velocity    │
│    • runway.ts: Zero-revenue survival runway (days)    │
│    • tax.ts: GST (5%, 12%, 18%) & Sec 44AD Presumptive │
│    • score.ts: 5-pillar health score (0–100 scale)     │
│    • whatif.ts: Price elasticity & capex simulation    │
└──────────────────────────┬─────────────────────────────┘
                           │ Structured Financial Facts JSON
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. MULTI-AGENT ADVISORY COUNCIL (lib/agents/)          │
│    • Cleaner Agent: Verifies row integrity             │
│    • Analyst Agent: Pinpoints growth & margin trends   │
│    • Tax Agent: Computes GST & IT liability breakdown │
│    • Risk Agent: Flags cash drain speed & burn alert   │
│    • CFO Agent: Produces actionable 3-step action memo │
└──────────────────────────┬─────────────────────────────┘
                           │ Bound Natural Language
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. ZERO-CLOUD PRESENTATION LAYER (components/)         │
│    • KhataPanel: Column mapping & business profile     │
│    • DashboardPanel: KPIs, Recharts cash-flow charts   │
│    • AskPanel: Intent router & factual Q&A             │
│    • ScanBillModal: Cross-device QR camera bridge      │
└────────────────────────────────────────────────────────┘
```

---

## 3. Deep-Dive: Complete Execution Lifecycle

### Stage 1: Document & Data Ingestion

The application accepts data through two independent paths that merge into the same pipeline:

#### Path A: Standard CSV Upload
1. Merchant drops a file onto `components/UploadCard.tsx`.
2. `lib/csv/parse.ts` invokes `PapaParse` inside the browser thread.
3. `lib/csv/detect.ts` runs tokenized regex matching to detect required columns (`Date`, `Amount`, `Type`, `Category`, `PaymentMode`).
4. `lib/csv/clean.ts` standardizes:
   - Dates: Parses ISO `YYYY-MM-DD`, Indian `DD/MM/YYYY`, and slash/dash variations into canonical dates.
   - Amounts: Strips currency symbols (`₹`, `Rs.`), commas, trailing spaces, and converts negative accounting values `(450)` into positive absolute numbers with `type: "expense"`.

#### Path B: Mobile Camera QR Bridge (Vision AI)
1. Laptop generates an in-memory session token (`AU-XXXXXX`) via `/api/scan/session`.
2. The server binds its local network IP (`http://10.51.121.252:3000/scan?id=AU-XXXXXX`) into an SVG QR code using `qrcode`.
3. Merchant scans QR with their phone. Mobile browser opens `/scan` directly.
4. Mobile camera takes a top-down photo via `<input type="file" capture="environment">`.
5. Mobile client resizes the photo via HTML5 Canvas (max 1600px, JPEG 0.85) and transmits Base64 to `/api/scan/session`.
6. Server forwards the image to **Qwen 3.8 27B Multimodal Vision AI** (`qwen/qwen3.8-27b:free`).
7. Model transcribes handwritten shop registers (Milk, Soap, Wire, Butter, etc.) into structured JSON transactions.
8. Server formats this into canonical CSV text and flags the session as `status: "completed"`.
9. The laptop polls every 1.5s, retrieves the CSV, auto-closes the modal, and triggers calculation.

---

### Stage 2: Deterministic Financial Mathematics (`lib/finance/`)

> **Architectural Guard:** The AI model is **forbidden** from performing arithmetic. All calculations are executed deterministically by pure TypeScript functions.

#### 1. Cash Flow & Net Velocity (`metrics.ts`)
* $\text{Net Income} = \sum \text{Sales} - \sum \text{Expenses}$
* $\text{Daily Average Sales} = \frac{\sum \text{Sales}}{\text{Days Count}}$
* $\text{Cash Now} = \text{Opening Cash} + \text{Net Income}$

#### 2. Survival Runway (`runway.ts`)
* Calculates how many days the business can survive if **sales drop to zero today**:
$$\text{Survival Days} = \left\lfloor \frac{\text{Cash Now}}{\text{Last 30 Days Average Daily Expense}} \right\rfloor$$

#### 3. Indian Tax Engine (`tax.ts` & `tax.config.ts`)
Supports retail profiles researched specifically for Indian business formats:
* **Kirana / General Store:** Flat 1% GST Composition turnover levy.
* **V-Mart Model:** Apparel & footwear (5% for $\le$ ₹1,000, 12% for $>$ ₹1,000, blended at ~7% with 75% Input Tax Credit offset).
* **DMart Model:** Hypermarket & FMCG (0% fresh, 5% branded food, 18% home care, blended at ~5% with 80% Input Tax Credit offset).
* **Smart Bazaar Model:** Departmental supermarket (blended at ~8% with 75% ITC offset).
* **Section 44AD Presumptive Income Tax:**
  - Deemed profit rate: **6%** for digital turnover (UPI/Card/NEFT), **8%** for cash turnover.
  - Tax computed on deemed profit according to New Income Tax Regime slabs.

#### 4. Business Health Score (`score.ts`)
A composite 0–100 score benchmarked against small-business health metrics:
* **Runway Factor (35 pts):** $>90$ days = max points.
* **Profit Margin Factor (25 pts):** Net margin $>20\%$ = max points.
* **Trend Velocity (20 pts):** Month-over-month growth delta.
* **Digital Cash Reliance (10 pts):** Percentage of sales received digitally.
* **Tax Readiness (10 pts):** Sufficient cash reserves to cover estimated GST/IT.

#### 5. What-If Scenario Modeling (`whatif.ts`)
* Simulates business shifts before execution:
  - Price Changes: Incorporates price elasticity factor ($E_d = 0.5$, where a 10% price rise models a 5% volume loss).
  - Expense Reductions: Re-computes runway extension.
  - One-time Capital Spend: Deducts cash immediately and recalculates new survival runway.

---

### Stage 3: Multi-Agent Council (`lib/agents/`)

The application simulates a corporate executive finance committee via 5 coordinated agents orchestrated by `orchestrator.ts`:

1. **Cleaner Agent (`cleaner.ts`):** Validates parsed rows, drops duplicates, and provides an audit log.
2. **Analyst Agent (`analyst.ts`):** Evaluates top revenue generators, weekday spikes, and expense concentrations.
3. **Tax Agent (`tax.ts`):** Verifies applicable GST regimes and Section 44AD presumptive liabilities.
4. **Risk Agent (`risk.ts`):** Scans for critical runway warnings ($<30$ days), cash reliance risks, and negative velocity.
5. **CFO Agent (`cfo.ts`):** Formulates the **Audit Uncle CFO Memo**—a concise executive headline plus exactly 3 prioritized, actionable directives.

**Safety Enforcement (`lib/ai/guard.ts`):**
Any narration produced by the AI is intercepted before rendering. The guard verifies that every single number quoted by the AI exists verbatim in the verified mathematical facts. If a hallucination is detected, the app automatically drops the sentence and replaces it with deterministic code templates (`lib/ai/template.ts`).

---

### Stage 4: Ask Uncle Query Router (`lib/ai/router.ts`)

Natural language queries typed by the user (e.g., *"Can I afford a ₹40,000 deep freezer?"*) are processed via tool routing:

1. `router.ts` prompts the router to map the question to one of 6 deterministic tools:
   - `affordability`: Checks purchase against available cash and resulting runway impact.
   - `bestWorstDays`: Identifies peak revenue days and slowest trading periods.
   - `weekdayPerformance`: Compares specific days (e.g. Tuesday vs Sunday average).
   - `totalSales`: Evaluates 7-day, 30-day, or all-time sales volumes.
   - `runwayNow`: Reports current runway survival count.
   - `topExpenses`: Surfaces highest spend categories.
2. `executeTool()` runs the exact mathematical lookup.
3. The narrator presents the final explanation with an explicit **"Calculated by code"** badge.

---

## 4. Key Functions Reference Map

| Function | File | Input | Output | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `parseCsvText()` | `lib/csv/parse.ts` | Raw CSV String | `{ headers, rows }` | In-browser CSV tokenizer |
| `detectMapping()` | `lib/csv/detect.ts` | Headers, Row samples | `{ mapping, autoDetected }` | Auto-detects columns (`date`, `amount`, etc.) |
| `cleanRows()` | `lib/csv/clean.ts` | Raw rows, mapping | `{ transactions, report }` | Cleans dates, amounts, and validates data |
| `computeFacts()` | `lib/finance/metrics.ts`| Transactions, cash, profile | `FinanceFacts` | Central mathematical calculation engine |
| `estimateTax()` | `lib/finance/tax.ts` | Sales, expenses, split | `TaxEstimate` | Computes GST and Sec 44AD tax |
| `calculateRunway()` | `lib/finance/runway.ts`| Cash now, daily series | `Runway` | Computes zero-revenue survival days |
| `calculateScore()` | `lib/finance/score.ts` | Facts subset | `HealthScore` | Evaluates 0–100 health grade & band |
| `runWhatIf()` | `lib/finance/whatif.ts` | Facts, scenario inputs | `WhatIfResult` | Simulates price/expense/capex alterations |
| `executeTool()` | `lib/finance/tools.ts` | Tool name, args, facts | `ToolResult` | Factual Q&A tool executor |
| `createScanSession()`| `lib/scan/sessionStore.ts`| None | `ScanSession` | Creates 15-min cross-device QR session |

---

## 5. Security, Privacy & Storage Architecture

1. **Zero Database Footprint:**
   - No SQL, MongoDB, or external datastore is attached.
   - No persistent records are retained once the browser tab is closed.
2. **Local Browser Isolation:**
   - Transactions are held strictly in React component state memory.
   - Files dropped into the interface never travel over HTTP to an external server.
3. **Cross-Device Session Ephemerality:**
   - In-memory session store (`sessionStore.ts`) holds only temporary session IDs.
   - Automatically pruned after 15 minutes.
4. **Environment Isolation:**
   - OpenRouter API keys are restricted to server-side API routes (`app/api/ai/route.ts` and `app/api/vision/parse-bill/route.ts`).
   - Keys are never bundled or exposed in client JavaScript bundles.
