# Munim — Design Specification

**Product:** Munim (working name) — a private, on-device AI CFO for micro-businesses
**Event:** Hacktoberfest Hack Day Nashik × Hustler Hive (MLH)
**Design reference:** The Indian *bahi-khata* (cloth-bound ledger book) — no live site; the physical object is the reference
**Source build prompt:** build.md
**Design status:** Build-ready specification

---

## 1. Design Direction

Munim should feel like a **modern bahi-khata**: the trusted red ledger every shopkeeper already understands, upgraded with a team of AI agents that read it for you. It must not feel like a generic fintech dashboard.

The visual direction combines:

- Cream ruled-paper surfaces with a red margin line.
- Ink-blue "pen" figures and thick near-black outlines.
- Hard offset shadows (no blur) like stacked paper slips.
- Turmeric yellow as the main action colour.
- Rubber-stamp badges for the health score and "ESTIMATE" marks.
- Tally-mark and ledger-rule decorative language.
- Light Marathi/Hinglish microcopy so it feels local without becoming a caricature.

Borrow the **visual grammar** of a ledger — ruled lines, margins, stamps, tally marks — not skeuomorphic leather textures.

Reference observations from a real bahi-khata:
- Cream/yellowed paper with faint horizontal rules.
- A double red margin line on the left.
- Figures written in blue/black ink, right-aligned in columns.
- Rubber stamps ("PAID", "CHECKED") pressed over entries.
- Tally strokes grouped in fives.
- Red cloth cover and a spine.
- Calm, trustworthy, slightly formal tone.

---

## 2. Design Principles

### 2.1 Numbers are the hero
Every screen exists to make three numbers instantly understandable: **cash flow, tax estimate, runway**. Decoration never competes with figures.

### 2.2 Trust through visible privacy
The promise is "your data never leaves this device". Show it: a persistent on-device badge, a model status indicator, and zero signup friction. Never claim privacy the app does not deliver.

### 2.3 Ledger, not "AI SaaS"
Avoid:
- Purple/blue AI gradients.
- Glassmorphism.
- Neon and dark finance-terminal styling.
- Trading-style candlestick charts.
- Gradient donut/pie charts.
- Robot heads, sparkle icons, brain icons.
- Stock imagery of handshakes or coins.

### 2.4 Agents are visible, not mascots
The agent team is the "wow" of the demo, so show each agent working in order. Represent them with simple geometric glyphs and plain role names — no cartoon characters.

### 2.5 Estimates never pretend to be certainty
Every tax figure and forecast carries an "ESTIMATE" stamp and a range where possible. The app explains; it does not advise.

### 2.6 Local without cliché overload
Use Marathi/Hinglish as accents: eyebrow lines, a few button labels, empty-state copy. Do not translate the whole interface or cover it in cultural motifs.

---

# 3. Visual System

## 3.1 Colour tokens

```css
--paper: #FBF6E9;
--paper-deep: #F3EAD3;
--rule: #E2D6B8;

--ink: #1A1A1A;
--white: #FFFFFF;
--muted-ink: #6B645A;

--turmeric: #E8A317;
--ledger-red: #A8231B;
--tulsi-green: #2E7D4F;
--pen-blue: #23408E;

--night-slip: #1C1B18;
--night-ink: #F4EEDD;
```

### Colour usage

**Paper**
- Main page background (with ruled-line pattern).
- Card surfaces use `--white` on top of paper for contrast.

**Turmeric**
- Primary CTA ("Analyze").
- Active states, selected segments, slider thumbs.
- "WATCH" health band.

**Pen blue**
- Inflow (sales) in charts.
- Key figures, links, focus accents.

**Ledger red**
- Outflow (expenses) in charts — always with hatch pattern.
- Margin line, danger band, errors.

**Tulsi green**
- "HEALTHY" band, positive deltas, success.

**Near-black**
- Typography, borders, shadows, icons.

**Night slip**
- Only for rare dark panels (raw JSON/debug view, tool-call trace).

Never use colour alone to communicate meaning — pair every band with text and a symbol (✓ ! ✕).

---

# 4. Typography

### Display
`Fraunces` (soft serif) — editorial, ledger-title feel. Fallback: `Georgia`, serif.

