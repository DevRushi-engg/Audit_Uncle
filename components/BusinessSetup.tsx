import React from "react";
import { BUSINESS_TYPES, NARRATOR_LANGUAGES } from "@/config/app.config";
import { BusinessTypeId, NarratorLanguageId } from "@/types/finance";

interface BusinessSetupProps {
  openingCash: number;
  businessType: BusinessTypeId;
  narratorLanguage: NarratorLanguageId;
  onOpeningCashChange: (val: number) => void;
  onBusinessTypeChange: (type: BusinessTypeId) => void;
  onNarratorLanguageChange: (lang: NarratorLanguageId) => void;
  disabled?: boolean;
}

export function BusinessSetup({
  openingCash,
  businessType,
  narratorLanguage,
  onOpeningCashChange,
  onBusinessTypeChange,
  onNarratorLanguageChange,
  disabled,
}: BusinessSetupProps) {
  const handleCashInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    const val = raw ? parseInt(raw, 10) : 0;
    onOpeningCashChange(val);
  };

  const formattedCash = new Intl.NumberFormat("en-IN").format(openingCash);

  return (
    <div className="space-y-3.5 pt-3 border-t border-[#E2D6B8] font-sans text-xs">
      {/* Opening Cash Input */}
      <div>
        <label htmlFor="openingCash" className="block font-mono font-bold text-[11px] text-[#1A1A1A] uppercase tracking-wider mb-1">
          Opening Cash Balance
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3 font-mono font-bold text-sm text-[#1A1A1A]">₹</span>
          <input
            id="openingCash"
            type="text"
            inputMode="numeric"
            disabled={disabled}
            value={formattedCash}
            onChange={handleCashInput}
            className="w-full pl-8 pr-3 py-2 bg-white border-1.5 border-[#1A1A1A] rounded-lg font-mono font-bold text-sm text-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#23408E]"
          />
        </div>
      </div>

      {/* Business Type Select */}
      <div>
        <label htmlFor="businessType" className="block font-mono font-bold text-[11px] text-[#1A1A1A] uppercase tracking-wider mb-1">
          Business Profile (Tax Rules)
        </label>
        <select
          id="businessType"
          disabled={disabled}
          value={businessType}
          onChange={(e) => onBusinessTypeChange(e.target.value as BusinessTypeId)}
          className="w-full px-3 py-2 bg-white border-1.5 border-[#1A1A1A] rounded-lg font-mono text-xs text-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#23408E] cursor-pointer"
        >
          {BUSINESS_TYPES.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
        {BUSINESS_TYPES.find((b) => b.id === businessType)?.taxDetails && (
          <div className="mt-1.5 px-2.5 py-1.5 bg-[#FFFDF7] border border-[#E2D6B8] rounded text-[11px] font-mono text-[#6B645A] flex items-start sm:items-center gap-1.5 leading-snug">
            <span className="text-[#23408E] font-bold shrink-0">ℹ Slab:</span>
            <span>{BUSINESS_TYPES.find((b) => b.id === businessType)?.taxDetails}</span>
          </div>
        )}
      </div>

      {/* Narrator Language Segmented Control */}
      <div>
        <label className="block font-mono font-bold text-[11px] text-[#1A1A1A] uppercase tracking-wider mb-1">
          Narrator Language
        </label>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F3EAD3] border border-[#1A1A1A] rounded-lg shadow-[1px_1px_0px_#1A1A1A]">
          {NARRATOR_LANGUAGES.map((lang) => {
            const isSelected = narratorLanguage === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                disabled={disabled}
                onClick={() => onNarratorLanguageChange(lang.id as NarratorLanguageId)}
                className={`py-1.5 px-2 rounded font-mono text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-[#E8A317] text-[#1A1A1A] border border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A]"
                    : "text-[#6B645A] hover:text-[#1A1A1A]"
                }`}
              >
                {lang.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
