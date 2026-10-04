import fs from "fs";
import path from "path";

// Ensure test-data directory exists
const targetDir = path.join(process.cwd(), "test-data");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

interface TxnRow {
  date: string;
  particulars: string;
  category: string;
  paymentMode: string;
  type: string;
  amount: number;
}

const CATEGORIES = [
  { name: "Packaged Groceries", min: 350, max: 2200 },
  { name: "Dairy & Milk", min: 120, max: 850 },
  { name: "Snacks & Cold Drinks", min: 80, max: 650 },
  { name: "Grains & Pulses (Atta/Rice/Dal)", min: 600, max: 3800 },
  { name: "Cooking Oil & Ghee", min: 450, max: 2800 },
  { name: "Personal & Home Care", min: 150, max: 1400 },
  { name: "Spices & Condiments", min: 100, max: 950 },
];

const PAYMENT_MODES = ["UPI", "Cash", "UPI", "Cash", "Card", "UPI", "UPI"];

function generateTransactions(startDateStr: string, totalDays: number): TxnRow[] {
  const result: TxnRow[] = [];
  const start = new Date(startDateStr);

  for (let d = 0; d < totalDays; d++) {
    const cur = new Date(start);
    cur.setDate(start.getDate() + d);
    const dateStr = cur.toISOString().split("T")[0];
    const dow = cur.getDay(); // 0 Sun, 2 Tue, 6 Sat
    const dom = cur.getDate();

    // 1. Daily Sales Transactions (6 to 10 sales per day for realistic volume)
    const salesPerDay = 6 + (d % 5);
    for (let s = 0; s < salesPerDay; s++) {
      const catObj = CATEGORIES[(d * 3 + s) % CATEGORIES.length];
      const mode = PAYMENT_MODES[(d * 2 + s) % PAYMENT_MODES.length];

      let amt = catObj.min + ((d * 97 + s * 53) % (catObj.max - catObj.min));

      // Weekend surge (Sat/Sun +30%)
      if (dow === 0 || dow === 6) {
        amt = Math.round(amt * 1.3);
      }
      // Tuesday kirana dip (-25%)
      if (dow === 2) {
        amt = Math.round(amt * 0.75);
      }

      result.push({
        date: dateStr,
        particulars: `${catObj.name} Retail Sale #${s + 1}`,
        category: catObj.name,
        paymentMode: mode,
        type: "Sale",
        amount: amt,
      });
    }

    // 2. Monthly Recurring Expenses
    if (dom === 1) {
      result.push({
        date: dateStr,
        particulars: "Shop Commercial Rent Payment",
        category: "Rent",
        paymentMode: "Bank Transfer",
        type: "Expense",
        amount: 18000,
      });
    }
    if (dom === 5) {
      result.push({
        date: dateStr,
        particulars: "Counter Staff Salary (Ramesh)",
        category: "Staff Salaries",
        paymentMode: "Cash",
        type: "Expense",
        amount: 12000,
      });
      result.push({
        date: dateStr,
        particulars: "Delivery Assistant Salary (Suresh)",
        category: "Staff Salaries",
        paymentMode: "UPI",
        type: "Expense",
        amount: 9500,
      });
    }
    if (dom === 10) {
      result.push({
        date: dateStr,
        particulars: "Commercial Electricity Bill (MSEDCL)",
        category: "Utilities",
        paymentMode: "UPI",
        type: "Expense",
        amount: 3850 + ((d * 13) % 600),
      });
    }
    if (dom === 15) {
      result.push({
        date: dateStr,
        particulars: "Broadband Internet & Landline",
        category: "Utilities",
        paymentMode: "UPI",
        type: "Expense",
        amount: 1180,
      });
    }

    // 3. Weekly Supplier Restocking (Thursdays dow === 4)
    if (dow === 4) {
      const restockAmt = 16000 + ((d * 47) % 8000);
      result.push({
        date: dateStr,
        particulars: "Wholesale FMCG & Grain Restocking",
        category: "Supplier Inventory",
        paymentMode: "UPI",
        type: "Expense",
        amount: restockAmt,
      });
    }

    // 4. Bi-weekly Dairy Supplier Settlement
    if (dom === 14 || dom === 28) {
      const dairyAmt = 6500 + ((d * 19) % 2000);
      result.push({
        date: dateStr,
        particulars: "Amul & Gokul Dairy Supplier Settlement",
        category: "Dairy Restock",
        paymentMode: "UPI",
        type: "Expense",
        amount: dairyAmt,
      });
    }
  }

  return result;
}

function writeCsv(filename: string, txns: TxnRow[]) {
  const header = "Date,Particulars,Category,Payment_Mode,Type,Amount";
  const rows = txns.map(
    (t) => `${t.date},"${t.particulars}",${t.category},${t.paymentMode},${t.type},${t.amount}`
  );
  const content = [header, ...rows].join("\n");
  fs.writeFileSync(filename, content, "utf-8");
  console.log(`Created ${path.basename(filename)}: ${txns.length} records (${(content.length / 1024).toFixed(1)} KB)`);
}

// 1. Large 6-Month Full Dataset: data.csv (Jan 1, 2024 to Jun 30, 2024, ~1,500+ rows)
const full6Months = generateTransactions("2024-01-01", 182);
writeCsv(path.join(targetDir, "data.csv"), full6Months);

// Also copy data.csv to the project root and public folder for immediate drag or 1-click access
fs.copyFileSync(path.join(targetDir, "data.csv"), path.join(process.cwd(), "data.csv"));
fs.copyFileSync(path.join(targetDir, "data.csv"), path.join(process.cwd(), "public", "samples", "data.csv"));

// 2. 1-Month Dataset: monthly-jan-2024.csv (~260 rows)
const janMonth = generateTransactions("2024-01-01", 31);
writeCsv(path.join(targetDir, "monthly-jan-2024.csv"), janMonth);

// 3. 1-Month Dataset: monthly-feb-2024.csv (~240 rows)
const febMonth = generateTransactions("2024-02-01", 29);
writeCsv(path.join(targetDir, "monthly-feb-2024.csv"), febMonth);

// 4. Quarterly Dataset: quarterly-q1-2024.csv (~750 rows)
const q1 = generateTransactions("2024-01-01", 91);
writeCsv(path.join(targetDir, "quarterly-q1-2024.csv"), q1);

console.log("All sample CSV files generated successfully in test-data/!");
