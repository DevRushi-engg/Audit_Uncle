# Audit Uncle 🧾

> **॥ तुमचा हिशोब, तुमच्याच फोनवर ॥**  
> *Your books. Your phone. Your CFO.*

**Audit Uncle** is a private, local-first AI CFO and financial intelligence engine tailored for Indian retail and small business owners. Drop any sales and expense CSV, and instantly receive cash flow analysis, survival runway projections, tax estimations (GST & Section 44AD Presumptive), health score diagnostics, and actionable CFO memos — all computed deterministically on-device with zero cloud leaks.

Built at **Hacktoberfest Hack Day Nashik × Hustler Hive (MLH)**.

---

## ✨ Key Features

- **🔒 Zero-Cloud Privacy Sandbox**: Your sales data is processed 100% inside your browser session. Zero financial rows ever leave your machine.
- **⚡ Deterministic Mathematical Engine**: Financial metrics, runway projections, and health scores are calculated strictly via TypeScript math guards to prevent hallucination.
- **🏷️ Researched Retail Tax Profiles**:
  - **Kirana / General Store**: Composition 1% levy or regular 5% GST.
  - **V-Mart Model**: Apparel & value fashion (5% for ≤ ₹1,000, 12% for > ₹1,000 · ~7% blended with 75% ITC).
  - **DMart Model**: Hypermarket & FMCG staples (0% fresh, 5% packaged, 18% home care · ~5% blended with 80% ITC).
  - **Smart Bazaar Model**: Multi-category supermarket (0-5% grocery, 12% apparel, 18% appliances · ~8% blended with 75% ITC).
  - **Cafe / Tiffin Service**: 5% restaurant GST (no ITC).
  - **Salon / Services**: 18% services GST with eligible ITC.
  - **Income Tax**: Section 44AD Presumptive taxation (6% digital turnover, 8% cash turnover) with new regime slabs.
- **🧠 Multi-Agent Financial Council**:
  - **Cleaner Agent**: Cleans and validates messy transaction logs.
  - **Analyst Agent**: Identifies top sales trends, expense categories, and margins.
  - **Tax Agent**: Computes GST and Sec 44AD liability.
  - **Risk Agent**: Evaluates cash drain speed and runway.
  - **CFO Agent**: Delivers actionable strategic recommendations in clear English or Hinglish.
- **🔮 What-If Scenario Simulator**: Test price hikes, cost cuts, and one-time capital expenditures in real-time.
- **💬 Natural Language Ask Uncle**: Ask questions like *"Can I afford a ₹40,000 fridge?"* or *"Which weekday has the highest sales?"*.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher, v20+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/DevRushi-engg/Audit_Uncle.git
   cd Audit_Uncle
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your [OpenRouter API key](https://openrouter.ai/) for AI narrations.

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the deterministic math verification suite:
```bash
npm run check:math
```

Build for production:
```bash
npm run build
```

---

## 📜 License
MIT License. Built with ❤️ for Indian small business owners.
