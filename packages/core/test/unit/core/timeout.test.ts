import { describe, it, expect, beforeEach } from "vitest";
import { NodeLLMCore } from "../../../src/llm.js";
import { config } from "../../../src/config.js";

describe("Request Timeout Configuration", () => {
  beforeEach(() => {
    // Reset to default
    config.requestTimeout = 30000;
  });

  it("should have default timeout of 30 seconds", () => {
    const llm = new NodeLLMCore();
    expect(llm.config.requestTimeout).toBe(30000);
  });

  it("should accept requestTimeout in global config", () => {
    const llm = new NodeLLMCore();
    llm.configure({
      requestTimeout: 60000,
    });

    expect(llm.config.requestTimeout).toBe(60000);
  });

  it("should allow per-chat timeout configuration", () => {
    const llm = new NodeLLMCore();
    llm.configure({ 
      provider: "openai",
      openaiApiKey: "test-key"
    });
    const chat = llm.chat("gpt-4o", { requestTimeout: 45000 });
    
    // The timeout should be stored in chat options
    expect((chat as any).options.requestTimeout).toBe(45000);
  });
});
