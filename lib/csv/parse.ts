import Papa from "papaparse";
import { LIMITS } from "@/config/app.config";

export interface ParsedCsvResult {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCsvText(text: string): ParsedCsvResult {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
  });

  const headers = result.meta.fields || [];
  const rows = result.data.filter((r) => Object.values(r).some((v) => v !== undefined && v !== null && v.trim() !== ""));

  return { headers, rows };
}

export function parseCsvFile(file: File): Promise<ParsedCsvResult> {
  return new Promise((resolve, reject) => {
    // Check file size limit
    const maxBytes = LIMITS.maxFileMB * 1024 * 1024;
    if (file.size > maxBytes) {
      reject(new Error(`File size is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed is ${LIMITS.maxFileMB} MB.`));
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data.filter((r) =>
          Object.values(r).some((v) => v !== undefined && v !== null && String(v).trim() !== "")
        );

        if (rows.length > LIMITS.maxRows) {
          reject(new Error(`File has ${rows.length.toLocaleString()} rows. Maximum allowed is ${LIMITS.maxRows.toLocaleString()} rows.`));
          return;
        }

        if (headers.length === 0 || rows.length === 0) {
          reject(new Error("The CSV file seems to be empty or does not contain recognizable column headers."));
          return;
        }

        resolve({ headers, rows });
      },
      error: (err) => {
        reject(new Error(`Failed to parse CSV: ${err.message}`));
      },
    });
  });
}
