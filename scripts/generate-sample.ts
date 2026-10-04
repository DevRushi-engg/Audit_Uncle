import fs from "fs";
import path from "path";

// Simple mulberry32 PRNG for deterministic pseudo-random generation
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const samplesDir = path.join(process.cwd(), "public", "samples");
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

// 1. Kirana Store Sample (~120 days, ends ~Oct 2024)
// Slow Tuesdays, 2 festival spikes, restocking expenses, ends with ~18-30 days runway
function generateKiranaSample() {
  const prng = mulberry32(42);
  const rows: string[] = ["date,amount,type,category,payment_mode"];

  const startDate = new Date("2024-06-01T00:00:00Z");
  const totalDays = 120;

  const categoriesSales = ["Grains & Atta", "Dairy & Milk", "Packaged Snacks", "Edible Oils", "Soaps & Detergents", "Spices & Masalas"];
  const categoriesExpenses = ["Wholesale Supplier", "Store Rent", "Electricity & Utility", "Packaging Material", "Helper Wages", "Transport & Delivery"];

  for (let day = 0; day < totalDays; day++) {
    const curDate = new Date(startDate);
    curDate.setUTCDate(curDate.getUTCDate() + day);
    const dateStr = curDate.toISOString().split("T")[0];
    const dow = curDate.getUTCDay(); // 0=Sun, 2=Tue

    // Festival spikes around day 65-72 and day 105-110
    const isFestival = (day >= 65 && day <= 72) || (day >= 105 && day <= 110);
    const festivalMultiplier = isFestival ? 2.4 : 1.0;

    // Weekday effect: Tuesdays are slow (~35% drop), Saturdays & Sundays are busier
    let weekdayMultiplier = 1.0;
    if (dow === 2) weekdayMultiplier = 0.65; // Tuesday dip
    else if (dow === 6 || dow === 0) weekdayMultiplier = 1.35; // Weekend boost

    // Generate 3 to 6 sale transactions per day
    const numSales = Math.floor(prng() * 4) + 3;
    for (let s = 0; s < numSales; s++) {
      const baseAmt = 400 + Math.floor(prng() * 1600);
      const amount = Math.round(baseAmt * weekdayMultiplier * festivalMultiplier);
      const cat = categoriesSales[Math.floor(prng() * categoriesSales.length)];
      const modeRoll = prng();
      const mode = modeRoll < 0.55 ? "cash" : modeRoll < 0.88 ? "upi" : "card";
      rows.push(`${dateStr},${amount},sale,${cat},${mode}`);
    }

    // Generate regular expenses
    // After festivals, large restocking dips occur
    const isRestockDay = day === 74 || day === 75 || day === 112 || day === 113;
    if (isRestockDay) {
      const restockAmt = 15000 + Math.floor(prng() * 12000);
      rows.push(`${dateStr},${restockAmt},expense,Wholesale Supplier,upi`);
    } else if (prng() < 0.6) {
      const expAmt = 350 + Math.floor(prng() * 1800);
      const expCat = categoriesExpenses[Math.floor(prng() * categoriesExpenses.length)];
      const mode = prng() < 0.7 ? "cash" : "upi";
      rows.push(`${dateStr},${expAmt},expense,${expCat},${mode}`);
    }

    // Monthly Rent & Wages on 1st of month
    if (curDate.getUTCDate() === 1) {
      rows.push(`${dateStr},14000,expense,Store Rent,upi`);
      rows.push(`${dateStr},8000,expense,Helper Wages,cash`);
    }
  }

  fs.writeFileSync(path.join(samplesDir, "kirana-store.csv"), rows.join("\n"), "utf-8");
  console.log(`Generated kirana-store.csv: ${rows.length - 1} rows`);
}

