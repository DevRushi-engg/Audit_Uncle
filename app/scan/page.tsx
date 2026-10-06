"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ScanCameraContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id") || "";

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!sessionId) {
      setErrorMessage("No scan session ID found. Please scan the QR code from your Audit Uncle desktop screen.");
    }
  }, [sessionId]);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessCount(null);
    setStatusMessage("Compressing photo for vision analysis...");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize image to max 1600px width/height for fast upload & crisp OCR
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1600;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          setImagePreview(compressed);
          setStatusMessage("Photo ready to send!");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUploadToSession = async () => {
    if (!imagePreview || !sessionId) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage("Reading handwritten khata / printed bill via Vision AI...");

    try {
      const res = await fetch("/api/scan/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          id: sessionId,
          imageBase64: imagePreview,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessCount(data.rowCount || 1);
        setStatusMessage("Transferred directly to your desktop screen!");
      } else {
        setErrorMessage(data.error || "Could not read transactions from photo. Please try a clearer picture.");
      }
    } catch {
      setErrorMessage("Network error connecting to Audit Uncle session. Please check your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FBF6E9] text-[#1A1A1A] p-4 flex flex-col items-center justify-between font-sans">
      {/* Header */}
      <div className="w-full max-w-md pt-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#1A1A1A] bg-[#FFFDF7] text-xs font-mono font-bold shadow-[2px_2px_0px_#1A1A1A] mb-2">
          <span>📷</span>
          <span>MOBILE BILL & KHATA SCANNER</span>
        </div>
        <h1 className="text-2xl font-serif font-black tracking-tight text-[#1A1A1A]">
          Audit Uncle Bridge
        </h1>
        {sessionId && (
          <p className="text-xs font-mono text-[#6B645A] mt-1">
            Linked to Session: <span className="font-bold text-[#A8231B]">{sessionId}</span>
          </p>
        )}
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md my-4 p-5 bg-white border-2 border-[#1A1A1A] rounded-xl shadow-[4px_4px_0px_#1A1A1A] space-y-4">
        {/* Hidden Camera Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageCapture}
          className="hidden"
          id="cameraInput"
        />

        {/* Success Banner */}
        {successCount !== null && (
          <div className="p-4 bg-[#ECFDF5] border-2 border-[#2E7D4F] rounded-lg text-center space-y-1">
            <div className="text-2xl">✓</div>
            <div className="font-mono font-bold text-sm text-[#2E7D4F]">
              Successfully Transferred!
            </div>
            <p className="text-xs text-[#1A1A1A] font-sans">
              Extracted <strong>{successCount} entries</strong>. Look at your computer screen — Audit Uncle is analyzing your numbers now!
            </p>
            <button
              onClick={() => {
                setImagePreview(null);
                setSuccessCount(null);
                fileInputRef.current?.click();
              }}
              className="mt-3 px-3 py-1.5 bg-white border border-[#1A1A1A] rounded font-mono text-xs font-bold shadow-[1px_1px_0px_#1A1A1A]"
            >
              Scan Another Bill +
            </button>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-[#FEF2F2] border border-[#A8231B] rounded-lg text-xs font-mono text-[#A8231B] leading-tight">
            ⚠ {errorMessage}
          </div>
        )}

        {/* Image Preview Box */}
        {imagePreview && !successCount ? (
          <div className="space-y-3">
            <div className="relative border-2 border-[#1A1A1A] rounded-lg overflow-hidden bg-black/5 aspect-[4/3] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Captured receipt"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 bg-[#FFFDF7] border-1.5 border-[#1A1A1A] rounded-lg font-mono font-bold text-xs shadow-[2px_2px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5"
              >
                🔄 Retake
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleUploadToSession}
                className="py-2.5 px-3 bg-[#E8A317] hover:bg-[#E8A317]/90 text-[#1A1A1A] border-1.5 border-[#1A1A1A] rounded-lg font-mono font-bold text-xs shadow-[2px_2px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-[#1A1A1A] border-t-transparent rounded-full" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Send to PC</span>
                  </>
                )}
              </button>
            </div>
            {statusMessage && (
              <p className="text-center font-mono text-[11px] text-[#6B645A] animate-pulse">
                {statusMessage}
              </p>
            )}
          </div>
        ) : !successCount ? (
          /* Empty Camera Trigger Box */
          <div className="space-y-4 text-center py-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#F3EAD3] border-2 border-[#1A1A1A] flex items-center justify-center text-2xl shadow-[2px_2px_0px_#1A1A1A]">
              📖
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#1A1A1A]">
                Snap Khata or Bill
              </h2>
              <p className="text-xs text-[#6B645A] mt-1 max-w-xs mx-auto leading-relaxed">
                Take a clear, top-down photo of your handwritten shop diary, daily register, or printed GST invoice.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 px-4 bg-[#A8231B] text-[#FFFDF7] border-2 border-[#1A1A1A] rounded-xl font-mono font-bold text-sm tracking-wide shadow-[3px_3px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>📷</span>
              <span>OPEN CAMERA & SNAP</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Footer Instructions */}
      <footer className="w-full max-w-md pb-6 text-center text-[11px] font-mono text-[#6B645A] leading-tight space-y-1">
        <p>Tip: Ensure good room lighting without harsh shadows on numbers.</p>
        <p>Private & secure • Powered by Audit Uncle</p>
      </footer>
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF6E9] flex items-center justify-center font-mono text-xs">
          Loading Scanner...
        </div>
      }
    >
      <ScanCameraContent />
    </Suspense>
  );
}