### UI
`Inter`

### Numbers and tables
`JetBrains Mono` with `font-variant-numeric: tabular-nums`. All currency figures use this so columns align like a ledger.

### Marathi/Hindi microcopy
`Noto Sans Devanagari`

### Labels

Use monospace uppercase labels with generous tracking:

```text
KHATA // DATA
DASHBOARD // HISAB
AGENT // ROOM
ASK // MUNIM
KYA-AGAR // WHAT IF
RUNWAY
TAX // ESTIMATE
```

```css
font-size: 11px;
font-weight: 700;
letter-spacing: 0.12em;
text-transform: uppercase;
```

### Number formatting
Always Indian grouping with the rupee sign: `₹1,23,456`. Days are shown as `41 days`. Percentages to one decimal.

---

# 5. Shape Language

## Cards (paper slips)

```css
background: #FFFFFF;
border: 1.5px solid #1A1A1A;
border-radius: 10px;
box-shadow: 3px 3px 0 #1A1A1A;
```

Use 8–12px radius consistently. No soft shadows.

## Buttons

```css
border: 2px solid #1A1A1A;
border-radius: 10px;
box-shadow: 3px 3px 0 #1A1A1A;
```

Pressed:

```css
transform: translate(2px, 2px);
box-shadow: 1px 1px 0 #1A1A1A;
```

Primary = turmeric fill, ink text. Secondary = white fill. Tertiary = dashed border, no shadow.

## Inputs

```css
border: 1.5px solid #1A1A1A;
border-radius: 8px;
background: #FFFFFF;
```

Focused:

```css
outline: 3px solid #23408E;
outline-offset: 2px;
```

## Ruled-paper background

```css
background-color: #FBF6E9;
background-image: repeating-linear-gradient(
  to bottom, transparent 0, transparent 31px, #E2D6B8 31px, #E2D6B8 32px
);
```

Add a red margin line (double 1px `#A8231B`, 6px apart) on the left edge of the main sheet on desktop only.

---

# 6. Global Layout

Desktop target:

```text
┌──────────────────────────────────────────────────────────────────┐
│ HEADER  [MUNIM]   ● ON-DEVICE · Qwen2.5 1.5B           [PRIVACY]│
├──────────────────────────────────────────────────────────────────┤
│   EYEBROW · तुमचा हिशोब, तुमच्याच फोनवर                          │
│   Munim                                                          │
│   one supporting line                                            │
│                                                                  │
│ ┌────────────┬─────────────────────────────┬───────────────────┐ │
│ │ KHATA      │ DASHBOARD // HISAB          │ AGENT // ROOM     │ │
│ │ upload     │ score stamp · KPIs          │ 4 agents + CFO    │ │
│ │ map cols   │ cash flow chart             │ memo slip         │ │
│ │ setup      │ runway · tax estimate       │ ASK // MUNIM      │ │
│ │            │ KYA-AGAR what-if            │                   │ │
│ └────────────┴─────────────────────────────┴───────────────────┘ │
│                                                                  │
│                    TALLY STRIP                                   │
│                    FOOTER                                        │
└──────────────────────────────────────────────────────────────────┘
```

Maximum content width:

```text
1280–1360px
```

Page horizontal padding:

```text
Desktop: 32–48px
Tablet: 24px
Mobile: 16px
```

---

# 7. Header

Simple ledger "spine" bar — not a floating pill, so it feels distinct from other event projects.

```text
┌──────────────────────────────────────────────────────────────┐
│ ▮ MUNIM v1        ● ON-DEVICE · Qwen2.5 1.5B · cached   [i] │
└──────────────────────────────────────────────────────────────┘
```

Properties:
- Ledger-red background, paper-coloured text (the "cover").
- 2px ink bottom border.
- Height 56–64px.
- Left: wordmark in Fraunces + small bordered version tag.
- Right: model status chip (see §11) and an info icon opening the privacy explainer.

Mobile: wordmark left, status dot only (tap to expand).

---

# 8. Hero

Keep this intentionally short. The tool must appear in the first viewport.

Eyebrow:

```text
तुमचा हिशोब, तुमच्याच फोनवर
```

