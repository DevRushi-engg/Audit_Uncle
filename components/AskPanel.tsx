"use client";

import React, { useState, useEffect, useRef } from "react";
import type { NarratorLanguageId } from "@/types/finance";
import { SectionHeader } from "./SectionHeader";
import { AnswerCard, type AnswerItem } from "./AnswerCard";

interface AskPanelProps {
  hasAnalysis: boolean;
  language: NarratorLanguageId;
  history: AnswerItem[];
  isLoading: boolean;
  onAsk: (question: string) => Promise<void>;
}

const CHIPS = [
  "Best day?",
  "Can I afford a ₹40,000 fridge?",
  "Where does my money go?",
  "Why were Tuesdays slow?",
];

export const AskPanel: React.FC<AskPanelProps> = ({
  hasAnalysis,
  language,
  history,
  isLoading,
  onAsk,
}) => {
  const [question, setQuestion] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Check speech recognition support safely in browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === "hinglish" ? "hi-IN" : "en-IN";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setQuestion(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  const toggleListen = () => {
    if (!recognitionRef.current || !hasAnalysis) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang =
          language === "hinglish" ? "hi-IN" : "en-IN";
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !hasAnalysis || isLoading) return;
    const q = question.trim();
    setQuestion("");
    await onAsk(q);
  };

  const handleChipClick = async (chip: string) => {
    if (!hasAnalysis || isLoading) return;
    setQuestion(chip);
    await onAsk(chip);
  };

  return (
    <div className="bg-paper border-2 border-ink rounded-lg p-4 sm:p-5 shadow-[3px_3px_0px_#1A1A1A] space-y-4">
      <SectionHeader number={4} title="ASK // AUDIT UNCLE" />

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative flex items-center">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={!hasAnalysis || isLoading}
            placeholder={
              !hasAnalysis
                ? "First upload CSV & run analysis to ask questions..."
                : "Ask about your sales, cash, runway, or expenses..."
            }
            className="w-full bg-paper border-2 border-ink rounded-md pl-3 pr-24 py-2.5 text-xs sm:text-sm font-sans placeholder:text-muted-ink/70 focus:outline-none focus:ring-2 focus:ring-turmeric disabled:bg-paper-deep disabled:cursor-not-allowed text-ink"
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            {speechSupported && (
              <button
                type="button"
                onClick={toggleListen}
                disabled={!hasAnalysis || isLoading}
                className={`p-1.5 rounded border border-ink text-xs font-mono transition-colors ${
                  isListening
                    ? "bg-ledger-red text-paper animate-pulse"
                    : "bg-paper-deep text-ink hover:bg-paper"
                } disabled:opacity-50`}
                title={isListening ? "Listening..." : "Speak question"}
              >
                🎤
              </button>
            )}

            <button
              type="submit"
              disabled={!hasAnalysis || !question.trim() || isLoading}
              className="bg-turmeric hover:bg-turmeric/90 text-ink font-mono font-bold text-xs uppercase px-3 py-1.5 rounded border border-ink shadow-[1px_1px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "..." : "ASK"}
            </button>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase text-muted-ink">
            Quick:
          </span>
          {CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              disabled={!hasAnalysis || isLoading}
              className="font-mono text-[11px] bg-paper-deep hover:bg-turmeric/30 text-ink px-2 py-1 rounded border border-rule transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {chip}
            </button>
          ))}
        </div>
      </form>

      {/* Answer History */}
      {history.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-rule/80">
          <div className="flex items-center justify-between font-mono text-[10px] text-muted-ink uppercase">
            <span>Recent Q&A History ({history.length}/10)</span>
            <span>Deterministic Tools</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {history.map((item) => (
              <AnswerCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
