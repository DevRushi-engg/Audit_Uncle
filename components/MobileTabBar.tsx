import React from "react";

export type MobileTab = "khata" | "hisab" | "agents" | "ask";

interface MobileTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  agentsCount?: number;
}

export function MobileTabBar({ activeTab, onTabChange, agentsCount = 5 }: MobileTabBarProps) {
  const tabs: { id: MobileTab; label: string; icon: string; count?: number }[] = [
    { id: "khata", label: "Khata", icon: "📁" },
    { id: "hisab", label: "Hisab", icon: "📊" },
    { id: "agents", label: "Agents", icon: "🤖", count: agentsCount },
    { id: "ask", label: "Ask", icon: "💬" },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FBF6E9] border-t-2 border-[#1A1A1A] px-2 py-1.5 shadow-[0_-3px_0px_#1A1A1A]"
    >
      <div className="grid grid-cols-4 gap-1.5">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg border text-xs font-mono font-bold transition-transform active:scale-95 ${
                isActive
                  ? "bg-[#E8A317] text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]"
                  : "bg-white text-[#6B645A] border border-[#1A1A1A] hover:bg-[#FFFDF7]"
              }`}
            >
              <div className="flex items-center gap-1">
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {t.count !== undefined && t.id === "agents" && (
                  <span className="text-[9px] px-1 py-0.2 bg-[#2E7D4F] text-white rounded-full">
                    {t.count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
