import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { logger } from "./logger";

// ─────────────────────────────────────────────────────────────────────────────
//  AI Provider Abstraction — Unified interface for Gemini, Groq, OpenRouter
// ─────────────────────────────────────────────────────────────────────────────

export interface AIResponse {
  text: string;
  provider: string;
  model: string;
}

export interface AIStreamChunk {
  content: string;
  done?: boolean;
  error?: string;
}

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  imageData?: { base64: string; mimeType: string };
}

export interface AIProvider {
  name: string;
  generateContent(messages: AIMessage[], config?: { temperature?: number; maxTokens?: number }): Promise<AIResponse>;
  generateContentStream(messages: AIMessage[], config?: { temperature?: number; maxTokens?: number }): AsyncGenerator<AIStreamChunk, void, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Gemini Provider
// ─────────────────────────────────────────────────────────────────────────────

export class GeminiProvider implements AIProvider {
  name = "gemini";
  model: string;
  private ai: GoogleGenAI;

  constructor(apiKey: string, model = "gemini-2.5-flash") {
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async generateContent(messages: AIMessage[], config?: { temperature?: number; maxTokens?: number }): Promise<AIResponse> {
    const contents = messages.map((m) => {
      const parts: any[] = [];
      if (m.imageData) {
        parts.push({ inlineData: { mimeType: m.imageData.mimeType, data: m.imageData.base64 } });
      }
      parts.push({ text: m.content });
      return { role: m.role === "assistant" ? "model" : "user", parts };
    });

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents,
      config: {
        temperature: config?.temperature ?? 0.7,
        maxOutputTokens: config?.maxTokens ?? 4096,
      },
    });

    const text = response.text ?? "";
    return { text, provider: this.name, model: this.model };
  }

  async *generateContentStream(messages: AIMessage[], config?: { temperature?: number; maxTokens?: number }): AsyncGenerator<AIStreamChunk, void, unknown> {
    const contents = messages.map((m) => {
      const parts: any[] = [];
      if (m.imageData) {
        parts.push({ inlineData: { mimeType: m.imageData.mimeType, data: m.imageData.base64 } });
      }
      parts.push({ text: m.content });
      return { role: m.role === "assistant" ? "model" : "user", parts };
    });

    const stream = await this.ai.models.generateContentStream({
      model: this.model,
      contents,
      config: {
        temperature: config?.temperature ?? 0.7,
        maxOutputTokens: config?.maxTokens ?? 4096,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        yield { content: text };
      }
    }
    yield { content: "", done: true };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Groq Provider (OpenAI-compatible)
// ─────────────────────────────────────────────────────────────────────────────

export class GroqProvider implements AIProvider {
  name = "groq";
  model: string;
  private client: OpenAI;

  constructor(apiKey: string, model = "llama-3.3-70b-versatile") {
    this.client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });
    this.model = model;
  }

  async generateContent(messages: AIMessage[], config?: { temperature?: number; maxTokens?: number }): Promise<AIResponse> {
    // Groq accepts only string content, not array format. For image messages, skip the image.
    const openaiMessages = messages.map((m) => ({
      role: m.role,
      content: m.imageData ? `[Image attached] ${m.content}` : m.content,
    }));

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: openaiMessages as any,
      temperature: config?.temperature ?? 0.7,
      max_tokens: config?.maxTokens ?? 4096,
    });

    const text = response.choices[0]?.message?.content ?? "";
    return { text, provider: this.name, model: this.model };
  }

  async *generateContentStream(messages: AIMessage[], config?: { temperature?: number; maxTokens?: number }): AsyncGenerator<AIStreamChunk, void, unknown> {
    const openaiMessages = messages.map((m) => ({
      role: m.role,
      content: m.imageData ? `[Image attached] ${m.content}` : m.content,
    }));

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: openaiMessages as any,
      temperature: config?.temperature ?? 0.7,
      max_tokens: config?.maxTokens ?? 4096,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        yield { content: text };
      }
    }
    yield { content: "", done: true };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  OpenRouter Provider (OpenAI-compatible)
// ─────────────────────────────────────────────────────────────────────────────

export class OpenRouterProvider implements AIProvider {
  name = "openrouter";
  model: string;
  private client: OpenAI;

  constructor(apiKey: string, model = "meta-llama/llama-3.3-70b-instruct:free") {
    this.client = new OpenAI({ apiKey, baseURL: "https://openrouter.ai/api/v1" });
    this.model = model;
  }

