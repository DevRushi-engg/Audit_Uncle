import React from "react";

export type ErrorKind = "csv" | "ai" | "short";

interface ErrorStateProps {
  kind: ErrorKind;
  message?: string;
  onAction?: () => void;
  onSecondaryAction?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  kind,
  message,
  onAction,
  onSecondaryAction,
}) => {
  if (kind === "short") {
    return (
      <div className="bg-paper border-2 border-turmeric rounded-lg p-5 shadow-[3px_3px_0px_#1A1A1A] space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-turmeric text-ink px-2 py-0.5 rounded">
            KHATA // THODA KAM HAI
          </span>
        </div>
        <h4 className="font-serif text-base font-bold text-ink">
          Need at least 14 days of data to project a runway.
        </h4>
        <p className="font-sans text-xs text-muted-ink leading-relaxed">
          {message ||
            "Your file has fewer than 14 days of records. Audit Uncle can calculate your historical totals, daily averages, and tax estimate, but runway and 30-day forecast require a longer window to be reliable."}
        </p>
      </div>
    );
  }

  if (kind === "ai") {
    return (
      <div className="bg-paper border-2 border-ink rounded-lg p-5 shadow-[3px_3px_0px_#1A1A1A] space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-paper-deep text-ink px-2 py-0.5 rounded border border-rule">
            AI // OFFLINE
          </span>
          <span className="font-mono text-[10px] text-muted-ink">
            FALLBACK ACTIVE
          </span>
        </div>

        <div>
          <h4 className="font-serif text-base font-bold text-ink">
            Using built-in template narrator
          </h4>
          <p className="font-sans text-xs text-muted-ink mt-1 leading-relaxed">
            {message ||
              "All your numbers are still 100% calculated normally by code. The AI model was unreachable or cancelled, so Audit Uncle is using deterministic sentence templates."}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className="bg-turmeric hover:bg-turmeric/90 text-ink font-mono font-bold text-xs uppercase px-3 py-1.5 rounded border border-ink shadow-[1px_1px_0px_#1A1A1A]"
            >
              RETRY AI
            </button>
          )}
          {onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="bg-paper hover:bg-paper-deep text-ink font-mono text-xs uppercase px-3 py-1.5 rounded border border-rule"
            >
              CONTINUE WITH TEMPLATES
            </button>
          )}
        </div>
      </div>
    );
  }

  // kind === "csv"
  return (
    <div className="bg-paper border-2 border-ledger-red rounded-lg p-6 shadow-[3px_3px_0px_#1A1A1A] space-y-4">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-bold bg-ledger-red text-paper px-2 py-0.5 rounded">
          KHATA // INTERRUPTED
        </span>
      </div>

      <h4 className="font-serif text-base sm:text-lg font-bold text-ink">
        Hmm, yeh file samajh nahi aayi.
      </h4>

      <p className="font-sans text-xs sm:text-sm text-muted-ink leading-relaxed">
        {message ||
          "Could not detect required Date and Amount columns automatically. Please check your CSV format or configure columns manually in the mapper."}
      </p>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="bg-turmeric hover:bg-turmeric/90 text-ink font-mono font-bold text-xs uppercase px-4 py-2 rounded border border-ink shadow-[2px_2px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5"
        >
          OPEN COLUMN MAPPER →
        </button>
      )}
    </div>
  );
};