Main heading:

```text
Munim
```

Supporting copy:

```text
Drop your sales CSV. Get your cash flow,
tax estimate and runway — without your data
ever leaving this device.
```

Optional small line:

```text
Local AI. No signup. No cloud.
```

---

# 9. Main Workspace

Three zones inside one outer card with the paper-slip border and hard shadow.

```text
┌─────────────┬──────────────────────────────┬─────────────────┐
│ KHATA//DATA │ DASHBOARD // HISAB           │ AGENT // ROOM   │
│             │                              │                 │
│ [ drop CSV ]│  ┌────────┐ SALES   ₹4,82,300│ ◆ Cleaner  ✓    │
│ Try sample  │  │  72    │ EXPENSES ₹3,91,100│ ◆ Analyst  ✓    │
│             │  │HEALTHY │ NET      ₹91,200 │ ◆ Tax      …    │
│ Opening ₹   │  └────────┘ CASH NOW ₹1,41,200│ ◆ Risk     ·    │
│ Business ▾  │  cash flow chart             │ ◆ CFO      ·    │
│ Language ▾  │  RUNWAY 41 days │ TAX EST    │ ─────────────── │
│ [ANALYZE →] │  KYA-AGAR sliders            │ ASK // MUNIM    │
└─────────────┴──────────────────────────────┴─────────────────┘
```

Zone widths on desktop: roughly 26% / 46% / 28%.

---

# 10. Khata Panel (Input)

### Upload card
- Large dashed-border drop zone, 160px tall, with outlined upload icon.
- Copy: "Drop your sales CSV here" / small: "Date, amount, and (optionally) type, category, payment mode."
- Secondary button: "TRY SAMPLE →" with a small dropdown for three samples: Kirana store, Tiffin service, Messy CSV.
- Privacy line beneath, with lock icon: "Read in your browser. Never uploaded."

### Column mapper
Appears after a file is loaded. Compact table: detected column → role dropdown (Date, Amount, Type, Category, Payment mode, Ignore). Show first 5 rows as a preview in tabular mono. Confidence dot per auto-detected column (text label "auto" / "check").

### Business setup
- Opening cash balance (₹ input, Indian grouping as you type).
- Business type select (Kirana / Cafe & tiffin / Salon & services / Other) — drives the tax profile.
- Narrator language segmented control: `[ English ] [ Hinglish ]`.

### Primary CTA

```text
Analyze / हिशोब लाव →
```

Must be the largest action, turmeric, full width of the panel.

---

# 11. Model Status and Privacy Chip

A small chip in the header and a larger card in the Khata panel.

States:

```text
NOT LOADED   ○ Template narrator (instant)        [ LOAD ON-DEVICE AI · ~900 MB ]
DOWNLOADING  ◐ Loading Qwen2.5 1.5B… 43%          (progress bar, hatch fill)
READY        ● ON-DEVICE · Qwen2.5 1.5B · cached
FALLBACK     ▲ AI unavailable — using template narrator
```

Rules:
- Never start a large download without a click.
- Always explain: "One-time download. Your sales data is never sent anywhere."
- FALLBACK must look calm, not like an error — the app still works.

---

# 12. Dashboard (Hisab)

## 12.1 Health score stamp

A rubber-stamp badge, top-left of the dashboard:

```text
┌─────────────────┐
│       72        │
│  HEALTH SCORE   │
│   ✓ HEALTHY     │
└─────────────────┘
```

- Slight rotation (-3° to -5°).
- 3px ink border, hard shadow.
- Fill by band: tulsi (≥70), turmeric (40–69), ledger-red (<40).
- Band always spelled out in text with a symbol.
- Click opens a breakdown popover: the five weighted factors with bars.

## 12.2 KPI row

Four ledger-style cells, label above, figure below in mono:

```text
SALES    EXPENSES    NET    CASH IN HAND
```

Delta chip vs previous period (▲ green / ▼ red) with text, e.g. "▲ 6.2% vs prev. 30 days".

## 12.3 Cash flow chart

