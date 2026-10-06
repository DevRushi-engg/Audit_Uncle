"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";

interface ScanBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsedCsv: (csvText: string, fileName: string) => void;
}

export function ScanBillModal({ isOpen, onClose, onParsedCsv }: ScanBillModalProps) {
  const [activeTab, setActiveTab] = useState<"qr" | "upload">("qr");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [scanUrl, setScanUrl] = useState<string>("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [receivedCount, setReceivedCount] = useState<number | null>(null);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [manualSyncCode, setManualSyncCode] = useState("");

  const localFileInputRef = useRef<HTMLInputElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop polling helper
  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const generateQrForUrl = async (url: string) => {
    const qr = await QRCode.toDataURL(url, {
      width: 240,
      margin: 1.5,
      color: {
        dark: "#1A1A1A",
        light: "#FFFDF7",
      },
    });
    setQrDataUrl(qr);
  };

  const handleManualSync = useCallback(
    async (codeToSync?: string) => {
      const targetCode = (codeToSync || manualSyncCode || sessionId || "").trim().toUpperCase();
      if (!targetCode) return;

      try {
        setLocalError(null);
        const res = await fetch(`/api/scan/session?id=${targetCode}`);
        const data = await res.json();

        if (data.session?.csvData) {
          stopPolling();
          setIsWaiting(false);
          const csv = data.session.csvData;
          setReceivedCount(csv.trim().split("\n").length - 1);
          setTimeout(() => {
            onParsedCsv(csv, `Mobile_Scan_${targetCode}.csv`);
            onClose();
          }, 800);
        } else {
          setLocalError(
            data.session
              ? `Session ${targetCode} is ${data.session.status}. Please tap 'Send to PC' on your phone.`
              : `Session ${targetCode} not found or expired.`
          );
        }
      } catch {
        setLocalError(`Error connecting to session ${targetCode}.`);
      }
    },
    [manualSyncCode, sessionId, onClose, onParsedCsv, stopPolling]
  );

  // Initialize session and generate QR Code
  const initSession = useCallback(async () => {
    try {
      setIsWaiting(true);
      setLocalError(null);
      setReceivedCount(null);
      setIsEditingUrl(false);

      const res = await fetch("/api/scan/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create" }),
      });
      const data = await res.json();

      if (data.session && data.session.id) {
        const sid = data.session.id;
        setSessionId(sid);
        setManualSyncCode(sid);

        // Prefer LAN IP returned by server (e.g. http://10.51.121.252:3000) over localhost
        const base = data.baseUrl || window.location.origin;
        const targetUrl = `${base}/scan?id=${sid}`;
        setScanUrl(targetUrl);
        setCustomUrlInput(targetUrl);

        // Generate QR code Data URL
        await generateQrForUrl(targetUrl);

        // Start polling for mobile completion
        stopPolling();
        pollTimerRef.current = setInterval(async () => {
          try {
            const checkRes = await fetch(`/api/scan/session?id=${sid}`);
            const checkData = await checkRes.json();

            // Accept immediately if CSV data arrived
            if (checkData.session?.csvData) {
              stopPolling();
              setIsWaiting(false);
              const csv = checkData.session.csvData;
              setReceivedCount(csv.trim().split("\n").length - 1);

              setTimeout(() => {
                onParsedCsv(csv, `Mobile_Scan_${sid}.csv`);
                onClose();
              }, 800);
            } else if (checkData.session?.status === "error") {
              setLocalError(checkData.session.error || "Failed to process photo from mobile.");
            }
          } catch {
            // Polling retry
          }
        }, 1500);
      }
    } catch {
      setLocalError("Could not initialize mobile bridge session.");
      setIsWaiting(false);
    }
  }, [onClose, onParsedCsv, stopPolling]);

  useEffect(() => {
    if (isOpen) {
      initSession();
    } else {
      stopPolling();
      setSessionId(null);
      setQrDataUrl(null);
    }
    return () => stopPolling();
  }, [isOpen, initSession, stopPolling]);

  // Handle direct file upload from desktop or phone camera input
  const handleLocalImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingLocal(true);
    setLocalError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;

      try {
        const res = await fetch("/api/vision/parse-bill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        const data = await res.json();

        if (res.ok && data.csvData) {
          onParsedCsv(data.csvData, file.name.replace(/\.[^/.]+$/, "") + "_scan.csv");
          onClose();
        } else {
          setLocalError(data.error || "Failed to extract transactions from document.");
        }
      } catch {
        setLocalError("Network error while processing bill image.");
      } finally {
        setIsProcessingLocal(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#FBF6E9] border-2 border-[#1A1A1A] rounded-xl shadow-[6px_6px_0px_#1A1A1A] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#A8231B] text-[#FFFDF7] border-b-2 border-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <span className="text-base">📷</span>
            <h3 className="font-serif font-black text-base tracking-wide">
              Scan Paper Khata / Bill
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded border border-[#FFFDF7]/40 font-mono font-bold text-xs hover:bg-[#FFFDF7]/20"
          >
            ✕
          </button>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-2 p-2 bg-[#F3EAD3] border-b border-[#1A1A1A] text-xs font-mono font-bold">
          <button
            onClick={() => setActiveTab("qr")}
            className={`py-2 rounded transition-all ${
              activeTab === "qr"
                ? "bg-[#E8A317] text-[#1A1A1A] border border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A]"
                : "text-[#6B645A] hover:text-[#1A1A1A]"
            }`}
          >
            📱 Scan via Phone Camera
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`py-2 rounded transition-all ${
              activeTab === "upload"
                ? "bg-[#E8A317] text-[#1A1A1A] border border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A]"
                : "text-[#6B645A] hover:text-[#1A1A1A]"
            }`}
          >
            📁 Upload Photo Directly
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === "qr" ? (
            <div className="space-y-4 text-center">
              {receivedCount !== null ? (
                <div className="py-8 space-y-2">
                  <div className="text-4xl text-[#2E7D4F]">✓</div>
                  <h4 className="font-serif font-bold text-lg text-[#2E7D4F]">
                    Received {receivedCount} Transactions!
                  </h4>
                  <p className="font-mono text-xs text-[#6B645A]">
                    Transferring to Audit Uncle analysis pipeline...
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#1A1A1A]">
                      Point your phone camera at this QR Code
                    </h4>
                    <p className="text-xs text-[#6B645A] font-sans mt-0.5">
                      No app install needed. Snaps handwritten shop registers or GST bills directly.
                    </p>
                  </div>

                  {/* Wi-Fi Connection Tip */}
                  <div className="flex justify-center">
                    <span className="text-[11px] font-mono text-[#1A1A1A] bg-[#FFFDF7] px-2.5 py-1 rounded border border-[#E2D6B8] inline-flex items-center gap-1.5 shadow-[1px_1px_0px_#1A1A1A]">
                      <span>📶</span>
                      <span>Ensure Phone & Laptop are on same Wi-Fi / Hotspot</span>
                    </span>
                  </div>

                  {/* QR Box */}
                  <div className="inline-block p-3 bg-white border-2 border-[#1A1A1A] rounded-xl shadow-[3px_3px_0px_#1A1A1A]">
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt="Scan QR code with phone"
                        className="w-48 h-48 sm:w-56 sm:h-56 mx-auto"
                      />
                    ) : (
                      <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center font-mono text-xs text-[#6B645A] animate-pulse">
                        Generating QR bridge...
                      </div>
                    )}
                  </div>

                  {/* Live Status indicator */}
                  <div className="flex items-center justify-center gap-2 font-mono text-xs text-[#6B645A]">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8A317] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E8A317]" />
                    </span>
                    <span>
                      {isWaiting ? "Waiting for mobile phone snap..." : "Connecting bridge..."}
                    </span>
                  </div>

                  {/* Manual Session Sync Box */}
                  <div className="p-2.5 bg-[#FFFDF7] border border-[#1A1A1A] rounded-lg shadow-[1px_1px_0px_#1A1A1A] text-left space-y-1.5 max-w-sm mx-auto">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#6B645A]">Linked Session:</span>
                      <span className="text-[10px] text-[#23408E] font-bold">Already submitted on phone?</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={manualSyncCode}
                        onChange={(e) => setManualSyncCode(e.target.value.toUpperCase())}
                        placeholder="AU-XXXXXX"
                        className="grow px-2 py-1 bg-white border border-[#1A1A1A] rounded text-xs font-mono font-bold uppercase text-center tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => handleManualSync()}
                        className="px-3 py-1 bg-[#E8A317] hover:bg-[#F59E0B] text-[#1A1A1A] border border-[#1A1A1A] rounded text-xs font-mono font-bold shadow-[1px_1px_0px_#1A1A1A] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                      >
                        ⚡ Sync to PC
                      </button>
                    </div>
                  </div>

                  {/* Mobile Reachable Link Display & Custom URL editing */}
                  <div className="pt-2 border-t border-[#E2D6B8] space-y-1.5">
                    {isEditingUrl ? (
                      <div className="flex items-center gap-1.5 max-w-sm mx-auto">
                        <input
                          type="text"
                          value={customUrlInput}
                          onChange={(e) => setCustomUrlInput(e.target.value)}
                          placeholder="http://192.168.1.X:3000/scan..."
                          className="grow px-2 py-1 bg-white border border-[#1A1A1A] rounded text-[11px] font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setScanUrl(customUrlInput);
                            generateQrForUrl(customUrlInput);
                            setIsEditingUrl(false);
                          }}
                          className="px-2.5 py-1 bg-[#E8A317] border border-[#1A1A1A] rounded text-[11px] font-mono font-bold"
                        >
                          Update QR
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#6B645A]">
                        <span className="truncate max-w-[240px] text-[#23408E] underline">
                          {scanUrl}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditingUrl(true)}
                          className="text-[10px] px-1.5 py-0.5 border border-[#1A1A1A] rounded bg-[#FFFDF7] text-[#1A1A1A] hover:bg-[#F3EAD3]"
                        >
                          Change IP
                        </button>
                      </div>
                    )}
                    <a
                      href={scanUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-[10px] font-mono text-[#6B645A] hover:underline"
                    >
                      (Testing locally? Click here to open mobile scanner directly)
                    </a>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Upload Photo Directly */
            <div className="space-y-4 text-center py-4">
              <input
                ref={localFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLocalImage}
                className="hidden"
                id="modalLocalUpload"
              />

              <div className="w-14 h-14 mx-auto rounded-full bg-[#FFFDF7] border-2 border-[#1A1A1A] flex items-center justify-center text-2xl shadow-[2px_2px_0px_#1A1A1A]">
                🧾
              </div>

              <div>
                <h4 className="font-serif font-bold text-base text-[#1A1A1A]">
                  Select Bill or Register Image
                </h4>
                <p className="text-xs text-[#6B645A] font-sans mt-0.5 max-w-xs mx-auto">
                  Supports JPEG, PNG, and photo captures of invoices and handwritten shop notebooks.
                </p>
              </div>

              <button
                type="button"
                disabled={isProcessingLocal}
                onClick={() => localFileInputRef.current?.click()}
                className="w-full py-3 px-4 bg-[#E8A317] hover:bg-[#E8A317]/90 text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-xl font-mono font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
              >
                {isProcessingLocal ? (
                  <>
                    <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-[#1A1A1A] border-t-transparent rounded-full" />
                    <span>Analyzing Image via Vision AI...</span>
                  </>
                ) : (
                  <>
                    <span>📁</span>
                    <span>Choose File from Computer</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Local Error Message */}
          {localError && (
            <div className="mt-3 p-2.5 bg-[#FEF2F2] border border-[#A8231B] rounded text-xs font-mono text-[#A8231B] text-center">
              ⚠ {localError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-[#FFFDF7] border-t border-[#E2D6B8] flex items-center justify-between text-[11px] font-mono text-[#6B645A]">
          <span>Audit Uncle Vision AI</span>
          <button
            onClick={onClose}
            className="font-bold text-[#1A1A1A] hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
