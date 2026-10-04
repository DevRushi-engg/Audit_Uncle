import { AI } from "@/config/app.config";
import { GenerateOptions, NarratorProvider } from "./provider";

export class WebLlmProvider implements NarratorProvider {
  id = "webllm" as const;
  label = `On-Device (${AI.modelLabel})`;

  private engine: unknown = null;
  private isLoaded = false;
  private isLoading = false;

  isReady(): boolean {
    return this.isLoaded && this.engine !== null;
  }

  async load(onProgress: (pct: number, text: string) => void): Promise<void> {
    if (this.isLoaded) return;
    if (this.isLoading) return;

    if (typeof window === "undefined") {
      throw new Error("WebLLM can only be loaded in browser environment.");
    }

    // Check WebGPU availability
    const nav = navigator as unknown as { gpu?: unknown };
    if (!nav.gpu) {
      throw new Error("WebGPU is not supported in this browser. Please use Chrome 113+ or Edge with hardware acceleration.");
    }

    this.isLoading = true;
    try {
      const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

      this.engine = await CreateMLCEngine(AI.webllmModelId, {
        initProgressCallback: (report) => {
          const pct = Math.round(report.progress * 100);
          onProgress(pct, report.text || `Loading model: ${pct}%`);
        },
      });

      this.isLoaded = true;
      this.isLoading = false;
      onProgress(100, "Model cached and ready on-device.");
    } catch (err: unknown) {
      this.isLoading = false;
      this.isLoaded = false;
      this.engine = null;
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`WebLLM load failed: ${message}`);
    }
  }

  async generate(opts: GenerateOptions): Promise<string> {
    if (!this.isReady() || !this.engine) {
      throw new Error("WebLLM model is not loaded.");
    }

    try {
      const engine = this.engine as {
        chat: {
          completions: {
            create: (args: unknown) => Promise<{ choices: { message: { content: string } }[] }>;
          };
        };
      };

      const messages = [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ];

      const response = await engine.chat.completions.create({
        messages,
        temperature: 0.3,
        max_tokens: opts.maxTokens,
      });

      return response.choices[0]?.message?.content || "";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`WebLLM generation error: ${message}`);
    }
  }
}
