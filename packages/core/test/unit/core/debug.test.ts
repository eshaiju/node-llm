import { describe, it, expect } from "vitest";
import { createLLM } from "../../../src/llm.js";

describe("Debug Configuration", () => {
  it("should enable debug mode via createLLM", () => {
    const llm = createLLM({ debug: true });
    expect(llm.config.debug).toBe(true);
  });

  it("should support debug in scoped provider config", () => {
    const base = createLLM({
      debug: false,
      anthropicApiKey: "test-key"
    });

    const scoped = base.withProvider("anthropic", { debug: true });

    expect(scoped.config.debug).toBe(true);
    expect(base.config.debug).toBe(false);
  });

  it("should respect debug flag in the configuration object", () => {
    const llm = createLLM({ debug: true });
    expect(llm.config.debug).toBe(true);
  });
});
