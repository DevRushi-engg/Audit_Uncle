import fs from "fs";
import { parseCsvText } from "../lib/csv/parse";
import { detectMapping } from "../lib/csv/detect";
import { cleanRows } from "../lib/csv/clean";

const raw = fs.readFileSync("public/samples/real-business-sample.csv", "utf-8");
const { headers, rows } = parseCsvText(raw);
console.log("Headers:", headers);
console.log("Rows count:", rows.length);
console.log("First row:", rows[0]);

const detection = detectMapping(headers, rows);
console.log("Detected mapping:", detection.mapping);

const { transactions, report } = cleanRows(rows, detection.mapping);
console.log("Cleaned transactions count:", transactions.length);
console.log("Report:", report);