// 2. Tiffin Service Sample (~90 days)
// Strong weekday/weekend pattern, predominantly UPI
function generateTiffinSample() {
  const prng = mulberry32(1337);
  const rows: string[] = ["date,amount,type,category,payment_mode"];

  const startDate = new Date("2024-07-01T00:00:00Z");
  const totalDays = 90;

  for (let day = 0; day < totalDays; day++) {
    const curDate = new Date(startDate);
    curDate.setUTCDate(curDate.getUTCDate() + day);
    const dateStr = curDate.toISOString().split("T")[0];
    const dow = curDate.getUTCDay();

    // Weekday busy, weekends low
    const isWeekend = dow === 0 || dow === 6;
    const numDeliveries = isWeekend ? Math.floor(prng() * 8) + 4 : Math.floor(prng() * 25) + 30;

    for (let i = 0; i < numDeliveries; i++) {
      const price = prng() < 0.8 ? 120 : 180; // Standard vs Premium Thali
      const mode = prng() < 0.85 ? "upi" : "cash"; // 85% UPI
      rows.push(`${dateStr},${price},sale,Thali Delivery,${mode}`);
    }

    // Daily groceries & vegetable purchase
    const vegExpense = 800 + Math.floor(prng() * 1200);
    rows.push(`${dateStr},${vegExpense},expense,Daily Vegetables & Kirana,cash`);

    // Commercial LPG cylinder every 10 days
    if (day % 10 === 0) {
      rows.push(`${dateStr},2100,expense,Commercial LPG Cylinder,upi`);
    }
  }

  fs.writeFileSync(path.join(samplesDir, "tiffin-service.csv"), rows.join("\n"), "utf-8");
  console.log(`Generated tiffin-service.csv: ${rows.length - 1} rows`);
}

// 3. Messy Sample (~60 rows)
// Mixed dates, currency symbols, commas, negative expense style, blank lines
function generateMessySample() {
  const rows: string[] = [
    "Date,Particulars,Amount,Type,Mode",
    "01/09/2024,Dairy Milk Pouch,₹ 1,450.00,sale,UPI",
    "01-09-24,Morning Groceries,\"Rs. 3,200\",credit,Cash",
    "2024-09-02,Milk Vendor Delivery,(1200),debit,Cash",
    "02/09/2024,Packaged Atta 10kg,850,Income,GPay",
    "03/09/2024,Sugar Bags 50kg,-4500,,PhonePe",
    ",Invalid empty row,,,",
    "04/09/2024,Cold Drinks & Ice Cream,₹2,100,sale,UPI",
    "04-09-2024,Electricity Bill,1850,EXPENSE,NetBanking",
    "05/09/24,Daily Biscuits Sale,\"1,120\",CR,Cash",
    "06/09/2024,Store Plastic Bags,350,Purchase,Cash",
    "07/09/2024,Edible Oil Tins,₹ 5,800.00,sale,Card",
    "08/09/2024,Weekend Grocery Rush,4950,sale,UPI",
    "09/09/2024,Spices & Masala,₹1,650,Income,cash",
    "10/09/2024,Wholesale Pulses,₹-8,200,expense,UPI",
    "11/09/2024,Amul Butter & Paneer,1450,Cr,PhonePe",
    "12/09/2024,Shop Cleaning Supply,240,Dr,Cash",
    "13/09/2024,Soap & Shampoo Sale,₹ 1,890,sale,UPI",
    "14/09/2024,Festival Prep Rush,\"7,450\",sale,UPI",
    "15/09/2024,Snacks & Wafers,2300,sale,cash",
    "16/09/2024,Refrigeration Repair,-1500,expense,Cash",
    "17/09/2024,Tuesday Loose Grain,₹ 980,sale,Cash",
    "18/09/2024,Rice 25kg Bag,\"1,850\",Credit,UPI",
    "19/09/2024,Tea Powder & Jaggery,1250,sale,GPay",
    "20/09/2024,Weekly Vegetable Bill,-3200,debit,cash",
    "21/09/2024,Weekend Bulk Purchase,6200,sale,Card",
    "22/09/2024,General Kirana Counter,4100,sale,UPI",
    "23/09/2024,Detergent Box Offer,1950,sale,Cash",
    "24/09/2024,Tuesday Slow Counter,₹ 850,CR,UPI",
    "25/09/2024,Wholesale Stock Payment,-12000,expense,Cheque",
    "26/09/2024,Snack Distributors,1400,sale,Cash",
    "27/09/2024,Dairy Products,2100,sale,UPI",
    "28/09/2024,Monthly Helper Pay,-8000,expense,Cash",
    "29/09/2024,Sunday Festival Spurt,\"9,850\",sale,UPI",
    "30/09/2024,Month End Counter Sale,4500,sale,Cash",
    "01/10/2024,Shop Rent Advance,-14000,expense,UPI",
    "02/10/2024,Gandhi Jayanti Sales,3200,sale,Cash",
    "03/10/2024,Packaged Sweets,₹ 2,800,sale,UPI",
    "04/10/2024,Counter Bill,1600,sale,Cash",
  ];

  fs.writeFileSync(path.join(samplesDir, "messy-sample.csv"), rows.join("\n"), "utf-8");
  console.log(`Generated messy-sample.csv: ${rows.length - 1} rows`);
}

generateKiranaSample();
generateTiffinSample();
generateMessySample();
console.log("All sample CSV files successfully generated!");
