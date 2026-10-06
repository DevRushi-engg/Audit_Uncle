"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import type {
  ReportState,
  BusinessTypeId,
  NarratorLanguageId,
  ColumnMapping,
  ColumnRole,
  Transaction,
  AnalysisResult,
  AgentState,
  WhatIfInput,
  WhatIfResult,
  FinanceFacts,
} from "@/types/finance";
import { DEFAULTS, SAMPLES, APP } from "@/config/app.config";
import { parseCsvFile, parseCsvText } from "@/lib/csv/parse";
import { detectMapping } from "@/lib/csv/detect";
import { cleanRows } from "@/lib/csv/clean";
import { computeFacts } from "@/lib/finance/metrics";
import { runWhatIf } from "@/lib/finance/whatif";
import { executeTool } from "@/lib/finance/tools";
import { runAnalysis } from "@/lib/agents/orchestrator";
import { routeQuestion } from "@/lib/ai/router";
import { narrateAnswer } from "@/lib/ai/template";
import { validateNarration } from "@/lib/ai/guard";
import {
  getActiveProvider,
  getProvider,
  setActiveProvider,
} from "@/lib/ai/provider";
import { OpenRouterProvider } from "@/lib/ai/openrouter";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { KhataPanel } from "./KhataPanel";
import { DashboardPanel } from "./DashboardPanel";
import { AgentRoom } from "./AgentRoom";
import { AskPanel } from "./AskPanel";
import { MobileTabBar, type MobileTab } from "./MobileTabBar";
import { TallyStrip } from "./TallyStrip";
import { Footer } from "./Footer";
import { ScanBillModal } from "./ScanBillModal";
import type { AnswerItem } from "./AnswerCard";
import type { AiStatusType } from "./ModelStatusChip";

const INITIAL_WHAT_IF: WhatIfInput = {
  priceChangePct: 0,
  expenseChangePct: 0,
  oneTimeSpend: 0,
};