  async generateContent(messages: AIMessage[], config?: { temperature?: number; maxTokens?: number }): Promise<AIResponse> {
    const openaiMessages = messages.map((m) => {
      const content: any[] = [{ type: "text", text: m.content }];
      if (m.imageData) {
        content.push({ type: "image_url", image_url: { url: `data:${m.imageData.mimeType};base64,${m.imageData.base64}` } });
      }
      return { role: m.role, content };
    });

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: openaiMessages as any,
      temperature: config?.temperature ?? 0.7,
      max_tokens: config?.maxTokens ?? 4096,
    });

    const text = response.choices[0]?.message?.content ?? "";
    return { text, provider: this.name, model: this.model };
  }

  async *generateContentStream(messages: AIMessage[], config?: { temperature?: number; maxTokens?: number }): AsyncGenerator<AIStreamChunk, void, unknown> {
    const openaiMessages = messages.map((m) => {
      const content: any[] = [{ type: "text", text: m.content }];
      if (m.imageData) {
        content.push({ type: "image_url", image_url: { url: `data:${m.imageData.mimeType};base64,${m.imageData.base64}` } });
      }
      return { role: m.role, content };
    });

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: openaiMessages as any,
      temperature: config?.temperature ?? 0.7,
      max_tokens: config?.maxTokens ?? 4096,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        yield { content: text };
      }
    }
    yield { content: "", done: true };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Fallback Orchestrator
// ─────────────────────────────────────────────────────────────────────────────

export class AIFallbackOrchestrator {
  providers: AIProvider[];

  constructor(providers: AIProvider[]) {
    this.providers = providers;
  }

  async generateContent(messages: AIMessage[], config?: { temperature?: number; maxTokens?: number }): Promise<AIResponse> {
    const errors: { provider: string; error: string }[] = [];

    for (const provider of this.providers) {
      try {
        logger.info({ provider: provider.name }, "Trying AI provider");
        const result = await provider.generateContent(messages, config);
        if (result.text && result.text.trim().length > 0) {
          logger.info({ provider: provider.name, model: result.model }, "AI provider succeeded");
          return result;
        }
        errors.push({ provider: provider.name, error: "Empty response" });
      } catch (err: any) {
        const errorMsg = err?.message ?? String(err);
        logger.warn({ provider: provider.name, error: errorMsg }, "AI provider failed");
        errors.push({ provider: provider.name, error: errorMsg });
      }
    }

    const allErrors = errors.map((e) => `${e.provider}: ${e.error}`).join("; ");
    throw new Error(`All AI providers failed: ${allErrors}`);
  }

  async *generateContentStream(messages: AIMessage[], config?: { temperature?: number; maxTokens?: number }): AsyncGenerator<AIStreamChunk, void, unknown> {
    const errors: { provider: string; error: string }[] = [];

    for (const provider of this.providers) {
      try {
        logger.info({ provider: provider.name }, "Trying AI provider (stream)");
        let hasContent = false;

        for await (const chunk of provider.generateContentStream(messages, config)) {
          hasContent = true;
          yield chunk;
        }

        if (hasContent) {
          logger.info({ provider: provider.name }, "AI provider succeeded (stream)");
          return;
        }

        errors.push({ provider: provider.name, error: "Empty stream" });
      } catch (err: any) {
        const errorMsg = err?.message ?? String(err);
        logger.warn({ provider: provider.name, error: errorMsg }, "AI provider failed (stream)");
        errors.push({ provider: provider.name, error: errorMsg });

        // Continue to next provider
        continue;
      }
    }

    const allErrors = errors.map((e) => `${e.provider}: ${e.error}`).join("; ");
    yield { content: "", error: `All AI providers failed: ${allErrors}`, done: true };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Factory — Build the fallback chain from env vars
// ─────────────────────────────────────────────────────────────────────────────

export function createAIOrchestrator(): AIFallbackOrchestrator {
  const providers: AIProvider[] = [];

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    providers.push(new GeminiProvider(geminiKey, "gemini-2.5-flash"));
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    providers.push(new GroqProvider(groqKey, "llama-3.3-70b-versatile"));
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    providers.push(new OpenRouterProvider(openRouterKey, "meta-llama/llama-3.3-70b-instruct:free"));
  }

  if (providers.length === 0) {
    throw new Error("No AI providers configured. Set GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY.");
  }

  logger.info({ providers: providers.map((p) => p.name) }, "AI fallback chain initialized");
  return new AIFallbackOrchestrator(providers);
}

/**
 * Vision-only orchestrator: Gemini only for image analysis.
 * Groq/OpenRouter do NOT support vision and will hallucinate on images.
 */
export function createVisionOrchestrator(): AIFallbackOrchestrator {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!geminiKey) {
    throw new Error("Gemini API key required for image analysis. Set GEMINI_API_KEY.");
  }
  const gemini = new GeminiProvider(geminiKey, "gemini-2.5-flash");
  logger.info({ provider: "gemini" }, "Vision-only orchestrator initialized (Gemini only)");
  return new AIFallbackOrchestrator([gemini]);
}
