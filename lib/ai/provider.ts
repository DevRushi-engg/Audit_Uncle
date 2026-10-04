export interface GenerateOptions {
  system: string;
  user: string;
  maxTokens: number;
  json?: boolean;
}

export interface NarratorProvider {
  id: "template" | "webllm" | "openrouter";
  label: string;
  isReady(): boolean;
  load?(onProgress: (pct: number, text: string) => void): Promise<void>;
  generate(opts: GenerateOptions): Promise<string>;
}

import { TemplateProvider } from "./template";
import { WebLlmProvider } from "./webllm";
import { OpenRouterProvider } from "./openrouter";

const providers: Record<string, NarratorProvider> = {
  template: new TemplateProvider(),
  webllm: new WebLlmProvider(),
  openrouter: new OpenRouterProvider(),
};

let activeProviderId: "template" | "webllm" | "openrouter" = "openrouter";

export function getProvider(id: "template" | "webllm" | "openrouter"): NarratorProvider {
  return providers[id] || providers.template;
}

export function getActiveProvider(): NarratorProvider {
  return getProvider(activeProviderId);
}

export function setActiveProvider(id: "template" | "webllm" | "openrouter"): void {
  activeProviderId = id;
}
