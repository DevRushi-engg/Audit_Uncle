import React from "react";
import { BusinessTypeId, ColumnMapping, ColumnRole, NarratorLanguageId, ReportState } from "@/types/finance";
import { SectionHeader } from "./SectionHeader";
import { UploadCard } from "./UploadCard";
import { SampleMenu } from "./SampleMenu";
import { ColumnMapper } from "./ColumnMapper";
import { BusinessSetup } from "./BusinessSetup";

interface KhataPanelProps {
  reportState: ReportState;
  fileName?: string;
  rowCount?: number;
  headers: string[];
  rawRows: Record<string, string>[];
  mapping: ColumnMapping;
  autoDetected: Record<string, boolean>;
  openingCash: number;
  businessType: BusinessTypeId;
  narratorLanguage: NarratorLanguageId;
  onFileSelect: (file: File) => void;
  onSelectSample: (id: string) => void;
  onMappingChange: (header: string, role: ColumnRole) => void;
  onOpeningCashChange: (val: number) => void;
  onBusinessTypeChange: (type: BusinessTypeId) => void;
  onNarratorLanguageChange: (lang: NarratorLanguageId) => void;
  onAnalyze: () => void;
}

export function KhataPanel({
  reportState,
  fileName,
  rowCount,
  headers,
  rawRows,
  mapping,
  autoDetected,
  openingCash,
  businessType,
  narratorLanguage,
  onFileSelect,
  onSelectSample,
  onMappingChange,
  onOpeningCashChange,
  onBusinessTypeChange,
  onNarratorLanguageChange,
  onAnalyze,
}: KhataPanelProps) {
  const isAnalyzing = reportState === "analyzing";
  const canAnalyze =
    (reportState === "mapping" || reportState === "results") &&
    Object.values(mapping).includes("date") &&
    Object.values(mapping).includes("amount") &&
    !isAnalyzing;

  return (
    <div className="bahi-card p-4 sm:p-5 flex flex-col h-full bg-[#FFFDF7]">
      <SectionHeader number="01" title="KHATA // DATA" badge={rowCount ? `${rowCount} rows` : undefined} />

      <div className="space-y-4 flex-1">
        {/* Upload Dropzone for real-world user CSVs */}
        <UploadCard
          onFileSelect={onFileSelect}
          fileName={fileName}
          rowCount={rowCount}
          disabled={isAnalyzing}
        />

        {/* Column Mapper (shown when file is loaded) */}
        {headers.length > 0 && (reportState === "mapping" || reportState === "results") && (
          <ColumnMapper
            headers={headers}
            rawRows={rawRows}
            mapping={mapping}
            autoDetected={autoDetected}
            onMappingChange={onMappingChange}
          />
        )}

        {/* Business Configurations */}
        <BusinessSetup
          openingCash={openingCash}
          businessType={businessType}
          narratorLanguage={narratorLanguage}
          onOpeningCashChange={onOpeningCashChange}
          onBusinessTypeChange={onBusinessTypeChange}
          onNarratorLanguageChange={onNarratorLanguageChange}
          disabled={isAnalyzing}
        />

        {/* Sample CSV Dropdown for quick testing if needed */}
        <div className="pt-2 border-t border-[#E2D6B8]">
          <div className="text-[11px] font-mono text-[#6B645A] mb-1.5 flex items-center justify-between">
            <span>Need sample data to test?</span>
          </div>
          <SampleMenu onSelectSample={onSelectSample} disabled={isAnalyzing} />
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-4 mt-4 border-t-2 border-[#1A1A1A]">
        <button
          type="button"
          disabled={!canAnalyze && !isAnalyzing}
          onClick={onAnalyze}
          className={`w-full min-h-[50px] px-4 py-3 rounded-lg font-mono font-bold text-sm uppercase flex items-center justify-center gap-2 border-2 border-[#1A1A1A] transition-all shadow-[3px_3px_0px_#1A1A1A] ${
            isAnalyzing
              ? "bg-[#FEF3C7] text-[#92400E] animate-pulse cursor-wait"
              : canAnalyze
              ? "bg-[#E8A317] hover:bg-[#F59E0B] text-[#1A1A1A] cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
              : "bg-[#E2D6B8] text-[#6B645A] opacity-60 cursor-not-allowed"
          }`}
        >
          {isAnalyzing ? (
            <span>HISAB LAGAYA JA RAHA HAI… ⏳</span>
          ) : (
            <>
              <span>Analyze / हिशोब लावा →</span>
              <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-white/60 border border-[#1A1A1A]">
                Ctrl ⏎
              </kbd>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
