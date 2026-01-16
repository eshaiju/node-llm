import { describe, it, expect } from "vitest";
import { createLLM, NodeLLM } from "../../../src/llm.js";
import { providerRegistry } from "../../../src/providers/registry.js";
import { FakeProvider } from "../../fake-provider.js";

describe("LLM Configuration", () => {
  it("resolves provider by name using registry", async () => {
    providerRegistry.register("fake", () => {
      return new FakeProvider(["fake reply"]);
    });

    const llm = createLLM({ provider: "fake" });

    const chat = llm.chat("test-model");
    const reply = await chat.ask("Hello");

    expect(String(reply)).toBe("fake reply");
  });

  it("throws error when provider is not configured", () => {
    const freshLLM = createLLM();

    expect(() => {
      freshLLM.chat("test-model");
    }).toThrow("LLM provider not configured");
  });
});

describe("LLM Default Model Resolution", () => {
  it("uses provider default when no model is specified", () => {
    const provider = new FakeProvider();
    const llm = createLLM({ provider });

    const chat = llm.chat();
    expect(chat.modelId).toBe("fake-default-model");
  });

  it("prioritizes global configuration default over provider default", () => {
    const provider = new FakeProvider();
    const llm = createLLM({
      provider,
      defaultChatModel: "custom-global-default"
    });

    const chat = llm.chat();
    expect(chat.modelId).toBe("custom-global-default");
  });

  it("prioritizes explicit argument over all defaults", () => {
    const provider = new FakeProvider();
    const llm = createLLM({
      provider,
      defaultChatModel: "custom-global-default"
    });

    const chat = llm.chat("explicit-model");
    expect(chat.modelId).toBe("explicit-model");
  });
});

class MockCapabilitiesProvider extends FakeProvider {
  // Explicitly deny support for everything
  capabilities = {
    supportsVision: (_m: string) => false,
    supportsTools: (_m: string) => false,
    supportsStructuredOutput: (_m: string) => false,
    supportsEmbeddings: (_m: string) => false,
    supportsImageGeneration: (_m: string) => false,
    supportsTranscription: (_m: string) => false,
    supportsModeration: (_m: string) => false,
    supportsReasoning: (_m: string) => false,
    getContextWindow: (_m: string) => 0
  } as any;

  async paint(_req: any): Promise<any> {
    return { url: "ok" };
  }
  async transcribe(_req: any): Promise<any> {
    return { text: "ok" };
  }
  async embed(_req: any): Promise<any> {
    return { vectors: [[0.1]], model: "test", dimensions: 1 };
  }
  async moderate(_req: any): Promise<any> {
    return { flagged: false };
  }
}

describe("NodeLLM assumeModelExists", () => {
  it("bypasses capability checks when assumeModelExists is true", async () => {
    const provider = new MockCapabilitiesProvider();
    const llm = createLLM({ provider });

    // 1. Image Generation (paint)
    // Should fail without flag
    await expect(llm.paint("test", { model: "unsupported-model" })).rejects.toThrow(
      "does not support image generation"
    );

    // Should succeed with flag
    await expect(
      llm.paint("test", { model: "unsupported-model", assumeModelExists: true })
    ).resolves.toBeDefined();

    // 2. Transcription
    // Should fail without flag
    await expect(llm.transcribe("audio.mp3", { model: "unsupported-model" })).rejects.toThrow(
      "does not support transcription"
    );

    // Should succeed with flag
    await expect(
      llm.transcribe("audio.mp3", { model: "unsupported-model", assumeModelExists: true })
    ).resolves.toBeDefined();

    // 3. Embeddings
    await expect(llm.embed("text", { model: "unsupported-model" })).rejects.toThrow(
      "does not support embeddings"
    );

    await expect(
      llm.embed("text", { model: "unsupported-model", assumeModelExists: true })
    ).resolves.toBeDefined();

    // 4. Moderation
    await expect(llm.moderate("text", { model: "unsupported-model" })).rejects.toThrow(
      "does not support moderation"
    );

    await expect(
      llm.moderate("text", { model: "unsupported-model", assumeModelExists: true })
    ).resolves.toBeDefined();
  });
});