export const Workspace: React.FC = () => {
  // State 1: CSV & Mapping
  const [reportState, setReportState] = useState<ReportState>("empty");
  const [fileMeta, setFileMeta] = useState<{ name: string; sizeMB: number } | null>(null);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [autoDetected, setAutoDetected] = useState<Record<string, boolean>>({});

  // State 2: Business Setup
  const [openingCash, setOpeningCash] = useState<number>(DEFAULTS.openingCash);
  const [businessType, setBusinessType] = useState<BusinessTypeId>(DEFAULTS.businessType);
  const [narratorLanguage, setNarratorLanguage] = useState<NarratorLanguageId>(DEFAULTS.narratorLanguage);

  // State 3: Analysis & Agents
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  // State 4: AI Provider Status
  const [aiStatus, setAiStatus] = useState<AiStatusType>("not_loaded");
  const [aiProgress, setAiProgress] = useState<number>(0);
  const [providerId, setProviderIdState] = useState<"template" | "webllm" | "openrouter">("template");

  // State 5: What-If Simulator
  const [whatIf, setWhatIf] = useState<WhatIfInput>(INITIAL_WHAT_IF);
  const [whatIfResult, setWhatIfResult] = useState<WhatIfResult | null>(null);

  // State 6: Ask Q&A History
  const [askHistory, setAskHistory] = useState<AnswerItem[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  // State 7: Mobile Navigation
  const [activeTab, setActiveTab] = useState<MobileTab>("khata");
  const [, startTransition] = useTransition();

  // State 8: Live Bill / Khata Scanner Modal
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Handlers: Scanned CSV Data Ingestion
  const handleParsedCsvText = (csvText: string, fileName: string) => {
    try {
      setErrorMessage(undefined);
      const { headers: parsedHeaders, rows: parsedRows } = parseCsvText(csvText);
      const detection = detectMapping(parsedHeaders, parsedRows);

      setFileMeta({ name: fileName, sizeMB: +(csvText.length / (1024 * 1024)).toFixed(2) });
      setHeaders(parsedHeaders);
      setRawRows(parsedRows);
      setMapping(detection.mapping);
      setAutoDetected(detection.autoDetected);
      setReportState("mapping");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process scanned CSV data.");
      setReportState("error");
    }
  };

  // Handlers: File selection
  const handleFileSelect = async (file: File) => {
    try {
      setErrorMessage(undefined);
      const { headers: parsedHeaders, rows: parsedRows } = await parseCsvFile(file);
      const detection = detectMapping(parsedHeaders, parsedRows);

      setFileMeta({ name: file.name, sizeMB: +(file.size / (1024 * 1024)).toFixed(2) });
      setHeaders(parsedHeaders);
      setRawRows(parsedRows);
      setMapping(detection.mapping);
      setAutoDetected(detection.autoDetected);
      setReportState("mapping");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to parse CSV file.");
      setReportState("error");
    }
  };

  // Handlers: Pre-generated Sample selection
  const handleSelectSample = async (sampleId: string) => {
    const sample = SAMPLES.find((s) => s.id === sampleId);
    if (!sample) return;

    try {
      setErrorMessage(undefined);
      const res = await fetch(sample.file);
      if (!res.ok) throw new Error(`Could not load ${sample.label}`);
      const text = await res.text();

      const { headers: parsedHeaders, rows: parsedRows } = parseCsvText(text);
      const detection = detectMapping(parsedHeaders, parsedRows);

      setFileMeta({ name: `${sample.label}.csv`, sizeMB: 0.1 });
      setHeaders(parsedHeaders);
      setRawRows(parsedRows);
      setMapping(detection.mapping);
      setAutoDetected(detection.autoDetected);
      setOpeningCash(sample.openingCash);
      setBusinessType(sample.businessType as BusinessTypeId);
      setReportState("mapping");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load sample data.");
      setReportState("error");
    }
  };

  // Handlers: Mapping changes
  const handleMappingChange = (header: string, role: ColumnRole) => {
    setMapping((prev) => ({
      ...prev,
      [header]: role,
    }));
  };

  // Handlers: Analysis Execution
  const handleAnalyze = useCallback(async () => {
    if (reportState === "analyzing" || rawRows.length === 0) return;

    // Validate that at least date and amount are mapped
    const hasDate = Object.values(mapping).includes("date");
    const hasAmount = Object.values(mapping).includes("amount");

    if (!hasDate || !hasAmount) {
      setErrorMessage("Please map at least one Date column and one Amount column.");
      setReportState("error");
      return;
    }

    setErrorMessage(undefined);
    setReportState("analyzing");

    try {
      // 1. Clean transactions
      const { transactions: cleanedTx, report } = cleanRows(rawRows, mapping);
      if (cleanedTx.length === 0) {
        throw new Error("No valid transactions found after cleaning rows.");
      }

      // 2. Compute facts
      const facts = computeFacts(cleanedTx, openingCash, businessType);

      // 3. Initialize what-if baseline
      const initialWhatIf = runWhatIf(facts, INITIAL_WHAT_IF);
      setWhatIf(INITIAL_WHAT_IF);
      setWhatIfResult(initialWhatIf);

      // 4. Run agent orchestrator with live status updates
      const activeProv = getActiveProvider();
      const result = await runAnalysis(
        { transactions: cleanedTx, report, facts },
        activeProv,
        narratorLanguage,
        (updatedAgents) => {
          setAgents([...updatedAgents]);
        }
      );

      setAnalysis(result);
      setAgents(result.agents);
      setReportState("results");
      startTransition(() => {
        setActiveTab("hisab");
      });
    } catch (err: any) {
      console.error("Analysis execution error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during hisab analysis.");
      setReportState("error");
    }
  }, [reportState, rawRows, mapping, openingCash, businessType, narratorLanguage]);

  // Global Hotkey: Ctrl+Enter / Cmd+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleAnalyze();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAnalyze]);

  // Handlers: AI Provider Loading & Switching
  const handleSelectProvider = (id: "template" | "webllm" | "openrouter") => {
    setProviderIdState(id);
    setActiveProvider(id);
    if (id === "template") {
      setAiStatus("not_loaded");
    } else if (id === "openrouter") {
      setAiStatus("ready");
    }
  };

  const handleLoadWebLlm = async () => {
    const webllmProv = getProvider("webllm");
    if (!webllmProv.load) return;

    setAiStatus("downloading");
    setAiProgress(0);

    try {
      await webllmProv.load((pct, text) => {
        setAiProgress(pct);
      });
      setAiStatus("ready");
      handleSelectProvider("webllm");
    } catch (err) {
      console.warn("WebLLM load failed, fallback active:", err);
      setAiStatus("fallback");
      handleSelectProvider("template");
    }
  };

  const handleSaveOpenRouterKey = (key: string) => {
    const prov = getProvider("openrouter");
    if (prov instanceof OpenRouterProvider) {
      prov.setApiKey(key);
    }
    handleSelectProvider("openrouter");
    setAiStatus("ready");
  };

  // Handlers: What-If Slider Change (Pure math, synchronous)
  const handleWhatIfChange = (newInput: WhatIfInput) => {
    setWhatIf(newInput);
    if (analysis?.facts) {
      const res = runWhatIf(analysis.facts, newInput);
      setWhatIfResult(res);
    }
  };

  const handleWhatIfReset = () => {
    handleWhatIfChange(INITIAL_WHAT_IF);
  };

  // Handlers: Ask Box Interaction
  const handleAsk = async (question: string) => {
    if (!analysis?.facts || isAsking) return;
    setIsAsking(true);

    try {
      const provider = getActiveProvider();
      const facts = analysis.facts;

      // 1. Route to deterministic tool
      const routed = await routeQuestion(question, provider, facts);
      const toolResult = executeTool(routed.tool, routed.args, facts);

      // 2. Generate explanation
      let narration = "";
      let source: "ai" | "template" = "template";

      if (provider.isReady() && provider.id !== "template") {
        try {
          const aiText = await provider.generate({
            system: `You are Audit Uncle, explaining tool numbers to a shop owner in ${narratorLanguage}. Use numbers from the tool data only. At most 2 short sentences.`,
            user: `TOOL: ${toolResult.tool}\nNUMBERS: ${JSON.stringify(toolResult.numbers)}`,
            maxTokens: 100,
          });

          if (validateNarration(aiText, toolResult.numbers)) {
            narration = aiText;
            source = "ai";
          } else {
            narration = narrateAnswer(toolResult, narratorLanguage);
          }
        } catch {
          narration = narrateAnswer(toolResult, narratorLanguage);
        }
      } else {
        narration = narrateAnswer(toolResult, narratorLanguage);
      }

      const newItem: AnswerItem = {
        id: `${Date.now()}-${Math.random()}`,
        question,
        answer: narration,
        toolResult,
        source,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setAskHistory((prev) => [newItem, ...prev.slice(0, 9)]);
    } catch (err) {
      console.error("Ask query failed:", err);
    } finally {
      setIsAsking(false);
    }
  };

  const modelStatusFooterText = "Audit Uncle AI CFO Engine Active";

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink selection:bg-turmeric selection:text-ink">
      {/* Top Header */}
      <Header
        aiStatus={aiStatus}
        aiProgress={aiProgress}
        providerId={providerId}
      />

      {/* Hero Intro */}
      <Hero />

      {/* Main Workspace Grid */}
      <main className="grow max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full">
        {/* Desktop 2-column Executive Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (Input & Ask Tools ~33%) */}
          <div className="lg:col-span-4 space-y-6">
            <KhataPanel
              reportState={reportState}
              fileName={fileMeta?.name}
              rowCount={rawRows.length}
              headers={headers}
              rawRows={rawRows}
              mapping={mapping}
              autoDetected={autoDetected}
              openingCash={openingCash}
              businessType={businessType}
              narratorLanguage={narratorLanguage}
              onFileSelect={handleFileSelect}
              onScanBillClick={() => setIsScanModalOpen(true)}
              onSelectSample={handleSelectSample}
              onMappingChange={handleMappingChange}
              onOpeningCashChange={setOpeningCash}
              onBusinessTypeChange={setBusinessType}
              onNarratorLanguageChange={setNarratorLanguage}
              onAnalyze={handleAnalyze}
            />

            <AskPanel
              hasAnalysis={!!analysis}
              language={narratorLanguage}
              history={askHistory}
              isLoading={isAsking}
              onAsk={handleAsk}
            />
          </div>

          {/* Right Column: Executive CFO Dashboard (~67%) */}
          <div className="lg:col-span-8">
            <DashboardPanel
              reportState={reportState}
              facts={analysis?.facts || null}
              memo={analysis?.memo}
              agents={agents}
              whatIfInput={whatIf}
              whatIfResult={whatIfResult}
              onWhatIfChange={handleWhatIfChange}
              onWhatIfReset={handleWhatIfReset}
              onLoadKiranaSample={() => handleSelectSample("real")}
              errorMessage={errorMessage}
              onOpenMapper={() => setReportState("mapping")}
            />
          </div>
        </div>

        {/* Tablet layout (md to lg) */}
        <div className="hidden md:grid lg:hidden md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-5 space-y-6">
            <KhataPanel
              reportState={reportState}
              fileName={fileMeta?.name}
              rowCount={rawRows.length}
              headers={headers}
              rawRows={rawRows}
              mapping={mapping}
              autoDetected={autoDetected}
              openingCash={openingCash}
              businessType={businessType}
              narratorLanguage={narratorLanguage}
              onFileSelect={handleFileSelect}
              onSelectSample={handleSelectSample}
              onMappingChange={handleMappingChange}
              onOpeningCashChange={setOpeningCash}
              onBusinessTypeChange={setBusinessType}
              onNarratorLanguageChange={setNarratorLanguage}
              onAnalyze={handleAnalyze}
            />
            <AgentRoom agents={agents} memo={analysis?.memo} />
          </div>

          <div className="md:col-span-7 space-y-6">
            <DashboardPanel
              reportState={reportState}
              facts={analysis?.facts || null}
              whatIfInput={whatIf}
              whatIfResult={whatIfResult}
              onWhatIfChange={handleWhatIfChange}
              onWhatIfReset={handleWhatIfReset}
              onLoadKiranaSample={() => handleSelectSample("kirana")}
              errorMessage={errorMessage}
              onOpenMapper={() => setReportState("mapping")}
            />
            <AskPanel
              hasAnalysis={!!analysis}
              language={narratorLanguage}
              history={askHistory}
              isLoading={isAsking}
              onAsk={handleAsk}
            />
          </div>
        </div>

        {/* Mobile single-column layout (controlled by activeTab) */}
        <div className="md:hidden pb-20">
          {activeTab === "khata" && (
            <KhataPanel
              reportState={reportState}
              fileName={fileMeta?.name}
              rowCount={rawRows.length}
              headers={headers}
              rawRows={rawRows}
              mapping={mapping}
              autoDetected={autoDetected}
              openingCash={openingCash}
              businessType={businessType}
              narratorLanguage={narratorLanguage}
              onFileSelect={handleFileSelect}
              onScanBillClick={() => setIsScanModalOpen(true)}
              onSelectSample={handleSelectSample}
              onMappingChange={handleMappingChange}
              onOpeningCashChange={setOpeningCash}
              onBusinessTypeChange={setBusinessType}
              onNarratorLanguageChange={setNarratorLanguage}
              onAnalyze={handleAnalyze}
            />
          )}

          {activeTab === "hisab" && (
            <DashboardPanel
              reportState={reportState}
              facts={analysis?.facts || null}
              whatIfInput={whatIf}
              whatIfResult={whatIfResult}
              onWhatIfChange={handleWhatIfChange}
              onWhatIfReset={handleWhatIfReset}
              onLoadKiranaSample={() => handleSelectSample("kirana")}
              errorMessage={errorMessage}
              onOpenMapper={() => setReportState("mapping")}
            />
          )}

          {activeTab === "agents" && (
            <AgentRoom agents={agents} memo={analysis?.memo} />
          )}

          {activeTab === "ask" && (
            <AskPanel
              hasAnalysis={!!analysis}
              language={narratorLanguage}
              history={askHistory}
              isLoading={isAsking}
              onAsk={handleAsk}
            />
          )}
        </div>
      </main>

      {/* Sticky Mobile Tab Bar */}
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        agentsCount={agents.filter((a) => a.status === "done").length}
      />

      {/* Decorative Bahi-Khata Tally Strip */}
      <div className="mt-8">
        <TallyStrip count={12} />
      </div>

      {/* Footer with MLH Nashik attribution line */}
      <Footer modelStatusText={modelStatusFooterText} />

      {/* Cross-Device / Direct Camera Bill & Khata Scanner Modal */}
      <ScanBillModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onParsedCsv={handleParsedCsvText}
      />
    </div>
  );
};
