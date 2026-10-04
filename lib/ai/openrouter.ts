import { AI } from "@/config/app.config";
import { GenerateOptions, NarratorProvider } from "./provider";

export class OpenRouterProvider implements NarratorProvider {
  id = "openrouter" as const;
  label = "Audit Uncle AI";

  private customKey: string | null = null;

  setApiKey(key: string): void {
    this.customKey = key.trim();
  }

  getApiKey(): string {
    if (this.customKey) return this.customKey;
    if (typeof window !== "undefined") {
      try {
        const stored =
          localStorage.getItem("audit_uncle_openrouter_key") ||
          localStorage.getItem("munim_openrouter_key");
        if (stored) return stored;
      } catch {}
    }
    return (
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      ""
    );
  }

  isReady(): boolean {
    return true;
  }

  async generate(opts: GenerateOptions): Promise<string> {
    // 1. Try local server-side API proxy first if in browser
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system: opts.system,
            user: opts.user,
            maxTokens: opts.maxTokens,
            json: opts.json,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            return data.content;
          }
        }
      } catch (e) {
        console.warn("API route proxy attempt had error, trying direct fallback:", e);
      }
    }

    // 2. Direct fallback
    const key = this.getApiKey();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "HTTP-Referer": "https://audituncle.app",
      "X-Title": "Audit Uncle AI CFO",
    };

    if (key) {
      headers["Authorization"] = `Bearer ${key}`;
    }

    const messages = [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ];

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: AI.openrouterModel || "google/gemma-4-26b-a4b-it:free",
          messages,
          temperature: 0.25,
          max_tokens: opts.maxTokens,
          ...(opts.json ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter returned status ${response.status}: ${errText.slice(0, 120)}`);
      }

      const json = await response.json();
      return json.choices?.[0]?.message?.content || "";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`AI error: ${message}`);
    }
  }
}