- Daily inflow as pen-blue bars, outflow as ledger-red **hatched** bars.
- Net cash balance as an ink line.
- Forecast portion as a dashed line with a light shaded range band.
- Best day and worst day directly labelled with small flags.
- Direct labels, no legend hunting; a one-line legend only below the chart.
- Toggle: `[ Daily ] [ Weekly ]`.
- Horizontal gridlines use `--rule`.

## 12.4 Runway card

```text
RUNWAY
41 days        ← big Fraunces number
if sales stopped today
Trend forecast: 29–38 days at current pace
```

Never show a single bare number: always show the assumption in plain words.

## 12.5 Tax estimate card

```text
TAX // ESTIMATE            [ ESTIMATE ]
GST payable (est.)         ₹18,400
Income tax (est.)          ₹7,200
Rules used: GST composition 1% · presumptive 6% digital
Estimate only — not tax advice. Check with your CA.
```

- "ESTIMATE" is a small rotated stamp.
- The disclaimer line is always visible, never in a tooltip.

## 12.6 Insight list

Three to five short rows (from Analyst and Risk agents). Each row: severity pill (text + colour), one plain sentence, and a "Why?" link that expands the facts used.

---

# 13. Agent Room

The demo centrepiece. A vertical timeline of agent rows.

```text
┌────────────────────────────────────────────┐
│ AGENT // ROOM                              │
├────────────────────────────────────────────┤
│ ◆ CLEANER   Read 118 rows, fixed 6 dates   ✓│
│ ◆ ANALYST   Tuesdays 31% below average     ✓│
│ ◆ TAX       Estimated GST and income tax   …│
│ ◆ RISK      waiting                        ·│
│ ◆ CFO       waiting                        ·│
├────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐  │
│  │ CFO MEMO                              │  │
│  │ "Bhau, cash 41 din chalega…"          │  │
│  │ 1. …  2. …  3. …                      │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

Row anatomy:
- Geometric glyph in a coloured circle (each agent has one fixed colour: Cleaner = ink, Analyst = pen-blue, Tax = turmeric, Risk = ledger-red, CFO = tulsi).
- Name in mono uppercase, one-line output in Inter.
- Status: waiting (hollow), working (pulsing dot), done (✓), fallback (▲).
- A "calculated by code" tag on facts, "narrated by AI" tag on sentences — this builds trust.

CFO memo: paper-slip card, slight -1° tilt, folded-corner detail via CSS, numbered actions.

---

# 14. Ask Munim

```text
ASK // MUNIM
[ Why were Tuesdays slow?                    ] [🎤] [→]
chips: [Best day?] [Can I afford ₹40,000 fridge?] [Where does money go?]
```

Answer card:
- Narrated answer (2–3 sentences).
- **"CALCULATED BY"** chip showing the tool used, e.g. `weekdayPerformance(Tue)`.
- A small tabular-mono table of the exact numbers used.
- Mic button appears only when speech recognition is supported.

---

# 15. Kya-Agar (What-If) Panel

```text
KYA-AGAR // WHAT IF
Price change        [──●────] +5%
Monthly expenses    [───●───] −0%
One-time purchase   ₹ [40,000]
                         BASELINE   SCENARIO
Runway                   41 days    36 days  ▼ 5
30-day net               ₹91,200    ₹84,900  ▼ 6,300
```

- Sliders with turmeric thumbs, 44px touch targets.
- Results update live; deltas show ▲/▼ plus text, tulsi/red.
- A one-line assumption note under the sliders: "Assumes 5% of customers leave per 10% price rise."
- "Reset" tertiary button.

---

# 16. Empty, Analyzing, Error States

## Empty state (dashboard, before upload)

```text
        ┌─────────────┐
        │  ▁▃▅  ₹     │   line-drawn dukaan awning
        └─────────────┘

Khata abhi khali hai.

Drop a sales CSV, or try a sample
to see Munim at work.

[ TRY KIRANA SAMPLE → ]
```

Keep the illustration CSS/SVG. No robot imagery.

## Analyzing state

Agent Room becomes the focus. The dashboard shows skeleton ledger rows (ruled lines with shimmering blocks — respect reduced motion).

Rotating microcopy under the agent list:

```text
Hisab lagaya ja raha hai…
Chai thandi hone se pehle report ready…
Har rupaya gin liya, bhau…
```

## Error states

Generic:

```text
KHATA // INTERRUPTED

