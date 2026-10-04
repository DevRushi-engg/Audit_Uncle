import React from "react";

interface SectionHeaderProps {
  number?: string | number;
  title: string;
  badge?: string;
  children?: React.ReactNode;
}

export function SectionHeader({ number, title, badge, children }: SectionHeaderProps) {
  const formattedNumber =
    number !== undefined
      ? String(number).padStart(2, "0") + " // "
      : "";

  return (
    <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#1A1A1A]">
      <div className="flex items-center gap-2">
        <h2 className="text-[12px] font-bold tracking-[0.14em] uppercase text-[#1A1A1A] font-mono">
          {formattedNumber}
          {title}
        </h2>
        {badge && (
          <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 border border-[#1A1A1A] rounded bg-[#FFFDF7] text-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A]">
            {badge}
          </span>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
