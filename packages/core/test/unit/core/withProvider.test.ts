import { describe, it, expect, beforeEach } from "vitest";
import { NodeLLM } from "../../../src/llm.js";
import { config } from "../../../src/config.js";

describe("NodeLLM.withProvider()", () => {
  beforeEach(() => {
    // Reset config to known state
    config.openaiApiKey = "test-openai-key";
    config.anthropicApiKey = "test-anthropic-key";
  });

  it("should create a scoped instance with the specified provider", () => {
    const scoped = NodeLLM.withProvider("openai");
    
    // Scoped instance should be a different object
    expect(scoped).not.toBe(NodeLLM);
    
    // Should have access to the same methods
    expect(typeof scoped.chat).toBe("function");
    expect(typeof scoped.configure).toBe("function");
  });

  it("should inherit global config by default", () => {
    config.openaiApiKey = "global-openai-key";
    
    const scoped = NodeLLM.withProvider("openai");
    
    // Should have inherited the global config
    expect(scoped.config.openaiApiKey).toBe("global-openai-key");
  });

  it("should accept scoped configuration overrides", () => {
    config.anthropicApiKey = "global-anthropic-key";
    
    const scoped = NodeLLM.withProvider("anthropic", {
      anthropicApiKey: "scoped-anthropic-key"
    });
    
    // Scoped instance should use the override
    expect(scoped.config.anthropicApiKey).toBe("scoped-anthropic-key");
    
    // Global config should remain unchanged
    expect(config.anthropicApiKey).toBe("global-anthropic-key");
  });

  it("should support multiple scoped instances with different configs", () => {
    const scoped1 = NodeLLM.withProvider("anthropic", {
      anthropicApiKey: "key-1"
    });
    
    const scoped2 = NodeLLM.withProvider("anthropic", {
      anthropicApiKey: "key-2"
    });
    
    // Each scope should have its own config
    expect(scoped1.config.anthropicApiKey).toBe("key-1");
    expect(scoped2.config.anthropicApiKey).toBe("key-2");
    
    // They should be different instances
    expect(scoped1).not.toBe(scoped2);
  });

  it("should allow partial config overrides", () => {
    config.openaiApiKey = "global-openai";
    config.anthropicApiKey = "global-anthropic";
    
    const scoped = NodeLLM.withProvider("openai", {
      openaiApiKey: "scoped-openai"
      // anthropicApiKey not overridden
    });
    
    expect(scoped.config.openaiApiKey).toBe("scoped-openai");
    expect(scoped.config.anthropicApiKey).toBe("global-anthropic");
  });

  it("should support custom base URLs in scoped config", () => {
    const scoped = NodeLLM.withProvider("anthropic", {
      anthropicApiBase: "https://custom-proxy.example.com"
    });
    
    expect(scoped.config.anthropicApiBase).toBe("https://custom-proxy.example.com");
  });
});