Hmm, yeh file samajh nahi aayi.
We could not read dates or amounts from this CSV.

[ OPEN COLUMN MAPPER → ]
```

Model load failed:

```text
AI // OFFLINE

On-device AI could not load, so Munim is using
its built-in template narrator. All numbers are
still calculated normally.

[ RETRY AI LOAD ]  [ CONTINUE ]
```

Not enough data (< 14 days):

```text
KHATA // THODA KAM HAI

We need at least 14 days of sales to estimate a runway.
Showing totals only.
```

---

# 17. Responsive Design

## Desktop ≥ 1100px
Three zones as in §9. Controls in the Khata panel stack vertically.

## Tablet 768–1099px
Two columns: Khata + Dashboard on top row (40/60), Agent Room + Ask below as a full-width row.

## Mobile ≤ 767px
Single column with a **sticky bottom tab bar**:

```text
[ Khata ] [ Hisab ] [ Agents ] [ Ask ]
```

- Analyze CTA full width and sticky above the tab bar when data is loaded.
- What-if opens as a bottom sheet.
- Charts scroll horizontally inside their card, never the page.
- Minimum touch target 44px.

---

# 18. Decorative System

Decorations support the ledger identity without interfering with figures.

## Tally strip
Place above the footer: groups of four vertical strokes with a diagonal fifth, in ink, low contrast. CSS/SVG only.

## Ledger rules and margin
The ruled background and red margin line are the main decoration. Keep them very subtle behind cards.

## Stamps
Only three stamp uses: health score, ESTIMATE marks, and "CALCULATED BY CODE" tag. Do not stamp everything.

## Optional illustration
One small line-drawn shopfront/awning in the empty state. The UI must work without it.

---

# 19. Iconography

Use simple outlined icons.

Preferred:
- Upload.
- File/table.
- Lock (privacy).
- Mic.
- Chevron.
- Plus / X.
- Info.
- Arrow → CTA.

Avoid:
- Robot heads, sparkles, brains.
- Coin stacks and piggy banks.
- 3D icons.
- Emoji as UI icons (a single 🔥-style emoji in microcopy is fine; none in controls).

---

# 20. Component Inventory

Required components:

```text
Header
Hero
Workspace
KhataPanel
UploadCard
SampleMenu
ColumnMapper
BusinessSetup
ModelStatusChip
ModelLoadCard
DashboardPanel
HealthScoreStamp
ScoreBreakdownPopover
KpiRow
CashFlowChart
RunwayCard
TaxEstimateCard
InsightList
AgentRoom
AgentRow
CfoMemo
AskPanel
AnswerCard
WhatIfPanel
EmptyState
AnalyzingState
ErrorState
SectionHeader
Disclaimer
TallyStrip
Footer
Toast
MobileTabBar
```

---

# 21. Component States

Every interactive component needs:

```text
default
hover
focus
active
disabled
loading
error
success
```

Focus must always be visible. Do not rely on colour alone.

---

# 22. Data-Visualisation Rules

- Currency always `₹` with Indian grouping.
- Tabular numerals everywhere.
- Inflow = solid pen-blue; outflow = hatched ledger-red. The hatch makes the chart readable in greyscale and for colour-blind users.
- Label the axis units (₹, days).
- Forecast is always dashed with a range band, never a solid line.
- No pie or donut charts. Use ranked horizontal bars for category breakdowns.
- Annotate rather than decorate: label best day, worst day, festival spikes.
- Charts must have a text summary for screen readers (e.g. "Sales peaked on 14 Sept at ₹21,400").

---

# 23. Accessibility

Minimum requirements:

- WCAG AA contrast target (verify turmeric/ink and tulsi/paper pairs).
- Keyboard navigation for upload, mapper, sliders, tabs.
- Visible focus states.
- Screen-reader labels for icon-only buttons.
- Health band and severity communicated with text + symbol + colour.
- Reduced-motion support (stop pulsing and skeleton shimmer).
- Works at 200% browser zoom.
- Touch targets around 44px.
- Avoid flashing animations.
- Live region announces agent status changes ("Tax agent finished").

---

# 24. Trust and Brand Rules

### Must do
- Show "ESTIMATE — not tax advice" beside every tax figure.
- Keep privacy claims true: no analytics, no third-party requests carrying user data.
- State clearly that the model file downloads once; data stays local.
- Use fictional sample businesses only.
- Keep the footer attribution: "Built at Hacktoberfest Hack Day Nashik × Hustler Hive (MLH)".

### Do not do
- Claim the app files GST returns or replaces a CA.
- Show a precise-looking figure without its assumption.
- Imitate any bank, UPI app, or accounting-software branding.
- Use official logos of Hacktoberfest/MLH unless supplied and unaltered.

---

# 25. Content Tone

The interface voice should be:

**Plain + warm + lightly desi + financially careful.**

Good:

```text
Cash 41 din chalega, bhau.
Tuesdays are 31% below your average.
This is an estimate. Please confirm with your CA.
```

Bad:

```text
YOU ARE ABOUT TO GO BANKRUPT!!!
Our proprietary AI maximizes your financial synergy.
You should definitely invest in...
```

Rule: explain the business, never shame the owner, never give investment advice.

---

# 26. Stitch Screen Prompts

## Screen 01 — Home (empty)

```text
Design Munim, a private on-device AI CFO web app for small shop owners in India, in a "modern bahi-khata ledger" visual language.

