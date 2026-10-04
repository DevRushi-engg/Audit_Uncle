import React, { useRef, useState } from "react";

interface UploadCardProps {
  onFileSelect: (file: File) => void;
  fileName?: string;
  rowCount?: number;
  disabled?: boolean;
}

export function UploadCard({ onFileSelect, fileName, rowCount, disabled }: UploadCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv") || file.type.includes("csv") || file.type.includes("text")) {
        onFileSelect(file);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Upload CSV file dropzone"
        className={`w-full min-h-[140px] sm:min-h-[160px] p-4 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragOver
            ? "border-[#E8A317] bg-[#E8A317]/10 scale-[0.99]"
            : fileName
            ? "border-[#2E7D4F] bg-[#E8F5E9]/40"
            : "border-[#1A1A1A] bg-[#FAF7EE] hover:bg-[#F5EEDB]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv,text/plain"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {fileName ? (
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">📄</span>
            <span className="font-mono font-bold text-xs text-[#1A1A1A] max-w-[240px] truncate">
              {fileName}
            </span>
            {rowCount !== undefined && (
              <span className="text-[11px] font-mono text-[#2E7D4F] font-bold mt-0.5">
                ✓ {rowCount} rows loaded
              </span>
            )}
            <span className="text-[10px] text-[#6B645A] font-mono mt-1 underline">
              Click to replace file
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 mb-2 rounded-full border-2 border-[#1A1A1A] bg-white flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A]">
              <span className="text-base text-[#1A1A1A]">↑</span>
            </div>
            <p className="font-bold text-xs sm:text-sm text-[#1A1A1A] font-sans">
              Drop your sales CSV here
            </p>
            <p className="text-[11px] text-[#6B645A] font-sans mt-0.5 max-w-[260px]">
              Date, amount, and (optionally) type, category, payment mode.
            </p>
          </div>
        )}
      </div>

      {/* Zero upload guarantee */}
      <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#6B645A]">
        <span>🔒</span>
        <span>Read in your browser. Never uploaded.</span>
      </div>
    </div>
  );
}
