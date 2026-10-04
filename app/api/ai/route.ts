import { NextRequest, NextResponse } from "next/server";
import { AI } from "@/config/app.config";

const CANDIDATE_MODELS = [
  AI.openrouterModel || "google/gemma-4-26b-a4b-it:free",
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-2-9b-it:free",
];

export async function POST(req: NextRequest) {
  try {
    const { system, user, maxTokens = 200, json = false } = await req.json();

    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
      "";

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured" },
        { status: 500 }
      );
    }

    const messages = [
      { role: "system", content: system },
      { role: "user", content: user },
    ];

    let lastError: string | null = null;

    // Try candidate models in order if upstream is rate-limited (429)
    for (const model of CANDIDATE_MODELS) {
      try {
        const body: Record<string, unknown> = {
          model,
          messages,
          temperature: 0.25,
          max_tokens: maxTokens,
        };

        if (json) {
          body.response_format = { type: "json_object" };
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://audituncle.app",
            "X-Title": "Audit Uncle AI CFO",
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || "";
          if (content) {
            return NextResponse.json({ content, modelUsed: model });
          }
        }

        const errText = await response.text();
        console.warn(`Model ${model} returned ${response.status}: ${errText.slice(0, 100)}`);
        lastError = errText;
      } catch (err: any) {
        console.warn(`Model ${model} fetch failed:`, err.message);
        lastError = err.message;
      }
    }

    return NextResponse.json(
      { error: "All AI candidate models were busy", details: lastError },
      { status: 503 }
    );
  } catch (err: any) {
    console.error("AI route fatal error:", err);
    return NextResponse.json(
      { error: err.message || "Internal AI routing error" },
      { status: 500 }
    );
  }
}
