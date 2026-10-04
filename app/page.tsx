"use client";

import dynamic from "next/dynamic";

const Workspace = dynamic(
  () => import("@/components/Workspace").then((mod) => mod.Workspace),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#FBF6E9] flex items-center justify-center">
        <div className="font-mono text-xs text-[#1A1A1A] animate-pulse">
          Loading Audit Uncle...
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  return <Workspace />;
}