Cream ruled-paper background with faint horizontal lines and a red margin line, thick near-black 1.5–2px outlines, hard 3px offset black shadows, turmeric-yellow primary buttons, pen-blue and ledger-red accents, 8–12px radii, Fraunces serif headings, Inter UI text, JetBrains Mono for rupee figures.

Header: ledger-red bar with MUNIM wordmark and a green "ON-DEVICE" status chip.

Hero: eyebrow "तुमचा हिशोब, तुमच्याच फोनवर", heading "Munim", one supporting line.

Below, one large three-zone workspace card:
Left "KHATA // DATA": dashed drop zone "Drop your sales CSV here", "Try sample" button, opening balance input, business type dropdown, Hinglish/English toggle, large turmeric "Analyze / हिशोब लाव →" button.
Centre "DASHBOARD // HISAB": friendly empty state with a line-drawn shop awning and "Khata abhi khali hai."
Right "AGENT // ROOM": five idle agents listed (Cleaner, Analyst, Tax, Risk, CFO).

Avoid purple gradients, glassmorphism, robot icons, and generic SaaS dashboards.
```

## Screen 02 — Dashboard result

```text
Use the same Munim bahi-khata design system.

Centre zone shows a rotated rubber-stamp Health Score badge "72 · ✓ HEALTHY", a KPI row (Sales, Expenses, Net, Cash in hand) in monospaced rupee figures with Indian grouping, a cash-flow chart with solid blue inflow bars, red hatched outflow bars, a dashed forecast line with a shaded range, and flags on best and worst days.

Below: a Runway card "41 days — if sales stopped today" with a trend range line, and a Tax Estimate card with a small rotated "ESTIMATE" stamp and the line "Estimate only — not tax advice."

Keep numbers as the hero. No pie charts.
```

## Screen 03 — Agent Room (analyzing)

```text
Use the Munim design system.

Right panel "AGENT // ROOM" shows five agent rows in a vertical timeline: Cleaner (done ✓), Analyst (done ✓), Tax (working, pulsing dot), Risk (waiting), CFO (waiting). Each row has a coloured geometric glyph, mono uppercase name, one-line output, and a small tag "calculated by code" or "narrated by AI".

At the bottom, a tilted paper-slip "CFO MEMO" card with three numbered actions.

Rotating Hinglish microcopy: "Hisab lagaya ja raha hai…". Minimal motion.
```

## Screen 04 — Kya-Agar (What-if)

```text
Use the Munim design system.

