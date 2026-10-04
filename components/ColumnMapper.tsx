import React from "react";
import { ColumnMapping, ColumnRole } from "@/types/finance";

interface ColumnMapperProps {
  headers: string[];
  rawRows: Record<string, string>[];
  mapping: ColumnMapping;
  autoDetected: Record<string, boolean>;
  onMappingChange: (header: string, role: ColumnRole) => void;
}

const AVAILABLE_ROLES: { role: ColumnRole; label: string }[] = [
  { role: "date", label: "Date (तारीख)" },
  { role: "amount", label: "Amount (रक्कम ₹)" },
  { role: "type", label: "Type (Sale / Expense)" },
  { role: "category", label: "Category (तपशील)" },
  { role: "paymentMode", label: "Payment Mode (UPI/Cash)" },
  { role: "ignore", label: "Ignore / Skip" },
];

export function ColumnMapper({
  headers,
  rawRows,
  mapping,
  autoDetected,
  onMappingChange,
}: ColumnMapperProps) {
  const hasDate = Object.values(mapping).includes("date");
  const hasAmount = Object.values(mapping).includes("amount");

  const previewRows = rawRows.slice(0, 5);

  return (
    <div className="pt-3 pb-2 border-t border-[#E2D6B8] font-sans text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-[#1A1A1A]">
          Column Schema Mapping
        </span>
        <span className="text-[10px] font-mono text-[#6B645A]">
          {headers.length} detected columns
        </span>
      </div>

      {(!hasDate || !hasAmount) && (
        <div className="p-2 mb-2 bg-[#FEF2F2] border border-[#A8231B] rounded text-[11px] font-mono text-[#A8231B] font-bold">
          ⚠️ Both Date and Amount columns must be assigned before analyzing.
        </div>
      )}

      {/* Mapping Rows */}
      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
        {headers.map((h) => {
          const role = mapping[h] || "ignore";
          const isAuto = autoDetected[h] ?? false;

          return (
            <div
              key={h}
              className="flex items-center justify-between gap-2 p-1.5 bg-[#FFFDF7] border border-[#1A1A1A] rounded shadow-[1px_1px_0px_#1A1A1A]"
            >
              <div className="min-w-0 flex-1 flex items-center gap-1.5">
                <span className="font-mono font-bold text-xs truncate text-[#1A1A1A]">
                  {h}
                </span>
                <span
                  className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                    isAuto
                      ? "bg-[#E8F5E9] text-[#1B5E20] border border-[#2E7D4F]/30"
                      : "bg-[#FEF3C7] text-[#92400E] border border-[#E8A317]/30"
                  }`}
                >
                  {isAuto ? "auto" : "check"}
                </span>
              </div>

              <select
                value={role}
                onChange={(e) => onMappingChange(h, e.target.value as ColumnRole)}
                className="font-mono text-xs py-1 px-1.5 bg-white border border-[#1A1A1A] rounded focus:outline-none focus:ring-1 focus:ring-[#23408E] cursor-pointer"
              >
                {AVAILABLE_ROLES.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {/* 5-row Data Sniff Preview */}
      {previewRows.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-[#E2D6B8]">
          <span className="block text-[10px] font-mono font-bold uppercase text-[#6B645A] mb-1">
            Raw 5-Row Data Preview:
          </span>
          <div className="overflow-x-auto max-h-[110px] border border-[#1A1A1A] rounded bg-white">
            <table className="w-full text-left font-mono text-[10px] border-collapse">
              <thead>
                <tr className="bg-[#F3EAD3] border-b border-[#1A1A1A]">
                  {headers.map((h) => (
                    <th key={h} className="p-1 px-1.5 font-bold border-r border-[#E2D6B8] last:border-r-0 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-[#E2D6B8] last:border-b-0 hover:bg-[#FBF6E9]">
                    {headers.map((h) => (
                      <td key={h} className="p-1 px-1.5 border-r border-[#E2D6B8] last:border-r-0 whitespace-nowrap truncate max-w-[120px]">
                        {row[h] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
