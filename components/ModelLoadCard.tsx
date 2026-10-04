import React, { useState } from "react";
import { AI } from "@/config/app.config";
import { AiStatusType } from "./ModelStatusChip";

interface ModelLoadCardProps {
  status: AiStatusType;
  progress: number;
  providerId: string;
  onLoadWebLlm: () => void;
  onSelectProvider: (id: "template" | "webllm" | "openrouter") => void;
  onSaveOpenRouterKey?: (key: string) => void;
}

export function ModelLoadCard({
  status,
  progress,
  providerId,
  onLoadWebLlm,
  onSelectProvider,
  onSaveOpenRouterKey,
}: ModelLoadCardProps) {
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);

  return (
    <div className="pt-3 pb-1 border-t border-[#E2D6B8] font-sans text-xs">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-[#1A1A1A]">
          AI Engine Provider
        </span>
        <span className="text-[10px] font-mono text-[#2E7D4F] font-bold">
          {providerId === "webllm" && status === "ready"
            ? "● WebGPU Active"
            : providerId === "openrouter"
            ? "● OpenRouter Active"
            : "○ Template Active"}
        </span>
      </div>

      {/* Provider Selector Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#F3EAD3] border border-[#1A1A1A] rounded-lg shadow-[1px_1px_0px_#1A1A1A] mb-2.5 text-[11px] font-mono font-bold">
        <button
          type="button"
          onClick={() => onSelectProvider("template")}
          className={`py-1 px-1 rounded transition-all text-center truncate ${
            providerId === "template"
              ? "bg-[#E8A317] text-[#1A1A1A] border border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A]"
              : "text-[#6B645A] hover:text-[#1A1A1A]"
          }`}
        >
          Template
        </button>
        <button
          type="button"
          onClick={() => onSelectProvider("openrouter")}
          className={`py-1 px-1 rounded transition-all text-center truncate ${
            providerId === "openrouter"
              ? "bg-[#E8A317] text-[#1A1A1A] border border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A]"
              : "text-[#6B645A] hover:text-[#1A1A1A]"
          }`}
        >
          OpenRouter
        </button>
        <button
          type="button"
          onClick={() => onSelectProvider("webllm")}
          className={`py-1 px-1 rounded transition-all text-center truncate ${
            providerId === "webllm"
              ? "bg-[#E8A317] text-[#1A1A1A] border border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A]"
              : "text-[#6B645A] hover:text-[#1A1A1A]"
          }`}
        >
          WebLLM
        </button>
      </div>

      {/* Content based on selected provider */}
      {providerId === "template" && (
        <div className="p-2.5 bg-white border border-[#1A1A1A] rounded-lg shadow-[1px_1px_0px_#1A1A1A] text-[11px]">
          <p className="font-bold text-[#1A1A1A] mb-0.5">Built-in Template Engine</p>
          <p className="text-[#6B645A] leading-relaxed">
            Deterministic, instant, and 100% offline. Zero model download required. Safe baseline for all demos.
          </p>
        </div>
      )}

      {providerId === "openrouter" && (
        <div className="p-2.5 bg-white border border-[#1A1A1A] rounded-lg shadow-[1px_1px_0px_#1A1A1A] text-[11px] space-y-2">
          <div>
            <span className="font-bold text-[#1A1A1A]">Model: </span>
            <span className="font-mono text-[#23408E] font-bold">{AI.openrouterModel}</span>
          </div>
          <p className="text-[#6B645A] leading-relaxed text-[10px]">
            Numbers are calculated locally by code. Only sanitized facts JSON is sent for narration.
          </p>
          <div className="space-y-1">
            <div className="flex gap-1.5">
              <input
                type="password"
                placeholder="Optional OpenRouter Key"
                value={openRouterKey}
                onChange={(e) => {
                  setOpenRouterKey(e.target.value);
                  setKeySaved(false);
                }}
                className="flex-1 px-2 py-1 bg-[#FBF6E9] border border-[#1A1A1A] rounded text-[11px] font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (onSaveOpenRouterKey) onSaveOpenRouterKey(openRouterKey);
                  setKeySaved(true);
                }}
                className="px-2.5 py-1 bg-[#E8A317] border border-[#1A1A1A] rounded font-mono font-bold text-[10px] shadow-[1px_1px_0px_#1A1A1A]"
              >
                {keySaved ? "✓ Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {providerId === "webllm" && (
        <div className="p-2.5 bg-white border border-[#1A1A1A] rounded-lg shadow-[1px_1px_0px_#1A1A1A] text-[11px]">
          {status === "downloading" ? (
            <div>
              <div className="flex justify-between font-mono text-[10px] font-bold text-[#1A1A1A] mb-1">
                <span>Loading {AI.modelLabel}…</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-4 bg-[#F3EAD3] border border-[#1A1A1A] rounded overflow-hidden">
                <div
                  className="h-full hatch-pattern transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-[#6B645A] mt-1.5">
                Downloading one-time model weights into browser CacheStorage.
              </p>
            </div>
          ) : status === "ready" ? (
            <div className="text-[#1B5E20]">
              <span className="font-bold">✓ Model Cached & Ready</span>
              <p className="text-[10px] text-[#6B645A] mt-0.5">
                Qwen2.5 1.5B is active locally via WebGPU. All data stays strictly on this machine.
              </p>
            </div>
          ) : status === "fallback" ? (
            <div>
              <span className="font-bold text-[#991B1B]">▲ WebGPU Load Failed</span>
              <p className="text-[10px] text-[#6B645A] mt-0.5">
                Using built-in template narrator. All math still computes normally.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onLoadWebLlm}
                  className="px-2 py-1 bg-[#E8A317] border border-[#1A1A1A] rounded font-mono font-bold text-[10px]"
                >
                  RETRY LOAD
                </button>
                <button
                  type="button"
                  onClick={() => onSelectProvider("template")}
                  className="px-2 py-1 bg-white border border-[#1A1A1A] rounded font-mono text-[10px]"
                >
                  CONTINUE
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[#6B645A] mb-2 leading-relaxed text-[10px]">
                One-time download (~{AI.approxDownloadMB} MB). Once cached, runs 100% offline via WebGPU.
              </p>
              <button
                type="button"
                onClick={onLoadWebLlm}
                className="w-full py-1.5 bg-[#FFFDF7] hover:bg-[#F3EAD3] text-[#1A1A1A] border-1.5 border-[#1A1A1A] rounded font-mono font-bold text-xs shadow-[2px_2px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px]"
              >
                LOAD ON-DEVICE AI (~900 MB)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