Panel "KYA-AGAR // WHAT IF" with turmeric slider thumbs: Price change +5%, Monthly expenses 0%, One-time purchase ₹40,000. Below, a two-column comparison table BASELINE vs SCENARIO with runway days and 30-day net, deltas marked ▲/▼ with text, tulsi green for good and ledger red for bad. An assumption note under the sliders.
```

## Screen 05 — Mobile

```text
Munim mobile 390×844, same design system. Single column with a sticky bottom tab bar: Khata, Hisab, Agents, Ask. Show the Hisab tab: stamp badge, 2×2 KPI grid, horizontally scrollable cash-flow chart, runway card. Full-width turmeric Analyze button above the tab bar. 44px touch targets.
```

## Screen 06 — Model and error states

```text
Munim design system. Show three small states in separate cards:
1. Model download: "Loading Qwen2.5 1.5B… 43%" with hatched progress bar and "One-time download. Your sales data is never sent anywhere."
2. AI offline: calm banner "Using built-in template narrator. All numbers are still calculated normally." with Retry and Continue.
3. CSV error: "KHATA // INTERRUPTED — Hmm, yeh file samajh nahi aayi." with "Open column mapper →".
Funny but never alarming.
```

---

# 27. Design Tokens for Implementation

```ts
export const designTokens = {
  colors: {
    paper: "#FBF6E9",
    paperDeep: "#F3EAD3",
    rule: "#E2D6B8",
    ink: "#1A1A1A",
    white: "#FFFFFF",
    mutedInk: "#6B645A",
    turmeric: "#E8A317",
    ledgerRed: "#A8231B",
    tulsiGreen: "#2E7D4F",
    penBlue: "#23408E",
    nightSlip: "#1C1B18",
    nightInk: "#F4EEDD",
  },

  radius: {
    card: "10px",
    input: "8px",
  },

  border: {
    standard: "1.5px solid #1A1A1A",
    heavy: "3px solid #1A1A1A",
  },

  shadow: {
    standard: "3px 3px 0 #1A1A1A",
    pressed: "1px 1px 0 #1A1A1A",
  },

  spacing: {
    page: "clamp(16px, 4vw, 48px)",
    section: "clamp(40px, 6vw, 80px)",
  },

  bands: {
    healthy: { min: 70, label: "HEALTHY", symbol: "✓" },
    watch: { min: 40, label: "WATCH", symbol: "!" },
    danger: { min: 0, label: "DANGER", symbol: "✕" },
  },
};
```

---

# 28. Final Visual Test

Before shipping, check the app at:

### 360 × 800
- No horizontal page overflow.
- Tab bar and Analyze CTA both usable.
- Rupee figures readable, not truncated.

### 390 × 844
- Hero does not dominate.
- Chart scrolls inside its card.
- What-if bottom sheet works.

### 768 × 1024
- Two-column layout not cramped.
- Agent Room readable.

### 1280 × 800
- Three zones visible without excessive empty space.
- Health stamp, KPIs and chart all above the fold after analysis.

### 1440 × 900
- Hierarchy still intentional.
- Decorations remain secondary to the numbers.

---

# 29. Acceptance Checklist

- [ ] Cream ruled-paper background with red margin line (desktop).
- [ ] Near-black outlines and hard offset shadows, no blur.
- [ ] Turmeric primary CTA.
- [ ] Ledger-red header "cover".
- [ ] Rupee figures in tabular mono with Indian grouping.
- [ ] Health score as a rubber stamp with text band + symbol.
- [ ] Inflow solid blue, outflow hatched red.
- [ ] Forecast dashed with range band.
- [ ] Runway always shows its assumption.
- [ ] Tax card has ESTIMATE stamp and visible disclaimer.
- [ ] Agent Room shows five agents with status and code/AI tags.
- [ ] CFO memo slip.
- [ ] Ask answers show "Calculated by" chip and number table.
- [ ] What-if sliders update live with ▲/▼ text deltas.
- [ ] Model status states designed (not loaded, downloading, ready, fallback).
- [ ] Empty, analyzing, and error states designed.
- [ ] Mobile tab bar layout.
- [ ] Keyboard focus visible.
- [ ] Reduced-motion support.
- [ ] No purple gradients, glassmorphism, robot icons, or pie charts.
- [ ] Footer attribution present.

---

## 30. One-Line Design North Star

> **A shopkeeper's red bahi-khata that learned to think — cream ruled paper, blue-ink figures, rubber-stamped verdicts, and a quiet team of on-device agents doing the hisab without your data ever leaving the shop.**
