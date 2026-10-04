import React from "react";

export function Hero() {
  return (
    <section className="pt-4 pb-4 sm:pt-6 sm:pb-6 text-center max-w-3xl mx-auto px-4">
      {/* Devanagari Eyebrow */}
      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#A8231B]/40 bg-[#FFFDF7] text-[#A8231B] text-xs font-mono font-bold mb-2 shadow-[1px_1px_0px_#A8231B]">
        <span>॥</span>
        <span className="font-devanagari">तुमचा हिशोब, तुमच्याच फोनवर</span>
        <span>॥</span>
      </div>

      {/* Main Title */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#1A1A1A]">
        Audit Uncle
      </h2>

      {/* Supporting Copy */}
      <p className="mt-2 text-sm sm:text-base text-[#6B645A] font-sans leading-relaxed">
        Drop your sales CSV. Get your cash flow, tax estimate and runway — without your data ever leaving this device.
      </p>

      {/* Badges line */}
      <p className="mt-1 text-xs font-mono font-bold text-[#1A1A1A]/80 tracking-wide">
        Local AI • No signup • No cloud
      </p>
    </section>
  );
}
