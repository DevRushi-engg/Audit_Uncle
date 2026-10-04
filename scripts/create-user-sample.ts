import fs from "fs";
import path from "path";

const lines: string[] = ["Date,Particulars,Category,Payment_Mode,Type,Amount"];
const startDate = new Date("2024-01-01");

const categories = ["Groceries", "Dairy & Milk", "Snacks & Drinks", "Household Staples", "Personal Care"];
const modes = ["UPI", "Cash", "UPI", "Cash", "Card", "UPI"];

for (let d = 0; d < 120; d++) {
  const current = new Date(startDate);
  current.setDate(startDate.getDate() + d);
  const dateStr = current.toISOString().split("T")[0];
  const dayOfWeek = current.getDay();

  // Daily sales transactions
  const salesCount = 3 + (d % 3);
  for (let s = 0; s < salesCount; s++) {
    const cat = categories[(d + s) % categories.length];
    const mode = modes[(d * 2 + s) % modes.length];
    let baseAmt = 850 + ((d * 41 + s * 23) % 2500);
    if (dayOfWeek === 2) baseAmt = Math.round(baseAmt * 0.65); // Slow Tuesday
    if (dayOfWeek === 0 || dayOfWeek === 6) baseAmt = Math.round(baseAmt * 1.35); // Busy Weekend

    lines.push(`${dateStr},${cat} Retail Sales,${cat},${mode},Sale,${baseAmt}`);
  }

  // Monthly operating expenses
  const dom = current.getDate();
  if (dom === 1) {
    lines.push(`${dateStr},Shop Commercial Rent,Rent,Bank Transfer,Expense,16000`);
  }
  if (dom === 5) {
    lines.push(`${dateStr},Shop Assistant Salary,Salaries,Cash,Expense,11000`);
  }
  if (dom === 10) {
    lines.push(`${dateStr},Electricity Bill Commercial MSEB,Utilities,UPI,Expense,3400`);
  }
  if (dayOfWeek === 4) {
    const stockAmt = 15000 + ((d * 17) % 7000);
    lines.push(`${dateStr},Wholesale FMCG Restocking,Stock Purchase,UPI,Expense,${stockAmt}`);
  }
}

const content = lines.join("\n");
fs.writeFileSync(path.join(process.cwd(), "real-business-sample.csv"), content, "utf-8");
fs.writeFileSync(path.join(process.cwd(), "public", "samples", "real-business-sample.csv"), content, "utf-8");
console.log(`Generated real-business-sample.csv with ${lines.length} lines.`);
